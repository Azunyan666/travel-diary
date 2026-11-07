<script setup lang="ts">
import { computed } from 'vue'
import type { Photo } from '@/types/models'
import { useObjectUrl } from '@/lib/useObjectUrl'
import { fmtStamp } from '@/lib/format'
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps<{ photo: Photo }>()
const emit = defineEmits<{ close: [] }>()

const blob = computed(() => props.photo.image ?? props.photo.thumbnail)
const url = useObjectUrl(() => blob.value)
const dateText = computed(() => fmtStamp(props.photo.takenAt))
</script>

<template>
  <div class="lightbox" role="dialog" aria-modal="true" @click="emit('close')">
    <button class="close" type="button" aria-label="关闭" @click.stop="emit('close')">
      <AppIcon name="close" :size="20" />
    </button>

    <div class="stage" @click.stop>
      <img v-if="url" :src="url" alt="" />
    </div>

    <footer class="meta" @click.stop>
      <p v-if="dateText" class="date">{{ dateText }}</p>
      <p v-if="photo.place" class="place">{{ photo.place }}</p>
      <p v-if="photo.caption" class="caption">{{ photo.caption }}</p>
    </footer>
  </div>
</template>

<style scoped>
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(20, 22, 20, 0.96);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: calc(env(safe-area-inset-top) + 56px) 0 calc(env(safe-area-inset-bottom) + 20px);
}

.close {
  position: absolute;
  top: calc(env(safe-area-inset-top) + 14px);
  right: 16px;
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
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.stage img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.meta {
  width: 100%;
  padding: 14px 20px 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #f5f2ea;
}

.date,
.place {
  font-size: 12px;
  color: rgba(245, 242, 234, 0.62);
}

.caption {
  margin-top: 4px;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>
