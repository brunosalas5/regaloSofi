/**
 * murdoku.js  –  Lógica y motor del juego Murdoku: El Regalo Desaparecido
 * ═══════════════════════════════════════════════════════════════
 * Dependencias:
 *   - murdokuConfig.js (MURDOKU_CONFIG)
 *   - gamesBridge.js (STORAGE_KEY, completeGame)
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ── ESTADO GLOBAL DEL JUEGO ────────────────────────────────
  const gameState = {
    screen: 'welcome',       // 'welcome' | 'narrative' | 'board' | 'solved'
    board: [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null]
    ],
    locked: [
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false]
    ],
    activeCell: null,        // { r: number, c: number }
    isSolved: false,
    culpritRevealed: false,
    rewardUnlocked: false,
    soundEnabled: true
  };

  // ── SINTETIZADOR DE SONIDOS (Web Audio API) ─────────────────
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (!gameState.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) { /* audio no disponible */ }
  }

  function playPlaceSound() {
    playTone(523.25, 'sine', 0.12, 0.12); // C5
    setTimeout(() => playTone(659.25, 'sine', 0.15, 0.1), 60); // E5
  }

  function playWarningSound() {
    playTone(220, 'triangle', 0.2, 0.15);
    setTimeout(() => playTone(196, 'triangle', 0.25, 0.15), 100);
  }

  function playFanfareSound() {
    const notes = [
      { f: 523.25, d: 0.14 }, // C5
      { f: 659.25, d: 0.14 }, // E5
      { f: 783.99, d: 0.14 }, // G5
      { f: 1046.50, d: 0.45 } // C6
    ];
    notes.forEach((note, index) => {
      setTimeout(() => {
        playTone(note.f, 'triangle', note.d, 0.15);
      }, index * 120);
    });
  }

  // ── MANEJO RESILIENTE DE FOTOGRAFÍAS ────────────────────────
  // Si la imagen falla en 'suspects/nombre.png', intenta '../suspects/nombre.png'
  // Si aún no fue subida, muestra elegante avatar fallback con iniciales
  window.handlePhotoError = function (img) {
    if (!img) return;
    const filename = img.getAttribute('data-filename');
    if (!img.dataset.triedRoot && filename) {
      img.dataset.triedRoot = 'true';
      img.src = '../suspects/' + filename;
      return;
    }
    img.style.display = 'none';
    const fallback = img.parentElement ? img.parentElement.querySelector('.suspect-fallback-avatar, .cell-fallback-avatar, .culprit-fallback') : null;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  };

  // ── INICIALIZACIÓN DEL ESTADO ──────────────────────────────
  function initBoardState() {
    const initBoard = MURDOKU_CONFIG.initialBoard;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = initBoard[r][c];
        gameState.board[r][c] = val;
        gameState.locked[r][c] = val !== null;
      }
    }
  }

  // ── RENDERIZADO DE LAS PANTALLAS ────────────────────────────
  function showScreen(screenId) {
    const screens = ['screen-welcome', 'screen-narrative', 'screen-board', 'screen-solved'];
    screens.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (id === screenId) {
        el.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        el.classList.add('hidden');
      }
    });
    gameState.screen = screenId.replace('screen-', '');
  }

  // ── RENDERIZADO DEL TABLERO ─────────────────────────────────
  function renderBoard() {
    const boardEl = document.getElementById('murdoku-board');
    if (!boardEl) return;
    boardEl.innerHTML = '';

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const isLocked = gameState.locked[r][c];
        const suspectId = gameState.board[r][c];
        const suspect = suspectId ? MURDOKU_CONFIG.suspects[suspectId] : null;

        const cell = document.createElement('div');
        cell.className = 'board-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.setAttribute('role', 'button');
        cell.setAttribute('tabindex', '0');

        if (isLocked) {
          cell.classList.add('locked');
          cell.setAttribute('aria-label', `Pista fija: ${suspect ? suspect.name : 'Sospechoso'}`);
          cell.innerHTML = `
            <span class="cell-lock-badge" title="Pista bloqueada">🔒 PISTA</span>
            <div class="cell-suspect-content" style="--suspect-color: ${suspect ? suspect.badgeColor : '#fff'}">
              <div class="cell-photo-container">
                <img
                  src="suspects/${suspect ? suspect.filename : ''}"
                  data-filename="${suspect ? suspect.filename : ''}"
                  alt="${suspect ? suspect.name : ''}"
                  class="cell-photo"
                  onload="handlePhotoSuccess(this)"
                  onerror="handlePhotoError(this)"
                />
                <div class="cell-fallback-avatar" style="display:none;">
                  <span class="fallback-initial">${suspect ? suspect.initial : '?'}</span>
                </div>
              </div>
              <span class="cell-name-label">${suspect ? suspect.name : ''}</span>
            </div>
          `;
          // Feedback al intentar hacer clic en una pista
          cell.addEventListener('click', () => {
            showWarning('🔒 Esta casilla es una pista fija del caso y no se puede modificar.');
          });
        } else if (suspect) {
          // Rellenada por el usuario
          cell.classList.add('user-filled');
          cell.setAttribute('aria-label', `Fila ${r + 1}, Columna ${c + 1}: ${suspect.name}. Clic para cambiar.`);
          cell.innerHTML = `
            <span class="cell-edit-hint" title="Cambiar">✏️</span>
            <div class="cell-suspect-content" style="--suspect-color: ${suspect.badgeColor}">
              <div class="cell-photo-container">
                <img
                  src="suspects/${suspect.filename}"
                  data-filename="${suspect.filename}"
                  alt="${suspect.name}"
                  class="cell-photo"
                  onload="handlePhotoSuccess(this)"
                  onerror="handlePhotoError(this)"
                />
                <div class="cell-fallback-avatar" style="display:none;">
                  <span class="fallback-initial">${suspect.initial}</span>
                </div>
              </div>
              <span class="cell-name-label">${suspect.name}</span>
            </div>
          `;
          cell.addEventListener('click', () => openPicker(r, c));
          cell.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openPicker(r, c);
            }
          });
        } else {
          // Casilla vacía
          cell.classList.add('empty');
          cell.setAttribute('aria-label', `Fila ${r + 1}, Columna ${c + 1}: vacía. Clic para colocar sospechoso.`);
          cell.innerHTML = `
            <div class="empty-placeholder">
              <span class="empty-question">?</span>
              <span class="empty-label">Elegir</span>
            </div>
          `;
          cell.addEventListener('click', () => openPicker(r, c));
          cell.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openPicker(r, c);
            }
          });
        }

        boardEl.appendChild(cell);
      }
    }
  }

  // ── MODAL SELECTOR DE SOSPECHOSOS ───────────────────────────
  function openPicker(row, col) {
    if (gameState.locked[row][col]) return;
    gameState.activeCell = { r: row, c: col };

    const pickerEl = document.getElementById('suspect-picker-modal');
    const titleEl = document.getElementById('picker-cell-title');
    const clearBtn = document.getElementById('btn-picker-clear');
    if (!pickerEl) return;

    if (titleEl) {
      titleEl.textContent = `Elegir sospechoso para Fila ${row + 1}, Columna ${col + 1}`;
    }

    // Si la casilla ya tiene un valor, habilitar botón de quitar
    const currentValue = gameState.board[row][col];
    if (clearBtn) {
      clearBtn.style.display = currentValue ? 'inline-block' : 'none';
    }

    pickerEl.classList.remove('hidden');
    playTone(440, 'sine', 0.08, 0.06);
  }

  function closePicker() {
    const pickerEl = document.getElementById('suspect-picker-modal');
    if (pickerEl) pickerEl.classList.add('hidden');
    gameState.activeCell = null;
  }

  function selectSuspect(suspectId) {
    if (!gameState.activeCell) return;
    const { r, c } = gameState.activeCell;

    gameState.board[r][c] = suspectId;
    closePicker();
    renderBoard();

    // Animación de pop en la celda
    const cellEl = document.querySelector(`.board-cell[data-row="${r}"][data-col="${c}"]`);
    if (cellEl) {
      cellEl.classList.add('pop-in');
      setTimeout(() => cellEl.classList.remove('pop-in'), 350);
    }

    playPlaceSound();

    // Validación interactiva de conflictos en tiempo real
    if (suspectId) {
      checkConflictsForCell(r, c, suspectId);
    }
  }

  function clearActiveCell() {
    if (!gameState.activeCell) return;
    const { r, c } = gameState.activeCell;
    gameState.board[r][c] = null;
    closePicker();
    renderBoard();
    clearWarnings();
    playTone(330, 'sine', 0.1, 0.08);
  }

  // ── VALIDACIÓN DE CONFLICTOS EN TIEMPO REAL ─────────────────
  function checkConflictsForCell(r, c, suspectId) {
    clearConflictsHighlights();

    let conflictFound = false;
    let message = '';
    const conflictingCells = [];

    // 1. Verificar fila
    for (let col = 0; col < 4; col++) {
      if (col !== c && gameState.board[r][col] === suspectId) {
        conflictingCells.push({ r, c: col });
        conflictFound = true;
        message = '⚠️ Hay dos sospechosos iguales en esta fila.';
      }
    }

    // 2. Verificar columna
    for (let row = 0; row < 4; row++) {
      if (row !== r && gameState.board[row][c] === suspectId) {
        conflictingCells.push({ r: row, c });
        conflictFound = true;
        message = '⚠️ Hay dos sospechosos iguales en esta columna.';
      }
    }

    // 3. Verificar cuadrante 2x2
    const startRow = Math.floor(r / 2) * 2;
    const startCol = Math.floor(c / 2) * 2;
    for (let row = startRow; row < startRow + 2; row++) {
      for (let col = startCol; col < startCol + 2; col++) {
        if ((row !== r || col !== c) && gameState.board[row][col] === suspectId) {
          conflictingCells.push({ r: row, c: col });
          conflictFound = true;
          message = '⚠️ Hay dos sospechosos iguales en este cuadrante 2 × 2.';
        }
      }
    }

    if (conflictFound) {
      conflictingCells.push({ r, c });
      highlightConflicts(conflictingCells);
      showWarning(message, true);
      playWarningSound();
    } else {
      clearWarnings();
    }
  }

  function highlightConflicts(cells) {
    cells.forEach(({ r, c }) => {
      const el = document.querySelector(`.board-cell[data-row="${r}"][data-col="${c}"]`);
      if (el) el.classList.add('conflict');
    });
    // Quitar resaltado tras unos segundos
    setTimeout(clearConflictsHighlights, 2800);
  }

  function clearConflictsHighlights() {
    document.querySelectorAll('.board-cell.conflict').forEach(el => {
      el.classList.remove('conflict');
    });
  }

  function showWarning(text, isDanger = false) {
    const banner = document.getElementById('board-warning-banner');
    if (!banner) return;
    banner.textContent = text;
    banner.classList.remove('hidden');
    if (isDanger) {
      banner.classList.add('banner-danger');
    } else {
      banner.classList.remove('banner-danger');
    }

    // Auto-ocultar si no es un error de duplicados
    if (!isDanger) {
      setTimeout(clearWarnings, 3500);
    }
  }

  function clearWarnings() {
    const banner = document.getElementById('board-warning-banner');
    if (banner) {
      banner.classList.add('hidden');
      banner.textContent = '';
    }
  }

  // ── COMPROBAR SOLUCIÓN ──────────────────────────────────────
  function checkSolution() {
    clearConflictsHighlights();

    // 1. Verificar si hay casillas vacías
    let hasEmpty = false;
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!gameState.board[r][c]) {
          hasEmpty = true;
          emptyCells.push({ r, c });
        }
      }
    }

    if (hasEmpty) {
      showWarning('Todavía hay algo que no encaja... 🧐 Revisá las pistas y seguí investigando.', true);
      highlightConflicts(emptyCells);
      playWarningSound();
      return;
    }

    // 2. Validar reglas de Sudoku (Filas, Columnas, Cuadrantes 2x2)
    const conflicts = [];

    // Validar Filas
    for (let r = 0; r < 4; r++) {
      const seen = {};
      for (let c = 0; c < 4; c++) {
        const val = gameState.board[r][c];
        if (seen[val] !== undefined) {
          conflicts.push({ r, c: seen[val] }, { r, c });
        } else {
          seen[val] = c;
        }
      }
    }

    // Validar Columnas
    for (let c = 0; c < 4; c++) {
      const seen = {};
      for (let r = 0; r < 4; r++) {
        const val = gameState.board[r][c];
        if (seen[val] !== undefined) {
          conflicts.push({ r: seen[val], c }, { r, c });
        } else {
          seen[val] = r;
        }
      }
    }

    // Validar Cuadrantes 2x2
    for (let qr = 0; qr < 2; qr++) {
      for (let qc = 0; qc < 2; qc++) {
        const seen = {};
        for (let r = qr * 2; r < qr * 2 + 2; r++) {
          for (let c = qc * 2; c < qc * 2 + 2; c++) {
            const val = gameState.board[r][c];
            if (seen[val]) {
              conflicts.push(seen[val], { r, c });
            } else {
              seen[val] = { r, c };
            }
          }
        }
      }
    }

    if (conflicts.length > 0) {
      showWarning('Todavía hay algo que no encaja... 🧐 Revisá las pistas y seguí investigando.', true);
      highlightConflicts(conflicts);
      playWarningSound();
      return;
    }

    // 3. Comprobar contra la solución determinista
    const sol = MURDOKU_CONFIG.solution;
    let matchesSolution = true;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (gameState.board[r][c] !== sol[r][c]) {
          matchesSolution = false;
          conflicts.push({ r, c });
        }
      }
    }

    if (!matchesSolution) {
      showWarning('Todavía hay algo que no encaja... 🧐 Revisá las pistas y seguí investigando.', true);
      highlightConflicts(conflicts);
      playWarningSound();
      return;
    }

    // ── ¡VICTORIA! CASO RESUELTO ───────────────────────────────
    handleVictory();
  }

  function handleVictory() {
    gameState.isSolved = true;
    clearWarnings();

    // Guardar progreso silenciosamente en localStorage para la aventura principal
    markMurdokuCompleted();

    // Efectos de celebración
    playFanfareSound();
    launchConfetti();

    // Animación triunfal en las celdas del tablero
    document.querySelectorAll('.board-cell').forEach((cell, idx) => {
      setTimeout(() => {
        cell.style.borderColor = 'var(--murdoku-gold)';
        cell.style.boxShadow = '0 0 25px var(--murdoku-gold-glow)';
      }, idx * 60);
    });

    // Transición fluida a la pantalla de Caso Cerrado
    setTimeout(() => {
      setupCaseClosedScreen();
      showScreen('screen-solved');
    }, 1200);
  }

  // ── PANTALLA CASO CERRADO Y REVELACIÓN DE TITO ──────────────
  function setupCaseClosedScreen() {
    const culprit = MURDOKU_CONFIG.culprit;
    const culpritSuspect = MURDOKU_CONFIG.suspects[culprit.id] || MURDOKU_CONFIG.suspects.tito;

    const imgEl = document.getElementById('culprit-photo');
    const fallbackEl = document.querySelector('.culprit-fallback');
    if (imgEl && culpritSuspect) {
      imgEl.style.display = 'block';
      imgEl.src = `suspects/${culpritSuspect.filename}`;
      imgEl.setAttribute('data-filename', culpritSuspect.filename);
      imgEl.alt = culpritSuspect.name;
      if (fallbackEl) fallbackEl.style.display = 'none';
    }

    // Preparar el botón de recompensa
    const btnReward = document.getElementById('btn-reward-unlock');
    if (btnReward) {
      // Si el juego está resuelto, se desbloquea
      btnReward.classList.remove('locked');
      btnReward.classList.add('unlocked');
      btnReward.innerHTML = `<span>🎁</span> <span>${MURDOKU_CONFIG.reward.btnUnlockedText}</span>`;
      btnReward.onclick = openRewardModal;
    }
  }

  // ── MODAL DE RECOMPENSA ─────────────────────────────────────
  function openRewardModal() {
    const modalEl = document.getElementById('reward-modal');
    if (!modalEl) return;
    modalEl.classList.remove('hidden');
    playFanfareSound();
    launchConfetti();
  }

  function closeRewardModal() {
    const modalEl = document.getElementById('reward-modal');
    if (modalEl) modalEl.classList.add('hidden');
  }

  // ── REINICIAR MOVIMIENTOS DEL JUGADOR ───────────────────────
  function resetPlayerBoard() {
    initBoardState();
    renderBoard();
    clearWarnings();
    playTone(300, 'sine', 0.15, 0.1);
  }

  // ── GUARDAR EN LOCALSTORAGE SIN INTERRUMPIR LA EXPERIENCIA ──
  function markMurdokuCompleted() {
    try {
      const STORAGE_KEY = 'sofi-regalo-state';
      let state = { completed: { murdoku: false, crucigrama: false, tercerjuego: false } };
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state = JSON.parse(raw);
      if (!state.completed) state.completed = {};
      state.completed.murdoku = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      sessionStorage.setItem('sofi-adventure-started', 'true');
    } catch (e) { /* ignorar */ }
  }

  // ── CONFETTI EN CANVAS PURO ─────────────────────────────────
  let confettiAnimId = null;
  function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      '#f59e0b', '#ec4899', '#38bdf8', '#a855f7',
      '#10b981', '#f43f5e', '#fbbf24', '#ffffff'
    ];

    const particles = [];
    const count = 100;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width * 0.5 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.4 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 18,
        vy: -Math.random() * 14 - 4,
        size: Math.random() * 9 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        alpha: 1,
        gravity: 0.35,
        drag: 0.96
      });
    }

    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);

    let frame = 0;
    function renderConfetti() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        if (frame > 40) p.alpha -= 0.015;

        if (p.alpha > 0 && p.y < canvas.height + 50) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });

      frame++;
      if (alive) {
        confettiAnimId = requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    renderConfetti();
  }

  // ── INICIALIZACIÓN DE EVENTOS Y VINCULACIONES DOM ───────────
  function initEvents() {
    // 1. Pantalla de Bienvenida
    const btnStartInvestigation = document.getElementById('btn-start-investigation');
    if (btnStartInvestigation) {
      btnStartInvestigation.addEventListener('click', () => {
        playTone(523, 'sine', 0.1, 0.08);
        showScreen('screen-narrative');
      });
    }

    const btnOpenInstructions = document.getElementById('btn-open-instructions');
    const btnInstructionsBoard = document.getElementById('btn-instructions-board');
    const instructionsModal = document.getElementById('instructions-modal');
    const btnCloseInstructions = document.getElementById('btn-close-instructions');

    function openInstructionsModal() {
      if (instructionsModal) {
        instructionsModal.classList.remove('hidden');
        playTone(440, 'sine', 0.08, 0.06);
      }
    }

    function closeInstructionsModal() {
      if (instructionsModal) {
        instructionsModal.classList.add('hidden');
        playTone(350, 'sine', 0.08, 0.06);
      }
    }

    if (btnOpenInstructions) btnOpenInstructions.addEventListener('click', openInstructionsModal);
    if (btnInstructionsBoard) btnInstructionsBoard.addEventListener('click', openInstructionsModal);
    if (btnCloseInstructions) btnCloseInstructions.addEventListener('click', closeInstructionsModal);

    // Cerrar modal al tocar overlay
    if (instructionsModal) {
      instructionsModal.addEventListener('click', (e) => {
        if (e.target === instructionsModal) closeInstructionsModal();
      });
    }

    // 2. Pantalla de Narrativa del Caso
    const btnInvestigateCase = document.getElementById('btn-investigate-case');
    if (btnInvestigateCase) {
      btnInvestigateCase.addEventListener('click', () => {
        playTone(587.33, 'sine', 0.1, 0.08); // D5
        showScreen('screen-board');
        renderBoard();
      });
    }

    // 3. Tablero
    const btnCheckSolution = document.getElementById('btn-check-solution');
    if (btnCheckSolution) {
      btnCheckSolution.addEventListener('click', checkSolution);
    }

    const btnResetBoard = document.getElementById('btn-reset-board');
    if (btnResetBoard) {
      btnResetBoard.addEventListener('click', () => {
        if (confirm('¿Deseás reiniciar las casillas que colocaste para volver a intentar?')) {
          resetPlayerBoard();
        }
      });
    }

    // 4. Selector de Sospechosos
    const pickerModal = document.getElementById('suspect-picker-modal');
    const btnClosePicker = document.getElementById('btn-close-picker');
    const btnPickerClear = document.getElementById('btn-picker-clear');

    if (btnClosePicker) btnClosePicker.addEventListener('click', closePicker);
    if (btnPickerClear) btnPickerClear.addEventListener('click', clearActiveCell);
    if (pickerModal) {
      pickerModal.addEventListener('click', (e) => {
        if (e.target === pickerModal) closePicker();
      });
    }

    // Delegación de selección de sospechoso en el picker
    document.querySelectorAll('.picker-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const suspectId = btn.getAttribute('data-suspect');
        if (suspectId) selectSuspect(suspectId);
      });
    });

    // 5. Modal de Recompensa
    const rewardModal = document.getElementById('reward-modal');
    const btnCloseReward = document.getElementById('btn-close-reward');
    const btnReturnAdventure = document.getElementById('btn-return-adventure');

    if (btnCloseReward) btnCloseReward.addEventListener('click', closeRewardModal);
    if (rewardModal) {
      rewardModal.addEventListener('click', (e) => {
        if (e.target === rewardModal) closeRewardModal();
      });
    }

    if (btnReturnAdventure) {
      btnReturnAdventure.addEventListener('click', () => {
        markMurdokuCompleted();
        window.location.href = '../index.html?from=game';
      });
    }

    // Ajustar canvas al redimensionar ventana
    window.addEventListener('resize', () => {
      const canvas = document.getElementById('confetti-canvas');
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    });
  }

  // ── INICIAR APLICACIÓN ──────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initBoardState();
    initEvents();

    // Comprobar si ya estaba resuelto previamente
    try {
      const STORAGE_KEY = 'sofi-regalo-state';
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.completed && saved.completed.murdoku) {
          // El usuario ya lo resolvió previamente: se puede continuar o revisar
        }
      }
    } catch (e) { /* ignorar */ }
  });

})();
