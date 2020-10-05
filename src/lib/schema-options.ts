export default class SchemaOptions {
    public outputDefs = [];

    public excludeFieldIfTrueFilter: string;

    constructor(json?: any) {
        if (json) {
            if (json.outputDefs) {
                this.outputDefs = json.outputDefs;
            }
            if (json.excludeFieldIfTrueFilter) {
                this.excludeFieldIfTrueFilter = json.excludeFieldIfTrueFilter;
            }
        }
    }

    public getDynamicCode(): string {
        let code = 'main(); function main() { const row=[];';

        if (this.excludeFieldIfTrueFilter) {
            code += `if( ${this.excludeFieldIfTrueFilter} ) { return row; } `;
        }
        for (const outputDef of this.outputDefs) {
            code += `row.push(${outputDef.split('|')[1]});`;
        }
        code += 'return row; }';

        return code;
    }
}
