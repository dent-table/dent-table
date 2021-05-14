import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringToDate'
})
export class StringToDatePipe implements PipeTransform {

  /**
   * Constructor
   */
  constructor() { }

  /**
   * Transform a date that is passed as string into a date
   * @param value The date passed as string
   * @returns {Date} The Date object
   */
  transform(value: string): Date {
    return new Date(value);
  }

}
