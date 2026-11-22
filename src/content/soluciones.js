// Catálogo de soluciones.
// Los problemas son cientos; las soluciones, unas cuantas que se visten distinto en cada negocio.
// Cada solución apunta a una demo (módulo + vista) que se puede tocar frente al cliente.
//
// eje: desde dónde resuelve.
//   'cliente'    — el cliente del negocio lo hace por su cuenta
//   'equipo'     — el personal lo hace, con una mejor herramienta
//   'automatico' — sucede solo, por detrás
//   'ligera'     — el paso más corto y económico
//
// Los textos aceptan vocabulario del nicho entre llaves: {cliente}, {clientes}, {personal},
// {empleado}, {producto}, {productos}, {pedido}, {pedidos}, {cita}, {citas}, {lugar}.
// Con mayúscula inicial ({Clientes}) se escribe con mayúscula.
//
// pasos: tres momentos que la animación dibuja. `ico` es una clave de src/icons/proceso.js.

export const EJES = {
  cliente: { nombre: 'Su cliente lo hace solo', corto: 'Autoservicio' },
  equipo: { nombre: 'Su equipo, con mejor herramienta', corto: 'Equipo' },
  automatico: { nombre: 'Sucede solo, por detrás', corto: 'Automático' },
  ligera: { nombre: 'El paso más corto', corto: 'Ligera' },
}

const S = (id, nombre, eje, modulo, vista, resumen, pasos, alcance = 'essential') => ({
  id,
  nombre,
  eje,
  demo: { modulo, vista },
  resumen,
  pasos: pasos.map(([ico, t]) => ({ ico, t })),
  alcance,
})

export const SOLUCIONES = [
  // ── Pedidos y servicio ──
  S('pedidos-qr', 'Pedidos por QR', 'cliente', 'pedidos', 'cliente', '{Cliente} ordena desde su teléfono y el {pedido} llega directo a quien lo prepara.', [
    ['qr', 'Escanea el código'],
    ['telefono', 'Elige y confirma'],
    ['campana', 'Llega a preparación'],
  ]),
  S('pedidos-mostrador', 'Pedidos para recoger', 'cliente', 'pedidos', 'mostrador', '{Clientes} piden antes de llegar y pasan solo a recoger. Sin fila y sin llamadas.', [
    ['telefono', 'Pide desde donde esté'],
    ['reloj', 'Se prepara a tiempo'],
    ['bolsa', 'Pasa y recoge'],
  ]),
  S('comandero', 'Comandas en el celular', 'equipo', 'comandero', 'mesas', 'El trato personal se queda. {Personal} toma la orden en su celular y sale directo a preparación, sin vueltas ni letra ilegible.', [
    ['persona', 'Toma la orden'],
    ['telefono', 'La captura al momento'],
    ['campana', 'Sale a preparación'],
  ]),
  S('llamado-mesa', 'Llamado desde la mesa', 'cliente', 'comandero', 'solicitudes', '{Cliente} pide la cuenta o atención con un toque, y {personal} sabe exactamente a dónde ir.', [
    ['qr', 'Un toque desde la mesa'],
    ['campana', 'Aviso al personal'],
    ['check', 'Atendido y registrado'],
  ]),
  S('pantalla-cocina', 'Pantalla de preparación', 'equipo', 'cocina', 'cola', 'Cada {pedido} en una cola con su tiempo a la vista. Lo urgente sube solo y nada se pierde entre papeles.', [
    ['lista', 'Entra a la cola'],
    ['reloj', 'Corre su tiempo'],
    ['check', 'Listo, con un toque'],
  ]),
  S('aviso-listo', 'Aviso de pedido listo', 'automatico', 'cocina', 'avisos', 'Cuando algo está listo, quien debe entregarlo se entera al instante. Nadie se asoma a preguntar.', [
    ['check', 'Se marca listo'],
    ['mensaje', 'Aviso automático'],
    ['persona', 'Se entrega caliente'],
  ]),

  // ── Citas, reservas y filas ──
  S('agenda-en-linea', 'Agenda en línea', 'cliente', 'agenda', 'reservar', '{Clientes} apartan su {cita} a cualquier hora, sin llamar y sin esperar respuesta.', [
    ['telefono', 'Elige servicio y hora'],
    ['calendario', 'Queda apartado'],
    ['mensaje', 'Recibe confirmación'],
  ]),
  S('agenda-interna', 'Agenda compartida', 'equipo', 'agenda', 'calendario', 'Una sola agenda para todo el {personal}. Se ve quién está libre, qué sigue y qué se movió.', [
    ['calendario', 'Todo en una vista'],
    ['persona', 'Cada quien ve lo suyo'],
    ['check', 'Sin {citas} encimadas'],
  ]),
  S('recordatorios', 'Recordatorios automáticos', 'automatico', 'whatsapp', 'recordatorio', 'Un mensaje un día antes: confirmar o cancelar con un toque. Los plantones bajan y los huecos se alcanzan a llenar.', [
    ['calendario', 'Un día antes'],
    ['mensaje', 'Llega el recordatorio'],
    ['check', 'Confirma o libera el lugar'],
  ]),
  S('lista-espera', 'Lista de espera', 'automatico', 'agenda', 'espera', 'Cuando alguien cancela, el espacio se ofrece solo a quien estaba esperando.', [
    ['alerta', 'Se libera un espacio'],
    ['mensaje', 'Se ofrece a la lista'],
    ['check', 'El hueco se llena'],
  ]),
  S('anticipo-reserva', 'Reserva con anticipo', 'cliente', 'agenda', 'anticipo', 'Para apartar, {cliente} deja un anticipo. Quien paga, llega.', [
    ['calendario', 'Elige su horario'],
    ['tarjeta', 'Deja un anticipo'],
    ['check', 'Lugar asegurado'],
  ]),
  S('turnos-virtuales', 'Turnos virtuales', 'cliente', 'fila', 'turno', '{Cliente} toma su turno desde el teléfono y espera donde quiera. Ve cuántos faltan y cuándo le toca.', [
    ['qr', 'Toma su turno'],
    ['reloj', 'Ve cuánto falta'],
    ['campana', 'Aviso: le toca'],
  ]),
  S('pantalla-turnos', 'Pantalla de turnos', 'equipo', 'fila', 'pantalla', 'Una pantalla en el {lugar} ordena la espera. {Personal} llama al siguiente con un toque.', [
    ['ticket', 'Se reparte el turno'],
    ['pantalla', 'Todos ven el orden'],
    ['persona', 'Se llama al siguiente'],
  ]),

  // ── Inventario ──
  S('inventario-alertas', 'Inventario con alertas', 'automatico', 'inventario', 'existencias', 'Cada {producto} con su mínimo. Antes de que se acabe, llega el aviso.', [
    ['caja-carton', 'Existencias al día'],
    ['alerta', 'Baja del mínimo'],
    ['mensaje', 'Aviso a tiempo'],
  ]),
  S('inventario-escaner', 'Entradas y salidas con el celular', 'equipo', 'inventario', 'movimientos', 'Lo que entra y lo que sale se registra en segundos desde el celular. Lo anotado coincide con lo que hay.', [
    ['escaner', 'Se escanea'],
    ['telefono', 'Se registra el movimiento'],
    ['check', 'El conteo cuadra'],
  ]),
  S('compras-sugeridas', 'Lista de compra sugerida', 'automatico', 'inventario', 'compras', 'Según lo que se vende, el sistema arma la lista de compra. Se pide lo necesario, ni más ni menos.', [
    ['grafica', 'Se mide el consumo'],
    ['lista', 'Se arma la lista'],
    ['carrito', 'Se compra lo justo'],
  ]),
  S('caducidades', 'Control de caducidades', 'automatico', 'inventario', 'caducidades', 'Cada lote con su fecha. Lo que está por vencer aparece primero, a tiempo para moverlo.', [
    ['etiqueta', 'Se registra el lote'],
    ['calendario', 'Se vigila la fecha'],
    ['alerta', 'Aviso antes de vencer'],
  ]),
  S('merma', 'Registro de merma', 'equipo', 'inventario', 'merma', 'Lo que se pierde se anota con su motivo. A fin de mes se sabe cuánto fue y por qué.', [
    ['pluma', 'Se anota la pérdida'],
    ['etiqueta', 'Con su motivo'],
    ['grafica', 'Se ve el total'],
  ]),

  // ── Caja y cobro ──
  S('punto-de-venta', 'Punto de venta', 'equipo', 'caja', 'venta', 'Cobrar en tres toques, con ticket y con cada venta registrada. Desde una tableta o un celular.', [
    ['caja', 'Se arma la venta'],
    ['moneda', 'Se cobra'],
    ['ticket', 'Queda registrada'],
  ]),
  S('corte-de-caja', 'Corte de caja', 'automatico', 'caja', 'corte', 'Al cerrar, el sistema dice cuánto debe haber. Se cuenta, se compara y la diferencia queda a la vista.', [
    ['caja', 'Ventas del turno'],
    ['moneda', 'Se cuenta el efectivo'],
    ['check', 'Cuadra o se explica'],
  ]),
  S('fiado', 'Cuentas por cobrar', 'equipo', 'caja', 'fiado', 'Lo fiado y los apartados, cada uno con su saldo y sus abonos. Sin libreta y sin malentendidos.', [
    ['persona', 'Cuenta de cada {cliente}'],
    ['pluma', 'Abonos anotados'],
    ['mensaje', 'Recordatorio amable'],
  ]),
  S('cobro-en-linea', 'Cobro con enlace', 'cliente', 'caja', 'link', '{Cliente} paga desde su teléfono con un enlace o un código. Sirve para anticipos y para cobrar a distancia.', [
    ['mensaje', 'Se envía el enlace'],
    ['tarjeta', 'Paga desde su teléfono'],
    ['check', 'Pago confirmado'],
  ]),

  // ── Clientes y seguimiento ──
  S('seguimiento-prospectos', 'Seguimiento de interesados', 'equipo', 'seguimiento', 'embudo', 'Cada persona que preguntó queda anotada, con su siguiente paso y su fecha. Nadie se queda sin respuesta.', [
    ['mensaje', 'Alguien pregunta'],
    ['lista', 'Queda en seguimiento'],
    ['campana', 'Aviso para retomarlo'],
  ]),
  S('base-clientes', 'Base de clientes', 'equipo', 'seguimiento', 'clientes', 'Quién es cada {cliente}, qué ha comprado y cuándo vino por última vez. En un solo lugar.', [
    ['persona', 'Ficha de cada {cliente}'],
    ['lista', 'Su historial'],
    ['lupa', 'Se encuentra en segundos'],
  ]),
  S('reactivacion', 'Clientes que no han vuelto', 'automatico', 'lealtad', 'reactivar', 'El sistema detecta a quién hace tiempo no viene y prepara el mensaje para invitarlo de vuelta.', [
    ['reloj', 'Detecta la ausencia'],
    ['mensaje', 'Prepara la invitación'],
    ['persona', '{Cliente} regresa'],
  ]),
  S('tarjeta-lealtad', 'Tarjeta de lealtad digital', 'cliente', 'lealtad', 'tarjeta', 'Sellos en el teléfono, sin cartón que se pierde. Cada visita acerca a {cliente} a su recompensa.', [
    ['qr', 'Muestra su código'],
    ['estrella', 'Suma un sello'],
    ['regalo', 'Gana su recompensa'],
  ]),
  S('promos-segmentadas', 'Promociones dirigidas', 'equipo', 'lealtad', 'promos', 'La promoción le llega a quien sí le interesa: por lo que compra o por cuándo vino.', [
    ['filtro', 'Se elige a quién'],
    ['megafono', 'Se arma el mensaje'],
    ['mensaje', 'Llega a los indicados'],
  ]),

  // ── Mensajes ──
  S('respuesta-automatica', 'Respuestas al instante', 'automatico', 'whatsapp', 'auto', 'Horario, precios, ubicación: lo que siempre preguntan se contesta solo, a cualquier hora. Lo demás pasa a una persona.', [
    ['mensaje', 'Escriben a deshoras'],
    ['reloj', 'Respuesta inmediata'],
    ['persona', 'Lo demás, a una persona'],
  ]),
  S('whatsapp-pedidos', 'Pedidos por WhatsApp', 'cliente', 'whatsapp', 'pedido', '{Cliente} pide por WhatsApp con una guía paso a paso. El {pedido} llega completo y sin ida y vuelta.', [
    ['mensaje', 'Escribe por WhatsApp'],
    ['lista', 'Elige de la guía'],
    ['check', '{Pedido} completo'],
  ]),
  S('respuestas-rapidas', 'Respuestas listas', 'ligera', 'whatsapp', 'plantillas', 'Las respuestas de siempre, ya escritas. {Personal} contesta bien y rápido con un toque.', [
    ['pluma', 'Se escriben una vez'],
    ['telefono', 'Un toque para enviar'],
    ['check', 'Misma calidad siempre'],
  ]),
  S('reporte-diario', 'Resumen del día por WhatsApp', 'ligera', 'whatsapp', 'reporte', 'Cada noche, un mensaje con lo que pasó en el negocio: ventas, pendientes y lo que requiere atención.', [
    ['luna', 'Al cerrar el día'],
    ['grafica', 'Se resume lo importante'],
    ['mensaje', 'Llega a su teléfono'],
  ]),

  // ── Catálogo y venta en línea ──
  S('tienda-en-linea', 'Tienda en línea', 'cliente', 'catalogo', 'tienda', 'Su catálogo abierto las 24 horas, con carrito y pago. {Clientes} compran sin depender del horario.', [
    ['pantalla', 'Ve el catálogo'],
    ['carrito', 'Arma su compra'],
    ['tarjeta', 'Paga en línea'],
  ], 'advanced'),
  S('catalogo-whatsapp', 'Catálogo con pedido por WhatsApp', 'ligera', 'catalogo', 'whatsapp', 'Un catálogo que se comparte con un enlace. {Cliente} elige y el {pedido} llega armado a su WhatsApp.', [
    ['telefono', 'Abre el catálogo'],
    ['carrito', 'Elige lo que quiere'],
    ['mensaje', 'Llega a WhatsApp'],
  ]),
  S('menu-digital', 'Menú digital', 'ligera', 'catalogo', 'menu', 'Precios y {productos} siempre al día. Se cambia en un minuto y no hay que reimprimir.', [
    ['qr', 'Escanea el código'],
    ['telefono', 'Ve todo actualizado'],
    ['pluma', 'Usted cambia en un minuto'],
  ]),

  // ── Presencia ──
  S('perfil-google', 'Ficha de Google completa', 'ligera', 'presencia', 'google', 'Cuando alguien lo busca, encuentra horario, fotos, teléfono y cómo llegar. Es el primer paso para que lleguen.', [
    ['lupa', 'Lo buscan en Google'],
    ['pin', 'Aparece completo'],
    ['persona', 'Llegan o llaman'],
  ]),
  S('sitio-web', 'Sitio que convierte', 'cliente', 'presencia', 'sitio', 'Una página clara: qué ofrece, cuánto cuesta y cómo pedirlo. Quien entra sabe qué hacer.', [
    ['lupa', 'Lo encuentran'],
    ['pantalla', 'Entienden la oferta'],
    ['mensaje', 'Contactan o compran'],
  ]),
  S('resenas', 'Reseñas después de la visita', 'automatico', 'presencia', 'resenas', 'Después de atenderlo, {cliente} recibe una invitación a opinar. Las buenas experiencias se vuelven visibles.', [
    ['check', 'Termina la visita'],
    ['mensaje', 'Invitación a opinar'],
    ['estrella', 'Sube la calificación'],
  ]),

  // ── Números ──
  S('tablero-ventas', 'Tablero del día', 'automatico', 'tablero', 'hoy', 'Cuánto se vendió hoy, a qué hora y qué fue lo más pedido. En su teléfono, sin esperar al corte.', [
    ['caja', 'Cada venta cuenta'],
    ['grafica', 'Se suma en vivo'],
    ['telefono', 'Lo ve donde esté'],
  ]),
  S('multisucursal', 'Todas las sucursales en una vista', 'automatico', 'tablero', 'sucursales', 'Cada sucursal con sus números, lado a lado. Se ve cuál va bien y cuál necesita atención.', [
    ['tienda', 'Cada sucursal reporta'],
    ['grafica', 'Se comparan'],
    ['lupa', 'Se detecta lo raro'],
  ], 'enterprise'),
  S('costeo', 'Costo real y margen', 'equipo', 'costos', 'producto', 'Cuánto cuesta de verdad cada {producto} y cuánto deja. Con eso se decide qué empujar y qué precio ajustar.', [
    ['lista', 'Se arma el costo'],
    ['balanza', 'Se compara con el precio'],
    ['grafica', 'Se ve el margen'],
  ]),

  // ── Organización del equipo ──
  S('checklist-turnos', 'Listas de apertura y cierre', 'ligera', 'tareas', 'checklist', 'Lo que hay que hacer al abrir y al cerrar, en una lista que se palomea. Se sabe quién la hizo y a qué hora.', [
    ['lista', 'Lista del turno'],
    ['check', 'Se palomea'],
    ['reloj', 'Queda la hora y quién'],
  ]),
  S('bitacora-turno', 'Bitácora entre turnos', 'equipo', 'tareas', 'bitacora', 'Los pendientes pasan de un turno al siguiente por escrito. Nada depende de que alguien se acuerde.', [
    ['pluma', 'Se anota el pendiente'],
    ['ciclo', 'Cambia el turno'],
    ['check', 'El siguiente lo retoma'],
  ]),
  S('roles-horarios', 'Horarios y asistencia', 'equipo', 'tareas', 'horarios', 'Quién trabaja qué día, publicado para todos. La entrada y la salida se registran desde el celular.', [
    ['calendario', 'Se arma la semana'],
    ['telefono', 'Cada quien lo ve'],
    ['check', 'Asistencia registrada'],
  ]),
  S('proceso-claro', 'Ordenar el proceso primero', 'ligera', 'tareas', 'proceso', 'A veces no hace falta un sistema: hace falta acordar quién hace qué y en qué orden. Lo dibujamos con usted.', [
    ['lupa', 'Se observa cómo trabajan'],
    ['pluma', 'Se dibuja el proceso'],
    ['check', 'Todos siguen el mismo'],
  ]),

  // ── Entregas ──
  S('seguimiento-pedidos', 'Tablero de pedidos', 'equipo', 'entregas', 'tablero', 'Cada {pedido} con su etapa a la vista: recibido, en preparación, en camino, entregado.', [
    ['lista', 'Entra el {pedido}'],
    ['ciclo', 'Avanza de etapa'],
    ['check', 'Entregado'],
  ]),
  S('rastreo-cliente', 'Rastreo para el cliente', 'cliente', 'entregas', 'rastreo', '{Cliente} ve en qué va su {pedido} sin tener que llamar a preguntar.', [
    ['mensaje', 'Recibe su enlace'],
    ['moto', 'Ve el avance'],
    ['check', 'Sabe cuándo llega'],
  ]),

  // ── Cotizaciones y órdenes ──
  S('cotizador', 'Cotizador', 'equipo', 'cotizador', 'cotizar', 'Una cotización clara en un minuto, enviada por WhatsApp. Con sus precios y sin errores de cuenta.', [
    ['lista', 'Se eligen conceptos'],
    ['documento', 'Se arma la cotización'],
    ['mensaje', 'Se envía al momento'],
  ]),
  S('ordenes-trabajo', 'Órdenes de servicio', 'equipo', 'ordenes', 'orden', 'Cada trabajo con su orden: qué se recibió, en qué va y cuándo se entrega. {Cliente} recibe aviso cuando está listo.', [
    ['documento', 'Se recibe con orden'],
    ['ciclo', 'Avanza de estado'],
    ['mensaje', 'Aviso: está listo'],
  ]),

  // ── Expedientes ──
  S('expediente-cliente', 'Expediente digital', 'equipo', 'expediente', 'ficha', 'Todo el historial en una ficha: visitas, notas y lo que sigue. Se consulta en segundos.', [
    ['documento', 'Ficha con historial'],
    ['pluma', 'Notas de cada visita'],
    ['calendario', 'Próxima {cita} a la vista'],
  ]),
  S('formatos-digitales', 'Formatos con firma digital', 'cliente', 'expediente', 'formatos', 'Los formatos se llenan y se firman en una pantalla. Quedan guardados y se encuentran cuando hacen falta.', [
    ['tableta', 'Se llena en pantalla'],
    ['firma', 'Se firma'],
    ['candado', 'Queda resguardado'],
  ]),

  // ── Mensualidades ──
  S('control-mensualidades', 'Control de mensualidades', 'equipo', 'mensualidades', 'control', 'Quién pagó, quién debe y a quién se le vence esta semana. Con el recordatorio listo para enviar.', [
    ['lista', 'Todos los pagos'],
    ['alerta', 'Quién está por vencer'],
    ['mensaje', 'Recordatorio en un toque'],
  ]),
  S('acceso-vigencia', 'Acceso según vigencia', 'automatico', 'mensualidades', 'acceso', 'Al llegar, el sistema dice si la mensualidad está vigente. Nadie tiene que revisar una libreta.', [
    ['qr', 'Muestra su código'],
    ['lupa', 'Se revisa la vigencia'],
    ['check', 'Pasa, o se le avisa'],
  ]),
]

export const SOL = Object.fromEntries(SOLUCIONES.map((s) => [s.id, s]))

/** Módulos de demo y sus vistas, tal como los usa el catálogo. */
export const MODULOS = SOLUCIONES.reduce((m, s) => {
  ;(m[s.demo.modulo] ||= new Set()).add(s.demo.vista)
  return m
}, {})
