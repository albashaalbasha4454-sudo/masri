import type { Expense, FinancialAccount, FinancialTransaction, Invoice } from './types';
import { exportProfessionalFullWorkbook } from './services/professionalReportExport';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function findButtonFromTarget(target: EventTarget | null): HTMLButtonElement | null {
  let node = target as HTMLElement | null;
  while (node && node.tagName !== 'BUTTON') node = node.parentElement;
  return node instanceof HTMLButtonElement ? node : null;
}

export function installProfessionalReportExportPatcher() {
  if (typeof window === 'undefined') return;

  document.addEventListener('click', (event) => {
    const button = findButtonFromTarget(event.target);
    if (!button) return;

    const label = button.textContent || '';
    if (!label.includes('تصدير Excel احترافي')) return;

    event.preventDefault();
    event.stopPropagation();

    const expenses = readJson<Expense[]>('expenses', []);
    const invoices = readJson<Invoice[]>('invoices', []);
    const transactions = readJson<FinancialTransaction[]>('financialTransactions', []);
    const accounts = readJson<FinancialAccount[]>('financialAccounts', readJson<FinancialAccount[]>('accounts', []));

    if (!expenses.length && !invoices.length && !transactions.length) {
      window.alert('لا توجد بيانات كافية للتصدير.');
      return;
    }

    exportProfessionalFullWorkbook(expenses, invoices, transactions, accounts);
  }, true);
}
