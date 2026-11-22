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

/** Hoy: un reloj con la hora de verdad. El anillo y el punto son el logo. */
export function emblemaReloj() {
  const d = new Date()
  const h = ((d.getHours() % 12) + d.getMinutes() / 60) * 30
  const m = d.getMinutes() * 6
  return `<svg class="emb" data-emb="reloj" viewBox="-50 -50 100 100">
    ${boil(P.circle(0, 0, 42, 30), { amp: 0.5, cls: 'draw emb-aro', attrs: 'stroke-width="6.5" stroke-linecap="butt"' })}
    <g class="emb-hora" data-rot="${h.toFixed(1)}" transform="rotate(${h.toFixed(1)})">${boil(P.line(0, 4, 0, -19, 4), { amp: 0.35, attrs: 'stroke-width="3.4"' })}</g>
    <g class="emb-min" data-rot="${m}" transform="rotate(${m})">${boil(P.line(0, 5, 0, -30, 5), { amp: 0.35, attrs: 'stroke-width="2.2"' })}</g>
    <circle class="emb-punto" r="5.4" fill="${AZUL}"/>
  </svg>`
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
  if (tipo === 'reloj') {
    // Las manecillas parten de las doce y llegan a la hora.
    el.querySelectorAll('.emb-hora, .emb-min').forEach((g) => tl.fromTo(g, { rotation: 0, svgOrigin: '0 0' }, { rotation: +g.dataset.rot, duration: 1.5, ease: 'expo.out' }, at + 0.25))
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
  const r = raiz.querySelector('[data-emb="reloj"]')
  if (!r) return
  const d = new Date()
  const h = ((d.getHours() % 12) + d.getMinutes() / 60) * 30
  const m = d.getMinutes() * 6
  gsap.to(r.querySelector('.emb-hora'), { rotation: h, svgOrigin: '0 0', duration: 0.8, ease: 'expo.out' })
  gsap.to(r.querySelector('.emb-min'), { rotation: m, svgOrigin: '0 0', duration: 0.8, ease: 'expo.out' })
}
