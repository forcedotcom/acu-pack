"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const path = require("path");
const command_1 = require("@salesforce/command");
const md5File = require("md5-file");
const command_base_1 = require("../../../../lib/command-base");
const delta_command_1 = require("../../../../lib/delta-command");
const utils_1 = require("../../../../lib/utils");
const delta_provider_1 = require("../../../../lib/delta-provider");
class Md5 extends command_base_1.CommandBase {
    constructor() {
        super(...arguments);
        this.name = 'md5';
        this.deltas = new Map();
    }
    async runInternal() {
        const deltaOptions = await delta_command_1.DeltaCommandBase.getDeltaOptions(this.flags);
        deltaOptions.deltaFilePath = this.flags.md5;
        const gitProvider = new Md5.md5DeltaProvider();
        await gitProvider.run(deltaOptions);
    }
}
exports.default = Md5;
Md5.description = command_base_1.CommandBase.messages.getMessage('source.delta.md5.commandDescription');
Md5.examples = [
    `$ sfdx acu-pack:source:delta:md5 -m md5.txt -s force-app -d deploy
    Reads the specified -(m)d5 file 'md5.txt' and uses it to identify the deltas in
    -(s)ource 'force-app' and copies them to -(d)estination 'deploy'`,
];
Md5.md5DeltaProvider = class extends delta_provider_1.DeltaProvider {
    constructor() {
        super(...arguments);
        this.deltaLineToken = '=';
        this.name = 'md5';
        this.deltas = new Map();
    }
    processDeltaLine(deltaLine) {
        const parts = deltaLine.split(this.deltaLineToken);
        this.deltas.set(parts[0], { hash: parts[1], isFound: false });
    }
    getMessage(name) {
        return command_base_1.CommandBase.messages.getMessage(name);
    }
    diff(source) {
        return tslib_1.__asyncGenerator(this, arguments, function* diff_1() {
            var e_1, _a;
            let hasUpdates = false;
            source = source ? path.normalize(source) : this.deltaOptions.source;
            try {
                for (var _b = tslib_1.__asyncValues(utils_1.default.getFiles(source)), _c; _c = yield tslib_1.__await(_b.next()), !_c.done;) {
                    const deltaFile = _c.value;
                    if (source && !deltaFile.startsWith(source)) {
                        yield tslib_1.__await(this.logMessage(`Skipping delta file line: '${deltaFile}' not in source path: '${source}'.`, true));
                        continue;
                    }
                    const hash = md5File.sync(deltaFile);
                    const entry = this.deltas.get(deltaFile);
                    let deltaKind;
                    // Is this the same?
                    if (!entry) {
                        deltaKind = delta_provider_1.DeltaProvider.deltaTypeKind.A;
                        this.deltas.set(deltaFile, { hash, isFound: true });
                        hasUpdates = true;
                    }
                    else if (hash !== entry.hash) {
                        deltaKind = delta_provider_1.DeltaProvider.deltaTypeKind.M;
                        this.deltas.set(deltaFile, { hash, isFound: true });
                        hasUpdates = true;
                    }
                    else {
                        deltaKind = delta_provider_1.DeltaProvider.deltaTypeKind.NONE;
                        this.deltas.set(deltaFile, { hash, isFound: true });
                    }
                    // return the delta
                    yield yield tslib_1.__await(new delta_provider_1.Delta(deltaKind, deltaFile));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield tslib_1.__await(_a.call(_b));
                }
                finally { if (e_1) throw e_1.error; }
            }
            // Check for deletes
            const deleted = [];
            for (const [fp, data] of this.deltas) {
                if (!data.isFound) {
                    // note deleted files
                    deleted.push({ deltaKind: delta_provider_1.DeltaProvider.deltaTypeKind.D, deltaFile: fp });
                    hasUpdates = true;
                }
            }
            // Return deleted entries
            for (const del of deleted) {
                yield yield tslib_1.__await(del);
                // Remove the delete entry from the deltas
                this.deltas.delete(del.deltaFile);
            }
            // Update hash file?
            if (hasUpdates) {
                const md5FilePath = this.deltaOptions.deltaFilePath;
                yield tslib_1.__await(this.logMessage('Updating hash file...', true));
                if (!(yield tslib_1.__await(utils_1.default.pathExists(md5FilePath)))) {
                    const folder = path.dirname(md5FilePath);
                    if (folder && !(yield tslib_1.__await(utils_1.default.pathExists(folder)))) {
                        yield tslib_1.__await(utils_1.default.mkDirPath(folder));
                    }
                }
                else {
                    yield tslib_1.__await(fs_1.promises.unlink(md5FilePath));
                }
                for (const [fp, data] of this.deltas) {
                    yield tslib_1.__await(fs_1.promises.appendFile(md5FilePath, `${fp}${this.deltaLineToken}${data.hash}\r\n`));
                }
                yield tslib_1.__await(this.logMessage(`Updated hash file: ${md5FilePath} with ${this.deltas.size} entries.`, true));
            }
        });
    }
};
Md5.flagsConfig = delta_command_1.DeltaCommandBase.getFlagsConfig({
    md5: command_1.flags.filepath({
        char: 'm',
        description: command_base_1.CommandBase.messages.getMessage('source.delta.md5.md5FlagDescription'),
    }),
});
//# sourceMappingURL=md5.js.map