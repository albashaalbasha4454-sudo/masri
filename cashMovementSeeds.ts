import type { FinancialAccount, FinancialTransaction } from './types';

const DRAWER_ACCOUNT_ID = 'cash-default';
const EXCHANGE_RATE = 13250;

const requiredCashMovements: FinancialTransaction[] = [
  {
    id: 'required-cash-falafel-sales-2026-04-30',
    date: new Date('2026-04-30T21:00:00+03:00').toISOString(),
    description: 'غلة مبيعات قسم الفلافل ليوم 30/4 - مجموع المبيعات النقدية فقط',
    amount: 258000,
    type: 'sale_income',
    toAccountId: DRAWER_ACCOUNT_ID,
    category: 'الفلافل',
  },
  {
    id: 'required-cash-admin-funding-2026-04-30',
    date: new Date('2026-04-30T21:05:00+03:00').toISOString(),
    description: 'تمويل من الإدارة إلى درج المحل - 100 دولار بسعر 13,250',
    amount: 1325000,
    type: 'capital_deposit',
    toAccountId: DRAWER_ACCOUNT_ID,
    category: 'تمويل الإدارة',
  },
];

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

export function seedDrawerAccountAndCashMovements() {
  if (typeof window === 'undefined') return;

  const accounts = readJson<FinancialAccount[]>('accounts', []);
  const nextAccounts = accounts.map(account => (
    account.id === DRAWER_ACCOUNT_ID
      ? { ...account, name: 'درج المحل (الخزينة الرئيسية)' }
      : account
  ));

  if (!nextAccounts.some(account => account.id === DRAWER_ACCOUNT_ID)) {
    nextAccounts.push({ id: DRAWER_ACCOUNT_ID, name: 'درج المحل (الخزينة الرئيسية)', type: 'cash' });
  }
  writeJson('accounts', nextAccounts);

  const transactions = readJson<FinancialTransaction[]>('financialTransactions', []);
  const byId = new Map(transactions.map(tx => [tx.id, tx]));

  requiredCashMovements.forEach(tx => {
    if (!byId.has(tx.id)) {
      byId.set(tx.id, tx);
    }
  });

  writeJson('financialTransactions', Array.from(byId.values()));
}
