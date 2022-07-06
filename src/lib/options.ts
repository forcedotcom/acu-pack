import path = require('path');
import Utils from './utils';
import { promises as fs } from 'fs';
import { SfdxCore } from './sfdx-core';

export class OptionsSettings {
    public ignoreVersion: boolean = false;
    public blockExternalConnections: boolean = false;
}

export abstract class OptionsBase {
    // This field should NOT be serialized see includeField method below
    public version: number = 1.0;

    public get settings(): OptionsSettings {
        return this._settings;
    }
    public set settings(optionSettings: OptionsSettings) {
        if (optionSettings) {
            this._settings = optionSettings;
        }
    }

    private _settings: OptionsSettings;

    // Make sure we have a default ctor
    constructor() {
        this._settings = new OptionsSettings();
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
            if (!this.isCurrentVersion && !this._settings.ignoreVersion && optionsPath) {
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
        return fieldName === '_settings';
    }

    protected deserialize(serializedOptionBase: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const options = JSON.parse(serializedOptionBase);
                for (const field of Object.keys(options)) {
                    if (this.hasOwnProperty(field) && !this.ignoreField(field)) {
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
        return new Promise((resolve, reject) => {
            try {
                // Always check & set the current version before serializing
                if (!this.isCurrentVersion) {
                    this.setCurrentVersion();
                }
                const ignoreFieldMethodName = this.ignoreField;
                const stringify = (key, value) => {
                    return ignoreFieldMethodName(key)
                        ? undefined
                        : value;
                };
                resolve(JSON.stringify(this, stringify, SfdxCore.jsonSpaces));
            } catch (err) {
                reject(err);
            }
        });
    }

    protected abstract loadDefaults(): Promise<void>;

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
}
