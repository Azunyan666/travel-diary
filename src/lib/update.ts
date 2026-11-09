import { APP_VERSION } from '@/lib/version'

/** 从 GitHub Releases 检查新版本 */

export interface UpdateInfo {
  latest: string
  /** APK 直接下载地址 */
  url: string
  /** Release 页面 */
  pageUrl: string
  notes: string
}

const RELEASE_API = 'https://api.github.com/repos/Azunyan666/travel-diary/releases/latest'

/** 比较两个 x.y.z 版本号：a > b 返回 1 */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => Number.parseInt(n, 10) || 0)
  const pb = b.split('.').map((n) => Number.parseInt(n, 10) || 0)
  for (let i = 0; i < 3; i += 1) {
    const x = pa[i] ?? 0
    const y = pb[i] ?? 0
    if (x !== y) return x > y ? 1 : -1
  }
  return 0
}

interface ReleaseAsset {
  name?: string
  browser_download_url?: string
}

interface ReleasePayload {
  tag_name?: string
  html_url?: string
  body?: string
  assets?: ReleaseAsset[]
}

export async function fetchLatestUpdate(): Promise<UpdateInfo | null> {
  try {
    const response = await fetch(RELEASE_API, {
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (!response.ok) return null

    const data = (await response.json()) as ReleasePayload
    const latest = String(data.tag_name ?? '').replace(/^v/, '')
    if (!latest || compareVersions(latest, APP_VERSION) <= 0) return null

    const assets = Array.isArray(data.assets) ? data.assets : []
    const apk = assets.find(
      (asset) =>
        typeof asset.name === 'string' &&
        asset.name.endsWith('.apk') &&
        !asset.name.includes('debug'),
    )

    return {
      latest,
      url: apk?.browser_download_url ?? data.html_url ?? '',
      pageUrl: data.html_url ?? '',
      notes: String(data.body ?? '').slice(0, 600),
    }
  } catch {
    return null
  }
}
