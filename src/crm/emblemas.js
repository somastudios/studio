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
// Cada cifra es una rueda de números: al entrar gira hasta el suyo, como un marcador.
const cifras = (txt) => [...txt].map((c) => `<span class="sd-dig"><span class="sd-tira" data-d="${c}" style="--d:${c}">${RUEDA}</span></span>`).join('')

/**
 * Hoy: el sello del día. El mes y el día en grande, partidos por una diagonal azul, la placa
 * del día de la semana y un reloj con la hora de verdad (el anillo y el punto son el logo).
 * De noche la carátula se apaga.
 */
export function emblemaFecha() {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  const h = ((d.getHours() % 12) + d.getMinutes() / 60) * 30
  const m = d.getMinutes() * 6
  const noche = d.getHours() >= 19 || d.getHours() < 6
  const marcas = Array.from({ length: 12 }, (_, i) => `<line class="rj-marca${i % 3 ? '' : ' rj-marca--f'}" x1="0" y1="${i % 3 ? -33 : -34}" x2="0" y2="${i % 3 ? -30 : -27}" transform="rotate(${i * 30})"/>`).join('')
  const rayos = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * TAU + 0.3
    const r0 = i % 2 ? 31 : 27
    const r1 = i % 2 ? 41 : 49
    return `M${(Math.cos(a) * r0).toFixed(1)} ${(Math.sin(a) * r0).toFixed(1)}L${(Math.cos(a) * r1).toFixed(1)} ${(Math.sin(a) * r1).toFixed(1)}`
  }).join('')
  return `<div class="sd${noche ? ' sd--noche' : ''}" data-emb="fecha">
    <svg class="sd-rafaga" viewBox="-50 -50 100 100"><path d="${rayos}"/></svg>
    <svg class="sd-barra" viewBox="0 0 100 92">${boil(P.line(29, 91, 58, 3, 5), { amp: 0.7, cls: 'draw', attrs: 'stroke-width="7.5" stroke-linecap="butt"' })}</svg>
    <p class="sd-mes">${cifras(mes)}</p>
    <p class="sd-dia">${['r', 'y', 'g', 'b'].map((c) => `<span class="sd-eco sd-eco--${c}">${dia}</span>`).join('')}<span class="sd-num">${cifras(dia)}</span></p>
    <p class="sd-placa"><span>${SEMANA[d.getDay()]}</span></p>
    <svg class="sd-reloj" data-reloj viewBox="-50 -50 100 100">
      <circle class="rj-cara" r="40"/>
      ${boil(P.circle(0, 0, 42, 30), { amp: 0.5, cls: 'draw emb-aro', attrs: 'stroke-width="7" stroke-linecap="butt"' })}
      <g class="rj-marcas">${marcas}</g>
      <g class="emb-hora" data-rot="${h.toFixed(1)}" transform="rotate(${h.toFixed(1)})"><line x1="0" y1="5" x2="0" y2="-19"/></g>
      <g class="emb-min" data-rot="${m}" transform="rotate(${m})"><line x1="0" y1="6" x2="0" y2="-29"/></g>
      <g class="rj-seg" data-seg style="animation-delay:-${d.getSeconds()}s"><line x1="0" y1="9" x2="0" y2="-31"/></g>
      <circle class="emb-punto" r="6.4" fill="${AZUL}"/>
    </svg>
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
    const golpe = at + 0.62
    // La diagonal ya se está trazando (es un .draw). Las ruedas giran hasta su cifra.
    el.querySelectorAll('.sd-tira').forEach((t, i) => {
      const d = +t.dataset.d
      tl.fromTo(t, { yPercent: -(d + 2 - (i % 2)) * 5 }, { yPercent: -(d + 10) * 5, duration: 0.85 + i * 0.09, ease: 'back.out(1.25)', clearProps: 'transform' }, at + 0.06 + i * 0.05)
    })
    tl.fromTo(el.querySelector('.sd-mes'), { autoAlpha: 0, x: -18 }, { autoAlpha: 1, x: 0, duration: 0.45, ease: 'expo.out', clearProps: 'transform,opacity,visibility' }, at)
    // El día llega con su estela de colores (los de las fichas), que se apila y se recoge.
    const ecos = [...el.querySelectorAll('.sd-eco')]
    ecos.forEach((e, i) => {
      const k = ecos.length - i
      tl.fromTo(e, { opacity: 1, x: `${0.9 + k * 0.28}em`, y: `${-0.5 - k * 0.12}em` }, { x: `${k * 0.055}em`, y: `${k * 0.055}em`, duration: 0.5, ease: 'expo.out' }, at + 0.1 + i * 0.045)
      if (k > 1) tl.to(e, { x: 0, y: 0, opacity: 0, duration: 0.28, ease: 'power3.in' }, golpe + 0.18 + i * 0.04)
      else tl.set(e, { clearProps: 'transform,opacity' }, golpe + 0.5)
    })
    tl.fromTo(el.querySelector('.sd-num'), { autoAlpha: 0, x: '1.1em', y: '-0.6em' }, { autoAlpha: 1, x: 0, y: 0, duration: 0.5, ease: 'expo.out', clearProps: 'transform,opacity,visibility' }, at + 0.32)
    // El golpe: el día pega, salta la ráfaga y todo el sello se sacude un instante.
    tl.fromTo(el.querySelector('.sd-dia'), { scale: 1.22 }, { scale: 1, duration: 0.5, ease: 'back.out(3.2)', clearProps: 'transform' }, golpe)
    tl.fromTo(el.querySelector('.sd-rafaga'), { autoAlpha: 1, scale: 0.45, rotation: -14, transformOrigin: '50% 50%' }, { autoAlpha: 0, scale: 1.25, rotation: 6, duration: 0.5, ease: 'expo.out' }, golpe)
    tl.to(el, { keyframes: { x: [0, -3, 3, -2, 1, 0], y: [0, 2, -2, 1, 0, 0] }, duration: 0.3, ease: 'none', clearProps: 'transform' }, golpe)
    // La placa entra de lado, como una etiqueta que se pega.
    tl.fromTo(el.querySelector('.sd-placa'), { autoAlpha: 0, xPercent: -130, skewX: -28 }, { autoAlpha: 1, xPercent: 0, skewX: 0, duration: 0.55, ease: 'back.out(1.7)', clearProps: 'transform,opacity,visibility' }, at + 0.45)
    // El reloj: las marcas aparecen en ronda y las manecillas parten de las doce.
    tl.fromTo(el.querySelectorAll('.rj-marca'), { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.03, clearProps: 'opacity' }, at + 0.35)
    tl.fromTo(el.querySelector('.rj-cara'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.6, ease: 'expo.out' }, at + 0.2)
    el.querySelectorAll('.emb-hora, .emb-min').forEach((g) => tl.fromTo(g, { rotation: -360, svgOrigin: '0 0' }, { rotation: +g.dataset.rot, duration: 1.6, ease: 'expo.out' }, at + 0.25))
    tl.fromTo(el.querySelector('.rj-seg'), { opacity: 0 }, { opacity: 1, duration: 0.3, clearProps: 'opacity' }, at + 1.2)
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
