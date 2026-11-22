# Soma Studio — arquitectura y contratos

Una sola aplicación web (Vite, JavaScript sin framework, GSAP, un solo `index.html` al compilar) con cuatro caras:

| Cara | Ruta | Para quién |
|---|---|---|
| Presentación general | `#/general` | Cualquiera. Las diez escenas originales. |
| Presala y visitas | `#/presala`, `#/visita/:id`, `#/visita2/:id` | El equipo, antes y durante una visita. |
| CRM | `#/crm/…` | El equipo. Prospectos, agenda, membresías, pagos, sistemas. |
| Demo suelta | `#/demo/:modulo/:vista?n=<nicho>&b=<negocio>` | El cliente, en su propio teléfono. |

Los datos viven primero en el dispositivo y se sincronizan con Supabase (proyecto **SOMA CRM**) cuando hay sesión y conexión.

## Mapa del código

```
src/
  main.js               arranque y rutas públicas
  config.js             URL y llave publicable de Supabase
  app/                  router, sesión, capas (diálogos, avisos), utilidades, galerías
  data/                 esquema, almacén local con sincronización, archivos (audio, comprobantes)
  core/                 motor de la presentación: deck (iris), punto, HUD, boil, fx
  deck/                 montar una presentación con cualquier lista de escenas
  scenes/               las diez escenas de la presentación general
  content/              textos: es.js (general), base.js (áreas, familias, vocabulario),
                        soluciones.js (catálogo), nichos/<id>.js (un archivo por giro)
  icons/                icons.js (áreas, botón de anillo), proceso.js, nichos/*.js, render.js
  demos/                host.js (dispositivo), kit.js, muestra.js, mod/<modulo>.js
  interno/              acceso, inicio, presala
  visita1/, visita2/    escenas de la primera y la segunda visita
  crm/                  vistas del CRM
  styles/               main.css + scenes.css (presentación), app.css (interno y CRM),
                        demo.css (demos), interno.css, visita.css
supabase/               migraciones SQL y funciones edge (copia de lo desplegado)
scripts/                validar.mjs (contenido), foto.cjs (capturas)
public/soma-connect.js  el fragmento que enlaza un sistema entregado con el CRM
```

## Voz

Escribimos como escribe Anthropic en las interfaces de Claude: claro, sereno, directo y honesto.

- Frases cortas. Una idea por frase. Sujeto, verbo, consecuencia.
- Concreto antes que genérico: "Cuando la arrachera baja de ocho kilos, usted se entera" en vez de "optimice su inventario".
- Decimos qué hace algo y también qué no hace. Los límites generan confianza.
- Sin signos de exclamación, sin superlativos, sin jerga. Nunca: "potente", "revolucionario", "solución integral", "lleve su negocio al siguiente nivel", "increíble", "de última generación", "inteligente" como adorno.
- Los botones empiezan con verbo y dicen lo que pasa: "Guardar cita", "Enviar pedido". No "Aceptar" ni "OK".
- Mayúscula solo al inicio de la frase. Los titulares de la presentación se ponen en mayúsculas por CSS, no al escribirlos.
- Estados vacíos: dicen qué aparecerá ahí y cómo. Errores: qué pasó y qué hacer, sin culpar a nadie.
- Al cliente se le habla de **usted**. Dentro del CRM y la presala, al equipo se le habla de **tú**.
- Español de México, natural. Nada de "ordenador", "móvil" o "vosotros". Sí: "celular", "cobrar", "apartar", "fiado".
- El cliente del negocio no es "usuario": es "comensal", "paciente", "alumno", lo que corresponda al giro.

## Contrato de un nicho

Un archivo por giro en `src/content/nichos/<id>.js`, sin imports, con `export default { … }`.
El ejemplo completo es `restaurante.js`. `node scripts/validar.mjs <id>` revisa todo lo de abajo.

```js
export default {
  id: 'barberia',            // igual que el nombre del archivo; minúsculas y guiones
  familia: 'cuidado',        // comida | tiendas | cuidado | salud | servicios | estancia | otro
  nombre: 'Barbería',        // singular, como rótulo
  plural: 'barberías',       // minúsculas; se usa en "En barberías como La Navaja…"
  icono: 'barberia',         // clave del icono de nicho (normalmente igual al id)
  acento: '#1f3a5f',         // color de marca ficticio para vestir las demos; sobrio, legible con texto blanco
  orden: 10,                 // opcional: posición dentro de su familia
  vocab: { cliente: 'el cliente', clientes: 'los clientes', personal: 'el barbero', empleado: 'el barbero',
           producto: 'servicio', productos: 'servicios', pedido: 'pedido', pedidos: 'pedidos',
           cita: 'cita', citas: 'citas', lugar: 'local' },   // solo las que cambian; con artículo donde aplica
  apertura: '…',             // una pregunta para romper el hielo, específica del giro. La lee quien presenta.
  observa: ['…', '…', '…'],  // tres cosas en las que fijarse al entrar, antes de abrir la laptop
  muestra: {                 // datos ilustrativos para las demos, creíbles para el giro y para México
    productos: [{ nombre, precio, categoria }],   // 10 a 14, en 3 o 4 categorías; precios en pesos
    servicios: [{ nombre, precio, minutos }],     // 4 a 6: lo que se agenda o reserva en este giro
    personal:  ['…', '…', '…', '…'],              // exactamente 4 nombres de pila
    clientes:  ['…' ×6],                          // exactamente 6
    insumos:   [{ nombre, unidad, hay, minimo }], // 6 a 8: lo que se inventaría; un par por debajo del mínimo
  },
  problemas: [ /* 12 a 14 */ ],
}
```

### Un problema

```js
{
  id: 'servicio-lento',        // único dentro del nicho
  area: 'atencion',            // clientes | atencion | organizacion | inventarios | administracion | logistica | comunicacion | rentabilidad
  titulo: 'El servicio en mesa es lento',   // como lo diría el dueño. Máx. 58 caracteres, sin punto final.
  senal: 'En horas pico los meseros no se dan abasto y las mesas esperan.',  // lo que se ve. Máx. 130.
  frecuente: true,             // entre 5 y 7 por nicho: los que salen en "lo que suele pasar"
  matices: [                   // 1 o 2 preguntas de sí o no que cambian la recomendación
    { id: 'solo', pregunta: '¿Sus comensales pedirían por su cuenta?', si: 'Autoservicio bienvenido', no: 'Prefieren que los atiendan' },
  ],                           // `si` y `no` son etiquetas de 36 caracteres o menos: lo que queda registrado
  rutas: [                     // exactamente 4, cada una con una solución distinta del catálogo
    { sol: 'pedidos-qr', para: 'La mesa ordena en cuanto se sienta…', pide: { solo: true } },
    { sol: 'comandero',  para: '…' },
    …
  ],
}
```

- `sol` es un id de `src/content/soluciones.js`. No se inventan soluciones: se elige la que mejor encaja.
- `para` explica qué cambia **en este negocio** con esa solución, en una o dos frases (máx. 170 caracteres).
  No repite el resumen del catálogo: lo aterriza al giro, con sus palabras y un detalle concreto.
- `pide` (opcional) dice con qué respuestas encaja la ruta. Si el cliente responde otra cosa, la ruta baja
  al final marcada como "no encaja". Al menos una ruta por problema usa `pide` y al menos una no.
- **Orden de las 4 rutas**: de la que más transforma a la más ligera. La cuarta es siempre el paso más
  corto y barato, lo que se puede hacer aunque el presupuesto sea mínimo.
- Procura variedad de ejes entre las cuatro (cliente lo hace solo, el equipo con mejor herramienta,
  automático, ligera). Que no sean cuatro versiones de lo mismo.
- Cubre al menos 5 áreas. Reparte: que ninguna área tenga más de 3 problemas.
- Los problemas son los del giro de verdad, dichos como los dice quien los vive. Una farmacia no
  "tiene fricción operativa": "se le vence el medicamento en el anaquel".
- Nada de promesas de resultados ("aumente 30 % sus ventas"). Describimos lo que pasa, no garantizamos cifras.

## Contrato de una demo

Un módulo por archivo en `src/demos/mod/<modulo>.js`. El ejemplo completo es `pedidos.js`.

```js
export default {
  id: 'agenda',
  nombre: 'Agenda',
  vistas: {
    reservar:   { titulo: 'Así aparta su cliente', dispositivo: 'telefono' },   // telefono | tableta | escritorio
    calendario: { titulo: 'La agenda del equipo',   dispositivo: 'tableta' },
  },
  montar(el, ctx) { … ; return { destruir() { … } } },
}
```

`ctx` trae: `vista`, `negocio` (nombre real del negocio), `nicho`, `v` (vocabulario resuelto: `v.cliente`, `v.personal`…),
`m` (datos de muestra resueltos: `m.productos`, `m.servicios`, `m.personal`, `m.clientes`, `m.insumos`),
`acento`, `reducido`, `avisar(texto)`.

- `el` es la pantalla del dispositivo (`.dk`), de tamaño lógico fijo: teléfono 360×740, tableta 1000×700,
  escritorio 1240×760. Se diseña en píxeles; el anfitrión escala.
- Se usa el kit: clases `dk-*` de `src/styles/demo.css` y las funciones de `src/demos/kit.js`
  (`toca`, `hoja`, `toast`, `relojes`, `cuenta`, `dinero`, `esc`, `hora`, `enMin`, `haceMin`, `tono`, `iniciales`, `porGrupo`).
  Si de verdad falta un estilo, va en un bloque `<style>` propio del módulo con clases con prefijo del módulo
  (`.ag-…`), nunca tocando `demo.css`.
- Tiene que **parecer un producto terminado y responder al tacto**: cada vista permite completar su recorrido
  (apartar la cita, cobrar la venta, marcar el pedido listo) y muestra el resultado. Nada de pantallas muertas.
- Usa el nombre del negocio y los datos del giro. Todo texto que venga de `ctx` pasa por `esc()`.
- Un poco de vida propia (un pedido que entra, un contador que avanza) con `relojes()`, y todo se limpia en `destruir()`.
- Sin red, sin imágenes externas, sin librerías nuevas. Sin emojis: los símbolos simples (✓ + − ×) están bien.
- Áreas con desplazamiento llevan el atributo `data-rueda` (así la rueda no cambia de escena en la presentación).
- Copia con la voz de arriba. La demo es del negocio, no de Soma: no menciona a Soma.

Para verla: `#/demo/<modulo>/<vista>?n=<nicho>&b=<negocio>`, y todas juntas en `#/demos`.

## Contrato de los iconos

Todos se construyen con las primitivas de `src/core/boil.js` (`P.circle`, `P.arc`, `P.line`, `P.curve`) y se
dibujan con el trazo que hierve. Una sola regla de estilo, la del logo: círculos, arcos, puntos y rectas;
un solo grosor; nada relleno.

- **Proceso** — `src/icons/proceso.js`, retícula de 24, margen de 3. `clave: [formas]`. Pequeños y sin movimiento.
- **Nicho** — `src/icons/nichos/<familia>.js`, retícula de 48, margen de 5. `export default { id: { partes: [...] } }`.
  Cada parte es `{ f: [formas], anim?, origen?: [x, y], retardo? }`. Las partes con `anim` se mueven cuando el
  icono está vivo (cursor encima o elegido): `flota`, `vapor`, `giro`, `vaiven`, `late`, `corta`, `parpadea`,
  `desliza`, `brinca`. Cada icono de nicho tiene al menos una parte con vida, y esa vida cuenta algo del giro
  (el vapor del café, la tijera que corta, la rueda que gira).

Se revisan en `#/iconos`.

## Datos

`src/data/store.js` — todo es síncrono y local; la nube va por detrás.

```js
store.lista('prospectos', { etapa: 'visitado' })   // o una función como filtro
store.uno('prospectos', id)
store.guardar('prospectos', { id?, …campos })       // crea o actualiza; devuelve la fila
store.borrar('prospectos', id)
store.alCambiar((tabla) => …)                        // devuelve la función para dejar de escuchar
store.ajuste('contacto') / store.ponAjuste('contacto', valor)
store.anotar(prospecto_id, tipo, texto, datos?, quien?)   // bitácora
store.sincronizar() / store.estado
```

Tablas y columnas: `src/data/esquema.js`. Fechas de día como `'AAAA-MM-DD'`; momentos como ISO.
Utilidades de fecha, dinero, teléfono y enlaces (WhatsApp, correo, calendario): `src/app/util.js`.
Diálogos, confirmaciones y avisos: `src/app/capas.js`.

## Trabajo en paralelo

- Cada quien toca solo los archivos que le tocan. Nadie edita `demo.css`, `app.css`, `soluciones.js`,
  `kit.js`, `host.js` ni archivos de otro frente.
- Nada de `git commit`, `git push` ni `npm install`.
- Servidor de desarrollo propio: `npx vite --port <puerto asignado> --strictPort`. Capturas con
  `node scripts/foto.cjs <puerto> '<ruta>' <salida.png> [ancho] [alto] [esperaMs] [clics]`.
- Antes de entregar: `node scripts/validar.mjs` sin errores en lo propio y capturas revisadas a ojo.
