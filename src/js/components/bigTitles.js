/** @typedef {typeof import("../lang/lang.en.js").default} Locale*/

import hoursRemain from "../utils/hoursRemain.js";
import localizeDay from "../utils/localizeDay.js";
import aboutToday from "../utils/aboutToday.js";

const BIG_TITLES_STYLE = new CSSStyleSheet();

class BigTitles extends HTMLElement {

  static DEFAULT_NAME = "big-titles";
  CURRENT_DAY = 1;
  IS_FINAL_DAY = false;
  LOCALE = null;
  #P = document.createElement("p");
  #TOP_TITLE = document.createElement("span");
  #MIDDLE_TITLE = document.createElement("span");
  #BOTTOM_TITLE = document.createElement("span");

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    if (!this.locale) throw new Error("No locale provided.");

    this.shadowRoot.adoptedStyleSheets = [BIG_TITLES_STYLE];

    [this.CURRENT_DAY, this.IS_FINAL_DAY] = Object.values(aboutToday());

    this.#P.classList.add("titles");

    this.#TOP_TITLE.classList.add("title", "top-title");
    this.#MIDDLE_TITLE.classList.add("title", "middle-title");
    this.#BOTTOM_TITLE.classList.add("title", "bottom-title");

    this.#P.appendChild(this.#TOP_TITLE);
    this.#P.appendChild(this.#MIDDLE_TITLE);
    this.#P.appendChild(this.#BOTTOM_TITLE);
    this.render();
  }

  get locale() {
    return this.LOCALE;
  }

  get isFinalDay() {
    return this.IS_FINAL_DAY;
  }

  /**
   * @param {string} value
   */
  set topText(value) {
    this.#TOP_TITLE.textContent = value;
  }

  /**
   * @param {string} value
   */
  set middleText(value) {
    this.#MIDDLE_TITLE.textContent = value;
  }

  /**
   * @param {string} value
   */
  set bottomText(value) {
    this.#BOTTOM_TITLE.textContent = value;
  }

  /**
   * @param {Locale} value
   */
  set locale(value) {
    this.LOCALE = value;
  }

  async render() {
    /** @type {number[] | undefined} */
    const DELAYS = this.getAttribute("delays") && JSON.parse(this.getAttribute("delays"));
    const ENABLED_TRANSITIONS = this.getAttribute("transitions") && JSON.parse(this.getAttribute("transitions"));

    this._prepareTitles();

    if (DELAYS)
      this._setTitleDelays(DELAYS);
    if (ENABLED_TRANSITIONS)
      this._setEnabledTransitions(ENABLED_TRANSITIONS);

    this.shadowRoot.appendChild(this.#P);

  }

  _prepareTitles() {
    const NOW = new Date();

    const REMAINING_HOURS = hoursRemain(this.CURRENT_DAY);

    this.topText = NOW.getHours() > 12 ? this.locale.fall : this.locale.dawn;

    const CENTER_TEXT = localizeDay(this.CURRENT_DAY, this.locale, this.IS_FINAL_DAY);

    this.middleText = `${this.locale.The} ${CENTER_TEXT} ${this.locale.Day}`;

    if (this.IS_FINAL_DAY) {
      this._startFinalHours(NOW);
    } else {
      this.bottomText = `- ${this.locale.specific}${REMAINING_HOURS} ${this.locale.hoursRemain} -`;
    }

  }

  /**
   * Starts final hours.
   */
  _startFinalHours(INITIAL_TIME = new Date()) {
    //#region Conversion to milliseconds
    const SECOND = 1000;
    const MINUTE = SECOND * 60;
    const HOUR = MINUTE * 60;
    const DAY = HOUR * 24;
    //#endregion

    /** @type {[number, number, number]} Triple indicating expected end. In this order: HOURS, MINUTES, SECONDS. */
    const FINAL_HOUR_THRESHOLD = [23, 54, 23]
    const END_DAY_THRESHOLD = new Date(INITIAL_TIME.getFullYear(), INITIAL_TIME.getMonth(), INITIAL_TIME.getDate(), ...FINAL_HOUR_THRESHOLD);
    const NEXT_DAY = new Date(INITIAL_TIME.getFullYear(), INITIAL_TIME.getMonth(), INITIAL_TIME.getDate() + 1);

    const LOOP = () => {
      const CURRENT_ITERATION = new Date();

      const DAY_IS_ENDING = (END_DAY_THRESHOLD - CURRENT_ITERATION) <= 0;
      const DAY_HAS_ENDED = (NEXT_DAY - CURRENT_ITERATION) <= 0;
      const CURRENT_DISTANCE = NEXT_DAY - CURRENT_ITERATION;

      let resultText = "";

      // "~~" is somewhat faster than Math.floor()
      const MINUTES = (~~((CURRENT_DISTANCE % HOUR) / MINUTE)).toString().padStart(2, "0");
      const SECONDS = (~~((CURRENT_DISTANCE % MINUTE) / SECOND)).toString().padStart(2, "0");

      if (DAY_IS_ENDING) {
        this.dispatchEvent(new CustomEvent("finaldayending", {
          detail: CURRENT_DISTANCE,
        }));
        // Get meaningful milliseconds.
        const MILLISECONDS = CURRENT_DISTANCE.toString().padStart(3, "0").slice(-3).slice(0, -1);
        resultText = `- ${MINUTES}:${SECONDS}:${MILLISECONDS} ${this.locale.timeRemain} -`;
      } else {
        const HOURS = (~~((CURRENT_DISTANCE % DAY) / HOUR)).toString().padStart(2, "0");

        // All together now!
        resultText = `- ${HOURS + this.locale.hours + MINUTES + this.locale.minutes + SECONDS + this.locale.secondsRemain}`;
      }

      this.bottomText = resultText;

      if (DAY_HAS_ENDED) {
        this.dispatchEvent(new CustomEvent("finaldayended"));
      } else {
        requestAnimationFrame(LOOP);
      }
    };

    LOOP();
  }

  _setTitleDelays([TOP_TITLE_DELAY, MIDDLE_TITLE_DELAY, BOTTOM_TITLE_DELAY]) {
    this.#TOP_TITLE.style.setProperty("--delay", TOP_TITLE_DELAY);
    this.#MIDDLE_TITLE.style.setProperty("--delay", MIDDLE_TITLE_DELAY);
    this.#BOTTOM_TITLE.style.setProperty("--delay", BOTTOM_TITLE_DELAY);
  }

  _setEnabledTransitions([TOP_ENABLED, MIDDLE_ENABLED, BOTTOM_ENABLED]) {
    this.#TOP_TITLE.classList.toggle("title--transitioned", TOP_ENABLED);
    this.#MIDDLE_TITLE.classList.toggle("title--transitioned", MIDDLE_ENABLED);
    this.#BOTTOM_TITLE.classList.toggle("title--transitioned", BOTTOM_ENABLED);
  }

  connectedCallback() {
    // Only actually parse the stylesheet when the first instance is connected.
    if (BIG_TITLES_STYLE.cssRules.length == 0) {
      const CURRENT_FONT = this.getAttribute("font") || "classic";
      const BOTTOM_FONT_WEIGHT = CURRENT_FONT === "classic" ? "bold" : "200";

      const TOP_TITLE_SIZE = CURRENT_FONT === "classic" ? 100 : 180;

      BIG_TITLES_STYLE.replaceSync(`
      .titles {
        vertical-align: middle;
        line-height: 1;
        color: white;
        text-align: center;
      }
  
      .title {
        display: block;
        opacity: 0;
        animation: showTitle 0s linear calc(var(--delay, 1) * 1s) forwards;
      }
  
      .title--transitioned {
        animation: showTitle 1s ease calc(var(--delay, 1) * 1s) forwards;
      }
  
      .top-title {
        font-weight: normal;
        font-size: calc(${TOP_TITLE_SIZE} / 1536 * 100vw);
        font-weight: bold;
        letter-spacing: calc(-5 / 1536 * 100vw);
      }
  
      .middle-title {
        font-weight: bold;
        font-size: calc(180 / 1536 * 100vw);
        letter-spacing: calc(-10 / 1536 * 100vw);
        margin: calc(30 / 1536 * 100vw) auto calc(100 / 1536 * 100vw);
      }
  
      .bottom-title {
        font-family: '${CURRENT_FONT}';
        font-size: calc(70 / 1536 * 100vw);
        line-height: calc(150 / 1536 * 100vw);
        font-weight: ${BOTTOM_FONT_WEIGHT};
        letter-spacing: calc(-5 / 1536 * 100vw);
      }
  
      @keyframes showTitle {
        to {
          opacity: 1;
        }
      }
  `);
    }
  }

}

export default BigTitles;