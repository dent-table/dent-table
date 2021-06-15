import {EventEmitter, Injectable, OnDestroy} from '@angular/core';
import {ElectronService} from './electron.service';

@Injectable({
  providedIn: 'root'
})
export class TablesService implements OnDestroy {

  dragStartedObservable: EventEmitter<number> = new EventEmitter(true);
  dragEndedObservable: EventEmitter<number> = new EventEmitter(true);
  rowMovedObservable: EventEmitter<{fromTableId, toTableId}> = new EventEmitter(true);

  onSearchEvent: EventEmitter<string> = new EventEmitter(true);

  private moveRowIpcListener = (event, data) => {
    if (data.result === 'success') {
      this.rowMovedObservable.emit({fromTableId: data.response.fromTableId, toTableId: data.response.toTableId});
    }
  };

  constructor(private electronService: ElectronService) {
    this.electronService.ipcOn('move-row', this.moveRowIpcListener);
  }

  onDragStarted(tableId: number): void {
    this.dragStartedObservable.emit(tableId);
  }

  onDragEnded(tableId: number): void {
    this.dragEndedObservable.emit(tableId);
  }

  search(query: string): void {
    this.onSearchEvent.emit(query);
  }

  ngOnDestroy(): void {
    this.electronService.ipcRemoveListener('move-row', this.moveRowIpcListener);
  }

}
