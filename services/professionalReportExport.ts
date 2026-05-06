import type { Expense, FinancialAccount, FinancialTransaction, Invoice } from '../types';
import { exportWorkbook, type ExcelSheet } from './excelService';

const money = (value?: number) => Number(value || 0);
const isReview = (notes?: string) => Boolean(notes && (notes.includes('✔') || notes.includes('❓') || notes.includes('مراجعة')));
const reviewFlag = (notes?: string) => notes?.includes('❓') ? '❓' : notes?.includes('✔') ? '✔' : '';
const completion = (expense: Expense) => {
  if (!expense.amount || expense.amount <= 0) return 'غير مكتمل';
  if (isReview(expense.notes)) return 'يحتاج مراجعة';
  return 'مكتمل';
};
const dateKey = (value: string) => new Date(value).toISOString().slice(0, 10);
const dateText = (value: string) => new Date(value).toLocaleDateString('ar-EG');
const accountName = (accounts: FinancialAccount[], id?: string) => accounts.find(a => a.id === id)?.name || 'غير محدد';
const safeSheetName = (name: string) => name.replace(/[\\/?*:[\]]/g, ' ').slice(0, 31) || 'قسم';
const normalizeSection = (value?: string) => {
  const v = (value || 'غير مصنف').trim();
  if (v.includes('فلافل')) return 'قسم الفلافل';
  if (v.includes('فرن')) return 'قسم الفرن';
  if (v.includes('مشوي')) return 'قسم المشويات';
  if (v.includes('شرقي')) return 'قسم الشرقي';
  if (v.includes('غربي')) return 'قسم الغربي';
  return v;
};

function expenseRow(exp: Expense, accounts: FinancialAccount[]) {
  return {
    'ID': exp.id,
    'التاريخ': dateText(exp.date),
    'مفتاح التاريخ': dateKey(exp.date),
    'القسم': normalizeSection(exp.category),
    'نوع السجل': 'مصروف',
    'البيان': exp.description,
    'الكمية / الوحدة': '-',
    'المبلغ الأصلي': money(exp.amount),
    'العملة': 'SYP',
    'سعر الصرف': '-',
    'المبلغ بالليرة': money(exp.amount),
    'الحالة': completion(exp),
    'العلامة': reviewFlag(exp.notes),
    'يحتاج مراجعة؟': isReview(exp.notes) || !exp.amount ? 'نعم' : 'لا',
    'مطابقة الفاتورة': isReview(exp.notes) ? 'تحتاج تحقق' : 'غير مطلوب',
    'فرق المطابقة': 0,
    'الحساب': accountName(accounts, exp.accountId),
    'المستخدم': exp.processedBy || '-',
    'ملاحظات': exp.notes || '-',
  };
}

function lineTotal(item: Invoice['items'][number]) {
  const modifiersTotal = item.modifiers?.reduce((sum, mod) => sum + mod.price, 0) || 0;
  return ((item.price - (item.discount || 0)) + modifiersTotal + (item.manualAddition || 0)) * (item.quantity || 1);
}

function invoiceRows(invoices: Invoice[]) {
  return invoices.flatMap(inv => inv.items.map(item => ({
    'ID الفاتورة': inv.id,
    'التاريخ': dateText(inv.date),
    'مفتاح التاريخ': dateKey(inv.paidDate || inv.date),
    'القسم': normalizeSection(item.category),
    'نوع السجل': inv.type === 'return' ? 'مرتجع' : 'مبيعات',
    'البيان': item.productName,
    'الكمية': item.quantity || 1,
    'سعر الوحدة': item.price,
    'إضافة يدوية': item.manualAddition || 0,
    'خصم': item.discount || 0,
    'الإجمالي': lineTotal(item),
    'حالة الدفع': inv.paymentStatus,
    'حالة الفاتورة': inv.status,
    'المستخدم': inv.processedBy || '-',
    'ملاحظات': item.notes || inv.notes || '-',
  })));
}

function transactionRows(transactions: FinancialTransaction[], accounts: FinancialAccount[]) {
  return transactions.map(tx => ({
    'ID': tx.id,
    'التاريخ': dateText(tx.date),
    'مفتاح التاريخ': dateKey(tx.date),
    'النوع': tx.type,
    'البيان': tx.description,
    'القسم / التصنيف': normalizeSection(tx.category),
    'من حساب': accountName(accounts, tx.fromAccountId),
    'إلى حساب': accountName(accounts, tx.toAccountId),
    'المبلغ': tx.amount,
    'فاتورة مرتبطة': tx.relatedInvoiceId || '-',
    'مصروف مرتبط': tx.relatedExpenseId || '-',
  }));
}

function sectionSales(expenses: Expense[], invoices: Invoice[], section: string) {
  const sales = invoices
    .filter(inv => inv.type !== 'return' && inv.paymentStatus === 'paid')
    .flatMap(inv => inv.items.map(item => ({ item, inv })))
    .filter(({ item }) => normalizeSection(item.category) === section)
    .reduce((sum, { item }) => sum + lineTotal(item), 0);

  const returns = invoices
    .filter(inv => inv.type === 'return')
    .flatMap(inv => inv.items)
    .filter(item => normalizeSection(item.category) === section)
    .reduce((sum, item) => sum + Math.abs(lineTotal(item)), 0);

  const expenseTotal = expenses
    .filter(exp => normalizeSection(exp.category) === section)
    .reduce((sum, exp) => sum + money(exp.amount), 0);

  return { sales, returns, expenseTotal };
}

function summaryRows(expenses: Expense[], invoices: Invoice[], transactions: FinancialTransaction[]) {
  const sections = Array.from(new Set([
    ...expenses.map(e => normalizeSection(e.category)),
    ...invoices.flatMap(i => i.items.map(item => normalizeSection(item.category))),
  ]));

  return sections.map(section => {
    const { sales, returns, expenseTotal } = sectionSales(expenses, invoices, section);
    const reviewCount = expenses.filter(exp => normalizeSection(exp.category) === section && isReview(exp.notes)).length;
    const ratio = sales > 0 ? expenseTotal / sales : expenseTotal > 0 ? 999 : 0;

    return {
      'القسم': section,
      'إجمالي المبيعات': sales,
      'إجمالي المرتجعات': returns,
      'إجمالي المصروفات': expenseTotal,
      'نسبة المصروفات إلى المبيعات': sales > 0 ? `${(ratio * 100).toFixed(2)}%` : 'لا توجد مبيعات',
      'صافي القسم': sales - returns - expenseTotal,
      'عدد بنود المصروفات': expenses.filter(exp => normalizeSection(exp.category) === section).length,
      'بنود تحتاج مراجعة': reviewCount,
      'حالة رقابية': ratio > 1 ? 'خطر: مصروفات أعلى من المبيعات' : ratio > 0.6 ? 'تحذير: مصروفات مرتفعة' : reviewCount > 0 ? 'يحتاج مراجعة' : 'طبيعي',
    };
  });
}

function salesExpenseAuditRows(expenses: Expense[], invoices: Invoice[]) {
  const keys = new Set<string>();
  expenses.forEach(exp => keys.add(`${dateKey(exp.date)}__${normalizeSection(exp.category)}`));
  invoices.forEach(inv => inv.items.forEach(item => keys.add(`${dateKey(inv.paidDate || inv.date)}__${normalizeSection(item.category)}`)));

  return Array.from(keys).sort().map(key => {
    const [day, section] = key.split('__');
    const dayExpenses = expenses.filter(exp => dateKey(exp.date) === day && normalizeSection(exp.category) === section);
    const dayInvoices = invoices.filter(inv => dateKey(inv.paidDate || inv.date) === day);

    const sales = dayInvoices
      .filter(inv => inv.type !== 'return' && inv.paymentStatus === 'paid')
      .flatMap(inv => inv.items)
      .filter(item => normalizeSection(item.category) === section)
      .reduce((sum, item) => sum + lineTotal(item), 0);

    const returns = dayInvoices
      .filter(inv => inv.type === 'return')
      .flatMap(inv => inv.items)
      .filter(item => normalizeSection(item.category) === section)
      .reduce((sum, item) => sum + Math.abs(lineTotal(item)), 0);

    const expenseTotal = dayExpenses.reduce((sum, exp) => sum + money(exp.amount), 0);
    const reviewCount = dayExpenses.filter(exp => isReview(exp.notes) || !exp.amount).length;
    const net = sales - returns - expenseTotal;
    const ratio = sales > 0 ? expenseTotal / sales : expenseTotal > 0 ? 999 : 0;
    const largestExpense = dayExpenses.reduce((max, exp) => money(exp.amount) > money(max?.amount) ? exp : max, undefined as Expense | undefined);

    let risk = 'طبيعي';
    let action = 'لا يوجد إجراء فوري.';
    if (sales === 0 && expenseTotal > 0) {
      risk = 'خطر عال';
      action = 'يوجد صرف بلا غلة مقابلة في نفس اليوم؛ راجع هل البند لليوم نفسه أو لقسم آخر.';
    } else if (ratio > 1) {
      risk = 'خطر عال';
      action = 'المصروفات أعلى من المبيعات؛ راجع استخدام المواد أو نقلها أو تسجيل الغلة.';
    } else if (ratio > 0.6) {
      risk = 'تحذير';
      action = 'نسبة المصروفات مرتفعة؛ راجع البنود الأكبر وسبب الصرف.';
    } else if (reviewCount > 0) {
      risk = 'مراجعة';
      action = 'يوجد بنود عليها ✔ أو ❓؛ أكمل الفاتورة أو اعتمدها بعد التأكد.';
    }

    return {
      'التاريخ': day,
      'القسم': section,
      'مبيعات اليوم': sales,
      'مرتجعات اليوم': returns,
      'مصروفات اليوم': expenseTotal,
      'صافي اليوم للقسم': net,
      'نسبة المصروفات للمبيعات': sales > 0 ? `${(ratio * 100).toFixed(2)}%` : 'لا توجد مبيعات',
      'عدد بنود المصروفات': dayExpenses.length,
      'بنود تحتاج مراجعة': reviewCount,
      'أكبر بند مصروف': largestExpense ? largestExpense.description : '-',
      'قيمة أكبر بند': largestExpense ? money(largestExpense.amount) : 0,
      'مؤشر الخطر': risk,
      'إجراء مقترح': action,
    };
  });
}

function materialUseAuditRows(expenses: Expense[], invoices: Invoice[]) {
  return expenses.map(exp => {
    const section = normalizeSection(exp.category);
    const day = dateKey(exp.date);
    const salesSameDay = invoices
      .filter(inv => dateKey(inv.paidDate || inv.date) === day && inv.type !== 'return' && inv.paymentStatus === 'paid')
      .flatMap(inv => inv.items)
      .filter(item => normalizeSection(item.category) === section)
      .reduce((sum, item) => sum + lineTotal(item), 0);

    const matchingSalesText = invoices
      .filter(inv => dateKey(inv.paidDate || inv.date) === day && inv.type !== 'return')
      .flatMap(inv => inv.items)
      .filter(item => normalizeSection(item.category) === section)
      .map(item => item.productName)
      .join('، ');

    let result = 'طبيعي';
    let note = 'البند مرتبط بقسم له مبيعات في نفس اليوم.';
    if (!salesSameDay && money(exp.amount) > 0) {
      result = 'يحتاج تدقيق';
      note = 'مصروف لقسم لا توجد له مبيعات في نفس اليوم؛ ربما شراء مخزون مسبق أو تم استخدامه في يوم/قسم آخر.';
    } else if (money(exp.amount) > salesSameDay && salesSameDay > 0) {
      result = 'خطر نسبي';
      note = 'قيمة المصروف أعلى من غلة اليوم؛ راجع إن كان مخزوناً لأكثر من يوم.';
    } else if (isReview(exp.notes) || !exp.amount) {
      result = 'مراجعة';
      note = 'البند عليه علامة مراجعة أو غير مكتمل.';
    }

    return {
      'التاريخ': day,
      'القسم': section,
      'المصروف': exp.description,
      'قيمة المصروف': money(exp.amount),
      'غلة نفس القسم في نفس اليوم': salesSameDay,
      'أصناف مباعة في نفس اليوم': matchingSalesText || '-',
      'نتيجة التدقيق': result,
      'ملاحظة رقابية': note,
      'علامة المراجعة': reviewFlag(exp.notes),
      'ملاحظات المصروف': exp.notes || '-',
    };
  });
}

export function exportProfessionalExpensesWorkbook(expenses: Expense[], accounts: FinancialAccount[]) {
  const sections = Array.from(new Set(expenses.map(e => normalizeSection(e.category))));
  const allRows = expenses.map(exp => expenseRow(exp, accounts));
  const reviewRows = expenses.filter(exp => isReview(exp.notes) || !exp.amount).map(exp => expenseRow(exp, accounts));
  const sheets: ExcelSheet[] = [
    { name: 'لوحة المصروفات', rows: sections.map(section => ({
      'القسم': section,
      'عدد البنود': expenses.filter(e => normalizeSection(e.category) === section).length,
      'الإجمالي': expenses.filter(e => normalizeSection(e.category) === section).reduce((s, e) => s + money(e.amount), 0),
      'بنود تحتاج مراجعة': expenses.filter(e => normalizeSection(e.category) === section && isReview(e.notes)).length,
      'بنود غير مكتملة': expenses.filter(e => normalizeSection(e.category) === section && (!e.amount || e.amount <= 0)).length,
    })) },
    { name: 'سجل المصروفات', rows: allRows },
    { name: 'بنود تحتاج مراجعة', rows: reviewRows },
    ...sections.map(section => ({
      name: safeSheetName(`مصروفات ${section}`),
      rows: expenses.filter(e => normalizeSection(e.category) === section).map(exp => expenseRow(exp, accounts)),
    })),
    { name: 'دليل الملء', rows: [
      { 'الحقل': 'التاريخ', 'طريقة الملء': 'اكتب تاريخ المصروف الحقيقي', 'مثال': '2026-05-01' },
      { 'الحقل': 'القسم', 'طريقة الملء': 'اختر القسم المسؤول عن المصروف', 'مثال': 'قسم المشويات' },
      { 'الحقل': 'العلامة', 'طريقة الملء': 'استخدم ✔ للمراجعة العادية و ❓ للقيمة أو البيان غير المؤكد', 'مثال': '❓' },
      { 'الحقل': 'الحالة', 'طريقة الملء': 'مكتمل / يحتاج مراجعة / غير مكتمل', 'مثال': 'مكتمل' },
    ] },
  ];

  exportWorkbook(sheets, 'تقرير_المصروفات_الاحترافي', { title: 'مطابخ الشرق - تقرير المصروفات الاحترافي', period: 'كل البيانات المسجلة' });
}

export function exportProfessionalFullWorkbook(expenses: Expense[], invoices: Invoice[], transactions: FinancialTransaction[], accounts: FinancialAccount[]) {
  const sections = Array.from(new Set([
    ...expenses.map(e => normalizeSection(e.category)),
    ...invoices.flatMap(i => i.items.map(item => normalizeSection(item.category))),
  ]));

  const sheets: ExcelSheet[] = [
    { name: 'لوحة التحكم', rows: summaryRows(expenses, invoices, transactions) },
    { name: 'تدقيق صرف مقابل غلة', rows: salesExpenseAuditRows(expenses, invoices) },
    { name: 'تدقيق استخدام المواد', rows: materialUseAuditRows(expenses, invoices) },
    { name: 'المصروفات', rows: expenses.map(exp => expenseRow(exp, accounts)) },
    { name: 'المبيعات والفواتير', rows: invoiceRows(invoices) },
    { name: 'الخزينة', rows: transactionRows(transactions, accounts) },
    { name: 'بنود تحتاج مراجعة', rows: expenses.filter(exp => isReview(exp.notes) || !exp.amount).map(exp => expenseRow(exp, accounts)) },
    ...sections.map(section => ({
      name: safeSheetName(`قسم ${section}`),
      rows: [
        ...invoiceRows(invoices).filter(row => row['القسم'] === section),
        ...expenses.filter(exp => normalizeSection(exp.category) === section).map(exp => expenseRow(exp, accounts)),
      ],
    })),
    { name: 'دليل الرقابة', rows: [
      { 'القاعدة': 'الغلة ليست مصروفات', 'التطبيق': 'تدخل من زر تسجيل غلة مبيعات وتظهر في الفواتير والتقارير' },
      { 'القاعدة': 'المصروف يخصم من صافي القسم', 'التطبيق': 'يدخل من المصروفات أو الخزينة ويربط بالقسم والحساب' },
      { 'القاعدة': 'العهدة ليست ربحاً ولا مصروفاً', 'التطبيق': 'تظهر في الخزينة كحساب مستقل لمسؤول القسم' },
      { 'القاعدة': 'مصروف بلا مبيعات في نفس اليوم', 'التطبيق': 'يظهر في ورقة تدقيق صرف مقابل غلة كخطر عال أو يحتاج تدقيق' },
      { 'القاعدة': 'مصروفات أعلى من الغلة', 'التطبيق': 'تظهر كمؤشر خطر ويجب مراجعة هل هي مخزون لأكثر من يوم أو تحويل لقسم آخر' },
      { 'القاعدة': 'كل قسم مستقل', 'التطبيق': 'كل قسم له ورقة منفصلة في هذا الملف' },
    ] },
  ];

  exportWorkbook(sheets, 'تقرير_مطابخ_الشرق_الشامل', { title: 'مطابخ الشرق - تقرير شامل احترافي مع تدقيق صرف مقابل الغلة', period: 'كل البيانات المسجلة' });
}
