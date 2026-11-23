import gsap from 'gsap'
import { boil, P } from '../core/boil.js'
import { icoNicho } from '../icons/render.js'
import { esc } from '../app/util.js'

// Emblemas: el dibujo que encabeza cada sección del CRM. No son adorno: cada uno muestra un
// dato real (la hora, cuántos prospectos hay, qué día es, cómo va la cobranza) con el mismo
// trazo que hierve del resto de Soma. Al entrar a la sección se dibujan.

const TAU = Math.PI * 2
const AZUL = '#216fff'
const dientes = (r0, r1, n) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * TAU
    return P.line(Math.cos(a) * r0, Math.sin(a) * r0, Math.cos(a) * r1, Math.sin(a) * r1, 2)
  })

const SEMANA = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']
const RUEDA = '0123456789'.repeat(2).replace(/\d/g, '<i>$&</i>')
// Cada cifra es una rueda de números: al entrar gira hasta el suyo, como un marcador. La cifra
// invisible le da su ancho a la columna, para que un 1 ocupe lo de un 1.
const cifras = (txt) => [...txt].map((c) => `<span class="sd-dig"><span class="sd-ancho">${c}</span><span class="sd-tira" data-d="${c}" style="--d:${c}">${RUEDA}</span></span>`).join('')
const ESTRELLA = 'M0-11C1-3 3-1 11 0 3 1 1 3 0 11-1 3-3 1-11 0-3-1-1-3 0-11Z'

/**
 * Hoy: el sello del día. Arriba el reloj, con la hora de verdad, dentro de su halo (un punto
 * lo recorre una vez por minuto). Abajo la fecha: el mes en negro con la placa del día de la
 * semana, la diagonal y el día en azul. De noche la carátula se apaga.
 */
export function emblemaFecha() {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  const h = ((d.getHours() % 12) + d.getMinutes() / 60) * 30
  const m = d.getMinutes() * 6
  const noche = d.getHours() >= 19 || d.getHours() < 6
  const marcas = Array.from({ length: 12 }, (_, i) => `<line class="rj-marca${i % 3 ? '' : ' rj-marca--f'}" x1="0" y1="${i % 3 ? -41 : -42}" x2="0" y2="${i % 3 ? -36 : -33}" transform="rotate(${i * 30})"/>`).join('')
  return `<div class="sd${noche ? ' sd--noche' : ''}" data-emb="fecha">
    <svg class="sd-brillo" viewBox="-12 -12 24 24"><path d="${ESTRELLA}"/></svg>
    <svg class="sd-reloj" data-reloj viewBox="-66 -66 132 132">
      <defs><radialGradient id="rj-luz" r="0.5"><stop offset="0.7" stop-color="${AZUL}" stop-opacity="0.05"/><stop offset="0.86" stop-color="${AZUL}" stop-opacity="0.2"/><stop offset="1" stop-color="${AZUL}" stop-opacity="0.07"/></radialGradient></defs>
      <g class="rj-halo"><circle r="64" fill="url(#rj-luz)"/><circle class="rj-aro" r="63.4"/></g>
      <g class="rj-orbita" data-seg style="animation-delay:-${d.getSeconds()}s"><circle cy="-63.4" r="2.7"/></g>
      <circle class="rj-cara" r="48"/>
      <g class="rj-marcas">${marcas}</g>
      <g class="emb-hora" data-rot="${h.toFixed(1)}" transform="rotate(${h.toFixed(1)})"><line x1="0" y1="4" x2="0" y2="-23"/></g>
      <g class="emb-min" data-rot="${m}" transform="rotate(${m})"><line x1="0" y1="5" x2="0" y2="-35"/></g>
      <g class="rj-seg" data-seg style="animation-delay:-${d.getSeconds()}s"><line x1="0" y1="9" x2="0" y2="-38"/></g>
      <circle class="emb-punto" r="5.4" fill="${AZUL}"/>
    </svg>
    <p class="sd-mes">${cifras(mes)}</p>
    <p class="sd-placa"><span>${SEMANA[d.getDay()]}</span></p>
    <svg class="sd-barra" viewBox="0 0 30 64"><path d="M0 64L23 0h7L7 64Z"/></svg>
    <p class="sd-dia">${cifras(dia)}</p>
  </div>`
}

/** Prospectos: giran alrededor del punto. Un nodo por prospecto en proceso, hasta ocho. */
export function emblemaOrbita(n = 0) {
  const k = Math.max(1, Math.min(8, n))
  const dentro = Math.min(3, Math.ceil(k / 2.5))
  const fuera = k - dentro
  const nodos = (cuantos, r, giro) =>
    Array.from({ length: cuantos }, (_, i) => {
      const a = giro + (i / cuantos) * TAU
      return `<circle cx="${(Math.cos(a) * r).toFixed(2)}" cy="${(Math.sin(a) * r).toFixed(2)}" r="3.4"/>`
    }).join('')
  return `<svg class="emb" data-emb="orbita" viewBox="-50 -50 100 100">
    <g class="emb-gira">${boil(P.circle(0, 0, 22, 18), { amp: 0.5, cls: 'draw', attrs: 'stroke-width="1.6"' })}<g class="emb-nodos">${n ? nodos(dentro, 22, 0.6) : ''}</g></g>
    <g class="emb-gira emb-gira--r">${boil(P.circle(0, 0, 42, 28), { amp: 0.6, cls: 'draw', attrs: 'stroke-width="1.6"' })}<g class="emb-nodos">${n && fuera > 0 ? nodos(fuera, 42, 2.1) : ''}</g></g>
    <circle class="emb-punto" r="7" fill="${AZUL}"/>
  </svg>`
}

/** Agenda: la hoja de hoy. */
export function emblemaHoja() {
  const d = new Date()
  const mes = new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(d).replace('.', '')
  return `<svg class="emb" data-emb="hoja" viewBox="-50 -50 100 100">
    ${boil([P.line(-38, -34, 38, -34), P.line(38, -34, 38, 42), P.line(38, 42, -38, 42), P.line(-38, 42, -38, -34)], { amp: 0.6, cls: 'draw', attrs: 'stroke-width="2.4"' })}
    ${boil([P.line(-38, -16, 38, -16)], { amp: 0.5, cls: 'draw', attrs: 'stroke-width="1.8"' })}
    ${boil([P.line(-19, -44, -19, -26, 3), P.line(19, -44, 19, -26, 3)], { amp: 0.4, cls: 'draw', attrs: 'stroke-width="3.2"' })}
    <text class="emb-mes" x="0" y="-21.5" text-anchor="middle">${esc(mes)}</text>
    <text class="emb-dia" x="0" y="31" text-anchor="middle">${d.getDate()}</text>
    <circle class="emb-punto" cx="27" cy="-25" r="3.2" fill="${AZUL}"/>
  </svg>`
}

/** Cobranza: un anillo repartido entre al corriente, por vencer y vencidas. */
export function emblemaDona({ ok = 0, aviso = 0, mal = 0 } = {}) {
  const total = ok + aviso + mal
  let a = -90
  const sep = total > 1 ? 7 : 0
  const arcos = [
    ['ok', ok],
    ['aviso', aviso],
    ['mal', mal],
  ]
    .filter(([, v]) => v > 0)
    .map(([c, v]) => {
      const barre = (v / total) * 360
      const s = boil(P.arc(0, 0, 38, a + sep / 2, a + barre - sep / 2, Math.max(4, Math.round(barre / 14))), { amp: 0.5, cls: `draw emb-${c}`, attrs: 'stroke-width="9" stroke-linecap="butt"' })
      a += barre
      return s
    })
    .join('')
  return `<svg class="emb" data-emb="dona" viewBox="-50 -50 100 100">
    ${total ? arcos : boil(P.circle(0, 0, 38, 26), { amp: 0.5, cls: 'draw emb-vacio', attrs: 'stroke-width="9"' })}
    <text class="emb-total" x="0" y="9" text-anchor="middle">${total}</text>
  </svg>`
}

/** Sistemas: el pulso de lo que está vivo. */
export function emblemaPulso(vivos = 0) {
  const linea = { pts: [[-66, 6], [-34, 6], [-24, 6], [-15, -30], [-3, 34], [7, -10], [14, 6], [52, 6]], closed: false }
  return `<svg class="emb emb--ancho" data-emb="pulso" viewBox="-70 -42 140 84">
    ${boil(linea, { amp: 0.7, cls: 'draw', attrs: 'stroke-width="2.6"' })}
    <circle class="emb-punto ${vivos ? 'emb-late' : ''}" cx="58" cy="6" r="5.6" fill="${AZUL}"/>
  </svg>`
}

/** Ajustes: dos engranes que se mueven uno al otro. */
export function emblemaEngranes() {
  const engrane = (r, n) => [P.circle(0, 0, r * 0.36, 9), P.circle(0, 0, r, 20), ...dientes(r, r * 1.3, n)]
  return `<svg class="emb" data-emb="engranes" viewBox="-50 -50 100 100">
    <g transform="translate(-10 9)"><g class="emb-gira">${boil(engrane(23, 10), { amp: 0.5, attrs: 'stroke-width="2.3"' })}</g></g>
    <g transform="translate(29.5 -25.5)"><g class="emb-gira emb-gira--r emb-gira--veloz">${boil(engrane(11.5, 5), { amp: 0.4, attrs: 'stroke-width="2.1"' })}</g></g>
    <circle class="emb-punto" cx="-10" cy="9" r="3.6" fill="${AZUL}"/>
  </svg>`
}

/** Expediente: el icono del giro del prospecto, vivo. */
export const emblemaGiro = (icono) => `<div class="emb emb--giro vivo" data-emb="giro">${icoNicho(icono)}</div>`

/** Una chispa de ocho rayos: la firma de quien ayudó a construir esto. */
export function chispa() {
  const rayos = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * TAU
    const r = i % 2 ? 9 : 14
    return P.line(Math.cos(a) * 3.2, Math.sin(a) * 3.2, Math.cos(a) * r, Math.sin(a) * r, 2)
  })
  return `<svg class="crm-chispa" viewBox="-16 -16 32 32" aria-hidden="true">${boil(rayos, { amp: 0.35, attrs: 'stroke-width="2.4"' })}</svg>`
}

/** Dibuja la entrada de un emblema dentro de una línea de tiempo. */
export function animaEmblema(el, tl, at = 0) {
  const tipo = el?.dataset?.emb
  if (!tipo) return
  const trazos = el.querySelectorAll('.boil.draw')
  if (trazos.length) tl.fromTo(trazos, { '--draw': 1.06 }, { '--draw': 0, duration: 1.1, ease: 'expo.inOut', stagger: 0.12 }, at)
  const punto = el.querySelector('.emb-punto')
  if (punto) tl.fromTo(punto, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.7, ease: 'back.out(2.4)' }, at + 0.35)
  if (tipo === 'fecha') {
    // El reloj: primero el halo, luego la carátula; las marcas en ronda y las manecillas dan la vuelta.
    tl.fromTo(el.querySelector('.rj-halo'), { autoAlpha: 0, scale: 0.6, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'expo.out' }, at)
    tl.fromTo(el.querySelector('.rj-cara'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.7, ease: 'back.out(1.6)' }, at + 0.1)
    tl.fromTo(el.querySelectorAll('.rj-marca'), { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.03, clearProps: 'opacity' }, at + 0.35)
    el.querySelectorAll('.emb-hora, .emb-min').forEach((g) => tl.fromTo(g, { rotation: -360, svgOrigin: '0 0' }, { rotation: +g.dataset.rot, duration: 1.6, ease: 'expo.out' }, at + 0.25))
    tl.fromTo(el.querySelectorAll('.rj-seg, .rj-orbita'), { opacity: 0 }, { opacity: 1, duration: 0.4, clearProps: 'opacity' }, at + 1.1)
    tl.fromTo(el.querySelector('.sd-brillo'), { autoAlpha: 0, scale: 0, rotation: -90, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(2)', clearProps: 'transform,opacity,visibility' }, at + 0.7)
    // La fecha: el mes entra por la izquierda y el día por la derecha, girando hasta su cifra.
    tl.fromTo(el.querySelector('.sd-mes'), { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.55, ease: 'expo.out', clearProps: 'transform,opacity,visibility' }, at + 0.15)
    tl.fromTo(el.querySelector('.sd-dia'), { autoAlpha: 0, x: 14 }, { autoAlpha: 1, x: 0, duration: 0.55, ease: 'expo.out', clearProps: 'transform,opacity,visibility' }, at + 0.25)
    el.querySelectorAll('.sd-tira').forEach((t, i) => {
      const d = +t.dataset.d
      // (y: 0 a propósito: sin él, GSAP suma el giro al desplazamiento que ya trae el CSS y la rueda se pasa de largo.)
      tl.fromTo(t, { y: 0, yPercent: -(d + 3) * 5 }, { y: 0, yPercent: -(d + 10) * 5, duration: 0.95 + i * 0.1, ease: 'expo.out', clearProps: 'transform' }, at + 0.15 + i * 0.07)
    })
    // La diagonal sube como un corte y la placa se pega con un rebote.
    tl.fromTo(el.querySelector('.sd-barra'), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'expo.out', clearProps: 'clipPath' }, at + 0.3)
    tl.fromTo(el.querySelector('.sd-placa'), { autoAlpha: 0, scale: 0.4, rotation: -14, transformOrigin: '0% 50%' }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2.4)', clearProps: 'transform,opacity,visibility' }, at + 0.6)
  } else if (tipo === 'orbita') {
    tl.fromTo(el.querySelectorAll('.emb-nodos circle'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.5, ease: 'back.out(3)', stagger: 0.06 }, at + 0.6)
  } else if (tipo === 'hoja') {
    tl.fromTo(el.querySelector('.emb-dia'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'expo.out' }, at + 0.45)
    tl.fromTo(el.querySelector('.emb-mes'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, at + 0.55)
  } else if (tipo === 'dona') {
    tl.fromTo(el.querySelector('.emb-total'), { autoAlpha: 0, scale: 0.6, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'expo.out' }, at + 0.5)
  } else if (tipo === 'engranes') {
    tl.fromTo(el, { autoAlpha: 0, scale: 0.7, rotation: -40, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 1.1, ease: 'expo.out' }, at)
  } else if (tipo === 'giro') {
    tl.fromTo(el, { autoAlpha: 0, scale: 0.6, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'back.out(1.8)' }, at)
  }
}

/** Pone las manecillas del reloj a la hora (se llama cada tanto mientras el CRM está abierto). */
export function ponHora(raiz) {
  const r = raiz.querySelector('[data-reloj]')
  if (!r) return
  const d = new Date()
  const h = ((d.getHours() % 12) + d.getMinutes() / 60) * 30
  const m = d.getMinutes() * 6
  gsap.to(r.querySelector('.emb-hora'), { rotation: h, svgOrigin: '0 0', duration: 0.8, ease: 'expo.out' })
  gsap.to(r.querySelector('.emb-min'), { rotation: m, svgOrigin: '0 0', duration: 0.8, ease: 'expo.out' })
}
