import { ref } from "vue"

export type ConfirmedAction<T> = (data: T) => Promise<void>

export function useConfirm<T>(dialogTitle: string, dialogMessage: string) {
  const isOpen = ref(false)
  const title = ref(dialogTitle)
  const message = ref(dialogMessage)
  let confirmedAction: ConfirmedAction<T> = async () => {}
  let data: T

  const execute = (data: T, callback: ConfirmedAction<T>) => {
    isOpen.value = true
    confirmedAction = callback
    data = data
  }

  const confirm = async () => {
    await confirmedAction(data)
    isOpen.value = false
  }

  const cancel = () => {
    isOpen.value = false
  }

  return {
    isOpen,
    title,
    message,
    confirm,
    cancel,
    execute,
  }
}
