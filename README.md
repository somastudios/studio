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
| CRM | `#/crm` | Prospectos, agenda, cobranza (Membresía Soma), sistemas entregados y ajustes. |
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
3. **Conectar Stripe (opcional).** Para crear enlaces de pago con tarjeta, en Supabase → Edge Functions → Secrets:
   - `STRIPE_SECRET_KEY`: la llave secreta de Stripe.
   - `STRIPE_WEBHOOK_SECRET`: el secreto de firma del webhook `…/functions/v1/stripe-webhook` (ya está creado en modo de prueba; se ve en Stripe → Developers → Webhooks).
   Sin esto, el CRM sigue registrando pagos por transferencia y en efectivo.
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
```

Las tres últimas necesitan el servidor de desarrollo corriendo en ese puerto.

## Cómo probar todo

Sin cuenta se puede recorrer todo: en la pantalla de entrada, «Usar solo en este dispositivo» (o «Probar sin cuenta» si el navegador no deja guardar datos; en ese caso lo que registres se borra al cerrar).

1. **Presala.** En el CRM, «Nueva visita». Escribe un negocio, elige el giro y quién va. Al elegir giro aparece la frase para abrir y qué observar.
2. **Primera visita.** «Empezar presentación». Se avanza con las flechas ← →.
   - *Antes de empezar*: los tres compromisos (↓ o → para pasar de uno a otro).
   - *Lo que suele pasar*: aquí están los problemas del giro. Toca los que «sí pasan»; «Ver otras» muestra los menos frecuentes y abajo se puede escribir uno propio.
   - *Diagnóstico*: de lo general a lo concreto. Por cada problema marcado: una o dos preguntas de sí o no (cambian el orden de las rutas y tachan la que no encaja), cuatro rutas arriba (↑ ↓ o tocándolas), «Ver demostración» y «Le interesa / No le convence». Si las cuatro se rechazan aparece «A la medida». → pasa al siguiente problema.
   - *Antes de cerrar*, *Alcance*, *Lo que entendimos* (el expediente), *Siguiente paso* (calendario) y *Gracias*.
   - «Terminar» lleva al cierre interno: ánimo, en qué quedó y notas.
3. **CRM.** El expediente queda en Prospectos. En la pestaña *Propuesta* se capturan la demo y los precios.
4. **Segunda visita.** Desde *Propuesta*, «Presentar». Al final el cliente decide y, de vuelta en el expediente, «Activar» crea su membresía.
5. **Cobranza.** «Registrar pago» y «Avisar» sobre esa membresía. Para ver cómo se ve una vencida, edítala y ponle una fecha de vencimiento pasada.
6. **Sistemas.** «Nuevo sistema», luego «Conectar» (la línea para pegar) y «Accesos» (necesita sesión iniciada).

Durante una presentación: `M` abre el índice, `F` pantalla completa, `D` abre la demo de la ruta en la que estás, `Escape` dos veces sale.

## Pendientes

`node scripts/validar.mjs` lista el contenido que falta. Lo demás está aquí.

**Contenido**
- [ ] Giros que faltan: panadería, taller mecánico, lavandería, autolavado, despacho e inmobiliaria. No urgen: mientras tanto, «Otro giro» los cubre con problemas generales.
- [ ] Demos que faltan: 28 pantallas de 51 (módulos cocina, fila, caja, seguimiento, lealtad, presencia, costos, tareas, entregas, cotizador, órdenes, expediente y mensualidades). Las rutas sin demo se presentan igual, sin el botón «Ver demostración».
- [ ] Revisar el copywriting de todo: los textos de las visitas (`src/content/visita.js`), el catálogo de soluciones, los 22 giros y los textos del CRM. Se escribieron de una pasada y nadie los ha leído con calma.

**Pulido**
- [ ] Animaciones y vida en el CRM: hoy es funcional y sobrio, sin transiciones entre pantallas, sin el punto azul ni trazos boil.
- [ ] Animaciones de las visitas: revisar ritmo y transiciones escena por escena.
- [ ] Vista en celular y en vertical de las escenas nuevas: está resuelta de forma básica y no se ha probado.

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
