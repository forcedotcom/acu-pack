import { OptionsBase } from './options';
export declare class ScaffoldOptions extends OptionsBase {
    sObjectTypes: string[];
    includeOptionalFields: boolean;
    includeRandomValues: boolean;
    loadDefaults(): Promise<void>;
}
