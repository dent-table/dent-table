import { Injectable } from '@angular/core';
import * as winston from 'winston';
import {ElectronService} from './electron.service';
import {Logger} from 'winston';
import * as path from 'path';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor(private electronService: ElectronService) { }

  getLogger(filename: string): Logger {
    if (path.extname(filename) !== '.log') {
      filename = filename + '.log';
    }

    return winston.createLogger({
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({dirname: this.electronService.getLogPath(), filename: filename})
      ]
    });
  }
}
