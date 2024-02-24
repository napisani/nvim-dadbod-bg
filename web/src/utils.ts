export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: any
  return function (this: any, ...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func.apply(this, args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  } as any
}
