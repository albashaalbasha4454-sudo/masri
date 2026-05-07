import type { FinancialAccount, Product } from './types';

export type StoreSection = {
  id: string;
  name: string;
  description: string;
  instructions: string;
  managerName: string;
  color: string;
  isActive: boolean;
  accountId: string;
};

export const CLEAN_STORE_VERSION = 'matabikh-clean-store-v1';

export const CLEAN_STORE_SECTIONS: StoreSection[] = [
  {
    id: 'falafel',
    name: 'قسم الفلافل',
    description: 'قسم الفلافل والفول والحمص والمسبحة والفتة والمخللات والسندويشات المرتبطة به.',
    instructions: 'تسجل الغلة اليومية كغلة مبيعات وليست مصروفاً. تسجل مواد القسم كمصروفات مرتبطة بالقسم. أي بند بعلامة ✔ أو ❓ يبقى للمراجعة حتى يعتمده المدير.',
    managerName: 'مسؤول قسم الفلافل',
    color: '#16a34a',
    isActive: true,
    accountId: 'cash-default',
  },
  {
    id: 'bakery',
    name: 'قسم الفرن',
    description: 'قسم البيتزا والمعجنات والصفيحة والجبنة والمشكل ومنتجات الفرن.',
    instructions: 'تسجل مبيعات الفرن كفواتير أو غلة يدوية حسب طريقة التشغيل. مصروفات الطحين والزيت والجبنة والمواد ترتبط بقسم الفرن فقط.',
    managerName: 'مسؤول قسم الفرن',
    color: '#ea580c',
    isActive: true,
    accountId: 'cash-default',
  },
  {
    id: 'eastern',
    name: 'قسم الشرقي',
    description: 'قسم الوجبات والأطباق الشرقية والطواجن والطلبات المرتبطة بالمطبخ الشرقي.',
    instructions: 'تسجل الوجبات الشرقية كفواتير مفصلة. أي مصروف مواد خاص بالشرقي يجب ربطه بهذا القسم حتى يظهر صافي القسم بدقة.',
    managerName: 'مسؤول قسم الشرقي',
    color: '#7c3aed',
    isActive: true,
    accountId: 'cash-default',
  },
  {
    id: 'meat-grills',
    name: 'قسم اللحومات والمشاوي',
    description: 'قسم اللحومات والشيش والمشاوي والدهن والمواد المرتبطة بالمشويات.',
    instructions: 'تسجل مصروفات اللحوم والدهن والشيش هنا. يجب مراجعة أي مصروف كبير مقارنة بالغلة اليومية للتأكد هل هو مخزون لأيام لاحقة أم استخدام يومي.',
    managerName: 'مسؤول قسم اللحومات والمشاوي',
    color: '#dc2626',
    isActive: true,
    accountId: 'cash-default',
  },
];

export const CLEAN_STORE_ACCOUNTS: FinancialAccount[] = [
  { id: 'cash-default', name: 'درج المحل (الخزينة الرئيسية)', type: 'cash' },
  { id: 'falafel-manager-custody', name: 'عهدة مسؤول قسم الفلافل', type: 'cash' },
  { id: 'bakery-manager-custody', name: 'عهدة مسؤول قسم الفرن', type: 'cash' },
  { id: 'eastern-manager-custody', name: 'عهدة مسؤول قسم الشرقي', type: 'cash' },
  { id: 'meat-grills-manager-custody', name: 'عهدة مسؤول قسم اللحومات والمشاوي', type: 'cash' },
];

export const CLEAN_STORE_PRODUCTS: Product[] = [
  { id: 'clean-falafel-sandwich', name: 'سندويش فلافل', type: 'product', category: 'قسم الفلافل', price: 0, isAvailable: true, reviewStatus: 'needs_price', description: 'صنف أساسي في قسم الفلافل. أدخل السعر قبل البيع.' },
  { id: 'clean-falafel-plate', name: 'صحن فلافل', type: 'product', category: 'قسم الفلافل', price: 0, isAvailable: true, reviewStatus: 'needs_price', description: 'صحن فلافل للتسعير حسب سياسة المحل.' },
  { id: 'clean-hummus', name: 'صحن حمص', type: 'product', category: 'قسم الفلافل', price: 0, isAvailable: true, reviewStatus: 'needs_price', description: 'حمص مرتبط بقسم الفلافل.' },
  { id: 'clean-foul', name: 'صحن فول', type: 'product', category: 'قسم الفلافل', price: 0, isAvailable: true, reviewStatus: 'needs_price', description: 'فول مرتبط بقسم الفلافل.' },
  { id: 'clean-musabaha', name: 'مسبحة', type: 'product', category: 'قسم الفلافل', price: 0, isAvailable: true, reviewStatus: 'needs_price', description: 'مسبحة للتسعير.' },
  { id: 'clean-fatteh', name: 'فتة', type: 'product', category: 'قسم الفلافل', price: 0, isAvailable: true, reviewStatus: 'needs_price', description: 'فتة للتسعير.' },
  { id: 'clean-pickles', name: 'مخلل', type: 'product', category: 'قسم الفلافل', price: 0, isAvailable: true, reviewStatus: 'needs_price', description: 'مخلل يباع أو يضاف حسب التشغيل.' },

  { id: 'clean-pizza', name: 'بيتزا', type: 'product', category: 'قسم الفرن', price: 0, isAvailable: true, reviewStatus: 'needs_price', description: 'بيتزا قسم الفرن.' },
  { id: 'clean-sfiha', name: 'صفيحة', type: 'product', category: 'قسم الفرن', price: 0, isAvailable: true, reviewStatus: 'needs_price', description: 'صفيحة قسم الفرن.' },
  { id: 'clean-cheese-pastry', name: 'معجنات جبنة', type: 'product', category: 'قسم الفرن', price: 0, isAvailable: true, reviewStatus: 'needs_price', description: 'معجنات جبنة للتسعير.' },
  { id: 'clean-mix-bakery', name: 'مشكل فرن', type: 'product', category: 'قسم الفرن', price: 0, isAvailable: true, reviewStatus: 'needs_price', description: 'مشكل من منتجات الفرن.' },

  { id: 'clean-eastern-meal', name: 'وجبة شرقي', type: 'product', category: 'قسم الشرقي', price: 0, isAvailable: true, reviewStatus: 'needs_price', description: 'وجبة شرقية عامة للتسعير.' },
  { id: 'clean-tajin', name: 'طاجن', type: 'product', category: 'قسم الشرقي', price: 0, isAvailable: true, reviewStatus: 'needs_price', description: 'طاجن من قسم الشرقي.' },
  { id: 'clean-rice-meal', name: 'وجبة رز', type: 'product', category: 'قسم الشرقي', price: 0, isAvailable: true, reviewStatus: 'needs_price', description: 'وجبة رز شرقية للتسعير.' },

  { id: 'clean-shish', name: 'شيش', type: 'product', category: 'قسم اللحومات والمشاوي', price: 0, isAvailable: true, reviewStatus: 'needs_price', description: 'شيش من قسم اللحومات والمشاوي.' },
  { id: 'clean-grills-mix', name: 'مشاوي مشكل', type: 'product', category: 'قسم اللحومات والمشاوي', price: 0, isAvailable: true, reviewStatus: 'needs_price', description: 'مشاوي مشكل للتسعير.' },
  { id: 'clean-meat', name: 'لحم', type: 'product', category: 'قسم اللحومات والمشاوي', price: 0, isAvailable: true, reviewStatus: 'needs_price', description: 'لحم من قسم المشاوي.' },
];

export function applyCleanStoreSetup() {
  if (typeof window === 'undefined') return;

  const confirmed = window.confirm('سيتم تجهيز نسخة محل جديدة بصفر حسابات. سيتم مسح الفواتير والمبيعات والمصروفات والخزينة القديمة من هذا المتصفح فقط. هل تريد المتابعة؟');
  if (!confirmed) return;

  window.localStorage.setItem('storeSections', JSON.stringify(CLEAN_STORE_SECTIONS));
  window.localStorage.setItem('financialAccounts', JSON.stringify(CLEAN_STORE_ACCOUNTS));
  window.localStorage.setItem('accounts', JSON.stringify(CLEAN_STORE_ACCOUNTS));
  window.localStorage.setItem('products', JSON.stringify(CLEAN_STORE_PRODUCTS));

  window.localStorage.setItem('invoices', JSON.stringify([]));
  window.localStorage.setItem('expenses', JSON.stringify([]));
  window.localStorage.setItem('financialTransactions', JSON.stringify([]));
  window.localStorage.setItem('customers', JSON.stringify([]));
  window.localStorage.setItem('activityLogs', JSON.stringify([{
    id: `log-clean-setup-${Date.now()}`,
    userId: 'system',
    username: 'النظام',
    operation: 'تهيئة نسخة محل جديدة',
    description: 'تم إنشاء نسخة تشغيل نظيفة بصفر حسابات مع الأقسام الأساسية والمنتجات الأولية.',
    date: new Date().toISOString(),
  }]));
  window.localStorage.setItem('appVersion', CLEAN_STORE_VERSION);

  window.alert('تم تجهيز نسخة محل جديدة بنجاح. سيتم تحديث الصفحة الآن.');
  window.location.reload();
}
