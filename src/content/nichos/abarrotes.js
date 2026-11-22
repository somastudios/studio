// Tienda de barrio o minisúper: mucho producto, fiado, proveedores de ruta y una cadena cerca.

export default {
  id: 'abarrotes',
  familia: 'tiendas',
  nombre: 'Abarrotes o minisúper',
  plural: 'tiendas de abarrotes',
  icono: 'abarrotes',
  acento: '#8a4f14',
  vocab: {
    personal: 'el tendero',
    cita: 'entrega',
    citas: 'entregas',
  },

  // Para quien presenta, antes de entrar.
  apertura: 'Se ve que la tienda ya tiene sus años en la colonia. ¿Cómo le ha cambiado la venta desde que llegaron las tiendas de cadena?',
  observa: [
    'Si se cobra con calculadora o de memoria, y si quien atiende tiene que preguntar los precios.',
    'Si hay una libreta de fiado junto a la caja y qué tan gastada está.',
    'Las fechas de lo que está al frente del refrigerador y si los anaqueles tienen precio a la vista.',
  ],

  // Datos de muestra para vestir las demos. Son ilustrativos.
  muestra: {
    productos: [
      { nombre: 'Frijol negro 1 kg', precio: 38, categoria: 'Abarrotes' },
      { nombre: 'Arroz 1 kg', precio: 29, categoria: 'Abarrotes' },
      { nombre: 'Aceite vegetal 1 L', precio: 48, categoria: 'Abarrotes' },
      { nombre: 'Atún en agua, lata', precio: 23, categoria: 'Abarrotes' },
      { nombre: 'Refresco de cola 600 ml', precio: 20, categoria: 'Bebidas' },
      { nombre: 'Refresco de cola 2.5 L', precio: 44, categoria: 'Bebidas' },
      { nombre: 'Agua natural 1.5 L', precio: 16, categoria: 'Bebidas' },
      { nombre: 'Leche entera 1 L', precio: 29, categoria: 'Refrigerados' },
      { nombre: 'Huevo blanco 1 kg', precio: 46, categoria: 'Refrigerados' },
      { nombre: 'Queso fresco 400 g', precio: 68, categoria: 'Refrigerados' },
      { nombre: 'Jamón de pavo 250 g', precio: 54, categoria: 'Refrigerados' },
      { nombre: 'Pan de caja grande', precio: 52, categoria: 'Pan y botanas' },
      { nombre: 'Papas fritas 45 g', precio: 19, categoria: 'Pan y botanas' },
      { nombre: 'Galletas marías, paquete', precio: 18, categoria: 'Pan y botanas' },
    ],
    servicios: [
      { nombre: 'Entrega a domicilio en la colonia', precio: 15, minutos: 20 },
      { nombre: 'Pedido para pasar a recoger', precio: 0, minutos: 15 },
      { nombre: 'Despensa de la quincena por encargo', precio: 650, minutos: 30 },
      { nombre: 'Entrega de garrafón de agua', precio: 45, minutos: 15 },
      { nombre: 'Surtido para fonda o taquería', precio: 0, minutos: 40 },
    ],
    personal: ['Maricela', 'Beto', 'Yolanda', 'Kevin'],
    clientes: ['Doña Chela', 'Don Nacho', 'Sra. Villalvazo', 'Brenda Ruelas', 'Fonda La Güera', 'Profe Armando'],
    insumos: [
      { nombre: 'Refresco de cola 600 ml', unidad: 'pzas', hay: 18, minimo: 24 },
      { nombre: 'Huevo blanco', unidad: 'kg', hay: 14, minimo: 10 },
      { nombre: 'Leche entera 1 L', unidad: 'pzas', hay: 9, minimo: 12 },
      { nombre: 'Pan de caja grande', unidad: 'pzas', hay: 7, minimo: 5 },
      { nombre: 'Aceite vegetal 1 L', unidad: 'pzas', hay: 14, minimo: 8 },
      { nombre: 'Frijol negro 1 kg', unidad: 'pzas', hay: 22, minimo: 10 },
      { nombre: 'Papel higiénico, 4 rollos', unidad: 'paq', hay: 11, minimo: 6 },
      { nombre: 'Garrafón de agua 20 L', unidad: 'pzas', hay: 4, minimo: 6 },
    ],
  },

  problemas: [
    // ── Clientes ──
    {
      id: 'cadena-a-la-vuelta',
      area: 'clientes',
      titulo: 'Me pusieron una tienda de cadena a la vuelta',
      senal: 'El vecino pasa de largo: allá hay promociones, pago con tarjeta y abren hasta tarde.',
      frecuente: true,
      matices: [
        { id: 'domicilio', pregunta: '¿Tiene quién lleve pedidos a las casas de la colonia?', si: 'Puede entregar en la colonia', no: 'Solo vende en mostrador' },
        { id: 'tarjeta', pregunta: '¿Ya acepta pago con tarjeta o transferencia?', si: 'Ya acepta tarjeta', no: 'Solo efectivo' },
      ],
      rutas: [
        { sol: 'whatsapp-pedidos', para: 'La cadena no lleva el mandado a la puerta. Su vecino pide por WhatsApp y usted se lo manda en unos minutos.', pide: { domicilio: true } },
        { sol: 'tarjeta-lealtad', para: 'Un sello por cada compra de cien pesos; al décimo, un refresco de dos litros. Un motivo para caminar una cuadra más.' },
        { sol: 'cobro-en-linea', para: 'Quien no trae efectivo paga con un código desde su celular. Esa venta ya no se va a la tienda de enfrente.', pide: { tarjeta: false } },
        { sol: 'perfil-google', para: 'Que al buscar "abarrotes cerca" aparezca su tienda con su horario real y su teléfono. Quien llega a vivir a la colonia la encuentra.' },
      ],
    },

    // ── Atención ──
    {
      id: 'fila-hora-pico',
      area: 'atencion',
      titulo: 'A la hora buena se me junta la gente y se desesperan',
      senal: 'A la salida de la escuela hay fila. Se cobra con calculadora y algunos dejan las cosas y se van.',
      matices: [
        { id: 'codigos', pregunta: '¿La mayoría de lo que vende trae código de barras?', si: 'Casi todo trae código', no: 'Mucho se vende a granel' },
        { id: 'solo', pregunta: '¿En esas horas atiende una sola persona?', si: 'Atiende una sola persona', no: 'Atienden dos o más' },
      ],
      rutas: [
        { sol: 'punto-de-venta', para: 'Se escanea y la cuenta se suma sola. Nadie busca el precio ni hace la suma dos veces mientras la fila crece.', pide: { codigos: true } },
        { sol: 'pedidos-mostrador', para: 'El vecino manda su lista antes de salir de casa y pasa por la bolsa ya armada. Menos gente esperando frente al mostrador.' },
        { sol: 'roles-horarios', para: 'Si la fila es de dos a cuatro, a esa hora entra la segunda persona. El horario se arma según cuándo se llena la tienda.', pide: { solo: true } },
        { sol: 'cobro-en-linea', para: 'Un código en el mostrador para pagar con el celular. Quien paga así no espera cambio ni lo deja a usted sin morralla.' },
      ],
    },

    // ── Organización ──
    {
      id: 'no-puedo-salir',
      area: 'organizacion',
      titulo: 'No puedo despegarme de la tienda ni un día',
      senal: 'Si el dueño sale, no sabe cuánto se vendió, quién cobró ni si se abrió a la hora.',
      matices: [{ id: 'empleado', pregunta: '¿Quien se queda en su lugar es un empleado y no un familiar?', si: 'Se queda un empleado', no: 'Se queda la familia' }],
      rutas: [
        { sol: 'tablero-ventas', para: 'Desde donde esté, ve en su teléfono cuánto va vendido en la tarde y a qué hora fue la última venta.' },
        { sol: 'corte-de-caja', para: 'Quien se queda entrega su corte: lo vendido contra lo que hay en el cajón. Usted lo revisa al volver, sin interrogar a nadie.', pide: { empleado: true } },
        { sol: 'checklist-turnos', para: 'Abrir a las siete, prender refrigeradores, recibir al del pan, cerrar con candado. Una lista que se palomea y deja la hora.' },
        { sol: 'reporte-diario', para: 'Cada noche, un mensaje: cuánto se vendió, qué se fio y qué se acabó. Con eso ya se puede descansar un domingo.' },
      ],
    },
    {
      id: 'proveedor-llega',
      area: 'organizacion',
      titulo: 'Llega el proveedor y no tengo ni el pedido ni el dinero',
      senal: 'El del refresco pasa el martes, el del pan a diario. Se pide de memoria y se paga con lo que haya en la caja.',
      matices: [{ id: 'preventa', pregunta: '¿Sus proveedores le levantan el pedido un día antes de entregar?', si: 'Le levantan pedido antes', no: 'Compra directo del camión' }],
      rutas: [
        { sol: 'compras-sugeridas', para: 'Cuando llega el preventista, el pedido ya está armado con lo que salió en la semana. No se pide de más ni se olvida la botana.', pide: { preventa: true } },
        { sol: 'agenda-interna', para: 'El calendario de rutas a la vista: martes refresco, jueves botana, y cuánto hay que apartar para pagarle a cada uno.' },
        { sol: 'inventario-escaner', para: 'Lo que baja del camión se registra al recibir. Si la nota dice diez cajas y llegaron nueve, se nota ahí mismo.' },
        { sol: 'bitacora-turno', para: 'Quien recibió anota qué llegó, cuánto pagó y qué quedó pendiente. Usted no tiene que estar presente para enterarse.' },
      ],
    },

    // ── Inventarios ──
    {
      id: 'se-acaba-lo-que-sale',
      area: 'inventarios',
      titulo: 'Se me acaba lo que más se vende',
      senal: 'Piden refresco frío, huevo o tortillas, no hay, y el cliente se lleva toda su compra a otro lado.',
      frecuente: true,
      matices: [{ id: 'registro', pregunta: '¿Hoy registra de alguna forma lo que vende?', si: 'Registra sus ventas', no: 'No lleva registro' }],
      rutas: [
        { sol: 'inventario-alertas', para: 'Cada producto con su mínimo. Cuando quedan menos de dos cajas de refresco de 600, usted se entera antes del sábado.' },
        { sol: 'compras-sugeridas', para: 'Según lo que salió en la semana, la lista para la central de abastos y para cada proveedor se arma sola.', pide: { registro: true } },
        { sol: 'inventario-escaner', para: 'Al recibir mercancía se escanea la caja con el celular. Lo que dice la pantalla es lo que hay en el anaquel y en la bodega.' },
        { sol: 'bitacora-turno', para: 'Lo mínimo: lo que se acaba se anota en el momento, en una lista que ve quien va a surtir. Ya no depende de la memoria.' },
      ],
    },
    {
      id: 'se-vence-en-el-refri',
      area: 'inventarios',
      titulo: 'Se me vence la mercancía en el refrigerador',
      senal: 'Yogurt, jamón y pan que caducan al fondo. Unos los cambia el proveedor y otros se pierden.',
      frecuente: true,
      matices: [{ id: 'cambia', pregunta: '¿Sus proveedores le cambian lo que caduca?', si: 'El proveedor cambia lo vencido', no: 'Lo vencido es pérdida suya' }],
      rutas: [
        { sol: 'caducidades', para: 'Lo refrigerado entra con su fecha. Lo que vence esta semana sale en una lista: se pasa al frente o se aparta para el cambio.' },
        { sol: 'merma', para: 'Lo que se tira se anota: qué era y de qué proveedor. A fin de mes sabe cuánto perdió y de qué le conviene pedir menos.', pide: { cambia: false } },
        { sol: 'compras-sugeridas', para: 'Si de veinte yogurts se venden doce, la lista sugiere doce. Lo que no se compra de más no se vence.' },
        { sol: 'checklist-turnos', para: 'Cada lunes, revisar fechas del refrigerador y pasar al frente lo más viejo. Queda palomeado quién lo hizo.' },
      ],
    },

    // ── Administración ──
    {
      id: 'fiado-en-libreta',
      area: 'administracion',
      titulo: 'Fío y luego ya no sé quién me debe ni cuánto',
      senal: 'La libreta tiene tachones, hojas sueltas y cuentas que el cliente recuerda de otra manera.',
      frecuente: true,
      matices: [
        { id: 'celular', pregunta: '¿Tiene el número de celular de quienes le deben?', si: 'Tiene sus números', no: 'Solo los conoce de vista' },
        { id: 'tope', pregunta: '¿Hoy le pone un tope a lo que fía?', si: 'Fía con tope', no: 'Fía sin límite' },
      ],
      rutas: [
        { sol: 'fiado', para: 'Cada vecino con su cuenta: qué se llevó, cuándo y cuánto ha abonado. Si hay duda, se le enseña la pantalla y no la libreta.' },
        { sol: 'recordatorios', para: 'El día de quincena sale un mensaje amable con el saldo. Usted ya no tiene que cobrar de frente y con pena.', pide: { celular: true } },
        { sol: 'cobro-en-linea', para: 'El vecino abona por transferencia desde su celular, aunque no pase por la tienda. El abono se descuenta de su cuenta.' },
        { sol: 'proceso-claro', para: 'Acordar las reglas del fiado: a quién, hasta cuánto y para cuándo. Dichas desde el principio, nadie se ofende.', pide: { tope: false } },
      ],
    },
    {
      id: 'no-se-cuanto-vendi',
      area: 'administracion',
      titulo: 'No sé cuánto vendí hoy ni cuánto es mío',
      senal: 'Del cajón sale el pago al proveedor, el gasto de la casa y el cambio. Al cerrar no hay un número.',
      frecuente: true,
      matices: [{ id: 'mezcla', pregunta: '¿De la caja de la tienda sale también el gasto de la casa?', si: 'Caja y casa van juntas', no: 'La caja es solo de la tienda' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Cada venta queda registrada al cobrarse, también las recargas. El número del día ya no sale de contar billetes.' },
        { sol: 'corte-de-caja', para: 'Al cerrar: tanto se vendió, tanto se le pagó al proveedor, tanto se sacó para la casa. Lo que debe haber en el cajón queda claro.', pide: { mezcla: true } },
        { sol: 'tablero-ventas', para: 'La venta del día en su teléfono, hora por hora. Se ve si el martes flojo fue flojo o solo se sintió así.' },
        { sol: 'reporte-diario', para: 'Cada noche, un mensaje con lo vendido, lo fiado y lo pagado a proveedores. Sin abrir ningún sistema.' },
      ],
    },
    {
      id: 'consumo-de-la-casa',
      area: 'administracion',
      titulo: 'De la tienda agarra toda la familia y nadie lo anota',
      senal: 'La leche, el refresco y la botana de la casa salen del anaquel. A fin de mes falta mercancía y no se sabe cuánta.',
      matices: [{ id: 'empleados', pregunta: '¿Además de la familia, tiene empleados que atienden?', si: 'Hay empleados', no: 'Solo atiende la familia' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Todo lo que sale pasa por la caja, también lo que se lleva la familia. Se marca como consumo de casa y no como venta.' },
        { sol: 'corte-de-caja', para: 'Con empleados, el corte de cada turno separa lo que fue consumo de casa de lo que es un faltante de verdad.', pide: { empleados: true } },
        { sol: 'fiado', para: 'La casa tiene su propia cuenta, como cualquier vecino. A fin de mes usted ve cuánto se llevó y decide si es mucho.' },
        { sol: 'merma', para: 'Lo que se toma se anota con un toque y su motivo. Deja de ser un hueco en el anaquel y se vuelve una cifra.' },
      ],
    },

    // ── Logística ──
    {
      id: 'pedidos-a-domicilio',
      area: 'logistica',
      titulo: 'Los pedidos a domicilio se me enredan',
      senal: 'Listas por WhatsApp y por teléfono mientras se atiende el mostrador. Unas salen incompletas y otras se olvidan.',
      matices: [{ id: 'repartidor', pregunta: '¿Tiene a alguien fijo para repartir?', si: 'Hay repartidor', no: 'Reparte quien esté libre' }],
      rutas: [
        { sol: 'seguimiento-pedidos', para: 'Cada pedido en un tablero: recibido, surtido, en camino, cobrado. Quien reparte sabe cuál sigue sin preguntar.', pide: { repartidor: true } },
        { sol: 'whatsapp-pedidos', para: 'El vecino arma su lista con una guía: producto, cantidad, domicilio y con cuánto paga. El repartidor ya sale con el cambio.' },
        { sol: 'cobro-en-linea', para: 'El pedido se paga por transferencia antes de salir. El muchacho no carga efectivo ni regresa por el cambio.' },
        { sol: 'catalogo-whatsapp', para: 'Un enlace con lo que más piden y su precio. El vecino elige de ahí y deja de preguntar "¿a cómo el huevo?".' },
      ],
    },
    {
      id: 'envases-prestados',
      area: 'logistica',
      titulo: 'Presto envases y garrafones y ya no regresan',
      senal: 'Cascos de refresco y de cerveza que el proveedor le cobra a usted y el vecino olvida devolver.',
      matices: [{ id: 'deposito', pregunta: '¿Cobra depósito por el envase?', si: 'Cobra depósito', no: 'Presta de confianza' }],
      rutas: [
        { sol: 'fiado', para: 'El envase se anota en la cuenta del vecino igual que un fiado. Al devolverlo se descuenta; si no, queda como saldo.' },
        { sol: 'base-clientes', para: 'En la ficha de cada vecino se ve cuántos cascos tiene fuera y desde cuándo. Antes de prestar otro, usted lo sabe.' },
        { sol: 'recordatorios', para: 'A los quince días sale un mensaje amable: "tiene dos envases de la tienda". Lo recuerda el sistema, no usted en la puerta.' },
        { sol: 'proceso-claro', para: 'Una regla pareja para todos: envase por envase, o depósito. Acordada con usted y escrita junto a la caja.', pide: { deposito: false } },
      ],
    },

    // ── Comunicación ──
    {
      id: 'precio-viejo',
      area: 'comunicacion',
      titulo: 'Sube un precio y en la tarde se sigue cobrando el viejo',
      senal: 'El proveedor avisa del aumento, el dueño lo sabe y quien atiende el otro turno no se entera.',
      frecuente: true,
      matices: [
        { id: 'sistema', pregunta: '¿Ya cobra con algún sistema o escáner?', si: 'Ya usa sistema de cobro', no: 'Cobra de memoria o calculadora' },
        { id: 'turnos', pregunta: '¿Atienden personas distintas en la mañana y en la tarde?', si: 'Cambia quien atiende', no: 'Atiende la misma persona' },
      ],
      rutas: [
        { sol: 'punto-de-venta', para: 'El precio se cambia una sola vez y sale al escanear. Ya no depende de la memoria de quien cobra.', pide: { sistema: false } },
        { sol: 'costeo', para: 'Cuando el proveedor sube el costo, usted ve cuánto debe subir el precio para que el producto le siga dejando lo mismo.' },
        { sol: 'bitacora-turno', para: 'El cambio queda escrito para el turno de la tarde: "el aceite sube a 48". Lo ven al llegar, antes de la primera venta.', pide: { turnos: true } },
        { sol: 'menu-digital', para: 'La lista de precios en el celular de todos. Usted cambia el número y al momento todos ven el mismo.' },
      ],
    },

    // ── Rentabilidad ──
    {
      id: 'vendo-y-no-queda',
      area: 'rentabilidad',
      titulo: 'Vendo todo el día y no veo la ganancia',
      senal: 'La tienda no para, pero al surtir de nuevo el dinero apenas alcanza.',
      frecuente: true,
      matices: [{ id: 'margen', pregunta: '¿Sabe cuánto le deja cada producto que vende?', si: 'Conoce sus márgenes', no: 'Pone precio según la competencia' }],
      rutas: [
        { sol: 'costeo', para: 'El refresco deja unos pesos y la botana deja más. Con el margen de cada producto a la vista, usted decide qué poner al frente.', pide: { margen: false } },
        { sol: 'tablero-ventas', para: 'Lo que más se vende junto a lo que más deja. Se ve si la tienda vive del refresco o de lo que se vende con él.' },
        { sol: 'merma', para: 'Lo vencido, lo roto y lo que se llevó la casa también es ganancia que se fue. Medirlo dice por dónde.' },
        { sol: 'reporte-diario', para: 'Cada noche, lo vendido menos lo que costó. Un número sencillo para saber si el día dejó o solo le dio vueltas al dinero.' },
      ],
    },
    {
      id: 'mercancia-parada',
      area: 'rentabilidad',
      titulo: 'Tengo dinero parado en mercancía que no sale',
      senal: 'Cajas en la bodega que llevan meses. Se compraron por la promoción del proveedor y no se movieron.',
      matices: [
        { id: 'promo', pregunta: '¿Compra de más cuando el proveedor le ofrece promoción?', si: 'Compra por promoción', no: 'Compra lo de siempre' },
        { id: 'contacto', pregunta: '¿Tiene un grupo o lista de WhatsApp con sus vecinos?', si: 'Tiene lista de vecinos', no: 'No tiene lista de difusión' },
      ],
      rutas: [
        { sol: 'tablero-ventas', para: 'Qué se vende cada día y qué lleva un mes sin moverse, en la misma pantalla. Lo parado deja de esconderse en la bodega.' },
        { sol: 'compras-sugeridas', para: 'Antes de aceptar la promoción del proveedor, usted ve cuánto vende de eso en un mes. Compra con el número enfrente.', pide: { promo: true } },
        { sol: 'promos-segmentadas', para: 'Lo que no sale se arma en combo y se ofrece a los vecinos por mensaje, antes de que caduque en la bodega.', pide: { contacto: true } },
        { sol: 'proceso-claro', para: 'Una regla sencilla, acordada con usted: no entra una caja nueva de lo que todavía tiene dos sin abrir.' },
      ],
    },
  ],
}
