import { MatSnackBar } from '@angular/material/snack-bar';
import * as _ from 'lodash';

export class Utils {

  static specialCases: object = {
    'CEREC': {
      tables: [1],
      bounds: [9000, 9099]
    }
  };

  static specialCasesKeys = _.keys(Utils.specialCases);

  static typeof(element: any, type?: string): boolean | string {
    if (type) {
      return typeof element === type;
    } else {
      return typeof element;
    }
  }

  static isEmpty(value: any): boolean {
    if (!value) { return true; }
    // if (Utils.typeof(value, 'string')) {
    //   return value.trim() === '';
    // }
    if (_.isString(value)) {
      return value.trim() === '';
    }
  }

  /**
   * Check if slotNumber is a special case for the given tableId
   * @param slotNumber the slot number to check
   * @param tableId table id with regard to check slotNumber
   * @return the special case name if slotNumber is a special case, false otherwise
   */
  static specialCase(slotNumber: number, tableId: number) {
    for (const key of this.specialCasesKeys) {
      const bounds = this.specialCases[key].bounds;
      const applicableTables = this.specialCases[key].tables;

      if (applicableTables.includes(tableId) && (slotNumber >= bounds[0] && slotNumber <= bounds[1])) {
        return key;
      }
    }

    return false;
  }

  static getSpecialCases(tableId: number) {
    const toReturn = {};
    for (const key of this.specialCasesKeys) {
      const sCase = this.specialCases[key];
      if (_.includes(sCase.tables, tableId)) {
        toReturn[key] = sCase;
      }
    }

    return toReturn;
  }

  static openSnackbar(snackBar: MatSnackBar, text: string, duration?: number, actionText?: string, actionCallback?: () => void) {
    const snackBarRef = snackBar.open(text, actionText, {duration: duration});

    if (actionText) {
      snackBarRef.onAction().subscribe(actionCallback);
    }

    return snackBarRef;
  }
}
