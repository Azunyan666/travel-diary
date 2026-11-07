<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { useTripsStore } from '@/stores/trips'
import { usePhotosStore } from '@/stores/photos'

const router = useRouter()
const trips = useTripsStore()
const photos = usePhotosStore()

const year = new Date().getFullYear()

function uniqueCount(values: Array<string | undefined>): number {
  return new Set(values.filter(Boolean)).size
}

const stats = computed(() => [
  { label: '省份', value: uniqueCount(trips.trips.map((trip) => trip.province)) },
  { label: '城市', value: uniqueCount(trips.trips.map((trip) => trip.city)) },
  { label: '照片', value: photos.photos.length },
])
</script>

<template>
  <main class="page home">
    <header class="head">
      <p class="eyebrow">足迹 · {{ year }}</p>
      <h1 class="display">我的地图</h1>
      <p class="lead">去过的地方，会一点一点亮起来。</p>
    </header>

    <section class="map-stage" aria-label="足迹地图（建设中）">
      <span class="grid" aria-hidden="true" />
      <span class="glow" aria-hidden="true" />

      <div class="stage-center">
        <span class="pin"><AppIcon name="pin" :size="22" /></span>
        <p class="stage-title">地图正在准备</p>
        <p class="stage-sub">记下第一段旅程，这里会亮起第一块颜色</p>
      </div>

      <div class="legend">
        <span class="legend-item"><i class="dot unlit" />未去过</span>
        <span class="legend-item"><i class="dot lit" />去过</span>
      </div>
    </section>

    <section class="stats card" aria-label="旅行统计">
      <div v-for="s in stats" :key="s.label" class="stat">
        <span class="stat-value">{{ s.value }}</span>
        <span class="stat-label">{{ s.label }}</span>
      </div>
    </section>

    <section class="callout card">
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
  </main>
</template>

<style scoped>
.map-stage {
  position: relative;
  height: 300px;
  border-radius: var(--r-xl);
  border: 1px solid var(--line);
  background: linear-gradient(170deg, #f3edde 0%, #efe6d4 60%, #ece1cc 100%);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.grid {
  position: absolute;
  inset: -30%;
  background-image:
    linear-gradient(to right, rgba(31, 36, 33, 0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(31, 36, 33, 0.06) 1px, transparent 1px);
  background-size: 34px 34px;
  transform: rotate(-9deg) scale(1.15);
  opacity: 0.85;
}

.glow {
  position: absolute;
  width: 240px;
  height: 240px;
  left: 50%;
  top: 46%;
  transform: translate(-50%, -50%);
  border-radius: 46% 54% 58% 42% / 52% 44% 56% 48%;
  background: radial-gradient(circle at 40% 40%, rgba(228, 237, 232, 0.95), rgba(228, 237, 232, 0));
}

.stage-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 40px;
  text-align: center;
}

.pin {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--surface);
  color: var(--forest);
  border: 1px solid var(--line);
  box-shadow: 0 6px 18px rgba(31, 36, 33, 0.08);
  margin-bottom: 2px;
}

.stage-title {
  font-family: var(--serif);
  font-size: 17px;
  font-weight: 600;
  color: var(--ink);
}

.stage-sub {
  max-width: 220px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--muted);
}

.legend {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 14px;
  display: flex;
  gap: 16px;
  font-size: 11px;
  color: var(--muted);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  background: transparent;
}

.dot.lit {
  border-color: var(--forest);
  background: var(--forest);
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
  font-size: 21px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 11px;
  color: var(--muted);
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
  color: var(--ink);
}

.callout-sub {
  font-size: 12px;
  line-height: 1.55;
  color: var(--muted);
}
</style>
