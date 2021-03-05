import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MaterialModule} from '../material/material.module';
import { TableWidgetComponent } from './table-widget/table-widget.component';
import {TranslateModule} from '@ngx-translate/core';
import {DndModule} from 'ng2-dnd';
import { TablePageComponent } from './table-page/table-page.component';
import { RowDialogComponent } from './row-dialog/row-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {ConfirmDialogComponent} from '../components/confirm-dialog/confirm-dialog.component';
import {SharedModule} from '../shared/shared.module';
import {DragAndDropModule} from 'angular-draggable-droppable';

@NgModule({
  declarations: [TableWidgetComponent, TablePageComponent, RowDialogComponent],
  exports: [
    TableWidgetComponent
  ],
  imports: [
    CommonModule, MaterialModule, TranslateModule, DndModule.forRoot(), ReactiveFormsModule,
    FormsModule, MatFormFieldModule, MatDialogModule, MatSelectModule, MatBadgeModule, SharedModule, DragAndDropModule
  ],
  entryComponents: [ RowDialogComponent, ConfirmDialogComponent ]
})
export class TablesModule { }
