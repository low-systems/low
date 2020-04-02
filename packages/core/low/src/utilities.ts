
export class Utility {
  static arrayify(input: any) {
    return Array.isArray(input) ? input : [input];
  }

  static isObject(input: any) {
    return typeof input === 'object' && !Array.isArray(input) && !input === null;
  }

  static isEmpty(input: any) {
    switch (typeof input) {
      case ('string'):
        return input.length === 0;
      case ('number'):
        return input === 0;
      case ('object'):
        if (Array.isArray(input)) {
          return input.length === 0;
        } else if (input === null) {
          return true;
        } else {
          return Object.keys(input).length === 0;
        }
      case ('boolean'):
        return false;
      default:
        return !input;
    }
  }

  static removeEmpty(input: any) {
    if (!Array.isArray(input)) {
      throw new Error('Input must be an array');
    }
    return input.filter(item => !Utility.isEmpty(item));
  }
}