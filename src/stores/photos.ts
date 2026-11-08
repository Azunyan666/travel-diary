import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Photo } from '@/types/models'
import { deletePhoto, getAllPhotos, putPhoto } from '@/lib/db'
import { newId } from '@/lib/id'
import { processImage } from '@/lib/image'
import { readExif } from '@/lib/exif'

export interface ImportProgress {
  done: number
  total: number
}

export interface ImportResult {
  added: number
  failed: number
}

function sortByTime(list: Photo[]): Photo[] {
  return [...list].sort((a, b) => (a.takenAt ?? a.createdAt) - (b.takenAt ?? b.createdAt))
}

export const usePhotosStore = defineStore('photos', () => {
  const photos = ref<Photo[]>([])
  const loaded = ref(false)
  const importing = ref(false)

  async function init(): Promise<void> {
    if (loaded.value) return
    photos.value = await getAllPhotos()
    loaded.value = true
  }

  async function refresh(): Promise<void> {
    photos.value = await getAllPhotos()
    loaded.value = true
  }

  function forTrip(tripId: string): Photo[] {
    return sortByTime(photos.value.filter((photo) => photo.tripId === tripId))
  }

  function countForTrip(tripId: string): number {
    return photos.value.reduce((n, photo) => (photo.tripId === tripId ? n + 1 : n), 0)
  }

  function coverForTrip(tripId: string): Blob | undefined {
    return forTrip(tripId)[0]?.thumbnail
  }

  /** 最近一张照片的时间，用于相册排序 */
  function ordered(): Photo[] {
    return [...photos.value].sort(
      (a, b) => (b.takenAt ?? b.createdAt) - (a.takenAt ?? a.createdAt),
    )
  }

  async function importFiles(
    tripId: string,
    files: File[],
    onProgress?: (progress: ImportProgress) => void,
  ): Promise<ImportResult> {
    const accepted = files.filter(
      (file) =>
        file.type.startsWith('image/') || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name),
    )
    if (!accepted.length) return { added: 0, failed: 0 }

    importing.value = true
    let added = 0
    let failed = 0

    for (let index = 0; index < accepted.length; index += 1) {
      const file = accepted[index]
      try {
        const [exif, processed] = await Promise.all([readExif(file), processImage(file)])
        const photo: Photo = {
          id: newId('photo'),
          tripId,
          thumbnail: processed.thumb,
          image: processed.full,
          width: processed.width,
          height: processed.height,
          takenAt: exif.takenAt ?? (file.lastModified || Date.now()),
          lat: exif.lat,
          lng: exif.lng,
          caption: '',
          tags: [],
          createdAt: Date.now(),
        }
        await putPhoto(photo)
        photos.value = [...photos.value, photo]
        added += 1
      } catch (error) {
        failed += 1
        console.warn('[photos] 导入失败：', file.name, error)
      }
      onProgress?.({ done: index + 1, total: accepted.length })
    }

    importing.value = false
    return { added, failed }
  }

  async function updatePhoto(id: string, patch: Partial<Photo>): Promise<Photo | undefined> {
    const photo = photos.value.find((item) => item.id === id)
    if (!photo) return undefined
    const next: Photo = { ...photo, ...patch }
    await putPhoto(next)
    photos.value = photos.value.map((item) => (item.id === id ? next : item))
    return next
  }

  async function updateCaption(id: string, caption: string): Promise<void> {
    await updatePhoto(id, { caption })
  }

  async function remove(id: string): Promise<void> {
    await deletePhoto(id)
    photos.value = photos.value.filter((photo) => photo.id !== id)
  }

  return {
    photos,
    loaded,
    importing,
    init,
    refresh,
    forTrip,
    countForTrip,
    coverForTrip,
    ordered,
    importFiles,
    updatePhoto,
    updateCaption,
    remove,
  }
})
