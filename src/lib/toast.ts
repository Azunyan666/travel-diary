import { reactive } from 'vue'

interface ToastState {
  message: string
  visible: boolean
  tone: 'default' | 'accent'
}

export const toastState = reactive<ToastState>({
  message: '',
  visible: false,
  tone: 'default',
})

let timer: ReturnType<typeof setTimeout> | undefined

/** 全局轻提示：1.8 秒后自动消失 */
export function toast(message: string, tone: ToastState['tone'] = 'default'): void {
  toastState.message = message
  toastState.tone = tone
  toastState.visible = true

  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    toastState.visible = false
  }, 1800)
}
