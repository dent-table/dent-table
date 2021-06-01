import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MaterialModule} from '../material/material.module';
import {SharedModule} from '../shared/shared.module';
import { QuestionnaireWidgetComponent } from './questionnaire-widget/questionnaire-widget.component';
import { QuestionnaireAnswerWidgetComponent } from './questionnaire-answer-widget/questionnaire-answer-widget.component';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import { QuestionnaireDialogComponent } from './questionnaire-dialog/questionnaire-dialog.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  declarations: [QuestionnaireWidgetComponent, QuestionnaireAnswerWidgetComponent, QuestionnaireDialogComponent],
  imports: [
    MaterialModule, CommonModule, SharedModule, ReactiveFormsModule, TranslateModule, BrowserAnimationsModule
  ]
})
export class QuestionnairesModule { }
