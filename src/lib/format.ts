const pad = (n: number): string => (n < 10 ? `0${n}` : String(n))

const parseDate = (value: string): Date => {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(value)
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value)
}

/** 2026-11-08 -> 2026年11月8日 */
export function fmtCN(value?: string): string {
  if (!value) return ''
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(value)
  if (!m) return value
  return `${m[1]}年${Number(m[2])}月${Number(m[3])}日`
}

/** 2026-11-08 -> 11.08 */
export function fmtMD(value?: string): string {
  if (!value) return ''
  const m = /^\d{4}-(\d{1,2})-(\d{1,2})/.exec(value)
  if (!m) return value
  return `${pad(Number(m[1]))}.${pad(Number(m[2]))}`
}

/** 一段日期：11.08 – 11.10 */
export function fmtRange(start?: string, end?: string): string {
  if (!start) return ''
  if (!end || end === start) return fmtMD(start)
  return `${fmtMD(start)} – ${fmtMD(end)}`
}

/** 含首尾的天数 */
export function daysBetween(start?: string, end?: string): number {
  if (!start) return 0
  const a = parseDate(start)
  const b = parseDate(end || start)
  const diff = Math.round((b.getTime() - a.getTime()) / 86400000) + 1
  return Number.isFinite(diff) && diff > 0 ? diff : 1
}

/** 从 start 到某个日期相差的天数（不含首日补偿）：同一天为 0 */
export function daysFrom(start: string, date: string): number {
  const a = parseDate(start)
  const b = parseDate(date)
  a.setHours(0, 0, 0, 0)
  b.setHours(0, 0, 0, 0)
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

/** 今天，YYYY-MM-DD */
export function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 毫秒时间戳 -> 2026.11.08 */
export function fmtStamp(ms?: number): string {
  if (!ms) return ''
  const d = new Date(ms)
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}

/** 毫秒时间戳 -> YYYY-MM-DD（本地时区） */
export function dateKey(ms?: number): string {
  if (!ms) return ''
  const d = new Date(ms)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 毫秒时间戳 -> 11.08 */
export function fmtMDStamp(ms?: number): string {
  if (!ms) return ''
  const d = new Date(ms)
  return `${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}
