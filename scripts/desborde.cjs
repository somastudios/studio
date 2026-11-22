// Revisa que nada se desborde a lo ancho en celular y captura cada pantalla interna.
//   node scripts/desborde.cjs <puerto> <carpeta-de-salida> [ancho] [alto]
const { chromium } = require('playwright')
const fs = require('fs')

;(async () => {
  const [puerto, salida, ancho = '390', alto = '844'] = process.argv.slice(2)
  fs.mkdirSync(salida, { recursive: true })
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: +ancho, height: +alto }, deviceScaleFactor: 2, isMobile: +ancho < 700, hasTouch: +ancho < 700 })
  const errores = []
  p.on('pageerror', (e) => errores.push('error: ' + e.message))
  p.on('console', (m) => m.type() === 'error' && !/supabase|Failed to load|ERR_|net::/i.test(m.text()) && errores.push('consola: ' + m.text()))
  await p.addInitScript(() => {
    localStorage.setItem('soma.local', '1')
    localStorage.setItem('soma.nombre', 'Dalí')
  })
  await p.goto(`http://localhost:${puerto}/#/crm`)
  await p.waitForTimeout(700)
  const id = await p.evaluate(async () => {
    const { store } = await import('/src/data/store.js')
    const d = (n) => {
      const x = new Date()
      x.setDate(x.getDate() + n)
      return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
    }
    const a = store.guardar('prospectos', { negocio: 'La Casona', nicho: 'restaurante', etapa: 'cliente', contacto: 'Rosa Elizondo', puesto: 'Dueña', telefono: '523411234567', alcance: 'Advanced', presupuesto: 'De $10 a $25 mil', modalidad_interes: 'mensual' })
    const b2 = store.guardar('prospectos', { negocio: 'Barbería El Patrón', nicho: 'barberia', etapa: 'demo', contacto: 'Iván Ochoa', telefono: '523419876543', proxima_accion: 'Terminar la demo de agenda' })
    const c = store.guardar('prospectos', { negocio: 'Farmacia San Rafael de la Asunción', nicho: 'farmacia', etapa: 'visitado', contacto: 'Lic. Sandoval' })
    store.guardar('prospectos', { negocio: 'Ferretería El Tornillo', nicho: 'ferreteria', etapa: 'nuevo' })
    store.guardar('prospectos', { negocio: 'Óptica Visión Clara', nicho: 'optica', etapa: 'propuesta', contacto: 'Dra. Meza' })
    const v = store.guardar('visitas', { prospecto_id: a.id, tipo: 1, inicio: new Date(Date.now() - 9 * 864e5).toISOString(), fin: new Date(Date.now() - 9 * 864e5 + 24 * 6e4).toISOString(), presentadores: ['dali'], estado: 'terminada', animo: 'abierto', resultado: 'agendo', notas: 'Le brillaron los ojos con las comandas en el celular.' })
    store.guardar('hallazgos', { prospecto_id: a.id, visita_id: v.id, area: 'atencion', problema_id: 'servicio-lento', titulo: 'El servicio en mesa es lento', etiquetas: ['Prefieren que los atiendan'], rutas: [{ sol: 'comandero', reaccion: 'interesa' }, { sol: 'pedidos-qr', reaccion: 'no' }], elegida: 'comandero', nota: 'En domingo no se dan abasto', estado: 'explorado', orden: 0 })
    store.guardar('hallazgos', { prospecto_id: a.id, visita_id: v.id, area: 'inventarios', problema_id: 'se-acaba-insumo', titulo: 'Se acaban ingredientes sin aviso', elegida: 'inventario-alertas', rutas: [], estado: 'explorado', orden: 1 })
    const pr = store.guardar('propuestas', { prospecto_id: a.id, titulo: 'Sistema para La Casona', resumen: 'Comandas en el celular de los meseros e inventario con alertas.', incluye: ['Comandas en el celular para 6 meseros', 'Pantalla de cocina', 'Inventario con alertas por WhatsApp'], precio_contado: 18000, precio_mensual: 1800, desc_6: 10, desc_12: 20, prueba_dias: 7, estado: 'aceptada', modalidad: 'mensual' })
    const s = store.guardar('sistemas', { prospecto_id: a.id, nombre: 'Comandas La Casona', url: 'https://lacasona.example', estado: 'activo', llave: 'soma_ejemplo123', modo_vencido: 'aviso', ultima_senal: new Date(Date.now() - 40 * 6e4).toISOString(), version: '1.2.0' })
    const m = store.guardar('membresias', { prospecto_id: a.id, sistema_id: s.id, propuesta_id: pr.id, modalidad: 'mensual', monto: 1800, moneda: 'MXN', inicio: d(-33), vence: d(-3), estado: 'activa' })
    store.guardar('pagos', { prospecto_id: a.id, membresia_id: m.id, concepto: 'Membresía mensual', monto: 1800, moneda: 'MXN', metodo: 'transferencia', estado: 'confirmado', fecha: d(-33), referencia: 'SPEI 88213', registrado_por: 'Dalí', cubre_hasta: d(-3) })
    store.guardar('membresias', { prospecto_id: b2.id, modalidad: 'prueba', monto: 0, inicio: d(-2), vence: d(5), estado: 'prueba' })
    store.guardar('membresias', { prospecto_id: c.id, modalidad: 'anual', monto: 17280, inicio: d(-40), vence: d(4), estado: 'activa' })
    store.guardar('citas', { prospecto_id: b2.id, tipo: 'visita2', inicio: new Date(d(2) + 'T17:00:00').toISOString(), minutos: 45, lugar: 'Barbería El Patrón', estado: 'pendiente' })
    store.guardar('citas', { prospecto_id: c.id, tipo: 'seguimiento', inicio: new Date(d(0) + 'T19:00:00').toISOString(), minutos: 30, estado: 'confirmada' })
    store.guardar('citas', { prospecto_id: c.id, tipo: 'seguimiento', inicio: null, por_mensaje: true, estado: 'pendiente' })
    store.anotar(a.id, 'visita', 'Primera visita completada.', null, 'Dalí')
    return a.id
  })

  const rutas = [
    ['/crm', 'hoy'],
    ['/crm/prospectos', 'prospectos'],
    [`/crm/prospecto/${id}`, 'expediente'],
    [`/crm/prospecto/${id}?t=propuesta`, 'expediente-propuesta'],
    [`/crm/prospecto/${id}?t=cuenta`, 'expediente-cuenta'],
    ['/crm/agenda', 'agenda'],
    ['/crm/cobranza', 'cobranza'],
    ['/crm/sistemas', 'sistemas'],
    ['/crm/ajustes', 'ajustes'],
    ['/presala', 'presala'],
  ]
  let n = 0
  for (const [ruta, nombre] of rutas) {
    await p.goto(`http://localhost:${puerto}/#${ruta}`)
    await p.waitForTimeout(1900)
    const info = await p.evaluate(() => {
      const w = innerWidth
      const malos = []
      document.querySelectorAll('#app *').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.width && (r.right > w + 1 || r.left < -1) && !el.closest('.a-tabs, [data-scroll-x], svg')) {
          const cs = getComputedStyle(el)
          if (cs.position === 'fixed') return
          malos.push(`${el.tagName.toLowerCase()}.${String(el.className.baseVal ?? el.className).split(' ').slice(0, 2).join('.')} (${Math.round(r.left)}→${Math.round(r.right)})`)
        }
      })
      return { ancho: document.querySelector('#app').scrollWidth, malos: [...new Set(malos)].slice(0, 6) }
    })
    if (info.ancho > +ancho + 1 || info.malos.length) errores.push(`${nombre}: se desborda (ancho ${info.ancho}) ${info.malos.join(' | ')}`)
    await p.screenshot({ path: `${salida}/${String(n++).padStart(2, '0')}-${nombre}.png` })
  }
  // Un diálogo, para ver cómo se acomoda.
  await p.goto(`http://localhost:${puerto}/#/crm/cobranza`)
  await p.waitForTimeout(1500)
  await p.locator('[data-pagar]').first().click().catch(() => errores.push('no se pudo abrir el diálogo de pago'))
  await p.waitForTimeout(600)
  await p.screenshot({ path: `${salida}/${String(n++).padStart(2, '0')}-dialogo.png` })
  console.log(errores.length ? errores.join('\n') : 'sin errores ni desbordes')
  await b.close()
})()
