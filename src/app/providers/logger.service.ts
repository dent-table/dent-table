import { Injectable } from '@angular/core';
import * as winston from 'winston';
import {ElectronService} from './electron.service';
import {Logger} from 'winston';
import * as path from 'path';
import * as moment from 'moment';
import {format} from 'winston';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  logFormat = format.combine(
    format.timestamp({
      format: 'DD-MM-YYYY HH:mm:ss'
    }),
    format.simple()
  );

  logger: Logger;

  constructor(private electronService: ElectronService) {
    this.logger = this.createLogger('logs_' + moment().format('DD-MM-YYYY'));
  }

  /*  getLogger(filename: string): Logger {
      if (path.extname(filename) !== '.log') {
        filename = filename + '.log';
      }

      return winston.createLogger({
        transports: [
          new winston.transports.Console({level: 'debug'}),
          new winston.transports.File({dirname: this.electronService.getLogPath(), filename: filename})
        ]
      });
    }*/

  private createLogger(filename: string): Logger {
    if (path.extname(filename) !== '.log') {
      filename = filename + '.log';
    }

    return winston.createLogger({
      transports: [
        new winston.transports.Console({level: 'debug'}),
        new winston.transports.File({
          dirname: this.electronService.getLogPath(),
          filename: filename})
      ],
      format: this.logFormat
    });
  }

  private logString(component: string, messages: any[]): string {
    const stringified: string[] = messages.map((message) => {
      return JSON.stringify(message, null, 2);
    });

    return `${component} | ${stringified.join(' ')}`;
  }

  public debug(component: string, ...text: any) {
    this.logger.debug(this.logString(component, text));
  }

  public info(component: string, ...text: any) {
    this.logger.info(this.logString(component, text));
  }

  public error(component: string, ...text: any) {
    this.logger.error(this.logString(component, text));
  }

  public verbose(component: string, ...text: any) {
    this.logger.verbose(this.logString(component, text));
  }

  public warn(component: string, ...text: any) {
    this.logger.warn(this.logString(component, text));
  }

  public crit(component: string, ...text: any) {
    this.logger.crit(this.logString(component, text));
  }
}
