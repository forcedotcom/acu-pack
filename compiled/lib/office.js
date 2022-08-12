"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Office = void 0;
const xlsx_1 = require("xlsx");
class Office {
    static writeXlxsWorkbook(workbookMap, xlxsFilePath) {
        if (!workbookMap) {
            throw new Error('workboodMap cannot be null.');
        }
        if (!xlxsFilePath) {
            throw new Error('xlxsFilePath cannot be null.');
        }
        if (workbookMap) {
            const workbook = xlsx_1.utils.book_new();
            for (const [name, sheet] of workbookMap) {
                const worksheet = xlsx_1.utils.aoa_to_sheet(sheet);
                /* Add the worksheet to the workbook */
                // "Sheet name cannot contain : \\ / ? * [ ]"
                let sheetName = name;
                for (const badChar of ['\\\\', '\\', '/', '?', '*', '[', ']']) {
                    while (sheetName.includes(badChar)) {
                        sheetName = sheetName.replace(badChar, '');
                    }
                }
                // There is  character limit of 31 for sheet names
                sheetName = sheetName.slice(0, 31);
                xlsx_1.utils.book_append_sheet(workbook, worksheet, sheetName);
            }
            xlsx_1.writeFile(workbook, xlxsFilePath);
        }
    }
}
exports.Office = Office;
//# sourceMappingURL=office.js.map