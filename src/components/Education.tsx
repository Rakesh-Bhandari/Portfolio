import { portfolio as d } from '../data/portfolio'
import { SectionHeader, Via } from './ui'

export default function Education() {
  return (
    <section id="education" className="section side-left" aria-labelledby="edu-title">
      <div className="lead-gap" />
      <div className="wrap block">
        <div className="col panel">
          <SectionHeader id="edu-title" designator="Y1" label="Education" title="Clocked in since 2021" />
          <ol className="relative m-0 list-none p-0">
            <span aria-hidden="true" className="absolute bottom-2 left-[5px] top-2 w-px bg-copper opacity-60" />
            {d.education.map((e) => (
              <li key={e.title} data-reveal className="relative pb-9 pl-9 last:pb-0">
                <span className="absolute left-0 top-[6px]">
                  <Via />
                </span>
                <p className="mono-label text-gold">
                  {e.period} · {e.score}
                </p>
                <h3 className="mt-1 text-lg font-medium leading-snug">{e.title}</h3>
                <p className="muted mt-1 text-[15px]">{e.org}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
