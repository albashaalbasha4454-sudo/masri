import * as XLSX from 'xlsx';

/**
 * Exports data to an Excel file with a report header and period.
 * 
 * @param data Array of objects to export
 * @param fileName Name of the downloaded file (without extension)
 * @param sheetName Name of the sheet inside the workbook
 * @param header Title of the report to display at the top
 * @param period Optional time period string to display below the title
 */
export const exportToExcel = (
  data: any[], 
  fileName: string, 
  sheetName: string = 'بيانات', 
  header?: string, 
  period?: string
) => {
  if (!data || data.length === 0) {
    alert("لا توجد بيانات للتصدير ضمن الفترة المحددة.");
    return;
  }

  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Custom rows for header and period (Array of Arrays)
  const metaRows: any[][] = [];
  if (header) {
    metaRows.push([header]);
  }
  if (period) {
    metaRows.push([`الفترة الزمنية: ${period}`]);
  }
  if (metaRows.length > 0) {
    metaRows.push([]); // Add an empty row for separation
  }

  // Create worksheet from meta rows
  const ws = XLSX.utils.aoa_to_sheet(metaRows.length > 0 ? metaRows : [[]]);

  // Add the data starting after the meta rows
  XLSX.utils.sheet_add_json(ws, data, { 
    origin: metaRows.length === 0 ? 0 : metaRows.length,
    skipHeader: false 
  });

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Write and download
  XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
