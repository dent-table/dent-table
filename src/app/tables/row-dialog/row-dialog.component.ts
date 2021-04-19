import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {DatabaseService} from '../../providers/database.service';
import { TableDefinition} from '../../model/model';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import {Utils} from '../../commons/Utils';
import * as _ from 'lodash-es';
import {LoggerService} from '../../providers/logger.service';

export interface DialogData {
  tableId: any;
  element?: any;
  tableDefinition?: TableDefinition;
  availableSlots?: number[];
}

@Component({
  selector: 'app-row-dialog',
  templateUrl: './row-dialog.component.html',
  styleUrls: ['./row-dialog.component.scss'],
})
export class RowDialogComponent implements OnInit, AfterViewInit {
  logTag = RowDialogComponent.name;

  typeOf = Utils.typeof;

  tableDefinition: TableDefinition;
  availableSlots: number[];
  formGroup: FormGroup;

  error;

  dialogType: string;
  specialCases;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialogRef: MatDialogRef<RowDialogComponent>,
    private databaseService: DatabaseService,
    private cdr: ChangeDetectorRef,
    private logger: LoggerService
  ) {
    if ('string' === typeof data.tableId) {
      this.data.tableId = Number.parseInt(this.data.tableId, 10);
    }

    if (this.data.element && this.data.element['table_ref']) {
      this.dialogType = 'update';
    } else {
      this.dialogType = 'insert';
    }
  }

  ngOnInit() {
    this.tableDefinition = this.data.tableDefinition;

    if (!this.tableDefinition) {
      this.databaseService.getTableDefinition(this.data.tableId).toPromise().then((values => {
        this.tableDefinition = values;
        this.createFormGroup();
      }));
    } else {
      this.createFormGroup();
    }

    this.specialCases = _.keys(Utils.getSpecialCases(this.data.tableId));

  }

  ngAfterViewInit(): void {
    this.availableSlots = this.data.availableSlots ? this.data.availableSlots : [];

    if (this.dialogType === 'update' && this.data.element['slot_number'] && !Utils.specialCase(this.data.element['slot_number'], this.data.tableId)) {
      this.availableSlots.push(this.data.element['slot_number']);
    }

    if (!this.data.availableSlots) {
      this.databaseService.getAvailableSlots(this.data.tableId).toPromise().then((values) => {
        this.availableSlots = this.availableSlots.concat(values);
      });
    }
  }

  createFormGroup() {
    const group = {};
    let elementSlotNumber = this.data.element ? this.data.element['slot_number'] : '';
    // check if slot number is one of special cases
    elementSlotNumber = Utils.specialCase(elementSlotNumber, this.data.tableId) === false
      ? elementSlotNumber
      : Utils.specialCase(elementSlotNumber, this.data.tableId);

    group['slot_number'] = new FormControl(elementSlotNumber);

    for (const column of this.tableDefinition.columnsDefinition) {
      const validators = [];
      let currentValue = this.data.element ? this.data.element[column.name] : '';

      if (currentValue && column.type === 'date' && currentValue !== '') {
        currentValue = moment(currentValue);
      } else if (column.type === 'date' && column.required) {
        currentValue = moment();
      }
      if (column.required) {
        validators.push(Validators.required);
      }

      group[column.name] = new FormControl(currentValue || '', validators);
    }
    this.formGroup = new FormGroup(group);
    this.cdr.detectChanges();
  }

  onInsert() {
    if (this.formGroup.valid) {
      const values = this.formGroup.value;

      this.databaseService.insertRow(this.data.tableId, values).toPromise().then((result) => {
        this.dialogRef.close(result);
      }).catch((error) => {
        this.logger.error(this.logTag, error);
        this.error = error;
      });
    }
  }

  onUpdate() {
    const toUpdate = {};
    let someDirty = false;
    if (this.formGroup.valid && this.formGroup.dirty) {
      const controlKeys = Object.keys(this.formGroup.controls);
      for (const controlKey of controlKeys) {
        if (this.formGroup.controls[controlKey].dirty && this.formGroup.controls[controlKey].valid) {
          someDirty = true;
          toUpdate[controlKey] = this.formGroup.controls[controlKey].value;
        }
      }

      if (someDirty) {
        this.databaseService.updateRow(this.data.tableId, this.data.element.table_ref, toUpdate).toPromise().then((result) => {
          this.dialogRef.close(result);
        }).catch((error) => {
          this.logger.error(this.logTag, error);
          this.error = error;
        });
      }
    }
  }

  onSubmit() {
    switch (this.dialogType) {
      case 'insert': this.onInsert(); break;
      case 'update': this.onUpdate(); break;
    }
  }

 /* printFormGroupStatus() {
    const controlsStatus = {};
    const keys = Object.keys(this.formGroup.controls);
    for (const k of keys) {
      const control: AbstractControl = this.formGroup.controls[k];
      controlsStatus[k] = {valid: control.valid, pristine: control.pristine, dirty: control.dirty,
      touched: control.touched, untouched: control.untouched, status: control.status};
    }

    return controlsStatus;
  }*/

}
