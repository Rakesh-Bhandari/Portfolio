import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RIBBONS } from './layout'
import { ribbonGeometry } from './lib'
import { Led, Silk } from './parts'
import { scene } from './store'

const vert = /* glsl */ `
  attribute float aDist;
  varying float vD;
  void main() {
    vD = aDist;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const frag = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColor;
  varying float vD;
  void main() {
    // comet-shaped dashes travelling along increasing path distance
    float period = 3.2;
    float k = fract((vD - uTime * 3.2) / period);
    float head = smoothstep(0.62, 0.995, k) * (1.0 - step(0.997, k));
    float v = (head * head * 1.9 + 0.14) * uIntensity;
    gl_FragColor = vec4(uColor * v, v * 0.85);
  }
`

const keys = Object.keys(RIBBONS)

/** Which ribbons are energised for the current scroll position (0..1 each). */
function target(key: string): number {
  const s = scene.section
  const step = scene.projectStep
  switch (s) {
    case 0:
      return key === 'about' ? 0.55 : 0
    case 1:
      return key === 'about' ? 1 : 0
    case 2:
      return key === 'edu' ? 1 : key === 'about' ? 0.25 : 0
    case 3:
      return key === 'exp' ? 1 : key === 'edu' ? 0.25 : 0
    case 4:
      return key === `p${step}` ? 1 : key === 'exp' ? 0.3 : 0
    case 5:
      return key === 'skills' ? 1 : key === `p2` ? 0.25 : 0
    case 6:
      return key === 'certs' ? 1 : key === 'skills' ? 0.25 : 0
    default:
      return key === 'contact' ? 1 : 0.45 // power-on: everything flows
  }
}

export function SignalPulses() {
  const mats = useRef<Record<string, THREE.ShaderMaterial>>({})
  const geos = useMemo(() => keys.map((k) => ribbonGeometry(RIBBONS[k], 0.085, 0.02)), [])
  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos])
  useFrame((st, dt) => {
    for (const k of keys) {
      const m = mats.current[k]
      if (!m) continue
      m.uniforms.uTime.value = st.clock.elapsedTime
      m.uniforms.uIntensity.value = THREE.MathUtils.damp(m.uniforms.uIntensity.value, target(k), 3, dt)
    }
  })
  return (
    <group>
      {keys.map((k, i) => (
        <mesh key={k} geometry={geos[i]} frustumCulled={false} renderOrder={5}>
          <shaderMaterial
            ref={(m) => {
              if (m) mats.current[k] = m
            }}
            vertexShader={vert}
            fragmentShader={frag}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            uniforms={{
              uTime: { value: 0 },
              uIntensity: { value: 0 },
              uColor: { value: new THREE.Color('#3DDC97') },
            }}
          />
        </mesh>
      ))}
    </group>
  )
}

const LEDS = [
  { x: 3.0, z: -10.0, on: [0, 1], label: 'PWR' },
  { x: -7.0, z: -2.7, on: [2, 3], label: 'CLK' },
  { x: 3.0, z: -2.5, on: [4], label: 'RUN' },
  { x: -6.9, z: 4.0, on: [5], label: 'MEM' },
  { x: 0.4, z: 10.6, on: [6, 7], label: 'I/O' },
]

export function Leds() {
  const mats = useRef<(THREE.MeshStandardMaterial | null)[]>([])
  useFrame((_, dt) => {
    LEDS.forEach((l, i) => {
      const m = mats.current[i]
      if (!m) return
      const lit = scene.section >= 7 || l.on.includes(scene.section)
      m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, lit ? 1.8 : 0.0, 6, dt)
    })
  })
  return (
    <>
      {LEDS.map((l, i) => (
        <group key={l.label}>
          <Led x={l.x} z={l.z} refCb={(m) => void (mats.current[i] = m)} />
          <Silk x={l.x} z={l.z + 0.42} text={l.label} h={0.15} opacity={0.65} />
        </group>
      ))}
    </>
  )
}
