"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../lib/command-base");
const utils_1 = require("../../../lib/utils");
const options_factory_1 = require("../../../lib/options-factory");
const xpath_options_1 = require("../../../lib/xpath-options");
class XPath extends command_base_1.CommandBase {
    async runInternal() {
        var e_1, _a, e_2, _b;
        var _c;
        // Read/Write the options file if it does not exist already
        const options = await options_factory_1.OptionsFactory.get(xpath_options_1.XPathOptions, (_c = this.flags.options) !== null && _c !== void 0 ? _c : XPath.defaultOptionsFileName);
        for (const [sourceFolder, rules] of options.rules) {
            if (!sourceFolder) {
                continue;
            }
            try {
                for (var _d = (e_1 = void 0, tslib_1.__asyncValues(utils_1.default.getFiles(sourceFolder))), _e; _e = await _d.next(), !_e.done;) {
                    const filePath = _e.value;
                    this.ux.log(`Processing file: '${filePath}`);
                    let xml = null;
                    try {
                        for (var _f = (e_2 = void 0, tslib_1.__asyncValues(utils_1.default.readFileLines(filePath))), _g; _g = await _f.next(), !_g.done;) {
                            const line = _g.value;
                            xml += line;
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_g && !_g.done && (_b = _f.return)) await _b.call(_f);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    const xPaths = [];
                    for (const rule of rules) {
                        xPaths.push(rule.xPath);
                    }
                    for (const [xPath, values] of utils_1.default.selectXPath(xml, xPaths)) {
                        for (const rule of rules) {
                            if (rule.xPath === xPath) {
                                for (const ruleValue of rule.values) {
                                    for (const xmlValue of values) {
                                        if (ruleValue.trim() === xmlValue.trim()) {
                                            // Set the proper exit code to indicate violation/failure
                                            this.gotError = true;
                                            this.ux.log(`${rule.name} - Violation!`);
                                            this.ux.log(`\txpath: ${xPath}`);
                                            this.ux.log(`\tvalue: ${xmlValue}`);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) await _a.call(_d);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        return;
    }
}
exports.default = XPath;
XPath.description = command_base_1.CommandBase.messages.getMessage('source.xpath.commandDescription');
XPath.defaultOptionsFileName = 'xpath-options.json';
XPath.examples = [
    `$ sfdx acumen:source:xpath -o ./xpathOptions.json"
    Validates the project source from the x-path rules specified in '${XPath.defaultOptionsFileName}'`
];
XPath.flagsConfig = {
    options: command_1.flags.string({
        char: 'o',
        description: command_base_1.CommandBase.messages.getMessage('source.xpath.optionsFlagDescription')
    })
};
//# sourceMappingURL=xpath.js.map