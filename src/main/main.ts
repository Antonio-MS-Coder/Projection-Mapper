import { app, BrowserWindow, ipcMain, screen, Menu, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import { WebSocketServer } from './websocket';
import Store from 'electron-store';
import { Display, Project } from '../shared/types';

let mainWindow: BrowserWindow | null = null;
let outputWindow: BrowserWindow | null = null;
let wsServer: WebSocketServer | null = null;

const store = new Store();
const isDev = process.env.NODE_ENV === 'development';

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1a1a1a',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (outputWindow) {
      outputWindow.close();
    }
  });

  createMenu();
}

function createOutputWindow(displayId: string) {
  const displays = screen.getAllDisplays();
  const targetDisplay = displays.find(d => d.id.toString() === displayId);

  if (!targetDisplay) {
    console.error('Display not found:', displayId);
    return;
  }

  if (outputWindow) {
    outputWindow.close();
  }

  outputWindow = new BrowserWindow({
    x: targetDisplay.bounds.x,
    y: targetDisplay.bounds.y,
    width: targetDisplay.bounds.width,
    height: targetDisplay.bounds.height,
    fullscreen: true,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    backgroundColor: '#000000',
  });

  if (isDev) {
    outputWindow.loadURL('http://localhost:3000/output');
  } else {
    outputWindow.loadFile(path.join(__dirname, '../renderer/output.html'));
  }

  outputWindow.on('closed', () => {
    outputWindow = null;
  });

  // Ensure output window stays on top in fullscreen
  outputWindow.setAlwaysOnTop(true, 'screen-saver');
  outputWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
}

function createMenu() {
  const template: any = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('menu:newProject');
          },
        },
        {
          label: 'Open Project...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog({
              properties: ['openFile'],
              filters: [{ name: 'Project Files', extensions: ['json'] }],
            });
            if (!result.canceled && result.filePaths[0]) {
              mainWindow?.webContents.send('menu:openProject', result.filePaths[0]);
            }
          },
        },
        {
          label: 'Save Project',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow?.webContents.send('menu:saveProject');
          },
        },
        {
          label: 'Save Project As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow?.webContents.send('menu:saveProjectAs');
          },
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Fullscreen Output',
          accelerator: 'F11',
          click: () => {
            if (outputWindow) {
              outputWindow.setFullScreen(!outputWindow.isFullScreen());
            }
          },
        },
        {
          label: 'Reset Calibration',
          click: () => {
            mainWindow?.webContents.send('menu:resetCalibration');
          },
        },
        { type: 'separator' },
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Toggle DevTools', accelerator: 'F12', role: 'toggleDevTools' },
      ],
    },
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { label: 'About ' + app.getName(), role: 'about' },
        { type: 'separator' },
        { label: 'Hide ' + app.getName(), accelerator: 'Command+H', role: 'hide' },
        { label: 'Hide Others', accelerator: 'Command+Shift+H', role: 'hideOthers' },
        { label: 'Show All', role: 'unhide' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Command+Q', click: () => app.quit() },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.handle('app:getDisplays', (): Display[] => {
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();

  console.log('Detected displays:', displays.length);
  displays.forEach(d => {
    console.log(`Display ${d.id}:`, {
      bounds: d.bounds,
      scaleFactor: d.scaleFactor,
      rotation: d.rotation,
      internal: d.internal,
    });
  });

  return displays.map((d, index) => {
    const isPrimary = d.id === primaryDisplay.id;
    const isInternal = d.internal === true;

    // Better naming for displays
    let name = '';
    if (isPrimary && isInternal) {
      name = 'Built-in Display';
    } else if (isInternal) {
      name = `Internal Display ${index + 1}`;
    } else if (isPrimary) {
      name = 'Primary External Display';
    } else {
      name = `External Display ${index + 1}`;
    }

    // Add resolution to name
    name += ` (${d.bounds.width}x${d.bounds.height})`;

    return {
      id: d.id.toString(),
      name,
      bounds: d.bounds,
      isPrimary,
      isInternal,
    };
  });
});

ipcMain.handle('app:selectOutputDisplay', (_event, displayId: string) => {
  createOutputWindow(displayId);
  store.set('outputDisplayId', displayId);
  return true;
});

ipcMain.handle('app:closeOutputWindow', () => {
  if (outputWindow) {
    outputWindow.close();
  }
  return true;
});

ipcMain.handle('project:save', async (_event, projectPath: string, projectData: Project) => {
  try {
    await fs.writeFile(projectPath, JSON.stringify(projectData, null, 2));
    store.set('lastProjectPath', projectPath);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('project:load', async (_event, projectPath: string) => {
  try {
    const data = await fs.readFile(projectPath, 'utf-8');
    const project = JSON.parse(data);
    store.set('lastProjectPath', projectPath);
    return { success: true, project };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('dialog:saveProject', async () => {
  const result = await dialog.showSaveDialog({
    filters: [{ name: 'Project Files', extensions: ['json'] }],
    defaultPath: 'project.json',
  });
  return result;
});

ipcMain.handle('dialog:selectMedia', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Media Files', extensions: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'mov'] },
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] },
      { name: 'Videos', extensions: ['mp4', 'webm', 'mov'] },
    ],
  });
  return result;
});

// Relay render data between windows
ipcMain.on('render:update', (_event, data) => {
  if (outputWindow && !outputWindow.isDestroyed()) {
    outputWindow.webContents.send('render:update', data);
  }
});

ipcMain.on('output:ready', () => {
  mainWindow?.webContents.send('output:ready');
});

// App event handlers
app.whenReady().then(() => {
  createMainWindow();

  // Start WebSocket server
  wsServer = new WebSocketServer(8080);
  wsServer.on('message', (message) => {
    mainWindow?.webContents.send('ws:message', message);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  wsServer?.close();
});