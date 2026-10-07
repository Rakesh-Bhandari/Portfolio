import { RIBBONS, BUSES } from '../src/three/layout'
import { maxTurn } from '../src/three/lib'
let bad = 0
for (const [k, pl] of [...Object.entries(RIBBONS), ...BUSES.map((b, i) => ['bus' + i, b] as const)]) {
  const m = maxTurn(pl as never)
  if (m > 45.5) { bad++; console.log('BAD', k, m.toFixed(1), JSON.stringify(pl)) }
}
console.log(bad ? `${bad} bad routes` : 'all routes 45°-clean')
