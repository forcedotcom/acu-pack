import { OptionsBase } from './options';
export declare class XPathRule {
    name: string;
    xPath: string;
    values: string[];
}
export declare class XPathOptions extends OptionsBase {
    rules: Map<string, XPathRule[]>;
    constructor();
    deserialize(serializedOptions: string): Promise<void>;
    serialize(): Promise<string>;
    loadDefaults(): Promise<void>;
}
