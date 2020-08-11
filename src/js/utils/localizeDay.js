/** @typedef {typeof import("../lang/lang.en.js").default} Locale*/

/**
 * @param {number} CURRENT_DAY Day number relative to the year.
 * @param {Locale} LOCALE Localization object.
 * @param {boolean} IS_FINAL_DAY Wheter it's the final day of the yar.
 */
export default (CURRENT_DAY, LOCALE, IS_FINAL_DAY) => {
  const CURRENT_LANG = LOCALE.language;
  let result;
  if (CURRENT_DAY === 1) {
    result = LOCALE.first;
  } else if (CURRENT_DAY === 2) {
    result = LOCALE.second;
  } else if (CURRENT_DAY === 3) {
    result = LOCALE.third;
  } else if (IS_FINAL_DAY) {
    result = LOCALE.final;
  } else {
    if ((CURRENT_LANG === "en") && (CURRENT_DAY > 3) && !IS_FINAL_DAY) {
      const lastDigit = (CURRENT_DAY % 10);
      if (lastDigit === 1) {
        result = `${CURRENT_DAY}st`;
      } else if (lastDigit === 2) {
        result = `${CURRENT_DAY}nd`;
      } else if (lastDigit === 3) {
        result = `${CURRENT_DAY}rd`;
      } else {
        result = `${CURRENT_DAY}th`;
      }
    } else if ((CURRENT_LANG === "fr") && (CURRENT_DAY > 3) && !IS_FINAL_DAY) {
      result = `${CURRENT_DAY}ème`;
    } else if ((CURRENT_LANG === "de") && (CURRENT_DAY > 3) && !IS_FINAL_DAY) {
      result = `${CURRENT_DAY}.`;
    } else {
      result = CURRENT_DAY;
    }
  }

  return result;
}