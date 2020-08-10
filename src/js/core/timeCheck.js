// Time check until given especific time
function timeCheck(finishCallback, waitingCallback) {
  let today = null;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  let stopInterval = false;
  let interval = setInterval(() => {
    today = new Date();
    hours = today.getHours();
    minutes = today.getMinutes();
    seconds = today.getSeconds();
    if (stopInterval) {
      clearInterval(interval);
      finishCallback();
    }
    else {
      const dayIsEnding = hours === 23 && minutes >= 54 && seconds >= 23;
      if (dayIsEnding) {
        stopInterval = true;
      }
      else {
        waitingCallback();
      }
    }
  }, 250);
}
exports.timeCheck = timeCheck;
