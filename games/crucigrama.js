/**
 * crucigrama.js  –  Lógica interactiva de El Crucigrama Musical
 * ═══════════════════════════════════════════════════════════════
 * Desarrollado especialmente para Sofi.
 * Manejo fluido de teclado, navegación en grilla clásica,
 * selección de pistas, feedback visual, audio melódico,
 * confetti de victoria y conexión con gamesBridge.js.
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ── ESTADO GLOBAL DEL JUEGO ──────────────────────────────────
  const state = {
    activeRow: 3,
    activeCol: 2,
    activeDirection: 'across', // 'across' | 'down'
    soundEnabled: true,
    userAnswers: {}, // 'r,c' => letter
    audioCtx: null
  };

  // Timer del salto automático al completar una palabra correcta
  let autoAdvanceTimer = null;

  // Cargar preferencia de sonido
  try {
    const savedSound = localStorage.getItem('crucigrama-sound-enabled');
    if (savedSound !== null) {
      state.soundEnabled = savedSound === 'true';
    }
  } catch (e) { /* ignorar */ }

  // ── WEB AUDIO API SÍNTESIS DE SONIDOS ───────────────────────
  function getAudioContext() {
    if (!state.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        state.audioCtx = new AudioCtx();
      }
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
    return state.audioCtx;
  }

  function playTone(freq, type = 'sine', duration = 0.12, gainLevel = 0.08) {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) { /* Audio policy fallback */ }
  }

  function playKeySound() {
    // Tono suave tipo marimba/tecla
    playTone(523.25, 'sine', 0.09, 0.06); // C5
  }

  function playWordCompleteSound() {
    // Dos notas alegres ascendentes
    setTimeout(() => playTone(659.25, 'sine', 0.14, 0.08), 0);   // E5
    setTimeout(() => playTone(783.99, 'sine', 0.22, 0.09), 110); // G5
  }

  function playErrorSound() {
    // Tono suave bajo de corrección
    playTone(220, 'triangle', 0.25, 0.09); // A3
  }

  function playVictoryFanfare() {
    // Arpegio triunfal dulce de victoria
    const notes = [
      { f: 523.25, d: 150 }, // C5
      { f: 659.25, d: 150 }, // E5
      { f: 783.99, d: 150 }, // G5
      { f: 987.77, d: 180 }, // B5
      { f: 1046.50, d: 500 } // C6
    ];
    let time = 0;
    notes.forEach(n => {
      setTimeout(() => playTone(n.f, 'triangle', n.d / 1000, 0.12), time);
      time += 130;
    });
  }

  // ── INICIALIZACIÓN DEL DOM ──────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initScreens();
    renderGrid();
    renderClues();
    initControls();
    initCanvasParticles();
    initConfettiCanvas();

    // Seleccionar por defecto la primera palabra (3 Horizontal)
    selectWord('across-3');
  });

  // ── GESTIÓN DE PANTALLAS ────────────────────────────────────
  function initScreens() {
    const btnStart = document.getElementById('btn-start-game');
    const btnOpenInstructions = document.getElementById('btn-open-instructions');
    const btnCloseInstructions = document.getElementById('btn-close-instructions');
    const btnCloseInstructionsX = document.getElementById('btn-close-instructions-x');
    const btnRulesQuick = document.getElementById('btn-rules-quick');
    const instructionsModal = document.getElementById('instructions-modal');
    const rewardModal = document.getElementById('reward-modal');
    const btnRewardUnlock = document.getElementById('btn-reward-unlock');
    const btnReturnAdventure = document.getElementById('btn-return-adventure');

    const screenWelcome = document.getElementById('screen-welcome');
    const screenBoard = document.getElementById('screen-board');
    const screenVictory = document.getElementById('screen-victory');

    // Botón COMENZAR -> Muestra la grilla del crucigrama
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        screenWelcome.classList.add('hidden');
        screenBoard.classList.remove('hidden');
        // Enfocar la celda activa inicial
        setTimeout(() => focusActiveCell(), 100);
      });
    }

    // Modal de Instrucciones
    function openInstructions() {
      if (instructionsModal) instructionsModal.classList.remove('hidden');
    }
    function closeInstructions() {
      if (instructionsModal) instructionsModal.classList.add('hidden');
    }

    if (btnOpenInstructions) btnOpenInstructions.addEventListener('click', openInstructions);
    if (btnRulesQuick) btnRulesQuick.addEventListener('click', openInstructions);
    if (btnCloseInstructions) btnCloseInstructions.addEventListener('click', closeInstructions);
    if (btnCloseInstructionsX) btnCloseInstructionsX.addEventListener('click', closeInstructions);

    // Botón para desbloquear y abrir la recompensa
    if (btnRewardUnlock) {
      btnRewardUnlock.addEventListener('click', () => {
        if (rewardModal) rewardModal.classList.remove('hidden');
      });
    }

    // Botón para regresar a la aventura con el juego completado
    if (btnReturnAdventure) {
      btnReturnAdventure.addEventListener('click', () => {
        if (typeof completeGame === 'function') {
          completeGame('crucigrama');
        } else {
          window.location.href = '../index.html?from=game';
        }
      });
    }

    // Toggle de sonido
    const btnSound = document.getElementById('btn-sound-toggle');
    if (btnSound) {
      updateSoundButtonUI();
      btnSound.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        try {
          localStorage.setItem('crucigrama-sound-enabled', String(state.soundEnabled));
        } catch (e) { /* ignorar */ }
        updateSoundButtonUI();
      });
    }

    // Botón limpiar respuestas
    const btnReset = document.getElementById('btn-reset-board');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('¿Querés borrar tus respuestas y empezar de nuevo este crucigrama?')) {
          resetBoard();
        }
      });
    }

    // Botón comprobar solución
    const btnCheck = document.getElementById('btn-check-solution');
    if (btnCheck) {
      btnCheck.addEventListener('click', checkSolution);
    }
  }

  function updateSoundButtonUI() {
    const btnSound = document.getElementById('btn-sound-toggle');
    if (btnSound) {
      btnSound.innerHTML = state.soundEnabled ? '🔊 Sonido' : '🔇 Silencio';
      btnSound.title = state.soundEnabled ? 'Silenciar efectos' : 'Activar efectos de sonido';
    }
  }

  // ── RENDERIZADO DE LA GRILLA ────────────────────────────────
  function renderGrid() {
    const gridContainer = document.getElementById('crucigrama-grid');
    if (!gridContainer) return;
    gridContainer.innerHTML = '';

    const { rows, cols, solutionMap, cellNumbers } = CRUCIGRAMA_CONFIG;

    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const key = `${r},${c}`;
        const isPlayable = Boolean(solutionMap[key]);
        const cell = document.createElement('div');
        cell.className = 'cell' + (isPlayable ? '' : ' black');
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.id = `cell-${r}-${c}`;

        if (isPlayable) {
          // Si tiene número indicador en la esquina
          if (cellNumbers[key]) {
            const numSpan = document.createElement('span');
            numSpan.className = 'cell-number';
            numSpan.textContent = cellNumbers[key];
            cell.appendChild(numSpan);
          }

          // Input interactivo
          const input = document.createElement('input');
          input.className = 'cell-input';
          input.type = 'text';
          input.maxLength = 1;
          input.autocomplete = 'off';
          input.autocapitalize = 'characters';
          input.spellcheck = false;
          input.inputMode = 'text';
          input.dataset.row = r;
          input.dataset.col = c;
          input.id = `input-${r}-${c}`;
          input.setAttribute('aria-label', `Fila ${r}, Columna ${c}`);

          // Eventos de celda
          input.addEventListener('focus', () => onCellFocus(r, c));
          input.addEventListener('click', () => onCellClick(r, c));
          input.addEventListener('keydown', (e) => onCellKeyDown(e, r, c));
          input.addEventListener('input', (e) => onCellInput(e, r, c));

          cell.appendChild(input);
        }

        gridContainer.appendChild(cell);
      }
    }
  }

  // ── RENDERIZADO DE LA LISTA DE PISTAS ───────────────────────
  function renderClues() {
    const listAcross = document.getElementById('clues-list-across');
    const listDown = document.getElementById('clues-list-down');
    if (!listAcross || !listDown) return;

    listAcross.innerHTML = '';
    listDown.innerHTML = '';

    CRUCIGRAMA_CONFIG.words.forEach(word => {
      const item = document.createElement('div');
      item.className = 'clue-item';
      item.id = `clue-item-${word.id}`;
      item.dataset.wordId = word.id;

      item.innerHTML = `
        <div class="clue-number-badge">${word.num}</div>
        <div class="clue-content">
          <div class="clue-desc">${word.clue}</div>
          <div class="clue-meta">${word.length} letras</div>
        </div>
      `;

      item.addEventListener('click', () => {
        selectWord(word.id, true);
        focusActiveCell();
      });

      if (word.direction === 'across') {
        listAcross.appendChild(item);
      } else {
        listDown.appendChild(item);
      }
    });
  }

  // ── NAVEGACIÓN Y SELECCIÓN DE PALABRAS Y CELDAS ──────────────
  function findWordsAt(r, c) {
    return CRUCIGRAMA_CONFIG.words.filter(w =>
      w.cells.some(cell => cell.r === r && cell.c === c)
    );
  }

  function getActiveWord() {
    const words = findWordsAt(state.activeRow, state.activeCol);
    if (words.length === 0) return null;
    const sameDir = words.find(w => w.direction === state.activeDirection);
    return sameDir || words[0];
  }

  function selectWord(wordId, scrollToClue = false) {
    const word = CRUCIGRAMA_CONFIG.words.find(w => w.id === wordId);
    if (!word) return;

    cancelAutoAdvance();
    state.activeDirection = word.direction;

    // Buscar la primera celda vacía de esta palabra o la primera celda
    const firstEmpty = word.cells.find(c => !state.userAnswers[`${c.r},${c.c}`]);
    const targetCell = firstEmpty || word.cells[0];

    state.activeRow = targetCell.r;
    state.activeCol = targetCell.c;

    highlightSelection(scrollToClue);
  }

  function onCellClick(r, c) {
    cancelAutoAdvance();

    // Si hace clic en la celda que ya estaba activa, alternar dirección si cruza 2 palabras
    if (state.activeRow === r && state.activeCol === c) {
      const words = findWordsAt(r, c);
      if (words.length > 1) {
        state.activeDirection = (state.activeDirection === 'across') ? 'down' : 'across';
        highlightSelection();
        return;
      }
    }
    state.activeRow = r;
    state.activeCol = c;
    highlightSelection();
  }

  function onCellFocus(r, c) {
    state.activeRow = r;
    state.activeCol = c;
    highlightSelection();
  }

  function highlightSelection(scrollToClue = false) {
    // Quitar clases previas
    document.querySelectorAll('.cell.active-word').forEach(el => el.classList.remove('active-word'));
    document.querySelectorAll('.cell.active-cell').forEach(el => el.classList.remove('active-cell'));
    document.querySelectorAll('.clue-item.active-clue').forEach(el => el.classList.remove('active-clue'));

    const currentWord = getActiveWord();
    if (!currentWord) return;

    // Resaltar celdas de la palabra activa
    currentWord.cells.forEach(c => {
      const cellEl = document.getElementById(`cell-${c.r}-${c.c}`);
      if (cellEl) cellEl.classList.add('active-word');
    });

    // Resaltar celda activa
    const activeCellEl = document.getElementById(`cell-${state.activeRow}-${state.activeCol}`);
    if (activeCellEl) activeCellEl.classList.add('active-cell');

    // Resaltar pista activa en la lista
    const clueItemEl = document.getElementById(`clue-item-${currentWord.id}`);
    if (clueItemEl) {
      clueItemEl.classList.add('active-clue');
      // Solo desplazar la vista cuando se pidió explícitamente (clic en una pista),
      // nunca al escribir letra por letra.
      if (scrollToClue) {
        clueItemEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    // Actualizar barra de pista activa superior
    updateActiveClueBanner(currentWord);
  }

  function updateActiveClueBanner(word) {
    const dirLabel = word.direction === 'across' ? 'Horizontal' : 'Vertical';
    const badgeEl = document.getElementById('active-clue-badge');
    const textEl = document.getElementById('active-clue-text');
    const lengthEl = document.getElementById('active-clue-length');

    if (badgeEl) badgeEl.textContent = `${word.num} ${dirLabel}`;
    if (textEl) textEl.textContent = word.clue;
    if (lengthEl) lengthEl.textContent = `${word.length} letras`;
  }

  function focusActiveCell() {
    const input = document.getElementById(`input-${state.activeRow}-${state.activeCol}`);
    if (input) {
      input.focus();
      input.select();
    }
  }

  // ── MANEJO DE ENTRADA Y TECLADO ─────────────────────────────
  function onCellKeyDown(e, r, c) {
    cancelAutoAdvance();
    const currentWord = getActiveWord();

    // Navegación por flechas del teclado
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      moveToNextPlayableCell(r, c, 0, 1);
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      moveToNextPlayableCell(r, c, 0, -1);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveToNextPlayableCell(r, c, 1, 0);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveToNextPlayableCell(r, c, -1, 0);
      return;
    }

    // Tecla Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      const input = document.getElementById(`input-${r}-${c}`);
      const key = `${r},${c}`;

      // Si la celda actual tiene letra, la borra
      if (input && input.value !== '') {
        input.value = '';
        delete state.userAnswers[key];
        clearErrorOnCell(r, c);
        updateProgress();
      } else {
        // Si ya estaba vacía, retrocede a la celda anterior y la borra
        if (currentWord) {
          const idx = currentWord.cells.findIndex(cell => cell.r === r && cell.c === c);
          if (idx > 0) {
            const prev = currentWord.cells[idx - 1];
            state.activeRow = prev.r;
            state.activeCol = prev.c;
            highlightSelection();
            const prevInput = document.getElementById(`input-${prev.r}-${prev.c}`);
            if (prevInput) {
              prevInput.value = '';
              delete state.userAnswers[`${prev.r},${prev.c}`];
              clearErrorOnCell(prev.r, prev.c);
              updateProgress();
              prevInput.focus();
            }
          }
        }
      }
      return;
    }

    // Tecla Espacio: alternar orientación si cruza 2 palabras
    if (e.key === ' ') {
      e.preventDefault();
      const words = findWordsAt(r, c);
      if (words.length > 1) {
        state.activeDirection = (state.activeDirection === 'across') ? 'down' : 'across';
        highlightSelection();
      }
      return;
    }

    // Tab o Enter: saltar a la siguiente palabra
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      moveToNextWord(e.shiftKey);
      return;
    }
  }

  function onCellInput(e, r, c) {
    const input = document.getElementById(`input-${r}-${c}`);
    if (!input) return;

    let val = input.value || '';
    if (!val) return;

    // Normalizar letra (sin tildes, mayúscula, solo letras de A a Z)
    val = val.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    val = val.replace(/[^A-Z]/g, '');

    if (val.length === 0) {
      input.value = '';
      return;
    }

    // Tomar el último carácter escrito
    const letter = val.slice(-1);
    input.value = letter;
    state.userAnswers[`${r},${c}`] = letter;

    // Cualquier escritura manual cancela un salto automático pendiente
    cancelAutoAdvance();

    clearErrorOnCell(r, c);
    playKeySound();
    updateProgress();

    const currentWord = getActiveWord();
    if (!currentWord) return;

    // Si la palabra activa quedó correcta, pasar automáticamente a la siguiente pendiente
    if (isWordComplete(currentWord)) {
      checkWordComplete(currentWord);
      return;
    }

    // Avanzar automáticamente a la siguiente celda de la palabra actual
    const idx = currentWord.cells.findIndex(cell => cell.r === r && cell.c === c);
    if (idx !== -1 && idx < currentWord.cells.length - 1) {
      const nextCell = currentWord.cells[idx + 1];
      state.activeRow = nextCell.r;
      state.activeCol = nextCell.c;
      highlightSelection();
      focusActiveCell();
    }
  }

  function clearErrorOnCell(r, c) {
    const cellEl = document.getElementById(`cell-${r}-${c}`);
    if (cellEl) cellEl.classList.remove('error-cell');
    const warning = document.getElementById('board-warning-banner');
    if (warning) warning.classList.add('hidden');
  }

  function moveToNextPlayableCell(r, c, dr, dc) {
    const { rows, cols, solutionMap } = CRUCIGRAMA_CONFIG;
    let currR = r + dr;
    let currC = c + dc;

    while (currR >= 1 && currR <= rows && currC >= 1 && currC <= cols) {
      if (solutionMap[`${currR},${currC}`]) {
        state.activeRow = currR;
        state.activeCol = currC;
        highlightSelection();
        focusActiveCell();
        return;
      }
      currR += dr;
      currC += dc;
    }
  }

  function moveToNextWord(reverse = false) {
    const words = CRUCIGRAMA_CONFIG.words;
    const currentWord = getActiveWord();
    let idx = words.findIndex(w => w.id === (currentWord ? currentWord.id : ''));
    if (idx === -1) idx = 0;

    if (reverse) {
      idx = (idx - 1 + words.length) % words.length;
    } else {
      idx = (idx + 1) % words.length;
    }

    selectWord(words[idx].id);
    focusActiveCell();
  }

  function getWordAnswerString(word) {
    return word.cells.map(cell => state.userAnswers[`${cell.r},${cell.c}`] || '').join('');
  }

  function isWordComplete(word) {
    return getWordAnswerString(word) === word.answer;
  }

  function getNextPendingWord(currentWordId) {
    const words = CRUCIGRAMA_CONFIG.words;
    const startIdx = words.findIndex(w => w.id === currentWordId);
    if (startIdx === -1) return null;

    // Recorrer en el orden de la lista (dando la vuelta) hasta encontrar una palabra pendiente
    for (let offset = 1; offset <= words.length; offset++) {
      const candidate = words[(startIdx + offset) % words.length];
      if (!isWordComplete(candidate)) return candidate;
    }
    return null;
  }

  function cancelAutoAdvance() {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }
  }

  function scheduleAdvanceToNextWord(word) {
    cancelAutoAdvance();
    // Se difiere al siguiente tick para no mover el foco dentro del propio evento de escritura.
    autoAdvanceTimer = setTimeout(() => {
      autoAdvanceTimer = null;
      // Si la palabra dejó de estar correcta (por ejemplo, borraron una letra), no avanzar
      if (!isWordComplete(word)) return;

      const nextWord = getNextPendingWord(word.id);
      if (!nextWord) return;

      selectWord(nextWord.id);
      focusActiveCell();
    }, 0);
  }

  function checkWordComplete(word) {
    // Solo actuar cuando la palabra está 100% correcta
    if (!isWordComplete(word)) return;

    playWordCompleteSound();
    const clueEl = document.getElementById(`clue-item-${word.id}`);
    if (clueEl) clueEl.classList.add('completed-clue');

    scheduleAdvanceToNextWord(word);
  }

  function updateProgress() {
    const total = CRUCIGRAMA_CONFIG.totalLetters;
    const filledCount = Object.keys(state.userAnswers).filter(k => Boolean(state.userAnswers[k])).length;
    const progressEl = document.getElementById('board-progress-text');
    if (progressEl) {
      progressEl.textContent = `${filledCount} de ${total} letras`;
    }

    // Actualizar estado de palabras completadas
    let wordsComplete = 0;
    CRUCIGRAMA_CONFIG.words.forEach(w => {
      let wAns = '';
      w.cells.forEach(c => {
        wAns += (state.userAnswers[`${c.r},${c.c}`] || '');
      });
      const clueEl = document.getElementById(`clue-item-${w.id}`);
      if (wAns === w.answer) {
        wordsComplete++;
        if (clueEl) clueEl.classList.add('completed-clue');
      } else {
        if (clueEl) clueEl.classList.remove('completed-clue');
      }
    });

    const wordsPill = document.getElementById('board-words-progress');
    if (wordsPill) {
      wordsPill.textContent = `${wordsComplete} / 15 palabras`;
    }
  }

  // ── LIMPIAR RESPUESTAS ──────────────────────────────────────
  function resetBoard() {
    state.userAnswers = {};
    document.querySelectorAll('.cell-input').forEach(input => {
      input.value = '';
    });
    document.querySelectorAll('.cell.error-cell').forEach(cell => {
      cell.classList.remove('error-cell');
    });
    document.querySelectorAll('.clue-item.completed-clue').forEach(item => {
      item.classList.remove('completed-clue');
    });
    const warning = document.getElementById('board-warning-banner');
    if (warning) warning.classList.add('hidden');
    updateProgress();
    selectWord('across-3');
    focusActiveCell();
  }

  // ── COMPROBAR SOLUCIÓN ──────────────────────────────────────
  function checkSolution() {
    const { solutionMap, totalLetters } = CRUCIGRAMA_CONFIG;
    const warningBanner = document.getElementById('board-warning-banner');

    // Limpiar errores previos
    document.querySelectorAll('.cell.error-cell').forEach(el => el.classList.remove('error-cell'));

    const filledCount = Object.keys(state.userAnswers).filter(k => Boolean(state.userAnswers[k])).length;

    // 1. Verificar si faltan casillas por rellenar
    if (filledCount < totalLetters) {
      if (warningBanner) {
        warningBanner.classList.remove('hidden');
        warningBanner.innerHTML = `⚠️ <span>Todavía faltan <strong>${totalLetters - filledCount}</strong> letras por completar. ¡Llená todas las palabras antes de comprobar!</span>`;
      }
      playErrorSound();
      return;
    }

    // 2. Verificar exactitud de cada celda
    const errorCells = [];
    Object.keys(solutionMap).forEach(key => {
      const expected = solutionMap[key];
      const actual = state.userAnswers[key] || '';
      if (actual !== expected) {
        const [r, c] = key.split(',').map(Number);
        errorCells.push({ r, c });
      }
    });

    // Si hay errores
    if (errorCells.length > 0) {
      errorCells.forEach(({ r, c }) => {
        const cellEl = document.getElementById(`cell-${r}-${c}`);
        if (cellEl) cellEl.classList.add('error-cell');
      });

      if (warningBanner) {
        warningBanner.classList.remove('hidden');
        warningBanner.innerHTML = `❌ <span>Hay <strong>${errorCells.length}</strong> letras incorrectas marcadas en rojo. ¡Revisalas y corregilas!</span>`;
      }
      playErrorSound();

      // Enfocar el primer error
      const firstErr = errorCells[0];
      state.activeRow = firstErr.r;
      state.activeCol = firstErr.c;
      highlightSelection();
      focusActiveCell();
      return;
    }

    // ── 3. ¡VICTORIA! TODO 100% CORRECTO ──────────────────────
    if (warningBanner) warningBanner.classList.add('hidden');
    triggerVictory();
  }

  function triggerVictory() {
    playVictoryFanfare();
    startConfetti();

    // Ocultar pantalla de juego y mostrar pantalla de victoria
    const screenBoard = document.getElementById('screen-board');
    const screenVictory = document.getElementById('screen-victory');

    setTimeout(() => {
      if (screenBoard) screenBoard.classList.add('hidden');
      if (screenVictory) {
        screenVictory.classList.remove('hidden');
        screenVictory.scrollIntoView({ behavior: 'smooth' });
      }
    }, 600);
  }

  // ── CANVAS DE FONDO CON NOTAS MUSICALES Y ESTRELLAS ─────────
  function initCanvasParticles() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const symbols = ['♪', '♫', '♩', '♬', '★', '✨', '•'];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function createParticles() {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 18000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          symbol: symbols[Math.floor(Math.random() * symbols.length)],
          size: Math.random() * 12 + 10,
          alpha: Math.random() * 0.4 + 0.15,
          speed: Math.random() * 0.4 + 0.15,
          color: Math.random() > 0.5 ? '270, 75%, 70%' : '42, 95%, 65%',
          drift: (Math.random() - 0.5) * 0.3
        });
      }
    }
    createParticles();

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -20) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        ctx.font = `${p.size}px sans-serif`;
        ctx.fillStyle = `hsla(${p.color}, ${p.alpha})`;
        ctx.fillText(p.symbol, p.x, p.y);
      });
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ── CONFETTI DE VICTORIA ────────────────────────────────────
  let confettiAnimationId = null;
  function initConfettiCanvas() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();
  }

  function startConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiPieces = [];
    const colors = [
      '#f59e0b', '#ec4899', '#a855f7', '#38bdf8', '#10b981', '#fbbf24', '#c084fc'
    ];

    for (let i = 0; i < 140; i++) {
      confettiPieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        w: Math.random() * 10 + 6,
        h: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * 3 + 2.5,
        speedX: (Math.random() - 0.5) * 2,
        angle: Math.random() * 360,
        spin: (Math.random() - 0.5) * 6
      });
    }

    function renderConfetti() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiPieces.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.angle += p.spin;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();

        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      });
      confettiAnimationId = requestAnimationFrame(renderConfetti);
    }

    if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
    renderConfetti();

    // Detener suavemente después de 8 segundos
    setTimeout(() => {
      if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }, 8000);
  }

})();
