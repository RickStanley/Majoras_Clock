class TerminaClock extends HTMLElement {

  static DEFAULT_NAME = "termina-clock";

  #CLOCK = document.createElement("div");
  #MINUTES = document.createElement("img");
  #POINTER = document.createElement("img");
  #HOURS = document.createElement("div");
  #INDICATOR = document.createElement("img");
  #TICK = new Audio();
  assetsPath;
  isPlaying = true;

  constructor() {
    super();

    this.assetsPath = this.getAttribute("assets");
    if (!this.assetsPath) throw new Error("It needs an assets path.");

    this.attachShadow({ mode: "open" });

    this.#MINUTES.src = `${this.assetsPath}/outside.png`;
    this.#POINTER.src = `${this.assetsPath}/pointer.png`;
    this.#INDICATOR.src = `${this.assetsPath}/day.png`;
    this.#HOURS.appendChild(this.#INDICATOR);

    this.#CLOCK.classList.add("clock");
    this.#MINUTES.classList.add("minutes");
    this.#POINTER.classList.add("pointer");
    this.#HOURS.classList.add("hours");
    this.#INDICATOR.classList.add("indicator");

    this.#TICK.src = `${this.assetsPath}/MM_Clock_TIck.wav`;

    this.render();
  }

  get isPlaying() {
    return this.isPlaying;
  }

  render() {
    this.#CLOCK.appendChild(this.#MINUTES);
    this.#CLOCK.appendChild(this.#POINTER);
    this.#CLOCK.appendChild(this.#HOURS);

    this._applyStyles();
    this.shadowRoot.appendChild(this.#CLOCK);

    this.loop();
  }

  play() {
    this.isPlaying = true;
    this.loop();
  }

  stop() {
    this.isPlaying = false;
  }

  loop() {
    const DELAY = 1000;

    let loopStart = new Date().getTime();
    let now = new Date();
    let hoursEnd = now.getHours() + 1;
    let minutesEnd = now.getMinutes() + 1;

    const LOOP = () => {
      const CURRENT = new Date().getTime();
      const DELTA = CURRENT - loopStart;

      if (DELTA >= DELAY) {
        now = new Date();
        this.update(now);
        loopStart = new Date().getTime();
        const HAS_REACHED_HOURS = now.getHours() === hoursEnd;
        const HAS_REACHED_MINUTES = now.getMinutes() === minutesEnd;
        if (HAS_REACHED_HOURS) {
          hoursEnd = now.getHours() + 1;
        }
        if (HAS_REACHED_MINUTES) {
          minutesEnd = now.getMinutes() + 1;
        }
        if (HAS_REACHED_MINUTES || HAS_REACHED_HOURS) {
          this.#TICK.play();
        }
      }
      if (this.isPlaying)
        requestAnimationFrame(LOOP);
    };

    this.update();

    LOOP();
  }

  update(DATE = new Date()) {

    const HOURS = DATE.getHours();
    const MINUTES = DATE.getMinutes();

    const HOURS_ANGLE = (HOURS * 30) + (MINUTES / 2);

    this.#MINUTES.style.setProperty("--angle", `${MINUTES * 6}deg`);
    this.#HOURS.style.setProperty("--angle", `${HOURS_ANGLE}deg`);
    this.#INDICATOR.style.setProperty("--angle", `${HOURS_ANGLE}deg`);

    if (HOURS >= 18) this.#INDICATOR.src = `${this.assetsPath}/night.png`;
    else `${this.assetsPath}/day.png`;

  }

  _applyStyles() {
    const STYLES = document.createElement("style");

    STYLES.textContent = `
    .clock {
      --clock-size: 208.5px;
      display: block;
      margin: 0 auto;
      position: relative;
      width: var(--clock-size);
      height: var(--clock-size);
    }
    
    .minutes {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      margin: auto;
      z-index: 1;
      width: var(--clock-size);
      height: var(--clock-size);
      transition: transform 0.3s cubic-bezier(.4, 2.08, .55, .44);
      border-radius: 210px;
      box-shadow: 0px 0px 8px 0px rgba(69, 69, 69, 0.85);
      transform: rotateZ(var(--angle));
    }
    
    .hours {
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      margin: auto;
      z-index: 2;
      height: 155.5px;
      width: 155.5px;
      position: absolute;
      transition: transform 0.3s cubic-bezier(.4, 2.08, .55, .44);
      background: url(${this.assetsPath}/inside.png) no-repeat;
      background-size: 100%;
      transform: rotateZ(var(--angle));
    }
    
    .indicator {
      left: 0;
      right: -1px;
      top: 103px;
      bottom: 0;
      margin: auto;
      position: absolute;
      z-index: 3;
      height: 50px;
      transition: transform 0.3s cubic-bezier(.4, 2.08, .55, .44);
      transform: rotateZ(var(--angle));
    }
    
    .pointer {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 170px;
      margin: auto;
      z-index: 4;
      width: 18px;
      height: 30px;
    }
    `;

    this.shadowRoot.appendChild(STYLES);
  }
}

export default TerminaClock;