<script setup lang="ts">
defineProps<{ open: boolean }>()

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Transition name="sheet">
    <div v-if="open" class="mask" @click.self="emit('close')">
      <section class="sheet" role="dialog" aria-modal="true">
        <span class="handle" aria-hidden="true" />
        <slot />
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  z-index: 70;
  background: rgba(20, 22, 20, 0.42);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.sheet {
  width: min(100%, var(--page-width));
  max-height: 72vh;
  overflow-y: auto;
  background: var(--paper);
  border-radius: 24px 24px 0 0;
  padding: 8px 20px calc(env(safe-area-inset-bottom) + 20px);
  box-shadow: 0 -8px 30px rgba(31, 36, 33, 0.18);
}

.handle {
  display: block;
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: var(--line-strong);
  margin: 4px auto 14px;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 220ms ease;
}

.sheet-enter-active .sheet,
.sheet-leave-active .sheet {
  transition: transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .sheet,
.sheet-leave-to .sheet {
  transform: translateY(100%);
}
</style>
