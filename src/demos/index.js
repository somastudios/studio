// Registro de módulos de demo. Para agregar uno basta con crear su archivo en ./mod/.
const archivos = import.meta.glob('./mod/*.js', { eager: true })

export const MODS = Object.fromEntries(
  Object.values(archivos)
    .map((m) => m.default)
    .filter(Boolean)
    .map((m) => [m.id, m]),
)

export const hayDemo = (modulo, vista) => !!MODS[modulo]?.vistas?.[vista]
