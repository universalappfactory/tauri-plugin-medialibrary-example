<template>
  <div role="alert" class="alert alert-error" v-if="props.message">
    {{ props.message }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  message?: string;
}>();
</script>
