import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
import xmlMerge from '../../../lib/xml-merge';

export default class Merge extends CommandBase {
  public static description = CommandBase.messages.getMessage('package.merge.commandDescription');

  public static examples = [
    `$ sfdx acu-pack:package:merge -s manifest/package.xml -d manifest/package-sprint17.xml
    Merges package.xml into package-sprint17.xml`,
    `$ sfdx acu-pack:package:merge -s manifest/package-a.xml -d manifest/package-b.xml -c
    Compares package-a.xml to package-b.xml and removes common elements from BOTH packages - leaving only the differences.`,
  ];

  protected static flagsConfig = {
    source: flags.filepath({
      char: 's',
      required: true,
      description: CommandBase.messages.getMessage('package.merge.sourceFlagDescription'),
    }),
    destination: flags.filepath({
      char: 'd',
      required: true,
      description: CommandBase.messages.getMessage('package.merge.destinationFlagDescription'),
    }),
    compare: flags.boolean({
      char: 'c',
      description: CommandBase.messages.getMessage('package.merge.isPackageCompareFlagDescription'),
    }),
  };

  protected async runInternal(): Promise<void> {
    await xmlMerge.mergeXmlFiles(this.flags.source, this.flags.destination, this.flags.compare, this.ux);
  }
}
