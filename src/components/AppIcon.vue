<script setup lang="ts">
import { computed } from 'vue'
import type { IconName } from '@/types/icons'

const props = withDefaults(
  defineProps<{
    name: IconName
    size?: number
    stroke?: number
  }>(),
  { size: 24, stroke: 1.6 },
)

/** 线性图标，24×24 网格，圆角端点 */
const ICONS: Record<IconName, string> = {
  map: '<path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z"/><path d="M9 4v13M15 6.5v13"/>',
  book: '<path d="M5 19.5A2.5 2.5 0 0 1 7.5 17H19"/><path d="M7.5 3H19v18H7.5A2.5 2.5 0 0 1 5 18.5v-13A2.5 2.5 0 0 1 7.5 3Z"/><path d="M9.5 7.5h6"/>',
  image:
    '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.7-4.4a2 2 0 0 1 2.7 0l3.1 2.9a2 2 0 0 0 2.7 0l2.8-2.6"/>',
  user: '<circle cx="12" cy="8.5" r="3.6"/><path d="M5 20c.8-3.4 3.7-5.4 7-5.4s6.2 2 7 5.4"/>',
  camera:
    '<path d="M4 8.5h3l1.6-2.2h6.8L17 8.5h3a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 18v-8A1.5 1.5 0 0 1 4 8.5Z"/><circle cx="12" cy="14" r="3.2"/>',
  pin: '<path d="M12 21s6.5-5.7 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.3 12 21 12 21Z"/><circle cx="12" cy="10.5" r="2.4"/>',
  download: '<path d="M12 4v10"/><path d="m8 11 4 4 4-4"/><path d="M5 19h14"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><circle cx="12" cy="8" r=".9" fill="currentColor" stroke="none"/>',
  plus: '<path d="M12 5.5v13M5.5 12h13"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  code: '<path d="m8.5 8-4.5 4 4.5 4"/><path d="m15.5 8 4.5 4-4.5 4"/><path d="m13 5-2 14"/>',
}

const markup = computed(
  () =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="${props.stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[props.name]}</svg>`,
)
</script>

<template>
  <span
    class="app-icon"
    :style="{ width: `${size}px`, height: `${size}px` }"
    v-html="markup"
  />
</template>

<style scoped>
.app-icon {
  display: inline-flex;
  flex: none;
}

.app-icon :deep(svg) {
  display: block;
}
</style>
