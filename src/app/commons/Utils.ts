import {MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';
import {AbstractControl, FormArray, FormGroup} from '@angular/forms';
import keys from 'lodash-es/keys';
import includes from 'lodash-es/includes';
import isString from 'lodash-es/isString';
import some from 'lodash-es/some';
import isMatch from 'date-fns/isMatch';
import parse from 'date-fns/parse';
import pickBy from 'lodash-es/pickBy';
import flattenDeep from 'lodash-es/flattenDeep';
import {SpecialCasesDefinition} from '../model/model';

/*export class Utils {

  static specialCases: object = {
    'CEREC': {
      tables: [1],
      bounds: [9000, 9099]
    }
  };

  static specialCasesKeys = keys(Utils.specialCases);

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
    if (isString(value)) {
      return value.trim() === '';
    }
  }

  /!**
   * Check if slotNumber is a special case for the given tableId
   * @param slotNumber the slot number to check
   * @param tableId table id with regard to check slotNumber
   * @return the special case name if slotNumber is a special case, false otherwise
   *!/
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
      if (includes(sCase.tables, tableId)) {
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


  /!**
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
   *!/
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


  /!**
   * Same as <i>paths</i> but returns all paths of controls in a FormGroup.
   * @see Utils.paths
   * @param root FormGroup to analyze
   *!/
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

  static hasArrayObjectWithValue(array, property, value) {
    return some(array, function (el) {
      return el[property] === value;
    });
  }

  static randomHexString(size: number): string {
    return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  }
}*/

const randomHexString = function (size: number): string {
  return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
};

const specialCases: SpecialCasesDefinition = {
  // TODO(fork): add special cases (SEE GUIDELINES)
};

const specialCasesKeys = keys(specialCases);

const _typeof = function (element: any, type?: string): boolean | string {
  if (type) {
    return typeof element === type;
  } else {
    return typeof element;
  }
};

const isEmpty = function (value: any): boolean {
  if (!value) { return true; }
  // if (Utils.typeof(value, 'string')) {
  //   return value.trim() === '';
  // }
  if (isString(value)) {
    return value.trim() === '';
  }
};

/**
 * Check if slotNumber is a special case for the given tableId
 * @param slotNumber the slot number to check
 * @param tableId table id with regard to check slotNumber
 * @return the special case name if slotNumber is a special case, false otherwise
 */
const specialCase = function (slotNumber: number, tableId: number): string | boolean {
  for (const key of specialCasesKeys) {
    const bounds = specialCases[key].bounds;
    const applicableTables = specialCases[key].tables;

    if (applicableTables.includes(tableId) && (slotNumber >= bounds[0] && slotNumber <= bounds[1])) {
      return key;
    }
  }

  return false;
};

const getSpecialCases = function (tableId: number): SpecialCasesDefinition {
  const toReturn = {};
  for (const key of specialCasesKeys) {
    const sCase = specialCases[key];
    if (includes(sCase.tables, tableId)) {
      toReturn[key] = sCase;
    }
  }

  return toReturn;
};

const openSnackbar = function (snackBar: MatSnackBar, text: string, duration?: number, actionText?: string, actionCallback?: () => void): MatSnackBarRef<any> {
  const snackBarRef = snackBar.open(text, actionText, {duration: duration});

  if (actionText) {
    snackBarRef.onAction().subscribe(actionCallback);
  }

  return snackBarRef;
};


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
const paths = function (root: {[key: string]: any}): string[][] {
  const paths = [];
  const nodes = [{
    obj: root,
    path: []
  }];
  while (nodes.length > 0) {
    const n = nodes.pop();
    Object.keys(n.obj).forEach(k => {
      if (typeof n.obj[k] === 'object') {
        const path = n.path.concat(k);
        paths.push(path);
        nodes.unshift({
          obj: n.obj[k],
          path: path
        });
      }
    });
  }
  return paths;
};


/**
 * Same as <i>paths</i> but returns all paths of controls in a FormGroup.
 * @see Utils.paths
 * @param root FormGroup to analyze
 */
const controlsPaths = function (root: FormGroup): string[][] {
  const paths = [];
  const nodes = [{
    obj: root.controls,
    path: []
  }];
  while (nodes.length > 0) {
    const n = nodes.pop();
    Object.keys(n.obj).forEach(k => {
      if (n.obj[k] instanceof AbstractControl) {
        const path = n.path.concat(k);

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
};

const hasArrayObjectWithValue = function (array: any, property: any, value: any): boolean {
  return some(array, function (el) {
    return el[property] === value;
  });
};

const parseDateString = function (dateString: string): Date {
  const formats = ['dd/MM/yyyy', 'T', 'MM/dd/yyy', 't'];
  for (const format of formats) {
    if (isMatch(dateString, format)) {
      return parse(dateString, format, new Date());
    }
  }

  return null;
};

/**
 * Returns the path of all invalid controls into the form
 * @param form The form
 * @param path Initial path prefix (used for recursion). Default ''
 */
const findInvalidFormControls = function (form: FormGroup | FormArray, path= ''): string[] {
  const invalids = [];
  const controls = form.controls;
  for (const name of Object.keys(controls)) {
    if (controls[name].invalid) {
      const newPath = isEmpty(path) ? name : path + '.' + name;
      if (Object.prototype.hasOwnProperty.call(controls[name], 'controls')) {
        invalids.push(findInvalidFormControls(controls[name], newPath));
      } else {
        invalids.push(newPath);
      }
    }
  }

  return flattenDeep(invalids);
};

/**
 * Find all keys in an object whose properties match to <i>match</a>.
 * @example
 * var object = {'A': {'p': 1}, 'B': {'p': 1, 'q': 5}, 'C': {'p': 2}};
 *
 * keysThatMatch(object, {'p': 1})
 * // => ["A", "B"]
 *
 * keysThatMatch(object, (o) => o.p == 2)
 * // => ["C"]
 * @param object Object to test
 * @param match A function used to test object properties or an object to compare
 */
const keysThatMatch = function (object: {[key: string]: any}, match: any): string[] {
  return keys(pickBy(object, match));
};

/**
 * Perform the difference between arrays <pre>
 *   arr1 - arr2
 * </pre>
 *
 * @example
 * var arr1 = [1, 2, 3];
 * var arr2 = [2, 5];
 *
 * arraysDifference(arr1, arr2);
 * // => [1, 3]
 * @param arr1
 * @param arr2
 */
const arraysDifference = function (arr1: any[], arr2: any[]): any[] {
  return arr1.filter(x => !arr2.includes(x));
};

export {specialCases, specialCasesKeys, _typeof, isEmpty, specialCase, findInvalidFormControls,
  getSpecialCases, openSnackbar, paths, controlsPaths, hasArrayObjectWithValue, randomHexString,
  parseDateString, keysThatMatch, arraysDifference};
