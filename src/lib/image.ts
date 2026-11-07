/** 照片处理：解码、缩放、压缩、生成缩略图。全部在本地完成。 */

const FULL_MAX = 2048
const THUMB_MAX = 480
const FULL_QUALITY = 0.85
const THUMB_QUALITY = 0.72

export interface ProcessedImage {
  full: Blob
  thumb: Blob
  width: number
  height: number
}

type Decoded = ImageBitmap | HTMLImageElement

function sizeOf(src: Decoded): { width: number; height: number } {
  if ('naturalWidth' in src) return { width: src.naturalWidth, height: src.naturalHeight }
  return { width: src.width, height: src.height }
}

let webpSupport: boolean | null = null

function supportsWebp(): boolean {
  if (webpSupport !== null) return webpSupport
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  webpSupport = canvas.toDataURL('image/webp').startsWith('data:image/webp')
  return webpSupport
}

async function decode(file: File): Promise<Decoded> {
  if (typeof createImageBitmap === 'function') {
    try {
      // 现代浏览器会顺手把 EXIF 方向应用上去
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      // Safari 旧版本、HEIC 等，退回 <img> 解码
    }
  }

  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('浏览器无法解码这张照片'))
    }
    img.src = url
  })
}

function render(src: Decoded, max: number, quality: number, type: string): Promise<Blob> {
  const { width, height } = sizeOf(src)
  const ratio = Math.min(1, max / Math.max(width, height))
  const w = Math.max(1, Math.round(width * ratio))
  const h = Math.max(1, Math.round(height * ratio))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建绘图上下文')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(src as CanvasImageSource, 0, 0, w, h)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('图片压缩失败'))),
      type,
      quality,
    )
  })
}

/** 处理一张照片：原图压到 2048px JPEG，缩略图 480px */
export async function processImage(file: File): Promise<ProcessedImage> {
  const decoded = await decode(file)
  try {
    const { width, height } = sizeOf(decoded)
    const full = await render(decoded, FULL_MAX, FULL_QUALITY, 'image/jpeg')
    const thumb = await render(
      decoded,
      THUMB_MAX,
      THUMB_QUALITY,
      supportsWebp() ? 'image/webp' : 'image/jpeg',
    )
    return { full, thumb, width, height }
  } finally {
    if ('close' in decoded) decoded.close()
  }
}
