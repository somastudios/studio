---
name: ui-soma
description: Diseña y construye interfaces con el estilo de Soma, piezas con volumen ligero que se levantan del papel, esquinas muy redondeadas y formas básicas combinadas (píldoras, círculos, aros, barras, puntos). Úsala cuando pidan una pantalla, un componente, botones, tarjetas, un tablero o «que se vea como el CRM de Soma», «UI AAA», «botones 3D», «con border radius», «el botón del círculo con el más», o cuando haya que rediseñar algo que se ve plano o genérico. Trae la hoja de estilos base (base.css) y una galería (galeria.html), en Blanco y en Negro, y explica cómo acomodar el mismo lenguaje a los colores y la tipografía que ya tenga el proyecto.
---

# UI al estilo Soma

La idea completa cabe en una frase: **la pantalla es una mesa de papel con una sola luz arriba, y encima hay piezas.** Lo que se toca se levanta, lo que se llena va hundido y lo demás se queda plano. Todo lo de abajo sale de ahí.

En esta carpeta hay dos archivos más:

- `base.css`: las piezas ya hechas, con variables. Cópiala al proyecto o toma solo lo que haga falta.
- `galeria.html`: todas las piezas juntas, en Blanco y en Negro. Ábrela para ver cómo quedan antes de escribir.

## 1. Cómo se hace el volumen

Una pieza levantada tiene cinco capas. Si falta una se ve plana, y si sobra una se ve de plástico.

| Capa | Qué es | En CSS |
|---|---|---|
| Superficie | Un degradado casi invisible, más claro arriba | `linear-gradient(180deg, #f8f6f0, #ebe8df)` |
| Borde | Una línea clara, nunca gris | `1px solid rgb(255 255 255 / .88)` |
| Filo de luz | Un pixel de luz en la orilla de arriba | `inset 0 1px 0 #fff` |
| Canto | El grosor de la pieza: una sombra sólida, sin difuminar | `0 3px 0 #000` |
| Sombra | Una de contacto, corta, y una de ambiente, larga y recogida | `0 1px 1.5px rgb(5 5 6 / .1), 0 10px 22px -10px rgb(5 5 6 / .2)` |

```css
/* El botón principal, completo. */
.boton {
  border: 1px solid #3a3b44;
  border-radius: 999px;
  background: linear-gradient(180deg, #2d2e36, #050506);
  color: #efece4;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / .22), /* filo de luz */
    0 3px 0 #000,                          /* canto */
    0 12px 18px -8px rgb(5 5 6 / .5);      /* sombra */
  transition: transform .14s cubic-bezier(.16, 1, .3, 1), box-shadow .14s cubic-bezier(.16, 1, .3, 1);
}
/* Al presionar baja lo que mide su canto, y el canto desaparece. */
.boton:active {
  transform: translateY(3px);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .22), 0 0 0 #000;
}
```

Tres reglas que no se rompen:

1. **La luz siempre viene de arriba.** Lo claro va arriba y la sombra cae hacia abajo, en todas las piezas de la pantalla.
2. **La sombra lleva el color de la pieza.** Debajo de una ficha azul la sombra es azul oscuro (`color-mix(in srgb, var(--f-s) 70%, transparent)`), no gris.
3. **Presionar es bajar.** `translateY` igual al canto, 140 ms. Nunca `scale` en una pieza con canto, y nunca solo un cambio de color.

## 2. Cuatro alturas

Antes de dibujar, decide a qué altura vive cada cosa. La jerarquía de la pantalla es esto.

| Altura | Qué va ahí | Cómo se ve | Clase |
|---|---|---|---|
| Hundido | Lo que se llena o se desliza: campos, rieles, interruptores, selectores | Sombra por dentro, arriba, y un filo de luz abajo | `s-campo`, `s-riel`, `s-interruptor`, `s-selector` |
| Apoyado | Lo que agrupa y no se presiona: tarjetas, listas, vacíos | Degradado, borde claro y sombra suave, sin canto | `s-tarjeta` |
| Levantado | Las acciones de todos los días | Lo mismo, en píldora, y baja 1.5 px al presionar | `s-btn`, `s-redondo` |
| Con canto | La acción principal y las fichas de color | Canto sólido de 3 px (botón) o 6 px (ficha) | `s-btn--pri`, `s-btn--acento`, `s-ficha` |

- Un solo botón principal por pantalla. Si dos cosas tienen canto en el mismo grupo, ninguna manda.
- Lo que no se puede tocar no lleva canto. El canto promete que algo se presiona.
- Dentro de una tarjeta los renglones se separan con una línea (`s-renglon`), no con más tarjetas.

## 3. Formas

El vocabulario son seis formas. Una pieza buena combina dos, a veces tres.

| Forma | Sirve para |
|---|---|
| Píldora (`border-radius: 999px`) | Botones, chips, rieles, selectores |
| Círculo | Botón de un solo icono, sello con número o inicial, perilla del interruptor |
| Aro (círculo de línea) | Un icono dentro de una pieza llena, avance, énfasis |
| Tarjeta (radio 20 a 26) | Contenedores y fichas |
| Barra | El remate azul junto a un título, el avance de un riel |
| Punto | Estado, cursor de la navegación, final de un título |

Cómo se combinan:

- **Píldora + aro** (el de «NUEVA VISITA»). El aro va pegado a un extremo, con el mismo margen arriba, abajo y al lado: `aro = alto − 2 × margen`. Así su curva queda concéntrica con la de la píldora, y por eso se ve bien. Adentro del aro, el icono más simple posible. El texto, condensado y en mayúsculas.
- **Píldora hundida + círculo levantado**: el interruptor. **Píldora hundida + píldora levantada**: el selector. **Píldora hundida + barra**: el riel.
- **Tarjeta + sello**: el renglón de una lista empieza con un círculo (inicial o número) y termina con una flecha.
- **Barra + título**: una barra del color de acento, de 0.17 em de ancho, antes del título de la pantalla.
- **Radios concéntricos**: una pieza dentro de otra lleva `radio de adentro = radio de afuera − relleno`. Una ficha de radio 26 con relleno 10 lleva adentro piezas de radio 16.

```html
<a class="s-pildora" href="#">
  <svg class="s-aro" viewBox="0 0 48 48"><circle cx="24" cy="24" r="21.6"/><path d="M24 15v18M15 24h18"/></svg>
  Nueva visita
</a>
```

Solo tres radios por pantalla, más la píldora: 16 (campos), 22 (tarjetas) y 26 (fichas). Nada de 4, 6 u 8: una esquina casi recta rompe el lenguaje.

Los iconos son de línea, con grosor 2 y puntas redondas, hechos con las mismas formas (círculos, líneas, rectángulos redondeados). Nunca emojis ni iconos rellenos mezclados con los de línea.

## 4. Fichas de color

La pieza grande: un dato y, si se quiere, una ilustración abajo. Cada color son cuatro tonos del mismo color.

| | Claro `--f-c` | Base `--f` | Oscuro `--f-o` | Canto `--f-s` |
|---|---|---|---|---|
| Azul | `#5d95ff` | `#216fff` | `#1a58e2` | `#1848b4` |
| Amarillo | `#ffe184` | `#ffc93c` | `#f3a41d` | `#c98510` |
| Verde | `#8de8b3` | `#24cf72` | `#17b862` | `#12924d` |
| Rojo | `#ff9d96` | `#ff574a` | `#f03d33` | `#c12e26` |
| Negro | `#34363f` | `#17181d` | `#050506` | `#000` |

El volumen de una ficha sale de cuatro cosas: el degradado en diagonal (claro, base, oscuro), **dos brillos curvos**, el canto de 6 px y la sombra teñida. El brillo curvo es un círculo enorme que asoma por una esquina, hecho con un `radial-gradient` de borde duro:

```css
background:
  radial-gradient(118% 140% at 110% -14%, rgb(255 255 255 / .17) 0 49.4%, transparent 50%),
  radial-gradient(64% 84% at 112% 108%, rgb(255 255 255 / .13) 0 49.4%, transparent 50%),
  linear-gradient(142deg, var(--f-c) 0%, var(--f) 46%, var(--f-o) 100%);
```

- Cada ficha mueve sus brillos a otra esquina (`--b1`, `--b2`). Cuatro fichas iguales se ven clonadas.
- El texto sobre color es negro (`#050506`), no blanco. El blanco solo va sobre la ficha negra.
- El número va enorme, condensado y pesado (`font-weight: 900; font-stretch: 72%; line-height: .86`), con la etiqueta a un lado, en dos renglones cortos.
- Para un color que no está en la tabla: `<a class="s-ficha s-ficha--de" style="--f: #b68cff">`, los otros tres tonos se calculan con `color-mix`.
- El color significa algo y significa lo mismo en toda la app (en el CRM: azul prospectos, amarillo clientes, verde cobrado, rojo por cobrar). No se usa para decorar.

## 5. Tipografía

Una sola familia con eje de ancho. En Soma es **Archivo** variable (`wdth 62–125`, `wght 100–900`).

| Uso | Ajuste |
|---|---|
| Título de pantalla | 850, `font-stretch: 88%`, con su barra |
| Texto de botón | 650, ancho normal, 16 px |
| Etiquetas, chips, botón de píldora con aro | 650–700, `font-stretch: 64–70%`, mayúsculas, `letter-spacing: .03–.06em` |
| Cifras grandes | 900, `font-stretch: 72%`, `line-height: .86` |
| Texto corrido | 400, 16 px, color al 62 % |

Nada de monoespaciadas para etiquetas: se ven de consola. Si la marca del cliente usa otra familia, que tenga un corte condensado; si no lo tiene, las etiquetas van en mayúsculas, peso 700 y `letter-spacing: .08em`.

## 6. Blanco, Negro y el proyecto

Hay dos fondos. Las piezas son las mismas en los dos.

| Fondo | Clase | Cómo es |
|---|---|---|
| Blanco | `s-blanco` (el de siempre) | Un blanco cálido de papel (`#efece4`), sombras suaves, botón principal negro y acento azul |
| Negro | `s-negro` | De noche: la luz baja, los filos casi no se ven, lo levantado es más claro que su riel y el azul sube un tono |

No se mezclan en una misma pantalla. Las fichas de color funcionan igual sobre los dos.

**Fuera de Soma no hay estilos con nombre: el estilo se acomoda a lo que ya tenga el proyecto.** Antes de escribir una sola pieza:

1. **Lee el proyecto.** Busca sus colores, su tipografía y sus radios donde vivan: variables de CSS, el tema de Tailwind, los tokens del sistema de diseño, el logotipo, las pantallas que ya existen.
2. **Elige el fondo.** Si el proyecto es claro, parte de Blanco; si es oscuro, de Negro.
3. **Cambia solo los valores de las variables**, con lo que encontraste. El esqueleto (las cinco capas, las alturas y las formas) no se toca.

| Lo que tiene el proyecto | Variables que cambian |
|---|---|
| Su color de fondo | `--s-fondo`, y de ahí `--s-alto`, `--s-bajo` y `--s-hundido`: la superficie un poco más clara que la mesa |
| Su color de texto | `--s-tinta` y sus dos transparencias; `--s-sombra` toma ese mismo tono para que la sombra no sea gris |
| Su color de marca | `--s-acento`, con su tono claro (`--s-acento-c`) y su canto (`--s-acento-s`) |
| Su botón principal | `--s-pri` y los suyos. Si la marca ya es oscura, el principal puede ser el color de marca |
| Su tipografía | `--s-fuente` (ver la sección 5 si no tiene corte condensado) |
| Su carácter | `--s-canto`: 0 a 2 px si es serio, 3 px como Soma, más si es juguetón |

```css
/* Ejemplo: un proyecto que ya tiene un verde de marca y un azul marino para el texto. */
.marca {
  --s-fondo: #edf1f5;
  --s-alto: #fff;
  --s-bajo: #f3f6f9;
  --s-hundido: #f6f8fb;
  --s-tinta: #0e1a2b;
  --s-tinta-2: rgb(14 26 43 / .62);
  --s-tinta-3: rgb(14 26 43 / .36);
  --s-sombra: 28 52 92;
  --s-pri-c: #1d3252;
  --s-pri: #0e1a2b;
  --s-pri-s: #050b14;
  --s-acento-c: color-mix(in oklab, #12a594 70%, #fff);
  --s-acento: #12a594;
  --s-acento-s: color-mix(in oklab, #12a594 72%, #000);
  --s-acento-rgb: 18 165 148;
  --s-canto: 2px;
}
```

Lo que no cambia aunque cambie la marca: los radios generosos, la luz de arriba, un solo principal por pantalla y la mesa nunca en blanco puro (con `#fff` de fondo las piezas ya no pueden ser más claras que la mesa). Si el proyecto ya tiene componentes propios, se les pone el volumen a ellos con sus nombres; no se mete una segunda familia de clases al lado.

## 7. Movimiento

- Presionar: 140 ms, `cubic-bezier(.16, 1, .3, 1)`.
- Con cursor (`@media (hover: hover)`): las fichas suben 3 px y su canto crece; el aro gira 90° en 0.7 s; el botón principal se vuelve del color de acento.
- Nada se mueve solo, salvo que cuente algo (un reloj, un avance, una escena). Si hay animaciones con personajes o trazos dibujados, eso es la skill `animacion-soma`.
- `prefers-reduced-motion` apaga las transiciones.

## 8. Lo que hace que se use bien

- Todo lo que se toca mide 44 px o más de alto; los botones, 48 a 52.
- En teléfono la acción principal de la app flota abajo a la derecha, sobre la barra de navegación, con `env(safe-area-inset-bottom)`.
- `:focus-visible` con un contorno de 3 px del color de acento, separado 3 px. Nunca se quita el foco sin poner otro.
- `:hover` solo dentro de `@media (hover: hover)`, para que no se quede pegado en teléfono. `-webkit-tap-highlight-color: transparent` en lo que ya tiene su propio estado al presionar.
- Cada pieza tiene sus estados: normal, cursor encima, presionado, foco, deshabilitado (45 % de opacidad, sin eventos) y, si aplica, cargando.
- El texto siempre pasa contraste: negro sobre color, claro sobre negro, y el texto secundario al 62 %, nunca menos.
- Nada empuja la página hacia los lados. Se revisa a 320, 390, 768 y 1280 de ancho.
- Los textos de la interfaz se escriben con la skill `soma-copywriting`.

## 9. Lo que no

| No | Por qué |
|---|---|
| Neumorfismo (pieza del mismo color que el fondo, con sombra clara y oscura) | No se distingue qué se toca y no pasa contraste |
| Vidrio con desenfoque | Es otro lenguaje; aquí las piezas son sólidas |
| Sombras grises grandes y parejas alrededor | La luz viene de arriba: la sombra cae, no rodea |
| Bordes grises de 1 px en todo | El borde es luz: una línea clara, nunca gris |
| Resplandores y degradados de varios colores | Un color por pieza, en sus cuatro tonos |
| Canto en todo | Si todo está levantado, nada lo está |
| Radios de 4 a 8 px | Rompen el lenguaje |
| `#fff` de fondo | Las piezas ya no pueden ser más claras que la mesa; Blanco es un blanco cálido |

## 10. Cómo trabajar

1. **Entiende la pantalla.** Qué viene a hacer aquí la persona y cuál es la única acción principal.
2. **Elige el fondo y lee el proyecto.** Si es de Soma, Blanco o Negro tal cual. Si es de otra marca, sigue la sección 6 y di en una línea qué tomaste del proyecto antes de escribir.
3. **Reparte alturas.** Una lista corta: qué va hundido, qué apoyado, qué levantado y qué con canto.
4. **Arma con piezas de `base.css`.** Si falta una, constrúyela combinando formas de la sección 3 y con las mismas variables; no inventes sombras ni radios nuevos.
5. **Dale sus estados** a todo lo que se toca.
6. **Míralo.** Captura a 390 y a 1280 de ancho y revisa contra la lista de abajo. Si algo se ve plano, le falta una capa; si se ve de plástico, le sobra brillo o canto.

Antes de entregar:

- [ ] Hay un solo botón principal por pantalla.
- [ ] La luz viene de arriba en todas las piezas y las sombras de color están teñidas.
- [ ] Todo lo presionable baja al presionarse y tiene foco visible.
- [ ] No hay más de tres radios, ni esquinas casi rectas.
- [ ] Los aros y las piezas anidadas son concéntricos con su contenedor.
- [ ] No hay desplazamiento lateral a ningún ancho.
- [ ] Quitando el color, la jerarquía se sigue entendiendo por la altura.

## 11. En el repositorio de Soma (studio)

Ahí el estilo ya está puesto, con otros nombres. No se importa `base.css` ni se usa el prefijo `s-`: se extiende lo que hay.

| Qué | Dónde |
|---|---|
| Botones, tarjetas, campos y encabezados del CRM | `src/styles/crm-volumen.css` (clases `a-btn`, `a-tarjeta`, `a-in`, `a-vacio`) |
| Fichas de color, «Nueva cita», el sello de la fecha | `src/styles/hoy.css` (`ficha`, `hoy-cita`, `sd-`) |
| La píldora «Nueva visita» y la navegación | `src/styles/crm.css` (`crm-nueva`) y `src/crm/marco.js` |
| Colores, tipografía y curvas | `src/styles/main.css` y `src/styles/app.css` |

Después de tocar estilos ahí: `node scripts/ancho.cjs <puerto>` (desplazamiento lateral), `node scripts/desborde.cjs <puerto> <carpeta>` y `node scripts/crm.cjs <puerto> <carpeta>` (capturas de cada pantalla), con el servidor de desarrollo corriendo.
