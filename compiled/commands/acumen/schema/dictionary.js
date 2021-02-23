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
        var e_1, _a, e_2, _b, e_3, _c, e_4, _d, e_5, _e, e_6, _f;
        // Read/Write the options file if it does not exist already
        this.options = await options_factory_1.OptionsFactory.get(schema_options_1.default, this.flags.options);
        const dynamicCode = this.options.getDynamicCode();
        const dynamicRecordTypeCode = this.options.getDynamicRecordTypeCode();
        const dynamicChildObjectTypeCode = this.options.getDynamicChildObjectTypeCode();
        try {
            const orgAlias = this.flags.targetusername;
            const fieldDataSheet = `schema-${orgAlias}.tmp`;
            const childObjectDataSheet = `childObject-${orgAlias}.tmp`;
            const recordTypeDataSheet = `recordType-${orgAlias}.tmp`;
            const sortedTypeNames = await this.getSortedTypeNames(orgAlias);
            // Create for writing - truncates if exists
            const fieldStream = fs_1.createWriteStream(fieldDataSheet, { flags: 'w' });
            const childObjectStream = fs_1.createWriteStream(childObjectDataSheet, { flags: 'w' });
            const recordTypeStream = fs_1.createWriteStream(recordTypeDataSheet, { flags: 'w' });
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
                        for (var _g = tslib_1.__asyncValues(schema_utils_1.default.getDynamicSchemaData(schema, dynamicCode)), _h; _h = await _g.next(), !_h.done;) {
                            const row = _h.value;
                            if (row.length > 0) {
                                fieldStream.write(`${JSON.stringify(row)}\r\n`);
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_h && !_h.done && (_a = _g.return)) await _a.call(_g);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    try {
                        for (var _j = tslib_1.__asyncValues(schema_utils_1.default.getDynamicChildObjectTypeData(schema, dynamicChildObjectTypeCode)), _k; _k = await _j.next(), !_k.done;) {
                            const row = _k.value;
                            if (row.length === 4) {
                                childObjectStream.write(`${JSON.stringify(row)}\r\n`);
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_k && !_k.done && (_b = _j.return)) await _b.call(_j);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    const retrievedRecordTypes = [];
                    try {
                        for (var _l = tslib_1.__asyncValues(schema_utils_1.default.getDynamicRecordTypeData(schema, dynamicRecordTypeCode)), _m; _m = await _l.next(), !_m.done;) {
                            const row = _m.value;
                            if (row.length === 4) {
                                retrievedRecordTypes.push(row);
                            }
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (_m && !_m.done && (_c = _l.return)) await _c.call(_l);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                    if (retrievedRecordTypes.length > 1) {
                        for (const row of retrievedRecordTypes) {
                            recordTypeStream.write(`${JSON.stringify(row)}\r\n`);
                        }
                    }
                    schemas.add(schema.name);
                }
                catch (err) {
                    this.ux.log(`FAILED: ${err.message}.`);
                }
            }
            fieldStream.end();
            childObjectStream.end();
            recordTypeStream.end();
            try {
                const reportPath = (path.resolve(this.flags.report || Dictionary.defaultReportPath)).replace(/\{ORG\}/, orgAlias);
                this.ux.log(`Writing Report: ${reportPath}`);
                const headers = this.getColumnRow();
                const fieldSheet = [[...headers[0]]];
                const recordTypeSheet = [[...headers[1]]];
                const childObjectSheet = [[...headers[2]]];
                try {
                    for (var _o = tslib_1.__asyncValues(utils_1.default.readFileLines(fieldDataSheet)), _p; _p = await _o.next(), !_p.done;) {
                        const line = _p.value;
                        fieldSheet.push(JSON.parse(line));
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_p && !_p.done && (_d = _o.return)) await _d.call(_o);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                try {
                    for (var _q = tslib_1.__asyncValues(utils_1.default.readFileLines(childObjectDataSheet)), _r; _r = await _q.next(), !_r.done;) {
                        const line = _r.value;
                        childObjectSheet.push(JSON.parse(line));
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_r && !_r.done && (_e = _q.return)) await _e.call(_q);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                try {
                    for (var _s = tslib_1.__asyncValues(utils_1.default.readFileLines(recordTypeDataSheet)), _t; _t = await _s.next(), !_t.done;) {
                        const line = _t.value;
                        recordTypeSheet.push(JSON.parse(line));
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (_t && !_t.done && (_f = _s.return)) await _f.call(_s);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
                const workbookMap = new Map();
                workbookMap.set('Fields', fieldSheet);
                workbookMap.set('Record Types', recordTypeSheet);
                workbookMap.set('Child Objects', childObjectSheet);
                office_1.Office.writeXlxsWorkbook(workbookMap, reportPath);
            }
            catch (err) {
                this.ux.log('Error Writing XLSX Report: ' + err.message);
                throw err;
            }
            this.ux.log('Done.');
            // Clean up file at end
            await utils_1.default.deleteFile(fieldDataSheet);
            await utils_1.default.deleteFile(childObjectDataSheet);
            await utils_1.default.deleteFile(recordTypeDataSheet);
        }
        catch (err) {
            throw err;
        }
    }
    getColumnRow() {
        const fieldHeader = [];
        const childObjectHeader = [];
        const recordTypeHeader = [];
        let row = [];
        for (const outputDef of this.options.outputDefs[0]) {
            fieldHeader.push(outputDef.split('|')[0]);
        }
        for (const recordType of this.options.outputDefs[2]) {
            recordTypeHeader.push(recordType.split('|')[0]);
        }
        for (const childObject of this.options.outputDefs[1]) {
            childObjectHeader.push(childObject.split('|')[0]);
        }
        row = [fieldHeader, recordTypeHeader, childObjectHeader];
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