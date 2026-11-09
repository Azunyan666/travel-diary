<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import { App as NativeApp } from '@capacitor/app'
import type { PluginListenerHandle } from '@capacitor/core'
import TabBar from '@/components/TabBar.vue'
import ToastHost from '@/components/ToastHost.vue'
import { useTripsStore } from '@/stores/trips'
import { usePhotosStore } from '@/stores/photos'

const route = useRoute()
const router = useRouter()
const trips = useTripsStore()
const photos = usePhotosStore()

let backHandle: PluginListenerHandle | null = null

onMounted(async () => {
  void trips.init()
  void photos.init()
  // 申请持久化存储，降低浏览器回收数据的概率
  void navigator.storage?.persist?.()

  if (!Capacitor.isNativePlatform()) return

  // Android 原生返回键：接管路由返回，而不是直接退出接 Activity
  backHandle = await NativeApp.addListener('backButton', () => {
    const current = router.currentRoute.value

    if (!current.meta.tab) {
      // 子页面：有历史就回上一页，没有就回首页
      if (window.history.state?.back) router.back()
      else void router.replace('/')
      return
    }

    // Tab 页：不在「足迹」时回足迹，在足迹时退出 App
    if (current.name !== 'home') void router.replace('/')
    else void NativeApp.exitApp()
  })
})

onBeforeUnmount(async () => {
  await backHandle?.remove()
  backHandle = null
})
</script>

<template>
  <div class="app-shell">
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>

    <TabBar v-if="route.meta.tab" />
    <ToastHost />
  </div>
</template>
