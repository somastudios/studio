---
name: soma-animation
description: Hace animaciones SVG con el «trazo vivo» de Soma, líneas que tiemblan como dibujadas a mano (boil) y se calculan en cada cuadro a 60 fps, sin librerías. Úsala cuando pidan una animación dibujada a mano, un estado animado (cargando, vacío, éxito, sin resultados), un corto con escenas o planos, un morph entre formas, un personaje o una mano animados, iconos que hierven, «trazo vivo», «soma animation», «boil a 60 fps» o «como las animaciones de Claude». Trae el motor (trazo.js), sus estilos (trazo.css), un ejemplo mínimo, una galería con tres cortos completos y un script para revisar cuadro por cuadro. Para películas de pixel art o las viñetas del CRM de Soma, eso es la skill animacion-soma.
---

# Soma animation · trazo vivo

Animaciones de línea, hechas con código, que se ven dibujadas a mano. La línea tiembla todo el tiempo (el hervor), hay un bloque gris fuera de registro detrás de cada pieza y un punto azul que hace de personaje. Corren a 60 cuadros por segundo y no usan ninguna librería.

Lo que las hace buenas no es el temblor: es que **cuentan algo y que las cosas tienen peso**. La sección 5 es la importante.

## 1. Archivos

| Archivo | Para qué |
|---|---|
| `trazo.js` | El motor. Se carga con un `<script>` y deja todo en `window.Trazo`. |
| `trazo.css` | Los estilos del dibujo y sus seis colores, en claro y en oscuro. |
| `ejemplo.html` | Lo mínimo que funciona: un bucle y un corto de dos planos. Empieza copiándolo. |
| `galeria.html` | La referencia completa, en un solo archivo: tres cortos de tres planos (una persona que piensa, una puerta que se vuelve expediente, un cobro que se vuelve recibo), cuatro bucles e iconos. Lee el corto que más se parezca a lo que vas a hacer antes de escribir. |
| `scripts/tira.cjs` | Detiene la animación en varios instantes y junta las fotos en una hoja. Es la única manera de revisarla. |

## 2. Empezar

```html
<link rel="stylesheet" href="trazo.css">
<div class="lamina"><svg id="lienzo" viewBox="0 0 160 120"></svg></div>
<script src="trazo.js"></script>
<script>
  const { P, T, G, monta, tramo, suave, rebota, pon, traza, punto } = Trazo
  monta(document.querySelector('#lienzo'), {
    dur: 4,            // segundos que dura el bucle
    cartel: 2.4,       // el instante que se muestra si la persona pidió menos movimiento
    svg: () =>         // el dibujo, una sola vez
      T(P.rect(49, 31, 72, 70, 8), { cls: 'blq' }) +        // el bloque gris, corrido 5
      T(P.rect(44, 26, 72, 70, 8), { cls: 'ln tapa' }) +    // la pieza
      T(P.linea(56, 58, 104, 58), { cls: 'ln fino tz', n: 'renglon' }) +
      punto(4.6),
    paso(q, t) {       // lo que cambia con el tiempo t, en cada cuadro
      traza(q('renglon'), suave(tramo(t, 0.4, 1.2)))
      pon(q('pt'), { x: 104, y: 84, sx: rebota(tramo(t, 1.3, 1.6)) })
    },
  })
</script>
```

Tres ideas sostienen todo:

1. **Una forma es una lista de puntos**, no un `d` fijo. `T(forma)` la vuelve un trazo vivo y el motor la redibuja en cada cuadro.
2. **Una escena es una función del tiempo.** `paso(q, t)` recibe los segundos y coloca todo. No hay estados guardados ni líneas de tiempo: por eso se puede detener en cualquier instante con `Trazo.fija(2.5)`.
3. **`q('nombre')`** devuelve el elemento que se creó con `n: 'nombre'` (o con `G('nombre', …)`). Los nombres son únicos dentro de cada `<svg>`.

## 3. El dibujo

| Lienzo | `viewBox` | Línea | Para qué |
|---|---|---|---|
| Bucle | `0 0 160 120` | 2.3 y 1.8 (`fino`) | Un estado en un lugar chico |
| Cine | `0 0 320 200`, con `class="cine"` | 3.1 y 2.2 | Un corto con planos |

| Clase | Qué hace |
|---|---|
| `ln` | La línea de tinta. `fino` la adelgaza, `tenue` la baja al 42 % |
| `tapa` | Rellena del color de la lámina: la pieza tapa lo que tiene detrás |
| `blq` | El bloque gris, sin contorno. También la ropa |
| `azul`, `ln-azul` | El acento. `lleno` es relleno de tinta, `luz` del color de la lámina |
| `tz` | Un trazo que se dibuja con `traza(el, p)`. **Nace oculto** |

Las formas (`P.…`): `linea`, `rect` (esquinas redondas), `circ`, `elipse`, `arco`, `curva`, `suave(puntos, cerrada)` (pasa por los puntos redondeando) y `poli(puntos, cerrada)` (esquinas vivas).

Reglas del dibujo:

- **Cada pieza importante lleva su bloque**: la misma forma con `blq`, corrida 5 unidades (6 en cine) abajo a la derecha, dibujada antes.
- **El orden es quién tapa a quién.** Lo de atrás se escribe primero. Una pieza `ln tapa` esconde lo que queda detrás; así una hoja tapa su bloque y una cabeza tapa el cuello.
- **Un solo acento.** El azul es el punto y lo que el punto toca. Nada más lleva color.
- **`amp`** es cuánto tiembla: 0.9 por omisión, 0.3 a 0.5 en detalles chicos, 0.15 a 0.25 en lo diminuto (ojos, dedos, iconos).
- **Pocas cosas.** Si un detalle no ayuda a entender qué es, sobra.
- Se revisa en claro y en oscuro: los colores son variables y en oscuro la tinta es clara.

## 4. El tiempo y el movimiento

Todo se arma con `tramo(t, a, b)`, que va de 0 a 1 entre el segundo `a` y el `b`, pasado por una curva.

| Curva | Cómo se mueve | Para qué |
|---|---|---|
| `suave(p)` | Arranca y frena despacio | Lo que se desliza, la cámara |
| `frena(p)` | Llega frenando | Lo que entra |
| `acelera(p)` | Sale lento y termina rápido | Lo que cae, lo que se va |
| `rebota(p)` | Llega y se pasa un poco | Casi todo lo que aparece o llega |
| `elastico(p)` | Se pasa y vibra hasta asentarse | Un morph, algo que se suelta |
| `salto(p)` | 0 → 1 → 0 | Un brinco, tomar vuelo, un pulso |
| `golpe(t, c, largo)` | 1 justo en `c` y baja a 0 | El impacto y lo que deja |
| `campana(t, c, w)` | Sube y baja alrededor de `c` | Un parpadeo |
| `brinco(p, alto)` | Devuelve `{ dy, sx, sy }` | Un brinco con cuerpo: se aplasta, se estira, se aplasta |
| `sacude(t, c, fuerza)` | Vibración que se apaga | La cámara después de un golpe |

| Mover | Qué hace |
|---|---|
| `pon(el, { x, y, r, sx, sy, ox, oy, o })` | Lugar, giro, escala alrededor de `(ox, oy)` y opacidad |
| `traza(el, p)` | Dibuja un trazo `tz` de 0 a 1. De 1 a 0 lo borra |
| `ve(el, o)` | Opacidad |
| `forma(el, puntos)` | Cambia los puntos del trazo. Así algo se mueve por dentro, se deforma o **se vuelve otra cosa** |
| `agita(el, f)` | Qué tan fuerte hierve ese trazo. 1 es lo normal |
| `camara(el, x, y, z)` | Pone `(x, y)` al centro de un cuadro de cine, con acercamiento `z` |
| `ojo(el, x, y, rx, ry)` | Coloca una `<ellipse>`: un ojo que mira, se abre o parpadea |

Piezas hechas: `punto(r, n)`, `rayos(n, líneas)`, `corona(n, cuántos, r0, r1)` y `manoSvg(k)` con `indice(e)`.

Modos: `Trazo.modo('suave' | 'treses' | 'quieto')`. «Treses» es el hervor clásico de 8 dibujos por segundo.

## 5. El oficio

### Primero la historia

Antes de dibujar, escribe el guion como comentario: qué pasa, en una frase por plano. Si no se puede contar en tres frases, no está listo.

- **Bucle** (3 a 6 s): una sola idea que se repite. *El punto recorre los días y aparta uno.*
- **Corto** (10 a 16 s, tres planos): algo cambia. *Toca la puerta. Le abren. La puerta se vuelve su expediente.*
- El final dice lo mismo que el texto que acompaña a la animación. Si el texto es «su expediente aparecerá aquí», la animación termina en un expediente.
- **El punto es el personaje.** Quiere algo, lo intenta y lo consigue. No tiene cara: su carácter está en cómo se mueve.

Un corto se monta con planos; el motor muestra uno a la vez y `t` vuelve a 0 en cada plano:

```js
monta(svg, {
  cartel: 9.6, abre: [160, -6], cierra: [186, 134],   // el telón: de dónde sale y dónde termina el punto
  planos: [
    { nombre: 'Caen',    dur: 3.9, svg: () => G('c0', …), paso(q, t) { … } },
    { nombre: 'Sellado', dur: 4.6, svg: () => G('c2', …), paso(q, t) { … } },
  ],
}, { alAvanzar: (i, avance, planos) => { /* pinta tu pista de tiempo */ } })
```

Dos planos seguidos no llevan el mismo encuadre: general, detalle, general. Entre planos, lo que queda en pantalla al cortar debe coincidir con lo que abre el siguiente.

### Las seis cosas que le dan peso

1. **Toma vuelo.** Antes de moverse, va tantito al revés: se encoge antes de brincar, se echa atrás antes de lanzarse, la perilla gira al revés antes de girar. Dura 0.2 a 0.35 s.
   ```js
   const vuelo = salto(tramo(t, a, a + 0.16))        // se echa atrás…
   const p = tramo(t, a + 0.13, a + 0.47)            // …y se lanza
   x += -5 * vuelo + 15 * salto(p)
   ```
2. **Llega y se pasa.** Nada frena en seco: `rebota` para lo que llega, `elastico` para lo que se suelta.
3. **Se aplasta y se estira**, sin cambiar de tamaño: `sx = 1 / sy`. Aplastado al tocar el piso, estirado en el aire. `brinco(p, alto)` ya lo trae; si se aplasta, bájalo para que no flote: `y + radio * (1 - sy)`.
4. **Lo que cuelga llega tarde.** El pelo, las cejas, los lentes y el badajo hacen lo mismo que la cabeza, 0.04 a 0.1 s después, y se pasan más.
   ```js
   cejas: -5.5 * rebota(tramo(t, 1.70, 2.14)),       // la cabeza salió en 1.62
   pelo: -10 * salto(tramo(t, 1.62, 1.92)) + 6 * salto(tramo(t, 1.92, 2.3)),
   ```
5. **Un golpe se siente en tres lugares**: quien pega se aplasta (`golpe`, 0.2 s), salen rayos (`corona`) y la cámara se sacude (`sacude`). Y quien lo recibe reacciona: salta, se mece, se queda temblando.
6. **Actúa por partes.** Una persona no cambia de cara de un jalón: primero los ojos, luego la cabeza, luego el cuerpo. Parpadea antes de mirar a otro lado. Una ceja más arriba que la otra dice más que las dos iguales.

### Que una forma se vuelva otra

```js
const PUERTA = remuestra([[180, 56], [240, 56], [240, 168], [180, 168]], 96)
const CARPETA = remuestra([[112, 72], [142, 72], [150, 81], [208, 81], [208, 140], [112, 140]], 96)
T(D(PUERTA), { cls: 'ln tapa', n: 'hoja' })
forma(q('hoja'), mezclaPts(PUERTA, CARPETA, elastico(tramo(t, 2.3, 3.4))))
```

- Las dos formas llevan **el mismo número de puntos**, empiezan en la misma esquina y giran para el mismo lado. `remuestra(vértices, 96)` reparte los puntos; `rectPts`, `circulo`, `elipsePts` y `capsula` dan otras.
- Antes de cambiar toma vuelo, y el cambio va con `elastico`: dura alrededor de un segundo.
- Los detalles de la primera forma se desvanecen **antes** de que empiece; los de la segunda se dibujan **después** de que termine. Lo que rodeaba a la primera (el piso, el marco) se borra con `traza` hacia 0.
- Las mejores transformaciones dicen algo: la puerta donde tocaste termina siendo el expediente de ese cliente.

### La cámara

- Un acercamiento lento de 5 a 7 % durante el plano le da vida a un plano quieto.
- **No acerques más de 1.3**: la línea engorda. Para «entrar» a algo, hazlo crecer con `forma` (el globo de pensamiento crece hasta llenar el cuadro) y deja la cámara quieta.
- Corte a detalle para el momento que importa: la perilla, la mano en el canto de la puerta.

### El hervor también cuenta

`agita(el, 2.4)` hace que una línea hierva fuerte y `0.45` casi la deja quieta. Lo confuso tiembla, lo resuelto se calma. Un tirón, un susto o un golpe la sacuden un instante.

### Manos y personas

- **Una mano nunca es un círculo.** `manoSvg(k)` dibuja un puño de frente: la palma, las tres rayas entre los dedos, la línea donde se doblan, el pulgar cruzado y un índice que se estira con `forma(q(k + 'i'), indice(e))`. Se coloca con `pon(q(k), { x, y, r })` en la muñeca. Unos dedos sueltos (agarrando un canto) son cápsulas: `capsula(a, b, ancho)`.
- **Una persona** está en `galeria.html`: `persona(k)` la dibuja y `actua(q, k, { gira, mira, abre, cejas, boca, brazo, dedo, mano, pelo, lentes, … })` la pone en una pose. Cópialas completas y cambia los rasgos.
- Para que se parezca a alguien bastan **tres rasgos**: la silueta del pelo, lo que lleva en la cara (lentes, barba) y la ropa. El resto queda igual de simple.
- Los ojos son elipses (`ojo`), las cejas una raya cada una, la boca un trazo cerrado que se abre. Con eso alcanza para dudar, suspirar, sorprenderse, sonreír y guiñar.

### Tiempos de referencia

| Qué | Cuánto |
|---|---|
| Parpadeo | 0.16 s (`campana(t, c, 0.08)`) |
| Tomar vuelo | 0.2 a 0.35 s |
| Un brinco | 0.35 a 0.5 s |
| Lo que deja un golpe | 0.2 s aplastado, 0.3 a 0.5 s de rayos |
| Llegar con rebote | 0.4 a 0.5 s |
| Un morph | 1 a 1.1 s |
| Una pausa para que se lea | 0.4 a 1 s |
| El telón | 0.5 s (lo hace el motor) |

## 6. Texto e interfaz

- El texto junto a la animación se escribe con la skill `soma-copywriting`. Carga: quién, qué hace y cuánto tardará. Vacío: qué falta y qué aparecerá ahí.
- La tarjeta, el botón y la lámina donde vive el dibujo siguen la skill `ui-soma`. Los colores de `trazo.css` se cambian por los del proyecto: son seis variables.

## 7. Cómo se revisa

No puedes ver el movimiento, así que se revisa en fotos. Hazlo siempre, por cada plano:

```bash
# doce cuadros repartidos entre el segundo 0.3 y el 5.1 del lienzo #corto
node scripts/tira.cjs pagina.html '#corto' 0.3 5.1 12 4 light 1 tira.png
# instantes sueltos y más grandes, para ver una mano o una cara
node scripts/tira.cjs pagina.html '#corto' 0.72,2.6,4.2 - 0 3 dark 1.4 cerca.png
```

Mira la hoja y busca:

- ¿Se entiende la historia viendo solo las fotos, sin leer el código?
- Cosas que parecen otra cosa: una mano que parece garra, una boca que parece bigote.
- Piezas que deberían tapar y no tapan, o que flotan sin tocar el piso.
- Planos donde no pasa nada entre una foto y la siguiente.
- El corte entre planos: la última foto de uno y la primera del otro deben empatar.
- Lo mismo en oscuro.

El script también avisa de errores y de desplazamiento lateral. Al entregar di qué revisaste en fotos y que **el ritmo en vivo solo lo puede juzgar quien lo ve moverse**.

## 8. Errores que ya nos costaron

| Qué pasa | Por qué |
|---|---|
| Un trazo no aparece | Tiene `tz` y nadie lo `traza` en ese plano. Lo que es `tz` se traza en cada cuadro, aunque sea `traza(el, 1)` |
| Algo se ve desde el segundo 0 y debía aparecer después | No nace oculto: dale `ve(el, 0)` o escala 0 hasta su momento |
| La línea engorda | Se escaló un grupo o se acercó demasiado la cámara. Cambia la forma con `forma`, no la escala |
| Las esquinas salen redondas | Se usó `P.suave`; para esquinas vivas es `P.poli` |
| Un morph se tuerce como trapo | Las dos formas no empiezan en la misma esquina o giran al revés |
| Una sonrisa sale en V | Tres puntos no alcanzan para una curva: usa cinco o más |
| `q('x')` devuelve `null` | El nombre se repite en otro plano o está mal escrito. Ponles prefijo por plano |
| Un globo queda escondido detrás del pelo | El orden de las capas, o está encima de otra pieza: muévelo |
| Todo se ve gris en oscuro | Se escribió un color fijo en vez de una variable |

Y tres cosas del motor: `forma` necesita siempre el mismo número de puntos que la forma original; el costo con todo en pantalla debe quedar bajo 4 ms por cuadro (lo que no está a la vista no se calcula); con `prefers-reduced-motion` se muestra el `cartel` y nada se mueve, así que elige un `cartel` donde la historia ya se entienda.

## 9. Antes de entregar

- [ ] El guion está escrito arriba del código y cada plano hace una sola cosa.
- [ ] El final coincide con el texto que acompaña.
- [ ] Todo lo que se mueve toma vuelo y se pasa al llegar; lo que brinca se aplasta y se estira.
- [ ] Si hay manos, tienen dedos. Si hay una persona, actúa por partes y parpadea.
- [ ] Hay un solo acento de color.
- [ ] Lo vi en tiras de fotos, plano por plano, en claro y en oscuro, sin errores.
- [ ] Tiene `cartel`, y a 390 px de ancho no empuja la página hacia los lados.

## 10. En el repositorio de Soma (studio)

La galería vive también en `docs/soma-animation.html` (es la que está publicada) y hay que mantener las dos copias iguales. No está conectada al CRM. Las películas de pixel art, las viñetas de cada sección y el boil de tres dibujos del CRM son otra cosa: skill `animacion-soma`.
