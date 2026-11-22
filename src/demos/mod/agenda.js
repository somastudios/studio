import { esc, dinero, toca, hoja, relojes, hora, iniciales, tono, cuenta } from '../kit.js'
import { fecha, sumaDias, mayus } from '../../app/util.js'

// Agenda.
//   reservar   — teléfono del cliente: elige qué, con quién, día y hora; deja sus datos y queda apartado.
//   anticipo   — lo mismo, pero para apartar deja un anticipo con tarjeta (simulada).
//   calendario — tableta del negocio: el día por persona; se agenda, se marca la llegada, se mueve o se cancela.
//   espera     — tableta del negocio: alguien cancela y el hueco se ofrece solo a la lista de espera.

export default {
  id: 'agenda',
  nombre: 'Agenda',
  vistas: {
    reservar: { titulo: 'Así aparta su cliente', dispositivo: 'telefono' },
    calendario: { titulo: 'La agenda del equipo', dispositivo: 'tableta' },
    espera: { titulo: 'El hueco se llena solo', dispositivo: 'tableta' },
    anticipo: { titulo: 'Apartar con anticipo', dispositivo: 'telefono' },
  },
  montar(el, ctx) {
    if (ctx.vista === 'calendario') return calendario(el, ctx)
    if (ctx.vista === 'espera') return espera(el, ctx)
    return reserva(el, ctx, ctx.vista === 'anticipo')
  },
}

// ───────────────────────── Común ─────────────────────────

const TRATO = /^(Sra?\.|Don|Doña|Ing\.|Lic\.|Dra?\.|Familia)\s/i
const OTROS = ['Mónica Garza', 'Sr. Treviño', 'Daniela Ríos', 'Familia Cantú', 'Óscar Leal', 'Brenda Salinas', 'Sra. Villarreal', 'Iván Cavazos', 'Rebeca Luna', 'Don Arturo']
const SEM = new Intl.DateTimeFormat('es-MX', { weekday: 'short' })

const sem = (d) => SEM.format(d).replace(/\./g, '')
const sinArt = (s) => String(s).replace(/^(el|la|los|las)\s+/i, '')
/** Minutos desde medianoche → "2:30 p. m." */
const aHora = (min) => hora(new Date(2026, 0, 1, Math.floor(min / 60), min % 60))
const dura = (min) => (min < 60 ? `${min} min` : min % 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min / 60} h`)
const costo = (s) => (s.precio > 0 ? dinero(s.precio) : 'Sin costo')
/** Donde se come se reserva de la una en adelante; lo demás abre a las nueve. */
const abreA = (nicho) => (nicho?.familia === 'comida' ? 13 : 9) * 60
const celBonito = (s) => {
  const d = String(s).replace(/\D/g, '').slice(0, 10)
  return [d.slice(0, 2), d.slice(2, 6), d.slice(6)].filter(Boolean).join(' ')
}
const nombreDePila = (n) => String(n).replace(TRATO, '').split(/\s+/)[0]
/** Dos letras para el mosaico: "Mesa para cuatro" → "MC". */
const sigla = (n) => {
  const p = String(n).replace(/\(.*?\)/g, '').split(/\s+/).filter((x) => x && !/^(para|de|del|con|y|a|el|la|los|las|en|por)$/i.test(x))
  return ((p[0]?.charAt(0) || '') + (p.length > 1 ? p[p.length - 1].charAt(0) : '')).toUpperCase()
}

const ESTILO = `<style>
.ag-app{flex:1;min-height:0;display:flex;flex-direction:column}
.ag-app .dk-btn--pri,.ag-hoja .dk-btn--pri,.ag-app .dk-btn--oscuro,.ag-hoja .dk-btn--oscuro{color:#fff}
.ag-hoja .dk-btn--suave,.ag-app .dk-btn--suave{color:var(--dk-acento)}
.ag-peligro{color:var(--dk-mal)!important}
.ag-atras{flex:none;display:grid;place-items:center;width:34px;height:34px;margin-left:-6px;border-radius:50%;background:rgb(255 255 255/.18);font-size:22px;line-height:1;padding-bottom:3px}
.ag-prog{flex:none;padding:12px 16px 10px;background:var(--dk-sup);border-bottom:1px solid var(--dk-linea)}
.ag-prog p{margin-top:7px}
.ag-flecha{flex:none;color:var(--dk-tx3);font-size:20px;line-height:1}
.ag-dias{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}
.ag-dia{display:flex;flex-direction:column;align-items:center;gap:1px;padding:8px 0 7px;border-radius:12px;border:1px solid var(--dk-linea);background:var(--dk-sup);transition:background .2s,color .2s}
.ag-dia small{font-size:10.5px;font-weight:600;color:var(--dk-tx2);text-transform:capitalize}
.ag-dia b{font-size:16px;font-weight:700;font-variant-numeric:tabular-nums}
.ag-dia[aria-pressed=true]{background:var(--dk-acento);border-color:var(--dk-acento);color:#fff}
.ag-dia[aria-pressed=true] small{color:rgb(255 255 255/.8)}
.ag-horas{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
.ag-hr{min-height:42px;border-radius:11px;border:1px solid var(--dk-linea);background:var(--dk-sup);font-weight:600;font-size:13px;font-variant-numeric:tabular-nums;text-align:center;transition:background .2s,color .2s,transform .12s}
.ag-hr:active{transform:scale(.96)}
.ag-hr[aria-pressed=true]{background:var(--dk-acento);border-color:var(--dk-acento);color:#fff}
.ag-hr:disabled{background:transparent;color:var(--dk-tx3);text-decoration:line-through;pointer-events:none}
.ag-hr.es-recien{animation:ag-toma .9s ease both}
@keyframes ag-toma{0%{background:var(--dk-alerta-f);color:var(--dk-alerta)}}
.ag-leyenda{display:flex;gap:14px;margin-top:10px;font-size:11.5px;color:var(--dk-tx2)}
.ag-leyenda i{display:inline-block;width:10px;height:10px;margin-right:5px;border-radius:3px;border:1px solid var(--dk-linea);background:var(--dk-sup);vertical-align:-1px}
.ag-leyenda i.es-no{background:var(--dk-linea)}
.ag-dato{display:flex;justify-content:space-between;gap:12px;padding:7px 0;font-size:13.5px}
.ag-dato span:first-child{flex:none;color:var(--dk-tx2)}
.ag-dato span:last-child{font-weight:600;text-align:right}
.ag-dato + .ag-dato{border-top:1px solid var(--dk-linea)}
.ag-err{margin-top:5px;font-size:12px;color:var(--dk-mal)}
.ag-monto{font-weight:750;font-size:34px;letter-spacing:-.02em;line-height:1.1;font-variant-numeric:tabular-nums}
.ag-plastico{margin-top:12px;padding:14px;border-radius:14px;background:var(--dk-fondo);border:1px dashed var(--dk-tx3)}
.ag-par{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.ag-sms{margin-top:12px;padding:12px 14px;border-radius:var(--dk-r);background:var(--dk-sup);border:1px solid var(--dk-linea);text-align:left}
.ag-sms .dk-burbuja{max-width:100%;margin-top:8px;font-size:13px}

.ag-cal{flex:1;min-height:0;display:flex;flex-direction:column;margin:0 16px 14px;background:var(--dk-sup);border:1px solid var(--dk-linea);border-radius:var(--dk-r);overflow:hidden}
.ag-cal-cab,.ag-cal-rej{display:grid;grid-template-columns:78px repeat(var(--n),minmax(0,1fr))}
.ag-cal-cab{flex:none;border-bottom:1px solid var(--dk-linea)}
.ag-cal-per{display:flex;align-items:center;gap:9px;min-width:0;padding:9px 10px;border-left:1px solid var(--dk-linea)}
.ag-cal-per p{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ag-cal-cuerpo{position:relative;flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;scrollbar-width:none}
.ag-cal-cuerpo::-webkit-scrollbar{display:none}
.ag-eje > div{height:34px;padding:3px 9px 0 0;text-align:right;font-size:10.5px;font-weight:600;color:var(--dk-tx2);font-variant-numeric:tabular-nums;white-space:nowrap}
.ag-eje > div.es-media{color:transparent}
.ag-colp{display:flex;flex-direction:column;min-width:0;border-left:1px solid var(--dk-linea)}
.ag-libre{position:relative;flex:none;height:34px;border-bottom:1px dashed var(--dk-linea);transition:background .15s}
.ag-libre.es-hora{border-bottom-style:solid}
.ag-libre::after{content:'+';position:absolute;inset:0;display:grid;place-items:center;font-size:17px;font-weight:600;color:var(--dk-acento);opacity:0;transition:opacity .15s}
.ag-libre:hover::after,.ag-libre:focus-visible::after{opacity:.75}
.ag-libre:hover{background:var(--dk-acento-f)}
.ag-libre.es-pasado{background:rgb(0 0 0/.025)}
.ag-libre.es-pasado::after,.ag-libre.es-corto::after{display:none}
.ag-libre.es-pasado:hover{background:rgb(0 0 0/.025)}
.ag-libre.es-corto{background:repeating-linear-gradient(135deg,transparent 0 6px,rgb(0 0 0/.045) 6px 7px)}
.ag-libre.es-destino{background:var(--dk-acento-f);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--dk-acento) 35%,transparent)}
.ag-libre.es-destino::after{opacity:.75}
.ag-blo{flex:none;height:calc(34px*var(--s));padding:2px 3px;text-align:left;min-width:0}
.ag-blo-i{display:block;height:100%;padding:4px 8px;border-radius:8px;border-left:3px solid var(--dk-acento);background:var(--dk-acento-f);overflow:hidden;transition:transform .12s,opacity .2s}
.ag-blo:active .ag-blo-i{transform:scale(.98)}
.ag-blo-i b,.ag-blo-i span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ag-blo-i b{font-size:12.5px;font-weight:700;line-height:1.3}
.ag-blo-i span{font-size:11px;color:var(--dk-tx2);line-height:1.3}
.ag-blo[data-s="1"] .ag-blo-i{display:flex;align-items:center;gap:6px;padding-top:0;padding-bottom:0}
.ag-blo[data-s="1"] .ag-blo-i b{flex:none;max-width:60%}
.ag-blo.es-llego .ag-blo-i{border-left-color:var(--dk-ok);background:var(--dk-ok-f)}
.ag-blo.es-atendida .ag-blo-i{border-left-color:var(--dk-tx3);background:var(--dk-fondo)}
.ag-blo.es-atendida .ag-blo-i b{color:var(--dk-tx2)}
.ag-blo.es-moviendo .ag-blo-i{opacity:.4;border-left-style:dashed}
.ag-blo.es-nueva .ag-blo-i{animation:ag-entra 1.6s ease both}
@keyframes ag-entra{0%{opacity:0;transform:scale(.9)}25%{opacity:1;transform:none;box-shadow:0 0 0 3px var(--dk-acento)}100%{box-shadow:0 0 0 0 transparent}}
.ag-ahora{position:absolute;left:70px;right:0;top:calc(34px*var(--y));border-top:2px solid var(--dk-mal);pointer-events:none;z-index:2}
.ag-ahora::before{content:'';position:absolute;left:0;top:-5px;width:8px;height:8px;border-radius:50%;background:var(--dk-mal)}
.ag-ops{display:flex;flex-wrap:wrap;gap:7px}
.ag-op{display:inline-flex;align-items:center;gap:6px;min-height:38px;padding:0 13px;border-radius:999px;border:1px solid var(--dk-linea);background:var(--dk-sup);font-weight:600;font-size:13px;transition:background .2s,color .2s}
.ag-op small{font-weight:500;font-size:11.5px;opacity:.7}
.ag-op[aria-pressed=true]{background:var(--dk-tx);border-color:var(--dk-tx);color:#fff}
.ag-op:disabled{opacity:.4;pointer-events:none}

.ag-esp{grid-template-columns:minmax(0,1.2fr) minmax(0,1fr)}
.ag-turno{display:flex;align-items:center;gap:12px;min-height:58px;padding:9px 14px;transition:background .4s}
.ag-turno + .ag-turno{border-top:1px solid var(--dk-linea)}
.ag-turno-h{flex:none;width:76px;font-weight:700;font-size:13px;font-variant-numeric:tabular-nums}
.ag-turno.es-pasado{opacity:.5}
.ag-turno.es-hueco,.ag-turno.es-ofreciendo{background:var(--dk-alerta-f)}
.ag-turno.es-hueco .dk-fila-t,.ag-turno.es-ofreciendo .dk-fila-t{color:var(--dk-alerta)}
.ag-turno.es-recuperado{animation:ag-llena 2.4s ease both}
@keyframes ag-llena{0%,35%{background:var(--dk-ok-f)}}
.ag-enespera{position:relative;display:flex;gap:11px;padding:12px;border-radius:var(--dk-r);border:1px solid var(--dk-linea);background:var(--dk-sup);transition:border-color .3s,box-shadow .3s,opacity .3s}
.ag-enespera + .ag-enespera{margin-top:8px}
.ag-enespera.es-oferta{border-color:var(--dk-acento);box-shadow:0 0 0 3px var(--dk-acento-f)}
.ag-enespera.es-sin{opacity:.55}
.ag-lugar{flex:none;display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--dk-fondo);font-weight:700;font-size:12px;font-variant-numeric:tabular-nums}
.ag-enespera .dk-chat{margin-top:9px}
.ag-enespera .dk-burbuja{max-width:94%;font-size:13px}
</style>`

// ───────────────────────── Teléfono: apartar (con o sin anticipo) ─────────────────────────

function reserva(el, { negocio, nicho, m, v, avisar }, conAnticipo) {
  const t = relojes()
  el.innerHTML = `${ESTILO}<div class="ag-app"></div>`
  const app = el.querySelector('.ag-app')

  const abre = abreA(nicho)
  const dias = Array.from({ length: 7 }, (_, i) => sumaDias(new Date(), i))
  const ejemplo = m.clientes.find((c) => !TRATO.test(c)) || 'Paola Méndez'
  const PASOS = ['Qué necesita', 'Con quién', 'Día y hora', 'Sus datos', ...(conAnticipo ? ['Anticipo'] : [])]
  const tomadas = new Set() // horas que alguien más apartó mientras se elige: "dia-min"
  let recien = null
  let st

  const nuevo = () => ({ paso: 0, serv: null, quien: null, dia: 2, min: null, nombre: ejemplo, cel: '81 5550 0142', error: '', pagando: false, hecho: false, mensaje: false, folio: 2400 + Math.floor(Math.random() * 500) })
  const serv = () => m.servicios[st.serv]
  const anticipo = () => (serv().precio > 0 ? Math.max(50, Math.round((serv().precio * 0.3) / 10) * 10) : 100)
  const cuando = () => `${st.dia === 0 ? 'hoy' : st.dia === 1 ? 'mañana' : fecha(dias[st.dia], 'media')}, ${aHora(st.min)}`
  const atiende = () => m.personal[st.quien ?? (st.dia + st.min / 30) % m.personal.length]

  const horasDe = () => {
    const fin = abre + 9 * 60 - Math.min(serv().minutos, 120)
    const lista = []
    for (let x = abre; x <= fin; x += 30) lista.push(x)
    return lista
  }
  const ocupada = (min) => {
    if (tomadas.has(`${st.dia}-${min}`)) return true
    const k = (min - abre) / 30
    if (st.dia === 0 && k < 5) return true // hoy: lo que ya pasó
    const h = (st.dia * 7 + k * 13 + (st.quien == null ? 4 : st.quien * 5 + 1) * 3) % 10
    return st.quien == null ? h < 2 : h < 4
  }

  const barra = (sub) => `
    <header class="dk-barra dk-barra--acento">
      ${st.paso > 0 && !st.hecho ? `<button class="ag-atras" data-atras aria-label="Volver al paso anterior">‹</button>` : ''}
      <div class="dk-crece"><p class="dk-barra-t">${esc(negocio)}</p><p class="dk-barra-s">${sub}</p></div>
    </header>`

  const resumen = () => `
    <div class="dk-tarjeta">
      <div class="ag-dato"><span>Qué</span><span>${esc(serv().nombre)}</span></div>
      <div class="ag-dato"><span>Cuándo</span><span>${esc(mayus(cuando()))}</span></div>
      <div class="ag-dato"><span>Con quién</span><span>${esc(atiende())}</span></div>
      <div class="ag-dato"><span>Duración</span><span>${dura(serv().minutos)}</span></div>
      ${serv().precio > 0 ? `<div class="ag-dato"><span>Precio</span><span class="dk-num">${dinero(serv().precio)}</span></div>` : ''}
    </div>`

  function pintar(mismoPaso = false) {
    const sc = mismoPaso ? app.querySelector('.dk-cuerpo')?.scrollTop : 0
    if (st.hecho) return listo()
    let cuerpo = ''
    let pie = ''

    if (st.paso === 0) {
      cuerpo = `
        <p class="dk-titulo">¿Qué necesita?</p>
        <p class="dk-nota" style="margin:4px 0 12px">Aparte su ${esc(v.cita)} en un minuto, a cualquier hora.</p>
        <div class="dk-lista">
          ${m.servicios
            .map(
              (s, i) => `<button class="dk-fila" data-serv="${i}">
                <span class="dk-mosaico" style="background:${tono(s.nombre)};color:#333">${esc(sigla(s.nombre))}</span>
                <div class="dk-crece"><p class="dk-fila-t">${esc(s.nombre)}</p><p class="dk-fila-s dk-num">${dura(s.minutos)} · ${costo(s)}</p></div>
                <span class="ag-flecha" aria-hidden="true">›</span>
              </button>`,
            )
            .join('')}
        </div>
        ${conAnticipo ? `<p class="dk-nota dk-mt" style="text-align:center">Para apartar se deja un anticipo. Se descuenta de su cuenta.</p>` : ''}`
    } else if (st.paso === 1) {
      cuerpo = `
        <p class="dk-titulo">¿Con quién prefiere?</p>
        <p class="dk-nota" style="margin:4px 0 12px">${esc(serv().nombre)} · ${dura(serv().minutos)}</p>
        <div class="dk-lista">
          <button class="dk-fila" data-quien="x">
            <span class="dk-avatar">✓</span>
            <div class="dk-crece"><p class="dk-fila-t">Quien esté disponible</p><p class="dk-fila-s">Se muestran más horarios</p></div>
            <span class="ag-flecha" aria-hidden="true">›</span>
          </button>
          ${m.personal
            .map(
              (p, i) => `<button class="dk-fila" data-quien="${i}">
                <span class="dk-avatar" style="background:${tono(p)};color:#333">${esc(iniciales(p))}</span>
                <div class="dk-crece"><p class="dk-fila-t">${esc(p)}</p><p class="dk-fila-s">${i % 3 === 1 ? 'Primer espacio: mañana' : 'Tiene espacio hoy'}</p></div>
                <span class="ag-flecha" aria-hidden="true">›</span>
              </button>`,
            )
            .join('')}
        </div>`
    } else if (st.paso === 2) {
      const horas = horasDe()
      const libres = horas.filter((x) => !ocupada(x)).length
      cuerpo = `
        <p class="dk-titulo">¿Qué día le queda?</p>
        <div class="ag-dias dk-mt">
          ${dias.map((d, i) => `<button class="ag-dia" data-dia="${i}" aria-pressed="${i === st.dia}"><small>${i === 0 ? 'hoy' : esc(sem(d))}</small><b>${d.getDate()}</b></button>`).join('')}
        </div>
        <div class="dk-entre" style="margin:18px 0 8px"><p class="dk-sub" style="margin:0">${esc(fecha(dias[st.dia], 'larga'))}</p><span class="dk-chip">${libres} ${libres === 1 ? 'libre' : 'libres'}</span></div>
        <div class="ag-horas">
          ${horas.map((x) => `<button class="ag-hr ${recien === `${st.dia}-${x}` ? 'es-recien' : ''}" data-min="${x}" aria-pressed="${x === st.min}" ${ocupada(x) ? 'disabled' : ''}>${aHora(x)}</button>`).join('')}
        </div>
        <div class="ag-leyenda"><span><i></i>Libre</span><span><i class="es-no"></i>Ocupado</span><span>Con ${esc(st.quien == null ? 'quien esté disponible' : m.personal[st.quien])}</span></div>`
      pie = `<button class="dk-btn dk-btn--pri dk-btn--bloque" data-sigue ${st.min == null ? 'disabled' : ''}>${st.min == null ? 'Elija una hora' : `Continuar · ${esc(cuando())}`}</button>`
    } else if (st.paso === 3) {
      cuerpo = `
        <p class="dk-titulo">¿A nombre de quién?</p>
        <p class="dk-nota" style="margin:4px 0 12px">Solo lo usamos para confirmarle y recordarle su ${esc(v.cita)}.</p>
        ${resumen()}
        <label class="dk-etq" for="ag-nombre">Nombre</label>
        <input class="dk-campo" id="ag-nombre" autocomplete="off" placeholder="Nombre y apellido" value="${esc(st.nombre)}" />
        <label class="dk-etq" for="ag-cel">Celular</label>
        <input class="dk-campo dk-num" id="ag-cel" inputmode="numeric" autocomplete="off" placeholder="10 dígitos" value="${esc(st.cel)}" />
        ${st.error ? `<p class="ag-err" role="alert">${esc(st.error)}</p>` : ''}`
      pie = `<button class="dk-btn dk-btn--pri dk-btn--bloque" data-datos>${conAnticipo ? 'Continuar al anticipo' : `Apartar ${esc(v.cita)}`}</button>`
    } else {
      cuerpo = `
        <div class="dk-tarjeta">
          <p class="dk-nota">Anticipo para apartar</p>
          <p class="ag-monto">${dinero(anticipo())}</p>
          <p class="dk-nota" style="margin-top:6px">${esc(serv().nombre)} · ${esc(cuando())}</p>
          <div class="dk-sep"></div>
          <p class="dk-nota">Se descuenta de su cuenta el día de su visita. Si avisa con un día de anticipación, puede cambiar la fecha sin perderlo.</p>
        </div>
        <div class="ag-plastico">
          <div class="dk-entre"><p class="dk-fuerte">Pago con tarjeta</p><span class="dk-chip dk-chip--alerta">Demostración</span></div>
          <p class="dk-nota" style="margin-top:4px">Datos de ejemplo. No se hace ningún cargo.</p>
          <label class="dk-etq" for="ag-tarjeta">Número de tarjeta</label>
          <input class="dk-campo dk-num" id="ag-tarjeta" inputmode="numeric" value="4242 4242 4242 4242" />
          <div class="ag-par">
            <div><label class="dk-etq" for="ag-vence">Vence</label><input class="dk-campo dk-num" id="ag-vence" value="12/28" /></div>
            <div><label class="dk-etq" for="ag-cvv">Código</label><input class="dk-campo dk-num" id="ag-cvv" inputmode="numeric" value="123" /></div>
          </div>
          <label class="dk-etq" for="ag-titular">Nombre en la tarjeta</label>
          <input class="dk-campo" id="ag-titular" value="${esc(st.nombre)}" />
        </div>`
      pie = `<button class="dk-btn dk-btn--pri dk-btn--bloque ${st.pagando ? 'dk-pulso' : ''}" data-pagar ${st.pagando ? 'disabled' : ''}>${st.pagando ? 'Procesando el pago' : `Pagar anticipo de ${dinero(anticipo())}`}</button>`
    }

    app.innerHTML = `
      ${barra(conAnticipo ? `Aparte su ${esc(v.cita)} con anticipo` : `Aparte su ${esc(v.cita)}`)}
      <div class="ag-prog">
        <div class="dk-avance" style="--p:${((st.paso + 1) / PASOS.length) * 100}%"><i></i></div>
        <p class="dk-nota">Paso ${st.paso + 1} de ${PASOS.length} · ${PASOS[st.paso]}</p>
      </div>
      <div class="dk-cuerpo" data-rueda>${cuerpo}</div>
      ${pie ? `<footer class="dk-pie">${pie}</footer>` : ''}`
    if (sc) app.querySelector('.dk-cuerpo').scrollTop = sc
  }

  // Confirmación: resumen, recordatorio y el mensaje que le llega.
  function listo() {
    const debe = serv().precio > 0 ? Math.max(0, serv().precio - anticipo()) : null
    const texto = `${negocio}: su ${v.cita} quedó para ${cuando()}, con ${atiende()}.${conAnticipo ? ` Recibimos su anticipo de ${dinero(anticipo())}.` : ''} Si necesita cambiarla, responda a este mensaje.`
    app.innerHTML = `
      ${barra(`Folio ${st.folio}`)}
      <div class="dk-cuerpo" data-rueda>
        <div class="dk-centro" style="flex:none;gap:7px;padding:4px 0 14px">
          <span class="dk-listo" style="width:64px;height:64px;font-size:30px">✓</span>
          <p class="dk-titulo dk-titulo--g">${conAnticipo ? 'Anticipo recibido' : 'Quedó apartado'}</p>
          <p class="dk-nota">${conAnticipo ? 'Se descuenta de su cuenta. Su lugar está asegurado.' : `Gracias, ${esc(nombreDePila(st.nombre))}. Le esperamos.`}</p>
        </div>
        ${resumen()}
        ${
          conAnticipo
            ? `<div class="dk-tarjeta">
                <div class="ag-dato"><span>Anticipo pagado</span><span class="dk-num" style="color:var(--dk-ok)">${dinero(anticipo())}</span></div>
                ${debe != null ? `<div class="ag-dato"><span>Resta por pagar ese día</span><span class="dk-num">${dinero(debe)}</span></div>` : `<div class="ag-dato"><span>Ese día</span><span>Se descuenta de su cuenta</span></div>`}
              </div>`
            : ''
        }
        <div class="ag-sms">
          <p class="dk-fuerte">${st.dia > 1 ? 'Se le enviará un recordatorio un día antes' : 'Se le enviará un recordatorio dos horas antes'}</p>
          <p class="dk-nota">Al ${esc(celBonito(st.cel))}. Podrá confirmar o cancelar con un toque.</p>
          ${st.mensaje ? `<div class="dk-burbuja">${esc(texto)}<small>Mensaje enviado · ${hora()}</small></div>` : `<p class="dk-nota dk-pulso" style="margin-top:8px">Enviando su confirmación…</p>`}
        </div>
      </div>
      <footer class="dk-pie"><button class="dk-btn dk-btn--bloque" data-otra>Apartar otra fecha</button></footer>`
  }

  function confirmar() {
    st.hecho = true
    pintar()
    t.en(1800, () => {
      st.mensaje = true
      pintar()
      const c = app.querySelector('.dk-cuerpo')
      c.scrollTo({ top: c.scrollHeight, behavior: 'smooth' })
    })
  }

  toca(el, '[data-serv]', (b) => {
    st.serv = +b.dataset.serv
    st.min = null
    st.paso = 1
    pintar()
  })
  toca(el, '[data-quien]', (b) => {
    st.quien = b.dataset.quien === 'x' ? null : +b.dataset.quien
    st.min = null
    st.paso = 2
    pintar()
  })
  toca(el, '[data-dia]', (b) => {
    st.dia = +b.dataset.dia
    st.min = null
    recien = null
    pintar(true)
  })
  toca(el, '[data-min]', (b) => {
    st.min = +b.dataset.min
    recien = null
    pintar(true)
  })
  toca(el, '[data-sigue]', () => {
    st.paso = 3
    pintar()
  })
  toca(el, '[data-datos]', () => {
    st.nombre = app.querySelector('#ag-nombre').value.trim()
    st.cel = celBonito(app.querySelector('#ag-cel').value)
    st.error = st.nombre.length < 2 ? 'Falta su nombre.' : st.cel.replace(/\D/g, '').length < 10 ? 'El celular lleva 10 dígitos.' : ''
    if (st.error) return pintar(true)
    if (conAnticipo) {
      st.paso = 4
      pintar()
    } else confirmar()
  })
  toca(el, '[data-pagar]', () => {
    st.pagando = true
    pintar(true)
    t.en(1500, confirmar)
  })
  toca(el, '[data-atras]', () => {
    if (st.pagando) return
    st.paso--
    st.error = ''
    pintar()
  })
  toca(el, '[data-otra]', () => {
    t.limpia()
    vida()
    st = nuevo()
    pintar()
  })

  // Mientras se elige la hora, de vez en cuando alguien más aparta una: la agenda es de verdad.
  function vida() {
    let veces = 0
    t.cada(7000, () => {
      if (st.paso !== 2 || st.hecho || veces >= 3) return
      const libres = horasDe().filter((x) => !ocupada(x) && x !== st.min)
      if (libres.length < 5) return
      const x = libres[(veces * 3 + 2) % libres.length]
      tomadas.add(`${st.dia}-${x}`)
      recien = `${st.dia}-${x}`
      veces++
      pintar(true)
      avisar(`Alguien acaba de apartar las ${aHora(x)}`)
    })
  }

  st = nuevo()
  pintar()
  vida()
  return { destruir: () => t.limpia() }
}

// ───────────────────────── Tableta: la agenda del día ─────────────────────────

function calendario(el, { negocio, nicho, m, v, avisar }) {
  const t = relojes()
  el.innerHTML = `${ESTILO}<div class="ag-app"></div>`
  const app = el.querySelector('.ag-app')

  const N = 18 // medias horas del día
  const abre = abreA(nicho)
  const span = (s) => Math.max(1, Math.ceil(s.minutos / 30))
  const minSpan = Math.min(...m.servicios.map(span))
  const corto = m.servicios.find((s) => span(s) === minSpan)
  const gente = [...m.clientes, ...OTROS]

  // "Ahora": la hora real si cae dentro del horario; si no, media mañana.
  const real = new Date().getHours() * 60 + new Date().getMinutes()
  const ahoraMin = () => (real > abre + 60 && real < abre + N * 30 - 150 ? new Date().getHours() * 60 + new Date().getMinutes() : abre + 160)
  const ahoraSlot = () => Math.ceil((ahoraMin() - abre) / 30)

  let sig = 1
  const citas = []
  const HUECOS = [0, 1, 0, 0, 2, 0, 1, 0, 0]
  m.personal.forEach((_, p) => {
    let s = p % 2
    for (let k = 0; s < N; k++) {
      s += HUECOS[(p * 2 + k) % HUECOS.length] * minSpan
      const sv = m.servicios[(p + k * 2) % m.servicios.length]
      if (s + span(sv) > N) break
      citas.push({ id: sig++, p, s, n: span(sv), cliente: gente[(p * 5 + k * 3) % gente.length], servicio: sv.nombre, estado: 'pendiente' })
      s += span(sv)
    }
  })
  const corte = ahoraSlot()
  for (const c of citas) c.estado = c.s + c.n <= corte ? 'atendida' : c.s < corte ? 'llego' : 'pendiente'

  let moviendo = null // la cita que se está cambiando de lugar
  let h = null // hoja abierta
  let borrador = null // { p, s, cliente, serv }

  const citaEn = (p, s, menos) => citas.find((c) => c.p === p && c.id !== menos && s >= c.s && s < c.s + c.n)
  const cabe = (p, s, n, menos) => {
    if (s < ahoraSlot() || s + n > N) return false
    for (let x = s; x < s + n; x++) if (citaEn(p, x, menos)) return false
    return true
  }
  /** Medias horas libres seguidas a partir de s. */
  const tramo = (p, s, menos) => {
    let n = 0
    while (s + n < N && !citaEn(p, s + n, menos)) n++
    return n
  }
  /** Dónde empezaría algo de n medias horas si se toca la casilla s; -1 si no cabe. */
  const inicioPara = (p, s, n, menos) => {
    for (let x = s; x > s - n && x >= 0; x--) if (cabe(p, x, n, menos)) return x
    return -1
  }
  const rango = (c) => `${aHora(abre + c.s * 30)} a ${aHora(abre + (c.s + c.n) * 30)}`
  const cerrar = () => {
    h?.cerrar()
    h = null
  }
  const abrir = (html) => {
    // Si la hoja sigue abierta se cambia su contenido en el sitio, sin volver a animarla.
    if (h?.el.isConnected && h.el.parentElement.classList.contains('entra')) h.el.innerHTML = `<div class="ag-hoja">${html}</div>`
    else h = hoja(el, `<div class="ag-hoja">${html}</div>`)
    return h
  }

  function numeros() {
    const corteS = ahoraSlot()
    let huecos = 0
    let ocupadas = 0
    m.personal.forEach((_, p) => {
      for (let s = 0; s < N; ) {
        const c = citaEn(p, s)
        if (c) {
          ocupadas += c.n
          s = c.s + c.n
        } else {
          const n = tramo(p, s)
          const desde = Math.max(s, corteS)
          if (s + n - desde >= minSpan) huecos++
          s += n
        }
      }
    })
    return { total: citas.length, huecos, pct: Math.round((ocupadas / (N * m.personal.length)) * 100), llegaron: citas.filter((c) => c.estado !== 'pendiente').length }
  }

  function pintar() {
    const sc = app.querySelector('.ag-cal-cuerpo')?.scrollTop ?? null
    const n = numeros()
    const corteS = ahoraSlot()
    const mueve = moviendo && citas.find((c) => c.id === moviendo)
    app.innerHTML = `
      ${
        mueve
          ? `<header class="dk-barra dk-barra--acento">
              <div class="dk-crece"><p class="dk-barra-t">Moviendo a ${esc(mueve.cliente)}</p><p class="dk-barra-s">${esc(mueve.servicio)} · ${dura(mueve.n * 30)}. Toque el hueco nuevo, con quien sea.</p></div>
              <button class="dk-btn dk-btn--chico" data-nomover style="color:var(--dk-tx)">Dejar donde está</button>
            </header>`
          : `<header class="dk-barra">
              <div class="dk-crece"><p class="dk-barra-t">${esc(negocio)} · ${esc(v.citas)} de hoy</p><p class="dk-barra-s">${esc(mayus(fecha(new Date(), 'larga')))} · toque un hueco para agendar</p></div>
              <span class="dk-chip dk-chip--ok">Agenda en línea abierta</span>
            </header>`
      }
      <div class="dk-rejilla dk-rejilla--4" style="padding:12px 16px">
        <div class="dk-cifra"><p class="dk-cifra-n">${n.total}</p><p class="dk-cifra-e">${esc(mayus(v.citas))} de hoy</p></div>
        <div class="dk-cifra"><p class="dk-cifra-n">${n.huecos}</p><p class="dk-cifra-e">Huecos por llenar</p></div>
        <div class="dk-cifra"><div class="dk-entre"><p class="dk-cifra-n">${n.pct} %</p><div class="dk-avance" style="--p:${n.pct}%;width:74px"><i></i></div></div><p class="dk-cifra-e">Ocupación del día</p></div>
        <div class="dk-cifra"><p class="dk-cifra-n">${n.llegaron}</p><p class="dk-cifra-e">Ya llegaron</p></div>
      </div>
      <div class="ag-cal" style="--n:${m.personal.length}">
        <div class="ag-cal-cab">
          <div></div>
          ${m.personal
            .map((p, i) => {
              const suyas = citas.filter((c) => c.p === i).length
              return `<div class="ag-cal-per"><span class="dk-avatar dk-avatar--ch" style="background:${tono(p)};color:#333">${esc(iniciales(p))}</span><div style="min-width:0"><p class="dk-fuerte">${esc(p)}</p><p class="dk-nota">${suyas} ${esc(suyas === 1 ? v.cita : v.citas)}</p></div></div>`
            })
            .join('')}
        </div>
        <div class="ag-cal-cuerpo" data-rueda>
          <div class="ag-cal-rej">
            <div class="ag-eje">${Array.from({ length: N }, (_, s) => `<div class="${s % 2 ? 'es-media' : ''}">${aHora(abre + s * 30)}</div>`).join('')}</div>
            ${m.personal
              .map((_, p) => {
                let col = ''
                for (let s = 0; s < N; ) {
                  const c = citaEn(p, s)
                  if (c) {
                    col += `<button class="ag-blo es-${c.estado} ${c.id === moviendo ? 'es-moviendo' : ''} ${c.nueva ? 'es-nueva' : ''}" style="--s:${c.n}" data-s="${c.n}" data-cita="${c.id}" aria-label="${esc(c.cliente)}, ${esc(c.servicio)}, ${rango(c)}">
                      <span class="ag-blo-i"><b>${c.estado === 'llego' ? '✓ ' : ''}${esc(c.cliente)}</b><span>${esc(c.servicio)}${c.n > 1 ? ` · ${aHora(abre + c.s * 30)}` : ''}</span></span>
                    </button>`
                    c.nueva = false
                    s = c.s + c.n
                  } else {
                    const pasado = s < corteS
                    const n1 = mueve ? mueve.n : minSpan
                    const ini = pasado ? -1 : inicioPara(p, s, n1, mueve?.id)
                    const destino = mueve && ini >= 0 && !citaEn(p, s, mueve.id)
                    col += `<button class="ag-libre ${s % 2 ? 'es-hora' : ''} ${pasado ? 'es-pasado' : ini < 0 ? 'es-corto' : ''} ${destino ? 'es-destino' : ''}" data-libre="${p}-${s}" aria-label="${pasado ? 'Hora pasada' : `Agendar a las ${aHora(abre + s * 30)}`}"></button>`
                    s++
                  }
                }
                return `<div class="ag-colp">${col}</div>`
              })
              .join('')}
          </div>
          <div class="ag-ahora" style="--y:${((ahoraMin() - abre) / 30).toFixed(2)}"></div>
        </div>
      </div>`
    const cuerpo = app.querySelector('.ag-cal-cuerpo')
    cuerpo.scrollTop = sc ?? Math.max(0, (corteS - 3) * 34)
  }

  // Hoja para agendar en un hueco.
  function pintaBorrador() {
    const b = borrador
    const libre = tramo(b.p, b.s)
    abrir(`
      <p class="dk-titulo">Agendar ${esc(v.cita)}</p>
      <p class="dk-nota" style="margin-top:3px">Con ${esc(m.personal[b.p])} · hoy a las ${aHora(abre + b.s * 30)} · hay ${dura(libre * 30)} libres</p>
      <p class="dk-etq">${esc(mayus(sinArt(v.cliente)))}</p>
      <div class="ag-ops">
        ${b.opciones.map((c) => `<button class="ag-op" data-bc="${esc(c)}" aria-pressed="${c === b.cliente}">${esc(c)}</button>`).join('')}
      </div>
      <input class="dk-campo dk-mt" id="ag-otro" autocomplete="off" placeholder="O escriba otro nombre" value="${esc(b.otro)}" />
      <p class="dk-etq">Qué se agenda</p>
      <div class="ag-ops">
        ${m.servicios.map((s, i) => `<button class="ag-op" data-bs="${i}" aria-pressed="${i === b.serv}" ${span(s) > libre ? 'disabled' : ''}>${esc(s.nombre)} <small>${dura(s.minutos)}</small></button>`).join('')}
      </div>
      ${m.servicios.some((s) => span(s) > libre) ? `<p class="dk-nota" style="margin-top:7px">Lo que no cabe antes de lo que sigue aparece apagado.</p>` : ''}
      <button class="dk-btn dk-btn--pri dk-btn--bloque dk-mt-g" data-guardar>Guardar ${esc(v.cita)}</button>
      <button class="dk-btn dk-btn--bloque dk-mt" data-cerrar>Dejar el hueco libre</button>`)
  }

  function detalle(c) {
    const quien = m.personal[c.p]
    const chip = c.estado === 'atendida' ? `<span class="dk-chip">Atendido</span>` : c.estado === 'llego' ? `<span class="dk-chip dk-chip--ok">Ya llegó</span>` : `<span class="dk-chip dk-chip--acento">Por llegar</span>`
    abrir(`
      <div class="dk-fila-h">
        <span class="dk-avatar" style="background:${tono(c.cliente)};color:#333">${esc(iniciales(c.cliente))}</span>
        <div style="flex:1;min-width:0"><p class="dk-titulo">${esc(c.cliente)}</p><p class="dk-nota">${esc(c.servicio)}</p></div>
        ${chip}
      </div>
      <div class="dk-mt">
        <div class="ag-dato"><span>Horario</span><span>${rango(c)}</span></div>
        <div class="ag-dato"><span>Con quién</span><span>${esc(quien)}</span></div>
        <div class="ag-dato"><span>Recordatorio</span><span>${c.enLinea ? 'Apartó en línea hace un momento' : 'Enviado ayer · confirmó'}</span></div>
      </div>
      ${
        c.estado === 'pendiente'
          ? `<button class="dk-btn dk-btn--pri dk-btn--bloque dk-mt-g" data-llego="${c.id}">Marcar que llegó</button>
             <button class="dk-btn dk-btn--bloque dk-mt" data-mover="${c.id}">Mover a otro hueco</button>
             <button class="dk-btn dk-btn--bloque dk-mt ag-peligro" data-cancelar="${c.id}">Cancelar ${esc(v.cita)}</button>`
          : c.estado === 'llego'
            ? `<button class="dk-btn dk-btn--pri dk-btn--bloque dk-mt-g" data-atendida="${c.id}">Marcar como atendido</button>
               <button class="dk-btn dk-btn--bloque dk-mt" data-nollego="${c.id}">Todavía no llega</button>`
            : `<button class="dk-btn dk-btn--bloque dk-mt-g" data-cerrar>Cerrar</button>`
      }`)
  }

  const busca = (b, k) => citas.find((c) => c.id === +b.dataset[k])

  toca(el, '[data-libre]', (b) => {
    const [p, s] = b.dataset.libre.split('-').map(Number)
    if (s < ahoraSlot()) return avisar('Esa hora ya pasó')
    if (moviendo) {
      const c = citas.find((x) => x.id === moviendo)
      const ini = inicioPara(p, s, c.n, c.id)
      if (ini < 0) return avisar(`Ahí no caben ${dura(c.n * 30)}. Pruebe otro hueco.`)
      c.p = p
      c.s = ini
      c.nueva = true
      moviendo = null
      pintar()
      return avisar(`${c.cliente} quedó a las ${aHora(abre + ini * 30)} con ${m.personal[p]}. Se le avisó del cambio.`)
    }
    const ini = inicioPara(p, s, minSpan)
    if (ini < 0) return avisar(`Aquí quedan ${dura(tramo(p, s) * 30)} libres. No alcanza para ${corto.nombre.toLowerCase()}.`)
    const usados = new Set(citas.map((c) => c.cliente))
    const opciones = gente.filter((g) => !usados.has(g)).slice(0, 5)
    borrador = { p, s: ini, opciones, cliente: opciones[0], otro: '', serv: m.servicios.findIndex((x) => span(x) <= tramo(p, ini)) }
    pintaBorrador()
  })
  toca(el, '[data-bc]', (b) => {
    borrador.cliente = b.dataset.bc
    borrador.otro = ''
    pintaBorrador()
  })
  toca(el, '[data-bs]', (b) => {
    borrador.otro = el.querySelector('#ag-otro')?.value || ''
    borrador.serv = +b.dataset.bs
    pintaBorrador()
  })
  toca(el, '[data-guardar]', () => {
    const b = borrador
    const sv = m.servicios[b.serv]
    const nombre = el.querySelector('#ag-otro').value.trim() || b.cliente
    if (!cabe(b.p, b.s, span(sv))) return avisar('Ese hueco se acaba de ocupar. Elija otro.')
    citas.push({ id: sig++, p: b.p, s: b.s, n: span(sv), cliente: nombre, servicio: sv.nombre, estado: 'pendiente', nueva: true })
    cerrar()
    pintar()
    avisar(`Guardado: ${nombre}, ${aHora(abre + b.s * 30)} con ${m.personal[b.p]}`)
  })
  toca(el, '[data-cita]', (b) => {
    const c = busca(b, 'cita')
    if (!c) return
    if (moviendo) return avisar(moviendo === c.id ? 'Toque un hueco libre para moverla' : 'Ese horario ya está ocupado')
    detalle(c)
  })
  toca(el, '[data-llego]', (b) => {
    const c = busca(b, 'llego')
    c.estado = 'llego'
    cerrar()
    pintar()
    avisar(`${c.cliente} ya llegó. ${m.personal[c.p]} lo ve en su agenda.`)
  })
  toca(el, '[data-nollego]', (b) => {
    busca(b, 'nollego').estado = 'pendiente'
    cerrar()
    pintar()
  })
  toca(el, '[data-atendida]', (b) => {
    busca(b, 'atendida').estado = 'atendida'
    cerrar()
    pintar()
  })
  toca(el, '[data-mover]', (b) => {
    moviendo = +b.dataset.mover
    cerrar()
    pintar()
  })
  toca(el, '[data-nomover]', () => {
    moviendo = null
    pintar()
  })
  toca(el, '[data-cancelar]', (b) => {
    const c = busca(b, 'cancelar')
    citas.splice(citas.indexOf(c), 1)
    cerrar()
    pintar()
    avisar(`Se canceló a ${c.cliente}. El hueco de las ${aHora(abre + c.s * 30)} quedó libre.`)
  })

  // Vida propia: de vez en cuando alguien aparta desde su teléfono y la cita aparece sola.
  let entradas = 0
  t.cada(12000, () => {
    if (moviendo || el.querySelector('.dk-velo') || entradas >= 3) return
    const usados = new Set(citas.map((c) => c.cliente))
    const quien = gente.find((g) => !usados.has(g))
    const sv = m.servicios[entradas % m.servicios.length]
    if (!quien) return
    for (let k = 0; k < m.personal.length; k++) {
      const p = (entradas * 3 + 1 + k) % m.personal.length
      for (let s = ahoraSlot() + 2; s < N; s++) {
        if (!cabe(p, s, span(sv))) continue
        citas.push({ id: sig++, p, s, n: span(sv), cliente: quien, servicio: sv.nombre, estado: 'pendiente', nueva: true, enLinea: true })
        entradas++
        pintar()
        return avisar(`${quien} apartó en línea: ${aHora(abre + s * 30)} con ${m.personal[p]}`)
      }
    }
  })
  t.cada(30000, () => {
    if (!el.querySelector('.dk-velo')) pintar()
  })

  pintar()
  return { destruir: () => t.limpia() }
}

// ───────────────────────── Tableta: lista de espera ─────────────────────────

function espera(el, { negocio, nicho, m, v, avisar }) {
  const t = relojes()
  el.innerHTML = `${ESTILO}<div class="ag-app"></div>`
  const app = el.querySelector('.ag-app')

  const abre = abreA(nicho)
  const gente = [...m.clientes, ...OTROS]
  const SALTOS = [0, 30, 60, 120, 150, 210, 270, 300, 360, 420]
  const dia = SALTOS.map((x, i) => ({
    id: i,
    min: abre + x,
    cliente: gente[i % gente.length],
    servicio: m.servicios[(i * 3 + 1) % m.servicios.length].nombre,
    con: m.personal[(i * 3) % m.personal.length],
    estado: i < 3 ? 'pasado' : 'ok',
  }))
  const PREF = ['Lo antes posible', 'Hoy, a cualquier hora', 'Por la tarde', 'Cuando se libere algo', 'Hoy o mañana']
  let sigE = 0
  const nuevoEnEspera = (hace) => {
    const i = sigE++
    return { id: i, nombre: gente[(dia.length + i) % gente.length], servicio: m.servicios[i % m.servicios.length].nombre, pref: PREF[i % PREF.length], hace, estado: 'espera' }
  }
  const lista = [nuevoEnEspera(190), nuevoEnEspera(95), nuevoEnEspera(40), nuevoEnEspera(12)]
  let recuperados = 3
  let cancelaciones = 0
  let proc = null // { turno, texto } mientras el hueco se ofrece

  const haceTxt = (n) => (n < 60 ? `hace ${n} min` : `hace ${Math.floor(n / 60)} h`)

  function pintar() {
    const izq = app.querySelector('[data-izq]')?.scrollTop || 0
    const der = app.querySelector('[data-der]')?.scrollTop || 0
    app.innerHTML = `
      <header class="dk-barra">
        <div class="dk-crece"><p class="dk-barra-t">${esc(negocio)} · lista de espera</p><p class="dk-barra-s">Cuando alguien cancela, el espacio se ofrece solo. Usted no hace nada.</p></div>
        <button class="dk-btn dk-btn--oscuro dk-btn--chico" data-simular ${proc ? 'disabled' : ''}>${proc ? 'Ofreciendo el hueco' : 'Simular cancelación'}</button>
      </header>
      <div class="dk-dos ag-esp">
        <section data-rueda data-izq>
          <p class="dk-sub">${esc(mayus(v.citas))} de hoy · ${esc(fecha(new Date(), 'media'))}</p>
          <div class="dk-lista">
            ${dia
              .map((d) => {
                const hueco = d.estado === 'hueco' || d.estado === 'ofreciendo'
                const chip =
                  d.estado === 'pasado'
                    ? `<span class="dk-chip">Atendido</span>`
                    : d.estado === 'hueco'
                      ? `<span class="dk-chip dk-chip--alerta">Se liberó</span>`
                      : d.estado === 'ofreciendo'
                        ? `<span class="dk-chip dk-chip--alerta dk-pulso">Ofreciendo</span>`
                        : d.recuperado
                          ? `<span class="dk-chip dk-chip--ok">Recuperado</span>`
                          : `<span class="dk-chip">Confirmó</span>`
                return `<div class="ag-turno es-${d.estado} ${d.estado === 'ok' && d.fresco ? 'es-recuperado' : ''}">
                  <span class="ag-turno-h">${aHora(d.min)}</span>
                  <div class="dk-crece" style="flex:1;min-width:0">
                    <p class="dk-fila-t">${hueco ? 'Hueco libre' : esc(d.cliente)}</p>
                    <p class="dk-fila-s">${hueco ? esc(d.nota) : `${esc(d.servicio)} · con ${esc(d.con)}`}</p>
                  </div>
                  ${chip}
                </div>`
              })
              .join('')}
          </div>
        </section>
        <section data-rueda data-der>
          <div class="dk-rejilla">
            <div class="dk-cifra" style="background:var(--dk-ok-f);border-color:transparent"><p class="dk-cifra-n" style="color:var(--dk-ok)" data-rec>${recuperados}</p><p class="dk-cifra-e">Huecos recuperados hoy</p></div>
            <div class="dk-cifra"><p class="dk-cifra-n">${lista.filter((w) => w.estado !== 'sin').length}</p><p class="dk-cifra-e">En lista de espera</p></div>
          </div>
          <p class="dk-sub">En espera, por orden de llegada</p>
          ${
            lista
              .map((w, i) => {
                const oferta = proc && proc.w === w
                return `<div class="ag-enespera ${oferta ? 'es-oferta' : ''} ${w.estado === 'sin' ? 'es-sin' : ''}">
                  <span class="ag-lugar">${i + 1}</span>
                  <div style="flex:1;min-width:0">
                    <div class="dk-entre"><p class="dk-fila-t">${esc(w.nombre)}</p>${w.estado === 'sin' ? `<span class="dk-chip">No contestó</span>` : w.estado === 'acepto' ? `<span class="dk-chip dk-chip--ok">Aceptó</span>` : oferta ? `<span class="dk-chip dk-chip--acento dk-pulso">Esperando respuesta</span>` : `<span class="dk-nota">${haceTxt(w.hace)}</span>`}</div>
                    <p class="dk-fila-s">${esc(w.servicio)} · ${esc(w.pref)}</p>
                    ${
                      oferta || w.estado === 'acepto'
                        ? `<div class="dk-chat">
                            <div class="dk-burbuja dk-burbuja--yo">${esc(proc.texto)}<small>Enviado solo · ${hora()}</small></div>
                            ${w.estado === 'acepto' ? `<div class="dk-burbuja">Sí, lo tomo. Gracias.<small>${hora()}</small></div>` : ''}
                          </div>`
                        : ''
                    }
                  </div>
                </div>`
              })
              .join('') || `<p class="dk-nota">Nadie en espera por ahora. Quien no encuentre horario en línea puede anotarse aquí.</p>`
          }
        </section>
      </div>`
    app.querySelector('[data-izq]').scrollTop = izq
    app.querySelector('[data-der]').scrollTop = der
    for (const d of dia) d.fresco = false
  }

  function ofrecer() {
    const d = proc.turno
    const w = lista.find((x) => x.estado === 'espera')
    if (!w) {
      d.nota = 'Nadie en espera. Sigue abierto en la agenda en línea.'
      d.estado = 'hueco'
      proc = null
      return pintar()
    }
    proc.w = w
    proc.texto = `Hola, ${nombreDePila(w.nombre)}. Se liberó un espacio hoy a las ${aHora(d.min)} con ${d.con}. ¿Lo quiere? Responda sí y queda apartado.`
    d.estado = 'ofreciendo'
    d.nota = `Canceló ${d.cliente}. Se ofreció a ${w.nombre}.`
    pintar()
    app.querySelector('.es-oferta')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    // La segunda vez, la primera persona no contesta: el hueco pasa a la siguiente.
    const falla = cancelaciones % 3 === 2 && !proc.fallo && lista.filter((x) => x.estado === 'espera').length > 1
    t.en(2600, () => {
      if (falla) {
        proc.fallo = true
        w.estado = 'sin'
        proc.w = null
        d.nota = `${w.nombre} no contestó en 10 minutos. Pasa a quien sigue.`
        pintar()
        return t.en(1500, ofrecer)
      }
      w.estado = 'acepto'
      pintar()
      t.en(1500, () => {
        d.cliente = w.nombre
        d.servicio = w.servicio
        d.estado = 'ok'
        d.recuperado = true
        d.fresco = true
        lista.splice(lista.indexOf(w), 1)
        // Quien no contestó conserva su lugar para la próxima.
        for (const x of lista) if (x.estado === 'sin') x.estado = 'espera'
        proc = null
        recuperados++
        pintar()
        const n = app.querySelector('[data-rec]')
        n.dataset.v = recuperados - 1
        cuenta(n, recuperados, { ms: 500 })
        avisar(`Hueco recuperado: ${w.nombre} tomó las ${aHora(d.min)}`)
      })
    })
  }

  function cancelar() {
    if (proc) return
    const vivos = dia.filter((d) => d.estado === 'ok' && !d.recuperado)
    const d = vivos[(cancelaciones * 2 + 1) % vivos.length] || dia.find((x) => x.estado === 'ok')
    if (!d) return
    d.estado = 'hueco'
    d.nota = `Canceló ${d.cliente}. Buscando en la lista de espera.`
    proc = { turno: d }
    pintar()
    avisar(`${d.cliente} canceló su ${v.cita} de las ${aHora(d.min)}`)
    t.en(1500, ofrecer)
    cancelaciones++
  }

  toca(el, '[data-simular]', cancelar)

  // Pasa solo cada tanto, y la lista se vuelve a llenar con quien no encontró horario.
  t.en(6000, cancelar)
  t.cada(17000, cancelar)
  t.cada(11000, () => {
    if (proc || lista.length >= 4) return
    const w = nuevoEnEspera(1)
    lista.push(w)
    pintar()
    avisar(`${w.nombre} se anotó en la lista de espera`)
  })
  t.cada(60000, () => {
    for (const w of lista) w.hace++
    if (!proc) pintar()
  })

  pintar()
  return { destruir: () => t.limpia() }
}
