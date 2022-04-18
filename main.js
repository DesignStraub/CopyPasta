const {app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, screen, nativeImage} = require('electron');
// JSON CONFIG
const fs = require('fs');
const fileName = './CBconfig.json';
const file = require(fileName);

const path = require('path');
const clipboard = require('electron-clipboard-extended');
const robot = require('robotjs')
const db = require('electron-db');
var bGotMinifyed = false;
let tray;
const AutoLaunch = require('auto-launch');
var bUpdateFromChange = true;
var sContrlKey = process.platform==='darwin' ? 'command' : 'control';

//Startup Handling
let autoLaunch = new AutoLaunch({
  name: 'copypasta',
  path: app.getPath('exe'),
});
autoLaunch.isEnabled().then((isEnabled) => {
  if (!isEnabled) autoLaunch.enable();
});

//DB Create Tables
db.createTable('cbLog', (succ, msg) => {})



//Single Instance lock
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} 
app.on('ready', () => {
let oScreen = screen.getCursorScreenPoint();
  //Settings Window
  const SettingsWindow = new BrowserWindow({
    width: 800,
    height: 800,
    titleBarStyle: "hidden",
    icon: './tray.ico',    
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    },
    resizable: false
  });
  SettingsWindow.hide();
  SettingsWindow.loadFile('settings.html');
  SettingsWindow.on('close', function (event) {
      event.preventDefault();
      SettingsWindow.hide();
      event.returnValue = false;
  });

  //Main Window
  const mainWindow = new BrowserWindow({
    width: 350,
    height: 500,
    x:oScreen.x -50,
    y: oScreen.y -50,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    },
    icon: './tray.ico',
    resizable: false
  })
  mainWindow.loadFile('index.html')
  mainWindow.hide();
  mainWindow.setMenuBarVisibility(false);
  mainWindow.on('minimize',function(event){
    event.preventDefault();
    mainWindow.hide();
  });
  //Tutorial Window
  const tutorialWindow = new BrowserWindow({
    width: 350,
    height: 500,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    },
    icon: './tray.ico',
    resizable: false
  })
  tutorialWindow.loadFile('tutorial.html');
  tutorialWindow.hide();
  if(file.showTut){
    tutorialWindow.show();
  }
  ipcMain.on('hideTut', (event) => {
    tutorialWindow.hide();
    file.showTut = false;
    fs.writeFile(fileName, JSON.stringify(file), function writeJSON(err) {});
    event.returnValue = 'Main said I received your Sync message';
  });

  ipcMain.on('showSettings', (event) => {
    bGotMinifyed = true;
    mainWindow.hide();
    SettingsWindow.show();
    event.returnValue = 'Main said I received your Sync message';
  });
  ipcMain.on('closeWindow', (event) => {
    app.exit(0)
  });
  ipcMain.on('minifyWindow', (event) => {
    bGotMinifyed = true;
    mainWindow.hide();
    event.returnValue = 'Main said I received your Sync message';
  });
  ipcMain.on('hideSettings', (event) => {
    SettingsWindow.hide();
    event.returnValue = 'Main said I received your Sync message';
  });
  ipcMain.on('killAllEntrys', (event) => {
    var aEntrys = [];
    db.getAll('cbLog', (succ, data) => {aEntrys = data;})
    aEntrys.forEach(function(oEntry){
      db.deleteRow('cbLog', {'id': Number(oEntry.id)}, (succ, msg) => {});
    })
    mainWindow.webContents.send('renderCbList', {});
    event.returnValue = 'DB is gone :)';
  });

  ipcMain.on('filterCbMainlist', (event, args,filter) => {
    db.getRows('cbLog', filter ,(succ, data) => {
        mainWindow.webContents.send('renderCbList', data);
    })
    event.returnValue = 'Main said I received your Sync message';
  });
  // tray = new Tray(path.join(__dirname, 'tray.png'));
  const image = nativeImage.createFromPath(
    path.join(__dirname, 'tray.png')
  );
  tray = new Tray(image.resize({ width: 16, height: 16 }));
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: 'Show App(Ctrl+Shift+V)', click: function () {
        mainWindow.show();
      }
    },
    {
      label: 'Help', click: function () {
        tutorialWindow.show();
      }
    },
    {
      label: 'Quit', click: function () {
  
        app.quit();
      }
    }
  ]));

  const fnGetCbLogs = () => {
    var oData = db.getAll('cbLog', (succ, data) => {
        mainWindow.webContents.send('renderCbList', data);
    })
  }
  fnGetCbLogs();
  clipboard.on('text-changed', () => {
      let sCurrentText = clipboard.readText(),
      sDate = new Date(),
      sDateNoTime = sDate.toLocaleString("sv-SE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })

      if(sCurrentText != ''){
        let cbLogObj = {
          id: Math.random().toString(36).replace(/[^a-z]+/g, '').substring(2, 10),
          text: sCurrentText,
          timestamp: sDate.toUTCString(),
          date: sDateNoTime
        }
        db.insertTableContent('cbLog', cbLogObj, (succ, msg) => {
        })
        fnGetCbLogs();
      }
  })
  .on('image-changed', () => {
      let currentIMage = clipboard.readImage()
  })
  .startWatching();

  const ret = globalShortcut.register('CommandOrControl+Shift+V', () => {
    let oScreen = screen.getCursorScreenPoint();
    mainWindow.setPosition(oScreen.x, oScreen.y);
    mainWindow.webContents.send('scrollToTop');
    mainWindow.show();
  })
  ipcMain.on('deleteCbItem', (event, id) => {
    db.deleteRow('cbLog', {'id': Number(id)}, (succ, msg) => {});
    fnGetCbLogs();
})
ipcMain.on('writeCbItem', (event, id) => {
  bUpdateFromChange = false;
  db.getRows('cbLog', {'id': Number(id)}, (succ, data) => {
    if(succ){
      clipboard.writeText(data[0].text);
      bUpdateFromChange = true;
      bGotMinifyed = false;
      mainWindow.hide();
    }    
  });

})
mainWindow.on('blur', () => {
  if(mainWindow.isVisible() || bGotMinifyed){
  //wieder rein  wenn fertig mit design
   mainWindow.hide();
  }else{
    setTimeout(() => {
      robot.keyTap('v', sContrlKey)
  }, 150)
  }
})
});
app.whenReady().then(() => {
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
app.on('window-all-closed', function () {
  bGotMinifyed = true;
  clipboard.off('text-changed');
  clipboard.stopWatching();
  globalShortcut.unregisterAll();
  if (process.platform !== 'darwin') app.quit()
})