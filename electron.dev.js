// Development entry point for Electron
const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const fs = require('fs');

// Import the full main process handlers
const mainModule = path.join(__dirname, 'dist/main/main.js');
if (fs.existsSync(mainModule)) {
  require(mainModule);
  return; // Let the compiled main.js handle everything
}

// Fallback if main.js doesn't exist
let mainWindow;

function createWindow() {
  // Set Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:3000 ws://localhost:8080; img-src 'self' data: blob: file:; media-src 'self' file:"]
      }
    });
  });

  const preloadPath = path.join(__dirname, 'dist/main/preload.js');

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: fs.existsSync(preloadPath) ? preloadPath : undefined,
      webSecurity: true
    }
  });

  // Load from Vite dev server
  mainWindow.loadURL('http://localhost:3000');

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});