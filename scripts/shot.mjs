import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs'
const [,, url, out, w='1440', h='900', scroll='0', wait='3500'] = process.argv
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: +w, height: +h } })
p.on('console', m => { if (['error','warning'].includes(m.type())) console.log('[console]', m.type(), m.text().slice(0,300)) })
p.on('pageerror', e => console.log('[pageerror]', e.message.slice(0,400)))
await p.goto(url, { waitUntil: 'load' })
await p.waitForTimeout(+wait)
if (+scroll) { await p.evaluate(y => window.scrollTo(0, y), +scroll); await p.waitForTimeout(3500) }
await p.screenshot({ path: out })
await b.close()
