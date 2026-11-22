// Revisa que el contenido esté completo y bien formado:
// nichos, problemas, rutas, soluciones, iconos y demos.
//
//   node scripts/validar.mjs            todo
//   node scripts/validar.mjs barberia   solo ese nicho (más las revisiones generales)
//
// Sale con código 1 si hay errores. Los avisos no detienen nada.

import { readdirSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', 'src')
const importar = (ruta) => import(pathToFileURL(join(raiz, ruta)).href)
const archivos = (dir) => {
  try {
    return readdirSync(join(raiz, dir)).filter((f) => f.endsWith('.js'))
  } catch {
    return []
  }
}

const { SOLUCIONES, SOL, MODULOS } = await importar('content/soluciones.js')
const { AREA, FAMILIAS, VOCAB } = await importar('content/base.js')

const errores = []
const avisos = []
const E = (donde, texto) => errores.push(`✗ ${donde}: ${texto}`)
const A = (donde, texto) => avisos.push(`· ${donde}: ${texto}`)
const solo = process.argv[2]

// ── Nichos ──
const nichos = []
for (const f of archivos('content/nichos')) {
  if (f === 'index.js') continue
  try {
    const m = await importar(`content/nichos/${f}`)
    if (!m.default) E(f, 'no tiene export default')
    else nichos.push([f, m.default])
  } catch (e) {
    E(f, `no se pudo cargar: ${e.message}`)
  }
}

const familias = new Set(FAMILIAS.map((f) => f.id))
const ids = new Set()
const texto = (v) => typeof v === 'string' && v.trim().length > 0

for (const [f, n] of nichos) {
  if (solo && n.id !== solo) continue
  const d = n.id || f
  if (!texto(n.id)) E(d, 'falta id')
  if (f !== `${n.id}.js`) E(d, `el archivo debe llamarse ${n.id}.js`)
  if (ids.has(n.id)) E(d, 'id repetido')
  ids.add(n.id)
  if (!familias.has(n.familia)) E(d, `familia desconocida "${n.familia}"`)
  for (const k of ['nombre', 'plural', 'icono', 'apertura']) if (!texto(n[k])) E(d, `falta ${k}`)
  if (n.acento && !/^#[0-9a-f]{6}$/i.test(n.acento)) E(d, 'acento debe ser un color #rrggbb')
  if (!Array.isArray(n.observa) || n.observa.length !== 3) E(d, 'observa debe tener 3 frases')
  for (const k of Object.keys(n.vocab || {})) if (!(k in VOCAB)) E(d, `vocab.${k} no existe (válidas: ${Object.keys(VOCAB).join(', ')})`)

  const m = n.muestra || {}
  if (!Array.isArray(m.productos) || m.productos.length < 8) E(d, 'muestra.productos necesita al menos 8')
  else for (const p of m.productos) if (!texto(p.nombre) || typeof p.precio !== 'number' || !texto(p.categoria)) E(d, `producto mal formado: ${JSON.stringify(p)}`)
  if (!Array.isArray(m.servicios) || m.servicios.length < 3) E(d, 'muestra.servicios necesita al menos 3')
  else for (const s of m.servicios) if (!texto(s.nombre) || typeof s.precio !== 'number' || typeof s.minutos !== 'number') E(d, `servicio mal formado: ${JSON.stringify(s)}`)
  if (!Array.isArray(m.personal) || m.personal.length !== 4) E(d, 'muestra.personal debe tener 4 nombres')
  if (!Array.isArray(m.clientes) || m.clientes.length !== 6) E(d, 'muestra.clientes debe tener 6 nombres')
  if (!Array.isArray(m.insumos) || m.insumos.length < 6) E(d, 'muestra.insumos necesita al menos 6')
  else for (const i of m.insumos) if (!texto(i.nombre) || !texto(i.unidad) || typeof i.hay !== 'number' || typeof i.minimo !== 'number') E(d, `insumo mal formado: ${JSON.stringify(i)}`)

  const P = n.problemas || []
  if (P.length < 10) E(d, `tiene ${P.length} problemas; el mínimo es 10`)
  if (P.length > 16) A(d, `tiene ${P.length} problemas; más de 16 es demasiado para una visita`)
  const areas = new Set(P.map((p) => p.area))
  if (areas.size < 5) E(d, `solo cubre ${areas.size} áreas; el mínimo es 5`)
  const frec = P.filter((p) => p.frecuente).length
  if (frec < 5 || frec > 7) E(d, `${frec} problemas marcados como frecuentes; deben ser entre 5 y 7`)
  const pids = new Set()
  for (const p of P) {
    const dp = `${d}/${p.id}`
    if (!texto(p.id) || !/^[a-z0-9-]+$/.test(p.id)) E(dp, 'id inválido (minúsculas, números y guiones)')
    if (pids.has(p.id)) E(dp, 'id de problema repetido')
    pids.add(p.id)
    if (!AREA[p.area]) E(dp, `área desconocida "${p.area}"`)
    if (!texto(p.titulo)) E(dp, 'falta titulo')
    else if (p.titulo.length > 58) E(dp, `titulo de ${p.titulo.length} caracteres; máximo 58`)
    if (/[.!?]$/.test(p.titulo || '')) E(dp, 'el titulo no lleva punto final')
    if (!texto(p.senal)) E(dp, 'falta senal')
    else if (p.senal.length > 130) E(dp, `senal de ${p.senal.length} caracteres; máximo 130`)
    const M = p.matices || []
    if (M.length < 1 || M.length > 2) E(dp, 'debe tener 1 o 2 matices')
    const mids = new Set(M.map((x) => x.id))
    for (const x of M) {
      if (!texto(x.id) || !texto(x.pregunta) || !texto(x.si) || !texto(x.no)) E(dp, `matiz incompleto: ${JSON.stringify(x)}`)
      if (texto(x.pregunta) && !/^¿.*\?$/.test(x.pregunta)) E(dp, `la pregunta del matiz debe ir entre signos: "${x.pregunta}"`)
      if (texto(x.si) && x.si.length > 36) E(dp, `etiqueta "si" muy larga (${x.si.length}); máximo 36`)
      if (texto(x.no) && x.no.length > 36) E(dp, `etiqueta "no" muy larga (${x.no.length}); máximo 36`)
    }
    const R = p.rutas || []
    if (R.length !== 4) E(dp, `tiene ${R.length} rutas; deben ser exactamente 4`)
    const sols = new Set()
    let conPide = 0
    for (const r of R) {
      if (!SOL[r.sol]) E(dp, `solución desconocida "${r.sol}"`)
      if (sols.has(r.sol)) E(dp, `solución repetida "${r.sol}"`)
      sols.add(r.sol)
      if (!texto(r.para)) E(dp, `la ruta ${r.sol} no tiene "para"`)
      else if (r.para.length > 170) E(dp, `"para" de ${r.sol} mide ${r.para.length}; máximo 170`)
      if (r.pide) {
        conPide++
        for (const [k, v] of Object.entries(r.pide)) {
          if (!mids.has(k)) E(dp, `la ruta ${r.sol} pide el matiz "${k}", que no existe en este problema`)
          if (typeof v !== 'boolean') E(dp, `pide.${k} debe ser true o false`)
        }
      }
    }
    if (R.length === 4 && conPide === 0) E(dp, 'ninguna ruta usa "pide": los matices no cambiarían nada')
    if (R.length === 4 && conPide === 4) E(dp, 'las 4 rutas tienen "pide": al menos una debe servir siempre')
    for (const x of M) if (!R.some((r) => r.pide && x.id in r.pide)) A(dp, `el matiz "${x.id}" no lo usa ninguna ruta`)
  }
}

if (!solo && !nichos.some(([, n]) => n.id === 'general')) A('nichos', 'falta el nicho "general" (el de "otro giro")')

// ── Iconos ──
const { PROCESO } = await importar('icons/proceso.js')
const usadosProceso = new Set(SOLUCIONES.flatMap((s) => s.pasos.map((p) => p.ico)))
for (const k of usadosProceso) if (!PROCESO[k]) A('iconos', `falta el icono de proceso "${k}"`)
const icoNichos = {}
for (const f of archivos('icons/nichos')) Object.assign(icoNichos, (await importar(`icons/nichos/${f}`)).default || {})
for (const [, n] of nichos) if (!icoNichos[n.icono]) A('iconos', `falta el icono del nicho "${n.icono}"`)
const ANIMS = new Set(['flota', 'vapor', 'giro', 'vaiven', 'late', 'corta', 'parpadea', 'desliza', 'brinca'])
for (const [id, def] of Object.entries(icoNichos)) {
  if (!Array.isArray(def.partes) || !def.partes.length) E(`icono ${id}`, 'no tiene partes')
  else
    for (const p of def.partes) {
      if (!Array.isArray(p.f) || !p.f.length) E(`icono ${id}`, 'una parte no tiene formas')
      if (p.anim && !ANIMS.has(p.anim)) E(`icono ${id}`, `animación desconocida "${p.anim}"`)
      for (const s of p.f || []) for (const pt of s?.pts || []) if (!pt.every(Number.isFinite)) E(`icono ${id}`, 'tiene un punto que no es número')
    }
}

// ── Demos ──
const mods = {}
for (const f of archivos('demos/mod')) {
  try {
    const m = (await importar(`demos/mod/${f}`)).default
    if (m?.id) mods[m.id] = m
    else E(`demo ${f}`, 'no exporta { id, vistas, montar }')
  } catch (e) {
    E(`demo ${f}`, `no se pudo cargar: ${e.message}`)
  }
}
for (const [modulo, vistas] of Object.entries(MODULOS)) {
  for (const v of vistas) {
    const meta = mods[modulo]?.vistas?.[v]
    if (!meta) A('demos', `falta ${modulo}/${v}`)
    else if (!['telefono', 'tableta', 'escritorio'].includes(meta.dispositivo)) E(`demo ${modulo}/${v}`, `dispositivo inválido "${meta.dispositivo}"`)
    else if (!texto(meta.titulo)) E(`demo ${modulo}/${v}`, 'falta titulo')
  }
}

// ── Resumen ──
const totalProblemas = nichos.reduce((s, [, n]) => s + (n.problemas?.length || 0), 0)
console.log(`${nichos.length} nichos · ${totalProblemas} problemas · ${totalProblemas * 4} rutas · ${SOLUCIONES.length} soluciones · ${Object.keys(mods).length} módulos de demo`)
if (avisos.length) console.log('\nAvisos\n' + avisos.join('\n'))
if (errores.length) {
  console.log('\nErrores\n' + errores.join('\n'))
  process.exit(1)
}
console.log('\nTodo en orden.')
