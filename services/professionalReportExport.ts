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
const dateText = (value: string) => new Date(value).toLocaleDateString('ar-EG');
const accountName = (accounts: FinancialAccount[], id?: string) => accounts.find(a => a.id === id)?.name || 'غير محدد';
const safeSheetName = (name: string) => name.replace(/[\\/?*:[\]]/g, ' ').slice(0, 31) || 'قسم';

function expenseRow(exp: Expense, accounts: FinancialAccount[]) {
  return {
    'ID': exp.id,
    'التاريخ': dateText(exp.date),
    'القسم': exp.category || 'غير مصنف',
    'نوع السجل': 'مصروف',
    'البيان': exp.description,
    'الكمية / الوحدة': '-',
    'المبلغ الأصلي': money(exp.amount),
    'العملة': 'SYP',
    'سعر الصرف': '-',
    'المبلغ بالليرة': money(exp.amount),
    'الحالة': completion(exp),
    'العلامة': reviewFlag(exp.notes),
    'يحتاج مراجعة؟': isReview(exp.notes) ? 'نعم' : 'لا',
    'مطابقة الفاتورة': isReview(exp.notes) ? 'تحتاج تحقق' : 'غير مطلوب',
    'فرق المطابقة': 0,
    'الحساب': accountName(accounts, exp.accountId),
    'المستخدم': exp.processedBy || '-',
    'ملاحظات': exp.notes || '-',
  };
}

function invoiceRows(invoices: Invoice[]) {
  return invoices.flatMap(inv => inv.items.map(item => ({
    'ID الفاتورة': inv.id,
    'التاريخ': dateText(inv.date),
    'القسم': item.category || 'غير مصنف',
    'نوع السجل': inv.type === 'return' ? 'مرتجع' : 'مبيعات',
    'البيان': item.productName,
    'الكمية': item.quantity || 1,
    'سعر الوحدة': item.price,
    'إضافة يدوية': item.manualAddition || 0,
    'خصم': item.discount || 0,
    'الإجمالي': ((item.price - (item.discount || 0)) + (item.manualAddition || 0)) * (item.quantity || 1),
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
    'النوع': tx.type,
    'البيان': tx.description,
    'القسم / التصنيف': tx.category || '-',
    'من حساب': accountName(accounts, tx.fromAccountId),
    'إلى حساب': accountName(accounts, tx.toAccountId),
    'المبلغ': tx.amount,
    'فاتورة مرتبطة': tx.relatedInvoiceId || '-',
    'مصروف مرتبط': tx.relatedExpenseId || '-',
  }));
}

function summaryRows(expenses: Expense[], invoices: Invoice[], transactions: FinancialTransaction[]) {
  const sections = Array.from(new Set([
    ...expenses.map(e => e.category || 'غير مصنف'),
    ...invoices.flatMap(i => i.items.map(item => item.category || 'غير مصنف')),
  ]));

  return sections.map(section => {
    const sales = invoices
      .filter(inv => inv.type !== 'return' && inv.paymentStatus === 'paid')
      .flatMap(inv => inv.items)
      .filter(item => (item.category || 'غير مصنف') === section)
      .reduce((sum, item) => sum + (((item.price - (item.discount || 0)) + (item.manualAddition || 0)) * (item.quantity || 1)), 0);

    const returns = invoices
      .filter(inv => inv.type === 'return')
      .flatMap(inv => inv.items)
      .filter(item => (item.category || 'غير مصنف') === section)
      .reduce((sum, item) => sum + Math.abs(((item.price - (item.discount || 0)) + (item.manualAddition || 0)) * (item.quantity || 1)), 0);

    const expenseTotal = expenses
      .filter(exp => (exp.category || 'غير مصنف') === section)
      .reduce((sum, exp) => sum + money(exp.amount), 0);

    const reviewCount = expenses.filter(exp => (exp.category || 'غير مصنف') === section && isReview(exp.notes)).length;

    return {
      'القسم': section,
      'إجمالي المبيعات': sales,
      'إجمالي المرتجعات': returns,
      'إجمالي المصروفات': expenseTotal,
      'صافي القسم': sales - returns - expenseTotal,
      'عدد بنود المصروفات': expenses.filter(exp => (exp.category || 'غير مصنف') === section).length,
      'بنود تحتاج مراجعة': reviewCount,
      'حالة القسم': reviewCount > 0 ? 'يحتاج مراجعة' : 'مكتمل',
    };
  });
}

export function exportProfessionalExpensesWorkbook(expenses: Expense[], accounts: FinancialAccount[]) {
  const sections = Array.from(new Set(expenses.map(e => e.category || 'غير مصنف')));
  const allRows = expenses.map(exp => expenseRow(exp, accounts));
  const reviewRows = expenses.filter(exp => isReview(exp.notes) || !exp.amount).map(exp => expenseRow(exp, accounts));
  const sheets: ExcelSheet[] = [
    { name: 'لوحة المصروفات', rows: sections.map(section => ({
      'القسم': section,
      'عدد البنود': expenses.filter(e => (e.category || 'غير مصنف') === section).length,
      'الإجمالي': expenses.filter(e => (e.category || 'غير مصنف') === section).reduce((s, e) => s + money(e.amount), 0),
      'بنود تحتاج مراجعة': expenses.filter(e => (e.category || 'غير مصنف') === section && isReview(e.notes)).length,
      'بنود غير مكتملة': expenses.filter(e => (e.category || 'غير مصنف') === section && (!e.amount || e.amount <= 0)).length,
    })) },
    { name: 'سجل المصروفات', rows: allRows },
    { name: 'بنود تحتاج مراجعة', rows: reviewRows },
    ...sections.map(section => ({
      name: safeSheetName(`مصروفات ${section}`),
      rows: expenses.filter(e => (e.category || 'غير مصنف') === section).map(exp => expenseRow(exp, accounts)),
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
    ...expenses.map(e => e.category || 'غير مصنف'),
    ...invoices.flatMap(i => i.items.map(item => item.category || 'غير مصنف')),
  ]));

  const sheets: ExcelSheet[] = [
    { name: 'لوحة التحكم', rows: summaryRows(expenses, invoices, transactions) },
    { name: 'المصروفات', rows: expenses.map(exp => expenseRow(exp, accounts)) },
    { name: 'المبيعات والفواتير', rows: invoiceRows(invoices) },
    { name: 'الخزينة', rows: transactionRows(transactions, accounts) },
    { name: 'بنود تحتاج مراجعة', rows: expenses.filter(exp => isReview(exp.notes) || !exp.amount).map(exp => expenseRow(exp, accounts)) },
    ...sections.map(section => ({
      name: safeSheetName(`قسم ${section}`),
      rows: [
        ...invoiceRows(invoices).filter(row => row['القسم'] === section),
        ...expenses.filter(exp => (exp.category || 'غير مصنف') === section).map(exp => expenseRow(exp, accounts)),
      ],
    })),
    { name: 'دليل الإدخال', rows: [
      { 'القاعدة': 'الغلة ليست مصروفات', 'التطبيق': 'تدخل من زر تسجيل غلة مبيعات وتظهر في الفواتير والتقارير' },
      { 'القاعدة': 'المصروف يخصم من صافي القسم', 'التطبيق': 'يدخل من المصروفات أو الخزينة ويربط بالقسم والحساب' },
      { 'القاعدة': 'العهدة ليست ربحاً ولا مصروفاً', 'التطبيق': 'تظهر في الخزينة كحساب مستقل لمسؤول القسم' },
      { 'القاعدة': 'كل قسم مستقل', 'التطبيق': 'كل قسم له ورقة منفصلة في هذا الملف' },
    ] },
  ];

  exportWorkbook(sheets, 'تقرير_مطابخ_الشرق_الشامل', { title: 'مطابخ الشرق - تقرير شامل احترافي', period: 'كل البيانات المسجلة' });
}
