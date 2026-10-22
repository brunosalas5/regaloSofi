/**
 * main.js  –  El regalo de Sofi
 * ─────────────────────────────────────────────────────────────
 * Módulos:
 *   1. CONFIG          – Datos de juegos y pistas (editar aquí)
 *   2. STATE           – Lectura/escritura en localStorage
 *   3. PARTICLES       – Fondo animado con canvas
 *   4. WELCOME MODAL   – Mensaje de bienvenida con animación
 *   5. MAIN SCREEN     – Renderizado de tarjetas y progreso
 *   6. CARDS           – Hover parallax y navegación
 *   7. CLUE MODAL      – Modal de pistas
 *   8. COMPLETION API  – completeGame() para los juegos
 *   9. INIT            – Arranque de la aplicación
 * ─────────────────────────────────────────────────────────────
 */

/* ═══════════════════════════════════════════════════════
   1. CONFIG  –  DATOS DE JUEGOS Y PISTAS
   ▸ Para agregar/cambiar una pista de texto, editá el campo
     "clue" del juego correspondiente.
   ▸ Para una pista de audio, agregá "clueAudio" con la ruta
     relativa al index.html (ej.: "assets/audio/pista.mp3").
   ▸ Para cambiar el nombre o ícono de un juego, editá
     "title" e "icon".
═══════════════════════════════════════════════════════ */
const GAMES_CONFIG = {
  murdoku: {
    id:          'murdoku',
    title:       'Murdoku',
    icon:        '🔢',
    number:      'Desafío 1',
    description: 'Un sudoku con un giro mortal. ¿Podés resolverlo?',
    href:        'games/murdoku.html',
    // ── PISTA 1 ── Se muestra al completar el Murdoku:
    clue:        'Uno es un rey. El otro, un príncipe.\nPero no te emociones con los cuentos de hadas…',
  },
  crucigrama: {
    id:          'crucigrama',
    title:       'Crucigrama Musical',
    icon:        '🎵',
    number:      'Desafío 2',
    description: 'Las palabras guardan secretos. Encontrá las respuestas.',
    href:        'games/crucigrama.html',
    // ── PISTA 2 ── Se muestra al completar el crucigrama:
    clue:        'Dale play y escuchá con atención…',
    clueAudio:   'assets/audio/pista-crucigrama.mp3',
  },
  tercerjuego: {
    id:          'tercerjuego',
    title:       'Wordle',
    icon:        '🟩',
    number:      'Desafío 3',
    description: 'Cuatro intentos, nueve letras y una pista final. ¿Podés descubrir la palabra?',
    href:        'games/wordle.html',
    // ── PISTA 3 ── Desbloqueada al completar el Wordle:
    clue:        'La palabra era CONCIERTO. Preparate para algo mejor que un concierto 🎟️✨',
  },
};

/* Orden en el que se muestran las tarjetas */
const GAME_ORDER = ['murdoku', 'crucigrama', 'tercerjuego'];

/* Clave de localStorage */
const STORAGE_KEY = 'sofi-regalo-state';

/* ═══════════════════════════════════════════════════════
   2. STATE  –  Persistencia con localStorage
═══════════════════════════════════════════════════════ */
const State = (() => {
  /** Devuelve el objeto de estado (o el estado vacío inicial) */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore parse errors */ }
    // Estado inicial: ningún juego completado
    return {
      completed: {
        murdoku:     false,
        crucigrama:  false,
        tercerjuego: false,
      },
    };
  }

  /** Guarda el estado completo */
  function save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  /** Marca un juego como completado y persiste */
  function markCompleted(gameId) {
    const state = load();
    if (!state.completed.hasOwnProperty(gameId)) return;
    state.completed[gameId] = true;
    save(state);
  }

  /** Indica si todos los juegos están completados */
  function allCompleted(state) {
    return GAME_ORDER.every(id => state.completed[id]);
  }

  return { load, save, markCompleted, allCompleted };
})();

/* ═══════════════════════════════════════════════════════
   3. PARTICLES  –  Fondo de partículas con canvas
   Sistema de partículas suave que reacciona al mouse.
═══════════════════════════════════════════════════════ */
const Particles = (() => {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');

  let W, H, particles = [];
  const PARTICLE_COUNT = 90;

  /* Coordenadas del mouse (normalizadas como influencia) */
  const mouse = { x: -1000, y: -1000 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.8 + 0.4,
      vx:    (Math.random() - 0.5) * 0.3,
      vy:   -(Math.random() * 0.2 + 0.05),
      alpha: Math.random() * 0.5 + 0.1,
      color: pickColor(),
    };
  }

  function pickColor() {
    const palette = [
      'hsla(270, 70%, 75%, ',   // violeta
      'hsla(320, 70%, 75%, ',   // rosa
      'hsla(42,  85%, 70%, ',   // dorado
      'hsla(200, 60%, 75%, ',   // celeste
      'hsla(145, 55%, 65%, ',   // verde suave
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      /* Influencia suave del mouse */
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120 * 0.4;
        p.vx += (dx / dist) * force * 0.04;
        p.vy += (dy / dist) * force * 0.04;
      }

      /* Límite de velocidad */
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 0.8) {
        p.vx = (p.vx / speed) * 0.8;
        p.vy = (p.vy / speed) * 0.8;
      }

      /* Mover */
      p.x += p.vx;
      p.y += p.vy;

      /* Reiniciar si sale por arriba o por los lados */
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;

      /* Dibujar partícula */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  function start() {
    init();
    draw();
    window.addEventListener('resize', () => {
      resize();
      // Ajustar posición de partículas que quedaron fuera
      particles.forEach(p => {
        if (p.x > W) p.x = Math.random() * W;
        if (p.y > H) p.y = Math.random() * H;
      });
    });
    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });
  }

  return { start };
})();

/* ═══════════════════════════════════════════════════════
   4. WELCOME MODAL  –  Bienvenida animada
═══════════════════════════════════════════════════════ */
const WelcomeModal = (() => {
  const overlay  = document.getElementById('welcome-overlay');
  const textArea = document.getElementById('modal-text-container');
  const btnStart = document.getElementById('btn-start');

  /**
   * Callback que se ejecuta al presionar "Comenzar aventura".
   * Se guarda en esta variable para que el listener único pueda invocarlo
   * sin importar si el modal fue abierto via init() o via open().
   */
  let _onDismissed = null;

  /**
   * Líneas del mensaje de bienvenida.
   * Formato: { text, cls }
   *   cls puede ser: 'greeting' | 'italic' | 'highlight' | 'big' | 'spacer' | ''
   */
  const LINES = [
    { text: 'Hola Sofi ❤️',                                                   cls: 'greeting'  },
    { text: 'Este es mi regalo por tu Confirmación.',                          cls: ''          },
    { text: '',                                                                 cls: 'spacer'    },
    { text: 'Pero hay un pequeño problema...',                                  cls: 'italic'    },
    { text: '',                                                                 cls: 'spacer'    },
    { text: 'Para descubrir qué es, vas a tener que superar 3 desafíos.',      cls: ''          },
    { text: '',                                                                 cls: 'spacer'    },
    { text: 'A medida que avances, voy a ir dándote algunas pistas',           cls: ''          },
    { text: 'sobre cuál puede ser tu regalo.',                                  cls: ''          },
    { text: '',                                                                 cls: 'spacer'    },
    { text: 'Cuando completes los tres desafíos...',                           cls: 'highlight' },
    { text: 'vas a desbloquear tu recompensa. 🎁',                             cls: 'big'       },
    { text: '',                                                                 cls: 'spacer'    },
    { text: '¿Te animás?',                                                     cls: 'italic'    },
  ];

  /** Construye y anima las líneas del mensaje */
  function animateText() {
    textArea.innerHTML = '';
    btnStart.classList.remove('visible');

    // Crear todos los <span> primero (invisibles)
    LINES.forEach(({ text, cls }) => {
      const span = document.createElement('span');
      span.className = 'modal-line' + (cls ? ' ' + cls : '');
      span.textContent = text || '\u00A0'; // &nbsp; para líneas vacías
      textArea.appendChild(span);
    });

    // Hacer aparecer cada línea con un delay escalonado
    const spans = textArea.querySelectorAll('.modal-line');
    let i = 0;
    const DELAY_BASE = 80;   // ms entre líneas
    const DELAY_FAST = 40;

    function showNext() {
      if (i >= spans.length) {
        // Texto completo: mostrar botón
        setTimeout(() => { btnStart.classList.add('visible'); }, 300);
        return;
      }
      spans[i].classList.add('visible');
      const delay = spans[i].textContent.trim() === '' ? DELAY_FAST : DELAY_BASE + 60;
      i++;
      setTimeout(showNext, delay);
    }

    setTimeout(showNext, 300); // pequeña pausa inicial
  }

  /**
   * Cierra el modal con animación.
   * ─────────────────────────────────────────────────────
   * LISTENER ÚNICO: registrado una sola vez aquí abajo,
   * independientemente de si el modal se abrió via init() u open().
   */
  function dismiss() {
    sessionStorage.setItem('sofi-adventure-started', 'true');
    document.documentElement.classList.add('adventure-started');

    overlay.style.transition = 'opacity 0.5s ease';
    overlay.style.opacity    = '0';
    setTimeout(() => {
      overlay.classList.add('hidden');
      overlay.style.display = 'none';
      // Ejecutar callback si existe (muestra la pantalla principal)
      if (_onDismissed) {
        _onDismissed();
        _onDismissed = null; // limpiar para usos futuros
      }
    }, 500);
  }

  // ── REGISTRO ÚNICO del listener de "Comenzar aventura" ──
  // Se registra UNA sola vez al cargar el módulo.
  // Funciona tanto cuando el modal viene de init() como de open().
  btnStart.addEventListener('click', dismiss);
  btnStart.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      dismiss();
    }
  });

  /**
   * init(onDismissedCallback)
   * Llamar la primera vez que se muestra el modal.
   * Guarda el callback y arranca la animación de texto.
   */
  function init(onDismissedCallback) {
    _onDismissed = onDismissedCallback;
    animateText();
  }

  /**
   * open()
   * Re-abre el modal desde la pantalla principal (footer).
   * No necesita callback: la pantalla ya está visible.
   */
  function open() {
    _onDismissed = null; // al reabrir desde el footer no hay acción extra
    document.documentElement.classList.remove('adventure-started');
    overlay.classList.remove('hidden');
    overlay.style.display  = 'flex';
    overlay.style.opacity  = '1';
    overlay.style.transition = 'opacity 0.4s ease';
    animateText();
  }

  return { init, open };
})();

/* ═══════════════════════════════════════════════════════
   5. MAIN SCREEN  –  Pantalla principal
═══════════════════════════════════════════════════════ */
const MainScreen = (() => {
  const screen      = document.getElementById('main-screen');
  const progressBar = document.getElementById('progress-bar');
  const progressTxt = document.getElementById('progress-text');

  /** Muestra la pantalla principal con animación */
  function show() {
    screen.classList.remove('hidden');
    // Forzar reflow para que la animación se active
    void screen.offsetWidth;
    screen.classList.add('entering');
  }

  /** Actualiza la barra de progreso según el estado */
  function updateProgress(state) {
    const total     = GAME_ORDER.length;
    const completed = GAME_ORDER.filter(id => state.completed[id]).length;
    const pct       = Math.round((completed / total) * 100);

    progressBar.style.width = pct + '%';
    progressTxt.textContent = completed === 0
      ? '0 de 3 completados'
      : completed === total
        ? '¡Todos completados! 🎉'
        : `${completed} de ${total} completados`;
  }

  return { show, updateProgress };
})();

/* ═══════════════════════════════════════════════════════
   6. CARDS  –  Tarjetas de juegos
═══════════════════════════════════════════════════════ */
const Cards = (() => {
  /**
   * Aplica el estado visual correcto a una tarjeta.
   * Se llama tanto al cargar la página como al completar un juego.
   */
  function applyState(cardEl, gameId, isCompleted) {
    const statusDot  = cardEl.querySelector('.status-dot');
    const statusText = cardEl.querySelector('.status-text');
    const actions    = cardEl.querySelector('.card-actions');

    if (isCompleted) {
      cardEl.classList.add('completed');

      // Cambiar estado visual
      if (statusText) statusText.textContent = '✓ Completado';

      // Agregar checkmark si no existe
      if (!cardEl.querySelector('.card-check')) {
        const check = document.createElement('div');
        check.className = 'card-check';
        check.textContent = '✓';
        cardEl.appendChild(check);
      }

      // Agregar botón "Ver pista" si no existe
      if (!cardEl.querySelector('.btn-clue') && actions) {
        const clueBtn = document.createElement('button');
        clueBtn.className  = 'btn-clue';
        clueBtn.id         = `btn-clue-${gameId}`;
        clueBtn.dataset.game = gameId;
        clueBtn.setAttribute('aria-label', `Ver pista de ${GAMES_CONFIG[gameId].title}`);
        clueBtn.innerHTML  = `<span class="btn-clue-icon">🔍</span> Ver pista`;

        // Evento: abrir modal de pista
        clueBtn.addEventListener('click', e => {
          e.stopPropagation(); // No navegar al juego
          ClueModal.open(gameId);
        });

        actions.appendChild(clueBtn);
      }
    } else {
      if (statusText) statusText.textContent = 'Pendiente';
    }
  }

  /**
   * Efecto parallax/tilt suave en las tarjetas al mover el mouse.
   */
  function addTiltEffect(cardEl) {
    cardEl.addEventListener('mousemove', e => {
      const rect = cardEl.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);

      // Tilt suave máximo ±6deg
      const tiltX =  dy * -6;
      const tiltY =  dx *  6;

      cardEl.style.transform =
        `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`;
    });

    cardEl.addEventListener('mouseleave', () => {
      cardEl.style.transform = '';
    });
  }

  /** Navega al juego correspondiente */
  function navigateTo(href) {
    window.location.href = href;
  }

  /**
   * Inicializa todas las tarjetas:
   * - Aplica estado desde localStorage
   * - Agrega efectos de hover/tilt
   * - Configura navegación
   * - Anima la entrada escalonada
   */
  function init(state) {
    const cards = document.querySelectorAll('.game-card');

    cards.forEach((card, index) => {
      const gameId      = card.dataset.game;
      const href        = card.dataset.href;
      const isCompleted = state.completed[gameId] || false;

      // Aplicar estado visual
      applyState(card, gameId, isCompleted);

      // Efecto tilt
      addTiltEffect(card);

      // Navegación al hacer click en la tarjeta (pero no en el botón de pista)
      card.addEventListener('click', e => {
        if (e.target.closest('.btn-clue')) return; // lo maneja ClueModal
        navigateTo(href);
      });

      // Accesibilidad: teclado
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target.closest('.btn-clue')) return;
          e.preventDefault();
          navigateTo(href);
        }
      });

      // Animación de entrada escalonada
      setTimeout(() => {
        card.classList.add('card-visible');
      }, 100 + index * 120);
    });
  }

  /**
   * Actualiza visualmente una sola tarjeta tras completar un juego.
   * Llamado desde completeGame().
   */
  function markCompleted(gameId) {
    const card = document.getElementById(`card-${gameId}`);
    if (!card) return;

    // Agregar clase de animación especial "just-completed"
    card.classList.add('just-completed');
    setTimeout(() => card.classList.remove('just-completed'), 1000);

    // Aplicar estado visual (checkmark + botón pista)
    applyState(card, gameId, true);
  }

  return { init, markCompleted, applyState };
})();

/* ═══════════════════════════════════════════════════════
   7. CLUE MODAL  –  Modal de pistas
═══════════════════════════════════════════════════════ */
const ClueModal = (() => {
  const overlay   = document.getElementById('clue-overlay');
  const titleEl   = document.getElementById('clue-title');
  const bodyEl    = document.getElementById('clue-body');
  const closeBtn  = document.getElementById('clue-close');

  const PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.14v13.72c0 .82.9 1.32 1.6.9l10.5-6.86a1.06 1.06 0 0 0 0-1.8L9.6 4.24A1.06 1.06 0 0 0 8 5.14Z"/></svg>';
  const PAUSE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';
  const WAVE_HEIGHTS = [
    32, 54, 40, 72, 48, 86, 58, 96, 44, 68, 36, 78,
    56, 90, 42, 64, 50, 84, 38, 70, 46, 92, 60, 74
  ];

  let audioPlayer = null;

  function open(gameId) {
    const game = GAMES_CONFIG[gameId];
    if (!game) return;

    // Si había un audio de otra pista, detenerlo antes de cambiar el contenido.
    cleanupAudio();

    titleEl.textContent = `Pista: ${game.title}`;
    bodyEl.textContent = '';

    if (game.clue) {
      const text = document.createElement('p');
      text.className = 'clue-text';
      text.textContent = game.clue;
      bodyEl.appendChild(text);
    }

    if (game.clueAudio) {
      bodyEl.appendChild(createAudioPlayer(game.clueAudio));
    }

    overlay.classList.remove('hidden');
    // Resetear animación del modal
    const modal = document.getElementById('clue-modal');
    modal.style.animation = 'none';
    void modal.offsetWidth;
    modal.style.animation = '';

    // Foco en el reproductor si existe; si no, en cerrar (accesibilidad).
    const focusTarget = bodyEl.querySelector('.clue-audio-btn') || closeBtn;
    setTimeout(() => focusTarget.focus(), 50);
  }

  function close() {
    cleanupAudio();
    overlay.classList.add('hidden');
  }

  function cleanupAudio() {
    if (!audioPlayer) return;
    audioPlayer.stop();
    audioPlayer = null;
  }

  function createAudioPlayer(src) {
    const player = document.createElement('div');
    player.className = 'clue-audio';
    player.setAttribute('role', 'group');
    player.setAttribute('aria-label', 'Reproductor de pista de audio');

    const audio = document.createElement('audio');
    audio.className = 'clue-audio-element';
    audio.src = src;
    audio.preload = 'auto';
    audio.setAttribute('playsinline', '');

    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'clue-audio-btn';
    playBtn.setAttribute('aria-label', 'Reproducir pista de audio');
    playBtn.setAttribute('aria-pressed', 'false');
    playBtn.innerHTML = PLAY_ICON;

    const track = document.createElement('div');
    track.className = 'clue-audio-track';

    const wave = document.createElement('div');
    wave.className = 'clue-audio-wave';
    wave.setAttribute('aria-hidden', 'true');
    wave.style.setProperty('--progress', '0%');

    const baseBars = createWaveBars(false);
    const activeBars = createWaveBars(true);
    wave.appendChild(baseBars);
    wave.appendChild(activeBars);

    const status = document.createElement('span');
    status.className = 'clue-audio-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.textContent = 'Tocá play para escuchar';

    track.appendChild(wave);
    track.appendChild(status);
    player.appendChild(audio);
    player.appendChild(playBtn);
    player.appendChild(track);

    let rafId = null;
    let hasError = false;

    function setProgress(percent) {
      const safe = Math.max(0, Math.min(100, percent));
      wave.style.setProperty('--progress', `${safe}%`);
    }

    function setPlayingUI(isPlaying) {
      player.classList.toggle('is-playing', isPlaying);
      playBtn.innerHTML = isPlaying ? PAUSE_ICON : PLAY_ICON;
      playBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
      playBtn.setAttribute('aria-label', isPlaying
        ? 'Pausar pista de audio'
        : 'Reproducir pista de audio');
    }

    function stopTicker() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    function tick() {
      rafId = null;
      if (audio.paused || audio.ended || hasError) return;

      const duration = audio.duration;
      if (Number.isFinite(duration) && duration > 0) {
        setProgress((audio.currentTime / duration) * 100);
      }
      rafId = requestAnimationFrame(tick);
    }

    function startTicker() {
      stopTicker();
      rafId = requestAnimationFrame(tick);
    }

    playBtn.addEventListener('click', () => {
      if (hasError) return;

      if (!audio.paused) {
        audio.pause();
        return;
      }

      // Al terminar (o al volver a tocar tras el final), reproducir desde cero.
      if (audio.ended) {
        audio.currentTime = 0;
        setProgress(0);
      }

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          markError('No se pudo reproducir la pista de audio.');
        });
      }
    });

    audio.addEventListener('play', () => {
      if (hasError) return;
      setPlayingUI(true);
      status.textContent = 'Reproduciendo…';
      startTicker();
    });

    audio.addEventListener('pause', () => {
      stopTicker();
      setPlayingUI(false);
      if (!audio.ended && !hasError) {
        status.textContent = 'Pausado · tocá play';
      }
    });

    audio.addEventListener('ended', () => {
      stopTicker();
      setPlayingUI(false);
      setProgress(100);
      status.textContent = 'Tocá play para repetir';
    });

    audio.addEventListener('error', () => {
      markError('No se pudo cargar la pista de audio.');
    });

    function markError(message) {
      hasError = true;
      stopTicker();
      setPlayingUI(false);
      player.classList.add('has-error');
      playBtn.disabled = true;
      playBtn.setAttribute('aria-label', 'Pista de audio no disponible');
      status.textContent = message;
    }

    audioPlayer = {
      stop() {
        audio.pause();
        stopTicker();
        try { audio.currentTime = 0; } catch (e) { /* audio aún sin metadatos */ }
        setPlayingUI(false);
        setProgress(0);
      }
    };

    return player;
  }

  function createWaveBars(active) {
    const bars = document.createElement('div');
    bars.className = 'clue-audio-bars' + (active ? ' clue-audio-bars--active' : '');

    WAVE_HEIGHTS.forEach((height, index) => {
      const bar = document.createElement('span');
      bar.className = 'clue-audio-bar';
      bar.style.setProperty('--h', `${height}%`);
      bar.style.setProperty('--i', index);
      bars.appendChild(bar);
    });

    return bars;
  }

  function init() {
    closeBtn.addEventListener('click', close);
    // Cerrar al hacer click en el overlay (fuera del modal)
    overlay.addEventListener('click', e => {
      if (e.target === overlay) close();
    });
    // Cerrar con Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !overlay.classList.contains('hidden')) close();
    });
  }

  return { init, open, close };
})();

/* ═══════════════════════════════════════════════════════
   8. COMPLETION API  –  API pública para los juegos
   ─────────────────────────────────────────────────────
   Desde cualquier página de juego, llamar:
     completeGame('murdoku')
   o, si se necesita desde otra pestaña/ventana:
     usar el sistema de localStorage (ver gamesBridge.js)
═══════════════════════════════════════════════════════ */

/**
 * completeGame(gameId)
 *
 * Marca un juego como completado y actualiza toda la UI.
 * Debe llamarse desde la página del juego cuando el usuario gana.
 *
 * @param {string} gameId  –  'murdoku' | 'crucigrama' | 'tercerjuego'
 *
 * Ejemplo de uso desde games/murdoku.html:
 *   window.opener?.completeGame?.('murdoku')
 *   // o, si es la misma página:
 *   window.completeGame('murdoku')
 */
function completeGame(gameId) {
  if (!GAMES_CONFIG[gameId]) {
    console.warn(`completeGame: juego desconocido "${gameId}"`);
    return;
  }

  // 1. Guardar en localStorage
  State.markCompleted(gameId);

  // 2. Recargar estado
  const state = State.load();

  // 3. Actualizar tarjeta visualmente
  Cards.markCompleted(gameId);

  // 4. Actualizar barra de progreso
  MainScreen.updateProgress(state);

  // 5. Si todos completados → mostrar recompensa
  if (State.allCompleted(state)) {
    showReward();
  }
}

/**
 * Escucha cambios en localStorage para detectar si un juego
 * se completó desde otra pestaña/ventana (ej: los juegos en
 * su propia página).
 */
window.addEventListener('storage', e => {
  if (e.key !== STORAGE_KEY) return;
  try {
    const newState = JSON.parse(e.newValue || '{}');
    const oldState = JSON.parse(e.oldValue || '{}') || { completed: {} };

    GAME_ORDER.forEach(gameId => {
      const wasCompleted = oldState.completed?.[gameId];
      const isCompleted  = newState.completed?.[gameId];
      if (!wasCompleted && isCompleted) {
        // Se completó en otra pestaña: actualizar UI en esta
        Cards.markCompleted(gameId);
        MainScreen.updateProgress(newState);
        if (State.allCompleted(newState)) showReward();
      }
    });
  } catch (err) { /* ignorar */ }
});

/* ═══════════════════════════════════════════════════════
   RECOMPENSA FINAL
   ─────────────────────────────────────────────────────
   Al completar los 3 juegos, se revela la sección de
   recompensa con una animación y el botón para abrir
   la playlist sorpresa en Spotify.
═══════════════════════════════════════════════════════ */
function showReward() {
  const section = document.getElementById('reward-section');
  if (!section) return;
  if (!section.classList.contains('hidden')) return; // ya visible

  section.classList.remove('hidden');
  section.classList.add('revealing');

  // Scroll suave hacia la recompensa
  setTimeout(() => {
    section.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 400);
}

/* ═══════════════════════════════════════════════════════
   9. INIT  –  Arranque de la aplicación
═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // ── A. Iniciar partículas de fondo
  Particles.start();

  // ── B. Iniciar modal de pistas
  ClueModal.init();

  // ── C. Cargar estado guardado
  const state = State.load();

  // ── D. Verificar si la aventura ya inició o si se regresa de un juego
  const urlParams = new URLSearchParams(window.location.search);
  const forceRestart = urlParams.has('inicio') || urlParams.has('reset');

  if (forceRestart) {
    sessionStorage.removeItem('sofi-adventure-started');
    document.documentElement.classList.remove('adventure-started');
  }

  const hasStarted = !forceRestart && (
    sessionStorage.getItem('sofi-adventure-started') === 'true' ||
    document.referrer.indexOf('/games/') !== -1 ||
    urlParams.has('from')
  );

  function startMainUI() {
    MainScreen.show();
    Cards.init(state);
    MainScreen.updateProgress(state);

    // Si ya estaban todos completados (recarga de página), mostrar recompensa
    if (State.allCompleted(state)) {
      setTimeout(showReward, 800);
    }
  }

  if (hasStarted) {
    // La aventura ya comenzó o estamos volviendo de un juego:
    // NO mostrar el mensaje inicial de bienvenida, ir directo a los desafíos
    sessionStorage.setItem('sofi-adventure-started', 'true');
    document.documentElement.classList.add('adventure-started');

    const overlay = document.getElementById('welcome-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
      overlay.style.display = 'none';
    }

    startMainUI();
  } else {
    // Se abre por primera vez o se reinició desde el inicio:
    // Mostrar modal de bienvenida con animación
    WelcomeModal.init(() => {
      startMainUI();
    });
  }

  // ── E. Botones del footer: reabrir mensaje o reiniciar aventura
  const btnReopen = document.getElementById('btn-reopen-welcome');
  if (btnReopen) {
    btnReopen.addEventListener('click', () => {
      WelcomeModal.open();
    });
  }

  const btnReset = document.getElementById('btn-reset-adventure');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      // Nota: window.confirm() no funciona en file:// URLs en algunos navegadores,
      // por eso se reinicia directamente sin confirmación.
      localStorage.removeItem(STORAGE_KEY);
      // Wordle guarda su progreso en una clave propia. Sin borrarla, al entrar
      // el juego restauraría la partida anterior (incluso una ya ganada).
      localStorage.removeItem('sofi-wordle-state');
      sessionStorage.removeItem('sofi-adventure-started');
      window.location.href = window.location.pathname;
    });
  }

  // ── F. Exponer completeGame globalmente (para que los juegos la llamen)
  window.completeGame = completeGame;
});
