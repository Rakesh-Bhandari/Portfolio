import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

/** Subtle bloom for emissive LEDs / signal pulses only (high threshold). Desktop only. */
export default function Effects() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom intensity={0.7} luminanceThreshold={0.85} luminanceSmoothing={0.15} mipmapBlur radius={0.55} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}
