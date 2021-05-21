import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ElectronService } from './providers/electron.service';

import { WebviewDirective } from './shared/directives/webview.directive';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import {MaterialModule} from './material/material.module';
import {TablesModule} from './tables/tables.module';
import {OverlayContainer} from '@angular/cdk/overlay';
import { LoginComponent } from './components/login/login.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import {NgMatSearchBarModule} from 'ng-mat-search-bar';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { TitleBarComponent } from './components/title-bar/title-bar.component';
import { PreferencesDialogComponent } from './components/preferences-dialog/preferences-dialog.component';
import { QuestionnaireComponent } from './components/questionnaire/questionnaire.component';
import {SharedModule} from './shared/shared.module';
import {QuestionnairesModule} from './questionnaires/questionnaires.module';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    ToolbarComponent,
    ConfirmDialogComponent,
    TitleBarComponent,
    PreferencesDialogComponent,
    QuestionnaireComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    }),
    MaterialModule,
    TablesModule,
    QuestionnairesModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    NgMatSearchBarModule,
    MatDialogModule,
    MatTabsModule,
    MatSelectModule
  ],
  providers: [ElectronService],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(overlayContainer: OverlayContainer) {
    overlayContainer.getContainerElement().classList.add('app-light-theme');
  }
}
