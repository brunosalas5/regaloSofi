/**
 * wordleLogic.js  –  Lógica pura de Wordle Musical
 * ─────────────────────────────────────────────────────────────
 * Sin dependencias del DOM. Se puede probar con Node:
 *
 *   const logic = require('./games/wordleLogic.js');
 *   logic.evaluateGuess('CONCIERTO', 'CONCIERTO');
 *
 * Reglas:
 *   - normalizeWord(): mayúsculas, sin tildes/diéresis, solo A-Z y Ñ.
 *   - evaluateGuess(): dos pasadas (exactas y luego presentes),
 *     respetando la cantidad real de apariciones de cada letra.
 *   - mergeKeyboardState(): prioridad correct > present > absent.
 * ─────────────────────────────────────────────────────────────
 */

(function (root) {
  'use strict';

  const VALID_STATES = ['correct', 'present', 'absent'];
  const STATE_PRIORITY = { absent: 1, present: 2, correct: 3 };

  /**
   * Normaliza una palabra: mayúsculas, sin tildes, sin espacios ni símbolos.
   * La Ñ se conserva como letra propia (no se convierte en N).
   * @param {string} value
   * @returns {string}
   */
  function normalizeWord(value) {
    const raw = String(value == null ? '' : value).toUpperCase();

    // Proteger la Ñ antes de quitar los diacríticos.
    const protectedWord = raw.replace(/Ñ/g, '\u0000');

    return protectedWord
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\u0000/g, 'Ñ')
      .replace(/[^A-ZÑ]/g, '');
  }

  /**
   * Verifica si la palabra tiene exactamente el largo esperado.
   * @param {string} word
   * @param {number} length
   * @returns {boolean}
   */
  function hasValidLength(word, length) {
    return normalizeWord(word).length === length;
  }

  /**
   * Verifica que la palabra pertenezca a la lista de palabras válidas.
   * @param {string} word
   * @param {string[]} validWords
   * @returns {boolean}
   */
  function validateWord(word, validWords) {
    const normalized = normalizeWord(word);
    if (!normalized) return false;
    return validWords.indexOf(normalized) !== -1;
  }

  /**
   * Evalúa un intento contra la palabra objetivo con la lógica de Wordle.
   *
   * 1) Marca todas las coincidencias exactas como "correct".
   * 2) Cuenta las letras restantes del objetivo.
   * 3) Recorre las letras restantes del intento: si todavía queda
   *    una aparición disponible en el objetivo, es "present";
   *    si no, es "absent".
   *
   * Así se manejan correctamente las letras repetidas (C y O en CONCIERTO).
   *
   * @param {string} guess
   * @param {string} target
   * @returns {Array<'correct'|'present'|'absent'>}
   */
  function evaluateGuess(guess, target) {
    const guessLetters = normalizeWord(guess).split('');
    const targetLetters = normalizeWord(target).split('');
    const results = new Array(guessLetters.length).fill('absent');
    const remaining = Object.create(null);

    // Paso 1: coincidencias exactas.
    for (let i = 0; i < guessLetters.length; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        results[i] = 'correct';
      } else if (targetLetters[i]) {
        remaining[targetLetters[i]] = (remaining[targetLetters[i]] || 0) + 1;
      }
    }

    // Paso 2: letras presentes en otra posición, sin superar las apariciones reales.
    for (let i = 0; i < guessLetters.length; i++) {
      if (results[i] === 'correct') continue;
      const letter = guessLetters[i];
      if (remaining[letter] > 0) {
        results[i] = 'present';
        remaining[letter]--;
      }
    }

    return results;
  }

  /**
   * Fusiona el estado de las teclas con un nuevo intento.
   * Nunca degrada un estado: correct > present > absent.
   * @param {Object<string,string>} keyboardState
   * @param {string} guess
   * @param {string[]} results
   * @returns {Object<string,string>}
   */
  function mergeKeyboardState(keyboardState, guess, results) {
    const next = Object.assign({}, keyboardState || {});
    const letters = normalizeWord(guess).split('');

    letters.forEach(function (letter, index) {
      const newState = results[index];
      if (!newState || VALID_STATES.indexOf(newState) === -1) return;

      const currentPriority = STATE_PRIORITY[next[letter]] || 0;
      const newPriority = STATE_PRIORITY[newState] || 0;

      if (newPriority > currentPriority) {
        next[letter] = newState;
      }
    });

    return next;
  }

  /**
   * Indica si un intento es la palabra objetivo.
   * @param {string} guess
   * @param {string} target
   * @returns {boolean}
   */
  function isWinningGuess(guess, target) {
    return normalizeWord(guess) === normalizeWord(target);
  }

  const api = {
    normalizeWord: normalizeWord,
    hasValidLength: hasValidLength,
    validateWord: validateWord,
    evaluateGuess: evaluateGuess,
    mergeKeyboardState: mergeKeyboardState,
    isWinningGuess: isWinningGuess
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.WordleLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
