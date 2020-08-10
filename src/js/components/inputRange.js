class InputRange extends HTMLDivElement {

  static DEFAULT_NAME = "input-range";

  INPUT = this.querySelector("input");
  OUTPUT = this.querySelector("output");

  constructor() {
    super();
    this._updateTooltipPosition();

    this.INPUT.addEventListener("input", evt => {
      this.OUTPUT.value = this.INPUT.value;

      this._updateTooltipPosition();

    });

    this.INPUT.addEventListener("wheel", evt => {
      const WHEEL_DELTA = evt.wheelDelta > 0 ? 1 : -1;

      const CURRENT_VALUE = parseInt(this.INPUT.value) + WHEEL_DELTA;

      // Check if out of range.
      if (CURRENT_VALUE < this.INPUT.min || CURRENT_VALUE > this.INPUT.max) return;

      this.INPUT.value = this.OUTPUT.value = CURRENT_VALUE;

      this._updateTooltipPosition();

      this.INPUT.dispatchEvent(new Event("change", {bubbles: true}))

    });

  }

  _updateTooltipPosition() {
    const CURRENT_VALUE = Number((this.INPUT.value - this.INPUT.min) * 100 / (this.INPUT.max - this.INPUT.min));
    const POSITION = 10 - (CURRENT_VALUE * 0.2);

    /* I can't explain the magic behind this, deal with it. */
    this.OUTPUT.style.left = `calc(${CURRENT_VALUE}% + (${POSITION}px))`;
  }

}

export default InputRange;