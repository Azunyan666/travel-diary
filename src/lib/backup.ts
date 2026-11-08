import type JSZip from 'jszip'
import type { Photo, Trip } from '@/types/models'
import {
  clearAllData,
  getAllPhotos,
  getAllTrips,
  putPhoto,
  putTrip,
  setMeta,
} from '@/lib/db'

/**
 * 备份格式（与 docs/DATA-MODEL.md 一致）
 *
 * manifest.json  { app, schemaVersion, version, exportedAt, trips, photos }
 * trips.json     Trip[]
 * photos.json    PhotoMeta[]（不含 Blob）
 * photos/<id>.<ext>
 * thumbs/<id>.<ext>
 */

const APP_ID = 'xingji'
const BACKUP_SCHEMA = 1

interface Manifest {
  app: string
  schemaVersion: number
  version: string
  exportedAt: string
  trips: number
  photos: number
}

interface PhotoMeta {
  id: string
  tripId: string
  width?: number
  height?: number
  takenAt?: number
  lat?: number
  lng?: number
  place?: string
  caption?: string
  tags: string[]
  createdAt: number
  file: string
  thumb: string
}

export interface ExportResult {
  blob: Blob
  filename: string
  trips: number
  photos: number
}

export interface ImportResult {
  trips: number
  photos: number
  skippedTrips: number
  skippedPhotos: number
}

export type ImportMode = 'merge' | 'replace'

const pad = (n: number): string => (n < 10 ? `0${n}` : String(n))

function stamp(): string {
  const d = new Date()
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`
}

function extFor(blob: Blob | undefined, fallback: string): string {
  if (!blob) return fallback
  if (blob.type.includes('webp')) return 'webp'
  if (blob.type.includes('png')) return 'png'
  return 'jpg'
}

function mimeFor(path: string): string {
  if (path.endsWith('.webp')) return 'image/webp'
  if (path.endsWith('.png')) return 'image/png'
  return 'image/jpeg'
}

function blobFromBytes(bytes: Uint8Array, type: string): Blob {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return new Blob([copy], { type })
}

function toMeta(photo: Photo, file: string, thumb: string): PhotoMeta {
  return {
    id: photo.id,
    tripId: photo.tripId,
    width: photo.width,
    height: photo.height,
    takenAt: photo.takenAt,
    lat: photo.lat,
    lng: photo.lng,
    place: photo.place,
    caption: photo.caption,
    tags: photo.tags ?? [],
    createdAt: photo.createdAt,
    file,
    thumb,
  }
}

/** 打包所有旅行与照片，返回 zip Blob */
export async function exportBackup(
  version: string,
  onProgress?: (done: number, total: number) => void,
): Promise<ExportResult> {
  const { default: JSZipConstructor } = await import('jszip')
  const trips = await getAllTrips()
  const photos = await getAllPhotos()

  const zip = new JSZipConstructor()
  const manifest: Manifest = {
    app: APP_ID,
    schemaVersion: BACKUP_SCHEMA,
    version,
    exportedAt: new Date().toISOString(),
    trips: trips.length,
    photos: photos.length,
  }

  zip.file('manifest.json', JSON.stringify(manifest, null, 2))
  zip.file('trips.json', JSON.stringify(trips, null, 2))

  const metas: PhotoMeta[] = []
  for (let i = 0; i < photos.length; i += 1) {
    const photo = photos[i]
    const file = `photos/${photo.id}.${extFor(photo.image, 'jpg')}`
    const thumb = `thumbs/${photo.id}.${extFor(photo.thumbnail, 'webp')}`
    if (photo.image) zip.file(file, photo.image)
    zip.file(thumb, photo.thumbnail)
    metas.push(toMeta(photo, file, thumb))
    onProgress?.(i + 1, photos.length)
    // 让出主线程，刷新进度
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
  zip.file('photos.json', JSON.stringify(metas, null, 2))

  const blob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
  await setMeta('lastBackupAt', Date.now())
  return { blob, filename: `xingji-backup-${stamp()}.zip`, trips: trips.length, photos: photos.length }
}

/** 从 zip 恢复数据；replace 会先清空本地数据 */
export async function importBackup(
  file: File,
  mode: ImportMode,
  onProgress?: (done: number, total: number) => void,
): Promise<ImportResult> {
  const { default: JSZipConstructor } = await import('jszip')
  let zip: JSZip
  try {
    zip = await JSZipConstructor.loadAsync(file)
  } catch {
    throw new Error('无法读取这个文件，请确认是 zip 备份')
  }

  const manifestFile = zip.file('manifest.json')
  if (!manifestFile) throw new Error('这不是行迹的备份文件')

  let manifest: Manifest
  try {
    manifest = JSON.parse(await manifestFile.async('string')) as Manifest
  } catch {
    throw new Error('备份文件已损坏')
  }

  if (manifest.app !== APP_ID) throw new Error('这不是行迹的备份文件')
  if (typeof manifest.schemaVersion !== 'number' || manifest.schemaVersion > BACKUP_SCHEMA) {
    throw new Error('备份来自更新版本的行迹，请先升级应用')
  }

  const tripsFile = zip.file('trips.json')
  const photosFile = zip.file('photos.json')
  if (!tripsFile || !photosFile) throw new Error('备份文件缺少数据')

  const trips = JSON.parse(await tripsFile.async('string')) as Trip[]
  const metas = JSON.parse(await photosFile.async('string')) as PhotoMeta[]

  if (mode === 'replace') await clearAllData()

  const existingTrips = new Set((await getAllTrips()).map((trip) => trip.id))
  const existingPhotos = new Set((await getAllPhotos()).map((photo) => photo.id))

  let importedTrips = 0
  let skippedTrips = 0
  for (const trip of trips) {
    if (existingTrips.has(trip.id)) {
      skippedTrips += 1
      continue
    }
    await putTrip(trip)
    importedTrips += 1
  }

  let importedPhotos = 0
  let skippedPhotos = 0
  for (let i = 0; i < metas.length; i += 1) {
    const meta = metas[i]
    if (existingPhotos.has(meta.id)) {
      skippedPhotos += 1
      onProgress?.(i + 1, metas.length)
      continue
    }

    const imageEntry = zip.file(meta.file)
    const thumbEntry = zip.file(meta.thumb)
    const image = imageEntry
      ? blobFromBytes(await imageEntry.async('uint8array'), mimeFor(meta.file))
      : undefined
    const thumbnail = thumbEntry
      ? blobFromBytes(await thumbEntry.async('uint8array'), mimeFor(meta.thumb))
      : image

    if (!thumbnail) {
      skippedPhotos += 1
      continue
    }

    await putPhoto({
      id: meta.id,
      tripId: meta.tripId,
      thumbnail,
      image,
      width: meta.width,
      height: meta.height,
      takenAt: meta.takenAt,
      lat: meta.lat,
      lng: meta.lng,
      place: meta.place,
      caption: meta.caption,
      tags: meta.tags ?? [],
      createdAt: meta.createdAt ?? Date.now(),
    })
    importedPhotos += 1
    onProgress?.(i + 1, metas.length)
  }

  return { trips: importedTrips, photos: importedPhotos, skippedTrips, skippedPhotos }
}

/** 下载 Blob 为文件 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}
