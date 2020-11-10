"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SchemaOptions {
    constructor(json) {
        this.outputDefs = [];
        if (json) {
            if (json.outputDefs) {
                this.outputDefs = json.outputDefs;
            }
            if (json.excludeFieldIfTrueFilter) {
                this.excludeFieldIfTrueFilter = json.excludeFieldIfTrueFilter;
            }
        }
    }
    getDynamicCode() {
        let code = 'main(); function main() { const row=[];';
        if (this.excludeFieldIfTrueFilter) {
            code += `if( ${this.excludeFieldIfTrueFilter} ) { return []; } `;
        }
        for (const outputDef of this.outputDefs) {
            code += `row.push(${outputDef.split('|')[1]});`;
        }
        code += 'return row; }';
        return code;
    }
}
exports.default = SchemaOptions;
//# sourceMappingURL=schema-options.js.map