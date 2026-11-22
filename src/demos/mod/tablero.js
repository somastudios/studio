import { esc, dinero, toca, hoja, relojes, cuenta, hora } from '../kit.js'

// Demo: tablero.
//   hoy        — teléfono del dueño: la venta del día sube sola, por hora, con lo más vendido.
//   sucursales — escritorio: cada sucursal con sus números, lado a lado, y la que necesita atención.
//
// Los números se arman a partir de los productos del giro: tickets × ticket promedio = venta,
// y las unidades de "Lo más vendido" salen de la misma mezcla. Todo es coherente entre sí.

export default {
  id: 'tablero',
  nombre: 'Tablero',
  vistas: {
    hoy: { titulo: 'Su venta de hoy, en vivo', dispositivo: 'telefono' },
    sucursales: { titulo: 'Sus sucursales, lado a lado', dispositivo: 'escritorio' },
  },
  montar(el, ctx) {
    return ctx.vista === 'sucursales' ? sucursales(el, ctx) : hoy(el, ctx)
  },
}

// ───────────────────────── Datos comunes ─────────────────────────

const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
const DIAS_C = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const HORAS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
const hCorta = (h) => String(h % 12 || 12)
const hLarga = (h) => `${h % 12 || 12} ${h < 12 ? 'a. m.' : 'p. m.'}`
const pct = (x) => Math.round(Math.abs(x) * 100)
const mes = (d) => new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(d)
const suma = (lista, f) => lista.reduce((s, x) => s + f(x), 0)

/** Números al azar pero estables: el mismo negocio ve siempre el mismo tablero. */
function azar(semilla) {
  let a = 7
  for (const c of String(semilla)) a = (Math.imul(a, 31) + c.charCodeAt(0)) | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let x = Math.imul(a ^ (a >>> 15), 1 | a)
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

const esComida = (nicho) => nicho?.familia === 'comida' || /rest|caf|taq|pan|pizz|cocina|fonda|pastel|helad|bar$/.test(nicho?.id || '')

/** La base de todo: mezcla de productos, ticket normal, ritmo del día y de la semana. */
function base({ negocio, nicho, m }) {
  const r = azar(`${negocio}|${nicho?.id || ''}`)
  const comida = esComida(nicho)
  const perfil = comida ? [3, 3, 4, 6, 10, 13, 11, 6, 4, 5, 8, 10, 7] : [4, 6, 8, 9, 8, 6, 5, 6, 8, 10, 9, 6, 3]
  const sumaPerfil = suma(perfil, (x) => x)
  const pesoDia = comida ? [0.85, 0.9, 0.95, 1.05, 1.3, 1.45, 1.2] : [1, 0.95, 1, 1.05, 1.2, 1.3, 0.75]

  // Mezcla de venta: cinco productos se llevan más de la mitad; el resto se reparte lo demás.
  const orden = m.productos
    .map((p) => [r(), p])
    .sort((a, b) => a[0] - b[0])
    .map((x) => x[1])
  const PESOS = [0.17, 0.14, 0.11, 0.09, 0.07]
  const crudo = orden.map((_, i) => (i < 5 ? PESOS[i] : 0.42 / Math.max(1, orden.length - 5)))
  const sw = suma(crudo, (x) => x)
  const mezcla = orden.map((p, i) => ({ p: { ...p, precio: p.precio > 0 ? p.precio : 50 }, w: crudo[i] / sw }))
  const medio = suma(mezcla, (x) => x.w * x.p.precio)
  const extra = medio < 120 ? 0.8 : medio < 400 ? 0.5 : 0.15 // qué tan seguido el ticket lleva algo más
  const ticket = medio * (1 + extra + extra / 2)
  const ticketsDia = ticket < 200 ? 150 : ticket < 500 ? 95 : ticket < 1200 ? 48 : 22

  const ahora = new Date()
  const hReal = ahora.getHours()
  const hAhora = Math.min(21, Math.max(12, hReal)) // fuera de horario se muestra un momento creíble del día
  const frac = hReal === hAhora ? Math.max(0.2, ahora.getMinutes() / 60) : 0.7
  const di = (ahora.getDay() + 6) % 7

  // Días anteriores, del más reciente al más lejano. Hace k días: atras[k].
  const atras = [null]
  for (let k = 1; k <= 70; k++) {
    const d = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - k)
    const tickets = Math.round(ticketsDia * pesoDia[(d.getDay() + 6) % 7] * (0.93 + 0.14 * r()) * (1 - 0.0016 * k))
    atras.push({ tickets, venta: Math.round(tickets * ticket * (0.96 + 0.08 * r())) })
  }

  const elige = () => {
    let x = r()
    for (const e of mezcla) if ((x -= e.w) <= 0) return e.p
    return mezcla[0].p
  }
  /** Una venta nueva: uno a tres productos de la mezcla. */
  const venta = () => {
    const items = [elige()]
    if (r() < extra) items.push(elige())
    if (r() < extra / 2) items.push(elige())
    return { items, total: suma(items, (p) => p.precio) }
  }

  return { r, perfil, sumaPerfil, pesoDia, mezcla, medio, ticket, ticketsDia, ahora, hAhora, iAhora: HORAS.indexOf(hAhora), frac, di, dm: ahora.getDate(), atras, venta }
}

const CSS = `<style>
  .dk .tb-pri { color: #fff; }
  .tb-venta { font-weight: 750; font-size: 40px; letter-spacing: -0.03em; line-height: 1.05; margin: 6px 0 10px; }
  .tb-vivo { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 600; color: var(--dk-ok); }
  .tb-vivo i { width: 7px; height: 7px; border-radius: 50%; background: currentColor; animation: dk-pulso 1.6s ease-in-out infinite; }
  .tb-contra { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .tb-ultima { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--dk-linea); min-height: 28px; }
  .dk .tb-aviso { display: flex; width: 100%; align-items: center; gap: 12px; text-align: left; margin-top: 10px; }
  .tb-aviso-i { flex: none; display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: var(--dk-alerta-f); color: var(--dk-alerta); font-weight: 800; }
  .tb-aviso.es-ok .tb-aviso-i { background: var(--dk-ok-f); color: var(--dk-ok); }
  .tb-aviso-t { font-weight: 650; font-size: 13.5px; line-height: 1.25; }
  .tb-flecha { color: var(--dk-tx3); font-size: 20px; line-height: 1; }
  .tb-barras { display: flex; align-items: stretch; gap: 5px; height: 132px; margin-top: 12px; }
  .tb-barras--fino { gap: 2px; }
  .dk .tb-col { flex: 1; min-width: 0; display: flex; flex-direction: column; padding: 0; border: 0; background: none; }
  .tb-palo { flex: 1; min-height: 0; display: flex; align-items: flex-end; border-radius: 6px; }
  .tb-palo i { display: block; width: 100%; height: var(--h, 4%); min-height: 3px; border-radius: 4px 4px 1px 1px; background: color-mix(in srgb, var(--dk-acento) 30%, #fff); transition: height 0.7s cubic-bezier(0.16, 1, 0.3, 1); transform-origin: 50% 100%; animation: tb-crece 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .tb-col.es-ahora .tb-palo i { background: var(--dk-acento); }
  .tb-col.es-espera .tb-palo i { background: none; border: 1.5px dashed #cfccc4; border-bottom: 0; }
  .tb-col[aria-pressed='true'] .tb-palo { background: var(--dk-fondo); box-shadow: 0 0 0 2px var(--dk-fondo); }
  .tb-etq { height: 18px; padding-top: 5px; font-size: 10px; line-height: 13px; color: var(--dk-tx3); font-variant-numeric: tabular-nums; text-align: center; white-space: nowrap; }
  .tb-col.es-ahora .tb-etq, .tb-col[aria-pressed='true'] .tb-etq { color: var(--dk-tx); font-weight: 700; }
  .tb-det { margin-top: 2px; min-height: 17px; }
  .tb-clave { display: flex; gap: 14px; margin-top: 10px; font-size: 11px; color: var(--dk-tx2); }
  .tb-clave span { display: inline-flex; align-items: center; gap: 5px; }
  .tb-clave i { width: 10px; height: 10px; border-radius: 3px; background: var(--dk-acento); }
  .tb-clave i.es-espera { background: none; border: 1.5px dashed #bdbab2; }
  .tb-top { display: flex; align-items: center; gap: 10px; padding: 9px 0; }
  .tb-top + .tb-top { border-top: 1px solid var(--dk-linea); }
  .tb-pos { flex: none; width: 18px; font-weight: 700; font-size: 12px; color: var(--dk-tx3); text-align: center; }
  .tb-top .dk-avance { height: 5px; margin-top: 6px; }
  .tb-top-n { min-width: 0; font-weight: 600; font-size: 13.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tb-top-v { flex: none; font-size: 12.5px; color: var(--dk-tx2); }
  .tb-top-v b { color: var(--dk-tx); font-size: 13.5px; }
  .tb-bajo + .tb-bajo { margin-top: 14px; }
  .tb-bajo .dk-avance { margin-top: 6px; }
  .tb-bajo .dk-avance > i { background: var(--dk-alerta); }
  @keyframes tb-crece { from { transform: scaleY(0); } }

  .sc-periodo { display: flex; gap: 4px; padding: 3px; border-radius: 999px; background: var(--dk-fondo); }
  .sc-cuerpo { flex: 1; min-height: 0; overflow-y: auto; scrollbar-width: none; padding: 14px 20px 18px; display: flex; flex-direction: column; gap: 12px; }
  .sc-resumen { display: flex; align-items: center; justify-content: space-between; gap: 16px; font-size: 14.5px; }
  .sc-clave { display: flex; gap: 16px; font-size: 12px; color: var(--dk-tx2); }
  .sc-clave span { display: inline-flex; align-items: center; gap: 6px; }
  .sc-clave svg { display: block; }
  .dk .dk-tarjeta.sc-suc { margin: 0; display: block; width: 100%; text-align: left; transition: border-color 0.2s, box-shadow 0.2s; }
  .sc-venta { font-weight: 750; font-size: 30px; letter-spacing: -0.025em; line-height: 1.1; margin-top: 10px; }
  .sc-linea { display: block; width: 100%; height: 52px; margin: 8px 0 10px; }
  .sc-par { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding-top: 10px; border-top: 1px solid var(--dk-linea); }
  .sc-par b { display: block; font-size: 16px; font-weight: 700; }
  .sc-abajo { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr); gap: 12px; }
  .dk .dk-tarjeta.sc-caja { margin: 0; min-height: 0; overflow-y: auto; scrollbar-width: none; }
  .sc-tabla { width: 100%; border-collapse: collapse; margin-top: 8px; }
  .sc-tabla th { padding: 0; font-weight: 600; font-size: 12px; color: var(--dk-tx2); border-bottom: 1px solid var(--dk-linea); }
  .dk .sc-th { display: flex; align-items: center; gap: 5px; width: 100%; padding: 9px 10px; border: 0; background: none; font-weight: 600; white-space: nowrap; }
  .sc-tabla th:not(:first-child) .sc-th { justify-content: flex-end; }
  .sc-th i { font-style: normal; font-size: 9px; color: var(--dk-tx3); }
  .sc-th[aria-sort] { color: var(--dk-tx); }
  .sc-th[aria-sort] i { color: var(--dk-tx); }
  .sc-tabla td { padding: 0 10px; height: 47px; border-bottom: 1px solid var(--dk-linea); text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .sc-tabla td:first-child { text-align: left; font-weight: 650; }
  .sc-tabla tbody tr { cursor: pointer; }
  .sc-tabla tbody tr.es-sel td { background: var(--dk-acento-f); }
  .sc-tabla tbody tr.es-sel td:first-child { box-shadow: inset 3px 0 0 var(--dk-acento); }
  .sc-tabla tfoot td { border-bottom: 0; font-weight: 700; }
  .sc-marca { display: inline-grid; place-items: center; width: 16px; height: 16px; margin-right: 7px; border-radius: 50%; background: var(--dk-alerta-f); color: var(--dk-alerta); font-size: 11px; font-weight: 800; vertical-align: 1px; }
  .sc-parte { display: inline-flex; align-items: center; gap: 8px; }
  .sc-parte .dk-avance { width: 64px; height: 6px; }
  .sc-comp { display: grid; grid-template-columns: 1.1fr 1fr 1fr 0.8fr; margin-top: 12px; font-size: 13px; }
  .sc-comp > * { padding: 7px 0; border-bottom: 1px solid var(--dk-linea); text-align: right; font-variant-numeric: tabular-nums; }
  .sc-comp > :nth-child(4n + 1) { text-align: left; }
  .sc-comp > .sc-h { font-size: 11.5px; font-weight: 600; color: var(--dk-tx2); }
  .sc-lectura { margin-top: 12px; font-size: 13.5px; line-height: 1.45; }
  .sc-lectura p + p { margin-top: 6px; }
  .sc-msj { margin-top: 12px; padding: 10px 12px; border-radius: 12px; background: var(--dk-fondo); font-size: 13px; line-height: 1.4; }
  .sc-msj + .sc-msj { margin-top: 8px; }
  .sc-msj.es-resp { background: var(--dk-ok-f); }
  .sc-borrador { margin-top: 12px; padding: 12px; border-radius: 12px; background: #d9fdd3; font-size: 14px; line-height: 1.4; }
</style>`

const flecha = (x) => (x >= 0 ? '▲' : '▼')

// ───────────────────────── Teléfono del dueño ─────────────────────────

function hoy(el, ctx) {
  const { negocio, m, avisar, reducido } = ctx
  const t = relojes()
  const B = base(ctx)
  const { r, atras, di, dm, ahora } = B

  // El día de hoy, hora por hora. `pasada` es lo que se vendió a esa hora hace una semana.
  const H = HORAS.map((h, i) => {
    const parte = B.perfil[i] / B.sumaPerfil
    const pasada = Math.round(atras[7].venta * parte * (0.94 + 0.12 * r()))
    if (i > B.iAhora) return { h, pasada, tickets: 0, venta: 0 }
    const f = i === B.iAhora ? B.frac : 1
    const tickets = Math.max(1, Math.round(B.ticketsDia * B.pesoDia[di] * parte * f * (0.98 + 0.16 * r())))
    return { h, pasada, tickets, venta: Math.round(tickets * B.ticket * (0.96 + 0.08 * r())) }
  })
  const ventaHoy = () => suma(H, (x) => x.venta)
  const ticketsHoy = () => suma(H, (x) => x.tickets)
  const refHoy = Math.round(suma(H, (x, ) => x.pasada * (x.h < B.hAhora ? 1 : x.h === B.hAhora ? B.frac : 0)))
  const unidades = new Map(B.mezcla.map((e) => [e.p.nombre, Math.round((ventaHoy() / B.medio) * e.w)]))

  // El mes: qué día de hace cuántos días corresponde a cada fecha.
  const diasMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).getDate()
  const diasMesAnt = new Date(ahora.getFullYear(), ahora.getMonth(), 0).getDate()
  const mesAnt = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)
  const delMesAnt = (j) => atras[Math.min(70, dm + diasMesAnt - Math.min(j, diasMesAnt))]

  let tab = 'hoy'
  let sel = -1 // barra elegida; -1 es "la de ahora"
  let ultima = null
  let avisado = null
  const bajos = m.insumos.filter((x) => x.hay < x.minimo).sort((a, b) => a.hay / a.minimo - b.hay / b.minimo)
  const encargado = m.personal[0]

  /** Todo lo que pinta una pestaña, ya calculado. */
  function datos() {
    const vh = ventaHoy()
    const th = ticketsHoy()
    if (tab === 'hoy') {
      return {
        titulo: 'Venta de hoy',
        fecha: `${DIAS[di]} ${dm}`,
        venta: vh,
        tickets: th,
        ref: refHoy,
        contra: `contra el ${DIAS[di]} pasado a esta hora`,
        grafica: 'Venta por hora',
        clave: `el ${DIAS[di]} pasado`,
        ahora: B.iAhora,
        barras: H.map((x, i) => ({
          eje: i % 2 ? '' : hCorta(x.h),
          nombre: hLarga(x.h),
          tipo: i < B.iAhora ? 'es-hecho' : i === B.iAhora ? 'es-ahora' : 'es-espera',
          valor: i <= B.iAhora ? x.venta : x.pasada,
          tickets: x.tickets,
        })),
        top: B.mezcla.map((e) => ({ p: e.p, u: unidades.get(e.p.nombre) })),
        cuando: 'hoy',
      }
    }
    if (tab === 'semana') {
      const dias = DIAS.map((_, d) => (d < di ? atras[di - d] : d === di ? { venta: vh, tickets: th } : atras[7 - (d - di)]))
      const venta = suma(dias.slice(0, di + 1), (x) => x.venta)
      return {
        titulo: 'Venta de la semana',
        fecha: di ? `de lunes a hoy` : 'empieza hoy',
        venta,
        tickets: suma(dias.slice(0, di + 1), (x) => x.tickets),
        ref: suma(DIAS.slice(0, di), (_, d) => atras[di - d + 7].venta) + refHoy,
        contra: 'contra la semana pasada al mismo momento',
        grafica: 'Venta por día',
        clave: 'la semana pasada',
        ahora: di,
        barras: dias.map((x, d) => ({ eje: DIAS_C[d], nombre: DIAS[d], tipo: d < di ? 'es-hecho' : d === di ? 'es-ahora' : 'es-espera', valor: x.venta, tickets: x.tickets })),
        top: B.mezcla.map((e) => ({ p: e.p, u: Math.round((venta / B.medio) * e.w) })),
        cuando: 'esta semana',
      }
    }
    const dias = Array.from({ length: diasMes }, (_, k) => (k + 1 < dm ? atras[dm - k - 1] : k + 1 === dm ? { venta: vh, tickets: th } : delMesAnt(k + 1)))
    const venta = suma(dias.slice(0, dm), (x) => x.venta)
    return {
      titulo: `Venta de ${mes(ahora)}`,
      fecha: dm > 1 ? `del 1 al ${dm}` : 'empieza hoy',
      venta,
      tickets: suma(dias.slice(0, dm), (x) => x.tickets),
      ref: suma(dias.slice(0, dm - 1), (_, k) => delMesAnt(k + 1).venta) + refHoy,
      contra: `contra ${mes(mesAnt)} al mismo día`,
      grafica: 'Venta por día',
      clave: mes(mesAnt),
      ahora: dm - 1,
      barras: dias.map((x, k) => ({ eje: k % 7 ? '' : String(k + 1), nombre: `${k + 1} de ${mes(ahora)}`, tipo: k + 1 < dm ? 'es-hecho' : k + 1 === dm ? 'es-ahora' : 'es-espera', valor: x.venta, tickets: x.tickets })),
      top: B.mezcla.map((e) => ({ p: e.p, u: Math.round((venta / B.medio) * e.w) })),
      cuando: 'este mes',
    }
  }

  const TABS = [
    ['hoy', 'Hoy'],
    ['semana', 'Semana'],
    ['mes', 'Mes'],
  ]
  const top5 = (P) => [...P.top].sort((a, b) => b.u - a.u).slice(0, 5)
  const detalle = (P) => {
    const b = P.barras[sel < 0 ? P.ahora : sel]
    const nombre = b.nombre.charAt(0).toUpperCase() + b.nombre.slice(1)
    if (b.tipo === 'es-espera') return `${esc(nombre)} · ${esc(P.clave)} fueron ${dinero(b.valor)}`
    return `${esc(nombre)} · ${dinero(b.valor)} en ${b.tickets} ${b.tickets === 1 ? 'ticket' : 'tickets'}${b.tipo === 'es-ahora' ? ' · va corriendo' : ''}`
  }
  const htmlContra = (P) => {
    const d = P.venta / P.ref - 1
    return `<span class="dk-chip ${d >= 0 ? 'dk-chip--ok' : 'dk-chip--alerta'}">${flecha(d)} ${pct(d)} %</span><span class="dk-nota">${esc(P.contra)}</span>`
  }
  const htmlTop = (P) => {
    const lista = top5(P)
    const tope = Math.max(1, lista[0].u)
    return lista
      .map(
        (x, i) => `<div class="tb-top">
          <span class="tb-pos">${i + 1}</span>
          <div class="dk-crece" style="min-width:0;flex:1">
            <div class="dk-entre"><p class="tb-top-n">${esc(x.p.nombre)}</p><p class="tb-top-v dk-num"><b>${x.u}</b> · ${dinero(x.u * x.p.precio)}</p></div>
            <div class="dk-avance"><i style="--p:${Math.round((x.u / tope) * 100)}%"></i></div>
          </div>
        </div>`,
      )
      .join('')
  }
  const htmlAviso = () => {
    if (!bajos.length) return `<div class="dk-tarjeta tb-aviso es-ok"><span class="tb-aviso-i">✓</span><div class="dk-crece"><p class="tb-aviso-t">Nada requiere su atención por ahora</p><p class="dk-nota">Aquí aparece lo que baja de su mínimo.</p></div></div>`
    const x = bajos[0]
    return `<button class="dk-tarjeta tb-aviso ${avisado ? 'es-ok' : ''}" data-aviso>
      <span class="tb-aviso-i">${avisado ? '✓' : '!'}</span>
      <div class="dk-crece" style="flex:1;min-width:0">
        <p class="tb-aviso-t">${esc(x.nombre)}: ${bajos.length > 1 ? 'quedan' : 'solo quedan'} ${x.hay} ${esc(x.unidad)}</p>
        <p class="dk-nota">${avisado ? `${esc(encargado)} ya está al tanto · ${esc(avisado)}` : `El mínimo es ${x.minimo}${bajos.length > 1 ? ` · y ${bajos.length - 1} más por debajo` : ''}`}</p>
      </div>
      <span class="tb-flecha" aria-hidden="true">›</span>
    </button>`
  }

  function pintar() {
    const P = datos()
    const tope = Math.max(1, ...P.barras.map((b) => b.valor))
    const elegida = sel < 0 ? P.ahora : sel
    el.innerHTML = `${CSS}
      <header class="dk-barra dk-barra--acento">
        <div class="dk-crece"><p class="dk-barra-t">${esc(negocio)}</p><p class="dk-barra-s">Su tablero · ${esc(DIAS[di])} ${dm} de ${esc(mes(ahora))}</p></div>
      </header>
      <nav class="dk-tabs" role="tablist">
        ${TABS.map(([id, n]) => `<button class="dk-tab" role="tab" aria-selected="${id === tab}" data-tab="${id}">${n}</button>`).join('')}
      </nav>
      <div class="dk-cuerpo" data-rueda>
        <section class="dk-tarjeta">
          <div class="dk-entre"><p class="dk-nota">${esc(P.titulo)} · ${esc(P.fecha)}</p><span class="tb-vivo"><i></i>En vivo</span></div>
          <p class="tb-venta dk-num" data-venta>${dinero(P.venta)}</p>
          <div class="tb-contra" data-contra>${htmlContra(P)}</div>
          <p class="dk-nota tb-ultima" data-ultima>${ultima ? htmlUltima() : 'Cada venta que se cobra aparece aquí al momento.'}</p>
        </section>
        <div class="dk-rejilla dk-mt">
          <div class="dk-cifra"><p class="dk-cifra-n" data-tickets>${P.tickets}</p><p class="dk-cifra-e">Tickets</p></div>
          <div class="dk-cifra"><p class="dk-cifra-n" data-ticket>${dinero(Math.round(P.venta / P.tickets))}</p><p class="dk-cifra-e">Ticket promedio</p></div>
        </div>
        <p class="dk-sub">Requiere su atención</p>
        <div data-aviso-caja style="margin-top:-10px">${htmlAviso()}</div>
        <p class="dk-sub">${esc(P.grafica)}</p>
        <section class="dk-tarjeta">
          <p class="dk-nota dk-num tb-det" data-det>${detalle(P)}</p>
          <div class="tb-barras ${P.barras.length > 20 ? 'tb-barras--fino' : ''}">
            ${P.barras.map((b, i) => `<button class="tb-col ${b.tipo}" data-b="${i}" aria-pressed="${i === elegida}" aria-label="${esc(b.nombre)}"><span class="tb-palo"><i style="--h:${Math.round((b.valor / tope) * 100)}%"></i></span><span class="tb-etq">${b.eje}</span></button>`).join('')}
          </div>
          <div class="tb-clave"><span><i></i>Ahora</span>${P.barras.some((b) => b.tipo === 'es-espera') ? `<span><i class="es-espera"></i>Lo que se vendió ${esc(P.clave)}</span>` : ''}</div>
        </section>
        <div class="dk-entre"><p class="dk-sub">Lo más vendido</p><p class="dk-nota" style="margin-top:10px">Piezas · importe, ${esc(P.cuando)}</p></div>
        <section class="dk-tarjeta" style="padding:4px 14px" data-top>${htmlTop(P)}</section>
        <p class="dk-nota dk-mt" style="text-align:center">Los números salen de lo que se cobra en caja. No hay que capturar nada.</p>
      </div>`
    const n = el.querySelector('[data-venta]')
    if (!reducido) {
      n.dataset.v = P.venta * 0.94
      cuenta(n, P.venta, { ms: 900, formato: (x) => dinero(Math.round(x)) })
    }
    n.dataset.v = P.venta
  }

  const htmlUltima = () => `Última venta: <span class="dk-fuerte dk-num" style="color:var(--dk-tx)">${dinero(ultima.total)}</span> · ${esc(ultima.que)} · ${esc(ultima.hora)}`

  /** Después de una venta: se actualizan las cifras en su lugar, sin repintar la pantalla. */
  function refresca() {
    const P = datos()
    const q = (s) => el.querySelector(s)
    const n = q('[data-venta]')
    if (!n) return
    reducido ? (n.textContent = dinero(P.venta)) : cuenta(n, P.venta, { formato: (x) => dinero(Math.round(x)) })
    q('[data-contra]').innerHTML = htmlContra(P)
    q('[data-tickets]').textContent = P.tickets
    q('[data-ticket]').textContent = dinero(Math.round(P.venta / P.tickets))
    q('[data-ultima]').innerHTML = htmlUltima()
    q('[data-det]').innerHTML = detalle(P)
    const tope = Math.max(1, ...P.barras.map((b) => b.valor))
    el.querySelectorAll('[data-b] i').forEach((i, k) => i.style.setProperty('--h', `${Math.round((P.barras[k].valor / tope) * 100)}%`))
    q('[data-top]').innerHTML = htmlTop(P)
  }

  function entraVenta() {
    const v = B.venta()
    H[B.iAhora].venta += v.total
    H[B.iAhora].tickets++
    v.items.forEach((p) => unidades.set(p.nombre, (unidades.get(p.nombre) || 0) + 1))
    ultima = { total: v.total, que: v.items.length > 1 ? `${v.items.length} piezas` : v.items[0].nombre, hora: hora() }
    refresca()
  }

  function verAviso() {
    const h = hoja(
      el,
      `<p class="dk-titulo">Por debajo de su mínimo</p>
       <p class="dk-nota" style="margin-top:4px">Lo que conviene pedir antes de que falte.</p>
       <div class="dk-mt-g">
         ${bajos
           .map(
             (x) => `<div class="tb-bajo">
               <div class="dk-entre"><span class="dk-fuerte">${esc(x.nombre)}</span><span class="dk-nota dk-num">Hay ${x.hay} ${esc(x.unidad)} · mínimo ${x.minimo}</span></div>
               <div class="dk-avance"><i style="--p:${Math.round((x.hay / x.minimo) * 100)}%"></i></div>
             </div>`,
           )
           .join('')}
       </div>
       ${
         avisado
           ? `<p class="dk-nota dk-mt-g">${esc(encargado)} recibió el aviso a las ${esc(avisado)}.</p>`
           : `<button class="dk-btn dk-btn--pri dk-btn--bloque dk-mt-g tb-pri" data-avisa>Avisar a ${esc(encargado)} para que lo pida</button>`
       }
       <button class="dk-btn dk-btn--bloque dk-mt" data-cerrar>Volver al tablero</button>`,
    )
    h.el.querySelector('[data-avisa]')?.addEventListener('click', () => {
      avisado = hora()
      h.cerrar()
      el.querySelector('[data-aviso-caja]').innerHTML = htmlAviso()
      avisar(`${encargado} recibió la lista de lo que falta`)
    })
  }

  toca(el, '[data-tab]', (b) => {
    tab = b.dataset.tab
    sel = -1
    pintar()
  })
  toca(el, '[data-b]', (b) => {
    sel = +b.dataset.b
    el.querySelectorAll('[data-b]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
    el.querySelector('[data-det]').innerHTML = detalle(datos())
  })
  toca(el, '[data-aviso]', verAviso)

  pintar()
  t.en(2200, entraVenta)
  t.cada(4600, entraVenta)
  return { destruir: () => t.limpia() }
}

// ───────────────────────── Escritorio: sucursales ─────────────────────────

const SUCURSALES = [
  { nombre: 'Centro', escala: 1.3, tk: 1.05, dT: 0.05, dP: 0.02 },
  { nombre: 'Norte', escala: 1, tk: 1, dT: -0.01, dP: -0.16, baja: true },
  { nombre: 'Sur', escala: 0.85, tk: 0.97, dT: 0.02, dP: 0 },
  { nombre: 'Poniente', escala: 0.7, tk: 1.02, dT: -0.04, dP: 0.01 },
]

function sucursales(el, ctx) {
  const { negocio, m, avisar, reducido } = ctx
  const t = relojes()
  const B = base(ctx)
  const { r, di, dm, ahora } = B
  const diasMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).getDate()
  const pesoDe = (k) => B.pesoDia[(new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - k).getDay() + 6) % 7]
  const caro = [...m.productos].sort((a, b) => b.precio - a.precio)[0]

  // Cada sucursal: sus horas de hoy y sus días anteriores, contra lo que acostumbra.
  const S = SUCURSALES.map((def, i) => {
    const ticketN = B.ticket * def.tk
    const real = (espT, k) => {
      const tickets = Math.max(1, Math.round(espT * (1 + def.dT + (r() - 0.5) * 0.08)))
      const dP = def.baja ? (k <= 9 ? def.dP : -0.01) : def.dP
      return { tickets, venta: Math.round(tickets * ticketN * (1 + dP + (r() - 0.5) * 0.04)) }
    }
    const horas = HORAS.map((h, j) => {
      const espT = B.ticketsDia * def.escala * B.pesoDia[di] * (B.perfil[j] / B.sumaPerfil)
      const f = j < B.iAhora ? 1 : j === B.iAhora ? B.frac : 0
      const x = f ? real(espT * f, 0) : { tickets: 0, venta: 0 }
      return { etq: hLarga(h), espT, f, ...x, razon: f ? x.venta / (espT * f * ticketN) : 0 }
    })
    const dias = [null]
    for (let k = 1; k <= 31; k++) {
      const espT = B.ticketsDia * def.escala * pesoDe(k)
      const x = real(espT, k)
      dias.push({ espT, f: 1, ...x, razon: x.venta / (espT * ticketN) })
    }
    return { ...def, i, ticketN, horas, dias, cargo: m.personal[i % m.personal.length], msj: null }
  })

  let periodo = 'hoy'
  let orden = { col: 'venta', dir: -1 }
  let sel = 1

  /** Los puntos de una sucursal en el periodo: lo que lleva y lo que acostumbra. */
  function puntos(s) {
    if (periodo === 'hoy') return s.horas
    const hoyT = suma(s.horas, (x) => x.tickets)
    const hoyV = suma(s.horas, (x) => x.venta)
    const hoyEsp = suma(s.horas, (x) => x.espT * x.f)
    const diaEsp = suma(s.horas, (x) => x.espT)
    const hoyP = { espT: diaEsp, f: hoyEsp / diaEsp, tickets: hoyT, venta: hoyV, razon: suma(s.horas, (x) => x.razon * x.espT * x.f) / hoyEsp }
    const futuro = (k) => ({ espT: B.ticketsDia * s.escala * pesoDe(k), f: 0, tickets: 0, venta: 0, razon: 0 })
    if (periodo === 'semana') return DIAS.map((_, d) => (d < di ? s.dias[di - d] : d === di ? hoyP : futuro(di - d)))
    return Array.from({ length: diasMes }, (_, k) => (k + 1 < dm ? s.dias[dm - k - 1] : k + 1 === dm ? hoyP : futuro(dm - k - 1)))
  }

  function cifras(s) {
    const P = puntos(s)
    const venta = suma(P, (x) => x.venta)
    const tickets = suma(P, (x) => x.tickets)
    const espT = suma(P, (x) => x.espT * x.f)
    const espV = espT * s.ticketN
    const vs = venta / espV - 1
    return { s, P, venta, tickets, ticket: venta / tickets, espT: Math.round(espT), espV: Math.round(espV), vs, estado: vs < -0.05 ? 'abajo' : vs >= 0.03 ? 'arriba' : 'normal' }
  }

  const PERIODOS = [
    ['hoy', 'Hoy'],
    ['semana', 'Semana'],
    ['mes', 'Mes'],
  ]
  const lleva = () => (periodo === 'hoy' ? 'hoy' : periodo === 'semana' ? 'esta semana' : `en ${mes(ahora)}`)
  const costumbre = () => (periodo === 'hoy' ? `un ${DIAS[di]} a esta hora` : periodo === 'semana' ? 'una semana a estas alturas' : `un mes al día ${dm}`)
  const chip = (c) =>
    c.estado === 'abajo'
      ? `<span class="dk-chip dk-chip--alerta">! Por debajo de su promedio</span>`
      : c.estado === 'arriba'
        ? `<span class="dk-chip dk-chip--ok">▲ Arriba de su promedio</span>`
        : `<span class="dk-chip">En su promedio</span>`
  const dif = (x) => `${x >= 0 ? '+' : '−'}${pct(x)} %`

  /** Minigráfica: la línea punteada es lo que la sucursal acostumbra; la continua, lo que lleva. */
  function linea(c) {
    const W = 263
    const A = 52
    const P = c.P
    const esp = P.map((x) => x.espT * c.s.ticketN)
    const hecho = P.filter((x) => x.f > 0).map((x, k) => esp[k] * x.razon)
    const tope = Math.max(...esp, ...hecho) * 1.08
    const x = (k) => 4 + (k / (P.length - 1)) * (W - 8)
    const y = (v) => A - 4 - (v / tope) * (A - 9)
    const camino = (vals) => vals.map((v, k) => `${k ? 'L' : 'M'}${x(k).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
    const u = hecho.length - 1
    return `<svg class="sc-linea" viewBox="0 0 ${W} ${A}" aria-hidden="true">
      <path d="${camino(esp)}" fill="none" stroke="#c4c1b9" stroke-width="1.5" stroke-dasharray="3 4" stroke-linecap="round" />
      ${u > 0 ? `<path d="${camino(hecho)} L${x(u).toFixed(1)} ${A} L${x(0).toFixed(1)} ${A} Z" fill="var(--dk-acento-f)" opacity="0.7" /><path d="${camino(hecho)}" fill="none" stroke="var(--dk-acento)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />` : ''}
      <circle cx="${x(u).toFixed(1)}" cy="${y(hecho[u]).toFixed(1)}" r="4" fill="var(--dk-acento)" stroke="#fff" stroke-width="2" />
    </svg>`
  }

  /** Qué está pasando, en palabras, a partir de los mismos números. */
  function lectura(c) {
    const dTk = c.tickets / c.espT - 1
    const dPr = c.ticket / c.s.ticketN - 1
    const n = esc(c.s.nombre)
    if (c.estado === 'arriba') return `<p>${n} va ${pct(c.vs)} % arriba de lo que acostumbra en ${esc(costumbre())}.</p><p>${dTk > dPr ? 'Entraron más tickets de lo normal' : 'Cada ticket dejó un poco más de lo normal'}. Nada que revisar aquí.</p>`
    if (c.estado === 'normal') return `<p>${n} va dentro de lo que acostumbra en ${esc(costumbre())}.</p><p>Tickets y ticket promedio están en su rango. Nada que revisar aquí.</p>`
    const causa =
      dPr < -0.05 && dTk > -0.05
        ? `Entró casi la misma gente, pero cada ticket dejó menos: ${dinero(Math.round(c.ticket))} contra ${dinero(Math.round(c.s.ticketN))} de costumbre.`
        : dTk < -0.05 && dPr > -0.05
          ? `El ticket promedio está en lo normal. Lo que bajó fue la gente: ${c.tickets} tickets contra ${c.espT}.`
          : `Bajaron las dos cosas: menos tickets y menos por ticket.`
    const desde = periodo === 'mes' && dm > 12 ? ` Hasta el día ${dm - 10} iba en su promedio; la baja empezó después.` : ''
    return `<p>${n} lleva ${pct(c.vs)} % menos de lo que acostumbra en ${esc(costumbre())}.${desde}</p><p>${causa}</p><p>Conviene revisar si faltó ${esc(caro.nombre)}, que es de lo que más deja, o si se aplicó un descuento de más.</p>`
  }

  function htmlPanel(C) {
    const c = C.find((x) => x.s.i === sel) || C[0]
    const s = c.s
    const fila = (n, a, b, d) => `<span>${n}</span><span class="dk-fuerte">${a}</span><span>${b}</span><span style="color:${d < -0.05 ? 'var(--dk-alerta)' : 'var(--dk-tx2)'}">${dif(d)}</span>`
    return `
      <div class="dk-entre"><div><p class="dk-titulo">${esc(s.nombre)}</p><p class="dk-nota">A cargo: ${esc(s.cargo)}</p></div>${chip(c)}</div>
      <div class="sc-comp">
        <span class="sc-h"></span><span class="sc-h">Lleva ${esc(lleva())}</span><span class="sc-h">Acostumbra</span><span class="sc-h">Diferencia</span>
        ${fila('Venta', dinero(c.venta), dinero(c.espV), c.vs)}
        ${fila('Tickets', c.tickets, c.espT, c.tickets / c.espT - 1)}
        ${fila('Ticket promedio', dinero(Math.round(c.ticket)), dinero(Math.round(s.ticketN)), c.ticket / s.ticketN - 1)}
      </div>
      <div class="sc-lectura">${lectura(c)}</div>
      ${
        s.msj
          ? `<p class="sc-msj">Le preguntó a ${esc(s.cargo)} a las ${esc(s.msj.hora)}.</p>${s.msj.resp ? `<p class="sc-msj es-resp"><span class="dk-fuerte">${esc(s.cargo)} respondió:</span> ${esc(s.msj.resp)}</p>` : `<p class="dk-nota dk-pulso" style="margin-top:8px">Esperando respuesta…</p>`}`
          : c.estado === 'abajo'
            ? `<button class="dk-btn dk-btn--pri dk-mt-g tb-pri" data-pregunta="${s.i}">Preguntar a ${esc(s.cargo)}</button>`
            : ''
      }`
  }

  function htmlTabla(C) {
    const total = suma(C, (c) => c.venta)
    const valor = (c) => (orden.col === 'nombre' ? c.s.nombre : c[orden.col])
    const filas = [...C].sort((a, b) => (orden.col === 'nombre' ? valor(a).localeCompare(valor(b), 'es') : valor(a) - valor(b)) * orden.dir)
    const th = (col, n) => `<th><button class="sc-th" data-orden="${col}" ${orden.col === col ? `aria-sort="${orden.dir > 0 ? 'ascending' : 'descending'}"` : ''}>${n}<i>${orden.col === col ? (orden.dir > 0 ? '▲' : '▼') : '↕'}</i></button></th>`
    const tt = suma(C, (c) => c.tickets)
    return `<table class="sc-tabla">
      <thead><tr>${th('nombre', 'Sucursal')}${th('venta', 'Venta')}${th('tickets', 'Tickets')}${th('ticket', 'Ticket promedio')}${th('vs', 'Contra su promedio')}<th><span class="sc-th" style="justify-content:flex-end">Parte del total</span></th></tr></thead>
      <tbody>
        ${filas
          .map(
            (c) => `<tr data-suc="${c.s.i}" class="${c.s.i === sel ? 'es-sel' : ''}">
              <td>${c.estado === 'abajo' ? '<span class="sc-marca" title="Por debajo de su promedio">!</span>' : ''}${esc(c.s.nombre)}</td>
              <td>${dinero(c.venta)}</td><td>${c.tickets}</td><td>${dinero(Math.round(c.ticket))}</td>
              <td style="color:${c.estado === 'abajo' ? 'var(--dk-alerta)' : 'inherit'};font-weight:${c.estado === 'abajo' ? 700 : 400}">${dif(c.vs)}</td>
              <td><span class="sc-parte"><span class="dk-avance"><i style="--p:${Math.round((c.venta / total) * 100)}%"></i></span>${Math.round((c.venta / total) * 100)} %</span></td>
            </tr>`,
          )
          .join('')}
      </tbody>
      <tfoot><tr><td>Las ${C.length} juntas</td><td>${dinero(total)}</td><td>${tt}</td><td>${dinero(Math.round(total / tt))}</td><td>${dif(total / suma(C, (c) => c.espV) - 1)}</td><td></td></tr></tfoot>
    </table>`
  }

  const htmlResumen = (C) => {
    const bajas = C.filter((c) => c.estado === 'abajo')
    const total = suma(C, (c) => c.venta)
    return `<p>Las ${C.length} sucursales llevan <span class="dk-fuerte dk-num">${dinero(total)}</span> ${esc(lleva())}. ${bajas.length ? `${bajas.map((c) => esc(c.s.nombre)).join(' y ')} ${bajas.length > 1 ? 'necesitan' : 'necesita'} atención.` : 'Todas van en su promedio o arriba.'}</p>`
  }

  function pintar() {
    const C = S.map(cifras)
    el.innerHTML = `${CSS}
      <header class="dk-barra">
        <div class="dk-crece"><p class="dk-barra-t">${esc(negocio)} · sucursales</p><p class="dk-barra-s">${esc(DIAS[di].charAt(0).toUpperCase() + DIAS[di].slice(1))} ${dm} de ${esc(mes(ahora))} · cada venta se suma al momento</p></div>
        <div class="sc-periodo" role="tablist" aria-label="Periodo">
          ${PERIODOS.map(([id, n]) => `<button class="dk-tab" role="tab" aria-selected="${id === periodo}" data-periodo="${id}">${n}</button>`).join('')}
        </div>
      </header>
      <div class="sc-cuerpo" data-rueda>
        <div class="sc-resumen">
          <div data-resumen>${htmlResumen(C)}</div>
          <div class="sc-clave">
            <span><svg width="22" height="6"><path d="M1 3H21" stroke="var(--dk-acento)" stroke-width="2" stroke-linecap="round"/></svg>Lo que lleva</span>
            <span><svg width="22" height="6"><path d="M1 3H21" stroke="#b5b2aa" stroke-width="1.5" stroke-dasharray="3 4" stroke-linecap="round"/></svg>Lo que acostumbra</span>
          </div>
        </div>
        <div class="dk-rejilla dk-rejilla--4" style="gap:12px">
          ${C.map(
            (c) => `<button class="dk-tarjeta sc-suc ${c.s.i === sel ? 'dk-tarjeta--acento' : ''}" data-suc="${c.s.i}">
              <div class="dk-entre" style="align-items:flex-start"><div><p class="dk-fuerte" style="font-size:15px">${esc(c.s.nombre)}</p><p class="dk-nota">A cargo: ${esc(c.s.cargo)}</p></div><span data-chip>${chip(c)}</span></div>
              <p class="sc-venta dk-num" data-v="${c.venta}">${dinero(c.venta)}</p>
              <p class="dk-nota dk-num" data-vs>${htmlVs(c)}</p>
              ${linea(c)}
              <div class="sc-par"><div><b class="dk-num" data-t>${c.tickets}</b><span class="dk-nota">Tickets</span></div><div><b class="dk-num" data-tp>${dinero(Math.round(c.ticket))}</b><span class="dk-nota">Ticket promedio</span></div></div>
            </button>`,
          ).join('')}
        </div>
        <div class="sc-abajo">
          <section class="dk-tarjeta sc-caja" data-rueda>
            <div class="dk-entre"><p class="dk-titulo">Comparativo</p><p class="dk-nota">Toque un encabezado para ordenar</p></div>
            <div data-tabla>${htmlTabla(C)}</div>
          </section>
          <aside class="dk-tarjeta sc-caja" data-rueda data-panel>${htmlPanel(C)}</aside>
        </div>
      </div>`
  }

  const htmlVs = (c) => `<span class="dk-fuerte" style="color:${c.estado === 'abajo' ? 'var(--dk-alerta)' : 'var(--dk-tx)'}">${flecha(c.vs)} ${pct(c.vs)} %</span> contra lo que acostumbra`

  /** Entra una venta: se mueven las cifras de esa sucursal, la tabla y el resumen. */
  function refresca(cambio) {
    const C = S.map(cifras)
    C.forEach((c) => {
      const caja = el.querySelector(`.sc-suc[data-suc="${c.s.i}"]`)
      if (!caja) return
      const n = caja.querySelector('[data-v]')
      reducido || c.s.i !== cambio ? (n.textContent = dinero(c.venta)) : cuenta(n, c.venta, { formato: (x) => dinero(Math.round(x)) })
      n.dataset.v = c.venta
      caja.querySelector('[data-vs]').innerHTML = htmlVs(c)
      caja.querySelector('[data-chip]').innerHTML = chip(c)
      caja.querySelector('[data-t]').textContent = c.tickets
      caja.querySelector('[data-tp]').textContent = dinero(Math.round(c.ticket))
    })
    el.querySelector('[data-tabla]').innerHTML = htmlTabla(C)
    el.querySelector('[data-resumen]').innerHTML = htmlResumen(C)
    if (cambio === sel || cambio == null) el.querySelector('[data-panel]').innerHTML = htmlPanel(C)
  }

  function elegir(i) {
    sel = i
    el.querySelectorAll('.sc-suc').forEach((x) => x.classList.toggle('dk-tarjeta--acento', +x.dataset.suc === sel))
    refresca(null)
  }

  function preguntar(i) {
    const s = S[i]
    const c = cifras(s)
    const texto = `${s.cargo}, en ${s.nombre} el ticket promedio va en ${dinero(Math.round(c.ticket))} y lo normal son ${dinero(Math.round(s.ticketN))}. ¿Faltó algo o se está aplicando algún descuento?`
    const h = hoja(
      el,
      `<p class="dk-titulo">Preguntar a ${esc(s.cargo)}</p>
       <p class="dk-nota" style="margin-top:4px">El mensaje sale con los números de ${esc(s.nombre)}. Puede enviarlo tal cual.</p>
       <p class="sc-borrador">${esc(texto)}</p>
       <button class="dk-btn dk-btn--pri dk-btn--bloque dk-mt-g tb-pri" data-envia>Enviar mensaje</button>
       <button class="dk-btn dk-btn--bloque dk-mt" data-cerrar>Volver al comparativo</button>`,
    )
    h.el.querySelector('[data-envia]').addEventListener('click', () => {
      s.msj = { hora: hora() }
      h.cerrar()
      refresca(null)
      avisar(`Mensaje enviado a ${s.cargo}`)
      t.en(5200, () => {
        s.msj.resp = `No hemos tenido ${caro.nombre} desde temprano y es lo que más se pide. Ya quedó resuelto para mañana.`
        refresca(null)
        avisar(`${s.cargo} respondió`)
      })
    })
  }

  toca(el, '[data-periodo]', (b) => {
    periodo = b.dataset.periodo
    pintar()
  })
  toca(el, '[data-suc]', (b) => elegir(+b.dataset.suc))
  toca(el, '[data-orden]', (b) => {
    const col = b.dataset.orden
    orden = orden.col === col ? { col, dir: -orden.dir } : { col, dir: col === 'nombre' ? 1 : -1 }
    refresca(-1)
  })
  toca(el, '[data-pregunta]', (b) => preguntar(+b.dataset.pregunta))

  // Cada tanto se cobra algo en alguna sucursal.
  t.cada(3800, () => {
    const s = S[Math.floor(r() * S.length)]
    const v = B.venta()
    const h = s.horas[B.iAhora]
    h.tickets++
    h.venta += Math.round(v.total * s.tk * (s.baja ? 0.84 : 1))
    refresca(s.i)
  })

  pintar()
  return { destruir: () => t.limpia() }
}
