// Barbería. Forma y reglas en docs/ARQUITECTURA.md, "Contrato de un nicho".

export default {
  id: 'barberia',
  familia: 'cuidado',
  nombre: 'Barbería',
  plural: 'barberías',
  icono: 'barberia',
  acento: '#1f3a5f',
  orden: 10,
  vocab: {
    personal: 'el barbero',
    empleado: 'el barbero',
    producto: 'servicio',
    productos: 'servicios',
  },

  // Para quien presenta, antes de entrar.
  apertura: 'Vimos que trabajan varios sillones. ¿Sus clientes llegan con cita o como van cayendo?',
  observa: [
    'Cuánta gente espera sentada y si alguien les dice cuánto falta.',
    'Si las citas se anotan en una libreta, en un pizarrón o en el celular de cada barbero.',
    'Si los productos de la vitrina tienen el precio a la vista.',
  ],

  // Datos de muestra para vestir las demos. Son ilustrativos.
  muestra: {
    productos: [
      { nombre: 'Cera mate', precio: 180, categoria: 'Cabello' },
      { nombre: 'Pomada base agua', precio: 190, categoria: 'Cabello' },
      { nombre: 'Polvo texturizador', precio: 220, categoria: 'Cabello' },
      { nombre: 'Shampoo anticaída', precio: 240, categoria: 'Cabello' },
      { nombre: 'Aceite para barba', precio: 170, categoria: 'Barba' },
      { nombre: 'Bálsamo para barba', precio: 160, categoria: 'Barba' },
      { nombre: 'Shampoo para barba', precio: 150, categoria: 'Barba' },
      { nombre: 'Peine de madera', precio: 90, categoria: 'Barba' },
      { nombre: 'Loción para después de afeitar', precio: 140, categoria: 'Cuidado' },
      { nombre: 'Tónico capilar', precio: 210, categoria: 'Cuidado' },
      { nombre: 'Minoxidil al 5 %', precio: 280, categoria: 'Cuidado' },
      { nombre: 'Kit de barba: aceite, bálsamo y peine', precio: 380, categoria: 'Paquetes' },
      { nombre: 'Certificado de corte y barba', precio: 230, categoria: 'Paquetes' },
    ],
    servicios: [
      { nombre: 'Corte clásico', precio: 130, minutos: 30 },
      { nombre: 'Corte con degradado', precio: 160, minutos: 40 },
      { nombre: 'Corte y barba', precio: 230, minutos: 55 },
      { nombre: 'Arreglo de barba', precio: 100, minutos: 20 },
      { nombre: 'Corte de niño', precio: 110, minutos: 25 },
      { nombre: 'Delineado y cejas', precio: 60, minutos: 15 },
    ],
    personal: ['Beto', 'Iván', 'Memo', 'Kevin'],
    clientes: ['Don Ramiro', 'Luis Ángel', 'Profe Navarro', 'Emiliano', 'Sr. Cárdenas', 'Diego Macías'],
    insumos: [
      { nombre: 'Navajas de doble filo', unidad: 'cajas', hay: 2, minimo: 4 },
      { nombre: 'Papel cuello', unidad: 'rollos', hay: 9, minimo: 6 },
      { nombre: 'Talco', unidad: 'frascos', hay: 3, minimo: 2 },
      { nombre: 'Loción para después de afeitar', unidad: 'L', hay: 1, minimo: 2 },
      { nombre: 'Desinfectante para herramienta', unidad: 'L', hay: 3, minimo: 2 },
      { nombre: 'Espuma para afeitar', unidad: 'botes', hay: 5, minimo: 4 },
      { nombre: 'Capas desechables', unidad: 'pzas', hay: 60, minimo: 50 },
      { nombre: 'Toallas limpias', unidad: 'pzas', hay: 24, minimo: 20 },
    ],
  },

  problemas: [
    // ── Atención ──
    {
      id: 'sabado-lleno',
      area: 'atencion',
      titulo: 'El sábado se llena y la gente se va',
      senal: 'La sala llena y nadie sabe cuánto falta. Más de uno se asoma, ve la fila y se va a otra barbería.',
      frecuente: true,
      matices: [{ id: 'cita', pregunta: '¿Sus clientes aceptarían apartar hora en lugar de llegar y esperar?', si: 'Aceptan apartar hora', no: 'Prefieren llegar sin avisar' }],
      rutas: [
        { sol: 'agenda-en-linea', para: 'El corte del sábado se aparta desde el jueves, con el barbero de siempre. El cliente llega a su hora y pasa directo al sillón.', pide: { cita: true } },
        { sol: 'turnos-virtuales', para: 'Quien llega sin cita toma su turno en el celular, ve que faltan cuatro y se va por un café. Regresa cuando ya casi le toca.', pide: { cita: false } },
        { sol: 'pantalla-turnos', para: 'Una pantalla en la sala con el orden y el sillón de cada quien. Se acaba el "¿quién sigue?" y nadie se cuela.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: acordar cómo se intercalan las citas con quienes llegan sin avisar, y anotar el orden donde todos lo vean.' },
      ],
    },
    {
      id: 'plantones',
      area: 'atencion',
      titulo: 'Me apartan hora y no llegan',
      senal: 'El barbero espera veinte minutos a una cita que no llega, después de decirle que no a quien sí estaba ahí.',
      frecuente: true,
      matices: [{ id: 'anticipo', pregunta: '¿Pediría un anticipo para apartar en sábado o en quincena?', si: 'Anticipo aceptado', no: 'Sin anticipo' }],
      rutas: [
        { sol: 'anticipo-reserva', para: 'Apartar en sábado cuesta 50 pesos que se descuentan del corte. Quien aparta "por si acaso" deja de hacerlo.', pide: { anticipo: true } },
        { sol: 'recordatorios', para: 'Un mensaje la víspera para confirmar. Si el cliente cancela con un toque, esa hora se le da a alguien de la sala.' },
        { sol: 'lista-espera', para: 'Cuando una cita se cae, el hueco se le ofrece a quien pidió ese horario y ya no alcanzó.' },
        { sol: 'agenda-interna', para: 'Lo mínimo: todas las citas en una vista, con diez minutos de tolerancia. Pasado ese tiempo, el sillón es del siguiente.' },
      ],
    },

    // ── Organización ──
    {
      id: 'citas-en-cada-celular',
      area: 'organizacion',
      titulo: 'Cada barbero lleva sus citas en su celular',
      senal: 'Las citas llegan al WhatsApp personal de cada quien. Usted no sabe quién está ocupado ni a qué hora se desocupa.',
      frecuente: true,
      matices: [{ id: 'recepcion', pregunta: '¿Hay alguien en el mostrador que reciba y acomode a los clientes?', si: 'Hay quien recibe', no: 'Cada barbero se organiza solo' }],
      rutas: [
        { sol: 'agenda-en-linea', para: 'Un solo enlace para apartar con cualquier barbero. La cita ya no vive en el celular de nadie: vive en la barbería.' },
        { sol: 'agenda-interna', para: 'Todos los sillones en una pantalla. Quien recibe ve cuál se desocupa a las 5:20 y a quién puede pasar mientras tanto.', pide: { recepcion: true } },
        { sol: 'turnos-virtuales', para: 'Sin nadie en el mostrador, quien llega toma turno con un código en la puerta y elige barbero. El orden queda a la vista.', pide: { recepcion: false } },
        { sol: 'proceso-claro', para: 'Lo mínimo: acordar que toda cita se anota el mismo día en un solo lugar. Lo dibujamos con sus barberos, sin sistema nuevo.' },
      ],
    },
    {
      id: 'falta-barbero',
      area: 'organizacion',
      titulo: 'Falta un barbero y me entero con la sala llena',
      senal: 'Sus clientes llegan y él no está. Hay que repartirlos entre los demás o pedir disculpas.',
      matices: [{ id: 'cita', pregunta: '¿Ese barbero trabaja sobre todo con cita?', si: 'Trabaja con cita', no: 'Atiende a quien va llegando' }],
      rutas: [
        { sol: 'roles-horarios', para: 'La semana de cada barbero publicada, con su descanso. La entrada se registra desde el celular y el retardo queda anotado.' },
        { sol: 'agenda-interna', para: 'Si un barbero avisa que no llega, sus citas del día se ven juntas y se reparten entre los otros sillones.', pide: { cita: true } },
        { sol: 'turnos-virtuales', para: 'Quien llega sin cita ve en su turno qué barberos están hoy. Elige a otro o vuelve mañana, sin esperar en balde.', pide: { cita: false } },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: el mensaje de "hoy no está su barbero, ¿lo paso con otro o lo cambio de día?" ya escrito, para enviarlo temprano.' },
      ],
    },

    // ── Clientes ──
    {
      id: 'barbero-se-lleva-clientes',
      area: 'clientes',
      titulo: 'Se va un barbero y se lleva a sus clientes',
      senal: 'Los teléfonos de los clientes están en el celular del barbero. Si se cambia de barbería, la clientela se va con él.',
      frecuente: true,
      matices: [{ id: 'registro', pregunta: '¿La barbería guarda el nombre y el teléfono de quien se atiende?', si: 'La barbería guarda contactos', no: 'Los contactos son del barbero' }],
      rutas: [
        { sol: 'base-clientes', para: 'Cada cliente queda registrado en la barbería: su teléfono, su corte de siempre y con quién se atiende. Eso no se va en un celular.', pide: { registro: false } },
        { sol: 'agenda-en-linea', para: 'Las citas se apartan con la barbería y no por el WhatsApp del barbero. El cliente conserva el enlace aunque cambie quién lo atiende.' },
        { sol: 'reactivacion', para: 'Si un barbero se va, se ve quién se atendía con él y queda listo el mensaje para invitarlo a probar otro sillón.', pide: { registro: true } },
        { sol: 'tarjeta-lealtad', para: 'Lo más sencillo: los sellos son de la barbería. A quien le falta uno para su corte gratis le cuesta más irse.' },
      ],
    },
    {
      id: 'no-han-vuelto',
      area: 'clientes',
      titulo: 'Hay clientes que dejaron de venir y ni cuenta me di',
      senal: 'Un corte dura tres o cuatro semanas. Quien lleva dos meses sin venir ya se lo está haciendo en otro lado.',
      matices: [{ id: 'contacto', pregunta: '¿Tiene el teléfono de sus clientes?', si: 'Tiene sus teléfonos', no: 'No guarda contactos' }],
      rutas: [
        { sol: 'reactivacion', para: 'A las cinco semanas sin corte, el mensaje queda listo: "¿Ya le toca?", con el enlace para apartar con su barbero.', pide: { contacto: true } },
        { sol: 'promos-segmentadas', para: 'Una promoción de corte y barba solo para quien lleva más de dos meses sin venir. No se le regala a quien de todos modos venía.', pide: { contacto: true } },
        { sol: 'tarjeta-lealtad', para: 'El sexto corte va por la casa y los sellos viven en el teléfono. No hay cartoncito que se pierda en la cartera.' },
        { sol: 'base-clientes', para: 'Lo primero: anotar a quien se atiende, con nombre, teléfono y fecha. Al mes ya se ve quién dejó de venir.', pide: { contacto: false } },
      ],
    },
    {
      id: 'no-nos-encuentran',
      area: 'clientes',
      titulo: 'La gente nueva en la ciudad no sabe que existimos',
      senal: 'Estudiantes y recién llegados buscan "barbería cerca" en el celular. Aparece la de la otra cuadra.',
      matices: [{ id: 'fotos', pregunta: '¿Ya suben fotos de sus cortes a redes?', si: 'Publican sus cortes', no: 'Casi no publican' }],
      rutas: [
        { sol: 'sitio-web', para: 'Una página con los cortes, los precios, los barberos y el botón de apartar. El enlace va en Instagram y en Facebook.', pide: { fotos: true } },
        { sol: 'resenas', para: 'Al levantarse del sillón, el cliente recibe la invitación a opinar. Las estrellas pesan cuando alguien elige entre dos barberías.' },
        { sol: 'menu-digital', para: 'La lista de cortes y precios en un enlace para el perfil de Instagram. Quien ve la foto de un degradado sabe cuánto cuesta.' },
        { sol: 'perfil-google', para: 'Lo primero: aparecer completo en el mapa, con horario real, fotos del local y el botón para llamar o escribir.' },
      ],
    },

    // ── Administración ──
    {
      id: 'comisiones',
      area: 'administracion',
      titulo: 'Sacar las comisiones es un pleito cada semana',
      senal: 'Se cuentan los cortes de la libreta, el barbero trae otra cuenta y el sábado en la noche hay discusión.',
      frecuente: true,
      matices: [{ id: 'renta', pregunta: '¿Alguno de sus barberos renta el sillón en lugar de ir a comisión?', si: 'Hay sillones rentados', no: 'Todos van a comisión' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Cada corte se cobra a nombre de quien lo hizo. El sábado la comisión de cada barbero ya está sumada.' },
        { sol: 'fiado', para: 'La renta semanal de cada sillón con lo pagado y lo que falta. Se cobra sin tener que acordarse de quién debe.', pide: { renta: true } },
        { sol: 'corte-de-caja', para: 'Al cerrar, lo cobrado se compara con lo que hay, separado por barbero. La comisión sale de ese corte y no de la memoria.' },
        { sol: 'reporte-diario', para: 'Cada noche, un mensaje con los servicios de cada barbero. Si alguien no está de acuerdo, se aclara ese mismo día.' },
      ],
    },
    {
      id: 'cuanto-entro',
      area: 'administracion',
      titulo: 'No sé cuánto entró hoy entre efectivo y transferencias',
      senal: 'Unos pagan en efectivo y otros transfieren, a su cuenta o a la del barbero. Al cierre nadie tiene el total.',
      matices: [{ id: 'presente', pregunta: '¿Usted está en la barbería todos los días?', si: 'El dueño está en el local', no: 'El dueño no siempre está' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Cada servicio se registra al cobrarse, con su forma de pago. Efectivo, tarjeta y transferencia quedan separados desde el momento.' },
        { sol: 'tablero-ventas', para: 'Desde su teléfono ve cuántos cortes van, en qué sillón y cuánto ha entrado, aunque usted ande en otro lado.', pide: { presente: false } },
        { sol: 'cobro-en-linea', para: 'Un código en el espejo de cada sillón. El cliente paga a la cuenta de la barbería y el pago se confirma sin enseñar capturas.' },
        { sol: 'checklist-turnos', para: 'Lo mínimo: un cierre con pasos fijos. Contar el cajón, revisar las transferencias del día y anotar el total.' },
      ],
    },

    // ── Inventarios ──
    {
      id: 'se-acaba-material',
      area: 'inventarios',
      titulo: 'Se acaban las navajas o el talco en pleno sábado',
      senal: 'Cada barbero toma lo que necesita y nadie avisa. El faltante se descubre con el cliente ya sentado.',
      matices: [{ id: 'encargado', pregunta: '¿Hay una persona encargada de comprar el material?', si: 'Alguien se encarga de comprar', no: 'Compra quien se da cuenta' }],
      rutas: [
        { sol: 'inventario-alertas', para: 'Navajas, papel cuello, talco y desinfectante con su mínimo. Si quedan dos cajas de navajas, usted se entera el miércoles.' },
        { sol: 'compras-sugeridas', para: 'Según los cortes de la semana, la lista de compra se arma sola. Quien va por el material lleva lo justo.', pide: { encargado: true } },
        { sol: 'inventario-escaner', para: 'Lo que cada barbero saca de la bodega se registra con el celular. Se sabe cuánto material gasta cada sillón.' },
        { sol: 'checklist-turnos', para: 'Lo mínimo: el cierre del jueves incluye revisar navajas, talco y toallas. Se palomea y queda quién lo hizo.' },
      ],
    },
    {
      id: 'vitrina-no-cuadra',
      area: 'inventarios',
      titulo: 'La vitrina no cuadra con lo que se vendió',
      senal: 'Faltan pomadas que nadie cobró, o se usan con los clientes las que eran para vender.',
      matices: [{ id: 'uso', pregunta: '¿Sus barberos usan en el sillón el mismo producto que venden?', si: 'Se usa el producto de venta', no: 'Hay producto aparte para el sillón' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Cada cera vendida se descuenta sola de la existencia. Lo que falta en la vitrina y no pasó por caja se nota.' },
        { sol: 'inventario-escaner', para: 'La pomada que se abre para usar en el sillón se registra como salida. Deja de confundirse con la que se vendió.', pide: { uso: true } },
        { sol: 'inventario-alertas', para: 'Cada producto con su mínimo. Cuando quedan tres ceras mate, llega el aviso para pedirle al proveedor.' },
        { sol: 'merma', para: 'Lo mínimo: anotar lo que se abre, se regala o se rompe, con su motivo. A fin de mes la diferencia tiene explicación.' },
      ],
    },

    // ── Comunicación ──
    {
      id: 'mensajes-sin-contestar',
      area: 'comunicacion',
      titulo: 'Preguntan por mensaje y nadie alcanza a contestar',
      senal: 'Todos tienen las manos ocupadas. El "¿cuánto el corte?" y el "¿hay lugar hoy?" se contestan dos horas después.',
      frecuente: true,
      matices: [{ id: 'lugar', pregunta: '¿Lo que más le preguntan es si hay lugar ese día?', si: 'Preguntan si hay lugar', no: 'Preguntan precios y horario' }],
      rutas: [
        { sol: 'agenda-en-linea', para: '"¿Hay lugar hoy?" deja de ser una pregunta. El cliente abre el enlace, ve los huecos de cada barbero y aparta.', pide: { lugar: true } },
        { sol: 'respuesta-automatica', para: 'Precios, horario y ubicación se contestan solos mientras todos están cortando. Lo demás espera a que alguien suelte la máquina.' },
        { sol: 'perfil-google', para: 'Horario, teléfono y precios en su ficha de Google. Muchos lo revisan ahí y ya no necesitan escribir.', pide: { lugar: false } },
        { sol: 'respuestas-rapidas', para: 'Las cinco respuestas de siempre, ya escritas. Entre un corte y otro se contesta con un toque.' },
      ],
    },

    // ── Rentabilidad ──
    {
      id: 'productos-en-vitrina',
      area: 'rentabilidad',
      titulo: 'Las ceras y pomadas se quedan en la vitrina',
      senal: 'Hay producto exhibido y nadie lo ofrece. El cliente sale con su corte y compra la cera en el súper.',
      matices: [{ id: 'comision', pregunta: '¿Sus barberos ganan algo por cada producto que venden?', si: 'Hay comisión por producto', no: 'Sin comisión por producto' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'El producto se cobra junto con el corte y queda a nombre del barbero que lo recomendó. Su comisión se suma sola.', pide: { comision: true } },
        { sol: 'base-clientes', para: 'En la ficha queda qué cera se llevó cada cliente. A las seis semanas el barbero sabe que ya se le está acabando.' },
        { sol: 'catalogo-whatsapp', para: 'Pomadas, aceites y kits de barba en un enlace. El cliente pide por WhatsApp y recoge en su próximo corte.' },
        { sol: 'menu-digital', para: 'Lo mínimo: un código junto al espejo con los productos y sus precios. El cliente lo revisa mientras lo atienden y pregunta solo.' },
      ],
    },
    {
      id: 'queda-poco',
      area: 'rentabilidad',
      titulo: 'Los sillones llenos y al final queda poco',
      senal: 'Después de comisiones, renta, luz y material, lo que le queda a la barbería no se parece a lo que se trabajó.',
      matices: [{ id: 'precios', pregunta: '¿Hace más de un año que no ajusta sus precios?', si: 'Precios sin ajustar', no: 'Precios al día' }],
      rutas: [
        { sol: 'costeo', para: 'Cuánto deja un corte de 130 después de la comisión, la navaja y el tiempo de sillón. Y cuánto deja un corte con barba.' },
        { sol: 'tablero-ventas', para: 'Qué servicio se hace más y a qué horas hay sillones vacíos. Ahí se ve dónde cabe una promoción y dónde no hace falta.' },
        { sol: 'promos-segmentadas', para: 'El martes flojo se llena con una invitación a quienes vienen cada mes. El sábado, que se llena solo, se queda a precio completo.' },
        { sol: 'menu-digital', para: 'Con los precios en un código, subir el corte diez pesos toma un minuto. No hay que repintar el pizarrón.', pide: { precios: true } },
      ],
    },
  ],
}
