<template>
    <div>
        <template v-if="data">
            <img
                class="size-14 rounded-box"
                style="cursor: pointer"
                :src="data"
                v-on:click="$emit('click', props.uri)"
        /></template>
        <template v-else> loading... </template>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getThumbnail } from "../../../tauri-plugin-medialibrary/guest-js/index";

const data = ref<string | undefined>();

const props = defineProps<{
    uri: string;
}>();

defineEmits<{
    (e: "click", uri: string): void;
}>();

onMounted(async () => {
    try {
        const result = await getThumbnail(props.uri);
        if (result) {
            data.value = `data:image/jpg;base64, ${result.content}`;
        }
    } catch (e) {
        console.error("error in getThumbnail", e);
    }
});
</script>
