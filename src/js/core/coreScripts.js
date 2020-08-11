"use strict";

const { countDownTimer } = require("./countDownTimer");
const { timeCheck } = require("./timeCheck");

const remote = require('electron').remote;

let onCore = {
  delays: [],
  font: null,
  lang: null
};

exports.onCore = onCore;

function mainLoad() {
  const win = remote.getCurrentWindow();
  settings();
  const isWindowEntirelyVisible = (win.isFullScreen()) && (!win.isMinimized());
  if (isWindowEntirelyVisible) {
    let day;

    const thisYear = new Date().getFullYear();
    const hours = hoursRemain();
    const middle = document.getElementById('middleTitle');
    const bottom = document.getElementById('bottomTitle');
    const today = dayNumber();
    const isFinalDay = ((!(isLeapYear()) && (today === 365)) || ((isLeapYear()) && (today === 366)));
    const body = document.getElementById('indexBody');

    if (onCore.font === "classic") {
      body.style.fontFamily = onCore.font;
    } else {
      body.style.fontFamily = onCore.font;
      bottom.style.fontWeight = "200";
      bottom.style.fontFamily = "frizQuadrata";
    }

    // this one has to come first, for finalHours() to work
    bottom.innerHTML = `-&nbsp;${onCore.lang.specific}${hours}&nbsp;${onCore.lang.hoursRemain}&nbsp;-`;
    if (today === 1) {
      day = onCore.lang.first;
    } else if (today === 2) {
      day = onCore.lang.second;
    } else if (today === 3) {
      day = onCore.lang.third;
    } else if (isFinalDay) {
      let timing = 0;
      day = onCore.lang.final;
      // we need to create callback function to check every second, if and only if the
      // statement for the final day is true
      timeCheck(() => {
        if (win.isMinimized()) win.restore();
        timing = (60 * 5) + 37;
        bottom.innerHTML = `- <span id="time"></span>&nbsp;${onCore.lang.timeRemain}&nbsp;-`;
        const display = document.querySelector('#time');
        finalHours(timing, display);
      }, () => {
        countDownTimer(`12/31/${thisYear} 11:54:37 PM`, bottom);
      });
    } else {
      if ((onCore.lang.language === "en") && (today > 3) && !(isFinalDay)) {
        const lastDigit = (today % 10);
        if (lastDigit === 1) {
          day = `${today}st`;
        } else if (lastDigit === 2) {
          day = `${today}nd`;
        } else if (lastDigit === 3) {
          day = `${today}rd`;
        } else {
          day = `${today}th`;
        }
      } else if ((onCore.lang.language === "fr") && (today > 3) && !(isFinalDay)) {
        day = `${today}ème`;
      } else {
        day = today;
      }
    }
    middle.innerHTML = `${onCore.lang.The}&nbsp;${day}&nbsp;${onCore.lang.Day}`;
  }
}

window.addEventListener("load", () => {
  mainLoad();

});

/**
 * @param {number} duration Duration of the countdown (in seconds)
 * @param {HTMLElement} display Display element of the countdown
 */
function finalHours(duration, display) {
  let start = Date.now();
  let minutes = 0;
  let seconds = 0;
  let diff = 0;
  let interval = null;
  const onfinalHours = new Audio('./assets/sounds/FinalHours.m4a');
  onfinalHours.play();

  const timer = () => {
    //get the number of seconds that have elapsed since startTimer() was called
    diff = duration - (((Date.now() - start) / 1000) | 0);

    //does the same job as parseInt truncates the float
    minutes = (diff / 60) | 0;
    seconds = (diff % 60) | 0;

    display.textContent = `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    if (diff <= 0) {
      // add one second so that the count down starts at the full duration example
      // 02:46 not 02:45
      start = Date.now() + 1000;
    }
    if (minutes === 0 && seconds === 0) {
      clearInterval(interval);
      ipcRenderer.send('newDay', 'period');
    }
  }
  //we don't want to wait a full second before the timer starts
  timer();
  interval = setInterval(timer, 1000);
}
