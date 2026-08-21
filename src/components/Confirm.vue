<template>
    <dialog id="my_modal_5" :class="props.isOpen ? 'modal-open' : ''" class="modal modal-top sm:modal-middle">
        <div class="modal-box">
            <h3 class="text-lg font-bold">{{ props.title }}</h3>
            <p class="py-4">{{ props.message }}</p>
            <div class="modal-action">
                <div class="flex gap-2">
                    <button @click="emit('cancel')" class="btn">Cancel</button>
                    <button @click="emit('ok')" class="btn">Ok</button>
                </div>
            </div>
        </div>
    </dialog>
</template>

<script setup lang="ts">

const props = defineProps<{
 title:string
  message: string
 isOpen: boolean
}>()

const emit = defineEmits<{
 (event: 'ok'): void
 (event: 'cancel'): void
}>()

</script>
