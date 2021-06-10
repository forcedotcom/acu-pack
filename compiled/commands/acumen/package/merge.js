"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../lib/command-base");
const xml_merge_1 = require("../../../lib/xml-merge");
class Merge extends command_base_1.CommandBase {
    async run() {
        await xml_merge_1.default.mergeXmlFiles(this.flags.source, this.flags.destination, this.ux);
    }
}
exports.default = Merge;
Merge.description = command_base_1.CommandBase.messages.getMessage('package.merge.commandDescription');
Merge.examples = [`$ sfdx acumen:package:merge -s manifest/package.xml -d manifest/package-sprint17.xml
    Merges package.xml into package-sprint17.xml`];
Merge.flagsConfig = {
    source: command_1.flags.filepath({
        char: 's',
        required: true,
        description: command_base_1.CommandBase.messages.getMessage('package.merge.sourceFlagDescription')
    }),
    destination: command_1.flags.filepath({
        char: 'd',
        required: true,
        description: command_base_1.CommandBase.messages.getMessage('package.merge.destinationFlagDescription')
    })
};
//# sourceMappingURL=merge.js.map