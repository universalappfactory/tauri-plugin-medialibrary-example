<template>
    <div>
        <img
            class="size-14 rounded-box"
            style="cursor: pointer"
            :src="props.uri"
            v-on:click="$emit('click', props.uri)"
            />
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    uri: string;
}>();

defineEmits<{
    (e: "click", uri: string): void;
}>();

</script>
