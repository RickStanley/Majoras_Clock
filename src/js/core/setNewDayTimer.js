//#region Node
const { ipcRenderer } = require("electron");
//#endregion

import { getAudioDuration } from "../utils/misc.js";

/**
 * Function to new day start.
 */
async function setNewDayTimer() {
  if (globalThis.newdaytimer)
    clearTimeout(newdaytimer);

  const BELLS = new Audio("../assets/sounds/MM_ClockTower_Bell.wav");
  const BELLS_DURATION = await getAudioDuration(BELLS);
  const END_MILLISECONDS = (~~BELLS_DURATION) * 1000;

  const NOW = new Date();
  const TOMORROW = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() + 1);
  // Subtract the duration of the bells' audio.
  const DISTANCE = TOMORROW - NOW - END_MILLISECONDS;

  BELLS.addEventListener("ended", () => {
    ipcRenderer.send("newDay");
  });

  globalThis.newdaytimer = setTimeout(() => {
    BELLS.play();
  }, DISTANCE);
}

export default setNewDayTimer;