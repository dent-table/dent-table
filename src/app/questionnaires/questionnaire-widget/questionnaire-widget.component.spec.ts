import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnaireWidgetComponent } from './questionnaire-widget.component';

describe('QuestionnaireWidgetComponent', () => {
  let component: QuestionnaireWidgetComponent;
  let fixture: ComponentFixture<QuestionnaireWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionnaireWidgetComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionnaireWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
