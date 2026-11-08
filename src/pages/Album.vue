<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import PhotoTile from '@/components/PhotoTile.vue'
import PhotoViewer from '@/components/PhotoViewer.vue'
import { usePhotosStore } from '@/stores/photos'
import type { Photo } from '@/types/models'

const photos = usePhotosStore()
const activeIndex = ref<number | null>(null)
const list = computed(() => photos.ordered())

onMounted(async () => {
  await photos.init()
})

function openPhoto(photo: Photo): void {
  const index = list.value.findIndex((item) => item.id === photo.id)
  if (index >= 0) activeIndex.value = index
}

function ratioOf(photo: Photo): number {
  if (photo.width && photo.height) return photo.width / photo.height
  return 1
}
</script>

<template>
  <main class="page">
    <header class="head">
      <p class="eyebrow">相册</p>
      <h1 class="display">所有照片</h1>
      <p class="lead">
        {{ list.length ? `${list.length} 张，按拍摄时间倒序` : '从最近的一张，倒着翻回出发那天。' }}
      </p>
    </header>

    <div v-if="list.length" class="masonry">
      <button
        v-for="photo in list"
        :key="photo.id"
        class="item"
        type="button"
        @click="openPhoto(photo)"
      >
        <PhotoTile :photo="photo" :ratio="ratioOf(photo)" />
        <p v-if="photo.caption" class="caption">{{ photo.caption }}</p>
      </button>
    </div>

    <EmptyState
      v-else
      icon="image"
      title="相册是空的"
      desc="导入旅行照片后，它们会按拍摄时间排好，每张都可以写一句话。"
    />

    <PhotoViewer
      v-if="activeIndex !== null"
      :photos="list"
      :start-index="activeIndex"
      @close="activeIndex = null"
    />
  </main>
</template>

<style scoped>
.masonry {
  column-count: 2;
  column-gap: 10px;
}

.item {
  display: block;
  width: 100%;
  margin: 0 0 10px;
  padding: 0;
  break-inside: avoid;
  text-align: left;
}

.item .caption {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.55;
  color: var(--body);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
