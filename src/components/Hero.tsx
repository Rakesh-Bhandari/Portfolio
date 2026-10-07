import { ArrowDown, Download, MapPin } from 'lucide-react'
import { portfolio as d } from '../data/portfolio'
import { scrollToTarget } from '../hooks/scrollApi'

export default function Hero() {
  return (
    <section id="hero" className="section side-left flex min-h-[100svh] flex-col" aria-labelledby="hero-title">
      <div className="lead-gap" />
      <div className="wrap flex flex-1 items-center pb-16 pt-24 min-[1280px]:pb-24">
        <div className="col col-hero max-[1279px]:panel">
          <p data-reveal="fade" className="mono-label muted mb-5">
            <MapPin size={13} className="mr-1 inline -translate-y-px" aria-hidden="true" />
            {d.location}
          </p>
          <h1 id="hero-title" className="h1 whitespace-nowrap">
            <span className="gradient-name">{d.name}</span>
          </h1>
          <p className="mono-label mt-4 text-copper">{d.title}</p>
          <p className="prose-body mt-6 text-lg">{d.tagline}</p>
          <p className="mono-label mt-7 inline-flex items-center gap-3 rounded border border-[var(--line)] bg-[rgba(15,42,31,0.55)] px-3 py-2">
            <span className="led" aria-hidden="true" />
            <span className="normal-case tracking-normal text-[12.5px]">{d.status}</span>
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              className="btn btn-primary"
              href="#projects"
              onClick={(e) => {
                e.preventDefault()
                scrollToTarget('#projects')
              }}
            >
              View projects
            </a>
            <a className="btn btn-ghost" href={d.resume} download>
              <Download size={16} aria-hidden="true" /> Download resume
            </a>
          </div>
          <p className="mono-label muted mt-10 hidden items-center gap-2 min-[1280px]:flex">
            <ArrowDown size={13} aria-hidden="true" /> Scroll to follow the signal
          </p>
        </div>
      </div>
    </section>
  )
}
