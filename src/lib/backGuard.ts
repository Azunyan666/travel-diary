type Guard = () => boolean

const guards: Guard[] = []

/** 注册一个返回拦截；返回 true 表示这次返回已被消费 */
export function registerBackGuard(guard: Guard): () => void {
  guards.push(guard)
  return () => {
    const index = guards.lastIndexOf(guard)
    if (index >= 0) guards.splice(index, 1)
  }
}

/** 从最上层开始询问，返回 true 表示不应继续路由或退出应用 */
export function runBackGuard(): boolean {
  for (let i = guards.length - 1; i >= 0; i -= 1) {
    if (guards[i]()) return true
  }
  return false
}
