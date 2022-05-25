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
import { SfdxQuery } from '../../../lib/sfdx-query';

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

    try {
      const schemaTmpFile = `schema-${this.orgAlias}.tmp`;

      const sortedTypeNames = await this.getSortedTypeNames(this.orgAlias);
      // sortedTypeNames = ['Account', 'Case', 'Lead'];

      // Create for writing - truncates if exists
      const fileStream = createWriteStream(schemaTmpFile, { flags: 'w' });

      let counter = 0;
      const schemas = new Set<string>();
      for (const metaDataType of sortedTypeNames) {
        this.ux.log(`Gathering (${++counter}/${sortedTypeNames.length}) ${metaDataType} schema...`);
        try {
          const schema = await SfdxTasks.describeObject(this.orgAlias, metaDataType);
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
                if (outputDef.includes(`|${SchemaUtils.CONTEXT_FIELD_NAME}`)) {
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
            for await (const row of SchemaUtils.getDynamicSchemaData(schema, dynamicCode, collection)) {
              if (row.length === 0) {
                continue;
              }
              const nameFieldValue = row[nameFieldIndex];
              const fieldDefinitionRecord = fieldDefinitionMap.get(nameFieldValue);
              if (fieldDefinitionRecord != null) {
                for (let index = 0; index < outputDefs.length; index++) {
                  const outputDef = outputDefs[index];
                  for (const entityDefinitionField of entityDefinitionFields) {
                    if (outputDef.includes(`|${SchemaUtils.ENTITY_DEFINITION}.${entityDefinitionField}`)) {
                      row[index] = fieldDefinitionRecord[entityDefinitionField];
                    }
                  }
                }
              }
              fileStream.write(`${JSON.stringify(row)}\r\n`);
            }
          }
          schemas.add(schema.name);
        } catch (err) {
          this.ux.log(`FAILED: ${err.message}.`);
        }
      }

      fileStream.end();

      try {
        const reportPath = (path.resolve(this.flags.report || Dictionary.defaultReportPath)).replace(/\{ORG\}/, this.orgAlias);
        this.ux.log(`Writing Report: ${reportPath}`);

        const workbookMap = new Map<string, string[][]>();
        let sheetName: string = null;
        let sheet: string[][] = null;
        for await (const line of Utils.readFileLines(schemaTmpFile)) {
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
        Office.writeXlxsWorkbook(workbookMap, reportPath);

      } catch (err) {
        this.ux.log('Error Writing XLSX Report: ' + err.message);
        throw err;
      }

      this.ux.log('Done.');

      // Clean up file at end
      await Utils.deleteFile(schemaTmpFile);
    } catch (err) {
      throw err;
    }
    // Write options JSON incase there have been structure changes since it was last saved.
    if (this.flags.options) {
      await this.options.save(this.flags.options);
    }
  }

  private getColumnRow(outputDefs: string[]): string[] {
    const row = [];
    for (const outputDef of outputDefs) {
      row.push(outputDef.split('|')[0]);
    }
    return row;
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

  private async entityDefinitionValues(sObjectName: string, fieldNames: string[]): Promise<Map<string, any>> {
    const valueMap = new Map<string, any>();
    if (!sObjectName || !fieldNames || fieldNames.length === 0) {
      return valueMap;
    }

    let query = `SELECT QualifiedApiName,DurableID FROM EntityDefinition WHERE QualifiedApiName='${sObjectName}'`;
    let records = await SfdxQuery.doSoqlQuery(this.orgAlias, query);
    const durableId = records[0].DurableId;

    query = `SELECT QualifiedApiName,${fieldNames.join(',')} FROM FieldDefinition where EntityDefinition.DurableID in ('${durableId}')`;
    records = await SfdxQuery.doSoqlQuery(this.orgAlias, query);

    for (const record of records) {
      valueMap.set(record.QualifiedApiName, record);
    }
    return valueMap;
  }
}
