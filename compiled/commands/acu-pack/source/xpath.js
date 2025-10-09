"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../lib/command-base");
const utils_1 = require("../../../lib/utils");
const options_factory_1 = require("../../../lib/options-factory");
const xpath_options_1 = require("../../../lib/xpath-options");
class XPath extends command_base_1.CommandBase {
    async runInternal() {
        // Read/Write the options file if it does not exist already
        const options = await options_factory_1.OptionsFactory.get(xpath_options_1.XPathOptions, this.flags.options ?? XPath.defaultOptionsFileName);
        for (const [sourceFolder, rules] of options.rules) {
            if (!sourceFolder) {
                continue;
            }
            for await (const filePath of utils_1.default.getFiles(sourceFolder)) {
                this.ux.log(`Processing file: '${filePath}`);
                let xml = null;
                for await (const line of utils_1.default.readFileLines(filePath)) {
                    xml += line;
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
        return;
    }
}
XPath.description = command_base_1.CommandBase.messages.getMessage('source.xpath.commandDescription');
XPath.defaultOptionsFileName = 'xpath-options.json';
XPath.examples = [
    `$ sfdx acu-pack:source:xpath -o ./xpathOptions.json"
    Validates the project source from the x-path rules specified in '${XPath.defaultOptionsFileName}'`,
];
XPath.flagsConfig = {
    options: command_1.flags.string({
        char: 'o',
        description: command_base_1.CommandBase.messages.getMessage('source.xpath.optionsFlagDescription'),
    }),
};
exports.default = XPath;
//# sourceMappingURL=xpath.js.map