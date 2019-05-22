import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  DateAdapter, MAT_DATE_FORMATS,
  MAT_DATE_LOCALE, MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatFormFieldModule,
  MatIconModule, MatInputModule,
  MatPaginatorModule, MatRippleModule, MatSnackBarModule,
  MatTableModule,
  MatToolbarModule, MatTooltipModule
} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MAT_MOMENT_DATE_FORMATS, MatMomentDateModule, MomentDateAdapter} from '@angular/material-moment-adapter';
import {NgMatSearchBarModule} from 'ng-mat-search-bar';

@NgModule({
  declarations: [],
  imports: [
    CommonModule, BrowserAnimationsModule, MatButtonModule, MatCheckboxModule, MatTooltipModule, MatFormFieldModule, MatInputModule,
    FlexLayoutModule, MatPaginatorModule, MatIconModule, MatToolbarModule, MatCardModule, MatDatepickerModule, MatMomentDateModule,
    MatRippleModule, NgMatSearchBarModule, MatSnackBarModule
  ],
  exports: [
    BrowserAnimationsModule, MatButtonModule, MatCheckboxModule, MatTableModule, MatTooltipModule, MatFormFieldModule, MatInputModule,
    FlexLayoutModule, MatPaginatorModule, MatIconModule, MatToolbarModule, MatCardModule, MatDatepickerModule, MatMomentDateModule,
    MatRippleModule, NgMatSearchBarModule, MatSnackBarModule
  ],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
    {provide: MAT_DATE_LOCALE, useValue: navigator.language}
  ]
})
export class MaterialModule { }
