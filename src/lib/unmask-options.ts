import { SfdxCore } from './sfdx-core';

export class UnmaskOptions {
    public static deserialize(serializedOptions: string): UnmaskOptions {
        const unmaskOptions = new UnmaskOptions();
        unmaskOptions.sandboxes = new Map(JSON.parse(serializedOptions));
        return unmaskOptions;
    }

    public sandboxes: Map<string, string[]>;

    constructor() {
        this.sandboxes = new Map();
    }

    public serialize(): string {
        return JSON.stringify(Array.from(this.sandboxes.entries()), null, SfdxCore.jsonSpaces);
    }

    public loadDefaults(): void {
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
