export default abstract class SchemaOptions {
    public outputDefs = [];

    public excludeFieldIfTrueFilter: string;

    public abstract loadDefaults(): void;

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
