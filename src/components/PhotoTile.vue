<script setup lang="ts">
import { computed } from 'vue'
import type { Photo } from '@/types/models'
import { useObjectUrl } from '@/lib/useObjectUrl'

const props = withDefaults(
  defineProps<{
    photo: Photo
    full?: boolean
    /** 宽高比；不传则正方形 */
    ratio?: number
  }>(),
  { full: false, ratio: 0 },
)

const blob = computed(() => (props.full ? props.photo.image : props.photo.thumbnail))
const url = useObjectUrl(() => blob.value)
const style = computed(() => (props.ratio > 0 ? { aspectRatio: String(props.ratio) } : {}))
</script>

<template>
  <div class="tile" :class="{ 'is-square': !ratio }" :style="style">
    <img v-if="url" :src="url" alt="" loading="lazy" decoding="async" />
  </div>
</template>

<style scoped>
.tile {
  position: relative;
  border-radius: var(--r-md);
  overflow: hidden;
  background: var(--paper-deep);
}

.tile.is-square {
  aspect-ratio: 1;
}

.tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
