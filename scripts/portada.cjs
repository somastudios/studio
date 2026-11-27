// La portada de una visita, cuadro por cuadro. Detiene el reloj de GSAP y lo avanza a mano, así
// que cada foto es exactamente el instante que dice.
//   node scripts/portada.cjs <puerto> <carpeta-de-salida> [negocio] [ancho] [alto]
// Deja llegada.png, escribe.png y borra.png (tiras de cuadros) y tiempo-0.png, tiempo-1.png.
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
const [, , puerto, salida, negocio = 'La Casona', ancho = '1440', alto = '810'] = process.argv
;(async () => {
  const dir = path.resolve(salida)
  fs.mkdirSync(dir, { recursive: true })
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: +ancho, height: +alto }, deviceScaleFactor: 1 })
  const errores = []
  p.on('pageerror', (e) => errores.push(e.message))
  await p.addInitScript(() => {
    try {
      localStorage.setItem('soma.local', '1')
      localStorage.setItem('soma.nombre', 'Dalí')
    } catch {}
  })
  await p.goto(`http://localhost:${puerto}/#/presala`)
  await p.waitForTimeout(1200)
  await p.fill('#ps-negocio', negocio)
  await p.locator('[data-nicho="restaurante"]').click()

  // Cámara lenta: el reloj de GSAP corre 12 veces más despacio y la foto se toma cuando llega
  // al instante pedido. Cada cuadro lleva el instante real en que se tomó.
  const LENTO = 12
  const ahora = () => p.evaluate(() => window.__portada?.actual().time() ?? 0)
  async function tira(nombre, accion, tiempos, cols = 5) {
    await p.evaluate((k) => window.__gsap.globalTimeline.timeScale(1 / k), LENTO)
    await accion()
    await p.waitForTimeout(250)
    const t0 = 0
    const celdas = []
    for (const t of tiempos) {
      let real = (await ahora()) - t0
      while (real < t - 0.004) {
        await p.waitForTimeout(Math.max(8, (t - real) * 1000 * LENTO * 0.6))
        real = (await ahora()) - t0
      }
      const f = `${dir}/_${nombre}-${celdas.length}.png`
      await p.screenshot({ path: f })
      if (process.env.LOG) console.log(nombre, t, real.toFixed(3), new Date().toISOString().slice(14, 23))
      celdas.push('<div style="position:relative"><img src="file://' + f + '" style="width:100%;display:block"><b style="position:absolute;left:4px;top:3px;background:#fff;color:#000;padding:0 4px;font:12px sans-serif">' + real.toFixed(2) + ' s</b></div>')
    }
    await p.evaluate(() => window.__gsap.globalTimeline.timeScale(1))
    await p.waitForTimeout(2500)
    fs.writeFileSync(`${dir}/_${nombre}.html`, '<body style="margin:0;background:#888"><div style="display:grid;grid-template-columns:repeat(' + cols + ',1fr);gap:4px;padding:4px">' + celdas.join('') + '</div></body>')
    const h = await b.newPage({ viewport: { width: 1600, height: 600 } })
    await h.goto(`file://${dir}/_${nombre}.html`)
    await h.waitForTimeout(400)
    await h.screenshot({ path: `${dir}/${nombre}.png`, fullPage: true })
    await h.close()
  }

  await tira('llegada', () => p.locator('[data-empezar]').click(), [0.1, 0.35, 0.52, 0.6, 0.64, 0.7, 0.8, 0.95, 1.05, 1.15, 1.35, 1.6, 2.4])
  await p.waitForTimeout(600)
  await p.screenshot({ path: `${dir}/tiempo-0.png` })
  await tira('escribe', () => p.keyboard.press('ArrowRight'), [0.08, 0.2, 0.35, 0.5, 0.65, 0.8, 0.9, 1.0, 1.15, 1.3, 1.45, 1.6, 1.68, 1.8, 2.3])
  await p.waitForTimeout(600)
  await p.screenshot({ path: `${dir}/tiempo-1.png` })
  await tira('borra', () => p.keyboard.press('ArrowLeft'), [0.1, 0.3, 0.5, 0.7, 0.85, 1.0, 1.15, 1.3, 1.45, 1.6, 1.7, 1.85, 2.4])
  // ida y vuelta con la escena siguiente
  await p.keyboard.press('ArrowRight')
  await p.waitForTimeout(2600)
  await p.keyboard.press('ArrowRight')
  await p.waitForTimeout(1800)
  await p.keyboard.press('ArrowLeft')
  await p.waitForTimeout(2600)
  await p.screenshot({ path: `${dir}/regreso.png` })
  console.log('errores:', errores.length ? [...new Set(errores)].join(' | ') : 0)
  await b.close()
})()
