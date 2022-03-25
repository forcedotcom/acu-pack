"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@salesforce/command");
const command_base_1 = require("../../../../lib/command-base");
const delta_command_1 = require("../../../../lib/delta-command");
const utils_1 = require("../../../../lib/utils");
const delta_provider_1 = require("../../../../lib/delta-provider");
const path = require("path");
class Git extends command_base_1.CommandBase {
    constructor() {
        super(...arguments);
        this.name = 'git';
        this.deltas = new Map();
    }
    async run() {
        const deltaOptions = new delta_provider_1.DeltaOptions();
        deltaOptions.deltaFilePath = this.flags.git;
        deltaOptions.source = this.flags.source;
        deltaOptions.destination = this.flags.destination;
        deltaOptions.forceFile = this.flags.force;
        deltaOptions.ignoreFile = this.flags.ignore;
        const gitProvider = new Git.gitDeltaProvider();
        return await gitProvider.run(deltaOptions);
    }
}
exports.default = Git;
Git.description = command_base_1.CommandBase.messages.getMessage('source.delta.git.commandDescription');
Git.examples = [`$ sfdx acumen:source:delta:git -g git.txt -s force-app -d deploy
    Reads the specified -(g)it diff file 'git.txt' and uses it to identify the deltas in
    -(s)ource 'force-app' and copies them to -(d)estination 'deploy'`];
Git.gitDeltaProvider = class extends delta_provider_1.DeltaProvider {
    constructor() {
        super(...arguments);
        this.name = 'git';
        this.deltaLineToken = '\t';
        this.deltas = new Map();
    }
    processDeltaLine(deltaLine) {
        const parts = deltaLine.split(this.deltaLineToken);
        this.deltas.set(parts[1], parts[0]);
    }
    getMessage(name) {
        return command_base_1.CommandBase.messages.getMessage(name);
    }
    diff(source) {
        return tslib_1.__asyncGenerator(this, arguments, function* diff_1() {
            // git has already done all of the hashing/diffing for us
            source = source ? path.normalize(source) : this.deltaOptions.source;
            for (const [deltaFile, deltaKind] of this.deltas) {
                // Did we exclude the filepath?
                if (!deltaFile.startsWith(source)) {
                    yield tslib_1.__await(this.logMessage(`Skipping delta file line: '${deltaFile}' not in source path: '${source}'.`, true));
                    continue;
                }
                yield yield tslib_1.__await(new delta_provider_1.Delta(deltaKind, deltaFile));
            }
        });
    }
    async validateDeltaOptions(deltaOptions) {
        // Currently we don't allow creating the git-diff file
        if (!deltaOptions.deltaFilePath || !(await utils_1.default.pathExists(deltaOptions.deltaFilePath))) {
            return 'No delta -g(it) file specified or specified file does not exist.';
        }
        return await super.validateDeltaOptions(deltaOptions);
    }
};
Git.flagsConfig = delta_command_1.DeltaCommandBase.getFlagsConfig({
    git: command_1.flags.filepath({
        char: 'g',
        description: command_base_1.CommandBase.messages.getMessage('source.delta.git.gitFlagDescription')
    })
});
//# sourceMappingURL=git.js.map