export class TypeChecker {
  static parseLogic(tree: any, level = 1): string {
    if (!Array.isArray(tree)) throw new Error('A logic branch must be an array');
    if (tree.length === 0) throw new Error('Passed an empty logic branch');
    if (tree[0] !== 'AND' && tree[0] !== 'OR') throw new Error('A logic branch must start with either a "AND" or "OR"');
    if (tree.length === 1) throw new Error('A logic branch must contain at least one item');
    let statements: string[] = [];
    const indent = ' '.repeat(level * 2);
    const operator = tree.shift() === 'AND' ? ' && \n' : ' || \n';
    for (const item of tree) {
      let statement = '';
      if (Array.isArray(item)) {
        statement = TypeChecker.parseLogic(item, level + 1);
      } else {
        if (typeof item.path !== 'string') throw new Error('Item does not contain a "path" property');
        item.type = item.type || 'any';

        switch (item.type) {
          case ('any'):
            statement = `(typeof context.${item.path} !== 'undefined' && context.${item.path} !== null)`;
            break;
          case ('none'):
            statement = `(typeof context.${item.path} === 'undefined' || context.${item.path} === null)`;
            break;
          case ('null'):
            statement = `context.${item.path} === null`;
            break;
          default:
            statement = `typeof context.${item.path} === '${item.type}'`;
        }
      }
      statements.push(indent + '  ' + statement);
    }
    return '(\n' + statements.join(operator) + '\n' + indent + ')';
  }

  static compileLogic(tree: any): { (context: any): boolean } {
    const parsed = TypeChecker.parseLogic(tree);
    return new Function('context', `try { return ${parsed}; } catch(err) { return false; }`) as (context: any) => any;
  }
}