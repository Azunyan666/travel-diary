/** 省级行政区：名称归一化与总数 */

const SUFFIX = /(维吾尔|壮族|回族|特别行政区|自治区|自治州|省|市)/g

/** 「云南省」→「云南」，「新疆维吾尔自治区」→「新疆」 */
export function normalizeProvince(name: string): string {
  return name.replace(SUFFIX, '').trim()
}

/** 34 个省级行政区（含港澳台） */
export const PROVINCE_TOTAL = 34
