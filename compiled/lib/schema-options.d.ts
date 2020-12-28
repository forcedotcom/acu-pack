import { OptionsBase } from './options';
export default class SchemaOptions extends OptionsBase {
    outputDefs: any[];
    excludeFieldIfTrueFilter: string;
    getDynamicCode(): string;
    protected loadDefaults(): Promise<void>;
}
