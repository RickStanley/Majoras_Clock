// jshint esversion: 6
"use strict";
window.addEventListener("load",
  () => {
    let win, isMinimized;
    try {
      win = remote.getCurrentWindow();
    } catch (error) {
      const remote = require('electron').remote;
      win = remote.getCurrentWindow();
    }
    isMinimized = win.isMinimized();

    if (!(isMinimized)) {
      let rings = [],
        audio = new Audio('./res/sounds/MM_Clock_Tick.wav'),
        elements = [],
        minutes = 0,
        hours = 0,
        end = new Date(),
        m = 0,
        h = 0,
        ringsLength = 0;

      h = end.getHours() + 1;
      m = end.getMinutes() + 1;
      rings = [{
          ring: 'minutes',
          angle: 0
        },
        {
          ring: 'hours',
          angle: 0
        },
        {
          ring: 'indicator',
          angle: 0
        }
      ];
      // this one has to be defined here
      ringsLength = rings.length;
      for (let index = 0; index < ringsLength; index++) {
        elements[index] = document.querySelector(`.${rings[index].ring}`);
      }
      
      let id = 0;
      setInterval(() => {
        isMinimized = win.isMinimized();
        if (!(isMinimized)) {
          const now = new Date();
          minutes = now.getMinutes();
          hours = now.getHours();

          for (id = 0; id < ringsLength; id++) {
            if (rings[id].ring === 'minutes') {
              rings[id].angle = minutes * 6;
            } else if (rings[id].ring === 'hours') {
              rings[id].angle = ((hours * 30) + (minutes / 2));
            } else if (rings[id].ring === 'indicator') {
              rings[id].angle = ((hours * 30) + (minutes / 2));
            }

            elements[id].style.transform = `rotateZ(${rings[id].angle}deg)`;
            if (hours >= 18) elements[2].src = "./res/termina_clock/night.png";
            if (minutes === m) {
              m = minutes + 1;
              audio.play();
            }
            if (hours === h) {
              h = hours + 1;
              audio.play();
            }
          }
        }
      }, 1000);
    }
  }
);