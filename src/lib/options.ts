import path = require('path');
import { promises as fs } from 'fs';
import Utils from './utils';
import { SfdxCore } from './sfdx-core';

export class OptionsSettings {
    public ignoreVersion = false;
    public blockExternalConnections = false;
}

export abstract class OptionsBase {
    // This field should NOT be serialized see includeField method below
    public version = 1.0;

    public get settings(): OptionsSettings {
        return this.prvSettings;
    }
    public set settings(optionSettings: OptionsSettings) {
        if (optionSettings) {
            this.prvSettings = optionSettings;
        }
    }

    private prvSettings: OptionsSettings;

    // Make sure we have a default ctor
    public constructor() {
        this.prvSettings = new OptionsSettings();
    }

    public get isCurrentVersion(): boolean {
        return this.version === this.currentVersion;
    }

    public async load(optionsPath: string): Promise<void> {
        const json = await this.readFile(optionsPath);
        if (!json) {
            await this.loadDefaults();
            if (optionsPath) {
                await this.save(optionsPath);
            }
        } else {
            await this.deserialize(json);
            // If we have a filepath AND the version is not current => write the current version
            if (!this.isCurrentVersion && !this.prvSettings.ignoreVersion && optionsPath) {
                this.setCurrentVersion();
                await this.save(optionsPath);
            }
        }
    }

    public async save(optionsPath: string): Promise<void> {
        if (!optionsPath) {
            throw new Error('The optionsPath argument cannot be null.');
        }
        const dir = path.dirname(optionsPath);
        if (dir) {
            await Utils.mkDirPath(dir);
        }
        await fs.writeFile(optionsPath, (await this.serialize()));
    }

    protected ignoreField(fieldName: string): boolean {
        return fieldName === 'prvSettings';
    }

    protected deserialize(serializedOptionBase: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const options = JSON.parse(serializedOptionBase);
                for (const field of Object.keys(options)) {
                    if (Object.prototype.hasOwnProperty.call(this, field) && !this.ignoreField(field)) {
                        this[field] = options[field];
                    }
                }
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    protected serialize(): Promise<string> {
        // Always check & set the current version before serializing
        if (!this.isCurrentVersion) {
            this.setCurrentVersion();
        }
        const stringify = (key, value): boolean => {
            return (this.ignoreField(key)
                ? undefined
                : value) as boolean;
        };
        return new Promise((resolve, reject) => {
            try {
                resolve(JSON.stringify(this, stringify, SfdxCore.jsonSpaces));
            } catch (err) {
                reject(err);
            }
        });
    }

    protected async readFile(optionsPath: string): Promise<string> {
        if (!optionsPath) {
            return null;
        }
        if (await Utils.pathExists(optionsPath)) {
            return (await fs.readFile(optionsPath)).toString();
        } else {
            return null;
        }
    }

    protected get currentVersion(): number {
        return this.version;
    }

    protected setCurrentVersion(): void {
        this.version = this.currentVersion;
    }

    protected abstract loadDefaults(): Promise<void>;
}
