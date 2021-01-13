/* eslint-disable @typescript-eslint/no-var-requires */
import { app, BrowserWindow, Tray, Menu, screen, session, protocol } from 'electron';
// import { CPP, WinWin } from 'win-win-api';
// const { SetWindowPos, GetDesktopWindow, SetParent } = new WinWin().user32();

// const icon = require('./icons/png/16x16.png');
import { resolve } from 'path';

// import { bufferCastInt32 } from './utils';

const isProduction = process.env.NODE_ENV  === 'production';
declare const MAIN_WINDOW_WEBPACK_ENTRY: any;
let tray: Tray;
let mainWindow: BrowserWindow;
// const HWND_BOTTOM = 1;

// const desktopHwnd = GetDesktopWindow();

if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}


// const showAtPos = (mainWindow: BrowserWindow) => {
//   const { width, height } = screen.getPrimaryDisplay().workAreaSize;
//   mainWindow.setAlwaysOnTop(true);
//   mainWindow.setPosition(width - 310, height - 610, true);
// };

const createWindow = (): void => {

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    minHeight: 160,
    minWidth: 200,
    maxHeight: height - 20,
    maxWidth: width - 40,
    transparent: true,
    frame: false,
    show: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
    }
  });

  session.defaultSession.webRequest.onBeforeSendHeaders({ urls: ['*://*.hdslb.com/*'] }, (details, callback) => {
    details.requestHeaders['Referer'] = 'https://www.bilibili.com/';
    callback({ requestHeaders: details.requestHeaders });
  });

  // mainWindow.loadFile(MAIN_WINDOW_WEBPACK_ENTRY)
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // const mainHwnd = bufferCastInt32(mainWindow.getNativeWindowHandle());


  // SetWindowPos(mainHwnd, HWND_BOTTOM, 0, 0, 400, 600, CPP.SWP_SHOWWINDOW);


  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  isProduction || mainWindow.webContents.openDevTools({
    mode: 'detach'
  });

  mainWindow.setSkipTaskbar(true);

  mainWindow.setAlwaysOnTop(true, 'main-menu');

  mainWindow.webContents
    .executeJavaScript('localStorage.getItem("windowSize");', true)
    .then(result => {
      if (result) {
        const [w, h] = result.split(',');
        mainWindow.setSize(parseFloat(w), parseFloat(h));
      } else { 
        mainWindow.setSize(308, 268);
      }
    });

  tray = new Tray(resolve(app.getAppPath(), '.webpack/main/icons/png/16x16.png'));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示',
      click: () => {
        mainWindow?.show();
      }
    },
    {
      label: '退出',
      click: () => {
        mainWindow?.destroy();
      }
    }
  ]);

  tray.setToolTip('bilibili dashboard for uploader');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
    }
  });

};


app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

