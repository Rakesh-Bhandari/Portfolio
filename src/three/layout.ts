import { bus, chain45, rng, type V2 } from './lib'

/** Board is 16 × 24 units, top face at y = 0, X ∈ [-8, 8], Z ∈ [-12, 12]. */
export const BOARD = { w: 16, d: 24, t: 0.12 }

/** Anchors: one board region per section. */
export const ANCHOR = {
  soc: [0, -8] as V2,
  xtal: [-5.2, -4.5] as V2,
  power: [-4.5, 0.5] as V2,
  chip: [
    [4.9, -4.5],
    [4.9, -0.5],
    [4.9, 3.5],
  ] as V2[],
  dimm: [-2.2, 6.8] as V2,
  io: [4.6, 10.4] as V2,
  usb: [-2, 11.1] as V2,
}

/** Signal ribbons: section-to-section copper paths that carry the pulse toward the active region. */
export const RIBBONS: Record<string, V2[]> = {
  about: chain45([[7.6, -12], ANCHOR.soc]),
  edu: chain45([ANCHOR.soc, ANCHOR.xtal]),
  exp: chain45([ANCHOR.xtal, [-7, -2.5], ANCHOR.power]),
  p0: chain45([[ANCHOR.power[0], 0.5], [2.6, ANCHOR.chip[0][1]]]),
  p1: chain45([[ANCHOR.power[0], 0.85], [2.6, ANCHOR.chip[1][1]]]),
  p2: chain45([[ANCHOR.power[0], 1.2], [2.6, ANCHOR.chip[2][1]]]),
  skills: chain45([ANCHOR.chip[2], ANCHOR.dimm]),
  certs: chain45([ANCHOR.dimm, ANCHOR.io]),
  contact: chain45([ANCHOR.io, ANCHOR.usb]),
}

/** Decorative buses (parallel lanes) so the board feels dense and continuous. */
export const BUSES: V2[][] = [
  ...bus([-1.7, -5.7], [-3.6, 4.7], 8),
  ...bus([2.35, -8.6], [2.6, -5.3], 6, [0.0, 0.2]),
  ...bus([0.6, -5.7], [2.4, -3.7], 5),
  ...bus([-4.4, -4.2], [-2.35, -7.0], 4, [0.18, 0.2]),
  ...bus([-3.2, -1.2], [-1.3, -5.7], 5),
  ...bus([0.8, 7.8], [3.4, 9.0], 5),
  ...bus([2.8, 10.6], [-0.4, 11.3], 4, [0.0, 0.2]),
  ...bus([-6.8, 4.5], [-7.4, 9.6], 4, [0.2, 0.0]),
  ...bus([-6.8, -10.8], [-4.4, -8.4], 6, [0.18, 0.18]),
  ...bus([5.0, -11.4], [7.0, -6.2], 4, [0.2, 0.0]),
]

/** Keep-out rectangles [x0, z0, x1, z1] where scattered passives must not land. */
export const KEEPOUT: [number, number, number, number][] = [
  [-2.8, -10.8, 2.8, -5.2],
  [-6.6, -5.5, -3.6, -3.5],
  [-7.3, -1.4, -1.0, 3.0],
  [2.2, -5.5, 7.7, -3.5],
  [2.2, -1.5, 7.7, 0.5],
  [2.2, 2.5, 7.7, 4.5],
  [-6.1, 4.7, 1.9, 8.9],
  [2.2, 8.8, 7.9, 12],
  [-3.2, 10.2, -0.8, 12],
  [-7.3, 10.1, -3.2, 12],
  [-4.2, -3.2, -1.2, -1.3],
]

export function scatterPassives(count: number, seed = 7): { x: number; z: number; rot: number; cap: boolean }[] {
  const r = rng(seed)
  const out: { x: number; z: number; rot: number; cap: boolean }[] = []
  // decoupling ring around the SoC
  for (let i = 0; i < 9; i++) {
    const x = -2.2 + i * 0.55
    out.push({ x, z: -10.85, rot: 0, cap: true }, { x, z: -5.15, rot: 0, cap: i % 2 === 0 })
  }
  for (let i = 0; i < 7; i++) {
    const z = -10.2 + i * 0.6
    out.push({ x: -2.95, z, rot: Math.PI / 2, cap: true }, { x: 2.95, z, rot: Math.PI / 2, cap: i % 3 !== 0 })
  }
  let guard = 0
  while (out.length < count && guard++ < 6000) {
    const x = (r() - 0.5) * 14.4
    const z = (r() - 0.5) * 22.4
    if (KEEPOUT.some(([x0, z0, x1, z1]) => x > x0 && x < x1 && z > z0 && z < z1)) continue
    const row = r() < 0.5
    const n = 1 + Math.floor(r() * 3)
    const rot = r() < 0.5 ? 0 : Math.PI / 2
    for (let k = 0; k < n && out.length < count; k++) {
      out.push({ x: x + (row ? k * 0.5 : 0), z: z + (row ? 0 : k * 0.5), rot, cap: r() < 0.5 })
    }
  }
  return out
}

export function viaPoints(count: number, seed = 11): V2[] {
  const r = rng(seed)
  const pts: V2[] = []
  let g = 0
  while (pts.length < count && g++ < 5000) {
    const x = (r() - 0.5) * 15.2
    const z = (r() - 0.5) * 23.2
    if (KEEPOUT.some(([x0, z0, x1, z1]) => x > x0 && x < x1 && z > z0 && z < z1)) continue
    pts.push([x, z])
  }
  return pts
}
