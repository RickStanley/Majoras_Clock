"use strict";

/**
 * Creates a predictable hash from string.
 * @param {string} string 
 */
const hashCode = string => { for (var i = 0, h; i < string.length; i++)h = Math.imul(31, h) + string.charCodeAt(i) | 0; return h }

/**
 * Executes code when document ready.
 * @param {Function} f 
 */
const ready = f => /in/.test(document.readyState) ? setTimeout(ready, 5, f) : f();

/**
 * @returns {Promise<number>}
 * @param {HTMLAudioElement} audio 
 */
const getAudioDuration = audio => {
  return new Promise((resolve, reject) => {
    audio.addEventListener("loadeddata", () => {
      if (audio.duration)
        resolve(audio.duration);
      else reject("Couldn't retrieve audio duration.");
    }, {
      once: true
    });
  });
};

/**
 * Attaches/define component in current window.
 * @param {CustomElementConstructor} component 
 * @param {string} componentName 
 * @param {ElementDefinitionOptions} [options]
 */
const attach = (component, componentName, options) => customElements.define(componentName, component, options);

export {
  ready,
  hashCode,
  attach,
  getAudioDuration
};