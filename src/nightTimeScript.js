const leapYear = require('leap-year'),
    paragraph = document.getElementsByTagName('p'),
    d = new Date();

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

function isLeapYear() {
    const year = d.getFullYear();
    return leapYear(year);
}

function hoursRemain() {
    let hour;
    const totalHours = dayNumber() * 24;
    hour = isLeapYear() ? 8808 : 8784;
    hour -= totalHours;
    return hour;
}

function setParagraphs() {
    let day;
    const div = document.getElementById('div');
    const hours = hoursRemain(),
        today = dayNumber(),
        isLeapyear = isLeapYear(),
        isFinalDay = ((!(isLeapyear) && (today === 365)) || ((isLeapyear) && (today === 366))),
        config = require('./configuration.js');
    const language = config.readSettings('customConf:lang'),
        fontClass = config.readSettings('customConf:font');
    const lang = require(`./lang.${language}`);
    div.style.fontFamily = fontClass;
    div.className = fontClass;
    if (fontClass === 'remaster') {
        paragraph[0].style.position = 'absolute';
        paragraph[0].style.top = '20%';
        paragraph[0].style.left = '30%';
        paragraph[1].style.position = 'absolute';
        paragraph[1].style.top = '50%';
        paragraph[1].style.left = '30%';
    }

    if (today === 1) {
        day = lang.first;
    } else if (today === 2) {
        day = lang.second;
    } else if (today === 3) {
        day = lang.third;
    } else if (isFinalDay) {
        day = lang.final;
    } else {
        if ((lang.language === "en") && (today > 3) && !(isFinalDay)) {
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
        } else if ((lang.language === "fr") && (today > 3) && !(isFinalDay)) {
            day = `${today}ème`;
        } else {
            day = today;
        }
    }

    // japanese version needs to be improved, I don't speak japanese
    if (lang.language === 'jp') {
        paragraph[0].innerHTML = day + lang.onNightOf;
    } else {
        paragraph[0].innerHTML = `${lang.onNightOf}${day}&nbsp;${lang.Day}`;
    }
    paragraph[1].innerHTML = `-${lang.specific}${hours}&nbsp;${lang.hoursRemain}-`;
}

window.addEventListener('load', () => {
    const remote = require('electron').remote;
    const win = remote.getCurrentWindow();
    setParagraphs();
    const div = document.getElementsByTagName('div')[0],
        wolf = new Audio('./res/sounds/OOT_6pmWolf.wav');
    for (let index = 0; index <= 1; index++) {
        paragraph[index].style.opacity = 1;
    }
    setTimeout(() => {
        wolf.play();
    }, 1000);
    setTimeout(() => {
        paragraph[0].style.transition = "opacity 0.5s";
        paragraph[1].style.transition = "opacity 0.5s";
        paragraph[0].style.opacity = 0;
        paragraph[1].style.opacity = 0;
    }, 3000);
    setTimeout(() => {
        div.style.animation = "fadeout 1s";
    }, 3500);
    setTimeout(() => {
        win.close();
    }, 4500);
});