import { OptionsBase } from './options';

export class ScaffoldOptions extends OptionsBase {
    public sObjectTypes: string[] = [];
    public includeOptionalFields: boolean = false;
    public includeRandomValues: boolean = true;

    public loadDefaults(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.sObjectTypes = [];
                this.includeOptionalFields = false;
                this.includeRandomValues = false;
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }
}
