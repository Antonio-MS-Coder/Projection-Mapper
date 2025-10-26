import { contextBridge, ipcRenderer } from 'electron';
import { Display, Project } from '../shared/types';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App methods
  getDisplays: (): Promise<Display[]> => ipcRenderer.invoke('app:getDisplays'),
  selectOutputDisplay: (displayId: string): Promise<boolean> =>
    ipcRenderer.invoke('app:selectOutputDisplay', displayId),
  closeOutputWindow: (): Promise<boolean> => ipcRenderer.invoke('app:closeOutputWindow'),

  // Project methods
  saveProject: (path: string, data: Project) =>
    ipcRenderer.invoke('project:save', path, data),
  loadProject: (path: string) =>
    ipcRenderer.invoke('project:load', path),

  // Dialog methods
  showSaveDialog: () => ipcRenderer.invoke('dialog:saveProject'),
  selectMedia: () => ipcRenderer.invoke('dialog:selectMedia'),

  // Render communication
  sendRenderUpdate: (data: any) => ipcRenderer.send('render:update', data),
  onRenderUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on('render:update', (_event, data) => callback(data));
  },

  sendOutputReady: () => ipcRenderer.send('output:ready'),
  onOutputReady: (callback: () => void) => {
    ipcRenderer.on('output:ready', () => callback());
  },

  // Menu events
  onMenuAction: (callback: (action: string, data?: any) => void) => {
    ipcRenderer.on('menu:newProject', () => callback('newProject'));
    ipcRenderer.on('menu:openProject', (_event, path) => callback('openProject', path));
    ipcRenderer.on('menu:saveProject', () => callback('saveProject'));
    ipcRenderer.on('menu:saveProjectAs', () => callback('saveProjectAs'));
    ipcRenderer.on('menu:resetCalibration', () => callback('resetCalibration'));
  },

  // WebSocket messages
  onWSMessage: (callback: (message: any) => void) => {
    ipcRenderer.on('ws:message', (_event, message) => callback(message));
  },

  // Platform info
  platform: process.platform,
});