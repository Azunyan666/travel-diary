<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { toast } from '@/lib/toast'
import { daysBetween, fmtStamp } from '@/lib/format'
import { getMeta } from '@/lib/db'
import { loadDemoData } from '@/lib/demo'
import { APP_VERSION } from '@/lib/version'
import { useTripsStore } from '@/stores/trips'
import { usePhotosStore } from '@/stores/photos'
import { useUpdateStore } from '@/stores/update'
import type { IconName } from '@/types/icons'

const year = new Date().getFullYear()
const router = useRouter()
const trips = useTripsStore()
const photos = usePhotosStore()
const update = useUpdateStore()
const lastBackupAt = ref<number | undefined>()

const needsBackup = computed(() => {
  if (photos.photos.length < 10) return false
  if (!lastBackupAt.value) return true
  return Date.now() - lastBackupAt.value > 7 * 86400000
})

onMounted(async () => {
  await trips.init()
  await photos.init()
  lastBackupAt.value = await getMeta<number>('lastBackupAt')
})

const stats = computed(() => [
  { label: '次旅行', value: trips.trips.length },
  {
    label: '天在路上',
    value: trips.trips.reduce((total, trip) => total + daysBetween(trip.startDate, trip.endDate), 0),
  },
  { label: '张照片', value: photos.photos.length },
])

const menus: Array<{
  label: string
  icon: IconName
  action: 'backup' | 'demo' | 'check' | 'about' | 'repo'
}> = [
  { label: '数据备份与导出', icon: 'download', action: 'backup' },
  { label: '添加示例数据', icon: 'image', action: 'demo' },
  { label: '检查更新', icon: 'refresh', action: 'check' },
  { label: '关于行迹', icon: 'info', action: 'about' },
  { label: '开源仓库', icon: 'code', action: 'repo' },
]

function onMenu(action: 'backup' | 'demo' | 'check' | 'about' | 'repo'): void {
  if (action === 'backup') router.push('/backup')
  else if (action === 'demo') void addDemo()
  else if (action === 'check') void checkUpdate()
  else if (action === 'about') toast(`行迹 v${APP_VERSION} · 本地优先的旅行日记`)
}

async function checkUpdate(): Promise<void> {
  await update.check(true)
  if (update.info) {
    update.open()
  } else {
    toast('已经是最新版本')
  }
}

async function addDemo(): Promise<void> {
  const ok = window.confirm('添加 3 次示例旅行和 7 张照片？只会新增，不会影响已有数据。')
  if (!ok) return

  const result = await loadDemoData()
  await trips.refresh()
  await photos.refresh()
  toast(`已添加 ${result.trips} 次旅行、${result.photos} 张照片`)
  if (result.trips || result.photos) router.push('/')
}

const lastBackupText = computed(() =>
  lastBackupAt.value ? `上次备份 ${fmtStamp(lastBackupAt.value)}` : '还没有备份过',
)
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

    <button v-if="needsBackup" class="remind card" type="button" @click="router.push('/backup')">
      <span class="remind-icon"><AppIcon name="download" :size="18" /></span>
      <span class="remind-body">
        <span class="remind-title">照片还没备份</span>
        <span class="remind-sub">{{ photos.photos.length }} 张照片只在这台设备上 · {{ lastBackupText }}</span>
      </span>
      <AppIcon name="chevron" :size="16" />
    </button>

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

    <p class="version">行迹 v{{ APP_VERSION }} · 数据只保存在这台设备</p>
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

.remind {
  width: 100%;
  margin-top: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.remind-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--r-sm);
  background: var(--clay-soft);
  color: var(--clay);
  flex: none;
}

.remind-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.remind-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
}

.remind-sub {
  font-size: 11px;
  color: var(--muted);
}
</style>
