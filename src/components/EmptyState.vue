<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import type { IconName } from '@/types/icons'

withDefaults(
  defineProps<{
    icon: IconName
    title: string
    desc?: string
  }>(),
  { desc: '' },
)
</script>

<template>
  <section class="empty">
    <span class="badge">
      <AppIcon :name="icon" :size="26" />
    </span>
    <p class="title">{{ title }}</p>
    <p v-if="desc" class="desc">{{ desc }}</p>
    <div v-if="$slots.default" class="action">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 56px 16px 40px;
  gap: 10px;
}

.badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--forest-soft);
  color: var(--forest);
  margin-bottom: 6px;
}

.title {
  font-family: var(--serif);
  font-size: 18px;
  font-weight: 600;
  color: var(--ink);
}

.desc {
  max-width: 260px;
  font-size: 13px;
  line-height: 1.65;
  color: var(--muted);
}

.action {
  margin-top: 18px;
}
</style>
