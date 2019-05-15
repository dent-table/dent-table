export class Utils {
  static typeof(element: any, type?: string): boolean | string {
    if (type) {
      return typeof element === type;
    } else {
      return typeof element;
    }
  }

  static isEmpty(value: any): boolean {
    if (!value) { return true; }
    if (Utils.typeof(value, 'string')) {
      return value.trim() === '';
    }
  }
}
