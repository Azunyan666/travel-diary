<script setup lang="ts">
import { computed } from 'vue'
import type { Trip } from '@/types/models'
import { usePhotosStore } from '@/stores/photos'
import { useObjectUrl } from '@/lib/useObjectUrl'
import { daysBetween, fmtMD } from '@/lib/format'
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps<{ trip: Trip }>()

const photos = usePhotosStore()
const cover = computed(() => photos.coverForTrip(props.trip.id))
const coverUrl = useObjectUrl(() => cover.value)
const count = computed(() => photos.countForTrip(props.trip.id))
const days = computed(() => daysBetween(props.trip.startDate, props.trip.endDate))
const place = computed(
  () => [props.trip.province, props.trip.city].filter(Boolean).join(' · ') || props.trip.country || '',
)
</script>

<template>
  <article class="trip card">
    <div class="thumb">
      <img v-if="coverUrl" :src="coverUrl" alt="" loading="lazy" />
      <span v-else class="thumb-empty"><AppIcon name="pin" :size="20" /></span>
    </div>

    <div class="body">
      <p class="title">{{ trip.title }}</p>
      <p class="date">{{ fmtMD(trip.startDate) }} – {{ fmtMD(trip.endDate) }} · {{ days }} 天</p>
      <p class="meta">
        <span v-if="place">{{ place }}</span>
        <span v-if="place" class="dot">·</span>
        <span>{{ count }} 张照片</span>
      </p>
    </div>

    <AppIcon name="chevron" :size="16" class="chev" />
  </article>
</template>

<style scoped>
.trip {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
}

.thumb {
  width: 76px;
  height: 76px;
  border-radius: var(--r-md);
  overflow: hidden;
  flex: none;
  background: var(--paper-deep);
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--muted-soft);
}

.body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title {
  font-family: var(--serif);
  font-size: 17px;
  font-weight: 600;
  line-height: 1.35;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.date {
  font-size: 12px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.meta {
  font-size: 11px;
  color: var(--muted);
}

.dot {
  margin: 0 5px;
  color: var(--line-strong);
}

.chev {
  color: var(--line-strong);
  flex: none;
}
</style>
