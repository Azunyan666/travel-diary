import type { Trip } from '@/types/models'

/** 出发日期倒序；同一天按创建时间倒序，保证顺序稳定 */
export function byStartDateDesc(a: Trip, b: Trip): number {
  if (a.startDate === b.startDate) return b.createdAt - a.createdAt
  return a.startDate < b.startDate ? 1 : -1
}
