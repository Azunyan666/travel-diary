<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Photo } from '@/types/models'
import { usePhotosStore } from '@/stores/photos'
import { useObjectUrl } from '@/lib/useObjectUrl'
import { fmtStamp } from '@/lib/format'
import { toast } from '@/lib/toast'
import { registerBackGuard } from '@/lib/backGuard'
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps<{
  photos: Photo[]
  startIndex: number
}>()

const emit = defineEmits<{ close: [] }>()

const store = usePhotosStore()
const index = ref(props.startIndex)

const current = computed<Photo | null>(() => props.photos[index.value] ?? null)
const blob = computed(() => current.value?.image ?? current.value?.thumbnail)
const url = useObjectUrl(() => blob.value)
const dateText = computed(() => fmtStamp(current.value?.takenAt))
const placeText = computed(() => current.value?.place ?? '')

const caption = ref('')
const tags = ref<string[]>([])
const TAGS = ['灵感', '趣事', '风景', '美食', '人物']

watch(
  current,
  (photo) => {
    caption.value = photo?.caption ?? ''
    tags.value = [...(photo?.tags ?? [])]
  },
  { immediate: true },
)

watch(
  () => props.photos.length,
  (length) => {
    if (!length) {
      emit('close')
      return
    }
    if (index.value > length - 1) index.value = length - 1
  },
)

function prev(): void {
  if (!props.photos.length) return
  index.value = (index.value - 1 + props.photos.length) % props.photos.length
}

function next(): void {
  if (!props.photos.length) return
  index.value = (index.value + 1) % props.photos.length
}

let touchX = 0
let touchY = 0

function onTouchStart(event: TouchEvent): void {
  const touch = event.touches[0]
  touchX = touch.clientX
  touchY = touch.clientY
}

function onTouchEnd(event: TouchEvent): void {
  const touch = event.changedTouches[0]
  const dx = touch.clientX - touchX
  const dy = touch.clientY - touchY
  if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return
  if (dx < 0) next()
  else prev()
}

function onKey(event: KeyboardEvent): void {
  if (event.key === 'ArrowLeft') prev()
  else if (event.key === 'ArrowRight') next()
  else if (event.key === 'Escape') emit('close')
}

let unregisterBack: (() => void) | null = null

onMounted(() => {
  window.addEventListener('keydown', onKey)
  unregisterBack = registerBackGuard(() => {
    emit('close')
    return true
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  unregisterBack?.()
  unregisterBack = null
})

function toggleTag(tag: string): void {
  const i = tags.value.indexOf(tag)
  if (i > -1) tags.value.splice(i, 1)
  else tags.value.push(tag)
}

async function save(): Promise<void> {
  if (!current.value) return
  await store.updatePhoto(current.value.id, {
    caption: caption.value.trim(),
    tags: [...tags.value],
  })
  toast('已保存')
}

async function removePhoto(): Promise<void> {
  if (!current.value) return
  if (!window.confirm('删除这张照片？')) return
  await store.remove(current.value.id)
  toast('已删除')
}
</script>

<template>
  <div class="viewer" @touchstart.passive="onTouchStart" @touchend="onTouchEnd">
    <header class="top">
      <span class="counter">{{ index + 1 }} / {{ photos.length }}</span>
      <button class="close" type="button" aria-label="关闭" @click="emit('close')">
        <AppIcon name="close" :size="20" />
      </button>
    </header>

    <div class="stage">
      <Transition name="shot" mode="out-in">
        <img v-if="url" :key="current?.id" :src="url" alt="" />
      </Transition>
    </div>

    <section class="sheet" @touchstart.stop @touchend.stop>
      <p class="meta">
        <span v-if="dateText">{{ dateText }}</span>
        <span v-if="placeText" class="sep">·</span>
        <span v-if="placeText">{{ placeText }}</span>
        <span v-if="!dateText && !placeText">这张照片还没有时间和地点</span>
      </p>

      <textarea
        v-model="caption"
        class="caption"
        rows="3"
        placeholder="写下这张照片的故事…"
      />

      <div class="tags">
        <button
          v-for="tag in TAGS"
          :key="tag"
          class="tag-btn"
          :class="{ 'is-on': tags.includes(tag) }"
          type="button"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </button>
      </div>

      <div class="actions">
        <button class="del" type="button" @click="removePhoto">
          <AppIcon name="trash" :size="15" />
          删除
        </button>
        <button class="save" type="button" @click="save">保存</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.viewer {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: #141614;
  display: flex;
  flex-direction: column;
}

.top {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: calc(env(safe-area-inset-top) + 12px) 16px 8px;
}

.counter {
  font-size: 12px;
  color: rgba(245, 242, 234, 0.7);
  font-variant-numeric: tabular-nums;
}

.close {
  position: absolute;
  right: 16px;
  top: calc(env(safe-area-inset-top) + 8px);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: #f5f2ea;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stage {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
}

.stage img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 6px;
}

.sheet {
  background: var(--paper);
  border-radius: 24px 24px 0 0;
  padding: 18px 20px calc(env(safe-area-inset-bottom) + 16px);
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 52vh;
  overflow-y: auto;
}

.meta {
  font-size: 11px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.sep {
  margin: 0 6px;
  color: var(--line-strong);
}

.caption {
  width: 100%;
  min-height: 74px;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--surface);
  color: var(--ink);
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  outline: none;
}

.caption:focus {
  border-color: var(--forest);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-btn {
  padding: 6px 12px;
  border-radius: var(--r-full);
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--body);
  font-size: 12px;
}

.tag-btn.is-on {
  background: var(--forest);
  border-color: var(--forest);
  color: #fff;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 2px;
}

.del {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 44px;
  padding: 0 14px;
  color: var(--danger);
  font-size: 13px;
}

.save {
  flex: 1;
  height: 44px;
  border-radius: var(--r-full);
  background: var(--forest);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
}

.save:active {
  background: var(--forest-deep);
}

.shot-enter-active,
.shot-leave-active {
  transition: opacity 200ms ease;
}

.shot-enter-from,
.shot-leave-to {
  opacity: 0;
}
</style>
