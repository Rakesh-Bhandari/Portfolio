import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useThree } from '@react-three/fiber'
import { Grid } from '@react-three/drei'
import { RoomEnvironment } from 'three-stdlib'
import Board from './Board'
import CameraRig from './CameraRig'
import { Leds, SignalPulses } from './Signals'

const Effects = lazy(() => import('./Effects'))

function Env() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl)
    const rt = pm.fromScene(new (RoomEnvironment as unknown as new () => THREE.Scene)(), 0.04)
    scene.environment = rt.texture
    scene.environmentIntensity = 0.28
    scene.background = new THREE.Color('#07090A')
    scene.fog = new THREE.Fog('#07090A', 34, 80)
    return () => {
      rt.dispose()
      pm.dispose()
    }
  }, [gl, scene])
  return null
}

function Ready({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    // wait a couple of frames so the first paint has the board in it
    let n = 0
    let raf = 0
    const tick = () => (++n > 3 ? onReady?.() : (raf = requestAnimationFrame(tick)))
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onReady])
  return null
}

export default function Scene({ onReady, capture }: { onReady?: () => void; capture?: string | null }) {
  const [fonts, setFonts] = useState(false)
  const { mobile, desktop } = useMemo(() => {
    const w = window.innerWidth
    return { mobile: w < 768, desktop: w >= 1280 }
  }, [])

  useEffect(() => {
    let done = false
    const finish = () => !done && ((done = true), setFonts(true))
    document.fonts
      .load('500 48px "JetBrains Mono Variable"', 'RK-S3 U1 B RAKESHKUMAR 0123456789 .·-/')
      .then(finish, finish)
    const t = setTimeout(finish, 2000)
    return () => clearTimeout(t)
  }, [])

  if (!fonts) return null
  const canHover = desktop && window.matchMedia('(hover: hover)').matches

  return (
    <Canvas
      shadows={!mobile ? 'soft' : false}
      dpr={mobile ? [1, 1.5] : [1, 2]}
      camera={{ fov: mobile ? 46 : 35, near: 0.5, far: 120, position: [14.5, 20.5, 23.5] }}
      gl={{ antialias: !mobile, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.4 }}
      frameloop="always"
      style={{ position: 'absolute', inset: 0 }}
    >
      <Env />
      <hemisphereLight args={['#cdd8d2', '#0b1f17', 0.12]} />
      {/* warm key */}
      <directionalLight
        position={[7, 14, 8]}
        intensity={3.4}
        color="#ffd7ae"
        castShadow={!mobile}
        shadow-mapSize={[desktop ? 2048 : 1024, desktop ? 2048 : 1024]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={1}
        shadow-camera-far={45}
        shadow-bias={-0.0004}
        shadow-normalBias={0.025}
        shadow-radius={4}
      />
      {/* cool rim */}
      <directionalLight position={[-9, 5, -12]} intensity={0.7} color="#a9c6d6" />

      <Board low={mobile} />
      <SignalPulses />
      <Leds />
      <Grid
        position={[0, -0.3, 0]}
        args={[200, 200]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#16251d"
        sectionSize={4}
        sectionThickness={0.9}
        sectionColor="#1f3329"
        fadeDistance={46}
        fadeStrength={1.6}
        infiniteGrid
      />
      <CameraRig capture={capture} parallax={canHover && !capture} />
      {!mobile && (
        <Suspense fallback={null}>
          <Effects />
        </Suspense>
      )}
      <Ready onReady={onReady} />
    </Canvas>
  )
}
