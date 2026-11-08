<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import BottomSheet from '@/components/BottomSheet.vue'
import MapCanvas from '@/components/MapCanvas.vue'
import TripCard from '@/components/TripCard.vue'
import { useTripsStore } from '@/stores/trips'
import { usePhotosStore } from '@/stores/photos'
import { PROVINCE_TOTAL, normalizeProvince } from '@/lib/provinces'
import { daysBetween, fmtMD } from '@/lib/format'
import { byStartDateDesc } from '@/lib/sort'
import type { Trip } from '@/types/models'

const router = useRouter()
const trips = useTripsStore()
const photos = usePhotosStore()

const year = new Date().getFullYear()

const visits = computed<Record<string, number>>(() => {
  const map: Record<string, number> = {}
  for (const trip of trips.trips) {
    const key = normalizeProvince(trip.province ?? '')
    if (!key) continue
    map[key] = (map[key] ?? 0) + 1
  }
  return map
})

const litCount = computed(() => Object.keys(visits.value).length)

const recentProvince = computed(() => {
  const sorted = [...trips.trips].sort(byStartDateDesc)
  return sorted.length ? normalizeProvince(sorted[0].province ?? '') : ''
})

const stats = computed(() => [
  { label: '次旅行', value: trips.trips.length },
  {
    label: '天在路上',
    value: trips.trips.reduce((total, trip) => total + daysBetween(trip.startDate, trip.endDate), 0),
  },
  { label: '张照片', value: photos.photos.length },
])

const recentTrips = computed(() => [...trips.trips].sort(byStartDateDesc).slice(0, 3))

const selected = ref<string | null>(null)
const sheetOpen = ref(false)

const selectedTrips = computed<Trip[]>(() => {
  if (!selected.value) return []
  return trips.trips
    .filter((trip) => normalizeProvince(trip.province ?? '') === selected.value)
    .sort(byStartDateDesc)
})

function onSelect(name: string): void {
  selected.value = normalizeProvince(name)
  sheetOpen.value = true
}

function openTrip(trip: Trip): void {
  sheetOpen.value = false
  router.push(`/trip/${trip.id}`)
}

function createForProvince(): void {
  const province = selected.value
  sheetOpen.value = false
  router.push({ path: '/trip/new', query: province ? { province } : {} })
}
</script>

<template>
  <main class="page home">
    <header class="head">
      <p class="eyebrow">足迹 · {{ year }}</p>
      <h1 class="display">我的地图</h1>
      <p class="lead">
        {{ litCount ? `已经点亮 ${litCount} 个地方` : '去过的地方，会一点一点亮起来。' }}
      </p>
    </header>

    <section class="map-card">
      <MapCanvas :visits="visits" :recent="recentProvince" @select="onSelect" />

      <span class="chip">{{ litCount }} / {{ PROVINCE_TOTAL }}</span>

      <div class="legend">
        <span class="legend-item"><i class="dot unlit" />未去过</span>
        <span class="legend-item"><i class="dot lit" />去过</span>
        <span class="legend-item"><i class="dot lit-more" />多次</span>
      </div>
    </section>

    <section class="stats card" aria-label="旅行统计">
      <div v-for="s in stats" :key="s.label" class="stat">
        <span class="stat-value">{{ s.value }}</span>
        <span class="stat-label">{{ s.label }}</span>
      </div>
    </section>

    <template v-if="recentTrips.length">
      <div class="sec-head">
        <h2 class="section-title">最近的旅行</h2>
        <RouterLink to="/diary" class="more">全部 ›</RouterLink>
      </div>

      <RouterLink
        v-for="trip in recentTrips"
        :key="trip.id"
        :to="`/trip/${trip.id}`"
        class="trip-link"
      >
        <TripCard :trip="trip" />
      </RouterLink>
    </template>

    <section v-else class="callout card">
      <div class="callout-head">
        <span class="callout-icon"><AppIcon name="camera" :size="20" /></span>
        <div class="callout-body">
          <p class="callout-title">从一张照片开始</p>
          <p class="callout-sub">写下当时的心情和趣事，照片就有了记忆。</p>
        </div>
      </div>
      <button class="btn-primary" type="button" @click="router.push('/trip/new')">
        开始记录
      </button>
    </section>

    <BottomSheet :open="sheetOpen" @close="sheetOpen = false">
      <div class="sheet-head">
        <div>
          <p class="sheet-name">{{ selected }}</p>
          <p class="sheet-meta">
            {{ selectedTrips.length ? `${selectedTrips.length} 次旅行` : '还没去过这里' }}
          </p>
        </div>
        <button class="sheet-close" type="button" aria-label="关闭" @click="sheetOpen = false">
          <AppIcon name="close" :size="18" />
        </button>
      </div>

      <div v-if="selectedTrips.length" class="sheet-list">
        <button
          v-for="trip in selectedTrips"
          :key="trip.id"
          class="sheet-trip"
          type="button"
          @click="openTrip(trip)"
        >
          <span class="sheet-trip-title">{{ trip.title }}</span>
          <span class="sheet-trip-meta">{{ fmtMD(trip.startDate) }} – {{ fmtMD(trip.endDate) }}</span>
        </button>
      </div>

      <button v-else class="sheet-empty-btn" type="button" @click="createForProvince">
        记一次去这里的旅行
      </button>
    </BottomSheet>
  </main>
</template>

<style scoped>
.map-card {
  position: relative;
  height: 340px;
  border-radius: var(--r-xl);
  border: 1px solid var(--line);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.chip {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 5px 10px;
  border-radius: var(--r-full);
  background: rgba(255, 255, 255, 0.88);
  color: var(--body);
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  backdrop-filter: blur(8px);
}

.legend {
  position: absolute;
  left: 12px;
  bottom: 12px;
  display: flex;
  gap: 10px;
  padding: 6px 10px;
  border-radius: var(--r-full);
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(8px);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--muted);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  background: var(--paper-deep);
}

.dot.lit {
  border-color: var(--forest);
  background: var(--forest);
}

.dot.lit-more {
  border-color: var(--moss);
  background: var(--moss);
}

.stats {
  display: flex;
  margin-top: 16px;
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
  font-size: 19px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 11px;
  color: var(--muted);
}

.sec-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 26px 0 12px;
}

.section-title {
  font-family: var(--serif);
  font-size: 18px;
  font-weight: 600;
}

.more {
  font-size: 12px;
  color: var(--muted);
}

.trip-link {
  display: block;
  margin-bottom: 12px;
}

.callout {
  margin-top: 16px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.callout-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.callout-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: var(--r-md);
  background: var(--clay-soft);
  color: var(--clay);
  flex: none;
}

.callout-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 1px;
}

.callout-title {
  font-family: var(--serif);
  font-size: 15px;
  font-weight: 600;
}

.callout-sub {
  font-size: 12px;
  line-height: 1.55;
  color: var(--muted);
}

.sheet-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}

.sheet-name {
  font-family: var(--serif);
  font-size: 24px;
  font-weight: 600;
  color: var(--ink);
}

.sheet-meta {
  margin-top: 3px;
  font-size: 12px;
  color: var(--muted);
}

.sheet-close {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--surface);
  border: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--body);
}

.sheet-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sheet-trip {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 16px;
  border-radius: var(--r-md);
  background: var(--surface);
  border: 1px solid var(--line);
  text-align: left;
}

.sheet-trip-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sheet-trip-meta {
  font-size: 11px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  flex: none;
}

.sheet-empty-btn {
  width: 100%;
  height: 48px;
  border-radius: var(--r-full);
  border: 1px dashed var(--line-strong);
  color: var(--forest);
  font-size: 14px;
  font-weight: 600;
}
</style>
