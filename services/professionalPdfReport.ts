import type { Expense, FinancialAccount, FinancialTransaction, Invoice } from '../types';

const fmt = (n: number) => Number(n || 0).toLocaleString('en-US');
const day = (v: string) => new Date(v).toISOString().slice(0, 10);
const section = (v?: string) => {
  const x = (v || 'غير مصنف').trim();
  if (x.includes('فلافل')) return 'قسم الفلافل';
  if (x.includes('فرن')) return 'قسم الفرن';
  if (x.includes('مشوي')) return 'قسم المشويات';
  if (x.includes('شرقي')) return 'قسم الشرقي';
  if (x.includes('غربي')) return 'قسم الغربي';
  return x;
};
const isReview = (notes?: string) => Boolean(notes && (notes.includes('✔') || notes.includes('❓') || notes.includes('مراجعة')));
const lineTotal = (item: Invoice['items'][number]) => (((item.price - (item.discount || 0)) + (item.manualAddition || 0) + (item.modifiers?.reduce((s, m) => s + m.price, 0) || 0)) * (item.quantity || 1));

type SalesRow = { date: string; section: string; desc: string; amount: number; source: string };

type AuditRow = { date: string; section: string; sales: number; expenses: number; net: number; reviewCount: number; risk: string };

function salesRows(invoices: Invoice[], transactions: FinancialTransaction[]): SalesRow[] {
  const rows: SalesRow[] = invoices
    .filter(inv => inv.type !== 'return' && inv.paymentStatus === 'paid')
    .flatMap(inv => inv.items.map(item => ({
      date: day(inv.paidDate || inv.date),
      section: section(item.category),
      desc: item.productName,
      amount: lineTotal(item),
      source: 'فاتورة',
    })));

  transactions.filter(tx => tx.type === 'sale_income').forEach(tx => {
    const id = `manual-inv-${tx.id}`;
    const already = invoices.some(inv => inv.id === id);
    if (!already) rows.push({ date: day(tx.date), section: section(tx.category), desc: tx.description, amount: tx.amount, source: 'غلة خزينة' });
  });
  return rows;
}

function auditRows(expenses: Expense[], invoices: Invoice[], transactions: FinancialTransaction[]): AuditRow[] {
  const sales = salesRows(invoices, transactions);
  const keys = new Set<string>();
  sales.forEach(s => keys.add(`${s.date}__${s.section}`));
  expenses.forEach(e => keys.add(`${day(e.date)}__${section(e.category)}`));
  return Array.from(keys).sort().map(key => {
    const [date, sec] = key.split('__');
    const salesValue = sales.filter(s => s.date === date && s.section === sec).reduce((sum, s) => sum + s.amount, 0);
    const expList = expenses.filter(e => day(e.date) === date && section(e.category) === sec);
    const expensesValue = expList.reduce((sum, e) => sum + (e.amount || 0), 0);
    const reviewCount = expList.filter(e => isReview(e.notes) || !e.amount).length;
    const ratio = salesValue > 0 ? expensesValue / salesValue : expensesValue > 0 ? 999 : 0;
    const risk = salesValue === 0 && expensesValue > 0 ? 'خطر عال: صرف بلا غلة' : ratio > 1 ? 'خطر عال: المصروفات أعلى من الغلة' : ratio > 0.6 ? 'تحذير: مصروفات مرتفعة' : reviewCount > 0 ? 'مراجعة' : 'طبيعي';
    return { date, section: sec, sales: salesValue, expenses: expensesValue, net: salesValue - expensesValue, reviewCount, risk };
  });
}

function htmlTable(rows: Record<string, unknown>[], limit = 20) {
  if (!rows.length) return '<p class="muted">لا توجد بيانات.</p>';
  const cols = Object.keys(rows[0]);
  return `<table><thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${rows.slice(0, limit).map(r => `<tr>${cols.map(c => `<td>${String(r[c] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function bars(rows: AuditRow[]) {
  const max = Math.max(...rows.map(r => Math.max(r.sales, r.expenses)), 1);
  return rows.slice(0, 12).map(r => `<div class="barrow"><div class="barlabel">${r.date} - ${r.section}</div><div class="track"><span class="sales" style="width:${Math.max(2, (r.sales / max) * 100)}%"></span></div><div class="track"><span class="expenses" style="width:${Math.max(2, (r.expenses / max) * 100)}%"></span></div><div class="small">غلة ${fmt(r.sales)} / مصروف ${fmt(r.expenses)} / ${r.risk}</div></div>`).join('');
}

export function exportProfessionalPdfReport(expenses: Expense[], invoices: Invoice[], transactions: FinancialTransaction[], accounts: FinancialAccount[]) {
  const sales = salesRows(invoices, transactions);
  const audit = auditRows(expenses, invoices, transactions);
  const totalSales = sales.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const review = expenses.filter(e => isReview(e.notes) || !e.amount);
  const sectionSummary = Array.from(new Set([...sales.map(s => s.section), ...expenses.map(e => section(e.category))])).map(sec => {
    const sv = sales.filter(s => s.section === sec).reduce((sum, r) => sum + r.amount, 0);
    const ev = expenses.filter(e => section(e.category) === sec).reduce((sum, e) => sum + (e.amount || 0), 0);
    return { 'القسم': sec, 'الغلة': fmt(sv), 'المصروفات': fmt(ev), 'الصافي': fmt(sv - ev), 'الحالة': ev > sv && sv > 0 ? 'تحذير' : sv === 0 && ev > 0 ? 'تدقيق' : 'طبيعي' };
  });
  const auditTable = audit.map(r => ({ 'التاريخ': r.date, 'القسم': r.section, 'الغلة': fmt(r.sales), 'المصروفات': fmt(r.expenses), 'الصافي': fmt(r.net), 'المراجعات': r.reviewCount, 'المؤشر': r.risk }));
  const reviewTable = review.map(e => ({ 'التاريخ': day(e.date), 'القسم': section(e.category), 'البيان': e.description, 'المبلغ': fmt(e.amount || 0), 'ملاحظات': e.notes || '-' }));

  const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تقرير مطابخ الشرق</title><style>body{font-family:Arial,Tahoma,sans-serif;background:#f8fafc;color:#0f172a;margin:0;padding:24px;direction:rtl}.page{max-width:1100px;margin:auto;background:white;padding:28px;border-radius:18px;box-shadow:0 8px 30px #0001}h1{margin:0;font-size:30px}h2{margin-top:30px;border-bottom:2px solid #e2e8f0;padding-bottom:8px}.muted{color:#64748b}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0}.card{border:1px solid #e2e8f0;border-radius:14px;padding:14px;background:#f8fafc}.num{font-size:24px;font-weight:900}.green{color:#047857}.red{color:#be123c}.blue{color:#1d4ed8}table{width:100%;border-collapse:collapse;margin:12px 0;font-size:12px}th,td{border:1px solid #e2e8f0;padding:8px;text-align:right}th{background:#f1f5f9}.barrow{margin:10px 0}.barlabel{font-weight:700;margin-bottom:4px}.track{height:12px;background:#e2e8f0;border-radius:99px;margin:3px 0;overflow:hidden}.track span{display:block;height:100%}.sales{background:#10b981}.expenses{background:#ef4444}.small{font-size:11px;color:#475569}@media print{body{background:white;padding:0}.page{box-shadow:none;border-radius:0}.noprint{display:none}h2{break-after:avoid}table{break-inside:auto}tr{break-inside:avoid}.cards{grid-template-columns:repeat(2,1fr)}}</style></head><body><div class="page"><button class="noprint" onclick="window.print()" style="float:left;padding:10px 16px;border:0;border-radius:10px;background:#0f172a;color:white;font-weight:700">طباعة / حفظ PDF</button><h1>تقرير مطابخ الشرق الشامل</h1><p class="muted">تقرير رقابي تفصيلي للمبيعات، المصروفات، الصافي، وبنود المراجعة. استخدم زر الطباعة لحفظ الملف PDF.</p><div class="cards"><div class="card"><div>إجمالي الغلة</div><div class="num green">${fmt(totalSales)}</div></div><div class="card"><div>إجمالي المصروفات</div><div class="num red">${fmt(totalExpenses)}</div></div><div class="card"><div>صافي التشغيل</div><div class="num blue">${fmt(totalSales - totalExpenses)}</div></div><div class="card"><div>بنود تحتاج مراجعة</div><div class="num red">${review.length}</div></div></div><h2>رسم مقارنة الغلة والمصروفات</h2>${bars(audit)}<h2>ملخص الأقسام</h2>${htmlTable(sectionSummary, 50)}<h2>تدقيق صرف مقابل غلة</h2>${htmlTable(auditTable, 80)}<h2>بنود تحتاج مراجعة</h2>${htmlTable(reviewTable, 80)}<h2>شرح التقرير</h2><p>الغلة تسجل كدخل وليست مصروفا. المصروفات تخصم من صافي القسم. إذا ظهر خطر عال فهذا يعني أن القسم صرف بلا غلة مقابلة في نفس اليوم أو أن مصروفاته أعلى من غلته، ويجب مراجعة هل الصرف مخزون لأيام لاحقة أو تم استخدامه في قسم آخر أو أن الغلة لم تسجل.</p></div></body></html>`;

  const win = window.open('', '_blank');
  if (!win) {
    window.alert('تعذر فتح نافذة التقرير. اسمح بالنوافذ المنبثقة ثم أعد المحاولة.');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.focus(), 200);
}
