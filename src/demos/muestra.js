// Datos de muestra para las demos. Cada nicho trae los suyos en `muestra`;
// lo que falte se completa con estos valores genéricos, para que ninguna demo se quede vacía.

const BASE = {
  productos: [
    { nombre: 'Producto estrella', precio: 180, categoria: 'Más vendidos' },
    { nombre: 'Producto de línea', precio: 120, categoria: 'Más vendidos' },
    { nombre: 'Paquete familiar', precio: 340, categoria: 'Paquetes' },
    { nombre: 'Paquete individual', precio: 150, categoria: 'Paquetes' },
    { nombre: 'Artículo de temporada', precio: 95, categoria: 'Temporada' },
    { nombre: 'Novedad del mes', precio: 210, categoria: 'Temporada' },
    { nombre: 'Accesorio', precio: 60, categoria: 'Extras' },
    { nombre: 'Complemento', precio: 45, categoria: 'Extras' },
  ],
  servicios: [
    { nombre: 'Servicio básico', precio: 150, minutos: 30 },
    { nombre: 'Servicio completo', precio: 280, minutos: 60 },
    { nombre: 'Servicio especial', precio: 420, minutos: 90 },
    { nombre: 'Revisión', precio: 0, minutos: 20 },
  ],
  personal: ['Lupita', 'Chuy', 'Mariana', 'Toño'],
  clientes: ['Sra. Elizondo', 'Ing. Barragán', 'Paola Méndez', 'Don Rafael', 'Lic. Sandoval', 'Karla Ibarra'],
  insumos: [
    { nombre: 'Material principal', unidad: 'pzas', hay: 12, minimo: 20 },
    { nombre: 'Material secundario', unidad: 'pzas', hay: 48, minimo: 30 },
    { nombre: 'Empaque', unidad: 'pzas', hay: 9, minimo: 25 },
    { nombre: 'Consumible', unidad: 'cajas', hay: 14, minimo: 8 },
    { nombre: 'Repuesto', unidad: 'pzas', hay: 6, minimo: 6 },
    { nombre: 'Etiquetas', unidad: 'rollos', hay: 3, minimo: 4 },
  ],
}

/**
 * Datos listos para usar en una demo.
 *   productos: [{ nombre, precio, categoria }]      lo que se vende
 *   servicios: [{ nombre, precio, minutos }]        lo que se agenda
 *   personal:  ['Lupita', …]                        quienes atienden (4)
 *   clientes:  ['Sra. Elizondo', …]                 nombres de clientes (6)
 *   insumos:   [{ nombre, unidad, hay, minimo }]    lo que se inventaría
 */
export function muestra(nicho) {
  const m = nicho?.muestra || {}
  const usa = (k) => (Array.isArray(m[k]) && m[k].length ? m[k] : BASE[k])
  return {
    productos: usa('productos'),
    servicios: usa('servicios'),
    personal: usa('personal'),
    clientes: usa('clientes'),
    insumos: m.insumos?.length
      ? m.insumos
      : m.productos?.length
        ? m.productos.slice(0, 8).map((p, i) => ({ nombre: p.nombre, unidad: 'pzas', hay: [4, 18, 7, 30, 2, 12, 9, 22][i % 8], minimo: [8, 10, 6, 12, 5, 10, 8, 10][i % 8] }))
        : BASE.insumos,
  }
}
