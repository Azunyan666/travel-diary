import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Photo, Trip } from '@/types/models'

/**
 * IndexedDB 封装
 * 数据库结构变更时递增 DB_VERSION，并在 upgrade 里写迁移。
 */

const DB_NAME = 'xingji'
const DB_VERSION = 1

interface XingjiDB extends DBSchema {
  trips: {
    key: string
    value: Trip
    indexes: { 'by-start': string }
  }
  photos: {
    key: string
    value: Photo
    indexes: { 'by-trip': string; 'by-taken': number }
  }
  meta: {
    key: string
    value: unknown
  }
}

let dbPromise: Promise<IDBPDatabase<XingjiDB>> | null = null

function getDB(): Promise<IDBPDatabase<XingjiDB>> {
  if (!dbPromise) {
    dbPromise = openDB<XingjiDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('trips')) {
          const trips = db.createObjectStore('trips', { keyPath: 'id' })
          trips.createIndex('by-start', 'startDate')
        }
        if (!db.objectStoreNames.contains('photos')) {
          const photos = db.createObjectStore('photos', { keyPath: 'id' })
          photos.createIndex('by-trip', 'tripId')
          photos.createIndex('by-taken', 'takenAt')
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta')
        }
      },
    })
  }
  return dbPromise
}

/* ---------- 行程 ---------- */

export async function getAllTrips(): Promise<Trip[]> {
  const db = await getDB()
  return db.getAll('trips')
}

export async function putTrip(trip: Trip): Promise<void> {
  const db = await getDB()
  await db.put('trips', trip)
}

export async function deleteTripCascade(tripId: string): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['trips', 'photos'], 'readwrite')
  await tx.objectStore('trips').delete(tripId)
  const index = tx.objectStore('photos').index('by-trip')
  let cursor = await index.openCursor(tripId)
  while (cursor) {
    await cursor.delete()
    cursor = await cursor.continue()
  }
  await tx.done
}

/* ---------- 照片 ---------- */

export async function getAllPhotos(): Promise<Photo[]> {
  const db = await getDB()
  return db.getAll('photos')
}

export async function getPhotosByTrip(tripId: string): Promise<Photo[]> {
  const db = await getDB()
  return db.getAllFromIndex('photos', 'by-trip', tripId)
}

export async function putPhoto(photo: Photo): Promise<void> {
  const db = await getDB()
  await db.put('photos', photo)
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('photos', id)
}

/* ---------- meta ---------- */

export async function getMeta<T>(key: string): Promise<T | undefined> {
  const db = await getDB()
  return db.get('meta', key) as Promise<T | undefined>
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  const db = await getDB()
  await db.put('meta', value, key)
}

/* ---------- 维护 ---------- */

/** 清空所有旅行与照片（覆盖导入前使用） */
export async function clearAllData(): Promise<void> {
  const db = await getDB()
  await db.clear('trips')
  await db.clear('photos')
}
