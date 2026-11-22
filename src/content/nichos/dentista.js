// Consultorio dental: tratamientos por etapas, presupuestos, abonos y trabajos de laboratorio.
// Sigue el contrato de docs/ARQUITECTURA.md ("Contrato de un nicho").

export default {
  id: 'dentista',
  familia: 'salud',
  nombre: 'Consultorio dental',
  plural: 'consultorios dentales',
  icono: 'dentista',
  acento: '#1a6b6b',
  orden: 20,
  vocab: {
    cliente: 'el paciente',
    clientes: 'los pacientes',
    personal: 'la asistente',
    empleado: 'la asistente',
    producto: 'tratamiento',
    productos: 'tratamientos',
    lugar: 'consultorio',
  },

  // Para quien presenta, antes de entrar.
  apertura: 'Vimos que trabaja con cita. ¿Qué tan seguido le cancelan el mismo día?',
  observa: [
    'Si la agenda está en libreta, en el celular del doctor o en una computadora.',
    'Quién contesta el teléfono cuando el doctor y la asistente están con un paciente.',
    'Si hay tarjetas de abonos, presupuestos o cajas del laboratorio a la vista en recepción.',
  ],

  // Datos de muestra para vestir las demos. Son ilustrativos.
  muestra: {
    productos: [
      { nombre: 'Corona de zirconia', precio: 5500, categoria: 'Tratamientos' },
      { nombre: 'Corona metal porcelana', precio: 3800, categoria: 'Tratamientos' },
      { nombre: 'Blanqueamiento', precio: 2500, categoria: 'Tratamientos' },
      { nombre: 'Guarda oclusal', precio: 1500, categoria: 'Tratamientos' },
      { nombre: 'Colocación de brackets', precio: 4500, categoria: 'Ortodoncia' },
      { nombre: 'Mensualidad de ortodoncia', precio: 600, categoria: 'Ortodoncia' },
      { nombre: 'Retenedores', precio: 1800, categoria: 'Ortodoncia' },
      { nombre: 'Radiografía periapical', precio: 100, categoria: 'Radiografías' },
      { nombre: 'Radiografía panorámica', precio: 350, categoria: 'Radiografías' },
      { nombre: 'Cepillo ortodóntico', precio: 60, categoria: 'Higiene' },
      { nombre: 'Enjuague bucal', precio: 120, categoria: 'Higiene' },
      { nombre: 'Cera para brackets', precio: 35, categoria: 'Higiene' },
      { nombre: 'Hilo dental', precio: 45, categoria: 'Higiene' },
    ],
    servicios: [
      { nombre: 'Valoración', precio: 200, minutos: 30 },
      { nombre: 'Limpieza dental', precio: 500, minutos: 45 },
      { nombre: 'Resina', precio: 600, minutos: 45 },
      { nombre: 'Extracción simple', precio: 700, minutos: 40 },
      { nombre: 'Endodoncia', precio: 2800, minutos: 90 },
      { nombre: 'Ajuste de ortodoncia', precio: 500, minutos: 30 },
    ],
    personal: ['Alejandra', 'Iván', 'Brenda', 'Miguel'],
    clientes: ['Sofía Larios', 'Sr. Contreras', 'Familia Figueroa', 'Doña Estela', 'Emiliano Vargas', 'Mtra. Preciado'],
    insumos: [
      { nombre: 'Anestesia en cartuchos', unidad: 'cajas', hay: 1, minimo: 3 },
      { nombre: 'Resina A2', unidad: 'jeringas', hay: 2, minimo: 3 },
      { nombre: 'Guantes de nitrilo', unidad: 'cajas', hay: 5, minimo: 4 },
      { nombre: 'Agujas cortas', unidad: 'cajas', hay: 3, minimo: 2 },
      { nombre: 'Eyectores', unidad: 'bolsas', hay: 4, minimo: 2 },
      { nombre: 'Brackets metálicos', unidad: 'juegos', hay: 6, minimo: 4 },
      { nombre: 'Alginato', unidad: 'bolsas', hay: 3, minimo: 2 },
      { nombre: 'Campos desechables', unidad: 'paquetes', hay: 5, minimo: 3 },
    ],
  },

  problemas: [
    // ── Atención ──
    {
      id: 'cancelan-mismo-dia',
      area: 'atencion',
      titulo: 'Me cancelan el mismo día y el sillón se queda vacío',
      senal: 'Una cita de hora y media que se cae a última hora ya no hay con quién llenarla.',
      frecuente: true,
      matices: [
        { id: 'anticipo', pregunta: '¿Pediría anticipo para apartar las citas largas?', si: 'Anticipo aceptado', no: 'Sin anticipo' },
        { id: 'espera', pregunta: '¿Tiene pacientes que quieren cita más pronto?', si: 'Hay quien quiere cita antes', no: 'Nadie espera lugar' },
      ],
      rutas: [
        { sol: 'anticipo-reserva', para: 'Las citas de más de una hora se apartan con un anticipo que se abona al tratamiento. Quien lo deja, llega.', pide: { anticipo: true } },
        { sol: 'lista-espera', para: 'Cuando se cae la cita de las cinco, el espacio se ofrece solo a quien pedía adelantar la suya.', pide: { espera: true } },
        { sol: 'recordatorios', para: 'Dos días antes y la víspera: confirmar o cancelar con un toque. Si cancela, queda tiempo para ocupar el sillón.' },
        { sol: 'agenda-interna', para: 'Para empezar: la agenda en una vista con la duración real de cada cita y el teléfono a la mano, para confirmar a los de mañana.' },
      ],
    },
    {
      id: 'urgencia-desacomoda',
      area: 'atencion',
      titulo: 'Llega una urgencia y se me desacomoda el día',
      senal: 'Un paciente con dolor entra entre citas y los que venían a su hora esperan de más.',
      matices: [{ id: 'espacio', pregunta: '¿Deja espacios libres en la agenda para urgencias?', si: 'Reserva espacio para urgencias', no: 'La agenda va llena' }],
      rutas: [
        { sol: 'agenda-interna', para: 'Dos espacios cortos al día marcados para urgencias. Si a mediodía nadie los ocupó, se abren para citas normales.', pide: { espacio: false } },
        { sol: 'agenda-en-linea', para: 'Quien tiene dolor ve el siguiente espacio disponible y lo aparta desde su celular, en vez de llegar sin avisar.' },
        { sol: 'turnos-virtuales', para: 'El paciente sin cita recibe un turno y un tiempo estimado. Decide si espera en la sala o regresa en una hora.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: acordar cuándo sí se intercala una urgencia y qué se le dice a quien espera. Hoy se decide en el momento.', pide: { espacio: true } },
      ],
    },

    // ── Clientes ──
    {
      id: 'presupuesto-no-regresa',
      area: 'clientes',
      titulo: 'Doy el presupuesto y el paciente ya no regresa',
      senal: 'Se le explica el tratamiento, dice que lo va a pensar y nadie le vuelve a llamar.',
      frecuente: true,
      matices: [{ id: 'escrito', pregunta: '¿Entrega el presupuesto por escrito?', si: 'Presupuesto por escrito', no: 'Presupuesto de palabra' }],
      rutas: [
        { sol: 'cotizador', para: 'El plan sale claro: endodoncia, poste y corona, cada uno con su precio y sus citas. El paciente se lo lleva en su WhatsApp.', pide: { escrito: false } },
        { sol: 'seguimiento-prospectos', para: 'Cada presupuesto entregado queda anotado con fecha para retomarlo. A la semana, la asistente sabe a quién buscar.' },
        { sol: 'anticipo-reserva', para: 'Quien acepta aparta su primera cita con un anticipo que se abona al tratamiento. Deja de ser un "luego le aviso".' },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: un mensaje ya escrito para preguntar, a los siete días, si quedó alguna duda del presupuesto. Sin presionar.' },
      ],
    },
    {
      id: 'solo-cuando-duele',
      area: 'clientes',
      titulo: 'Solo vienen cuando les duele',
      senal: 'La limpieza que usted recomienda cada seis meses se queda en buena intención.',
      frecuente: true,
      matices: [{ id: 'registro', pregunta: '¿Tiene anotada la última visita de cada paciente?', si: 'Tiene fecha de última visita', no: 'No lleva ese registro' }],
      rutas: [
        { sol: 'reactivacion', para: 'A los seis meses de su última limpieza, el sistema prepara la invitación a revisión. Usted decide a quién se envía.', pide: { registro: true } },
        { sol: 'recordatorios', para: 'Al terminar la limpieza se deja apartada la siguiente. Seis meses después, el recordatorio llega solo.' },
        { sol: 'promos-segmentadas', para: 'En vacaciones escolares, una invitación a revisión solo para las familias con niños. Le llega a quien le sirve.' },
        { sol: 'base-clientes', para: 'Lo primero: cada paciente con su teléfono y la fecha de su última visita. Sin esa lista no hay a quién invitar.', pide: { registro: false } },
      ],
    },
    {
      id: 'ortodoncia-faltan',
      area: 'clientes',
      titulo: 'Los de ortodoncia dejan de venir a sus ajustes',
      senal: 'Faltan dos o tres meses seguidos. El tratamiento se atrasa y la mensualidad no entra.',
      matices: [{ id: 'fija', pregunta: '¿Sus pacientes de ortodoncia tienen día fijo cada mes?', si: 'Día fijo cada mes', no: 'Se agenda cita por cita' }],
      rutas: [
        { sol: 'control-mensualidades', para: 'La lista de ortodoncia muestra quién no ha venido este mes y quién debe. No hay que esperar a que pasen tres para notarlo.' },
        { sol: 'agenda-en-linea', para: 'El paciente, o su mamá, aparta el ajuste del mes desde el celular, en un horario que no choque con la escuela.', pide: { fija: false } },
        { sol: 'reactivacion', para: 'A quien lleva seis semanas sin ajuste, el sistema le prepara un mensaje para retomar su cita.' },
        { sol: 'recordatorios', para: 'Con día fijo, el recordatorio sale solo cada mes. Si no puede, lo mueve con un toque en vez de simplemente faltar.', pide: { fija: true } },
      ],
    },

    // ── Comunicación ──
    {
      id: 'preguntan-precio',
      area: 'comunicacion',
      titulo: 'Preguntan cuánto cuestan los brackets y desaparecen',
      senal: 'Mensajes de Facebook y WhatsApp pidiendo precio. Se contestan tarde y casi ninguno agenda.',
      frecuente: true,
      matices: [{ id: 'valoracion', pregunta: '¿Da precios por mensaje sin revisar al paciente?', si: 'Da precios por mensaje', no: 'Primero pide valoración' }],
      rutas: [
        { sol: 'agenda-en-linea', para: 'La respuesta termina con un enlace para apartar la valoración. Quien pregunta a las once de la noche agenda ahí mismo.' },
        { sol: 'respuesta-automatica', para: 'Limpieza, blanqueamiento y el precio base de ortodoncia se contestan solos. Lo que requiere revisión pasa a una persona.', pide: { valoracion: true } },
        { sol: 'seguimiento-prospectos', para: 'Cada persona que preguntó queda anotada. A los tres días alguien le escribe, en vez de darla por perdida.' },
        { sol: 'respuestas-rapidas', para: 'Por qué primero hay que revisar y cuánto cuesta la valoración: ya escrito y bien dicho. Se envía con un toque.', pide: { valoracion: false } },
      ],
    },

    // ── Organización ──
    {
      id: 'radiografias-regadas',
      area: 'organizacion',
      titulo: 'Las radiografías y fotos de los pacientes andan regadas',
      senal: 'El odontograma en una hoja, las radiografías en el celular y las notas en otra carpeta.',
      frecuente: true,
      matices: [{ id: 'pantalla', pregunta: '¿Tiene computadora o tableta junto al sillón?', si: 'Hay pantalla junto al sillón', no: 'Sin pantalla junto al sillón' }],
      rutas: [
        { sol: 'expediente-cliente', para: 'Cada paciente con su ficha: qué se hizo en cada pieza, radiografías y fotos por fecha. Se abre junto al sillón antes de empezar.', pide: { pantalla: true } },
        { sol: 'formatos-digitales', para: 'La historia clínica se llena en una tableta en la sala: alergias, medicamentos, antecedentes. Legible y resguardada.' },
        { sol: 'base-clientes', para: 'Sin pantalla junto al sillón: la lista de pacientes en el celular, con su tratamiento en curso y dónde está su carpeta.', pide: { pantalla: false } },
        { sol: 'proceso-claro', para: 'Lo mínimo: una sola manera de nombrar y guardar las fotos, el mismo día. Que encontrarlas no dependa de la memoria de nadie.' },
      ],
    },
    {
      id: 'consentimientos',
      area: 'organizacion',
      titulo: 'El consentimiento se firma a la carrera, o no se firma',
      senal: 'Hojas sueltas que se firman con el paciente ya en el sillón y después no aparecen.',
      matices: [{ id: 'cirugia', pregunta: '¿Hace extracciones, cirugías o implantes?', si: 'Hace cirugía e implantes', no: 'Tratamientos generales' }],
      rutas: [
        { sol: 'formatos-digitales', para: 'El consentimiento de cada tratamiento se lee y se firma en una tableta antes de pasar. Queda guardado con fecha y hora.' },
        { sol: 'expediente-cliente', para: 'El consentimiento firmado vive en la ficha del paciente, junto a la radiografía y la nota de ese día. Si hace falta, aparece.', pide: { cirugia: true } },
        { sol: 'recordatorios', para: 'Con el recordatorio de la cita llega el formato para leerlo en casa, con calma. En el consultorio solo se firma.' },
        { sol: 'checklist-turnos', para: 'Lo mínimo: una lista por tipo de tratamiento. Antes de anestesiar, la asistente palomea que el consentimiento está firmado.' },
      ],
    },

    // ── Logística ──
    {
      id: 'laboratorio-no-llega',
      area: 'logistica',
      titulo: 'El trabajo del laboratorio no llega para la cita',
      senal: 'El paciente viene por su corona y el laboratorio todavía no la entrega.',
      matices: [{ id: 'fuera', pregunta: '¿El laboratorio dental está en otra ciudad?', si: 'Laboratorio foráneo', no: 'Laboratorio local' }],
      rutas: [
        { sol: 'ordenes-trabajo', para: 'Cada corona o prótesis sale con su orden: paciente, color, laboratorio y fecha prometida. Se ve cuál va atrasada.' },
        { sol: 'seguimiento-pedidos', para: 'Todos los trabajos en un tablero: enviado, en laboratorio, en camino, recibido. Lo que viaja por paquetería no se pierde de vista.', pide: { fuera: true } },
        { sol: 'agenda-interna', para: 'La cita de colocación queda ligada a la llegada del trabajo. Si la corona no ha llegado, se mueve antes de que el paciente venga.' },
        { sol: 'checklist-turnos', para: 'Lo mínimo: cada tarde, revisar qué trabajos se ocupan mañana y llamar al laboratorio por los que faltan.', pide: { fuera: false } },
      ],
    },

    // ── Administración ──
    {
      id: 'quien-me-debe',
      area: 'administracion',
      titulo: 'No sé bien quién me debe ni cuánto',
      senal: 'Abonos anotados en tarjetas o en el expediente. El saldo se saca a mano cada vez.',
      frecuente: true,
      matices: [{ id: 'orto', pregunta: '¿Tiene pacientes de ortodoncia con pago mensual?', si: 'Ortodoncia con mensualidad', no: 'Abonos por tratamiento' }],
      rutas: [
        { sol: 'fiado', para: 'Cada tratamiento con su total, sus abonos y su saldo. Cuando el paciente pregunta cuánto debe, la respuesta sale en segundos.' },
        { sol: 'control-mensualidades', para: 'Los pacientes de ortodoncia en una lista: quién pagó el ajuste del mes, quién debe dos y a quién le toca esta semana.', pide: { orto: true } },
        { sol: 'cobro-en-linea', para: 'El abono se paga con un enlace desde su casa. Ya no depende de que traiga efectivo el día de la cita.' },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: un recordatorio de saldo ya escrito, amable. Se manda antes de la cita y no hay que cobrar junto al sillón.' },
      ],
    },
    {
      id: 'cuenta-de-memoria',
      area: 'administracion',
      titulo: 'La cuenta del día se hace de memoria en la noche',
      senal: 'Efectivo, terminal y transferencias. Usted tiene las manos ocupadas y la asistente cobra como puede.',
      matices: [{ id: 'asistente', pregunta: '¿Cobra la asistente mientras usted atiende?', si: 'Cobra la asistente', no: 'Cobra el doctor' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Cada pago queda registrado con su concepto: limpieza, abono de corona, mensualidad. El recibo sale solo.' },
        { sol: 'tablero-ventas', para: 'Cuánto entró hoy y por qué tratamientos, en su celular. Lo revisa al quitarse los guantes, sin esperar a la noche.' },
        { sol: 'corte-de-caja', para: 'Al cerrar, lo cobrado contra lo contado. La asistente entrega cuentas claras y nadie tiene que adivinar.', pide: { asistente: true } },
        { sol: 'reporte-diario', para: 'Cada noche, un mensaje: pacientes atendidos, cuánto entró por cada medio y qué abonos se recibieron.' },
      ],
    },

    // ── Inventarios ──
    {
      id: 'falta-material',
      area: 'inventarios',
      titulo: 'Noto que falta material con el paciente ya sentado',
      senal: 'Anestesia, resina o puntas que se acaban a media semana. Nadie avisó cuando se abrió la última caja.',
      matices: [{ id: 'deposito', pregunta: '¿Su depósito dental le surte el mismo día?', si: 'Le surten el mismo día', no: 'Le llega por paquetería' }],
      rutas: [
        { sol: 'inventario-alertas', para: 'Cada material con su mínimo, contando los días que tarda la paquetería. El aviso llega cuando todavía hay para la semana.', pide: { deposito: false } },
        { sol: 'compras-sugeridas', para: 'Según los tratamientos del mes, la lista para el depósito se arma sola: cuánta resina, cuántos cartuchos de anestesia.' },
        { sol: 'inventario-escaner', para: 'La asistente registra con el celular lo que llega y cada caja que se abre. Lo anotado coincide con la gaveta.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: una persona responsable del material y un día fijo para pedir. Hoy cada quien avisa cuando se acuerda.' },
      ],
    },
    {
      id: 'material-caduca',
      area: 'inventarios',
      titulo: 'Se me caduca material caro en el cajón',
      senal: 'Resinas, adhesivos y anestesia que vencen antes de usarse. Se descubre al abrirlos.',
      matices: [{ id: 'mayoreo', pregunta: '¿Compra por volumen para aprovechar precio?', si: 'Compra por volumen', no: 'Compra conforme necesita' }],
      rutas: [
        { sol: 'caducidades', para: 'Cada jeringa de resina y cada caja de anestesia entra con su fecha. Lo que vence en dos meses aparece primero.' },
        { sol: 'merma', para: 'Lo que se tira por vencido se anota con su costo. A fin de año se sabe si la oferta del depósito salió cara.' },
        { sol: 'compras-sugeridas', para: 'Comprar por volumen conviene si alcanza a usarse. Con el consumo real se ve cuánta resina vale la pena pedir.', pide: { mayoreo: true } },
        { sol: 'checklist-turnos', para: 'Lo mínimo: una revisión de fechas al mes, con lista. Lo próximo a vencer pasa al frente del cajón.' },
      ],
    },

    // ── Rentabilidad ──
    {
      id: 'que-deja-tratamiento',
      area: 'rentabilidad',
      titulo: 'No sé cuánto me deja cada tratamiento',
      senal: 'El precio se puso viendo a la competencia. El laboratorio y el material subieron; el precio no.',
      matices: [{ id: 'lab', pregunta: '¿Manda trabajos a un laboratorio externo?', si: 'Usa laboratorio externo', no: 'Todo se hace en el consultorio' }],
      rutas: [
        { sol: 'costeo', para: 'Una corona con todo adentro: laboratorio, material y el tiempo de sillón de sus tres citas. Se ve cuánto deja de verdad.' },
        { sol: 'tablero-ventas', para: 'Qué tratamientos se hicieron este mes y cuánto entró por cada uno. Se ve de qué vive el consultorio.' },
        { sol: 'ordenes-trabajo', para: 'Cada trabajo de laboratorio queda con su costo junto al paciente. Deja de ser una nota aparte que se paga a fin de mes.', pide: { lab: true } },
        { sol: 'cotizador', para: 'Los precios en un solo lugar. Cuando sube el laboratorio se ajusta una vez y todos los presupuestos nuevos salen bien.' },
      ],
    },
  ],
}
