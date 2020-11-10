export declare class XPathRule {
    name: string;
    xPath: string;
    values: string[];
}
export declare class XPathOptions {
    static deserialize(serializedOptions: string): XPathOptions;
    rules: Map<string, XPathRule[]>;
    constructor();
    serialize(): string;
    loadDefaults(): void;
}
