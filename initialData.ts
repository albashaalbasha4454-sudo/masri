import type { User, Product, Customer, FinancialAccount, Expense, FinancialTransaction } from './types';

// Hashing function for demonstration.
const simpleHash = (password: string, salt: string) => `hashed_${password}_with_${salt}`;

const createInitialUsers = (): User[] => {
    // USE STATIC SALTS FOR PRE-DEFINED USERS
    const adminSalt = 'static_salt_for_admin_user_123';
    const cashierSalt = 'static_salt_for_cashier_user_456';
    return [
        { id: 'user-1', username: 'admin', passwordHash: simpleHash('albasha.123', adminSalt), salt: adminSalt, role: 'admin' },
        { id: 'user-2', username: 'cashier', passwordHash: simpleHash('123', cashierSalt), salt: cashierSalt, role: 'cashier' },
    ];
};

const createInitialProducts = (): Product[] => {
    const products: Product[] = [
        // قسم الفلافل
        { id: 'f-1', name: 'ساندويش بطاطا', type: 'product', category: 'قسم الفلافل', price: 10000 },
        { id: 'f-2', name: 'بيض بمرتديلا', type: 'product', category: 'قسم الفلافل', price: 10000 },
        { id: 'f-3', name: 'بيض مسلوق', type: 'product', category: 'قسم الفلافل', price: 7000 },
        { id: 'f-4', name: 'بيض مقلي', type: 'product', category: 'قسم الفلافل', price: 7000 },
        { id: 'f-5', name: 'بيض مقلي مشروح', type: 'product', category: 'قسم الفلافل', price: 8000 },
        { id: 'f-6', name: 'بيض مقلي صمون', type: 'product', category: 'قسم الفلافل', price: 9000 },
        { id: 'f-7', name: 'بيض مسلوق مشروح', type: 'product', category: 'قسم الفلافل', price: 8000 },
        { id: 'f-8', name: 'بيض مسلوق صمون', type: 'product', category: 'قسم الفلافل', price: 9000 },
        { id: 'f-9', name: 'بيض بمرتديلا صمون', type: 'product', category: 'قسم الفلافل', price: 12000 },
        { id: 'f-10', name: 'بيض بمرتديلا مشروح', type: 'product', category: 'قسم الفلافل', price: 11000 },
        { id: 'f-11', name: 'فول سادة', type: 'product', category: 'قسم الفلافل', price: 16000 },
        { id: 'f-12', name: 'حمص سادة', type: 'product', category: 'قسم الفلافل', price: 18000 },
        { id: 'f-13', name: 'حمص لبن', type: 'product', category: 'قسم الفلافل', price: 30000 },
        { id: 'f-14', name: 'فول بزيت', type: 'product', category: 'قسم الفلافل', price: 28000 },
        { id: 'f-15', name: 'فتة بسمنه', type: 'product', category: 'قسم الفلافل', price: 28000 },
        { id: 'f-16', name: 'حمص بزيت', type: 'product', category: 'قسم الفلافل', price: 28000 },
        { id: 'f-17', name: 'فتة بزيت', type: 'product', category: 'قسم الفلافل', price: 22000 },
        { id: 'f-18', name: 'بدوة', type: 'product', category: 'قسم الفلافل', price: 20000 },
        { id: 'f-19', name: 'مسبحة', type: 'product', category: 'قسم الفلافل', price: 30000 },
        { id: 'f-20', name: 'متبل', type: 'product', category: 'قسم الفلافل', price: 32000 },
        { id: 'f-21', name: 'قرص فلافل', type: 'product', category: 'قسم الفلافل', price: 500 },
        { id: 'f-22', name: 'مخللات 0.5 كيلو', type: 'product', category: 'قسم الفلافل', price: 11000 },
        { id: 'f-23', name: 'مخللات كيلو', type: 'product', category: 'قسم الفلافل', price: 22000 },
        { id: 'f-24', name: 'ساندويش فلافل', type: 'product', category: 'قسم الفلافل', price: 6000 },

        // قسم الشرقي
        { id: 's-1', name: 'اوزي', type: 'product', category: 'قسم الشرقي', price: 0 },
        { id: 's-2', name: 'مندي', type: 'product', category: 'قسم الشرقي', price: 0 },
        { id: 's-3', name: 'رز بخاري مع دجاج عالفحم', type: 'product', category: 'قسم الشرقي', price: 0 },
        { id: 's-4', name: 'فريكة', type: 'product', category: 'قسم الشرقي', price: 0 },
        { id: 's-5', name: 'يالنجي', type: 'product', category: 'قسم الشرقي', price: 0 },
        { id: 's-6', name: 'كبة مقليه', type: 'product', category: 'قسم الشرقي', price: 0 },
        { id: 's-7', name: 'كبة مشوية', type: 'product', category: 'قسم الشرقي', price: 0 },
        { id: 's-8', name: 'حراق اصبعه', type: 'product', category: 'قسم الشرقي', price: 0 },
        { id: 's-9', name: 'صحن فرنسي', type: 'product', category: 'قسم الشرقي', price: 0 },
        { id: 's-10', name: 'قمحية', type: 'product', category: 'قسم الشرقي', price: 0 },
        { id: 's-11', name: 'فتوش', type: 'product', category: 'قسم الشرقي', price: 0 },
        { id: 's-12', name: 'تبولة', type: 'product', category: 'قسم الشرقي', price: 0 },
        { id: 's-13', name: 'متبل شرقي', type: 'product', category: 'قسم الشرقي', price: 0 },
        { id: 's-14', name: 'مسبحة شرقي', type: 'product', category: 'قسم الشرقي', price: 0 },
        { id: 's-15', name: 'كبة لبنية', type: 'product', category: 'قسم الشرقي', price: 0 },
        { id: 's-16', name: 'باشا وعساكره', type: 'product', category: 'قسم الشرقي', price: 0 },
        { id: 's-17', name: 'ششبرك', type: 'product', category: 'قسم الشرقي', price: 0 },
        { id: 's-18', name: 'شوربة عدس', type: 'product', category: 'قسم الشرقي', price: 0 },
        { id: 's-19', name: 'مسخن', type: 'product', category: 'قسم الشرقي', price: 0 },

        // قسم المشويات
        { id: 'm-1', name: 'كباب لحم', type: 'product', category: 'قسم المشويات', price: 0 },
        { id: 'm-2', name: 'شيش مشوي', type: 'product', category: 'قسم المشويات', price: 0 },
        { id: 'm-3', name: 'جناحات', type: 'product', category: 'قسم المشويات', price: 0 },
        { id: 'm-4', name: 'وردات', type: 'product', category: 'قسم المشويات', price: 0 },
        { id: 'm-5', name: 'كباب جاج', type: 'product', category: 'قسم المشويات', price: 0 },
        { id: 'm-6', name: 'دبوس', type: 'product', category: 'قسم المشويات', price: 0 },

        // قسم الغربي
        { id: 'g-1', name: 'ماريا عالفحم', type: 'product', category: 'قسم الغربي', price: 0 },
        { id: 'g-2', name: 'شيش غربي', type: 'product', category: 'قسم الغربي', price: 0 },
        { id: 'g-3', name: 'فاهيتا', type: 'product', category: 'قسم الغربي', price: 0 },
        { id: 'g-4', name: 'فرانشيسكو', type: 'product', category: 'قسم الغربي', price: 0 },
        { id: 'g-5', name: 'دجاج مع الكاري', type: 'product', category: 'قسم الغربي', price: 0 },
        { id: 'g-6', name: 'مكسيكي', type: 'product', category: 'قسم الغربي', price: 0 },
        { id: 'g-7', name: 'برجر دجاج', type: 'product', category: 'قسم الغربي', price: 0 },
        { id: 'g-8', name: 'برجر لحم', type: 'product', category: 'قسم الغربي', price: 0 },
        { id: 'g-9', name: 'بطاطا تشيز', type: 'product', category: 'قسم الغربي', price: 0 },
        { id: 'g-10', name: 'سودة دجاج', type: 'product', category: 'قسم الغربي', price: 0 },
        { id: 'g-11', name: 'سودة غنم', type: 'product', category: 'قسم الغربي', price: 0 },
        { id: 'g-12', name: 'ماريا عالصاج', type: 'product', category: 'قسم الغربي', price: 0 },

        // وجبات
        { id: 'w-1', name: 'حبة دجاج مع الرز 2.5', type: 'product', category: 'وجبات', price: 0 },
        { id: 'w-2', name: 'حبة دجاج 1 كيلو رز', type: 'product', category: 'وجبات', price: 0 },
        { id: 'w-3', name: 'ربع حبة دجاج 0.5 كيلو رز', type: 'product', category: 'وجبات', price: 0 },

        // طواجن
        { id: 't-1', name: 'فخارة يبرق', type: 'product', category: 'طواجن', price: 0 },
        { id: 't-2', name: 'فخارة محاشي', type: 'product', category: 'طواجن', price: 0 },
        { id: 't-3', name: 'فخارة ابوات', type: 'product', category: 'طواجن', price: 0 },
        { id: 't-4', name: 'لحمة بفخارة', type: 'product', category: 'طواجن', price: 0 },
        { id: 't-5', name: 'بطاطا بدجاج بالفخارة', type: 'product', category: 'طواجن', price: 0 },
        { id: 't-6', name: 'فخارتنا', type: 'product', category: 'طواجن', price: 0 },
        { id: 't-7', name: 'بامة بالفخارة', type: 'product', category: 'طواجن', price: 0 },
        { id: 't-8', name: 'ملوخية بالفخارة', type: 'product', category: 'طواجن', price: 0 },

        // الفرن
        { id: 'fr-1', name: 'لحمة', type: 'product', category: 'الفرن', price: 2000 },
        { id: 'fr-2', name: 'جبنه', type: 'product', category: 'الفرن', price: 2000 },
        { id: 'fr-3', name: 'زعتر', type: 'product', category: 'الفرن', price: 2000 },
        { id: 'fr-4', name: 'محمرة', type: 'product', category: 'الفرن', price: 2000 },
        { id: 'fr-5', name: 'مرتديلا قشقوان', type: 'product', category: 'الفرن', price: 3000 },
        { id: 'fr-6', name: 'محمرة قشقوان', type: 'product', category: 'الفرن', price: 3000 },
        { id: 'fr-7', name: 'بيتزا', type: 'product', category: 'الفرن', price: 3000 },
        { id: 'fr-8', name: 'سنفورة', type: 'product', category: 'الفرن', price: 3000 },
        { id: 'fr-9', name: 'سجق', type: 'product', category: 'الفرن', price: 4000 },
        { id: 'fr-10', name: 'توشكا', type: 'product', category: 'الفرن', price: 6000 },
        { id: 'fr-11', name: 'سبانخ', type: 'product', category: 'الفرن', price: 2000 },
        { id: 'fr-12', name: 'كيري', type: 'product', category: 'الفرن', price: 2000 },
        { id: 'fr-13', name: 'شووكولا', type: 'product', category: 'الفرن', price: 2000 },
        { id: 'fr-14', name: 'شيش فرن', type: 'product', category: 'الفرن', price: 5000 },
        { id: 'fr-15', name: 'زيتون', type: 'product', category: 'الفرن', price: 2000 },
        { id: 'fr-16', name: 'بيتزا عائلي', type: 'product', category: 'الفرن', price: 60000 },
        { id: 'fr-17', name: 'بيتزا وسط', type: 'product', category: 'الفرن', price: 40000 },
        { id: 'fr-18', name: 'بيتزا صغير', type: 'product', category: 'الفرن', price: 20000 },
        { id: 'fr-19', name: 'محمرة ولحمة', type: 'product', category: 'الفرن', price: 3000 },
        { id: 'fr-20', name: 'محمرة وزعتر', type: 'product', category: 'الفرن', price: 3000 },
        { id: 'fr-21', name: 'محمرة ومرتديلا', type: 'product', category: 'الفرن', price: 4000 },
        { id: 'fr-22', name: 'زيتون وقشقوان', type: 'product', category: 'الفرن', price: 4000 },
        { id: 'fr-23', name: 'زعتر وقشقوان', type: 'product', category: 'الفرن', price: 3000 },
        { id: 'fr-24', name: 'زعتر وخضار', type: 'product', category: 'الفرن', price: 3000 },
        { id: 'fr-25', name: 'بيض ولحمة', type: 'product', category: 'الفرن', price: 6000 },

        // أخرى / يحتاج تحديد قسم
        { id: 'oth-1', name: 'فول لبن', type: 'product', category: 'يحتاج تحديد قسم', price: 30000 },
    ];
    return products;
};

const createInitialCustomers = (): Customer[] => {
    return [
        { id: 'cust-1', name: 'عميل نقدي', phone: '0000000000', address: '', email: '', notes: 'عميل افتراضي' },
    ];
};

const createInitialAccounts = (): FinancialAccount[] => {
    return [
        { id: 'cash-default', name: 'الخزينة الرئيسية', type: 'cash' },
        { id: 'bank-default', name: 'الحساب البنكي', type: 'bank' },
    ];
}

const createInitialExpenses = (): Expense[] => {
    const rawData = [
        // الفرن
        { desc: 'قرفة 2 كيلو', amount: 46000, review: true, cat: 'الفرن' },
        { desc: 'طحين عدد 5', amount: 1375000, cat: 'الفرن' },
        { desc: 'تنكة زيت عدد 1', amount: 450000, cat: 'الفرن' },
        { desc: 'سكر 5 كيلو', amount: 42500, cat: 'الفرن' },
        { desc: 'زعتر عدد 5', amount: 320000, cat: 'الفرن' },
        { desc: 'مرتديلا عدد 1', amount: 350000, cat: 'الفرن' },
        { desc: 'كاتشب عدد 3', amount: 165000, cat: 'الفرن' },
        { desc: 'طرد خميرة عدد 1', amount: 350000, cat: 'الفرن' },
        { desc: 'دبس رمان عدد 2', amount: 120000, review: true, cat: 'الفرن' },
        { desc: 'زبدة 3 كيلو', amount: 75000, cat: 'الفرن' },
        { desc: 'بيض عدد 6', amount: 180000, cat: 'الفرن' },
        { desc: 'جبنة عدد 14', amount: 462000, review: true, cat: 'الفرن' },
        { desc: 'بندورة 8 كيلو', amount: 125000, cat: 'الفرن' },
        { desc: 'فطر عدد 2', amount: 110000, cat: 'الفرن' },
        { desc: 'زيتون أسود 1 كيلو', amount: 35000, cat: 'الفرن' },
        { desc: 'محشي', amount: 350000, cat: 'الفرن' },
        { desc: 'جبنة جودي عدد 2', amount: 80000, cat: 'الفرن' },
        { desc: 'طرد ملح', amount: 25000, cat: 'الفرن' },
        { desc: 'فلفل أسود 1 كيلو', amount: 115000, cat: 'الفرن' },
        { desc: 'كزبرة ناعمة 1 كيلو', amount: 30000, cat: 'الفرن' },
        { desc: 'بهارات مشكلة', amount: 70000, cat: 'الفرن' },
        { desc: 'سمسم 1 كيلو', amount: 50000, cat: 'الفرن' },
        { desc: 'حبة بركة 1 كيلو', amount: 50000, cat: 'الفرن' },
        { desc: 'حليب بودرة 2 كيلو', amount: 160000, cat: 'الفرن' },
        { desc: 'بهارات شيش', amount: 65000, cat: 'الفرن' },
        { desc: 'دبس فلفل نصف كيلو', amount: 17500, cat: 'الفرن' },
        { desc: 'سماق ناعم', amount: 90000, cat: 'الفرن' },
        { desc: 'سكر عدد 1', amount: 424500, cat: 'الفرن' },
        // الفلافل
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
