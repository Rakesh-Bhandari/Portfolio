import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { portfolio as d } from '../data/portfolio'
import { scrollToTarget } from '../hooks/scrollApi'
import { useSectionIndex } from '../three/store'

const LINKS = [
  { id: 'about', label: 'About', sections: [1, 2] },
  { id: 'projects', label: 'Projects', sections: [4] },
  { id: 'skills', label: 'Skills', sections: [5, 6] },
  { id: 'experience', label: 'Experience', sections: [3] },
  { id: 'contact', label: 'Contact', sections: [7] },
]

export default function Nav() {
  const section = useSectionIndex()
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open])

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    scrollToTarget(`#${id}`)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--line)] bg-[rgba(7,9,10,0.82)]">
      <div className="wrap flex h-16 items-center justify-between">
        <a href="#hero" onClick={go('hero')} className="flex items-center gap-2.5 no-underline" aria-label={`${d.name} — home`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="6" y="6" width="12" height="12" rx="1.5" stroke="var(--copper)" strokeWidth="1.5" />
            <path d="M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3" stroke="var(--gold)" strokeWidth="1.5" />
          </svg>
          <span className="mono-label text-[12px] text-silk">RK · {d.short}</span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 min-[900px]:flex">
          {LINKS.map((l) => {
            const active = l.sections.includes(section)
            return (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={go(l.id)}
                aria-current={active ? 'true' : undefined}
                className={`mono-label inline-flex min-h-[44px] items-center px-3 no-underline transition-colors ${
                  active ? 'text-signal' : 'text-muted hover:text-silk'
                }`}
              >
                {l.label}
              </a>
            )
          })}
          <a className="btn btn-primary ml-3 !min-h-[40px] !px-4 !text-[14px]" href={d.resume} download>
            Resume
          </a>
        </nav>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--line)] min-[900px]:hidden"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-sheet"
          onClick={() => setOpen(true)}
        >
          <Menu size={20} aria-hidden="true" />
        </button>
      </div>

      {open && <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)} aria-hidden="true" />}
      <div
        id="mobile-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-[var(--line)] bg-[#0b1411] px-4 pb-8 pt-3 transition-transform duration-300 ease-out min-[900px]:hidden ${
          open ? 'translate-y-0' : 'invisible translate-y-full'
        }`}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="mono-label muted">Menu</span>
          <button type="button" className="flex h-11 w-11 items-center justify-center" aria-label="Close menu" onClick={() => setOpen(false)}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Mobile">
          <ul className="m-0 list-none p-0">
            {LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={go(l.id)}
                  className={`flex min-h-[52px] items-center border-b border-[var(--line)] font-display text-xl no-underline ${
                    l.sections.includes(section) ? 'text-signal' : 'text-silk'
                  }`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="btn btn-primary mt-5 w-full" href={d.resume} download>
          Resume
        </a>
      </div>
    </header>
  )
}
