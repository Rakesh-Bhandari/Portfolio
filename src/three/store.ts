import { useSyncExternalStore } from 'react'

export const SECTION_IDS = [
  'hero',
  'about',
  'education',
  'experience',
  'projects',
  'skills',
  'certifications',
  'contact',
] as const
export type SectionId = (typeof SECTION_IDS)[number]

export type LayerView = 'assembled' | 'F.Cu' | 'In1.Cu' | 'In2.Cu' | 'B.Cu'

/** Mutable scene state: written by the scroll tracker / UI, read every frame by the 3D scene (no React state per frame). */
export const scene = {
  p: 0, // continuous section coordinate (section index + progress inside it)
  section: 0,
  t: 0,
  projectStep: 0,
  layer: 'assembled' as LayerView,
  pageProgress: 0,
  mobile: false,
}

const listeners = new Set<() => void>()
export const notify = () => listeners.forEach((l) => l())
const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
export const useSectionIndex = () => useSyncExternalStore(subscribe, () => scene.section)
export const useProjectStep = () => useSyncExternalStore(subscribe, () => scene.projectStep)
