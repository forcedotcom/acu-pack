"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionsFactory = void 0;
const options_1 = require("./options");
class OptionsFactory {
    static async get(type, optionsFilePath, settings) {
        if (!type) {
            return null;
        }
        if (!(type.prototype instanceof options_1.OptionsBase)) {
            throw new Error('Specified type does not extend OptionsBase.');
        }
        const options = new type();
        if (settings) {
            options.settings = settings;
        }
        await options.load(optionsFilePath);
        return options;
    }
    static async set(options, optionsFilePath) {
        if (!optionsFilePath) {
            throw new Error('You must specify an optionsFilePath.');
        }
        await options.save(optionsFilePath);
    }
}
exports.OptionsFactory = OptionsFactory;
//# sourceMappingURL=options-factory.js.map