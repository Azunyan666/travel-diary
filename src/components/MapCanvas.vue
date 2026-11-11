<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { normalizeProvince } from '@/lib/provinces'

interface GeoFeature {
  name?: string
  nameZh?: string
  iso?: string
  center?: [number, number]
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][] | number[][][][]
  }
}

interface Feature {
  id: string
  name: string
  center?: [number, number]
  rings: Array<Array<[number, number]>>
}

const props = withDefaults(
  defineProps<{
    visits: Record<string, number>
    recent?: string
    mode?: 'china' | 'world'
  }>(),
  { mode: 'china', recent: '' },
)

const emit = defineEmits<{
  select: [payload: { id: string; name: string }]
}>()

const root = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const status = ref<'loading' | 'ready' | 'error'>('loading')

const BOUNDS = {
  china: { minLng: 73, maxLng: 136, minLat: 17, maxLat: 54 },
  world: { minLng: -180, maxLng: 180, minLat: -56, maxLat: 84 },
}

const FILL = {
  unvisited: '#EFE8D9',
  once: '#2F5D50',
  twice: '#4F7A5C',
  many: '#7C8F6B',
}

let features: Feature[] = []
let transform = { scale: 1, offsetX: 0, offsetY: 0 }
let observer: ResizeObserver | null = null

const mercX = (lng: number): number => (lng * Math.PI) / 180
const mercY = (lat: number): number => {
  const clamped = Math.max(-85, Math.min(85, lat))
  return Math.log(Math.tan(Math.PI / 4 + (clamped * Math.PI) / 360))
}

function boundsFor(mode: 'china' | 'world') {
  return BOUNDS[mode]
}

function fit(width: number, height: number): void {
  const bounds = boundsFor(props.mode)
  const x0 = mercX(bounds.minLng)
  const x1 = mercX(bounds.maxLng)
  const y0 = mercY(bounds.minLat)
  const y1 = mercY(bounds.maxLat)
  const pad = props.mode === 'world' ? 6 : 10

  const spanX = x1 - x0
  const spanY = y1 - y0
  const scale = Math.min((width - pad * 2) / spanX, (height - pad * 2) / spanY)
  transform = {
    scale,
    offsetX: (width - spanX * scale) / 2 - x0 * scale,
    offsetY: (height - spanY * scale) / 2 + y1 * scale,
  }
}

function toScreen(lng: number, lat: number): [number, number] {
  return [
    mercX(lng) * transform.scale + transform.offsetX,
    transform.offsetY - mercY(lat) * transform.scale,
  ]
}

function toRings(geometry: GeoFeature['geometry']): Array<Array<[number, number]>> {
  const convert = (ring: number[][]): Array<[number, number]> =>
    ring.map((point) => [point[0], point[1]] as [number, number])

  if (geometry.type === 'Polygon') {
    return (geometry.coordinates as number[][][]).map(convert)
  }
  return (geometry.coordinates as number[][][][]).flatMap((polygon) => polygon.map(convert))
}

function fillFor(id: string): string {
  const count = props.visits[id] ?? 0
  if (count <= 0) return FILL.unvisited
  if (count === 1) return FILL.once
  if (count <= 3) return FILL.twice
  return FILL.many
}

function draw(): void {
  const el = canvas.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  if (rect.width < 10 || rect.height < 10) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  el.width = Math.round(rect.width * dpr)
  el.height = Math.round(rect.height * dpr)

  const ctx = el.getContext('2d')
  if (!ctx) return

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, rect.width, rect.height)
  fit(rect.width, rect.height)

  for (const feature of features) {
    ctx.beginPath()
    for (const ring of feature.rings) {
      ring.forEach(([lng, lat], index) => {
        const [x, y] = toScreen(lng, lat)
        if (index === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.closePath()
    }
    ctx.fillStyle = fillFor(feature.id)
    ctx.fill('evenodd')
    ctx.lineWidth = props.mode === 'world' ? 0.45 : 0.7
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)'
    ctx.stroke()
  }

  if (props.recent) {
    const recentFeature = features.find((feature) => feature.id === props.recent)
    if (recentFeature?.center) {
      const [x, y] = toScreen(recentFeature.center[0], recentFeature.center[1])
      ctx.beginPath()
      ctx.arc(x, y, 7, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(222, 106, 62, 0.22)'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x, y, 3.2, 0, Math.PI * 2)
      ctx.fillStyle = '#DE6A3E'
      ctx.fill()
    }
  }
}

function hitTest(x: number, y: number): Feature | null {
  for (const feature of features) {
    let inside = false
    for (const ring of feature.rings) {
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
        const [x1, y1] = toScreen(ring[i][0], ring[i][1])
        const [x2, y2] = toScreen(ring[j][0], ring[j][1])
        if ((y1 > y) !== (y2 > y) && x < ((x2 - x1) * (y - y1)) / (y2 - y1) + x1) {
          inside = !inside
        }
      }
    }
    if (inside) return feature
  }

  // 点击容差：找最近的区域中心
  let nearest: Feature | null = null
  let minDistance = props.mode === 'world' ? 12 : 18
  for (const feature of features) {
    if (!feature.center) continue
    const [cx, cy] = toScreen(feature.center[0], feature.center[1])
    const distance = Math.hypot(cx - x, cy - y)
    if (distance < minDistance) {
      minDistance = distance
      nearest = feature
    }
  }
  return nearest
}

function onPointerUp(event: PointerEvent): void {
  const el = canvas.value
  if (!el || status.value !== 'ready') return
  const rect = el.getBoundingClientRect()
  const feature = hitTest(event.clientX - rect.left, event.clientY - rect.top)
  if (feature) emit('select', { id: feature.id, name: feature.name })
}

async function load(): Promise<void> {
  status.value = 'loading'
  features = []
  try {
    const file = props.mode === 'world' ? 'world' : 'china'
    const response = await fetch(`${import.meta.env.BASE_URL}geo/${file}.json`)
    if (!response.ok) throw new Error(String(response.status))

    const data = (await response.json()) as { features: GeoFeature[] }
    features = data.features
      .map((feature) => {
        const rawName = feature.name ?? ''
        const id =
          props.mode === 'world' ? (feature.iso ?? '') : normalizeProvince(rawName)
        return {
          id,
          name: feature.nameZh || rawName || id,
          center: feature.center,
          rings: toRings(feature.geometry),
        }
      })
      .filter((feature) => feature.id && feature.rings.length)

    status.value = 'ready'
    draw()
  } catch (error) {
    console.warn('[map] 地图数据加载失败', error)
    status.value = 'error'
  }
}

onMounted(() => {
  void load()
  observer = new ResizeObserver(() => draw())
  if (root.value) observer.observe(root.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})

watch(
  () => props.mode,
  () => {
    void load()
  },
)

watch(() => [props.visits, props.recent], draw, { deep: true })
</script>

<template>
  <div ref="root" class="map">
    <canvas ref="canvas" class="canvas" @pointerup="onPointerUp" />
    <p v-if="status === 'loading'" class="state">地图加载中…</p>
    <p v-else-if="status === 'error'" class="state">地图加载失败，刷新试试</p>
  </div>
</template>

<style scoped>
.map {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: inherit;
  background:
    radial-gradient(circle at 30% 20%, rgba(228, 237, 232, 0.55), transparent 55%),
    linear-gradient(170deg, #f3edde 0%, #efe6d4 60%, #ece1cc 100%);
}

.canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: manipulation;
}

.state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--muted);
}
</style>
