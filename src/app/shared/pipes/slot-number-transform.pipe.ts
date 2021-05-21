import { Pipe, PipeTransform } from '@angular/core';
import {specialCase} from '../../commons/Utils';

@Pipe({
  name: 'slotNumberTransform'
})
export class SlotNumberTransformPipe implements PipeTransform {

  transform(value: number, tableId: number): any {
    return specialCase(value, tableId) || value;
  }

}
