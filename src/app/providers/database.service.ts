import { Injectable } from '@angular/core';
import {ElectronService} from './electron.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  databaseWebContentId: number;


  constructor(private electronService: ElectronService) {
    this.databaseWebContentId = electronService.databaseWebContentId;
  }

  private sendToDatabase(operation: string, data: any) {
    const params = {
      operation: operation,
      parameters: data
    };

    this.electronService.ipcSendTo(this.databaseWebContentId, 'database-op', params);
  }

  getAll(tableId: number, limit?: number): Promise<Array<any>> {
    const params = {tableId: tableId};
    if (limit) {
      params[limit] = limit;
    }

    return new Promise<Array<any>>((resolve, rejects) => {
      this.sendToDatabase('table-get-all', params);
      this.electronService.ipcOnce('table-get-all', (event, data) => {
        if (data.result === 'error') {
          rejects(data.message);
        } else {
          resolve(data.response);
        }
      });
    });
  }
}
