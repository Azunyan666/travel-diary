<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import EmptyState from '@/components/EmptyState.vue'
import TripCard from '@/components/TripCard.vue'
import { useTripsStore } from '@/stores/trips'

const trips = useTripsStore()
const router = useRouter()

const list = computed(() => trips.ordered)
</script>

<template>
  <main class="page">
    <header class="head">
      <p class="eyebrow">日记</p>
      <h1 class="display">旅行日记</h1>
      <p class="lead">{{ list.length ? `共 ${list.length} 次出发` : '按时间回看每一次出发。' }}</p>
    </header>

    <div v-if="list.length" class="trips">
      <RouterLink v-for="trip in list" :key="trip.id" :to="`/trip/${trip.id}`" class="trip-link">
        <TripCard :trip="trip" />
      </RouterLink>
    </div>

    <EmptyState
      v-else
      icon="book"
      title="还没有旅行"
      desc="每一次出发都值得被记下来：照片、地点，还有当时的那句话。"
    >
      <button class="btn-primary" type="button" @click="router.push('/trip/new')">
        新建一次旅行
      </button>
    </EmptyState>

    <button
      v-if="list.length"
      class="fab"
      type="button"
      aria-label="新建旅行"
      @click="router.push('/trip/new')"
    >
      <AppIcon name="plus" :size="24" />
    </button>
  </main>
</template>

<style scoped>
.trips {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trip-link {
  display: block;
  border-radius: var(--r-lg);
}

.trip-link:active {
  transform: scale(0.99);
}

.fab {
  position: fixed;
  right: max(20px, calc((100vw - var(--page-width)) / 2 + 20px));
  bottom: calc(env(safe-area-inset-bottom) + var(--tabbar-h) + 18px);
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: var(--forest);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 26px rgba(47, 93, 80, 0.32);
  z-index: 30;
  transition: transform 160ms ease, background 160ms ease;
}

.fab:active {
  transform: scale(0.94);
  background: var(--forest-deep);
}
</style>
