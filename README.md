# studio

La presentación general con la cuál vamos a todos los negocios. Att. Alex

Ahora es también la herramienta completa de visita y el CRM de Soma: se prepara la visita, se presenta, se diagnostica junto con el cliente y todo queda en su expediente.

## Qué hay

| Parte | Dónde | Para qué |
|---|---|---|
| Presentación general | `#/general` | Las diez escenas originales. No pide cuenta. |
| Presala | `#/presala` | Antes de entrar: negocio, giro, quién va y si se graba. |
| Primera visita | `#/visita/:id` | Acuerdo, lo que suele pasar, diagnóstico con cuatro rutas y demo, alcance, expediente y fecha. |
| Segunda visita | `#/visita2/:id` | Recapitulación, su sistema, precios y decisión. |
| CRM | `#/crm` | Prospectos, agenda, cobranza (Membresía Soma), sistemas entregados y ajustes. En cada expediente, la pestaña «Construir» arma el prompt para Claude. |
| Demos | `#/demos` | Todas las demostraciones, vestidas con el giro que elijas. |

## Para correrlo

```
npm install
npm run dev        # http://localhost:5173
npm run build      # genera dist/ (un solo index.html más soma-connect.js)
```

Funciona sin cuenta («Usar solo en este dispositivo») y sin internet: todo se guarda primero en el navegador. Con cuenta, se sincroniza con Supabase y lo ven todos los dispositivos del equipo.

## Primeros pasos

1. **Crear las cuentas.** En `#/entrar`, «Crear una cuenta», con el código de equipo. La primera cuenta queda como administradora y puede cambiar el código en Ajustes.
2. **Llenar Ajustes.** Contacto de Soma, la línea de cada quien, la cuenta para transferencias y los mensajes de cobro.
3. **Conectar Stripe (opcional).** En el CRM, **Ajustes → Pagos con tarjeta**: se pega la llave secreta de Stripe y se toca «Conectar Stripe». Ahí mismo está el tutorial paso a paso. La llave se comprueba contra Stripe en ese momento, se guarda cifrada en el servidor y los avisos de pago (webhook) se activan solos. Necesita sesión iniciada. Sin Stripe, el CRM sigue registrando pagos por transferencia y en efectivo.
4. **Publicarlo.** Subir `dist/` a un hosting y poner esa dirección en Ajustes → Publicación.

## Cómo se organiza

Todo está explicado en [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md): el mapa del código, la voz de los textos y los contratos para agregar un giro, una demo o un icono.

- Los textos viven en `src/content/`. Un giro es un archivo en `src/content/nichos/`.
- Una demo es un archivo en `src/demos/mod/`.
- La base de datos y las funciones del servidor están copiadas en `supabase/`.

## Comprobaciones

```
node scripts/validar.mjs               # contenido: giros, rutas, iconos y demos
node scripts/humo.cjs <puerto>         # abre todas las demos y arranca una visita en cada giro
node scripts/recorrido.cjs <puerto> <carpeta>   # recorre una primera visita completa con capturas
node scripts/visita2.cjs <puerto> <carpeta>     # recorre la segunda visita
node scripts/crm.cjs <puerto> <carpeta>         # captura cada pantalla del CRM con datos de ejemplo
node scripts/acuerdo.cjs <puerto> <carpeta>     # «Antes de empezar»: cada compromiso y el dibujo cuadro por cuadro
node scripts/portada.cjs <puerto> <carpeta> [negocio]   # la portada en sus dos tiempos y el cambio entre ellos
```

Las tres últimas necesitan el servidor de desarrollo corriendo en ese puerto.

## Cómo probar todo

Sin cuenta se puede recorrer todo: en la pantalla de entrada, «Usar solo en este dispositivo» (o «Probar sin cuenta» si el navegador no deja guardar datos; en ese caso lo que registres se borra al cerrar).

1. **Presala.** En el CRM, «Nueva visita». Escribe un negocio, elige el giro y quién va. Al elegir giro aparece la frase para abrir y qué observar.
2. **Primera visita.** «Empezar presentación». Se avanza solo con las flechas ← →, no hace falta el ratón.
   - *Portada*: llega con la marca de Soma; con → se transforma en el nombre del negocio, enorme, con el icono de su giro dentro del aro.
   - *Antes de empezar*: los tres compromisos, uno a la vez (↓ o → para pasar de uno a otro). El dibujo de la derecha se transforma con cada uno.
   - *Lo que suele pasar*: aquí están los problemas del giro. Toca los que «sí pasan»; «Ver otras» muestra los menos frecuentes y abajo se puede escribir uno propio.
   - *Diagnóstico*: de lo general a lo concreto. Por cada problema marcado: una o dos preguntas de sí o no (cambian el orden de las rutas y tachan la que no encaja), cuatro rutas arriba (↑ ↓ o tocándolas), «Ver demostración» y «Le interesa / No le convence». Si las cuatro se rechazan aparece «A la medida». → pasa al siguiente problema.
   - *Antes de cerrar*, *Alcance*, *Lo que entendimos* (el expediente), *Siguiente paso* (calendario) y *Gracias*. En *Siguiente paso* se pregunta quién decide: si es alguien más, la fecha se aparta con esa persona y queda anotado en el expediente.
   - «Terminar» lleva al cierre interno: ánimo, en qué quedó y notas.
3. **CRM.** El expediente queda en Prospectos. En la pestaña *Propuesta* se capturan la demo y los precios. En *Construir* está el prompt para Claude, armado con lo que dijo el cliente; arriba avisa qué falta antes de construir.
4. **Segunda visita.** Desde *Propuesta*, «Presentar». Al final el cliente decide y, de vuelta en el expediente, «Activar» crea su membresía.
5. **Cobranza.** «Registrar pago» y «Avisar» sobre esa membresía. Para ver cómo se ve una vencida, edítala y ponle una fecha de vencimiento pasada.
6. **Sistemas.** «Nuevo sistema», luego «Conectar» (la línea para pegar) y «Accesos» (necesita sesión iniciada).

Durante una presentación: `M` abre el índice, `F` pantalla completa, `D` abre la demo de la ruta en la que estás, `Escape` dos veces sale.

## Pendientes

`node scripts/validar.mjs` lista el contenido que falta. Lo demás está aquí.

**Contenido**
- [ ] Giros que faltan: panadería, taller mecánico, lavandería, autolavado, despacho e inmobiliaria. No urgen: mientras tanto, «Otro giro» los cubre con problemas generales.
- [ ] Demos que faltan: 28 pantallas de 51 (módulos cocina, fila, caja, seguimiento, lealtad, presencia, costos, tareas, entregas, cotizador, órdenes, expediente y mensualidades). Las rutas sin demo se presentan igual, sin el botón «Ver demostración».
- [x] Copywriting de las dos visitas (`src/content/visita.js`), el CRM, la presala y la entrada: ya están en la voz nueva (ver «Voz» en `docs/ARQUITECTURA.md`).
- [x] Copywriting del CRM, la presala, las dos visitas y la presentación general: revisado con la skill `soma-copywriting`.
- [ ] Copywriting que falta revisar con la skill: el catálogo de soluciones (`src/content/soluciones.js`), los 22 giros (`src/content/nichos/`) y los textos dentro de las demos. Ahí está el conocimiento de cada giro: se lee con calma antes de reescribir.
- [ ] Espacios en construcción de la presentación (`src/visita1/espacios.js`): «Trabajo real», «Quien ya lo usa» y «Después del sí». Están apagados (`ESPACIOS_EN_OBRA = false` en `src/config.js`) para que no salgan frente a un cliente. Cuando haya fotos, video y casos reales se llenan y se vuelven a prender.

**Pulido**
- [x] CRM, primera pasada: navegación con iconos boil vivos y el punto azul como cursor, emblemas con datos reales que se dibujan al entrar a cada sección, pestañas con subrayado que se desliza, cifras que cuentan y vista de celular con barra inferior.
- [x] CRM, animaciones: la cortina del punto entre secciones, una viñeta SVG de tres planos por sección y las cuatro películas de pixel art en «Hoy». El diseño de «Hoy» ya está en todo el CRM.
- [ ] CRM, lo que falta: estados vacíos ilustrados, animación al guardar o registrar un pago, viñeta propia para el expediente, y llevar el mismo diseño a los diálogos, la presala y la pantalla de entrada.
- [x] «Antes de empezar» en grande: se ve un compromiso a la vez, el texto entra por palabras y un dibujo de trazo vivo, de media pantalla, se transforma de uno a otro: etiqueta, reloj, globo (`src/visita1/trazos.js`). Es el modelo para las demás escenas.
- [x] Trazo vivo en las dos visitas (`src/visita1/trazos-escenas.js`): la lupa que encuentra la gotera en «Primero el problema», la maraña del dueño en «Lo que suele pasar» que se vuelve renglones en «Lo que entendimos», Alex anotando en «Antes de cerrar», una figura por paso en «Cómo trabajamos», el local que crece en «Alcance», el calendario en «Siguiente paso», y en la segunda visita la etiqueta, los iconos de pago y el dueño que decide. Cada una se fotografía con `node scripts/escena.cjs <puerto> <carpeta> <escena>`.
- [x] Cortos de portada para las seis familias de giro (`src/visita1/cortos-giro.js`, `node scripts/cortos.cjs <puerto> <salida.png>`). El remate es el mismo en todas (toca la tableta y presume); falta darle uno propio a cada familia.
- [ ] Animaciones de las visitas: el ritmo en vivo falta verlo con Alex, escena por escena. Sus veredictos se anotan en la skill `soma-animation`, sección «Lo que ya se probó».
- [x] Vista en celular y en vertical de las escenas de la primera visita: revisada con `node scripts/recorrido.cjs <puerto> <carpeta> restaurante 390 800`. Falta la misma pasada en la segunda visita.

**Por probar con cuenta real** (no se pudo desde el entorno donde se construyó)
- [ ] Crear cuenta con el código de equipo e iniciar sesión.
- [ ] Sincronización entre dos dispositivos.
- [ ] Guardar y ver una contraseña en «Accesos».
- [ ] Grabación de audio de una visita y su reproducción en el expediente.
- [ ] Enlace de pago con tarjeta (requiere conectar Stripe, ver «Primeros pasos»).
- [ ] Soma Connect en un sistema real: señal de vida, aviso de vencimiento y pausa.

**Antes de usarlo con clientes**
- [ ] Llenar Ajustes (contacto, cuenta bancaria, mensajes).
- [ ] Definir precios y política de la Membresía Soma.
- [ ] Publicarlo en un hosting propio.
