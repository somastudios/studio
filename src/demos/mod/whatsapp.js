import { esc, dinero, toca, hoja, relojes, hora, iniciales, porGrupo } from '../kit.js'

// Demo: mensajería.
//   auto         — teléfono del cliente: escribe fuera de horario y la respuesta llega sola.
//   pedido       — teléfono del cliente: pedido guiado paso a paso, y cómo le llega al negocio.
//   recordatorio — teléfono del cliente: recordatorio de mañana; confirma o libera su lugar.
//   plantillas   — teléfono del personal: respuestas ya escritas que se envían con un toque.
//   reporte      — teléfono del dueño: el resumen del día, todas las noches.
//
// Todas comparten la misma conversación (`chat`): barra con el nombre, fondo, burbujas con hora
// y el aviso de "escribiendo…" antes de cada respuesta automática.

export default {
  id: 'whatsapp',
  nombre: 'WhatsApp',
  vistas: {
    auto: { titulo: 'Respuesta al instante, a cualquier hora', dispositivo: 'telefono' },
    pedido: { titulo: 'Así pide su cliente por mensaje', dispositivo: 'telefono' },
    recordatorio: { titulo: 'El recordatorio que confirma solo', dispositivo: 'telefono' },
    plantillas: { titulo: 'Respuestas listas para su equipo', dispositivo: 'telefono' },
    reporte: { titulo: 'El resumen del día en su teléfono', dispositivo: 'telefono' },
  },
  montar(el, ctx) {
    const vistas = { auto, pedido, recordatorio, plantillas, reporte }
    return (vistas[ctx.vista] || auto)(el, ctx)
  },
}

// ───────────────────────── Piezas comunes ─────────────────────────

const CSS = `<style>
.wa-barra{flex:none;display:flex;align-items:center;gap:10px;min-height:58px;padding:9px 14px 9px 10px;background:#1d4d44;color:#fff}
.wa-atras{flex:none;width:9px;height:9px;margin:0 1px 0 7px;border-left:2px solid #fff;border-bottom:2px solid #fff;transform:rotate(45deg);opacity:.8}
.wa-av{flex:none;display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:rgb(255 255 255/.17);font-weight:700;font-size:13px}
.wa-barra>.dk-crece{flex:1;min-width:0}
.wa-nom{font-weight:700;font-size:15.5px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wa-est{font-size:12px;opacity:.8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wa-marca{flex:none;padding:3px 9px;border-radius:999px;background:#fdf0d5;color:#8a4d05;font-weight:700;font-size:11.5px;animation:dk-pop .4s cubic-bezier(.34,1.56,.64,1) both}
.wa-fondo{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;padding:12px 12px 16px;background:#ebe5da radial-gradient(rgb(60 40 10/.07) 1px,transparent 1.5px) 0 0/18px 18px;scrollbar-width:none}
.wa-fondo::-webkit-scrollbar{display:none}
.wa-fondo .dk-burbuja{border-color:transparent;box-shadow:0 1px 1px rgb(0 0 0/.1);line-height:1.38;overflow-wrap:anywhere}
.wa-fondo .dk-burbuja small{margin-top:3px;white-space:nowrap}
.wa-fondo .dk-burbuja--yo small{color:#5e8b66}
.wa-fondo .dk-burbuja p+p{margin-top:6px}
.wa-ancha{max-width:92%;width:92%}
.wa-dia,.wa-sis{align-self:center;max-width:90%;margin:4px 0;padding:4px 11px;border-radius:8px;background:rgb(255 255 255/.85);color:var(--dk-tx2);font-weight:600;font-size:11.5px;text-align:center;box-shadow:0 1px 1px rgb(0 0 0/.06)}
.wa-sis{animation:dk-sube .3s both}
.wa-sis--ok{background:var(--dk-ok-f);color:var(--dk-ok)}
.wa-sis--alerta{background:var(--dk-alerta-f);color:var(--dk-alerta)}
.wa-meta{align-self:flex-start;margin:-1px 0 5px 5px;font-size:11px;color:#7c7567;animation:dk-sube .3s both}
.wa-tecl{display:flex;gap:4px;padding:13px 13px 12px}
.wa-tecl i{width:6px;height:6px;border-radius:50%;background:#99948a;animation:wa-bota 1s infinite}
.wa-tecl i:nth-child(2){animation-delay:.15s}
.wa-tecl i:nth-child(3){animation-delay:.3s}
@keyframes wa-bota{0%,60%,100%{transform:none;opacity:.45}30%{transform:translateY(-4px);opacity:1}}
.wa-pie{flex:none;padding:10px 12px 14px;background:var(--dk-sup);border-top:1px solid var(--dk-linea);transition:opacity .2s}
.wa-pie.es-espera{opacity:.45;pointer-events:none}
.wa-pie-t{margin:0 2px 8px;font-weight:600;font-size:11.5px;color:var(--dk-tx2)}
.wa-ops{display:flex;flex-wrap:wrap;gap:7px}
.wa-op{display:inline-flex;align-items:center;min-height:38px;padding:8px 14px;border-radius:19px;border:1px solid #bdd8ce;background:#f0f8f4;color:#16564a;font-weight:650;font-size:13.5px;line-height:1.2;text-align:left;transition:transform .12s,opacity .2s}
.wa-op:active{transform:scale(.97)}
.wa-op:disabled{opacity:.45;pointer-events:none}
.wa-op--pri{background:#1d4d44;border-color:#1d4d44;color:#fff}
.wa-op--mitad{flex:1;justify-content:center;text-align:center}
.wa-op--sug{border-color:#1d4d44;box-shadow:0 0 0 3px #d5ebe2}
.wa-lista{display:grid;gap:6px;max-height:212px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none}
.wa-lista .wa-op{justify-content:space-between;gap:12px;width:100%;border-radius:12px}
.wa-chico{display:block;margin:10px auto 0;padding:6px 14px;border:1px solid var(--dk-linea);border-radius:999px;background:var(--dk-sup);font-weight:600;font-size:12.5px;color:var(--dk-tx2)}
.wa-mapa{display:block;width:100%;height:92px;margin-top:7px;border-radius:9px}
.wa-mapa-t{margin-top:5px;font-weight:600;font-size:12.5px}
.wa-ficha{margin:7px 0;padding:9px 11px;border-left:3px solid var(--dk-acento);border-radius:8px;background:var(--dk-fondo)}
.wa-ficha p+p{margin-top:2px!important}
.wa-ren{display:flex;justify-content:space-between;gap:12px;padding:3px 0;font-size:13.5px}
.wa-ren>span:last-child{flex:none;font-variant-numeric:tabular-nums}
.wa-ren--t{margin-top:5px;padding-top:7px;border-top:1px solid var(--dk-linea);font-weight:700;font-size:14.5px}
.wa-ticket{align-self:stretch;margin:2px 0 0}
.wa-agenda{display:flex;align-items:center;gap:10px;padding:9px 11px;border:1px solid var(--dk-linea);border-radius:12px;font-size:13px}
.wa-agenda+.wa-agenda{margin-top:6px}
.wa-agenda>div{flex:1;min-width:0}
.wa-agenda b{display:block;font-size:13.5px}
.wa-comp{display:flex;align-items:flex-end;gap:8px;margin-top:10px}
.wa-comp-c{flex:1;min-width:0;min-height:40px;max-height:84px;overflow:hidden;padding:10px 14px;border:1px solid var(--dk-linea);border-radius:20px;background:var(--dk-fondo);font-size:13.5px;line-height:1.35;color:var(--dk-tx3)}
.wa-comp-c.es-lleno{color:var(--dk-tx);background:var(--dk-sup);border-color:#1d4d44;animation:dk-sube .25s both}
.wa-env{flex:none;display:grid;place-items:center;width:40px;height:40px;border-radius:50%;border:0;background:#1d4d44;color:#fff;transition:opacity .2s,transform .12s}
.wa-env:disabled{opacity:.35}
.wa-env:active{transform:scale(.94)}
.wa-env svg{width:18px;height:18px}
.wa-corta{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;white-space:normal}
.wa-rep-t{font-weight:700;font-size:13px;color:var(--dk-tx2)}
.wa-rep-n{margin-top:2px!important;font-weight:750;font-size:27px;letter-spacing:-.02em;line-height:1.1;font-variant-numeric:tabular-nums}
.wa-rep-h{margin-top:11px!important;padding-top:9px;border-top:1px solid var(--dk-linea);font-weight:700;font-size:11.5px;letter-spacing:.04em;text-transform:uppercase;color:var(--dk-tx2)}
.wa-cmp{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:4px 8px;margin-top:8px;font-size:12px;color:var(--dk-tx2)}
.wa-cmp i{display:block;height:7px;border-radius:4px;background:var(--dk-linea)}
.wa-cmp i>b{display:block;height:100%;width:var(--p);border-radius:inherit;background:#b9b5ab}
.wa-cmp i.es-hoy>b{background:#1d4d44}
.wa-cmp span:nth-child(3n){font-variant-numeric:tabular-nums;color:var(--dk-tx)}
.wa-punto{display:flex;gap:8px;margin-top:5px!important;font-size:13.5px}
.wa-punto::before{content:'';flex:none;width:7px;height:7px;margin-top:6px;border-radius:50%;background:var(--dk-alerta)}
.wa-top{display:flex;justify-content:space-between;gap:10px;margin-top:4px!important;font-size:13.5px}
.wa-top span:last-child{flex:none;color:var(--dk-tx2);font-variant-numeric:tabular-nums}
</style>`

const aHora = (min) => hora(new Date(2026, 0, 5, 0, min))
const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1)
const nombreDia = (d) => new Intl.DateTimeFormat('es-MX', { weekday: 'long' }).format(d)
const diaYNumero = (d) => `${nombreDia(d)} ${d.getDate()}`
const enDias = (n) => new Date(Date.now() + n * 86400000)

/** Horario creíble para el giro. Solo cambia para comida; los demás comparten uno de comercio. */
function horario(nicho) {
  return nicho?.familia === 'comida'
    ? 'todos los días, de 1:00 p. m. a 10:00 p. m.'
    : 'de lunes a sábado, de 9:00 a. m. a 8:00 p. m., y los domingos de 10:00 a. m. a 3:00 p. m.'
}

const DIRECCION = 'Av. Hidalgo 245, col. Centro'

const MAPA = `<svg class="wa-mapa" viewBox="0 0 240 92" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="240" height="92" fill="#e7ebe1"/><rect x="152" y="8" width="62" height="32" rx="4" fill="#cde2c2"/>
  <path d="M0 52H240M0 18H142M70 0V92M142 0V92M196 52V92M0 80H240" stroke="#fff" stroke-width="7" fill="none"/>
  <path d="M-8 92L104 -8" stroke="#fff" stroke-width="5" fill="none"/>
  <circle cx="118" cy="50" r="15" fill="var(--dk-acento)" opacity=".16"/>
  <path d="M118 26c-6.6 0-12 5.2-12 11.6C106 46 118 56 118 56s12-10 12-18.4C130 31.2 124.6 26 118 26z" fill="var(--dk-acento)"/><circle cx="118" cy="37.5" r="4.2" fill="#fff"/>
</svg>`

/**
 * Dibuja la conversación dentro de `el` y devuelve cómo escribir en ella.
 * `bajo` es HTML opcional entre la barra y el fondo (pestañas). La hora es simulada: `h`:`min`.
 */
function chat(el, { titulo, estado = 'en línea', h = 12, min = 0, bajo = '', reducido = false }) {
  el.innerHTML = `${CSS}
    <header class="wa-barra">
      <span class="wa-atras" aria-hidden="true"></span>
      <span class="wa-av" aria-hidden="true">${esc(iniciales(titulo))}</span>
      <div class="dk-crece"><p class="wa-nom">${esc(titulo)}</p><p class="wa-est" data-estado>${esc(estado)}</p></div>
      <span data-marca></span>
    </header>
    ${bajo}
    <div class="wa-fondo" data-rueda><div class="dk-chat" data-chat aria-live="polite"></div></div>
    <footer class="wa-pie" data-pie hidden></footer>`
  const fondo = el.querySelector('.wa-fondo')
  const lista = el.querySelector('[data-chat]')
  const pie = el.querySelector('[data-pie]')
  const est = el.querySelector('[data-estado]')
  let reloj = h * 60 + min

  const baja = () => requestAnimationFrame(() => fondo.scrollTo({ top: fondo.scrollHeight, behavior: reducido ? 'auto' : 'smooth' }))
  const pon = (html) => {
    lista.insertAdjacentHTML('beforeend', html)
    baja()
    return lista.lastElementChild
  }

  return {
    ahora: () => aHora(reloj),
    enMin: (n) => aHora(reloj + n),
    pasa: (n = 1) => (reloj += n),
    /** Una burbuja. lado: 'yo' (quien tiene el teléfono) o 'el'. */
    dice: (lado, html, clase = '') => pon(`<div class="dk-burbuja ${lado === 'yo' ? 'dk-burbuja--yo' : ''} ${clase}">${html}<small>${aHora(reloj)}${lado === 'yo' ? ' ✓✓' : ''}</small></div>`),
    nota: (texto, tipo = '') => pon(`<p class="wa-sis ${tipo ? `wa-sis--${tipo}` : ''}">${texto}</p>`),
    dia: (texto) => pon(`<p class="wa-dia">${texto}</p>`),
    meta: (texto) => pon(`<p class="wa-meta">${texto}</p>`),
    bloque: pon,
    /** Muestra "escribiendo…" durante `ms` y luego llama a `fn`. */
    escribe(t, ms, fn) {
      est.textContent = 'escribiendo…'
      const b = pon(`<div class="dk-burbuja wa-tecl" aria-label="escribiendo"><i></i><i></i><i></i></div>`)
      t.en(ms, () => {
        b.remove()
        est.textContent = estado
        fn()
      })
    },
    pie(html) {
      pie.classList.remove('es-espera')
      pie.hidden = !html
      pie.innerHTML = html
      baja()
    },
    espera: () => pie.classList.add('es-espera'),
    marca: (texto) => (el.querySelector('[data-marca]').outerHTML = `<span class="wa-marca" data-marca>${texto}</span>`),
    baja,
  }
}

// ───────────────────────── Respuesta automática ─────────────────────────

function auto(el, { negocio, nicho, m, reducido }) {
  const t = relojes()
  const H = horario(nicho)
  const prod = [...m.productos].sort((a, b) => b.precio - a.precio)[0]
  const otros = m.productos.filter((p) => p.categoria === prod.categoria && p !== prod).slice(0, 2)
  let c, hechas, ocupado

  const PREG = [
    { id: 'hora', q: '¿A qué hora abren?', r: () => `<p>Con gusto. Atendemos ${esc(H)}</p><p>Ahorita ya cerramos, pero su mensaje no se queda sin respuesta.</p>` },
    {
      id: 'donde',
      q: '¿Dónde están?',
      r: () => `<p>Estamos en ${DIRECCION}, a media cuadra de la plaza principal. Hay estacionamiento sobre la calle.</p>${MAPA}<p class="wa-mapa-t">${esc(negocio)} · ${DIRECCION}</p>`,
    },
    {
      id: 'precio',
      q: `¿Qué precio tiene ${prod.nombre}?`,
      r: () =>
        `<p><b>${esc(prod.nombre)}</b> cuesta ${dinero(prod.precio)}, con impuestos incluidos.</p>${
          otros.length ? `<p>También de ${esc(prod.categoria)}:</p><div class="wa-ficha">${otros.map((p) => `<div class="wa-ren"><span>${esc(p.nombre)}</span><span>${dinero(p.precio)}</span></div>`).join('')}</div>` : ''
        }<p>Si gusta apartar, escríbalo aquí y lo vemos en cuanto abramos.</p>`,
    },
    {
      id: 'persona',
      q: 'Quiero hablar con alguien',
      r: () => `<p>Claro que sí. Ya dejé el aviso: una persona de ${esc(negocio)} le contestará por aquí en cuanto abramos.</p><p>No necesita volver a escribir. Su conversación queda hasta arriba de la lista.</p>`,
    },
  ]

  function pie() {
    const faltan = PREG.filter((p) => !hechas.has(p.id))
    if (ocupado && !faltan.length) return c.pie('')
    c.pie(
      faltan.length
        ? `<p class="wa-pie-t">Preguntas frecuentes · toque una</p>
           <div class="wa-ops">${faltan.map((p) => `<button class="wa-op" data-preg="${p.id}">${esc(p.q)}</button>`).join('')}</div>`
        : `<p class="dk-nota" style="text-align:center">Cuatro preguntas atendidas con el negocio cerrado. Tres quedaron resueltas y una espera a una persona.</p>
           <button class="wa-chico" data-otra>Ver otra vez</button>`,
    )
    if (ocupado) c.espera()
  }

  function inicio() {
    t.limpia()
    hechas = new Set()
    ocupado = true
    c = chat(el, { titulo: negocio, h: 23, min: 42, reducido })
    c.dia('Hoy')
    c.nota('El negocio está cerrado a esta hora')
    pie()
    t.en(600, () => {
      c.dice('yo', 'Buenas noches, ¿todavía atienden?')
      t.en(500, () =>
        c.escribe(t, 1300, () => {
          c.dice('el', `<p>Buenas noches. Le atiende el asistente automático de <b>${esc(negocio)}</b>.</p><p>A esta hora ya cerramos, pero lo más común se lo resuelvo ahora mismo. Lo demás se lo paso a una persona.</p>`)
          c.meta('Respondido en 2 segundos')
          ocupado = false
          pie()
        }),
      )
    })
  }

  toca(el, '[data-preg]', (b) => {
    const p = PREG.find((x) => x.id === b.dataset.preg)
    if (!p || ocupado) return
    ocupado = true
    hechas.add(p.id)
    c.pasa(1)
    c.dice('yo', esc(p.q))
    pie()
    t.en(350, () =>
      c.escribe(t, 1300, () => {
        c.dice('el', p.r())
        c.meta('Respondido en 2 segundos')
        if (p.id === 'persona') {
          c.nota('Conversación marcada como pendiente', 'alerta')
          c.marca('Pendiente')
        }
        ocupado = false
        pie()
      }),
    )
  })
  toca(el, '[data-otra]', inicio)

  inicio()
  return { destruir: () => t.limpia() }
}

// ───────────────────────── Pedido guiado ─────────────────────────

function pedido(el, { negocio, m, v, reducido }) {
  const t = relojes()
  const cats = porGrupo(m.productos, 'categoria')
  const cliente = m.clientes[1] || m.clientes[0]
  const ENVIO = 35
  const CASA = 'Calle Morelos 118, col. Centro'
  let c, carro, entrega, elegido
  let folio = 213

  const subtotal = () => carro.reduce((s, x) => s + x.n * x.p.precio, 0)
  const total = () => subtotal() + (entrega?.envio || 0)
  const ops = (titulo, html) => c.pie(`<p class="wa-pie-t">${titulo}</p>${html}`)
  const renglones = () => carro.map((x) => `<div class="wa-ren"><span>${x.n} × ${esc(x.p.nombre)}</span><span>${dinero(x.n * x.p.precio)}</span></div>`).join('')

  // El cliente dice algo; el asistente "escribe" y luego contesta.
  function turno(dicho, ms, fn) {
    c.dice('yo', esc(dicho))
    c.espera()
    t.en(300, () => c.escribe(t, ms, fn))
  }

  function categorias(saludo) {
    c.dice('el', saludo)
    ops('Elija una categoría', `<div class="wa-ops">${cats.map(([k], i) => `<button class="wa-op" data-cat="${i}">${esc(k)}</button>`).join('')}</div>`)
  }

  function resumen() {
    c.pasa(1)
    c.dice(
      'el',
      `<p>Este es su ${esc(v.pedido)}:</p>
       <div class="wa-ficha">${renglones()}${entrega.envio ? `<div class="wa-ren"><span>Envío a domicilio</span><span>${dinero(entrega.envio)}</span></div>` : ''}
         <div class="wa-ren wa-ren--t"><span>Total</span><span>${dinero(total())}</span></div></div>
       <p>${esc(entrega.texto)}. ¿Está todo correcto?</p>`,
      'wa-ancha',
    )
    ops(
      `Confirme su ${esc(v.pedido)}`,
      `<div class="wa-ops"><button class="wa-op wa-op--pri wa-op--mitad" data-confirma>Confirmar ${esc(v.pedido)}</button><button class="wa-op wa-op--mitad" data-cambia>Cambiar algo</button></div>`,
    )
  }

  function inicio() {
    t.limpia()
    carro = []
    entrega = null
    c = chat(el, { titulo: negocio, h: 14, min: 14, reducido })
    c.dia('Hoy')
    t.en(500, () => turno(`Hola, quiero hacer un ${v.pedido}`, 1100, () => categorias(`<p>Hola, gracias por escribir a <b>${esc(negocio)}</b>.</p><p>Aquí mismo le tomo su ${esc(v.pedido)}, paso a paso. ¿Qué le gustaría pedir?</p>`)))
  }

  toca(el, '[data-cat]', (b) => {
    const [nombre, lista] = cats[+b.dataset.cat]
    turno(nombre, 800, () => {
      c.dice('el', `De ${esc(nombre)} tenemos esto. Toque lo que guste.`)
      ops(
        esc(nombre),
        `<div class="wa-lista" data-rueda>${lista.map((p) => `<button class="wa-op" data-prod="${m.productos.indexOf(p)}"><span>${esc(p.nombre)}</span><span class="dk-num">${dinero(p.precio)}</span></button>`).join('')}</div>`,
      )
    })
  })

  toca(el, '[data-prod]', (b) => {
    elegido = m.productos[+b.dataset.prod]
    turno(elegido.nombre, 700, () => {
      c.dice('el', `<b>${esc(elegido.nombre)}</b>, ${dinero(elegido.precio)}. ¿Qué cantidad?`)
      ops('Cantidad', `<div class="wa-ops">${[1, 2, 3, 4].map((n) => `<button class="wa-op wa-op--mitad" data-n="${n}">${n}</button>`).join('')}</div>`)
    })
  })

  toca(el, '[data-n]', (b) => {
    const n = +b.dataset.n
    turno(String(n), 800, () => {
      const ya = carro.find((x) => x.p === elegido)
      ya ? (ya.n += n) : carro.push({ p: elegido, n })
      c.pasa(1)
      c.dice('el', `<p>Anotado: ${n} × ${esc(elegido.nombre)}.</p><p>Van ${dinero(subtotal())}. ¿Algo más?</p>`)
      ops('¿Algo más?', `<div class="wa-ops"><button class="wa-op wa-op--mitad" data-mas>Agregar algo más</button><button class="wa-op wa-op--pri wa-op--mitad" data-todo>Es todo</button></div>`)
    })
  })

  toca(el, '[data-mas]', () => turno('Sí, algo más', 600, () => categorias('Claro. ¿De qué categoría?')))

  toca(el, '[data-todo]', () =>
    turno('Es todo, gracias', 800, () => {
      c.dice('el', '¿Para recoger o a domicilio?')
      ops('Entrega', `<div class="wa-ops"><button class="wa-op wa-op--mitad" data-entrega="recoger">Para recoger</button><button class="wa-op wa-op--mitad" data-entrega="domicilio">A domicilio</button></div>`)
    }),
  )

  toca(el, '[data-entrega]', (b) => {
    if (b.dataset.entrega === 'recoger') {
      turno('Paso a recoger', 900, () => {
        entrega = { envio: 0, texto: `Para recoger a las ${c.enMin(26)}`, corto: `Para recoger · ${c.enMin(26)}` }
        resumen()
      })
    } else {
      turno('A domicilio, por favor', 800, () => {
        c.dice('el', `Con gusto. El envío en la zona cuesta ${dinero(ENVIO)}. ¿A qué dirección?`)
        ops('Su dirección', `<div class="wa-ops"><button class="wa-op" data-dir>${CASA}</button></div>`)
      })
    }
  })

  toca(el, '[data-dir]', () =>
    turno(CASA, 900, () => {
      entrega = { envio: ENVIO, texto: `A domicilio en ${CASA}. Llega cerca de las ${c.enMin(41)}`, corto: `A domicilio · ${CASA}` }
      resumen()
    }),
  )

  toca(el, '[data-cambia]', () =>
    turno('Quiero cambiar algo', 700, () => {
      carro = []
      entrega = null
      categorias('Sin problema, empezamos de nuevo. ¿Qué le gustaría pedir?')
    }),
  )

  toca(el, '[data-confirma]', () =>
    turno('Sí, confirmo', 1000, () => {
      folio++
      c.pasa(1)
      c.dice('el', `<p>Gracias, ${esc(cliente)}. Su ${esc(v.pedido)} #${folio} quedó registrado.</p><p>Se paga al recibir. Por aquí le avisamos ${entrega.envio ? 'cuando vaya en camino' : 'cuando pueda pasar'}.</p>`)
      c.pie('')
      t.en(1200, () => {
        c.nota('Así le llega al negocio')
        c.bloque(`<article class="dk-tarjeta dk-tarjeta--acento wa-ticket dk-aparece">
          <div class="dk-entre"><span class="dk-fuerte">${esc(cap(v.pedido))} #${folio}</span><span class="dk-chip dk-chip--acento">Nuevo · ${c.ahora()}</span></div>
          <p class="dk-nota" style="margin-top:3px">${esc(cliente)} · 81 5550 0142</p>
          <div class="dk-sep"></div>
          ${renglones()}${entrega.envio ? `<div class="wa-ren"><span>Envío</span><span>${dinero(entrega.envio)}</span></div>` : ''}
          <div class="wa-ren wa-ren--t"><span>Total · paga al recibir</span><span>${dinero(total())}</span></div>
          <p class="dk-nota dk-mt"><b>${esc(entrega.corto)}</b></p>
          <p class="dk-nota" style="margin-top:6px">Llegó completo: qué quiere, cuánto, cómo se entrega y el total. Nadie tuvo que preguntar dos veces.</p>
        </article>`)
        c.pie(`<button class="dk-btn dk-btn--bloque" data-otra>Hacer otro ${esc(v.pedido)}</button>`)
      })
    }),
  )

  toca(el, '[data-otra]', inicio)

  inicio()
  return { destruir: () => t.limpia() }
}

// ───────────────────────── Recordatorio ─────────────────────────

function recordatorio(el, { negocio, m, v, reducido }) {
  const t = relojes()
  const serv = m.servicios[1] || m.servicios[0]
  const quien = m.personal[2] || m.personal[0]
  const cliente = m.clientes[1] || m.clientes[0]
  const HORA = '2:30 p. m.'
  const manana = enDias(1)
  const OTROS = [
    { d: enDias(3), h: '2:30 p. m.' },
    { d: enDias(4), h: '11:00 a. m.' },
  ]
  let c

  const agenda = (filas) =>
    `<p class="wa-pie-t">Así queda en la agenda del negocio</p>
     ${filas.map((f) => `<div class="wa-agenda dk-aparece"><div><b>${f.t}</b>${f.s}</div><span class="dk-chip dk-chip--${f.tono}">${f.chip}</span></div>`).join('')}
     <button class="wa-chico" data-otra>Ver otra vez</button>`

  function turno(dicho, ms, fn) {
    c.pasa(2)
    c.dice('yo', esc(dicho))
    c.espera()
    t.en(300, () => c.escribe(t, ms, fn))
  }

  function inicio() {
    t.limpia()
    c = chat(el, { titulo: negocio, h: 10, min: 0, reducido })
    c.dia('Hoy')
    t.en(500, () =>
      c.escribe(t, 1200, () => {
        c.dice(
          'el',
          `<p>Buen día, ${esc(cliente)}. Le escribimos de <b>${esc(negocio)}</b> para recordarle su ${esc(v.cita)} de mañana.</p>
           <div class="wa-ficha"><p class="dk-fuerte">${esc(serv.nombre)}</p><p>Mañana, ${diaYNumero(manana)} · ${HORA}</p><p class="dk-nota">Le atiende ${esc(quien)}</p></div>
           <p>¿Nos confirma su asistencia?</p>`,
          'wa-ancha',
        )
        c.meta('Enviado solo, un día antes')
        c.pie(
          `<p class="wa-pie-t">Responda con un toque</p>
           <div class="wa-ops"><button class="wa-op wa-op--pri wa-op--mitad" data-si>Confirmo</button><button class="wa-op wa-op--mitad" data-no>No podré ir</button></div>`,
        )
      }),
    )
  }

  toca(el, '[data-si]', () =>
    turno('Confirmo', 1100, () => {
      c.dice('el', `<p>Gracias, ${esc(cliente)}. Ya confirmamos su ${esc(v.cita)}.</p><p>Le esperamos mañana a las ${HORA}. Si algo cambia, puede avisarnos por aquí.</p>`)
      c.nota(`✓ ${esc(cap(v.cita))} confirmada por el cliente`, 'ok')
      c.pie(agenda([{ t: `Mañana · ${HORA}`, s: `${esc(cliente)} · ${esc(serv.nombre)}`, chip: 'Confirmó', tono: 'ok' }]))
    }),
  )

  toca(el, '[data-no]', () =>
    turno('No podré ir', 1200, () => {
      c.dice('el', `<p>Gracias por avisar con tiempo. Ya liberamos su lugar de mañana para que alguien más lo aproveche.</p><p>¿Le acomoda alguno de estos horarios?</p>`)
      c.nota('El lugar de mañana quedó libre', 'alerta')
      c.pie(
        `<p class="wa-pie-t">Elija un horario nuevo</p>
         <div class="wa-ops">${OTROS.map((o, i) => `<button class="wa-op wa-op--mitad" data-nuevo="${i}">${cap(diaYNumero(o.d))} · ${o.h}</button>`).join('')}
         <button class="wa-op" data-nuevo="no">Por ahora no, gracias</button></div>`,
      )
    }),
  )

  toca(el, '[data-nuevo]', (b) => {
    const o = OTROS[+b.dataset.nuevo]
    const libre = { t: `Mañana · ${HORA}`, s: 'Lugar libre · se ofrece a quien estaba en espera', chip: 'Libre', tono: 'alerta' }
    if (!o) {
      return turno('Por ahora no, gracias', 1000, () => {
        c.dice('el', `<p>Entendido. Cuando guste agendar de nuevo, escríbanos por aquí y con gusto le buscamos lugar.</p>`)
        c.pie(agenda([libre]))
      })
    }
    turno(`${cap(diaYNumero(o.d))} a las ${o.h}`, 1100, () => {
      c.dice('el', `<p>Listo. Le apartamos el ${diaYNumero(o.d)} a las ${o.h}, con ${esc(quien)}.</p><p>Un día antes le llega su recordatorio, igual que hoy.</p>`)
      c.nota(`✓ ${esc(cap(v.cita))} reagendada`, 'ok')
      c.pie(agenda([libre, { t: `${cap(diaYNumero(o.d))} · ${o.h}`, s: `${esc(cliente)} · ${esc(serv.nombre)}`, chip: 'Reagendó', tono: 'acento' }]))
    })
  })

  toca(el, '[data-otra]', inicio)

  inicio()
  return { destruir: () => t.limpia() }
}

// ───────────────────────── Respuestas listas (lado del personal) ─────────────────────────

function plantillas(el, { negocio, nicho, m, v, avisar, reducido }) {
  const t = relojes()
  const prod = m.productos[Math.min(4, m.productos.length - 1)]
  const PL = [
    { id: 'horario', nombre: 'Horario', texto: `Con gusto. Atendemos ${horario(nicho)}`, usos: 14 },
    { id: 'ubicacion', nombre: 'Ubicación', texto: `Estamos en ${DIRECCION}, a media cuadra de la plaza principal. Hay estacionamiento sobre la calle.`, usos: 9 },
    { id: 'pago', nombre: 'Formas de pago', texto: 'Aceptamos efectivo, tarjeta de débito o crédito y transferencia. Si necesita factura, con gusto se la hacemos.', usos: 6 },
    { id: 'precio', nombre: 'Precio de…', largo: `Precio de ${prod.nombre}`, texto: `${prod.nombre} cuesta ${dinero(prod.precio)}, con impuestos incluidos. Si gusta, le tomo su ${v.pedido} de una vez.`, usos: 11 },
    { id: 'gracias', nombre: 'Gracias por su compra', texto: 'Gracias por su compra. Fue un gusto atenderle. Aquí seguimos para lo que se le ofrezca.', usos: 17 },
  ]
  // Cada conversación: el cliente pregunta en un orden y con palabras distintas.
  const GUIONES = [
    [
      ['horario', 'Buenas tardes, ¿hasta qué hora atienden hoy?'],
      ['ubicacion', '¿Y dónde están ubicados?'],
      ['pago', '¿Aceptan tarjeta?'],
      ['precio', `Perfecto. ¿Qué precio tiene ${prod.nombre}?`],
      ['gracias', `Listo, ya quedó mi ${v.pedido}. Gracias.`],
    ],
    [
      ['precio', `Buen día, ¿me da el precio de ${prod.nombre}?`],
      ['pago', '¿Puedo pagar con transferencia?'],
      ['horario', '¿Abren los domingos?'],
      ['ubicacion', '¿Me pasa la dirección, por favor?'],
      ['gracias', 'Ya pasé, todo muy bien. Muchas gracias.'],
    ],
  ]
  let tab = 'chat'
  let conv = 0 // número de conversación
  let paso = 0 // pregunta en curso dentro del guion
  let espera = null // id de la plantilla que contesta la pregunta pendiente
  let hist = [] // [{ lado, texto, hora } | { nota }]
  let borrador = null // plantilla insertada en el campo, por enviar
  let envio = 0
  let reloj = 16 * 60 + 5
  let c

  const cliente = () => m.clientes[(conv * 3) % m.clientes.length]
  const TABS = () => `<nav class="dk-tabs" role="tablist">
      <button class="dk-tab" role="tab" aria-selected="${tab === 'chat'}" data-tab="chat">Conversación</button>
      <button class="dk-tab" role="tab" aria-selected="${tab === 'mias'}" data-tab="mias">Mis respuestas · ${PL.length}</button>
    </nav>`

  const burbuja = (x) => (x.nota ? c.nota(x.nota, 'ok') : c.bloque(`<div class="dk-burbuja ${x.lado === 'yo' ? 'dk-burbuja--yo' : ''}">${esc(x.texto)}<small>${x.hora}${x.lado === 'yo' ? ' ✓✓' : ''}</small></div>`))
  const agrega = (x) => {
    hist.push(x)
    if (tab === 'chat') burbuja(x)
  }

  function pieChat() {
    c.pie(
      `<p class="wa-pie-t">Respuestas listas · un toque y se envía</p>
       <div class="wa-ops">${PL.map((p) => `<button class="wa-op ${p.id === espera && !borrador ? 'wa-op--sug' : ''}" data-pl="${p.id}">${esc(p.nombre)}</button>`).join('')}</div>
       <div class="wa-comp">
         <div class="wa-comp-c ${borrador ? 'es-lleno' : ''}">${borrador ? esc(borrador.texto) : 'Escriba un mensaje'}</div>
         <button class="wa-env" data-envia aria-label="Enviar mensaje" ${borrador ? '' : 'disabled'}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.4 20.4 21 12 3.4 3.6l-.1 6.5L15 12 3.3 13.9z"/></svg></button>
       </div>`,
    )
  }

  function pintar() {
    if (tab === 'chat') {
      c = chat(el, { titulo: cliente(), bajo: TABS(), reducido })
      c.dia('Hoy')
      hist.forEach(burbuja)
      pieChat()
      return
    }
    el.innerHTML = `${CSS}
      <header class="wa-barra">
        <span class="wa-av" aria-hidden="true">${esc(iniciales(negocio))}</span>
        <div class="dk-crece"><p class="wa-nom">${esc(negocio)}</p><p class="wa-est">Respuestas listas del equipo</p></div>
      </header>
      ${TABS()}
      <div class="dk-cuerpo" data-rueda>
        <p class="dk-nota">Se escriben una vez. ${esc(cap(v.personal))} las envía con un toque y todos contestan igual de bien.</p>
        <div class="dk-lista dk-mt">
          ${PL.map(
            (p) => `<div class="dk-fila" style="align-items:flex-start">
              <div class="dk-crece"><p class="dk-fila-t">${esc(p.largo || p.nombre)}</p><p class="dk-fila-s wa-corta">${esc(p.texto)}</p><p class="dk-nota" style="margin-top:4px;font-size:11.5px">Usada ${p.usos} veces esta semana</p></div>
              <button class="dk-btn dk-btn--chico" data-edita="${p.id}">Editar</button>
            </div>`,
          ).join('')}
        </div>
      </div>`
  }

  // Llega la siguiente pregunta del cliente (o empieza otra conversación).
  function pregunta() {
    const guion = GUIONES[conv % GUIONES.length]
    if (paso >= guion.length) {
      agrega({ nota: `Conversación atendida: ${guion.length} respuestas, ${guion.length} toques` })
      t.en(3200, () => {
        conv++
        paso = 0
        hist = []
        reloj += 7
        pintar()
        if (tab === 'chat') avisar(`Escribe ${cliente()}`)
        t.en(700, pregunta)
      })
      return
    }
    const [id, texto] = guion[paso]
    const llega = () => {
      reloj += 1
      espera = id
      agrega({ lado: 'el', texto, hora: aHora(reloj) })
      if (tab === 'chat') pieChat()
    }
    tab === 'chat' ? c.escribe(t, 1300, llega) : t.en(1300, llega)
  }

  function enviar() {
    if (!borrador) return
    clearTimeout(envio)
    const p = borrador
    borrador = null
    p.usos++
    agrega({ lado: 'yo', texto: p.texto, hora: aHora(reloj) })
    if (p.id === espera) {
      espera = null
      paso++
      t.en(900, pregunta)
    }
    if (tab === 'chat') pieChat()
  }

  toca(el, '[data-pl]', (b) => {
    borrador = PL.find((p) => p.id === b.dataset.pl)
    pieChat()
    clearTimeout(envio)
    envio = t.en(1000, enviar)
  })
  toca(el, '[data-envia]', enviar)
  toca(el, '[data-tab]', (b) => {
    if (b.dataset.tab === tab) return
    tab = b.dataset.tab
    pintar()
  })
  toca(el, '[data-edita]', (b) => {
    const p = PL.find((x) => x.id === b.dataset.edita)
    const h = hoja(
      el,
      `<p class="dk-titulo">${esc(p.largo || p.nombre)}</p>
       <p class="dk-nota" style="margin-top:4px">Así saldrá cada vez que alguien la toque.</p>
       <label class="dk-etq" for="wa-texto">Texto de la respuesta</label>
       <textarea class="dk-campo" id="wa-texto" rows="6" style="resize:none">${esc(p.texto)}</textarea>
       <button class="dk-btn dk-btn--pri dk-btn--bloque dk-mt-g" data-guarda>Guardar respuesta</button>
       <button class="dk-btn dk-btn--bloque dk-mt" data-cerrar>Cancelar</button>`,
    )
    h.el.querySelector('[data-guarda]').addEventListener('click', () => {
      const nuevo = h.el.querySelector('textarea').value.trim()
      if (!nuevo) return avisar('Escriba el texto antes de guardar')
      p.texto = nuevo
      h.cerrar()
      pintar()
      avisar('Respuesta guardada')
    })
  })

  pintar()
  t.en(700, pregunta)
  return { destruir: () => t.limpia() }
}

// ───────────────────────── Resumen del día (teléfono del dueño) ─────────────────────────

function reporte(el, { negocio, m, v, reducido }) {
  const t = relojes()
  const cats = porGrupo(m.productos, 'categoria').map(([k]) => k)
  const media = m.productos.reduce((s, p) => s + p.precio, 0) / m.productos.length
  const bajos = m.insumos.filter((i) => i.hay < i.minimo)
  const L = m.productos.length
  const redondo = (n) => Math.round(n / 10) * 10

  const DIAS = ['Hoy', 'Ayer', 'Hace 2 días'].map((etq, k) => {
    const d = enDias(-k)
    const ventasN = [58, 49, 66][k]
    const ventas = redondo(ventasN * media * 1.7)
    const cambio = [12, -6, 4][k]
    const ins = (bajos.length ? bajos : m.insumos)[k % (bajos.length || m.insumos.length)]
    return {
      etq,
      d,
      ventasN,
      ventas,
      cambio,
      antes: redondo(ventas / (1 + cambio / 100)),
      top: [0, 1, 2].map((j) => ({ p: m.productos[(k * 2 + j * 3 + 1) % L], n: [19, 14, 11][j] - k })),
      atencion: [
        `${esc(ins.nombre)}: quedan ${ins.hay} ${esc(ins.unidad)} y el mínimo es ${ins.minimo}.`,
        [`Una cuenta por cobrar: ${esc(m.clientes[2])}, ${dinero(redondo(media * 3.2))}.`, `Dos ${esc(v.citas)} de mañana siguen sin confirmar.`, `El corte de caja cerró con ${dinero(80)} de diferencia.`][k],
      ],
      // Lo que el dueño ya contestó ese día. Hoy empieza en blanco.
      hechos: [[], ['bien'], ['detalle']][k],
      llego: k > 0,
    }
  })
  let dia = 0
  let c

  const resumen = (x) => {
    const sube = x.cambio >= 0
    const max = Math.max(x.ventas, x.antes)
    const nd = nombreDia(x.d)
    return `<p class="wa-rep-t">Resumen del ${diaYNumero(x.d)}</p>
      <p class="wa-rep-n">${dinero(x.ventas)}</p>
      <p class="dk-nota" style="margin-top:1px">${x.ventasN} ventas · promedio de ${dinero(Math.round(x.ventas / x.ventasN))} cada una</p>
      <div class="wa-cmp">
        <span>${cap(nd)}</span><i class="es-hoy"><b style="--p:${(x.ventas / max) * 100}%"></b></i><span>${dinero(x.ventas)}</span>
        <span>Hace 8 días</span><i><b style="--p:${(x.antes / max) * 100}%"></b></i><span>${dinero(x.antes)}</span>
      </div>
      <p style="margin-top:7px"><span class="dk-chip dk-chip--${sube ? 'ok' : 'alerta'}">${sube ? '+' : '−'}${Math.abs(x.cambio)} %</span> ${sube ? 'más' : 'menos'} que el ${nd} pasado</p>
      <p class="wa-rep-h">Lo más vendido</p>
      ${x.top.map((r) => `<p class="wa-top"><span>${esc(r.p.nombre)}</span><span>${r.n}</span></p>`).join('')}
      <p class="wa-rep-h">Requiere atención</p>
      ${x.atencion.map((a) => `<p class="wa-punto"><span>${a}</span></p>`).join('')}`
  }

  const detalle = (x) => {
    const pagos = [
      ['Efectivo', 0.46],
      ['Tarjeta', 0.38],
      ['Transferencia', 0.16],
    ]
    const pesos = [0.44, 0.27, 0.18, 0.11].slice(0, cats.length)
    const suma = pesos.reduce((s, p) => s + p, 0)
    const fila = (n, p) => `<span>${esc(n)}</span><i class="es-hoy"><b style="--p:${Math.round(p * 100) * 2}%"></b></i><span>${dinero(redondo(x.ventas * p))}</span>`
    return `<p class="wa-rep-t">Detalle del ${diaYNumero(x.d)}</p>
      <p class="wa-rep-h" style="border:0;padding:0;margin-top:8px!important">Por forma de pago</p>
      <div class="wa-cmp">${pagos.map(([n, p]) => fila(n, p)).join('')}</div>
      <p class="wa-rep-h">Por categoría</p>
      <div class="wa-cmp">${cats.slice(0, 4).map((n, i) => fila(n, pesos[i] / suma)).join('')}</div>
      <p class="wa-rep-h">Hora más fuerte</p>
      <p style="margin-top:4px">De 2:00 a 4:00 p. m., con ${Math.round(x.ventasN * 0.34)} de las ${x.ventasN} ventas.</p>`
  }

  const respuesta = (x, cual) =>
    cual === 'detalle'
      ? ['Ver detalle', detalle(x), 'wa-ancha']
      : ['Todo bien', `<p>Enterado. ${x.etq === 'Hoy' ? 'Mañana a las 9:30 p. m. le llega el siguiente resumen.' : 'Su respuesta quedó registrada.'}</p><p>Que descanse.</p>`, '']

  function pie(x) {
    const faltan = ['detalle', 'bien'].filter((k) => !x.hechos.includes(k))
    c.pie(
      !x.llego
        ? ''
        : faltan.length
          ? `<p class="wa-pie-t">Responda con un toque</p>
             <div class="wa-ops">${faltan.map((k) => `<button class="wa-op wa-op--mitad ${k === 'bien' ? 'wa-op--pri' : ''}" data-resp="${k}">${k === 'detalle' ? 'Ver detalle' : 'Todo bien'}</button>`).join('')}</div>`
          : `<p class="dk-nota" style="text-align:center">Es todo por ${x.etq === 'Hoy' ? 'hoy' : 'ese día'}. Llega cada noche a las 9:30, sin que nadie lo arme.</p>`,
    )
  }

  function pintar() {
    t.limpia()
    const x = DIAS[dia]
    c = chat(el, {
      titulo: negocio,
      estado: 'Resumen diario · 9:30 p. m.',
      h: 21,
      min: 30,
      reducido,
      bajo: `<nav class="dk-tabs" role="tablist">${DIAS.map((y, i) => `<button class="dk-tab" role="tab" aria-selected="${i === dia}" data-dia="${i}">${y.etq}</button>`).join('')}</nav>`,
    })
    c.dia(cap(diaYNumero(x.d)))
    if (!x.llego) {
      // El de hoy llega frente a quien mira.
      pie(x)
      t.en(600, () =>
        c.escribe(t, 1400, () => {
          x.llego = true
          c.dice('el', resumen(x), 'wa-ancha')
          pie(x)
        }),
      )
      return
    }
    c.dice('el', resumen(x), 'wa-ancha')
    c.pasa(1)
    x.hechos.forEach((k) => {
      const [dicho, html, clase] = respuesta(x, k)
      c.dice('yo', dicho)
      c.dice('el', html, clase)
    })
    pie(x)
  }

  toca(el, '[data-dia]', (b) => {
    dia = +b.dataset.dia
    pintar()
  })
  toca(el, '[data-resp]', (b) => {
    const x = DIAS[dia]
    const k = b.dataset.resp
    const [dicho, html, clase] = respuesta(x, k)
    c.pasa(1)
    c.dice('yo', dicho)
    c.espera()
    t.en(300, () =>
      c.escribe(t, 1100, () => {
        x.hechos.push(k)
        c.dice('el', html, clase)
        pie(x)
      }),
    )
  })

  pintar()
  return { destruir: () => t.limpia() }
}
