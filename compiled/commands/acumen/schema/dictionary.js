"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_base_1 = require("../../../lib/command-base");
const command_1 = require("@salesforce/command");
const sfdx_tasks_1 = require("../../../lib/sfdx-tasks");
const sfdx_core_1 = require("../../../lib/sfdx-core");
const fs_1 = require("fs");
const fs_2 = require("fs");
const office_1 = require("../../../lib/office");
const utils_1 = require("../../../lib/utils");
const schema_utils_1 = require("../../../lib/schema-utils");
const schema_options_1 = require("../../../lib/schema-options");
const path = require("path");
class Dictionary extends command_base_1.CommandBase {
    constructor() {
        super(...arguments);
        this.defaultOptions = {
            outputDefs: [
                'SObjectName|schema.name',
                'Name|field.name',
                'Label|field.label',
                'Datatype|field.type',
                'Length|field.length',
                'Precision|field.precision',
                'Scale|field.scale',
                'Digits|field.digits',
                'IsCustom|field.custom',
                'IsDeprecatedHidden|field.deprecatedAndHidden',
                'IsAutonumber|field.autoNumber',
                'DefaultValue|field.defaultValue',
                'IsFormula|field.calculated',
                'Formula|field.calculatedFormula',
                'IsRequired|!field.nillable',
                'IsExternalId|field.externalId',
                'IsUnique|field.unique',
                'IsCaseSensitive|field.caseSensitive',
                'IsPicklist|field.picklistValues.length>0',
                'IsPicklistDependent|field.dependentPicklist',
                "PicklistValues|getPicklistValues(field).join(',')",
                'PicklistValueDefault|getPicklistDefaultValue(field)',
                'IsLookup|field.referenceTo.length>0',
                "LookupTo|field.referenceTo.join(',')",
                'IsCreateable|field.createable',
                'IsUpdateable|field.updateable',
                'IsEncrypted|field.encrypted',
                'HelpText|field.inlineHelpText'
            ],
            excludeFieldIfTrueFilter: ''
        };
    }
    async run() {
        var e_1, _a, e_2, _b;
        // Are we including namespaces?
        const namespaces = this.flags.namespaces
            ? new Set(this.flags.namespaces.split())
            : new Set();
        // Read/Write the options file if it does not exist already
        this.options = await this.getOptions(this.flags.options);
        const dynamicCode = this.options.getDynamicCode();
        try {
            const username = this.flags.targetusername;
            const orgId = this.org.getOrgId();
            const sheetDataFile = `schema-${username}.tmp`;
            // Create for writing - truncates if exists
            const stream = fs_2.createWriteStream(sheetDataFile, { flags: 'w' });
            // Add columns
            const objectMap = await sfdx_tasks_1.SfdxTasks.listMetadatas(username, new Set(['CustomObject']), namespaces);
            this.ux.log(`Gathering CustomObject schemas from Org: ${username}(${orgId})`);
            const sortedTypeNames = utils_1.default.sortArray(objectMap.get('CustomObject'));
            let counter = 0;
            for (const metaDataType of sortedTypeNames) {
                this.ux.log(`Gathering (${++counter}/${sortedTypeNames.length}) ${metaDataType} schema...`);
                try {
                    const schema = await sfdx_tasks_1.SfdxTasks.describeObject(username, metaDataType);
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
                }
                catch (err) {
                    this.ux.log(`FAILED: ${err.message}.`);
                }
            }
            stream.end();
            try {
                const reportPath = (path.resolve(this.flags.report || Dictionary.defaultReportPath)).replace(/\{ORG\}/, username);
                this.ux.log(`Writing Report: ${reportPath}`);
                const sheetData = [this.getColumnRow()];
                try {
                    for (var _e = tslib_1.__asyncValues(utils_1.default.readFileAsync(sheetDataFile)), _f; _f = await _e.next(), !_f.done;) {
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
            await utils_1.default.deleteFileAsync(sheetDataFile);
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
    async getOptions(optionsPath) {
        if (!optionsPath) {
            return new schema_options_1.default(this.defaultOptions);
        }
        if (await utils_1.default.pathExistsAsync(optionsPath)) {
            return new schema_options_1.default(await sfdx_core_1.SfdxCore.fileToJson(optionsPath));
        }
        const options = new schema_options_1.default(this.defaultOptions);
        // load the default values
        const dir = path.dirname(optionsPath);
        if (dir) {
            await fs_1.promises.mkdir(dir, { recursive: true });
        }
        await sfdx_core_1.SfdxCore.jsonToFile(options, optionsPath);
        return options;
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