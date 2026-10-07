import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] })
for (const [name, opts] of [['reduced', { reducedMotion: 'reduce' }], ['nowebgl', {}]]) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, ...opts })
  const p = await ctx.newPage()
  if (name === 'nowebgl') await p.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null })
  p.on('pageerror', e => console.log(name, 'pageerror', e.message))
  await p.goto('http://127.0.0.1:5199/'); await p.waitForTimeout(3500)
  await p.screenshot({ path: `.vite/shots/fb-${name}.png` })
  const hidden = await p.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter(e => getComputedStyle(e).opacity === '0').length)
  console.log(name, 'hidden reveal elements:', hidden)
  await ctx.close()
}
await b.close()
