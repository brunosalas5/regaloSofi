/**
 * gamesBridge.js  –  Puente entre juegos y página principal
 * ─────────────────────────────────────────────────────────────
 * Este archivo se incluye en CADA página de juego (games/*.html).
 *
 * Expone la función global completeGame(gameId) para que el
 * juego pueda informar a index.html que fue completado.
 *
 * El mecanismo de comunicación utiliza localStorage como canal
 * compartido entre páginas del mismo origen.
 * ─────────────────────────────────────────────────────────────
 */

const STORAGE_KEY = 'sofi-regalo-state';

/**
 * completeGame(gameId)
 *
 * Llama a esta función cuando el jugador gana el juego.
 *
 * @param {string} gameId  –  'murdoku' | 'crucigrama' | 'tercerjuego'
 *
 * ¿Cómo llamarla desde el código del juego?
 *   completeGame('murdoku');   ← al detectar victoria
 *
 * Lo que hace internamente:
 *   1. Carga el estado guardado.
 *   2. Marca el juego como completado.
 *   3. Guarda el nuevo estado (lo detectará index.html via 'storage' event).
 *   4. Muestra un mensaje de éxito al jugador.
 *   5. (Opcional) Redirige automáticamente a index.html después de un delay.
 */
// Asegurar que la aventura quede marcada como iniciada al estar en un juego
try {
  sessionStorage.setItem('sofi-adventure-started', 'true');
} catch (e) { /* ignorar */ }

function completeGame(gameId) {
  // 1. Cargar estado actual
  let state = { completed: { murdoku: false, crucigrama: false, tercerjuego: false } };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = JSON.parse(raw);
  } catch (e) { /* ignorar */ }

  // 2. Marcar como completado
  if (!state.completed) state.completed = {};
  state.completed[gameId] = true;

  // 3. Guardar en localStorage y asegurar sessionStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  try {
    sessionStorage.setItem('sofi-adventure-started', 'true');
  } catch (e) { /* ignorar */ }

  // 4. Mostrar feedback visual al jugador
  showCompletionFeedback(gameId);

  // 5. Redirigir a la página principal después de 2.5 segundos
  setTimeout(() => {
    window.location.href = '../index.html?from=game';
  }, 2500);
}

/**
 * Muestra un overlay de victoria en la página del juego.
 * Estilo simple; el diseño completo se puede pulir en la etapa 2.
 */
function showCompletionFeedback(gameId) {
  const names = {
    murdoku:     'Murdoku',
    crucigrama:  'Crucigrama',
    tercerjuego: 'Desafío 3',
  };

  // Crear overlay de victoria
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: hsla(232, 40%, 4%, 0.92);
    backdrop-filter: blur(10px);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    font-family: 'Outfit', sans-serif;
    color: #fff;
    animation: feedbackIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
  `;

  overlay.innerHTML = `
    <style>
      @keyframes feedbackIn {
        from { opacity:0; transform: scale(0.95); }
        to   { opacity:1; transform: scale(1); }
      }
      @keyframes bounceIcon {
        0%, 100% { transform: translateY(0); }
        50%       { transform: translateY(-12px); }
      }
    </style>
    <div style="font-size:4rem; animation: bounceIcon 1.2s ease-in-out infinite;">🎉</div>
    <h2 style="font-size:2rem; font-weight:800; margin:1rem 0 0.5rem; text-align:center;">
      ¡${names[gameId] || gameId} completado!
    </h2>
    <p style="color: hsla(230,15%,65%,1); font-size:1rem; text-align:center; max-width:300px;">
      ¡Muy bien, Sofi! Volvés a la aventura en un momento...
    </p>
  `;

  document.body.appendChild(overlay);
}
