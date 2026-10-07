import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { damp3 } from 'maath/easing'
import { sample } from './keyframes'
import { scene } from './store'

const MAX_DT = import.meta.env.DEV && location.search.includes('fast') ? 1.5 : 0.1

/** Reads scroll progress and flies the camera between per-section keyframes with physical damping. */
export default function CameraRig({ capture, parallax }: { capture?: string | null; parallax: boolean }) {
  const { camera, size } = useThree()
  const cur = useMemo(() => ({ pos: new THREE.Vector3(), tgt: new THREE.Vector3(), side: 1, orbit: 0, init: false }), [])
  const want = useMemo(() => ({ pos: new THREE.Vector3(), tgt: new THREE.Vector3() }), [])
  const ptr = useRef({ x: 0, y: 0, sx: 0, sy: 0 })
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const offs = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    if (!parallax) return
    const on = (e: PointerEvent) => {
      ptr.current.x = (e.clientX / window.innerWidth) * 2 - 1
      ptr.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', on, { passive: true })
    return () => window.removeEventListener('pointermove', on)
  }, [parallax])

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, MAX_DT)
    const cam = camera as THREE.PerspectiveCamera
    const aspect = size.width / size.height
    const desktop = size.width >= 1280
    const capP = capture && capture.startsWith('p') ? parseFloat(capture.slice(1)) : 0
    let side = sample(capture ? capP : scene.p, want.pos, want.tgt)
    if (capture === 'og') side = 0

    // portrait screens need a longer lens distance so the subject still fits the width
    const k = aspect >= 1.2 ? 1 : 1 + ((1.2 - Math.max(aspect, 0.45)) / 0.75) * 0.85
    tmp.copy(want.pos).sub(want.tgt).multiplyScalar(k)
    want.pos.copy(want.tgt).add(tmp)

    // slow ambient drift (the only thing moving when scrolling stops)
    const t = state.clock.elapsedTime
    want.pos.x += Math.sin(t * 0.18) * 0.22
    want.pos.z += Math.cos(t * 0.14) * 0.18

    // after Contact the camera idles in a slow orbit of the whole board
    const orbiting = !capture && scene.section === 7 && scene.t > 0.55
    if (orbiting) cur.orbit += dt * 0.07
    else cur.orbit = THREE.MathUtils.damp(cur.orbit, 0, 1.2, dt)
    if (cur.orbit !== 0) {
      tmp.copy(want.pos).sub(want.tgt).applyAxisAngle(THREE.Object3D.DEFAULT_UP, Math.sin(cur.orbit) * 0.9)
      want.pos.copy(want.tgt).add(tmp)
    }

    if (!cur.init) {
      cur.pos.copy(want.pos)
      cur.tgt.copy(want.tgt)
      cur.side = side
      cur.init = true
    } else {
      damp3(cur.pos, want.pos, 1.6, dt)
      damp3(cur.tgt, want.tgt, 1.6, dt)
      cur.side = THREE.MathUtils.damp(cur.side, side, 3, dt)
    }

    // pointer parallax: ≤ ~2° toward the cursor (desktop only)
    const p = ptr.current
    p.sx = THREE.MathUtils.damp(p.sx, parallax ? p.x : 0, 3, dt)
    p.sy = THREE.MathUtils.damp(p.sy, parallax ? p.y : 0, 3, dt)
    const dist = cur.pos.distanceTo(cur.tgt)
    const amt = dist * Math.tan((2 * Math.PI) / 180)
    cam.position.copy(cur.pos)
    cam.lookAt(cur.tgt)
    offs.set(1, 0, 0).applyQuaternion(cam.quaternion).multiplyScalar(p.sx * amt)
    cam.position.add(offs)
    offs.set(0, 1, 0).applyQuaternion(cam.quaternion).multiplyScalar(-p.sy * amt * 0.6)
    cam.position.add(offs)
    cam.lookAt(cur.tgt)

    // move the focal point off-centre, away from the text column
    const W = size.width
    const H = size.height
    if (capture === 'og') {
      cam.clearViewOffset()
    } else if (desktop) {
      cam.setViewOffset(W, H, -cur.side * 0.21 * W, 0, W, H)
    } else {
      cam.setViewOffset(W, H, 0, (size.width < 768 ? 0.3 : 0.26) * H, W, H)
    }
    cam.updateProjectionMatrix()
  })
  return null
}
