import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {DatabaseService} from '../../providers/database.service';
import {ColumnDefinition, TableDefinition} from '../../model/model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {_typeof, controlsPaths, getSpecialCases, specialCase} from '../../commons/Utils';
import {LoggerService} from '../../providers/logger.service';
import parse from 'date-fns/parse';

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
    private fb: FormBuilder,
    private logger: LoggerService
  ) {
    if (typeof data.tableId === "string") {
      this.data.tableId = Number.parseInt(this.data.tableId, 10);
    }

    if (this.data.element && this.data.element['table_ref']) {
      this.dialogType = 'update';
    } else {
      this.dialogType = 'insert';
    }
  }

  ngOnInit(): void {
    this.tableDefinition = this.data.tableDefinition;

    if (!this.tableDefinition) {
      this.databaseService.getTableDefinition(this.data.tableId).subscribe({
        next: (values) => {
          this.tableDefinition = values;
          this.createFormGroup();
        }
      });
    } else {
      this.createFormGroup();
    }

    this.specialCases = Object.keys(getSpecialCases(this.data.tableId));

  }

  ngAfterViewInit(): void {
    this.availableSlots = this.data.availableSlots ? this.data.availableSlots : [];

    if (this.dialogType === 'update' && this.data.element['slot_number'] && !specialCase(this.data.element['slot_number'], this.data.tableId)) {
      this.availableSlots.push(this.data.element['slot_number']);
    }

    if (!this.data.availableSlots) {
      this.databaseService.getAvailableSlots(this.data.tableId).subscribe({
        next: (values) => {
          this.availableSlots = this.availableSlots.concat(values);
        }
      });
    }
  }

  typeOf = _typeof;

  createFormGroup(): void {
    const group = {};
    let elementSlotNumber = this.data.element ? this.data.element['slot_number'] : '';
    // check if slot number is one of special cases
    elementSlotNumber = specialCase(elementSlotNumber, this.data.tableId) === false
      ? elementSlotNumber
      : specialCase(elementSlotNumber, this.data.tableId);

    group['slot_number'] = this.fb.control(elementSlotNumber);

    for (const column of this.tableDefinition.columnsDefinition) {
      const validators = [];
      const asyncValidators = [];

      let currentValue = this.data.element ? this.data.element[column.name] : '';

      if (currentValue && column.type.name === 'date' && currentValue !== '') {
        currentValue = parse(currentValue, 'T', new Date());
      } else if (column.type.name === 'date' && column.required) {
        currentValue = new Date();
      }
      if (column.required) {
        validators.push(Validators.required);
      }

      // special columns needs something else
      // uncomment this block when will be necessary
      // if (column.type.special) {
      //
      // }

      group[column.name] = this.fb.control(currentValue || '',
        {validators: validators, asyncValidators: asyncValidators, updateOn: "change"});
    }
    this.formGroup = new FormGroup(group);
    // this.cdr.detectChanges();
  }

  onInsert(): void {
    if (this.formGroup.valid) {
      const values = this.formGroup.value;

      this.databaseService.insertRow(this.data.tableId, values).subscribe({
        next: (result) => {
          this.dialogRef.close(result);
        },
        error: (error) => {
          this.logger.error(this.logTag, error);
          this.error = error;
        }
      });
    }
  }

  onUpdate(): void {
    const toUpdate = {};
    let someDirty = false;
    if (this.formGroup.valid && this.formGroup.dirty) {
      const controlPaths = controlsPaths(this.formGroup);
      for (const controlPath of controlPaths) {
        if (this.formGroup.get(controlPath).dirty && this.formGroup.get(controlPath).valid) {
          someDirty = true;
          // control name is the last element of the path
          toUpdate[controlPath[controlPath.length - 1]] = this.formGroup.get(controlPath).value;
        }
      }

      if (someDirty) {
        this.databaseService.updateRow(this.data.tableId, this.data.element.table_ref, toUpdate).subscribe({
          next: (result) => {
            this.dialogRef.close(result);
          },
          error: (error) => {
            this.logger.error(this.logTag, error);
            this.error = error;
          }
        });
      }
    }
  }

  onSubmit(): void {
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

  getDropdownItemStyle(column: ColumnDefinition, opt: { name: string, value: any }): any {
    if (column.name === "text_color") return {backgroundColor: opt.value, color: 'whitesmoke'};

    return {};
  }
}
