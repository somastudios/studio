// Recorre la segunda visita con datos de ejemplo y captura cada escena.
//   node scripts/visita2.cjs <puerto> <carpeta-de-salida> [con-url]
const { chromium } = require('playwright')
const fs = require('fs')

;(async () => {
  const [puerto, salida, conUrl] = process.argv.slice(2)
  fs.mkdirSync(salida, { recursive: true })
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 1 })
  const errores = []
  p.on('pageerror', (e) => errores.push('error: ' + e.message))
  p.on('console', (m) => m.type() === 'error' && !/supabase|Failed to load|ERR_|net::/i.test(m.text()) && errores.push('consola: ' + m.text()))
  await p.addInitScript(() => {
    localStorage.setItem('soma.local', '1')
    localStorage.setItem('soma.nombre', 'Dalí')
  })
  await p.goto(`http://localhost:${puerto}/#/crm`)
  await p.waitForTimeout(700)
  const id = await p.evaluate(async (url) => {
    const { store } = await import('/src/data/store.js')
    const a = store.guardar('prospectos', { negocio: 'La Casona', nicho: 'restaurante', etapa: 'demo', contacto: 'Rosa Elizondo', telefono: '523411234567' })
    const v = store.guardar('visitas', { prospecto_id: a.id, tipo: 1, inicio: new Date(Date.now() - 7 * 864e5).toISOString(), presentadores: ['dali'], estado: 'terminada' })
    store.guardar('hallazgos', { prospecto_id: a.id, visita_id: v.id, area: 'atencion', problema_id: 'servicio-lento', titulo: 'El servicio en mesa es lento', elegida: 'comandero', nota: 'En domingo no se dan abasto', estado: 'explorado', orden: 0 })
    store.guardar('hallazgos', { prospecto_id: a.id, visita_id: v.id, area: 'inventarios', problema_id: 'se-acaba-insumo', titulo: 'Se acaban ingredientes sin aviso', elegida: 'inventario-alertas', estado: 'explorado', orden: 1 })
    store.guardar('hallazgos', { prospecto_id: a.id, visita_id: v.id, area: 'organizacion', problema_id: 'comandas-perdidas', titulo: 'Las comandas se pierden o llegan mal', a_medida: true, estado: 'explorado', orden: 2 })
    store.guardar('propuestas', { prospecto_id: a.id, titulo: 'Sistema para La Casona', demo_url: url || null, incluye: ['Comandas en el celular para 6 meseros', 'Pantalla de cocina', 'Inventario con alertas por WhatsApp', 'Capacitación al equipo'], precio_contado: 18000, precio_mensual: 1800, desc_6: 10, desc_12: 20, prueba_dias: 7, mantenimiento: 'Soporte y correcciones sin costo durante 3 meses.', estado: 'lista' })
    store.ponAjuste('banco', { titular: 'Soma Studio', banco: 'BBVA', clabe: '012 345 6789 0123 4567', cuenta: '' })
    return a.id
  }, conUrl ? `http://localhost:${puerto}/#/demo/comandero/mesas?n=restaurante&b=La%20Casona` : '')
  let n = 0
  const foto = async (nombre, espera = 2800) => {
    await p.waitForTimeout(espera)
    await p.screenshot({ path: `${salida}/${String(n++).padStart(2, '0')}-${nombre}.png` })
  }
  await p.goto(`http://localhost:${puerto}/#/visita2/${id}`)
  await foto('portada', 3200)
  await p.keyboard.press('ArrowRight'); await foto('recap', 3200)
  await p.keyboard.press('ArrowRight'); await foto('demo')
  await p.keyboard.press('ArrowRight'); await foto('precio')
  await p.locator('[data-plazo="12"]').click().catch((e) => errores.push('plazo: ' + e.message.split('\n')[0]))
  await foto('precio-12', 700)
  await p.keyboard.press('ArrowRight'); await foto('pago')
  await p.keyboard.press('ArrowRight'); await p.waitForTimeout(1800)
  // El espacio en construcción (si está encendido en src/config.js).
  if (await p.locator('.ve').count()) { await foto('espacio-entrega', 900); await p.keyboard.press('ArrowRight') }
  await foto('decision')
  await p.locator('[data-op="mensual"]').click().catch((e) => errores.push('decision: ' + e.message.split('\n')[0]))
  await foto('decision-elegida', 1000)
  await p.keyboard.press('ArrowRight'); await foto('cierre', 3200)
  await p.locator('[data-act="salir"]').first().click()
  await foto('crm-propuesta', 1000)
  await p.locator('[data-activar]').click().catch((e) => errores.push('activar: ' + e.message.split('\n')[0]))
  await foto('crm-activado', 900)
  const fin = await p.evaluate(async (id) => {
    const { store } = await import('/src/data/store.js')
    return { etapa: store.uno('prospectos', id).etapa, propuesta: store.lista('propuestas', { prospecto_id: id })[0].estado, membresias: store.lista('membresias', { prospecto_id: id }).map((m) => `${m.modalidad} ${m.monto} vence ${m.vence}`) }
  }, id)
  console.log(JSON.stringify(fin))
  console.log(errores.length ? errores.join('\n') : 'sin errores')
  await b.close()
})()
