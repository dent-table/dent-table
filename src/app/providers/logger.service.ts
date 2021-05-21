import { Injectable } from '@angular/core';
import * as winston from 'winston';
import {ElectronService} from './electron.service';
import {Logger} from 'winston';
import * as path from 'path';
// import {format} from 'winston';
import format from 'date-fns/format';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  // **NOTE**: this code has a mirror in data_entry.js, keep both synced!
  logFormat = winston.format.combine(
    winston.format.timestamp({
      format: 'HH:mm:ss'
    }),
    winston.format.printf((info => {
      const message = info.label ? `${info.label} | ${info.message}` : info.message;
      // TODO: pad level string to a specific length?
      return `[${info.level}] ${info.timestamp}: ${message}`;
    }))
  );

  logger: Logger;

  constructor(private electronService: ElectronService) {
    this.logger = this.createLogger('logs_' + format(new Date(), 'yyyy-MM-dd'));
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

    // **NOTE**: this code has a mirror in data_entry.js, keep both synced!
    return winston.createLogger({
      transports: [
        new winston.transports.Console({
          level: 'debug',
          format: winston.format.combine(
            winston.format.colorize(),
            this.logFormat)
        }),
        new winston.transports.File({
          dirname: this.electronService.getLogPath(),
          filename: filename,
          format: this.logFormat})
      ],
      format: this.logFormat
    });
  }

  /** Create the log object required by winston loggers <br>
   * **NOTE**: this function has a mirror in data_entry.js, keep both synced!
   * @param label (will be prefixed to the message)
   * @param messages messages to log. All data (except strings) will be parsed and stringified
   * @returns {object} the object to pass to winston logger methods
   */
  private logObject(label: string, messages: any[]): { label, message } {
    const stringified = messages.map((message) => {
      if (typeof message === 'string') {
        return message;
      } else {
        return JSON.stringify(message);
      }
    });

    return {label: label, message: stringified.join(' ')};
  }

  public debug(component: string, ...text: any) {
    this.logger.debug(this.logObject(component, text));
  }

  public info(component: string, ...text: any) {
    this.logger.info(this.logObject(component, text));
  }

  public error(component: string, ...text: any) {
    this.logger.error(this.logObject(component, text));
  }

  public verbose(component: string, ...text: any) {
    this.logger.verbose(this.logObject(component, text));
  }

  public warn(component: string, ...text: any) {
    this.logger.warn(this.logObject(component, text));
  }

  public crit(component: string, ...text: any) {
    this.logger.crit(this.logObject(component, text));
  }
}
