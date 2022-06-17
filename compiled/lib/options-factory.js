"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionsFactory = void 0;
const options_1 = require("./options");
class OptionsFactory {
    static async get(type, optionsFilePath) {
        if (!type) {
            return null;
        }
        if (!(type.prototype instanceof options_1.OptionsBase)) {
            throw new Error('Specified type does not extend OptionsBase.');
        }
        const options = new type();
        await options.load(optionsFilePath);
        return options;
    }
}
exports.OptionsFactory = OptionsFactory;
//# sourceMappingURL=options-factory.js.map