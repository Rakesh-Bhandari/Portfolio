import * as THREE from 'three'

type Vec = [number, number, number]
export interface Key {
  pos: Vec
  tgt: Vec
}
/** Focal point sits on this side of the screen; text is on the opposite side. */
export const FOCAL_SIDE = [1, -1, 1, -1, 1, -1, 1, -1] // hero, about, edu, exp, projects, skills, certs, contact

/**
 * Camera keyframes per section (Section 4 of the brief). A section with n keys has them evenly
 * spread through its scroll range; the rig eases between consecutive keys across the whole page.
 */
export const KEYS: Key[][] = [
  // 0 hero: wide 3/4 view, board ≈70% of the viewport
  [{ pos: [16.5, 23.5, 27], tgt: [-0.5, 0, 1.5] }],
  // 1 about: dolly in on the SoC, near top-down
  [
    { pos: [3.2, 12.5, -2.0], tgt: [0, 0, -8] },
    { pos: [0.8, 10.2, -3.9], tgt: [0, 0, -8] },
  ],
  // 2 education: pan along the clock bus to the crystal
  [
    { pos: [-0.5, 9.2, -2.2], tgt: [-2.2, 0, -6.6] },
    { pos: [-3.4, 8.6, -0.6], tgt: [-5.0, 0, -4.4] },
  ],
  // 3 experience: truck sideways along the power stage
  [
    { pos: [-8.5, 9.0, 6.4], tgt: [-6.0, 0, 0.8] },
    { pos: [-1.4, 9.0, 6.4], tgt: [-2.6, 0, 0.8] },
  ],
  // 4 projects: hop chip to chip
  [
    { pos: [0.6, 8.4, 0.4], tgt: [4.4, 0, -4.5] },
    { pos: [0.6, 8.4, 4.4], tgt: [4.4, 0, -0.5] },
    { pos: [0.6, 8.4, 8.4], tgt: [4.4, 0, 3.5] },
  ],
  // 5 skills: pull back over the memory bank
  [
    { pos: [3.6, 10.5, 14.4], tgt: [-2.2, 0, 6.8] },
    { pos: [-1.2, 11.2, 15.2], tgt: [-2.2, 0, 7.2] },
  ],
  // 6 certifications: short pan to the I/O stack
  [
    { pos: [-1.6, 8.0, 15.4], tgt: [2.8, 0, 10.2] },
    { pos: [2.4, 8.2, 16.0], tgt: [4.6, 0, 10.4] },
  ],
  // 7 contact: pull out to the whole board for the power-on moment
  [
    { pos: [-1.0, 6.5, 17.5], tgt: [-3, 0, 11.1] },
    { pos: [16.5, 23.5, 27], tgt: [-0.5, 0, 1.5] },
  ],
]

export interface Flat {
  p: number
  pos: THREE.Vector3
  tgt: THREE.Vector3
  side: number
}
export const FLAT: Flat[] = KEYS.flatMap((keys, i) =>
  keys.map((k, j) => ({
    p: i + (j + 0.5) / keys.length,
    pos: new THREE.Vector3(...k.pos),
    tgt: new THREE.Vector3(...k.tgt),
    side: FOCAL_SIDE[i],
  })),
)

const smooth = (u: number) => u * u * (3 - 2 * u)

export function sample(p: number, outPos: THREE.Vector3, outTgt: THREE.Vector3): number {
  if (p <= FLAT[0].p) {
    outPos.copy(FLAT[0].pos)
    outTgt.copy(FLAT[0].tgt)
    return FLAT[0].side
  }
  const last = FLAT[FLAT.length - 1]
  if (p >= last.p) {
    outPos.copy(last.pos)
    outTgt.copy(last.tgt)
    return last.side
  }
  let i = 0
  while (i < FLAT.length - 2 && p > FLAT[i + 1].p) i++
  const a = FLAT[i]
  const b = FLAT[i + 1]
  const u = smooth((p - a.p) / (b.p - a.p))
  outPos.lerpVectors(a.pos, b.pos, u)
  outTgt.lerpVectors(a.tgt, b.tgt, u)
  return a.side + (b.side - a.side) * u
}
