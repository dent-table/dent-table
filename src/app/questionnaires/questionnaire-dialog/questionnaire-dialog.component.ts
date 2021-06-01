import {Component, Inject, OnInit} from '@angular/core';
import {Questionnaire, TableRow} from '../../model/model';
import {DatabaseService} from '../../providers/database.service';
import {LoggerService} from '../../providers/logger.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-questionnaire-dialog',
  templateUrl: './questionnaire-dialog.component.html',
  styleUrls: ['./questionnaire-dialog.component.scss']
})
export class QuestionnaireDialogComponent implements OnInit {
  logTag = QuestionnaireDialogComponent.name;
  questionnaires: Questionnaire[];
  loaded: boolean = false;

  dialogWidth = 60;
  dialogHeight = 90;

  constructor(
    private databaseService: DatabaseService,
    private loggerService: LoggerService,
    public dialogRef: MatDialogRef<QuestionnaireDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public rowData: TableRow
  ) { }

  ngOnInit(): void {
    // this.dialogRef.updateSize(`${this.dialogWidth}%`, `${this.dialogHeight}%`);
    this.databaseService.getQuestionnairesBy(this.rowData.table_id).subscribe(
      questionnaires => {
        this.questionnaires = questionnaires;
        this.loaded = true;
      },
      error => this.loggerService.error(this.logTag, error)
    );
  }
}
