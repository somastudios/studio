// Bares, cantinas, antros y terrazas: barra, cuentas abiertas, cover, eventos y noche.

export default {
  id: 'bar',
  familia: 'comida',
  nombre: 'Bar o antro',
  plural: 'bares',
  icono: 'bar',
  acento: '#3d2c5e',
  vocab: {
    personal: 'el mesero',
    empleado: 'el mesero',
    producto: 'bebida',
    productos: 'bebidas',
    cita: 'reservación',
    citas: 'reservaciones',
    lugar: 'bar',
  },

  // Para quien presenta, antes de entrar.
  apertura: 'Vimos que los sábados se les llena. ¿Qué es lo más pesado del cierre en una noche así?',
  observa: [
    'Cómo se llevan las cuentas abiertas: comanda en papel, libreta en la barra o de memoria.',
    'Si en la barra hay medidores a la mano o se sirve a ojo.',
    'Cómo se cobra en la puerta: boleto, sello o solo el dinero en la mano.',
  ],

  // Datos de muestra para vestir las demos. Son ilustrativos.
  muestra: {
    productos: [
      { nombre: 'Cerveza nacional', precio: 45, categoria: 'Cervezas' },
      { nombre: 'Cerveza artesanal', precio: 85, categoria: 'Cervezas' },
      { nombre: 'Michelada', precio: 75, categoria: 'Cervezas' },
      { nombre: 'Cubeta de seis cervezas', precio: 240, categoria: 'Cervezas' },
      { nombre: 'Cantarito', precio: 120, categoria: 'Cocteles' },
      { nombre: 'Margarita', precio: 110, categoria: 'Cocteles' },
      { nombre: 'Mojito', precio: 105, categoria: 'Cocteles' },
      { nombre: 'Carajillo', precio: 115, categoria: 'Cocteles' },
      { nombre: 'Botella de tequila reposado', precio: 1250, categoria: 'Botellas' },
      { nombre: 'Botella de whisky', precio: 1650, categoria: 'Botellas' },
      { nombre: 'Botella de vodka', precio: 1100, categoria: 'Botellas' },
      { nombre: 'Alitas (12 piezas)', precio: 185, categoria: 'Botanas' },
      { nombre: 'Papas gajo', precio: 95, categoria: 'Botanas' },
      { nombre: 'Nachos con queso', precio: 110, categoria: 'Botanas' },
    ],
    servicios: [
      { nombre: 'Mesa para cuatro', precio: 0, minutos: 180 },
      { nombre: 'Mesa de pista con consumo mínimo', precio: 1500, minutos: 240 },
      { nombre: 'Zona reservada para diez', precio: 3500, minutos: 240 },
      { nombre: 'Paquete de cumpleaños', precio: 2800, minutos: 240 },
      { nombre: 'Terraza para grupo', precio: 0, minutos: 180 },
    ],
    personal: ['Iván', 'Karla', 'Rigo', 'Pamela'],
    clientes: ['Diego Macías', 'Valeria Ornelas', 'Adrián Soto', 'Jimena Aguilar', 'Lic. Preciado', 'Grupo Contreras'],
    insumos: [
      { nombre: 'Tequila reposado', unidad: 'botellas', hay: 9, minimo: 12 },
      { nombre: 'Whisky', unidad: 'botellas', hay: 6, minimo: 4 },
      { nombre: 'Vodka', unidad: 'botellas', hay: 5, minimo: 4 },
      { nombre: 'Cerveza nacional', unidad: 'cartones', hay: 22, minimo: 15 },
      { nombre: 'Hielo', unidad: 'bolsas', hay: 8, minimo: 14 },
      { nombre: 'Limón', unidad: 'kg', hay: 12, minimo: 8 },
      { nombre: 'Agua mineral', unidad: 'pzas', hay: 60, minimo: 48 },
      { nombre: 'Refresco de toronja', unidad: 'pzas', hay: 40, minimo: 36 },
    ],
  },

  problemas: [
    // ── Atención ──
    {
      id: 'barra-saturada',
      area: 'atencion',
      titulo: 'La barra no se da abasto y la gente deja de pedir',
      senal: 'Los meseros hacen fila en la barra, las mesas levantan la mano y la siguiente ronda no llega.',
      frecuente: true,
      matices: [{ id: 'solo', pregunta: '¿Sus clientes pedirían la siguiente ronda desde el teléfono?', si: 'Pedirían desde el teléfono', no: 'Prefieren pedirle al mesero' }],
      rutas: [
        { sol: 'pedidos-qr', para: 'La mesa pide otra ronda desde el teléfono, sin buscar al mesero entre la gente. La orden cae directo en la barra.', pide: { solo: true } },
        { sol: 'comandero', para: 'El mesero manda la ronda desde la mesa. Ya no cruza el bar para dictarla ni hace fila en la barra.', pide: { solo: false } },
        { sol: 'pantalla-cocina', para: 'La barra ve las órdenes en cola, por mesa y por tiempo. Se preparan en orden y no según quién grita más.' },
        { sol: 'llamado-mesa', para: 'Lo mínimo: un toque desde la mesa para pedir atención o la cuenta. El mesero sabe a dónde ir aunque no se oiga nada.' },
      ],
    },
    {
      id: 'apartan-y-no-llegan',
      area: 'atencion',
      titulo: 'Apartan mesa para diez y llegan cuatro, o ninguno',
      senal: 'Las mejores mesas del sábado se apartan por mensaje. A las once siguen vacías, con gente esperando afuera.',
      frecuente: true,
      matices: [{ id: 'anticipo', pregunta: '¿Pediría anticipo o consumo mínimo para apartar mesa?', si: 'Aparta con anticipo', no: 'Aparta sin anticipo' }],
      rutas: [
        { sol: 'anticipo-reserva', para: 'La mesa del sábado se aparta con un anticipo que se abona a la cuenta. Quien aparta para diez, llega con diez.', pide: { anticipo: true } },
        { sol: 'agenda-en-linea', para: 'Las mesas libres se ven y se apartan en un enlace. Las reservaciones dejan de vivir en el chat de tres personas.' },
        { sol: 'lista-espera', para: 'Si a las once no llegaron, la mesa se ofrece a quien estaba en lista. No se queda sola en la mejor hora.' },
        { sol: 'recordatorios', para: 'Lo mínimo: un mensaje el sábado a mediodía para confirmar cuántos vienen. Si cancelan, hay tiempo de darla a alguien más.' },
      ],
    },

    // ── Organización ──
    {
      id: 'equipo-de-ultima-hora',
      area: 'organizacion',
      titulo: 'Cada fin de semana armo el equipo a última hora',
      senal: 'Meseros y seguridad eventuales confirman tarde o no llegan. Y se les paga por noche, de memoria.',
      matices: [{ id: 'eventual', pregunta: '¿Trabaja con personal eventual que cobra por noche?', si: 'Personal eventual por noche', no: 'Equipo fijo' }],
      rutas: [
        { sol: 'roles-horarios', para: 'El rol del fin de semana se publica el miércoles y cada quien confirma. La entrada se registra al llegar, y con eso se paga.', pide: { eventual: true } },
        { sol: 'checklist-turnos', para: 'Quien llega por primera vez sigue la lista: montar barra, hielo, estaciones, cambio. No depende de quién le explique.' },
        { sol: 'bitacora-turno', para: 'Lo de anoche queda escrito: la mesa que quedó a deber, la botella apartada, el foco fundido.' },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: el mensaje de confirmación del miércoles ya escrito para todos. Quien no contesta se reemplaza con tiempo.' },
      ],
    },

    // ── Inventarios ──
    {
      id: 'botellas-rinden-menos',
      area: 'inventarios',
      titulo: 'Las botellas rinden menos tragos de los que deberían',
      senal: 'Se sirve a ojo y se invita a los conocidos. Al final la botella no da lo que se cobró.',
      frecuente: true,
      matices: [{ id: 'medida', pregunta: '¿Sus bartenders sirven con medidor?', si: 'Sirven con medidor', no: 'Sirven a ojo' }],
      rutas: [
        { sol: 'inventario-escaner', para: 'Cada botella que pasa de bodega a barra se registra. Al cierre se compara lo que salió contra lo que se vendió.' },
        { sol: 'costeo', para: 'Cada trago con su receta: 45 mililitros, no "un chorro". Se sabe cuántos tragos debe dar una botella y cuánto dejan.' },
        { sol: 'merma', para: 'Lo que se rompe, se derrama o se invita se anota con su motivo. La cortesía deja de esconderse en la botella.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: medidor en cada estación y una regla escrita para las cortesías. Sin eso, ningún conteo cuadra.', pide: { medida: false } },
      ],
    },
    {
      id: 'hielo-y-cerveza-fria',
      area: 'inventarios',
      titulo: 'A media noche se acaba el hielo o la cerveza fría',
      senal: 'Hay producto en bodega, pero no en la barra ni frío. O de plano se acabó lo que más piden.',
      matices: [{ id: 'bodega', pregunta: '¿La bodega está separada de la barra?', si: 'Bodega aparte de la barra', no: 'Todo está en la barra' }],
      rutas: [
        { sol: 'inventario-alertas', para: 'Hielo, cerveza y mezcladores con su mínimo por noche. El aviso llega el jueves, cuando el proveedor todavía surte.' },
        { sol: 'compras-sugeridas', para: 'Según lo vendido en sábados parecidos, la lista dice cuántos cartones y cuántas bolsas de hielo pedir.' },
        { sol: 'inventario-escaner', para: 'Lo que sube de bodega a barra se registra con el celular. Se sabe qué hay arriba, qué hay abajo y qué ya está frío.', pide: { bodega: true } },
        { sol: 'bitacora-turno', para: 'Lo mínimo: quien cierra anota lo que se acabó y lo que quedó bajo. Quien abre lo ve antes del primer cliente.' },
      ],
    },

    // ── Administración ──
    {
      id: 'cuentas-abiertas',
      area: 'administracion',
      titulo: 'Con las cuentas abiertas siempre se pierde algo',
      senal: 'A las dos de la mañana hay rondas sin apuntar, mesas que se juntaron y alguien que ya se fue sin pagar.',
      frecuente: true,
      matices: [{ id: 'ronda', pregunta: '¿Podría cobrar cada ronda al momento, sin abrir cuenta?', si: 'Cobro por ronda viable', no: 'La cuenta abierta se queda' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Ronda servida, ronda cobrada. A la hora de cerrar no queda cuenta que perseguir.', pide: { ronda: true } },
        { sol: 'comandero', para: 'Cada ronda se apunta en el celular, en la mesa y en el momento. La cuenta deja de vivir en la memoria del mesero.', pide: { ronda: false } },
        { sol: 'cobro-en-linea', para: 'La mesa ve su cuenta en el teléfono y la paga ahí, completa o dividida. Nadie espera al mesero para irse.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: una regla para abrir cuenta, con tarjeta o identificación en garantía, y un mesero responsable por mesa.' },
      ],
    },
    {
      id: 'cover-sin-registro',
      area: 'administracion',
      titulo: 'En la puerta se cobra el cover y no queda registro',
      senal: 'El cover entra en efectivo, de noche y de mano en mano. Al cierre se entrega "lo que hubo".',
      matices: [{ id: 'preventa', pregunta: '¿Vendería entradas antes del evento?', si: 'Preventa bienvenida', no: 'Solo cobro en puerta' }],
      rutas: [
        { sol: 'cobro-en-linea', para: 'La entrada se paga antes con un enlace y en la puerta se muestra el código. Desde el jueves se sabe cuántos vienen.', pide: { preventa: true } },
        { sol: 'acceso-vigencia', para: 'En la puerta se escanea el código de quien ya pagó o está en lista. Pasa o no pasa, sin discutir con el cadenero.' },
        { sol: 'punto-de-venta', para: 'Cada cover se cobra en una pantalla en la puerta y deja comprobante. Entradas contadas, dinero contado.' },
        { sol: 'corte-de-caja', para: 'Lo mínimo: la puerta hace su propio corte. Tantas entradas, tanto dinero, firmado antes de juntarse con la barra.' },
      ],
    },
    {
      id: 'corte-de-madrugada',
      area: 'administracion',
      titulo: 'El corte de madrugada rara vez cuadra',
      senal: 'Barra, meseros, puerta y terminal: cuatro dineros que se juntan a las tres de la mañana, con sueño y prisa.',
      frecuente: true,
      matices: [{ id: 'meseros', pregunta: '¿Los meseros cobran y entregan al final de la noche?', si: 'Los meseros cobran', no: 'Solo se cobra en caja' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Cada mesero cierra sus cuentas con su usuario. Al final se sabe cuánto entrega cada uno, sin sumar comandas.', pide: { meseros: true } },
        { sol: 'corte-de-caja', para: 'El sistema dice cuánto debe haber en barra y en terminal. Se cuenta una vez y la diferencia tiene dueño.' },
        { sol: 'checklist-turnos', para: 'Un cierre con pasos fijos y firma: contar, guardar botellas abiertas, apagar, anotar pendientes. Aunque sean las tres.' },
        { sol: 'reporte-diario', para: 'Lo mínimo: al cerrar, un mensaje con la venta de la noche y los pendientes. Usted lo lee en la mañana, ya descansado.' },
      ],
    },

    // ── Clientes ──
    {
      id: 'jueves-vacio',
      area: 'clientes',
      titulo: 'Viernes y sábado se llena, el jueves no hay nadie',
      senal: 'Se paga música, personal y luz para una noche que no junta ni la mitad.',
      matices: [{ id: 'lista', pregunta: '¿Guarda el contacto de quienes reservan o vienen seguido?', si: 'Tiene lista de contactos', no: 'No guarda contactos' }],
      rutas: [
        { sol: 'promos-segmentadas', para: 'La noche de jueves se le anuncia a quien vino en sábado el mes pasado, no a todo el mundo.', pide: { lista: true } },
        { sol: 'tarjeta-lealtad', para: 'Las visitas entre semana suman para una cortesía. El grupo del sábado tiene un motivo para caer en jueves.' },
        { sol: 'tablero-ventas', para: 'Lo que deja cada noche contra lo que cuesta abrirla. A veces la respuesta es no abrir el miércoles.' },
        { sol: 'base-clientes', para: 'Lo mínimo: guardar el nombre y el número de quien reserva. Sin esa lista no hay a quién invitar.', pide: { lista: false } },
      ],
    },
    {
      id: 'festejos-se-escapan',
      area: 'clientes',
      titulo: 'Los cumpleaños y eventos privados se me escapan',
      senal: 'Preguntan por paquete para un festejo, se les contesta tarde o con otro precio, y festejan en otro lado.',
      matices: [{ id: 'paquetes', pregunta: '¿Tiene paquetes definidos para grupos?', si: 'Paquetes definidos', no: 'Se arma cada vez' }],
      rutas: [
        { sol: 'seguimiento-prospectos', para: 'Cada grupo que preguntó queda anotado con su fecha. Tres días antes llega el aviso para cerrar la reservación.' },
        { sol: 'cotizador', para: 'Mesa para doce, dos botellas y mezcladores: la cotización sale en un minuto y es la misma, la mande quien la mande.', pide: { paquetes: true } },
        { sol: 'anticipo-reserva', para: 'El festejo se confirma con anticipo. La fecha queda firme para el grupo y para usted.' },
        { sol: 'catalogo-whatsapp', para: 'Lo mínimo: los paquetes de festejo en un enlace, con precio y condiciones. Quien pregunta elige ahí.' },
      ],
    },

    // ── Comunicación ──
    {
      id: 'mismas-preguntas',
      area: 'comunicacion',
      titulo: 'Todos preguntan lo mismo: si hay cover y quién toca',
      senal: 'Viernes a las nueve llegan decenas de mensajes. Quien podría contestar está acomodando mesas.',
      matices: [{ id: 'uno', pregunta: '¿Una sola persona lleva las redes y los mensajes?', si: 'Una persona lleva los mensajes', no: 'Contesta quien puede' }],
      rutas: [
        { sol: 'respuesta-automatica', para: 'Cover, horario y quién toca se contestan solos, también a las diez de la noche. Lo demás pasa a una persona.' },
        { sol: 'agenda-en-linea', para: 'Quien pregunta si hay mesa recibe un enlace y la aparta. Deja de ser una conversación.' },
        { sol: 'menu-digital', para: 'La carta, las promociones de la noche y el cartel del mes en un enlace fijo en el perfil.' },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: las diez respuestas de siempre ya escritas. Conteste quien conteste, dice lo mismo.', pide: { uno: false } },
      ],
    },

    // ── Logística ──
    {
      id: 'eventos-por-chat',
      area: 'logistica',
      titulo: 'Cada evento se organiza por mensajes y algo falla',
      senal: 'La banda, el audio, el cartel y el personal extra se acuerdan en chats distintos. El día del evento falta algo.',
      matices: [{ id: 'semanal', pregunta: '¿Tiene música en vivo o eventos cada semana?', si: 'Eventos cada semana', no: 'Eventos ocasionales' }],
      rutas: [
        { sol: 'agenda-interna', para: 'El calendario del mes en una vista: quién toca, a qué hora prueba sonido y qué personal extra va.', pide: { semanal: true } },
        { sol: 'ordenes-trabajo', para: 'Cada evento con su orden: qué se acordó con la banda, cuánto se paga, qué equipo traen y qué pone el bar.' },
        { sol: 'formatos-digitales', para: 'El acuerdo con la banda o el DJ se firma en pantalla: horario, pago y condiciones. Queda guardado por si hay dudas.' },
        { sol: 'checklist-turnos', para: 'Lo mínimo: una lista para día de evento: audio probado, cartel publicado, puerta avisada, cambio suficiente.' },
      ],
    },

    // ── Rentabilidad ──
    {
      id: 'lleno-sin-venta',
      area: 'rentabilidad',
      titulo: 'El lugar se llena y la venta no sube igual',
      senal: 'Mesas ocupadas toda la noche con una cubeta. Mucha gente, mucho gasto y un cierre que decepciona.',
      frecuente: true,
      matices: [{ id: 'minimo', pregunta: '¿Aplicaría consumo mínimo por mesa en noches fuertes?', si: 'Consumo mínimo aceptado', no: 'Sin consumo mínimo' }],
      rutas: [
        { sol: 'anticipo-reserva', para: 'Las mesas de pista se apartan con consumo mínimo pagado por adelantado. El mejor lugar lo ocupa quien sí consume.', pide: { minimo: true } },
        { sol: 'tablero-ventas', para: 'Venta por mesa y por hora. Se ve qué mesas consumen y cuáles llevan tres horas con lo mismo.' },
        { sol: 'costeo', para: 'Qué deja más: la cubeta, la botella o la coctelería. Con eso se decide qué promoción conviene y cuál sale cara.' },
        { sol: 'menu-digital', para: 'Lo mínimo: una carta que pone al frente lo que más deja y cambia según la noche, sin reimprimir.' },
      ],
    },
    {
      id: 'cortesias-sin-control',
      area: 'rentabilidad',
      titulo: 'Las cortesías y los dos por uno se salen de control',
      senal: 'Tragos invitados, promociones aplicadas a quien no era y descuentos que nadie autorizó.',
      matices: [{ id: 'autoriza', pregunta: '¿Solo usted o el gerente autorizan cortesías?', si: 'Cortesías con autorización', no: 'Cualquiera puede invitar' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'La cortesía se registra como cortesía, con quién la autorizó. El dos por uno se aplica solo en su horario.' },
        { sol: 'promos-segmentadas', para: 'La promoción le llega a quien usted eligió y se canjea con su código. No se le aplica a toda la barra.' },
        { sol: 'tarjeta-lealtad', para: 'La cortesía se gana con visitas y queda registrada. Deja de depender de ser amigo del bartender.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: acordar quién puede invitar, cuánto por noche y dónde se anota. Antes de eso, ningún registro alcanza.', pide: { autoriza: false } },
      ],
    },
  ],
}
