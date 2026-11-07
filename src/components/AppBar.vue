<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'

withDefaults(
  defineProps<{
    title?: string
    back?: boolean
  }>(),
  { title: '', back: true },
)

const router = useRouter()

function goBack(): void {
  if (window.history.length > 1) router.back()
  else router.replace('/diary')
}
</script>

<template>
  <header class="appbar">
    <button v-if="back" class="back" type="button" aria-label="返回" @click="goBack">
      <AppIcon name="chevron" :size="18" class="flip" />
    </button>
    <span v-else class="back placeholder" aria-hidden="true" />

    <h1 class="title">{{ title }}</h1>

    <div class="right">
      <slot name="right" />
    </div>
  </header>
</template>

<style scoped>
.appbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: calc(env(safe-area-inset-top) + 10px) 16px 10px;
  background: rgba(247, 243, 234, 0.86);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--surface);
  border: 1px solid var(--line);
  color: var(--ink);
  flex: none;
}

.back.placeholder {
  background: transparent;
  border: 0;
}

.flip {
  transform: rotate(180deg);
}

.title {
  flex: 1;
  min-width: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.right {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
