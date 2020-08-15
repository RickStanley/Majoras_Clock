"use strict";
const SETTINGS_INTERFACE = require("../../field-settings-interface.json");

const getUserHome = () => process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;;

const nconf = require('nconf').file({
  file: getUserHome() + '/.majoras-clock-config.json'
});

/**
 * Save value in current user's HOME directory, with a given key.
 * @param {string} settingKey 
 * @param {any} settingValue 
 */
function saveSettings(settingKey, settingValue) {
  nconf.set(settingKey, settingValue);
  nconf.save();
}

function readSettings(settingKey) {
  nconf.load();
  return nconf.get(settingKey);
}

function readAllSettings() {
  return nconf.load();
}

function checkAndInit() {
  if (!Object.keys(nconf.load()).length) {
    for (const PROPERTIES of Object.values(SETTINGS_INTERFACE)) {
      if (["select", "radio"].includes(PROPERTIES.type)) {
        nconf.set(PROPERTIES.name, PROPERTIES.default);
        nconf.save();
      } else {
        for (const FIELD of PROPERTIES.fields) {
          nconf.set(FIELD.name, FIELD.default);
          nconf.save();
        }
      }
    }
  }
}

module.exports = {
  saveSettings: saveSettings,
  readSettings: readSettings,
  readAllSettings: readAllSettings,
  checkAndInit: checkAndInit,
  SETTINGS_INTERFACE: SETTINGS_INTERFACE,
};