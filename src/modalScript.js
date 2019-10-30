"use strict";

// since modal is coming up as first in ther renderer process, then we
// should be able to use these variables in other scripts, e.g.: coreScripts.js
const {
    ipcRenderer
} = require('electron');
const configuration = require('./configuration.js');
const close = new Audio('./res/sounds/Dialogue_Done.wav'),
    next = new Audio('./res/sounds/Dialogue_Next.wav');
// Use module to declare and access global variables is important, but since it's a simple app
// I really don't care

let onModal = {
    modifierRangers: [],
    modifierCheckboxes: [],
    modifierFonts: [],
    tooltiptext: [],
    langSelector: null,
    buttons: [],
    modal: [],
    content: [],
    body: null
};

//this  reverts the animatetop, and put it back in place ready for action again
function hide(index) {
    onModal.content[index].style.animation = "animatetopRe 0.4s";
    setTimeout(() => {
        onModal.content[index].style.animation = "animatetop 0.4s";
        onModal.modal[index].style.display = "none";
    }, 300);
}

// Get the modal and your content to modify/execute the animation, these guys
// they have to come after the "body test"
// modal = document.getElementById('menu');
onModal.modal = document.getElementsByClassName('modal');
onModal.content = document.getElementsByClassName('modal-content');

onModal.buttons = document.getElementsByClassName("button");

// Making sure it is in the index.html "first"
onModal.body = document.getElementById('indexBody');

if (onModal.body === null) {
    // We must access the BrowserWindow object created by our main process and call the minimize, 
    // maximize, and close methods on that. We can access this using the 'remote' module
    const remoteOut = require('electron').remote;
    let win;
    onModal.body = document.getElementById('modalBody');

    onModal.body.style["-webkit-app-region"] = "drag";
    onModal.modal[0].style.display = "block";
    onModal.modal[0].style.paddingTop = "0px";
    onModal.content[0].style.height = "100%";
    onModal.content[0].style.width = "100%";
    onModal.content[0].style.border = "none";
    onModal.content[0].style.borderRadius = "0";
    onModal.modal[1].style["-webkit-app-region"] = "drag";

    onModal.buttons[2].addEventListener('click', () => {
        win = remoteOut.getCurrentWindow();
        win.close();
    });
} else {
    let getImport,
        getContent;

    // Here, we are importing the modal.html file into index.html, by selecting link
    // reference id and the content area (element of the modal.html) to be
    // imported, with the help of importNode(element, bool);
    getImport = document.querySelector('#myModal');
    getContent = getImport.import.querySelector('#menu');
    document.body.appendChild(document.importNode(getContent, true));

    onModal.content[0].style.animation = "animatetop 0.4s";
    onModal.modal[0].style.display = "none";

    onModal.buttons[2].addEventListener('click', () => {
        close.play();
        hide(0);
    });

    // When the user clicks anywhere outside of the modal, close it

    window.addEventListener('click', (event) => {
        if (event.target === onModal.modal[0]) {
            close.play();
            hide(0);
        }
    })

    // This only work on generic based keyboards, and of course most of them are
    // directed to windows users we have to keep mac in mind

    document.addEventListener('keyup', (event) => {
        let x = event.which || event.keyCode;
        if ((x === 79) && (onModal.modal[0].style.display !== "block")) {
            onModal.body.cursor = "default";
            onModal.modal[0].style.display = "block";
        } else if ((x === 88 || x === 27 || x === 79) && (onModal.modal[0].style.display === "block")) {
            close.play();
            hide(0);
        }
    }, false);

}

onModal.modifierCheckboxes = document.querySelectorAll('.optionBox');

onModal.modifierRangers = document.querySelectorAll('.delaySpeed');
onModal.tooltiptext = document.querySelectorAll('.tooltiptext');

onModal.modifierFonts = document.querySelectorAll('.fonts');

onModal.langSelector = document.getElementById('language');

//don't make this a function, it's going to be use in coreScripts

function loadRangers() {
    let isDragging = false;
    let save;
    for (let index = 0, rangeLength = onModal.modifierRangers.length, key, value; index < rangeLength; index++) {

        key = onModal.modifierRangers[index].id;
        value = configuration.readSettings(`customConf:${key}`);

        if (!value) {
            configuration.saveSettings(`customConf:${key}`, 1);
            value = configuration.readSettings(`customConf:${key}`);
        }

        onModal.modifierRangers[index].addEventListener('mousedown', evt => {
            evt.target.addEventListener('mousemove', (evt) => {
                isDragging = true;
                moveTip(evt, isDragging);
            }, false);
        }, false);

        onModal.modifierRangers[index].addEventListener('mousewheel', evt => {
            onWheel(evt);
            clearTimeout(save);
            save = setTimeout(() => {
                bindModifierRangers(evt);
            }, 500);
        }, false);

        onModal.modifierRangers[index].value = value;
        onModal.tooltiptext[index].value = onModal.modifierRangers[index].value;

        onModal.modifierRangers[index].addEventListener('mouseup', evt => {
            isDragging = false;
            bindModifierRangers(evt);
        });
    }
}

function loadCheckboxes() {
    for (let i = 0, lengthBox = onModal.modifierCheckboxes.length, key, value; i < lengthBox; i++) {
        key = onModal.modifierCheckboxes[i].id; // get id (string)
        value = configuration.readSettings(`customConf:${key}`); // use id and get the current object from json

        if (!value) {
            configuration.saveSettings(`customConf:${key}`, false);
        } else {
            onModal.modifierCheckboxes[i].checked = value; // check if it isChecked or not
        }
        onModal.modifierCheckboxes[i].addEventListener('click', (evt) => {
            bindModifierCheckBoxes(evt);
        });
    }
}

function loadFonts() {
    let fontDefined = configuration.readSettings('customConf:font');
    if (!fontDefined) {
        configuration.saveSettings('customConf:font', 'classic');
        fontDefined = configuration.readSettings('customConf:font');
    }
    for (let index = 0, fontsLenght = onModal.modifierFonts.length; index < fontsLenght; index++) {
        onModal.modifierFonts[index].addEventListener('click', (evt) => {
            bindModifierFonts(evt);
        })
        if (fontDefined === onModal.modifierFonts[index].value) onModal.modifierFonts[index].checked = true;
    }
}

function loadLanguage() {
    onModal.langSelector.value = configuration.readSettings('customConf:lang');
    onModal.langSelector.addEventListener('click', (evt) => {
        bindLanguage(evt);
    })
}

window.addEventListener('load', () => {

    loadLanguage();
    loadCheckboxes();
    loadRangers();
    loadFonts();

    onModal.content[1].style.animation = "animatetop 0.4s";
    onModal.content[1].style.width = "600px";
    onModal.modal[1].style.zIndex = "5";

    onModal.buttons[1].addEventListener('click', () => {
        next.play();
        onModal.modal[1].style.display = "block";
    });

    onModal.buttons[0].addEventListener('click', () => {
        close.play();
        hide(1);
    });

    window.addEventListener('click', event => {
        if (event.target === onModal.modal[1]) {
            close.play();
            hide(1);
        }
    });
});

/**
 * @param {number} index Range index
 */
const calculateMove = index => {
    let posPerc,
        pixPos;
    posPerc = (onModal.modifierRangers[index].value / 1.5) * 100;
    pixPos = (posPerc / 100) * 50;

    pixPos += onModal.modifierRangers[index].offsetLeft;

    onModal.tooltiptext[index].style.left = `${pixPos}px`;
};

/**
 * On mouse down event for range inputs
 * @param {Event} evt 
 * @param {boolean} isDragging 
 */
function moveTip(evt, isDragging) {
    if (isDragging) {
        const index = Array.from(onModal.modifierRangers).indexOf(evt.target);
        calculateMove(index);
    }
}

/**
 * On whell event for rang inputs
 * @param {Event} evt 
 */
function onWheel(evt) {
    let wDelta,
        index;
    index = Array.from(onModal.modifierRangers).indexOf(evt.target);
    wDelta = evt.wheelDelta > 0 ? 1 : -1;

    onModal.modifierRangers[index].value = parseInt(onModal.modifierRangers[index].value) + wDelta;

    onModal.tooltiptext[index].value = onModal.modifierRangers[index].value;
    calculateMove(index);
}


/**
 * @param {Event} evt 
 */
function bindLanguage(evt) {
    const value = evt.target.value;

    configuration.saveSettings('customConf:lang', value);
}

/**
 * @param {Event} evt 
 */
function bindModifierCheckBoxes(evt) {
    const key = evt.target.id,
        value = evt.target.checked;

    configuration.saveSettings(`customConf:${key}`, value);
    if (!(onModal.body.id === 'indexBody')) ipcRenderer.send('outBody');
}

/**
 * @param {Event} evt 
 */
function bindModifierRangers(evt) {
    const key = evt.target.id,
        value = evt.target.value;
    configuration.saveSettings(`customConf:${key}`, parseInt(value));
}

/**
 * @param {Event} evt 
 */
function bindModifierFonts(evt) {
    const value = evt.target.value;
    configuration.saveSettings('customConf:font', value);
}