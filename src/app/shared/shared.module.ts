import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {WebviewDirective} from './directives/webview.directive';
import { SlotNumberTransformPipe } from './pipes/slot-number-transform.pipe';

@NgModule({
  declarations: [WebviewDirective, SlotNumberTransformPipe],
  exports: [WebviewDirective, SlotNumberTransformPipe],
  imports: [
    CommonModule
  ]
})
export class SharedModule { }
