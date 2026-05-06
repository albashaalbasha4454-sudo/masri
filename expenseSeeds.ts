import type { Expense, FinancialTransaction, Invoice } from './types';

type RequiredExpenseSeed = {
  id: string;
  description: string;
  amount: number;
  category: string;
  notes?: string;
  date?: string;
};

const SEED_DATE = new Date('2026-04-30T12:00:00+03:00').toISOString();
const MAY_1_DATE = new Date('2026-05-01T12:00:00+03:00').toISOString();

const requiredExpenses: RequiredExpenseSeed[] = [
  { id: 'falafel-pickle', description: 'مخلل', amount: 820000, category: 'الفلافل' },
  { id: 'falafel-beans-hummus-oil', description: 'موزع فول وحمص وزيت - 665 دولار × 13,250', amount: 8811250, category: 'الفلافل', notes: '665 دولار بسعر 13,250' },
  { id: 'falafel-oil-4kg', description: 'زيت 4 كيلو', amount: 300000, category: 'الفلافل' },
  { id: 'falafel-yogurt-3', description: 'لبن عدد 3', amount: 57000, category: 'الفلافل' },
  { id: 'falafel-vegetables', description: 'خضرة', amount: 380000, category: 'الفلافل' },
  { id: 'falafel-spices-ketchup-molasses-mustard-ghee-eggs', description: 'بهارات + كاتشب + دبس + خردل + سمن + بيض', amount: 1400000, category: 'الفلافل' },
  { id: 'falafel-nylon', description: 'نايلون كامل', amount: 113000, category: 'الفلافل' },
  { id: 'falafel-cleaners', description: 'منظفات', amount: 140000, category: 'الفلافل' },
  { id: 'falafel-gas-3', description: '3 غاز', amount: 750000, category: 'الفلافل', notes: '✔ يحتاج مراجعة' },
  { id: 'falafel-bread', description: 'خبز عادي + خبز سياحي', amount: 110000, category: 'الفلافل' },
  { id: 'falafel-potatoes-20kg', description: 'بطاطا 20 كيلو', amount: 160000, category: 'الفلافل' },
  { id: 'falafel-samoon-mashrouh', description: 'سمون + مشروح', amount: 0, category: 'الفلافل', notes: '❓ يحتاج مراجعة: القيمة غير معروفة' },
  { id: 'bakery-cinnamon-2kg', description: 'قرفة 2 كيلو', amount: 46000, category: 'الفرن', notes: '✔ يحتاج مراجعة' },
  { id: 'bakery-flour-5', description: 'طحين عدد 5', amount: 1375000, category: 'الفرن' },
  { id: 'bakery-oil-tin-1', description: 'تنكة زيت عدد 1', amount: 450000, category: 'الفرن' },
  { id: 'bakery-sugar-5kg', description: 'سكر 5 كيلو', amount: 42500, category: 'الفرن' },
  { id: 'bakery-zaatar-5', description: 'زعتر عدد 5', amount: 320000, category: 'الفرن' },
  { id: 'bakery-mortadella-1', description: 'مرتديلا عدد 1', amount: 350000, category: 'الفرن' },
  { id: 'bakery-ketchup-3', description: 'كاتشب عدد 3', amount: 165000, category: 'الفرن' },
  { id: 'bakery-yeast-box-1', description: 'طرد خميرة عدد 1', amount: 350000, category: 'الفرن' },
  { id: 'bakery-pomegranate-molasses-2', description: 'دبس رمان عدد 2', amount: 120000, category: 'الفرن', notes: '✔ يحتاج مراجعة' },
  { id: 'bakery-butter-3kg', description: 'زبدة 3 كيلو', amount: 75000, category: 'الفرن' },
  { id: 'bakery-eggs-6', description: 'بيض عدد 6', amount: 180000, category: 'الفرن' },
  { id: 'bakery-cheese-14', description: 'جبنة عدد 14', amount: 462000, category: 'الفرن', notes: '✔ يحتاج مراجعة' },
  { id: 'bakery-tomatoes-8kg', description: 'بندورة 8 كيلو', amount: 125000, category: 'الفرن' },
  { id: 'bakery-mushroom-2', description: 'فطر عدد 2', amount: 110000, category: 'الفرن' },
  { id: 'bakery-black-olives-1kg', description: 'زيتون أسود 1 كيلو', amount: 35000, category: 'الفرن' },
  { id: 'bakery-mahshi', description: 'محشي', amount: 350000, category: 'الفرن' },
  { id: 'bakery-joudi-cheese-2', description: 'جبنة جودي عدد 2', amount: 80000, category: 'الفرن' },
  { id: 'bakery-salt-box', description: 'طرد ملح', amount: 25000, category: 'الفرن' },
  { id: 'bakery-black-pepper-1kg', description: 'فلفل أسود 1 كيلو', amount: 115000, category: 'الفرن' },
  { id: 'bakery-coriander-1kg', description: 'كزبرة ناعمة 1 كيلو', amount: 30000, category: 'الفرن' },
  { id: 'bakery-mixed-spices', description: 'بهارات مشكلة', amount: 70000, category: 'الفرن' },
  { id: 'bakery-sesame-1kg', description: 'سمسم 1 كيلو', amount: 50000, category: 'الفرن' },
  { id: 'bakery-black-seed-1kg', description: 'حبة بركة 1 كيلو', amount: 50000, category: 'الفرن' },
  { id: 'bakery-powdered-milk-2kg', description: 'حليب بودرة 2 كيلو', amount: 160000, category: 'الفرن' },
  { id: 'bakery-shish-spices', description: 'بهارات شيش', amount: 65000, category: 'الفرن' },
  { id: 'bakery-pepper-molasses-half-kg', description: 'دبس فلفل نصف كيلو', amount: 17500, category: 'الفرن' },
  { id: 'bakery-sumac-soft', description: 'سماق ناعم', amount: 90000, category: 'الفرن' },
  { id: 'bakery-sugar-1', description: 'سكر عدد 1', amount: 424500, category: 'الفرن' },
  { id: 'grills-meat-fat-2026-05-01', description: 'لحم ودهن', amount: 100000, category: 'قسم المشويات', notes: '✔ يجب المراجعة', date: MAY_1_DATE },
  { id: 'grills-inquiries-2026-05-01', description: 'استفسامات', amount: 100000, category: 'قسم المشويات', notes: '❓ يجب المراجعة', date: MAY_1_DATE },
  { id: 'grills-shish-2026-05-01', description: 'شيش', amount: 150000, category: 'قسم المشويات', date: MAY_1_DATE },
];

const expenseId = (seed: RequiredExpenseSeed) => `required-exp-${seed.id}`;
const transactionId = (seed: RequiredExpenseSeed) => `required-tx-${seed.id}`;

const toExpense = (seed: RequiredExpenseSeed): Expense => ({
  id: expenseId(seed),
  date: seed.date || SEED_DATE,
  description: seed.description,
  amount: seed.amount,
  category: seed.category,
  accountId: 'cash-default',
  processedBy: 'admin',
  notes: seed.notes || 'مسجل بتاريخ 30/4',
  status: seed.amount > 0 ? (seed.notes?.includes('مراجعة') ? 'needs_review' : 'completed') : 'needs_review',
  reviewFlag: seed.notes?.includes('❓') ? 'question' : seed.notes?.includes('✔') ? 'check' : null,
  linkedTransactionId: transactionId(seed),
});

const toTransaction = (expense: Expense): FinancialTransaction => ({
  id: expense.linkedTransactionId || `required-tx-${expense.id}`,
  date: expense.date,
  description: expense.description,
  amount: expense.amount || 0,
  type: 'expense',
  fromAccountId: expense.accountId,
  category: expense.category,
  relatedExpenseId: expense.id,
});

const manualInvoiceId = (tx: FinancialTransaction) => `manual-inv-${tx.id}`;

const toManualSalesInvoice = (tx: FinancialTransaction): Invoice => ({
  id: manualInvoiceId(tx),
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
    notes: 'فاتورة مختصرة مولدة من حركة الخزينة لربط الغلة بالفواتير والتقارير.',
  }],
  total: tx.amount,
  customerInfo: { name: 'غلة يدوية / درج المحل', phone: '', address: '' },
  notes: `مولدة من حركة خزينة: ${tx.description}`,
  status: 'completed',
  paymentStatus: 'paid',
  paidDate: tx.date,
  processedBy: 'admin',
  paymentMethod: 'cash',
});

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

function syncManualSalesInvoicesFromTransactions(nativeSetItem?: (key: string, value: string) => void) {
  const transactions = readJson<FinancialTransaction[]>('financialTransactions', []);
  const invoices = readJson<Invoice[]>('invoices', []);
  const byInvoiceId = new Map(invoices.map(invoice => [invoice.id, invoice]));
  let changed = false;

  transactions.forEach(tx => {
    if (tx.type !== 'sale_income' || tx.relatedInvoiceId || tx.amount <= 0) return;
    const invoice = toManualSalesInvoice(tx);
    const old = byInvoiceId.get(invoice.id);
    if (!old || old.total !== invoice.total || old.date !== invoice.date || old.items[0]?.productName !== invoice.items[0]?.productName || old.items[0]?.category !== invoice.items[0]?.category) {
      byInvoiceId.set(invoice.id, invoice);
      changed = true;
    }
  });

  if (changed) {
    const payload = JSON.stringify(Array.from(byInvoiceId.values()));
    if (nativeSetItem) nativeSetItem('invoices', payload);
    else window.localStorage.setItem('invoices', payload);
  }
}

export function seedRequiredExpenses() {
  if (typeof window === 'undefined') return;

  const currentExpenses = readJson<Expense[]>('expenses', []);
  const byId = new Map(currentExpenses.map(exp => [exp.id, exp]));

  requiredExpenses.forEach(seed => {
    byId.set(expenseId(seed), toExpense(seed));
  });

  const nextExpenses = Array.from(byId.values());
  writeJson('expenses', nextExpenses);

  const currentTransactions = readJson<FinancialTransaction[]>('financialTransactions', []);
  const nonSeedTransactions = currentTransactions.filter(tx => !tx.id.startsWith('required-tx-'));
  const seedTransactions = nextExpenses.filter(exp => exp.id.startsWith('required-exp-')).map(toTransaction);

  writeJson('financialTransactions', [...nonSeedTransactions, ...seedTransactions]);
  syncManualSalesInvoicesFromTransactions();
}

export function installExpenseTransactionSync() {
  if (typeof window === 'undefined') return;

  const nativeSetItem = window.localStorage.setItem.bind(window.localStorage);

  window.localStorage.setItem = (key: string, value: string) => {
    nativeSetItem(key, value);

    if (key === 'financialTransactions') {
      syncManualSalesInvoicesFromTransactions(nativeSetItem);
      return;
    }

    if (key !== 'expenses') return;

    try {
      const nextExpenses = JSON.parse(value) as Expense[];
      const currentTransactions = readJson<FinancialTransaction[]>('financialTransactions', []);
      const byExpenseId = new Map(currentTransactions.filter(tx => tx.relatedExpenseId).map(tx => [tx.relatedExpenseId as string, tx]));
      const untouchedTransactions = currentTransactions.filter(tx => tx.type !== 'expense' || (tx.relatedExpenseId && !nextExpenses.some(exp => exp.id === tx.relatedExpenseId)));

      const syncedExpenseTransactions = nextExpenses.map(exp => {
        const previous = byExpenseId.get(exp.id);
        return {
          ...(previous || {}),
          id: previous?.id || exp.linkedTransactionId || `tx-exp-${exp.id}`,
          date: exp.date,
          description: exp.description,
          amount: exp.amount || 0,
          type: 'expense' as const,
          fromAccountId: exp.accountId,
          category: exp.category,
          relatedExpenseId: exp.id,
        };
      });

      nativeSetItem('financialTransactions', JSON.stringify([...untouchedTransactions, ...syncedExpenseTransactions]));
      syncManualSalesInvoicesFromTransactions(nativeSetItem);
    } catch {
      // Keep the app running even if stored data is malformed.
    }
  };

  syncManualSalesInvoicesFromTransactions(nativeSetItem);
}
