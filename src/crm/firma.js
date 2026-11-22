import gsap from 'gsap'
import { boil, P } from '../core/boil.js'

// La escena al pie de Ajustes: suena el teléfono, Claude contesta (llama Soma), camina a la
// computadora, escribe el programa, lo compila y, al terminarlo, le caen los lentes.
//
// Claude es lo único relleno; todo lo demás es trazo que hierve, como en el resto de Soma.
// Lo que le da vida no son más objetos sino actuación: se aplasta antes de saltar y al caer,
// tiene sombra que lo ancla al piso, mira hacia donde va, se inclina al caminar y levanta polvo.

const NARANJA = '#d97757'
const TINTA = '#1f1e1d'
const AZUL = '#216fff'
const SUELO = 128

const r = (x, y, w, h, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${extra}/>`

/** Los lentes de pixel, con su brillo en diagonal. */
const lentes = () => `<g class="cl-lentes" fill="${TINTA}">
  ${r(-30, -46, 60, 4)}
  ${r(-26, -42, 21, 8)}${r(-23, -34, 15, 3)}
  ${r(5, -42, 21, 8)}${r(8, -34, 15, 3)}
  <g class="cl-brillo" fill="#fff">${r(-22, -41, 3, 3)}${r(-19, -38, 3, 3)}${r(-16, -41, 3, 3)}${r(9, -41, 3, 3)}${r(12, -38, 3, 3)}${r(15, -41, 3, 3)}</g>
</g>`

/** Estrellita de pixel: cruz de cinco cuadros. */
const destello = (x, y, cls) => `<g class="${cls}" fill="${AZUL}">${r(x - 1.5, y - 7.5, 3, 4.5)}${r(x - 1.5, y + 3, 3, 4.5)}${r(x - 7.5, y - 1.5, 4.5, 3)}${r(x + 3, y - 1.5, 4.5, 3)}${r(x - 1.5, y - 1.5, 3, 3)}</g>`

/** Polvo: tres aros que se abren y se desvanecen. */
const polvo = (cls) => `<g class="es-polvo ${cls}">${[0, 1, 2].map(() => `<circle cx="0" cy="${SUELO - 3}" r="3.2" fill="none" stroke="${TINTA}" stroke-width="1.4"/>`).join('')}</g>`

export function firma() {
  return `<div class="crm-firma">
    <svg class="crm-escena" viewBox="0 0 360 150" role="img" aria-label="Claude recibe una llamada de Soma, camina a la computadora, escribe el programa y lo entrega.">
      <!-- el piso -->
      ${boil(P.line(6, SUELO, 354, SUELO, 14), { amp: 0.9, cls: 'es-trazo', seed: 801 })}

      <!-- la mesita del teléfono -->
      ${boil([P.line(36, 100, 66, 100, 3), P.line(51, 100, 51, SUELO, 3), P.line(43, SUELO, 59, SUELO, 2)], { amp: 0.5, cls: 'es-trazo', seed: 802 })}
      <g class="es-timbre">${boil([P.arc(50, 88, 15, 205, 250, 4), P.arc(50, 88, 15, 290, 335, 4)], { amp: 0.5, cls: 'es-trazo', seed: 803 })}${boil([P.arc(50, 88, 22, 210, 245, 4), P.arc(50, 88, 22, 295, 330, 4)], { amp: 0.5, cls: 'es-trazo es-tenue', seed: 804 })}</g>
      <g class="es-tel" fill="${TINTA}">${r(45, 81, 10, 18, 'rx="1.5"')}<rect x="47" y="84" width="6" height="9" fill="#efece4"/><rect class="es-tel-luz" x="47" y="84" width="6" height="9" fill="${AZUL}" opacity="0"/></g>

      <!-- quién llama: Soma -->
      <g class="es-globo">
        ${boil([P.circle(30, 44, 17, 14), P.line(40, 58, 47, 69, 2)], { amp: 0.6, cls: 'es-trazo', seed: 805 })}
        <circle cx="30" cy="44" r="7.4" fill="none" stroke="${TINTA}" stroke-width="2.4"/><circle class="es-globo-punto" cx="30" cy="44" r="2.9" fill="${AZUL}"/>
        <g class="es-voz" fill="${AZUL}">${[0, 1, 2].map((i) => `<circle cx="${51 + i * 5}" cy="44" r="1.5"/>`).join('')}</g>
      </g>

      <!-- el escritorio y la computadora -->
      ${boil([P.line(254, 108, 350, 108, 5), P.line(262, 108, 262, SUELO, 3), P.line(342, 108, 342, SUELO, 3)], { amp: 0.6, cls: 'es-trazo', seed: 806 })}
      <rect class="es-brillo" x="280" y="62" width="52" height="34" fill="${AZUL}" opacity="0"/>
      ${boil([P.line(278, 60, 334, 60, 4), P.line(334, 60, 334, 98, 3), P.line(334, 98, 278, 98, 4), P.line(278, 98, 278, 60, 3), P.line(306, 98, 306, 108, 2), P.line(296, 108, 316, 108, 2)], { amp: 0.6, cls: 'es-trazo', seed: 807 })}
      <g class="es-teclado">${boil([P.line(262, 104, 290, 104, 3)], { amp: 0.3, cls: 'es-trazo', seed: 808 })}</g>
      <g class="es-teclas" fill="${TINTA}">${[266, 274, 282].map((x) => r(x, 99, 2.5, 2.5)).join('')}</g>
      <g class="es-codigo">
        ${r(284, 67, 30, 3, `fill="${TINTA}"`)}
        ${r(290, 74, 22, 3, `fill="${TINTA}"`)}
        ${r(290, 81, 36, 3, `fill="${AZUL}"`)}
        ${r(284, 88, 18, 3, `fill="${TINTA}"`)}
      </g>
      <rect class="es-cursor" x="304" y="88" width="3" height="3" fill="${TINTA}"/>
      <rect class="es-carga-marco" x="284" y="92" width="44" height="2" fill="${TINTA}" opacity="0.14"/>
      <rect class="es-carga" x="284" y="92" width="44" height="2" fill="${AZUL}"/>
      <g class="es-listo"><circle cx="306" cy="79" r="11" fill="none" stroke="${TINTA}" stroke-width="3.6"/><circle class="es-listo-punto" cx="306" cy="79" r="4.3" fill="${AZUL}"/></g>
      <g class="es-confeti">${[NARANJA, AZUL, TINTA, AZUL, NARANJA, TINTA, AZUL, NARANJA, TINTA, AZUL].map((c) => r(304.5, 77.5, 3, 3, `fill="${c}"`)).join('')}</g>

      ${polvo('es-polvo-a')}${polvo('es-polvo-b')}

      <!-- Claude -->
      <g class="cl-pos">
        <ellipse class="cl-sombra" cx="0" cy="${SUELO + 1}" rx="27" ry="3" fill="${TINTA}" opacity="0.13"/>
        <g class="cl" shape-rendering="crispEdges">
          <g class="cl-masa">
            <g class="cl-patas" fill="${NARANJA}">${[-21, -9, 3, 15].map((x) => r(x, -12, 6, 12, 'class="cl-pata"')).join('')}</g>
            <g class="cl-cuerpo">
              <rect class="cl-brazo cl-brazo-i" x="-36" y="-38" width="9" height="12" fill="${NARANJA}"/>
              <rect class="cl-brazo cl-brazo-d" x="27" y="-38" width="9" height="12" fill="${NARANJA}"/>
              ${r(-27, -54, 54, 42, `fill="${NARANJA}"`)}
              <g class="cl-mirada"><g class="cl-ojos" fill="${TINTA}">${r(-16, -42, 7, 8)}${r(9, -42, 7, 8)}</g></g>
              <g class="cl-feliz" fill="none" stroke="${TINTA}" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter" shape-rendering="geometricPrecision"><polyline points="-17,-42 -10,-38 -17,-34"/><polyline points="17,-42 10,-38 17,-34"/></g>
              ${lentes()}
              <g class="cl-alerta" fill="${TINTA}">${r(-2, -78, 4, 10)}${r(-2, -65, 4, 4)}</g>
              ${destello(31, -60, 'cl-destello')}
            </g>
          </g>
        </g>
      </g>
    </svg>
    <p class="crm-firma-t">Soma puede resolver todo lo que quieras, <b>sólo llámanos.</b></p>
  </div>`
}

let viva = null

/** Arranca la escena dentro de `raiz`. Devuelve cómo detenerla. */
export function montarFirma(raiz) {
  viva?.()
  const el = raiz?.querySelector('.crm-escena')
  if (!el) return () => {}
  const $ = (s) => el.querySelector(s)
  const $$ = (s) => [...el.querySelectorAll(s)]
  const pos = $('.cl-pos')
  const cl = $('.cl')
  const masa = $('.cl-masa')
  const cuerpo = $('.cl-cuerpo')
  const sombra = $('.cl-sombra')
  const mirada = $('.cl-mirada')
  const ojos = $$('.cl-ojos rect')
  const patas = $$('.cl-pata')
  const brazoI = $('.cl-brazo-i')
  const brazoD = $('.cl-brazo-d')
  const tel = $('.es-tel')
  const lineas = $$('.es-codigo rect')
  const teclas = $$('.es-teclas rect')
  const confeti = $$('.es-confeti rect')
  const llamanos = el.parentElement.querySelector('.crm-firma-t b')

  const X0 = 128 // donde espera
  const XTEL = 92 // junto al teléfono
  const XPC = 236 // frente a la computadora

  // Estado de reposo. Primero se limpia lo que haya dejado una escena anterior a medio movimiento.
  const todo = el.querySelectorAll('*')
  gsap.killTweensOf(todo)
  gsap.set(todo, { clearProps: 'transform,opacity,visibility' })
  gsap.set(pos, { x: X0 })
  gsap.set(cl, { y: SUELO })
  gsap.set(masa, { transformOrigin: '50% 100%' })
  gsap.set(cuerpo, { transformOrigin: '50% 100%' })
  gsap.set(sombra, { transformOrigin: '50% 50%' })
  gsap.set(ojos, { transformOrigin: '50% 50%' })
  gsap.set(tel, { transformOrigin: '50% 100%' })
  gsap.set([$('.cl-feliz'), $('.cl-lentes'), $('.cl-alerta'), $('.cl-destello'), $('.es-globo'), $('.es-listo'), $('.es-timbre'), $('.es-cursor'), $('.es-carga-marco'), ...teclas, ...confeti], { autoAlpha: 0 })
  gsap.set($('.cl-lentes'), { y: -40, rotation: -18, transformOrigin: '50% 50%' })
  gsap.set($('.cl-alerta'), { transformOrigin: '50% 100%' })
  gsap.set($('.cl-destello'), { transformOrigin: '50% 50%', scale: 0 })
  gsap.set(lineas, { scaleX: 0, transformOrigin: '0% 50%' })
  gsap.set($('.es-carga'), { scaleX: 0, transformOrigin: '0% 50%' })
  gsap.set($('.es-globo'), { scale: 0, transformOrigin: '85% 100%' })
  gsap.set($$('.es-voz circle'), { autoAlpha: 0.25 })
  gsap.set($$('.es-polvo circle'), { autoAlpha: 0, transformOrigin: '50% 50%' })

  // Respira: un vaivén mínimo, siempre.
  const respira = gsap.to(cuerpo, { scaleY: 1.025, duration: 1.15, ease: 'sine.inOut', yoyo: true, repeat: -1 })

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.9, defaults: { ease: 'power2.out' } })

  const parpadea = (t) => tl.to(ojos, { scaleY: 0.12, duration: 0.06, yoyo: true, repeat: 1, ease: 'none' }, t)
  const mira = (t, lado) => tl.to(mirada, { x: 3 * lado, y: lado ? -0.5 : 0, duration: 0.16, ease: 'power3.out' }, t)

  /** Salto con anticipación, estiramiento en el aire y aplaste al caer. */
  function salta(t, alto = 12, aire = 0.36) {
    tl.to(masa, { scaleY: 0.8, scaleX: 1.14, duration: 0.1, ease: 'power2.out' }, t)
    tl.to(masa, { scaleY: 1.12, scaleX: 0.92, duration: 0.12, ease: 'power2.out' }, t + 0.1)
    tl.to(masa, { scaleY: 1, scaleX: 1, duration: aire / 2, ease: 'sine.inOut' }, t + 0.22)
    tl.to(cl, { y: SUELO - alto, duration: aire / 2, ease: 'power2.out' }, t + 0.1)
    tl.to(cl, { y: SUELO, duration: aire / 2, ease: 'power2.in' }, t + 0.1 + aire / 2)
    tl.to(sombra, { scaleX: 0.62, opacity: 0.06, duration: aire / 2, ease: 'power2.out' }, t + 0.1)
    tl.to(sombra, { scaleX: 1, opacity: 0.13, duration: aire / 2, ease: 'power2.in' }, t + 0.1 + aire / 2)
    aterriza(t + 0.1 + aire)
  }

  /** El aplaste al tocar el piso, con un rebote elástico. */
  function aterriza(t, fuerza = 1) {
    tl.to(masa, { scaleY: 1 - 0.16 * fuerza, scaleX: 1 + 0.1 * fuerza, duration: 0.07, ease: 'power2.out' }, t)
    tl.to(masa, { scaleY: 1, scaleX: 1, duration: 0.45, ease: 'elastic.out(1.1, 0.4)' }, t + 0.07)
  }

  /** Polvo que sale de las patas, hacia atrás de donde va. */
  function levantaPolvo(t, cual, x, lado) {
    const aros = $$(`.${cual} circle`)
    tl.set($(`.${cual}`), { x: x - 14 * lado }, t)
    tl.fromTo(aros, { autoAlpha: 0.7, scale: 0.3, x: 0, y: 0 }, { autoAlpha: 0, scale: 1.6, x: (i) => -lado * (4 + i * 5), y: (i) => -(1 + i * 2.5), duration: 0.55, ease: 'power2.out', stagger: 0.04, immediateRender: false }, t)
  }

  /** Camina: se inclina hacia donde va, alterna las patas y se balancea; frena con un rebote. */
  function camina(t, desde, hasta, dur) {
    const lado = hasta > desde ? 1 : -1
    const paso = 0.13
    const pasos = Math.max(2, Math.round(dur / paso))
    mira(t - 0.12, lado)
    tl.to(masa, { scaleY: 0.9, scaleX: 1.06, duration: 0.09 }, t - 0.06)
    tl.to(masa, { scaleY: 1, scaleX: 1, duration: 0.2 }, t + 0.03)
    tl.to(cuerpo, { rotation: 7 * lado, duration: 0.18, ease: 'power2.out' }, t)
    tl.to(pos, { x: hasta, duration: dur, ease: 'power1.inOut' }, t)
    tl.to([patas[0], patas[2]], { y: -4, duration: paso / 2, yoyo: true, repeat: pasos * 2 - 1, ease: 'sine.inOut' }, t)
    tl.to([patas[1], patas[3]], { y: -4, duration: paso / 2, yoyo: true, repeat: pasos * 2 - 1, ease: 'sine.inOut' }, t + paso / 2)
    tl.to(cl, { y: SUELO - 2, duration: paso / 2, yoyo: true, repeat: pasos * 2 - 1, ease: 'sine.inOut' }, t)
    tl.set(patas, { y: 0 }, t + dur + 0.01)
    tl.set(cl, { y: SUELO }, t + dur + 0.01)
    levantaPolvo(t, 'es-polvo-a', desde, lado)
    // Frena: el cuerpo se va de largo y regresa.
    tl.to(cuerpo, { rotation: -5 * lado, duration: 0.14, ease: 'power2.out' }, t + dur - 0.05)
    tl.to(cuerpo, { rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.45)' }, t + dur + 0.09)
    levantaPolvo(t + dur - 0.02, 'es-polvo-b', hasta, -lado)
  }

  // ── 1 · Espera. Suena el teléfono ──
  parpadea(0.55)
  mira(0.9, 0)
  tl.to($('.es-timbre'), { autoAlpha: 1, duration: 0.08 }, 1.0)
  tl.to($('.es-tel-luz'), { opacity: 0.85, duration: 0.12, yoyo: true, repeat: 7, ease: 'none' }, 1.0)
  tl.fromTo($('.es-timbre'), { scale: 0.82, transformOrigin: '50% 100%' }, { scale: 1.14, duration: 0.17, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 1.0)
  // El teléfono brinca en su lugar con cada timbrazo.
  ;[1.0, 1.36, 1.72].forEach((t) => {
    tl.to(tel, { y: -4, rotation: 10, duration: 0.07, ease: 'power2.out' }, t)
    tl.to(tel, { rotation: -10, duration: 0.07, ease: 'sine.inOut' }, t + 0.07)
    tl.to(tel, { y: 0, rotation: 0, duration: 0.12, ease: 'bounce.out' }, t + 0.14)
  })
  // «Sólo llámanos» suena también.
  if (llamanos) tl.to(llamanos, { x: 1.4, duration: 0.045, yoyo: true, repeat: 15, ease: 'none' }, 1.0).set(llamanos, { x: 0 }, 1.75)
  // Se da cuenta.
  mira(1.15, -1)
  tl.to($('.cl-alerta'), { autoAlpha: 1, duration: 0.01 }, 1.22)
  tl.fromTo($('.cl-alerta'), { scaleY: 0.2 }, { scaleY: 1, duration: 0.4, ease: 'elastic.out(1.2, 0.4)' }, 1.22)
  tl.to(ojos, { scale: 1.3, duration: 0.12 }, 1.22)
  salta(1.3, 13)
  tl.to(ojos, { scale: 1, duration: 0.2 }, 1.75)
  tl.to($('.cl-alerta'), { autoAlpha: 0, y: -4, duration: 0.2 }, 1.85)

  // ── 2 · Va por él y contesta ──
  camina(2.0, X0, XTEL, 0.62)
  tl.to($('.es-timbre'), { autoAlpha: 0, duration: 0.12 }, 2.6)
  tl.to([brazoI, tel], { y: -10, duration: 0.24, ease: 'back.out(2.6)' }, 2.72)
  tl.to(tel, { x: 4, rotation: 16, duration: 0.24, ease: 'back.out(2)' }, 2.72)
  tl.to(cuerpo, { rotation: -6, duration: 0.3 }, 2.78)
  tl.to($('.es-globo'), { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(2.2)' }, 2.9)
  // Soma habla: los puntos se encienden en ola y Claude asiente al ritmo.
  tl.to($$('.es-voz circle'), { autoAlpha: 1, duration: 0.14, yoyo: true, repeat: 5, stagger: 0.1, ease: 'sine.inOut' }, 3.2)
  tl.to($('.es-globo-punto'), { scale: 1.5, transformOrigin: '50% 50%', duration: 0.16, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 3.2)
  tl.to(cuerpo, { y: 2.5, duration: 0.13, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 3.45)
  parpadea(3.25)
  // Le gustó el encargo.
  tl.set($('.cl-ojos'), { autoAlpha: 0 }, 4.25).set($('.cl-feliz'), { autoAlpha: 1 }, 4.25)
  salta(4.25, 8, 0.3)

  // ── 3 · Cuelga y se va a trabajar ──
  tl.to($('.es-globo'), { scale: 0, autoAlpha: 0, duration: 0.22, ease: 'back.in(2)' }, 4.95)
  tl.to([brazoI, tel], { y: 0, duration: 0.2, ease: 'power2.in' }, 5.05)
  tl.to(tel, { x: 0, rotation: 0, duration: 0.2, ease: 'power2.in' }, 5.05)
  tl.to(tel, { y: -2, duration: 0.05, yoyo: true, repeat: 1 }, 5.25)
  tl.to(cuerpo, { rotation: 0, duration: 0.2 }, 5.05)
  tl.set($('.cl-feliz'), { autoAlpha: 0 }, 5.35).set($('.cl-ojos'), { autoAlpha: 1 }, 5.35)
  camina(5.55, XTEL, XPC, 1.2)

  // ── 4 · Escribe el programa ──
  const T = 7.05
  tl.to(cuerpo, { rotation: 4, duration: 0.3, ease: 'power2.out' }, T - 0.15)
  tl.to(mirada, { x: 3, y: -1.5, duration: 0.2 }, T - 0.15)
  tl.to($('.es-brillo'), { opacity: 0.09, duration: 0.5 }, T - 0.1)
  tl.set($('.es-cursor'), { autoAlpha: 1, x: -20, y: -21 }, T - 0.1)
  tl.to(brazoD, { y: 4, duration: 0.065, yoyo: true, repeat: 39, ease: 'sine.inOut' }, T)
  tl.to(brazoI, { y: 4, duration: 0.065, yoyo: true, repeat: 39, ease: 'sine.inOut' }, T + 0.065)
  tl.to($('.es-teclado'), { y: 0.8, duration: 0.065, yoyo: true, repeat: 39, ease: 'none' }, T)
  // Las teclas saltan como chispas.
  for (let i = 0; i < 12; i++) {
    const k = teclas[(i * 2) % 3]
    tl.fromTo(k, { autoAlpha: 1, y: 0, x: 0 }, { autoAlpha: 0, y: -7 - (i % 3) * 2, x: (i % 2 ? 1 : -1) * 2, duration: 0.3, ease: 'power2.out', immediateRender: false }, T + i * 0.21)
  }
  const anchos = [30, 22, 36, 18]
  const sangria = [0, 6, 6, 0]
  lineas.forEach((l, i) => {
    const t = T + 0.05 + i * 0.62
    const n = Math.round(anchos[i] / 3)
    tl.set($('.es-cursor'), { x: sangria[i] - 20, y: i * 7 - 21 }, t)
    tl.to(l, { scaleX: 1, duration: 0.48, ease: `steps(${n})` }, t)
    tl.to($('.es-cursor'), { x: sangria[i] - 20 + anchos[i] + 1, duration: 0.48, ease: `steps(${n})` }, t)
  })
  parpadea(T + 1.2)
  tl.to(mirada, { x: 1, y: 0, duration: 0.18 }, T + 2.3)

  // ── 5 · Compila: la barra se llena, contiene el aliento ──
  const C = T + 2.65
  tl.to(brazoI, { y: 0, duration: 0.15 }, C).to(brazoD, { y: 0, duration: 0.15 }, C)
  tl.to($('.es-cursor'), { autoAlpha: 0, duration: 0.1 }, C)
  tl.to($('.es-carga-marco'), { autoAlpha: 1, duration: 0.15 }, C)
  tl.to($('.es-carga'), { scaleX: 0.55, duration: 0.35, ease: 'power2.out' }, C + 0.05)
  tl.to($('.es-carga'), { scaleX: 0.62, duration: 0.3, ease: 'none' }, C + 0.4)
  tl.to($('.es-carga'), { scaleX: 1, duration: 0.18, ease: 'power3.in' }, C + 0.7)
  tl.to(masa, { scaleY: 0.94, scaleX: 1.04, duration: 0.5, ease: 'sine.inOut' }, C + 0.3)
  tl.to(mirada, { y: -2, duration: 0.2 }, C + 0.3)

  // ── 6 · ¡Listo! El programa corre, confeti, y caen los lentes ──
  const L = C + 0.95
  tl.to([...lineas, $('.es-carga'), $('.es-carga-marco')], { autoAlpha: 0, duration: 0.15 }, L)
  tl.to($('.es-brillo'), { opacity: 0.2, duration: 0.08, yoyo: true, repeat: 1 }, L)
  tl.fromTo($('.es-listo'), { autoAlpha: 0, scale: 0.4, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.55, ease: 'back.out(2.6)', immediateRender: false }, L + 0.05)
  tl.fromTo($('.es-listo-punto'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.45, ease: 'back.out(3)', immediateRender: false }, L + 0.22)
  confeti.forEach((c, i) => {
    const dx = (i - 4.5) * 7 + (i % 3) * 2
    const alto = 22 + (i % 4) * 6
    tl.set(c, { autoAlpha: 1, x: 0, y: 0, rotation: 0 }, L + 0.1)
    tl.to(c, { x: dx, rotation: (i % 2 ? 1 : -1) * (180 + i * 30), duration: 1.1, ease: 'none' }, L + 0.1)
    tl.to(c, { y: -alto, duration: 0.32, ease: 'power2.out' }, L + 0.1)
    tl.to(c, { y: 44, duration: 0.78, ease: 'power2.in' }, L + 0.42)
    tl.to(c, { autoAlpha: 0, duration: 0.25 }, L + 0.95)
  })
  tl.to(cuerpo, { rotation: 0, duration: 0.2 }, L)
  tl.to(mirada, { x: 0, y: 0, duration: 0.15 }, L + 0.1)
  salta(L + 0.1, 14, 0.38)
  // Los lentes caen girando y asientan con un golpe.
  const G = L + 0.75
  tl.to($('.cl-lentes'), { autoAlpha: 1, duration: 0.05 }, G)
  tl.to($('.cl-lentes'), { y: 0, rotation: 0, duration: 0.34, ease: 'power3.in' }, G)
  aterriza(G + 0.34, 0.6)
  tl.to($('.cl-lentes'), { y: -2.5, duration: 0.08, yoyo: true, repeat: 1, ease: 'power2.out' }, G + 0.34)
  tl.to([brazoI, brazoD], { y: -14, duration: 0.3, ease: 'back.out(3)' }, G + 0.45)
  tl.to([brazoI, brazoD], { y: -10, duration: 0.18, yoyo: true, repeat: 3, ease: 'sine.inOut' }, G + 0.75)
  tl.to($('.cl-destello'), { autoAlpha: 1, scale: 1, rotation: 90, duration: 0.35, ease: 'back.out(3)' }, G + 0.55)
  tl.to($('.cl-destello'), { scale: 0, rotation: 180, autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, G + 1.0)
  tl.fromTo($('.cl-brillo'), { autoAlpha: 0.25 }, { autoAlpha: 1, duration: 0.1, yoyo: true, repeat: 3, ease: 'none', immediateRender: false }, G + 0.6)
  tl.to($('.es-listo-punto'), { scale: 1.35, duration: 0.3, yoyo: true, repeat: 3, ease: 'sine.inOut' }, G + 0.6)

  // ── 7 · Regresa a su lugar, a esperar la siguiente llamada ──
  const R = G + 2.1
  tl.to([brazoI, brazoD], { y: 0, duration: 0.2 }, R)
  tl.to($('.cl-lentes'), { y: -40, rotation: 14, autoAlpha: 0, duration: 0.35, ease: 'power2.in' }, R)
  tl.to($('.es-listo'), { autoAlpha: 0, scale: 0.6, duration: 0.3, ease: 'power2.in' }, R + 0.1)
  tl.to($('.es-brillo'), { opacity: 0, duration: 0.4 }, R + 0.1)
  tl.set(lineas, { scaleX: 0, autoAlpha: 1 }, R + 0.4)
  tl.set($('.es-carga'), { scaleX: 0, autoAlpha: 1 }, R + 0.4)
  camina(R + 0.35, XPC, X0, 1.05)
  mira(R + 1.6, 0)

  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (quieto) {
    // Sin movimiento: la pose final, con los lentes puestos.
    tl.pause(G + 1.2)
    respira.pause()
  }

  // Para revisar la escena cuadro por cuadro (scripts de captura).
  el._linea = tl

  // Solo corre mientras se ve.
  const ojo = new IntersectionObserver(([e]) => {
    if (quieto) return
    e.isIntersecting ? (tl.play(), respira.play()) : (tl.pause(), respira.pause())
  })
  ojo.observe(el)

  viva = () => {
    ojo.disconnect()
    tl.kill()
    respira.kill()
    if (llamanos) gsap.set(llamanos, { clearProps: 'transform' })
    viva = null
  }
  return viva
}
