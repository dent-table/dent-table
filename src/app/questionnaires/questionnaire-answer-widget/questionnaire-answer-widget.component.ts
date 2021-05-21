import {AfterContentInit, Component, EventEmitter, Input, Output, TemplateRef, ViewChild} from '@angular/core';
import {Questionnaire, QuestionnaireAnswers} from '../../model/model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-questionnaire-answer-widget',
  templateUrl: './questionnaire-answer-widget.component.html',
  styleUrls: ['./questionnaire-answer-widget.component.scss'],
  host: {
    'class': 'expansion-panel-wrapper',
  },
})
export class QuestionnaireAnswerWidgetComponent implements AfterContentInit {
  @Input() questionnaire: Questionnaire;
  @Input() answer: QuestionnaireAnswers;

  @ViewChild('childComponentTemplate', {static: true}) childComponentTemplate: TemplateRef<any>;
  @Output() onSave: EventEmitter<QuestionnaireAnswers> = new EventEmitter<QuestionnaireAnswers>();

  formGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
  ) { }

  private createEmptyFormGroup() {
    let controlsGroup = {
      'name': ['', Validators.required],
      'questionnaire_ref': [this.questionnaire.id, Validators.required],
      // 'table_id': [this.parameters.tableId, Validators.required],
      // 'slot_number': [this.parameters.slotNumber, Validators.required],
      'note': [''],
      //TODO: add validations form?
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
    }
  }

  saveNewQuestionnaire() {
    this.onSave.emit(this.formGroup.value);
  }

  ngAfterContentInit(): void {
    setTimeout(() => this.createFormGroup(), 0);
  }
}
