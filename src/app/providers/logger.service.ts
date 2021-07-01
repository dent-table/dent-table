import { Injectable } from '@angular/core';
import { format, createLogger, Logger, transports } from "winston";
import {ElectronService} from './electron.service';
import * as path from 'path';
import formatDate from "date-fns/format";

/**
 * ************************** LoggerService **************************
 * Logs message both on console and a file. If a file name is
 * not provided, a default "logs_<date>.log" file will be used.
 *
 * NOTE: this class has a mirror class Logger
 * in dent-table-sqlite library
 *
 * Please KEEP both synced!
 * *******************************************************************
 */
@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  logFormat = format.combine(
    format.timestamp({
      format: 'HH:mm:ss'
    }),
    format.printf((info => {
      const message = info.label ? `${info.label} | ${info.message}` : info.message;
      // TODO: pad level string to a specific length?
      return `[${info.level}] ${info.timestamp}: ${message}`;
    }))
  );

  logger: Logger;

  constructor(private electronService: ElectronService) {
    this.logger = this.createLogger('logs_' + formatDate(new Date(), 'yyyy-MM-dd'));
  }

  private createLogger(filename: string, target: "console" | "file" | "both" = "both"): Logger {
    if (path.extname(filename) !== '.log') {
      filename = filename + '.log';
    }


    // noinspection DuplicatedCode
    const outputs: any[] = [];
    if (target == "console" || target == "both" ) {
      outputs.push(new transports.Console({
        level: 'debug',
        format: format.combine(
          format.colorize(),
          this.logFormat)
      }));
    }

    if (target == "file" || target == "both") {
      outputs.push(new transports.File({
        dirname: this.electronService.getLogPath(),
        filename: filename || `data_${formatDate(new Date(), 'yyyy-MM-dd')}.log`,
        format: this.logFormat
      }));
    }

    return createLogger({
      transports: outputs,
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

  public debug(component: string, ...text: any): void {
    this.logger.debug(this.logObject(component, text));
  }

  public info(component: string, ...text: any): void {
    this.logger.info(this.logObject(component, text));
  }

  public error(component: string, ...text: any): void {
    this.logger.error(this.logObject(component, text));
  }

  public verbose(component: string, ...text: any): void {
    this.logger.verbose(this.logObject(component, text));
  }

  public warn(component: string, ...text: any): void {
    this.logger.warn(this.logObject(component, text));
  }

  public crit(component: string, ...text: any): void {
    this.logger.crit(this.logObject(component, text));
  }
}
