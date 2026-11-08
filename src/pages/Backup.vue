<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppBar from '@/components/AppBar.vue'
import AppIcon from '@/components/AppIcon.vue'
import { useTripsStore } from '@/stores/trips'
import { usePhotosStore } from '@/stores/photos'
import { downloadBlob, exportBackup, importBackup, type ImportMode } from '@/lib/backup'
import { getMeta } from '@/lib/db'
import { APP_VERSION } from '@/lib/version'
import { fmtStamp } from '@/lib/format'
import { toast } from '@/lib/toast'

const router = useRouter()
const trips = useTripsStore()
const photos = usePhotosStore()

const busy = ref(false)
const progress = ref<{ label: string; done: number; total: number } | null>(null)
const lastBackupAt = ref<number | undefined>()
const usage = ref<number | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const mode = ref<ImportMode>('merge')

function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

const sizeText = computed(() => (usage.value !== null ? fmtBytes(usage.value) : '—'))
const lastText = computed(() => (lastBackupAt.value ? fmtStamp(lastBackupAt.value) : '还没有备份过'))
const percent = computed(() => {
  const p = progress.value
  if (!p || !p.total) return 0
  return Math.round((p.done / p.total) * 100)
})

async function refreshMeta(): Promise<void> {
  lastBackupAt.value = await getMeta<number>('lastBackupAt')
  if (navigator.storage?.estimate) {
    const { usage: used = 0 } = await navigator.storage.estimate()
    usage.value = used
  }
}

onMounted(async () => {
  await trips.init()
  await photos.init()
  await refreshMeta()
})

async function doExport(): Promise<void> {
  if (busy.value) return
  busy.value = true
  progress.value = { label: '正在打包', done: 0, total: photos.photos.length }
  try {
    const result = await exportBackup(APP_VERSION, (done, total) => {
      progress.value = { label: '正在打包', done, total }
    })
    downloadBlob(result.blob, result.filename)
    lastBackupAt.value = Date.now()
    toast(`已导出 ${result.trips} 次旅行、${result.photos} 张照片`)
  } catch (error) {
    toast(error instanceof Error ? error.message : '导出失败', 'accent')
  } finally {
    busy.value = false
    progress.value = null
  }
}

function pick(importMode: ImportMode): void {
  if (busy.value) return
  mode.value = importMode
  fileInput.value?.click()
}

async function onFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  if (mode.value === 'replace') {
    const ok = window.confirm('覆盖导入会先清空当前所有旅行和照片，确定继续？')
    if (!ok) return
  }

  busy.value = true
  progress.value = { label: '正在恢复', done: 0, total: 0 }
  try {
    const result = await importBackup(file, mode.value, (done, total) => {
      progress.value = { label: '正在恢复', done, total }
    })
    await trips.refresh()
    await photos.refresh()
    await refreshMeta()
    toast(`已恢复 ${result.trips} 次旅行、${result.photos} 张照片`)
    router.push('/')
  } catch (error) {
    toast(error instanceof Error ? error.message : '导入失败', 'accent')
  } finally {
    busy.value = false
    progress.value = null
  }
}
</script>

<template>
  <div class="page backup">
    <AppBar title="数据备份" />

    <header class="head">
      <p class="eyebrow">本地优先</p>
      <h1 class="display">别把旅行弄丢了</h1>
      <p class="lead">所有数据只存在这台设备。清理浏览器、换手机都可能丢失，导出备份最稳妥。</p>
    </header>

    <section class="summary card">
      <div class="summary-item">
        <span class="summary-value">{{ trips.trips.length }}</span>
        <span class="summary-label">次旅行</span>
      </div>
      <div class="summary-item">
        <span class="summary-value">{{ photos.photos.length }}</span>
        <span class="summary-label">张照片</span>
      </div>
      <div class="summary-item">
        <span class="summary-value">{{ sizeText }}</span>
        <span class="summary-label">占用空间</span>
      </div>
    </section>

    <p class="last">上次备份：{{ lastText }}</p>

    <section class="block card">
      <div class="block-head">
        <span class="block-icon"><AppIcon name="download" :size="18" /></span>
        <div class="block-text">
          <p class="block-title">导出备份</p>
          <p class="block-desc">一个 zip：旅行信息、原图、缩略图，换台设备导入即可恢复。</p>
        </div>
      </div>
      <button class="btn-primary" type="button" :disabled="busy" @click="doExport">
        {{ busy && progress?.label === '正在打包' ? '打包中…' : '导出 zip 备份' }}
      </button>
    </section>

    <section class="block card">
      <div class="block-head">
        <span class="block-icon is-clay"><AppIcon name="image" :size="18" /></span>
        <div class="block-text">
          <p class="block-title">从备份恢复</p>
          <p class="block-desc">合并会保留现有数据；覆盖会先清空，再导入备份里的内容。</p>
        </div>
      </div>
      <div class="actions">
        <button class="btn-secondary" type="button" :disabled="busy" @click="pick('merge')">
          合并导入
        </button>
        <button class="btn-secondary is-danger" type="button" :disabled="busy" @click="pick('replace')">
          覆盖导入
        </button>
      </div>
      <input
        ref="fileInput"
        class="hidden-input"
        type="file"
        accept=".zip,application/zip"
        @change="onFile"
      />
    </section>

    <Transition name="toast">
      <div v-if="progress" class="progress">
        <div class="progress-track">
          <div class="progress-bar" :style="{ width: `${percent}%` }" />
        </div>
        <span class="progress-text">
          {{ progress.label }} {{ progress.done }} / {{ progress.total || '…' }}
        </span>
      </div>
    </Transition>

    <ul class="tips">
      <li>备份文件只在本机生成，不会上传到任何服务器。</li>
      <li>iPhone 上导出的 zip 会存到「文件」App，可再转存到网盘。</li>
      <li>建议在每次旅行结束、或照片超过 30 张时导出一次。</li>
    </ul>
  </div>
</template>

<style scoped>
.backup {
  padding-bottom: calc(env(safe-area-inset-bottom) + 40px);
}

.head {
  padding: 8px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.display {
  font-size: 26px;
}

.summary {
  margin: 18px 20px 0;
  display: flex;
  padding: 16px 8px;
}

.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.summary-item + .summary-item {
  border-left: 1px solid var(--line);
}

.summary-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.summary-label {
  font-size: 11px;
  color: var(--muted);
}

.last {
  margin: 10px 20px 0;
  font-size: 11px;
  color: var(--muted);
}

.block {
  margin: 14px 20px 0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.block-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.block-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--r-sm);
  background: var(--forest-soft);
  color: var(--forest);
  flex: none;
}

.block-icon.is-clay {
  background: var(--clay-soft);
  color: var(--clay);
}

.block-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.block-title {
  font-family: var(--serif);
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
}

.block-desc {
  font-size: 12px;
  line-height: 1.6;
  color: var(--muted);
}

.actions {
  display: flex;
  gap: 10px;
}

.btn-secondary {
  flex: 1;
  height: 46px;
  border-radius: var(--r-full);
  border: 1px solid var(--line-strong);
  background: var(--surface);
  color: var(--ink);
  font-size: 14px;
  font-weight: 600;
}

.btn-secondary.is-danger {
  color: var(--danger);
  border-color: rgba(201, 79, 61, 0.35);
}

.btn-secondary:disabled,
.btn-primary:disabled {
  opacity: 0.6;
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

.tips {
  margin: 20px 20px 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tips li {
  font-size: 11px;
  line-height: 1.6;
  color: var(--muted-soft);
}

.tips li::before {
  content: '·';
  margin-right: 6px;
}
</style>
