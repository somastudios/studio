---
name: soma-animation
description: Hace animaciones SVG con el «trazo vivo» de Soma, líneas que tiemblan como dibujadas a mano (boil) y se calculan en cada cuadro a 60 fps, sin librerías. Úsala cuando pidan una animación dibujada a mano, un estado animado (cargando, vacío, éxito, sin resultados), un corto con escenas o planos, un morph entre formas, un personaje o una mano animados, iconos que hierven, «trazo vivo», «soma animation», «boil a 60 fps» o «como las animaciones de Claude». Trae el motor (trazo.js), sus estilos (trazo.css), un ejemplo mínimo, una galería con tres cortos completos y un script para revisar cuadro por cuadro. Para películas de pixel art o las viñetas del CRM de Soma, eso es la skill animacion-soma.
---

# Soma animation · trazo vivo

Animaciones de línea, hechas con código, que se ven dibujadas a mano. La línea tiembla todo el tiempo (el hervor), hay un bloque gris fuera de registro detrás de cada pieza y un punto azul que hace de personaje. Corren a 60 cuadros por segundo y no usan ninguna librería.

Lo que las hace buenas no es el temblor: es que **le pasa algo a alguien y que las cosas tienen peso**. La sección 5 es la importante, y empieza por lo que ya se probó con Alex: qué gustó, qué no y por qué.

## 1. Archivos

| Archivo | Para qué |
|---|---|
| `trazo.js` | El motor. Se carga con un `<script>` y deja todo en `window.Trazo`. |
| `trazo.css` | Los estilos del dibujo y sus seis colores, en claro y en oscuro. |
| `ejemplo.html` | Lo mínimo que funciona: un bucle y un corto de dos planos. Empieza copiándolo. |
| `galeria.html` | La referencia completa, en un solo archivo: tres cortos de tres planos (una persona que piensa, una puerta que se vuelve expediente, un cobro que se vuelve recibo), cuatro bucles e iconos. Lee el corto que más se parezca a lo que vas a hacer antes de escribir. |
| `reparto.js` | Las personas: `persona` (Alex), `gente` (cualquier otra), `actua` para ponerlas en una pose y `mezclaPose` para pasar de una pose a otra. Se carga después de `trazo.js` y deja todo en `window.Reparto`. |
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

Piezas hechas: `punto(r, n)`, `rayos(n, líneas)`, `corona(n, cuántos, r0, r1)`, `manoSvg(k)` con `indice(e)`, `madeja(cx, cy, R, e, fase)` (un enredo que con `e = 0` es un círculo) y `nube(cx, cy, r)`.

Modos: `Trazo.modo('suave' | 'treses' | 'quieto')`. «Treses» es el hervor clásico de 8 dibujos por segundo.

## 5. El oficio

### Lo que ya se probó

Esto no es teoría, es lo que Alex dijo al ver cada animación. Antes de planear una nueva, léelo. Cuando Alex dé un veredicto nuevo, se agrega un renglón aquí.

| Animación | Qué dijo | Por qué |
|---|---|---|
| Alex pensando (la persona duda, se le ocurre algo, levanta el dedo) | Gustó | Hay alguien con cara y se le ve lo que siente |
| El cocinero al que se le juntan las comandas, llega el punto y quedan en orden | «Me encantaron» | Es el problema del dueño que la está viendo, y se ve cómo queda resuelto |
| Una sola toma donde todo se transformaba en otra cosa, sin cortes | «Quedó peor» | Era ingeniosa y no le pasaba nada a nadie. El morph era la historia |
| Dibujitos chicos en una esquina de la lámina | No | No se veían. Una animación que acompaña a un texto ocupa su mitad de la pantalla |
| Un objeto solo que se mueve (una etiqueta, un reloj, un globo) | «Hay que pulirlas» | Se lee como icono. Se arregló poniendo al lado a la persona que reacciona al objeto |
| Las dos visitas completas, hechas en una tarde (28 nov): un dibujo por lámina, casi todos de un solo encuadre | «La idea ya la tienes», pero «hay partes donde nomás se ve el gerente y no te demuestra nada» | Un busto que parpadea no cuenta nada. Pidió objetos, morphing y escenas distintas, y que se construyera como su galería |
| La segunda vuelta (28 nov): la madeja y el carrete, «Primero el problema» en tres planos, la libreta con mano y lápiz, el local que se construye | Pendiente de veredicto | Se anota aquí cuando Alex las vea moverse |

De ahí salen siete reglas. Van en orden de importancia:

1. **A alguien le pasa algo.** Una persona que se agobia, desconfía, descansa o presume jala más que cualquier forma bonita. Pero ojo: una cara no basta. Un busto que solo parpadea y asiente no demuestra nada, y Alex lo rechazó. La persona va solo donde su reacción es el tema, y actúa con objetos; en lo demás, el que actúa es el objeto, o una mano que entra, hace algo y se va.
2. **Es el problema de quien la mira.** El dueño de un restaurante ve a un cocinero con comandas encima y se reconoce. Primero se ve el problema, después cómo queda. Un símbolo que se mueve no es un problema.
3. **El punto llega en el giro.** El punto es Soma: no carga con toda la historia, entra cuando las cosas cambian y las acomoda. La persona siente y el punto resuelve. Solo en un bucle sin persona el punto es el personaje.
4. **Sube y remata.** Lo que se repite va cada vez más rápido o más grande (cada comanda llega antes que la anterior) hasta que algo se rompe, y al final hay un gesto chico que hace sonreír: el cocinero presume su tableta.
5. **El morph es sazón.** Uno por corto, a lo mucho dos, y que diga algo (las comandas sueltas se vuelven una pantalla). Si quitas los morphs y ya no queda historia, no había historia.
6. **Planos con cortes.** Tres planos que empatan se entienden mejor que una toma larga donde todo fluye. El corte le da aire al ojo.
7. **Cierra donde empezó.** La última pose es la primera, para que el bucle no brinque.

Antes de dibujar, contesta en una línea cada una: ¿quién es?, ¿qué le pasa?, ¿qué siente?, ¿en qué momento llega el punto?, ¿cuál es el remate? Si no hay respuesta para alguna, todavía no está lista.

### La galería contra un borrador

`galeria.html` es la vara. Alex la señaló como la calidad que quiere, y al comparar su código con un primer intento flojo la diferencia no estaba en el motor sino en cómo se construye:

| En la galería | En el borrador flojo |
|---|---|
| Tres planos: general, detalle, general. Cada uno con su cámara | Un solo encuadre fijo |
| El objeto actúa: el frasco abre la boca antes de cada moneda, traga y brinca de gusto | El objeto aparece y se queda |
| 8 a 12 gestos encimados por plano, cada uno con vuelo, acción y rebote | 2 o 3 gestos |
| Cada golpe se siente en tres lugares: quien pega se aplasta, salen rayos, la cámara se sacude | Casi ningún golpe |
| El morph arrastra a los demás: el frasco se vuelve recibo y las monedas, sus renglones | El morph va solo |
| Una mano entra, hace algo y se va. Hay gente sin un busto de frente | Busto de frente |
| El dibujo llena su cuadro; el detalle recorta sin miedo | Figura chica con aire alrededor |
| Se entra a la escena siguiente por una forma (el globo crece hasta llenar el cuadro) | Fundido |

Antes de escribir un plano, cuenta: ¿cuántos gestos tiene?, ¿qué objeto actúa?, ¿dónde está el golpe y cuáles son sus tres ecos?, ¿qué hace la cámara?, ¿el dibujo llena el cuadro? Si alguna respuesta es «nada», todavía es borrador.

### Entrar a un detalle sin que engorde la línea

Para ver «lo que ve la lupa» el mundo se agranda con la cámara (3.2 veces) y la línea se adelgaza lo mismo. `trazo.css` ya trae la regla: basta con poner `--z` en el grupo que se agranda.

```js
const z = mezcla(1, 3.2, entra)
camara(q('mundo'), cx, cy, z)
q('mundo').style.setProperty('--z', z)            // la línea mide 3.1 / z
```

- El mismo dibujo sirve para el plano general y para el detalle: es una función (`local(k)`) que se llama en cada plano con otro prefijo.
- Lo de afuera de la lente se tapa con `<circle class="mascara">`, un aro gordo del color del papel.
- El `<svg>` de un plano así lleva `overflow: hidden`. Si no, el mundo agrandado y la máscara se salen del cuadro y tapan el texto de la página.
- La lente crece hasta llenar el cuadro al final del plano general, y el detalle empieza con ese mismo aro: el corte no se nota.

### Una mano en lugar de un busto

Cuando hace falta alguien pero no su cara: una mano con su herramienta. El origen del grupo es la punta de la herramienta (la punta del lápiz, la base del sello), así se mueve diciendo dónde toca.

```js
G('mano',
  T(D(capsula([34, 14], [150, 150], 19)), { cls: 'ln tapa' }) +     // el brazo, hasta fuera del cuadro
  T(D(capsula([3, -5], [29, -50], 6.4, 3)), { cls: 'ln tapa' }) +   // el lápiz
  `<g transform="translate(30 12) rotate(-58)">${manoSvg('m')}</g>` +
  '<circle class="azul" cx="30" cy="-51.5" r="4.6"/>')              // la goma es el punto
pon(q('mano'), { x: punta[0], y: punta[1] })
```

El brazo sale del cuadro, así que ese `<svg>` también lleva `overflow: hidden`.

### Que el dibujo caiga sobre la interfaz de verdad

Si la animación termina en algo que existe en la página (las filas de una ficha), no dibujes una copia: mide la pieza real y pon el dibujo encima con sus mismas medidas.

```js
const r = ficha.getBoundingClientRect()
const k = 320 / r.width                              // el dibujo siempre mide 320 de ancho
svg.setAttribute('viewBox', `0 0 320 ${r.height * k}`)
const filas = items.map((it) => { const b = it.getBoundingClientRect(); return [(b.left - r.left) * k, (b.top + 15 - r.top) * k, …] })
```

- Se mide cuando la lámina entra, no al montarla: antes puede estar oculta y medir cero.
- Lo que se mide no puede traer un `transform` de entrada (un `x: 18` de GSAP corre la medida). Esas piezas entran solo con opacidad.
- Cada fila real aparece cuando su hilo termina, y el hilo se desvanece: si se queda encima parece tachado.
- Si no hay filas, la animación no corre.

### Tres tamaños, y no todas llevan gente

Alex lo dijo así: «no es necesario que en todas salgan monos, pero que tengan mucha personalidad». En una presentación de varias láminas se reparte así:

| Tamaño | Cuándo | Ejemplo |
|---|---|---|
| **Con persona** | La lámina habla de cómo se siente quien la mira | El dueño y su maraña, Alex anotando |
| **Objeto con carácter** | La lámina explica algo | El «?» que se vuelve lupa, el local que crece, el calendario |
| **Respuesta al toque** | El cliente está eligiendo o leyendo; un dibujo grande distrae | La palomita en la ruta que interesó |

Un objeto tiene carácter cuando **el punto vive en él**: es el punto del «?», la pupila de la lupa, la luz del local, la moneda del billete. Y cuando reacciona: se sacude al encontrar algo, da un saltito al quedar apartada la fecha.

### Un hilo que une las láminas

Diez dibujos sueltos se sienten como diez dibujos. Para que sea una sola historia, **algo regresa**:

- Un personaje: el dueño aparece en cuatro láminas y siempre es el mismo.
- Un objeto que cambia de sentido: la maraña crece con cada problema y más tarde el punto la desenreda en renglones. La etiqueta que se tachó el primer día vuelve el segundo, y ahora el punto sí escribe en ella.
- Una promesa que se cumple: «usted marca el ritmo» fue un reloj en pausa; cuando el cliente dice «lo voy a pensar», aparece ese mismo reloj.

Se planea antes de dibujar: una tabla con todas las láminas, su tamaño y qué regresa en cada una. Con Alex funcionó aprobar ese guion una sola vez y luego hacerlas de corrido, entregando cada tanda.

### Que el dibujo responda a lo que pasa en la lámina

En una interfaz la animación no corre sola: le avisan. Cada función devuelve con qué se le habla, y el estado cambia con una mezcla de medio segundo, nunca de golpe.

```js
const vivo = sueleVivo(svg, marcados.length)   // { pon(n) }
boton.addEventListener('click', () => vivo.pon(marcados.length))
// adentro: de cuántos «se veían» a cuántos son, en 0.55 s, más un susto al subir
const nv = mezcla(desde, n, suave(tramo(t - tk, 0, 0.55)))
```

- Lo que el estado controla es **cuánto**: cuánta maraña está trazada, qué tan apurado está (`s = nv / 4`), si la mano ya subió.
- Cada cambio lleva su golpe: un susto al marcar, un suspiro al desmarcar.
- Para revisar, las funciones aceptan el segundo del reloj (`vivo.pon(3, 100)`) y se detienen con `Trazo.fija(100.4)`.
- Si el dibujo va **antes** del contenido (la maraña que se vuelve la ficha), dura menos de tres segundos y se quita solo.

### Una figura por paso

Para una lámina de pasos (método, niveles, compromisos): una sola figura cerrada que cambia de forma, con los detalles de cada paso dibujándose encima. Todas las formas llevan el mismo número de puntos, **empiezan arriba al centro y giran hacia la derecha**. En el repo es `figuraViva(svg, PASOS)` y cada paso es `{ dur, forma, giro(L), svg(), detalle(q, L), punto(L) }`.

### Una plantilla, varias pieles

Cuando hacen falta varios cortos que cuentan lo mismo (uno por giro), el corto se escribe una vez como función de **quién actúa** y **qué se le junta**: `corto(persona, cosa)`. La persona sale de `gente(k, { pelo, pecho, ropa })` y la cosa es un dibujo que cabe en una caja de `w × h`. Seis familias salieron de un solo corto en media hora. Lo que no debe compartirse es el remate: cada piel merece el suyo.

### Un objeto solo es un icono: ponle a alguien al lado

Cuando el texto habla de una idea (un precio, el tiempo, decir que no), el dibujo del objeto no alcanza. Se pone a la persona a la que le habla el texto y el objeto pasa a ser lo que ella mira.

- La persona va grande y abajo, el objeto más chico y arriba, del lado hacia donde ella mira.
- **La persona causa lo que le pasa al objeto.** Levanta el dedo y por eso el reloj se detiene; niega con la cabeza mientras se escribe el NO. Su gesto empieza 0.1 a 0.2 s antes que el efecto.
- Cada idea lleva un arco de tres tiempos: cómo llega (desconfía), el giro (se sorprende cuando tachan el precio) y cómo queda (suspira y sonríe).
- Mira al objeto casi siempre (`mira: [3, -1.7]`) y voltea a otro lado solo cuando la historia lo pide.

```js
const { gente, actua, mezclaPose } = Reparto
// en el svg: la persona en su lugar y el objeto reducido en su propio grupo
'<g transform="translate(-58 46)">' + gente('u', { pelo, pecho }) + '</g>' +
'<g class="chico" transform="translate(124 3.6) scale(0.62)">' + objeto + '</g>'

// en paso: la pose de este momento, entrando desde la pose en que estaba
const nueva = PASOS[a].pose(L)                    // { gira, mira, abre, cejas, boca, mano, … }
pose = u < 0.6 ? mezclaPose(poseSale, nueva, suave(tramo(u, 0, 0.6))) : nueva
actua(q, 'u', pose)
// la mano solo existe cuando actúa: en reposo se desvanece
for (const n of ['um', 'uante', 'umanga']) ve(q(n), levantada)   // 0 en reposo, 1 con la mano arriba
```

Dos cuidados: un grupo reducido adelgaza la línea, así que se le sube el grosor en proporción (`.chico .ln { stroke-width: 5 }` para una escala de 0.62); y una mano en reposo que se asoma bajo el busto parece muñón, por eso se oculta.

### Primero la historia

Antes de dibujar, escribe el guion como comentario: qué pasa, en una frase por plano. Si no se puede contar en tres frases, no está listo.

- **Bucle** (3 a 6 s): una sola idea que se repite. *El punto recorre los días y aparta uno.*
- **Corto** (10 a 16 s, tres planos): algo cambia. *Toca la puerta. Le abren. La puerta se vuelve su expediente.*
- El final dice lo mismo que el texto que acompaña a la animación. Si el texto es «su expediente aparecerá aquí», la animación termina en un expediente.
- **En un bucle sin persona, el punto es el personaje.** Quiere algo, lo intenta y lo consigue. No tiene cara: su carácter está en cómo se mueve. En un corto con persona, el punto llega en el giro (regla 3).

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
- **Una persona** sale de `reparto.js`: `persona(k)` dibuja a Alex, `gente(k, { pelo, pecho, ropa })` a cualquier otra (tú le das el pelo o el gorro y lo que lleva en el pecho) y `actua(q, k, { gira, mira, abre, cejas, boca, brazo, dedo, mano, pelo, lentes, … })` la pone en una pose. `mezclaPose(A, B, p)` pasa de una pose a otra sin brinco. Un oficio se dice con una prenda: gorro de cocinero, cuello de camisa, mandil.
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

Y que la revisión no se coma la entrega: una tira por plano, se corrige lo que se ve mal y se entrega. Si dos intentos de captura fallan, no pelees con la herramienta: toma fotos en tiempo real cada 0.4 s o entrega y di qué no pudiste ver. Alex prefiere algo que ya funciona hoy a algo perfecto en una hora.

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
| Una mano se asoma debajo del busto, como muñón | Está en reposo y sigue dibujada. Ocúltala con `ve` mientras no actúa |
| La línea adelgaza en una pieza | Va dentro de un grupo reducido. Súbele el grosor en proporción a la escala |
| `rotate(NaN)` en la consola | Un reloj «todavía no» puesto en `Infinity`: `Math.sin(-Infinity)` es `NaN` y `0 * NaN` también. Usa un número grande (`1e9`) |
| El dibujo empuja el texto fuera de la lámina | Se agregó sin quitar nada. Si entra un dibujo, el título baja de tamaño o cambia de lugar: se revisa la lámina completa, en ancho y en vertical |
| Una lámina vecina se rompió | Compartía clases con la que se rehízo. Antes de borrar un estilo, busca quién más lo usa |
| El dibujo tapa el texto de la página | El `<svg>` tiene `overflow: visible` y algo se sale: un brazo, una máscara, el mundo agrandado. Ponle `overflow: hidden` |
| Las piezas de una tarjeta oscura salen con colores de papel | La tarjeta vive en una lámina clara y hereda sus variables. Dale las suyas a la tarjeta |
| En celular se encima con el pie de la lámina | La lámina tiene alto fijo y el contenido no cabe. En vertical se desplaza y cada mitad mide lo que su contenido |
| Se ve bien hecha y no dice nada | No hay nadie a quien le pase algo. Vuelve a «Lo que ya se probó» |
| Todo se ve gris en oscuro | Se escribió un color fijo en vez de una variable |

Y tres cosas del motor: `forma` necesita siempre el mismo número de puntos que la forma original; el costo con todo en pantalla debe quedar bajo 4 ms por cuadro (lo que no está a la vista no se calcula); con `prefers-reduced-motion` se muestra el `cartel` y nada se mueve, así que elige un `cartel` donde la historia ya se entienda.

## 9. Antes de entregar

- [ ] Hay un objeto que actúa (o una persona que actúa con objetos). Ningún busto que solo parpadea.
- [ ] Cada plano tiene su cámara, un golpe con sus tres ecos y el cuadro lleno.
- [ ] Si son varias láminas, algo regresa de una a otra.
- [ ] La lámina completa se ve bien con el dibujo puesto, en laptop y en celular.
- [ ] Hay un remate, y a lo mucho dos morphs.
- [ ] El guion está escrito arriba del código y cada plano hace una sola cosa.
- [ ] El final coincide con el texto que acompaña.
- [ ] Todo lo que se mueve toma vuelo y se pasa al llegar; lo que brinca se aplasta y se estira.
- [ ] Si hay manos, tienen dedos. Si hay una persona, actúa por partes y parpadea.
- [ ] Hay un solo acento de color.
- [ ] Lo vi en tiras de fotos, plano por plano, en claro y en oscuro, sin errores.
- [ ] Tiene `cartel`, y a 390 px de ancho no empuja la página hacia los lados.

## 10. En el repositorio de Soma (studio)

La galería vive también en `docs/soma-animation.html` (es la que está publicada) y hay que mantener las dos copias iguales. El motor está en `src/core/trazo.js` (copia exacta de `trazo.js`, se importa con `src/core/trazo-vivo.js`) y el reparto en `src/visita1/reparto-trazo.js` (de ahí sale `reparto.js`). Dentro de la app las clases del dibujo van bajo `svg.tv`. Las láminas de las dos visitas están en `src/visita1/trazos-escenas.js` (la madeja, «Primero el problema» en tres planos, la libreta, el local que se construye; `fichaViva` mide la ficha real) (se revisan con `node scripts/escena.cjs <puerto> <carpeta> <escena>`). Ya lo usan la portada de la visita (`src/visita1/cortos-giro.js`, la plantilla `corto(persona, cosa)` con seis familias; se revisan con `node scripts/cortos.cjs`) y «Antes de empezar» (`src/visita1/trazos.js`, el dueño que reacciona a cada compromiso; se revisa con `node scripts/acuerdo.cjs`). Las películas de pixel art, las viñetas de cada sección y el boil de tres dibujos del CRM son otra cosa: skill `animacion-soma`.
