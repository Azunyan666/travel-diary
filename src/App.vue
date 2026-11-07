<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TabBar from '@/components/TabBar.vue'
import ToastHost from '@/components/ToastHost.vue'
import { useTripsStore } from '@/stores/trips'
import { usePhotosStore } from '@/stores/photos'

const route = useRoute()
const trips = useTripsStore()
const photos = usePhotosStore()

onMounted(() => {
  void trips.init()
  void photos.init()
  // 申请持久化存储，降低浏览器回收数据的概率
  void navigator.storage?.persist?.()
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
