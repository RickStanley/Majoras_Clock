import dayNumber from "./dayNumber.js";
import isLeapYear from "./isLeapYear.js";

export default () => {
  const DAY_NUMBER = dayNumber();
  const IS_LEAPYEAR = isLeapYear();
  const IS_FINAL_DAY = ((!IS_LEAPYEAR && (DAY_NUMBER === 365)) || (IS_LEAPYEAR && (DAY_NUMBER === 366)))

  return {
    DAY_NUMBER,
    IS_FINAL_DAY,
  }
};