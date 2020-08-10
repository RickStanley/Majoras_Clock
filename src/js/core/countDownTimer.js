const { onCore } = require("./coreScripts");
/**
 *
 * @param {string} dt Format `mm/dd/yyyy hh:mm (AM|PM)` (sorry for the mm/dd format)
 * @param {HTMLElement} element Output element
 */
function countDownTimer(dt, element) {
  let end,
    _second,
    _minute,
    _hour,
    _day,
    timer;

  end = new Date(dt);

  _second = 1000;
  _minute = _second * 60;
  _hour = _minute * 60;
  _day = _hour * 24;

  let now;
  let distance;
  // let days;
  let hours;
  let minutes;
  let seconds;

  function showRemaining() {
    now = new Date();
    distance = end - now;

    if (distance < 0) {
      clearInterval(timer);
      // element.innerHTML = 'EXPIRED!';
      return;
    }
    days = Math.floor(distance / _day);
    hours = Math.floor((distance % _day) / _hour);
    minutes = Math.floor((distance % _hour) / _minute);
    seconds = Math.floor((distance % _minute) / _second);

    // element.innerHTML = '-' + days + 'Days ';
    element.innerHTML = '-&nbsp;';
    element.innerHTML += hours && hours + onCore.lang.hours;
    element.innerHTML += minutes && minutes + onCore.lang.minutes;
    element.innerHTML += seconds + onCore.lang.secondsRemain;
  }
  timer = setInterval(showRemaining, 1000);
}
exports.countDownTimer = countDownTimer;
