import { esc, dinero, toca, relojes, hora, enMin, porGrupo, iniciales } from '../kit.js'

// Catálogo y venta en línea.
//   tienda   — escritorio: tienda con carrito lateral y pago en dos pasos hasta "Pedido confirmado".
//   whatsapp — teléfono: catálogo compartible; el pedido sale armado hacia una conversación.
//   menu     — teléfono: menú o catálogo digital con dos caras, la del cliente y la del negocio.

export default {
  id: 'catalogo',
  nombre: 'Catálogo',
  vistas: {
    tienda: { titulo: 'Su tienda, abierta a toda hora', dispositivo: 'escritorio' },
    whatsapp: { titulo: 'El pedido llega armado a su WhatsApp', dispositivo: 'telefono' },
    menu: { titulo: 'Precios al día, sin reimprimir', dispositivo: 'telefono' },
  },
  montar(el, ctx) {
    el.classList.add('ct')
    const api = ctx.vista === 'tienda' ? tienda(el, ctx) : ctx.vista === 'whatsapp' ? whatsapp(el, ctx) : menu(el, ctx)
    return {
      destruir() {
        api.destruir()
        el.classList.remove('ct')
      },
    }
  },
}

// ───────────────────────── Piezas comunes ─────────────────────────

const TRATO = /^(Sra?\.|Don|Doña|Ing\.|Lic\.|Dra?\.|Familia)\s+/i
/** Un cliente de la muestra con nombre y apellido, para llenar formularios. */
const persona = (m) => m.clientes.find((c) => !TRATO.test(c)) || m.clientes[0]
/** "Paola Méndez" → "Paola"; "Sra. Elizondo" se queda igual. */
const dePila = (n) => (TRATO.test(n) ? n : String(n).trim().split(/\s+/)[0])

const matiz = (texto) => {
  let h = 0
  for (const c of String(texto)) h = (h * 31 + c.charCodeAt(0)) % 360
  return h
}

/** Dibujo abstracto y estable para un producto: cuatro composiciones, color según el nombre. */
const arte = (nombre, clase = '') => {
  const h = matiz(nombre)
  return `<span class="ct-arte ct-arte--${(h + String(nombre).length) % 4} ${clase}" style="--h:${h}" aria-hidden="true"><i></i><i></i><i></i></span>`
}

const cantidad = (nombre, n) =>
  `<span class="dk-cant ct-cant"><button class="dk-ico-btn" data-menos="${esc(nombre)}" aria-label="Quitar uno">−</button><span class="ct-cant-n">${n}</span><button class="dk-ico-btn dk-ico-btn--pri" data-mas="${esc(nombre)}" aria-label="Agregar uno">+</button></span>`

const ESTILOS = `<style>
.ct .dk-btn{font-weight:650;font-size:14.5px}
.ct .dk-btn--chico{font-size:13px}
.ct .dk-ico-btn{font-weight:600;font-size:18px;line-height:1}
.ct .dk-btn--pri,.ct .dk-btn--oscuro,.ct .dk-ico-btn--pri{color:#fff}
.ct .dk-btn--suave{color:var(--dk-acento)}
.ct-vista{flex:1;min-height:0;display:flex;flex-direction:column}

.ct-arte{position:relative;display:block;overflow:hidden;border-radius:12px;background:hsl(var(--h) 44% 91%)}
.ct-arte i{position:absolute;display:block}
.ct-arte--0 i:nth-child(1){width:34%;aspect-ratio:1;left:16%;top:14%;border-radius:50%;background:hsl(var(--h) 62% 74%)}
.ct-arte--0 i:nth-child(2){width:130%;height:70%;left:-42%;top:58%;border-radius:50%;background:hsl(calc(var(--h) + 28) 40% 66%)}
.ct-arte--0 i:nth-child(3){width:120%;height:70%;left:26%;top:68%;border-radius:50%;background:hsl(calc(var(--h) + 28) 36% 54%)}
.ct-arte--1 i:nth-child(1){width:52%;aspect-ratio:1;left:10%;top:16%;border-radius:50%;background:hsl(var(--h) 52% 72%)}
.ct-arte--1 i:nth-child(2){width:52%;aspect-ratio:1;left:38%;top:26%;border-radius:50%;background:hsl(calc(var(--h) + 40) 46% 62%);mix-blend-mode:multiply}
.ct-arte--1 i:nth-child(3){width:12%;aspect-ratio:1;right:10%;top:12%;border-radius:50%;background:hsl(calc(var(--h) - 30) 60% 60%)}
.ct-arte--2 i:nth-child(1){width:44%;height:72%;left:12%;bottom:0;border-radius:999px 999px 0 0;background:hsl(var(--h) 46% 68%)}
.ct-arte--2 i:nth-child(2){width:30%;height:46%;left:50%;bottom:0;border-radius:999px 999px 0 0;background:hsl(calc(var(--h) + 36) 42% 58%)}
.ct-arte--2 i:nth-child(3){width:16%;aspect-ratio:1;right:10%;top:14%;border-radius:50%;background:hsl(calc(var(--h) - 24) 62% 70%)}
.ct-arte--3 i:nth-child(1){width:150%;height:30%;left:-25%;top:12%;transform:rotate(-18deg);background:hsl(var(--h) 50% 78%)}
.ct-arte--3 i:nth-child(2){width:150%;height:22%;left:-25%;top:50%;transform:rotate(-18deg);background:hsl(calc(var(--h) + 30) 44% 66%)}
.ct-arte--3 i:nth-child(3){width:26%;aspect-ratio:1;left:58%;top:52%;border-radius:50%;background:hsl(calc(var(--h) - 20) 48% 52%)}

.ct-cant{gap:8px}
.ct-cant-n{min-width:16px;text-align:center}
.ct .ct-cant .dk-ico-btn{width:30px;height:30px;font-size:16px}

/* Tienda (escritorio) */
.ct-t-cab{flex:none;display:flex;align-items:center;gap:26px;height:64px;padding:0 28px;background:#fff;border-bottom:1px solid var(--dk-linea)}
.ct .ct-t-marca{flex:none;display:flex;align-items:center;gap:10px;font-weight:750;font-size:18px;letter-spacing:-.02em}
.ct-t-logo{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:var(--dk-acento);color:#fff;font-size:15px;font-weight:750}
.ct-t-nav{flex:1;min-width:0;display:flex;gap:2px;overflow:hidden}
.ct .ct-t-nav button{flex:none;padding:8px 12px;border-radius:9px;font-weight:600;font-size:14px;color:var(--dk-tx2);transition:background .2s,color .2s}
.ct .ct-t-nav button:hover{color:var(--dk-tx)}
.ct .ct-t-nav button[aria-current=true]{background:var(--dk-acento-f);color:var(--dk-acento)}
.ct-t-cuerpo{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 330px}
.ct-t-main{min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:24px 28px 32px;scrollbar-width:none}
.ct-t-main::-webkit-scrollbar{display:none}
.ct-t-hero{display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:24px;align-items:center;padding:26px 28px;border-radius:18px;background:var(--dk-acento-f);margin-bottom:22px}
.ct-t-k{font-weight:650;font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:var(--dk-acento)}
.ct-t-h1{margin-top:8px;font-weight:760;font-size:32px;line-height:1.08;letter-spacing:-.03em;text-wrap:balance}
.ct-t-p{margin-top:10px;max-width:46ch;font-size:15px;color:var(--dk-tx2)}
.ct-t-hero .ct-arte{height:124px;border-radius:14px}
.ct-t-sec{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:14px}
.ct-t-h2{font-weight:750;font-size:22px;letter-spacing:-.02em;line-height:1.15}
.ct-t-rejilla{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
.ct-t-prod{display:flex;flex-direction:column;padding:10px 10px 12px;border-radius:16px;background:#fff;border:1px solid var(--dk-linea);transition:box-shadow .2s,border-color .2s}
.ct-t-prod:hover{box-shadow:0 8px 22px -14px rgb(0 0 0 / .3)}
.ct-t-prod.es-dentro{border-color:var(--dk-acento)}
.ct-t-prod .ct-arte{height:112px}
.ct-t-prod-c{margin:10px 2px 0;font-size:11.5px;font-weight:600;letter-spacing:.03em;text-transform:uppercase;color:var(--dk-tx3)}
.ct-t-prod-n{flex:1;margin:2px 2px 0;min-height:38px;font-weight:650;font-size:14.5px;line-height:1.3}
.ct-t-prod-pie{margin:8px 2px 0;min-height:34px}
.ct-t-precio{font-weight:750;font-size:16px}
.ct-t-fin{margin-top:18px;text-align:center}

.ct-t-lado{min-height:0;display:flex;flex-direction:column;background:#fff;border-left:1px solid var(--dk-linea)}
.ct-t-lado-cab{flex:none;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:18px 20px 12px}
.ct-t-lado-c{flex:1;min-height:0;overflow-y:auto;padding:0 20px;scrollbar-width:none}
.ct-t-lado-c::-webkit-scrollbar{display:none}
.ct-t-item{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:12px;align-items:center;padding:11px 0;border-top:1px solid var(--dk-linea)}
.ct-t-item:first-child{border-top:0}
.ct-t-item .ct-arte{width:44px;height:44px;border-radius:10px}
.ct-t-item-n{font-weight:600;font-size:13.5px;line-height:1.25}
.ct-t-item-d{display:flex;flex-direction:column;align-items:flex-end;gap:6px}
.ct-t-vacio{display:grid;gap:6px;justify-items:center;text-align:center;padding:36px 12px;border:1.5px dashed var(--dk-linea);border-radius:14px;margin-top:6px}
.ct-t-lado-pie{flex:none;display:grid;gap:7px;padding:14px 20px 20px;border-top:1px solid var(--dk-linea);font-size:14px}
.ct-t-lado-pie .dk-sep{margin:4px 0}

.ct-t-flujo{max-width:740px;margin:0 auto}
.ct-t-hoja{padding:26px 30px 28px;border-radius:18px;background:#fff;border:1px solid var(--dk-linea)}
.ct-t-migas{display:flex;align-items:center;gap:10px;margin-bottom:22px;font-weight:600;font-size:13px;color:var(--dk-tx3)}
.ct-t-migas b{display:inline-grid;place-items:center;width:24px;height:24px;margin-right:7px;border-radius:50%;border:1.5px solid currentColor;font-size:12px}
.ct-t-migas span{display:flex;align-items:center}
.ct-t-migas i{flex:none;width:36px;height:1.5px;background:var(--dk-linea)}
.ct-t-migas .es-ahora{color:var(--dk-tx)}
.ct-t-migas .es-ahora b{background:var(--dk-acento);border-color:var(--dk-acento);color:#fff}
.ct-t-migas .es-hecho{color:var(--dk-ok)}
.ct-t-migas .es-hecho b{background:var(--dk-ok-f);border-color:transparent}
.ct-t-opc{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}
.ct .ct-t-op{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;padding:14px 16px;border-radius:14px;border:1.5px solid var(--dk-linea);background:#fff;text-align:left;transition:border-color .2s,box-shadow .2s}
.ct .ct-t-op[aria-pressed=true]{border-color:var(--dk-acento);box-shadow:0 0 0 3px var(--dk-acento-f)}
.ct-t-op .dk-nota{grid-column:1}
.ct-t-op-p{grid-column:2;grid-row:1 / span 2;align-self:center;font-weight:700}
.ct-t-campos{display:grid;grid-template-columns:1fr 1fr;gap:0 14px;margin-top:8px}
.ct-t-ancho{grid-column:1 / -1}
.ct-t-acc{display:flex;justify-content:space-between;gap:12px;margin-top:24px}
.ct-t-pago{display:grid;grid-template-columns:270px minmax(0,1fr);gap:26px;align-items:start;margin-top:16px}
.ct-t-plastico{display:flex;flex-direction:column;justify-content:space-between;height:168px;padding:18px;border-radius:16px;color:#fff;font-size:12px;letter-spacing:.04em;background:linear-gradient(135deg,color-mix(in srgb,var(--dk-acento) 82%,#000),var(--dk-acento) 55%,color-mix(in srgb,var(--dk-acento) 70%,#fff));box-shadow:0 16px 30px -18px var(--dk-acento)}
.ct-t-plastico-chip{width:38px;height:28px;border-radius:6px;background:linear-gradient(135deg,#f3e3b0,#c9a959)}
.ct-t-plastico-n{font-size:17px;font-weight:600;letter-spacing:.08em}
.ct-t-pago .ct-t-campos{margin-top:-12px}
.ct-t-listo{display:flex;flex-direction:column;align-items:center;text-align:center;padding-top:8px}
.ct-t-listo .ct-t-h2{margin-top:14px;font-size:28px}
.ct-t-folio{margin-top:6px;font-size:16px}
.ct-t-avance{width:100%;max-width:440px;margin:22px 0 20px;text-align:left}
.ct-t-avance .dk-paso:last-child{padding-bottom:0}

/* Catálogo con pedido por WhatsApp (teléfono) */
.ct-w-nombre{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.ct-w-nombre label{flex:none;font-weight:600;font-size:12.5px;color:var(--dk-tx2)}
.ct-w-nombre .dk-campo{min-height:38px;padding:7px 11px}
.ct .ct-w-btn{background:#1d7f55;border-color:#1d7f55;color:#fff}
.ct-w-globo{position:relative;flex:none;width:17px;height:14px;border-radius:7px;background:#fff}
.ct-w-globo::after{content:'';position:absolute;left:2px;bottom:-3px;border:4px solid transparent;border-left-color:#fff;border-bottom-color:#fff;border-radius:1px}
.ct-w-cab{flex:none;display:flex;align-items:center;gap:10px;min-height:56px;padding:8px 14px 8px 6px;background:#12584a;color:#fff}
.ct .ct-w-atras{flex:none;display:grid;place-items:center;width:34px;height:40px;border-radius:10px}
.ct-w-atras::before{content:'';width:10px;height:10px;border-left:2.2px solid #fff;border-bottom:2.2px solid #fff;transform:translateX(2px) rotate(45deg)}
.ct-w-cab .dk-avatar{background:#fff;color:#12584a}
.ct-w-fondo{background:#ece5dc;padding-top:10px}
.ct-w-dia{align-self:center;margin:2px 0 6px;padding:3px 10px;border-radius:8px;background:rgb(255 255 255 / .85);font-size:11.5px;font-weight:600;color:var(--dk-tx2)}
.ct-w-fondo .dk-burbuja{border-color:transparent;box-shadow:0 1px 1px rgb(0 0 0 / .08);line-height:1.4}
.ct-w-msj p + p{margin-top:8px}
.ct-w-msj .ct-w-linea{display:flex;justify-content:space-between;gap:14px}
.ct-w-msj .ct-w-linea span:last-child{flex:none;font-variant-numeric:tabular-nums}
.ct-w-palomas{margin-left:4px;color:#3b8fd9;letter-spacing:-3px}
.ct-w-escribe{display:inline-flex;gap:4px;padding:5px 2px}
.ct-w-escribe i{width:6px;height:6px;border-radius:50%;background:var(--dk-tx3);animation:ct-bota 1s ease-in-out infinite}
.ct-w-escribe i:nth-child(2){animation-delay:.15s}
.ct-w-escribe i:nth-child(3){animation-delay:.3s}
@keyframes ct-bota{40%{transform:translateY(-4px);opacity:.5}}
.ct-w-resp{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}

/* Menú digital (teléfono) */
.ct-m-top{flex:none;padding:10px 16px;background:#fff;border-bottom:1px solid var(--dk-linea)}
.ct-seg{display:flex;gap:2px;padding:3px;border-radius:12px;background:rgb(0 0 0 / .06)}
.ct .ct-seg button{flex:1;min-height:36px;border-radius:9px;font-weight:650;font-size:13.5px;color:var(--dk-tx2);transition:background .2s,color .2s}
.ct .ct-seg button[aria-selected=true]{background:#fff;color:var(--dk-tx);box-shadow:0 1px 3px rgb(0 0 0 / .14)}
.ct-m-carta{position:relative;padding:0 0 26px;background:#fffdfa}
.ct-m-cab{display:grid;justify-items:center;gap:4px;padding:22px 20px 16px;text-align:center}
.ct-m-logo{display:grid;place-items:center;width:46px;height:46px;border-radius:50%;background:var(--dk-acento);color:#fff;font-weight:750;font-size:17px}
.ct-m-nombre{margin-top:6px;font-weight:760;font-size:25px;letter-spacing:-.03em;line-height:1.1}
.ct-m-cats{position:sticky;top:0;z-index:2;display:flex;gap:6px;padding:8px 16px;overflow-x:auto;scrollbar-width:none;background:#fffdfa;border-bottom:1px solid var(--dk-linea)}
.ct-m-cats::-webkit-scrollbar{display:none}
.ct .ct-m-cats button{flex:none;padding:6px 12px;border-radius:999px;border:1px solid var(--dk-linea);font-weight:600;font-size:12.5px;color:var(--dk-tx2);white-space:nowrap}
.ct-m-sec{padding:0 20px}
.ct-m-cat{display:flex;align-items:center;gap:10px;margin:22px 0 6px;font-weight:700;font-size:12.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--dk-acento)}
.ct-m-cat::after{content:'';flex:1;height:1px;background:var(--dk-linea)}
.ct-m-item{display:flex;align-items:baseline;gap:8px;padding:9px 6px;margin:0 -6px;border-radius:8px;font-size:15px}
.ct-m-item > i{flex:1;min-width:14px;border-bottom:1.5px dotted #cfccc4;transform:translateY(-3px)}
.ct-m-n{font-weight:600}
.ct-m-p{flex:none;font-weight:700}
.ct-m-item.es-agotado .ct-m-n{color:var(--dk-tx3);text-decoration:line-through}
.ct-m-item.es-agotado .dk-chip{align-self:center}
.ct-m-item.es-nuevo{animation:ct-luz 2.6s ease-out both}
@keyframes ct-luz{0%,45%{background:var(--dk-acento-f)}}
.ct-m-pie{margin:22px 20px 0;text-align:center}
.ct-m-fila{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px 12px;align-items:center;padding:12px 14px}
.ct-m-fila + .ct-m-fila{border-top:1px solid var(--dk-linea)}
.ct-m-fila .dk-fila-t{grid-column:1 / -1;white-space:normal}
.ct-m-fila.es-agotado .dk-fila-t{color:var(--dk-tx3)}
.ct .ct-m-precio{justify-self:start;display:inline-flex;align-items:center;gap:8px;min-height:36px;padding:0 12px;border-radius:10px;border:1px solid var(--dk-linea);background:var(--dk-fondo);font-weight:700;font-size:15px}
.ct-m-precio small{font-weight:600;font-size:11.5px;color:var(--dk-acento)}
.ct-m-edita{justify-self:start;display:flex;align-items:center;gap:6px;font-weight:700}
.ct-m-campo{width:92px;min-height:36px;padding:0 10px;border-radius:10px;border:0;outline:2px solid var(--dk-acento);background:#fff;font-weight:700;font-size:15px}
.ct-m-antes{margin-left:4px;font-weight:500;font-size:12px;color:var(--dk-tx3);text-decoration:line-through}
.ct-m-sw{display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600;color:var(--dk-tx2)}
.ct .ct-sw{position:relative;flex:none;width:44px;height:26px;border-radius:999px;background:#d9d6cf;transition:background .2s}
.ct-sw::after{content:'';position:absolute;left:3px;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgb(0 0 0 / .25);transition:transform .2s}
.ct .ct-sw[aria-checked=true]{background:var(--dk-mal)}
.ct-sw[aria-checked=true]::after{transform:translateX(18px)}
</style>`

// ───────────────────────── Tienda en línea (escritorio) ─────────────────────────

function tienda(el, { negocio, m, v, avisar }) {
  const t = relojes()
  const cats = porGrupo(m.productos, 'categoria')
  const carrito = new Map() // nombre → cantidad
  const ENVIO = 45
  const datos = { nombre: persona(m), tel: '81 5550 0142', dir: 'Av. Hidalgo 214, Col. Centro' }
  let cat = '' // '' es todo el catálogo
  let paso = 'catalogo' // catalogo | entrega | pago | cobrando | listo
  let entrega = 'domicilio'
  let folio = ''
  let avance = 1

  const prod = (n) => m.productos.find((p) => p.nombre === n)
  const piezas = () => [...carrito.values()].reduce((s, c) => s + c, 0)
  const subtotal = () => [...carrito].reduce((s, [n, c]) => s + c * prod(n).precio, 0)
  const envio = () => (entrega === 'domicilio' ? ENVIO : 0)
  const total = () => subtotal() + envio()

  el.innerHTML = `${ESTILOS}
    <header class="ct-t-cab">
      <button class="ct-t-marca" data-cat=""><span class="ct-t-logo">${esc(negocio.charAt(0).toUpperCase())}</span>${esc(negocio)}</button>
      <nav class="ct-t-nav" aria-label="Categorías"></nav>
      <span class="dk-chip dk-chip--ok">Recibe pedidos a toda hora</span>
    </header>
    <div class="ct-t-cuerpo">
      <main class="ct-t-main" data-rueda></main>
      <aside class="ct-t-lado" aria-label="Carrito"></aside>
    </div>`
  const $nav = el.querySelector('.ct-t-nav')
  const $main = el.querySelector('.ct-t-main')
  const $lado = el.querySelector('.ct-t-lado')

  const tarjeta = (p) => {
    const n = carrito.get(p.nombre) || 0
    return `<article class="ct-t-prod ${n ? 'es-dentro' : ''}">
      ${arte(p.nombre)}
      <p class="ct-t-prod-c">${esc(p.categoria)}</p>
      <p class="ct-t-prod-n">${esc(p.nombre)}</p>
      <div class="dk-entre ct-t-prod-pie">
        <span class="ct-t-precio dk-num">${dinero(p.precio)}</span>
        ${n ? cantidad(p.nombre, n) : `<button class="dk-btn dk-btn--chico dk-btn--pri" data-mas="${esc(p.nombre)}" aria-label="Agregar ${esc(p.nombre)}">Agregar</button>`}
      </div>
    </article>`
  }

  function htmlCatalogo() {
    const lista = cat ? cats.find(([c]) => c === cat)[1] : m.productos
    return `
      ${
        cat
          ? ''
          : `<section class="ct-t-hero">
              <div>
                <p class="ct-t-k">Tienda en línea</p>
                <h1 class="ct-t-h1">Compre en ${esc(negocio)} a cualquier hora</h1>
                <p class="ct-t-p">Elija, pague con tarjeta y reciba en su domicilio. Si lo prefiere, pase a recogerlo.</p>
              </div>
              ${arte(negocio)}
            </section>`
      }
      <div class="ct-t-sec"><h2 class="ct-t-h2">${cat ? esc(cat) : 'Todo el catálogo'}</h2><span class="dk-nota">${lista.length} ${esc(v.productos)}</span></div>
      <div class="ct-t-rejilla">${lista.map(tarjeta).join('')}</div>
      <p class="dk-nota ct-t-fin">Los precios incluyen impuestos. Envío a domicilio ${dinero(ENVIO)}; recoger no tiene costo.</p>`
  }

  const migas = (n) =>
    `<div class="ct-t-migas">${['Entrega', 'Pago']
      .map((p, i) => `<span class="${i + 1 < n ? 'es-hecho' : i + 1 === n ? 'es-ahora' : ''}"><b>${i + 1 < n ? '✓' : i + 1}</b>${p}</span>`)
      .join('<i></i>')}</div>`

  function htmlEntrega() {
    return `<div class="ct-t-flujo ct-t-hoja">
      ${migas(1)}
      <h2 class="ct-t-h2">¿Cómo lo quiere recibir?</h2>
      <div class="ct-t-opc">
        <button class="ct-t-op" aria-pressed="${entrega === 'domicilio'}" data-entrega="domicilio">
          <span class="dk-fuerte">Envío a domicilio</span><span class="dk-nota">Llega hoy, alrededor de las ${enMin(50)}</span><span class="ct-t-op-p dk-num">${dinero(ENVIO)}</span>
        </button>
        <button class="ct-t-op" aria-pressed="${entrega === 'recoger'}" data-entrega="recoger">
          <span class="dk-fuerte">Paso a recogerlo</span><span class="dk-nota">Listo a partir de las ${enMin(25)}</span><span class="ct-t-op-p">Sin costo</span>
        </button>
      </div>
      <div class="ct-t-campos">
        <div><label class="dk-etq" for="ct-nom">Nombre</label><input class="dk-campo" id="ct-nom" data-dato="nombre" autocomplete="off" value="${esc(datos.nombre)}" /></div>
        <div><label class="dk-etq" for="ct-tel">Celular</label><input class="dk-campo" id="ct-tel" data-dato="tel" inputmode="tel" autocomplete="off" value="${esc(datos.tel)}" /></div>
        ${entrega === 'domicilio' ? `<div class="ct-t-ancho"><label class="dk-etq" for="ct-dir">Dirección de entrega</label><input class="dk-campo" id="ct-dir" data-dato="dir" autocomplete="off" value="${esc(datos.dir)}" /></div>` : ''}
      </div>
      <div class="ct-t-acc">
        <button class="dk-btn" data-volver>Volver al catálogo</button>
        <button class="dk-btn dk-btn--pri" data-sigue>Continuar al pago</button>
      </div>
    </div>`
  }

  function htmlPago() {
    const cobrando = paso === 'cobrando'
    return `<div class="ct-t-flujo ct-t-hoja">
      ${migas(2)}
      <h2 class="ct-t-h2">Pago con tarjeta</h2>
      <div class="ct-t-pago">
        <div class="ct-t-plastico" aria-hidden="true">
          <span class="ct-t-plastico-chip"></span>
          <p class="ct-t-plastico-n dk-num">4242 4242 4242 4242</p>
          <div class="dk-entre"><span>${esc(datos.nombre.toUpperCase())}</span><span class="dk-num">12/28</span></div>
        </div>
        <div class="ct-t-campos">
          <div class="ct-t-ancho"><label class="dk-etq" for="ct-num">Número de tarjeta</label><input class="dk-campo dk-num" id="ct-num" value="4242 4242 4242 4242" readonly /></div>
          <div><label class="dk-etq" for="ct-ven">Vence</label><input class="dk-campo dk-num" id="ct-ven" value="12/28" readonly /></div>
          <div><label class="dk-etq" for="ct-cvv">Código de seguridad</label><input class="dk-campo dk-num" id="ct-cvv" value="123" readonly /></div>
          <p class="dk-nota ct-t-ancho dk-mt">Tarjeta de demostración. No se hace ningún cargo.</p>
        </div>
      </div>
      <div class="ct-t-acc">
        <button class="dk-btn" data-atras ${cobrando ? 'disabled' : ''}>Volver a la entrega</button>
        <button class="dk-btn dk-btn--pri ${cobrando ? 'dk-pulso' : ''}" data-cobrar ${cobrando ? 'disabled' : ''}>${cobrando ? 'Procesando el pago…' : `Pagar ${dinero(total())}`}</button>
      </div>
    </div>`
  }

  function htmlAvance() {
    const pasos = [
      ['Pago aprobado', `Tarjeta terminación 4242 · ${dinero(total())}`],
      [`${esc(negocio)} recibió su ${esc(v.pedido)}`, 'Llegó completo, con sus datos de entrega.'],
      ['En preparación', entrega === 'domicilio' ? `Sale a su domicilio. Llega alrededor de las ${enMin(50)}.` : `Puede pasar por él a partir de las ${enMin(25)}.`],
    ]
    return `<div class="dk-pasos">${pasos
      .map(([p, nota], k) => `<div class="dk-paso ${k < avance ? 'es-hecho' : k === avance ? 'es-ahora' : ''}"><div><p class="dk-fuerte">${p}</p>${k <= avance ? `<p class="dk-nota">${nota}</p>` : ''}</div></div>`)
      .join('')}</div>`
  }

  function htmlListo() {
    return `<div class="ct-t-flujo ct-t-listo">
      <span class="dk-listo">✓</span>
      <h2 class="ct-t-h2">Pedido confirmado</h2>
      <p class="ct-t-folio">Número de pedido <b class="dk-num">${folio}</b></p>
      <p class="dk-nota dk-mt">Gracias, ${esc(dePila(datos.nombre))}. Le enviamos el comprobante por WhatsApp al ${esc(datos.tel)}.</p>
      <div class="dk-tarjeta ct-t-avance" data-avance>${htmlAvance()}</div>
      <button class="dk-btn" data-nuevo>Seguir comprando</button>
    </div>`
  }

  function htmlLado() {
    const enCatalogo = paso === 'catalogo'
    const filas = [...carrito]
    const fila = ([n, c]) => {
      const p = prod(n)
      return `<div class="ct-t-item">
        ${arte(n)}
        <div><p class="ct-t-item-n">${esc(n)}</p><p class="dk-nota dk-num">${enCatalogo ? dinero(p.precio) : `${c} × ${dinero(p.precio)}`}</p></div>
        <div class="ct-t-item-d">${enCatalogo ? cantidad(n, c) : ''}<span class="dk-fuerte dk-num">${dinero(c * p.precio)}</span></div>
      </div>`
    }
    return `
      <div class="ct-t-lado-cab">
        <p class="dk-titulo">${paso === 'listo' ? `Pedido ${folio}` : enCatalogo ? 'Su carrito' : 'Resumen'}</p>
        ${paso === 'listo' ? `<span class="dk-chip dk-chip--ok">Pagado</span>` : `<span class="dk-chip">${piezas()} ${piezas() === 1 ? 'pieza' : 'piezas'}</span>`}
      </div>
      <div class="ct-t-lado-c" data-rueda>
        ${filas.length ? filas.map(fila).join('') : `<div class="ct-t-vacio"><p class="dk-fuerte">Su carrito está vacío</p><p class="dk-nota">Toque «Agregar» en lo que le guste. Aquí se va haciendo la cuenta.</p></div>`}
      </div>
      <div class="ct-t-lado-pie">
        <div class="dk-entre"><span>Subtotal</span><span class="dk-num">${dinero(subtotal())}</span></div>
        <div class="dk-entre"><span>${enCatalogo ? 'Envío' : entrega === 'domicilio' ? 'Envío a domicilio' : 'Recoge en el negocio'}</span><span class="dk-num ${enCatalogo ? 'dk-nota' : ''}">${enCatalogo ? 'Se elige al pagar' : envio() ? dinero(envio()) : 'Sin costo'}</span></div>
        <div class="dk-sep"></div>
        <div class="dk-entre"><span class="dk-fuerte">${paso === 'listo' ? 'Total pagado' : 'Total'}</span><span class="dk-titulo dk-num">${dinero(enCatalogo ? subtotal() : total())}</span></div>
        ${enCatalogo ? `<button class="dk-btn dk-btn--pri dk-btn--bloque dk-mt" data-pagar ${piezas() ? '' : 'disabled'}>${piezas() ? 'Ir a pagar' : 'Agregue algo para empezar'}</button>` : ''}
      </div>`
  }

  function pintarNav() {
    $nav.innerHTML = [['', 'Todo'], ...cats.map(([c]) => [c, c])]
      .map(([id, n]) => `<button data-cat="${esc(id)}" aria-current="${paso === 'catalogo' && id === cat}">${esc(n)}</button>`)
      .join('')
  }
  function pintarMain(arriba = false) {
    const y = $main.scrollTop
    $main.innerHTML = paso === 'catalogo' ? htmlCatalogo() : paso === 'entrega' ? htmlEntrega() : paso === 'listo' ? htmlListo() : htmlPago()
    $main.scrollTop = arriba ? 0 : y
  }
  function pintarLado() {
    const c = $lado.querySelector('.ct-t-lado-c')
    const y = c ? c.scrollTop : 0
    $lado.innerHTML = htmlLado()
    $lado.querySelector('.ct-t-lado-c').scrollTop = y
  }
  function ir(p) {
    paso = p
    pintarNav()
    pintarMain(true)
    pintarLado()
  }
  function vaciar() {
    t.limpia()
    carrito.clear()
    entrega = 'domicilio'
  }

  toca(el, '[data-cat]', (b) => {
    if (paso === 'cobrando') return
    if (paso === 'listo') vaciar()
    cat = b.dataset.cat
    ir('catalogo')
  })
  toca(el, '[data-mas]', (b) => {
    carrito.set(b.dataset.mas, (carrito.get(b.dataset.mas) || 0) + 1)
    pintarMain()
    pintarLado()
  })
  toca(el, '[data-menos]', (b) => {
    const n = (carrito.get(b.dataset.menos) || 0) - 1
    n > 0 ? carrito.set(b.dataset.menos, n) : carrito.delete(b.dataset.menos)
    pintarMain()
    pintarLado()
  })
  toca(el, '[data-pagar]', () => ir('entrega'))
  toca(el, '[data-volver]', () => ir('catalogo'))
  toca(el, '[data-atras]', () => ir('entrega'))
  toca(el, '[data-entrega]', (b) => {
    entrega = b.dataset.entrega
    pintarMain()
    pintarLado()
  })
  toca(el, '[data-sigue]', () => {
    if (!datos.nombre.trim()) return avisar('Escriba su nombre para continuar')
    if (!datos.tel.trim()) return avisar('Escriba un celular para avisarle')
    if (entrega === 'domicilio' && !datos.dir.trim()) return avisar('Escriba la dirección de entrega')
    ir('pago')
  })
  toca(el, '[data-cobrar]', () => {
    paso = 'cobrando'
    pintarMain()
    t.en(1500, () => {
      folio = `#${4200 + Math.floor(Math.random() * 700)}`
      avance = 1
      ir('listo')
      t.en(2600, () => {
        avance = 2
        const c = $main.querySelector('[data-avance]')
        if (c) c.innerHTML = htmlAvance()
        avisar(`${negocio} ya prepara su ${v.pedido}`)
      })
    })
  })
  toca(el, '[data-nuevo]', () => {
    vaciar()
    cat = ''
    ir('catalogo')
  })
  el.addEventListener('input', (e) => {
    const k = e.target.dataset?.dato
    if (k) datos[k] = e.target.value
  })

  ir('catalogo')
  return { destruir: () => t.limpia() }
}

// ───────────────────────── Catálogo con pedido por WhatsApp (teléfono) ─────────────────────────

function whatsapp(el, { negocio, m, v }) {
  const t = relojes()
  const cats = porGrupo(m.productos, 'categoria')
  const carrito = new Map()
  let nombre = persona(m)

  el.innerHTML = `${ESTILOS}<div class="ct-vista"></div>`
  const $v = el.querySelector('.ct-vista')

  const prod = (n) => m.productos.find((p) => p.nombre === n)
  const piezas = () => [...carrito.values()].reduce((s, c) => s + c, 0)
  const total = () => [...carrito].reduce((s, [n, c]) => s + c * prod(n).precio, 0)

  function catalogo() {
    const y = $v.querySelector('.dk-cuerpo')?.scrollTop || 0
    $v.innerHTML = `
      <header class="dk-barra dk-barra--acento">
        <div class="dk-crece"><p class="dk-barra-t">${esc(negocio)}</p><p class="dk-barra-s">Catálogo · elija y envíe su ${esc(v.pedido)}</p></div>
      </header>
      <div class="dk-cuerpo" data-rueda>
        ${cats
          .map(
            ([c, lista]) => `<p class="dk-sub">${esc(c)}</p>
            <div class="dk-lista">
              ${lista
                .map((p) => {
                  const n = carrito.get(p.nombre) || 0
                  return `<div class="dk-fila">
                    ${arte(p.nombre, 'dk-mosaico')}
                    <div class="dk-crece"><p class="dk-fila-t">${esc(p.nombre)}</p><p class="dk-fila-s dk-num">${dinero(p.precio)}</p></div>
                    ${n ? cantidad(p.nombre, n) : `<button class="dk-ico-btn dk-ico-btn--pri" data-mas="${esc(p.nombre)}" aria-label="Agregar ${esc(p.nombre)}">+</button>`}
                  </div>`
                })
                .join('')}
            </div>`,
          )
          .join('')}
        <p class="dk-nota dk-mt" style="text-align:center">Los precios incluyen impuestos.</p>
      </div>
      <footer class="dk-pie">
        <div class="ct-w-nombre"><label for="ct-w-nom">A nombre de</label><input class="dk-campo" id="ct-w-nom" autocomplete="off" value="${esc(nombre)}" /></div>
        <button class="dk-btn dk-btn--bloque ct-w-btn" data-enviar ${piezas() ? '' : 'disabled'}>
          <span class="ct-w-globo" aria-hidden="true"></span>${piezas() ? `Enviar ${esc(v.pedido)} por WhatsApp · ${dinero(total())}` : `Elija lo que quiere pedir`}
        </button>
      </footer>`
    $v.querySelector('.dk-cuerpo').scrollTop = y
  }

  // La conversación: el mensaje sale armado y el negocio responde.
  function conversacion() {
    const quien = nombre.trim() || persona(m)
    const cuanto = total()
    const lineas = [...carrito].map(([n, c]) => `<span class="ct-w-linea"><span>${c} × ${esc(n)}</span><span>${dinero(c * prod(n).precio)}</span></span>`).join('')
    $v.innerHTML = `
      <header class="ct-w-cab">
        <button class="ct-w-atras" data-otro aria-label="Volver al catálogo"></button>
        <span class="dk-avatar dk-avatar--ch">${esc(iniciales(negocio))}</span>
        <div class="dk-crece"><p class="dk-barra-t">${esc(negocio)}</p><p class="dk-barra-s">en línea</p></div>
      </header>
      <div class="dk-cuerpo ct-w-fondo" data-rueda><div class="dk-chat"><span class="ct-w-dia">Hoy</span></div></div>
      <footer class="dk-pie">
        <p class="dk-nota" data-nota>Así llega al WhatsApp de ${esc(negocio)}: legible, completo y con la cuenta hecha.</p>
        <div data-acc></div>
      </footer>`
    const $c = $v.querySelector('.dk-cuerpo')
    const $chat = $v.querySelector('.dk-chat')
    const $acc = $v.querySelector('[data-acc]')
    const baja = () => ($c.scrollTop = $c.scrollHeight)
    const burbuja = (html, yo) => {
      const d = document.createElement('div')
      d.className = `dk-burbuja ${yo ? 'dk-burbuja--yo' : ''}`
      d.innerHTML = `${html}<small>${hora()}${yo ? '<span class="ct-w-palomas">✓✓</span>' : ''}</small>`
      $chat.appendChild(d)
      baja()
    }
    const responde = (ms, html, luego) => {
      const e = document.createElement('div')
      e.className = 'dk-burbuja'
      e.innerHTML = `<span class="ct-w-escribe" aria-label="Escribiendo"><i></i><i></i><i></i></span>`
      t.en(ms, () => {
        $chat.appendChild(e)
        baja()
      })
      t.en(ms + 1500, () => {
        e.remove()
        burbuja(html)
        luego?.()
      })
    }
    const otro = `<button class="dk-btn dk-btn--bloque dk-mt" data-otro>Armar otro ${esc(v.pedido)}</button>`

    burbuja(
      `<div class="ct-w-msj">
        <p>Hola, quiero hacer este ${esc(v.pedido)}:</p>
        <p>${lineas}</p>
        <p><b>Total: ${dinero(cuanto)}</b></p>
        <p>A nombre de: ${esc(quien)}</p>
      </div>`,
      true,
    )
    responde(1300, `Recibido, ${esc(dePila(quien))}. Son ${dinero(cuanto)}. ¿Pasa a recogerlo o se lo enviamos?`, () => {
      $acc.innerHTML = `<div class="ct-w-resp"><button class="dk-btn dk-btn--chico" data-resp="recoger">Paso a recogerlo</button><button class="dk-btn dk-btn--chico" data-resp="domicilio">A domicilio</button></div>`
    })
    $acc.addEventListener('click', (e) => {
      const b = e.target.closest('[data-resp]')
      if (!b) return
      const recoge = b.dataset.resp === 'recoger'
      $acc.innerHTML = ''
      burbuja(recoge ? 'Paso a recogerlo.' : 'A domicilio, por favor.', true)
      responde(700, recoge ? `Perfecto. Lo tiene listo a las ${enMin(25)}.` : `Perfecto. Sale hoy mismo; le avisamos por aquí cuando vaya en camino.`, () => {
        $acc.innerHTML = otro
      })
    })
  }

  toca($v, '[data-mas]', (b) => {
    carrito.set(b.dataset.mas, (carrito.get(b.dataset.mas) || 0) + 1)
    catalogo()
  })
  toca($v, '[data-menos]', (b) => {
    const n = (carrito.get(b.dataset.menos) || 0) - 1
    n > 0 ? carrito.set(b.dataset.menos, n) : carrito.delete(b.dataset.menos)
    catalogo()
  })
  toca($v, '[data-enviar]', conversacion)
  toca($v, '[data-otro]', () => {
    t.limpia()
    carrito.clear()
    catalogo()
  })
  $v.addEventListener('input', (e) => {
    if (e.target.id === 'ct-w-nom') nombre = e.target.value
  })

  catalogo()
  return { destruir: () => t.limpia() }
}

// ───────────────────────── Menú digital (teléfono) ─────────────────────────

function menu(el, { negocio, nicho, m, avisar }) {
  const t = relojes()
  const carta = nicho?.familia === 'comida' ? 'menú' : 'catálogo'
  const Carta = carta.charAt(0).toUpperCase() + carta.slice(1)
  const items = m.productos.map((p, i) => ({ ...p, agotado: i === 4, antes: null }))
  const cats = porGrupo(items, 'categoria')
  const cambios = new Set() // lo que cambió desde la última vez que se vio como cliente
  let modo = 'cliente'
  let editando = null
  let sello = hora(new Date(Date.now() - 95 * 60000))
  let vistas = 38

  el.innerHTML = `${ESTILOS}
    <div class="ct-m-top"><div class="ct-seg" role="tablist" aria-label="Quién lo ve">
      <button role="tab" data-modo="cliente">Cliente</button><button role="tab" data-modo="negocio">Negocio</button>
    </div></div>
    <div class="ct-vista"></div>`
  const $v = el.querySelector('.ct-vista')
  const item = (n) => items.find((x) => x.nombre === n)

  function htmlCliente() {
    return `
      <div class="dk-cuerpo ct-m-carta" data-rueda>
        <header class="ct-m-cab">
          <span class="ct-m-logo">${esc(iniciales(negocio))}</span>
          <h1 class="ct-m-nombre">${esc(negocio)}</h1>
          <p class="dk-nota">${Carta} · actualizado hoy a las ${sello}</p>
        </header>
        <nav class="ct-m-cats" aria-label="Categorías">${cats.map(([c], i) => `<button data-salta="${i}">${esc(c)}</button>`).join('')}</nav>
        ${cats
          .map(
            ([c, lista], i) => `<section class="ct-m-sec" data-sec="${i}">
              <h2 class="ct-m-cat">${esc(c)}</h2>
              ${lista
                .map(
                  (p) => `<div class="ct-m-item ${p.agotado ? 'es-agotado' : ''} ${cambios.has(p.nombre) ? 'es-nuevo' : ''}">
                    <span class="ct-m-n">${esc(p.nombre)}</span><i></i>
                    ${p.agotado ? `<span class="dk-chip dk-chip--mal">Agotado</span>` : `<span class="ct-m-p dk-num">${dinero(p.precio)}</span>`}
                  </div>`,
                )
                .join('')}
            </section>`,
          )
          .join('')}
        <p class="dk-nota ct-m-pie">Precios en pesos, con impuestos incluidos.</p>
      </div>`
  }

  const htmlPrecio = (p) =>
    editando === p.nombre
      ? `<span class="ct-m-edita">$<input class="ct-m-campo dk-num" type="number" inputmode="numeric" min="1" step="1" value="${p.precio}" data-campo aria-label="Precio de ${esc(p.nombre)}" /></span>`
      : `<button class="ct-m-precio dk-num" data-precio="${esc(p.nombre)}" aria-label="Cambiar precio de ${esc(p.nombre)}">${dinero(p.precio)}${p.antes != null ? `<span class="ct-m-antes">${dinero(p.antes)}</span>` : `<small>Cambiar</small>`}</button>`

  function htmlNegocio() {
    return `
      <header class="dk-barra">
        <div class="dk-crece"><p class="dk-barra-t">Editar ${carta}</p><p class="dk-barra-s">Hoy lo han abierto <span data-vistas>${vistas}</span> veces</p></div>
        <span class="dk-chip dk-chip--ok">Publicado</span>
      </header>
      <div class="dk-cuerpo" data-rueda>
        ${cats
          .map(
            ([c, lista]) => `<p class="dk-sub">${esc(c)}</p>
            <div class="dk-lista">
              ${lista
                .map(
                  (p) => `<div class="ct-m-fila ${p.agotado ? 'es-agotado' : ''}">
                    <p class="dk-fila-t">${esc(p.nombre)}</p>
                    ${htmlPrecio(p)}
                    <span class="ct-m-sw">Agotado<button class="ct-sw" role="switch" aria-checked="${p.agotado}" data-agotar="${esc(p.nombre)}" aria-label="Marcar ${esc(p.nombre)} como agotado"></button></span>
                  </div>`,
                )
                .join('')}
            </div>`,
          )
          .join('')}
      </div>
      <footer class="dk-pie"><p class="dk-nota" style="text-align:center">Se actualiza al momento. No hay que reimprimir.</p></footer>`
  }

  function pintar(conserva = true) {
    const y = conserva ? $v.querySelector('.dk-cuerpo')?.scrollTop || 0 : 0
    el.querySelectorAll('[data-modo]').forEach((b) => b.setAttribute('aria-selected', b.dataset.modo === modo))
    $v.innerHTML = modo === 'cliente' ? htmlCliente() : htmlNegocio()
    $v.querySelector('.dk-cuerpo').scrollTop = y
    if (modo === 'cliente') {
      // Lo que cambió queda a la vista al volver.
      const c = $v.querySelector('.dk-cuerpo')
      const n = $v.querySelector('.es-nuevo')
      if (n) c.scrollTop = n.offsetTop - c.clientHeight / 2
      cambios.clear()
    }
    const campo = $v.querySelector('[data-campo]')
    if (campo) {
      campo.focus()
      campo.select()
    }
  }

  // Cierra el campo de precio. Solo se cambia esa pieza: el resto de la lista sigue en su lugar.
  function guardar(campo, aplica = true) {
    const p = item(editando)
    if (!p) return
    editando = null
    const val = Math.round(Number(campo.value))
    if (aplica && isFinite(val) && val > 0 && val !== p.precio) {
      if (p.antes == null) p.antes = p.precio
      p.precio = val
      if (p.antes === val) p.antes = null
      cambios.add(p.nombre)
      sello = hora()
      avisar(`Precio actualizado. Ya se ve en el ${carta}.`)
    }
    campo.closest('.ct-m-edita').outerHTML = htmlPrecio(p)
  }

  toca(el, '[data-modo]', (b) => {
    if (b.dataset.modo === modo) return
    editando = null
    modo = b.dataset.modo
    pintar(false)
  })
  toca($v, '[data-salta]', (b) => {
    const c = $v.querySelector('.dk-cuerpo')
    const s = $v.querySelector(`[data-sec="${b.dataset.salta}"]`)
    if (c && s) c.scrollTo({ top: s.offsetTop - 44, behavior: 'smooth' })
  })
  toca($v, '[data-precio]', (b) => {
    editando = b.dataset.precio
    pintar()
  })
  toca($v, '[data-agotar]', (b) => {
    const p = item(b.dataset.agotar)
    if (!p) return
    p.agotado = !p.agotado
    cambios.add(p.nombre)
    sello = hora()
    pintar()
    avisar(p.agotado ? `${p.nombre}: agotado. Ya se ve en el ${carta}.` : `${p.nombre}: disponible otra vez.`)
  })
  $v.addEventListener('keydown', (e) => {
    if (!e.target.matches?.('[data-campo]')) return
    if (e.key === 'Enter') guardar(e.target)
    else if (e.key === 'Escape') guardar(e.target, false)
  })
  $v.addEventListener('focusout', (e) => {
    if (e.target.matches?.('[data-campo]') && editando) guardar(e.target)
  })

  // El contador de visitas avanza: el menú se sigue abriendo mientras tanto.
  t.cada(7000, () => {
    vistas += 1
    const n = $v.querySelector('[data-vistas]')
    if (n) n.textContent = vistas
  })

  pintar()
  return { destruir: () => t.limpia() }
}
