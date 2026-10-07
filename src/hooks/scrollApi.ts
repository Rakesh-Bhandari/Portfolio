import type Lenis from 'lenis'
import { prefersReducedMotion } from './useReducedMotion'

let lenis: Lenis | null = null
export const setLenis = (l: Lenis | null) => {
  lenis = l
}

export function scrollToTarget(target: string | number) {
  if (lenis) {
    lenis.scrollTo(target as never, { duration: 1.4 })
    return
  }
  const behavior = prefersReducedMotion() ? 'auto' : 'smooth'
  if (typeof target === 'number') window.scrollTo({ top: target, behavior })
  else document.querySelector(target)?.scrollIntoView({ behavior })
}
