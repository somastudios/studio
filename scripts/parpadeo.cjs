//   node scripts/parpadeo.cjs <puerto> [ancho] [alto] [ruta] [segundos]
// Mide posibles parpadeos en el CRM: cuadros en que un trazo boil no muestra ninguna (o más de una)
// de sus tres variantes, repintados completos del contenido y animaciones de opacidad a saltos.
const { chromium } = require('playwright')
;(async () => {
  const [puerto, ancho = '390', alto = '844', ruta = '/crm/ajustes', seg = '12'] = process.argv.slice(2)
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: +ancho, height: +alto }, isMobile: +ancho < 700, hasTouch: +ancho < 700 })
  await p.addInitScript(() => { localStorage.setItem('soma.local', '1'); localStorage.setItem('soma.nombre', 'Dalí') })
  await p.goto(`http://localhost:${puerto}/#${ruta}`)
  await p.waitForTimeout(2500)
  const r = await p.evaluate(async (seg) => {
    const grupos = [...document.querySelectorAll('#app .boil')].filter((g) => g.children.length === 3)
    let cuadros = 0, malos = 0, ejemplos = []
    let repintes = 0
    const obs = new MutationObserver((m) => m.forEach((x) => x.type === 'childList' && x.target.classList?.contains('a-pagina') && repintes++))
    obs.observe(document.querySelector('.a-pagina'), { childList: true })
    const fin = performance.now() + seg * 1000
    await new Promise((ok) => {
      const paso = () => {
        cuadros++
        for (const g of grupos) {
          if (!g.isConnected) continue
          const vis = [...g.children].filter((c) => getComputedStyle(c).visibility === 'visible').length
          if (vis !== 1) {
            malos++
            if (ejemplos.length < 4) ejemplos.push(`${vis} visibles en ${g.closest('[class]')?.className?.baseVal ?? g.parentElement?.className}`)
          }
        }
        performance.now() < fin ? requestAnimationFrame(paso) : ok()
      }
      requestAnimationFrame(paso)
    })
    obs.disconnect()
    const saltos = [...document.querySelectorAll('#app *')].flatMap((e) => e.getAnimations()).filter((a) => /parpadea/.test(a.animationName || ''))
    return { cuadros, grupos: grupos.length, malos, ejemplos, repintes, parpadeaActivas: saltos.length }
  }, +seg)
  console.log(JSON.stringify(r))
  await b.close()
})()
