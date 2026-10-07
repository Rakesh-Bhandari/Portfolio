import type { ReactNode } from 'react'

export function Smd({ children, large }: { children: ReactNode; large?: boolean }) {
  return <span className={`smd${large ? ' smd-lg' : ''}`}>{children}</span>
}

/** Designator + heading + a 45° trace line that draws in once. */
export function SectionHeader({
  designator,
  label,
  title,
  as: H = 'h2',
  id,
  flush,
}: {
  designator: string
  label: string
  title: string
  as?: 'h1' | 'h2'
  id?: string
  flush?: boolean
}) {
  return (
    <header className={flush ? '' : 'mb-8'}>
      <div data-reveal="fade" className="flex items-center gap-3">
        <span className="mono-label text-copper">
          {designator} / {label}
        </span>
        <svg data-trace width="120" height="14" viewBox="0 0 120 14" fill="none" aria-hidden="true" className="shrink-0">
          <path
            d="M0 11 H50 L60 3 H120"
            pathLength={1}
            stroke="var(--copper)"
            strokeWidth="1.25"
            strokeLinecap="square"
          />
        </svg>
      </div>
      <H id={id} data-reveal className="h2 mt-4">
        {title}
      </H>
    </header>
  )
}

export function Via() {
  return (
    <span aria-hidden="true" className="inline-block h-3 w-3 rounded-full border-2 border-gold bg-bg" />
  )
}
