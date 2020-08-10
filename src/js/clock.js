//#region Node
const { ipcRenderer } = require("electron");
//#endregion

import { ready, attach } from "./utils/misc.js";
import TerminaClock from "./components/terminaClock.js";

ready(async () => {

  attach(TerminaClock, TerminaClock.DEFAULT_NAME);

  document.body.addEventListener("click", event => {
    /** @type {HTMLElement | undefined} */
    const ACTION_ELEMENT = event.target.closest("[data-action]");

    if (ACTION_ELEMENT) {
      const ACTION = ACTION_ELEMENT.dataset.action;
      switch (ACTION) {
        case "close:clock":
          ipcRenderer.invoke("close:clock");
          break;
      }
    }
  });
});