import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/** One copper trace drawing across the screen with a mono percentage; fades out after ~1.2s. */
export default function Loader({ onDone }: { onDone: () => void }) {
  const line = useRef<SVGPathElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const o = { v: 0 }
    const tl = gsap.timeline({ onComplete: onDone })
    tl.to(o, { v: 100, duration: 1.1, ease: 'power2.inOut', onUpdate: () => setPct(Math.round(o.v)) })
    tl.to(root.current, { opacity: 0, duration: 0.4, ease: 'power2.out' })
    gsap.set(line.current, { strokeDashoffset: 1 })
    tl.to(line.current, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 0)
    return () => {
      tl.kill()
    }
  }, [onDone])
  return (
    <div ref={root} className="fixed inset-0 z-[90] flex items-center bg-bg" role="status" aria-label="Loading">
      <svg className="absolute left-0 top-1/2 w-full -translate-y-1/2" height="24" viewBox="0 0 1000 24" preserveAspectRatio="none" aria-hidden="true">
        <path ref={line} d="M0 12 H420 L440 4 H560 L580 12 H1000" pathLength={1} strokeDasharray={1} fill="none" stroke="var(--copper)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <p className="mono-label absolute bottom-[calc(50%-48px)] right-6 text-[12px] text-muted">
        {String(pct).padStart(3, '0')}%
      </p>
    </div>
  )
}
