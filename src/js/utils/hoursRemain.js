import isLeapYear from "./isLeapYear.js";

/**
 * Returns remaining hours until end of the year.
 * @param {number} currentDay Day to calculate offset from.
 */
export default currentDay => {
  let hours;
  const TOTAL_HOURS = currentDay * 24;

  hours = isLeapYear() ? 8808 : 8784;
  hours -= TOTAL_HOURS;

  return hours;
};