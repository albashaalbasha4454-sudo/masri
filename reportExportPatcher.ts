import type { Expense, FinancialAccount, FinancialTransaction, Invoice } from './types';
import { exportProfessionalFullWorkbook } from './services/professionalReportExport';
import { exportProfessionalPdfReport } from './services/professionalPdfReport';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function readBusinessData() {
  const expenses = readJson<Expense[]>('expenses', []);
  const invoices = readJson<Invoice[]>('invoices', []);
  const transactions = readJson<FinancialTransaction[]>('financialTransactions', []);
  const accounts = readJson<FinancialAccount[]>('financialAccounts', readJson<FinancialAccount[]>('accounts', []));
  return { expenses, invoices, transactions, accounts };
}

function findButtonFromTarget(target: EventTarget | null): HTMLButtonElement | null {
  let node = target as HTMLElement | null;
  while (node && node.tagName !== 'BUTTON') node = node.parentElement;
  return node instanceof HTMLButtonElement ? node : null;
}

function ensurePdfButton() {
  const buttons = Array.from(document.querySelectorAll('button'));
  const excelButton = buttons.find(button => (button.textContent || '').includes('تصدير Excel احترافي'));
  if (!excelButton || document.getElementById('professional-pdf-report-button')) return;

  const pdfButton = document.createElement('button');
  pdfButton.id = 'professional-pdf-report-button';
  pdfButton.type = 'button';
  pdfButton.className = 'flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-sm shadow-rose-600/20';
  pdfButton.innerHTML = '<span class="material-symbols-outlined text-xl">picture_as_pdf</span>تصدير PDF شامل';
  excelButton.parentElement?.appendChild(pdfButton);
}

export function installProfessionalReportExportPatcher() {
  if (typeof window === 'undefined') return;

  setInterval(ensurePdfButton, 1000);

  document.addEventListener('click', (event) => {
    const button = findButtonFromTarget(event.target);
    if (!button) return;

    const label = button.textContent || '';
    const isExcel = label.includes('تصدير Excel احترافي');
    const isPdf = label.includes('تصدير PDF شامل');
    if (!isExcel && !isPdf) return;

    event.preventDefault();
    event.stopPropagation();

    const { expenses, invoices, transactions, accounts } = readBusinessData();

    if (!expenses.length && !invoices.length && !transactions.length) {
      window.alert('لا توجد بيانات كافية للتصدير.');
      return;
    }

    if (isPdf) {
      exportProfessionalPdfReport(expenses, invoices, transactions, accounts);
      return;
    }

    exportProfessionalFullWorkbook(expenses, invoices, transactions, accounts);
  }, true);
}
