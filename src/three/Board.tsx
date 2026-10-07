import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { ANCHOR, BUSES, RIBBONS, scatterPassives, viaPoints } from './layout'
import { Batch, Crystal, DimmBank, Electrolytic, Header, Ic, Inductor, IoStack, MountHole, Mosfet, Silk, Soc, UsbC, type Item } from './parts'
import { Cards } from './Cards'
import { getMats } from './materials'
import { rng, toSegments, type V2 } from './lib'

function segItems(pls: V2[][], w: number, y: number, ext = 1): Item[] {
  const out: Item[] = []
  for (const pl of pls)
    for (const [x1, z1, x2, z2] of toSegments(pl)) {
      const L = Math.hypot(x2 - x1, z2 - z1)
      out.push({ p: [(x1 + x2) / 2, y, (z1 + z2) / 2], ry: Math.atan2(-(z2 - z1), x2 - x1), s: [L + w * ext, 0.014, w] })
    }
  return out
}

function outline(x: number, z: number, w: number, d: number, t = 0.035): Item[] {
  const y = 0.02
  return [
    { p: [x, y, z - d / 2], s: [w + t, 0.004, t] },
    { p: [x, y, z + d / 2], s: [w + t, 0.004, t] },
    { p: [x - w / 2, y, z], s: [t, 0.004, d] },
    { p: [x + w / 2, y, z], s: [t, 0.004, d] },
  ]
}

export default function Board({ low }: { low: boolean }) {
  const M = getMats()

  const traces = useMemo(() => {
    const ribbons = Object.values(RIBBONS)
    return [...segItems(BUSES, 0.055, 0.007), ...segItems(ribbons, 0.075, 0.008)]
  }, [])

  const gold = useMemo(() => {
    const items: Item[] = []
    const ends = [...BUSES, ...Object.values(RIBBONS)]
    for (const pl of ends) {
      for (const p of [pl[0], pl[pl.length - 1]]) items.push({ p: [p[0], 0.009, p[1]], s: [0.15, 0.016, 0.15] })
    }
    viaPoints(low ? 50 : 110).forEach(([x, z]) => items.push({ p: [x, 0.008, z], s: [0.07, 0.014, 0.07] }))
    return items
  }, [low])

  const passives = useMemo(() => scatterPassives(low ? 70 : 150), [low])
  const bodies = useMemo<Item[]>(() => {
    const r = rng(3)
    return passives.map((p) => ({
      p: [p.x, 0.06, p.z],
      ry: p.rot,
      s: [0.3, 0.1, 0.17],
      color: p.cap ? (r() < 0.5 ? '#8a6c44' : '#a0814f') : '#16181a',
    }))
  }, [passives])
  const caps = useMemo<Item[]>(
    () =>
      passives.flatMap((p) => {
        const dx = Math.cos(p.rot) * 0.14
        const dz = -Math.sin(p.rot) * 0.14
        return [
          { p: [p.x + dx, 0.06, p.z + dz] as [number, number, number], ry: p.rot, s: [0.07, 0.105, 0.175] as [number, number, number] },
          { p: [p.x - dx, 0.06, p.z - dz] as [number, number, number], ry: p.rot, s: [0.07, 0.105, 0.175] as [number, number, number] },
        ]
      }),
    [passives],
  )

  const silk = useMemo<Item[]>(
    () => [
      ...outline(0, -8, 5.1, 5.1),
      ...outline(-5.2, -4.5, 2.2, 1.1),
      ...outline(-4.4, 0.7, 6.4, 4.0),
      ...outline(4.9, -4.5, 5.2, 1.95),
      ...outline(4.9, -0.5, 5.2, 1.95),
      ...outline(4.9, 3.5, 5.2, 1.95),
      ...outline(-2.2, 6.8, 7.9, 4.0),
      ...outline(4.6, 10.4, 5.8, 3.1),
      ...outline(-2, 11.1, 2.4, 1.9),
      ...outline(-5.55, 11.05, 4.1, 1.3),
    ],
    [],
  )

  const power = useMemo(() => ({ fets: [-6.2, -5.4, -4.6, -3.8, -3.0, -2.2], caps: [-6.4, -5.4, -4.4, -3.4, -2.4] }), [])
  const holes: V2[] = [[-7.3, -11.3], [7.3, -11.3], [-7.3, 11.3], [7.3, 11.3], [-7.3, 0], [7.3, 0]]
  const [sx, sz] = ANCHOR.soc

  return (
    <group>
      <RoundedBox args={[16, 0.12, 24]} radius={0.03} smoothness={2} position={[0, -0.06, 0]} receiveShadow castShadow material={M.mask} />

      <Batch items={traces} geo={M.box} mat={M.copper} />
      <Batch items={gold} geo={M.cyl} mat={M.gold} />
      <Batch items={bodies} geo={M.box} mat={M.passive} cast />
      <Batch items={caps} geo={M.box} mat={M.silver} />
      <Batch items={silk} geo={M.box} mat={M.silk} />

      <Soc x={sx} z={sz} />
      <Crystal x={ANCHOR.xtal[0]} z={ANCHOR.xtal[1]} />

      {/* power stage */}
      {[-6.0, -4.5, -3.0].map((x) => (
        <Inductor key={x} x={x} z={0.35} />
      ))}
      {power.fets.map((x) => (
        <Mosfet key={x} x={x} z={-0.7} />
      ))}
      {power.caps.map((x) => (
        <Electrolytic key={x} x={x} z={2.1} />
      ))}
      <Ic x={-1.9} z={0.7} size={0.95} label="U2" sub="VRM" pins={8} />

      {/* misc ICs */}
      <Ic x={3.7} z={-7.4} size={1.0} label="U3" sub="FLASH" />
      <Ic x={-4.6} z={-8.8} size={1.1} label="U4" sub="PMIC" />
      <Ic x={4.8} z={-10.3} size={0.8} label="U5" />
      <Ic x={-0.4} z={3.1} size={1.2} label="U6" sub="PHY" pins={10} />
      <Ic x={3.2} z={6.3} size={1.1} label="U7" sub="MUX" rot={Math.PI / 2} />
      <Ic x={-6.9} z={-9.6} size={0.75} label="U8" />

      <DimmBank x={ANCHOR.dimm[0]} z={ANCHOR.dimm[1]} />
      <Cards />
      <IoStack x={ANCHOR.io[0] - 0.4} z={ANCHOR.io[1]} />
      <UsbC x={ANCHOR.usb[0]} z={ANCHOR.usb[1]} />
      <Header x={-5.55} z={11.05} />
      {holes.map(([x, z]) => (
        <MountHole key={`${x},${z}`} x={x} z={z} />
      ))}

      {/* silkscreen */}
      <Silk x={0} z={-4.1} text="B RAKESHKUMAR" h={0.62} opacity={0.85} />
      <Silk x={0} z={-3.45} text="RK-PORTFOLIO · REV 1.0 · 2026" h={0.2} opacity={0.6} />
      <Silk x={0} z={-5.0} text="U1 · RK-S3" h={0.22} />
      <Silk x={-5.2} z={-3.7} text="Y1 · 25.000 MHz" h={0.18} />
      <Silk x={-4.4} z={3.0} text="PWR · VRM · L1-L3 · Q1-Q6" h={0.18} />
      <Silk x={-2.2} z={4.55} text="DIMM1-4 · DDR" h={0.2} />
      <Silk x={4.6} z={8.65} text="J2 · I/O" h={0.2} />
      <Silk x={-2} z={9.9} text="J4 · USB-C" h={0.2} />
      <Silk x={-5.55} z={10.2} text="J5 · HDR" h={0.18} />
      <Silk x={-7.2} z={-11.6} text="REV 1.0" h={0.16} opacity={0.55} align="left" />
      <Silk x={7.2} z={11.6} text="RK-PORTFOLIO" h={0.16} opacity={0.55} rot={Math.PI} align="left" />
    </group>
  )
}
