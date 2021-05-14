import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {WebviewDirective} from './directives/webview.directive';
import { SlotNumberTransformPipe } from './pipes/slot-number-transform.pipe';
import { StringToDatePipe } from './pipes/string-to-date.pipe';

@NgModule({
  declarations: [WebviewDirective, SlotNumberTransformPipe, StringToDatePipe],
  exports: [WebviewDirective, SlotNumberTransformPipe, StringToDatePipe],
  imports: [
    CommonModule
  ]
})
export class SharedModule { }
