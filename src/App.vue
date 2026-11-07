<script setup lang="ts">
import TabBar from '@/components/TabBar.vue'
import ToastHost from '@/components/ToastHost.vue'
</script>

<template>
  <div class="app-shell">
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>

    <TabBar />
    <ToastHost />
  </div>
</template>
