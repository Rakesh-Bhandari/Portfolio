import * as THREE from 'three'
import { weaveTexture } from './lib'

let cached: ReturnType<typeof make> | null = null

function make() {
  const weave = weaveTexture()
  const mats = {
    mask: new THREE.MeshPhysicalMaterial({
      color: '#0d2619',
      roughness: 0.6,
      metalness: 0,
      clearcoat: 0.12,
      clearcoatRoughness: 0.45,
      bumpMap: weave,
      bumpScale: 0.35,
    }),
    copper: new THREE.MeshStandardMaterial({ color: '#C8875A', metalness: 1, roughness: 0.35 }),
    gold: new THREE.MeshStandardMaterial({ color: '#D4AF6A', metalness: 1, roughness: 0.28 }),
    ic: new THREE.MeshStandardMaterial({ color: '#0d0e10', roughness: 0.55, metalness: 0.15 }),
    plastic: new THREE.MeshStandardMaterial({ color: '#111314', roughness: 0.7, metalness: 0 }),
    silver: new THREE.MeshStandardMaterial({ color: '#c3c7cb', metalness: 1, roughness: 0.3 }),
    darkMetal: new THREE.MeshStandardMaterial({ color: '#4b4f55', metalness: 0.9, roughness: 0.4 }),
    cardMask: new THREE.MeshStandardMaterial({ color: '#0e3022', roughness: 0.5, metalness: 0 }),
    passive: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.55 }),
    silk: new THREE.MeshBasicMaterial({ color: '#b8b6b1', toneMapped: false }),
    box: new THREE.BoxGeometry(1, 1, 1),
    cyl: new THREE.CylinderGeometry(1, 1, 1, 20),
  }
  mats.silver.envMapIntensity = 2.6
  mats.darkMetal.envMapIntensity = 1.8
  mats.gold.envMapIntensity = 1.8
  mats.copper.envMapIntensity = 1.6
  return mats
}

export const getMats = () => (cached ??= make())
