import type { Expense, FinancialAccount, FinancialTransaction, Invoice, InvoiceItem } from './types';

export type AccountingAuditResult = {
  totalSales: number;
  totalExpenses: number;
  totalReturns: number;
  net: number;
  accountBalances: Record<string, number>;
  warnings: string[];
};

export function auditLineTotal(item: InvoiceItem): number {
  const modifiers = item.modifiers?.reduce((sum, modifier) => sum + modifier.price, 0) || 0;
  const unitNet = (item.price || 0) - (item.discount || 0) + (item.manualAddition || 0) + modifiers;
  return unitNet * (item.quantity || 1);
}

export function auditAccounting(invoices: Invoice[], expenses: Expense[], transactions: FinancialTransaction[], accounts: FinancialAccount[]): AccountingAuditResult {
  const warnings: string[] = [];

  const totalSales = invoices
    .filter(invoice => invoice.type !== 'return' && invoice.paymentStatus === 'paid')
    .reduce((sum, invoice) => sum + invoice.items.reduce((lineSum, item) => lineSum + auditLineTotal(item), 0), 0);

  const totalReturns = invoices
    .filter(invoice => invoice.type === 'return')
    .reduce((sum, invoice) => sum + Math.abs(invoice.items.reduce((lineSum, item) => lineSum + auditLineTotal(item), 0) || invoice.total || 0), 0);

  const totalExpenses = expenses
    .filter(expense => expense.status !== 'cancelled')
    .reduce((sum, expense) => sum + (expense.amount || 0), 0);

  const accountBalances: Record<string, number> = {};
  accounts.forEach(account => { accountBalances[account.id] = 0; });
  transactions.forEach(transaction => {
    if (transaction.fromAccountId) accountBalances[transaction.fromAccountId] = (accountBalances[transaction.fromAccountId] || 0) - transaction.amount;
    if (transaction.toAccountId) accountBalances[transaction.toAccountId] = (accountBalances[transaction.toAccountId] || 0) + transaction.amount;
  });

  invoices.forEach(invoice => {
    const computed = invoice.items.reduce((sum, item) => sum + auditLineTotal(item), 0);
    if (Math.abs(Math.abs(invoice.total || 0) - Math.abs(computed)) > 1) {
      warnings.push(`فاتورة ${invoice.id}: الإجمالي لا يطابق مجموع البنود.`);
    }
  });

  expenses.forEach(expense => {
    if (expense.status !== 'cancelled') {
      const linked = transactions.some(transaction => transaction.relatedExpenseId === expense.id || transaction.id === expense.linkedTransactionId);
      if (!linked) warnings.push(`مصروف ${expense.description}: لا توجد حركة خزينة مرتبطة.`);
    }
  });

  transactions.forEach(transaction => {
    if (transaction.type === 'sale_income' && !transaction.toAccountId) warnings.push(`حركة مبيعات ${transaction.description}: لا يوجد حساب داخل.`);
    if (transaction.type === 'expense' && !transaction.fromAccountId) warnings.push(`حركة مصروف ${transaction.description}: لا يوجد حساب خارج.`);
  });

  return {
    totalSales,
    totalExpenses,
    totalReturns,
    net: totalSales - totalExpenses - totalReturns,
    accountBalances,
    warnings,
  };
}

export function installAccountingAuditButton() {
  if (typeof window === 'undefined') return;

  setInterval(() => {
    const actions = document.querySelector('.actions,.un-actions,.top-actions') as HTMLElement | null;
    if (!actions || document.getElementById('accounting-audit-button')) return;
    const button = document.createElement('button');
    button.id = 'accounting-audit-button';
    button.type = 'button';
    button.textContent = 'فحص الحسابات';
    button.title = 'يفحص توافق الفواتير والمصروفات والخزينة ويعرض التحذيرات.';
    actions.appendChild(button);
  }, 1000);

  document.addEventListener('click', event => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest('button') as HTMLButtonElement | null;
    if (!button || button.id !== 'accounting-audit-button') return;
    event.preventDefault();
    event.stopPropagation();

    const read = <T,>(key: string, fallback: T): T => {
      try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) as T : fallback;
      } catch {
        return fallback;
      }
    };

    const result = auditAccounting(
      read<Invoice[]>('invoices', []),
      read<Expense[]>('expenses', []),
      read<FinancialTransaction[]>('financialTransactions', []),
      read<FinancialAccount[]>('financialAccounts', [])
    );

    const message = [
      `إجمالي الغلة: ${result.totalSales.toLocaleString('en-US')}`,
      `إجمالي المصروفات: ${result.totalExpenses.toLocaleString('en-US')}`,
      `إجمالي المرتجعات: ${result.totalReturns.toLocaleString('en-US')}`,
      `الصافي: ${result.net.toLocaleString('en-US')}`,
      result.warnings.length ? `تحذيرات:\n- ${result.warnings.join('\n- ')}` : 'لا توجد تحذيرات محاسبية مباشرة.'
    ].join('\n');

    window.alert(message);
  }, true);
}
