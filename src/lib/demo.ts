import type { Photo, Trip } from '@/types/models'
import { getAllPhotos, getAllTrips, putPhoto, putTrip } from '@/lib/db'

/** 示例数据：3 次旅行、7 张照片，全部在本地生成，不依赖网络 */

interface DemoPhoto {
  caption: string
  tags: string[]
  place: string
  day: number
  hour: number
}

interface DemoPlan {
  trip: Trip
  photos: DemoPhoto[]
}

const DEMO_TRIPS: DemoPlan[] = [
  {
    trip: {
      id: 'demo-yunnan',
      title: '云南 · 洱海环湖',
      country: '中国',
      province: '云南',
      city: '大理',
      startDate: '2026-10-02',
      endDate: '2026-10-06',
      summary: '五天不赶路，把环海路骑成一条慢慢展开的线。',
      createdAt: Date.parse('2026-10-01T09:00:00'),
      updatedAt: Date.parse('2026-10-06T20:00:00'),
    },
    photos: [
      {
        caption: '风比照片里看起来大，骑车到才村时差点被吹回古城。',
        tags: ['趣事'],
        place: '才村码头',
        day: 1,
        hour: 13,
      },
      {
        caption: '日出前十分钟，水面一直是灰的，忽然整片湖就亮了。',
        tags: ['灵感', '风景'],
        place: '双廊观景台',
        day: 2,
        hour: 7,
      },
      {
        caption: '喜洲的扎染晒在院子里，蓝得比天空还深。',
        tags: ['风景', '人物'],
        place: '喜洲古镇',
        day: 3,
        hour: 10,
      },
    ],
  },
  {
    trip: {
      id: 'demo-sichuan',
      title: '成都 · 慢慢吃',
      country: '中国',
      province: '四川',
      city: '成都',
      startDate: '2026-08-15',
      endDate: '2026-08-17',
      summary: '没有行程表，走到哪吃到哪。',
      createdAt: Date.parse('2026-08-15T08:00:00'),
      updatedAt: Date.parse('2026-08-17T21:00:00'),
    },
    photos: [
      {
        caption: '人民公园的鹤鸣茶社，一杯盖碗茶能坐一下午。',
        tags: ['人物'],
        place: '人民公园',
        day: 1,
        hour: 15,
      },
      {
        caption: '在建设路排了四十分钟的队，值。',
        tags: ['美食'],
        place: '建设路',
        day: 2,
        hour: 19,
      },
    ],
  },
  {
    trip: {
      id: 'demo-fujian',
      title: '泉州 · 古城慢走',
      country: '中国',
      province: '福建',
      city: '泉州',
      startDate: '2026-05-01',
      endDate: '2026-05-03',
      summary: '半座世遗城，和一条吃不完的老街。',
      createdAt: Date.parse('2026-05-01T09:30:00'),
      updatedAt: Date.parse('2026-05-03T19:00:00'),
    },
    photos: [
      {
        caption: '开元寺的东西塔，早上逆光，人少得像另一个城市。',
        tags: ['风景'],
        place: '西街',
        day: 1,
        hour: 9,
      },
      {
        caption: '蟳埔村的海风吹了一下午，簪花围比想象中重。',
        tags: ['人物', '趣事'],
        place: '蟳埔村',
        day: 2,
        hour: 16,
      },
    ],
  },
]

function paint(seed: number, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  const hue = (seed * 53) % 360
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, `hsl(${hue}, 42%, 76%)`)
  gradient.addColorStop(0.55, `hsl(${(hue + 25) % 360}, 32%, 58%)`)
  gradient.addColorStop(1, `hsl(${(hue + 50) % 360}, 30%, 38%)`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.globalAlpha = 0.24
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(width * 0.3, height * 0.32, Math.min(width, height) * 0.2, 0, Math.PI * 2)
  ctx.fill()

  ctx.globalAlpha = 0.55
  ctx.fillStyle = '#2f5d50'
  ctx.beginPath()
  ctx.moveTo(0, height * 0.82)
  ctx.lineTo(width * 0.35, height * 0.6)
  ctx.lineTo(width * 0.62, height * 0.78)
  ctx.lineTo(width, height * 0.58)
  ctx.lineTo(width, height)
  ctx.lineTo(0, height)
  ctx.closePath()
  ctx.fill()

  ctx.globalAlpha = 0.18
  ctx.fillStyle = '#de6a3e'
  ctx.beginPath()
  ctx.arc(width * 0.74, height * 0.26, Math.min(width, height) * 0.09, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  return canvas
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('示例图片生成失败'))),
      type,
      quality,
    )
  })
}

async function makePhoto(seed: number): Promise<{ image: Blob; thumb: Blob; width: number; height: number }> {
  const width = 1200
  const height = 900
  const canvas = paint(seed, width, height)
  const image = await toBlob(canvas, 'image/jpeg', 0.85)

  const thumbCanvas = document.createElement('canvas')
  thumbCanvas.width = 480
  thumbCanvas.height = 360
  const ctx = thumbCanvas.getContext('2d')
  ctx?.drawImage(canvas, 0, 0, 480, 360)
  const thumb = await toBlob(thumbCanvas, 'image/webp', 0.72)

  return { image, thumb, width, height }
}

/** 示例照片的拍摄时间 */
function takenAt(plan: DemoPlan, photo: DemoPhoto): number {
  const base = new Date(`${plan.trip.startDate}T12:00:00`).getTime()
  return base + (photo.day - 1) * 86400000 + (photo.hour - 12) * 3600000
}

export async function loadDemoData(): Promise<{ trips: number; photos: number }> {
  const existingTrips = new Set((await getAllTrips()).map((trip) => trip.id))
  const existingPhotos = new Set((await getAllPhotos()).map((photo) => photo.id))

  let trips = 0
  let photos = 0
  let seed = 7

  for (const plan of DEMO_TRIPS) {
    if (!existingTrips.has(plan.trip.id)) {
      await putTrip(plan.trip)
      trips += 1
    }

    for (let i = 0; i < plan.photos.length; i += 1) {
      const spec = plan.photos[i]
      const id = `${plan.trip.id}-photo-${i + 1}`
      if (existingPhotos.has(id)) continue

      const image = await makePhoto(seed)
      seed += 13

      const photo: Photo = {
        id,
        tripId: plan.trip.id,
        thumbnail: image.thumb,
        image: image.image,
        width: image.width,
        height: image.height,
        takenAt: takenAt(plan, spec),
        place: spec.place,
        caption: spec.caption,
        tags: spec.tags,
        createdAt: Date.now(),
      }
      await putPhoto(photo)
      photos += 1
    }
  }

  return { trips, photos }
}
