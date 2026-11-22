// Taquerías, fondas, loncherías, puestos establecidos y pollos asados:
// comida rápida de mostrador o de pocas mesas, donde quien prepara casi siempre también cobra.

export default {
  id: 'taqueria',
  familia: 'comida',
  nombre: 'Taquería o fonda',
  plural: 'taquerías y fondas',
  icono: 'taqueria',
  acento: '#2f6b3c',
  vocab: {
    personal: 'quien atiende',
    empleado: 'quien atiende',
    producto: 'platillo',
    productos: 'platillos',
    cita: 'orden',
    citas: 'órdenes',
  },

  // Para quien presenta, antes de entrar.
  apertura: 'A la hora fuerte se ve que se les junta la gente. ¿Cómo llevan la cuenta de lo que pide cada quien?',
  observa: [
    'Cómo se cobra: si hay nota por cliente o se pregunta "¿cuántos fueron?".',
    'Si quien prepara también cobra y contesta el teléfono.',
    'Si los precios están en una lona con parches o números encimados.',
  ],

  // Datos de muestra para vestir las demos. Son ilustrativos.
  muestra: {
    productos: [
      { nombre: 'Taco de pastor', precio: 18, categoria: 'Tacos' },
      { nombre: 'Taco de asada', precio: 24, categoria: 'Tacos' },
      { nombre: 'Taco de chorizo', precio: 18, categoria: 'Tacos' },
      { nombre: 'Taco de tripa', precio: 26, categoria: 'Tacos' },
      { nombre: 'Gringa de pastor', precio: 68, categoria: 'Especialidades' },
      { nombre: 'Quesadilla con carne', precio: 62, categoria: 'Especialidades' },
      { nombre: 'Volcán de asada', precio: 36, categoria: 'Especialidades' },
      { nombre: 'Torta de pastor', precio: 70, categoria: 'Especialidades' },
      { nombre: 'Comida corrida', precio: 95, categoria: 'Comida del día' },
      { nombre: 'Chilaquiles con pollo', precio: 85, categoria: 'Comida del día' },
      { nombre: 'Pollo asado entero', precio: 230, categoria: 'Comida del día' },
      { nombre: 'Agua de horchata', precio: 30, categoria: 'Bebidas' },
      { nombre: 'Refresco', precio: 28, categoria: 'Bebidas' },
      { nombre: 'Agua mineral preparada', precio: 40, categoria: 'Bebidas' },
    ],
    servicios: [
      { nombre: 'Taquiza para 30 personas', precio: 4200, minutos: 180 },
      { nombre: 'Taquiza para 50 personas', precio: 6500, minutos: 240 },
      { nombre: 'Pollo asado apartado', precio: 230, minutos: 15 },
      { nombre: 'Pedido grande para recoger', precio: 0, minutos: 30 },
      { nombre: 'Diez comidas corridas para llevar', precio: 950, minutos: 45 },
    ],
    personal: ['Beto', 'Yolanda', 'Memo', 'Brenda'],
    clientes: ['Don Chema', 'Sra. Lourdes', 'Taller Vargas', 'Karina Robles', 'Profe Arturo', 'Familia Chávez'],
    insumos: [
      { nombre: 'Carne al pastor', unidad: 'kg', hay: 9, minimo: 12 },
      { nombre: 'Carne para asar', unidad: 'kg', hay: 8, minimo: 6 },
      { nombre: 'Tortilla', unidad: 'kg', hay: 18, minimo: 15 },
      { nombre: 'Carbón', unidad: 'bolsas', hay: 3, minimo: 2 },
      { nombre: 'Limón', unidad: 'kg', hay: 6, minimo: 4 },
      { nombre: 'Cilantro', unidad: 'manojos', hay: 8, minimo: 6 },
      { nombre: 'Platos desechables', unidad: 'paquetes', hay: 2, minimo: 4 },
      { nombre: 'Piña', unidad: 'pzas', hay: 4, minimo: 3 },
    ],
  },

  problemas: [
    // ── Atención ──
    {
      id: 'fila-hora-fuerte',
      area: 'atencion',
      titulo: 'Se me va la gente por la fila',
      senal: 'A la hora fuerte, quien ve la fila o el local lleno se sigue de largo.',
      frecuente: true,
      matices: [
        { id: 'antes', pregunta: '¿Sus clientes pedirían desde el celular antes de llegar?', si: 'Pedirían antes de llegar', no: 'Piden hasta que llegan' },
        { id: 'solo', pregunta: '¿En la hora fuerte una misma persona cobra y despacha?', si: 'Una persona cobra y despacha', no: 'Las tareas están repartidas' },
      ],
      rutas: [
        { sol: 'pedidos-mostrador', para: 'Quien quiere diez de pastor para llevar los pide desde su casa y pasa por ellos. Ya no ocupa lugar en la fila.', pide: { antes: true } },
        { sol: 'pantalla-cocina', para: 'Las órdenes aparecen frente a la plancha, en el orden en que entraron. El taquero no pregunta de quién eran los de asada.' },
        { sol: 'punto-de-venta', para: 'Si una sola persona cobra y despacha, que cobrar sean tres toques. El tiempo que se gana se va a la plancha.', pide: { solo: true } },
        { sol: 'pantalla-turnos', para: 'Lo mínimo: cada orden con su número a la vista. La gente ve que avanza y espera con más calma.' },
      ],
    },

    // ── Organización ──
    {
      id: 'ordenes-a-gritos',
      area: 'organizacion',
      titulo: 'Las órdenes van a gritos y salen cambiadas',
      senal: 'Con todo, sin cebolla, para llevar: lo que se gritó hacia la plancha no siempre es lo que sale.',
      matices: [{ id: 'papel', pregunta: '¿Hoy apuntan las órdenes en papel?', si: 'Apuntan en papel', no: 'Todo es de palabra' }],
      rutas: [
        { sol: 'pantalla-cocina', para: 'La orden queda escrita frente a la plancha: tres de pastor sin piña, dos de asada con todo. Nadie tiene que acordarse.' },
        { sol: 'comandero', para: 'Quien toma la orden marca "sin cebolla" o "para llevar" con un toque. Llega igual a quien prepara.' },
        { sol: 'aviso-listo', para: 'Cuando la orden está lista, quien la entrega se entera. El plato ya no sale a buscar dueño entre las mesas.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: una nota por orden y un solo lugar donde se cuelga. Antes de cualquier pantalla, a veces eso basta.', pide: { papel: false } },
      ],
    },

    // ── Inventarios ──
    {
      id: 'carne-sobra-o-falta',
      area: 'inventarios',
      titulo: 'O se me acaba la carne o me sobra',
      senal: 'Un día el trompo se termina a las diez. Otro día sobran kilos que mañana ya no se venden igual.',
      frecuente: true,
      matices: [{ id: 'registro', pregunta: '¿Anota cuánto vende de cada carne al día?', si: 'Anota lo vendido', no: 'Calcula por experiencia' }],
      rutas: [
        { sol: 'compras-sugeridas', para: 'Con lo vendido cada día de la semana, la lista dice cuánta carne marinar para el viernes y cuánta para el lunes.', pide: { registro: true } },
        { sol: 'inventario-alertas', para: 'Pastor, asada y tortilla con su mínimo. El aviso llega cuando todavía hay tiempo de mandar por más.' },
        { sol: 'merma', para: 'Lo que sobra al cierre se anota por tipo de carne. En un mes se ve qué día se prepara siempre de más.' },
        { sol: 'reporte-diario', para: 'Lo mínimo: cada noche, un mensaje con lo vendido por tipo de carne. Con ese dato se decide cuánto preparar mañana.' },
      ],
    },
    {
      id: 'falta-gas-o-tortilla',
      area: 'inventarios',
      titulo: 'Se acaba el gas o la tortilla a media venta',
      senal: 'No es la carne: es el gas, el carbón, la tortilla o el desechable lo que falta cuando hay más gente.',
      matices: [{ id: 'misma', pregunta: '¿La misma persona cierra en la noche y abre al día siguiente?', si: 'Abre y cierra la misma persona', no: 'Abre uno y cierra otro' }],
      rutas: [
        { sol: 'inventario-alertas', para: 'El tanque de gas, el carbón y el desechable con su mínimo. Cuando quedan dos paquetes de platos, llega el aviso.' },
        { sol: 'compras-sugeridas', para: 'La lista de la semana se arma con lo que se gastó: tantos kilos de tortilla, tantas bolsas de carbón, tantos platos.' },
        { sol: 'checklist-turnos', para: 'Antes de abrir se revisa gas, carbón, tortilla, servilletas y cambio. Lo que falta se resuelve con la cortina abajo.' },
        { sol: 'bitacora-turno', para: 'Lo mínimo: quien cierra deja anotado lo que se acabó. Quien abre lo ve antes de ir por el mandado.', pide: { misma: false } },
      ],
    },

    // ── Administración ──
    {
      id: 'venta-y-gasto-revueltos',
      area: 'administracion',
      titulo: 'La venta y el gasto salen del mismo cajón',
      senal: 'Del cajón se paga la tortilla, el gas y el hielo. Al cierre ya no se sabe cuánto se vendió.',
      matices: [{ id: 'otro', pregunta: '¿Cobra alguien más cuando usted no está?', si: 'También cobra alguien más', no: 'Solo cobra el dueño' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Cada venta queda registrada al cobrarse. Lo que se sacó para el gas se anota como salida, no se resta de memoria.' },
        { sol: 'corte-de-caja', para: 'Al cerrar: tanto se vendió, tanto se sacó para compras, tanto debe haber. Se cuenta y se compara.' },
        { sol: 'tablero-ventas', para: 'Si otra persona cobra, usted ve la venta del día en su teléfono mientras va al mercado o descansa.', pide: { otro: true } },
        { sol: 'checklist-turnos', para: 'Lo mínimo: un cierre con tres pasos fijos. Contar, anotar cada salida con su motivo y guardar la nota.' },
      ],
    },
    {
      id: 'transferencia-sin-confirmar',
      area: 'administracion',
      titulo: 'Me enseñan la transferencia y no sé si cayó',
      senal: 'Cada vez más gente paga por transferencia. La captura se revisa a las prisas y el banco, hasta la noche.',
      frecuente: true,
      matices: [{ id: 'celular', pregunta: '¿Los avisos del banco llegan a un celular que se queda en el local?', si: 'Hay celular del negocio', no: 'Los avisos llegan al dueño' }],
      rutas: [
        { sol: 'cobro-en-linea', para: 'El cliente paga con un código y la confirmación le llega al negocio, no a él. Ya no hay que creerle a una captura.' },
        { sol: 'punto-de-venta', para: 'Cada cobro se marca como efectivo, tarjeta o transferencia. Al cierre se sabe cuánto buscar en el banco y cuánto en el cajón.' },
        { sol: 'corte-de-caja', para: 'El corte separa lo que entró en efectivo de lo que entró al banco. Las transferencias se palomean contra una lista.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: una regla para todos. La transferencia se confirma en el celular del negocio antes de entregar la orden.', pide: { celular: true } },
      ],
    },
    {
      id: 'fiado-de-la-semana',
      area: 'administracion',
      titulo: 'Fío la comida de la semana y cobro el sábado',
      senal: 'Trabajadores y vecinos comen fiado. La cuenta va en una libreta y el sábado no siempre coincide con lo que recuerdan.',
      matices: [{ id: 'empresa', pregunta: '¿Algún taller o empresa le paga la comida de sus trabajadores?', si: 'Paga una empresa o taller', no: 'Cada quien paga lo suyo' }],
      rutas: [
        { sol: 'fiado', para: 'Cada comida fiada queda en la cuenta de la persona, con su fecha. El sábado se le enseña la lista y no hay discusión.' },
        { sol: 'control-mensualidades', para: 'Para quien come diario: paga la semana por adelantado, y se ve quién ya la cubrió y a quién se le venció.' },
        { sol: 'cobro-en-linea', para: 'Al taller se le manda el total de la semana con un enlace de pago. Ya no hay que dar la vuelta a cobrar.', pide: { empresa: true } },
        { sol: 'reporte-diario', para: 'Lo mínimo: en el resumen de cada noche, cuánto se fio hoy y quién ya debe más de una semana.' },
      ],
    },

    // ── Clientes ──
    {
      id: 'dias-flojos',
      area: 'clientes',
      titulo: 'Hay días de la semana que casi no cae gente',
      senal: 'El fin de semana no se dan abasto. El lunes y el martes se prende la plancha para unos cuantos.',
      matices: [{ id: 'contacto', pregunta: '¿Guarda el número de quienes le piden a domicilio?', si: 'Tiene números de clientes', no: 'No guarda contactos' }],
      rutas: [
        { sol: 'promos-segmentadas', para: 'La promoción del martes le llega a quien ya pidió a domicilio. No a desconocidos: a quien ya probó sus tacos.', pide: { contacto: true } },
        { sol: 'reactivacion', para: 'A quien pedía cada semana y lleva un mes sin pedir, el sistema le prepara el mensaje.', pide: { contacto: true } },
        { sol: 'tarjeta-lealtad', para: 'Los sellos de lunes y martes valen doble. El cliente del sábado tiene un motivo para caer entre semana.' },
        { sol: 'perfil-google', para: 'Lo mínimo: que quien busca dónde cenar un martes lo encuentre abierto, con horario real y fotos del trompo.' },
      ],
    },
    {
      id: 'taquizas-sin-seguimiento',
      area: 'clientes',
      titulo: 'Me piden precio para una taquiza y ahí queda',
      senal: 'Preguntan por taquiza o comida para un evento, se les da un precio de palabra y nadie vuelve a escribir.',
      matices: [{ id: 'seguido', pregunta: '¿Le piden taquizas o pedidos grandes todos los meses?', si: 'Pedidos grandes cada mes', no: 'Solo de vez en cuando' }],
      rutas: [
        { sol: 'seguimiento-prospectos', para: 'Quien preguntó queda anotado con la fecha de su evento. Una semana antes llega el aviso para retomarlo.', pide: { seguido: true } },
        { sol: 'cotizador', para: 'Taquiza para cincuenta con tres carnes, salsas y desechable: la cotización sale en un minuto y con el mismo precio siempre.' },
        { sol: 'anticipo-reserva', para: 'La fecha se aparta con anticipo. La carne del evento se compra con dinero del cliente, no con el de la caja.' },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: el mensaje con paquetes y precios ya escrito. Se manda igual a todos, con un toque.' },
      ],
    },

    // ── Comunicación ──
    {
      id: 'pedidos-por-mensaje',
      area: 'comunicacion',
      titulo: 'Contestar pedidos me quita de la plancha',
      senal: 'El teléfono suena cuando hay más gente. O se atiende el mensaje o se atiende al que está enfrente.',
      frecuente: true,
      matices: [{ id: 'aparte', pregunta: '¿En la hora fuerte hay alguien que solo atienda el teléfono?', si: 'Alguien atiende el teléfono', no: 'Contesta quien cocina o cobra' }],
      rutas: [
        { sol: 'pedidos-mostrador', para: 'El pedido se hace en un enlace, con hora para recoger, y entra solo a la fila de la plancha. Nadie lo dicta.' },
        { sol: 'whatsapp-pedidos', para: 'El cliente sigue una guía: cuántos, de qué, con qué y a dónde. El pedido llega completo sin que nadie suelte la espátula.', pide: { aparte: false } },
        { sol: 'respuesta-automatica', para: 'Horario, hasta dónde reparten y cuánto tarda: se contesta solo. A una persona le llega nada más el pedido.' },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: quien contesta tiene listos el menú, los precios y la pregunta de la dirección. El pedido se cierra en tres mensajes.', pide: { aparte: true } },
      ],
    },
    {
      id: 'que-hay-hoy',
      area: 'comunicacion',
      titulo: 'Todos los días preguntan qué hay de comer',
      senal: 'El menú cambia diario. Se manda uno por uno o se contesta la misma pregunta toda la mañana.',
      matices: [{ id: 'planta', pregunta: '¿Tiene clientes de planta que piden casi a diario?', si: 'Tiene clientes de planta', no: 'La clientela cambia' }],
      rutas: [
        { sol: 'promos-segmentadas', para: 'A las once, el menú de hoy les llega a sus clientes de planta. Piden antes de que empiece el apuro.', pide: { planta: true } },
        { sol: 'catalogo-whatsapp', para: 'El menú de hoy en un enlace: el cliente elige sopa y guisado, y el pedido llega armado a su WhatsApp.' },
        { sol: 'respuesta-automatica', para: 'Quien escribe "¿qué hay hoy?" recibe el menú al instante, aunque usted esté en la estufa.' },
        { sol: 'menu-digital', para: 'Lo mínimo: el menú del día en un enlace que no cambia. Usted lo actualiza en la mañana y lo comparte en su estado.' },
      ],
    },

    // ── Logística ──
    {
      id: 'reparto-enredado',
      area: 'logistica',
      titulo: 'El reparto a domicilio se me enreda',
      senal: 'Pedidos que salen tarde, direcciones mal apuntadas y un repartidor que no contesta por dónde va.',
      matices: [{ id: 'propio', pregunta: '¿El repartidor trabaja para usted?', si: 'Repartidor propio', no: 'Reparte un conocido o una app' }],
      rutas: [
        { sol: 'seguimiento-pedidos', para: 'Cada pedido a domicilio con su etapa: en plancha, empacado, en camino. Se ve cuál lleva más de media hora.' },
        { sol: 'rastreo-cliente', para: 'El cliente ve cuándo salió su pedido. Deja de marcar para preguntar si ya mero llega.', pide: { propio: true } },
        { sol: 'cobro-en-linea', para: 'El pedido sale ya pagado con un enlace. El repartidor no carga cambio ni regresa con cuentas pendientes.' },
        { sol: 'whatsapp-pedidos', para: 'Lo mínimo: la dirección y las referencias se piden siempre igual. El repartidor ya no llama para preguntar por dónde.' },
      ],
    },

    // ── Rentabilidad ──
    {
      id: 'cuantos-fueron',
      area: 'rentabilidad',
      titulo: 'Al cobrar, les pregunto cuántos fueron',
      senal: 'La cuenta se hace con lo que el cliente recuerda. En la hora fuerte se van tacos sin cobrar.',
      frecuente: true,
      matices: [{ id: 'antes', pregunta: '¿Podría cobrar al tomar la orden, antes de servir?', si: 'Cobrar al pedir es viable', no: 'Aquí se cobra al final' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Se cobra al pedir y el ticket es la orden. Lo que sale de la plancha ya está pagado.', pide: { antes: true } },
        { sol: 'comandero', para: 'Cada orden se apunta en el celular conforme sale. Al final se cobra lo apuntado, no lo que el cliente recuerda.', pide: { antes: false } },
        { sol: 'pedidos-qr', para: 'Quien pide desde su teléfono arma su propia cuenta. Los dos tacos que pidió después se suman solos.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: una nota o ficha por cliente desde el primer taco. Sin sistema, pero la cuenta deja de ser de memoria.' },
      ],
    },
    {
      id: 'sube-la-carne',
      area: 'rentabilidad',
      titulo: 'Sube la carne y yo sigo cobrando lo mismo',
      senal: 'La carne, el limón y la tortilla suben. El taco sigue al mismo precio porque subirlo da miedo.',
      frecuente: true,
      matices: [{ id: 'costo', pregunta: '¿Sabe cuánto le cuesta hoy hacer un taco?', si: 'Conoce su costo por taco', no: 'El precio se puso "a ojo"' }],
      rutas: [
        { sol: 'costeo', para: 'Carne, tortilla, salsa, limón y gas: lo que cuesta de verdad un taco de pastor hoy. Con eso se decide si sube un peso o dos.', pide: { costo: false } },
        { sol: 'tablero-ventas', para: 'Qué se vende más y qué deja más: los de pastor, la gringa o las aguas. No siempre es lo mismo.' },
        { sol: 'inventario-escaner', para: 'Cada compra de carne se registra con su precio. Cuando el kilo sube, se ve ese mismo día y no a fin de mes.' },
        { sol: 'menu-digital', para: 'Con los precios en un código y no en una lona, ajustar uno toma un minuto y no cuesta la reimpresión.' },
      ],
    },
  ],
}
