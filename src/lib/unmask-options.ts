import { OptionsBase } from './options';
import { SfdxCore } from './sfdx-core';

export class UnmaskOptions extends OptionsBase {
    public static defaultUserQuery = 'SELECT Id, username, IsActive, Email FROM User';

    public sandboxes: Map<string, string[]>;

    public userQuery: string;

    constructor() {
        super();
        this.sandboxes = new Map();
        this.userQuery = UnmaskOptions.defaultUserQuery;
    }

    public async deserialize(serializedOptions: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                if (!serializedOptions) {
                    return null;
                }
                const options = JSON.parse(serializedOptions);
                if (options.sandboxes) {
                    this.sandboxes = new Map(options.sandboxes);
                }
                if (options.userQuery) {
                    this.userQuery = options.userQuery;
                }
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    public async serialize(): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                resolve(JSON.stringify({
                    userQuery: this.userQuery,
                    sandboxes: Array.from(this.sandboxes.entries())
                }, null, SfdxCore.jsonSpaces));

            } catch (err) {
                reject(err);
            }
        });
    }

    public async loadDefaults(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.userQuery = UnmaskOptions.defaultUserQuery;
                this.sandboxes.set(
                    'SNDBX1',
                    [
                        'test.user@salesforce.com.sndbx1'
                    ]
                );
                this.sandboxes.set(
                    'SNDBX2',
                    [
                        'test.user@salesforce.com.sndbx2'
                    ]
                );
                this.sandboxes.set(
                    'SNDBX3',
                    [
                        'test.user@salesforce.com.sndbx3'
                    ]
                );
            } catch (err) {
                reject(err);
            }
            resolve();
        });
    }
}
