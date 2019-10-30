const {
  app,
  BrowserWindow,
  globalShortcut,
  Tray,
  Menu,
  ipcMain
} = require("electron");
const path = require('path');

app.commandLine.appendSwitch('--autoplay-policy', 'no-user-gesture-required');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let iconStatic;
// we need to handle incs for macOS
if (process.platform === "win32") {
  iconStatic = path.join(__dirname, "res/icons/win/", "icon.ico");
} else if (process.platform === "darwin") {
  iconStatic = path.join(__dirname, "res/icons/mac/", "icon.icns");
} else {
  iconStatic = path.join(__dirname, "res/icons/png/", "64x64.png");
}

let modalSettings; // Modal/Settings window
let clock; //clock window only

// We need to store the "id" of the current window to destroy it later on the
// array always starts with 0, keep that in mind
var inSession = [],
  id = inSession.length - 1,
  isFullscreen;

// Tray
let tray = null;

const configuration = require("./configuration.js");

function registerShortcuts() {
  globalShortcut.register("CommandOrControl+X", () => {
    app.quit();
  });
  globalShortcut.register("CommandOrControl+C", () => {
    inSession[id + 1].minimize(true);
  });
  globalShortcut.register("Alt+Enter", () => {
    if (isFullscreen) {
      inSession[id + 1].setFullScreen(false);
      isFullscreen = false;
    } else {
      inSession[id + 1].setFullScreen(true);
      isFullscreen = true;
    }
  });
}

function unregisterShorcuts() {
  globalShortcut.unregisterAll();
}

const createWindow = maximize => {
  maximize = maximize === undefined ? true : maximize;
  isFullscreen = true;
  if (!configuration.readSettings("customConf")) {
    // we have to initialize atleast one
    configuration.saveSettings("customConf:exitOnDawn", false);
    configuration.saveSettings("customConf:checkTimePeriod", true);
    configuration.saveSettings("customConf:checkDayTransition", true);
    configuration.saveSettings("customConf:font", "classic");
    // configuration.saveSettings('customConf:auto-start', false);
    configuration.saveSettings("customConf:lang", "en");
    configuration.saveSettings("customConf:topTrans", true);
    configuration.saveSettings("customConf:midTrans", true);
    configuration.saveSettings("customConf:botTrans", true);
  }

  // Create the browser window.
  if (maximize) {
    mainWindow = new BrowserWindow({
      backgroundColor: "#000000",
      icon: iconStatic,
      width: 1280,
      height: 1000,
      // resizable: false, this is what was keeping the app from fullscreeing
      skipTaskbar: true,
      show: false,
      webPreferences: {
        nodeIntegration: true
      }
    });
  } else {
    mainWindow = new BrowserWindow({
      icon: iconStatic,
      frame: false,
      skipTaskbar: true,
      show: false,
      resizable: false,
      width: 500,
      height: 500
    });
  }

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // We don't want to create more elements for the same thing, so let us not
  // overload our RAM usage, per se :))))
  inSession[id] = mainWindow;
  if (id >= 0) {
    inSession.splice(id, 1);
  }
  id--;

  if (maximize) {
    inSession[id + 1].on("ready-to-show", () => {
      // Since the procedure to load index.html is quite fast and sometimes, idk why,
      // is slow the window tends to be created on background, that's why there are
      // various focus handlers
      inSession[id + 1].show();

      // Workaround to app get focused on windows
      if (process.platform === "win32") {
        inSession[id + 1].minimize();
        inSession[id + 1].maximize();
      }

      inSession[id + 1].focus();

      inSession[id + 1].isAlwaysOnTop(true);

      // This guy has to come after setSkipTaskbar
      inSession[id + 1].setFullScreen(true);

      // Open the DevTools.
      // inSession[id + 1].webContents.openDevTools();
      inSession[id + 1].setMenu(null);
    });
  }

  inSession[id + 1].on("focus", registerShortcuts);
  inSession[id + 1].on("blur", unregisterShorcuts);

  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
  } else {
    app.on("second-instance", (event, commandLine, workingDirectory) => {
      if (inSession[id + 1]) {
        if (inSession[id + 1].isMinimized()) inSession[id + 1].restore();
        inSession[id + 1].focus();
      }
    });
  }

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

function createSettingsWindow() {
  // cheking if it's already open
  if (modalSettings) {
    modalSettings.focus();
    return;
  }

  modalSettings = new BrowserWindow({
    icon: iconStatic,
    frame: false,
    height: 900,
    width: 800,
    resizable: false,
    skipTaskbar: true,
    show: false,
    transparent: true
  });

  modalSettings.loadURL(`file://${__dirname}/modalSettings.html`);

  modalSettings.on("ready-to-show", () => {
    modalSettings.show();
  });
  modalSettings.on("closed", () => {
    modalSettings = null;
  });
}

function createNightWindow() {
  const screen = require("electron").screen;
  const display = screen.getPrimaryDisplay();
  let nightWin = new BrowserWindow({
    icon: iconStatic,
    frame: false,
    resizable: false,
    width: display.workArea.width,
    height: 400,
    transparent: true,
    show: false,
    y: 250,
    x: 0,
    skipTaskbar: true,
    alwaysOnTop: true
  });
  nightWin.loadURL(`file://${__dirname}/nightTime.html`);
  nightWin.on("ready-to-show", () => {
    nightWin.show();
  });
  nightWin.on("closed", () => {
    nightWin = null;
  });
}

function clockWindow() {
  if (clock) {
    clock.show();
    return;
  }

  clock = new BrowserWindow({
    icon: iconStatic,
    frame: false,
    height: 325,
    width: 350,
    resizable: false,
    transparent: true,
    show: false
  });
  clock.loadURL(`file://${__dirname}/clockWindow.html`);
  clock.on("ready-to-show", () => {
    clock.show();
    clock.isAlwaysOnTop(true);
  });

  clock.on("closed", () => {
    clock = null;
  });
}

app.on("ready", () => {
  tray = new Tray(iconStatic);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Majora's Clock",
      enabled: false
    },
    {
      label: "Clock",
      click: clockWindow
    },
    {
      label: "Settings",
      click: createSettingsWindow
    },
    {
      label: "Show Dawn",
      click: () => {
        createWindow();
        // because we are incrementing the index after the session has been bounded with
        // the current window we have to jump back two array units to destroy the
        // previous window, after the new one has been created if we don't do this, the
        // current session/window will be destroyed as soon as created
        inSession[id + 2].destroy();
      }
    },
    {
      label: "Quit",
      click: () => {
        app.quit();
      }
    }
  ]);
  tray.setToolTip("Majora's Clock");
  //This is for Linux contextMenu.items[1].checked = false;
  tray.setContextMenu(contextMenu);
  tray.on("double-click", () => {
    if (inSession[id + 1]) {
      if (inSession[id + 1].isMinimized()) inSession[id + 1].restore();
      inSession[id + 1].focus();
    } else {
      createWindow();
      try {
        inSession[id + 2].destroy();
      } catch {}
    }
  });
});

ipcMain.on("newDay", (event, arg) => {
  createWindow();
  // Workaround to get "foregrounded" on windows and hopefully on all OSes
  // inSession[id + 1].minimize();
  // inSession[id + 1].maximize();
  // Update: perhaps it's no longer necessary once it has been implemented on the
  // mainWindow function, but just to make sure, leave it be
  inSession[id + 1].focus();
  // end of the workaround
  inSession[id + 2].destroy();
  if (arg === "period") {
    setTimeout(() => {
      inSession[id + 1].webContents.send("play");
    }, 9000);
  }
});

ipcMain.on("night", createNightWindow);

ipcMain.on("outBody", (event, arg) => {
  createWindow(false);
  // inSession[id + 1].minimize();
  inSession[id + 2].destroy();
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
