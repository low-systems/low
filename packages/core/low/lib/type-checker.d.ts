export declare class TypeChecker {
    static parseLogic(tree: any, level?: number): string;
    static compileLogic(tree: any): {
        (context: any): boolean;
    };
}
