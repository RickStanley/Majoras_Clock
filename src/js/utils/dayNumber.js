/**
 * Returns the day number relative to current year.
 */
export default () => {
  const NOW = new Date();
  const START = new Date(NOW.getFullYear(), 0, 0);
  const DIFF = (NOW - START) + ((START.getTimezoneOffset() - NOW.getTimezoneOffset()) * 60 * 1000);
  const ONE_DAY = 1000 * 60 * 60 * 24;
  const DAY = Math.floor(DIFF / ONE_DAY);
  return DAY;
};