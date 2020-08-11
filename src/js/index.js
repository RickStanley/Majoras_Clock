//#region Node
const { readSettings, SETTINGS_INTERFACE } = require("../js/core/userSettings.js");
const { ipcRenderer } = require("electron");
//#endregion

import { ready, attach } from "./utils/misc.js";
import BigTitles from "./components/bigTitles.js";

function DawnOfANewDay() {
  const HOURS = (new Date()).getHours();
  const AUDIO_DAY = new Audio('../assets/sounds/Dawn-of-a-new-day.mp3');
  const AUDIO_LAYER_MORNING = new Audio('../assets/sounds/OOT_Morning.wav');

  //setTimeout to delay audio start, to make it more like the original
  setTimeout(() => {
    AUDIO_DAY.play();
    if (HOURS < 12) {
      AUDIO_LAYER_MORNING.play();
    }
  }, 800);
}

export default ready(async () => {
  const [HEY, LISTEN] = [new Audio("../assets/sounds/Navi_Hey.wav"), new Audio("../assets/sounds/Navi_Listen.wav")];

  /** @type {BigTitles} */
  const BIG_TITLES = document.querySelector("big-titles");
  const INFO = document.getElementById("info");
  const MODAL_DIALOG = document.getElementById("modal");
  //#region Node
  const MODIFIER_KEY = process.platform === "darwin" ? "CMD" : "Ctrl";
  //#region

  const FINAL_HOURS_TRACK = new Audio("../assets/sounds/FinalHours.m4a")

  const { default: LOCALE } = await import(`./lang/lang.${readSettings(SETTINGS_INTERFACE.language.name)}.js`);

  const DELAYS = SETTINGS_INTERFACE.delays.fields.map(({ name }) => readSettings(name));
  const ENALBED_TRANSITIONS = SETTINGS_INTERFACE.transitions.fields.map(({ name }) => readSettings(name))

  // Maybe use class properties instead of HTML attributes? Like locale
  BIG_TITLES.setAttribute("delays", JSON.stringify(DELAYS));
  BIG_TITLES.setAttribute("transitions", JSON.stringify(ENALBED_TRANSITIONS));
  BIG_TITLES.setAttribute("font", readSettings(SETTINGS_INTERFACE.font.name));

  BIG_TITLES.locale = LOCALE;

  BIG_TITLES.addEventListener("finaldayending", ({ detail: milliseconds }) => {
    const SECOND = 1000;
    const MINUTE = SECOND * 60;
    const SECONDS = ~~((milliseconds % MINUTE) / SECOND);
    FINAL_HOURS_TRACK.currentTime = SECONDS;
    FINAL_HOURS_TRACK.play();
  }, {
    once: true
  });

  BIG_TITLES.addEventListener("finaldayended", () => {
    ipcRenderer.invoke("newDay", "period");
  });

  attach(BigTitles, BigTitles.DEFAULT_NAME);

  DawnOfANewDay();

  if (readSettings("auto-minimize")) {
    setTimeout(() => {
      //#redion Node
      ipcRenderer.invoke("minimize:main");
      //#endregion
    }, 10000);
  }

  INFO.textContent = `[${MODIFIER_KEY}+X] ${LOCALE.exit} | [${MODIFIER_KEY}+C] ${LOCALE.minimize} | [O] ${LOCALE.menu}`;

  LISTEN.addEventListener("ended", () => {
    alert("Thank you for using my app. :)");
  });

  //#region Events
  document.addEventListener('keyup', event => {
    let key = event.which || event.keyCode;
    if ((key === 79) && !MODAL_DIALOG.open) {
      MODAL_DIALOG.showModal();
    } else if ((key === 88 || key === 27 || key === 79) && MODAL_DIALOG.open) {
      MODAL_DIALOG.close();
    }
  });

  document.body.addEventListener("click", event => {
    /**
     * @type {HTMLElement}
     */
    const ACTION_ELEMENT = event.target.closest("[data-action]");
    if (ACTION_ELEMENT) {
      const ACTION = ACTION_ELEMENT.dataset.action;

      switch (ACTION) {
        case "open:secret":
          LISTEN.play();
          break;
      }
    }
  });

  document.body.addEventListener("mouseenter", event => {
    const SECRET = event.target.closest(".navi");
    if (SECRET) {
      HEY.play();
    }
  }, {
    passive: true,
    capture: true,
  });

  let cursorTimer;

  // Hide cursor
  document.body.addEventListener("mousemove", () => {
    clearTimeout(cursorTimer);
    document.body.style.cursor = "default";
    cursorTimer = setTimeout(() => {
      if (!MODAL_DIALOG.open) {
        document.body.style.cursor = "none";
      }
    }, 500);
  }, {
    passive: true
  });
  //#endregion Events
});