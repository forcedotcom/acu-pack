import { CommandBase } from '../../../../lib/command-base';
import { flags } from '@salesforce/command';
import { SfdxError } from '@salesforce/core';
import path = require('path');
import Utils from '../../../../lib/utils';
import { ProfileDownload } from '../../../../lib/profile-download';
import SfdxProject from '../../../../lib/sfdx-project';

export default class ProfileRetrieve extends CommandBase {
  public static description = CommandBase.messages.getMessage(
    'schema.profile.retrieve.commandDescription'
  );

  public static examples = [`
    $ sfdx acumen:schema:profile:retrieve -u myOrgAlias -n "Admin,Support"
    Retrieves 5 profiles at a time. Default Path - force-app/main/default/profile `
  ];

  protected static flagsConfig = {
    names: flags.array({
      char: 'n',
      description: CommandBase.messages.getMessage('schema.profile.retrieve.names'),
      required: true,
      map: (n: string) => n.trim()
    })
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = true;

  public async run(): Promise<void> {

    const orgAlias = this.flags.targetusername;

    let packageDir: string;
    const profileList: string[] = this.flags.names;

    packageDir = (await SfdxProject.default()).getDefaultDirectory();
    if (!(await Utils.pathExists(packageDir))) {
      throw new SfdxError('No default folder found in sfdx-project.json file');
    }

    const orgAllProfilesMap = await ProfileDownload.checkOrgProfiles(orgAlias);

    const orgAllProfiles = [...orgAllProfilesMap.keys()];

    if (profileList.length > 5) {
      throw new SfdxError('Only 5 Profiles can be retrieved at once');
    }

    const notAvailableProfiles = [];
    for (const profile of profileList) {
      if (!orgAllProfiles.includes(profile)) {
        notAvailableProfiles.push(profile);
      }
    }
    if (notAvailableProfiles.length > 0) {
      throw new SfdxError(`Profiles not found in Org: ${notAvailableProfiles}`);
    }

    this.ux.log('Retrieving Profiles...');
    const profileDownloader = new ProfileDownload(orgAlias, profileList, orgAllProfilesMap, path.join(process.cwd()), this.ux);

    // Profile Directory Path
    const profileDirPath = path.join(process.cwd(), packageDir, 'main', 'default', 'profiles');

    const profileByPath: Map<string, string> = new Map<string, string>();

    for (const profileName of profileList) {
      const filePath = profileName + '.profile-meta.xml';
      await Utils.mkDirPath(path.join(profileDirPath, filePath), true);
      profileByPath.set(profileName, path.join(profileDirPath, filePath));
    }

    const profiles = await profileDownloader.downloadPermissions();

    // Write files to XML
    for (const profileName of profiles.keys()) {
      const profileContent = await Utils.readFile(profiles.get(profileName));
      const profileJson = JSON.parse(profileContent);
      this.ux.log(`Writing "${profileName}" profile to folder...`);
      await ProfileDownload.writeProfileToXML(profileJson, profileByPath.get(profileName));
    }

    this.ux.log(`Done. Profiles stored in folder-> ${profileDirPath}`);
    await Utils.deleteDirectory(path.join(process.cwd(), Utils._tempFilesPath));
  }
}

