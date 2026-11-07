<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import PhotoLightbox from '@/components/PhotoLightbox.vue'
import PhotoTile from '@/components/PhotoTile.vue'
import { usePhotosStore } from '@/stores/photos'
import type { Photo } from '@/types/models'

const photos = usePhotosStore()
const active = ref<Photo | null>(null)
const list = computed(() => photos.ordered())

onMounted(async () => {
  await photos.init()
})
</script>

<template>
  <main class="page">
    <header class="head">
      <p class="eyebrow">相册</p>
      <h1 class="display">所有照片</h1>
      <p class="lead">{{ list.length ? `${list.length} 张，按拍摄时间倒序` : '从最近的一张，倒着翻回出发那天。' }}</p>
    </header>

    <div v-if="list.length" class="grid">
      <button
        v-for="photo in list"
        :key="photo.id"
        class="grid-item"
        type="button"
        @click="active = photo"
      >
        <PhotoTile :photo="photo" />
      </button>
    </div>

    <EmptyState
      v-else
      icon="image"
      title="相册是空的"
      desc="导入旅行照片后，它们会按拍摄时间排好，每张都可以写一句话。"
    />

    <PhotoLightbox v-if="active" :photo="active" @close="active = null" />
  </main>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.grid-item {
  display: block;
  padding: 0;
  border-radius: var(--r-md);
  overflow: hidden;
}
</style>
