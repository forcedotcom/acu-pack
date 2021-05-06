import { flags } from '@salesforce/command';
import { CommandBase } from '../../../lib/command-base';
import { SfdxClient, ApiKind } from '../../../lib/sfdx-client';
import Utils from '../../../lib/utils';

export default class Unmask extends CommandBase {
  public static description = CommandBase.messages.getMessage('api.get.commandDescription');

  public static examples = [
    `$ sfdx acumen:api:get -u myOrgAlias -m Account -i 068r0000003slVtAAI
    Performs the GET REST API action against the Account metadata type with an id of 068r0000003slVtAAI and writes the body to 068r0000003slVtAAI.json.`,
    `$ sfdx acumen:api:get -u myOrgAlias -t true -m Account -i 068r0000003slVtAAI -o ./output/files/{Id}.json
    Performs the GET REST API action against the Account metadata type with an id of 068r0000003slVtAAI and writes the body to ./output/files/068r0000003slVtAAI.json.`,
    `$ sfdx acumen:api:get -u myOrgAlias -m ContentVersion.VersionData -i 068r0000003slVtAAI -o ./output/files/{Id}.pdf
    Performs the GET REST API action against the ContentVersion metadata type with an id of 068r0000003slVtAAI and writes the VersionData field value body to 068r0000003slVtAAI.pdf.
    NOTE: Not all metadata types support field data access.`
  ];

  protected static flagsConfig = {
    metadata: flags.string({
      char: 'm',
      description: CommandBase.messages.getMessage('api.get.metadataFlagDescription'),
      required: true
    }),
    ids: flags.string({
      char: 'i',
      description: CommandBase.messages.getMessage('api.get.idsFlagDescription'),
      required: true
    }),
    output: flags.string({
      char: 'o',
      description: CommandBase.messages.getMessage('api.get.outputFoldersFlagDescription')
    }),
    tooling: flags.boolean({
      char: 't',
      description: CommandBase.messages.getMessage('api.get.toolingAPIFlagDescription')
    })
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<void> {
    const orgAlias = this.flags.targetusername;
    const orgId = this.org.getOrgId();

    try {
      this.ux.log(`Connecting to Org: ${orgAlias}(${orgId})`);

      const apiKind = this.flags.tooling ? ApiKind.TOOLING : ApiKind.DEFAULT;

      const sfdxClient = new SfdxClient(orgAlias);

      const ids = this.flags.ids.split(',');
      for await (const response of sfdxClient.getByIds(this.flags.metadata, ids, apiKind)) {
        const outFilePath = this.flags.output || '{Id}.json';
        const content = response.getContent();
        if (response.isBinary) {
          await Utils.writeFile(outFilePath.replace('{Id}', response.id), content);
        } else {
          await Utils.writeFile(outFilePath.replace('{Id}', response.id), JSON.stringify(content));
        }
      }
    } catch (err) {
      process.exitCode = 1;
      throw err;
    } finally {
      this.ux.log('Done.');
    }
  }
}
