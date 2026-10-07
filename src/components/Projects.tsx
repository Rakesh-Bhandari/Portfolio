import { ArrowUpRight, GitBranch } from 'lucide-react'
import { portfolio as d, type Project } from '../data/portfolio'
import { SectionHeader, Smd } from './ui'
import { LayerVisual, ScopeVisual, V2XVisual } from './ProjectVisuals'
import { useDevice } from '../hooks/useIsMobile'
import { useProjectStep, useSectionIndex } from '../three/store'
import { scrollToTarget } from '../hooks/scrollApi'

function Visual({ p, compact }: { p: Project; compact?: boolean }) {
  if (p.visual === 'layers') return <LayerVisual image={p.image} title={p.title} compact={compact} />
  return <div className={compact ? 'max-w-[430px]' : ''}>{p.visual === 'v2x' ? <V2XVisual /> : <ScopeVisual />}</div>
}

function ProjectCard({ p, bare }: { p: Project; bare?: boolean }) {
  return (
    <article className={bare ? '' : 'panel'} aria-labelledby={`${p.id}-t`}>
      <p className="mono-label text-copper">{p.designator} · Project</p>
      <h3 id={`${p.id}-t`} className="mt-1 font-display text-[1.45rem] font-medium leading-tight">
        {p.title}
      </h3>
      <ul className="m-0 mt-3 flex list-none flex-wrap gap-y-2 p-0" aria-label="Technologies">
        {p.tags.map((t) => (
          <li key={t}>
            <Smd>{t}</Smd>
          </li>
        ))}
      </ul>
      <div className="mt-3 space-y-2 text-[15px] opacity-90">
        {p.summary.map((s) => (
          <p key={s.slice(0, 20)}>{s}</p>
        ))}
      </div>
      <div className="mt-4">
        <Visual p={p} compact={bare} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {p.links.map((l) => (
          <a key={l.href + l.label} className="btn btn-ghost" href={l.href} target="_blank" rel="noopener noreferrer">
            <GitBranch size={16} aria-hidden="true" /> {l.label} <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        ))}
      </div>
    </article>
  )
}

function MoreOnGithub() {
  return (
    <div className="mt-10">
      <p className="mono-label muted mb-3">More on GitHub</p>
      <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-3">
        {d.moreOnGithub.map((r) => (
          <li key={r.repo}>
            <a
              className="card block h-full no-underline"
              href={`https://github.com/Rakesh-Bhandari/${r.repo}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="flex items-center justify-between font-display text-base font-medium">
                {r.repo} <ArrowUpRight size={15} className="text-copper" aria-hidden="true" />
              </span>
              <span className="muted mt-2 block text-[13.5px] leading-snug">{r.blurb}</span>
              <span className="mono-label mt-3 block text-[10.5px] text-gold">{r.stack}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Projects() {
  const device = useDevice()
  const stacked = device !== 'desktop'
  const section = useSectionIndex()
  const step = useProjectStep()

  const header = (
    <SectionHeader flush id="projects-title" designator="M.2" label="Projects" title="Three chips, three problems" />
  )

  if (stacked) {
    return (
      <section id="projects" className="section side-left" aria-labelledby="projects-title">
        <div className="lead-gap" />
        <div className="wrap block">
          <div className="col">
            <div className="panel mb-4">{header}</div>
            <div className="flex flex-col gap-4">
              {d.projects.map((p) => (
                <div key={p.id} data-reveal>
                  <ProjectCard p={p} />
                </div>
              ))}
            </div>
            <MoreOnGithub />
          </div>
        </div>
      </section>
    )
  }

  // Desktop: sticky stage; scrolling steps through the chips (never traps: it is just a tall track).
  const active = section === 4 ? step : -1
  const shown = Math.max(active, 0)
  return (
    <section id="projects" className="section side-left" aria-labelledby="projects-title">
      <div className="relative" style={{ height: '300vh' }}>
        <div className="sticky top-0 flex h-screen items-center pt-16">
          <div className="wrap">
            <div className="col">
              <div className="panel max-h-[calc(100vh-96px)] overflow-y-auto !p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">{header}</div>
                  <div className="flex shrink-0 gap-2" role="group" aria-label="Project steps">
                    {d.projects.map((p, i) => (
                      <button
                        key={p.id}
                        type="button"
                        aria-label={`Show project ${i + 1}: ${p.title}`}
                        aria-current={shown === i}
                        onClick={() => {
                          const el = document.getElementById('projects')
                          if (!el) return
                          const top = el.getBoundingClientRect().top + window.scrollY
                          scrollToTarget(top + window.innerHeight * (0.1 + i * 0.95))
                        }}
                        className={`mono-label h-11 w-11 rounded-md border transition-colors ${
                          shown === i ? 'border-copper text-copper' : 'border-[var(--line)] text-muted hover:border-[rgba(200,135,90,0.4)]'
                        }`}
                      >
                        0{i + 1}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  {d.projects.map((p, i) => (
                    <div
                      key={p.id}
                      className={`transition-opacity duration-500 ${
                        i === shown ? 'relative opacity-100' : 'invisible absolute inset-x-0 top-0 opacity-0'
                      }`}
                    >
                      <ProjectCard p={p} bare />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="wrap pb-24">
        <div className="col">
          <MoreOnGithub />
        </div>
      </div>
    </section>
  )
}
