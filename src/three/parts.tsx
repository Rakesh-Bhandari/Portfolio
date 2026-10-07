import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { chipTexture, labelTexture } from './lib'
import { getMats } from './materials'

export interface Item {
  p: [number, number, number]
  ry?: number
  s: [number, number, number]
  color?: string
}

const d = new THREE.Object3D()
const c = new THREE.Color()

/** Many identical parts in one draw call. */
export function Batch({
  items,
  geo,
  mat,
  cast = false,
}: {
  items: Item[]
  geo: THREE.BufferGeometry
  mat: THREE.Material
  cast?: boolean
}) {
  const ref = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    items.forEach((it, i) => {
      d.position.set(...it.p)
      d.rotation.set(0, it.ry ?? 0, 0)
      d.scale.set(...it.s)
      d.updateMatrix()
      m.setMatrixAt(i, d.matrix)
      if (it.color) m.setColorAt(i, c.set(it.color))
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    m.computeBoundingSphere()
  }, [items])
  if (!items.length) return null
  return <instancedMesh key={items.length} ref={ref} args={[geo, mat, items.length]} castShadow={cast} receiveShadow frustumCulled={false} />
}

/** Silkscreen text lying flat on the board. */
export function Silk({
  x,
  z,
  text,
  h = 0.3,
  rot = 0,
  opacity = 0.8,
  color = '#b8b6b1',
  y = 0.024,
  align = 'center',
}: {
  x: number
  z: number
  text: string
  h?: number
  rot?: number
  opacity?: number
  color?: string
  y?: number
  align?: 'center' | 'left'
}) {
  const { tex, aspect } = useMemo(() => labelTexture(text), [text])
  const w = h * aspect
  const off = align === 'left' ? w / 2 : 0
  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[off, 0, 0]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} color={color} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Dark IC with gold leads and a printed top. */
export function Ic({
  x,
  z,
  size = 1,
  h = 0.14,
  label,
  sub,
  rot = 0,
  pins = 8,
  y = 0,
}: {
  x: number
  z: number
  size?: number
  h?: number
  label: string
  sub?: string
  rot?: number
  pins?: number
  y?: number
}) {
  const M = getMats()
  const tex = useMemo(
    () => chipTexture(sub ? [label, sub] : [label], { bg: '#0d0e10', fg: '#b9b7b2', size: 256 }),
    [label, sub],
  )
  const leads = useMemo(() => {
    const out: Item[] = []
    const pitch = size / (pins + 1)
    for (let i = 1; i <= pins; i++) {
      const o = -size / 2 + i * pitch
      out.push({ p: [o, 0.02, size / 2 + 0.04], s: [pitch * 0.45, 0.025, 0.14] })
      out.push({ p: [o, 0.02, -size / 2 - 0.04], s: [pitch * 0.45, 0.025, 0.14] })
      out.push({ p: [size / 2 + 0.04, 0.02, o], s: [0.14, 0.025, pitch * 0.45] })
      out.push({ p: [-size / 2 - 0.04, 0.02, o], s: [0.14, 0.025, pitch * 0.45] })
    }
    return out
  }, [size, pins])
  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]}>
      <RoundedBox args={[size, h, size]} radius={0.025} smoothness={2} position={[0, h / 2, 0]} castShadow receiveShadow material={M.ic} />
      <mesh position={[0, h + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size * 0.94, size * 0.94]} />
        <meshStandardMaterial map={tex} roughness={0.5} metalness={0.1} />
      </mesh>
      <Batch items={leads} geo={M.box} mat={M.gold} />
    </group>
  )
}

/** The main SoC: socket, LGA lands and a nickel heat-spreader with engraved text. */
export function Soc({ x, z }: { x: number; z: number }) {
  const M = getMats()
  const tex = useMemo(
    () => chipTexture(['RK-S3', 'B RAKESHKUMAR', 'ECE · 2027'], { bg: '#9aa0a6', fg: '#2b2e31', size: 512, border: '#6c7075' }),
    [],
  )
  const lands = useMemo(() => {
    const out: Item[] = []
    for (let i = 0; i < 22; i++) {
      const o = -2.1 + i * 0.2
      out.push({ p: [o, 0.105, 2.2], s: [0.1, 0.012, 0.16] }, { p: [o, 0.105, -2.2], s: [0.1, 0.012, 0.16] })
      out.push({ p: [2.2, 0.105, o], s: [0.16, 0.012, 0.1] }, { p: [-2.2, 0.105, o], s: [0.16, 0.012, 0.1] })
    }
    return out
  }, [])
  return (
    <group position={[x, 0, z]}>
      <RoundedBox args={[4.7, 0.1, 4.7]} radius={0.04} smoothness={2} position={[0, 0.05, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#15191b" roughness={0.6} metalness={0.3} />
      </RoundedBox>
      <Batch items={lands} geo={M.box} mat={M.gold} />
      <RoundedBox args={[3.7, 0.2, 3.7]} radius={0.03} smoothness={2} position={[0, 0.2, 0]} castShadow receiveShadow material={M.ic} />
      <RoundedBox args={[3.35, 0.06, 3.35]} radius={0.05} smoothness={3} position={[0, 0.33, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#aeb3b8" metalness={0.85} roughness={0.42} />
      </RoundedBox>
      <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 3.2]} />
        <meshStandardMaterial map={tex} metalness={0.85} roughness={0.42} />
      </mesh>
    </group>
  )
}

export function Crystal({ x, z }: { x: number; z: number }) {
  const M = getMats()
  const { tex, aspect } = useMemo(() => labelTexture('25.000'), [])
  return (
    <group position={[x, 0, z]}>
      <Batch
        items={[
          { p: [-0.85, 0.008, 0], s: [0.3, 0.014, 0.55] },
          { p: [0.85, 0.008, 0], s: [0.3, 0.014, 0.55] },
        ]}
        geo={M.box}
        mat={M.gold}
      />
      <RoundedBox args={[1.7, 0.34, 0.64]} radius={0.16} smoothness={3} position={[0, 0.2, 0]} castShadow receiveShadow material={M.silver} />
      <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.32 * aspect, 0.32]} />
        <meshBasicMaterial map={tex} color="#2a2d30" transparent opacity={0.85} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  )
}

export function Inductor({ x, z }: { x: number; z: number }) {
  const M = getMats()
  return (
    <group position={[x, 0, z]}>
      <RoundedBox args={[1.05, 0.58, 1.05]} radius={0.06} smoothness={2} position={[0, 0.29, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#17191b" roughness={0.45} metalness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.585, 0]} castShadow>
        <boxGeometry args={[0.8, 0.02, 0.8]} />
        <primitive object={M.darkMetal} attach="material" />
      </mesh>
      <Batch
        items={[
          { p: [-0.58, 0.012, 0], s: [0.22, 0.014, 0.7] },
          { p: [0.58, 0.012, 0], s: [0.22, 0.014, 0.7] },
        ]}
        geo={M.box}
        mat={M.gold}
      />
    </group>
  )
}

export function Mosfet({ x, z }: { x: number; z: number }) {
  const M = getMats()
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.08, 0.05]} castShadow receiveShadow geometry={M.box} material={M.ic} scale={[0.46, 0.15, 0.5]} />
      <mesh position={[0, 0.06, -0.3]} geometry={M.box} material={M.silver} scale={[0.4, 0.04, 0.2]} />
      <Batch
        items={[-0.14, 0, 0.14].map((o) => ({ p: [o, 0.02, 0.36] as [number, number, number], s: [0.07, 0.025, 0.16] as [number, number, number] }))}
        geo={M.box}
        mat={M.silver}
      />
    </group>
  )
}

export function Electrolytic({ x, z, r = 0.34, h = 0.72 }: { x: number; z: number; r?: number; h?: number }) {
  const M = getMats()
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2 + 0.03, 0]} castShadow receiveShadow geometry={M.cyl} scale={[r, h, r]}>
        <meshStandardMaterial color="#0e1214" roughness={0.45} metalness={0.3} />
      </mesh>
      <mesh position={[0, h + 0.035, 0]} geometry={M.cyl} scale={[r * 0.92, 0.02, r * 0.92]} material={M.silver} />
      <mesh position={[0, h * 0.42 + 0.03, 0]} geometry={M.cyl} scale={[r * 1.004, h * 0.62, r * 1.004]}>
        <meshStandardMaterial color="#1c2327" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.015, 0]} geometry={M.cyl} scale={[r * 1.08, 0.03, r * 1.08]} material={M.plastic} />
    </group>
  )
}

export function Led({ x, z, refCb }: { x: number; z: number; refCb: (m: THREE.MeshStandardMaterial | null) => void }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.07, 0]} castShadow>
        <boxGeometry args={[0.36, 0.12, 0.22]} />
        <meshStandardMaterial ref={refCb} color="#12301f" emissive="#3DDC97" emissiveIntensity={0} roughness={0.35} toneMapped={false} />
      </mesh>
      <Batch
        items={[
          { p: [-0.2, 0.008, 0], s: [0.1, 0.014, 0.2] },
          { p: [0.2, 0.008, 0], s: [0.1, 0.014, 0.2] },
        ]}
        geo={getMats().box}
        mat={getMats().gold}
      />
    </group>
  )
}

/** 4 DDR-style slots with two modules standing in them. */
export function DimmBank({ x, z }: { x: number; z: number }) {
  const M = getMats()
  const pitch = 0.95
  const slots = [0, 1, 2, 3].map((i) => z + (i - 1.5) * pitch)
  const chips = useMemo(() => {
    const out: Item[] = []
    for (let i = 0; i < 8; i++) {
      const xx = -2.9 + i * 0.83
      out.push({ p: [xx, 0.8, 0.07], s: [0.62, 0.5, 0.05] }, { p: [xx, 0.8, -0.07], s: [0.62, 0.5, 0.05] })
    }
    return out
  }, [])
  return (
    <group position={[x, 0, 0]}>
      {slots.map((zz, i) => (
        <group key={i} position={[0, 0, zz]}>
          <mesh position={[0, 0.17, 0]} castShadow receiveShadow geometry={M.box} scale={[7.2, 0.34, 0.44]} material={M.plastic} />
          <mesh position={[0, 0.348, 0]} geometry={M.box} scale={[7.0, 0.012, 0.09]}>
            <meshStandardMaterial color="#2b3033" roughness={0.6} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 3.72, 0.26, 0]} castShadow geometry={M.box} scale={[0.3, 0.52, 0.5]}>
              <meshStandardMaterial color="#bdb8ad" roughness={0.6} />
            </mesh>
          ))}
          {(i === 0 || i === 2) && (
            <group position={[0, 0, 0]}>
              <mesh position={[0, 0.74, 0]} castShadow receiveShadow geometry={M.box} scale={[6.7, 1.15, 0.09]} material={M.cardMask} />
              <Batch items={chips} geo={M.box} mat={M.ic} cast />
              <mesh position={[0, 0.2, 0]} geometry={M.box} scale={[6.5, 0.1, 0.1]} material={M.gold} />
            </group>
          )}
        </group>
      ))}
    </group>
  )
}

export function UsbC({ x, z }: { x: number; z: number }) {
  const M = getMats()
  return (
    <group position={[x, 0, z]}>
      <Batch
        items={[
          { p: [-0.9, 0.008, -0.2], s: [0.22, 0.014, 0.5] },
          { p: [0.9, 0.008, -0.2], s: [0.22, 0.014, 0.5] },
        ]}
        geo={M.box}
        mat={M.gold}
      />
      <RoundedBox args={[1.7, 0.52, 1.5]} radius={0.2} smoothness={4} position={[0, 0.27, 0.1]} castShadow receiveShadow material={M.silver} />
      <mesh position={[0, 0.3, 0.88]} geometry={M.box} scale={[1.2, 0.2, 0.06]}>
        <meshStandardMaterial color="#050606" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function Header({ x, z, cols = 8 }: { x: number; z: number; cols?: number }) {
  const M = getMats()
  const pins = useMemo(() => {
    const out: Item[] = []
    for (let i = 0; i < cols; i++)
      for (const r of [-0.2, 0.2]) out.push({ p: [-((cols - 1) * 0.4) / 2 + i * 0.4, 0.5, r], s: [0.1, 0.6, 0.1] })
    return out
  }, [cols])
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow geometry={M.box} scale={[cols * 0.4 + 0.1, 0.3, 0.8]} material={M.plastic} />
      <Batch items={pins} geo={M.box} mat={M.gold} cast />
    </group>
  )
}

export function IoStack({ x, z }: { x: number; z: number }) {
  const M = getMats()
  return (
    <group position={[x, 0, z]}>
      <mesh position={[-1.1, 0.5, 0]} castShadow receiveShadow geometry={M.box} scale={[1.7, 1.0, 2.5]} material={M.silver} />
      <mesh position={[-1.1, 1.003, -0.35]} geometry={M.box} scale={[0.9, 0.01, 1.2]} material={M.darkMetal} />
      <mesh position={[0.8, 0.56, 0]} castShadow receiveShadow geometry={M.box} scale={[1.5, 1.12, 2.5]} material={M.silver} />
      <mesh position={[0.8, 1.123, -0.2]} geometry={M.box} scale={[1.0, 0.01, 1.4]} material={M.darkMetal} />
      {[-0.85, 0, 0.85].map((o, i) => (
        <mesh key={i} position={[2.4, 0.3, o]} castShadow receiveShadow geometry={M.box} scale={[0.65, 0.6, 1.0]}>
          <meshStandardMaterial color={['#181a1c', '#1a1f1c', '#1e1c19'][i]} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function MountHole({ x, z }: { x: number; z: number }) {
  const M = getMats()
  return (
    <group position={[x, 0.012, z]}>
      <mesh geometry={M.cyl} scale={[0.34, 0.014, 0.34]} material={M.gold} />
      <mesh position={[0, 0.01, 0]} geometry={M.cyl} scale={[0.2, 0.014, 0.2]}>
        <meshBasicMaterial color="#030504" />
      </mesh>
    </group>
  )
}
