import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
import Utils from '../../../lib/utils';
import { OptionsFactory } from '../../../lib/options-factory';
import { XPathOptions } from '../../../lib/xpath-options';

export default class XPath extends CommandBase {

  public static description = CommandBase.messages.getMessage('source.xpath.commandDescription');
  public static defaultOptionsFileName = 'xpath-options.json';
  public static examples = [
    `$ sfdx acumen:source:xpath -o ./xpathOptions.json"
    Validates the project source from the x-path rules specified in '${XPath.defaultOptionsFileName}'`
  ];

  protected static flagsConfig = {
    options: flags.string({
      char: 'o',
      description: CommandBase.messages.getMessage('source.xpath.optionsFlagDescription')
    })
  };

  protected async runInternal(): Promise<void> {
    // Read/Write the options file if it does not exist already
    const options = await OptionsFactory.get(XPathOptions, this.flags.options ?? XPath.defaultOptionsFileName);

    for (const [sourceFolder, rules] of options.rules) {
      if (!sourceFolder) {
        continue;
      }
      for await (const filePath of Utils.getFiles(sourceFolder)) {
        this.ux.log(`Processing file: '${filePath}`);
        let xml = null;
        for await (const line of Utils.readFileLines(filePath)) {
          xml += line;
        }
        const xPaths = [];
        for (const rule of rules) {
          xPaths.push(rule.xPath);
        }
        for (const [xPath, values] of Utils.selectXPath(xml, xPaths)) {
          for (const rule of rules) {
            if (rule.xPath === xPath) {
              for (const ruleValue of rule.values) {
                for (const xmlValue of values) {
                  if (ruleValue.trim() === xmlValue.trim()) {
                    // Set the proper exit code to indicate violation/failure
                    this.gotError = true;

                    this.ux.log(`${rule.name} - Violation!`);
                    this.ux.log(`\txpath: ${xPath}`);
                    this.ux.log(`\tvalue: ${xmlValue}`);
                  }
                }
              }
            }
          }
        }
      }
    }
    
    return;
  }
}
