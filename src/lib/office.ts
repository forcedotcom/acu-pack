import { utils, writeFile } from 'xlsx';
export class Office {
    public static writeXlxsWorkbook(workbookMap: Map<string, string[][]>, xlxsFilePath: string): void {
        if (!workbookMap) {
            throw new Error('workboodMap cannot be null.');
        }
        if (!xlxsFilePath) {
            throw new Error('xlxsFilePath cannot be null.');
        }
        if (workbookMap) {
            const workbook = utils.book_new();
            for (const [name, sheet] of workbookMap) {
                const worksheet = utils.aoa_to_sheet(sheet);
                /* Add the worksheet to the workbook */
                // "Sheet name cannot contain : \\ / ? * [ ]"
                let sheetName = name;
                for(const badChar of ['\\\\','\\','/','?','*','[',']']) {
                    while(sheetName.includes(badChar)) {
                        sheetName = sheetName.replace(badChar,'');
                    }
                }
                // There is  character limit of 31 for sheet names
                sheetName = sheetName.slice(0,31);
                utils.book_append_sheet(workbook, worksheet, sheetName);
            }
            writeFile(workbook, xlxsFilePath);
        }
    }
}
