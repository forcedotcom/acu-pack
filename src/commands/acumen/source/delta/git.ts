import { flags } from '@salesforce/command';
import { CommandBase } from '../../../../lib/command-base';
import { DeltaCommandBase } from '../../../../lib/delta-command';
import Utils from '../../../../lib/utils';
import { DeltaProvider, DeltaOptions, Delta } from '../../../../lib/delta-provider';
import path = require('path');

export default class Git extends CommandBase {
    public static args = [{ name: 'file' }];
    public static description = CommandBase.messages.getMessage('source.delta.git.commandDescription');

    public static examples = [`$ sfdx acumen:source:delta:git -g git.txt -s force-app -d deploy
    Reads the specified -(g)it diff file 'git.txt' and uses it to identify the deltas in
    -(s)ource 'force-app' and copies them to -(d)estination 'deploy'`];

    public static gitDeltaProvider = class extends DeltaProvider {
        public name = 'git';
        public deltaLineToken = '\t';
        public deltas = new Map<string, any>();

        public processDeltaLine(deltaLine: string): void {
            const parts = deltaLine.split(this.deltaLineToken);
            this.deltas.set(parts[1], parts[0]);
        }

        public getMessage(name: string): string {
            return CommandBase.messages.getMessage(name);
        }

        public async * diffAsync(source?: string): AsyncGenerator<Delta, any, any> {
            // git has already done all of the hashing/diffing for us
            source = source ? path.normalize(source) : this.deltaOptions.source;
            for (const [deltaFile, deltaKind] of this.deltas) {
                // Did we exclude the filepath?
                if (!deltaFile.startsWith(source)) {
                    await this.logMessage(`Skipping delta file line: '${deltaFile}' not in source path: '${source}'.`, true);
                    continue;
                }
                yield new Delta(deltaKind, deltaFile);
            }
        }
        public async validateDeltaOptionsAsync(deltaOptions: DeltaOptions): Promise<string> {
            // Currently we don't allow creating the git-diff file
            if (!deltaOptions.deltaFilePath || !(await Utils.pathExistsAsync(deltaOptions.deltaFilePath))) {
                return 'No delta -g(it) file specified or specified file does not exist.';
            }
            return await super.validateDeltaOptionsAsync(deltaOptions);
        }
    };

    protected static flagsConfig = DeltaCommandBase.getFlagsConfig({
        git: flags.filepath({
            char: 'g',
            description: CommandBase.messages.getMessage('source.delta.git.gitFlagDescription')
        })
    });

    protected name = 'git';
    protected deltas = new Map<string, string>();

    public async run(): Promise<any> {
        const deltaOptions = new DeltaOptions();
        deltaOptions.deltaFilePath = this.flags.git;
        deltaOptions.source = this.flags.source;
        deltaOptions.destination = this.flags.destination;
        deltaOptions.forceFile = this.flags.force;
        deltaOptions.ignoreFile = this.flags.ignore;

        const gitProvider = new Git.gitDeltaProvider();
        await gitProvider.run(deltaOptions);
    }
}
