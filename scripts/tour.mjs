import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs'
const [,, url, prefix, w='1440', h='900', ...ids] = process.argv
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: +w, height: +h } })
p.on('console', m => { if (m.type()==='error') console.log('[console]', m.text().slice(0,300)) })
p.on('pageerror', e => console.log('[pageerror]', e.message.slice(0,400)))
await p.goto(url, { waitUntil: "load" })
await p.waitForTimeout(7000)
for (const spec of ids) {
  const [id, off='0'] = spec.split(':')
  await p.evaluate(([id, off]) => { const el = document.getElementById(id); window.scrollTo(0, el ? el.getBoundingClientRect().top + window.scrollY + +off : +off) }, [id, off])
  await p.waitForTimeout(7000)
  await p.screenshot({ path: `${prefix}-${id}${off !== '0' ? '-' + off : ''}.png` })
}
await b.close()
