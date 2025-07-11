import {
  getAvailableSources,
  getImages,
  GetLibraryContentRequest,
  ImageInfo,
  MediaLibrarySource,
  PermissionResponse,
  PluginError,
  requestPermissions as pluginRequestPermissions,
  getImage as pluginGetImage,
} from "@universalappfactory/tauri-plugin-medialibrary";
import { ref } from "vue";

export interface Page {
  limit: number;
  offset: number;
}

export function useMediaLibraryBrowser() {
  const errorMessage = ref<string | undefined>();
  const selectedSource = ref<string>("");
  const images = ref<ImageInfo[]>([]);
  const availableSources = ref<MediaLibrarySource[]>([]);
  const permissionState = ref<PermissionResponse | null>();
  let currentPage: Page | undefined;
  const hasNextPage = ref(false);

  const requestPermissions = async () => {
    if (selectedSource.value) {
      const result = await pluginRequestPermissions({
        source: selectedSource.value as MediaLibrarySource,
      });
      permissionState.value = result;
      return result;
    }
  };

  const getSources = async () => {
    availableSources.value.splice(0, availableSources.value.length);
    const sources = await getAvailableSources();
    if (sources) {
      for (const src of sources) {
        availableSources.value.push(src);
      }
      selectedSource.value = availableSources.value[0];
    }
  };

  const handleError = (error: any) => {
    console.error(error);
    const err = error as PluginError;
    if (err) {
      errorMessage.value = err.errorKind;
    } else {
      error.value = error as string;
    }
  };

  const clearError = () => {
    errorMessage.value = undefined;
  };

  const nextPage = async () => {
    const nextPage: Page = {
      limit: currentPage?.limit ?? 10,
      offset: (currentPage?.offset ?? 0) + 10,
    };
    await loadImages(nextPage);
  };

  const loadImages = async (page?: Page) => {
    clearError();

    if (!page) {
      images.value.splice(0, images.value.length);
      currentPage = {
        limit: 10,
        offset: 0,
      };
    } else {
      currentPage = page;
    }

    const request: GetLibraryContentRequest = {
      limit: currentPage?.limit ?? 10,
      offset: currentPage?.offset ?? 0,
      source: selectedSource.value as MediaLibrarySource,
    };

    try {
      const permissions = await requestPermissions();
      if (permissions && permissions.postNotification === "denied") {
        errorMessage.value = "Permission denied";
        return;
      }

      const result = await getImages(request);
      hasNextPage.value = false;
      if (result) {
        images.value.push(...result.items);
        hasNextPage.value = result.items.length > 0;
      }
    } catch (e) {
      handleError(e);
    }
  };

  const getImage = async (contentUri: string) => {
    try {
      return await pluginGetImage(contentUri);
    } catch (e) {
      handleError(e);
    }
  };

  return {
    errorMessage,
    selectedSource,
    requestPermissions,
    permissionState,
    availableSources,
    loadImages,
    getSources,
    images,
    nextPage,
    hasNextPage,
    getImage,
  };
}
