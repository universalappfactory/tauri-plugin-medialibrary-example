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
  deleteImage as pluginDeleteImage,
  SortDirection,
  SortColumn,
} from "@universalappfactory/tauri-plugin-medialibrary";

// for development
// import {
//   getAvailableSources,
//   getImages,
//   GetLibraryContentRequest,
//   ImageInfo,
//   MediaLibrarySource,
//   PermissionResponse,
//   PluginError,
//   requestPermissions as pluginRequestPermissions,
//   getImage as pluginGetImage,
//   deleteImage as pluginDeleteImage,
//   SortDirection,
//   SortColumn,
//   deleteImages,
// } from "../../../tauri-plugin-medialibrary/guest-js/index";

import { computed, ref, watch } from "vue";
import { deleteImages } from "../../../tauri-plugin-medialibrary/guest-js";

export interface Page {
  limit: number;
  offset: number;
}

export interface SelectableImageInfo extends ImageInfo {
  selected: boolean;
}

export function useMediaLibraryBrowser() {
  const errorMessage = ref<string | undefined>();
  const selectedSource = ref<string>("");
  const sortDirection = ref<SortDirection>(SortDirection.Descending);
  const sortColumn = ref<SortColumn>(SortColumn.DateAdded);
  const images = ref<SelectableImageInfo[]>([]);
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
      errorMessage.value += err.errorKind;
    } else {
      error.value += error as string;
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
    // alert(`->${selectedSource.value as MediaLibrarySource}`);
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
      sortDirection: sortDirection.value as SortDirection,
      sortColumn: sortColumn.value as SortColumn,
      includeFileMetadata: true,
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
        images.value.push(
          ...result.items.map((i) => ({ ...i, selected: false })),
        );
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

  const deleteImage = async (contentUri: string) => {
    try {
      console.log(`Deleting image with contentUri: ${contentUri}`);
      await pluginDeleteImage(contentUri);
      console.log(`===> DONE`);

      const index = images.value.findIndex(
        (image) => image.contentUri === contentUri,
      );
      if (index !== -1) {
        images.value.splice(index, 1);
      }
    } catch (e) {
      console.log("deleteImage Error", e);
      handleError(e);
    }
  };

  const deleteSelected = async () => {
    const selected = images.value
      .filter((image) => image.selected)
      .map((i) => i.contentUri);
    if (selected.length > 0) {
      try {
        await deleteImages(selected);
      } catch (e) {
        handleError(e);
      }
    }
    images.value = images.value.filter((image) => !image.selected);
  };

  const hasSelection = computed(() =>
    images.value.some((image) => image.selected),
  );

  watch(selectedSource, () => {
    loadImages();
  });

  watch(sortDirection, () => {
    loadImages();
  });

  watch(sortColumn, () => {
    loadImages();
  });

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
    deleteSelected,
    sortDirection,
    sortColumn,
    deleteImage,
    hasSelection,
  };
}
