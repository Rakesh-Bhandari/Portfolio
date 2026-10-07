import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs'
const [,, url, w='1440', h='900'] = process.argv
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: +w, height: +h } })
await p.goto(url, { waitUntil: 'load' })
for (let i=0;i<4;i++){
  await p.waitForTimeout(3000)
  const f = await p.evaluate(() => new Promise(r => { let n=0; const t0=performance.now(); const f=()=>{ n++; if(performance.now()-t0<2000) requestAnimationFrame(f); else r(n/2) }; requestAnimationFrame(f) }))
  console.log('fps', f)
}
await b.close()
