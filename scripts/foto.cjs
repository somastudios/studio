// Toma una captura de una ruta de la app y reporta errores de consola.
//
//   node scripts/foto.cjs <puerto> '<ruta>' <salida.png> [ancho] [alto] [esperaMs] [clics]
//
//   <ruta>   la parte después del #, por ejemplo  /demo/pedidos/cliente?n=restaurante&b=La%20Casona
//   [clics]  selectores CSS separados por "|" que se van tocando en orden antes de la captura
//
// Entra en "modo de este dispositivo" para no pedir cuenta.

const { chromium } = require('playwright')

;(async () => {
  const [puerto, ruta, salida, ancho = '1440', alto = '900', espera = '1500', clics = ''] = process.argv.slice(2)
  if (!puerto || !ruta || !salida) {
    console.error("uso: node scripts/foto.cjs <puerto> '<ruta>' <salida.png> [ancho] [alto] [esperaMs] [clics]")
    process.exit(2)
  }
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: +ancho, height: +alto }, deviceScaleFactor: 1 })
  const errores = []
  p.on('pageerror', (e) => errores.push('error: ' + e.message))
  p.on('console', (m) => {
    if (m.type() !== 'error') return
    const t = m.text()
    if (/supabase|Failed to load resource|ERR_|net::/i.test(t)) return // sin red en el contenedor de pruebas
    errores.push('consola: ' + t)
  })
  await p.addInitScript(() => {
    localStorage.setItem('soma.local', '1')
    if (!localStorage.getItem('soma.nombre')) localStorage.setItem('soma.nombre', 'Prueba')
  })
  await p.goto(`http://localhost:${puerto}/#${ruta}`)
  await p.waitForTimeout(+espera)
  for (const sel of clics.split('|').filter(Boolean)) {
    try {
      await p.locator(sel).first().click({ timeout: 4000 })
      await p.waitForTimeout(600)
    } catch (e) {
      errores.push(`no se pudo tocar "${sel}": ${e.message.split('\n')[0]}`)
    }
  }
  await p.screenshot({ path: salida })
  console.log(errores.length ? errores.join('\n') : 'sin errores')
  await b.close()
  process.exit(errores.length ? 1 : 0)
})()
