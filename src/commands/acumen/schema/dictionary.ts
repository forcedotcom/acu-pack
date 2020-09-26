import { CommandBase } from '../../../lib/command-base';
import { flags } from '@salesforce/command';
import { SfdxTasks } from '../../../lib/sfdx-tasks';
import { SfdxCore } from '../../../lib/sfdx-core';
import { promises as fs } from 'fs';
import { Office } from '../../../lib/office';
import Utils from '../../../lib/utils';
import * as vm from 'vm';
import { DictionaryOptions } from '../../../lib/dictionary-options';
import path = require('path');

export default class Dictionary extends CommandBase {
  public static description = CommandBase.messages.getMessage('schema.dictionary.commandDescription');

  public static args = [{ name: 'file' }];

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

  protected options: DictionaryOptions;

  public async run(): Promise<void> {
    // Are we including namespaces?
    const namespaces = this.flags.namespaces
      ? new Set<string>(this.flags.namespaces.split())
      : new Set<string>();

    // Read/Write the options file if it does not exist already
    if (this.flags.options) {
      this.options = await this.getOptions(this.flags.options);
    } else {
      this.options = new DictionaryOptions();
      this.options.loadDefaults();
    }

    try {
      const username = this.flags.targetusername;
      const orgId = this.org.getOrgId();

      // Add columns
      const sheetData = [this.getColumnRow()];

      const objectMap = await SfdxTasks.listMetadatas(username, new Set<string>(['CustomObject']), namespaces);

      this.ux.log(`Gathering CustomObject schemas from Org: ${username}(${orgId})`);

      let counter = 0;
      const sortedTypeNames = Utils.sortArray(objectMap.get('CustomObject'));
      for (const metaDataType of sortedTypeNames) {
        this.ux.log(`Gathering (${++counter}/${sortedTypeNames.length}) ${metaDataType} schema...`);
        try {
          const schema = await SfdxTasks.describeObject(username, metaDataType);
          for await (const row of this.getSheetRowDynamic(schema)) {
            if (row.length > 0) {
              sheetData.push(row);
            }
          }
        } catch (err) {
          this.ux.log(`FAILED: ${err.message}.`);
        }
      }

      try {
        const reportPath = (path.resolve(this.flags.report || Dictionary.defaultReportPath)).replace(/\{ORG\}/, username);
        this.ux.log(`Writing Report: ${reportPath}`);

        const workbookMap = new Map<string, string[][]>();
        workbookMap.set('Data Dictionary', sheetData);
        Office.writeXlxsWorkbook(workbookMap, reportPath);
      } catch (err) {
        this.ux.log('Error Writing XLSX Report: ' + err.message);
        throw err;
      }

      this.ux.log('Done.');
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

  private * getSheetRowDynamic(schema: any): Generator<any, void, string[]> {

    for (const field of schema.fields) {
      const context = {
        schema,
        field,
        getPicklistValues(fld: any): string[] {
          const values = [];
          for (const picklistValue of fld.picklistValues) {
            // Show inactive values
            values.push(`${picklistValue.active ? '' : '(-)'}${picklistValue.value}`);
          }
          return values;
        },

        getPicklistDefaultValue(fld: any): string {
          for (const picklistValue of fld.picklistValues) {
            if (picklistValue.active && picklistValue.defaultValue) {
              return picklistValue.value;
            }
          }
        }
      };
      const dynamicCode = this.generateDynamicCode();
      const row = vm.runInNewContext(dynamicCode, context);
      yield row;
    }
  }

  private generateDynamicCode(): string {
    let code = 'main(); function main() { const row=[];';

    if (this.options.excludeFieldIfTrueFilter) {
      code += `if( ${this.options.excludeFieldIfTrueFilter} ) { return row; } `;
    }
    for (const outputDef of this.options.outputDefs) {
      code += `row.push(${outputDef.split('|')[1]});`;
    }
    code += 'return row; }';

    return code;
  }

  private async getOptions(optionsPath: string): Promise<DictionaryOptions> {
    if (await Utils.pathExistsAsync(optionsPath)) {
      return await SfdxCore.fileToJson<DictionaryOptions>(optionsPath);
    }

    const options = new DictionaryOptions();
    // load the default values
    options.loadDefaults();
    const dir = path.dirname(optionsPath);
    if (dir) {
      await fs.mkdir(dir, { recursive: true });
    }
    await SfdxCore.jsonToFile(options, optionsPath);
    return options;
  }
}
