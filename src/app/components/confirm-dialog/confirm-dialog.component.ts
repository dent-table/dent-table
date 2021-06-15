import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title;
  content?;
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styles: []
})
export class ConfirmDialogComponent implements OnInit {

  title = 'PAGES.CONFIRM_DIALOG.SURE';
  content = 'PAGES.CONFIRM_DIALOG.CANNOT_UNDONE';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    private dialogRef: MatDialogRef<ConfirmDialogComponent>
  ) {
    this.title = data.title;
    this.content = data.content;
  }

  ngOnInit(): void { }

  close(result: boolean): void {
    this.dialogRef.close(result);
  }

}
