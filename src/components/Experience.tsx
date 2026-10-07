import { portfolio as d } from '../data/portfolio'
import { SectionHeader } from './ui'

export default function Experience() {
  return (
    <section id="experience" className="section side-right" aria-labelledby="exp-title">
      <div className="lead-gap" />
      <div className="wrap block">
        <div className="col">
          <div className="panel mb-4">
            <SectionHeader flush id="exp-title" designator="PWR" label="Experience & Achievements" title="Where the current went" />
          </div>
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {d.experience.map((x, i) => (
              <li key={x.title} data-reveal className="card bg-[rgba(10,26,20,0.88)]">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="mono-label text-copper">R{i + 1}</span>
                  <span className="mono-label muted">{x.date}</span>
                  {x.badge && (
                    <span className="mono-label inline-flex items-center gap-2 text-signal">
                      <span className="led" aria-hidden="true" /> {x.badge}
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-xl font-medium leading-snug">{x.title}</h3>
                <p className="muted mt-1 text-[14.5px]">{x.org}</p>
                <p className="mt-3 text-[15.5px] opacity-90">{x.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
