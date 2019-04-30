import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { createLogger, transports, format } from 'winston';

let win, databaseWin, serve = null;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

// logger creation
const pathname = app.getPath('userData') + path.sep + 'logs';
const logger = createLogger({
  transports: [
    new transports.Console(),
    new transports.File({dirname: pathname, filename: 'main.ts.log'})
  ],
  format: format.combine(
    format.timestamp(),
  )
});

function createMainWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (serve) {
    win.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

}

function createDatabaseWindow() {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  databaseWin = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    databaseWin.loadURL('http://localhost:4200/data/index.html');
  } else {
    databaseWin.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/data/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (serve) {
    databaseWin.webContents.openDevTools();
  }

  ipcMain.on('get-database-web-content-id', (event) => {
    event.returnValue = databaseWin.webContents.id;
  });

  // Emitted when the window is closed.
  databaseWin.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    databaseWin = null;
  });
}

function createWindows() {
  logger.info('win=' + win + ' databaseWin=' + databaseWin);
  if (!win) {
    createMainWindow();
  }

  if (!databaseWin) {
    createDatabaseWindow();
  }
}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindows);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win || databaseWin == null) {
      createWindows();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
