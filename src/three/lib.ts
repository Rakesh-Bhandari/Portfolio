import * as THREE from 'three'

export type V2 = [number, number]

export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const EPS = 1e-6
const dedupe = (pts: V2[]) =>
  pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) > EPS)

/** One PCB-style leg between two points: a 45° run plus an axis-aligned run, never a curve. */
function leg(a: V2, b: V2, diagFirst: boolean): V2[] {
  const dx = b[0] - a[0]
  const dz = b[1] - a[1]
  const m = Math.min(Math.abs(dx), Math.abs(dz))
  const sx = Math.sign(dx)
  const sz = Math.sign(dz)
  const dd: V2 = [sx * m, sz * m]
  const rest: V2 = [dx - dd[0], dz - dd[1]]
  const mid: V2 = diagFirst ? [a[0] + dd[0], a[1] + dd[1]] : [a[0] + rest[0], a[1] + rest[1]]
  return dedupe([a, mid, b])
}

const angleBetween = (u: V2, v: V2) => {
  const d = Math.atan2(u[0] * v[1] - u[1] * v[0], u[0] * v[0] + u[1] * v[1])
  return Math.abs((d * 180) / Math.PI)
}

/** Route through waypoints so every bend is exactly 45° (or straight). */
export function chain45(pts: V2[]): V2[] {
  const out: V2[] = [pts[0]]
  let prev: V2 | null = null
  for (let i = 0; i < pts.length - 1; i++) {
    const cands = [true, false].map((df) => leg(pts[i], pts[i + 1], df))
    let best = cands[0]
    let bestScore = Infinity
    for (const c of cands) {
      if (c.length < 2) continue
      const d: V2 = [c[1][0] - c[0][0], c[1][1] - c[0][1]]
      let score = prev ? angleBetween(prev, d) : 0
      if (score > 46) score += 1000 // a 90°+ corner is never acceptable if avoidable
      if (score < bestScore) {
        bestScore = score
        best = c
      }
    }
    out.push(...best.slice(1))
    const n = best.length
    if (n >= 2) prev = [best[n - 1][0] - best[n - 2][0], best[n - 1][1] - best[n - 2][1]]
  }
  return dedupe(out)
}

/** Maximum turn angle (deg) in a polyline; 45 means the route is clean PCB routing. */
export function maxTurn(pl: V2[]) {
  let m = 0
  for (let i = 1; i < pl.length - 1; i++) {
    const u: V2 = [pl[i][0] - pl[i - 1][0], pl[i][1] - pl[i - 1][1]]
    const v: V2 = [pl[i + 1][0] - pl[i][0], pl[i + 1][1] - pl[i][1]]
    m = Math.max(m, angleBetween(u, v))
  }
  return m
}

export function translate(pl: V2[], v: V2): V2[] {
  return pl.map((p) => [p[0] + v[0], p[1] + v[1]] as V2)
}

/** Parallel lanes (a PCB bus): the same routed shape translated by a lane vector. */
export function bus(a: V2, b: V2, lanes: number, step: V2 = [0.24, 0.1]): V2[][] {
  const out: V2[][] = []
  for (let k = 0; k < lanes; k++) out.push(chain45([[a[0] + step[0] * k, a[1] + step[1] * k], [b[0] + step[0] * k, b[1] + step[1] * k]]))
  return out
}

export type Seg = [number, number, number, number]
export function toSegments(pl: V2[]): Seg[] {
  const s: Seg[] = []
  for (let i = 0; i < pl.length - 1; i++) s.push([pl[i][0], pl[i][1], pl[i + 1][0], pl[i + 1][1]])
  return s
}

/* ---------- procedural textures ---------- */
const MONO = '"JetBrains Mono Variable", ui-monospace, monospace'
const cache = new Map<string, { tex: THREE.CanvasTexture; aspect: number }>()

export function labelTexture(text: string, fontPx = 64, weight = 500) {
  const key = `${text}|${fontPx}|${weight}`
  const hit = cache.get(key)
  if (hit) return hit
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d')!
  ctx.font = `${weight} ${fontPx}px ${MONO}`
  const w = Math.ceil(ctx.measureText(text).width + fontPx * 0.6)
  const h = Math.ceil(fontPx * 1.5)
  c.width = w
  c.height = h
  ctx.font = `${weight} ${fontPx}px ${MONO}`
  ctx.fillStyle = '#ffffff'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, fontPx * 0.3, h / 2 + fontPx * 0.04)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  const r = { tex, aspect: w / h }
  cache.set(key, r)
  return r
}

export function chipTexture(lines: string[], opts: { bg: string; fg: string; size?: number; dot?: boolean; border?: string }) {
  const S = opts.size ?? 512
  const c = document.createElement('canvas')
  c.width = c.height = S
  const ctx = c.getContext('2d')!
  ctx.fillStyle = opts.bg
  ctx.fillRect(0, 0, S, S)
  if (opts.border) {
    ctx.strokeStyle = opts.border
    ctx.lineWidth = S * 0.012
    ctx.strokeRect(S * 0.06, S * 0.06, S * 0.88, S * 0.88)
  }
  ctx.fillStyle = opts.fg
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const n = lines.length
  lines.forEach((t, i) => {
    const px = i === 0 ? S * 0.17 : S * 0.085
    ctx.font = `500 ${px}px ${MONO}`
    ctx.fillText(t, S / 2, S * (0.5 + (i - (n - 1) / 2) * 0.2))
  })
  if (opts.dot !== false) {
    ctx.beginPath()
    ctx.arc(S * 0.13, S * 0.13, S * 0.028, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

/** Tileable fibre-weave height map for the solder mask. */
export function weaveTexture() {
  const S = 128
  const c = document.createElement('canvas')
  c.width = c.height = S
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, S, S)
  for (let i = 0; i < S; i += 8) {
    ctx.fillStyle = i % 16 === 0 ? '#8a8a8a' : '#767676'
    ctx.fillRect(i, 0, 4, S)
    ctx.fillStyle = i % 16 === 0 ? '#747474' : '#8c8c8c'
    ctx.fillRect(0, i, S, 4)
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(60, 90)
  return tex
}

/** Layer artwork for the exploded stack-up (copper on mask, seeded 45° routing). */
export function layerTexture(kind: 'F.Cu' | 'In1.Cu' | 'In2.Cu' | 'B.Cu', w = 1024, h = 330) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  const r = rng(kind.length * 977 + kind.charCodeAt(0))
  ctx.fillStyle = '#0d2a20'
  ctx.fillRect(0, 0, w, h)
  const copper = kind === 'F.Cu' ? '#d89b6c' : kind === 'B.Cu' ? '#a8744d' : '#b98a56'
  ctx.strokeStyle = copper
  ctx.fillStyle = copper
  if (kind === 'In1.Cu') {
    // ground plane with thermal-relief dots
    ctx.globalAlpha = 0.55
    ctx.fillRect(8, 8, w - 16, h - 16)
    ctx.globalAlpha = 1
    ctx.fillStyle = '#0d2a20'
    for (let i = 0; i < 90; i++) {
      ctx.beginPath()
      ctx.arc(30 + r() * (w - 60), 30 + r() * (h - 60), 7, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (kind === 'In2.Cu') {
    // split power planes
    ctx.globalAlpha = 0.5
    ctx.fillRect(10, 10, w * 0.46, h - 20)
    ctx.fillStyle = '#c99a4a'
    ctx.fillRect(w * 0.5, 10, w * 0.22, h * 0.5)
    ctx.fillStyle = '#a77d48'
    ctx.fillRect(w * 0.5, h * 0.55, w * 0.46, h * 0.4 - 10)
    ctx.globalAlpha = 1
  } else {
    ctx.lineWidth = 5
    ctx.lineCap = 'square'
    for (let i = 0; i < 46; i++) {
      let x = r() * w
      let y = r() * h
      ctx.beginPath()
      ctx.moveTo(x, y)
      for (let k = 0; k < 3; k++) {
        const d = [[1, 0], [0, 1], [1, 1], [1, -1], [-1, 1], [-1, 0], [0, -1]][Math.floor(r() * 7)]
        const L = 30 + r() * 110
        x += d[0] * L
        y += d[1] * L
        ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    ctx.fillStyle = '#d4af6a'
    for (let i = 0; i < 70; i++) {
      ctx.beginPath()
      ctx.arc(r() * w, r() * h, 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.strokeStyle = 'rgba(232,230,225,0.5)'
  ctx.lineWidth = 3
  ctx.strokeRect(4, 4, w - 8, h - 8)
  ctx.font = `500 30px ${MONO}`
  ctx.fillStyle = 'rgba(232,230,225,0.85)'
  ctx.fillText(kind, 22, h - 18)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

export function ribbonGeometry(pl: V2[], width: number, y: number) {
  const pos: number[] = []
  const dist: number[] = []
  const idx: number[] = []
  let acc = 0
  const h = width / 2
  for (let i = 0; i < pl.length - 1; i++) {
    const [x1, z1] = pl[i]
    const [x2, z2] = pl[i + 1]
    const L = Math.hypot(x2 - x1, z2 - z1)
    const dx = (x2 - x1) / L
    const dz = (z2 - z1) / L
    const nx = -dz * h
    const nz = dx * h
    const ax = x1 - dx * h
    const az = z1 - dz * h
    const bx = x2 + dx * h
    const bz = z2 + dz * h
    const base = pos.length / 3
    pos.push(ax + nx, y, az + nz, ax - nx, y, az - nz, bx + nx, y, bz + nz, bx - nx, y, bz - nz)
    dist.push(acc - h, acc - h, acc + L + h, acc + L + h)
    idx.push(base, base + 1, base + 2, base + 1, base + 3, base + 2)
    acc += L
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('aDist', new THREE.Float32BufferAttribute(dist, 1))
  g.setIndex(idx)
  return g
}
