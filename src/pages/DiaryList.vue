<script setup lang="ts">
import EmptyState from '@/components/EmptyState.vue'
import { toast } from '@/lib/toast'

function createTrip(): void {
  toast('新建旅行将在下一版本开放', 'accent')
}
</script>

<template>
  <main class="page">
    <header class="head">
      <p class="eyebrow">日记</p>
      <h1 class="display">旅行日记</h1>
      <p class="lead">按时间回看每一次出发。</p>
    </header>

    <EmptyState
      icon="book"
      title="还没有旅行"
      desc="每一次出发都值得被记下来：照片、地点，还有当时的那句话。"
    >
      <button class="btn-primary" type="button" @click="createTrip">新建一次旅行</button>
    </EmptyState>
  </main>
</template>
