import { portfolio as d } from '../data/portfolio'
import { SectionHeader, Smd } from './ui'

export default function About() {
  return (
    <section id="about" className="section side-right" aria-labelledby="about-title">
      <div className="lead-gap" />
      <div className="wrap block">
        <div className="col panel">
          <SectionHeader id="about-title" designator="U1" label="About" title="The full embedded stack" />
          {d.about.headshot && (
            <img
              data-reveal
              src={d.about.headshot}
              alt={`Portrait of ${d.name}`}
              className="mb-6 h-24 w-24 rounded-full object-cover ring-1 ring-copper ring-offset-4 ring-offset-bg"
            />
          )}
          <p data-reveal className="prose-body">
            {d.about.summary}
          </p>
          <ul data-reveal className="mt-8 flex list-none flex-wrap gap-y-3 p-0" aria-label="Quick facts">
            {d.about.stats.map((s) => (
              <li key={s}>
                <Smd large>{s}</Smd>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
