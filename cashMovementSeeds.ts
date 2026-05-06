import type { FinancialAccount, FinancialTransaction } from './types';

const DRAWER_ACCOUNT_ID = 'cash-default';
const FALAFEL_CUSTODY_ACCOUNT_ID = 'falafel-manager-custody';

const requiredCashMovements: FinancialTransaction[] = [
  {
    id: 'required-cash-falafel-sales-2026-04-30',
    date: new Date('2026-04-30T21:00:00+03:00').toISOString(),
    description: 'غلة مبيعات قسم الفلافل ليوم 30/4 - مجموع المبيعات النقدية فقط - دخلت إلى درج المحل',
    amount: 258000,
    type: 'sale_income',
    toAccountId: DRAWER_ACCOUNT_ID,
    category: 'قسم الفلافل / غلة مبيعات 30-4',
  },
  {
    id: 'required-cash-falafel-sales-2026-05-01',
    date: new Date('2026-05-01T21:00:00+03:00').toISOString(),
    description: 'غلة مبيعات قسم الفلافل ليوم 1/5 - مبيعات مفصلة مع بنود تحتاج مراجعة',
    amount: 1242000,
    type: 'sale_income',
    toAccountId: DRAWER_ACCOUNT_ID,
    category: 'قسم الفلافل / غلة مبيعات 1-5',
  },
  {
    id: 'required-cash-bakery-sales-2026-05-01',
    date: new Date('2026-05-01T21:10:00+03:00').toISOString(),
    description: 'غلة مبيعات قسم الفرن ليوم 1/5 - 8 بنود: مشكل 50,000 + بيتزا 70,000 + بيتزا 21,000 + صفيحة 6,000 + صفيحة 50,000 + جبنة 2,000 + مشكل 6,000 + مشكل 4,500',
    amount: 209500,
    type: 'sale_income',
    toAccountId: DRAWER_ACCOUNT_ID,
    category: 'قسم الفرن / غلة مبيعات 1-5',
  },
  {
    id: 'required-admin-payment-to-falafel-manager-2026-04-30',
    date: new Date('2026-04-30T21:05:00+03:00').toISOString(),
    description: 'دفعة من الإدارة إلى مسؤول قسم الفلافل - 100 دولار بسعر 13,250 - عهدة مسؤول القسم وليست درج المحل',
    amount: 1325000,
    type: 'capital_deposit',
    toAccountId: FALAFEL_CUSTODY_ACCOUNT_ID,
    category: 'قسم الفلافل / عهدة مسؤول القسم',
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
  const byAccountId = new Map(accounts.map(account => [account.id, account]));

  byAccountId.set(DRAWER_ACCOUNT_ID, {
    ...(byAccountId.get(DRAWER_ACCOUNT_ID) || { id: DRAWER_ACCOUNT_ID, type: 'cash' as const }),
    id: DRAWER_ACCOUNT_ID,
    name: 'درج المحل (الخزينة الرئيسية)',
    type: 'cash',
  });

  byAccountId.set(FALAFEL_CUSTODY_ACCOUNT_ID, {
    ...(byAccountId.get(FALAFEL_CUSTODY_ACCOUNT_ID) || { id: FALAFEL_CUSTODY_ACCOUNT_ID, type: 'cash' as const }),
    id: FALAFEL_CUSTODY_ACCOUNT_ID,
    name: 'عهدة مسؤول قسم الفلافل',
    type: 'cash',
  });

  writeJson('accounts', Array.from(byAccountId.values()));

  const transactions = readJson<FinancialTransaction[]>('financialTransactions', []);
  const byId = new Map(transactions.map(tx => [tx.id, tx]));

  byId.delete('required-cash-admin-funding-2026-04-30');

  requiredCashMovements.forEach(tx => {
    byId.set(tx.id, tx);
  });

  writeJson('financialTransactions', Array.from(byId.values()));
}
