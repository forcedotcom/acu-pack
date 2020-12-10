import { CommandBase } from '../../../lib/command-base';
import { flags } from '@salesforce/command';
import { SfdxTasks } from '../../../lib/sfdx-tasks';
import { SfdxCore } from '../../../lib/sfdx-core';
import { promises as fs } from 'fs';
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

  private defaultOptions = {
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

  public async run(): Promise<void> {

    // Are we including namespaces?
    const namespaces = this.flags.namespaces
      ? new Set<string>(this.flags.namespaces.split())
      : new Set<string>();

    // Read/Write the options file if it does not exist already
    this.options = await this.getOptions(this.flags.options);

    const dynamicCode = this.options.getDynamicCode();

    try {
      const username = this.flags.targetusername;
      const orgId = this.org.getOrgId();

      const sheetDataFile = `schema-${username}.tmp`;

      // Create for writing - truncates if exists
      const stream = createWriteStream(sheetDataFile, { flags: 'w' });

      // Add columns
      const objectMap = await SfdxTasks.listMetadatas(username, new Set<string>(['CustomObject']), namespaces);

      this.ux.log(`Gathering CustomObject schemas from Org: ${username}(${orgId})`);

      const sortedTypeNames = Utils.sortArray(objectMap.get('CustomObject'));

      let counter = 0;
      const schemas = new Set<string>();
      for (const metaDataType of sortedTypeNames) {
        this.ux.log(`Gathering (${++counter}/${sortedTypeNames.length}) ${metaDataType} schema...`);
        try {
          const schema = await SfdxTasks.describeObject(username, metaDataType);
          // Avoid duplicates (Account)
          if (schemas.has(schema.name)) {
            continue;
          }
          for await (const row of SchemaUtils.getDynamicSchemaData(schema, dynamicCode)) {
            if (row.length > 0) {
              stream.write(`${JSON.stringify(row)}\r\n`);
            }
          }
          schemas.add(schema.name);
        } catch (err) {
          this.ux.log(`FAILED: ${err.message}.`);
        }
      }
      stream.end();

      try {
        const reportPath = (path.resolve(this.flags.report || Dictionary.defaultReportPath)).replace(/\{ORG\}/, username);
        this.ux.log(`Writing Report: ${reportPath}`);

        const sheetData = [this.getColumnRow()];
        for await (const line of Utils.readFileAsync(sheetDataFile)) {
          sheetData.push(JSON.parse(line));
        }

        const workbookMap = new Map<string, string[][]>();
        workbookMap.set('Data Dictionary', sheetData);

        Office.writeXlxsWorkbook(workbookMap, reportPath);
      } catch (err) {
        this.ux.log('Error Writing XLSX Report: ' + err.message);
        throw err;
      }

      this.ux.log('Done.');

      // Clean up file at end
      await Utils.deleteFileAsync(sheetDataFile);
    } catch (err) {
      throw err;
    }
  }

  private getColumnRow(): string[] {
    const row = [];
    for (const outputDef of this.options.outputDefs) {
      row.push(outputDef.split('|')[0]);
    }
    return row;
  }

  private async getOptions(optionsPath: string): Promise<SchemaOptions> {
    if (!optionsPath) {
      return new SchemaOptions(this.defaultOptions);
    }

    if (await Utils.pathExistsAsync(optionsPath)) {
      return new SchemaOptions(await SfdxCore.fileToJson<SchemaOptions>(optionsPath));
    }

    const options = new SchemaOptions(this.defaultOptions);

    // load the default values
    const dir = path.dirname(optionsPath);
    if (dir) {
      await fs.mkdir(dir, { recursive: true });
    }
    await SfdxCore.jsonToFile(options, optionsPath);
    return options;
  }
}
