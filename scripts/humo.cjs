// Prueba de humo: abre todas las demos y arranca una visita en cada giro, buscando errores.
//   node scripts/humo.cjs <puerto>
const { chromium } = require('playwright')

;(async () => {
  const [puerto] = process.argv.slice(2)
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1 })
  const errores = []
  let donde = ''
  p.on('pageerror', (e) => errores.push(`${donde}: ${e.message}`))
  p.on('console', (m) => m.type() === 'error' && !/supabase|Failed to load|ERR_|net::/i.test(m.text()) && errores.push(`${donde}: ${m.text()}`))
  await p.addInitScript(() => {
    localStorage.setItem('soma.local', '1')
    localStorage.setItem('soma.nombre', 'Prueba')
  })
  await p.goto(`http://localhost:${puerto}/#/crm`)
  await p.waitForTimeout(800)

  const { demos, nichos } = await p.evaluate(async () => {
    const { MODS } = await import('/src/demos/index.js')
    const { NICHOS } = await import('/src/content/nichos/index.js')
    return { demos: Object.values(MODS).flatMap((m) => Object.keys(m.vistas).map((v) => `${m.id}/${v}`)), nichos: NICHOS.map((n) => n.id) }
  })

  // 1. Cada demo, con dos giros distintos.
  for (const d of demos) {
    for (const n of ['restaurante', 'general', 'barberia']) {
      donde = `demo ${d} (${n})`
      await p.goto(`http://localhost:${puerto}/#/demo/${d}?n=${n}&b=Negocio%20de%20Prueba`)
      await p.waitForTimeout(350)
      const vacia = await p.evaluate(() => !document.querySelector('.dk')?.children.length || !!document.querySelector('.dk > .dk-vacio'))
      if (vacia) errores.push(`${donde}: la demo no pintó nada`)
    }
  }

  // 2. Cada giro: lo que suele pasar y el diagnóstico de su primer problema frecuente.
  for (const n of nichos) {
    donde = `giro ${n}`
    const id = await p.evaluate(async (n) => {
      const { store } = await import('/src/data/store.js')
      const pr = store.guardar('prospectos', { negocio: 'Negocio de Prueba', nicho: n, etapa: 'nuevo' })
      return store.guardar('visitas', { prospecto_id: pr.id, tipo: 1, inicio: new Date().toISOString(), presentadores: ['dali'], estado: 'en_curso', datos: { escena: 3 } }).id
    }, n)
    await p.goto(`http://localhost:${puerto}/#/visita/${id}`)
    await p.waitForTimeout(1500)
    const filas = await p.locator('.vs-item').count()
    if (filas < 5) errores.push(`${donde}: "lo que suele pasar" muestra ${filas} problemas`)
    await p.locator('.vs-item').first().click().catch(() => errores.push(`${donde}: no se pudo marcar un problema`))
    await p.waitForTimeout(250)
    await p.keyboard.press('ArrowRight')
    await p.waitForTimeout(1900)
    const rutas = await p.locator('.vd-tab').count()
    if (rutas !== 4) errores.push(`${donde}: el diagnóstico muestra ${rutas} rutas`)
    const pasos = await p.locator('.fl-paso').count()
    if (pasos !== 3) errores.push(`${donde}: el flujo tiene ${pasos} pasos`)
  }

  console.log(`${demos.length} demos × 3 giros · ${nichos.length} giros`)
  console.log(errores.length ? errores.join('\n') : 'sin errores')
  await b.close()
  process.exit(errores.length ? 1 : 0)
})()
