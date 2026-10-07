import { portfolio as d } from '../data/portfolio'
import { SectionHeader, Smd } from './ui'

export default function Skills() {
  return (
    <section id="skills" className="section side-right" aria-labelledby="skills-title">
      <div className="lead-gap" />
      <div className="wrap block">
        <div className="col">
          <div className="panel mb-4">
            <SectionHeader flush id="skills-title" designator="DIMM" label="Skills" title="Functional blocks" />
          </div>
          <div className="grid gap-4">
            {d.skills.map((g) => (
              <section key={g.name} data-reveal className="card bg-[rgba(10,26,20,0.88)]" aria-label={g.name}>
                <h3 className="mono-label mb-3 text-[12px] font-medium text-copper">
                  {g.designator} · {g.name}
                </h3>
                <ul className="m-0 flex list-none flex-wrap gap-y-2.5 p-0">
                  {g.items.map((s) => (
                    <li key={s}>
                      <Smd>{s}</Smd>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
