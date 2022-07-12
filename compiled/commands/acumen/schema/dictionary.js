"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const fs_1 = require("fs");
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../lib/command-base");
const sfdx_tasks_1 = require("../../../lib/sfdx-tasks");
const options_factory_1 = require("../../../lib/options-factory");
const office_1 = require("../../../lib/office");
const utils_1 = require("../../../lib/utils");
const schema_utils_1 = require("../../../lib/schema-utils");
const schema_options_1 = require("../../../lib/schema-options");
const sfdx_query_1 = require("../../../lib/sfdx-query");
class Dictionary extends command_base_1.CommandBase {
    async runInternal() {
        var e_1, _a, e_2, _b;
        // Read/Write the options file if it does not exist already
        this.options = await options_factory_1.OptionsFactory.get(schema_options_1.default, this.flags.options);
        const schemaTmpFile = `schema-${this.orgAlias}.tmp`;
        const sortedTypeNames = await this.getSortedTypeNames(this.orgAlias);
        // sortedTypeNames = ['Account', 'Case', 'Lead'];
        // Create for writing - truncates if exists
        const fileStream = (0, fs_1.createWriteStream)(schemaTmpFile, { flags: 'w' });
        let counter = 0;
        const schemas = new Set();
        for (const metaDataType of sortedTypeNames) {
            this.ux.log(`Gathering (${++counter}/${sortedTypeNames.length}) ${metaDataType} schema...`);
            try {
                const schema = await sfdx_tasks_1.SfdxTasks.describeObject(this.orgAlias, metaDataType);
                // Avoid duplicates (Account)
                if (schemas.has(schema.name)) {
                    continue;
                }
                for (const name of this.options.outputDefMap.keys()) {
                    fileStream.write(`*${name}\r\n`);
                    const collection = schema[name];
                    if (!collection) {
                        continue;
                    }
                    let nameFieldIndex = -1;
                    // Query for Entity & Field Definition
                    const entityDefinitionFields = this.options.getEntityDefinitionFields(name);
                    const outputDefs = this.options.outputDefMap.get(name);
                    if (entityDefinitionFields.length > 0) {
                        for (let index = 0; index < outputDefs.length; index++) {
                            const outputDef = outputDefs[index];
                            if (outputDef.includes(`|${schema_utils_1.default.CONTEXT_FIELD_NAME}`)) {
                                nameFieldIndex = index;
                                break;
                            }
                        }
                        if (nameFieldIndex === -1) {
                            throw new Error('No Name field found');
                        }
                    }
                    const fieldDefinitionMap = await this.entityDefinitionValues(metaDataType, entityDefinitionFields);
                    const dynamicCode = this.options.getDynamicCode(name);
                    try {
                        for (var _c = (e_1 = void 0, tslib_1.__asyncValues(schema_utils_1.default.getDynamicSchemaData(schema, dynamicCode, collection))), _d; _d = await _c.next(), !_d.done;) {
                            const row = _d.value;
                            if (row.length === 0) {
                                continue;
                            }
                            const nameFieldValue = row[nameFieldIndex];
                            const fieldDefinitionRecord = fieldDefinitionMap.get(nameFieldValue);
                            if (fieldDefinitionRecord != null) {
                                for (let index = 0; index < outputDefs.length; index++) {
                                    const outputDef = outputDefs[index];
                                    for (const entityDefinitionField of entityDefinitionFields) {
                                        if (outputDef.includes(`|${schema_utils_1.default.ENTITY_DEFINITION}.${entityDefinitionField}`)) {
                                            row[index] = fieldDefinitionRecord[entityDefinitionField];
                                        }
                                    }
                                }
                            }
                            fileStream.write(`${JSON.stringify(row)}\r\n`);
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
                schemas.add(schema.name);
            }
            catch (err) {
                this.ux.log(`FAILED: ${err.message}.`);
            }
        }
        fileStream.end();
        try {
            const reportPath = (path.resolve(this.flags.report || Dictionary.defaultReportPath)).replace(/\{ORG\}/, this.orgAlias);
            this.ux.log(`Writing Report: ${reportPath}`);
            const workbookMap = new Map();
            let sheetName = null;
            let sheet = null;
            try {
                for (var _e = tslib_1.__asyncValues(utils_1.default.readFileLines(schemaTmpFile)), _f; _f = await _e.next(), !_f.done;) {
                    const line = _f.value;
                    if (line.startsWith('*')) {
                        sheetName = line.substring(1);
                        const outputDefs = this.options.outputDefMap.get(sheetName);
                        const headers = this.getColumnRow(outputDefs);
                        sheet = workbookMap.get(sheetName);
                        if (!sheet) {
                            sheet = [[...headers]];
                            workbookMap.set(sheetName, sheet);
                        }
                        continue;
                    }
                    sheet.push(JSON.parse(line));
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) await _b.call(_e);
                }
                finally { if (e_2) throw e_2.error; }
            }
            office_1.Office.writeXlxsWorkbook(workbookMap, reportPath);
        }
        catch (err) {
            this.ux.log('Error Writing XLSX Report: ' + JSON.stringify(err.message));
            throw err;
        }
        // Clean up file at end
        await utils_1.default.deleteFile(schemaTmpFile);
        // Write options JSON incase there have been structure changes since it was last saved.
        if (this.flags.options) {
            await this.options.save(this.flags.options);
        }
    }
    getColumnRow(outputDefs) {
        const row = [];
        for (const outputDef of outputDefs) {
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
                : null;
            this.ux.log(`Gathering CustomObject names from Org: ${orgAlias}(${this.org.getOrgId()})`);
            const objectMap = await sfdx_tasks_1.SfdxTasks.listMetadatas(orgAlias, ['CustomObject'], namespaces);
            typeNames = new Set(objectMap.get('CustomObject'));
        }
        if (this.options.excludeCustomObjectNames) {
            this.options.excludeCustomObjectNames.forEach(item => typeNames.delete(item));
        }
        return utils_1.default.sortArray(Array.from(typeNames));
    }
    async entityDefinitionValues(sObjectName, fieldNames) {
        const valueMap = new Map();
        if (!sObjectName || !fieldNames || fieldNames.length === 0) {
            return valueMap;
        }
        let query = `SELECT QualifiedApiName,DurableID FROM EntityDefinition WHERE QualifiedApiName='${sObjectName}'`;
        let records = await sfdx_query_1.SfdxQuery.doSoqlQuery(this.orgAlias, query);
        const durableId = records[0].DurableId;
        query = `SELECT QualifiedApiName,${fieldNames.join(',')} FROM FieldDefinition where EntityDefinition.DurableID in ('${durableId}')`;
        records = await sfdx_query_1.SfdxQuery.doSoqlQuery(this.orgAlias, query);
        for (const record of records) {
            valueMap.set(record.QualifiedApiName, record);
        }
        return valueMap;
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