"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../../lib/command-base");
const utils_1 = require("../../../../lib/utils");
const profile_download_1 = require("../../../../lib/profile-download");
const sfdx_project_1 = require("../../../../lib/sfdx-project");
class ProfileRetrieve extends command_base_1.CommandBase {
    async runInternal() {
        const profileList = this.flags.names;
        const packageDir = (await sfdx_project_1.default.default()).getDefaultDirectory();
        if (!(await utils_1.default.pathExists(packageDir))) {
            this.raiseError('No default folder found in sfdx-project.json file');
        }
        const orgAllProfilesMap = await profile_download_1.ProfileDownload.checkOrgProfiles(this.orgAlias);
        const orgAllProfiles = [...orgAllProfilesMap.keys()];
        if (profileList.length > 5) {
            this.raiseError('Only 5 Profiles can be retrieved at once');
        }
        const notAvailableProfiles = [];
        for (const profile of profileList) {
            if (!orgAllProfiles.includes(profile)) {
                notAvailableProfiles.push(profile);
            }
        }
        if (notAvailableProfiles.length > 0) {
            this.raiseError(`Profiles not found in Org: ${notAvailableProfiles.join(',')}`);
        }
        this.ux.log('Retrieving Profiles...');
        const profileDownloader = new profile_download_1.ProfileDownload(this.connection, this.orgAlias, profileList, orgAllProfilesMap, path.join(process.cwd()), this.ux);
        // Profile Directory Path
        const profileDirPath = path.join(process.cwd(), packageDir, 'main', 'default', 'profiles');
        const profileByPath = new Map();
        for (const profileName of profileList) {
            const filePath = profileName + '.profile-meta.xml';
            await utils_1.default.mkDirPath(path.join(profileDirPath, filePath), true);
            profileByPath.set(profileName, path.join(profileDirPath, filePath));
        }
        const profiles = await profileDownloader.downloadPermissions();
        // Write files to XML
        for (const profileName of profiles.keys()) {
            const profileContent = await utils_1.default.readFile(profiles.get(profileName));
            const profileJson = JSON.parse(profileContent);
            this.ux.log(`Writing "${profileName}" profile to folder...`);
            await profile_download_1.ProfileDownload.writeProfileToXML(profileJson, profileByPath.get(profileName));
        }
        this.ux.log(`Done. Profiles stored in folder-> ${profileDirPath}`);
        await utils_1.default.deleteDirectory(path.join(process.cwd(), utils_1.default.TempFilesPath));
    }
}
ProfileRetrieve.description = command_base_1.CommandBase.messages.getMessage('schema.profile.retrieve.commandDescription');
ProfileRetrieve.examples = [
    `
    $ sfdx acu-pack:schema:profile:retrieve -u myOrgAlias -n "Admin,Support"
    Retrieves 5 profiles at a time. Default Path - force-app/main/default/profile `,
];
ProfileRetrieve.flagsConfig = {
    names: command_1.flags.array({
        char: 'n',
        description: command_base_1.CommandBase.messages.getMessage('schema.profile.retrieve.names'),
        required: true,
        map: (n) => n.trim(),
    }),
};
// Comment this out if your command does not require an org username
ProfileRetrieve.requiresUsername = true;
// Set this to true if your command requires a project workspace; 'requiresProject' is false by default
ProfileRetrieve.requiresProject = true;
exports.default = ProfileRetrieve;
//# sourceMappingURL=retrieve.js.map