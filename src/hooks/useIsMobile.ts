import { useEffect, useState } from 'react'

export type Device = 'mobile' | 'tablet' | 'desktop'
const get = (): Device => {
  const w = window.innerWidth
  return w < 768 ? 'mobile' : w < 1280 ? 'tablet' : 'desktop'
}

export function useDevice() {
  const [d, setD] = useState<Device>(get)
  useEffect(() => {
    const on = () => setD(get())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return d
}

export const useIsMobile = () => useDevice() === 'mobile'
