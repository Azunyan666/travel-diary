<script setup lang="ts">
import EmptyState from '@/components/EmptyState.vue'
import { toast } from '@/lib/toast'

function importPhotos(): void {
  toast('照片导入将在下一版本开放', 'accent')
}
</script>

<template>
  <main class="page">
    <header class="head">
      <p class="eyebrow">相册</p>
      <h1 class="display">所有照片</h1>
      <p class="lead">从最近的一张，倒着翻回出发那天。</p>
    </header>

    <EmptyState
      icon="image"
      title="相册是空的"
      desc="导入旅行照片后，它们会按拍摄时间排好，每张都可以写一句话。"
    >
      <button class="btn-primary" type="button" @click="importPhotos">导入照片</button>
    </EmptyState>
  </main>
</template>
