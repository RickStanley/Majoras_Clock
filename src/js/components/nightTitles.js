/** @typedef {typeof import("../lang/lang.en.js").default} Locale*/

import hoursRemain from "../utils/hoursRemain.js";
import localizeDay from "../utils/localizeDay.js";
import aboutToday from "../utils/aboutToday.js";

const NIGHT_TITLES_STYLE = new CSSStyleSheet();

class NightTitles extends HTMLElement {

  static DEFAULT_NAME = "night-titles";

  #TOP_TITLE = document.createElement("p");
  #BOTTOM_TITLE = document.createElement("p");

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.shadowRoot.adoptedStyleSheets = [NIGHT_TITLES_STYLE];

    this.render();
  }

  async render() {
    const [DAY_NUMBER, IS_FINAL_DAY] = Object.values(aboutToday());
    const HOURS = hoursRemain(DAY_NUMBER);
    const DAY_LOCALIZED = localizeDay(DAY_NUMBER, this.locale, IS_FINAL_DAY);

    // Japanese version needs to be improved, I don't speak japanese.
    const CONTENT_TOP = this.locale.language === "jp" ? DAY_LOCALIZED + this.locale.onNightOf : `${this.locale.onNightOf}${DAY_LOCALIZED} ${this.locale.Day}`;
    const CONTENT_BOTTOM = `-${this.locale.specific}${HOURS} ${this.locale.hoursRemain}-`;

    this.shadowRoot.appendChild(this.#TOP_TITLE);
    this.shadowRoot.appendChild(this.#BOTTOM_TITLE);

    if (this.classList.contains("remaster")) {
      this.#TOP_TITLE.textContent = CONTENT_TOP;
      this.#BOTTOM_TITLE.textContent = CONTENT_BOTTOM;
    } else {
      await this._type(CONTENT_TOP, 60, this.#TOP_TITLE);
      this._type(CONTENT_BOTTOM, 30, this.#BOTTOM_TITLE);
    }

  }

  get locale() {
    return this.LOCALE;
  }

  /**
 * @param {Locale} value
 */
  set locale(value) {
    this.LOCALE = value;
  }

  /**
   * Simple typewriter effect.
   * @param {string} text 
   * @param {number} speed Speed in milliseconds.
   * @param {HTMLElement} container
   */
  _type(text, speed, container) {
    return new Promise((resolve) => {
      let loopStart = (new Date()).getTime();
      const TEXT_SIZE = text.length;
      let index = 0;
      const TYPE = () => {
        const CURRENT = (new Date()).getTime();
        const DELTA = CURRENT - loopStart;
        if (DELTA >= speed) {
          loopStart = (new Date()).getTime();
          container.textContent = container.textContent + text.charAt(index);
          index++;
        }
        if (!(index >= TEXT_SIZE))
          requestAnimationFrame(TYPE);
        else resolve();
      };

      TYPE();
    });
  }

  connectedCallback() {
    // Only actually parse the stylesheet when the first instance is connected.
    if (NIGHT_TITLES_STYLE.cssRules.length == 0) {

      NIGHT_TITLES_STYLE.replaceSync(`
      :host {
        font-family: 'Arial Narrow', Helvetica;
        display: block;
        height: 100%;
        padding-top: 30px;
        padding-left: 230px;
        animation: fadeOut 1s ease 3.5s forwards;
      }

      :host(.classic) {
        font-family: 'classic';
        background: linear-gradient(to right, rgba(0, 0, 0, 0.97) 7%, rgba(30, 10, 33, 0.97) 14%, rgba(111, 38, 122, 0.25) 33%, rgba(105, 9, 120, 0.15) 70%, rgba(103, 0, 119, 0.09) 81%, rgba(111, 38, 122, 0) 100%);
      }

      :host(.remaster) {
        font-family: 'remaster';
        background: linear-gradient(to left, rgba(32, 0, 96, 0.97) 6%, rgba(32, 0, 96, 0.9) 13%, rgba(81, 0, 120, 0.69) 33%, rgba(108, 34, 119, 0) 100%);
        padding: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      :host(.remaster) p {
        width: auto;
        margin: 0;
      }

      p {
        font-family: inherit;
        line-height: 100px;
        letter-spacing: -5px;
        font-weight: 500;
        font-size: 75px;
        margin: 10px 0 0 10px;
        white-space: nowrap;
        overflow: hidden;
        width: 30em;
        width: auto;
        text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.97);
        animation: fadeIn 2s ease both, fadeOut .5s ease 3s forwards;
      }

      p:first-child {
        color: yellow;
      }

      p:last-child {
        color: red;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
      }

      @keyframes fadeOut {
        to {
          opacity: 0;
        }
      }
      `);
    }
  }
}

export default NightTitles;