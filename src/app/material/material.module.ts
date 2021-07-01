import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MAT_DATE_LOCALE, MatRippleModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FlexLayoutModule} from '@angular/flex-layout';
// import {MAT_MOMENT_DATE_FORMATS, MatMomentDateModule, MomentDateAdapter} from '@angular/material-moment-adapter';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import it from 'date-fns/esm/locale/it';
// import {NgxMatDateFnsDateModule, NGX_MAT_DATEFNS_LOCALES} from 'ngx-mat-datefns-date-adapter';
import {NgxMatDateFnsDateModule} from '../ngx-date-fns-date/ngx-date-fns-date.module';
import {NGX_MAT_DATEFNS_LOCALES} from '../ngx-date-fns-date/ngx-mat-datefns-locales';
import {MatChipsModule} from '@angular/material/chips';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSelectModule} from '@angular/material/select';
import {MatBadgeModule} from '@angular/material/badge';
import { SearchFieldComponent } from './components/search-field/search-field.component';
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [
    SearchFieldComponent
  ],
  imports: [
    CommonModule, BrowserAnimationsModule, MatButtonModule, MatCheckboxModule, MatTooltipModule, MatFormFieldModule, MatInputModule,
    FlexLayoutModule, MatPaginatorModule, MatIconModule, MatToolbarModule, MatCardModule, MatDatepickerModule, NgxMatDateFnsDateModule,
    MatRippleModule, MatSnackBarModule, MatProgressSpinnerModule, MatTabsModule, MatExpansionModule, MatListModule,
    MatButtonToggleModule, MatChipsModule, MatDialogModule, MatSelectModule, MatBadgeModule, ReactiveFormsModule
  ],
  exports: [
    BrowserAnimationsModule, MatButtonModule, MatCheckboxModule, MatTableModule, MatTooltipModule, MatFormFieldModule, MatInputModule,
    FlexLayoutModule, MatPaginatorModule, MatIconModule, MatToolbarModule, MatCardModule, MatDatepickerModule, NgxMatDateFnsDateModule,
    MatRippleModule, MatSnackBarModule, MatProgressSpinnerModule, MatTabsModule, MatExpansionModule, MatListModule,
    MatButtonToggleModule, MatChipsModule, MatDialogModule, MatSelectModule, MatBadgeModule, SearchFieldComponent
  ],
  providers: [
    // {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    // {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
    {provide: NGX_MAT_DATEFNS_LOCALES, useValue: [it]},
    {provide: MAT_DATE_LOCALE, useValue: navigator.language}
  ]
})
export class MaterialModule { }
