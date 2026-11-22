// Carnicería, pollería, pescadería o cremería: producto fresco por kilo, merma, pedidos de negocios y fila de domingo.

export default {
  id: 'carniceria',
  familia: 'tiendas',
  nombre: 'Carnicería',
  plural: 'carnicerías',
  icono: 'carniceria',
  acento: '#8a1f2d',
  vocab: {
    personal: 'el despachador',
    empleado: 'el despachador',
    cita: 'entrega',
    citas: 'entregas',
  },

  // Para quien presenta, antes de entrar.
  apertura: '¿Cómo les va los domingos, cuando todo mundo quiere su carne para asar a la misma hora?',
  observa: [
    'Si quien despacha también cobra, con las mismas manos.',
    'Si los pedidos están en una libreta, en papelitos o pegados junto a la báscula.',
    'Si los precios están en un pizarrón con números borrados y vueltos a escribir.',
  ],

  // Datos de muestra para vestir las demos. Son ilustrativos. Precios por kilo.
  muestra: {
    productos: [
      { nombre: 'Bistec de res', precio: 220, categoria: 'Res' },
      { nombre: 'Diezmillo para asar', precio: 215, categoria: 'Res' },
      { nombre: 'Costilla de res', precio: 190, categoria: 'Res' },
      { nombre: 'Molida de res', precio: 175, categoria: 'Res' },
      { nombre: 'Chuleta de cerdo', precio: 130, categoria: 'Cerdo' },
      { nombre: 'Pierna de cerdo', precio: 125, categoria: 'Cerdo' },
      { nombre: 'Costilla de cerdo', precio: 145, categoria: 'Cerdo' },
      { nombre: 'Pechuga sin hueso', precio: 160, categoria: 'Pollo' },
      { nombre: 'Pierna y muslo', precio: 78, categoria: 'Pollo' },
      { nombre: 'Milanesa de pollo', precio: 170, categoria: 'Pollo' },
      { nombre: 'Chorizo de la casa', precio: 150, categoria: 'Preparados' },
      { nombre: 'Carne al pastor', precio: 165, categoria: 'Preparados' },
      { nombre: 'Arrachera marinada', precio: 340, categoria: 'Preparados' },
      { nombre: 'Queso panela', precio: 140, categoria: 'Preparados' },
    ],
    servicios: [
      { nombre: 'Pedido para recoger', precio: 0, minutos: 15 },
      { nombre: 'Entrega a domicilio', precio: 35, minutos: 40 },
      { nombre: 'Paquete para asar (6 personas)', precio: 890, minutos: 20 },
      { nombre: 'Encargo para evento', precio: 0, minutos: 60 },
      { nombre: 'Surtido semanal para negocio', precio: 0, minutos: 45 },
    ],
    personal: ['Nacho', 'Martín', 'Rosa', 'Beto'],
    clientes: ['Taquería El Güero', 'Doña Carmen', 'Fonda La Esperanza', 'Sra. Villalvazo', 'Birriería Los Compadres', 'Don Ismael'],
    insumos: [
      { nombre: 'Diezmillo', unidad: 'kg', hay: 9, minimo: 15 },
      { nombre: 'Pierna de cerdo', unidad: 'kg', hay: 32, minimo: 20 },
      { nombre: 'Pechuga de pollo', unidad: 'kg', hay: 12, minimo: 18 },
      { nombre: 'Carne al pastor', unidad: 'kg', hay: 14, minimo: 10 },
      { nombre: 'Chorizo de la casa', unidad: 'kg', hay: 8, minimo: 6 },
      { nombre: 'Costilla de res', unidad: 'kg', hay: 16, minimo: 12 },
      { nombre: 'Bolsas de a kilo', unidad: 'paquetes', hay: 6, minimo: 4 },
      { nombre: 'Etiquetas para báscula', unidad: 'rollos', hay: 3, minimo: 2 },
    ],
  },

  problemas: [
    // ── Atención ──
    {
      id: 'fila-domingo',
      area: 'atencion',
      titulo: 'Los domingos la fila llega hasta la banqueta',
      senal: 'Todos llegan a la misma hora por la carne para asar. Hay quien ve la fila y se va a otro lado.',
      frecuente: true,
      matices: [
        { id: 'encargo', pregunta: '¿Sus clientes encargarían desde un día antes?', si: 'Encargarían con anticipación', no: 'Deciden al llegar' },
        { id: 'cobra', pregunta: '¿El mismo que despacha es el que cobra?', si: 'Quien despacha también cobra', no: 'Hay caja aparte' },
      ],
      rutas: [
        { sol: 'pedidos-mostrador', para: 'El sábado encargan su diezmillo y su chorizo. El domingo pasan por la bolsa ya pesada y con nombre, sin formarse.', pide: { encargo: true } },
        { sol: 'punto-de-venta', para: 'Quien despacha pesa y manda la venta a caja; otra persona cobra. Nadie suelta el cuchillo para dar cambio.', pide: { cobra: true } },
        { sol: 'pantalla-turnos', para: 'Cada quien toma su número y ve cuántos faltan. Nadie se cuela, y quien espera puede ir por las tortillas mientras tanto.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: acordar el domingo. Uno toma pedido, otro corta, otro cobra, y lo que más sale ya está porcionado desde temprano.' },
      ],
    },

    // ── Comunicación ──
    {
      id: 'pedidos-por-audio',
      area: 'comunicacion',
      titulo: 'Los taqueros me piden por audio a medianoche',
      senal: 'Pedidos de taquerías y fondas por audio, llamada o recado. En la mañana falta alguno o va mal cortado.',
      frecuente: true,
      matices: [{ id: 'repite', pregunta: '¿Sus clientes de negocio piden casi lo mismo cada semana?', si: 'Pedidos que se repiten', no: 'Cada pedido es distinto' }],
      rutas: [
        { sol: 'whatsapp-pedidos', para: 'El taquero pide con una guía: corte, kilos, grosor y hora. El pedido llega escrito y completo, no en un audio de dos minutos.' },
        { sol: 'pantalla-cocina', para: 'Al abrir, los pedidos del día están en fila con su hora de entrega. Se corta primero lo que sale primero.' },
        { sol: 'base-clientes', para: 'El pedido de siempre de cada taquería queda en su ficha: quince de pastor, ocho de bistec delgado. Solo se confirma si hay cambios.', pide: { repite: true } },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: una confirmación ya escrita con kilos, precio y hora. Si algo se entendió mal, se corrige esa misma noche.' },
      ],
    },
    {
      id: 'a-como-el-kilo',
      area: 'comunicacion',
      titulo: 'Todo el día preguntan a cómo está el kilo',
      senal: 'Llamadas y mensajes para preguntar precios mientras hay gente en el mostrador y las manos están ocupadas.',
      matices: [{ id: 'cambian', pregunta: '¿Sus precios cambian casi cada semana?', si: 'Precios que cambian seguido', no: 'Precios estables' }],
      rutas: [
        { sol: 'respuesta-automatica', para: 'Los precios del día, el horario y si hay entrega a domicilio se contestan solos. El teléfono suena para pedir, no para preguntar.' },
        { sol: 'menu-digital', para: 'Cuando el proveedor sube el kilo, usted cambia el precio en un minuto y todos ven el mismo. El pizarrón deja de ser la única lista.', pide: { cambian: true } },
        { sol: 'perfil-google', para: 'Parte de las llamadas es para saber si está abierto. Con el horario correcto en Google, festivos incluidos, muchas ya no hacen falta.' },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: la lista de la semana guardada como respuesta. Se envía con un toque, sin teclear precio por precio.' },
      ],
    },

    // ── Administración ──
    {
      id: 'fiado-negocios',
      area: 'administracion',
      titulo: 'Les fío a las taquerías y batallo para cobrar',
      senal: 'Notas de varias semanas en una libreta. A la hora de cobrar, el cliente recuerda otra cantidad.',
      frecuente: true,
      matices: [{ id: 'transfer', pregunta: '¿Esos clientes le pagan por transferencia?', si: 'Pagan por transferencia', no: 'Pagan en efectivo' }],
      rutas: [
        { sol: 'fiado', para: 'Cada taquería con su cuenta: nota por nota, abono por abono. El sábado se cobra con el saldo a la vista de los dos.' },
        { sol: 'cobro-en-linea', para: 'El saldo de la semana se envía con un enlace para pagar. El abono queda anotado solo, sin capturas de pantalla.', pide: { transfer: true } },
        { sol: 'reporte-diario', para: 'Cada noche, un mensaje con quién debe, cuánto y desde cuándo. Usted decide a quién se le sigue surtiendo mañana.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: acordar con cada negocio su tope de crédito y su día de pago, por escrito. Cobrar deja de sentirse como pedir un favor.' },
      ],
    },
    {
      id: 'entra-mas-de-lo-vendido',
      area: 'administracion',
      titulo: 'Entra más carne de la que aparece vendida',
      senal: 'Kilos que se pesan de más, se regalan o no pasan por caja. La diferencia no se nota hasta fin de mes.',
      matices: [{ id: 'etiqueta', pregunta: '¿Su báscula imprime etiqueta con peso y precio?', si: 'Báscula con etiqueta', no: 'Báscula sin etiqueta' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'La etiqueta de la báscula se cobra en caja tal cual. Cada pesada queda como venta, con kilos, precio y quién despachó.', pide: { etiqueta: true } },
        { sol: 'inventario-escaner', para: 'Lo que entrega el proveedor se pesa y se registra al recibirlo. A la semana se compara: entraron 180 kilos, se vendieron tantos.' },
        { sol: 'corte-de-caja', para: 'El corte por turno y por persona compara lo vendido con lo contado. Un faltante tiene hora y nombre, no solo sospecha.' },
        { sol: 'merma', para: 'Lo mínimo: anotar cada día el hueso, el sebo y lo que se tiró. Así se separa la merma normal de la que no tiene explicación.' },
      ],
    },

    // ── Inventarios ──
    {
      id: 'se-queda-carne',
      area: 'inventarios',
      titulo: 'Se me queda carne y acaba en molida o en la basura',
      senal: 'Lo que no se vendió a tiempo se oscurece. Se remata, se muele o se tira, y nadie lleva la cuenta.',
      frecuente: true,
      matices: [{ id: 'contacto', pregunta: '¿Tiene el WhatsApp de sus clientes de diario?', si: 'Tiene contacto de sus clientes', no: 'No guarda contactos' }],
      rutas: [
        { sol: 'compras-sugeridas', para: 'Según lo vendido cada día de la semana, el sistema sugiere cuánto pedir. El martes no se compra como si fuera sábado.' },
        { sol: 'caducidades', para: 'Cada pieza entra a la cámara con su fecha. Lo que lleva tres días aparece primero, a tiempo para marinarlo o ponerlo en oferta.' },
        { sol: 'promos-segmentadas', para: 'La oferta del día le llega a quien compra entre semana: "hoy bistec en oferta". Se vende antes de que haya que molerlo.', pide: { contacto: true } },
        { sol: 'merma', para: 'Lo mínimo: pesar y anotar lo que se remata y lo que se tira, con su motivo. En un mes se ve qué corte se está comprando de más.' },
      ],
    },
    {
      id: 'se-acaba-el-sabado',
      area: 'inventarios',
      titulo: 'El sábado se me acaba lo que más piden',
      senal: 'A mediodía ya no hay costilla ni chorizo, y sobra lo que nadie buscó. El cliente se va sin lo que venía a comprar.',
      matices: [{ id: 'aparta', pregunta: '¿Sus clientes apartarían su carne para el fin de semana?', si: 'Apartarían con tiempo', no: 'Compran al momento' }],
      rutas: [
        { sol: 'anticipo-reserva', para: 'El paquete del fin de semana se aparta con anticipo desde el jueves. Usted prepara lo que ya está vendido, no lo que calcula.', pide: { aparta: true } },
        { sol: 'inventario-alertas', para: 'Cada corte con su mínimo para viernes y sábado. Si el chorizo baja de diez kilos, el aviso llega cuando todavía se puede hacer más.' },
        { sol: 'tablero-ventas', para: 'Lo que se vendió los últimos sábados, corte por corte y hora por hora. Se ve a qué hora se acabó cada cosa.' },
        { sol: 'catalogo-whatsapp', para: 'Lo mínimo: lo agotado se marca en la lista que ven sus clientes. Quien venía solo por costilla se entera antes de dar la vuelta.' },
      ],
    },

    // ── Rentabilidad ──
    {
      id: 'cuanto-deja-cada-corte',
      area: 'rentabilidad',
      titulo: 'No sé cuánto le gano a cada corte',
      senal: 'La canal se compra a un precio y se vende en veinte cortes distintos. El precio de cada uno se puso por costumbre.',
      frecuente: true,
      matices: [{ id: 'canal', pregunta: '¿Compra en canal o en media canal?', si: 'Compra en canal', no: 'Compra por pieza o en caja' }],
      rutas: [
        { sol: 'costeo', para: 'De una media canal se anota cuánto salió de bistec, de costilla, de hueso y de sebo. Con eso cada corte tiene su costo real.', pide: { canal: true } },
        { sol: 'tablero-ventas', para: 'Qué cortes se venden más y cuáles dejan más, lado a lado. Se ve si conviene empujar el diezmillo o la molida.' },
        { sol: 'merma', para: 'Lo que se pierde en limpieza y recorte también es costo. Medirlo unas semanas cambia la cuenta de lo que deja cada kilo.' },
        { sol: 'menu-digital', para: 'Lo mínimo: una lista de precios que se ajusta en un minuto cuando el proveedor sube. El precio viejo no se queda otra semana.' },
      ],
    },

    // ── Organización ──
    {
      id: 'encargos-en-papelito',
      area: 'organizacion',
      titulo: 'Los encargos para fiestas se anotan en un papelito',
      senal: 'Veinte kilos de birria para el sábado, una pierna para Navidad. El papel se moja, se pierde o nadie lo vio.',
      frecuente: true,
      matices: [{ id: 'anticipo', pregunta: '¿Pediría anticipo en los encargos grandes?', si: 'Anticipo aceptado', no: 'Sin anticipo' }],
      rutas: [
        { sol: 'ordenes-trabajo', para: 'Cada encargo con su orden: qué pidió, cómo lo quiere cortado, cuándo pasa y cuánto dejó. El cliente recibe aviso cuando está listo.' },
        { sol: 'cobro-en-linea', para: 'El anticipo se paga con un enlace al momento de encargar. Nadie prepara veinte kilos para alguien que no confirmó.', pide: { anticipo: true } },
        { sol: 'recordatorios', para: 'Un mensaje un día antes para confirmar el encargo y la hora. Si cambiaron de planes, usted se entera antes de cortar.' },
        { sol: 'agenda-interna', para: 'Lo mínimo: los encargos en una agenda que todos ven. En diciembre se nota qué día ya no cabe otra pierna.' },
      ],
    },
    {
      id: 'limpieza-si-no-reviso',
      area: 'organizacion',
      titulo: 'Si yo no reviso, la limpieza no se hace igual',
      senal: 'El lavado de la sierra, el molino y la cámara depende de quién cierre. Nadie anota la temperatura.',
      matices: [{ id: 'encargado', pregunta: '¿Hay alguien de confianza que abra o cierre por usted?', si: 'Hay quien abre y cierra', no: 'Siempre abre y cierra el dueño' }],
      rutas: [
        { sol: 'roles-horarios', para: 'Quién abre el domingo a las seis y quién cierra el sábado, publicado para todos. La limpieza de fondo tiene día y responsable.', pide: { encargado: true } },
        { sol: 'bitacora-turno', para: 'Lo pendiente pasa por escrito: "la cámara marcó seis grados", "falta afilar la sierra". Quien abre lo lee antes de despachar.' },
        { sol: 'reporte-diario', para: 'Cada noche le llega si el cierre se completó y a qué temperatura quedó la cámara. Sin tener que darse la vuelta.' },
        { sol: 'checklist-turnos', para: 'Lo mínimo: el cierre en una lista: sierra, molino, tablas, piso y temperatura. Queda quién lo hizo y a qué hora, por si hay inspección.' },
      ],
    },

    // ── Logística ──
    {
      id: 'reparto-tarde',
      area: 'logistica',
      titulo: 'El reparto a los negocios sale tarde o incompleto',
      senal: 'La taquería abre a las siete y el pedido llega a las ocho, o llega sin el chorizo. Hay que dar otra vuelta.',
      matices: [{ id: 'reparto', pregunta: '¿Tiene repartidor propio?', si: 'Reparto propio', no: 'Sin repartidor fijo' }],
      rutas: [
        { sol: 'seguimiento-pedidos', para: 'Cada pedido de negocio con su etapa: por cortar, pesado, cargado, entregado. A las seis y media se ve qué falta por subir a la moto.' },
        { sol: 'rastreo-cliente', para: 'El taquero ve que su pedido ya va en camino. No llama tres veces mientras usted está despachando.', pide: { reparto: true } },
        { sol: 'aviso-listo', para: 'Cuando un pedido queda pesado y empacado, el repartidor recibe el aviso. No espera parado ni sale con la mitad.' },
        { sol: 'checklist-turnos', para: 'Lo mínimo: una lista de carga por ruta. Cada bolsa se palomea al subirla y el chorizo ya no se queda en el mostrador.' },
      ],
    },

    // ── Clientes ──
    {
      id: 'se-van-al-super',
      area: 'clientes',
      titulo: 'La gente joven ya compra la carne en el súper',
      senal: 'Los clientes de toda la vida siguen viniendo. Sus hijos compran en el supermercado, donde pagan con tarjeta y no esperan.',
      matices: [{ id: 'contacto', pregunta: '¿Guarda el número de sus clientes de diario?', si: 'Tiene contacto de sus clientes', no: 'No guarda contactos' }],
      rutas: [
        { sol: 'pedidos-mostrador', para: 'Piden desde el celular al salir del trabajo y pasan por su carne ya pesada. La comodidad del súper, con el corte de la carnicería.' },
        { sol: 'tarjeta-lealtad', para: 'Un sello por cada compra, en el teléfono. A la décima, medio kilo de chorizo de la casa. Un motivo para no desviarse al súper.' },
        { sol: 'promos-segmentadas', para: 'El jueves, un mensaje con el paquete para asar del fin de semana. Solo a quienes ya han comprado para parrillada.', pide: { contacto: true } },
        { sol: 'perfil-google', para: 'Lo primero: que quien busca "carnicería cerca" lo encuentre con horario, fotos del mostrador y si acepta tarjeta.' },
      ],
    },
    {
      id: 'no-saben-que-surto',
      area: 'clientes',
      titulo: 'Casi nadie sabe que surto eventos y negocios',
      senal: 'Quien organiza una fiesta o abre una taquería busca proveedor y no sabe que aquí se surte por mayoreo.',
      matices: [{ id: 'mayoreo', pregunta: '¿Tiene precio especial por mayoreo?', si: 'Maneja precio de mayoreo', no: 'Mismo precio para todos' }],
      rutas: [
        { sol: 'sitio-web', para: 'Una página con lo que surte para eventos y negocios: birria, pastor, paquetes por persona, y el botón para pedir cotización.' },
        { sol: 'cotizador', para: 'Cuando preguntan por carne para cien personas, la cotización sale en un minuto, con kilos por persona y precio de mayoreo.', pide: { mayoreo: true } },
        { sol: 'seguimiento-prospectos', para: 'Cada negocio que preguntó precios queda anotado con su fecha. A la semana se le vuelve a escribir, no se deja al aire.' },
        { sol: 'catalogo-whatsapp', para: 'Lo mínimo: los paquetes para evento en un enlace que se comparte. Quien lo recibe ve qué incluye y cuánto cuesta por persona.' },
      ],
    },
  ],
}
