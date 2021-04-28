import { MatSnackBar } from '@angular/material/snack-bar';
import * as _ from 'lodash-es';
import {AbstractControl, FormGroup} from "@angular/forms";

export class Utils {

  static specialCases: object = {
    /*    'CEREC': {
          tables: [1],
          bounds: [9000, 9099]
        }*/
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


  /**
   * Returns all key paths of an complex object in list form
   * @example
   *    const obj = {
   *   "First": {
   *     "Second": {
   *       "Fourth": {
   *         "GROSS": 1833
   *       },
   *       "Fifth": {
   *         "GROSS": 2442
   *       }
   *     },
   *     "Third": {
   *       "Sixth": {
   *         "GROSS": 1721
   *       }
   *     }
   *   }
   * };
   * const test = paths(obj);
   * [["First"], ["First","Second"], ["First","Third"], ["First","Second","Fourth"],
   * ["First","Second","Fifth"], ["First","Third","Sixth"]]
   * @see https://lowrey.me/getting-all-paths-of-an-javascript-object/
   * @param root object to analyze
   */
  static paths(root) {
    let paths = [];
    let nodes = [{
      obj: root,
      path: []
    }];
    while (nodes.length > 0) {
      let n = nodes.pop();
      Object.keys(n.obj).forEach(k => {
        if (typeof n.obj[k] === 'object') {
          let path = n.path.concat(k);
          paths.push(path);
          nodes.unshift({
            obj: n.obj[k],
            path: path
          });
        }
      });
    }
    return paths;
  }


  /**
   * Same as <i>paths</i> but returns all paths of controls in a FormGroup.
   * @see Utils.paths
   * @param root FormGroup to analyze
   */
  static controlsPaths(root: FormGroup): string[][] {
    let paths = [];
    let nodes = [{
      obj: root.controls,
      path: []
    }];
    while (nodes.length > 0) {
      let n = nodes.pop();
      Object.keys(n.obj).forEach(k => {
        if (n.obj[k] instanceof AbstractControl) {
          let path = n.path.concat(k);

          // if current object is a FormGroup we have to dig into it, otherwise we have reached a final control and
          // we can add its path to paths list
          if (n.obj[k] instanceof FormGroup) {
            nodes.unshift({
              obj: n.obj[k]['controls'],
              path: path
            });
          } else {
            paths.push(path);
          }
        }
      });
    }
    return paths;
  }
}
