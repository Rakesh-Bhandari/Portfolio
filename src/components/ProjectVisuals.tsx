import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { scene, type LayerView } from '../three/store'
import { useReducedMotion } from '../hooks/useReducedMotion'

function useInView<T extends Element>() {
  const ref = useRef<T>(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVis(e.isIntersecting), { threshold: 0.1 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, vis] as const
}

/* ---------- P1: PCB render placeholder + layer peel toggle ---------- */
const LAYERS: { id: LayerView; label: string }[] = [
  { id: 'assembled', label: 'Assembled' },
  { id: 'F.Cu', label: 'F.Cu' },
  { id: 'In1.Cu', label: 'In1' },
  { id: 'In2.Cu', label: 'In2' },
  { id: 'B.Cu', label: 'B.Cu' },
]

export function LayerVisual({ image, title, compact }: { image?: string; title: string; compact?: boolean }) {
  const [layer, setLayer] = useState<LayerView>('assembled')
  const [broken, setBroken] = useState(!image)
  const pick = (l: LayerView) => {
    setLayer(l)
    scene.layer = l
  }
  useEffect(() => () => void (scene.layer = 'assembled'), [])
  const tint: Record<LayerView, string> = {
    assembled: 'var(--copper)',
    'F.Cu': '#d79a6d',
    'In1.Cu': '#9a6a45',
    'In2.Cu': '#b88a55',
    'B.Cu': '#7d5a3e',
  }
  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--board)]" style={{ aspectRatio: compact ? '21/9' : '16/9' }}>
        {!broken && image ? (
          <img src={image} alt={`${title} KiCad 3D render`} className="h-full w-full object-cover" onError={() => setBroken(true)} loading="lazy" />
        ) : (
          <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label="Schematic illustration of the 4-layer board; KiCad render pending">
            <rect x="30" y="20" width="260" height="140" rx="6" fill="var(--board-2)" stroke="var(--line)" />
            <g stroke={tint[layer]} strokeWidth="1.6" fill="none" strokeLinecap="square" opacity={layer === 'assembled' ? 0.9 : 1}>
              <path d="M60 50 H110 L130 70 H190" />
              <path d="M60 62 H104 L124 82 H190" />
              <path d="M60 74 H98 L118 94 H190" />
              <path d="M210 70 H250 L262 58 V40" />
              <path d="M210 100 H240 L262 122 H270" />
              <path d="M70 140 H150 L170 120 H200" />
            </g>
            <rect x="128" y="60" width="56" height="56" rx="3" fill="#0a0d0c" stroke="var(--line)" />
            <text x="156" y="92" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--silkscreen)" opacity="0.8">RK-S3</text>
            <g fill="var(--gold)">
              {[60, 72, 84].map((y) => (
                <circle key={y} cx="60" cy={y - 10} r="2.4" />
              ))}
              <circle cx="262" cy="40" r="2.4" />
              <circle cx="270" cy="122" r="2.4" />
            </g>
            <text x="38" y="172" fontFamily="var(--font-mono)" fontSize="7" fill="var(--muted)">KiCad 3D render pending · {layer}</text>
          </svg>
        )}
      </div>
      <div role="group" aria-label="Board layer view (updates the 3D board)" className="mt-3 flex flex-wrap gap-2">
        {LAYERS.map((l) => (
          <button
            key={l.id}
            type="button"
            aria-pressed={layer === l.id}
            onClick={() => pick(l.id)}
            className={`mono-label min-h-[44px] rounded-md border px-3 transition-colors ${
              layer === l.id ? 'border-copper bg-[rgba(200,135,90,0.14)] text-silk' : 'border-[var(--line)] text-muted hover:border-[rgba(200,135,90,0.4)]'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <p className="mono-label muted mt-2 text-[11px] normal-case tracking-normal">
        Pick a layer to peel the stack-up apart on the 3D board.
      </p>
    </div>
  )
}

/* ---------- P2: packet travelling Ambulance → RSU → ECU, ACK returns ---------- */
export function V2XVisual() {
  const [ref, vis] = useInView<HTMLDivElement>()
  const reduced = useReducedMotion()
  const dot = useRef<SVGCircleElement>(null)
  const label = useRef<SVGTextElement>(null)
  useEffect(() => {
    if (!vis || reduced || !dot.current || !label.current) return
    const x = { v: 60 }
    const set = () => dot.current?.setAttribute('cx', String(x.v))
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8, onUpdate: set })
    const lab = (t: string, c: string) => () => {
      if (label.current) label.current.textContent = t
      dot.current?.setAttribute('fill', c)
    }
    tl.call(lab('BROADCAST', 'var(--copper)'))
      .fromTo(x, { v: 60 }, { v: 160, duration: 0.9, ease: 'power2.inOut' })
      .to(x, { v: 260, duration: 0.9, ease: 'power2.inOut' })
      .call(lab('ACK', 'var(--signal)'))
      .to(x, { v: 160, duration: 0.8, ease: 'power2.inOut' })
      .to(x, { v: 60, duration: 0.8, ease: 'power2.inOut' })
    return () => {
      tl.kill()
    }
  }, [vis, reduced])
  const nodes = [
    { x: 60, t: 'AMBULANCE', s: 'ESP32 · TX' },
    { x: 160, t: 'RSU', s: 'ESP32 · RELAY' },
    { x: 260, t: 'VEHICLE ECU', s: 'ESP32 · RX' },
  ]
  return (
    <div ref={ref} className="rounded-xl border border-[var(--line)] bg-[var(--board)] p-3">
      <svg viewBox="0 0 320 120" className="h-auto w-full" role="img" aria-label="Diagram: a packet travels from Ambulance to Roadside Unit to Vehicle ECU and an acknowledgement returns">
        <path d="M60 55 H260" stroke="var(--copper)" strokeWidth="1.5" opacity="0.6" />
        {nodes.map((n) => (
          <g key={n.t}>
            <rect x={n.x - 28} y="38" width="56" height="34" rx="4" fill="#0a0d0c" stroke="var(--line)" />
            <circle cx={n.x - 28} cy="55" r="3" fill="var(--gold)" />
            <circle cx={n.x + 28} cy="55" r="3" fill="var(--gold)" />
            <text x={n.x} y="52" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6.5" fill="var(--silkscreen)">{n.t}</text>
            <text x={n.x} y="63" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="5" fill="var(--muted)">{n.s}</text>
          </g>
        ))}
        <circle ref={dot} cx="60" cy="55" r="4.5" fill="var(--copper)" />
        <text ref={label} x="160" y="98" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="1" fill="var(--signal)">BROADCAST</text>
        <text x="160" y="112" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="5.5" fill="var(--muted)">NRF24L01 · SPI · broadcast → ack → retry</text>
      </svg>
    </div>
  )
}

/* ---------- P3: looping fake vibration waveform ---------- */
export function ScopeVisual() {
  const [ref, vis] = useInView<HTMLDivElement>()
  const reduced = useReducedMotion()
  const cv = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = cv.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const W = 320
    const H = 150
    c.width = W * dpr
    c.height = H * dpr
    ctx.scale(dpr, dpr)
    let raf = 0
    const draw = (time: number) => {
      ctx.clearRect(0, 0, W, H)
      ctx.strokeStyle = 'rgba(232,230,225,0.07)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = 0; x <= W; x += 32) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H) }
      for (let y = 0; y <= H; y += 30) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5) }
      ctx.stroke()
      ctx.strokeStyle = '#3ddc97'
      ctx.lineWidth = 1.6
      ctx.beginPath()
      const t = time / 1000
      for (let x = 0; x <= W; x += 2) {
        const u = x / 30 + t * 2.2
        const burst = Math.max(0, Math.sin(t * 0.6 + 1)) ** 3
        const y =
          H / 2 -
          (Math.sin(u * 2.1) * 16 + Math.sin(u * 5.3) * 7 * (0.4 + burst) + Math.sin(u * 13) * 2.2 + Math.sin(u * 0.7) * 6)
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.fillStyle = 'rgba(138,147,142,1)'
      ctx.font = '500 9px "JetBrains Mono Variable", monospace'
      ctx.fillText('CH1  MPU6050 AZ', 8, 14)
      ctx.fillText('20 ms/div   0.5 g/div', 8, H - 8)
      if (!reduced) raf = requestAnimationFrame(draw)
    }
    if (vis || reduced) raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [vis, reduced])
  return (
    <div ref={ref} className="rounded-xl border border-[var(--line)] bg-[#050707] p-2">
      <canvas ref={cv} role="img" aria-label="Simulated oscilloscope trace of bridge vibration data" className="block h-auto w-full" style={{ aspectRatio: '320/150' }} />
    </div>
  )
}
