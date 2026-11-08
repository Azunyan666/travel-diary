<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBar from '@/components/AppBar.vue'
import AppIcon from '@/components/AppIcon.vue'
import EmptyState from '@/components/EmptyState.vue'
import PhotoTile from '@/components/PhotoTile.vue'
import PhotoViewer from '@/components/PhotoViewer.vue'
import { useTripsStore } from '@/stores/trips'
import { usePhotosStore } from '@/stores/photos'
import { useObjectUrl } from '@/lib/useObjectUrl'
import { dateKey, daysBetween, daysFrom, fmtCN, fmtMD } from '@/lib/format'
import { toast } from '@/lib/toast'
import type { Photo } from '@/types/models'

interface DayGroup {
  key: string
  title: string
  meta: string
  photos: Photo[]
}

const route = useRoute()
const router = useRouter()
const trips = useTripsStore()
const photos = usePhotosStore()

const tripId = computed(() => String(route.params.id ?? ''))
const trip = computed(() => trips.get(tripId.value))
const list = computed(() => photos.forTrip(tripId.value))
const days = computed(() => (trip.value ? daysBetween(trip.value.startDate, trip.value.endDate) : 0))
const place = computed(() =>
  trip.value ? [trip.value.province, trip.value.city].filter(Boolean).join(' · ') : '',
)

const cover = computed(() => list.value[0]?.thumbnail)
const coverUrl = useObjectUrl(() => cover.value)

const groups = computed<DayGroup[]>(() => {
  const map = new Map<string, Photo[]>()
  for (const photo of list.value) {
    const key = dateKey(photo.takenAt) || 'unknown'
    const bucket = map.get(key)
    if (bucket) bucket.push(photo)
    else map.set(key, [photo])
  }

  const result: DayGroup[] = []
  for (const [key, items] of map.entries()) {
    let title = key === 'unknown' ? '没有拍摄时间' : fmtMD(key)
    if (key !== 'unknown' && trip.value) {
      const offset = daysFrom(trip.value.startDate, key)
      if (offset >= 0) title = `第 ${offset + 1} 天 · ${fmtMD(key)}`
    }
    result.push({ key, title, meta: `${items.length} 张`, photos: items })
  }

  return result.sort((a, b) => {
    if (a.key === 'unknown') return 1
    if (b.key === 'unknown') return -1
    return a.key.localeCompare(b.key)
  })
})

const fileInput = ref<HTMLInputElement | null>(null)
const progress = ref<{ done: number; total: number } | null>(null)
const activeIndex = ref<number | null>(null)

onMounted(async () => {
  await trips.init()
  await photos.init()
  if (!trip.value) {
    toast('找不到这次旅行')
    router.replace('/diary')
  }
})

function pick(): void {
  fileInput.value?.click()
}

function openPhoto(photo: Photo): void {
  const index = list.value.findIndex((item) => item.id === photo.id)
  if (index >= 0) activeIndex.value = index
}

async function onFiles(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  if (!files.length || !trip.value) return

  progress.value = { done: 0, total: files.length }
  const result = await photos.importFiles(tripId.value, files, (value) => {
    progress.value = value
  })
  progress.value = null

  if (result.added) toast(`已导入 ${result.added} 张照片`)
  if (result.failed) toast(`${result.failed} 张照片无法读取`, 'accent')
  if (!result.added && !result.failed) toast('这些文件不是图片')
}
</script>

<template>
  <div class="page detail">
    <AppBar title="旅行">
      <template #right>
        <RouterLink v-if="trip" :to="`/trip/${trip.id}/edit`" class="edit-link">编辑</RouterLink>
      </template>
    </AppBar>

    <template v-if="trip">
      <section v-if="coverUrl" class="cover">
        <img :src="coverUrl" alt="" />
        <span class="cover-veil" aria-hidden="true" />
      </section>

      <header class="head">
        <p class="eyebrow">{{ place || '旅行' }}</p>
        <h1 class="display">{{ trip.title }}</h1>
        <p class="dates">
          {{ fmtCN(trip.startDate) }}
          <template v-if="trip.endDate && trip.endDate !== trip.startDate">
            — {{ fmtCN(trip.endDate) }}
          </template>
          · {{ days }} 天
        </p>
        <p v-if="trip.summary" class="summary">{{ trip.summary }}</p>
      </header>

      <div class="toolbar">
        <span class="count">{{ list.length }} 张照片</span>
        <button class="add-btn" type="button" @click="pick">
          <AppIcon name="plus" :size="15" />
          导入照片
        </button>
      </div>

      <div v-if="list.length" class="timeline">
        <section v-for="group in groups" :key="group.key" class="day">
          <header class="day-head">
            <h2 class="day-title">{{ group.title }}</h2>
            <span class="day-meta">{{ group.meta }}</span>
          </header>

          <div class="cards">
            <button
              v-for="photo in group.photos"
              :key="photo.id"
              class="card"
              type="button"
              @click="openPhoto(photo)"
            >
              <PhotoTile :photo="photo" :ratio="4 / 3" />
              <p v-if="photo.caption" class="caption">{{ photo.caption }}</p>
              <p v-else class="caption is-empty">写下这张照片的故事…</p>
              <p v-if="photo.place || photo.tags.length" class="card-meta">
                <span v-if="photo.place">{{ photo.place }}</span>
                <span v-if="photo.place && photo.tags.length" class="dot">·</span>
                <span v-if="photo.tags.length">{{ photo.tags.join(' · ') }}</span>
              </p>
            </button>
          </div>
        </section>
      </div>

      <EmptyState
        v-else
        icon="camera"
        title="还没有照片"
        desc="相册里选几张，按下快门那天的记忆就从这里开始。"
      />

      <input
        ref="fileInput"
        class="hidden-input"
        type="file"
        accept="image/*"
        multiple
        @change="onFiles"
      />
    </template>

    <Transition name="toast">
      <div v-if="progress" class="progress">
        <div class="progress-track">
          <div
            class="progress-bar"
            :style="{ width: `${Math.round((progress.done / progress.total) * 100)}%` }"
          />
        </div>
        <span class="progress-text">正在处理 {{ progress.done }} / {{ progress.total }}</span>
      </div>
    </Transition>

    <PhotoViewer
      v-if="activeIndex !== null"
      :photos="list"
      :start-index="activeIndex"
      @close="activeIndex = null"
    />
  </div>
</template>

<style scoped>
.detail {
  padding-bottom: calc(env(safe-area-inset-bottom) + 40px);
}

.edit-link {
  font-size: 13px;
  font-weight: 600;
  color: var(--forest);
  padding: 6px 4px;
}

.cover {
  position: relative;
  margin: 4px 20px 0;
  height: 170px;
  border-radius: var(--r-xl);
  overflow: hidden;
  background: var(--paper-deep);
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(31, 36, 33, 0.28), rgba(31, 36, 33, 0) 55%);
}

.head {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px 20px 0;
}

.display {
  font-size: 26px;
}

.dates {
  font-size: 12px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.summary {
  margin-top: 4px;
  font-size: 13px;
  line-height: 1.65;
  color: var(--body);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 12px;
}

.count {
  font-size: 12px;
  color: var(--muted);
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 34px;
  padding: 0 14px;
  border-radius: var(--r-full);
  background: var(--forest-soft);
  color: var(--forest);
  font-size: 12px;
  font-weight: 600;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 0 20px;
}

.day-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--line);
}

.day-title {
  font-family: var(--serif);
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
}

.day-meta {
  font-size: 11px;
  color: var(--muted);
}

.cards {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0;
}

.card .caption {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.65;
  color: var(--ink);
  white-space: pre-wrap;
}

.card .caption.is-empty {
  color: var(--muted-soft);
}

.card-meta {
  margin-top: 5px;
  font-size: 11px;
  color: var(--muted);
}

.dot {
  margin: 0 5px;
  color: var(--line-strong);
}

.hidden-input {
  display: none;
}

.progress {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(env(safe-area-inset-bottom) + 20px);
  width: min(86vw, 340px);
  padding: 14px 16px;
  border-radius: var(--r-lg);
  background: rgba(30, 33, 31, 0.92);
  color: #f5f2ea;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 70;
}

.progress-track {
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.18);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--clay);
  border-radius: 2px;
  transition: width 200ms ease;
}

.progress-text {
  font-size: 12px;
  color: rgba(245, 242, 234, 0.82);
  font-variant-numeric: tabular-nums;
}
</style>
