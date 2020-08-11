//#region Node
const { saveSettings, readAllSettings, SETTINGS_INTERFACE } = require("../js/core/userSettings.js");
const { ipcRenderer } = require("electron");
//#endregion Node

import { ready, attach } from "./utils/misc.js";
import InputRange from "./components/inputRange.js";
import TerminaClock from "./components/terminaClock.js";

const SETTINGS_TEMPLATE = document.createElement("template");

const createRadios = (values, { name = "" } = {}) => values.map(({ value, label }) => `
<label class="radio">
  <input type="radio" name="${name}" value="${value}">
  <i></i>
  <span>${label}</span>
</label>
`);

const createToggle = ({ label = "", name = "", checked = false } = {}) => `
<label class="toggle">
  <input name="${name}" type="checkbox" ${checked ? "checked" : ""} >
  <i></i>
  <span>${label}</span>
</label>
`;

const createRange = ({ label = "", value = "1", name = "", min = "1", max = "4" } = {}) => `
${label ? `<label>${label}</label>` : ""}
<div class="range" is="input-range">
  <input type="range" name="${name}" value="${value}" min="${min}" max="${max}">
  <output>${value}</output>
</div>
`;

/**
 * @param {{label: string, value: string}[]} values 
 */
const createSelect = (values, { name = "" } = {}) => `
<div class="select">
  <select name="${name}">
  ${values.map(({ label, value }) => `<option value="${value}">${label}</option>`).join("")}
  </select>
</div>
`;

/**
 * 
 * @param {{legend?: string, type: string, name?: string, fields: { label: string, name: string, value?: any}[]}} GROUP 
 */
const setupGroupSettings = GROUP => {
  switch (GROUP.type) {
    case "toggle":
      return GROUP.fields.map(createToggle).join("");
    case "range":
      return GROUP.fields.map(createRange).join("");
    case "radio":
      return createRadios(GROUP.fields, { name: GROUP.name }).join("");
    case "select":
      return createSelect(GROUP.fields, { name: GROUP.name });
  }
};

SETTINGS_TEMPLATE.innerHTML = `
  <header class="modal__header">
    <button data-action="open:more" class="button button--continue">More settings</button>
    <button data-action="close:modal" class="button button--exit button--reverse">Exit</button>
  </header>
  <termina-clock assets="../assets/termina_clock"></termina-clock>
  <h1 class="modal__title">Majora's Clock</h1>
  <form class="modal__form">
    <div class="modal__form__fields">
      <fieldset>
        <div class="form__group" style="--items: ${SETTINGS_INTERFACE.general.fields.length};">
        ${setupGroupSettings(SETTINGS_INTERFACE.general)}
        </div>
      </fieldset>
      <fieldset>
        <legend>${SETTINGS_INTERFACE.delays.legend}</legend>
        <div class="form__group-range">
        ${setupGroupSettings(SETTINGS_INTERFACE.delays)}
        </div>
      </fieldset>
    </div>
    <div class="modal__form__fields">
      <fieldset>
        <legend>${SETTINGS_INTERFACE.font.legend}</legend>
        <div class="form__group" style="--items:${SETTINGS_INTERFACE.font.fields.length};">
        ${setupGroupSettings(SETTINGS_INTERFACE.font)}
        </div>
      </fieldset>
      <fieldset>
        <legend>${SETTINGS_INTERFACE.language.legend}</legend>
        ${setupGroupSettings(SETTINGS_INTERFACE.language)}
      </fieldset>
      <fieldset>
        <legend>${SETTINGS_INTERFACE.transitions.legend}</legend>
        <div class="form__group" style="--items: ${SETTINGS_INTERFACE.transitions.fields.length};">
          ${setupGroupSettings(SETTINGS_INTERFACE.transitions)}
        </div>
      </fieldset>
    </div>
  </form>
`;

export default ready(async () => {
  const CLOSE = new Audio('../assets/sounds/Dialogue_Done.wav');
  const NEXT = new Audio('../assets/sounds/Dialogue_Next.wav');

  // Should always have atleast one element with "modal" id.
  // As it could be either a embed modal or a independent window.
  const MODAL = document.getElementById("modal");
  MODAL.appendChild(SETTINGS_TEMPLATE.content.cloneNode(true));

  const FORM = MODAL.querySelector("form");

  attach(InputRange, InputRange.DEFAULT_NAME, { extends: "div" });

  attach(TerminaClock, TerminaClock.DEFAULT_NAME);

  MODAL.addEventListener("click", event => {
    /** @type {HTMLElement | undefined} */
    const ACTION_ELEMENT = event.target.closest("[data-action]");

    if (ACTION_ELEMENT) {
      const ACTION = ACTION_ELEMENT.dataset.action;
      switch (ACTION) {
        case "close:modal":
          try {
            MODAL.close();
          } catch {
            ipcRenderer.invoke("close:modal");
          } finally {
            CLOSE.play();
          }
          break;
        case "open:more":
          const MORE_OPEN = MODAL.dataset.view === "more";
          MODAL.dataset.view = MORE_OPEN ? "" : "more";
          NEXT.play();
          break;
      }
    }
  });

  // Setup already defined settings if any.
  for (const [KEY, VALUE] of Object.entries(readAllSettings())) {
    /**
     * The corresponding control element.
     * @type {HTMLSelectElement | HTMLInputElement}
     */
    const FORM_ELEMENT = FORM.elements[KEY];
    if (FORM_ELEMENT) {
      if (FORM_ELEMENT.type === "checkbox") FORM_ELEMENT.checked = VALUE;
      else FORM_ELEMENT.value = VALUE;
      try {
        // Covers the case for input range event listener.
        FORM_ELEMENT.dispatchEvent(new Event("input"));
      } catch { }
    }
  }

  FORM.addEventListener("change", function (event) {
    /**
     * @type {HTMLSelectElement | HTMLInputElement}
     */
    const FORM_ELEMENT = event.target;
    const VALUE = FORM_ELEMENT.type === "checkbox" ? FORM_ELEMENT.checked : FORM_ELEMENT.value;
    saveSettings(FORM_ELEMENT.name, VALUE);

    if (FORM_ELEMENT.type === "checkbox") {
      ipcRenderer.invoke("headless");
    }
  });

  MODAL.dispatchEvent(new CustomEvent("mounted"));
});