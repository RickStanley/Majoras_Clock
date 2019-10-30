'use strict';
// in this file, we are going to store user settings in his HOME directory the
// functions are self explanatory, I hope
const nconf = require('nconf').file({
    file: getUserHome() + '/majoras-clock-config.json'
});

function saveSettings(settingKey, settingValue) {
    nconf.set(settingKey, settingValue);
    nconf.save();
}

function readSettings(settingKey) {
    nconf.load();
    return nconf.get(settingKey);
}

function getUserHome() {
    let homePath;
    // this should cover all bases, for windows, linux or mac
    homePath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    // process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME']
    return homePath;
}

module.exports = {
    saveSettings: saveSettings,
    readSettings: readSettings
};