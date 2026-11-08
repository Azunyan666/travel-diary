<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import { toast } from '@/lib/toast'
import { daysBetween } from '@/lib/format'
import { useTripsStore } from '@/stores/trips'
import { usePhotosStore } from '@/stores/photos'
import type { IconName } from '@/types/icons'

const year = new Date().getFullYear()
const trips = useTripsStore()
const photos = usePhotosStore()

const stats = computed(() => [
  { label: '次旅行', value: trips.trips.length },
  {
    label: '天在路上',
    value: trips.trips.reduce((total, trip) => total + daysBetween(trip.startDate, trip.endDate), 0),
  },
  { label: '张照片', value: photos.photos.length },
])

const menus: Array<{ label: string; icon: IconName; action: 'backup' | 'about' | 'repo' }> = [
  { label: '数据备份与导出', icon: 'download', action: 'backup' },
  { label: '关于行迹', icon: 'info', action: 'about' },
  { label: '开源仓库', icon: 'code', action: 'repo' },
]

function onMenu(action: 'backup' | 'about' | 'repo'): void {
  if (action === 'backup') toast('备份功能将随后续版本上线')
  else if (action === 'about') toast('行迹 v0.3.0 · 本地优先的旅行日记')
}
</script>

<template>
  <main class="page">
    <header class="head">
      <p class="eyebrow">关于我</p>
      <h1 class="display">我的</h1>
      <p class="lead">从 {{ year }} 年开始，把走过的路收在这里。</p>
    </header>

    <section class="identity card">
      <span class="avatar" aria-hidden="true">行</span>
      <div class="identity-body">
        <p class="name">{{ trips.trips.length ? '一直在路上' : '还没有起名字' }}</p>
        <p class="since">
          {{ trips.trips.length ? `记录了 ${trips.trips.length} 次旅行` : '第一段旅程还没开始' }}
        </p>
      </div>
    </section>

    <section class="stats card" aria-label="统计">
      <div v-for="s in stats" :key="s.label" class="stat">
        <span class="stat-value">{{ s.value }}</span>
        <span class="stat-label">{{ s.label }}</span>
      </div>
    </section>

    <nav class="menu card" aria-label="设置">
      <template v-for="(item, index) in menus" :key="item.label">
        <a
          v-if="item.action === 'repo'"
          class="menu-item"
          :class="{ 'is-last': index === menus.length - 1 }"
          href="https://github.com/Azunyan666/travel-diary"
          target="_blank"
          rel="noreferrer"
        >
          <span class="menu-icon"><AppIcon :name="item.icon" :size="17" /></span>
          <span class="menu-label">{{ item.label }}</span>
          <AppIcon name="chevron" :size="16" />
        </a>
        <button
          v-else
          class="menu-item"
          type="button"
          :class="{ 'is-last': index === menus.length - 1 }"
          @click="onMenu(item.action)"
        >
          <span class="menu-icon"><AppIcon :name="item.icon" :size="17" /></span>
          <span class="menu-label">{{ item.label }}</span>
          <AppIcon name="chevron" :size="16" />
        </button>
      </template>
    </nav>

    <p class="version">行迹 v0.3.0 · 数据只保存在这台设备</p>
  </main>
</template>

<style scoped>
.identity {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--forest);
  color: var(--paper);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 600;
  flex: none;
}

.identity-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.name {
  font-family: var(--serif);
  font-size: 17px;
  font-weight: 600;
}

.since {
  font-size: 12px;
  color: var(--muted);
}

.stats {
  display: flex;
  margin-top: 14px;
  padding: 16px 8px;
}

.stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat + .stat {
  border-left: 1px solid var(--line);
}

.stat-value {
  font-size: 21px;
  font-weight: 600;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 11px;
  color: var(--muted);
}

.menu {
  margin-top: 14px;
  overflow: hidden;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 16px;
  border-bottom: 1px solid var(--line);
  color: var(--body);
  text-align: left;
}

.menu-item:last-child {
  border-bottom: 0;
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--r-sm);
  background: var(--forest-soft);
  color: var(--forest);
  flex: none;
}

.menu-label {
  flex: 1;
  font-size: 14px;
  color: var(--ink);
}

.version {
  margin-top: 26px;
  text-align: center;
  font-size: 11px;
  color: var(--muted-soft);
}
</style>
