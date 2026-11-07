<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import type { IconName } from '@/types/icons'

const route = useRoute()

const tabs: Array<{ name: string; label: string; to: string; icon: IconName }> = [
  { name: 'home', label: '足迹', to: '/', icon: 'map' },
  { name: 'diary', label: '日记', to: '/diary', icon: 'book' },
  { name: 'album', label: '相册', to: '/album', icon: 'image' },
  { name: 'mine', label: '我的', to: '/mine', icon: 'user' },
]

const active = computed(() => String(route.meta.tab ?? 'home'))
</script>

<template>
  <nav class="tabbar" aria-label="主导航">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.name"
      :to="tab.to"
      class="tab"
      :class="{ 'is-active': active === tab.name }"
    >
      <AppIcon :name="tab.icon" :size="22" />
      <span class="label">{{ tab.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.tabbar {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(100%, var(--page-width));
  display: flex;
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-top: 1px solid var(--line);
  z-index: 40;
}

.tab {
  flex: 1;
  height: var(--tabbar-h);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: var(--muted-soft);
}

.tab.is-active {
  color: var(--forest);
}

.label {
  font-size: 10px;
  letter-spacing: 0.6px;
  line-height: 1.2;
}

.tab.is-active .label {
  font-weight: 600;
}
</style>
