import React, { useMemo, useState } from 'react';
import type { Invoice, Product, Expense, Customer, FinancialTransaction } from '../types';

const money = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 0 });

const isRevenueInvoice = (invoice: Invoice) => {
  return invoice.paymentStatus === 'paid' && invoice.status !== 'cancelled' && ['sale', 'delivery', 'reservation', 'dine_in', 'takeaway'].includes(invoice.type);
};

const dateOnly = (value?: string) => value ? new Date(value).toISOString().slice(0, 10) : '';

const StatCard = ({ title, value, note, tone }: { title: string; value: string; note: string; tone: 'green' | 'red' | 'blue' | 'amber' | 'slate' }) => {
  const styles = {
    green: 'bg-emerald-50 border-emerald-100 text-emerald-800',
    red: 'bg-rose-50 border-rose-100 text-rose-800',
    blue: 'bg-blue-50 border-blue-100 text-blue-800',
    amber: 'bg-amber-50 border-amber-100 text-amber-900',
    slate: 'bg-slate-50 border-slate-100 text-slate-800',
  }[tone];
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${styles}`}>
      <p className="text-xs font-bold opacity-80">{title}</p>
      <p className="text-3xl font-black mt-2">{value}</p>
      <p className="text-xs mt-2 opacity-70 leading-5">{note}</p>
    </div>
  );
};

const DashboardView: React.FC<{
  invoices: Invoice[];
  products: Product[];
  expenses: Expense[];
  customers: Customer[];
  transactions?: FinancialTransaction[];
}> = ({ invoices, products, expenses, customers, transactions = [] }) => {
  const [dateRange, setDateRange] = useState<'all' | 'today' | '30-4'>('all');

  const data = useMemo(() => {
    const filterDate = (value?: string) => {
      if (dateRange === 'all') return true;
      if (dateRange === 'today') return dateOnly(value) === new Date().toISOString().slice(0, 10);
      if (dateRange === '30-4') return dateOnly(value) === '2026-04-30';
      return true;
    };

    const invoiceSales = invoices.filter(inv => isRevenueInvoice(inv) && filterDate(inv.paidDate || inv.date));
    const invoiceSalesTotal = invoiceSales.reduce((sum, inv) => sum + inv.total, 0);
    const returnsTotal = invoices.filter(inv => inv.type === 'return' && filterDate(inv.date)).reduce((sum, inv) => sum + Math.abs(inv.total), 0);

    const manualSales = transactions.filter(tx => tx.type === 'sale_income' && filterDate(tx.date));
    const manualSalesTotal = manualSales.reduce((sum, tx) => sum + tx.amount, 0);

    const expenseRows = expenses.filter(exp => filterDate(exp.date) && exp.status !== 'draft' && exp.status !== 'cancelled');
    const expensesTotal = expenseRows.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    const custodyRows = transactions.filter(tx => tx.type === 'capital_deposit' && (tx.category?.includes('عهدة') || tx.description.includes('مسؤول قسم')) && filterDate(tx.date));
    const custodyTotal = custodyRows.reduce((sum, tx) => sum + tx.amount, 0);

    const salesTotal = invoiceSalesTotal + manualSalesTotal - returnsTotal;
    const operatingNet = salesTotal - expensesTotal;

    const expensesBySection = new Map<string, number>();
    expenseRows.forEach(exp => {
      const key = exp.category || 'غير مصنف';
      expensesBySection.set(key, (expensesBySection.get(key) || 0) + (exp.amount || 0));
    });

    const manualSalesBySection = new Map<string, number>();
    manualSales.forEach(tx => {
      const key = tx.category || 'غلة غير مصنفة';
      manualSalesBySection.set(key, (manualSalesBySection.get(key) || 0) + tx.amount);
    });

    const recent = [...transactions]
      .filter(tx => filterDate(tx.date))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 12);

    return {
      invoiceSalesTotal,
      manualSalesTotal,
      salesTotal,
      returnsTotal,
      expensesTotal,
      operatingNet,
      custodyTotal,
      expensesBySection: Array.from(expensesBySection.entries()),
      manualSalesBySection: Array.from(manualSalesBySection.entries()),
      recent,
      pendingOrders: invoices.filter(inv => inv.status === 'pending').length,
      productsCount: products.length,
      customersCount: customers.length,
    };
  }, [invoices, expenses, transactions, products.length, customers.length, dateRange]);

  const rangeLabel = dateRange === 'all' ? 'كل البيانات' : dateRange === 'today' ? 'اليوم' : '30/4 فقط';

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900">لوحة التحكم</h2>
          <p className="text-slate-500 mt-2">لوحة مالية وتشغيلية تقرأ من الفواتير والحركات المالية اليدوية والمصروفات.</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
          <button onClick={() => setDateRange('30-4')} className={`px-4 py-2 rounded-xl text-sm font-bold ${dateRange === '30-4' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>30/4</button>
          <button onClick={() => setDateRange('today')} className={`px-4 py-2 rounded-xl text-sm font-bold ${dateRange === 'today' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>اليوم</button>
          <button onClick={() => setDateRange('all')} className={`px-4 py-2 rounded-xl text-sm font-bold ${dateRange === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>كل البيانات</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        <StatCard title="إجمالي الغلة / المبيعات" value={`${money(data.salesTotal)} ل.س`} note={`الفواتير + الغلة اليدوية - المرتجعات (${rangeLabel})`} tone="green" />
        <StatCard title="الغلة اليدوية" value={`${money(data.manualSalesTotal)} ل.س`} note="مبيعات مسجلة من زر تسجيل غلة مبيعات" tone="blue" />
        <StatCard title="المصروفات" value={`${money(data.expensesTotal)} ل.س`} note="مصروفات مرتبطة بالأقسام والحسابات" tone="red" />
        <StatCard title="العهد المسلمة" value={`${money(data.custodyTotal)} ل.س`} note="دفعات إدارة لمسؤولي الأقسام" tone="amber" />
        <StatCard title="صافي التشغيل" value={`${money(data.operatingNet)} ل.س`} note="المبيعات - المصروفات" tone="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-black text-slate-800 mb-4">الغلة حسب التصنيف</h3>
          <div className="space-y-3">
            {data.manualSalesBySection.length ? data.manualSalesBySection.map(([name, value]) => (
              <div key={name} className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-600">{name}</span><b className="text-emerald-700">{money(value)}</b></div>
            )) : <p className="text-slate-400 text-sm">لا توجد غلة يدوية ضمن هذا النطاق.</p>}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-black text-slate-800 mb-4">المصروفات حسب القسم</h3>
          <div className="space-y-3">
            {data.expensesBySection.length ? data.expensesBySection.map(([name, value]) => (
              <div key={name} className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-600">{name}</span><b className="text-rose-700">{money(value)}</b></div>
            )) : <p className="text-slate-400 text-sm">لا توجد مصروفات ضمن هذا النطاق.</p>}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-black text-slate-800 mb-4">مؤشرات تشغيلية</h3>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex justify-between"><span>طلبات معلقة</span><b>{data.pendingOrders}</b></div>
            <div className="flex justify-between"><span>عدد الأصناف</span><b>{data.productsCount}</b></div>
            <div className="flex justify-between"><span>عدد العملاء</span><b>{data.customersCount}</b></div>
            <div className="flex justify-between"><span>مبيعات الفواتير</span><b>{money(data.invoiceSalesTotal)}</b></div>
            <div className="flex justify-between"><span>مرتجعات</span><b>{money(data.returnsTotal)}</b></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-black text-slate-800 mb-4">آخر الحركات المالية</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">التاريخ</th><th className="p-3">النوع</th><th className="p-3">البيان</th><th className="p-3">التصنيف</th><th className="p-3">المبلغ</th></tr></thead>
            <tbody>
              {data.recent.map(tx => (
                <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 whitespace-nowrap">{new Date(tx.date).toLocaleString('ar-EG')}</td>
                  <td className="p-3 font-bold">{tx.type === 'sale_income' ? 'غلة مبيعات' : tx.type === 'expense' ? 'مصروف' : tx.type === 'capital_deposit' ? 'عهدة/دفعة إدارة' : tx.type === 'transfer' ? 'تحويل' : tx.type}</td>
                  <td className="p-3">{tx.description}</td>
                  <td className="p-3 text-slate-500">{tx.category || '-'}</td>
                  <td className="p-3 font-black">{money(tx.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.recent.length && <p className="text-center text-slate-400 py-6">لا توجد حركات مالية ضمن هذا النطاق.</p>}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
