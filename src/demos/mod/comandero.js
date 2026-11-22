import { esc, dinero, toca, hoja, relojes, cuenta, hora, haceMin, porGrupo, tono } from '../kit.js'

// Demo: comandero.
//   mesas       — celular de quien atiende: mapa de mesas, orden por mesa, envío a preparación y cobro.
//   solicitudes — llamados que llegan desde las mesas; arriba se cambia al lado del cliente para generarlos.

export default {
  id: 'comandero',
  nombre: 'Comandero',
  vistas: {
    mesas: { titulo: 'Así se toma la orden', dispositivo: 'telefono' },
    solicitudes: { titulo: 'Así llama la mesa', dispositivo: 'telefono' },
  },
  montar(el, ctx) {
    return ctx.vista === 'solicitudes' ? solicitudes(el, ctx) : mesas(el, ctx)
  },
}

// Las primeras líneas repiten valores del kit para los botones: la regla general `.dk button`
// pesa más que las clases `dk-btn` y les quita color y peso. Si el kit se corrige, no cambian nada.
const ESTILO = `<style>
.cm-raiz .dk-btn{font-weight:650;font-size:14.5px}
.cm-raiz .dk-btn--chico{font-size:13px}
.cm-raiz .dk-btn--pri,.cm-raiz .dk-btn--oscuro,.cm-raiz .dk-ico-btn--pri{color:#fff}
.cm-raiz .dk-btn--suave{color:var(--dk-acento)}
.cm-raiz .dk-ico-btn{font-size:18px;font-weight:600}
.cm-raiz .dk-tab{font-weight:600;font-size:13px;color:var(--dk-tx2)}
.cm-raiz .dk-tab[aria-selected=true]{color:#fff}
.cm-res{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.cm-res>div{background:var(--dk-sup);border:1px solid var(--dk-linea);border-radius:12px;padding:9px 11px}
.cm-res b{display:block;font-size:19px;font-weight:750;letter-spacing:-.02em;line-height:1.15;font-variant-numeric:tabular-nums}
.cm-res span{font-size:11.5px;color:var(--dk-tx2)}
.cm-mapa{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}
.cm-raiz .cm-mesa{min-width:0;display:flex;flex-direction:column;justify-content:space-between;gap:14px;min-height:112px;padding:12px;text-align:left;border-radius:14px;border:1px solid var(--dk-linea);background:var(--dk-sup);transition:transform .12s}
.cm-mesa:active{transform:scale(.97)}
.cm-mesa-n{font-weight:750;font-size:17px;letter-spacing:-.01em;white-space:nowrap}
.cm-mesa-d{font-size:12.5px;color:var(--dk-tx2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cm-mesa-m{font-weight:700;font-size:15px;font-variant-numeric:tabular-nums}
.cm-mesa.es-libre{background:transparent;border-style:dashed;border-color:#d2cfc6}
.cm-mesa.es-libre .cm-mesa-n{color:var(--dk-tx2)}
.cm-mesa.es-cuenta{background:var(--dk-alerta-f);border-color:#ecd096}
.cm-mesa.es-cuenta .cm-mesa-d{color:var(--dk-alerta)}
.cm-raiz .cm-atras{flex:none;display:grid;place-items:center;width:36px;height:36px;margin-left:-6px;border:0;border-radius:50%;background:var(--dk-fondo);font-size:22px;line-height:1;padding-bottom:3px}
.cm-ren{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:6px 0;font-size:14px}
.cm-ren>span:first-child{min-width:0}
.cm-aviso{display:flex;gap:10px;align-items:center;padding:10px 12px;margin-bottom:10px;border-radius:12px;background:var(--dk-alerta-f);color:var(--dk-alerta);font-weight:600;font-size:13px}
.cm-pago{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.cm-raiz .cm-pago button{text-align:center;padding:0 4px;min-height:40px;border-radius:10px;border:1px solid var(--dk-linea);background:var(--dk-sup);font-weight:600;font-size:13px}
.cm-raiz .cm-pago button[aria-pressed=true]{background:var(--dk-tx);border-color:var(--dk-tx);color:#fff}
.cm-seg{flex:none;display:flex;align-items:center;gap:10px;padding:8px 12px;background:#17171a;color:#fff}
.cm-seg-e{font-size:11.5px;font-weight:600;opacity:.7;white-space:nowrap}
.cm-seg-b{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:3px;padding:3px;border-radius:10px;background:rgb(255 255 255/.14)}
.cm-raiz .cm-seg-b button{min-height:32px;border:0;border-radius:8px;background:none;font-weight:650;font-size:13px;color:rgb(255 255 255/.78);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 8px}
.cm-raiz .cm-seg-b button[aria-pressed=true]{background:#fff;color:#17171a}
.cm-num{font-size:18px;border-radius:12px}
.cm-acc{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
.cm-acc--1{grid-template-columns:1fr}
.cm-raiz .cm-pide{display:flex;align-items:center;gap:14px;width:100%;min-height:82px;padding:14px;text-align:left;border-radius:16px;border:1px solid var(--dk-linea);background:var(--dk-sup);transition:transform .12s,opacity .2s}
.cm-pide+.cm-pide{margin-top:10px}
.cm-pide:active{transform:scale(.98)}
.cm-pide:disabled{opacity:.45;pointer-events:none}
.cm-pide.es-mio{opacity:1;border-color:var(--dk-acento);box-shadow:0 0 0 3px var(--dk-acento-f)}
.cm-pide-i{flex:none;display:grid;place-items:center;width:50px;height:50px;border-radius:14px;background:var(--dk-acento-f);color:var(--dk-acento)}
.cm-pide-i svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.cm-pide-t{font-weight:700;font-size:16.5px;letter-spacing:-.01em}
.cm-hecho{display:flex;align-items:center;gap:10px;padding:9px 2px;font-size:13px;color:var(--dk-tx2)}
.cm-hecho+.cm-hecho{border-top:1px solid var(--dk-linea)}
.cm-hecho i{flex:none;display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:var(--dk-ok-f);color:var(--dk-ok);font-style:normal;font-weight:700;font-size:12px}
</style>`

const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1)
const sinArt = (s) => String(s).replace(/^(el|la|los|las)\s+/i, '')
const al = (s) => (/^el\s/i.test(s) ? 'al ' + String(s).slice(3) : 'a ' + s)
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

// En comida son mesas; en cualquier otro giro, lugares.
const lugarDe = (nicho) =>
  nicho?.familia === 'comida' ? { uno: 'Mesa', varios: 'mesas', o: 'a', art: 'la', arts: 'las' } : { uno: 'Lugar', varios: 'lugares', o: 'o', art: 'el', arts: 'los' }

// Repinta sin perder el aviso ni la hoja abierta, y conserva el desplazamiento de cada zona.
function pon(el, html) {
  const fijos = [...el.children].filter((c) => c.matches('.dk-toast, .dk-velo'))
  const y = {}
  el.querySelectorAll('[data-rueda]').forEach((z) => z.dataset.rueda && (y[z.dataset.rueda] = z.scrollTop))
  el.classList.add('cm-raiz')
  el.innerHTML = ESTILO + html
  el.querySelectorAll('[data-rueda]').forEach((z) => y[z.dataset.rueda] && (z.scrollTop = y[z.dataset.rueda]))
  fijos.forEach((c) => el.appendChild(c))
}

// ───────────────────────── Mesas: tomar la orden ─────────────────────────

function mesas(el, { negocio, m, v, nicho, avisar }) {
  const t = relojes()
  const L = lugarDe(nicho)
  const comida = L.uno === 'Mesa'
  const P = m.productos
  const cats = porGrupo(P, 'categoria')
  const yo = m.personal[0]
  const it = (i, cant) => ({ ...P[i % P.length], cant, enviado: true })
  const quien = (i, n) => (comida ? `${n} personas` : m.clientes[i % m.clientes.length])

  const lista = [
    { n: 1, estado: 'ocupada', quien: quien(0, 2), min: 38, orden: [it(0, 1), it(4, 2), it(10, 2)] },
    { n: 2, estado: 'libre' },
    { n: 3, estado: 'cuenta', quien: quien(1, 4), min: 71, orden: [it(1, 1), it(3, 2), it(7, 2), it(8, 2), it(11, 4)] },
    { n: 4, estado: 'ocupada', quien: quien(2, 3), min: 12, orden: [it(2, 2), it(12, 3)] },
    { n: 5, estado: 'ocupada', quien: quien(3, 2), min: 24, orden: [it(5, 1), it(6, 1), it(13, 2)] },
    { n: 6, estado: 'libre' },
    { n: 7, estado: 'ocupada', quien: quien(4, 6), min: 49, orden: [it(0, 2), it(4, 3), it(3, 3), it(12, 6)] },
    { n: 8, estado: 'libre' },
  ].map((x) => ({ orden: [], ...x, pend: new Map() }))

  let pantalla = 'mapa' // mapa | orden | enviada
  let abierta = null
  let tab = 'orden'
  let cobrado = 6840
  let ultimo = null // lo último que se envió, para la confirmación
  let sentados = 5

  const suma = (o) => o.reduce((s, x) => s + x.cant * x.precio, 0)
  const precio = (nombre) => P.find((p) => p.nombre === nombre).precio
  const sumaPend = (ms) => [...ms.pend].reduce((s, [n, c]) => s + c * precio(n), 0)
  const piezasPend = (ms) => [...ms.pend.values()].reduce((s, c) => s + c, 0)
  const nombreDe = (ms) => `${L.uno} ${ms.n}`

  function pintar(cobradoAntes) {
    if (pantalla === 'orden') return pon(el, orden())
    if (pantalla === 'enviada') return pon(el, enviada())
    pon(el, mapa(cobradoAntes ?? cobrado))
    if (cobradoAntes != null) cuenta(el.querySelector('[data-cobrado]'), cobrado, { formato: (n) => dinero(Math.round(n)) })
  }

  function mapa(cobradoMostrado) {
    const ocupadas = lista.filter((x) => x.estado !== 'libre').length
    const cuentas = lista.filter((x) => x.estado === 'cuenta').length
    return `
      <header class="dk-barra dk-barra--acento">
        <div class="dk-crece"><p class="dk-barra-t">${esc(negocio)}</p><p class="dk-barra-s">${esc(yo)} · ${ocupadas} de ${lista.length} ${L.varios} con orden abierta</p></div>
      </header>
      <div class="dk-cuerpo" data-rueda="mapa">
        <div class="cm-res">
          <div><b>${ocupadas}</b><span>Ocupad${L.o}s</span></div>
          <div><b>${cuentas}</b><span>Piden la cuenta</span></div>
          <div><b data-cobrado data-v="${cobradoMostrado}">${dinero(cobradoMostrado)}</b><span>Cobrado hoy</span></div>
        </div>
        <div class="cm-mapa">
          ${lista
            .map((x) => {
              const chip =
                x.estado === 'libre'
                  ? `<span class="dk-chip">Libre</span>`
                  : x.estado === 'cuenta'
                    ? `<span class="dk-chip dk-chip--alerta dk-pulso">Cuenta</span>`
                    : `<span class="dk-chip dk-chip--acento dk-num">${x.min} min</span>`
              return `<button class="cm-mesa es-${x.estado}" data-mesa="${x.n}" aria-label="${nombreDe(x)}">
                <span class="dk-entre"><span class="cm-mesa-n">${nombreDe(x)}</span>${chip}</span>
                ${
                  x.estado === 'libre'
                    ? `<span class="cm-mesa-d">Abrir una orden</span>`
                    : `<span><span class="cm-mesa-d" style="display:block">${x.estado === 'cuenta' ? 'Pidió la cuenta' : esc(x.quien)}</span><span class="cm-mesa-m">${dinero(suma(x.orden))}</span></span>`
                }
              </button>`
            })
            .join('')}
        </div>
        <p class="dk-nota dk-mt" style="text-align:center">Toque ${comida ? 'una mesa' : 'un lugar'} para ver su orden o agregarle algo.</p>
      </div>`
  }

  function orden() {
    const ms = abierta
    const hayPend = ms.pend.size > 0
    const total = suma(ms.orden)
    const nOrden = ms.orden.reduce((s, x) => s + x.cant, 0) + piezasPend(ms)
    const chip =
      ms.estado === 'libre' ? `<span class="dk-chip">Libre</span>` : ms.estado === 'cuenta' ? `<span class="dk-chip dk-chip--alerta">Pidió la cuenta</span>` : `<span class="dk-chip dk-chip--acento">Abierta</span>`

    let cuerpo
    if (tab === 'orden') {
      const vacia = !ms.orden.length && !hayPend
      cuerpo = vacia
        ? `<div class="dk-vacio" style="padding:56px 20px">
            <p class="dk-titulo">${nombreDe(ms)} libre</p>
            <p class="dk-nota">Elija una categoría arriba y agregue lo primero que pidan. La orden se abre al enviarla a preparación.</p>
            <button class="dk-btn dk-btn--suave dk-mt" data-tab="${esc(cats[0][0])}">Ver ${esc(cats[0][0].toLowerCase())}</button>
          </div>`
        : `${ms.estado === 'cuenta' ? `<div class="cm-aviso">Pidió la cuenta. Revise la orden y cobre.</div>` : ''}
          ${
            ms.orden.length
              ? `<div class="dk-tarjeta">
                  <div class="dk-entre"><span class="dk-fuerte">En preparación o servido</span><span class="dk-chip dk-chip--ok">Enviado</span></div>
                  <div class="dk-mt">
                    ${ms.orden.map((x) => `<div class="cm-ren"><span>${x.cant} × ${esc(x.nombre)}</span><span class="dk-num dk-fuerte">${dinero(x.cant * x.precio)}</span></div>`).join('')}
                  </div>
                  ${ms.nota ? `<p class="dk-nota" style="margin-top:6px">Nota: ${esc(ms.nota)}</p>` : ''}
                  <div class="dk-sep"></div>
                  <div class="dk-entre"><span class="dk-fuerte">Cuenta hasta ahora</span><span class="dk-titulo dk-num">${dinero(total)}</span></div>
                </div>`
              : ''
          }
          ${
            hayPend
              ? `<div class="dk-tarjeta dk-tarjeta--acento">
                  <div class="dk-entre"><span class="dk-fuerte">Por enviar</span><span class="dk-chip dk-chip--acento">${piezasPend(ms)} sin enviar</span></div>
                  <div class="dk-mt">
                    ${[...ms.pend].map(([n, c]) => `<div class="cm-ren"><span>${c} × ${esc(n)}</span><span class="dk-num dk-fuerte">${dinero(c * precio(n))}</span></div>`).join('')}
                  </div>
                </div>`
              : ''
          }
          <p class="dk-nota dk-mt" style="text-align:center">${ms.estado === 'libre' ? 'Orden nueva. Todavía no sale a preparación.' : `${esc(ms.quien)} · abierta desde las ${haceMin(ms.min)}`}</p>`
    } else {
      const prods = cats.find(([c]) => c === tab)[1]
      cuerpo = `<div class="dk-lista">
        ${prods
          .map((p) => {
            const n = ms.pend.get(p.nombre) || 0
            return `<div class="dk-fila">
              <span class="dk-mosaico" style="background:${tono(p.nombre)};color:#333">${esc(p.nombre.charAt(0))}</span>
              <div class="dk-crece"><p class="dk-fila-t">${esc(p.nombre)}</p><p class="dk-fila-s dk-num">${dinero(p.precio)}</p></div>
              ${
                n
                  ? `<span class="dk-cant"><button class="dk-ico-btn" data-menos="${esc(p.nombre)}" aria-label="Quitar uno">−</button>${n}<button class="dk-ico-btn dk-ico-btn--pri" data-mas="${esc(p.nombre)}" aria-label="Agregar uno">+</button></span>`
                  : `<button class="dk-ico-btn dk-ico-btn--pri" data-mas="${esc(p.nombre)}" aria-label="Agregar ${esc(p.nombre)}">+</button>`
              }
            </div>`
          })
          .join('')}
      </div>`
    }

    const pie = hayPend
      ? `<button class="dk-btn dk-btn--pri dk-btn--bloque" data-ver>Revisar y enviar · ${piezasPend(ms)} · ${dinero(sumaPend(ms))}</button>`
      : ms.orden.length
        ? `<button class="dk-btn dk-btn--oscuro dk-btn--bloque" data-cuenta>Cerrar cuenta · ${dinero(total)}</button>`
        : `<button class="dk-btn dk-btn--pri dk-btn--bloque" disabled>Agregue algo para abrir la orden</button>`

    return `
      <header class="dk-barra">
        <button class="cm-atras" data-atras aria-label="Volver a ${L.arts} ${L.varios}">‹</button>
        <div class="dk-crece"><p class="dk-barra-t">${nombreDe(ms)}</p><p class="dk-barra-s">${ms.quien ? esc(ms.quien) : `Atiende ${esc(yo)}`}</p></div>
        ${chip}
      </header>
      <nav class="dk-tabs" role="tablist">
        <button class="dk-tab" role="tab" aria-selected="${tab === 'orden'}" data-tab="orden">Orden${nOrden ? ` · ${nOrden}` : ''}</button>
        ${cats.map(([c]) => `<button class="dk-tab" role="tab" aria-selected="${c === tab}" data-tab="${esc(c)}">${esc(c)}</button>`).join('')}
      </nav>
      <div class="dk-cuerpo" data-rueda="orden-${esc(tab)}">${cuerpo}</div>
      <footer class="dk-pie">${pie}</footer>`
  }

  function enviada() {
    const u = ultimo
    return `
      <header class="dk-barra">
        <div class="dk-crece"><p class="dk-barra-t">${nombreDe(u.ms)}</p><p class="dk-barra-s">${esc(u.ms.quien || '')}</p></div>
        <span class="dk-chip dk-chip--acento">Abierta</span>
      </header>
      <div class="dk-cuerpo" data-rueda="enviada">
        <div class="dk-centro" style="flex:none;padding:22px 0 20px">
          <span class="dk-listo">✓</span>
          <p class="dk-titulo dk-titulo--g">Enviada a preparación</p>
          <p class="dk-nota">Llegó completa a las ${u.hora}, sin papel de por medio.</p>
        </div>
        <div class="dk-tarjeta">
          <div class="dk-entre"><span class="dk-fuerte">Lo que salió</span><span class="dk-chip dk-chip--ok">En preparación</span></div>
          <div class="dk-mt">
            ${u.items.map(([n, c]) => `<div class="cm-ren"><span>${c} × ${esc(n)}</span><span class="dk-num dk-fuerte">${dinero(c * precio(n))}</span></div>`).join('')}
          </div>
          ${u.nota ? `<p class="dk-nota" style="margin-top:6px">Nota: ${esc(u.nota)}</p>` : ''}
          <div class="dk-sep"></div>
          <div class="dk-entre"><span class="dk-fuerte">Cuenta de ${L.art} ${L.uno.toLowerCase()}</span><span class="dk-titulo dk-num">${dinero(suma(u.ms.orden))}</span></div>
        </div>
      </div>
      <footer class="dk-pie">
        <button class="dk-btn dk-btn--pri dk-btn--bloque" data-atras>Volver a ${L.arts} ${L.varios}</button>
        <button class="dk-btn dk-btn--bloque dk-mt" data-seguir>Agregar algo más</button>
      </footer>`
  }

  function revisar() {
    const ms = abierta
    const h = hoja(
      el,
      `<p class="dk-titulo">Enviar a preparación</p>
       <p class="dk-nota" style="margin-top:2px">${nombreDe(ms)} · sale en cuanto usted confirme.</p>
       <div class="dk-mt">
         ${[...ms.pend].map(([n, c]) => `<div class="cm-ren"><span>${c} × ${esc(n)}</span><span class="dk-num dk-fuerte">${dinero(c * precio(n))}</span></div>`).join('')}
       </div>
       <div class="dk-sep"></div>
       <div class="dk-entre"><span class="dk-fuerte">Se suma a la cuenta</span><span class="dk-titulo dk-num">${dinero(sumaPend(ms))}</span></div>
       <label class="dk-etq" for="cm-nota">Nota para preparación</label>
       <input class="dk-campo" id="cm-nota" placeholder="${comida ? 'Sin cebolla, término medio…' : 'Un detalle para quien lo prepara…'}" />
       <button class="dk-btn dk-btn--pri dk-btn--bloque dk-mt-g" data-enviar>Enviar a preparación</button>
       <button class="dk-btn dk-btn--bloque dk-mt" data-cerrar>Seguir agregando</button>`,
    )
    h.el.querySelector('[data-enviar]').addEventListener('click', () => {
      const nota = h.el.querySelector('#cm-nota').value.trim()
      const items = [...ms.pend]
      for (const [n, c] of items) {
        const ya = ms.orden.find((x) => x.nombre === n)
        if (ya) ya.cant += c
        else ms.orden.push({ ...P.find((p) => p.nombre === n), cant: c, enviado: true })
      }
      ms.pend.clear()
      if (nota) ms.nota = nota
      if (ms.estado === 'libre') {
        ms.quien = quien(sentados, 2 + (sentados % 3))
        ms.min = 0
        sentados++
      }
      ms.estado = 'ocupada'
      ultimo = { ms, items, nota, hora: hora() }
      pantalla = 'enviada'
      h.cerrar()
      pintar()
    })
  }

  function cobrar() {
    const ms = abierta
    const total = suma(ms.orden)
    let pago = 'Tarjeta'
    const h = hoja(
      el,
      `<p class="dk-titulo">Cuenta · ${nombreDe(ms)}</p>
       <p class="dk-nota" style="margin-top:2px">${esc(ms.quien || '')}</p>
       <div class="dk-mt">
         ${ms.orden.map((x) => `<div class="cm-ren"><span>${x.cant} × ${esc(x.nombre)}</span><span class="dk-num dk-fuerte">${dinero(x.cant * x.precio)}</span></div>`).join('')}
       </div>
       <div class="dk-sep"></div>
       <div class="dk-entre"><span class="dk-fuerte">Total</span><span class="dk-titulo dk-titulo--g dk-num">${dinero(total)}</span></div>
       <p class="dk-etq">¿Cómo paga?</p>
       <div class="cm-pago">${['Efectivo', 'Tarjeta', 'Transferencia'].map((p) => `<button data-pago="${p}" aria-pressed="${p === pago}">${p}</button>`).join('')}</div>
       <button class="dk-btn dk-btn--pri dk-btn--bloque dk-mt-g" data-cobrar>Cobrar ${dinero(total)} y liberar</button>
       <button class="dk-btn dk-btn--bloque dk-mt" data-cerrar>Todavía no</button>`,
    )
    h.el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pago]')
      if (b) {
        pago = b.dataset.pago
        h.el.querySelectorAll('[data-pago]').forEach((x) => x.setAttribute('aria-pressed', x === b))
        return
      }
      if (!e.target.closest('[data-cobrar]')) return
      const antes = cobrado
      cobrado += total
      Object.assign(ms, { estado: 'libre', orden: [], quien: '', nota: '', min: 0 })
      ms.pend.clear()
      abierta = null
      pantalla = 'mapa'
      h.cerrar()
      pintar(antes)
      avisar(`${nombreDe(ms)} cobrad${L.o} con ${pago.toLowerCase()}. Quedó libre.`)
    })
  }

  toca(el, '[data-mesa]', (b) => {
    abierta = lista.find((x) => x.n === +b.dataset.mesa)
    tab = abierta.estado === 'libre' ? cats[0][0] : 'orden'
    pantalla = 'orden'
    pintar()
  })
  toca(el, '[data-atras]', () => {
    abierta?.pend.clear()
    abierta = null
    pantalla = 'mapa'
    pintar()
  })
  toca(el, '[data-seguir]', () => {
    tab = cats[0][0]
    pantalla = 'orden'
    pintar()
  })
  toca(el, '[data-tab]', (b) => {
    tab = b.dataset.tab
    pintar()
  })
  toca(el, '[data-mas]', (b) => {
    abierta.pend.set(b.dataset.mas, (abierta.pend.get(b.dataset.mas) || 0) + 1)
    pintar()
  })
  toca(el, '[data-menos]', (b) => {
    const n = (abierta.pend.get(b.dataset.menos) || 0) - 1
    n > 0 ? abierta.pend.set(b.dataset.menos, n) : abierta.pend.delete(b.dataset.menos)
    pintar()
  })
  toca(el, '[data-ver]', revisar)
  toca(el, '[data-cuenta]', cobrar)

  // Vida propia: de vez en cuando una mesa pide la cuenta, y el tiempo de cada una avanza.
  t.cada(13000, () => {
    if (lista.filter((x) => x.estado === 'cuenta').length >= 2) return
    const c = lista.filter((x) => x.estado === 'ocupada' && x !== abierta && x.min > 5).sort((a, b) => b.min - a.min)[0]
    if (!c) return
    c.estado = 'cuenta'
    if (pantalla === 'mapa') pintar()
    avisar(`${nombreDe(c)} pidió la cuenta`)
  })
  t.cada(20000, () => {
    lista.forEach((x) => x.estado !== 'libre' && x.min++)
    if (pantalla === 'mapa' && !el.querySelector('.dk-velo')) pintar()
  })

  pintar()
  return { destruir: () => t.limpia() }
}

// ───────────────────────── Solicitudes: llamados desde la mesa ─────────────────────────

const ICO = {
  cuenta: `<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg>`,
  llamar: `<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 21h4"/></svg>`,
  extra: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/></svg>`,
}

function solicitudes(el, { negocio, m, v, nicho, avisar }) {
  const t = relojes()
  const L = lugarDe(nicho)
  const comida = L.uno === 'Mesa'
  const yo = m.personal[0]
  const MI_MESA = 4
  const TIPOS = {
    cuenta: { boton: 'Pedir la cuenta', sub: `Se la llevan a su ${L.uno.toLowerCase()}.`, aviso: 'pide la cuenta', corto: 'la cuenta' },
    llamar: { boton: `Llamar ${al(v.personal)}`, sub: 'Para pedir algo más o resolver una duda.', aviso: 'necesita atención', corto: 'atención' },
    extra: comida
      ? { boton: 'Más servilletas', sub: 'Se las llevan sin que tenga que levantarse.', aviso: 'pide servilletas', corto: 'servilletas' }
      : { boton: 'Tengo una duda', sub: 'Alguien se acerca a resolverla.', aviso: 'tiene una duda', corto: 'una duda' },
  }
  const CLAVES = Object.keys(TIPOS)

  let lado = 'equipo'
  let sig = 1
  const llamados = [
    { id: sig++, mesa: 2, tipo: 'llamar', seg: 47, estado: 'nuevo' },
    { id: sig++, mesa: 7, tipo: 'cuenta', seg: 204, estado: 'nuevo' },
  ]
  const hechos = [
    { mesa: 5, tipo: 'extra', seg: 58 },
    { mesa: 1, tipo: 'cuenta', seg: 95 },
  ]
  let atendidos = 23
  let sumaSeg = 23 * 88
  let mio = null // el llamado que se generó desde el lado del cliente
  let miFin = null // cómo terminó el último llamado propio

  const titulo = (c) => `${L.uno} ${c.mesa} ${TIPOS[c.tipo].aviso}`

  function pintar() {
    const seg = `
      <div class="cm-seg">
        <span class="cm-seg-e">Ver como</span>
        <div class="cm-seg-b">
          <button data-lado="equipo" aria-pressed="${lado === 'equipo'}">${esc(cap(sinArt(v.personal)))}</button>
          <button data-lado="cliente" aria-pressed="${lado === 'cliente'}">${esc(cap(sinArt(v.cliente)))}</button>
        </div>
      </div>`
    pon(el, seg + (lado === 'equipo' ? equipo() : cliente()))
  }

  function equipo() {
    const orden = [...llamados].sort((a, b) => b.id - a.id)
    return `
      <header class="dk-barra">
        <div class="dk-crece"><p class="dk-barra-t">Llamados</p><p class="dk-barra-s">${esc(negocio)} · ${esc(yo)}</p></div>
        <span class="dk-chip ${llamados.length ? 'dk-chip--acento' : 'dk-chip--ok'}">${llamados.length ? `${llamados.length} por atender` : 'Al corriente'}</span>
      </header>
      <div class="dk-cuerpo" data-rueda="equipo">
        <div class="dk-rejilla">
          <div class="dk-cifra"><p class="dk-cifra-n">${atendidos}</p><p class="dk-cifra-e">Atendidos hoy</p></div>
          <div class="dk-cifra"><p class="dk-cifra-n">${mmss(sumaSeg / atendidos)}</p><p class="dk-cifra-e">Respuesta promedio</p></div>
        </div>
        <p class="dk-sub">Por atender</p>
        ${
          orden
            .map(
              (c) => `<article class="dk-tarjeta ${c.nuevo ? 'dk-aparece' : ''} ${c === mio ? 'dk-tarjeta--acento' : ''}">
                <div class="dk-fila-h">
                  <span class="dk-mosaico cm-num">${c.mesa}</span>
                  <div style="flex:1;min-width:0"><p class="dk-fuerte" style="font-size:15px;line-height:1.25">${esc(titulo(c))}</p><p class="dk-nota">${c.estado === 'voy' ? `${esc(yo)} va en camino` : 'Nadie ha ido todavía'}</p></div>
                  <span class="dk-chip dk-num ${c.seg >= 180 ? 'dk-chip--mal' : ''}" data-t="${c.id}">${mmss(c.seg)}</span>
                </div>
                ${
                  c.estado === 'voy'
                    ? `<div class="cm-acc cm-acc--1"><button class="dk-btn dk-btn--oscuro dk-btn--chico" style="min-height:40px" data-atendido="${c.id}">Atendido</button></div>`
                    : `<div class="cm-acc"><button class="dk-btn dk-btn--pri dk-btn--chico" style="min-height:40px" data-voy="${c.id}">Voy</button><button class="dk-btn dk-btn--chico" style="min-height:40px" data-atendido="${c.id}">Atendido</button></div>`
                }
              </article>`,
            )
            .join('') ||
          `<div class="dk-tarjeta" style="text-align:center;padding:26px 18px"><p class="dk-fuerte">Sin llamados por atender</p><p class="dk-nota" style="margin-top:4px">Cuando ${L.uno === 'Mesa' ? 'una mesa' : 'un lugar'} toque un botón, aparece aquí con el tiempo que lleva esperando.</p></div>`
        }
        <p class="dk-sub">Atendidos hace poco</p>
        <div class="dk-tarjeta" style="padding:4px 14px">
          ${hechos
            .slice(0, 3)
            .map((h) => `<div class="cm-hecho"><i>✓</i><span style="flex:1">${L.uno} ${h.mesa} · ${esc(TIPOS[h.tipo].corto)}</span><span class="dk-num">en ${mmss(h.seg)}</span></div>`)
            .join('')}
        </div>
      </div>`
  }

  function cliente() {
    const activo = mio
    let estado = ''
    if (activo) {
      const voy = activo.estado === 'voy'
      estado = `<div class="dk-tarjeta dk-mt dk-aparece">
        <div class="dk-pasos">
          <div class="dk-paso es-hecho"><div><p class="dk-fuerte">Aviso enviado</p><p class="dk-nota">${esc(TIPOS[activo.tipo].boton)} · ${activo.hora}</p></div></div>
          <div class="dk-paso ${voy ? 'es-hecho' : 'es-ahora'}"><div><p class="dk-fuerte">${voy ? `${esc(yo)} ya lo vio` : `${esc(cap(v.personal))} lo recibe`}</p>${voy ? '' : `<p class="dk-nota dk-pulso">Ya lo tiene en su celular.</p>`}</div></div>
          <div class="dk-paso ${voy ? 'es-ahora' : ''}" style="padding-bottom:0"><div><p class="dk-fuerte">${voy ? `Va hacia su ${L.uno.toLowerCase()}` : 'Atendido'}</p>${voy ? `<p class="dk-nota dk-pulso">No hace falta que levante la mano.</p>` : ''}</div></div>
        </div>
      </div>`
    } else if (miFin) {
      estado = `<div class="dk-tarjeta dk-mt dk-aparece"><div class="dk-fila-h"><span class="dk-avatar" style="background:var(--dk-ok-f);color:var(--dk-ok)">✓</span><div><p class="dk-fuerte">Atendido en ${mmss(miFin.seg)}</p><p class="dk-nota">Si necesita algo más, toque otro botón.</p></div></div></div>`
    }
    return `
      <header class="dk-barra dk-barra--acento">
        <div class="dk-crece"><p class="dk-barra-t">${esc(negocio)}</p><p class="dk-barra-s">${L.uno} ${MI_MESA}</p></div>
      </header>
      <div class="dk-cuerpo" data-rueda="cliente">
        <p class="dk-titulo dk-titulo--g" style="margin-top:6px">¿Qué necesita?</p>
        <p class="dk-nota" style="margin:4px 0 16px">Toque un botón. ${esc(cap(v.personal))} recibe el aviso en su celular y sabe a dónde ir.</p>
        ${CLAVES.map(
          (k) => `<button class="cm-pide ${activo?.tipo === k ? 'es-mio' : ''}" data-pide="${k}" ${activo ? 'disabled' : ''}>
            <span class="cm-pide-i">${ICO[k]}</span>
            <span><span class="cm-pide-t" style="display:block">${esc(TIPOS[k].boton)}</span><span class="dk-nota">${activo?.tipo === k ? 'Aviso enviado' : esc(TIPOS[k].sub)}</span></span>
          </button>`,
        ).join('')}
        ${estado}
      </div>`
  }

  function atender(c) {
    llamados.splice(llamados.indexOf(c), 1)
    hechos.unshift({ mesa: c.mesa, tipo: c.tipo, seg: c.seg })
    atendidos++
    sumaSeg += c.seg
    if (c === mio) {
      miFin = { seg: c.seg }
      mio = null
    }
  }

  toca(el, '[data-lado]', (b) => {
    lado = b.dataset.lado
    llamados.forEach((c) => (c.nuevo = false))
    pintar()
  })
  toca(el, '[data-voy]', (b) => {
    const c = llamados.find((x) => x.id === +b.dataset.voy)
    if (!c) return
    c.estado = 'voy'
    c.segVoy = 0
    c.nuevo = false
    pintar()
    avisar(`${L.uno} ${c.mesa} ya sabe que usted va`)
  })
  toca(el, '[data-atendido]', (b) => {
    const c = llamados.find((x) => x.id === +b.dataset.atendido)
    if (!c) return
    atender(c)
    pintar()
    avisar(`${L.uno} ${c.mesa} atendid${L.o} en ${mmss(c.seg)}. Quedó registrado.`)
  })
  toca(el, '[data-pide]', (b) => {
    if (mio) return
    miFin = null
    mio = { id: sig++, mesa: MI_MESA, tipo: b.dataset.pide, seg: 0, estado: 'nuevo', nuevo: true, hora: hora() }
    llamados.push(mio)
    pintar()
    avisar(`Listo. ${cap(v.personal)} ya recibió su aviso.`)
  })

  // Cada segundo corren los tiempos. Si nadie responde el llamado propio desde el otro lado, avanza solo.
  t.cada(1000, () => {
    let cambio = false
    for (const c of llamados) {
      c.seg++
      if (c.estado === 'voy') c.segVoy++
      if (c.seg === 180) cambio = true
    }
    if (mio && lado === 'cliente') {
      if (mio.estado === 'nuevo' && mio.seg >= 9) {
        mio.estado = 'voy'
        mio.segVoy = 0
        cambio = true
      } else if (mio.estado === 'voy' && mio.segVoy >= 10) {
        atender(mio)
        cambio = true
      }
    }
    if (cambio) return pintar()
    for (const c of llamados) {
      const n = el.querySelector(`[data-t="${c.id}"]`)
      if (n) n.textContent = mmss(c.seg)
    }
  })

  // Cada tanto entra un llamado nuevo de otra mesa.
  let k = 0
  t.cada(11000, () => {
    if (llamados.length >= 4) return
    const libres = [1, 3, 5, 6, 8, 2, 7].filter((n) => !llamados.some((c) => c.mesa === n))
    const c = { id: sig++, mesa: libres[k % libres.length], tipo: CLAVES[(k + 1) % CLAVES.length], seg: 0, estado: 'nuevo', nuevo: true }
    k++
    llamados.push(c)
    if (lado === 'equipo') {
      pintar()
      avisar(titulo(c))
    }
  })

  pintar()
  return { destruir: () => t.limpia() }
}
