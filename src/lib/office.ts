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
                // There is  character limit of 31 for sheet names
                utils.book_append_sheet(workbook, worksheet, name.slice(0,31));
            }
            writeFile(workbook, xlxsFilePath);
        }
    }
}
