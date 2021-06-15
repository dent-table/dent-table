import {Injectable} from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import {ipcRenderer, IpcRendererEvent, remote, webFrame} from 'electron';

// The one in the next line should be the right way to import Electron Remote (removing remote from
// the import above this comment). But there is an issue that prevent compiling with this type of import
// (https://github.com/electron/remote/issues/60)
// This error should be fixed in 1.1.1 release of @electron/remote (https://github.com/electron/remote/releases/tag/v1.1.1)
// but is not released yet on npm. So:
// TODO: when released, update @electron/remote and fix the import
// import * as remote from '@electron/remote';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {

  private ipcRenderer: typeof ipcRenderer;
  private webFrame: typeof webFrame;
  private childProcess: typeof childProcess;
  private fs: typeof fs;

  remote: typeof remote;
  databaseWebContentId: number;

  get appVersion(): string {
    return require('../../../package.json').version;
  }

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

  isElectron = (): string => {
    return window && window.process && window.process.type;
  };

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

  ipcSendTo(webContentId: number, channel: string, data: any): void {
    this.ipcRenderer.sendTo(webContentId, channel, data);
  }

  ipcSend(channel: string, data?: any): void {
    this.ipcRenderer.send(channel, data);
  }

  ipcOnce(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): void {
    this.ipcRenderer.once(channel, listener);
  }

  ipcOn(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): void {
    this.ipcRenderer.on(channel, listener);
  }

  ipcRemoveListener(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): void {
    this.ipcRenderer.removeListener(channel, listener);
  }

  ipcRemoveAllListeners(channel: string): void {
    this.ipcRenderer.removeAllListeners(channel);
  }

  close(): void {
    this.remote.getCurrentWindow().close();
  }

  minimize(): void {
    this.remote.getCurrentWindow().minimize();
  }

  toggleMaximize(): void {
    if (!this.remote.getCurrentWindow().isMaximized()) {
      this.remote.getCurrentWindow().maximize();
    } else {
      this.remote.getCurrentWindow().unmaximize();
    }
  }

  toggleFullscreen(): void {
    const isFullscreen = this.remote.getCurrentWindow().isFullScreen();
    this.remote.getCurrentWindow().setFullScreen(!isFullscreen);
    this.remote.getCurrentWindow().setAlwaysOnTop(!isFullscreen);
  }
}
