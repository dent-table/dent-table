import {Injectable, NgZone} from '@angular/core';
import {ElectronService} from './electron.service';
import {Observable, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';
import {Questionnaire, QuestionnaireAnswers, TableDefinition, ToDeliver, ToDo} from '../model/model';
import * as moment from 'moment';
import * as crypto from 'crypto';
import {LoggerService} from './logger.service';
import {enterZone} from '../commons/RxjsZone';
import {randomHexString} from '../commons/Utils';
import forEach from 'lodash-es/forEach'
import isBoolean from 'lodash-es/isBoolean'
import isEmpty from 'lodash-es/isEmpty'
import isNil from 'lodash-es/isNil'
import isObjectLike from 'lodash-es/isObjectLike'
import isString from 'lodash-es/isString'
import trim from 'lodash-es/trim';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  static toDoMapFunction: OperatorFunction<Array<any>, Array<ToDo>> = map((values: Array<any>) => {
    const res: Array<ToDo> = [];
    values.forEach(value => res.push(new ToDo(
      value.slot_number,
      value.table_ref,
      value.table_id,
      value.name,
      value.type,
      value.date
    )));
    return res;
  });

  static toDeliverMapFunction: OperatorFunction<Array<any>, Array<ToDeliver>> = map((values: Array<any>) => {
    const res: Array<ToDeliver> = [];
    values.forEach(value => res.push(new ToDeliver(
      value.slot_number,
      value.table_ref,
      value.table_id,
      value.name,
      value.type,
      value.date
    )));
    return res;
  });

  databaseWebContentId: number;

  algorithm = 'aes-192-cbc';
  password = '3b41iTniwy';

  logTag: string = DatabaseService.name;


  constructor(
    private electronService: ElectronService,
    private loggerService: LoggerService,
    private zone: NgZone,
  ) {
    this.databaseWebContentId = electronService.databaseWebContentId;
  }

  private sendToDatabase(operation: string, data: any, unique?: boolean | number | string) {
    const params = {
      operation: operation,
      parameters: data
    };

    if (unique && typeof unique === 'boolean') {
      params['uid'] = Utils.randomHexString(6);
    } else if (unique) {
      params['uid'] = unique;
    }

    this.electronService.ipcSendTo(this.databaseWebContentId, 'database-op', params);

    return unique ? `${operation}-${params['uid']}` : operation;
  }

  private encrypt(msg: string) {
    // Use the async `crypto.scrypt()` instead.
    const key = crypto.scryptSync(this.password, 'salt', 24);

    const iv = Buffer.alloc(16, 18);

    // shown here.
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(msg, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;

  }

  private valueSanitize(value: any, valueName?: string) {
    if (isString(value) && isEmpty(trim(value))) {
      value = null;
    } else if (isBoolean(value)) {
      value = value ? 1 : 0;
    } else if (!isNil(value) && !isNil(valueName) && valueName.indexOf('date') >= 0) {
      // string date conversion to timestamp milliseconds
      value = moment(value, ['DD/MM/YYYY', 'MM/DD/YYYY', 'x', 'X']).valueOf();
    }
    this.loggerService.debug(this.logTag, value, typeof value);
    return value;
  }

  private valuesSanitize(values: any) {
    if (isObjectLike(values)) {
      // const keys = Object.keys(values);
      // for (const key of keys) {
      //   values[key] = this.valueSanitize(values[key], key);
      // }

      forEach(values, (value, key) => {
        values[key] = this.valueSanitize(value, key);
      });
    } else {
      values = this.valueSanitize(values);
    }

    // console.log(values);
    return values;
  }

  login(user: string, password: string): Observable<number> {
    const params = {username: user, password: this.encrypt(password)};

    return new Observable((subscriber) => {
      this.sendToDatabase('login', params);
      this.electronService.ipcOnce('login', (event, response) => {
        if (response.result === 'error') {
          subscriber.error(response.message);
        } else {
          subscriber.next(response.response);
          subscriber.complete();
        }
      });
    });
  }

  getAll<R>(tableId: number, limit?: number, orderColumn?: string, mapFun?: OperatorFunction<Array<any>, Array<R>>): Observable<Array<R>> {
    const params = {tableId: tableId};
    if (limit) {
      params['limit'] = limit;
    }
    if (orderColumn) {
      params['orderColumn'] = orderColumn;
    }

    let obs: Observable<R[]> = new Observable((subscriber) => {
      const returnChannel = this.sendToDatabase('table-get-all', params, tableId);
      this.electronService.ipcOnce(returnChannel, (event, data) => {
        if (data.result === 'error') {
          subscriber.error(data.message);
        } else {
          this.electronService.ipcRemoveAllListeners(returnChannel);
          subscriber.next(data.response);
          subscriber.complete();
        }
      });

      return {unsubscribe(): void {}};
    });

    if (mapFun !== undefined) {
      obs = obs.pipe(mapFun);
    }

    return obs;
  }

  insertRow(tableId: number, values: any): Observable<any> {
    const params = {tableId: tableId, values: this.valuesSanitize(values)};
    return new Observable((subscriber => {
      const returnChannel = this.sendToDatabase('table-insert-row', params, tableId);
      console.log(returnChannel);
      this.electronService.ipcOnce(returnChannel, (event, data) => {
        if (data.result === 'error') {
          subscriber.error(data.message);
        } else {
          subscriber.next(data.response);
          subscriber.complete();
        }
      });
    }));
  }

  deleteRow(tableId: number, slotNumber: any): Observable<any> {
    const params = {tableId: tableId, slotNumber: slotNumber};
    return new Observable((subscriber => {
      const returnChannel = this.sendToDatabase('table-delete-row', params, tableId);
      this.electronService.ipcOnce(returnChannel, (event, data) => {
        if (data.result === 'error') {
          subscriber.error(data.message);
        } else {
          subscriber.next(data.response);
          subscriber.complete();
        }
      });
    }));
  }

  getTableDefinition(tableId: number): Observable<TableDefinition> {
    const params = {tableId: tableId};

    return new Observable((subscriber) => {
      const returnChannel = this.sendToDatabase('table-get-definition', params, tableId);
      this.electronService.ipcOnce(returnChannel, (event, data) => {
          // if (data.response.id === tableId) {
          if (data.result === 'error') {
            subscriber.error(data.message);
          } else {
            subscriber.next(TableDefinition.create(data.response));
            subscriber.complete();
          }
          // }
        }
      );

      return (() => {});
    });
  }

  getAvailableSlots(tableId: number): Observable<number[]> {
    const params = {tableId: tableId};

    return new Observable((subscriber) => {
      const returnChannel = this.sendToDatabase('table-get-available-slots', params, tableId);
      this.electronService.ipcOnce(returnChannel, (event, data) => {
        if (data.result === 'error') {
          subscriber.error(data.message);
        } else {
          subscriber.next(data.response);
          subscriber.complete();
        }
      });
    });
  }

  moveRow(fromTableId: number, slotNumber: number, toTableId: number): Observable<any> {
    const params = {fromTableId: fromTableId, slotNumber: slotNumber, toTableId: toTableId};

    return new Observable((subscriber) => {
      // if starting table and target table are same we there's nothing to do
      if (fromTableId === toTableId) {
        subscriber.complete();
        return;
      }

      this.sendToDatabase('move-row', params);
      this.electronService.ipcOnce('move-row', (event, data) => {
        if (data.result === 'error') {
          subscriber.error(data.message);
        } else {
          subscriber.next(data.response);
          subscriber.complete();
        }
      });
    });
  }

  updateRow(tableId: number, rowId: number, values: {}) {
    const params = {tableId: tableId, rowId: rowId, values: this.valuesSanitize(values)};

    return new Observable((subscriber) => {
        const returnChannel = this.sendToDatabase('table-update-row', params, tableId);
        this.electronService.ipcOnce(returnChannel, (event, data) => {
          if (data.result === 'error') {
            subscriber.error(data.message);
          } else {
            subscriber.next(data.response);
            subscriber.complete();
          }
        });
      }
    );
  }

  getQuestionnairesBy(tableId: number): Observable<Questionnaire[]> {
    const params = {table_id: tableId};

    let obs: Observable<Questionnaire[]> = new Observable((subscriber) => {
      this.sendToDatabase('questionnaire-get-all', params);
      this.electronService.ipcOnce('questionnaire-get-all', ((event, data) => {
        if (data.result === 'error') {
          subscriber.error(data.message);
        } else {

          subscriber.next(data.response);
          subscriber.complete();
        }
      }));
    });

    return obs.pipe(enterZone(this.zone));
  }

  saveQuestionnaireAnswers(answersObject: QuestionnaireAnswers): Observable<QuestionnaireAnswers> {
    const obs: Observable<QuestionnaireAnswers> = new Observable((subscriber => {
      this.sendToDatabase('questionnaire-save-answers', answersObject);
      this.electronService.ipcOnce('questionnaire-save-answers', (event, data) => {
        if (data.result === 'error') {
          subscriber.error(data.message);
        } else {
          subscriber.next(data.response);
          subscriber.complete();
        }
      });
    }));

    return obs.pipe(enterZone(this.zone));
  }

  getQuestionnaireAnswersBy(tableId, slotNumber, questionnaireRef?): Observable<{[id: string]: QuestionnaireAnswers[]}> {
    const params = {slot_number: slotNumber, table_id: tableId};
    if (questionnaireRef) {
      params['questionnaire_ref'] = questionnaireRef;
    }

    let obs: Observable<{[id: string]: QuestionnaireAnswers[]}> = new Observable((subscriber) => {
      this.sendToDatabase('questionnaire-get-answers', params);
      this.electronService.ipcOnce('questionnaire-get-answers', ((event, data) => {
        if (data.result === 'error') {
          subscriber.error(data.message);
        } else {
          subscriber.next(data.response);
          subscriber.complete();
        }
      }))
    });

    return obs.pipe(enterZone(this.zone));
  }
}
