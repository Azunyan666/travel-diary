/**
 * 行迹的数据模型
 * 与 docs/DATA-MODEL.md 保持一致；字段名一旦发布就不要改，只能新增。
 */

/** 一次旅行 */
export interface Trip {
  id: string
  title: string
  /** 目的地：国家 / 省份 / 城市，用于点亮地图 */
  country?: string
  province?: string
  city?: string
  /** YYYY-MM-DD */
  startDate: string
  /** YYYY-MM-DD，可选；单日行程可与 startDate 相同 */
  endDate?: string
  coverPhotoId?: string
  summary?: string
  createdAt: number
  updatedAt: number
}

/** 一张照片，以及它在日记里的那句话 */
export interface Photo {
  id: string
  tripId: string
  /** 缩略图（约 400px，列表用） */
  thumbnail: Blob
  /** 原图，详情页按需加载 */
  image?: Blob
  /** 拍摄时间（毫秒），来自 EXIF 或文件时间 */
  takenAt?: number
  lat?: number
  lng?: number
  /** 地点文案，如「大理 · 才村码头」 */
  place?: string
  /** 照片下的标注正文 */
  caption?: string
  tags: string[]
  createdAt: number
}

/** 地图上的区域（省 / 国家） */
export type RegionKind = 'province' | 'country'

/** 由旅行聚合出来的点亮状态，不单独存储 */
export interface RegionVisit {
  code: string
  kind: RegionKind
  name: string
  count: number
  firstVisit?: string
  lastVisit?: string
}
