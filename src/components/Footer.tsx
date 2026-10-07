import { ArrowUp } from 'lucide-react'
import { portfolio as d } from '../data/portfolio'
import { scrollToTarget } from '../hooks/scrollApi'

export default function Footer() {
  return (
    <footer className="relative border-t border-[var(--line)] bg-[rgba(7,9,10,0.9)] py-10">
      <div className="wrap flex flex-col gap-4 min-[768px]:flex-row min-[768px]:items-center min-[768px]:justify-between">
        <div>
          <p className="text-[14px] text-muted">{d.contact.footer}</p>
          <p className="mono-label mt-1 text-[11px] text-gold opacity-80">{d.contact.rev}</p>
        </div>
        <a
          href="#hero"
          className="mono-label inline-flex min-h-[44px] items-center gap-2 text-silk no-underline hover:text-copper"
          onClick={(e) => {
            e.preventDefault()
            scrollToTarget(0)
          }}
        >
          Back to top <ArrowUp size={14} aria-hidden="true" /> (reboot)
        </a>
      </div>
    </footer>
  )
}
