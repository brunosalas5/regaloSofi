/**
 * crucigramaConfig.js  –  Configuración centralizada de El Crucigrama Musical
 * ═════════════════════════════════════════════════════════════════════════════
 * Grilla clásica interactiva de 20 filas × 19 columnas para Sofi.
 * Contiene todas las palabras, pistas, respuestas verificadas,
 * textos de bienvenida, instrucciones y recompensa final.
 * ═════════════════════════════════════════════════════════════════════════════
 */

const CRUCIGRAMA_CONFIG = {
  // ── 1. DIMENSIONES DE LA GRILLA ──────────────────────────────
  rows: 20,
  cols: 19,
  totalLetters: 99,

  // ── 2. PANTALLA INICIAL (BIENVENIDA) ─────────────────────────
  welcome: {
    badge: '🎵 DESAFÍO 2 • EDICIÓN MUSICAL',
    title: '🎵 EL CRUCIGRAMA MUSICAL',
    subtitle: 'Un crucigrama personalizado para Sofi, lleno de canciones, recuerdos y ritmo.',
    btnStart: '🎶 COMENZAR',
    btnInstructions: '📖 INSTRUCCIONES'
  },

  // ── 3. INSTRUCCIONES DEL JUEGO ───────────────────────────────
  instructions: {
    title: '📖 ¿CÓMO SE JUEGA?',
    intro: [
      'Este es un crucigrama musical.',
      'Cada número corresponde a una palabra que tenés que descubrir a partir de una pista.',
      'Las palabras pueden estar en horizontal o vertical y se cruzan entre sí.',
      'Completá todas las palabras y después comprobá tus respuestas.'
    ],
    rulesTitle: 'Reglas:',
    rules: [
      'Cada casillero blanco corresponde a una letra.',
      'Los casilleros negros separan las palabras.',
      'Los números indican dónde comienza cada palabra.',
      'Las palabras pueden ser horizontales o verticales.',
      'Las respuestas se escriben sin espacios ni tildes.',
      'Podés seleccionar una pista para encontrar rápidamente dónde escribir.',
      'Cuando hayas completado todas las palabras aparecerá el botón para comprobar el crucigrama.',
      'Si hay errores, las respuestas incorrectas se marcarán visualmente para que puedas corregirlas.',
      'Cuando todas las palabras sean correctas, se desbloqueará la recompensa.'
    ],
    btnBack: '← VOLVER'
  },

  // ── 4. RECOMPENSA Y VICTORIA ─────────────────────────────────
  reward: {
    btnLockedText: '🔒 RECOMPENSA BLOQUEADA',
    btnUnlockedText: '🎁 ABRIR RECOMPENSA',
    title: '🎉 ¡Felicitaciones, Sofi!',
    subtitle: 'Descubriste todas las canciones y artistas de nuestro crucigrama.',
    cardHeading: '🎁 Tu recompensa te está esperando...',
    cardText: '¡Excelente oído musical, Sofi! Completaste cada palabra a la perfección, recordando nuestras canciones, los viajes en auto y las previas inolvidables.',
    clueForAdventure: 'Tito dejó una nota musical: ¡El regalo está escondido al ritmo de sus canciones favoritas! 🎵✨',
    btnReturnToAdventure: '← Volver a la aventura con el desafío completado'
  },

  // ── 5. PALABRAS Y PISTAS DEL CRUCIGRAMA ──────────────────────
  words: [
    // ── HORIZONTALES ──
    {
      id: 'across-3',
      num: 3,
      direction: 'across',
      label: '3 Horizontal',
      clue: 'Tu artista favorito (dos palabras).',
      answer: 'MYKETOWERS',
      row: 3,
      col: 2,
      length: 10,
      cells: [
        { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 3, c: 5 }, { r: 3, c: 6 },
        { r: 3, c: 7 }, { r: 3, c: 8 }, { r: 3, c: 9 }, { r: 3, c: 10 }, { r: 3, c: 11 }
      ]
    },
    {
      id: 'across-4',
      num: 4,
      direction: 'across',
      label: '4 Horizontal',
      clue: 'Si me quiero cebar en la previa, pongo un dembow de... (dos palabras).',
      answer: 'ELALFA',
      row: 4,
      col: 14,
      length: 6,
      cells: [
        { r: 4, c: 14 }, { r: 4, c: 15 }, { r: 4, c: 16 }, { r: 4, c: 17 }, { r: 4, c: 18 }, { r: 4, c: 19 }
      ]
    },
    {
      id: 'across-7',
      num: 7,
      direction: 'across',
      label: '7 Horizontal',
      clue: 'El artista se llama como un pequeño fruto comestible de color oscuro.',
      answer: 'MORA',
      row: 8,
      col: 13,
      length: 4,
      cells: [
        { r: 8, c: 13 }, { r: 8, c: 14 }, { r: 8, c: 15 }, { r: 8, c: 16 }
      ]
    },
    {
      id: 'across-8',
      num: 8,
      direction: 'across',
      label: '8 Horizontal',
      clue: 'Cantante del álbum SOUR (nombre).',
      answer: 'OLIVIA',
      row: 10,
      col: 11,
      length: 6,
      cells: [
        { r: 10, c: 11 }, { r: 10, c: 12 }, { r: 10, c: 13 }, { r: 10, c: 14 }, { r: 10, c: 15 }, { r: 10, c: 16 }
      ]
    },
    {
      id: 'across-9',
      num: 9,
      direction: 'across',
      label: '9 Horizontal',
      clue: 'Si quiero escuchar bachata, escucho a... (dos palabras).',
      answer: 'ROMEOSANTOS',
      row: 11,
      col: 1,
      length: 11,
      cells: [
        { r: 11, c: 1 }, { r: 11, c: 2 }, { r: 11, c: 3 }, { r: 11, c: 4 }, { r: 11, c: 5 },
        { r: 11, c: 6 }, { r: 11, c: 7 }, { r: 11, c: 8 }, { r: 11, c: 9 }, { r: 11, c: 10 }, { r: 11, c: 11 }
      ]
    },
    {
      id: 'across-12',
      num: 12,
      direction: 'across',
      label: '12 Horizontal',
      clue: 'Corrido tumbado que más escuchamos en el último tiempo (dos palabras).',
      answer: 'QUEONDA',
      row: 13,
      col: 12,
      length: 7,
      cells: [
        { r: 13, c: 12 }, { r: 13, c: 13 }, { r: 13, c: 14 }, { r: 13, c: 15 }, { r: 13, c: 16 }, { r: 13, c: 17 }, { r: 13, c: 18 }
      ]
    },
    {
      id: 'across-14',
      num: 14,
      direction: 'across',
      label: '14 Horizontal',
      clue: 'Artista de la última canción agregada a 🚗🚗🚗.',
      answer: 'BRYTIAGO',
      row: 16,
      col: 9,
      length: 8,
      cells: [
        { r: 16, c: 9 }, { r: 16, c: 10 }, { r: 16, c: 11 }, { r: 16, c: 12 }, { r: 16, c: 13 }, { r: 16, c: 14 }, { r: 16, c: 15 }, { r: 16, c: 16 }
      ]
    },
    {
      id: 'across-15',
      num: 15,
      direction: 'across',
      label: '15 Horizontal',
      clue: 'Uno de los artistas más conocidos de Puerto Rico.',
      answer: 'OZUNA',
      row: 18,
      col: 6,
      length: 5,
      cells: [
        { r: 18, c: 6 }, { r: 18, c: 7 }, { r: 18, c: 8 }, { r: 18, c: 9 }, { r: 18, c: 10 }
      ]
    },

    // ── VERTICALES ──
    {
      id: 'down-1',
      num: 1,
      direction: 'down',
      label: '1 Vertical',
      clue: 'La mejor banda de cuarteto.',
      answer: 'DESAKATADOS',
      row: 1,
      col: 11,
      length: 11,
      cells: [
        { r: 1, c: 11 }, { r: 2, c: 11 }, { r: 3, c: 11 }, { r: 4, c: 11 }, { r: 5, c: 11 },
        { r: 6, c: 11 }, { r: 7, c: 11 }, { r: 8, c: 11 }, { r: 9, c: 11 }, { r: 10, c: 11 }, { r: 11, c: 11 }
      ]
    },
    {
      id: 'down-2',
      num: 2,
      direction: 'down',
      label: '2 Vertical',
      clue: 'Artista favorito de tu padrino.',
      answer: 'QUEVEDO',
      row: 2,
      col: 14,
      length: 7,
      cells: [
        { r: 2, c: 14 }, { r: 3, c: 14 }, { r: 4, c: 14 }, { r: 5, c: 14 }, { r: 6, c: 14 }, { r: 7, c: 14 }, { r: 8, c: 14 }
      ]
    },
    {
      id: 'down-5',
      num: 5,
      direction: 'down',
      label: '5 Vertical',
      clue: 'Banda de «Como eran las cosas».',
      answer: 'BABASONICOS',
      row: 7,
      col: 16,
      length: 11,
      cells: [
        { r: 7, c: 16 }, { r: 8, c: 16 }, { r: 9, c: 16 }, { r: 10, c: 16 }, { r: 11, c: 16 },
        { r: 12, c: 16 }, { r: 13, c: 16 }, { r: 14, c: 16 }, { r: 15, c: 16 }, { r: 16, c: 16 }, { r: 17, c: 16 }
      ]
    },
    {
      id: 'down-6',
      num: 6,
      direction: 'down',
      label: '6 Vertical',
      clue: 'Cantante de «Ella baila sola».',
      answer: 'PESOPLUMA',
      row: 8,
      col: 5,
      length: 9,
      cells: [
        { r: 8, c: 5 }, { r: 9, c: 5 }, { r: 10, c: 5 }, { r: 11, c: 5 }, { r: 12, c: 5 },
        { r: 13, c: 5 }, { r: 14, c: 5 }, { r: 15, c: 5 }, { r: 16, c: 5 }
      ]
    },
    {
      id: 'down-10',
      num: 10,
      direction: 'down',
      label: '10 Vertical',
      clue: 'Ciro y los...',
      answer: 'PERSAS',
      row: 12,
      col: 14,
      length: 6,
      cells: [
        { r: 12, c: 14 }, { r: 13, c: 14 }, { r: 14, c: 14 }, { r: 15, c: 14 }, { r: 16, c: 14 }, { r: 17, c: 14 }
      ]
    },
    {
      id: 'down-11',
      num: 11,
      direction: 'down',
      label: '11 Vertical',
      clue: 'El Conejo Malo (dos palabras).',
      answer: 'BADBUNNY',
      row: 13,
      col: 9,
      length: 8,
      cells: [
        { r: 13, c: 9 }, { r: 14, c: 9 }, { r: 15, c: 9 }, { r: 16, c: 9 }, { r: 17, c: 9 },
        { r: 18, c: 9 }, { r: 19, c: 9 }, { r: 20, c: 9 }
      ]
    },
    {
      id: 'down-13',
      num: 13,
      direction: 'down',
      label: '13 Vertical',
      clue: 'Artista de NUESTRA canción.',
      answer: 'ANUEL',
      row: 13,
      col: 18,
      length: 5,
      cells: [
        { r: 13, c: 18 }, { r: 14, c: 18 }, { r: 15, c: 18 }, { r: 16, c: 18 }, { r: 17, c: 18 }
      ]
    }
  ],

  // ── 6. SOLUCIÓN COMPLETA DE CADA CASILLERO ('r,c' => LETRA) ──
  solutionMap: {
    // Row 1
    '1,11': 'D',
    // Row 2
    '2,11': 'E', '2,14': 'Q',
    // Row 3
    '3,2': 'M', '3,3': 'Y', '3,4': 'K', '3,5': 'E', '3,6': 'T', '3,7': 'O', '3,8': 'W', '3,9': 'E', '3,10': 'R', '3,11': 'S',
    '3,14': 'U',
    // Row 4
    '4,11': 'A',
    '4,14': 'E', '4,15': 'L', '4,16': 'A', '4,17': 'L', '4,18': 'F', '4,19': 'A',
    // Row 5
    '5,11': 'K', '5,14': 'V',
    // Row 6
    '6,11': 'A', '6,14': 'E',
    // Row 7
    '7,11': 'T', '7,14': 'D', '7,16': 'B',
    // Row 8
    '8,5': 'P', '8,11': 'A', '8,13': 'M', '8,14': 'O', '8,15': 'R', '8,16': 'A',
    // Row 9
    '9,5': 'E', '9,11': 'D', '9,16': 'B',
    // Row 10
    '10,5': 'S', '10,11': 'O', '10,12': 'L', '10,13': 'I', '10,14': 'V', '10,15': 'I', '10,16': 'A',
    // Row 11
    '11,1': 'R', '11,2': 'O', '11,3': 'M', '11,4': 'E', '11,5': 'O', '11,6': 'S', '11,7': 'A', '11,8': 'N', '11,9': 'T', '11,10': 'O', '11,11': 'S',
    '11,16': 'S',
    // Row 12
    '12,5': 'P', '12,14': 'P', '12,16': 'O',
    // Row 13
    '13,5': 'L', '13,9': 'B', '13,12': 'Q', '13,13': 'U', '13,14': 'E', '13,15': 'O', '13,16': 'N', '13,17': 'D', '13,18': 'A',
    // Row 14
    '14,5': 'U', '14,9': 'A', '14,14': 'R', '14,16': 'I', '14,18': 'N',
    // Row 15
    '15,5': 'M', '15,9': 'D', '15,14': 'S', '15,16': 'C', '15,18': 'U',
    // Row 16
    '16,5': 'A', '16,9': 'B', '16,10': 'R', '16,11': 'Y', '16,12': 'T', '16,13': 'I', '16,14': 'A', '16,15': 'G', '16,16': 'O',
    '16,18': 'E',
    // Row 17
    '17,9': 'U', '17,14': 'S', '17,16': 'S', '17,18': 'L',
    // Row 18
    '18,6': 'O', '18,7': 'Z', '18,8': 'U', '18,9': 'N', '18,10': 'A',
    // Row 19
    '19,9': 'N',
    // Row 20
    '20,9': 'Y'
  },

  // ── 7. NÚMEROS DE CELDA INICIAL ('r,c' => NÚMERO) ────────────
  cellNumbers: {
    '1,11': 1,
    '2,14': 2,
    '3,2': 3,
    '4,14': 4,
    '7,16': 5,
    '8,5': 6,
    '8,13': 7,
    '10,11': 8,
    '11,1': 9,
    '12,14': 10,
    '13,9': 11,
    '13,12': 12,
    '13,18': 13,
    '16,9': 14,
    '18,6': 15
  }
};
