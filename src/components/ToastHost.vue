<script setup lang="ts">
import { toastState } from '@/lib/toast'
</script>

<template>
  <Transition name="toast">
    <div
      v-if="toastState.visible"
      class="toast"
      :class="{ 'is-accent': toastState.tone === 'accent' }"
      role="status"
    >
      {{ toastState.message }}
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  bottom: calc(env(safe-area-inset-bottom) + var(--tabbar-h) + 20px);
  transform: translateX(-50%);
  max-width: min(80vw, 320px);
  padding: 10px 18px;
  border-radius: var(--r-full);
  background: rgba(30, 33, 31, 0.88);
  color: #f5f2ea;
  font-size: 13px;
  line-height: 1.4;
  text-align: center;
  z-index: 60;
  backdrop-filter: blur(8px);
}

.toast.is-accent {
  background: rgba(222, 106, 62, 0.94);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 6px);
}
</style>
