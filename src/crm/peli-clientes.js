import { lienzo, punto, pon, raya, caja, linea, elipse, sombra, suave, frena, rebota, tramo, ahora, fraccion } from './pixel.js'
import { W, H, ALEX, AGENTE, AGENTE_2, busto, nuca, mini, miniIzq, globo, golpe, destello, confeti, rotulo, rayosDeFoco, CORAZON, montaje } from './reparto.js'

// «Los agentes»: la película de la ficha de Clientes. Los clientes llegan de traje y lentes
// oscuros, exigen para ayer, y se van encantados.
//
//   1  general        Alex teclea tranquilo; entran tres de traje
//   2  contrapicado   el jefe, visto desde abajo; le cruza un destello por los lentes
//   3  desde arriba   la carpeta cae en el escritorio: «¡YA!»
//   4  primer plano   Alex traga saliva… y se pone serio
//   5  sobre el hombro  la pantalla: el código corre, la barra se llena, listo
//   6  tres caras     el jefe se baja los lentes: le encantó
//   7  detalle        el apretón de manos

/** 1 · General: la oficina. */
function planoOficina(L, f) {
  // El logo en la pared, la ventana y una planta.
  elipse(L, 9, 8, 4, 4, 'k')
  elipse(L, 9, 8, 2.6, 2.6, 'p')
  elipse(L, 9, 8, 1, 1, 'z')
  caja(L, 58, 3, 22, 13, 'k')
  caja(L, 59, 4, 20, 11, 'b')
  caja(L, 68, 4, 1, 11, 'k')
  raya(L, 59, 78, 9, 'k')
  raya(L, 0, W - 1, 27, 'k')
  caja(L, 0, 28, W, 5, 'x')
  for (let x = 6; x < W; x += 14) caja(L, x, 28, 1, 5, 'X')
  caja(L, 2, 21, 5, 6, 'r')
  elipse(L, 4, 17, 3, 4, 'q')
  elipse(L, 3, 15, 1.4, 2, 'g')
  // La silla y Alex, sentado de perfil.
  caja(L, 19, 13, 2, 14, 'd')
  caja(L, 19, 21, 9, 2, 'd')
  const susto = f >= 19 && f < 22 ? 1 : 0
  caja(L, 22, 14 - susto, 6, 8, ALEX.ropa)
  caja(L, 27, 14 - susto, 1, 8, ALEX.ropa2)
  pon(L, ALEX.cabecita, 21, 8 - susto)
  // Las manos van y vienen sobre el teclado.
  const m = f % 2
  linea(L, 27, 16 - susto, 32 + m, 18, ALEX.ropa)
  punto(L, 33 + m, 18, 'e')
  punto(L, 35 - m, 18, 'e')
  // El escritorio y la laptop.
  caja(L, 30, 19, 22, 1, 'k')
  caja(L, 31, 20, 20, 7, 'o')
  caja(L, 31, 20, 1, 7, 'O')
  caja(L, 50, 20, 1, 7, 'O')
  raya(L, 34, 40, 18, 'd')
  linea(L, 40, 18, 42, 11, 'd', 2)
  linea(L, 39, 17, 41, 12, f % 3 ? 'b' : 'w')
  // El café, humeando.
  caja(L, 46, 16, 3, 3, 'w')
  punto(L, 47 + (f % 2), 14 - (f % 3), 'w')
  // Entran tres de traje, en fila.
  const k = frena(tramo(f, 6, 22))
  const anda = f >= 6 && f < 22
  ;[
    [74, AGENTE_2, 2.2],
    [66, AGENTE, 1.1],
    [58, AGENTE, 0],
  ].forEach(([x, P, des]) => miniIzq(L, x + (1 - k) * 34, 27, P, ahora(f) * 0.9 + des, anda))
  // Alex se da cuenta.
  if (f >= 19) rotulo(L, '!', 23, 1 - (f === 19 ? -1 : 0), 'r')
}

/** 2 · Contrapicado: el jefe, desde abajo. */
function planoJefe(L, f) {
  // Las lámparas del techo se van hacia el fondo.
  for (let i = 0; i < 5; i++) {
    linea(L, 42, -6, -20 + i * 31, 33, 'o')
  }
  caja(L, 30, 0, 24, 2, 'w')
  const sube = frena(tramo(f, 0, 8))
  const top = Math.round(20 - sube * 14)
  busto(L, 14, top + 5, AGENTE_2, { boca: 'neutra' })
  busto(L, 70, top + 5, AGENTE, { boca: 'neutra' })
  // El de en medio, más cerca: dos pixeles más abajo y encima de los otros.
  busto(L, 42, top, AGENTE, { boca: f > 12 ? 'mueca' : 'neutra', brillo: tramo(f, 8, 13) < 1 && f >= 8 ? tramo(f, 8, 13) : -1 })
  if (f === 12 || f === 13) destello(L, 47, top + 5, f === 12 ? 3 : 2)
}

/** 3 · Desde arriba: la carpeta cae en el escritorio. */
function planoCarpetazo(L, f) {
  caja(L, 0, 0, W, H, 'o')
  for (let y = 4; y < H; y += 7) raya(L, 0, W - 1, y, 'O')
  // La orilla de la laptop y el café, vistos desde arriba.
  caja(L, 0, 0, 20, 9, 'd')
  caja(L, 1, 1, 18, 7, 'D')
  elipse(L, 72, 7, 5, 5, 'w')
  elipse(L, 72, 7, 3.4, 3.4, 'O')
  const cae = frena(tramo(f, 0, 4))
  const pego = f === 4
  if (f >= 4 && f < 8) elipse(L, 72, 7, 1.5 + (f - 4) * 0.6, 1.5 + (f - 4) * 0.6, 'o')
  // La carpeta.
  const y = Math.round(-22 + cae * 30)
  sombra(L, 43, y + 12, 17, 9)
  caja(L, 26, y, 32, 19, 'x')
  caja(L, 26, y, 32, 1, 'X')
  caja(L, 26, y + 18, 32, 1, 'X')
  caja(L, 48, y - 2, 9, 3, 'x')
  // El sello.
  if (f >= 4) {
    caja(L, 31, y + 5, 21, 9, 'r')
    caja(L, 32, y + 6, 19, 7, 'x')
    rotulo(L, 'YA!', 36, y + 7, 'r')
  }
  // Las hojas que brincan con el golpe.
  if (f >= 4 && f < 9) {
    const d = f - 4
    caja(L, 22 - d * 2, 22 + d, 6, 4, 'w')
    caja(L, 58 + d * 2, 1 + d, 6, 4, 'w')
  } else if (f >= 9) {
    caja(L, 12, 27, 6, 4, 'w')
    caja(L, 68, 6, 0, 0, 'w')
  }
  if (pego) {
    golpe(L, 26, 8, 8)
    golpe(L, 58, 27, 8)
  }
  // La mano del jefe: manga negra, puño blanco, y el dedo que insiste.
  if (f >= 6) {
    const entra = frena(tramo(f, 6, 9))
    const toca = f >= 10 && f % 2 === 0 ? 1 : 0
    const hx = 92 - entra * 30
    linea(L, hx + 26, -4, hx + 6, 12, 'k', 9)
    linea(L, hx + 9, 9, hx + 5, 13, 'w', 9)
    elipse(L, hx, 17, 5, 4, 'c')
    linea(L, hx - 3, 18, hx - 8, 20 + toca, 'c', 2)
    if (toca) {
      punto(L, hx - 11, 19, 'k')
      punto(L, hx - 10, 23, 'k')
    }
  }
  return pego ? [0, 2] : f === 5 ? [0, -1] : null
}

/** 4 · Primer plano: Alex traga saliva… y se pone serio. */
function planoTraga(L, f) {
  const serio = f >= 10
  if (serio) rayosDeFoco(L, f)
  const dy = f === 6 || f === 7 ? 1 : 0
  busto(L, 42, 8 + dy, ALEX, {
    cejas: serio ? 2 : 1,
    boca: serio ? (f > 13 ? 'mueca' : 'neutra') : f >= 6 ? 'neutra' : 'o',
    cierra: f === 8 || f === 9,
    brillo: serio ? tramo(f, 10, 15) : -1,
    pelo: f === 10 ? 1 : 0,
  })
  // La gota de sudor.
  if (!serio) {
    const y = 9 + Math.min(8, f)
    pon(L, ['.b.', 'bbb', 'bwb', '.b.'], 53, y)
  }
  // Se acomoda los lentes con un dedo.
  if (f >= 11 && f <= 14) {
    const s = f === 11 || f === 14 ? 3 : 0
    // (la mano llega por un lado, a la pata del armazón)
    pon(L, ['.ee', 'eee', 'eee', '.ee'], 50, 13 + s)
    linea(L, 54, 33, 53, 17 + s, 'n', 4)
  }
}

/** 5 · Sobre el hombro: la pantalla. */
function planoPantalla(L, f) {
  caja(L, 0, 0, W, H, 'd')
  // El monitor.
  caja(L, 10, 0, 64, 27, 'k')
  caja(L, 12, 1, 60, 24, 'N')
  const listo = f >= 20
  if (listo) {
    caja(L, 12, 1, 60, 24, f === 20 ? 'w' : 'g')
    // La paloma, grande.
    linea(L, 31, 8, 37, 14, 'w', 3)
    linea(L, 37, 14, 53, 3, 'w', 3)
  } else {
    // El código aparece renglón por renglón, cada vez más rápido.
    const RENGLONES = [
      [0, 'r', 9, 'w', 14],
      [3, 'b', 6, 'y', 18],
      [3, 'g', 12, 'w', 8],
      [6, 'y', 8, 'b', 11],
      [6, 'w', 16, 'g', 5],
      [3, 'r', 5, 'w', 20],
      [0, 'b', 13, 'y', 9],
      [3, 'g', 7, 'w', 15],
      [3, 'y', 18, 'r', 6],
    ]
    const escrito = ahora(f) ** 2 * 0.75
    let cuenta = 0
    RENGLONES.forEach(([sangria, c1, n1, c2, n2], i) => {
      const y = 3 + i * 2
      const resto = Math.round(escrito - cuenta)
      cuenta += n1 + n2 + 2
      if (resto <= 0) return
      raya(L, 15 + sangria, 15 + sangria + Math.min(n1, resto) - 1, y, c1)
      if (resto > n1 + 1) raya(L, 16 + sangria + n1, 16 + sangria + n1 + Math.min(n2, resto - n1 - 1) - 1, y, c2)
      if (resto < n1 + n2 + 2 && f % 2) punto(L, 16 + sangria + resto, y, 'w')
    })
    // La barra de avance.
    if (f >= 12) {
      caja(L, 15, 21, 54, 3, 'k')
      caja(L, 16, 22, Math.round(52 * tramo(f, 12, 19)), 1, 'g')
    }
  }
  // Alex, de espaldas, y el tecleo.
  nuca(L, 42, 29, ALEX, listo ? -1 : f % 2)
  if (!listo) {
    punto(L, 14 + (f % 3) * 3, 30 - (f % 2), 'w')
    punto(L, 68 - (f % 3) * 3, 30 - ((f + 1) % 2), 'w')
  } else if (f < 23) golpe(L, 42, 9, 10 + (f - 20) * 5)
}

/** 6 · Tres caras: el jefe se baja los lentes. */
function planoLesGusto(L, f) {
  const baja = f >= 6
  const feliz = f >= 9
  const b = feliz ? (f % 4 < 2 ? 1 : 0) : 0
  busto(L, 14, 10 + b, AGENTE_2, { boca: feliz ? 'sonrie' : 'neutra' })
  busto(L, 70, 10 + (feliz ? 1 - b : 0), AGENTE, { boca: f >= 12 ? 'sonrie' : 'neutra' })
  busto(L, 42, 8, AGENTE, { bajaLentes: baja, cejas: baja ? 1 : 0, boca: feliz ? 'rie' : baja ? 'o' : 'neutra', cierra: f === 14 })
  if (baja && f < 10) {
    destello(L, 37, 10, 1)
    destello(L, 47, 10, 1)
  }
  globo(L, 53, 0, CORAZON, tramo(f, 9, 12))
  if (f > 12)
    for (let i = 0; i < 3; i++) {
      const y = 14 - ((ahora(f) - 12 + i * 4) % 12) * 1.4
      pon(L, ['r.r', 'rrr', '.r.'], 24 + i * 3 + Math.round(Math.sin(f + i)), Math.round(y))
    }
}

/** 7 · Detalle: el apretón. */
function planoTrato(L, f) {
  const llega = frena(tramo(f, 0, 5))
  const juntos = f >= 5
  const dy = juntos ? Math.round(Math.sin((ahora(f) - 5) * 1.6) * 2 * Math.max(0, 1 - (f - 5) / 12)) : 0
  if (f >= 6) confeti(L, ahora(f) - 6)
  const y = 17 + dy
  // La manga marina de Alex, por la izquierda; la negra con puño blanco, por la derecha.
  const xa = -30 + llega * 30
  const xb = 30 - llega * 30
  caja(L, xa - 4, y - 5, 36, 10, 'n')
  caja(L, xa - 4, y + 4, 36, 1, 'N')
  caja(L, 52 + xb, y - 5, 36, 10, 'k')
  caja(L, 49 + xb, y - 5, 4, 10, 'w')
  // Las manos.
  elipse(L, 36 + xa, y, 5, 4.4, 'e')
  elipse(L, 46 + xb, y, 5, 4.4, 'c')
  if (juntos) {
    caja(L, 38, y - 3, 7, 3, 'c')
    caja(L, 37, y + 1, 7, 3, 'e')
    raya(L, 39, 43, y - 1, 'C')
    raya(L, 38, 42, y + 3, 'E')
  }
  if (f === 5 || f === 6) golpe(L, 41, y, 9 + (f - 5) * 5)
  if (f >= 8) rotulo(L, '+1', 35, Math.max(1, 6 - (f - 8)), 'k', 2)
  return f === 5 ? [0, 1] : null
}

const PLANOS = [
  [26, planoOficina],
  [16, planoJefe],
  [14, planoCarpetazo],
  [18, planoTraga],
  [24, planoPantalla],
  [18, planoLesGusto],
  [18, planoTrato],
]

export const peliClientes = () => montaje('agentes', PLANOS, { s: '#c98510' }, 26 + 16 + 14 + 18 + 24 + 14)
