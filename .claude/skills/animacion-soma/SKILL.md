---
name: animacion-soma
description: Hace animaciones con el estilo de Soma para este proyecto. Úsala cuando pidan una animación, una escena, una película en pixel art, cambios de cámara, personajes (Dalí, Alex, clientes) o una ilustración animada en SVG con el trazo que hierve. Cubre los dos motores del repo (películas de pixel art en canvas y trazos SVG a mano), cómo se escribe un plano, cómo se revisa cuadro por cuadro y qué pruebas hay que pasar antes de entregar.
---

# Animación al estilo Soma

Hay dos maneras de animar en este proyecto. Elige por lo que se quiere contar:

| Quieres… | Usa | Vive en |
|---|---|---|
| Una historia con personajes, cortes de cámara, humor | Película de pixel art | `src/crm/pixel.js`, `src/crm/reparto.js`, `src/crm/peli-*.js` |
| Un icono, un emblema, un diagrama que se dibuja, una transición | Trazo SVG que hierve + GSAP | `src/core/boil.js`, `src/icons/`, `src/crm/emblemas.js` |

El gusto es el mismo en los dos: tinta, papel y el azul de Soma; pocas cosas y bien puestas; el movimiento cuenta algo (no adorna); nada parpadea ni se reinicia solo.

## 1. Películas de pixel art

Lee primero `src/crm/peli-puertas.js`: es el ejemplo completo. Una película es una lista de planos, y cada plano una función que dibuja su cuadro.

```js
import { caja, linea, frena, tramo } from './pixel.js'
import { W, H, DALI, ALEX, busto, golpe, montaje } from './reparto.js'

/** Un plano: L es el cuadro (84 × 33), f el número de cuadro dentro del plano, n su duración. */
function planoSaludo(L, f, n) {
  busto(L, 42, 8, DALI, { boca: f > 4 ? 'rie' : 'sonrie', cierra: f === 6 })
  if (f === 4) golpe(L, 60, 10, 8)
  return f === 4 ? [0, 1] : null // [dx, dy] hace temblar la cámara ese cuadro
}

export const peliSaludo = () => montaje('saludo', [[18, planoSaludo]], { s: '#1848b4' })
```

Para verla en una ficha: regístrala en `ESCENAS` (`src/crm/escenas.js`), pon `escena('saludo')` en el HTML y llama a `proyecta()` cuando la vista ya esté en pantalla.

### Cómo se trabaja

1. **Escribe el guion antes que el código.** Una lista de planos con su tipo de cámara y qué pasa. Va como comentario arriba del archivo.
2. **Varía la cámara.** Dos planos seguidos no deben tener el mismo encuadre. El repertorio que ya existe:
   - general (la calle, la oficina: `mini` de cuerpo entero, la cámara puede seguirlos)
   - detalle (un puño, una carpeta, un teléfono: el objeto llena el cuadro)
   - primer plano y dos caras (`busto`: aquí se actúa)
   - sobre el hombro (`nuca` en primer plano, lo importante al fondo)
   - desde dentro, contrapicado, desde arriba
3. **Actúa, no poses.** `busto` recibe `mira`, `cierra`, `boca`, `cejas`, `hombros`, `pelo`. Un personaje que solo está ahí no sirve: que mire algo, parpadee, reaccione un cuadro tarde.
4. **Movimiento natural.** Usa `frena` para llegar, `rebota` para lo que se pega o brinca, `suave` para la cámara. Antes de un golpe, un cuadro de vuelo hacia atrás. Después, uno de rebote. El pelo llega tarde (`pelo: 1`).
5. **Se escribe a 12 cuadros por segundo y se proyecta a 60.** `f` siempre es un cuadro entero (para las poses: `f === 4`, `f % 2`), y entre cuadro y cuadro hay cinco pasos. Lo que se mueve de corrido debe usar el tiempo fino: `tramo(f, a, b)` ya lo trae, y para lo demás está `ahora(f)` (por ejemplo `Math.sin(ahora(f) * 0.9)`) o `fraccion()`. Si un movimiento se ve a saltos, es que está usando `f` a secas. El cuadro mide 84 × 33 pixeles; un plano dura entre 10 y 28 cuadros y una película entre 100 y 200.
6. **Los colores son letras** (`PALETA` en `pixel.js`). Una cuadrícula no mezcla colores: para sombras usa `sombra()`, no un color translúcido. Si falta un color, agrégalo a la paleta con una letra libre.
7. **El reparto vive en `reparto.js`.** Dalí: castaño oscuro, de librito, playera negra. Alex: rizos negros, lentes de armazón, suéter marino. Para cambiarles algo se toca ahí y cambia en todas las películas.

### Cómo se revisa

No se puede ver el movimiento desde la terminal, así que se revisa en hojas de contacto:

```bash
npx vite --port 5180 --strictPort &
node scripts/hoy.cjs 5180 <carpeta> 390 844 22 0 9999   # deja cuadros-<pelicula>.png
```

Mira la hoja completa al menos una vez por película. Busca: caras que parecen otra cosa (una boca que parece bigote), manos que tapan caras, cosas blancas sobre fondo claro, planos donde no pasa nada.

## 2. Trazo SVG que hierve

Para iconos, emblemas e ilustraciones que se dibujan. Lee `src/core/boil.js` y un emblema de `src/crm/emblemas.js`.

```js
import { boil, P } from '../core/boil.js'
const aro = boil(P.circle(0, 0, 42, 30), { amp: 0.5, cls: 'draw', attrs: 'stroke-width="6"' })
// en la línea de tiempo de entrada:
tl.fromTo(el.querySelectorAll('.boil.draw'), { '--draw': 1.06 }, { '--draw': 0, duration: 1.1, ease: 'expo.inOut' })
```

- Las formas son listas de puntos (`P.circle`, `P.line`, `P.arc`, `P.curve`). `boil()` genera tres variantes y el CSS las alterna: el trazo «respira» sin costo por cuadro.
- `cls: 'draw'` más la variable `--draw` hace que el trazo se dibuje. No lo combines con `vector-effect: non-scaling-stroke`: el dibujo se queda corto.
- Fija la semilla con `semilla(n)` antes de pintar una vista: si se repinta con los mismos datos, los trazos salen idénticos y no brincan.
- Para que un texto o un número entre, súbelo detrás de una máscara (`overflow: hidden` y `yPercent: 112 → 0`), como el saludo y la fecha de «Hoy». Nada de ruedas ni contadores que se recorten.
- Las entradas van en una línea de tiempo de GSAP con `clearProps` al terminar (solo `transform,opacity,visibility`, nunca `all`).
- Si animas con GSAP algo que ya tiene `transform` en el CSS, da `y: 0` (o `x: 0`) explícito: si no, GSAP suma los dos desplazamientos.

### Viñetas de sección

Cada sección del CRM abre con una viñeta: una tarjeta de color con una ilustración SVG de tres planos. Viven en `src/crm/vinetas.js`. Lee una (por ejemplo `prospectos`) antes de hacer otra.

- Una viñeta es `{ color, planos: [{ cam, svg, anima(tl, g, t) }] }`. `cam` es el movimiento de cámara del plano: `[escala, x, y, giro]` de inicio y `[escala, x, y]` de fin. La cámara nunca está quieta.
- Tres planos, tres encuadres distintos (general, detalle, otra perspectiva). Entre plano y plano cierra y abre un iris; no hay que programarlo.
- El dibujo combina trazo que hierve (`T(formas, grosor, clase)`) con rellenos planos (`vn-fw`, `vn-fk`, `vn-fazul`…). Los colores son clases de `src/styles/crm-volumen.css`.
- Para usarla: `cab({ …, emblema: vineta('nombre') })`. El marco del CRM la echa a andar solo.
- Para revisarla: `node scripts/vinetas.cjs 5180 <carpeta>` saca cada plano en cuatro momentos.

### La cortina entre secciones

Al cambiar de sección, el punto del menú crece hasta cubrir el contenido (un filo de tinta y luego el azul) y se abre desde su nuevo lugar. Está en `cortina()` de `src/crm/marco.js`; lo viejo sigue a la vista hasta que el azul lo tapa y lo nuevo se pinta debajo. `node scripts/cortina.cjs 5180 <carpeta>` la fotografía cada 70 ms.

## 3. Antes de entregar

```bash
node scripts/ancho.cjs 5180        # nada empuja la página hacia los lados (320 a 1440 px)
node scripts/parpadeo2.cjs 5180    # sincronizar o esperar no repinta nada
node scripts/crm.cjs 5180 <carpeta> && node scripts/desborde.cjs 5180 <carpeta>
npx vite build
```

Reglas que ya nos costaron un error cada una:

- El HTML de una vista debe salir idéntico si los datos no cambian. Lo que depende de la hora (manecillas, segundero) se excluye de la comparación en `huella()` de `src/crm/marco.js`.
- Una animación de entrada nunca debe poder ensanchar la página: en teléfono `.crm-main` recorta de lado, y aun así no dejes elementos fuera del cuadro en reposo.
- Respeta `prefers-reduced-motion`: las películas muestran su `cartel` (un cuadro fijo) y los trazos dejan de hervir.
- Los nombres de clase nuevos llevan prefijo propio (`sd-`, `ficha-`, `hoy-`): `hud-` ya lo usa la presentación.
- Di qué revisaste y qué no pudiste ver. El ritmo real solo se juzga en vivo.
