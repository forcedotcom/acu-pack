"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../lib/command-base");
const xml_merge_1 = require("../../../lib/xml-merge");
class Merge extends command_base_1.CommandBase {
    async runInternal() {
        await xml_merge_1.default.mergeXmlFiles(this.flags.source, this.flags.destination, this.flags.compare, this.ux);
    }
}
Merge.description = command_base_1.CommandBase.messages.getMessage('package.merge.commandDescription');
Merge.examples = [
    `$ sfdx acu-pack:package:merge -s manifest/package.xml -d manifest/package-sprint17.xml
    Merges package.xml into package-sprint17.xml`,
    `$ sfdx acu-pack:package:merge -s manifest/package-a.xml -d manifest/package-b.xml -c
    Compares package-a.xml to package-b.xml and removes common elements from BOTH packages - leaving only the differences.`,
];
Merge.flagsConfig = {
    source: command_1.flags.filepath({
        char: 's',
        required: true,
        description: command_base_1.CommandBase.messages.getMessage('package.merge.sourceFlagDescription'),
    }),
    destination: command_1.flags.filepath({
        char: 'd',
        required: true,
        description: command_base_1.CommandBase.messages.getMessage('package.merge.destinationFlagDescription'),
    }),
    compare: command_1.flags.boolean({
        char: 'c',
        description: command_base_1.CommandBase.messages.getMessage('package.merge.isPackageCompareFlagDescription'),
    }),
};
exports.default = Merge;
//# sourceMappingURL=merge.js.map