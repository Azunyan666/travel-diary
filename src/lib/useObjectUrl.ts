import { onBeforeUnmount, ref, watch } from 'vue'

/** 把一个 Blob 变成 <img> 可用的 URL，并在组件卸载时释放 */
export function useObjectUrl(source: () => Blob | undefined) {
  const url = ref('')
  let current: string | null = null

  function update(): void {
    if (current) URL.revokeObjectURL(current)
    const blob = source()
    current = blob ? URL.createObjectURL(blob) : null
    url.value = current ?? ''
  }

  watch(source, update, { immediate: true })

  onBeforeUnmount(() => {
    if (current) URL.revokeObjectURL(current)
    current = null
  })

  return url
}
