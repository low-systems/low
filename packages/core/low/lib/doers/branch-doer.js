"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const doer_1 = require("./doer");
class BranchDoer extends doer_1.Doer {
    main(context, taskConfig, config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(config.which in config.branches)) {
                throw new Error(`Invalid branch name '${config.which}'`);
            }
            const branchTasks = config.branches[config.which];
            const multiDoer = this.env.getDoer('MultiDoer');
            return yield multiDoer.main(context, taskConfig, branchTasks);
        });
    }
}
exports.BranchDoer = BranchDoer;
//# sourceMappingURL=branch-doer.js.map