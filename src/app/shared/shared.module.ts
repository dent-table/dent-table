import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {WebviewDirective} from './directives/webview.directive';

@NgModule({
  declarations: [WebviewDirective],
  exports: [WebviewDirective],
  imports: [
    CommonModule
  ]
})
export class SharedModule { }
