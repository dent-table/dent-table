import {Injectable} from '@angular/core';
import {ElectronService} from './electron.service';
import {Observable, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';
import {TableDefinition, ToDeliver, ToDo} from '../model/model';
import * as moment from 'moment';
import * as crypto from 'crypto';
import * as _ from 'lodash-es';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private electronService: ElectronService) {
    this.databaseWebContentId = electronService.databaseWebContentId;
  }


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

  private sendToDatabase(operation: string, data: any) {
    const params = {
      operation: operation,
      parameters: data
    };

    this.electronService.ipcSendTo(this.databaseWebContentId, 'database-op', params);
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
    if (_.isString(value) && _.isEmpty(_.trim(value))) {
      value = null;
    } else if (_.isBoolean(value)) {
      value = value ? 1 : 0;
    } else if (!_.isNil(value) && !_.isNil(valueName) && valueName.indexOf('date') >= 0) {
      // string date conversion to timestamp milliseconds
      value = moment(value, ['DD/MM/YYYY', 'MM/DD/YYYY', 'x', 'X']).valueOf();
    }
    console.log(value, typeof value);
    return value;
  }

  private valuesSanitize(values: any) {
    if (_.isObjectLike(values)) {
      // const keys = Object.keys(values);
      // for (const key of keys) {
      //   values[key] = this.valueSanitize(values[key], key);
      // }

      _.forEach(values, (value, key) => {
        values[key] = this.valueSanitize(value, key);
      });
    } else {
      values = this.valueSanitize(values);
    }

    console.log(values);
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
      this.sendToDatabase('table-get-all', params);
      this.electronService.ipcOnce('table-get-all-' + tableId, (event, data) => {
        if (data.result === 'error') {
          subscriber.error(data.message);
        } else {
          this.electronService.ipcRemoveAllListeners('table-get-all-' + tableId);
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
      this.sendToDatabase('table-insert-row', params);
      this.electronService.ipcOnce('table-insert-row-' + tableId, (event, data) => {
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
      this.sendToDatabase('table-delete-row', params);
      this.electronService.ipcOnce('table-delete-row-' + tableId, (event, data) => {
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
      this.sendToDatabase('table-get-definition', params);
      this.electronService.ipcOnce('table-get-definition-' + tableId, (event, data) => {
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
      this.sendToDatabase('table-get-available-slots', params);
      this.electronService.ipcOnce('table-get-available-slots-' + tableId, (event, data) => {
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
        this.sendToDatabase('table-update-row', params);
        this.electronService.ipcOnce('table-update-row-' + tableId, (event, data) => {
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
}
