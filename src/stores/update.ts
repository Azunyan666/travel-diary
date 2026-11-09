import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { APP_VERSION } from '@/lib/version'
import { fetchLatestUpdate, type UpdateInfo } from '@/lib/update'

const CHECK_INTERVAL = 6 * 3600 * 1000

export const useUpdateStore = defineStore('update', () => {
  const info = ref<UpdateInfo | null>(null)
  const checking = ref(false)
  const sheetOpen = ref(false)
  const dismissed = ref(localStorage.getItem('xingji.update.dismissed') ?? '')

  const available = computed(() => Boolean(info.value && info.value.latest !== dismissed.value))

  async function check(force = false): Promise<void> {
    if (checking.value) return
    if (!force) {
      const last = Number(localStorage.getItem('xingji.update.checkedAt') ?? 0)
      if (Date.now() - last < CHECK_INTERVAL) return
    }

    checking.value = true
    try {
      info.value = await fetchLatestUpdate()
      localStorage.setItem('xingji.update.checkedAt', String(Date.now()))
    } finally {
      checking.value = false
    }
  }

  function open(): void {
    sheetOpen.value = true
  }

  function close(): void {
    sheetOpen.value = false
  }

  function dismiss(): void {
    if (info.value) {
      dismissed.value = info.value.latest
      localStorage.setItem('xingji.update.dismissed', info.value.latest)
    }
    sheetOpen.value = false
  }

  return {
    info,
    checking,
    sheetOpen,
    available,
    current: APP_VERSION,
    check,
    open,
    close,
    dismiss,
  }
})
