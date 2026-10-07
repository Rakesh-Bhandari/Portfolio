import { useEffect } from 'react'
import { notify, scene, SECTION_IDS } from '../three/store'

/**
 * Maps the page scroll to the 3D journey. Sections are laid out top-to-bottom; the viewport centre
 * decides the current section and how far through it we are. Writes into `scene` (read by the camera rig).
 */
export function useScrollProgress(barRef: React.RefObject<HTMLElement>, disabled = false) {
  useEffect(() => {
    if (disabled) return
    let tops: number[] = []
    let raf = 0
    const measure = () => {
      tops = SECTION_IDS.map((id) => {
        const el = document.getElementById(id)
        return el ? el.getBoundingClientRect().top + window.scrollY : 0
      })
      tops.push(document.documentElement.scrollHeight)
    }
    const update = () => {
      raf = 0
      const vh = window.innerHeight
      const y = window.scrollY
      const c = y + vh * 0.5
      let i = 0
      for (let k = 0; k < SECTION_IDS.length; k++) if (c >= tops[k]) i = k
      const span = Math.max(1, tops[i + 1] - tops[i])
      const t = Math.min(1, Math.max(0, (c - tops[i]) / span))
      const prevSection = scene.section
      const prevStep = scene.projectStep
      scene.p = i + t
      scene.t = t
      scene.section = i
      scene.projectStep = i === 4 ? Math.min(2, Math.floor(t * 3)) : 0
      const max = Math.max(1, document.documentElement.scrollHeight - vh)
      scene.pageProgress = Math.min(1, Math.max(0, y / max))
      if (barRef.current) barRef.current.style.transform = `scaleX(${scene.pageProgress})`
      if (prevSection !== scene.section || prevStep !== scene.projectStep) notify()
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    const onResize = () => {
      measure()
      onScroll()
    }
    measure()
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    const ro = new ResizeObserver(onResize)
    ro.observe(document.body)
    const late = window.setTimeout(onResize, 600)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      ro.disconnect()
      clearTimeout(late)
      cancelAnimationFrame(raf)
    }
  }, [barRef, disabled])
}
