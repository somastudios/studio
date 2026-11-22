import { P } from '../core/boil.js'

// Iconos de proceso. Retícula de 24, un solo grosor, construidos con círculos, arcos,
// puntos y rectas: lo mismo que el logo. Cada clave es una lista de formas.
//
//   P.circle(cx, cy, r, n)                       círculo cerrado
//   P.arc(cx, cy, r, grados0, grados1, n)        arco (0° = derecha, -90° = arriba)
//   P.line(x1, y1, x2, y2, n)                    recta
//   P.curve(x0,y0, x1,y1, x2,y2, x3,y3, n)       curva de Bézier

const L = P.line
const C = P.circle
const A = P.arc
const B = P.curve

// Ayudas: todas devuelven listas de formas hechas con las primitivas de arriba.

/** Un punto: una recta tan corta que solo queda la punta redonda del trazo. */
const punto = (x, y) => L(x - 0.12, y, x + 0.12, y, 2)

/** Trazo quebrado por una serie de puntos [x, y]. Con `cerrar`, vuelve al primero. */
function trazo(pts, cerrar = false) {
  const f = []
  for (let i = 1; i < pts.length; i++) f.push(L(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]))
  if (cerrar) f.push(L(pts[pts.length - 1][0], pts[pts.length - 1][1], pts[0][0], pts[0][1]))
  return f
}

/** Rectángulo de esquinas vivas. */
const rect = (x1, y1, x2, y2) =>
  trazo(
    [
      [x1, y1],
      [x2, y1],
      [x2, y2],
      [x1, y2],
    ],
    true,
  )

/** Rectángulo de esquinas redondas: cuatro rectas y cuatro arcos. */
const rrect = (x1, y1, x2, y2, r = 2) => [
  L(x1 + r, y1, x2 - r, y1),
  A(x2 - r, y1 + r, r, -90, 0, 4),
  L(x2, y1 + r, x2, y2 - r),
  A(x2 - r, y2 - r, r, 0, 90, 4),
  L(x2 - r, y2, x1 + r, y2),
  A(x1 + r, y2 - r, r, 90, 180, 4),
  L(x1, y2 - r, x1, y1 + r),
  A(x1 + r, y1 + r, r, 180, 270, 4),
]

/** Estrella de cinco puntas. */
function estrella(cx, cy, R, r) {
  const pts = []
  for (let i = 0; i < 10; i++) {
    const a = ((-90 + i * 36) * Math.PI) / 180
    const q = i % 2 ? r : R
    pts.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q])
  }
  return trazo(pts, true)
}

export const PROCESO = {
  // ───────── pasos del catálogo ─────────

  // triángulo de aviso
  alerta: [...trazo([[12, 3.6], [21, 19.8], [3, 19.8]], true), L(12, 9.6, 12, 14.2), punto(12, 16.9)],

  // dos platos colgados de un brazo
  balanza: [
    L(12, 4, 12, 20.4),
    L(7.8, 20.4, 16.2, 20.4),
    L(4.4, 6.6, 19.6, 6.6),
    L(6, 6.6, 3, 13),
    L(6, 6.6, 9, 13),
    A(6, 13, 3, 0, 180, 6),
    L(18, 6.6, 15, 13),
    L(18, 6.6, 21, 13),
    A(18, 13, 3, 0, 180, 6),
  ],

  // bolsa de compra con asa
  bolsa: [...trazo([[5.4, 8.6], [18.6, 8.6], [19.6, 20.8], [4.4, 20.8]], true), A(12, 7.2, 3.6, 180, 360, 7), L(8.4, 7.2, 8.4, 11.2), L(15.6, 7.2, 15.6, 11.2)],

  // caja registradora: pantalla, teclas y cajón
  caja: [
    ...rect(3.4, 14.6, 20.6, 20.6),
    ...trazo([[5.6, 14.6], [7.4, 8.6], [16.6, 8.6], [18.4, 14.6]]),
    ...rect(11.4, 3.4, 16.6, 6),
    L(14, 6, 14, 8.6),
    L(10.4, 17.6, 13.6, 17.6),
    punto(9.6, 11.6),
    punto(12, 11.6),
    punto(14.4, 11.6),
  ],

  // caja de cartón vista en esquina, con su cinta
  'caja-carton': [
    ...trazo([[12, 3], [20, 7.5], [20, 16.5], [12, 21], [4, 16.5], [4, 7.5]], true),
    L(4, 7.5, 12, 12),
    L(20, 7.5, 12, 12),
    L(12, 12, 12, 21),
    L(8, 5.25, 16, 9.75),
  ],

  // hoja de calendario con sus argollas
  calendario: [...rrect(3.4, 5.4, 20.6, 20.6, 2), L(3.4, 10.2, 20.6, 10.2), L(8, 3.4, 8, 7), L(16, 3.4, 16, 7), punto(8, 14), punto(12, 14), punto(16, 14), punto(8, 17.2), punto(12, 17.2)],

  // campana de aviso
  campana: [
    A(12, 10.6, 5.6, 180, 360, 8),
    B(6.4, 10.6, 6.4, 15, 6, 16.4, 3.8, 18, 6),
    B(17.6, 10.6, 17.6, 15, 18, 16.4, 20.2, 18, 6),
    L(3.8, 18, 20.2, 18),
    A(12, 18.2, 2.3, 10, 170, 6),
    L(12, 3.2, 12, 5),
  ],

  // candado cerrado
  candado: [...rrect(4.8, 10.6, 19.2, 20.8, 2), L(8, 10.6, 8, 7.4), A(12, 7.4, 4, 180, 360, 7), L(16, 7.4, 16, 10.6), L(12, 14.4, 12, 17)],

  // carrito de compra
  carrito: [
    L(3, 4.4, 5.8, 4.4),
    L(5.8, 4.4, 8.4, 15.4),
    L(8.4, 15.4, 18.6, 15.4),
    L(18.6, 15.4, 20.8, 7.6),
    L(6.6, 7.6, 20.8, 7.6),
    C(9.8, 19.3, 1.6, 8),
    C(17.2, 19.3, 1.6, 8),
  ],

  // hecho
  check: [C(12, 12, 9, 12), L(7.8, 12.4, 10.8, 15.2), L(10.8, 15.2, 16.4, 9)],

  // dos flechas que se persiguen
  ciclo: [
    A(12, 12, 7.8, 200, 335, 8),
    L(19.07, 8.7, 19.07, 4.2),
    L(19.07, 8.7, 14.6, 8.7),
    A(12, 12, 7.8, 20, 155, 8),
    L(4.93, 15.3, 4.93, 19.8),
    L(4.93, 15.3, 9.4, 15.3),
  ],

  // hoja con la esquina doblada y dos renglones
  documento: [
    ...trazo([[5, 3], [14, 3], [19, 8], [19, 21], [5, 21]], true),
    L(14, 3, 14, 8),
    L(14, 8, 19, 8),
    L(8.4, 12.6, 15.6, 12.6),
    L(8.4, 16.6, 15.6, 16.6),
  ],

  // código de barras con la línea de lectura
  escaner: [
    L(3, 12, 21, 12),
    ...[5.4, 8.2, 12, 15.8, 18.6].flatMap((x) => [L(x, 4.6, x, 9.4), L(x, 14.6, x, 19.4)]),
  ],

  estrella: estrella(12, 12.9, 9.6, 4.2),

  // etiqueta de precio con su ojal
  etiqueta: [...trazo([[3.4, 3.4], [11.6, 3.4], [20.6, 12.4], [12.4, 20.6], [3.4, 11.6]], true), C(7.9, 7.9, 1.5, 8)],

  // embudo
  filtro: trazo([[3.4, 4.6], [20.6, 4.6], [14, 12.6], [14, 18.2], [10, 20.6], [10, 12.6]], true),

  // un trazo de firma sobre su línea
  firma: [
    L(3.4, 19.8, 20.6, 19.8),
    B(4, 15.6, 6.6, 3, 10.8, 4.6, 8.2, 12.6, 9),
    B(8.2, 12.6, 6.6, 17.6, 11.6, 16.4, 13, 11.4, 8),
    B(13, 11.4, 13.4, 16.4, 16.4, 16.2, 20, 12.6, 8),
  ],

  // ejes y una línea que sube
  grafica: [L(4, 4, 4, 20), L(4, 20, 20.6, 20), ...trazo([[7.4, 15.6], [11, 11.2], [14.2, 13.6], [19.8, 6.4]])],

  // renglones con su punto
  lista: [
    punto(4.4, 6.4),
    L(8.6, 6.4, 20.6, 6.4),
    punto(4.4, 12),
    L(8.6, 12, 20.6, 12),
    punto(4.4, 17.6),
    L(8.6, 17.6, 20.6, 17.6),
  ],

  // luna creciente
  luna: [A(11.6, 12.4, 8.6, 0, 270, 12), A(15.9, 8.1, 6.08, 225, 45, 8)],

  lupa: [C(10.4, 10.4, 6.6, 12), L(15.2, 15.2, 20.6, 20.6)],

  // bocina que avisa
  megafono: [
    ...trazo([[3.6, 9.6], [8.4, 9.6], [16.6, 5], [16.6, 19], [8.4, 14.4], [3.6, 14.4]], true),
    L(6.2, 14.4, 7.4, 19.4),
    A(16.6, 12, 4, -42, 42, 6),
  ],

  // globo de conversación
  mensaje: [
    L(5.5, 4.6, 18.5, 4.6),
    A(18.5, 6.6, 2, -90, 0, 4),
    L(20.5, 6.6, 20.5, 14),
    A(18.5, 14, 2, 0, 90, 4),
    L(18.5, 16, 11.4, 16),
    L(11.4, 16, 7.2, 20.2),
    L(7.2, 20.2, 7.2, 16),
    L(7.2, 16, 5.5, 16),
    A(5.5, 14, 2, 90, 180, 4),
    L(3.5, 14, 3.5, 6.6),
    A(5.5, 6.6, 2, 180, 270, 4),
  ],

  // moneda con el signo de pesos
  moneda: [C(12, 12, 9, 12), A(12, 9.9, 2.2, -20, -270, 7), A(12, 14.1, 2.2, -90, 160, 7), L(12, 5.8, 12, 7.7), L(12, 16.3, 12, 18.2)],

  // moto de reparto con su caja
  moto: [
    C(6.2, 17.4, 3.2, 10),
    C(18, 17.4, 3.2, 10),
    L(15.2, 8, 18, 17.4),
    L(12.8, 8, 16.4, 8),
    L(9.4, 17.4, 14.8, 17.4),
    L(9.8, 12.6, 10.8, 17.4),
    ...rect(3.4, 5.6, 9.8, 12.6),
  ],

  // monitor con su base
  pantalla: [...rect(3, 4.4, 21, 16), L(12, 16, 12, 20.2), L(7.8, 20.2, 16.2, 20.2)],

  // cabeza y hombros
  persona: [C(12, 7.4, 3.6, 10), A(12, 20.6, 7.6, 180, 360, 9)],

  // marcador de ubicación
  pin: [A(12, 10, 6.6, 143.1, 396.9, 12), L(6.72, 13.96, 12, 21), L(17.28, 13.96, 12, 21), C(12, 10, 2.4, 9)],

  // lápiz que escribe
  pluma: [
    L(16.4, 3.6, 6.2, 13.8),
    L(19.6, 6.8, 9.4, 17),
    L(16.4, 3.6, 19.6, 6.8),
    L(6.2, 13.8, 4.4, 18.8),
    L(4.4, 18.8, 9.4, 17),
    L(14, 6, 17.2, 9.2),
    L(11, 20.6, 20.6, 20.6),
  ],

  // tres esquinas y unos puntos
  qr: [
    ...rect(3.4, 3.4, 10, 10),
    ...rect(14, 3.4, 20.6, 10),
    ...rect(3.4, 14, 10, 20.6),
    punto(6.7, 6.7),
    punto(17.3, 6.7),
    punto(6.7, 17.3),
    punto(14.4, 14.4),
    punto(20.2, 14.4),
    punto(17.3, 17.3),
    punto(14.4, 20.2),
    punto(20.2, 20.2),
  ],

  // caja con moño
  regalo: [
    ...rect(3.4, 7.6, 20.6, 11.6),
    L(5, 11.6, 5, 20.8),
    L(19, 11.6, 19, 20.8),
    L(5, 20.8, 19, 20.8),
    L(12, 7.6, 12, 20.8),
    B(12, 7.6, 10, 1.4, 4, 4, 12, 7.6, 10),
    B(12, 7.6, 14, 1.4, 20, 4, 12, 7.6, 10),
  ],

  reloj: [C(12, 12, 9, 12), L(12, 6.8, 12, 12), L(12, 12, 15.6, 14.2)],

  // tableta acostada, con su botón
  tableta: [...rrect(3, 5.4, 21, 18.6, 2), L(18, 10.6, 18, 13.4)],

  // tarjeta con su banda
  tarjeta: [...rrect(3, 5.8, 21, 18.2, 2), L(3, 10.2, 21, 10.2), L(6.4, 14.6, 10.6, 14.6)],

  telefono: [...rrect(7, 3, 17, 21, 2), L(10.6, 18, 13.4, 18)],

  // recibo con el borde dentado
  ticket: [
    L(5.6, 3.4, 18.4, 3.4),
    L(5.6, 3.4, 5.6, 19),
    L(18.4, 3.4, 18.4, 19),
    ...trazo([[5.6, 19], [7.73, 21], [9.87, 19], [12, 21], [14.13, 19], [16.27, 21], [18.4, 19]]),
    L(8.8, 7.8, 15.2, 7.8),
    L(8.8, 11.4, 15.2, 11.4),
    L(8.8, 15, 12.4, 15),
  ],

  // local con toldo y puerta
  tienda: [
    L(5, 3.8, 19, 3.8),
    L(5, 3.8, 3, 8.6),
    L(19, 3.8, 21, 8.6),
    A(6, 8.6, 3, 0, 180, 6),
    A(12, 8.6, 3, 0, 180, 6),
    A(18, 8.6, 3, 0, 180, 6),
    L(5, 12.6, 5, 20.8),
    L(19, 12.6, 19, 20.8),
    L(5, 20.8, 19, 20.8),
    ...trazo([[10, 20.8], [10, 15.4], [14, 15.4], [14, 20.8]]),
  ],

  // ───────── para otras partes ─────────

  microfono: [
    L(9, 6.4, 9, 11.4),
    A(12, 6.4, 3, 180, 360, 6),
    L(15, 6.4, 15, 11.4),
    A(12, 11.4, 3, 0, 180, 6),
    A(12, 11.4, 6, 0, 180, 9),
    L(12, 17.4, 12, 20.8),
    L(8.8, 20.8, 15.2, 20.8),
  ],

  casa: [
    L(3, 11.4, 12, 3.4),
    L(12, 3.4, 21, 11.4),
    L(5.6, 10.8, 5.6, 20.6),
    L(18.4, 10.8, 18.4, 20.6),
    L(5.6, 20.6, 18.4, 20.6),
    ...trazo([[10, 20.6], [10, 14.6], [14, 14.6], [14, 20.6]]),
  ],

  llave: [C(7.6, 16.4, 4.4, 10), L(10.8, 13.2, 20.4, 3.6), L(17.2, 6.8, 20, 9.6), L(14.4, 9.6, 16.6, 11.8)],

  // dos personas, una delante de otra
  usuarios: [C(9, 8, 3.3, 10), A(9, 20.4, 6, 180, 360, 8), A(15.2, 8, 3.3, -75, 75, 6), A(15.4, 20.4, 5.6, -62, 0, 5)],

  // frontón, columnas y base
  banco: [
    ...trazo([[3, 9], [12, 3.4], [21, 9]], true),
    L(6.4, 12, 6.4, 17.4),
    L(12, 12, 12, 17.4),
    L(17.6, 12, 17.6, 17.4),
    L(3.4, 20.6, 20.6, 20.6),
  ],

  // billete
  efectivo: [...rect(3, 6.4, 21, 17.6), C(12, 12, 3, 10), punto(6.2, 12), punto(17.8, 12)],

  // dos eslabones
  enlace: [
    A(7.6, 12, 4.4, 90, 270, 8),
    L(7.6, 7.6, 10.4, 7.6),
    L(7.6, 16.4, 10.4, 16.4),
    A(16.4, 12, 4.4, -90, 90, 8),
    L(13.6, 7.6, 16.4, 7.6),
    L(13.6, 16.4, 16.4, 16.4),
    L(8.6, 12, 15.4, 12),
  ],

  ojo: [A(12, 16.61, 10.11, 207.1, 332.9, 8), A(12, 7.39, 10.11, 27.1, 152.9, 8), C(12, 12, 3.1, 10)],

  // sobre
  correo: [...rect(3, 5.6, 21, 18.4), L(3.6, 6.4, 12, 13), L(12, 13, 20.4, 6.4)],

  flecha: [L(3.4, 12, 20.6, 12), L(14, 5.4, 20.6, 12), L(14, 18.6, 20.6, 12)],

  mas: [L(12, 4.4, 12, 19.6), L(4.4, 12, 19.6, 12)],

  nube: [A(7.2, 14.8, 4.2, 90, 260.9, 7), A(12, 10, 5.5, 173.2, 370.7, 9), A(17, 15, 4, -84.2, 90, 7), L(7.2, 19, 17, 19)],
}
