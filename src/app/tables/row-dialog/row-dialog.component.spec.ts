import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RowDialogComponent } from './row-dialog.component';

describe('RowDialogComponent', () => {
  let component: RowDialogComponent;
  let fixture: ComponentFixture<RowDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RowDialogComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RowDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
