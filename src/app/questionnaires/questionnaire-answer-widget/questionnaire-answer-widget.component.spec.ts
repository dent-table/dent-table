import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnaireAnswerWidgetComponent } from './questionnaire-answer-widget.component';

describe('QuestionnaireAnswerWidgetComponent', () => {
  let component: QuestionnaireAnswerWidgetComponent;
  let fixture: ComponentFixture<QuestionnaireAnswerWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionnaireAnswerWidgetComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionnaireAnswerWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
