// Tienda de ropa, boutique o zapatería: tallas y colores, apartados, venta por redes y mercancía de temporada.

export default {
  id: 'ropa',
  familia: 'tiendas',
  nombre: 'Tienda de ropa o boutique',
  plural: 'tiendas de ropa',
  icono: 'ropa',
  acento: '#7a3250',
  vocab: {
    personal: 'la vendedora',
    empleado: 'la vendedora',
    producto: 'prenda',
    productos: 'prendas',
    cita: 'entrega',
    citas: 'entregas',
  },

  // Para quien presenta, antes de entrar.
  apertura: 'Vimos lo que publican en sus redes. ¿Qué tanto de lo que venden sale por mensaje y qué tanto aquí en la tienda?',
  observa: [
    'Si hay bolsas con nombre detrás del mostrador: son apartados esperando.',
    'Si quien atiende contesta mensajes en el celular mientras hay gente viendo ropa.',
    'Si hay un rack de rebajas con prendas de la temporada pasada.',
  ],

  // Datos de muestra para vestir las demos. Son ilustrativos.
  muestra: {
    productos: [
      { nombre: 'Blusa de gasa', precio: 349, categoria: 'Dama' },
      { nombre: 'Vestido casual', precio: 599, categoria: 'Dama' },
      { nombre: 'Jeans de mezclilla', precio: 549, categoria: 'Dama' },
      { nombre: 'Conjunto deportivo', precio: 649, categoria: 'Dama' },
      { nombre: 'Camisa de vestir', precio: 459, categoria: 'Caballero' },
      { nombre: 'Playera tipo polo', precio: 329, categoria: 'Caballero' },
      { nombre: 'Pantalón de mezclilla', precio: 529, categoria: 'Caballero' },
      { nombre: 'Chamarra de mezclilla', precio: 799, categoria: 'Caballero' },
      { nombre: 'Tenis casuales', precio: 899, categoria: 'Calzado' },
      { nombre: 'Sandalia de tacón', precio: 649, categoria: 'Calzado' },
      { nombre: 'Botín de piel', precio: 1190, categoria: 'Calzado' },
      { nombre: 'Bolsa de mano', precio: 499, categoria: 'Accesorios' },
      { nombre: 'Cinturón de piel', precio: 229, categoria: 'Accesorios' },
      { nombre: 'Aretes de fantasía', precio: 129, categoria: 'Accesorios' },
    ],
    servicios: [
      { nombre: 'Apartado con anticipo', precio: 100, minutos: 15 },
      { nombre: 'Entrega en punto medio', precio: 0, minutos: 20 },
      { nombre: 'Entrega a domicilio', precio: 40, minutos: 30 },
      { nombre: 'Envío por paquetería', precio: 160, minutos: 15 },
      { nombre: 'Cita para probarse', precio: 0, minutos: 30 },
    ],
    personal: ['Karla', 'Brenda', 'Dulce', 'Iván'],
    clientes: ['Fabiola Cisneros', 'Sra. Magaña', 'Jimena Ruiz', 'Alejandra Núñez', 'Óscar Larios', 'Mtra. Estela'],
    insumos: [
      { nombre: 'Jeans de dama talla 7', unidad: 'pzas', hay: 2, minimo: 4 },
      { nombre: 'Blusa de gasa talla M', unidad: 'pzas', hay: 1, minimo: 3 },
      { nombre: 'Playera tipo polo talla G', unidad: 'pzas', hay: 8, minimo: 4 },
      { nombre: 'Tenis casuales del 25', unidad: 'pares', hay: 5, minimo: 3 },
      { nombre: 'Botín de piel del 24', unidad: 'pares', hay: 3, minimo: 2 },
      { nombre: 'Bolsas con logotipo', unidad: 'pzas', hay: 120, minimo: 100 },
      { nombre: 'Etiquetas de precio', unidad: 'rollos', hay: 3, minimo: 2 },
      { nombre: 'Cajas para envío', unidad: 'pzas', hay: 14, minimo: 10 },
    ],
  },

  problemas: [
    // ── Comunicación ──
    {
      id: 'mensajes-se-pasan',
      area: 'comunicacion',
      titulo: 'Me escriben por Instagram y se me pasan',
      senal: 'Preguntan precio y talla por Instagram, Facebook y WhatsApp. Cuando llega la respuesta, ya compraron en otro lado.',
      frecuente: true,
      matices: [{ id: 'basicas', pregunta: '¿Casi todos preguntan lo mismo: precio, tallas y dónde están?', si: 'Preguntan precio y talla', no: 'Cada mensaje es distinto' }],
      rutas: [
        { sol: 'respuesta-automatica', para: 'Precio, tallas que quedan y horario se contestan solos, aunque sea medianoche. A usted le llega quien ya quiere apartar.', pide: { basicas: true } },
        { sol: 'seguimiento-prospectos', para: 'Quien preguntó por el vestido rojo queda en seguimiento, con su talla. Si no cerró, al día siguiente se sabe a quién volver a escribirle.' },
        { sol: 'catalogo-whatsapp', para: 'Cada publicación lleva un enlace con precio y tallas. La pregunta de siempre ya viene contestada y lo que llega es el pedido.', pide: { basicas: true } },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: las respuestas de precio, apartado y envío ya escritas. Quien tenga el celular contesta igual que usted, con un toque.' },
      ],
    },

    // ── Atención ──
    {
      id: 'talla-hay-que-buscar',
      area: 'atencion',
      titulo: 'Preguntan si hay su talla y tengo que ir a buscar',
      senal: 'El cliente espera mientras alguien revuelve la bodega. A veces sí había y se le dijo que no.',
      frecuente: true,
      matices: [{ id: 'etiqueta', pregunta: '¿Sus prendas traen etiqueta con código de barras?', si: 'Prendas con código', no: 'Etiquetas a mano o sin etiqueta' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Cada venta descuenta la talla y el color exactos. Antes de ir a la bodega, la pantalla ya dice si quedan jeans en talla 7.' },
        { sol: 'inventario-escaner', para: 'Lo que llega del proveedor se escanea al entrar, con talla y color. Lo que dice el celular coincide con lo que hay en la bodega.', pide: { etiqueta: true } },
        { sol: 'inventario-alertas', para: 'Cuando de un modelo solo quedan la chica y la extra grande, usted se entera. Se resurte lo que sale o se rebaja lo que queda.' },
        { sol: 'catalogo-whatsapp', para: 'Lo mínimo: un catálogo donde cada modelo marca las tallas que quedan. Lo consulta el cliente y también quien atiende.' },
      ],
    },
    {
      id: 'cambios-discusion',
      area: 'atencion',
      titulo: 'Los cambios y devoluciones acaban en discusión',
      senal: 'Llegan sin nota, con la prenda usada o semanas después. Cada caso se resuelve distinto, según quién atienda.',
      matices: [{ id: 'nota', pregunta: '¿Entrega nota o ticket en cada venta?', si: 'Entrega nota en cada venta', no: 'Vende sin comprobante' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Cada venta sale con ticket y con la política de cambios impresa. El cambio se busca por fecha, no por la memoria de quien atendió.', pide: { nota: false } },
        { sol: 'base-clientes', para: 'La compra queda en la ficha del cliente. Aunque llegue sin nota, se ve qué llevó, cuándo y a qué precio.' },
        { sol: 'respuestas-rapidas', para: 'En ventas por mensaje, la política de cambios se envía junto con la confirmación. Queda por escrito antes de que paguen.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: una política de cambios de tres renglones, a la vista en caja y escrita en la nota. Todos responden lo mismo.' },
      ],
    },

    // ── Inventarios ──
    {
      id: 'tallas-sobran-faltan',
      area: 'inventarios',
      titulo: 'Me sobran tallas que no salen y me faltan las que sí',
      senal: 'Se surte parejo de todas las tallas. La mediana se acaba en una semana y la extra chica se queda colgada.',
      frecuente: true,
      matices: [{ id: 'registro', pregunta: '¿Anota la talla de cada prenda que vende?', si: 'Registra la talla vendida', no: 'Solo anota el importe' }],
      rutas: [
        { sol: 'compras-sugeridas', para: 'Antes de ir a surtir, la lista dice cuántas piezas de cada talla pedir según lo que salió. Ya no se compra la corrida completa.', pide: { registro: true } },
        { sol: 'punto-de-venta', para: 'Cada venta queda con modelo, talla y color. En un mes ya se ve qué tallas sostienen la tienda y cuáles solo ocupan gancho.', pide: { registro: false } },
        { sol: 'tablero-ventas', para: 'Las tallas y los colores que más salieron en la semana, en su teléfono. Sirve para decidir ahí mismo, frente al proveedor.' },
        { sol: 'inventario-alertas', para: 'Lo mínimo: un aviso cuando la talla que más sale baja de dos piezas. Se resurte esa talla, no todo el modelo.' },
      ],
    },
    {
      id: 'vendido-dos-veces',
      area: 'inventarios',
      titulo: 'Vendo por redes algo que ya se vendió en la tienda',
      senal: 'Se publica una prenda, alguien la pide por mensaje y en el mostrador ya se la llevó otra persona.',
      matices: [{ id: 'unicas', pregunta: '¿Maneja pocas piezas de cada modelo?', si: 'Pocas piezas por modelo', no: 'Varias piezas por talla' }],
      rutas: [
        { sol: 'tienda-en-linea', para: 'La existencia es una sola para la tienda y para internet. Si la última pieza se vende en mostrador, deja de ofrecerse en línea.' },
        { sol: 'inventario-escaner', para: 'La pieza se da de baja con el celular en cuanto se vende o se aparta. Quien contesta mensajes consulta lo que de verdad queda.' },
        { sol: 'catalogo-whatsapp', para: 'El catálogo que comparte en sus historias marca agotado con un toque. Nadie pide lo que ya no está.' },
        { sol: 'bitacora-turno', para: 'Lo mínimo: lo prometido por mensaje se anota donde lo ve quien está en mostrador, y la pieza se separa con nombre en ese momento.', pide: { unicas: true } },
      ],
    },

    // ── Administración ──
    {
      id: 'apartados-no-vuelven',
      area: 'administracion',
      titulo: 'Apartan y ya no vuelven por la prenda',
      senal: 'Bolsas con nombre que llevan meses en la bodega. La prenda no se vende y el saldo no se cobra.',
      frecuente: true,
      matices: [
        { id: 'plazo', pregunta: '¿Tiene un plazo fijo para liquidar un apartado?', si: 'Apartado con plazo fijo', no: 'Sin plazo definido' },
        { id: 'transfer', pregunta: '¿Sus clientes abonan por transferencia?', si: 'Abonan por transferencia', no: 'Abonan en efectivo en la tienda' },
      ],
      rutas: [
        { sol: 'fiado', para: 'Cada apartado con su prenda, su saldo, sus abonos y su fecha límite. Ya no se busca en la libreta cuánto falta de la bolsa de Fabiola.' },
        { sol: 'recordatorios', para: 'Tres días antes de que venza el apartado sale un mensaje: liquida, abona o lo libera. La prenda vuelve al rack a tiempo para venderse.', pide: { plazo: true } },
        { sol: 'cobro-en-linea', para: 'El abono se hace desde el teléfono con un enlace, sin venir a la tienda. Quien no puede pasar en quincena abona de todos modos.', pide: { transfer: true } },
        { sol: 'proceso-claro', para: 'Lo mínimo: reglas de apartado escritas en la nota. Cuánto se deja, cuántos días dura y qué pasa si no se liquida.', pide: { plazo: false } },
      ],
    },
    {
      id: 'transferencias-sin-confirmar',
      area: 'administracion',
      titulo: 'Me mandan la captura de la transferencia y no reviso',
      senal: 'Las ventas por mensaje se pagan con transferencia. Confirmar cada una en el banco quita tiempo y alguna nunca cayó.',
      matices: [{ id: 'antes', pregunta: '¿Entrega o envía antes de ver el dinero en su cuenta?', si: 'Entrega con la pura captura', no: 'Espera a ver el depósito' }],
      rutas: [
        { sol: 'cobro-en-linea', para: 'El cliente paga con un enlace y el pago aparece confirmado solo. No hay captura que revisar ni que creer.', pide: { antes: true } },
        { sol: 'corte-de-caja', para: 'Al cerrar, las transferencias del día salen en una lista para palomear contra la app del banco. La que falta se nota ese mismo día.' },
        { sol: 'seguimiento-pedidos', para: 'Cada pedido por mensaje tiene su etapa. Solo pasa a "pagado" cuando alguien vio el depósito, y solo lo pagado se empaca.' },
        { sol: 'checklist-turnos', para: 'Lo mínimo: revisar el banco a horas fijas, dos veces al día, y palomear cada depósito. Con el nombre de quien revisó.' },
      ],
    },

    // ── Organización ──
    {
      id: 'solo-yo-se',
      area: 'organizacion',
      titulo: 'Si no estoy yo, nadie sabe precios ni apartados',
      senal: 'Quien atiende le llama para preguntar cuánto cuesta algo, si tiene descuento o de quién es una bolsa.',
      matices: [{ id: 'etiquetado', pregunta: '¿Toda la mercancía tiene su precio en la etiqueta?', si: 'Todo tiene etiqueta', no: 'Hay prendas sin precio' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Los precios y los descuentos permitidos viven en el sistema. Quien atiende cobra sin llamarle y usted ve la venta desde donde esté.' },
        { sol: 'fiado', para: 'Los apartados dejan de estar en su cabeza: cada bolsa con nombre, saldo y fecha. Cualquiera recibe un abono sin equivocarse.' },
        { sol: 'bitacora-turno', para: 'Lo prometido queda escrito: "pasa Jimena por su vestido, ya está pagado". Quien abre en la tarde lo lee al llegar.' },
        { sol: 'menu-digital', para: 'Lo mínimo: una lista de precios en el celular de la tienda. Se busca el modelo y sale el precio, con el descuento máximo.', pide: { etiquetado: false } },
      ],
    },
    {
      id: 'comisiones-a-mano',
      area: 'organizacion',
      titulo: 'Las comisiones las saco a mano y siempre hay reclamos',
      senal: 'Las ventas de cada vendedora se cuentan en la libreta. A fin de quincena, los números de ella y los de usted no coinciden.',
      matices: [{ id: 'turnos', pregunta: '¿Sus vendedoras se turnan entre mañana y tarde?', si: 'Trabajan por turnos', no: 'Todas en el mismo horario' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Cada venta se registra con quien la atendió. La comisión de la quincena sale sumada y con el detalle a la vista de las dos partes.' },
        { sol: 'tablero-ventas', para: 'Las ventas por vendedora, día por día. Cada quien sabe cómo va sin esperar a la quincena.' },
        { sol: 'roles-horarios', para: 'Queda registrado quién estuvo en cada turno. Si la venta fue el sábado en la tarde, se sabe quién estaba en piso.', pide: { turnos: true } },
        { sol: 'reporte-diario', para: 'Lo mínimo: cada noche, un mensaje con lo que vendió cada una. La cuenta se va haciendo día a día, no de golpe.' },
      ],
    },

    // ── Clientes ──
    {
      id: 'mercancia-nueva-aviso',
      area: 'clientes',
      titulo: 'Llega mercancía nueva y no sé a quién avisarle',
      senal: 'El aviso se sube a los estados y lo ve quien lo ve. La persona que buscaba justo ese modelo no se entera.',
      frecuente: true,
      matices: [{ id: 'contacto', pregunta: '¿Guarda el número y la talla de quienes le compran?', si: 'Tiene contactos y tallas', no: 'No guarda datos de clientes' }],
      rutas: [
        { sol: 'promos-segmentadas', para: 'Cuando llegan botines del 24, el aviso va solo a quienes calzan del 24. Le llega a quien sí le queda.', pide: { contacto: true } },
        { sol: 'base-clientes', para: 'Una ficha por cliente con su talla, lo que ha comprado y lo que anda buscando. Al surtir, ya se compra pensando en alguien.' },
        { sol: 'reactivacion', para: 'El sistema detecta a quién lleva tres meses sin comprar y prepara el mensaje con lo que acaba de llegar.' },
        { sol: 'tarjeta-lealtad', para: 'Lo mínimo: una tarjeta de sellos en el teléfono. Al registrarse, el cliente deja su número y usted ya tiene a quién avisarle.' },
      ],
    },
    {
      id: 'solo-por-redes',
      area: 'clientes',
      titulo: 'Fuera de mis redes casi nadie sabe que existo',
      senal: 'Quien busca "boutique" o "zapatería" en el mapa no encuentra la tienda, o la encuentra sin horario ni fotos.',
      matices: [{ id: 'foraneos', pregunta: '¿Le compran de otros municipios?', si: 'Vende a otros municipios', no: 'Su clientela es de la ciudad' }],
      rutas: [
        { sol: 'tienda-en-linea', para: 'Quien vive en otro municipio ve el catálogo, paga y recibe por paquetería. No depende de que usted alcance a contestarle.', pide: { foraneos: true } },
        { sol: 'sitio-web', para: 'Una página con las marcas que maneja, fotos de la tienda, cómo apartar y el botón de WhatsApp. Lo que no cabe en una historia.' },
        { sol: 'resenas', para: 'Después de cada compra, una invitación a opinar. Quien duda en pagarle por mensaje ve que otros ya recibieron su pedido.' },
        { sol: 'perfil-google', para: 'Lo primero: que al buscar "tienda de ropa" en el mapa aparezca con fotos, horario y cómo llegar.' },
      ],
    },

    // ── Logística ──
    {
      id: 'entregas-se-juntan',
      area: 'logistica',
      titulo: 'Quedo de entregar y se me juntan las entregas',
      senal: 'Puntos medios, domicilios y paquetería el mismo día. Alguna entrega se olvida, o el cliente no llega.',
      matices: [
        { id: 'paqueteria', pregunta: '¿Envía por paquetería a otras ciudades?', si: 'Envía por paquetería', no: 'Solo entrega en la ciudad' },
        { id: 'planton', pregunta: '¿Le pasa que llega al punto de entrega y no hay nadie?', si: 'Hay plantones en las entregas', no: 'Los clientes sí llegan' },
      ],
      rutas: [
        { sol: 'seguimiento-pedidos', para: 'Cada pedido con su etapa: pagado, empacado, en camino, entregado. De un vistazo se ve qué falta por salir hoy.' },
        { sol: 'rastreo-cliente', para: 'Quien pidió desde otro municipio recibe un enlace con su guía y el avance. Deja de escribir para preguntar si ya salió.', pide: { paqueteria: true } },
        { sol: 'cobro-en-linea', para: 'El pedido se paga con un enlace antes de salir a entregarlo. Quien ya pagó tiene motivo para llegar al punto.', pide: { planton: true } },
        { sol: 'agenda-interna', para: 'Lo mínimo: las entregas del día en una agenda, con hora, lugar y quién va. Dos entregas a la misma hora se notan desde antes.' },
      ],
    },

    // ── Rentabilidad ──
    {
      id: 'mercancia-no-rota',
      area: 'rentabilidad',
      titulo: 'Se me queda mercancía de una temporada a otra',
      senal: 'Ropa de invierno que sigue colgada en mayo. Es dinero parado que ocupa el lugar de lo nuevo.',
      frecuente: true,
      matices: [{ id: 'contacto', pregunta: '¿Tiene forma de escribirles a quienes ya le compraron?', si: 'Tiene contacto de sus clientes', no: 'No guarda contactos' }],
      rutas: [
        { sol: 'tablero-ventas', para: 'Qué modelos se mueven y cuáles llevan seis semanas sin venderse. La rebaja se decide a tiempo, no cuando ya cambió la temporada.' },
        { sol: 'promos-segmentadas', para: 'La liquidación le llega a quien compró esa marca o usa esa talla. No hay que rebajar toda la tienda para mover veinte piezas.', pide: { contacto: true } },
        { sol: 'costeo', para: 'Con el costo real de cada prenda se sabe hasta dónde rebajar sin perder. El descuento deja de ponerse por corazonada.' },
        { sol: 'catalogo-whatsapp', para: 'Lo mínimo: un catálogo de remate con lo que quedó, compartido en sus estados. Lo vendido se marca agotado con un toque.' },
      ],
    },
    {
      id: 'no-se-cuanto-gano',
      area: 'rentabilidad',
      titulo: 'Vendo bien y no sé cuánto le gano a cada prenda',
      senal: 'El precio se pone al doble del costo. Entre flete, comisión de la terminal y descuentos, nadie sabe cuánto queda.',
      matices: [{ id: 'descuentos', pregunta: '¿Da descuento seguido para cerrar la venta?', si: 'Descuentos frecuentes', no: 'Precio fijo casi siempre' }],
      rutas: [
        { sol: 'costeo', para: 'El costo de cada prenda con su flete, su bolsa y la comisión de la terminal. Se ve qué marca deja y cuál solo llena el rack.' },
        { sol: 'punto-de-venta', para: 'Cada descuento queda registrado con quién lo dio. A fin de mes se ve cuánto se fue en "se lo dejo en menos".', pide: { descuentos: true } },
        { sol: 'tablero-ventas', para: 'Lo más vendido junto a lo que más deja. A veces la prenda que más sale es la que menos gana.' },
        { sol: 'reporte-diario', para: 'Lo mínimo: cada noche, cuánto se vendió y cuánto costó esa mercancía. Un número diario para ir entendiendo el mes.' },
      ],
    },
  ],
}
