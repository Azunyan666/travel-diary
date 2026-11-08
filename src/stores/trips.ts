import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Trip } from '@/types/models'
import { deleteTripCascade, getAllTrips, putTrip } from '@/lib/db'
import { newId } from '@/lib/id'
import { daysBetween } from '@/lib/format'
import { byStartDateDesc } from '@/lib/sort'

export interface TripDraft {
  title: string
  country?: string
  province?: string
  city?: string
  startDate: string
  endDate?: string
  summary?: string
}

export const useTripsStore = defineStore('trips', () => {
  const trips = ref<Trip[]>([])
  const loaded = ref(false)

  /** 按出发日期倒序 */
  const ordered = computed(() => [...trips.value].sort(byStartDateDesc))

  async function init(): Promise<void> {
    if (loaded.value) return
    trips.value = await getAllTrips()
    loaded.value = true
  }

  async function refresh(): Promise<void> {
    trips.value = await getAllTrips()
    loaded.value = true
  }

  function get(id: string): Trip | undefined {
    return trips.value.find((trip) => trip.id === id)
  }

  function days(trip: Trip): number {
    return daysBetween(trip.startDate, trip.endDate)
  }

  async function create(draft: TripDraft): Promise<Trip> {
    const now = Date.now()
    const trip: Trip = {
      id: newId('trip'),
      title: draft.title.trim(),
      country: draft.country?.trim() || undefined,
      province: draft.province?.trim() || undefined,
      city: draft.city?.trim() || undefined,
      startDate: draft.startDate,
      endDate: draft.endDate || draft.startDate,
      summary: draft.summary?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    }
    await putTrip(trip)
    trips.value = [...trips.value, trip]
    return trip
  }

  async function update(id: string, draft: TripDraft): Promise<Trip | undefined> {
    const trip = get(id)
    if (!trip) return undefined
    const next: Trip = {
      ...trip,
      title: draft.title.trim(),
      country: draft.country?.trim() || undefined,
      province: draft.province?.trim() || undefined,
      city: draft.city?.trim() || undefined,
      startDate: draft.startDate,
      endDate: draft.endDate || draft.startDate,
      summary: draft.summary?.trim() || undefined,
      updatedAt: Date.now(),
    }
    await putTrip(next)
    trips.value = trips.value.map((item) => (item.id === id ? next : item))
    return next
  }

  async function remove(id: string): Promise<void> {
    await deleteTripCascade(id)
    trips.value = trips.value.filter((trip) => trip.id !== id)
  }

  return { trips, loaded, ordered, init, refresh, get, days, create, update, remove }
})
