"use strict";
const remote = require('electron').remote;

let onCore = {
    delays: [],
    font: null,
    lang: null
};

function settings() {
    const win = remote.getCurrentWindow(),
        result = Object.keys(configuration.readSettings('customConf'));
    for (let index = 0, length = result.length, resultKey, value; index < length; index++) {
        resultKey = result[index];
        value = configuration.readSettings(`customConf:${resultKey}`);
        if ((resultKey === 'exitOnDawn') && value) {
            setTimeout(() => {
                win.minimize(true);
            }, 10000);
        } else if ((resultKey === 'checkTimePeriod') && value) {
            timePeriod();
        } else if ((resultKey === 'checkDayTransition') && value) {
            setNewDayTimer();
        } else if (resultKey === 'delayTop') {
            onCore.delays[0] = value;
        } else if (resultKey === 'delayMid') {
            onCore.delays[1] = value;
        } else if (resultKey === 'delayBottom') {
            onCore.delays[2] = value;
        } else if (resultKey === 'font') {
            onCore.font = value;
        } else if (resultKey === 'lang') {
            onCore.lang = require(`./lang.${value}.js`);
        } else if ((resultKey === 'topTrans') && !value) {
            document.getElementById('topTitle').style.transition = 'none';
        } else if ((resultKey === 'midTrans') && !value) {
            document.getElementById('middleTitle').style.transition = 'none';
        } else if ((resultKey === 'botTrans') && !value) {
            document.getElementById('bottomTitle').style.transition = 'none';
        }
    }
}

function mainLoad() {
    const win = remote.getCurrentWindow();
    settings();
    if ((win.isFullScreen()) && (!win.isMinimized())) {
        // Reassignable variables
        let day,
            timer,
            timeout;

        const thisYear = new Date().getFullYear(),
            info = document.getElementById('info'),
            hours = hoursRemain(),
            top = document.getElementById('topTitle'),
            middle = document.getElementById('middleTitle'),
            bottom = document.getElementById('bottomTitle'),
            today = dayNumber(),
            isFinalDay = ((!(isLeapYear()) && (today === 365)) || ((isLeapYear()) && (today === 366))),
            modal = document.getElementById('menu'),
            body = document.getElementById('indexBody');

        if (onCore.font === 'classic') {
            body.style.fontFamily = onCore.font;
        } else {
            body.style.fontFamily = onCore.font;
            bottom.style.fontWeight = '200';
            bottom.style.fontFamily = 'frizQuadrata';
        }

        timeout = () => {
            if (modal.style.display !== "block") {
                body.style.cursor = "none";
            }
        };

        window.addEventListener('mousemove', () => {
            clearTimeout(timer);
            body.style.cursor = "default";
            timer = setTimeout(timeout, 500);
        }, true);

        DawnOfANewDay();

        midDayCheck(() => {
            top.innerHTML = onCore.lang.fall;
        }, () => {
            top.innerHTML = onCore.lang.dawn;
        });

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
                CountDownTimer(`12/31/${thisYear} 11:54:37 PM`, bottom);
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

        info.innerHTML = `Ctrl+X ${onCore.lang.exit} | Ctrl+C ${onCore.lang.minimize} | O ${onCore.lang.menu}`;
        fadeIn(top, onCore.delays[0]);
        fadeIn(middle, onCore.delays[1]);
        fadeIn(bottom, onCore.delays[2]);
        fadeIn(info, 1);
    }
}

window.addEventListener("load", () => {
    mainLoad();
    const hey = new Audio('./res/sounds/Navi_Hey.wav'),
        listen = new Audio('./res/sounds/Navi_Listen.wav');

    ipcRenderer.on('play', (event, arg) => {
        const alarm = new Audio('./res/sounds/OOT_6amRooster.wav');
        alarm.play();
    });

    const navi = document.getElementById('secret');
    navi.addEventListener('mouseover', (evt) => {
        hey.play();
    });
    navi.addEventListener('click', (evt) => {
        listen.play();
        setTimeout(() => {
            alert('Thank you for using my app. :)');
        }, 500);
    });
});

function DawnOfANewDay() {
    const now = new Date(),
        hours = now.getHours(),
        audioDay = new Audio('./res/sounds/Dawn-of-a-new-day.mp3'),
        audioLayer = new Audio('./res/sounds/OOT_Morning.wav');

    //setTimeout to delay audio start, to make it more like the original
    setTimeout(() => {
        audioDay.play();
        if (hours < 12) {
            audioLayer.play();
        }
    }, 800);
}

// fade-in for texts, in which uses css to invoke "fill opacity" method by your
// reference, one by one per Id
/**
 * 
 * @param {HTMLElement} element
 * @param {number} delay In seconds
 */
function fadeIn(element, delay) {
    setTimeout(() => {
        element.style.opacity = 1;
        if (element.id === 'info') element.style.opacity = 0.1;
    }, delay * 1000);
}

// time check until given especific time
function timeCheck(finishCallback, waitingCallback) {
    let d = null,
        h = 0,
        m = 0,
        s = 0,
        condition;
    condition = false;
    let interval = setInterval(() => {
        d = new Date();
        h = d.getHours();
        m = d.getMinutes();
        s = d.getSeconds();
        if (condition) {
            clearInterval(interval);
            finishCallback();
        } else {
            if (h === 23 && m >= 54 && s >= 23) {
                condition = true;
            } else {
                waitingCallback();
            }
        }
    }, 250);
}

//midDayCheck if it's the Dawn or Fall
function midDayCheck(finishCallback, waitingCallback) {
    let d = null,
        h = 0,
        condition,
        interval;
    condition = false;
    interval = setInterval(() => {
        d = new Date();
        h = d.getHours();
        if (condition) {
            clearInterval(interval);
            // if (h > 12) {  backup, in case the user wants to se the transition return
            finishCallback();
            // } else {
            condition = false;
            // }
        } else {
            if (h > 12) {
                condition = true;
            } else {
                waitingCallback();
            }
        }
    }, 250);
}

/**
 * @returns {number} Number of the day
 */
function dayNumber() {
    let now,
        start,
        diff,
        oneDay,
        day;
    now = new Date();
    start = new Date(now.getFullYear(), 0, 0);
    diff = now - start;
    oneDay = 1000 * 60 * 60 * 24;
    day = Math.floor(diff / oneDay);
    return day;
}

/**
 * @returns {number} Remaining hours (adds +24 hours for leap years)
 */
function hoursRemain() {
    let hour;
    const totalHours = dayNumber() * 24;

    hour = isLeapYear() ? 8808 : 8784;
    hour -= totalHours;
    return hour;
}

function isLeapYear() {
    const leapYear = require('leap-year'),
        today = new Date();
    return leapYear(today.getFullYear());
}

/**
 * @param {number} duration Duration of the countdown (in seconds)
 * @param {HTMLElement} display Display element of the countdown
 */
function finalHours(duration, display) {
    let start = null,
        minutes = 0,
        seconds = 0,
        diff = 0,
        interval = null;
    start = Date.now();
    const onfinalHours = new Audio('./res/sounds/FinalHours.m4a');
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

/**
 * 
 * @param {string} dt Format `mm/dd/yyyy hh:mm (AM|PM)` (sorry for the mm/dd format)
 * @param {HTMLElement} element Output element
 */
function CountDownTimer(dt, element) {
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

    let now,
        distance,
        days,
        hours,
        minutes,
        seconds;

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


// Function to new day start
function setNewDayTimer() {
    if (window.newdaytimer) clearTimeout(newdaytimer);
    let distance;
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    distance = tomorrow - now;
    window.newdaytimer = setTimeout(() => ipcRenderer.send('newDay'), distance);
}

function timePeriod() {
    let end, distance = 0,
        call = '',
        argument = '';
    const now = new Date(),
        bells = new Audio('./res/sounds/MM_ClockTower_Bell.wav');
    if (now.getHours() < 6) {
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), '05', '59', '44');
        call = 'newDay';
        argument = 'period';
    } else if (now.getHours() < 18) {
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), '17', '59', '44');
        call = 'night';
    } else {
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, '05', '59', '44');
        call = 'newDay';
        argument = 'period';
    }
    distance = end - now;
    if (distance > 0) {
        setTimeout(() => {
            bells.play();
            setTimeout(() => {
                ipcRenderer.send(call, argument);
            }, 15000);
        }, distance);
    }
}