"use strict";
export default (year = new Date()) => {
  year = year instanceof Date ? year.getFullYear() : year;
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};