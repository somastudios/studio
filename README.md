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

## Lo que falta

`node scripts/validar.mjs` lista lo pendiente. Al momento de escribir esto:

- **Giros:** hay 22. Faltan panadería, taller mecánico, lavandería, autolavado, despacho e inmobiliaria.
- **Demos:** hay 23 pantallas de 51. Las rutas cuya demo aún no existe se presentan igual, con su dibujo y su explicación, solo que sin el botón «Ver demostración».
