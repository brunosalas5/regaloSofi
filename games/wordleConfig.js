/**
 * wordleConfig.js  –  Configuración central de Wordle Musical
 * ─────────────────────────────────────────────────────────────
 * Todo lo editable del juego está acá:
 *   - palabra objetivo y cantidad de intentos
 *   - textos de la recompensa / pista final
 *   - lista de palabras válidas (9 letras, sin tildes)
 *
 * IMPORTANTE: la palabra objetivo existe solo en este archivo
 * y en la lógica. No debe escribirse en el HTML ni en la UI
 * antes de que la jugadora la descubra. Si pierde, tampoco
 * se le revela.
 * ─────────────────────────────────────────────────────────────
 */

const WORDLE_CONFIG = {
  // ── REGLAS ──────────────────────────────────────────────────
  targetWord: 'CONCIERTO',
  wordLength: 9,
  maxAttempts: 4,
  storageKey: 'sofi-wordle-state',

  // ── COLORES (también definidos en wordle.css) ───────────────
  colors: {
    correct: 'hsl(145, 62%, 42%)',
    present: 'hsl(43, 92%, 52%)',
    absent:  'hsl(230, 10%, 26%)',
    empty:   'hsl(230, 30%, 96%)'
  },

  // ── TEXTOS DE CIERRE ────────────────────────────────────────
  victory: {
    title: '🎉 ¡LO ENCONTRASTE! 🎉',
    lead: 'La palabra final era:',
    follow: 'Pero esto recién empieza... ❤️'
  },

  defeat: {
    title: '😅 SE AGOTARON LOS INTENTOS',
    follow: 'No pasa nada. La pista sigue en juego... ¿querés volver a intentarlo? ❤️'
  },

  reward: {
    title: '🎁 La palabra era la pista',
    lead: 'Descubriste la palabra que abre lo que viene:',
    text: 'Guardala bien, porque no es solo una palabra: es la pista de tu recompensa final.',
    // Esta pista es la que se muestra en la pantalla de la aventura
    // cuando el Desafío 3 queda completado (también está en js/main.js).
    clue: 'La palabra era CONCIERTO. Preparate para algo mejor que un concierto 🎟️✨'
  },

  // ── PALABRAS VÁLIDAS ────────────────────────────────────────
  // Palabras en mayúsculas y sin tildes (la Ñ se conserva).
  // Se puede ampliar sin tocar la lógica. Todas deben tener 9 letras.
  validWords: [
    // A
    'ABANDONAR', 'ABORDAJES', 'ABRIGADOS', 'ABRUMADOR', 'ABSOLUTOS', 'ABUNDANTE',
    'ACADEMICO', 'ACCESIBLE', 'ACCIDENTE', 'ACEITUNAS', 'ACELERADO', 'ACEPTABLE',
    'ACERTADOS', 'ACOMPAÑAR', 'ACONSEJAR', 'ACORDARSE', 'ACROBATAS', 'ACTIVIDAD',
    'ACTIVISTA', 'ACUERDATE', 'ADELANTAR', 'ADMIRABLE', 'ADORABLES', 'ADQUIRIDO',
    'AGRADABLE', 'AGRADECER', 'AGUACATES', 'ALBOROTAR', 'ALCANZADO', 'ALEGRARSE',
    'ALFABETOS', 'ALGODONES', 'ALIMENTAR', 'ALMACENES', 'ALMOHADAS', 'ALREDEDOR',
    'ALTERNADO', 'AMARILLOS', 'AMBIENTES', 'AMENAZADO', 'AMIGABLES', 'AMISTADES',
    'ANIMACION', 'ANUNCIADO', 'APARECIDO', 'APARTADOS', 'APELLIDOS', 'APERITIVO',
    'APLAUDIDO', 'APODERADO', 'APRENDIDO', 'APROBADOS', 'ARBOLEDAS', 'ARCHIVADO',
    'ARGUMENTO', 'ARMADURAS', 'AROMATICO', 'ARREGLADO', 'ARRIESGAR', 'ARTESANOS',
    'ARTIFICIO', 'ASAMBLEAS', 'ASEGURADO', 'ASESINATO', 'ASOMBROSO', 'ATARDECER',
    'ATENTADOS', 'ATERRIZAR', 'ATRACCION', 'ATRAPADOS', 'ATREVIDOS', 'AUMENTADO',
    'AUTENTICO', 'AUTOBUSES', 'AUTORIDAD', 'AVALANCHA', 'AVENTURAS', 'AYUDANTES',
    'AZUCARADO',

    // B
    'BANCARIOS', 'BARATIJAS', 'BAUTIZADO', 'BENDICION', 'BENEFICIO', 'BICICLETA',
    'BIENESTAR', 'BILLETERA', 'BIOLOGICO', 'BOLIGRAFO', 'BORRACHOS', 'BRASILEÑO',
    'BRILLANTE', 'BROMISTAS',

    // C
    'CABALGATA', 'CABALLERO', 'CABECERAS', 'CAFETERIA', 'CALABAZAS', 'CALCULADO',
    'CALENTURA', 'CALIDADES', 'CALLEJERO', 'CAMAREROS', 'CAMBIANTE', 'CAMINATAS',
    'CAMIONETA', 'CANELONES', 'CANCIONES', 'CANTANTES', 'CAPITALES', 'CAPITANES', 'CARAMELOS',
    'CARNICERO', 'CARRETERA', 'CARTELERA', 'CASTIGADO', 'CASTILLOS', 'CATALOGOS',
    'CATARATAS', 'CAUTELOSO', 'CELEBRADO', 'CELESTIAL', 'CENTRALES', 'CERRADURA',
    'CHAMPAGNE', 'CHAPARRON', 'CHARLATAN', 'CHIMENEAS', 'CHOCOLATE', 'CIRCUITOS',
    'CLARINETE', 'COCINEROS', 'COINCIDIR', 'COLCHONES', 'COLECCION', 'COLECTIVO',
    'COLEGIALA', 'COLORADOS', 'COMBINADO', 'COMENZADO', 'COMERCIAL', 'COMETIDOS',
    'COMPAÑERO', 'COMPARADO', 'COMPARTIR', 'COMPRADOS', 'COMPRENDE', 'COMUNIDAD',
    'CONCIERTO', 'CONDUCTOR', 'CONECTADO', 'CONFESADO', 'CONFIANZA', 'CONFIRMAR',
    'CONFUNDIR', 'CONGELADO', 'CONOCIDOS', 'CONQUISTA', 'CONSENTIR', 'CONSERVAR',
    'CONTENTOS', 'CONTESTAR', 'CONTINUAR', 'CONTRASTE', 'CONTRATOS', 'CONVENCER',
    'CONVERSAR', 'CORAZONES', 'CORREGIDO', 'COSTUMBRE', 'CRISTALES', 'CRITICADO',
    'CUADRADOS', 'CUADERNOS', 'CUBIERTOS', 'CUCHILLOS', 'CUENTISTA', 'CUIDADOSO',
    'CULTIVADO',

    // D
    'DECORADOS', 'DEDICADOS', 'DELICIOSO', 'DEMASIADO', 'DEPORTIVO', 'DESCANSAR',
    'DESCRIBIR', 'DESCUBRIR', 'DESPEDIDA', 'DESTACADO', 'DESTINADO', 'DETALLADO',
    'DETECTIVE', 'DICIEMBRE', 'DIFERENTE', 'DIFICILES', 'DISCIPULO', 'DIVERTIDO',
    'DIVIDIDOS',

    // E
    'ECONOMICO', 'EDIFICADO', 'EFECTIVOS', 'EMBAJADOR', 'EMOCIONES', 'ENAMORADO',
    'ENCANTADO', 'ENCARGADO', 'ENCONTRAR', 'ENFERMERA', 'ENLOQUECE', 'ENSEÑANZA',
    'ENTERADOS', 'EQUIVOCAR', 'ESCALERAS', 'ESCENARIO', 'ESCONDIDO', 'ESCRITURA',
    'ESCUCHADO', 'ESFUERZOS', 'ESPERANZA', 'ESPERANDO', 'ESTRATEGA', 'ESTRENADO',
    'ESTRELLAS', 'ESTUDIADO', 'EXCELENTE', 'EXCURSION',

    // F
    'FABRICADO', 'FASCINADO', 'FELICIDAD', 'FILOSOFIA', 'FORTALEZA', 'FRAGANCIA',
    'FRECUENTE', 'FRONTERAS', 'FUNCIONAL', 'FURGONETA',

    // G
    'GANADORES', 'GEOGRAFIA', 'GIRASOLES', 'GOLOSINAS', 'GRANJEROS', 'GUITARRAS',

    // H
    'HERMOSURA', 'HISTORIAS', 'HORIZONTE', 'HUMORADAS', 'HURACANES',

    // I
    'IDENTIDAD', 'ILUSIONES', 'IMAGINADO', 'IMITACION', 'IMPOSIBLE', 'IMPRESION',
    'INCENDIOS', 'INCLINADO', 'INCREIBLE', 'INDICADOS', 'INDUSTRIA', 'INFORMADO',
    'INNOVADOR', 'INSPIRADO', 'INSTRUIDO', 'INTENTADO', 'INTERESAR', 'INVENTADO',
    'INVITADOS', 'INTRIGADO',

    // J
    'JARDINERO', 'JOVENCITA', 'JURAMENTO',

    // L
    'LABERINTO', 'LADRILLOS', 'LAVANDERA', 'LEGUMBRES', 'LIDERAZGO', 'LITERARIO',

    // M
    'MADRUGADA', 'MAGNIFICO', 'MALETINES', 'MAMIFEROS', 'MANDARINA', 'MANEJABLE',
    'MANIPULAR', 'MARAVILLA', 'MARIPOSAS', 'MEMORABLE', 'MERMELADA', 'METALICOS',
    'MILAGROSO', 'MINERALES', 'MOLESTIAS', 'MUCHACHOS', 'MUNDIALES', 'MUÑEQUITA',
    'MUSICALES',

    // N
    'NAVEGANDO', 'NECESIDAD', 'NEGOCIADO', 'NUTRICION',

    // O
    'OBJETIVOS', 'OBSERVADO', 'OCASIONAL', 'OFICIALES', 'OLVIDADOS', 'OPORTUNOS',
    'OPTIMISTA', 'ORDENADOS', 'ORGANIZAR', 'ORGULLOSO', 'ORIENTADO', 'OSCURIDAD',

    // P
    'PACIENTES', 'PACIENCIA', 'PALOMITAS', 'PANADERIA', 'PANTALLAS', 'PAPELERIA',
    'PASAJEROS', 'PATROCINA', 'PEDAGOGIA', 'PELICULAS', 'PELIGROSO', 'PENINSULA',
    'PERFECTOS', 'PERIODICO', 'PERMANECE', 'PERMITIDO', 'PERSONAJE', 'PERSUADIR',
    'PERTENECE', 'PESIMISTA', 'POBLACION', 'POPULARES', 'PORTUGUES', 'PREFERIDO',
    'PREGUNTAR', 'PREMIADOS', 'PREOCUPAR', 'PREPARADO', 'PRESENCIA', 'PRESENTAR',
    'PRIMAVERA', 'PRINCIPIO', 'PRIORIDAD', 'PROBLEMAS', 'PROCESADO', 'PRODUCIDO',
    'PROFESORA', 'PROGRAMAR', 'PROHIBIDO', 'PROMETIDO', 'PROPIEDAD', 'PROPOSITO',
    'PROPUESTA', 'PROTEGIDO', 'PROYECTOS', 'PUBLICADO', 'PURIFICAR',

    // R
    'RECONOCER', 'RECORDADO', 'RECORRIDO', 'RECUERDAN', 'RECUPERAR', 'REDACTADO',
    'REFERENTE', 'REFLEXION', 'REGALADOS', 'REGRESADO', 'REQUERIDO', 'RESERVADO',
    'RESPETADO', 'RESPUESTA', 'RESTAURAR', 'RESTREGAR', 'RESULTADO', 'ROMANTICO',

    // S
    'SALUDABLE', 'SANDALIAS', 'SANTUARIO', 'SEGURIDAD', 'SELECCION', 'SEMEJANTE',
    'SENSACION', 'SEÑALIZAR', 'SERPIENTE', 'SIGUIENTE', 'SIMILARES', 'SIMPATICO',
    'SOLAMENTE', 'SOLITARIO', 'SORPRESAS',

    // T
    'TALENTOSO', 'TENTACION', 'TELEVISOR', 'TERMINADO', 'TINIEBLAS', 'TITULARES',
    'TOLERANTE', 'TONELADAS', 'TORNILLOS', 'TRABAJADO', 'TRADICION', 'TRANQUILO',
    'TRANSITAR', 'TRIANGULO', 'TRIUNFADO',

    // U
    'UBICACION', 'UNIVERSAL', 'UTILIZADO',

    // V
    'VELOCIDAD', 'VERSIONES', 'VIBRACION', 'VIGILANTE',

    // Z
    'ZAPATILLA'
  ]
};

// Exponer para pruebas aisladas con Node (la UI usa el global).
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WORDLE_CONFIG;
}
