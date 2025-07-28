<template>
    <div class="flex flex-col h-full p-2 gap-2">
        <div class="navbar bg-secondary shadow-sm">
            <div class="flex-1">
                <a class="btn btn-ghost text-xl"
                    >Medialibrary Browser Example</a
                >
            </div>
        </div>

        <ErrorHandler :message="browser.errorMessage.value" />

        <div class="w-full flex items-end gap-2 px-2">
            <div>
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Available Sources</legend>
                    <select
                        class="select w-full"
                        v-model="browser.selectedSource.value"
                    >
                        <option
                            v-for="(item, index) of browser.availableSources
                                .value"
                            :key="index"
                        >
                            {{ item }}
                        </option>
                    </select>
                </fieldset>
            </div>
            <button class="btn m-1" @click="browser.getSources">
                Reload Sources
            </button>
        </div>

        <div class="border border-base-300 p-2">
            <div class="flex flex-wrap gap-2">
                <button class="btn" @click="() => browser.loadImages()">
                    Reload Images
                </button>
                <button class="btn" @click="browser.requestPermissions">
                    Request permissions
                </button>
            </div>

            <div class="text-xs pt-2 font-semibold">
                Permissions:
                {{ browser.permissionState.value?.postNotification }}
            </div>
        </div>

        <div class="flex-auto overflow-y-scroll h-[0px] border border-base-300">
            <ul class="list bg-base-100 rounded-box">
                <li
                    class="list-row overflow-clip"
                    @click="openImage(item)"
                    v-for="(item, index) of browser.images.value"
                    :key="index"
                >
                    <Thumbnail :uri="item.contentUri" />
                    <div>
                        <div class="text-xs">
                            {{ item.path }}
                        </div>
                        <div class="text-xs opacity-60 text-ellipsis">
                            Content URI: {{ item.contentUri }}
                        </div>
                        <div class="text-xs opacity-60 text-ellipsis">
                            Mime Type: {{ item.mimeType }}
                        </div>
                        <div class="text-xs opacity-60 text-ellipsis">
                            Date Taken: {{ item.metaData }}
                        </div>
                    </div>
                </li>

                <li class="list-row">
                    <button
                        :disabled="!browser.hasNextPage.value"
                        class="btn"
                        @click="() => browser.nextPage()"
                    >
                        Load More
                    </button>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import Thumbnail from "./Thumbnail.vue";
import ErrorHandler from "./ErrorHandler.vue";
import { useMediaLibraryBrowser } from "./media_library_browser";
import { onMounted } from "vue";
import { ImageInfo } from "../../../tauri-plugin-medialibrary/guest-js";
import { openUrl, openPath } from "@tauri-apps/plugin-opener";

const browser = useMediaLibraryBrowser();

onMounted(async () => {
    await browser.getSources();
    // await browser.loadImages();
});

// simple function to open an image on different platforms
// we try to open the image via url first, if that fails we try to open the path
const openImage = async (image: ImageInfo) => {
    console.log("open image", image.contentUri);
    try {
        await openUrl(image.contentUri);
    } catch (error) {
        console.error("Error opening image:", error);
        console.log("try path", image.path);
        await openPath(image.path);
    }
};
</script>
