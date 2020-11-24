export declare class UnmaskOptions {
    static deserialize(serializedOptions: string): UnmaskOptions;
    sandboxes: Map<string, string[]>;
    constructor();
    serialize(): string;
    loadDefaults(): void;
}
