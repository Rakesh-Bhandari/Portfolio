import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Education from './components/Education'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Certifications from './components/Certifications'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Loader from './components/Loader'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useScrollProgress } from './hooks/useScrollProgress'
import { setLenis } from './hooks/scrollApi'
import { webglAvailable } from './hooks/useWebGL'
import { asset } from './data/portfolio'

gsap.registerPlugin(ScrollTrigger)

const Scene = lazy(() => import('./three/Scene'))

const capture = import.meta.env.DEV ? new URLSearchParams(location.search).get('capture') : null

export default function App() {
  const reduced = useReducedMotion()
  const [gl] = useState(() => webglAvailable())
  const [loading, setLoading] = useState(!capture)
  const [sceneReady, setSceneReady] = useState(false)
  const bar = useRef<HTMLDivElement>(null)
  const done = useCallback(() => setLoading(false), [])
  const use3D = gl && !reduced

  useScrollProgress(bar, !!capture)

  // Smooth scrolling (Lenis), skipped for reduced motion.
  useEffect(() => {
    if (reduced || capture) return
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95 })
    setLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
    }
  }, [reduced])

  // One-shot reveals: content fades up 20px (power3.out), list items staggered by 0.05s.
  useEffect(() => {
    if (reduced || capture) return
    try {
      const reveal = ScrollTrigger.batch('[data-reveal]', {
        start: 'top 90%',
        once: true,
        onEnter: (els) => {
          const fade = els.filter((e) => e.getAttribute('data-reveal') === 'fade')
          const rise = els.filter((e) => e.getAttribute('data-reveal') !== 'fade')
          gsap.to(rise, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.05, overwrite: true })
          gsap.to(fade, { opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.05, overwrite: true })
        },
      })
      const traces = ScrollTrigger.batch('[data-trace] path', {
        start: 'top 92%',
        once: true,
        onEnter: (els) => gsap.to(els, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out', delay: 0.15 }),
      })
      const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 800)
      return () => {
        clearTimeout(refresh)
        ;[...reveal, ...traces].forEach((s) => s.kill())
      }
    } catch {
      document.documentElement.classList.add('no-reveal')
    }
  }, [reduced])

  if (capture) {
    return (
      <Suspense fallback={null}>
        <Scene capture={capture} onReady={() => document.body.setAttribute('data-ready', '1')} />
        {capture === 'og' && (
          <div className="pointer-events-none fixed inset-0 flex items-start p-14">
            <div>
              <p className="mono-label text-[22px] text-copper">U1 · EMBEDDED SYSTEMS ENGINEER</p>
              <p className="font-display text-[84px] font-semibold leading-none tracking-tight text-silk">B Rakeshkumar</p>
              <p className="mono-label mt-3 text-[18px] text-muted">REV 1.0 · RK-PORTFOLIO · MANGALURU</p>
            </div>
          </div>
        )}
      </Suspense>
    )
  }

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      {loading && <Loader onDone={done} />}

      {/* Decorative 3D board (fixed background). Static render when WebGL is unavailable or motion is reduced. */}
      <div aria-hidden="true" className="fixed inset-0 z-0 bg-bg">
        {!use3D && (
          <div
            className="absolute inset-0 bg-cover bg-[70%_center]"
            style={{ backgroundImage: `url(${asset('images/board-hero.jpg')})` }}
          />
        )}
        {use3D && (
          <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: sceneReady ? 1 : 0 }}>
            <Suspense fallback={null}>
              <Scene onReady={() => setSceneReady(true)} />
            </Suspense>
          </div>
        )}
        <div className="vignette pointer-events-none absolute inset-0" />
      </div>

      <div ref={bar} aria-hidden="true" className="fixed left-0 top-0 z-50 h-[2px] w-full origin-left scale-x-0 bg-copper" />
      <Nav />
      <main id="main" className="relative z-10">
        <Hero />
        <About />
        <Education />
        <Experience />
        <Projects />
        <Skills />
        <Certifications />
        <Contact />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </>
  )
}
