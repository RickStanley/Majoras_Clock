//#region Node
const { ipcRenderer } = require("electron");
//#endregion

/**
 * Function to new day start.
 */
function setNewDayTimer() {
  if (globalThis.newdaytimer)
    clearTimeout(newdaytimer);
  const NOW = new Date();
  const TOMORROW = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() + 1);
  const DISTANCE = TOMORROW - NOW;
  globalThis.newdaytimer = setTimeout(() => ipcRenderer.send("newDay"), DISTANCE);
}

export default setNewDayTimer;