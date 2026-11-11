/** 国家名（中文 / 英文 / ISO2）→ ISO2，以及世界地图国家总数 */
import { COUNTRY_BY_NAME, WORLD_TOTAL } from '@/lib/countryAliases'

export { WORLD_TOTAL }

export function countryKey(input?: string): string {
  const raw = (input ?? '').trim()
  if (!raw) return ''

  const direct = COUNTRY_BY_NAME[raw]
  if (direct) return direct

  const lower = COUNTRY_BY_NAME[raw.toLowerCase()]
  if (lower) return lower

  const upper = COUNTRY_BY_NAME[raw.toUpperCase()]
  if (upper) return upper

  return ''
}
