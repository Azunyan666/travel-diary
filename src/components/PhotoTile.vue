<script setup lang="ts">
import { computed } from 'vue'
import type { Photo } from '@/types/models'
import { useObjectUrl } from '@/lib/useObjectUrl'

const props = withDefaults(
  defineProps<{
    photo: Photo
    full?: boolean
  }>(),
  { full: false },
)

const blob = computed(() => (props.full ? props.photo.image : props.photo.thumbnail))
const url = useObjectUrl(() => blob.value)
</script>

<template>
  <div class="tile">
    <img v-if="url" :src="url" alt="" loading="lazy" decoding="async" />
  </div>
</template>

<style scoped>
.tile {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--r-md);
  overflow: hidden;
  background: var(--paper-deep);
}

.tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
