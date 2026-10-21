/**
 * murdokuConfig.js  –  Configuración centralizada de Murdoku
 * ═══════════════════════════════════════════════════════════════
 * Podés modificar fácilmente cualquiera de estos valores sin
 * alterar el código ni la lógica del juego.
 * ═══════════════════════════════════════════════════════════════
 */

const MURDOKU_CONFIG = {
  // ── 1. SOSPECHOSOS Y FOTOGRAFÍAS ───────────────────────────
  // Los archivos de imagen deben guardarse en la carpeta 'suspects/'
  // con los nombres exactos: kike.png, brenda.png, tito.png, chichi.png
  suspects: {
    kike: {
      id: 'kike',
      code: 'K',
      name: 'Kike',
      filename: 'kike.png',
      badgeColor: '#38bdf8',      // Azul celeste detective
      accentColor: 'hsl(199, 89%, 48%)',
      title: 'El tío Kike',
      initial: 'K'
    },
    brenda: {
      id: 'brenda',
      code: 'B',
      name: 'Brenda',
      filename: 'brenda.png',
      badgeColor: '#ec4899',      // Rosa fucsia
      accentColor: 'hsl(330, 81%, 60%)',
      title: 'Brenda',
      initial: 'B'
    },
    tito: {
      id: 'tito',
      code: 'T',
      name: 'Tito',
      filename: 'tito.png',
      badgeColor: '#f59e0b',      // Ámbar / dorado
      accentColor: 'hsl(38, 92%, 50%)',
      title: 'Tito',
      initial: 'T'
    },
    chichi: {
      id: 'chichi',
      code: 'C',
      name: 'Chichi',
      filename: 'chichi.png',
      badgeColor: '#a855f7',      // Púrpura misterio
      accentColor: 'hsl(271, 91%, 65%)',
      title: 'Chichi',
      initial: 'C'
    }
  },

  // ── 2. TABLERO INICIAL (Pistas fijas) ──────────────────────
  // Matriz 4x4. Cada posición puede ser un id de sospechoso o null.
  // Las casillas con sospechoso son pistas bloqueadas.
  initialBoard: [
    ['kike',   null,     'tito',   'chichi'],
    [null,     'chichi', 'kike',   null    ],
    [null,     'kike',   null,     'tito'  ],
    ['chichi', null,     'brenda', null    ]
  ],

  // ── 3. SOLUCIÓN DETERMINISTA DEL CASO ─────────────────────
  solution: [
    ['kike',   'brenda', 'tito',   'chichi'],
    ['tito',   'chichi', 'kike',   'brenda'],
    ['brenda', 'kike',   'chichi', 'tito'  ],
    ['chichi', 'tito',   'brenda', 'kike'  ]
  ],

  // ── 4. CULPABLE Y MENSAJE DE CASO CERRADO ─────────────────
  culprit: {
    id: 'tito',
    name: 'Tito',
    badge: 'SOSPECHOSO IDENTIFICADO',
    stamp: '¡CULPABLE!',
    title: 'CASO CERRADO',
    headline: 'Caso cerrado. 🔎',
    subheadline: 'Tito escondió el regalo de Sofi.',
    description: 'Y lo peor de todo es que probablemente lo hizo para hacerle una broma. 😈🎁'
  },

  // ── 5. PANTALLA INICIAL (BIENVENIDA) ──────────────────────
  welcome: {
    badge: '🔎 DESAFÍO 1 • MISTERIO DETECTIVESCO',
    title: '🎁 EL MURDOKU DEL REGALO DESAPARECIDO',
    subtitle: '¿Quién escondió el regalo de Sofi?',
    btnStart: '🔎 COMENZAR INVESTIGACIÓN',
    btnInstructions: '📖 INSTRUCCIONES'
  },

  // ── 6. NARRATIVA DEL CASO ─────────────────────────────────
  narrative: {
    title: '🔎 EL CASO DEL REGALO DESAPARECIDO',
    paragraphs: [
      'Era la Confirmación de Sofi.',
      'Todo estaba preparado: comida, música, familia y, sobre todo, el regalo que Sofi llevaba días esperando.',
      'Pero justo antes de entregárselo...',
      'EL REGALO DESAPARECIÓ.',
      'Solamente cuatro personas estuvieron cerca del lugar donde estaba guardado:',
      'Kike, Brenda, Tito y Chichi.',
      'Todos aseguran no saber nada.',
      'Pero alguien está mintiendo.',
      'Tu misión es resolver el Murdoku, reconstruir las pistas y descubrir quién escondió el regalo de Sofi.',
      'Buena suerte, detective. 🕵️'
    ],
    btnInvestigate: '🔍 INVESTIGAR EL CASO'
  },

  // ── 7. INSTRUCCIONES DEL JUEGO ────────────────────────────
  instructions: {
    title: '📖 ¿CÓMO SE JUEGA?',
    intro: 'Este juego funciona como un Sudoku, pero en lugar de números vas a utilizar a los cuatro sospechosos.',
    suspectsTitle: 'Los sospechosos son:',
    rulesTitle: 'Reglas:',
    rules: [
      'El tablero es de 4 × 4.',
      'Cada fila debe contener a los cuatro sospechosos exactamente una vez.',
      'Cada columna debe contener a los cuatro sospechosos exactamente una vez.',
      'Cada cuadrante de 2 × 2 debe contener también a los cuatro sospechosos exactamente una vez.',
      'Las casillas que ya están colocadas son pistas y no pueden modificarse.',
      'Para completar el caso tenés que resolver correctamente todo el tablero.',
      'Cuando el tablero esté completo, se revelará el resultado de la investigación.'
    ],
    btnBack: '← VOLVER AL CASO'
  },

  // ── 8. RECOMPENSA Y DESBLOQUEO ────────────────────────────
  reward: {
    btnLockedText: '🔒 RECOMPENSA BLOQUEADA',
    btnUnlockedText: '🎁 ABRIR RECOMPENSA',
    title: '🎉 ¡Felicitaciones! Descubriste quién escondió el regalo.',
    cardHeading: '🎁 Tu recompensa te está esperando...',
    cardText: '¡Gran trabajo, detective! Has completado el primer desafío con éxito y desenmascaraste a Tito.',
    clueForAdventure: 'Tito escondió el regalo de Sofi para hacerle una broma 😈🎁',
    btnReturnToAdventure: '← Volver a la aventura con el caso resuelto'
  }
};
