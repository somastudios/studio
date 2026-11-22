// Farmacia independiente: caducidades y lotes, faltantes, turnos, entregas y, a veces, consultorio anexo.

export default {
  id: 'farmacia',
  familia: 'tiendas',
  nombre: 'Farmacia',
  plural: 'farmacias',
  icono: 'farmacia',
  acento: '#0f6b5f',
  vocab: {
    personal: 'el dependiente',
    empleado: 'el dependiente',
    producto: 'medicamento',
    productos: 'medicamentos',
    lugar: 'mostrador',
  },

  // Para quien presenta, antes de entrar.
  apertura: 'Con tantas farmacias de cadena en la ciudad, ¿qué es lo que hace que sus clientes sigan viniendo con usted?',
  observa: [
    'Si el dependiente va directo al medicamento o lo busca cajón por cajón.',
    'Si hay una libreta de faltantes o bolsitas de apartados junto a la caja.',
    'Si hay consultorio anexo y dónde espera la gente su turno.',
  ],

  // Datos de muestra para vestir las demos. Son ilustrativos.
  muestra: {
    productos: [
      { nombre: 'Paracetamol 500 mg, 10 tabletas', precio: 18, categoria: 'Genéricos' },
      { nombre: 'Ibuprofeno 400 mg, 10 tabletas', precio: 28, categoria: 'Genéricos' },
      { nombre: 'Loratadina 10 mg, 10 tabletas', precio: 25, categoria: 'Genéricos' },
      { nombre: 'Omeprazol 20 mg, 14 cápsulas', precio: 36, categoria: 'Genéricos' },
      { nombre: 'Suero oral 625 ml', precio: 24, categoria: 'Mostrador' },
      { nombre: 'Vitamina C efervescente, 10 tabletas', precio: 85, categoria: 'Mostrador' },
      { nombre: 'Antiácido masticable, 12 tabletas', precio: 48, categoria: 'Mostrador' },
      { nombre: 'Alcohol etílico 500 ml', precio: 42, categoria: 'Curación' },
      { nombre: 'Gasas estériles, 10 piezas', precio: 22, categoria: 'Curación' },
      { nombre: 'Venditas adhesivas, caja con 30', precio: 35, categoria: 'Curación' },
      { nombre: 'Termómetro digital', precio: 89, categoria: 'Curación' },
      { nombre: 'Pañales etapa 4, 40 piezas', precio: 265, categoria: 'Bebé y cuidado' },
      { nombre: 'Toallitas húmedas, 80 piezas', precio: 38, categoria: 'Bebé y cuidado' },
      { nombre: 'Protector solar FPS 50', precio: 215, categoria: 'Bebé y cuidado' },
    ],
    servicios: [
      { nombre: 'Entrega a domicilio', precio: 25, minutos: 30 },
      { nombre: 'Apartado para pasar a recoger', precio: 0, minutos: 10 },
      { nombre: 'Medicamento por encargo', precio: 0, minutos: 15 },
      { nombre: 'Toma de presión', precio: 20, minutos: 10 },
      { nombre: 'Medición de glucosa', precio: 40, minutos: 10 },
      { nombre: 'Consulta en consultorio anexo', precio: 60, minutos: 20 },
    ],
    personal: ['Rocío', 'Julián', 'Alma', 'Sergio'],
    clientes: ['Doña Esperanza', 'Sr. Figueroa', 'Karla Chávez', 'Don Aurelio', 'Mtra. Preciado', 'Familia Larios'],
    insumos: [
      { nombre: 'Paracetamol 500 mg', unidad: 'cajas', hay: 34, minimo: 40 },
      { nombre: 'Suero oral 625 ml', unidad: 'pzas', hay: 60, minimo: 36 },
      { nombre: 'Omeprazol 20 mg', unidad: 'cajas', hay: 22, minimo: 20 },
      { nombre: 'Loratadina 10 mg', unidad: 'cajas', hay: 9, minimo: 15 },
      { nombre: 'Alcohol etílico 500 ml', unidad: 'pzas', hay: 18, minimo: 12 },
      { nombre: 'Pañales etapa 4', unidad: 'paq', hay: 7, minimo: 6 },
      { nombre: 'Cubrebocas, caja con 50', unidad: 'cajas', hay: 14, minimo: 10 },
      { nombre: 'Gasas estériles', unidad: 'paq', hay: 45, minimo: 30 },
    ],
  },

  problemas: [
    // ── Clientes ──
    {
      id: 'tratamiento-no-vuelve',
      area: 'clientes',
      titulo: 'Quien compra cada mes lo mismo no siempre vuelve',
      senal: 'El cliente de tratamiento llega, un día no hay lo suyo, y desde entonces se surte en la cadena.',
      frecuente: true,
      matices: [{ id: 'celular', pregunta: '¿Sus clientes de cada mes le dejarían su celular para avisarles?', si: 'Aceptan que se les avise', no: 'Prefieren no dejar datos' }],
      rutas: [
        { sol: 'base-clientes', para: 'Cada cliente de tratamiento con su ficha: qué se lleva y cada cuándo. El pedido al mayorista ya cuenta con sus cajas.' },
        { sol: 'recordatorios', para: 'Unos días antes de que se le termine la caja, le llega un mensaje: "¿se lo apartamos?". Solo a quien pidió el aviso.', pide: { celular: true } },
        { sol: 'tarjeta-lealtad', para: 'Cada surtido suma un sello; al sexto, un descuento. Una razón para no cambiar de farmacia, sin dar más datos que un código.' },
        { sol: 'inventario-alertas', para: 'Un mínimo más alto para lo que sus clientes de cada mes se llevan. Que no sea ese el medicamento que falta.' },
      ],
    },
    {
      id: 'creen-que-la-cadena',
      area: 'clientes',
      titulo: 'La gente cree que en la cadena todo sale más barato',
      senal: 'Entran, preguntan el precio y se van a comparar. Muchos ni preguntan: pasan de largo.',
      frecuente: true,
      matices: [{ id: 'precios', pregunta: '¿En genéricos sus precios compiten con los de la cadena?', si: 'Compite en genéricos', no: 'La cadena le gana en precio' }],
      rutas: [
        { sol: 'tarjeta-lealtad', para: 'La cadena tiene monedero. Usted puede tener el suyo: sellos en el teléfono que se vuelven descuento en la siguiente compra.' },
        { sol: 'menu-digital', para: 'Sus precios de genéricos a la vista, en un código en la vitrina y en un enlace. Quien compara, compara con el dato.', pide: { precios: true } },
        { sol: 'resenas', para: 'Quien fue bien atendido recibe una invitación a opinar. La atención de mostrador, que es lo suyo, empieza a verse.' },
        { sol: 'perfil-google', para: 'Lo primero: que al buscar "farmacia abierta" aparezca con horario real, teléfono y si hay entrega a domicilio.' },
      ],
    },

    // ── Atención ──
    {
      id: 'cual-es-el-generico',
      area: 'atencion',
      titulo: 'Me piden "en genérico" y solo yo sé cuál es el mismo',
      senal: 'El dependiente nuevo busca caja por caja o le pregunta al de más años. El cliente espera o se va.',
      matices: [
        { id: 'sistema', pregunta: '¿Su sistema actual deja buscar por sustancia?', si: 'Busca por sustancia', no: 'Busca por nombre o de memoria' },
        { id: 'rota', pregunta: '¿Le cambia seguido el personal de mostrador?', si: 'Rota mucho el personal', no: 'El equipo es estable' },
      ],
      rutas: [
        { sol: 'punto-de-venta', para: 'Se busca por sustancia y salen todas las presentaciones con precio y existencia. El sistema muestra; no recomienda.', pide: { sistema: false } },
        { sol: 'inventario-escaner', para: 'Se escanea la caja que trae el cliente y aparece en qué cajón está y qué otras presentaciones hay de la misma sustancia.' },
        { sol: 'menu-digital', para: 'El catálogo en el celular del dependiente, ordenado por sustancia. El nuevo responde desde su primera semana.', pide: { rota: true } },
        { sol: 'proceso-claro', para: 'Acomodar el anaquel con un solo criterio, por sustancia o alfabético, y rotularlo. Hoy cada turno acomoda a su modo.' },
      ],
    },
    {
      id: 'espera-del-consultorio',
      area: 'atencion',
      titulo: 'Los pacientes del consultorio esperan en la banqueta',
      senal: 'Se anotan en una hoja pegada a la puerta. Nadie sabe cuánto falta y algunos se van antes de pasar.',
      matices: [{ id: 'llegada', pregunta: '¿El médico atiende por orden de llegada?', si: 'Por orden de llegada', no: 'Atiende con cita' }],
      rutas: [
        { sol: 'turnos-virtuales', para: 'El paciente toma su turno desde el teléfono y espera en su casa o en su coche. Ve cuántos faltan antes de salir.', pide: { llegada: true } },
        { sol: 'agenda-en-linea', para: 'Quien prefiere hora fija la aparta desde su celular, también de noche. El médico llega sabiendo cuántos tiene.', pide: { llegada: false } },
        { sol: 'respuesta-automatica', para: '"¿Hasta qué hora está el doctor?" y "¿cuánto cuesta la consulta?" se contestan solos. El mostrador deja de ser recepción.' },
        { sol: 'pantalla-turnos', para: 'Los turnos en una pantalla junto al mostrador, en vez de la hoja en la puerta. Todos ven el orden.' },
      ],
    },

    // ── Organización ──
    {
      id: 'relevo-de-turno',
      area: 'organizacion',
      titulo: 'Lo que promete un turno, el siguiente no lo sabe',
      senal: 'Un medicamento apartado, un encargo al mayorista, un cambio pendiente: se dice de palabra y se pierde en el relevo.',
      frecuente: true,
      matices: [{ id: 'coinciden', pregunta: '¿Los turnos coinciden unos minutos al relevarse?', si: 'Los turnos se ven al relevo', no: 'No coinciden al relevo' }],
      rutas: [
        { sol: 'bitacora-turno', para: 'Apartados, encargos y lo que viene en el pedido del mayorista quedan escritos. Quien entra a las tres lo lee antes de atender.' },
        { sol: 'ordenes-trabajo', para: 'Cada apartado con su nota: de quién es, qué es y hasta cuándo se guarda. Ya no es una bolsita con un papel engrapado.' },
        { sol: 'roles-horarios', para: 'Quién cubre cada turno y quién el domingo, publicado para todos. El relevo incluye diez minutos en que los dos coinciden.', pide: { coinciden: false } },
        { sol: 'checklist-turnos', para: 'Una lista de entrega de turno: caja contada, apartados revisados, refrigerador con su temperatura anotada.' },
      ],
    },
    {
      id: 'registros-de-salubridad',
      area: 'organizacion',
      titulo: 'Los registros que pide Salubridad se llenan a la carrera',
      senal: 'La temperatura del refrigerador, la limpieza y lo caducado se anotan cuando alguien se acuerda.',
      matices: [{ id: 'responsable', pregunta: '¿Hay una persona encargada de esos registros?', si: 'Hay encargado de registros', no: 'Los llena quien se acuerde' }],
      rutas: [
        { sol: 'formatos-digitales', para: 'Cada registro se llena y se firma en pantalla, con fecha y hora. El día de la visita se encuentran en un minuto.' },
        { sol: 'caducidades', para: 'Lo vencido se separa y queda registrado con su lote y su fecha. Deja de aparecer en el anaquel por descuido.' },
        { sol: 'roles-horarios', para: 'Cada registro tiene responsable y día. Quién anota la temperatura en cada turno queda en el horario, a la vista de todos.', pide: { responsable: false } },
        { sol: 'checklist-turnos', para: 'Anotar la temperatura al abrir y al cerrar es un paso de la lista. Ordena el registro; no sustituye a su responsable sanitario.' },
      ],
    },

    // ── Inventarios ──
    {
      id: 'se-vence-en-el-anaquel',
      area: 'inventarios',
      titulo: 'Se me vence el medicamento en el anaquel',
      senal: 'Cajas que caducan al fondo del cajón. Cuando alguien las ve, ya pasó el plazo para devolverlas.',
      frecuente: true,
      matices: [
        { id: 'devolucion', pregunta: '¿Su mayorista le acepta devolver lo próximo a caducar?', si: 'Hay devolución con plazo', no: 'Lo caducado es pérdida' },
        { id: 'lotes', pregunta: '¿Hoy registra el lote y la fecha al recibir?', si: 'Registra lote y fecha', no: 'Solo acomoda lo que llega' },
      ],
      rutas: [
        { sol: 'caducidades', para: 'Cada lote con su fecha. El aviso llega con meses de margen: a tiempo para devolverlo al mayorista o para venderlo primero.' },
        { sol: 'inventario-escaner', para: 'Al recibir el pedido se escanea la caja y se captura lote y caducidad. Si llegó con fecha corta, se nota antes de acomodarla.', pide: { lotes: false } },
        { sol: 'merma', para: 'Lo que caduca se anota con su costo y su laboratorio. A fin de año se ve de qué conviene pedir menos.', pide: { devolucion: false } },
        { sol: 'proceso-claro', para: 'Una regla para todos los turnos: lo nuevo se acomoda atrás y lo de fecha más corta sale primero.' },
      ],
    },
    {
      id: 'no-hay-y-se-van',
      area: 'inventarios',
      titulo: 'Me piden algo, no lo tengo y se van a la cadena',
      senal: '"Se lo consigo para la tarde", pero nadie lo anota. El mismo faltante se repite la semana siguiente.',
      frecuente: true,
      matices: [{ id: 'libreta', pregunta: '¿Anotan en algún lado lo que piden y no hay?', si: 'Llevan lista de faltantes', no: 'Los faltantes no se anotan' }],
      rutas: [
        { sol: 'compras-sugeridas', para: 'El pedido al mayorista se arma con lo vendido y con lo que se negó. Lo que pidieron tres veces esta semana ya viene en la lista.' },
        { sol: 'inventario-alertas', para: 'Cada medicamento con su mínimo. Cuando quedan dos cajas del que más sale, el aviso llega antes del pedido de la tarde.' },
        { sol: 'ordenes-trabajo', para: 'El "se lo consigo" queda como encargo con nombre y teléfono. Cuando llega del mayorista, el cliente recibe su aviso.' },
        { sol: 'bitacora-turno', para: 'Lo mínimo: la lista de faltantes en el celular de todos los turnos, no en una libreta que nadie relee.', pide: { libreta: false } },
      ],
    },

    // ── Administración ──
    {
      id: 'caja-entre-turnos',
      area: 'administracion',
      titulo: 'La caja no cuadra y no se sabe en qué turno fue',
      senal: 'Faltantes chicos que se repiten. Cada turno dice que así recibió la caja.',
      matices: [{ id: 'comparten', pregunta: '¿Los turnos comparten el mismo cajón y el mismo fondo?', si: 'Comparten cajón', no: 'Cada turno con su fondo' }],
      rutas: [
        { sol: 'corte-de-caja', para: 'Cada turno cierra con su corte: lo vendido contra lo contado. El siguiente recibe la caja con un número, no con "así estaba".' },
        { sol: 'punto-de-venta', para: 'Cada venta queda con la clave de quien la cobró, también las recargas y servicios como la toma de presión.' },
        { sol: 'tablero-ventas', para: 'Usted ve desde su teléfono lo que vendió el turno de la noche, hora por hora, sin esperar a la mañana.' },
        { sol: 'bitacora-turno', para: 'Quien sale anota con cuánto entrega la caja y quien entra lo confirma. Queda escrito, no de palabra.', pide: { comparten: true } },
      ],
    },
    {
      id: 'faltan-cajas-caras',
      area: 'administracion',
      titulo: 'Se pierden cajas chicas y caras y no sé cuándo',
      senal: 'En el inventario de fin de año faltan productos de alto precio. Nadie sabe si fue un error de captura o alguien.',
      matices: [{ id: 'conteo', pregunta: '¿Hace conteos además del inventario de fin de año?', si: 'Cuenta durante el año', no: 'Solo inventario anual' }],
      rutas: [
        { sol: 'inventario-escaner', para: 'Lo que entra y lo que sale se registra al momento. La diferencia aparece en la semana en que ocurrió, no en diciembre.' },
        { sol: 'punto-de-venta', para: 'Nada sale del mostrador sin venta registrada. Si falta una caja, hay un registro contra el cual buscarla.' },
        { sol: 'merma', para: 'Lo que se rompe, caduca o se entrega de más se anota con su motivo. Lo que queda sin explicar es lo que hay que revisar.' },
        { sol: 'checklist-turnos', para: 'Los veinte productos más caros se cuentan en cada relevo. Si falta uno, se sabe en qué turno.', pide: { conteo: false } },
      ],
    },

    // ── Logística ──
    {
      id: 'entregas-a-domicilio',
      area: 'logistica',
      titulo: 'Los pedidos a domicilio llegan por teléfono y se enredan',
      senal: 'Se anota en un papel, se entiende mal la dirección o falta un producto. El repartidor regresa por el cambio.',
      frecuente: true,
      matices: [
        { id: 'repartidor', pregunta: '¿Tiene repartidor propio?', si: 'Repartidor propio', no: 'Entrega quien esté libre' },
        { id: 'mayores', pregunta: '¿Muchos de sus pedidos son de personas mayores?', si: 'Piden personas mayores', no: 'Piden clientes de todo tipo' },
      ],
      rutas: [
        { sol: 'whatsapp-pedidos', para: 'El cliente manda la foto de la caja y su dirección con una guía. Se sabe con cuánto paga y el repartidor ya sale con el cambio.' },
        { sol: 'seguimiento-pedidos', para: 'Cada pedido con su etapa: surtido, en camino, entregado. Si llaman a preguntar, cualquiera en el mostrador sabe en qué va.' },
        { sol: 'rastreo-cliente', para: 'Quien pidió ve en su celular que el repartidor ya va en camino. No tiene que volver a llamar para saber.', pide: { repartidor: true } },
        { sol: 'base-clientes', para: 'La dirección y las referencias de quien pide seguido quedan guardadas. Don Aurelio ya no las dicta cada vez.', pide: { mayores: true } },
      ],
    },

    // ── Comunicación ──
    {
      id: 'preguntan-si-hay',
      area: 'comunicacion',
      titulo: 'Todo el día preguntan por WhatsApp si hay y a cómo',
      senal: 'Mensajes con la foto de una caja o de una receta. Se contestan cuando el mostrador se vacía, a veces horas después.',
      frecuente: true,
      matices: [{ id: 'apartan', pregunta: '¿Quien pregunta suele pedir que se lo aparten?', si: 'Preguntan para apartar', no: 'Preguntan para comparar' }],
      rutas: [
        { sol: 'respuesta-automatica', para: 'Horario, ubicación, si hay entrega y si está el médico se contesta solo. "¿Tiene este?" pasa a una persona.' },
        { sol: 'pedidos-mostrador', para: 'Quien ya sabe lo que quiere lo aparta desde su celular y pasa por él. Llega, paga y se va.', pide: { apartan: true } },
        { sol: 'catalogo-whatsapp', para: 'Lo de mostrador y los genéricos más pedidos, con precio, en un enlace. Quien quiere comparar ya tiene el dato.', pide: { apartan: false } },
        { sol: 'respuestas-rapidas', para: 'Ya escrito y a un toque: "sí lo tenemos, cuesta tanto, se lo guardamos hasta las ocho".' },
      ],
    },

    // ── Rentabilidad ──
    {
      id: 'marca-deja-poco',
      area: 'rentabilidad',
      titulo: 'Vendo mucho de marca y casi no me deja',
      senal: 'La venta del día se ve bien, pero el mayorista se lleva casi todo. No está claro qué líneas sostienen la farmacia.',
      matices: [{ id: 'margen', pregunta: '¿Sabe cuánto le deja cada línea: marca, genérico, perfumería?', si: 'Conoce el margen por línea', no: 'Solo ve la venta total' }],
      rutas: [
        { sol: 'costeo', para: 'El margen de cada producto junto a su precio. Se ve cuánto deja el genérico frente a la marca que más se vende.', pide: { margen: false } },
        { sol: 'tablero-ventas', para: 'La venta del día separada por línea: marca, genérico, curación, perfumería. Lo que más se vende junto a lo que más deja.' },
        { sol: 'merma', para: 'Lo caducado y lo perdido también se comen el margen. Con la cifra enfrente se sabe si el problema es el precio o la pérdida.' },
        { sol: 'reporte-diario', para: 'Cada noche, un mensaje con la venta y lo que costó lo vendido. Un número para saber si el día dejó.' },
      ],
    },
    {
      id: 'oferta-del-mayorista',
      area: 'rentabilidad',
      titulo: 'Compro de más por la oferta del mayorista y no sale',
      senal: 'Por el descuento se piden doce cajas donde se venden tres. El dinero queda en el anaquel hasta que caduca.',
      matices: [{ id: 'historial', pregunta: '¿Puede ver cuánto vendió de un producto en los últimos meses?', si: 'Tiene historial de ventas', no: 'Compra por experiencia' }],
      rutas: [
        { sol: 'compras-sugeridas', para: 'Frente a la oferta, usted ve cuántas cajas vende al mes. Si son tres, doce son cuatro meses de dinero detenido.' },
        { sol: 'tablero-ventas', para: 'Qué se mueve cada semana y qué lleva tres meses sin venderse. Lo detenido deja de esconderse al fondo del cajón.', pide: { historial: false } },
        { sol: 'promos-segmentadas', para: 'Lo de mostrador que se quedó, como vitaminas o protector solar, se ofrece a quienes ya lo han comprado.' },
        { sol: 'caducidades', para: 'Para empezar: saber qué de lo detenido vence primero, para devolverlo o moverlo mientras hay tiempo.' },
      ],
    },
  ],
}
