import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { ANCHOR } from './layout'
import { Batch, Ic, Silk, type Item } from './parts'
import { getMats } from './materials'
import { layerTexture } from './lib'
import { scene, type LayerView } from './store'

const CARD = { len: 4.5, wid: 1.6, thick: 0.12, y: 0.34 }
const SLOT_X = 2.45
const CX = SLOT_X + CARD.len / 2
const damp = THREE.MathUtils.damp

function Standoff({ x, z }: { x: number; z: number }) {
  const M = getMats()
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.17, 0]} geometry={M.cyl} scale={[0.17, 0.34, 0.17]} material={M.silver} castShadow />
      <mesh position={[0, CARD.y + CARD.thick + 0.025, 0]} geometry={M.cyl} scale={[0.15, 0.05, 0.15]} material={M.darkMetal} castShadow />
    </group>
  )
}

function Slot({ z }: { z: number }) {
  const M = getMats()
  const fingers = useMemo(
    () => Array.from({ length: 14 }, (_, i): Item => ({ p: [0.1, CARD.y - 0.02, -0.58 + i * 0.09], s: [0.46, 0.02, 0.05] })),
    [],
  )
  return (
    <group position={[SLOT_X, 0, z]}>
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow geometry={M.box} scale={[0.7, 0.32, 1.75]} material={M.plastic} />
      <Batch items={fingers} geo={M.box} mat={M.gold} />
    </group>
  )
}

const LAYER_ORDER: LayerView[] = ['F.Cu', 'In1.Cu', 'In2.Cu', 'B.Cu']

/** P1: the ESP32-S3 card is built from 4 stacked slabs that peel apart when a layer is picked. */
function LayerCard({ z }: { z: number }) {
  const M = getMats()
  const textures = useMemo(() => LAYER_ORDER.map((l) => layerTexture(l as 'F.Cu')), [])
  const groups = useRef<(THREE.Group | null)[]>([])
  const mats = useRef<(THREE.MeshStandardMaterial | null)[]>([])
  const th = CARD.thick / 4
  const passiveMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.6 }), [])
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures])
  useFrame((_, dt) => {
    const view = scene.layer
    const exploded = view !== 'assembled'
    const group = groups.current
    group.forEach((g, i) => {
      if (!g) return
      const ty = exploded ? (3 - i) * 0.62 + 0.5 : 0
      g.position.y = damp(g.position.y, ty, 4, dt)
    })
    mats.current.forEach((m, i) => {
      if (!m) return
      const sel = view === 'assembled' || LAYER_ORDER[i] === view
      m.opacity = damp(m.opacity, sel ? 1 : 0.22, 5, dt)
      m.emissive.set(sel && view !== 'assembled' ? '#c8875a' : '#000000')
      m.emissiveIntensity = sel && view !== 'assembled' ? 0.12 : 0
    })
  })
  return (
    <group position={[CX, 0, z]}>
      {LAYER_ORDER.map((l, i) => (
        <group key={l} ref={(g) => void (groups.current[i] = g)} position={[0, 0, 0]}>
          <mesh position={[0, CARD.y + (3 - i) * th + th / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[CARD.len, th, CARD.wid]} />
            <meshStandardMaterial
              ref={(m) => void (mats.current[i] = m)}
              map={textures[i]}
              roughness={0.5}
              metalness={0.1}
              transparent
              opacity={1}
            />
          </mesh>
          {i === 0 && (
            <group position={[0, CARD.y + CARD.thick, 0]}>
              <Ic x={0.2} z={0} size={1.25} h={0.13} label="ESP32-S3" sub="RK · 4L" pins={9} />
              <Ic x={-1.45} z={0.35} size={0.45} h={0.1} label="U2" pins={3} />
              <Ic x={1.6} z={-0.4} size={0.4} h={0.1} label="U3" pins={3} />
              <Silk x={0.2} z={-0.72} text="P1 · ESP32-S3" h={0.13} y={0.002} />
              <Batch
                items={Array.from({ length: 6 }, (_, k): Item => ({ p: [-1.05 + k * 0.28, 0.04, 0.62], s: [0.2, 0.08, 0.14], color: k % 2 ? '#8b6f47' : '#1a1a1a' }))}
                geo={M.box}
                mat={passiveMat}
              />
            </group>
          )}
        </group>
      ))}
    </group>
  )
}

function ModuleCard({ z, kind }: { z: number; kind: 'v2x' | 'shm' }) {
  const M = getMats()
  const x = CX
  const antenna = useMemo(() => {
    const out: Item[] = []
    for (let i = 0; i < 6; i++) {
      out.push({ p: [-1.95 + i * 0.12, 0, i % 2 ? 0.25 : -0.25], s: [0.05, 0.012, 0.55] })
      if (i < 5) out.push({ p: [-1.89 + i * 0.12, 0, i % 2 ? -0.5 : 0.5], s: [0.12, 0.012, 0.05] })
    }
    return out
  }, [])
  const header = useMemo(
    () => Array.from({ length: 6 }, (_, i): Item => ({ p: [1.65, 0.28, -0.5 + i * 0.2], s: [0.1, 0.42, 0.1] })),
    [],
  )
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, CARD.y + CARD.thick / 2, 0]} castShadow receiveShadow geometry={M.box} scale={[CARD.len, CARD.thick, CARD.wid]} material={M.cardMask} />
      <group position={[0, CARD.y + CARD.thick, 0]}>
        {kind === 'v2x' ? (
          <>
            <mesh position={[0.15, 0.1, 0]} castShadow receiveShadow geometry={M.box} scale={[1.45, 0.2, 1.15]} material={M.silver} />
            <Silk x={0.15} z={0} text="ESP32" h={0.22} y={0.205} color="#2a2d30" />
            <Batch items={antenna} geo={M.box} mat={M.copper} />
            <Ic x={1.55} z={-0.2} size={0.7} h={0.12} label="NRF24" sub="2.4G" pins={5} />
            <mesh position={[-0.2, 0.2, 0.6]} geometry={M.box} scale={[0.4, 0.3, 0.14]} material={M.darkMetal} />
          </>
        ) : (
          <>
            <Ic x={0.1} z={0} size={0.9} h={0.12} label="MPU6050" sub="I2C" pins={6} />
            <Ic x={-1.3} z={0.1} size={0.65} h={0.11} label="ESP32" pins={6} />
            <Batch items={header} geo={M.box} mat={M.gold} cast />
          </>
        )}
      </group>
      <Silk x={0} z={-1.05} text={kind === 'v2x' ? 'P2 · V2X' : 'P3 · SHM'} h={0.16} y={0.02} />
    </group>
  )
}

export function Cards() {
  const zs = ANCHOR.chip.map((c) => c[1])
  return (
    <>
      {zs.map((z) => (
        <Slot key={z} z={z} />
      ))}
      <LayerCard z={zs[0]} />
      <ModuleCard z={zs[1]} kind="v2x" />
      <ModuleCard z={zs[2]} kind="shm" />
      {zs.map((z) => (
        <Standoff key={z} x={CX + CARD.len / 2 - 0.25} z={z} />
      ))}
    </>
  )
}
