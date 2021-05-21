import {AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {Questionnaire, QuestionnaireAnswers} from '../../model/model';
import {zip} from 'rxjs';
import {DatabaseService} from '../../providers/database.service';
import {LoggerService} from '../../providers/logger.service';
import {MatExpansionPanel} from '@angular/material/expansion';
import {MatSnackBar} from '@angular/material/snack-bar';
import {openSnackbar} from '../../commons/Utils';

@Component({
  selector: 'app-questionnaire-widget',
  templateUrl: './questionnaire-widget.component.html',
  styleUrls: ['./questionnaire-widget.component.scss'],
})
export class QuestionnaireWidgetComponent implements AfterContentInit {
  logTag = QuestionnaireWidgetComponent.name;

  @Input() questionnaireId: number = 1;
  @Input() tableId = 1;
  @Input() slotNumber = 1;

  questionnaire: Questionnaire;
  answers: QuestionnaireAnswers[];

  showNewPanel;

  constructor(
    private databaseService: DatabaseService,
    private loggerService: LoggerService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
  }

  ngAfterContentInit(): void {
    const questionnaires$ = this.databaseService.getQuestionnaireById(this.questionnaireId);
    const answers$ = this.databaseService.getQuestionnaireAnswersBy(this.tableId, this.slotNumber);

    zip(questionnaires$, answers$).subscribe(
      ([questionnaire, answers]) => {
        this.questionnaire = questionnaire;
        this.answers = answers[this.questionnaireId];

        console.log(this.questionnaire, this.answers);

        this.showNewPanel = (this.answers && this.answers.length > 0);
      },
      (error) => this.loggerService.error(this.logTag + '/ngAfterContentInit', error));
  }

  saveNewAnswer(answer: QuestionnaireAnswers) {
    answer.table_id = this.tableId;
    answer.slot_number = this.slotNumber;

    this.databaseService.saveQuestionnaireAnswers(answer).subscribe(
      (newAnswer) => {
        this.answers = [...this.answers, newAnswer];
        console.log(this.showNewPanel);
        this.showNewPanel = true;
        console.log(this.showNewPanel);
        this.cdr.detectChanges();
      },
      (error) => {
        openSnackbar(this.snackBar, "Impossibile salvare");
        this.loggerService.error(this.logTag, error);
      });
  }
}
