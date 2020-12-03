import { SfdxCore } from './sfdx-core';

export class UnmaskOptions {
    public static defaultUserQuery = "SELECT Id, username, IsActive, Email FROM User WHERE IsActive=true AND Email LIKE '%.invalid'";

    public static deserialize(serializedOptions: string): UnmaskOptions {
        const unmaskOptions = new UnmaskOptions();
        const options = JSON.parse(serializedOptions);
        if (options.sandboxes) {
            unmaskOptions.sandboxes = new Map(options.sandboxes);
        }
        if (options.userQuery) {
            unmaskOptions.userQuery = options.userQuery;
        }
        return unmaskOptions;
    }

    public sandboxes: Map<string, string[]>;

    public userQuery: string;

    constructor() {
        this.sandboxes = new Map();
        this.userQuery = UnmaskOptions.defaultUserQuery;
    }

    public serialize(): string {
        return JSON.stringify({
            userQuery: this.userQuery,
            sandboxes: Array.from(this.sandboxes.entries())
        }, null, SfdxCore.jsonSpaces);
    }

    public loadDefaults(): void {
        this.userQuery = UnmaskOptions.defaultUserQuery;
        this.sandboxes.set(
            'SNDBX1',
            [
                'test.user@aie.army.com.sndbx1'
            ]
        );
        this.sandboxes.set(
            'SNDBX2',
            [
                'test.user@aie.army.com.sndbx2'
            ]
        );
        this.sandboxes.set(
            'SNDBX3',
            [
                'test.user@aie.army.com.sndbx3'
            ]
        );
    }
}
