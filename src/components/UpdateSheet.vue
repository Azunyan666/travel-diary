<script setup lang="ts">
import { computed } from 'vue'
import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'
import BottomSheet from '@/components/BottomSheet.vue'
import { useUpdateStore } from '@/stores/update'
import { toast } from '@/lib/toast'

const update = useUpdateStore()

const notes = computed(() => (update.info?.notes ?? '').trim())

async function download(): Promise<void> {
  const url = update.info?.url
  if (!url) return

  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url })
  } else {
    window.open(url, '_blank', 'noopener')
  }
  update.close()
  toast('已打开下载页，下载完成后点通知即可安装')
}
</script>

<template>
  <BottomSheet :open="update.sheetOpen" @close="update.close">
    <div class="head">
      <p class="eyebrow">新版本</p>
      <h2 class="title">v{{ update.info?.latest }} 可以更新了</h2>
      <p class="sub">当前版本 v{{ update.current }}</p>
    </div>

    <pre v-if="notes" class="notes">{{ notes }}</pre>

    <div class="actions">
      <button class="ghost" type="button" @click="update.dismiss()">稍后</button>
      <button class="primary" type="button" @click="download">下载更新</button>
    </div>

    <p class="tip">下载完成后在通知栏点安装包，按系统提示覆盖安装即可，本地数据会保留。</p>
  </BottomSheet>
</template>

<style scoped>
.head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
}

.eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--clay);
}

.title {
  margin: 0;
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 600;
  color: var(--ink);
}

.sub {
  font-size: 12px;
  color: var(--muted);
}

.notes {
  margin: 0 0 16px;
  padding: 12px 14px;
  max-height: 180px;
  overflow-y: auto;
  border-radius: var(--r-md);
  background: var(--paper-deep);
  color: var(--body);
  font-family: inherit;
  font-size: 12px;
  line-height: 1.65;
  white-space: pre-wrap;
}

.actions {
  display: flex;
  gap: 10px;
}

.ghost {
  height: 46px;
  padding: 0 20px;
  border-radius: var(--r-full);
  border: 1px solid var(--line-strong);
  background: var(--surface);
  color: var(--body);
  font-size: 14px;
}

.primary {
  flex: 1;
  height: 46px;
  border-radius: var(--r-full);
  background: var(--forest);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.primary:active {
  background: var(--forest-deep);
}

.tip {
  margin-top: 12px;
  font-size: 11px;
  line-height: 1.6;
  color: var(--muted-soft);
}
</style>
