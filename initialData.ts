import type { User, Product, Customer, FinancialAccount, Expense, FinancialTransaction } from './types';

const createInitialUsers = (): User[] => {
    return [
        { id: 'user-1', username: 'admin', passwordHash: 'hashed_albasha.123_with_static_salt_for_admin_user_123', salt: 'static_salt_for_admin_user_123', role: 'admin' },
        { id: 'user-2', username: 'cashier', passwordHash: 'hashed_123_with_static_salt_for_cashier_user_456', salt: 'static_salt_for_cashier_user_456', role: 'cashier' },
    ];
};

const createInitialProducts = (): Product[] => {
    return [
        { id: 'sand-1', name: 'سندويش فلافل كبيرة', type: 'product', category: 'قائمة السندويشات', price: 6000 },
        { id: 'sand-2', name: 'سندويش مرتديلا كبيرة', type: 'product', category: 'قائمة السندويشات', price: 0 },
        { id: 'sand-3', name: 'سندويش مرتديلا مع بيض كبيرة', type: 'product', category: 'قائمة السندويشات', price: 10000 },
        { id: 'sand-4', name: 'سندويش سجق كبيرة', type: 'product', category: 'قائمة السندويشات', price: 0 },
        { id: 'sand-5', name: 'سندويش بطاطا مقلية كبيرة', type: 'product', category: 'قائمة السندويشات', price: 10000 },
        { id: 'sand-6', name: 'سندويش سودة دجاج كبيرة', type: 'product', category: 'قائمة السندويشات', price: 0 },
        { id: 'sand-7', name: 'سندويش شيش طاووق كبيرة', type: 'product', category: 'قائمة السندويشات', price: 0 },
        { id: 'sand-8', name: 'سندويش بيض مسلوق كبيرة', type: 'product', category: 'قائمة السندويشات', price: 7000 },
        { id: 'sand-9', name: 'سندويش بيض مقلي كبيرة', type: 'product', category: 'قائمة السندويشات', price: 7000 },
        { id: 'meal-1', name: 'صحن فول باللبن', type: 'product', category: 'قائمة الوجبات', price: 30000 },
        { id: 'meal-2', name: 'صحن فول بزيت', type: 'product', category: 'قائمة الوجبات', price: 28000 },
        { id: 'meal-3', name: 'صحن حمص باللبن', type: 'product', category: 'قائمة الوجبات', price: 30000 },
        { id: 'meal-4', name: 'صحن حمص بزيت', type: 'product', category: 'قائمة الوجبات', price: 28000 },
        { id: 'meal-5', name: 'صحن فتة', type: 'product', category: 'قائمة الوجبات', price: 22000 },
        { id: 'meal-6', name: 'صحن فتة بسمنة', type: 'product', category: 'قائمة الوجبات', price: 28000 },
        { id: 'meal-7', name: 'صحن مسبحة حمص بالطحينة', type: 'product', category: 'قائمة الوجبات', price: 30000 },
        { id: 'meal-8', name: 'صحن بطاطا مقلية', type: 'product', category: 'قائمة الوجبات', price: 0 },
        { id: 'meal-9', name: 'صحن فلافل', type: 'product', category: 'قائمة الوجبات', price: 0 },
        { id: 'meal-10', name: 'صحن بيض مقلي', type: 'product', category: 'قائمة الوجبات', price: 7000 },
        { id: 'meal-11', name: 'صحن بيض مسلوق', type: 'product', category: 'قائمة الوجبات', price: 7000 },
        { id: 'extra-1', name: 'قرص فلافل', type: 'product', category: 'إضافات', price: 500 },
        { id: 'extra-2', name: 'مخللات نصف كيلو', type: 'product', category: 'إضافات', price: 11000 },
        { id: 'extra-3', name: 'مخللات كيلو', type: 'product', category: 'إضافات', price: 22000 }
    ];
};

const createInitialCustomers = (): Customer[] => [
    { id: 'cust-1', name: 'عميل نقدي', phone: '0000000000', address: '', email: '', notes: 'عميل افتراضي' },
];

const createInitialAccounts = (): FinancialAccount[] => [
    { id: 'cash-default', name: 'الخزينة الرئيسية', type: 'cash' },
    { id: 'bank-default', name: 'الحساب البنكي', type: 'bank' },
];

const createInitialExpenses = (): Expense[] => {
    const rawData = [
        { desc: 'مخلل', amount: 820000, cat: 'الفلافل' },
        { desc: 'موزع فول وحمص وزيت (665 دولار)', amount: 8811250, cat: 'الفلافل' },
        { desc: 'زيت 4 كيلو', amount: 300000, cat: 'الفلافل' },
        { desc: 'لبن عدد 3', amount: 57000, cat: 'الفلافل' },
        { desc: 'خضرة', amount: 380000, cat: 'الفلافل' },
        { desc: 'بهارات + كاتشب + دبس + خردل + سمن + بيض', amount: 1400000, cat: 'الفلافل' },
        { desc: 'نايلون كامل', amount: 113000, cat: 'الفلافل' },
        { desc: 'منظفات', amount: 140000, cat: 'الفلافل' },
        { desc: '3 غاز', amount: 750000, review: true, cat: 'الفلافل' },
        { desc: 'خبز عادي + خبز سياحي', amount: 110000, cat: 'الفلافل' },
        { desc: 'بطاطا 20 كيلو', amount: 160000, cat: 'الفلافل' },
        { desc: 'سمون + مشروح', amount: 0, review: true, cat: 'الفلافل', q: true },
    ];
    return rawData.map((item, index) => ({
        id: `exp-init-${index}`,
        date: new Date('2026-05-01T00:00:00Z').toISOString(),
        description: item.desc,
        amount: item.amount,
        category: item.cat,
        accountId: 'cash-default',
        processedBy: 'admin',
        notes: item.q ? '❓ يحتاج مراجعة (السعر غير معروف)' : (item.review ? '✔ يحتاج مراجعة' : 'مسجل')
    }));
};

const createInitialTransactions = (expenses: Expense[]): FinancialTransaction[] => {
    return expenses.map((exp, index) => ({
        id: `tx-init-${index}`,
        date: exp.date,
        description: exp.description,
        amount: exp.amount,
        type: 'expense',
        fromAccountId: exp.accountId,
        category: exp.category
    }));
};

export const initialUsers = createInitialUsers();
export const initialProducts = createInitialProducts();
export const initialCustomers = createInitialCustomers();
export const initialAccounts = createInitialAccounts();
export const initialExpenses = createInitialExpenses();
export const initialTransactions = createInitialTransactions(initialExpenses);
