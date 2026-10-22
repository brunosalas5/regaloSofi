/**
 * wordle.js  –  Lógica de interfaz de Wordle Musical
 * ─────────────────────────────────────────────────────────────
 * - Pantallas: home → intro → game → victory | gameover
 * - Tablero de 4 filas × 9 columnas
 * - Teclado físico, virtual y input nativo en mobile
 * - Evaluación con letras repetidas (ver wordleLogic.js)
 * - Persistencia en localStorage
 * ─────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  const CFG = WORDLE_CONFIG;
  const Logic = window.WordleLogic;

  const MAX = CFG.maxAttempts;
  const LEN = CFG.wordLength;

  const KEY_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  const state = {
    screen: 'home',
    currentRow: 0,
    currentGuess: '',
    guesses: [],
    results: [],
    keyboardState: {},
    gameStatus: 'playing',
    isEvaluating: false
  };

  const els = {};
  let toastTimer = null;
  let confettiTimer = null;
  let confettiFrame = null;
  const evaluationTimers = [];

  // ── ARRANQUE ────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    cacheElements();
    buildBoard();
    buildKeyboard();
    bindEvents();
    initConfetti();

    restoreOrStart();
  }

  function cacheElements() {
    els.screens = {
      home: document.getElementById('screen-home'),
      intro: document.getElementById('screen-intro'),
      game: document.getElementById('screen-game'),
      victory: document.getElementById('screen-victory'),
      gameover: document.getElementById('screen-gameover')
    };

    els.board = document.getElementById('wordle-board');
    els.keyboard = document.getElementById('wordle-keyboard');
    els.toast = document.getElementById('wordle-toast');
    els.attempts = document.getElementById('wordle-attempts');
    els.nativeInput = document.getElementById('wordle-native-input');

    els.victoryWord = document.getElementById('victory-word');
    els.victoryAttempts = document.getElementById('victory-attempts');

    els.instructionsModal = document.getElementById('instructions-modal');
    els.rewardModal = document.getElementById('reward-modal');
    els.resetModal = document.getElementById('reset-modal');

    els.rewardWord = document.getElementById('reward-word');
    els.rewardClue = document.getElementById('reward-clue');

    els.confetti = document.getElementById('wordle-confetti');

    els.btnOpenReward = document.getElementById('btn-open-reward');
    els.btnRestart = document.getElementById('btn-restart');
  }

  // ── CONSTRUCCIÓN DEL TABLERO Y TECLADO ──────────────────────
  function buildBoard() {
    els.board.innerHTML = '';

    for (let row = 0; row < MAX; row++) {
      for (let col = 0; col < LEN; col++) {
        const cell = document.createElement('div');
        cell.className = 'wordle-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.setAttribute('role', 'gridcell');
        updateCellAria(cell, '', null);
        els.board.appendChild(cell);
      }
    }
  }

  function buildKeyboard() {
    els.keyboard.innerHTML = '';

    KEY_ROWS.forEach(rowKeys => {
      const row = document.createElement('div');
      row.className = 'wordle-keyboard-row';

      rowKeys.forEach(key => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'wordle-key';
        btn.dataset.key = key;

        if (key === 'ENTER') {
          btn.textContent = 'ENTER';
          btn.classList.add('wide');
          btn.setAttribute('aria-label', 'Confirmar intento');
        } else if (key === 'BACKSPACE') {
          btn.textContent = '⌫';
          btn.classList.add('wide');
          btn.setAttribute('aria-label', 'Borrar última letra');
        } else {
          btn.textContent = key;
          btn.setAttribute('aria-label', `${key}, sin usar`);
        }

        btn.addEventListener('click', () => onVirtualKey(key));
        row.appendChild(btn);
      });

      els.keyboard.appendChild(row);
    });
  }

  // ── EVENTOS ─────────────────────────────────────────────────
  function bindEvents() {
    // Botones de navegación / pantallas
    document.getElementById('btn-start').addEventListener('click', () => showScreen('intro'));
    document.getElementById('btn-intro-back').addEventListener('click', () => showScreen('home'));
    document.getElementById('btn-intro-start').addEventListener('click', startNewGame);

    // Instrucciones
    document.getElementById('btn-instructions').addEventListener('click', () => openModal(els.instructionsModal));
    document.getElementById('btn-game-instructions').addEventListener('click', () => openModal(els.instructionsModal));
    document.getElementById('btn-close-instructions').addEventListener('click', () => closeModal(els.instructionsModal));
    document.getElementById('btn-close-instructions-x').addEventListener('click', () => closeModal(els.instructionsModal));

    // Reinicio desde la pantalla de juego
    document.getElementById('btn-game-reset').addEventListener('click', () => openModal(els.resetModal));

    // Recompensa
    els.btnOpenReward.addEventListener('click', () => openModal(els.rewardModal));
    document.getElementById('btn-return-adventure').addEventListener('click', returnToAdventure);

    // Jugar de nuevo desde la pantalla de victoria
    document.getElementById('btn-victory-reset').addEventListener('click', () => openModal(els.resetModal));

    // Reinicio (disponible en juego y en la pantalla de derrota)
    els.btnRestart.addEventListener('click', () => openModal(els.resetModal));
    document.getElementById('btn-reset-cancel').addEventListener('click', () => closeModal(els.resetModal));
    document.getElementById('btn-reset-confirm').addEventListener('click', () => {
      closeModal(els.resetModal);
      resetGame();
    });

    // Cerrar modales tocando el fondo
    [els.instructionsModal, els.rewardModal, els.resetModal].forEach(modal => {
      modal.addEventListener('click', e => {
        if (e.target === modal) closeModal(modal);
      });
    });

    // Teclado físico
    document.addEventListener('keydown', onKeyDown);

    // Teclado nativo (mobile)
    els.nativeInput.addEventListener('input', onNativeInput);

    // En mobile, tocar el tablero habilita el teclado nativo
    els.board.addEventListener('pointerdown', () => {
      if (isCoarsePointer() && state.screen === 'game' && state.gameStatus === 'playing' && !state.isEvaluating) {
        try {
          els.nativeInput.focus({ preventScroll: true });
        } catch (e) {
          els.nativeInput.focus();
        }
      }
    });
  }

  function onKeyDown(e) {
    if (isAnyModalOpen()) {
      if (e.key === 'Escape') closeAllModals();
      return;
    }

    if (state.screen !== 'game' || state.gameStatus !== 'playing') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const typingInNativeInput = e.target === els.nativeInput;

    if (e.key === 'Enter') {
      e.preventDefault();
      submitGuess();
      return;
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      removeLetter();
      return;
    }

    // Si el foco está en el input oculto, las letras llegan por su evento "input".
    if (typingInNativeInput) return;

    if (/^[a-zñ]$/i.test(e.key)) {
      e.preventDefault();
      addLetter(Logic.normalizeWord(e.key));
    }
  }

  function onNativeInput() {
    const raw = els.nativeInput.value;
    els.nativeInput.value = '';

    if (state.screen !== 'game' || state.gameStatus !== 'playing' || state.isEvaluating) return;

    const normalized = Logic.normalizeWord(raw);
    if (!normalized) return;

    // Solo se toma el último caracter (evita autocompletados o pegados raros).
    addLetter(normalized.slice(-1));
  }

  function onVirtualKey(key) {
    if (state.screen !== 'game' || state.gameStatus !== 'playing' || state.isEvaluating) return;

    if (key === 'ENTER') {
      submitGuess();
      return;
    }

    if (key === 'BACKSPACE') {
      removeLetter();
      return;
    }

    addLetter(key);
  }

  // ── ENTRADA DE LETRAS ───────────────────────────────────────
  function addLetter(letter) {
    if (!letter || state.isEvaluating) return;
    if (state.screen !== 'game' || state.gameStatus !== 'playing') return;
    if (state.currentGuess.length >= LEN) return;

    state.currentGuess += letter;
    renderCurrentGuess();
    saveState();
  }

  function removeLetter() {
    if (state.isEvaluating || !state.currentGuess) return;
    state.currentGuess = state.currentGuess.slice(0, -1);
    renderCurrentGuess();
    saveState();
  }

  function renderCurrentGuess() {
    if (state.currentRow >= MAX) return;

    const cells = getRowCells(state.currentRow);

    cells.forEach((cell, index) => {
      const letter = state.currentGuess[index] || '';
      const changed = cell.textContent !== letter;

      cell.textContent = letter;
      cell.classList.toggle('filled', Boolean(letter));
      cell.classList.remove('correct', 'present', 'absent');
      updateCellAria(cell, letter, null);

      if (changed && letter) {
        cell.classList.remove('pop');
        void cell.offsetWidth;
        cell.classList.add('pop');
      }
    });
  }

  // ── CONFIRMACIÓN DEL INTENTO ────────────────────────────────
  function submitGuess() {
    if (state.isEvaluating || state.gameStatus !== 'playing') return;

    const guess = state.currentGuess;

    if (guess.length < LEN) {
      showToast('⚠️ FALTAN LETRAS', 'warning');
      shakeCurrentRow();
      vibrate();
      return;
    }

    if (!Logic.validateWord(guess, CFG.validWords)) {
      showToast('❌ PALABRA NO VÁLIDA', 'error');
      shakeCurrentRow();
      vibrate();
      return;
    }

    const results = Logic.evaluateGuess(guess, CFG.targetWord);
    const row = state.currentRow;

    state.isEvaluating = true;
    state.guesses.push(guess);
    state.results.push(results);
    state.keyboardState = Logic.mergeKeyboardState(state.keyboardState, guess, results);
    state.currentRow = row + 1;
    state.currentGuess = '';
    saveState();

    paintRow(row, guess, results, true);

    const wait = (LEN - 1) * 65 + 560;
    evaluationTimers.push(setTimeout(() => finishEvaluation(guess), wait));
  }

  function finishEvaluation(guess) {
    state.isEvaluating = false;
    renderKeyboard();
    updateAttempts();

    const status = checkGameStatus(guess);

    if (status === 'won') {
      showVictory(true);
      return;
    }

    if (status === 'lost') {
      showGameOver();
      return;
    }

    renderCurrentGuess();
  }

  function checkGameStatus(guess) {
    if (Logic.isWinningGuess(guess, CFG.targetWord)) return 'won';
    if (state.guesses.length >= MAX) return 'lost';
    return 'playing';
  }

  // ── PINTADO DEL TABLERO ─────────────────────────────────────
  function paintRow(row, guess, results, animate) {
    const cells = getRowCells(row);
    const letters = guess.split('');

    cells.forEach((cell, index) => {
      cell.textContent = letters[index] || '';
      cell.classList.toggle('filled', Boolean(letters[index]));
      cell.classList.remove('flipping', 'correct', 'present', 'absent');

      if (!animate) {
        applyCellState(cell, results[index], letters[index]);
      }
    });

    if (!animate) return;

    cells.forEach((cell, index) => {
      evaluationTimers.push(setTimeout(() => {
        cell.classList.add('flipping');
      }, index * 65));

      evaluationTimers.push(setTimeout(() => {
        applyCellState(cell, results[index], letters[index]);
      }, index * 65 + 210));

      evaluationTimers.push(setTimeout(() => {
        cell.classList.remove('flipping');
      }, index * 65 + 500));
    });
  }

  function applyCellState(cell, status, letter) {
    cell.classList.remove('correct', 'present', 'absent');
    if (status) cell.classList.add(status);
    updateCellAria(cell, letter || '', status || null);
  }

  function updateCellAria(cell, letter, status) {
    const row = Number(cell.dataset.row) + 1;
    const col = Number(cell.dataset.col) + 1;
    const labels = {
      correct: 'lugar correcto',
      present: 'está en la palabra, en otra posición',
      absent: 'no está en la palabra'
    };

    let description = `Fila ${row}, columna ${col}, `;
    description += letter ? `letra ${letter}` : 'vacía';
    if (status && labels[status]) description += `, ${labels[status]}`;

    cell.setAttribute('aria-label', description);
  }

  function getRowCells(row) {
    return Array.from(els.board.querySelectorAll(`.wordle-cell[data-row="${row}"]`));
  }

  function shakeCurrentRow() {
    getRowCells(state.currentRow).forEach(cell => {
      cell.classList.remove('shake');
      void cell.offsetWidth;
      cell.classList.add('shake');
      setTimeout(() => cell.classList.remove('shake'), 420);
    });
  }

  function clearRow(row) {
    if (row >= MAX) return;
    getRowCells(row).forEach(cell => {
      cell.textContent = '';
      cell.classList.remove('filled', 'correct', 'present', 'absent', 'pop', 'shake', 'celebrate');
      updateCellAria(cell, '', null);
    });
  }

  // ── ESTADO DEL TECLADO ──────────────────────────────────────
  function renderKeyboard() {
    els.keyboard.querySelectorAll('.wordle-key').forEach(btn => {
      const key = btn.dataset.key;
      if (!key || key.length !== 1) return;

      const status = state.keyboardState[key];
      btn.classList.remove('correct', 'present', 'absent');

      if (status) btn.classList.add(status);

      const labels = {
        correct: 'lugar correcto',
        present: 'está en la palabra, en otra posición',
        absent: 'no está en la palabra'
      };

      btn.setAttribute('aria-label', `${key}, ${status ? labels[status] : 'sin usar'}`);
      btn.dataset.state = status || 'unused';
    });
  }

  function updateAttempts() {
    if (!els.attempts) return;

    if (state.gameStatus === 'playing') {
      const attempt = Math.min(state.currentRow + 1, MAX);
      els.attempts.textContent = `Intento ${attempt} de ${MAX}`;
    } else if (state.gameStatus === 'won') {
      els.attempts.textContent = '¡Resuelto!';
    } else {
      els.attempts.textContent = 'Sin intentos';
    }
  }

  // ── FIN DEL JUEGO ───────────────────────────────────────────
  function showVictory(celebrate) {
    state.gameStatus = 'won';
    state.isEvaluating = false;
    updateAttempts();
    saveState();

    renderResultWord(els.victoryWord, CFG.targetWord);
    els.victoryAttempts.textContent = state.guesses.length === 1
      ? '¡La encontraste al primer intento!'
      : `La encontraste en el intento ${state.guesses.length} de ${MAX}.`;

    // La palabra y la pista recién se escriben en el DOM al ganar.
    els.rewardWord.textContent = CFG.targetWord;
    els.rewardClue.textContent = CFG.reward.clue;

    showScreen('victory');

    if (celebrate) {
      const lastRow = Math.max(0, state.guesses.length - 1);
      getRowCells(lastRow).forEach((cell, index) => {
        setTimeout(() => cell.classList.add('celebrate'), index * 55);
      });
      startConfetti();
    }
  }

  function showGameOver() {
    state.gameStatus = 'lost';
    state.isEvaluating = false;
    updateAttempts();
    saveState();

    // No se revela la palabra: la jugadora puede volver a intentarlo.
    showScreen('gameover');
  }

  function renderResultWord(container, word) {
    if (!container) return;
    container.innerHTML = '';
    word.split('').forEach(letter => {
      const tile = document.createElement('span');
      tile.className = 'wordle-result-tile';
      tile.textContent = letter;
      container.appendChild(tile);
    });
  }

  function startNewGame() {
    resetGame();
  }

  function resetGame() {
    cancelEvaluationTimers();

    state.currentRow = 0;
    state.currentGuess = '';
    state.guesses = [];
    state.results = [];
    state.keyboardState = {};
    state.gameStatus = 'playing';
    state.isEvaluating = false;

    stopConfetti();
    hideToast();
    els.board.querySelectorAll('.wordle-cell').forEach(cell => {
      cell.textContent = '';
      cell.className = 'wordle-cell';
      updateCellAria(cell, '', null);
    });

    els.nativeInput.value = '';
    renderKeyboard();
    updateAttempts();
    showScreen('game');
    saveState();
  }

  function cancelEvaluationTimers() {
    while (evaluationTimers.length) {
      clearTimeout(evaluationTimers.pop());
    }
  }

  // ── PANTALLAS Y MODALES ─────────────────────────────────────
  function showScreen(name) {
    Object.keys(els.screens).forEach(key => {
      const screen = els.screens[key];
      if (screen) screen.classList.toggle('hidden', key !== name);
    });

    state.screen = name;

    if (name !== 'game') {
      closeAllModals();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function openModal(modal) {
    if (!modal) return;
    hideToast();
    modal.classList.remove('hidden');
  }

  function closeModal(modal) {
    if (modal) modal.classList.add('hidden');
  }

  function closeAllModals() {
    [els.instructionsModal, els.rewardModal, els.resetModal].forEach(closeModal);
  }

  function isAnyModalOpen() {
    return [els.instructionsModal, els.rewardModal, els.resetModal].some(modal => {
      return modal && !modal.classList.contains('hidden');
    });
  }

  function returnToAdventure() {
    if (typeof completeGame === 'function') {
      completeGame('tercerjuego');
    } else {
      window.location.href = '../index.html?from=game';
    }
  }

  // ── FEEDBACK ────────────────────────────────────────────────
  function showToast(message, type) {
    if (!els.toast) return;

    els.toast.textContent = message;
    els.toast.className = 'wordle-toast visible' + (type ? ' ' + type : '');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 1800);
  }

  function hideToast() {
    if (!els.toast) return;
    clearTimeout(toastTimer);
    els.toast.classList.remove('visible');
  }

  function vibrate() {
    if (navigator.vibrate) {
      try {
        navigator.vibrate([18, 30, 18]);
      } catch (e) { /* ignorar */ }
    }
  }

  function isCoarsePointer() {
    return window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  }

  // ── PERSISTENCIA ────────────────────────────────────────────
  function saveState() {
    try {
      localStorage.setItem(CFG.storageKey, JSON.stringify({
        targetWord: CFG.targetWord,
        currentRow: state.currentRow,
        currentGuess: state.currentGuess,
        guesses: state.guesses,
        results: state.results,
        keyboardState: state.keyboardState,
        gameStatus: state.gameStatus
      }));
    } catch (e) { /* localStorage no disponible */ }
  }

  function loadSavedState() {
    try {
      const raw = localStorage.getItem(CFG.storageKey);
      if (!raw) return null;

      const data = JSON.parse(raw);
      if (!data || data.targetWord !== CFG.targetWord) {
        localStorage.removeItem(CFG.storageKey);
        return null;
      }

      if (!Array.isArray(data.guesses)) return null;

      let guesses = data.guesses
        .filter(g => typeof g === 'string' && Logic.normalizeWord(g).length === LEN)
        .slice(0, MAX);

      // El estado se reconstruye desde las jugadas reales: no se confía
      // ciegamente en el gameStatus ni en los results guardados.
      const winningIndex = guesses.findIndex(g => Logic.isWinningGuess(g, CFG.targetWord));
      if (winningIndex !== -1) guesses = guesses.slice(0, winningIndex + 1);

      const results = guesses.map(g => Logic.evaluateGuess(g, CFG.targetWord));
      const gameStatus = winningIndex !== -1
        ? 'won'
        : (guesses.length >= MAX ? 'lost' : 'playing');

      const currentGuess = gameStatus === 'playing' && typeof data.currentGuess === 'string'
        ? Logic.normalizeWord(data.currentGuess).slice(0, LEN)
        : '';

      return {
        guesses,
        results,
        gameStatus,
        currentGuess,
        currentRow: guesses.length
      };
    } catch (e) {
      return null;
    }
  }

  function applySavedState(saved) {
    state.guesses = saved.guesses;
    state.results = saved.results;
    state.gameStatus = saved.gameStatus;
    state.currentRow = saved.currentRow;
    state.currentGuess = saved.currentGuess;
    state.keyboardState = {};

    state.guesses.forEach((guess, index) => {
      state.keyboardState = Logic.mergeKeyboardState(state.keyboardState, guess, state.results[index]);
    });

    state.guesses.forEach((guess, index) => {
      paintRow(index, guess, state.results[index], false);
    });

    renderKeyboard();
    updateAttempts();

    if (state.gameStatus === 'won') {
      showVictory(false);
    } else if (state.gameStatus === 'lost') {
      showGameOver();
    } else {
      showScreen('game');
      renderCurrentGuess();
    }
  }

  function restoreOrStart() {
    const saved = loadSavedState();
    if (saved) {
      applySavedState(saved);
    } else {
      showScreen('home');
    }
  }

  // ── CONFETI DE VICTORIA ─────────────────────────────────────
  function initConfetti() {
    if (!els.confetti) return;

    const resize = () => {
      els.confetti.width = window.innerWidth;
      els.confetti.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);
  }

  function startConfetti() {
    if (!els.confetti) return;

    stopConfetti();

    const canvas = els.confetti;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#f59e0b', '#ec4899', '#a855f7', '#38bdf8', '#10b981', '#fbbf24', '#c084fc'];
    const symbols = ['♪', '♫', '★', '✦', '•'];
    const pieces = [];

    for (let i = 0; i < 110; i++) {
      const isSymbol = Math.random() > 0.55;
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        w: Math.random() * 9 + 5,
        h: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        symbol: isSymbol ? symbols[Math.floor(Math.random() * symbols.length)] : null,
        size: Math.random() * 16 + 12,
        speedY: Math.random() * 2.8 + 2,
        speedX: (Math.random() - 0.5) * 1.8,
        angle: Math.random() * 360,
        spin: (Math.random() - 0.5) * 5
      });
    }

    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pieces.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.angle += p.spin;

        if (p.y > canvas.height + 30) {
          p.y = -30;
          p.x = Math.random() * canvas.width;
        }

        if (p.symbol) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.angle * Math.PI) / 180);
          ctx.font = `${p.size}px sans-serif`;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.85;
          ctx.fillText(p.symbol, -p.size / 3, p.size / 3);
          ctx.restore();
          ctx.globalAlpha = 1;
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.angle * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      });

      confettiFrame = requestAnimationFrame(frame);
    }

    frame();

    // Se detiene suavemente después de unos segundos.
    confettiTimer = setTimeout(stopConfetti, 7000);
  }

  function stopConfetti() {
    clearTimeout(confettiTimer);
    confettiTimer = null;

    if (confettiFrame) {
      cancelAnimationFrame(confettiFrame);
      confettiFrame = null;
    }

    if (els.confetti) {
      const ctx = els.confetti.getContext('2d');
      ctx.clearRect(0, 0, els.confetti.width, els.confetti.height);
    }
  }

})();
