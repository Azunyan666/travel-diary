import exifr from 'exifr'

export interface PhotoExif {
  /** 拍摄时间（毫秒） */
  takenAt?: number
  lat?: number
  lng?: number
}

/** 读取照片的拍摄时间与 GPS；失败不抛错，返回空对象 */
export async function readExif(file: Blob): Promise<PhotoExif> {
  try {
    const data = (await exifr.parse(file, { gps: true })) as Record<string, unknown> | undefined
    if (!data) return {}

    const rawDate = data.DateTimeOriginal ?? data.CreateDate ?? data.ModifyDate
    const lat = data.latitude
    const lng = data.longitude

    return {
      takenAt: rawDate instanceof Date && !Number.isNaN(rawDate.getTime()) ? rawDate.getTime() : undefined,
      lat: typeof lat === 'number' && Number.isFinite(lat) ? lat : undefined,
      lng: typeof lng === 'number' && Number.isFinite(lng) ? lng : undefined,
    }
  } catch {
    return {}
  }
}
