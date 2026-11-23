import { lienzo, punto, pon, raya, caja, linea, elipse, sombra, calca, gira, frena, rebota, tramo, ahora, fraccion } from './pixel.js'
import { W, H, DALI, busto, golpe, destello, confeti, rotulo, dobla, rayosDeFoco, PALOMA, montaje } from './reparto.js'

// «Se acerca el día»: la película de la ficha de Por cobrar. El plazo corre, Dalí avisa a
// tiempo y el cliente paga.
//
//   1  detalle        el reloj de arena: caen los últimos granos
//   2  detalle        el calendario se deshoja: 3, 2, 1
//   3  primer plano   Dalí lo ve… y saca el teléfono
//   4  detalle        el chat: escribe, envía, «visto», y la respuesta
//   5  general        pagado: el sello, la campana y el reloj que se voltea

/** Un reloj de arena grande, con centro en cx. `k` es cuánta arena ya cayó (0 a 1). */
function relojDeArena(L, cx, k, f = 0) {
  // Las tapas.
  caja(L, cx - 14, 1, 29, 3, 'k')
  caja(L, cx - 14, 29, 29, 3, 'k')
  caja(L, cx - 12, 2, 25, 1, 'D')
  const medio = (y) => (y <= 15 ? Math.round(12 - (y - 4) * 0.95) : Math.round(1 + (y - 17) * 0.95))
  // El vidrio.
  for (let y = 4; y <= 28; y++) {
    const m = y === 16 ? 1 : medio(y)
    raya(L, cx - m, cx + m, y, 'R')
    punto(L, cx - m - 1, y, 'k')
    punto(L, cx + m + 1, y, 'k')
  }
  // La arena de arriba baja y se hunde por el centro; la de abajo crece en montón.
  const nivel = 5 + k * 11
  for (let y = 4; y <= 15; y++) {
    const m = medio(y)
    for (let x = -m; x <= m; x++) if (y >= nivel + Math.max(0, 2 - Math.abs(x) * 0.5)) punto(L, cx + x, y, 'y')
  }
  const altura = k * 10
  for (let y = 17; y <= 28; y++) {
    const m = medio(y)
    for (let x = -m; x <= m; x++) if (28 - y <= altura - Math.abs(x) * 0.45) punto(L, cx + x, y, 'y')
  }
  // El hilo que cae, y granos que rebotan.
  if (k > 0 && k < 1) {
    for (let y = 15; y <= 28 - altura; y++) if ((y + f) % 2) punto(L, cx, y, 'y')
    punto(L, cx - 2 - (f % 3), 27 - altura - (f % 2), 'y')
    punto(L, cx + 2 + ((f + 1) % 3), 27 - altura - ((f + 1) % 2), 'y')
  }
  // Un brillo en el vidrio.
  linea(L, cx - 8, 6, cx - 5, 10, 'w')
  linea(L, cx - 6, 24, cx - 8, 26, 'w')
}

/** 1 · Detalle: el reloj de arena. */
function planoArena(L, f, n) {
  const k = 0.45 + tramo(f, 0, n - 3) * 0.55
  relojDeArena(L, 42, k, f)
  // Cuando ya casi no queda, los avisos a los lados.
  if (f >= n - 8 && f % 4 < 2) {
    rotulo(L, '!', 12, 9, 'w', 3)
    rotulo(L, '!', 62, 9, 'w', 3)
  }
  if (f >= n - 3) {
    golpe(L, 42, 16, 5 + (f - n + 3) * 3)
    return [f % 2 ? 1 : -1, 0]
  }
  return null
}

/** Una hoja de calendario con su número grande. */
function hoja(L, x, y, num, c = 'k') {
  caja(L, x, y, 40, 30, 'w')
  caja(L, x, y, 40, 6, 'k')
  caja(L, x + 8, y - 2, 3, 5, 'D')
  caja(L, x + 29, y - 2, 3, 5, 'D')
  if (num === 'ok') pon(L, dobla(PALOMA, 2), x + 11, y + 10)
  else rotulo(L, num, x + (num === '1' ? 15 : 14), y + 9, c, 4)
}

/** 2 · Detalle: el calendario se deshoja. */
function planoCalendario(L, f) {
  const PASO = 6
  const i = Math.min(2, Math.floor(f / PASO))
  const t = f - i * PASO
  const nums = ['3', '2', '1']
  const ultimo = i === 2
  hoja(L, 22, 5, nums[Math.min(2, i + (t >= 3 && !ultimo ? 1 : 0))], ultimo || (i === 1 && t >= 3) ? 'r' : 'k')
  // La hoja que se arranca: se dobla, se va de lado y cae girando.
  if (!ultimo && t >= 3) {
    const d = t - 3 + fraccion()
    const vuela = lienzo(W, H)
    hoja(vuela, 22, 5, nums[i])
    calca(L, gira(vuela, 12 + d * 16, 42, 20), 10 + d * 14, 2 + d * d * 4)
  } else if (!ultimo && t === 2) {
    pon(L, ['...D', '..DD', '.DDD', 'DDDD'], 58, 31)
  }
  // El uno, encerrado en rojo.
  if (ultimo) {
    const vuelta = tramo(f, 13, 17)
    for (let a = 0; a < vuelta * Math.PI * 2; a += 0.08) {
      const x = 42 + Math.cos(a - 1.6) * 15
      const y = 23 + Math.sin(a - 1.6) * 11
      caja(L, Math.round(x), Math.round(y), 2, 2, 'r')
    }
    if (f >= 17) return [f % 2 ? 1 : -1, 0]
  }
  return null
}

/** 3 · Primer plano: Dalí lo ve y saca el teléfono. */
function planoDecide(L, f) {
  const decide = f >= 7
  if (decide) rayosDeFoco(L, f)
  busto(L, 34, 8 + (f === 7 ? 1 : 0), DALI, {
    mira: decide ? 0 : -1,
    cejas: decide ? 2 : -1,
    boca: decide ? (f >= 11 ? 'sonrie' : 'neutra') : 'ups',
    cierra: f === 6,
    pelo: f === 7 ? 1 : 0,
  })
  // El teléfono sube a cuadro.
  if (f >= 9) {
    const s = rebota(tramo(f, 9, 14))
    const y = Math.round(34 - s * 22)
    linea(L, 62, 34, 60, y + 14, 'c', 5)
    caja(L, 53, y, 13, 22, 'k')
    caja(L, 54, y + 1, 11, 20, f % 2 ? 'b' : 'w')
    elipse(L, 55, y + 14, 3, 4, 'c')
    if (f >= 14) destello(L, 68, y - 1, 2)
  }
}

/** 4 · Detalle: el chat. */
function planoChat(L, f) {
  caja(L, 0, 0, W, H, 'p')
  // La barra de arriba, con la foto del cliente.
  caja(L, 0, 0, W, 6, 'z')
  elipse(L, 6, 3, 2, 2, 'w')
  raya(L, 11, 26, 2, 'w')
  raya(L, 11, 19, 4, 'b')
  // La caja de texto y el botón de enviar.
  caja(L, 2, 26, 68, 6, 'w')
  const enviado = f >= 9
  elipse(L, 77, 29, 3.4, 3.4, f === 9 ? 'w' : 'z')
  linea(L, 75, 29, 79, 29, 'w')
  linea(L, 77, 27, 79, 29, 'w')
  linea(L, 77, 31, 79, 29, 'w')
  if (!enviado) {
    // Escribiendo.
    const n = Math.min(54, Math.round(ahora(f) * 7))
    raya(L, 5, 5 + n, 28, 'D')
    if (n > 30) raya(L, 5, 5 + n - 30, 30, 'D')
    if (f % 2) punto(L, 7 + (n > 30 ? n - 30 : n), n > 30 ? 30 : 28, 'k')
    // El pulgar de Dalí.
    elipse(L, 60 + (f % 2) * 4, 33, 5, 4, 'c')
  } else {
    // El mensaje sale disparado a su lugar.
    const s = rebota(tramo(f, 9, 13))
    const y = Math.round(22 - s * 14)
    caja(L, 26, y, 54, 9, 'z')
    pon(L, ['z', 'zz', 'zzz'], 80, y + 6)
    raya(L, 29, 74, y + 2, 'w')
    raya(L, 29, 60, y + 4, 'w')
    // Las palomitas: una, dos, y azules cuando lo leen.
    if (f >= 13) {
      const c = f >= 17 ? 'b' : 'G'
      linea(L, 68, y + 7, 69, y + 7, c)
      linea(L, 69, y + 7, 71, y + 5, c)
      if (f >= 15) {
        linea(L, 72, y + 7, 73, y + 7, c)
        linea(L, 73, y + 7, 75, y + 5, c)
      }
    }
    // «Escribiendo…» y la respuesta.
    if (f >= 18 && f < 21) {
      caja(L, 3, 19, 14, 6, 'w')
      for (let i = 0; i < 3; i++) punto(L, 6 + i * 3, 22 - ((f + i) % 3 === 0 ? 1 : 0), 'D')
    }
    if (f >= 21) {
      const r = rebota(tramo(f, 21, 24))
      const w = Math.round(30 * r)
      caja(L, 3, 18, w + 2, 8, 'w')
      if (r > 0.8) {
        elipse(L, 8, 22, 3, 3, 'g')
        linea(L, 6, 22, 8, 24, 'w')
        linea(L, 8, 24, 10, 20, 'w')
        rotulo(L, '$', 14, 20, 'k')
        raya(L, 19, 30, 21, 'D')
        raya(L, 19, 26, 23, 'D')
      }
    }
  }
  if (f === 9) golpe(L, 77, 29, 6)
}

/** 5 · General: pagado. */
function planoPagado(L, f) {
  raya(L, 0, W - 1, 31, 'k')
  caja(L, 0, 32, W, 1, 's')
  // El reloj se voltea y vuelve a empezar.
  const reloj = lienzo(W, H)
  relojDeArena(reloj, 15, f < 8 ? 1 : 0, f)
  const g = f < 3 ? 0 : f < 8 ? (ahora(f) - 2) * 36 : 180
  calca(L, g % 180 === 0 ? reloj : gira(reloj, g, 15, 16), 0, f >= 3 && f < 8 ? -1 : 0)
  // El calendario, ya con su paloma.
  hoja(L, 29, 3, 'ok')
  // La campana.
  const suena = f >= 6 && f < 18
  const dx = suena ? (f % 2 ? 1 : -1) : 0
  pon(L, ['....k....', '...kyk...', '..kyyyk..', '..kywyk..', '..kyyyk..', '.kyyyyyk.', 'kyyyyyyyk', 'kkkkkkkkk', '...kyk...'], 69 + dx, 8)
  linea(L, 73, 3, 73, 7, 'k')
  if (suena) {
    punto(L, dx < 0 ? 66 : 80, 10, 'w')
    punto(L, dx < 0 ? 65 : 81, 13, 'w')
    punto(L, dx < 0 ? 66 : 80, 16, 'w')
  }
  // El sello cae en diagonal: OK.
  if (f >= 9) {
    const cae = rebota(tramo(f, 9, 12))
    const sello = lienzo(W, H)
    caja(sello, 30, 8, 38, 18, 'g')
    caja(sello, 32, 10, 34, 14, 'w')
    rotulo(sello, 'OK', 39, 12, 'g', 2)
    raya(sello, 34, 36, 17, 'g')
    raya(sello, 61, 63, 17, 'g')
    calca(L, sello, 0, Math.round((1 - cae) * -26))
    if (f >= 12) confeti(L, ahora(f) - 12)
    if (f === 12) {
      golpe(L, 30, 26, 9)
      golpe(L, 68, 8, 9)
      return [1, 2]
    }
    if (f === 13) return [-1, -1]
  }
  return null
}

const PLANOS = [
  [22, planoArena],
  [20, planoCalendario],
  [18, planoDecide],
  [28, planoChat],
  [26, planoPagado],
]

export const peliCobro = () => montaje('cobro', PLANOS, { s: '#c12e26', R: '#ffd9d2', r: '#d92a1c' }, 22 + 8)
