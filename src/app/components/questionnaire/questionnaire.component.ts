import {AfterViewInit, ChangeDetectorRef, Component, Inject, NgZone, OnInit} from '@angular/core';
import {DatabaseService} from '../../providers/database.service';
import {Questionnaire, QuestionnaireAnswers} from '../../model/model';
import {LoggerService} from '../../providers/logger.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {zip} from 'rxjs';
import formatISO from 'date-fns/formatISO';

export interface QuestionnaireDialogData {
  tableId: number;
  slotNumber: number;
  itemName?: string;
}

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss']
})
export class QuestionnaireComponent implements OnInit, AfterViewInit {
  logTag = QuestionnaireComponent.name;

  questionnaires: Questionnaire[];
  answers: {[id:string]: QuestionnaireAnswers[]};
  answersWithNew: {[id:string]: QuestionnaireAnswers[]};

  forms: any = { };

  showNewPanel = { };
  panelOpenState: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: QuestionnaireDialogData,
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
    const questionnaires$ = this.databaseService.getQuestionnairesBy(this.data.tableId);
    const answers$ = this.databaseService.getQuestionnaireAnswersBy(this.data.tableId, this.data.slotNumber);

    zip(questionnaires$, answers$).subscribe(
      ([questionnaires, answers]) => {
        this.questionnaires = [...questionnaires];
        this.answers = answers;

        this.generateFormObjects();
      },
      (error) => this.loggerService.error(this.logTag + '/ngAfterViewInit', error));
  }

  // forms needs an array of answers with an empty fake QuestionnaireAnswers object for the new form and a set of FormGroup objects
  // one of each questionnaire answers object. This method creates both.
  generateFormObjects(): void {
    this.answersWithNew = this.generateAnswersFullObject(this.answers);
    this.createFormGroups();
  }

  createFormGroups(): void {
    for (const questionnaire of this.questionnaires) {
      // generate an empty questionnaire answers list for a questionnaire if not exists (TODO: move this to data.js?)
      this.answers[questionnaire.id] = this.answers[questionnaire.id] || [ ];

      this.forms[questionnaire.id] = this.forms[questionnaire.id] || {}; // create field forms[questionnaire.id] if not exists

      for (const answer of this.answersWithNew[questionnaire.id]) {
        answer['sections'] = answer.answers; // form group needs that answers must be in a field called 'sections'
        this.forms[questionnaire.id][answer.id] = this.createEmptyQuestionnaireFormGroup(questionnaire);
        if (answer.id !== 'new') {
          this.forms[questionnaire.id][answer.id].patchValue(answer);
          this.forms[questionnaire.id][answer.id].disable();
        }

        this.showNewPanel[questionnaire.id] = false;
      }

      console.log(this.forms);
    }
  }

  private createEmptyQuestionnaireFormGroup(questionnaire: Questionnaire): FormGroup {
    const controlsGroup = {
      'name': [this.data.itemName || '', Validators.required],
      'questionnaire_ref': [questionnaire.id, Validators.required],
      'table_id': [this.data.tableId, Validators.required],
      'slot_number': [this.data.slotNumber, Validators.required],
      'date': ['', Validators.required],
      'note': [''],
      //TODO: add validations form?
    };

    const sectionsGroup = { };
    for (const sectionKey of Object.keys(questionnaire.sections)) {
      const section = questionnaire.sections[sectionKey];
      // each section has a 'questions' object having the definition of each question
      const questionsGroup = { };
      for (const question of section.questions) {
        questionsGroup[question.key] = ['', Validators.required];
      }

      sectionsGroup[sectionKey] = this.fb.group(questionsGroup);
    }

    controlsGroup['sections'] = this.fb.group(sectionsGroup);
    return this.fb.group(controlsGroup);
  }

  findInvalidControls(form: FormGroup): string[] {
    const invalid = [];
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  generateAnswersFullObject(startObject: {[id: string]: QuestionnaireAnswers[]}): any {
    console.log(startObject);
    const newObject = { };

    for (const questionnaire of this.questionnaires) {
      const array = startObject[questionnaire.id] ? [...startObject[questionnaire.id]] : [ ];
      array.push({
        id: 'new',
        questionnaire_ref: questionnaire.id,
        table_id: this.data.tableId,
        slot_number: this.data.slotNumber,
        date: null,
        answers: null,
        note: null,
        validations: null,
      });

      newObject[questionnaire.id] = array;
    }

    return newObject;
  }

  saveNewQuestionnaire(id: number): void {
    const form: FormGroup = this.forms[id]['new'];
    form.patchValue({date: formatISO(new Date())});

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
    this.databaseService.saveQuestionnaireAnswers(values).subscribe((newQuestionnaireAnswers) => {
      console.log(newQuestionnaireAnswers);
      this.answers[newQuestionnaireAnswers.questionnaire_ref].push(newQuestionnaireAnswers);
      this.generateFormObjects();
    });
  }
}
