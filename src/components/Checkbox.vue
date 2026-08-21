<template>
    <input type="checkbox" v-model="model" class="checkbox" />
</template>

<script setup lang="ts">
const model = defineModel<boolean>();
</script>
