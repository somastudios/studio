import { esc, dinero, toca, hoja, relojes, enMin, haceMin, porGrupo, tono } from '../kit.js'

// Demo ejemplar: pedidos.
//   cliente   — teléfono del cliente: ve el catálogo, arma su pedido, lo envía y sigue su avance.
//   mostrador — tableta del negocio: pedidos que entran, se preparan y quedan listos para recoger.
//
// Todas las demos siguen esta forma: un objeto con id, vistas y montar(el, ctx) → { destruir }.

export default {
  id: 'pedidos',
  nombre: 'Pedidos',
  vistas: {
    cliente: { titulo: 'Así pide su cliente', dispositivo: 'telefono' },
    mostrador: { titulo: 'Así llegan los pedidos', dispositivo: 'tableta' },
  },
  montar(el, ctx) {
    return ctx.vista === 'mostrador' ? mostrador(el, ctx) : cliente(el, ctx)
  },
}

// ───────────────────────── Teléfono del cliente ─────────────────────────

function cliente(el, { negocio, m, v, avisar }) {
  const t = relojes()
  const cats = porGrupo(m.productos, 'categoria')
  const carrito = new Map() // nombre → cantidad
  let cat = cats[0][0]

  const total = () => [...carrito].reduce((s, [n, c]) => s + c * m.productos.find((p) => p.nombre === n).precio, 0)
  const piezas = () => [...carrito.values()].reduce((s, c) => s + c, 0)

  function pintar() {
    const lista = cats.find(([c]) => c === cat)[1]
    el.innerHTML = `
      <header class="dk-barra dk-barra--acento">
        <div class="dk-crece"><p class="dk-barra-t">${esc(negocio)}</p><p class="dk-barra-s">Mesa 4 · pida desde aquí</p></div>
      </header>
      <nav class="dk-tabs" role="tablist">
        ${cats.map(([c]) => `<button class="dk-tab" role="tab" aria-selected="${c === cat}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}
      </nav>
      <div class="dk-cuerpo" data-rueda>
        <div class="dk-lista">
          ${lista
            .map((p) => {
              const n = carrito.get(p.nombre) || 0
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
        </div>
        <p class="dk-nota dk-mt" style="text-align:center">Los precios incluyen impuestos.</p>
      </div>
      <footer class="dk-pie">
        <button class="dk-btn dk-btn--pri dk-btn--bloque" data-ver ${piezas() ? '' : 'disabled'}>
          ${piezas() ? `Ver ${esc(v.pedido)} · ${piezas()} · ${dinero(total())}` : `Agregue algo para empezar`}
        </button>
      </footer>`
  }

  function revisar() {
    const h = hoja(
      el,
      `<p class="dk-titulo">Su ${esc(v.pedido)}</p>
       <div class="dk-mt">
         ${[...carrito]
           .map(([n, c]) => {
             const p = m.productos.find((x) => x.nombre === n)
             return `<div class="dk-entre" style="padding:7px 0"><span>${c} × ${esc(n)}</span><span class="dk-num dk-fuerte">${dinero(c * p.precio)}</span></div>`
           })
           .join('')}
       </div>
       <div class="dk-sep"></div>
       <div class="dk-entre"><span class="dk-fuerte">Total</span><span class="dk-titulo dk-num">${dinero(total())}</span></div>
       <label class="dk-etq" for="pd-nota">¿Alguna indicación?</label>
       <input class="dk-campo" id="pd-nota" placeholder="Sin cebolla, término medio…" />
       <button class="dk-btn dk-btn--pri dk-btn--bloque dk-mt-g" data-enviar>Enviar ${esc(v.pedido)}</button>
       <button class="dk-btn dk-btn--bloque dk-mt" data-cerrar>Seguir agregando</button>`,
    )
    h.el.querySelector('[data-enviar]').addEventListener('click', () => {
      h.cerrar()
      seguir()
    })
  }

  // Después de enviar: el pedido avanza solo para que se vea el recorrido completo.
  function seguir() {
    const folio = 100 + Math.floor(Math.random() * 80)
    const pasos = ['Recibido', 'En preparación', 'Listo, va para su mesa']
    let i = 0
    const pinta = () => {
      el.innerHTML = `
        <header class="dk-barra dk-barra--acento"><div class="dk-crece"><p class="dk-barra-t">${esc(negocio)}</p><p class="dk-barra-s">Mesa 4 · ${esc(v.pedido)} #${folio}</p></div></header>
        <div class="dk-cuerpo">
          <div class="dk-centro" style="flex:none;padding:18px 0 22px">
            <span class="dk-listo">✓</span>
            <p class="dk-titulo dk-titulo--g">${i < 2 ? 'Ya lo tenemos' : 'Está listo'}</p>
            <p class="dk-nota">${i < 2 ? `Tiempo estimado: ${enMin(14)}` : 'Buen provecho.'}</p>
          </div>
          <div class="dk-tarjeta">
            <div class="dk-pasos">
              ${pasos.map((p, k) => `<div class="dk-paso ${k < i ? 'es-hecho' : k === i ? 'es-ahora' : ''}"><div><p class="dk-fuerte">${p}</p>${k === i ? `<p class="dk-nota ${i < 2 ? 'dk-pulso' : ''}">${k === 0 ? 'Llegó completo, sin intermediarios.' : k === 1 ? 'Lo están preparando.' : 'Gracias por pedir aquí.'}</p>` : ''}</div></div>`).join('')}
            </div>
          </div>
          <p class="dk-nota dk-mt" style="text-align:center">Total ${dinero(total())} · se paga al final</p>
        </div>
        <footer class="dk-pie"><button class="dk-btn dk-btn--bloque" data-otra>Pedir algo más</button></footer>`
    }
    pinta()
    t.en(2600, () => {
      i = 1
      pinta()
    })
    t.en(6400, () => {
      i = 2
      pinta()
      avisar('Su pedido está listo')
    })
  }

  toca(el, '[data-cat]', (b) => {
    cat = b.dataset.cat
    pintar()
  })
  toca(el, '[data-mas]', (b) => {
    carrito.set(b.dataset.mas, (carrito.get(b.dataset.mas) || 0) + 1)
    pintar()
  })
  toca(el, '[data-menos]', (b) => {
    const n = (carrito.get(b.dataset.menos) || 0) - 1
    n > 0 ? carrito.set(b.dataset.menos, n) : carrito.delete(b.dataset.menos)
    pintar()
  })
  toca(el, '[data-ver]', revisar)
  toca(el, '[data-otra]', () => {
    t.limpia()
    carrito.clear()
    pintar()
  })

  pintar()
  return { destruir: () => t.limpia() }
}

// ───────────────────────── Tableta del negocio ─────────────────────────

function mostrador(el, { negocio, m, v, avisar }) {
  const t = relojes()
  const COLS = [
    { id: 'nuevo', nombre: 'Nuevos', accion: 'Empezar' },
    { id: 'prep', nombre: 'En preparación', accion: 'Marcar listo' },
    { id: 'listo', nombre: 'Listos para recoger', accion: 'Entregar' },
  ]
  let folio = 131
  const arma = (i) => {
    const a = m.productos[(i * 3) % m.productos.length]
    const b = m.productos[(i * 5 + 2) % m.productos.length]
    return { folio: folio++, quien: m.clientes[i % m.clientes.length], items: [`1 × ${a.nombre}`, `2 × ${b.nombre}`], total: a.precio + b.precio * 2, min: 3 + ((i * 7) % 11) }
  }
  const pedidos = [
    { ...arma(0), col: 'listo' },
    { ...arma(1), col: 'prep' },
    { ...arma(2), col: 'prep' },
    { ...arma(3), col: 'nuevo' },
  ]
  let entregados = 12

  function pintar() {
    el.innerHTML = `
      <header class="dk-barra">
        <div class="dk-crece"><p class="dk-barra-t">${esc(negocio)} · ${esc(v.pedidos)} para recoger</p><p class="dk-barra-s">Hoy van ${entregados} entregados</p></div>
        <span class="dk-chip dk-chip--ok">En línea</span>
      </header>
      <div class="dk-cols">
        ${COLS.map((c) => {
          const lista = pedidos.filter((p) => p.col === c.id)
          return `<section class="dk-col">
            <div class="dk-col-t"><span>${c.nombre}</span><span class="dk-chip">${lista.length}</span></div>
            <div class="dk-col-c" data-rueda>
              ${
                lista
                  .map(
                    (p) => `<article class="dk-tarjeta dk-aparece" style="margin:0">
                      <div class="dk-entre"><span class="dk-fuerte">#${p.folio} · ${esc(p.quien)}</span><span class="dk-chip ${c.id === 'nuevo' ? 'dk-chip--acento' : c.id === 'listo' ? 'dk-chip--ok' : ''}">${c.id === 'listo' ? 'Recoge ' + enMin(p.min) : 'Pidió ' + haceMin(p.min)}</span></div>
                      <p class="dk-nota dk-mt">${p.items.map(esc).join('<br>')}</p>
                      <div class="dk-entre dk-mt"><span class="dk-num dk-fuerte">${dinero(p.total)}</span><button class="dk-btn dk-btn--chico ${c.id === 'nuevo' ? 'dk-btn--pri' : ''}" data-avanza="${p.folio}">${c.accion}</button></div>
                    </article>`,
                  )
                  .join('') || `<p class="dk-nota" style="padding:8px 4px">Nada por aquí.</p>`
              }
            </div>
          </section>`
        }).join('')}
      </div>`
  }

  toca(el, '[data-avanza]', (b) => {
    const p = pedidos.find((x) => x.folio === +b.dataset.avanza)
    if (!p) return
    if (p.col === 'nuevo') p.col = 'prep'
    else if (p.col === 'prep') {
      p.col = 'listo'
      avisar(`Se avisó a ${p.quien}: su ${v.pedido} está listo`)
    } else {
      pedidos.splice(pedidos.indexOf(p), 1)
      entregados++
    }
    pintar()
  })

  // Cada tanto entra un pedido nuevo, para que la pantalla se sienta viva.
  let n = 4
  t.cada(9000, () => {
    if (pedidos.filter((p) => p.col === 'nuevo').length >= 3) return
    const p = { ...arma(n++), col: 'nuevo' }
    pedidos.push(p)
    pintar()
    avisar(`Nuevo ${v.pedido} de ${p.quien}`)
  })

  pintar()
  return { destruir: () => t.limpia() }
}
