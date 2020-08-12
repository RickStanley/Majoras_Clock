//#region Node
const { readSettings } = require("../js/core/userSettings.js");
const { ipcRenderer } = require("electron");
//#endregion Node

if (readSettings("check-time-period")) {
  (async () => {
    try {
      const { default: dayTimePeriodCheck } = await import("./core/dayTimePeriodCheck.js");
      dayTimePeriodCheck();
    } catch { }
  })()
}

if (readSettings("check-day-transition")) {
  (async () => {
    try {
      const { default: setNewDayTimer } = await import("./core/setNewDayTimer.js");
      setNewDayTimer();
    } catch { }
  })()
}

ipcRenderer.on("ready", async () => {
  const IS_CURRENT_WINDOW_VISIBLE = await ipcRenderer.invoke("main:is:visible");

  if (IS_CURRENT_WINDOW_VISIBLE) {
    await import("./index.js");
    import("./modal.js");
  }

});

//#region Node
// This is necessary because the previous main window gets destroyed
// and this won't play in index.js, because it's gone.
// We need way for the main process to tell this when it should play.
ipcRenderer.on("playrooster", () => {
  const ALARM = new Audio("../assets/sounds/OOT_6amRooster.wav");
  ALARM.play();
});
//#endregion