const {
  app,
  BrowserWindow,
  globalShortcut,
  Tray,
  Menu,
  ipcMain,
} = require("electron");

const path = require('path');
const { checkAndInit } = require("./js/core/userSettings");

app.commandLine.appendSwitch('--autoplay-policy', 'no-user-gesture-required');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

let iconStatic;
// we need to handle incs for macOS
if (process.platform === "win32") {
  iconStatic = path.join(__dirname, "assets/icons/win/", "icon.ico");
} else if (process.platform === "darwin") {
  iconStatic = path.join(__dirname, "assets/icons/mac/", "icon.icns");
} else {
  iconStatic = path.join(__dirname, "assets/icons/png/", "64x64.png");
}

/**
 * Modal settings window.
 * @type {BrowserWindow}
 */
let settingsWindow;
/**
 * Clock window.
 * @type {BrowserWindow}
 */
let clockWindow;
/**
 * Night window.
 * @type {BrowserWindow}
 */
let nightWindow;

/**
 * Main windows in session.
 * @type {BrowserWindow[]}
 */
let inSession = [];
// We need to store the "id" of the current window to destroy it later on the
// array always starts with 0, keep that in mind
let indexCounter = inSession.length - 1;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
/**
 * @type {BrowserWindow}
 * Current active main window.
 */
let mainWindow;
/**
 * Whether the current main window is in fullscreen mode.
 * @type {boolean}
 */
let isFullscreen;

// Tray
let tray = null;

function registerShortcuts() {
  globalShortcut.register("CommandOrControl+X", () => {
    app.quit();
  });
  globalShortcut.register("CommandOrControl+C", () => {
    createWindow(false)
    inSession[indexCounter + 2].destroy();
  });
  globalShortcut.register("Alt+Enter", () => {
    if (isFullscreen) {
      inSession[indexCounter + 1].setFullScreen(false);
      isFullscreen = false;
    } else {
      inSession[indexCounter + 1].setFullScreen(true);
      isFullscreen = true;
    }
  });
}

function unregisterShorcuts() {
  globalShortcut.unregisterAll();
}

/**
 * Creates a main window.
 * @param {boolean} maximize Wheter the window should initialize maximized.
 */
const createWindow = (maximize = true) => {
  isFullscreen = true;

  checkAndInit();

  // Create the browser window.
  if (maximize) {
    mainWindow = new BrowserWindow({
      backgroundColor: "#000000",
      icon: iconStatic,
      width: 1280,
      height: 1000,
      skipTaskbar: true,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        worldSafeExecuteJavaScript: true
      }
    });
  } else {
    mainWindow = new BrowserWindow({
      icon: iconStatic,
      frame: false,
      skipTaskbar: true,
      show: false,
      resizable: false,
      webPreferences: {
        nodeIntegration: true,
        worldSafeExecuteJavaScript: true
      }
    });
  }

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/views/index.html`);

  // We don't want to create more elements for the same thing, so let us not
  // overload our RAM usage
  inSession[indexCounter] = mainWindow;
  if (indexCounter >= 0) {
    inSession.splice(indexCounter, 1);
  }
  indexCounter--;

  if (maximize) {
    inSession[indexCounter + 1].on("ready-to-show", () => {
      // Since the procedure to load index.html is quite fast and sometimes, idk why,
      // is slow the window tends to be created on background, that's why there are
      // various focus handlers
      inSession[indexCounter + 1].show();

      // Workaround to app get focused on windows
      if (process.platform === "win32") {
        inSession[indexCounter + 1].minimize();
        inSession[indexCounter + 1].maximize();
      }

      inSession[indexCounter + 1].focus();

      inSession[indexCounter + 1].isAlwaysOnTop(true);

      // This guy has to come after setSkipTaskbar
      inSession[indexCounter + 1].setFullScreen(true);

      // Open the DevTools.
      // inSession[indexCounter + 1].webContents.openDevTools();
      inSession[indexCounter + 1].setMenu(null);

      inSession[indexCounter + 1].webContents.send("ready");
    });
  }

  inSession[indexCounter + 1].on("focus", registerShortcuts);
  inSession[indexCounter + 1].on("blur", unregisterShorcuts);

  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
  } else {
    app.on("second-instance", (event, commandLine, workingDirectory) => {
      if (inSession[indexCounter + 1]) {
        if (inSession[indexCounter + 1].isMinimized()) inSession[indexCounter + 1].restore();
        inSession[indexCounter + 1].focus();
      }
    });
  }

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    unregisterShorcuts();
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // because we are incrementing the index after the session has been bounded with
  // the current window we have to jump back two array units to destroy the
  // previous window, after the new one has been created if we don't do this, the
  // current session/window will be destroyed as soon as created
  inSession[indexCounter + 2]?.destroy();

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

function createSettingsWindow() {
  // Cheking if it's already open.
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    icon: iconStatic,
    frame: false,
    height: 710,
    width: 662,
    resizable: false,
    skipTaskbar: true,
    show: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      worldSafeExecuteJavaScript: true
    }
  });

  settingsWindow.loadURL(`file://${__dirname}/views/modal.html`);

  settingsWindow.on("ready-to-show", () => {
    settingsWindow.show();
  });
  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
}

function createNightWindow() {

  if (nightWindow) {
    nightWindow.focus();
    return;
  }

  const screen = require("electron").screen;
  const display = screen.getPrimaryDisplay();
  const WINDOW_HEIGHT = 400;
  const Y_POSITION = (display.workArea.height / 2) - (WINDOW_HEIGHT / 2);

  nightWindow = new BrowserWindow({
    icon: iconStatic,
    frame: false,
    resizable: false,
    width: display.workArea.width,
    height: WINDOW_HEIGHT,
    transparent: true,
    show: false,
    y: Y_POSITION,
    x: 0,
    skipTaskbar: true,
    // alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      worldSafeExecuteJavaScript: true
    }
  });

  nightWindow.loadURL(`file://${__dirname}/views/night.html`);

  nightWindow.on("ready-to-show", () => {
    nightWindow.show();
  });

  nightWindow.on("closed", () => {
    nightWindow = null;
  });
}

function createClockWindow() {
  if (clockWindow) {
    clockWindow.show();
    return;
  }

  clockWindow = new BrowserWindow({
    icon: iconStatic,
    frame: false,
    height: 325,
    width: 350,
    resizable: false,
    transparent: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      worldSafeExecuteJavaScript: true
    }
  });

  clockWindow.loadURL(`file://${__dirname}/views/clock.html`);

  clockWindow.on("ready-to-show", () => {
    clockWindow.show();
    clockWindow.isAlwaysOnTop(true);
  });

  clockWindow.on("closed", () => {
    clockWindow = null;
  });
}

app.on("ready", () => {
  tray = new Tray(iconStatic);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Clock",
      click: createClockWindow
    },
    {
      label: "Settings",
      click: createSettingsWindow
    },
    {
      label: "Night",
      click: createNightWindow
    },
    {
      label: "Show Dawn",
      click: () => {
        createWindow();
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
  tray.setContextMenu(contextMenu);
  tray.on("double-click", () => {
    createWindow();
  });
});

//#region IPC channels

ipcMain.handle("main:is:visible", async () => {
  return inSession[indexCounter + 1].isVisible();
});

ipcMain.on("minimize:main", () => {
  createWindow(false);
});

ipcMain.on("close:modal", () => {
  if (settingsWindow.isVisible())
    settingsWindow.close();
});

ipcMain.on("close:clock", () => {
  if (clockWindow.isVisible())
    clockWindow.close();
});

ipcMain.on("close:night", () => {
  if (nightWindow.isVisible())
    nightWindow.close();
});

ipcMain.on("newDay", (event, arg) => {
  createWindow();

  if (arg === "period") {
    // This is necessary because the previous main window gets destroyed
    // and the Rooster sound won't play in index.js, because it's gone.
    // We need way for the main process to tell this when it should play.
    setTimeout(() => {
      inSession[indexCounter + 1].webContents.send("playrooster");
    }, 9000);
  }
});

ipcMain.on("night", createNightWindow);

ipcMain.on("headless", (event, arg) => {
  if (!(inSession[indexCounter + 1].isVisible())) {
    createWindow(false);
  }
});

//#endregion

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
