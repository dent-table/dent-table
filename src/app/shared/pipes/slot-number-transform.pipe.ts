import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import {Utils} from '../../commons/Utils';

@Pipe({
  name: 'slotNumberTransform'
})
export class SlotNumberTransformPipe implements PipeTransform {

  transform(value: number, tableId: number): any {
    return Utils.specialCase(value, tableId) || value;
  }

}
