import {Injectable} from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import {ipcRenderer, IpcRendererEvent, remote, webFrame} from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ElectronService {

  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  fs: typeof fs;

  databaseWebContentId: number;
  appVersion = require('../../../package.json').version;

  constructor() {
    // Conditional imports
    if (this.isElectron()) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.remote = window.require('@electron/remote');

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');

      this.databaseWebContentId = ipcRenderer.sendSync('get-database-web-content-id');
    }
  }

  isElectron = () => {
    return window && window.process && window.process.type;
  }

  getAppPath(append: string): string {
    if (append) {
      append = path.sep + append;
    } else {
      append = '';
    }

    return this.remote.app.getPath('userData') + append;
  }

  getLogPath(): string {
    return this.getAppPath('logs');
  }

  ipcSendTo(webContentId: number, channel: string, data: any) {
    this.ipcRenderer.sendTo(webContentId, channel, data);
  }

  ipcSend(channel: string, data?: any) {
    this.ipcRenderer.send(channel, data);
  }

  ipcOnce(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) {
    this.ipcRenderer.once(channel, listener);
  }

  ipcOn(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) {
    // if (channel.startsWitx h('table-get-all-')) {
    //   console.log('ipc on: Registering channel ', channel);
    // }
    this.ipcRenderer.on(channel, listener);
  }

  ipcRemoveListener(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) {
    this.ipcRenderer.removeListener(channel, listener);
  }

  ipcRemoveAllListeners(channel: string) {
    this.ipcRenderer.removeAllListeners(channel);
  }

  close() {
    this.remote.getCurrentWindow().close();
  }

  minimize() {
    this.remote.getCurrentWindow().minimize();
  }

  toggleMaximize() {
    if (!this.remote.getCurrentWindow().isMaximized()) {
      this.remote.getCurrentWindow().maximize();
    } else {
      this.remote.getCurrentWindow().unmaximize();
    }
  }

  toggleFullscreen() {
    const isFullscreen = this.remote.getCurrentWindow().isFullScreen();
    this.remote.getCurrentWindow().setFullScreen(!isFullscreen);
    this.remote.getCurrentWindow().setAlwaysOnTop(!isFullscreen);
  }
}
