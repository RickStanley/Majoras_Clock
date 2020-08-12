//#region Node
const { ipcRenderer } = require("electron");
//#endregion

import { getAudioDuration } from "../utils/misc.js";

/**
 * @typedef {Object} CallOptions
 * @property {string} call Call channel.
 * @property {string} [argument] Call argument(s).
 */

async function dayTimePeriodCheck() {
  /** @type {CallOptions} */
  let currentCallOptions;

  /**
   * @type {Map<Date, CallOptions>}
   */
  const CALLS = new Map();

  const NOW = new Date();

  const BELLS = new Audio("../assets/sounds/MM_ClockTower_Bell.wav");

  const BELLS_DURATION = await getAudioDuration(BELLS);
  const END_SECONDS = 60 - (~~BELLS_DURATION);

  const NEXT_DAWN_DATE = NOW.getHours() < 6 ? NOW.getDate() : NOW.getDate() + 1;

  const NEXT_DAWN = new Date(NOW.getFullYear(), NOW.getMonth(), NEXT_DAWN_DATE, 5, 59, END_SECONDS);

  // Since the window always re-opens in the main process, there'll always be a "next dawn".
  CALLS.set(NEXT_DAWN, { call: "newDay" });

  // But we have to check if the night has passed.
  if (NOW.getHours() < 18) {
    const NIGHT_FALL = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate(), 17, 59, END_SECONDS);
    CALLS.set(NIGHT_FALL, { call: "night" });
  }

  BELLS.addEventListener("ended", () => {
    ipcRenderer.send(...Object.values(currentCallOptions));
  });

  for (const [DATE, OPTIONS] of CALLS) {
    const DISTANCE = DATE - NOW;
    setTimeout(() => {
      currentCallOptions = OPTIONS;
      BELLS.play();
    }, DISTANCE);
  }
}

export default dayTimePeriodCheck;
