import {AfterViewInit, Component, Input} from '@angular/core';
import {Questionnaire, QuestionnaireAnswers, TableRow} from '../../model/model';
import {DatabaseService} from '../../providers/database.service';
import {LoggerService} from '../../providers/logger.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {openSnackbar} from '../../commons/Utils';
import {TranslateService} from '@ngx-translate/core';
import {FAB_ANIMATION_TRIGGER} from '../../commons/Animations';

@Component({
  selector: 'app-questionnaire-widget[questionnaire][row]',
  templateUrl: './questionnaire-widget.component.html',
  styleUrls: ['./questionnaire-widget.component.scss'],
  animations: [FAB_ANIMATION_TRIGGER]
})
export class QuestionnaireWidgetComponent implements AfterViewInit {
  logTag = QuestionnaireWidgetComponent.name;

  @Input() questionnaire: Questionnaire;
  @Input() row: TableRow;

  answers: QuestionnaireAnswers[];
  showNewPanel = false;

  constructor(
    private databaseService: DatabaseService,
    private loggerService: LoggerService,
    private translateService: TranslateService,
    private snackBar: MatSnackBar,
  ) { }

  ngAfterViewInit(): void {
    this.databaseService.getQuestionnaireAnswersBy(this.row.table_id, this.row.slot_number).subscribe(
      answers => {
        this.answers = answers[this.questionnaire.id];
      },
      error => this.loggerService.error(this.logTag + '/ngAfterContentInit', error)
    );
  }

  saveNewAnswer(answer: QuestionnaireAnswers): void {
    answer.table_id = this.row.table_id;
    answer.slot_number = this.row.slot_number;

    this.databaseService.saveQuestionnaireAnswers(answer).subscribe(
      (newAnswer) => {
        this.answers = [...this.answers, newAnswer];
        this.showNewPanel = false;
      },
      (error) => {
        openSnackbar(this.snackBar, this.translateService.instant('ERRORS.GENERIC2'));
        this.loggerService.error(this.logTag, error);
      });
  }

}
