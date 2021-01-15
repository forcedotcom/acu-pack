"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_base_1 = require("../../../lib/command-base");
const command_1 = require("@salesforce/command");
const sfdx_tasks_1 = require("../../../lib/sfdx-tasks");
const options_factory_1 = require("../../../lib/options-factory");
const fs_1 = require("fs");
const office_1 = require("../../../lib/office");
const utils_1 = require("../../../lib/utils");
const schema_utils_1 = require("../../../lib/schema-utils");
const schema_options_1 = require("../../../lib/schema-options");
const path = require("path");
class Dictionary extends command_base_1.CommandBase {
    async run() {
        var e_1, _a, e_2, _b;
        // Read/Write the options file if it does not exist already
        this.options = await options_factory_1.OptionsFactory.get(schema_options_1.default, this.flags.options);
        const dynamicCode = this.options.getDynamicCode();
        try {
            const orgAlias = this.flags.targetusername;
            const sheetDataFile = `schema-${orgAlias}.tmp`;
            const sortedTypeNames = await this.getSortedTypeNames(orgAlias);
            // Create for writing - truncates if exists
            const stream = fs_1.createWriteStream(sheetDataFile, { flags: 'w' });
            let counter = 0;
            const schemas = new Set();
            for (const metaDataType of sortedTypeNames) {
                this.ux.log(`Gathering (${++counter}/${sortedTypeNames.length}) ${metaDataType} schema...`);
                try {
                    const schema = await sfdx_tasks_1.SfdxTasks.describeObject(orgAlias, metaDataType);
                    // Avoid duplicates (Account)
                    if (schemas.has(schema.name)) {
                        continue;
                    }
                    try {
                        for (var _c = tslib_1.__asyncValues(schema_utils_1.default.getDynamicSchemaData(schema, dynamicCode)), _d; _d = await _c.next(), !_d.done;) {
                            const row = _d.value;
                            if (row.length > 0) {
                                stream.write(`${JSON.stringify(row)}\r\n`);
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_d && !_d.done && (_a = _c.return)) await _a.call(_c);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    schemas.add(schema.name);
                }
                catch (err) {
                    this.ux.log(`FAILED: ${err.message}.`);
                }
            }
            stream.end();
            try {
                const reportPath = (path.resolve(this.flags.report || Dictionary.defaultReportPath)).replace(/\{ORG\}/, orgAlias);
                this.ux.log(`Writing Report: ${reportPath}`);
                const sheetData = [this.getColumnRow()];
                try {
                    for (var _e = tslib_1.__asyncValues(utils_1.default.readFileLines(sheetDataFile)), _f; _f = await _e.next(), !_f.done;) {
                        const line = _f.value;
                        sheetData.push(JSON.parse(line));
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) await _b.call(_e);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                const workbookMap = new Map();
                workbookMap.set('Data Dictionary', sheetData);
                office_1.Office.writeXlxsWorkbook(workbookMap, reportPath);
            }
            catch (err) {
                this.ux.log('Error Writing XLSX Report: ' + err.message);
                throw err;
            }
            this.ux.log('Done.');
            // Clean up file at end
            await utils_1.default.deleteFile(sheetDataFile);
        }
        catch (err) {
            throw err;
        }
    }
    getColumnRow() {
        const row = [];
        for (const outputDef of this.options.outputDefs) {
            row.push(outputDef.split('|')[0]);
        }
        return row;
    }
    async getSortedTypeNames(orgAlias) {
        let typeNames = null;
        if (this.options.includeCustomObjectNames && this.options.includeCustomObjectNames.length > 0) {
            this.ux.log('Gathering CustomObject names from options');
            typeNames = new Set(this.options.includeCustomObjectNames);
        }
        else {
            // Are we including namespaces?
            const namespaces = this.flags.namespaces
                ? new Set(this.flags.namespaces.split())
                : new Set();
            this.ux.log(`Gathering CustomObject names from Org: ${orgAlias}(${this.org.getOrgId()})`);
            const objectMap = await sfdx_tasks_1.SfdxTasks.listMetadatas(orgAlias, ['CustomObject'], namespaces);
            typeNames = new Set(objectMap.get('CustomObject'));
        }
        if (this.options.excludeCustomObjectNames) {
            this.options.excludeCustomObjectNames.forEach(item => typeNames.delete(item));
        }
        return utils_1.default.sortArray(Array.from(typeNames));
    }
}
exports.default = Dictionary;
Dictionary.description = command_base_1.CommandBase.messages.getMessage('schema.dictionary.commandDescription');
Dictionary.defaultReportPath = 'DataDictionary-{ORG}.xlsx';
Dictionary.examples = [
    `$ sfdx acumen:schema:dictionary -u myOrgAlias
    Generates a ${Dictionary.defaultReportPath.replace(/\{ORG\}/, 'myOrgAlias')} file from an Org's configured Object & Field metadata.`
];
Dictionary.flagsConfig = {
    report: command_1.flags.string({
        char: 'r',
        description: command_base_1.CommandBase.messages.getMessage('schema.dictionary.reportFlagDescription', [Dictionary.defaultReportPath])
    }),
    namespaces: command_1.flags.string({
        char: 'n',
        description: command_base_1.CommandBase.messages.getMessage('namespacesFlagDescription')
    }),
    options: command_1.flags.string({
        char: 'o',
        description: command_base_1.CommandBase.messages.getMessage('schema.dictionary.optionsFlagDescription')
    })
};
// Comment this out if your command does not require an org username
Dictionary.requiresUsername = true;
//# sourceMappingURL=dictionary.js.map