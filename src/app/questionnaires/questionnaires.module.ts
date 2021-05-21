import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MaterialModule} from '../material/material.module';
import {SharedModule} from '../shared/shared.module';
import { QuestionnaireWidgetComponent } from './questionnaire-widget/questionnaire-widget.component';
import { QuestionnaireAnswerWidgetComponent } from './questionnaire-answer-widget/questionnaire-answer-widget.component';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [QuestionnaireWidgetComponent, QuestionnaireAnswerWidgetComponent],
  imports: [
    MaterialModule, CommonModule, SharedModule, ReactiveFormsModule, TranslateModule
  ]
})
export class QuestionnairesModule { }
