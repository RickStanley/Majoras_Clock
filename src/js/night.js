//#region Node
const { readSettings, SETTINGS_INTERFACE } = require("../js/core/userSettings.js");
const { ipcRenderer } = require("electron");
//#endregion

import NightTitles from "./components/nightTitles.js";
import { attach, ready } from "./utils/misc.js";

ready(async () => {
  const LANG = readSettings(SETTINGS_INTERFACE.language.name);
  const STYLE = readSettings(SETTINGS_INTERFACE.font.name);

  const { default: LOCALE } = await import(`./lang/lang.${LANG}.js`);

  const WOLF = new Audio("../assets/sounds/OOT_6pmWolf.wav");
  const NIGHT_TITLES = document.querySelector("night-titles");

  NIGHT_TITLES.classList.add(STYLE);

  NIGHT_TITLES.locale = LOCALE;

  NIGHT_TITLES.addEventListener("animationend", () => {
    ipcRenderer.invoke("close:night");
  }, {
    once: true
  });

  attach(NightTitles, NightTitles.DEFAULT_NAME);

  setTimeout(() => {
    WOLF.play();
  }, 1000);
});