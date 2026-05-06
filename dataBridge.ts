import type { ActivityLog, Expense, FinancialAccount, FinancialTransaction, Invoice } from './types';

const CASH_ID = 'cash-default';
const CUSTODY_ID = 'falafel-manager-custody';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeAccounts() {
  const financialAccounts = readJson<FinancialAccount[]>('financialAccounts', []);
  const legacyAccounts = readJson<FinancialAccount[]>('accounts', []);
  const byId = new Map<string, FinancialAccount>();

  [...legacyAccounts, ...financialAccounts].forEach(acc => byId.set(acc.id, acc));

  byId.set(CASH_ID, {
    ...(byId.get(CASH_ID) || { id: CASH_ID, type: 'cash' as const }),
    id: CASH_ID,
    name: 'درج المحل (الخزينة الرئيسية)',
    type: 'cash',
  });

  byId.set(CUSTODY_ID, {
    ...(byId.get(CUSTODY_ID) || { id: CUSTODY_ID, type: 'cash' as const }),
    id: CUSTODY_ID,
    name: 'عهدة مسؤول قسم الفلافل',
    type: 'cash',
  });

  const next = Array.from(byId.values());
  writeJson('financialAccounts', next);
  writeJson('accounts', next);
}

function manualInvoiceFromTransaction(tx: FinancialTransaction): Invoice {
  return {
    id: `manual-inv-${tx.id}`,
    date: tx.date,
    type: 'sale',
    items: [{
      productId: `manual-sales-${tx.id}`,
      productName: tx.description || 'غلة مبيعات يدوية',
      category: tx.category || 'غلة مبيعات يدوية',
      price: tx.amount,
      quantity: 1,
      discount: 0,
      manualAddition: 0,
      notes: 'مولدة تلقائيا من حركة الخزينة حتى تظهر الغلة في الفواتير والتقارير والملخص المالي.',
    }],
    total: tx.amount,
    customerInfo: { name: 'غلة يدوية / درج المحل', phone: '', address: '' },
    notes: `مولدة من حركة خزينة: ${tx.description}`,
    status: 'completed',
    paymentStatus: 'paid',
    paidDate: tx.date,
    processedBy: 'admin',
    paymentMethod: 'cash',
  };
}

function syncSalesInvoices() {
  const txs = readJson<FinancialTransaction[]>('financialTransactions', []);
  const invoices = readJson<Invoice[]>('invoices', []);
  const byId = new Map<string, Invoice>(invoices.map(inv => [inv.id, inv]));

  txs.forEach(tx => {
    if (tx.type !== 'sale_income' || tx.relatedInvoiceId || tx.amount <= 0) return;
    const invoice = manualInvoiceFromTransaction(tx);
    byId.set(invoice.id, invoice);
  });

  writeJson('invoices', Array.from(byId.values()));
}

function syncExpenseTransactions() {
  const expenses = readJson<Expense[]>('expenses', []);
  const txs = readJson<FinancialTransaction[]>('financialTransactions', []);
  const byId = new Map<string, FinancialTransaction>(txs.map(tx => [tx.id, tx]));

  expenses.forEach(exp => {
    if (!exp.id || exp.amount === undefined || exp.amount === null) return;
    const id = exp.linkedTransactionId || `tx-exp-${exp.id}`;
    byId.set(id, {
      ...(byId.get(id) || {}),
      id,
      date: exp.date,
      description: exp.description,
      amount: exp.amount || 0,
      type: 'expense',
      fromAccountId: exp.accountId || CASH_ID,
      category: exp.category,
      relatedExpenseId: exp.id,
    });
  });

  writeJson('financialTransactions', Array.from(byId.values()));
}

function syncActivityLogs() {
  const logs = readJson<ActivityLog[]>('activityLogs', []);
  const txs = readJson<FinancialTransaction[]>('financialTransactions', []);
  const byId = new Map<string, ActivityLog>(logs.map(log => [log.id, log]));

  txs.forEach(tx => {
    const id = `auto-${tx.id}`;
    if (byId.has(id)) return;
    const operation = tx.type === 'sale_income'
      ? 'تسجيل غلة مبيعات'
      : tx.type === 'expense'
        ? 'تسجيل مصروف'
        : tx.type === 'capital_deposit'
          ? 'تسجيل عهدة مسؤول قسم'
          : tx.type === 'transfer'
            ? 'تحويل بين الحسابات'
            : 'حركة مالية';

    byId.set(id, {
      id,
      userId: 'system',
      username: 'النظام',
      operation,
      description: `${tx.description} | ${tx.category || '-'} | ${tx.amount}`,
      date: tx.date,
    });
  });

  writeJson('activityLogs', Array.from(byId.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5000));
}

let running = false;

export function syncAllBusinessData() {
  if (typeof window === 'undefined' || running) return;
  running = true;
  try {
    normalizeAccounts();
    syncExpenseTransactions();
    syncSalesInvoices();
    syncActivityLogs();
  } finally {
    running = false;
  }
}

export function installDataBridge() {
  if (typeof window === 'undefined') return;
  const nativeSetItem = window.localStorage.setItem.bind(window.localStorage);

  window.localStorage.setItem = (key: string, value: string) => {
    nativeSetItem(key, value);
    if (['financialAccounts', 'accounts', 'financialTransactions', 'expenses', 'invoices'].includes(key)) {
      setTimeout(syncAllBusinessData, 0);
    }
  };

  syncAllBusinessData();
}
