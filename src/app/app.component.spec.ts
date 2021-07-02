import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { TranslateModule } from '@ngx-translate/core';
import { ElectronService } from './providers/electron.service';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      providers: [
        ElectronService
      ],
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();
  }));

  it('should create the app', waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TranslateServiceStub {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setDefaultLang(lang: string): void {
  }

}
