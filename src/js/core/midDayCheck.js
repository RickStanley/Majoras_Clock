//midDayCheck if it's the Dawn or Fall
function midDayCheck(finishCallback, waitingCallback) {
  let today = null;
  let h = 0;
  let stopInterval = false;
  let interval = setInterval(() => {
    today = new Date();
    h = today.getHours();
    if (stopInterval) {
      clearInterval(interval);
      //@todo Create settings to check for day transition
      // if (h > 12) {  backup, in case the user wants to se the transition return
      finishCallback();
      // } else {
      stopInterval = false;
      // }
    }
    else {
      if (h > 12) {
        stopInterval = true;
      }
      else {
        waitingCallback();
      }
    }
  }, 250);
}
exports.midDayCheck = midDayCheck;
