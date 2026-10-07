import { ArrowUpRight } from 'lucide-react'
import { portfolio as d } from '../data/portfolio'
import { SectionHeader } from './ui'

export default function Certifications() {
  return (
    <section id="certifications" className="section side-left" aria-labelledby="cert-title">
      <div className="lead-gap" />
      <div className="wrap block">
        <div className="col">
          <div className="panel mb-4">
            <SectionHeader flush id="cert-title" designator="J2" label="Certifications" title="Datasheets on file" />
          </div>
          <ul className="m-0 grid list-none gap-3 p-0">
            {d.certifications.map((c, i) => (
              <li key={c.title} data-reveal className="card bg-[rgba(10,26,20,0.88)]">
                <div className="flex items-center justify-between">
                  <span className="mono-label text-copper">DS-00{i + 1}</span>
                  <span className="mono-label muted">{c.issuer}</span>
                </div>
                <h3 className="mt-2 text-lg font-medium leading-snug">{c.title}</h3>
                {c.link && (
                  <a
                    className="mono-label mt-3 inline-flex min-h-[44px] items-center gap-1 text-gold no-underline hover:underline"
                    href={c.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View credential <ArrowUpRight size={13} aria-hidden="true" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
