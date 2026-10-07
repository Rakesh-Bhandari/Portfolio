import { useState, type FormEvent } from 'react'
import { Check, Copy, Download, GitBranch, Mail, Phone, UserRound } from 'lucide-react'
import { portfolio as d } from '../data/portfolio'
import { SectionHeader } from './ui'

const FORMSPREE = import.meta.env.VITE_FORMSPREE_ID as string | undefined

function CopyEmail() {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(d.email)
    } catch {
      const t = document.createElement('textarea')
      t.value = d.email
      document.body.appendChild(t)
      t.select()
      document.execCommand('copy')
      t.remove()
    }
    setDone(true)
    setTimeout(() => setDone(false), 1800)
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <a className="inline-flex min-h-[44px] items-center gap-2 break-all no-underline hover:text-copper" href={`mailto:${d.email}`}>
        <Mail size={17} className="text-copper" aria-hidden="true" /> {d.email}
      </a>
      <button type="button" onClick={copy} className="btn btn-ghost !min-h-[44px] !px-3" aria-label="Copy email address">
        {done ? <Check size={16} className="text-signal" aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
        <span className="mono-label text-[11px]">{done ? 'Copied' : 'Copy'}</span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">{done ? 'Email address copied' : ''}</span>
    </div>
  )
}

function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get('name') ?? '')
    const email = String(f.get('email') ?? '')
    const message = String(f.get('message') ?? '')
    if (!FORMSPREE) {
      const body = `${message}\n\n— ${name} (${email})`
      window.location.href = `mailto:${d.email}?subject=${encodeURIComponent(`Portfolio message from ${name}`)}&body=${encodeURIComponent(body)}`
      return
    }
    setState('sending')
    try {
      const r = await fetch(`https://formspree.io/f/${FORMSPREE}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: f,
      })
      setState(r.ok ? 'sent' : 'error')
      if (r.ok) e.currentTarget.reset()
    } catch {
      setState('error')
    }
  }
  const field =
    'mt-1.5 block min-h-[44px] w-full rounded-lg border border-[var(--line)] bg-[rgba(7,9,10,0.7)] px-3 py-2.5 text-[15px] text-silk placeholder:text-muted focus:border-signal'
  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-4" aria-label="Contact form">
      <label className="mono-label muted block text-[11px]">
        Name
        <input name="name" required autoComplete="name" className={`${field} font-sans normal-case tracking-normal`} />
      </label>
      <label className="mono-label muted block text-[11px]">
        Email
        <input name="email" type="email" required autoComplete="email" className={`${field} font-sans normal-case tracking-normal`} />
      </label>
      <label className="mono-label muted block text-[11px]">
        Message
        <textarea name="message" required rows={4} className={`${field} font-sans normal-case tracking-normal`} />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-primary" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : 'Send message'}
        </button>
        <p role="status" aria-live="polite" className="mono-label text-[11px]">
          {state === 'sent' && <span className="text-signal">Message sent. Thank you.</span>}
          {state === 'error' && <span className="text-copper">Could not send. Please email me directly.</span>}
        </p>
      </div>
    </form>
  )
}

export default function Contact() {
  return (
    <section id="contact" className="section side-right" aria-labelledby="contact-title">
      <div className="lead-gap" />
      <div className="wrap block">
        <div className="col panel">
          <SectionHeader id="contact-title" designator="J4" label="Contact" title={d.contact.heading} />
          <ul data-reveal className="m-0 grid list-none gap-1 p-0 text-[16px]">
            <li><CopyEmail /></li>
            <li>
              <a className="inline-flex min-h-[44px] items-center gap-2 no-underline hover:text-copper" href={`tel:${d.phone.replace(/\s/g, '')}`}>
                <Phone size={17} className="text-copper" aria-hidden="true" /> {d.phone}
              </a>
            </li>
            <li>
              <a className="inline-flex min-h-[44px] items-center gap-2 no-underline hover:text-copper" href={d.linkedin} target="_blank" rel="noopener noreferrer">
                <UserRound size={17} className="text-copper" aria-hidden="true" /> LinkedIn · b-rakesh-kumar
              </a>
            </li>
            <li>
              <a className="inline-flex min-h-[44px] items-center gap-2 no-underline hover:text-copper" href={d.github} target="_blank" rel="noopener noreferrer">
                <GitBranch size={17} className="text-copper" aria-hidden="true" /> GitHub · Rakesh-Bhandari
              </a>
            </li>
          </ul>
          <div data-reveal className="mt-4">
            <a className="btn btn-ghost" href={d.resume} download>
              <Download size={16} aria-hidden="true" /> Download resume
            </a>
          </div>
          <div data-reveal>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  )
}
