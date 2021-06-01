import {AfterContentInit, Component, EventEmitter, Input, Output, TemplateRef, ViewChild} from '@angular/core';
import {Questionnaire, QuestionnaireAnswers} from '../../model/model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ConfirmDialogComponent} from '../../components/confirm-dialog/confirm-dialog.component';
import {arraysDifference, findInvalidFormControls, keysThatMatch} from '../../commons/Utils';
import {MatDialog} from '@angular/material/dialog';
import {animate, style, transition, trigger} from '@angular/animations';
import {MatExpansionPanel} from '@angular/material/expansion';

@Component({
  selector: 'app-questionnaire-answer-widget',
  templateUrl: './questionnaire-answer-widget.component.html',
  styleUrls: ['./questionnaire-answer-widget.component.scss'],
  host: {
    'class': 'expansion-panel-wrapper',
  },
  animations: [
    trigger(
      'questionnaireAnswer',
      [
        transition(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(-10px)' }),
            animate('350ms cubic-bezier(0.87, 0, 0.13, 1)',
              style({ opacity: 1, transform: 'translateY(0)' })),
          ]
        ),
        transition(
          ':leave',
          [
            style({ opacity: 1 }),
            animate('300ms cubic-bezier(0.85, 0, 0.15, 1)',
              style({ opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class QuestionnaireAnswerWidgetComponent implements AfterContentInit {
  @Input() questionnaire: Questionnaire;
  @Input() answer: QuestionnaireAnswers;
  @Input() defaultName: string;

  @ViewChild('childComponentTemplate', {static: true}) childComponentTemplate: TemplateRef<any>;
  @ViewChild('expansionPanel', {static: false}) expansionPanel: MatExpansionPanel;

  @Output() onSave: EventEmitter<QuestionnaireAnswers> = new EventEmitter<QuestionnaireAnswers>();
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  formGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog
  ) { }

  ngAfterContentInit(): void {
    setTimeout(() => this.createFormGroup(), 0);
  }

  // disable form sections that are validated by given validations list and enables the remaining ones
  private disableSectionsByValidations(validations: any[]) {
    // transform string into numbers
    validations = validations.map(a => Number.parseInt(a, 10));

    for (const validation of Object.keys(this.questionnaire.validations)) {
      const v = Number.parseInt(validation, 10);
      const sectionKeys = keysThatMatch(this.questionnaire.sections, {validated_by: v});

      sectionKeys.forEach(key => {
        if (validations.includes(v)) {
          this.formGroup.get('sections.' + key).disable();
        } else {
          this.formGroup.get('sections.' + key).enable();
        }
      });
    }
  }

  private createEmptyFormGroup() {
    let controlsGroup = {
      'name': [this.defaultName || '', Validators.required],
      'questionnaire_ref': [this.questionnaire.id, Validators.required],
      // 'table_id': [this.parameters.tableId, Validators.required],
      // 'slot_number': [this.parameters.slotNumber, Validators.required],
      'note': [''],
      'validations': [[], Validators.required],
      // 'selected_sections': [[]]
    }

    let sectionsGroup = { };
    for (let sectionKey of Object.keys(this.questionnaire.sections)) {
      const section = this.questionnaire.sections[sectionKey];
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

  private createFormGroup() {
    this.formGroup = this.createEmptyFormGroup();
    if (this.answer) {
      this.answer['sections'] = this.answer.answers
      this.formGroup.patchValue(this.answer);
      this.formGroup.disable();
    } else {
      this.formGroup.get('validations').valueChanges.subscribe(selectedValues => {
        const toDisable = arraysDifference(Object.keys(this.questionnaire.validations), selectedValues);
        this.disableSectionsByValidations(toDisable);
      });
    }
  }

  saveNewQuestionnaire() {
    if (!this.formGroup.valid) {
      console.log(findInvalidFormControls(this.formGroup));
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'PAGES.QUESTIONNAIRES.DIALOG_FORM_INVALID_TITLE',
          content: 'PAGES.QUESTIONNAIRES.DIALOG_FORM_INVALID_CONTENT'
        }});
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.emitNewAnswer(this.formGroup.value);
        }
      });
    } else {
      this.emitNewAnswer(this.formGroup.value);
    }
  }

  emitNewAnswer(answer) {
    this.onSave.emit(answer);
  }

  emitClose() {
    this.expansionPanel.close();
    this.close.emit();
  }
}
