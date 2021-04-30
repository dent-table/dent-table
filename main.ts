require('@electron/remote/main').initialize()
import {app, BrowserWindow, ipcMain, nativeImage, screen} from 'electron';
import * as path from 'path';
import * as url from 'url';
import {createLogger, format, transports} from 'winston';
import * as fs from 'fs';

let mainWindow, databaseWin, serve = null, canQuit = false;
const args = process.argv.slice(1);
const appPath = app.getPath('userData');
const dataPath = appPath + path.sep + 'data' + path.sep;

serve = args.some(val => val === '--serve');

// logger creation
const logPathname =  appPath + path.sep + 'logs';
const logFormat = format.combine(
  format.timestamp({
    format: 'DD-MM-YYYY HH:mm:ss'
  }),
  format.simple()
);

const logger = createLogger({
  transports: [
    new transports.Console(),
    new transports.File({dirname: logPathname, filename: 'main.ts.log', handleExceptions: true})
  ],
  format: logFormat
});

function createMainWindow() {

  const size = screen.getPrimaryDisplay().workAreaSize;
  let windowConf;

  windowConf = {
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    icon: nativeImage.createFromPath('./src/assets/icons/favicon.png'),
    webPreferences: {
      nodeIntegration: true,
      // allowRunningInsecureContent: (serve) ? true : false,
      // contextIsolation: false,  // false if you want to run 2e2 test with Spectron
      enableRemoteModule : true // true if you want to run 2e2 test  with Spectron or use remote module in renderer context (ie. Angular)
    },
    frame: false
  };

  if (!serve) {
    // windowConf.alwaysOnTop = true;
    windowConf.titleBarStyle = 'hidden';
    windowConf.fullscreen = true;
  }

  // Create the browser window.
  mainWindow = new BrowserWindow(windowConf);

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    mainWindow.loadURL('http://localhost:4200');
  } else {
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  // mainWindow.webContents.openDevTools();

  if (serve) {
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.setMenu(null);
  }


  mainWindow.on('close', (event) => {
    logger.info('Closing main window');
    if (!canQuit) {
      event.preventDefault();
      return false;
    } else {
      canQuit = false;
      return true;
    }
  });


  ipcMain.on('start-app-shutdown', (event) => {
    logger.info('Requested app shutdown');
    logger.info(databaseWin);
    if (databaseWin) {
      databaseWin.webContents.send('shutdown');
      ipcMain.once('database-shutdown', (result) => {
        databaseWin.close();
      });
    }
  });

// Emitted when the window is closed.
  mainWindow.on('closed', () => {
    logger.info('Main window closed');
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

}

function createDatabaseWindow() {
  logger.info('Create database windows');
  const size = screen.getPrimaryDisplay().workAreaSize;
  let windowConf;

  windowConf = {
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    }
  };

  if (!serve) {
    windowConf.show = false;
  }

  // Create the browser window.
  databaseWin = new BrowserWindow(windowConf);

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    databaseWin.loadURL('http://localhost:4200/data/index.html');
  } else {
    logger.info('Loading ' + path.join(__dirname, 'dist/data/index.html'));
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
    logger.info('Database window closed');
    if (mainWindow) {
      canQuit = true;
      mainWindow.close();
    }
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    databaseWin = null;
  });
}

function createWindows() {
  if (!mainWindow) {
    createMainWindow();
  }

  if (!databaseWin) {
    createDatabaseWindow();
  }
}

try {
  /*  const shouldQuit = !app.requestSingleInstanceLock();

    app.on('second-instance', function (argv, cwd) {
      if (mainWindow) {
        if (mainWindow.isMinimized()) { mainWindow.restore(); }
        if (!mainWindow.isVisible()) { mainWindow.show(); }
        mainWindow.focus();
      }
    });

    if (shouldQuit) {
      app.quit();
      // return;
    }*/

  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath);
  }

  let preferencePath;

  if (serve) {
    preferencePath = __dirname + path.sep + 'src' + path.sep + 'assets' + path.sep + 'preferences.json';
  } else {
    preferencePath = 'src' + path.sep + 'assets' + path.sep + 'preferences.json';
  }

  if (!fs.existsSync(dataPath + 'preferences.json')) {
    fs.copyFileSync(
      preferencePath,
      dataPath + 'preferences.json'
    );
  }

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindows, 400));

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
    if (mainWindow || databaseWin == null) {
      createWindows();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;

  logger.error(e);
}
