import {AfterViewInit, ChangeDetectorRef, Component, Inject, NgZone, OnInit} from '@angular/core';
import {DatabaseService} from '../../providers/database.service';
import {Questionnaire, QuestionnaireAnswers} from '../../model/model';
import {LoggerService} from '../../providers/logger.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import * as moment from 'moment';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {zip} from 'rxjs';
import {Utils} from '../../commons/Utils';
import {DialogData} from '../../tables/row-dialog/row-dialog.component';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss']
})
export class QuestionnaireComponent implements OnInit, AfterViewInit {
  logTag = QuestionnaireComponent.name;

  tableId: number = 3;
  slotNumber: number = 1;

  questionnaires: Questionnaire[];
  answers: {[id:string]: QuestionnaireAnswers[]};

  forms: object = { };

  showNewPanel = { };
  panelOpenState: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialogRef: MatDialogRef<QuestionnaireComponent>,
    private databaseService: DatabaseService,
    private loggerService: LoggerService,
    private fb: FormBuilder,
    private zone: NgZone,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    const questionnaires$ = this.databaseService.getQuestionnairesBy(this.tableId);
    const answers$ = this.databaseService.getQuestionnaireAnswersBy(this.tableId, this.slotNumber);

    zip(questionnaires$, answers$).subscribe(
      ([questionnaires, answers]) => {
        this.questionnaires = [...questionnaires];
        this.answers = answers;

        this.createFormGroups();
      },
      (error) => this.loggerService.error(this.logTag + '/ngAfterViewInit', error));
  }


  createFormGroups(): void {
    console.log(this.answers);
    for (let questionnaire of this.questionnaires) {
      // FormGroup for new answers
      // create questionnaire answers array for questionnaires that doesn't have answers (TODO: move this to data.js file?)
      this.answers[questionnaire.id] = this.answers[questionnaire.id] || [ ];
      if (!Utils.hasArrayObjectWithValue(this.answers[questionnaire.id], 'id', 'new')) {
        this.answers[questionnaire.id].push(
          {
            id: 'new',
            date: null,
            answers: null,
            note: null,
            questionnaire_ref: questionnaire.id,
            slot_number: this.slotNumber,
            table_id: this.tableId,
            validations: null
          }
        );
      }

      this.forms[questionnaire.id] = this.forms[questionnaire.id] || {}; // create field forms[questionnaire.id] if not exists
      this.forms[questionnaire.id]['new'] = this.createEmptyQuestionnaireFormGroup(questionnaire);
      this.showNewPanel[questionnaire.id] = this.answers[questionnaire.id]?.length === 0;

      console.log(this.showNewPanel);

      for (let answer of this.answers[questionnaire.id]) {
        answer['sections'] = answer.answers;
        this.forms[questionnaire.id][answer.id] = this.createEmptyQuestionnaireFormGroup(questionnaire);
        this.forms[questionnaire.id][answer.id].patchValue(answer);
        if (answer.id !== 'new') {
          this.forms[questionnaire.id][answer.id].disable();
        }
      }
    }

    console.log(this.forms);
  }


  private createEmptyQuestionnaireFormGroup(questionnaire: Questionnaire): FormGroup {
    let controlsGroup = {
      'name': ['', Validators.required],
      'questionnaire_ref': [questionnaire.id, Validators.required],
      'table_id': [this.tableId, Validators.required],
      'slot_number': [this.slotNumber, Validators.required],
      'date': ['', Validators.required],
      'note': [''],
      //TODO: add validations form?
    }

    let sectionsGroup = { };
    for (let sectionKey of Object.keys(questionnaire.sections)) {
      const section = questionnaire.sections[sectionKey];
      // each section has a 'questions' object having the definition of each question
      const questionsGroup = { }
      for (let question of section.questions) {
        questionsGroup[question.key] = ['', Validators.required]
      }

      sectionsGroup[sectionKey] = this.fb.group(questionsGroup);
    }

    controlsGroup['sections'] = this.fb.group(sectionsGroup);
    return this.fb.group(controlsGroup);
  }

  findInvalidControls(form) {
    const invalid = [];
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  saveNewQuestionnaire(id: number) {
    let form: FormGroup = this.forms[id]['new'];
    form.patchValue({date: moment().toISOString(true)});

    if (!form.valid) {
      console.log(this.findInvalidControls(form));
      this.zone.run(() => {
        const dialogRef = this.dialog.open(ConfirmDialogComponent,
          {data: {
              title: 'PAGES.QUESTIONNAIRES.DIALOG_FORM_INVALID_TITLE',
              content: 'PAGES.QUESTIONNAIRES.DIALOG_FORM_INVALID_CONTENT'
            }});
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.saveToDatabase(form.value);
          }
        });
      });
    } else {
      this.saveToDatabase(form.value);
    }
  }

  saveToDatabase(values: QuestionnaireAnswers): void {
    this.databaseService.saveQuestionnaireAnswers(values).subscribe((result) => {
      console.log(result);
      let newAnswers = [...this.answers[result.questionnaire_ref]];
      newAnswers.push(result);

      this.answers[result.questionnaire_ref] = newAnswers;
      this.createFormGroups();
      this.showNewPanel[result.questionnaire_ref] = false;
      this.cdr.detectChanges();
    })
  }
}
