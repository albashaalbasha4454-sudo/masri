import * as XLSX from 'xlsx';

export type ExcelSheet = {
  name: string;
  rows: Record<string, unknown>[];
};

export class ExcelNoDataError extends Error {
  constructor() {
    super('NO_DATA');
    this.name = 'ExcelNoDataError';
  }
}

export const exportWorkbook = (
  sheets: ExcelSheet[],
  fileName: string,
  meta?: { title?: string; period?: string }
) => {
  const validSheets = sheets.filter(sheet => Array.isArray(sheet.rows) && sheet.rows.length > 0);

  if (validSheets.length === 0) {
    throw new ExcelNoDataError();
  }

  const wb = XLSX.utils.book_new();

  validSheets.forEach((sheet, index) => {
    const metaRows: unknown[][] = [];

    if (index === 0 && meta?.title) {
      metaRows.push([meta.title]);
    }
    if (index === 0 && meta?.period) {
      metaRows.push([`الفترة الزمنية: ${meta.period}`]);
    }
    if (metaRows.length > 0) {
      metaRows.push([]);
    }

    const ws = XLSX.utils.aoa_to_sheet(metaRows.length > 0 ? metaRows : [[]]);
    XLSX.utils.sheet_add_json(ws, sheet.rows, {
      origin: metaRows.length === 0 ? 0 : metaRows.length,
      skipHeader: false,
    });

    XLSX.utils.book_append_sheet(wb, ws, sheet.name || `Sheet ${index + 1}`);
  });

  XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

/**
 * Backward-compatible single-sheet export wrapper.
 */
export const exportToExcel = (
  data: Record<string, unknown>[],
  fileName: string,
  sheetName: string = 'بيانات',
  header?: string,
  period?: string
) => {
  return exportWorkbook(
    [{ name: sheetName, rows: data }],
    fileName,
    { title: header, period }
  );
};
