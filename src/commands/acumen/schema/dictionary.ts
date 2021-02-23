import { CommandBase } from '../../../lib/command-base';
import { flags } from '@salesforce/command';
import { SfdxTasks } from '../../../lib/sfdx-tasks';
import { OptionsFactory } from '../../../lib/options-factory';
import { createWriteStream } from 'fs';
import { Office } from '../../../lib/office';
import Utils from '../../../lib/utils';
import SchemaUtils from '../../../lib/schema-utils';
import SchemaOptions from '../../../lib/schema-options';
import path = require('path');

export default class Dictionary extends CommandBase {
  public static description = CommandBase.messages.getMessage('schema.dictionary.commandDescription');

  public static defaultReportPath = 'DataDictionary-{ORG}.xlsx';

  public static examples = [
    `$ sfdx acumen:schema:dictionary -u myOrgAlias
    Generates a ${Dictionary.defaultReportPath.replace(/\{ORG\}/, 'myOrgAlias')} file from an Org's configured Object & Field metadata.`];

  protected static flagsConfig = {
    report: flags.string({
      char: 'r',
      description: CommandBase.messages.getMessage('schema.dictionary.reportFlagDescription', [Dictionary.defaultReportPath])
    }),
    namespaces: flags.string({
      char: 'n',
      description: CommandBase.messages.getMessage('namespacesFlagDescription')
    }),
    options: flags.string({
      char: 'o',
      description: CommandBase.messages.getMessage('schema.dictionary.optionsFlagDescription')
    })
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  protected options: SchemaOptions;

  public async run(): Promise<void> {
    // Read/Write the options file if it does not exist already
    this.options = await OptionsFactory.get(SchemaOptions, this.flags.options);

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
      const fieldStream = createWriteStream(fieldDataSheet, { flags: 'w' });
      const childObjectStream = createWriteStream(childObjectDataSheet, { flags: 'w' });
      const recordTypeStream = createWriteStream(recordTypeDataSheet, { flags: 'w' });

      let counter = 0;
      const schemas = new Set<string>();
      for (const metaDataType of sortedTypeNames) {
        this.ux.log(`Gathering (${++counter}/${sortedTypeNames.length}) ${metaDataType} schema...`);
        try {
          const schema = await SfdxTasks.describeObject(orgAlias, metaDataType);
          // Avoid duplicates (Account)
          if (schemas.has(schema.name)) {
            continue;
          }
          for await (const row of SchemaUtils.getDynamicSchemaData(schema, dynamicCode)) {
            if (row.length > 0) {
              fieldStream.write(`${JSON.stringify(row)}\r\n`);
            }
          }

          for await (const row of SchemaUtils.getDynamicChildObjectTypeData(schema, dynamicChildObjectTypeCode)) {
            if (row.length === 4) {
              childObjectStream.write(`${JSON.stringify(row)}\r\n`);
            }
          }
          const retrievedRecordTypes = [];
          for await (const row of SchemaUtils.getDynamicRecordTypeData(schema, dynamicRecordTypeCode)) {
            if (row.length === 4) {
              retrievedRecordTypes.push(row);
            }
          }
          if (retrievedRecordTypes.length > 1) {
            for (const row of retrievedRecordTypes) {
                recordTypeStream.write(`${JSON.stringify(row)}\r\n`);

            }
          }

          schemas.add(schema.name);
        } catch (err) {
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
        for await (const line of Utils.readFileLines(fieldDataSheet)) {
          fieldSheet.push(JSON.parse(line));
        }
        for await (const line of Utils.readFileLines(childObjectDataSheet)) {
          childObjectSheet.push(JSON.parse(line));
        }
        for await (const line of Utils.readFileLines(recordTypeDataSheet)) {
          recordTypeSheet.push(JSON.parse(line));
        }

        const workbookMap = new Map<string, string[][]>();

        workbookMap.set('Fields', fieldSheet );
        workbookMap.set('Record Types', recordTypeSheet);
        workbookMap.set('Child Objects', childObjectSheet);

        Office.writeXlxsWorkbook(workbookMap, reportPath);
      } catch (err) {
        this.ux.log('Error Writing XLSX Report: ' + err.message);
        throw err;
      }

      this.ux.log('Done.');

      // Clean up file at end
      await Utils.deleteFile(fieldDataSheet);
      await Utils.deleteFile(childObjectDataSheet);
      await Utils.deleteFile(recordTypeDataSheet);
    } catch (err) {
      throw err;
    }
  }

  private getColumnRow(): string[][] {
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
    return row ;
  }

  private async getSortedTypeNames(orgAlias: string): Promise<string[]> {
    let typeNames: Set<string> = null;
    if (this.options.includeCustomObjectNames && this.options.includeCustomObjectNames.length > 0) {
      this.ux.log('Gathering CustomObject names from options');
      typeNames = new Set<string>(this.options.includeCustomObjectNames);
    } else {
      // Are we including namespaces?
      const namespaces = this.flags.namespaces
        ? new Set<string>(this.flags.namespaces.split())
        : new Set<string>();

      this.ux.log(`Gathering CustomObject names from Org: ${orgAlias}(${this.org.getOrgId()})`);
      const objectMap = await SfdxTasks.listMetadatas(orgAlias, ['CustomObject'], namespaces);
      typeNames = new Set<string>(objectMap.get('CustomObject'));
    }

    if (this.options.excludeCustomObjectNames) {
      this.options.excludeCustomObjectNames.forEach(item => typeNames.delete(item));
    }
    return Utils.sortArray(Array.from(typeNames));
  }
}
