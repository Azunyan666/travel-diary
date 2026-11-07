/** 生成 ID：优先用 crypto.randomUUID，局域网 HTTP 下回退到随机串 */
export function newId(prefix = ''): string {
  const cryptoObj = globalThis.crypto
  let id: string
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
    id = cryptoObj.randomUUID()
  } else {
    const bytes = new Uint8Array(16)
    if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
      cryptoObj.getRandomValues(bytes)
    } else {
      for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256)
    }
    id = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  }
  return prefix ? `${prefix}_${id}` : id
}
