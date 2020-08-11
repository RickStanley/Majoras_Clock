//#region Node
const { ipcRenderer } = require("electron");
//#endregion

function dayTimePeriodCheck() {
  let end;
  let distance = 0;
  let call = "";
  let argument = "";
  const now = new Date();
  const bells = new Audio("../assets/sounds/MM_ClockTower_Bell.wav");
  if (now.getHours() < 6) {
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), "05", "59", "44");
    call = "newDay";
    argument = "period";
  }
  else if (now.getHours() < 18) {
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), "17", "59", "44");
    call = "night";
  }
  else {
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, "05", "59", "44");
    call = "newDay";
    argument = "period";
  }
  distance = end - now;
  if (distance > 0) {
    setTimeout(() => {
      bells.play();
      setTimeout(() => {
        ipcRenderer.invoke(call, argument);
      }, 15000);
    }, distance);
  }
}

export default dayTimePeriodCheck;
