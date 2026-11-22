import gsap from 'gsap'
import { boil, P } from '../core/boil.js'

// La escena al pie de Ajustes: suena el teléfono, Claude contesta (llama Soma), camina a la
// computadora, escribe el programa y, al terminarlo, le caen los lentes.
// El personaje es lo único relleno; todo lo demás es trazo que hierve, como en el resto de Soma.

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

export function firma() {
  return `<div class="crm-firma">
    <svg class="crm-escena" viewBox="0 0 360 150" role="img" aria-label="Claude recibe una llamada de Soma, se sienta a la computadora y escribe el programa.">
      <!-- el piso -->
      ${boil(P.line(6, SUELO, 354, SUELO, 14), { amp: 0.9, cls: 'es-trazo', seed: 801 })}

      <!-- la mesita del teléfono -->
      ${boil([P.line(36, 100, 66, 100, 3), P.line(51, 100, 51, SUELO, 3), P.line(43, SUELO, 59, SUELO, 2)], { amp: 0.5, cls: 'es-trazo', seed: 802 })}
      <g class="es-timbre">${boil([P.arc(50, 88, 15, 205, 250, 4), P.arc(50, 88, 15, 290, 335, 4)], { amp: 0.5, cls: 'es-trazo', seed: 803 })}${boil([P.arc(50, 88, 22, 210, 245, 4), P.arc(50, 88, 22, 295, 330, 4)], { amp: 0.5, cls: 'es-trazo es-tenue', seed: 804 })}</g>
      <g class="es-tel" fill="${TINTA}">${r(45, 81, 10, 18, 'rx="1.5"')}<rect x="47" y="84" width="6" height="9" fill="#efece4"/></g>

      <!-- quién llama -->
      <g class="es-globo">
        ${boil([P.circle(30, 46, 17, 14), P.line(40, 60, 46, 70, 2)], { amp: 0.6, cls: 'es-trazo', seed: 805 })}
        <circle cx="30" cy="46" r="7.4" fill="none" stroke="${TINTA}" stroke-width="2.4"/><circle class="es-globo-punto" cx="30" cy="46" r="2.9" fill="${AZUL}"/>
      </g>

      <!-- el escritorio y la computadora -->
      ${boil([P.line(254, 108, 350, 108, 5), P.line(262, 108, 262, SUELO, 3), P.line(342, 108, 342, SUELO, 3)], { amp: 0.6, cls: 'es-trazo', seed: 806 })}
      ${boil([P.line(278, 60, 334, 60, 4), P.line(334, 60, 334, 98, 3), P.line(334, 98, 278, 98, 4), P.line(278, 98, 278, 60, 3), P.line(306, 98, 306, 108, 2), P.line(296, 108, 316, 108, 2)], { amp: 0.6, cls: 'es-trazo', seed: 807 })}
      ${boil([P.line(262, 104, 290, 104, 3)], { amp: 0.3, cls: 'es-trazo es-teclado', seed: 808 })}
      <g class="es-codigo">
        ${r(284, 67, 30, 3, `fill="${TINTA}"`)}
        ${r(290, 74, 22, 3, `fill="${TINTA}"`)}
        ${r(290, 81, 36, 3, `fill="${AZUL}"`)}
        ${r(284, 88, 18, 3, `fill="${TINTA}"`)}
      </g>
      <rect class="es-cursor" x="304" y="88" width="3" height="3" fill="${TINTA}"/>
      <g class="es-listo"><circle cx="306" cy="79" r="11" fill="none" stroke="${TINTA}" stroke-width="3.6"/><circle class="es-listo-punto" cx="306" cy="79" r="4.3" fill="${AZUL}"/></g>

      <!-- Claude -->
      <g class="cl" shape-rendering="crispEdges">
        <g class="cl-patas" fill="${NARANJA}">${[-21, -9, 3, 15].map((x) => r(x, -12, 6, 12, 'class="cl-pata"')).join('')}</g>
        <g class="cl-cuerpo">
          <rect class="cl-brazo cl-brazo-i" x="-36" y="-38" width="9" height="12" fill="${NARANJA}"/>
          <rect class="cl-brazo cl-brazo-d" x="27" y="-38" width="9" height="12" fill="${NARANJA}"/>
          ${r(-27, -54, 54, 42, `fill="${NARANJA}"`)}
          <g class="cl-ojos" fill="${TINTA}">${r(-16, -42, 7, 8)}${r(9, -42, 7, 8)}</g>
          <g class="cl-feliz" fill="none" stroke="${TINTA}" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter" shape-rendering="geometricPrecision"><polyline points="-17,-42 -10,-38 -17,-34"/><polyline points="17,-42 10,-38 17,-34"/></g>
          ${lentes()}
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
  const cl = $('.cl')
  const cuerpo = $('.cl-cuerpo')
  const patas = $$('.cl-pata')
  const brazoI = $('.cl-brazo-i')
  const brazoD = $('.cl-brazo-d')
  const tel = $('.es-tel')
  const lineas = $$('.es-codigo rect')

  const X0 = 128 // donde espera
  const XTEL = 92 // junto al teléfono
  const XPC = 236 // frente a la computadora

  gsap.set(cl, { x: X0, y: SUELO })
  gsap.set(cuerpo, { transformOrigin: '50% 100%' })
  gsap.set([$('.cl-feliz'), $('.cl-lentes'), $('.es-globo'), $('.es-listo'), $('.es-timbre'), $('.es-cursor')], { autoAlpha: 0 })
  gsap.set($('.cl-lentes'), { y: -34 })
  gsap.set(lineas, { scaleX: 0, transformOrigin: '0% 50%' })
  gsap.set($('.es-globo'), { scale: 0, transformOrigin: '80% 100%' })
  gsap.set(tel, { transformOrigin: '50% 100%' })
  gsap.set($$('.cl-ojos rect'), { transformOrigin: '50% 50%' })

  // Respira: un vaivén mínimo, siempre.
  const respira = gsap.to(cuerpo, { scaleY: 1.025, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1 })

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6, defaults: { ease: 'power2.out' } })
  const parpadea = (t) => tl.to($$('.cl-ojos rect'), { scaleY: 0.12, duration: 0.07, yoyo: true, repeat: 1, ease: 'none' }, t)
  const brinca = (t, alto = 9) => tl.to(cl, { y: SUELO - alto, duration: 0.16, ease: 'power2.out' }, t).to(cl, { y: SUELO, duration: 0.2, ease: 'bounce.out' }, t + 0.16)
  // Camina: las patas se alternan mientras el cuerpo avanza.
  function camina(t, hasta, dur) {
    const pasos = Math.max(2, Math.round(dur / 0.14))
    tl.to(cl, { x: hasta, duration: dur, ease: 'power1.inOut' }, t)
    tl.to([patas[0], patas[2]], { y: -4, duration: dur / pasos / 2, yoyo: true, repeat: pasos * 2 - 1, ease: 'sine.inOut' }, t)
    tl.to([patas[1], patas[3]], { y: -4, duration: dur / pasos / 2, yoyo: true, repeat: pasos * 2 - 1, ease: 'sine.inOut' }, t + dur / pasos / 2)
    tl.to(cuerpo, { y: -1.5, duration: dur / pasos / 2, yoyo: true, repeat: pasos * 2 - 1, ease: 'sine.inOut' }, t)
    tl.set(patas, { y: 0 }, t + dur + 0.02)
    tl.set(cuerpo, { y: 0 }, t + dur + 0.02)
  }

  // 1 · Espera. Suena el teléfono.
  parpadea(0.5)
  tl.to($('.es-timbre'), { autoAlpha: 1, duration: 0.1 }, 1.0)
  tl.to(tel, { rotation: 13, duration: 0.06, yoyo: true, repeat: 17, ease: 'sine.inOut' }, 1.0)
  tl.fromTo($('.es-timbre'), { scale: 0.85, transformOrigin: '50% 100%' }, { scale: 1.12, duration: 0.18, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 1.0)
  // Se da cuenta: brinco y ojos grandes.
  brinca(1.5, 11)
  tl.to($$('.cl-ojos rect'), { scale: 1.25, duration: 0.12, yoyo: true, repeat: 1 }, 1.5)

  // 2 · Va por él y contesta.
  camina(2.0, XTEL, 0.5)
  tl.to($('.es-timbre'), { autoAlpha: 0, duration: 0.12 }, 2.55)
  tl.to(tel, { rotation: 0, duration: 0.1 }, 2.55)
  tl.to([brazoI, tel], { y: -9, duration: 0.22, ease: 'back.out(2.5)' }, 2.6)
  tl.to(tel, { x: 4, rotation: 14, duration: 0.22 }, 2.6)
  tl.to(cuerpo, { rotation: -5, duration: 0.25 }, 2.6)
  tl.to($('.es-globo'), { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2.2)' }, 2.75)
  // Escucha: el punto de Soma late como una voz; Claude asiente.
  tl.to($('.es-globo-punto'), { scale: 1.5, transformOrigin: '50% 50%', duration: 0.16, yoyo: true, repeat: 7, ease: 'sine.inOut' }, 3.1)
  tl.to(cuerpo, { y: 2, duration: 0.14, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 3.4)
  parpadea(3.2)
  // Le gustó el encargo.
  tl.set($('.cl-ojos'), { autoAlpha: 0 }, 4.3).set($('.cl-feliz'), { autoAlpha: 1 }, 4.3)
  brinca(4.3, 7)

  // 3 · Cuelga y se va a trabajar.
  tl.to($('.es-globo'), { scale: 0, autoAlpha: 0, duration: 0.22, ease: 'power2.in' }, 4.95)
  tl.to([brazoI, tel], { y: 0, duration: 0.2 }, 5.05)
  tl.to(tel, { x: 0, rotation: 0, duration: 0.2 }, 5.05)
  tl.to(cuerpo, { rotation: 0, duration: 0.2 }, 5.05)
  tl.set($('.cl-feliz'), { autoAlpha: 0 }, 5.3).set($('.cl-ojos'), { autoAlpha: 1 }, 5.3)
  tl.to(cuerpo, { rotation: 5, duration: 0.2 }, 5.35)
  camina(5.4, XPC, 1.15)
  tl.to(cuerpo, { rotation: 0, duration: 0.25, ease: 'back.out(3)' }, 6.55)

  // 4 · Escribe el programa: los brazos se alternan y el código va saliendo.
  tl.set($('.es-cursor'), { autoAlpha: 1, x: -20, y: -21 }, 6.8)
  tl.to(brazoD, { y: 4, duration: 0.07, yoyo: true, repeat: 37, ease: 'sine.inOut' }, 6.85)
  tl.to(brazoI, { y: 4, duration: 0.07, yoyo: true, repeat: 37, ease: 'sine.inOut' }, 6.92)
  tl.to($('.es-teclado'), { y: 0.8, duration: 0.07, yoyo: true, repeat: 37, ease: 'none' }, 6.85)
  const anchos = [30, 22, 36, 18]
  const sangria = [0, 6, 6, 0]
  lineas.forEach((l, i) => {
    const t = 6.9 + i * 0.66
    tl.set($('.es-cursor'), { x: sangria[i] - 20, y: i * 7 - 21 }, t)
    tl.to(l, { scaleX: 1, duration: 0.5, ease: `steps(${Math.round(anchos[i] / 3)})` }, t)
    tl.to($('.es-cursor'), { x: sangria[i] - 20 + anchos[i] + 1, duration: 0.5, ease: `steps(${Math.round(anchos[i] / 3)})` }, t)
  })
  parpadea(8.0)
  tl.to($('.es-cursor'), { autoAlpha: 0, duration: 0.08, yoyo: true, repeat: 3, ease: 'none' }, 9.5)

  // 5 · Listo. El programa corre, y caen los lentes.
  tl.to([...lineas, $('.es-cursor')], { autoAlpha: 0, duration: 0.18 }, 9.9)
  tl.fromTo($('.es-listo'), { autoAlpha: 0, scale: 0.4, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2.4)' }, 10.0)
  tl.fromTo($('.es-listo-punto'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, 10.2)
  brinca(10.05, 8)
  tl.to($('.cl-lentes'), { autoAlpha: 1, duration: 0.08 }, 10.45)
  tl.to($('.cl-lentes'), { y: 0, duration: 0.5, ease: 'bounce.out' }, 10.45)
  tl.to([brazoI, brazoD], { y: -7, duration: 0.3, ease: 'back.out(3)' }, 10.75)
  tl.fromTo($('.cl-brillo'), { autoAlpha: 0.2 }, { autoAlpha: 1, duration: 0.12, yoyo: true, repeat: 3, ease: 'none' }, 11.0)
  tl.to($('.es-listo-punto'), { scale: 1.35, duration: 0.3, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 11.0)

  // 6 · Vuelve a su lugar, a esperar la siguiente llamada.
  tl.to([brazoI, brazoD], { y: 0, duration: 0.2 }, 12.6)
  tl.to($('.cl-lentes'), { y: -34, autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, 12.6)
  tl.to($('.es-listo'), { autoAlpha: 0, scale: 0.6, duration: 0.3, ease: 'power2.in' }, 12.7)
  tl.set(lineas, { scaleX: 0, autoAlpha: 1 }, 13.0)
  camina(12.95, X0, 1.0)

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Sin movimiento: la pose final, con los lentes puestos.
    tl.pause(11.6)
    respira.pause()
  }

  // Solo corre mientras se ve.
  const ojo = new IntersectionObserver(([e]) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    e.isIntersecting ? (tl.play(), respira.play()) : (tl.pause(), respira.pause())
  })
  ojo.observe(el)

  viva = () => {
    ojo.disconnect()
    tl.kill()
    respira.kill()
    viva = null
  }
  return viva
}
