import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
import xmlMerge from '../../../lib/xml-merge';

export default class Merge extends CommandBase {

  public static description = CommandBase.messages.getMessage('package.merge.commandDescription');

  public static examples = [`$ sfdx acumen:package:merge -s manifest/package.xml -d manifest/package-sprint17.xml
    Merges package.xml into package-sprint17.xml`];

  protected static flagsConfig = {
    source: flags.filepath({
      char: 's',
      required: true,
      description: CommandBase.messages.getMessage('package.merge.sourceFlagDescription')
    }),
    destination: flags.filepath({
      char: 'd',
      required: true,
      description: CommandBase.messages.getMessage('package.merge.destinationFlagDescription')
    })
  };

  public async run(): Promise<void> {
    await xmlMerge.mergeXmlFiles(
      this.flags.source,
      this.flags.destination,
      this.ux);
  }
}
