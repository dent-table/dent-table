import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MAT_MOMENT_DATE_FORMATS, MatMomentDateModule, MomentDateAdapter} from '@angular/material-moment-adapter';
import {NgMatSearchBarModule} from 'ng-mat-search-bar';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

@NgModule({
  declarations: [],
  imports: [
    CommonModule, BrowserAnimationsModule, MatButtonModule, MatCheckboxModule, MatTooltipModule, MatFormFieldModule, MatInputModule,
    FlexLayoutModule, MatPaginatorModule, MatIconModule, MatToolbarModule, MatCardModule, MatDatepickerModule, MatMomentDateModule,
    MatRippleModule, NgMatSearchBarModule, MatSnackBarModule, MatProgressSpinnerModule, MatTabsModule, MatExpansionModule, MatListModule,
    MatButtonToggleModule
  ],
  exports: [
    BrowserAnimationsModule, MatButtonModule, MatCheckboxModule, MatTableModule, MatTooltipModule, MatFormFieldModule, MatInputModule,
    FlexLayoutModule, MatPaginatorModule, MatIconModule, MatToolbarModule, MatCardModule, MatDatepickerModule, MatMomentDateModule,
    MatRippleModule, NgMatSearchBarModule, MatSnackBarModule, MatProgressSpinnerModule, MatTabsModule, MatExpansionModule, MatListModule,
    MatButtonToggleModule
  ],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
    {provide: MAT_DATE_LOCALE, useValue: navigator.language}
  ]
})
export class MaterialModule { }
