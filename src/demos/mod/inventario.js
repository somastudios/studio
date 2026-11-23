import { esc, dinero, toca, hoja, relojes, cuenta, hora, haceMin, tono, iniciales } from '../kit.js'

// Demo de inventario.
//   existencias — tableta: cada insumo con su mínimo; cuando algo baja, sale el aviso al dueño.
//   movimientos — teléfono: se escanea, se registra la entrada o la salida y el conteo cuadra.
//   compras     — tableta: la lista de compra sugerida según el consumo, lista para enviarse.
//   caducidades — tableta: lotes por fecha; lo que vence primero aparece arriba.
//   merma       — teléfono: lo que se pierde se anota con su motivo y se suma en el mes.

export default {
  id: 'inventario',
  nombre: 'Inventario',
  vistas: {
    existencias: { titulo: 'Así se ve su inventario', dispositivo: 'tableta' },
    movimientos: { titulo: 'Así se registra lo que entra y lo que sale', dispositivo: 'telefono' },
    compras: { titulo: 'Así se arma la lista de compra', dispositivo: 'tableta' },
    caducidades: { titulo: 'Así se vigilan las caducidades', dispositivo: 'tableta' },
    merma: { titulo: 'Así se anota la merma', dispositivo: 'telefono' },
  },
  montar(el, ctx) {
    const vistas = { existencias, movimientos, compras, caducidades, merma }
    return (vistas[ctx.vista] || existencias)(el, ctx)
  },
}

// ───────────────────────── Piezas comunes ─────────────────────────

const CSS = `<style>
.iv-r{flex:1;min-height:0;display:flex;flex-direction:column}
:is(.iv-r,.iv-h) button:is(.dk-btn--pri,.dk-btn--oscuro,.dk-ico-btn--pri){color:#fff}
:is(.iv-r,.iv-h) button.dk-btn--suave{color:var(--dk-acento)}

/* Tablas */
.iv-fila{display:grid;align-items:center;gap:14px;width:100%;min-height:54px;padding:8px 14px;text-align:left;background:none;border:0;border-top:1px solid var(--dk-linea);transition:background .5s}
.iv-fila--cab{min-height:36px;border-top:0;background:var(--dk-fondo);font-size:11.5px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--dk-tx2)}
.iv-fila.es-bajo{background:var(--dk-alerta-f)}
.iv-fila.es-agotado,.iv-fila.es-vencido{background:var(--dk-mal-f)}
.iv-fila.es-toco{animation:iv-toco 1.4s ease-out}
.iv-nom{min-width:0;font-weight:600;font-size:14.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.iv-nom small{display:block;font-weight:400;font-size:12px;color:var(--dk-tx2);overflow:hidden;text-overflow:ellipsis}
.iv-der{text-align:right}
.iv-ten{color:var(--dk-tx2)}
@keyframes iv-toco{0%{box-shadow:inset 4px 0 0 var(--dk-acento)}100%{box-shadow:inset 4px 0 0 transparent}}

/* Nivel con marca en el mínimo */
.iv-nivel{position:relative;display:block;height:10px;border-radius:999px;background:rgb(0 0 0/.08)}
.iv-nivel>i{display:block;height:100%;width:var(--p,0%);border-radius:inherit;background:var(--dk-ok);transition:width .6s cubic-bezier(.16,1,.3,1),background .3s}
.iv-nivel.es-bajo>i{background:#d98a0b}
.iv-nivel.es-agotado>i{background:var(--dk-mal)}
.iv-nivel::after{content:'';position:absolute;left:50%;top:-4px;bottom:-4px;width:2px;border-radius:2px;background:var(--dk-tx)}

/* Existencias */
.iv-ex{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 292px}
.iv-ex .iv-fila{grid-template-columns:minmax(0,1.5fr) 84px 84px minmax(0,1.2fr) 84px}
.iv-tick{display:flex;align-items:center;gap:8px;min-height:20px;margin-bottom:12px;font-size:12.5px;color:var(--dk-tx2)}
.iv-tick i{flex:none;width:8px;height:8px;border-radius:50%;background:var(--dk-ok)}
.iv-avisos{min-height:0;display:flex;flex-direction:column;border-left:1px solid var(--dk-linea);background:#efeae2}
.iv-avisos-cab{flex:none;display:flex;align-items:center;gap:10px;padding:12px 14px;background:var(--dk-sup);border-bottom:1px solid var(--dk-linea)}
.iv-avisos-c{flex:1;min-height:0;overflow-y:auto;padding:14px 12px;scrollbar-width:none}
.iv-avisos-c .dk-burbuja{max-width:94%;font-size:13.5px}
.iv-dia{align-self:center;margin-bottom:4px;padding:3px 10px;border-radius:8px;background:rgb(255 255 255/.8);font-size:11px;color:var(--dk-tx2)}

/* Controles */
.iv-paso{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0}
.iv-paso .dk-cant{gap:14px;font-size:20px}
.iv-paso .dk-cant b{min-width:86px;text-align:center}
.iv-seg{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:4px;padding:4px;border-radius:13px;background:rgb(0 0 0/.06)}
.iv-r .iv-seg button,.iv-h .iv-seg button{min-height:40px;text-align:center;border:0;border-radius:10px;background:none;font-weight:650;color:var(--dk-tx2)}
.iv-r .iv-seg button[aria-pressed=true],.iv-h .iv-seg button[aria-pressed=true]{background:var(--dk-sup);color:var(--dk-tx);box-shadow:0 1px 3px rgb(0 0 0/.14)}
.iv-ops{display:flex;flex-wrap:wrap;gap:6px}
.iv-r .iv-op,.iv-h .iv-op{min-height:36px;padding:0 13px;border-radius:999px;border:1px solid var(--dk-linea);background:var(--dk-sup);font-weight:600;font-size:13px;color:var(--dk-tx)}
.iv-r .iv-op[aria-pressed=true],.iv-h .iv-op[aria-pressed=true]{background:var(--dk-tx);border-color:var(--dk-tx);color:#fff}
.iv-volver{flex:none;display:grid;place-items:center;width:38px;height:38px;margin-left:-8px;padding:0 0 4px;border:0;border-radius:50%;background:none;font-size:30px;line-height:1;text-align:center}

/* Movimientos */
.iv-r .iv-scan{display:flex;flex-direction:column;align-items:center;gap:6px;width:100%;padding:24px 16px 22px;border:0;border-radius:20px;background:var(--dk-acento);color:#fff;transition:transform .12s}
.iv-scan:active{transform:scale(.98)}
.iv-scan b{font-size:20px;letter-spacing:-.01em}
.iv-scan small{font-size:12.5px;opacity:.8}
.iv-barras{display:block;background:repeating-linear-gradient(90deg,currentColor 0 3px,transparent 3px 5px,currentColor 5px 6px,transparent 6px 10px,currentColor 10px 14px,transparent 14px 16px,currentColor 16px 17px,transparent 17px 19px,currentColor 19px 21px,transparent 21px 25px)}
.iv-scan .iv-barras{width:74px;height:44px;margin-bottom:8px}
.iv-visor{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;padding:24px;background:#101012;color:#fff;text-align:center}
.iv-mira{position:relative;display:grid;place-items:center;width:264px;height:176px}
.iv-mira::before,.iv-mira::after{content:'';position:absolute;inset:0;border:3px solid #fff;border-radius:20px;clip-path:polygon(0 0,34px 0,34px 34px,0 34px)}
.iv-mira::before{clip-path:polygon(0 0,34px 0,34px 34px,calc(100% - 34px) 34px,calc(100% - 34px) 0,100% 0,100% 34px,0 34px)}
.iv-mira::after{clip-path:polygon(0 calc(100% - 34px),100% calc(100% - 34px),100% 100%,calc(100% - 34px) 100%,calc(100% - 34px) calc(100% - 34px),34px calc(100% - 34px),34px 100%,0 100%)}
.iv-etiqueta{display:grid;justify-items:center;gap:6px;padding:16px 18px 10px;border-radius:8px;background:#fff;color:#111;font:650 12.5px/1 var(--font-mono,sans-serif);font-stretch:64%;letter-spacing:.12em}
.iv-etiqueta .iv-barras{width:176px;height:78px}
.iv-rayo{position:absolute;left:10px;right:10px;top:22px;height:2px;border-radius:2px;background:#ff453a;box-shadow:0 0 14px 3px rgb(255 69 58/.65);animation:iv-barre 1s ease-in-out infinite alternate}
@keyframes iv-barre{to{top:calc(100% - 24px)}}
.iv-r .iv-visor .dk-btn{background:none;border-color:rgb(255 255 255/.3);color:#fff}
.iv-mov{flex:none;display:grid;place-items:center;width:38px;height:38px;border-radius:11px;font-weight:700;font-size:18px}
.iv-mov.es-entrada{background:var(--dk-ok-f);color:var(--dk-ok)}
.iv-mov.es-salida{background:var(--dk-alerta-f);color:var(--dk-alerta)}
.iv-monto{flex:none;text-align:right;font-weight:700;font-variant-numeric:tabular-nums}
.iv-monto small{display:block;font-weight:400;font-size:11.5px;color:var(--dk-tx2)}
.iv-grande{font-weight:750;font-size:34px;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1}
.iv-r .iv-quien{display:inline-flex;align-items:center;gap:7px;min-height:36px;padding:0 12px 0 4px;border-radius:999px;border:1px solid var(--dk-linea);background:var(--dk-sup);font-weight:600;font-size:13px;color:var(--dk-tx)}
.iv-r .iv-quien[aria-pressed=true]{border-color:var(--dk-tx);box-shadow:0 0 0 1px var(--dk-tx)}
.iv-quien .dk-avatar{width:28px;height:28px;font-size:10.5px;color:#333}

/* Compras */
.iv-prov{padding:0;overflow:hidden}
.iv-prov-cab{display:flex;align-items:center;gap:12px;padding:12px 14px}
.iv-co .iv-fila{grid-template-columns:minmax(0,1.4fr) 110px 110px 150px 70px 90px;min-height:50px}
.iv-co .dk-cant{gap:8px}
.iv-co .dk-cant b{min-width:44px;text-align:center}
.iv-co .dk-ico-btn{width:32px;height:32px;font-size:16px}
.iv-pie{display:flex;align-items:center;gap:16px}

/* Caducidades */
.iv-ca .iv-fila{grid-template-columns:minmax(0,1.3fr) 84px 92px 150px 78px 232px;min-height:58px}
.iv-acc{display:flex;justify-content:flex-end;gap:6px}
.iv-banda{display:flex;align-items:center;gap:10px;margin-top:10px;padding:10px 14px;border-radius:var(--dk-r);background:var(--dk-alerta-f);color:var(--dk-alerta);font-size:13.5px;font-weight:600}
.iv-cifra-mal .dk-cifra-n{color:var(--dk-mal)}
.iv-cifra-alerta .dk-cifra-n{color:var(--dk-alerta)}

/* Merma */
.iv-barh{display:grid;grid-template-columns:118px minmax(0,1fr) 62px;align-items:center;gap:10px;padding:5px 0;font-size:13px}
.iv-barh span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.iv-barh .dk-avance{height:10px}
.iv-barh b{text-align:right;font-variant-numeric:tabular-nums}
</style>`

function raiz(el) {
  el.innerHTML = `${CSS}<div class="iv-r"></div>`
  return el.lastElementChild
}

/** Vuelve a pintar sin perder el desplazamiento de las zonas marcadas con data-sc. */
function pinta(r, html) {
  const sc = [...r.querySelectorAll('[data-sc]')].map((x) => [x.dataset.sc, x.scrollTop])
  r.innerHTML = html
  for (const [k, y] of sc) {
    const x = r.querySelector(`[data-sc="${k}"]`)
    if (x) x.scrollTop = y
  }
}

/** Anima las cifras marcadas con data-cta desde su valor anterior. */
function cifras(r, mem) {
  r.querySelectorAll('[data-cta]').forEach((x) => {
    const k = x.dataset.cta
    const a = +x.dataset.a
    const de = mem.has(k) ? mem.get(k) : a
    mem.set(k, a)
    if (de === a) return
    x.dataset.v = de
    cuenta(x, a, { formato: (n) => dinero(Math.abs(n - a) < 0.5 ? a : Math.round(n)) })
  })
}

const abre = (el, html) => {
  const h = hoja(el, html)
  h.el.classList.add('iv-h')
  return h
}

const hash = (s) => {
  let h = 7
  for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 9973
  return h
}

const esPeso = (u) => /^(kg|kgs|kilos?)$/i.test(u)
const esVol = (u) => /^(l|lt|lts|litros?)$/i.test(u)
const esPieza = (u) => /^(pzas?|piezas?|uds?|unidades)$/i.test(u)

/** Costo por unidad de un insumo: ilustrativo, estable y a la escala de los precios del giro. */
function costoDe(x, productos) {
  const igual = productos.find((p) => p.nombre === x.nombre && p.precio > 0)
  if (igual) return Math.max(1, Math.round(igual.precio * 0.6))
  const precios = productos.map((p) => p.precio).filter((n) => n > 0)
  const piso = precios.length ? Math.min(...precios) : 50
  const h = hash(x.nombre)
  if (esPeso(x.unidad)) return 60 + (h % 19) * 10
  if (esVol(x.unidad)) return 24 + (h % 8) * 8
  if (esPieza(x.unidad)) return Math.max(1, Math.round(piso * (0.08 + (h % 5) * 0.02)))
  return Math.max(5, Math.round(piso * (0.5 + (h % 6) * 0.15)))
}

/** Un producto que claramente lleva ese insumo (comparten una palabra larga), o nada. */
function productoCon(x, productos) {
  const claves = x.nombre.toLowerCase().split(/\s+/).filter((w) => w.length >= 5)
  return productos.find((p) => claves.some((w) => p.nombre.toLowerCase().includes(w)))?.nombre || ''
}

const copia = (m) => m.insumos.map((x, i) => ({ id: i, nombre: x.nombre, unidad: x.unidad, hay: x.hay, minimo: x.minimo, costo: costoDe(x, m.productos) }))
const cant = (n, u) => `${Math.round(n * 100) / 100} ${u}`
const estado = (x) => (x.hay <= 0 ? 'agotado' : x.hay < x.minimo ? 'bajo' : 'bien')
const CHIP = { agotado: ['dk-chip--mal', 'Agotado'], bajo: ['dk-chip--alerta', 'Bajo'], bien: ['dk-chip--ok', 'Bien'] }
const chipEstado = (x) => `<span class="dk-chip ${CHIP[estado(x)][0]}">${CHIP[estado(x)][1]}</span>`
const nivel = (x) => Math.max(0, Math.min(100, (x.hay / (Math.max(x.minimo, 1) * 2)) * 100))
/** Cómo llamar a lo que se inventaría: una tienda guarda artículos; los demás giros, insumos. */
const palabra = (nicho) => (nicho?.familia === 'tiendas' ? 'artículo' : 'insumo')

const fCorta = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' })
const fMes = new Intl.DateTimeFormat('es-MX', { month: 'long' })
const enDias = (n) => {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + n)
  return d
}
const aIso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const diasHasta = (d) => Math.round((d - enDias(0)) / 86400000)

// ───────────────────────── Existencias (tableta) ─────────────────────────

function existencias(el, { negocio, nicho, m, avisar }) {
  const t = relojes()
  const r = raiz(el)
  const cosa = palabra(nicho)
  const ins = copia(m)
  const rango = (x) => ({ agotado: 0, bajo: 1, bien: 2 })[estado(x)]
  const textoAviso = (x) =>
    estado(x) === 'agotado'
      ? `${x.nombre} se agotó. Conviene pedir hoy mismo.`
      : `${x.nombre} bajó a ${cant(x.hay, x.unidad)}. El mínimo es ${cant(x.minimo, x.unidad)}. Conviene pedir hoy.`
  const avisos = ins.filter((x) => estado(x) !== 'bien').map((x, i, l) => ({ texto: textoAviso(x), h: haceMin(35 + (l.length - 1 - i) * 48) }))
  let ultima = null
  let toco = -1
  let cruces = 0
  let alFinal = false

  function pintar() {
    const orden = [...ins].sort((a, b) => rango(a) - rango(b) || (rango(a) < 2 ? a.hay / Math.max(a.minimo, 1) - b.hay / Math.max(b.minimo, 1) : a.id - b.id))
    const bajos = ins.filter((x) => estado(x) !== 'bien').length
    pinta(
      r,
      `<header class="dk-barra">
        <div class="dk-crece"><p class="dk-barra-t">${esc(negocio)} · Inventario</p><p class="dk-barra-s">${ins.length} ${cosa}s, cada uno con su mínimo</p></div>
        <span class="dk-chip ${bajos ? 'dk-chip--alerta' : 'dk-chip--ok'}">${bajos ? `${bajos} bajo el mínimo` : 'Todo sobre el mínimo'}</span>
      </header>
      <div class="iv-ex">
        <div class="dk-cuerpo" data-rueda data-sc="tabla">
          <p class="iv-tick"><i class="dk-pulso"></i>${
            ultima
              ? `<span>Venta de las ${ultima.h}${ultima.prod ? ` · ${esc(ultima.prod)}` : ''} · se descontó ${esc(cant(ultima.paso, ultima.unidad))} de ${esc(ultima.ins)}</span>`
              : `<span>Cada venta descuenta del inventario al momento.</span>`
          }</p>
          <div class="dk-lista">
            <div class="iv-fila iv-fila--cab"><span>${cosa}</span><span class="iv-der">Hay</span><span class="iv-der">Mínimo</span><span>Nivel</span><span>Estado</span></div>
            ${orden
              .map(
                (x) => `<button class="iv-fila ${estado(x) === 'bien' ? '' : 'es-' + estado(x)} ${x.id === toco ? 'es-toco' : ''}" data-ins="${x.id}">
                  <span class="iv-nom">${esc(x.nombre)}</span>
                  <span class="iv-der dk-num dk-fuerte">${esc(cant(x.hay, x.unidad))}</span>
                  <span class="iv-der dk-num iv-ten">${esc(cant(x.minimo, x.unidad))}</span>
                  <span class="iv-nivel es-${estado(x)}" style="--p:${nivel(x)}%"><i></i></span>
                  <span>${chipEstado(x)}</span>
                </button>`,
              )
              .join('')}
          </div>
          <p class="dk-nota dk-mt">Toque un ${cosa} para ajustar su existencia o cambiar su mínimo. La raya marca el mínimo.</p>
        </div>
        <aside class="iv-avisos">
          <div class="iv-avisos-cab"><span class="dk-avatar dk-avatar--ch">${esc(iniciales(negocio))}</span><div><p class="dk-fuerte">Avisos de inventario</p><p class="dk-nota">Así le llegan a su WhatsApp</p></div></div>
          <div class="iv-avisos-c dk-chat" data-rueda data-sc="chat">
            <span class="iv-dia">Hoy</span>
            ${
              avisos.map((a) => `<div class="dk-burbuja" ${a.nuevo ? '' : 'style="animation:none"'}>${esc(a.texto)}<small>${a.h}</small></div>`).join('') ||
              `<p class="dk-nota" style="text-align:center;padding:20px 10px">Aquí aparece el aviso cuando algo baja de su mínimo.</p>`
            }
          </div>
        </aside>
      </div>`,
    )
    toco = -1
    avisos.forEach((a) => (a.nuevo = false))
    if (alFinal) {
      const c = r.querySelector('.iv-avisos-c')
      c.scrollTop = c.scrollHeight
      alFinal = false
    }
  }

  function avisa(x) {
    avisos.push({ texto: textoAviso(x), h: hora(), nuevo: true })
    alFinal = true
    avisar(`Aviso enviado: ${x.nombre} ${estado(x) === 'agotado' ? 'se agotó' : 'bajó del mínimo'}`)
  }

  function detalle(x) {
    let hay = x.hay
    let minimo = x.minimo
    const h = abre(el, '')
    const dentro = () => {
      const y = { hay, minimo }
      h.el.innerHTML = `
        <div class="dk-entre"><p class="dk-titulo">${esc(x.nombre)}</p>${chipEstado(y)}</div>
        <div class="dk-mt-g"><span class="iv-nivel es-${estado(y)}" style="--p:${nivel(y)}%"><i></i></span></div>
        <div class="iv-paso dk-mt"><div><p class="dk-fuerte">Existencia</p><p class="dk-nota">Lo que hay contado hoy</p></div>
          <span class="dk-cant"><button class="dk-ico-btn" data-aj="hay" data-d="-1" aria-label="Quitar uno">−</button><b>${esc(cant(hay, x.unidad))}</b><button class="dk-ico-btn dk-ico-btn--pri" data-aj="hay" data-d="1" aria-label="Agregar uno">+</button></span></div>
        <div class="dk-sep" style="margin:2px 0"></div>
        <div class="iv-paso"><div><p class="dk-fuerte">Mínimo</p><p class="dk-nota">Por debajo de esto, llega el aviso</p></div>
          <span class="dk-cant"><button class="dk-ico-btn" data-aj="minimo" data-d="-1" aria-label="Bajar el mínimo">−</button><b>${esc(cant(minimo, x.unidad))}</b><button class="dk-ico-btn" data-aj="minimo" data-d="1" aria-label="Subir el mínimo">+</button></span></div>
        <button class="dk-btn dk-btn--pri dk-btn--bloque dk-mt-g" data-guardar ${hay === x.hay && minimo === x.minimo ? 'disabled' : ''}>Guardar cambios</button>
        <button class="dk-btn dk-btn--bloque dk-mt" data-cerrar>Cerrar sin cambios</button>`
    }
    dentro()
    h.el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-aj]')
      if (b) {
        if (b.dataset.aj === 'hay') hay = Math.max(0, hay + +b.dataset.d)
        else minimo = Math.max(0, minimo + +b.dataset.d)
        dentro()
      } else if (e.target.closest('[data-guardar]')) {
        const antes = estado(x)
        x.hay = hay
        x.minimo = minimo
        x.fijo = true // lo que ajustó la persona ya no lo mueve la simulación
        toco = x.id
        h.cerrar()
        if (estado(x) !== 'bien' && antes === 'bien') avisa(x)
        else avisar(estado(x) === 'bien' && antes !== 'bien' ? `${x.nombre} vuelve a estar sobre su mínimo` : `${x.nombre} quedó actualizado`)
        pintar()
      }
    })
  }

  toca(r, '[data-ins]', (b) => detalle(ins[+b.dataset.ins]))

  // Vida propia: se va vendiendo y el insumo más cercano a su mínimo baja hasta cruzarlo.
  const venta = () => {
    if (cruces >= 3) return
    const x = ins.filter((y) => estado(y) === 'bien' && !y.fijo).sort((a, b) => (a.hay - a.minimo) / Math.max(a.minimo, 1) - (b.hay - b.minimo) / Math.max(b.minimo, 1))[0]
    if (!x) return
    const paso = Math.min(x.hay, Math.max(1, Math.round(x.minimo * 0.15)))
    x.hay -= paso
    ultima = { h: hora(), prod: productoCon(x, m.productos), ins: x.nombre, paso, unidad: x.unidad }
    toco = x.id
    if (estado(x) !== 'bien') {
      cruces++
      avisa(x)
    }
    pintar()
  }
  t.en(2600, venta)
  t.cada(4200, venta)

  pintar()
  return { destruir: () => t.limpia() }
}

// ───────────────────────── Movimientos (teléfono) ─────────────────────────

function movimientos(el, { negocio, nicho, m, avisar, reducido }) {
  const t = relojes()
  const r = raiz(el)
  const cosa = palabra(nicho)
  const ins = copia(m)
  const MOTIVOS = { entrada: ['Compra a proveedor', 'Devolución', 'Ajuste de conteo'], salida: ['Venta o uso', 'Traslado', 'Ajuste de conteo'] }
  const codigo = (x) => `7501${String(1000 + hash(x.nombre)).slice(-4)}${String(10000 + x.id * 137 + 21).slice(-4)}`
  const sem = (i) => ins[i % ins.length]
  const hist = [
    { h: haceMin(18), quien: m.personal[2], x: sem(6), tipo: 'salida', n: 2, motivo: 'Venta o uso' },
    { h: haceMin(95), quien: m.personal[1], x: sem(3), tipo: 'entrada', n: Math.max(1, Math.round(sem(3).minimo / 2)), motivo: 'Compra a proveedor' },
    { h: haceMin(140), quien: m.personal[1], x: sem(4), tipo: 'entrada', n: Math.max(1, Math.round(sem(4).minimo / 2)), motivo: 'Compra a proveedor' },
  ].map((e) => ({ ...e, queda: e.x.hay }))
  const cola = [...ins].sort((a, b) => a.hay / Math.max(a.minimo, 1) - b.hay / Math.max(b.minimo, 1))
  let turno = 0
  let pantalla = 'inicio'
  let f = null // { x, tipo, n, motivo, quien }

  const queda = () => (f.tipo === 'entrada' ? f.x.hay + f.n : f.x.hay - f.n)

  function pintar() {
    if (pantalla === 'visor') {
      pinta(
        r,
        `<div class="iv-visor">
          <p class="dk-fuerte" style="font-size:16px">Apunte al código de barras</p>
          <div class="iv-mira"><div class="iv-etiqueta"><span class="iv-barras"></span>7 501000 012345</div><span class="iv-rayo"></span></div>
          <p class="dk-pulso" style="opacity:.75">Buscando el código…</p>
          <button class="dk-btn" data-cancelar>Cancelar</button>
        </div>`,
      )
      return
    }
    if (pantalla === 'form') {
      const x = f.x
      pinta(
        r,
        `<header class="dk-barra">
          <button class="iv-volver" data-cancelar aria-label="Volver">‹</button>
          <div class="dk-crece"><p class="dk-barra-t">Registrar movimiento</p><p class="dk-barra-s">Código ${codigo(x)}</p></div>
        </header>
        <div class="dk-cuerpo" data-rueda data-sc="form">
          <div class="dk-tarjeta dk-fila-h dk-aparece">
            <span class="dk-mosaico" style="background:${tono(x.nombre)};color:#333">${esc(x.nombre.charAt(0))}</span>
            <div class="dk-crece" style="flex:1;min-width:0"><p class="dk-fila-t">${esc(x.nombre)}</p><p class="dk-fila-s">Hay ${esc(cant(x.hay, x.unidad))} · mínimo ${esc(cant(x.minimo, x.unidad))}</p></div>
            ${chipEstado(x)}
          </div>
          <div class="iv-seg dk-mt">
            <button data-tipo="entrada" aria-pressed="${f.tipo === 'entrada'}">Entrada</button>
            <button data-tipo="salida" aria-pressed="${f.tipo === 'salida'}">Salida</button>
          </div>
          <div class="dk-tarjeta dk-mt" style="text-align:center">
            <p class="dk-nota">Cantidad</p>
            <div class="dk-entre" style="margin-top:8px">
              <button class="dk-ico-btn" style="width:48px;height:48px;font-size:22px" data-n="-1" aria-label="Quitar uno">−</button>
              <p class="iv-grande">${f.n} <span style="font-size:16px;font-weight:600;color:var(--dk-tx2)">${esc(x.unidad)}</span></p>
              <button class="dk-ico-btn dk-ico-btn--pri" style="width:48px;height:48px;font-size:22px" data-n="1" aria-label="Agregar uno">+</button>
            </div>
            <p class="dk-nota dk-mt">${f.tipo === 'entrada' ? 'Quedarán' : queda() > 0 ? 'Quedarán' : 'Se queda en'} <b class="dk-num" style="color:var(--dk-tx)">${esc(cant(queda(), x.unidad))}</b></p>
          </div>
          <p class="dk-etq">Motivo</p>
          <div class="iv-ops">${MOTIVOS[f.tipo].map((mo) => `<button class="iv-op" data-motivo="${mo}" aria-pressed="${f.motivo === mo}">${mo}</button>`).join('')}</div>
          <p class="dk-etq">Quién registra</p>
          <div class="iv-ops">${m.personal.map((p, i) => `<button class="iv-quien" data-quien="${i}" aria-pressed="${f.quien === i}"><span class="dk-avatar" style="background:${tono(p)}">${esc(iniciales(p))}</span>${esc(p)}</button>`).join('')}</div>
        </div>
        <footer class="dk-pie"><button class="dk-btn dk-btn--pri dk-btn--bloque" data-registrar ${f.n > 0 ? '' : 'disabled'}>Registrar ${f.tipo} de ${esc(cant(f.n, x.unidad))}</button></footer>`,
      )
      return
    }
    pinta(
      r,
      `<header class="dk-barra dk-barra--acento">
        <div class="dk-crece"><p class="dk-barra-t">${esc(negocio)}</p><p class="dk-barra-s">Entradas y salidas de inventario</p></div>
      </header>
      <div class="dk-cuerpo" data-rueda data-sc="inicio">
        <button class="iv-scan" data-escanear><span class="iv-barras"></span><b>Escanear</b><small>Apunte la cámara al código del ${cosa}</small></button>
        <button class="dk-btn dk-btn--bloque dk-mt" data-lista>Elegir de la lista</button>
        <div class="dk-entre" style="margin:20px 0 8px"><p class="dk-sub" style="margin:0">Movimientos de hoy</p><span class="dk-chip">${hist.length}</span></div>
        <div class="dk-lista">
          ${hist
            .map(
              (e) => `<div class="dk-fila ${e.nuevo ? 'dk-aparece' : ''}">
                <span class="iv-mov es-${e.tipo}">${e.tipo === 'entrada' ? '+' : '−'}</span>
                <div class="dk-crece"><p class="dk-fila-t">${esc(e.x.nombre)}</p><p class="dk-fila-s">${e.motivo}<br>${e.h} · ${esc(e.quien)}</p></div>
                <p class="iv-monto">${e.tipo === 'entrada' ? '+' : '−'}${esc(cant(e.n, e.x.unidad))}<small>quedan ${esc(cant(e.queda, e.x.unidad))}</small></p>
              </div>`,
            )
            .join('')}
        </div>
        <p class="dk-nota dk-mt" style="text-align:center">Cada movimiento queda con hora y con nombre.</p>
      </div>`,
    )
    hist.forEach((e) => (e.nuevo = false))
  }

  function abrirForm(x) {
    f = { x, tipo: estado(x) === 'bien' ? 'salida' : 'entrada', n: 1, motivo: '', quien: 0 }
    f.motivo = MOTIVOS[f.tipo][0]
    if (f.tipo === 'entrada') f.n = Math.max(1, x.minimo - x.hay + Math.round(x.minimo / 2))
    pantalla = 'form'
    pintar()
  }

  toca(r, '[data-escanear]', () => {
    pantalla = 'visor'
    pintar()
    t.en(reducido ? 600 : 1900, () => {
      if (pantalla !== 'visor') return
      abrirForm(cola[turno++ % cola.length])
      avisar(`Código reconocido: ${f.x.nombre}`)
    })
  })
  toca(r, '[data-lista]', () => {
    const h = abre(
      el,
      `<p class="dk-titulo">Elija el ${cosa}</p>
       <div class="dk-lista dk-mt">${ins.map((x) => `<button class="dk-fila" data-elige="${x.id}"><div class="dk-crece"><p class="dk-fila-t">${esc(x.nombre)}</p><p class="dk-fila-s">Hay ${esc(cant(x.hay, x.unidad))}</p></div>${chipEstado(x)}</button>`).join('')}</div>
       <button class="dk-btn dk-btn--bloque dk-mt" data-cerrar>Cerrar</button>`,
    )
    h.el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-elige]')
      if (!b) return
      h.cerrar()
      abrirForm(ins[+b.dataset.elige])
    })
  })
  toca(r, '[data-cancelar]', () => {
    pantalla = 'inicio'
    pintar()
  })
  toca(r, '[data-tipo]', (b) => {
    f.tipo = b.dataset.tipo
    f.motivo = MOTIVOS[f.tipo][0]
    if (f.tipo === 'salida') f.n = Math.min(f.n, f.x.hay)
    pintar()
  })
  toca(r, '[data-n]', (b) => {
    f.n = Math.max(0, f.n + +b.dataset.n)
    if (f.tipo === 'salida') f.n = Math.min(f.n, f.x.hay)
    pintar()
  })
  toca(r, '[data-motivo]', (b) => {
    f.motivo = b.dataset.motivo
    pintar()
  })
  toca(r, '[data-quien]', (b) => {
    f.quien = +b.dataset.quien
    pintar()
  })
  toca(r, '[data-registrar]', () => {
    if (!f.n) return
    f.x.hay = queda()
    hist.unshift({ h: hora(), quien: m.personal[f.quien], x: f.x, tipo: f.tipo, n: f.n, motivo: f.motivo, queda: f.x.hay, nuevo: true })
    avisar(`${f.tipo === 'entrada' ? 'Entrada registrada' : 'Salida registrada'}: ${f.x.nombre} queda en ${cant(f.x.hay, f.x.unidad)}`)
    pantalla = 'inicio'
    pintar()
    r.querySelector('[data-sc="inicio"]').scrollTop = 0
  })

  // Vida propia: alguien más del equipo registra desde otro celular.
  let k = 0
  t.cada(13000, () => {
    if (k >= 3) return
    const x = [...ins].sort((a, b) => b.hay - b.minimo - (a.hay - a.minimo))[k % ins.length]
    const n = Math.min(x.hay, Math.max(1, Math.round(x.minimo * 0.1)))
    if (!n) return
    const quien = m.personal[(k + 3) % m.personal.length]
    k++
    x.hay -= n
    hist.unshift({ h: hora(), quien, x, tipo: 'salida', n, motivo: 'Venta o uso', queda: x.hay, nuevo: true })
    if (pantalla === 'inicio') {
      pintar()
      avisar(`${quien} registró una salida de ${x.nombre}`)
    }
  })

  pintar()
  return { destruir: () => t.limpia() }
}

// ───────────────────────── Compras (tableta) ─────────────────────────

function compras(el, { negocio, nicho, m, avisar }) {
  const t = relojes()
  const r = raiz(el)
  const mem = new Map()
  const cosa = palabra(nicho)
  const PROVS = [
    { nombre: 'Distribuidora del Centro', entrega: 'el martes' },
    { nombre: 'Abastos La Central', entrega: 'el miércoles' },
    { nombre: 'Comercial Reyes', entrega: 'mañana' },
  ]
  const ins = copia(m).map((x, i, l) => {
    const consumo = Math.max(1, Math.round(x.minimo * (0.6 + (hash(x.nombre) % 5) * 0.15)))
    return { ...x, consumo, prov: Math.min(PROVS.length - 1, Math.floor((i * PROVS.length) / l.length)), pedir: 0 }
  })
  const sugerido = (x) => Math.max(0, Math.ceil(x.consumo + x.minimo - x.hay))
  ins.forEach((x) => (x.pedir = sugerido(x)))
  const enviado = PROVS.map(() => null) // hora en que se envió
  const sub = (p) => ins.filter((x) => x.prov === p).reduce((s, x) => s + x.pedir * x.costo, 0)
  let toco = -1

  function pintar() {
    const porEnviar = PROVS.reduce((s, _, p) => s + (enviado[p] ? 0 : sub(p)), 0)
    const yaEnviado = PROVS.reduce((s, _, p) => s + (enviado[p] ? sub(p) : 0), 0)
    const faltan = enviado.filter((e) => !e).length
    pinta(
      r,
      `<header class="dk-barra">
        <div class="dk-crece"><p class="dk-barra-t">${esc(negocio)} · Lista de compra sugerida</p><p class="dk-barra-s">Para la semana del ${fCorta.format(enDias(1))} al ${fCorta.format(enDias(7))}, según lo que se consumió</p></div>
        <span class="dk-chip ${faltan ? 'dk-chip--acento' : 'dk-chip--ok'}">${faltan ? `${faltan} ${faltan === 1 ? 'pedido' : 'pedidos'} por enviar` : 'Todo pedido'}</span>
      </header>
      <div class="dk-cuerpo iv-co" data-rueda data-sc="lista">
        ${PROVS.map((pv, p) => {
          const lista = ins.filter((x) => x.prov === p)
          if (!lista.length) return ''
          const ok = enviado[p]
          return `<section class="dk-tarjeta iv-prov">
            <div class="iv-prov-cab">
              <span class="dk-avatar" style="background:${tono(pv.nombre)};color:#333">${iniciales(pv.nombre)}</span>
              <div class="dk-crece" style="flex:1;min-width:0"><p class="dk-fuerte" style="font-size:15px">${pv.nombre}</p><p class="dk-nota">Entrega ${pv.entrega} · ${lista.filter((x) => x.pedir > 0).length} de ${lista.length} ${cosa}s por pedir</p></div>
              ${ok ? `<span class="dk-chip dk-chip--ok">✓ Pedido enviado ${ok}</span>` : ''}
              <span class="dk-titulo dk-num" style="min-width:90px;text-align:right">${dinero(sub(p))}</span>
              <button class="dk-btn dk-btn--chico ${ok ? '' : 'dk-btn--pri'}" data-enviar="${p}" ${sub(p) ? '' : 'disabled'}>${ok ? 'Ver el mensaje' : 'Enviar pedido al proveedor'}</button>
            </div>
            <div class="iv-fila iv-fila--cab" style="border-top:1px solid var(--dk-linea)"><span>${cosa}</span><span class="iv-der">Consumo semanal</span><span class="iv-der">Hay</span><span style="text-align:center">Sugerido a pedir</span><span class="iv-der">Costo</span><span class="iv-der">Importe</span></div>
            ${lista
              .map(
                (x) => `<div class="iv-fila ${x.id === toco ? 'es-toco' : ''}">
                  <span class="iv-nom">${esc(x.nombre)}</span>
                  <span class="iv-der dk-num">${esc(cant(x.consumo, x.unidad))}</span>
                  <span class="iv-der dk-num" ${estado(x) === 'bien' ? '' : 'style="color:var(--dk-alerta);font-weight:700"'}>${esc(cant(x.hay, x.unidad))}</span>
                  <span class="dk-cant" style="justify-content:center">${
                    ok
                      ? `<b>${esc(cant(x.pedir, x.unidad))}</b>`
                      : `<button class="dk-ico-btn" data-pedir="${x.id}" data-d="-1" aria-label="Pedir menos" ${x.pedir ? '' : 'disabled style="opacity:.35"'}>−</button><b>${x.pedir}</b><button class="dk-ico-btn" data-pedir="${x.id}" data-d="1" aria-label="Pedir más">+</button>`
                  }</span>
                  <span class="iv-der dk-num iv-ten">${dinero(x.costo)}</span>
                  <span class="iv-der dk-num dk-fuerte">${x.pedir ? dinero(x.pedir * x.costo) : '<span class="iv-ten" style="font-weight:400">Alcanza</span>'}</span>
                </div>`,
              )
              .join('')}
          </section>`
        }).join('')}
        <p class="dk-nota dk-mt">Lo sugerido cubre el consumo de una semana y deja el mínimo en bodega: consumo semanal + mínimo − lo que hay. Usted puede ajustar cada cantidad.</p>
      </div>
      <footer class="dk-pie iv-pie">
        <div class="dk-crece" style="flex:1"><p class="dk-nota">Total estimado por enviar</p><p class="dk-titulo dk-titulo--g dk-num" data-cta="porEnviar" data-a="${porEnviar}">${dinero(porEnviar)}</p></div>
        <div style="text-align:right"><p class="dk-nota">Ya pedido esta semana</p><p class="dk-titulo dk-num" data-cta="enviado" data-a="${yaEnviado}">${dinero(yaEnviado)}</p></div>
      </footer>`,
    )
    toco = -1
    cifras(r, mem)
  }

  function mensaje(p) {
    const pv = PROVS[p]
    const lista = ins.filter((x) => x.prov === p && x.pedir > 0)
    const texto = [`Buen día. Le escribimos de ${esc(negocio)}.`, 'Nuestro pedido de esta semana:', ...lista.map((x) => `• ${esc(cant(x.pedir, x.unidad))} de ${esc(x.nombre)}`), `Total estimado: ${dinero(sub(p))}.`, `¿Nos confirma si puede entregar ${pv.entrega}? Gracias.`].join('<br>')
    const ok = enviado[p]
    const h = abre(
      el,
      `<p class="dk-titulo">${ok ? 'Pedido enviado' : 'Pedido para'} ${ok ? 'a ' : ''}${pv.nombre}</p>
       <p class="dk-nota">${ok ? `Se envió por WhatsApp a las ${ok}.` : 'Este es el mensaje que recibe su proveedor por WhatsApp.'}</p>
       <div class="dk-chat dk-mt" style="padding:14px 12px;border-radius:14px;background:#efeae2"><div class="dk-burbuja dk-burbuja--yo" style="max-width:92%">${texto}<small>${ok || hora()}${ok ? ' ✓✓' : ''}</small></div></div>
       ${ok ? '' : `<button class="dk-btn dk-btn--pri dk-btn--bloque dk-mt-g" data-confirma>Enviar por WhatsApp</button>`}
       <button class="dk-btn dk-btn--bloque dk-mt" data-cerrar>${ok ? 'Cerrar' : 'Seguir revisando'}</button>`,
    )
    h.el.querySelector('[data-confirma]')?.addEventListener('click', () => {
      enviado[p] = hora()
      h.cerrar()
      avisar(`Pedido enviado a ${pv.nombre}`)
      pintar()
    })
  }

  toca(r, '[data-pedir]', (b) => {
    const x = ins[+b.dataset.pedir]
    x.pedir = Math.max(0, x.pedir + +b.dataset.d)
    pintar()
  })
  toca(r, '[data-enviar]', (b) => mensaje(+b.dataset.enviar))

  // Vida propia: se sigue vendiendo; lo que baja en bodega sube en la lista.
  let k = 0
  t.cada(8000, () => {
    const libres = ins.filter((x) => !enviado[x.prov] && x.hay > 0)
    if (k >= 4 || !libres.length) return
    const x = libres[(k++ * 3) % libres.length]
    const iba = x.pedir === sugerido(x)
    x.hay -= 1
    if (iba) x.pedir = sugerido(x)
    toco = x.id
    pintar()
    avisar(`Se usó ${cant(1, x.unidad)} de ${x.nombre}. La lista se ajustó.`)
  })

  pintar()
  return { destruir: () => t.limpia() }
}

// ───────────────────────── Caducidades (tableta) ─────────────────────────

function caducidades(el, { negocio, nicho, m, avisar }) {
  const t = relojes()
  const r = raiz(el)
  const mem = new Map()
  const cosa = palabra(nicho)
  const ins = copia(m)
  const DIAS = [-2, 1, 3, 2, 9, 17, 26, 48, 75]
  let folio = 412
  const lotes = DIAS.slice(0, Math.max(6, Math.min(DIAS.length, ins.length + 1))).map((d, i) => {
    const x = ins[(i * 3) % ins.length]
    return { id: i, x, lote: `L-${folio++}`, n: Math.max(1, Math.round(x.hay * (0.2 + (i % 3) * 0.1))), fecha: enDias(d), oferta: 0 }
  })
  let sig = lotes.length
  let merma = 0
  let retirados = 0
  let banda = null
  let nuevo = -1

  const grupo = (l) => {
    const d = diasHasta(l.fecha)
    return d < 0 ? 0 : d <= 3 ? 1 : d <= 30 ? 2 : 3
  }
  const chip = (l) => {
    const d = diasHasta(l.fecha)
    if (d < 0) return `<span class="dk-chip dk-chip--mal">Vencido hace ${-d} ${d === -1 ? 'día' : 'días'}</span>`
    if (d <= 3) return `<span class="dk-chip dk-chip--alerta">${d === 0 ? 'Vence hoy' : d === 1 ? 'Vence mañana' : `Vence en ${d} días`}</span>`
    if (d <= 30) return `<span class="dk-chip dk-chip--acento">Este mes · ${d} días</span>`
    return `<span class="dk-chip dk-chip--ok">Bien · ${d} días</span>`
  }
  const valor = (l) => l.n * l.x.costo
  const suma = (g) => lotes.filter((l) => grupo(l) === g).reduce((s, l) => s + valor(l), 0)
  const cuantos = (g) => lotes.filter((l) => grupo(l) === g).length
  const lotesTxt = (n) => `${n} ${n === 1 ? 'lote' : 'lotes'}`

  function pintar() {
    const orden = [...lotes].sort((a, b) => a.fecha - b.fecha)
    pinta(
      r,
      `<header class="dk-barra">
        <div class="dk-crece"><p class="dk-barra-t">${esc(negocio)} · Caducidades</p><p class="dk-barra-s">${lotesTxt(lotes.length)} con fecha · lo que vence primero va arriba</p></div>
        <button class="dk-btn dk-btn--pri dk-btn--chico" data-nuevo>+ Registrar lote</button>
      </header>
      <div class="dk-cuerpo iv-ca" data-rueda data-sc="lotes">
        <div class="dk-rejilla dk-rejilla--4">
          <div class="dk-cifra iv-cifra-alerta"><p class="dk-cifra-n" data-cta="g1" data-a="${suma(1)}">${dinero(suma(1))}</p><p class="dk-cifra-e">Por vencer en 3 días · ${lotesTxt(cuantos(1))}</p></div>
          <div class="dk-cifra iv-cifra-mal"><p class="dk-cifra-n" data-cta="g0" data-a="${suma(0)}">${dinero(suma(0))}</p><p class="dk-cifra-e">Ya vencido · ${lotesTxt(cuantos(0))}</p></div>
          <div class="dk-cifra"><p class="dk-cifra-n" data-cta="g2" data-a="${suma(2)}">${dinero(suma(2))}</p><p class="dk-cifra-e">Vence este mes · ${lotesTxt(cuantos(2))}</p></div>
          <div class="dk-cifra"><p class="dk-cifra-n" data-cta="merma" data-a="${merma}">${dinero(merma)}</p><p class="dk-cifra-e">Retirado a merma · ${lotesTxt(retirados)}</p></div>
        </div>
        ${banda ? `<div class="iv-banda dk-aparece"><span class="dk-crece" style="flex:1">${esc(banda.texto)}</span><span style="font-weight:400">Aviso enviado al dueño · ${banda.h}</span></div>` : ''}
        <div class="dk-lista dk-mt">
          <div class="iv-fila iv-fila--cab"><span>${cosa} y lote</span><span class="iv-der">Cantidad</span><span>Caduca</span><span>Estado</span><span class="iv-der">Valor</span><span></span></div>
          ${
            orden
              .map((l) => {
                const g = grupo(l)
                return `<div class="iv-fila ${g === 0 ? 'es-vencido' : g === 1 ? 'es-bajo' : ''} ${l.id === nuevo ? 'es-toco dk-aparece' : ''}">
                  <span class="iv-nom">${esc(l.x.nombre)}<small>Lote ${l.lote}${l.oferta ? ` · en oferta, ${l.oferta} % menos` : ''}</small></span>
                  <span class="iv-der dk-num">${esc(cant(l.n, l.x.unidad))}</span>
                  <span class="dk-num">${fCorta.format(l.fecha)}</span>
                  <span>${chip(l)}</span>
                  <span class="iv-der dk-num dk-fuerte">${dinero(valor(l))}</span>
                  <span class="iv-acc">
                    ${g === 0 ? '' : `<button class="dk-btn dk-btn--chico ${l.oferta ? '' : g === 1 ? 'dk-btn--oscuro' : ''}" data-oferta="${l.id}">${l.oferta ? 'Quitar oferta' : 'Poner en oferta'}</button>`}
                    <button class="dk-btn dk-btn--chico" data-retirar="${l.id}">Retirar</button>
                  </span>
                </div>`
              })
              .join('') || `<div class="dk-vacio"><p class="dk-fuerte">No hay lotes registrados</p><p class="dk-nota">Registre un lote con su fecha y aparecerá aquí, ordenado por urgencia.</p></div>`
          }
        </div>
        <p class="dk-nota dk-mt">Tres días antes de que un lote venza, llega el aviso. Lo que se retira pasa al registro de merma con su motivo.</p>
      </div>`,
    )
    nuevo = -1
    cifras(r, mem)
  }

  function oferta(l) {
    if (l.oferta) {
      l.oferta = 0
      avisar(`${l.x.nombre} volvió a su precio normal`)
      return pintar()
    }
    let d = 30
    const h = abre(el, '')
    const dentro = () => {
      h.el.innerHTML = `
        <p class="dk-titulo">Poner en oferta</p>
        <p class="dk-nota">${esc(l.x.nombre)} · lote ${l.lote} · ${esc(cant(l.n, l.x.unidad))} · caduca el ${fCorta.format(l.fecha)}</p>
        <p class="dk-etq">Descuento</p>
        <div class="iv-seg">${[20, 30, 50].map((p) => `<button data-d="${p}" aria-pressed="${p === d}">${p} % menos</button>`).join('')}</div>
        <div class="dk-tarjeta dk-mt">
          <div class="dk-entre"><span>Valor del lote</span><span class="dk-num">${dinero(valor(l))}</span></div>
          <div class="dk-entre dk-mt"><span class="dk-fuerte">Se recupera si se vende</span><span class="dk-titulo dk-num">${dinero(Math.round(valor(l) * (1 - d / 100)))}</span></div>
        </div>
        <p class="dk-nota dk-mt">La oferta se quita sola el día que el lote caduca.</p>
        <button class="dk-btn dk-btn--pri dk-btn--bloque dk-mt-g" data-ok>Poner en oferta con ${d} % menos</button>
        <button class="dk-btn dk-btn--bloque dk-mt" data-cerrar>Dejarlo como está</button>`
    }
    dentro()
    h.el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-d]')
      if (b) {
        d = +b.dataset.d
        dentro()
      } else if (e.target.closest('[data-ok]')) {
        l.oferta = d
        nuevo = l.id
        h.cerrar()
        avisar(`${l.x.nombre} quedó en oferta hasta el ${fCorta.format(l.fecha)}`)
        pintar()
      }
    })
  }

  function retirar(l) {
    const h = abre(
      el,
      `<p class="dk-titulo">Retirar el lote ${l.lote}</p>
       <p class="dk-nota">${esc(l.x.nombre)} · caduca el ${fCorta.format(l.fecha)}</p>
       <div class="dk-tarjeta dk-mt">
         <div class="dk-entre"><span>Sale del inventario</span><span class="dk-num dk-fuerte">${esc(cant(l.n, l.x.unidad))}</span></div>
         <div class="dk-entre dk-mt"><span>Se anota en merma como</span><span class="dk-chip">Caducó</span></div>
         <div class="dk-entre dk-mt"><span class="dk-fuerte">Valor que se pierde</span><span class="dk-titulo dk-num">${dinero(valor(l))}</span></div>
       </div>
       <button class="dk-btn dk-btn--oscuro dk-btn--bloque dk-mt-g" data-ok>Retirar y anotar en merma</button>
       <button class="dk-btn dk-btn--bloque dk-mt" data-cerrar>Dejarlo en el inventario</button>`,
    )
    h.el.querySelector('[data-ok]').addEventListener('click', () => {
      lotes.splice(lotes.indexOf(l), 1)
      merma += valor(l)
      retirados++
      h.cerrar()
      avisar(`Pasó a merma: ${cant(l.n, l.x.unidad)} de ${l.x.nombre}`)
      pintar()
    })
  }

  function registrar() {
    let n = 5
    const h = abre(
      el,
      `<p class="dk-titulo">Registrar lote</p>
       <label class="dk-etq" for="iv-l-ins">${cosa.charAt(0).toUpperCase() + cosa.slice(1)}</label>
       <select class="dk-campo" id="iv-l-ins">${ins.map((x) => `<option value="${x.id}">${esc(x.nombre)} (${esc(x.unidad)})</option>`).join('')}</select>
       <div class="iv-paso dk-mt"><p class="dk-fuerte">Cantidad</p><span class="dk-cant"><button class="dk-ico-btn" data-d="-1" aria-label="Menos">−</button><b data-n>5</b><button class="dk-ico-btn dk-ico-btn--pri" data-d="1" aria-label="Más">+</button></span></div>
       <label class="dk-etq" for="iv-l-fecha" style="margin-top:4px">Fecha de caducidad</label>
       <input class="dk-campo" id="iv-l-fecha" type="date" value="${aIso(enDias(6))}" />
       <button class="dk-btn dk-btn--pri dk-btn--bloque dk-mt-g" data-ok>Guardar lote</button>
       <button class="dk-btn dk-btn--bloque dk-mt" data-cerrar>Cancelar</button>`,
    )
    h.el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-d]')
      if (b) {
        n = Math.max(1, n + +b.dataset.d)
        h.el.querySelector('[data-n]').textContent = n
      } else if (e.target.closest('[data-ok]')) {
        const x = ins[+h.el.querySelector('#iv-l-ins').value]
        const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(h.el.querySelector('#iv-l-fecha').value)
        const fecha = p ? new Date(+p[1], +p[2] - 1, +p[3], 12) : enDias(6)
        const l = { id: sig++, x, lote: `L-${folio++}`, n, fecha, oferta: 0 }
        lotes.push(l)
        nuevo = l.id
        h.cerrar()
        avisar(`Lote ${l.lote} de ${x.nombre} guardado`)
        pintar()
      }
    })
  }

  toca(r, '[data-nuevo]', registrar)
  toca(r, '[data-oferta]', (b) => oferta(lotes.find((l) => l.id === +b.dataset.oferta)))
  toca(r, '[data-retirar]', (b) => retirar(lotes.find((l) => l.id === +b.dataset.retirar)))

  // Vida propia: llega el aviso del lote que está por vencer.
  t.en(5200, () => {
    const l = [...lotes].sort((a, b) => a.fecha - b.fecha).find((x) => grupo(x) === 1)
    if (!l) return
    const d = diasHasta(l.fecha)
    banda = { texto: `${d === 0 ? 'Hoy' : d === 1 ? 'Mañana' : `En ${d} días`} vence el lote ${l.lote} de ${l.x.nombre} (${cant(l.n, l.x.unidad)}). Conviene moverlo antes.`, h: hora() }
    pintar()
    avisar('Aviso enviado al dueño')
  })

  pintar()
  return { destruir: () => t.limpia() }
}

// ───────────────────────── Merma (teléfono) ─────────────────────────

function merma(el, { negocio, nicho, m, avisar }) {
  const t = relojes()
  const r = raiz(el)
  const mem = new Map()
  const cosa = palabra(nicho)
  const ins = copia(m)
  const MOTIVOS = ['Caducó', 'Se dañó', 'Error de preparación', 'Robo o faltante', 'Otro']
  const hoy = new Date().getDate()
  const cuando = (d) => (d === 0 ? 'Hoy' : d === 1 ? 'Ayer' : fCorta.format(enDias(-d)))
  const sem = (i, d, motivo, quien, n) => {
    const x = ins[i % ins.length]
    return { x, n: Math.max(1, n), motivo, quien: m.personal[quien % m.personal.length], dias: Math.min(d, hoy - 1) }
  }
  const lista = [sem(4, 1, 'Caducó', 0, 2), sem(6, 3, 'Se dañó', 2, 3), sem(1, 6, 'Error de preparación', 1, 1), sem(2, 9, 'Caducó', 0, 1), sem(5, 13, 'Robo o faltante', 3, 4), sem(0, 17, 'Error de preparación', 1, 1)]
  const valor = (e) => e.n * e.x.costo

  function pintar() {
    const total = lista.reduce((s, e) => s + valor(e), 0)
    const porMotivo = MOTIVOS.map((mo) => [mo, lista.filter((e) => e.motivo === mo).reduce((s, e) => s + valor(e), 0)]).filter(([, s]) => s > 0)
    const tope = Math.max(1, ...porMotivo.map(([, s]) => s))
    pinta(
      r,
      `<header class="dk-barra dk-barra--acento">
        <div class="dk-crece"><p class="dk-barra-t">${esc(negocio)}</p><p class="dk-barra-s">Registro de merma</p></div>
      </header>
      <div class="dk-cuerpo" data-rueda data-sc="merma">
        <div class="dk-tarjeta">
          <p class="dk-nota">Merma de ${fMes.format(new Date())}</p>
          <div class="dk-entre"><p class="iv-grande" style="margin-top:4px" data-cta="total" data-a="${total}">${dinero(total)}</p><span class="dk-chip">${lista.length} registros</span></div>
          <div class="dk-sep"></div>
          ${porMotivo
            .sort((a, b) => b[1] - a[1])
            .map(([mo, s]) => `<div class="iv-barh"><span>${mo}</span><span class="dk-avance"><i style="--p:${(s / tope) * 100}%"></i></span><b>${dinero(s)}</b></div>`)
            .join('')}
        </div>
        <p class="dk-sub">Lo anotado este mes</p>
        <div class="dk-lista">
          ${lista
            .map(
              (e) => `<div class="dk-fila ${e.nuevo ? 'dk-aparece' : ''}">
                <div class="dk-crece"><p class="dk-fila-t">${esc(cant(e.n, e.x.unidad))} de ${esc(e.x.nombre)}</p><p class="dk-fila-s">${cuando(e.dias)}${e.h ? ', ' + e.h : ''} · ${esc(e.quien)} · ${e.motivo}</p></div>
                <span class="dk-num dk-fuerte">${dinero(valor(e))}</span>
              </div>`,
            )
            .join('')}
        </div>
      </div>
      <footer class="dk-pie"><button class="dk-btn dk-btn--pri dk-btn--bloque" data-nueva>Registrar una pérdida</button></footer>`,
    )
    lista.forEach((e) => (e.nuevo = false))
    cifras(r, mem)
  }

  function registrar() {
    const f = { x: ins[0], n: 1, motivo: MOTIVOS[0] }
    const h = abre(el, '')
    const dentro = () => {
      h.el.innerHTML = `
        <p class="dk-titulo">Registrar una pérdida</p>
        <p class="dk-etq">¿Qué se perdió?</p>
        <div class="iv-ops">${ins.map((x) => `<button class="iv-op" data-x="${x.id}" aria-pressed="${x === f.x}">${esc(x.nombre)}</button>`).join('')}</div>
        <div class="iv-paso dk-mt"><div><p class="dk-fuerte">Cantidad</p><p class="dk-nota dk-num">Vale ${dinero(f.n * f.x.costo)}</p></div>
          <span class="dk-cant"><button class="dk-ico-btn" data-d="-1" aria-label="Menos">−</button><b>${esc(cant(f.n, f.x.unidad))}</b><button class="dk-ico-btn dk-ico-btn--pri" data-d="1" aria-label="Más">+</button></span></div>
        <p class="dk-etq" style="margin-top:4px">Motivo</p>
        <div class="iv-ops">${MOTIVOS.map((mo) => `<button class="iv-op" data-mo="${mo}" aria-pressed="${mo === f.motivo}">${mo}</button>`).join('')}</div>
        <button class="dk-btn dk-btn--pri dk-btn--bloque dk-mt-g" data-ok>Anotar pérdida de ${dinero(f.n * f.x.costo)}</button>
        <button class="dk-btn dk-btn--bloque dk-mt" data-cerrar>Cancelar</button>`
    }
    dentro()
    h.el.addEventListener('click', (e) => {
      const b = e.target.closest('button')
      if (!b) return
      if (b.dataset.x) f.x = ins[+b.dataset.x]
      else if (b.dataset.d) f.n = Math.max(1, f.n + +b.dataset.d)
      else if (b.dataset.mo) f.motivo = b.dataset.mo
      else if (b.dataset.ok !== undefined) {
        lista.unshift({ x: f.x, n: f.n, motivo: f.motivo, quien: m.personal[0], dias: 0, h: hora(), nuevo: true })
        h.cerrar()
        avisar(`Anotado: ${cant(f.n, f.x.unidad)} de ${f.x.nombre}, ${f.motivo.toLowerCase()}`)
        pintar()
        r.querySelector('[data-sc="merma"]').scrollTop = 0
        return
      } else return
      dentro()
    })
  }

  toca(r, '[data-nueva]', registrar)

  // Vida propia: alguien del equipo anota una pérdida desde su celular.
  let k = 0
  t.cada(14000, () => {
    if (k >= 2) return
    const x = ins[(k * 2 + 3) % ins.length]
    const e = { x, n: 1, motivo: MOTIVOS[1 + (k % 2)], quien: m.personal[(k + 2) % m.personal.length], dias: 0, h: hora(), nuevo: true }
    k++
    lista.unshift(e)
    pintar()
    avisar(`${e.quien} anotó ${cant(e.n, x.unidad)} de ${x.nombre}`)
  })

  pintar()
  return { destruir: () => t.limpia() }
}
