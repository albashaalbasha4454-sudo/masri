import React, { useMemo, useState } from 'react';
import type { Invoice, Expense, FinancialTransaction } from '../types';
import { exportToExcel } from '../services/excelService';

const lineNet = (item: Invoice['items'][number]) => {
  const modifiersTotal = item.modifiers?.reduce((sum, mod) => sum + mod.price, 0) ?? 0;
  const manualAddition = item.manualAddition ?? 0;
  return ((item.price - (item.discount ?? 0)) + modifiersTotal + manualAddition) * item.quantity;
};

const isPaidRevenueInvoice = (invoice: Invoice) => {
  return invoice.paymentStatus === 'paid' && invoice.status !== 'cancelled' && ['sale', 'delivery', 'reservation', 'dine_in', 'takeaway'].includes(invoice.type);
};

const FinancialSummaryView: React.FC<{
  invoices: Invoice[];
  expenses: Expense[];
  transactions: FinancialTransaction[];
  accountBalances: Map<string, number>;
}> = ({ invoices, expenses, transactions, accountBalances }) => {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const financialData = useMemo(() => {
    const completedSales = invoices.filter(isPaidRevenueInvoice);
    const returns = invoices.filter(inv => inv.type === 'return' && inv.paymentStatus === 'paid');
    const activeExpenses = expenses.filter(exp => exp.status !== 'draft' && exp.status !== 'cancelled');

    const totalRevenue = completedSales.reduce((sum, inv) => sum + inv.total, 0);
    const totalReturnsValue = returns.reduce((sum, inv) => sum + Math.abs(inv.total), 0);
    const netSales = totalRevenue - totalReturnsValue;
    const totalExpenses = activeExpenses.reduce((sum, exp) => sum + (exp.amount ?? 0), 0);
    const netOperating = netSales - totalExpenses;

    const capitalDeposits = transactions
      .filter(tx => tx.type === 'capital_deposit')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const ownerEquity = capitalDeposits + netOperating;

    const totalCashAndBank = Array.from(accountBalances.values()).reduce((sum, balance) => sum + balance, 0);
    const accountDetails = Array.from(accountBalances.entries()).map(([name, balance]) => ({ name, balance }));

    const departments = new Set<string>();
    completedSales.forEach(inv => inv.items.forEach(item => departments.add(item.category || 'غير مصنف')));
    returns.forEach(inv => inv.items.forEach(item => departments.add(item.category || 'غير مصنف')));
    activeExpenses.forEach(exp => departments.add(exp.category || 'غير مصنف'));

    const deptData = Array.from(departments).map(dept => {
      const deptSales = completedSales.reduce((sum, inv) => {
        return sum + inv.items
          .filter(item => (item.category || 'غير مصنف') === dept)
          .reduce((itemSum, item) => itemSum + lineNet(item), 0);
      }, 0);

      const deptReturns = returns.reduce((sum, inv) => {
        return sum + inv.items
          .filter(item => (item.category || 'غير مصنف') === dept)
          .reduce((itemSum, item) => itemSum + Math.abs(lineNet(item)), 0);
      }, 0);

      const deptExpenses = activeExpenses
        .filter(exp => (exp.category || 'غير مصنف') === dept)
        .reduce((sum, exp) => sum + (exp.amount ?? 0), 0);

      const revenue = deptSales - deptReturns;
      const profit = revenue - deptExpenses;

      return { name: dept, revenue, returns: deptReturns, expenses: deptExpenses, profit };
    }).sort((a, b) => b.profit - a.profit);

    return {
      completedSales,
      activeExpenses,
      totalRevenue,
      totalReturnsValue,
      netSales,
      totalExpenses,
      netOperating,
      capitalDeposits,
      ownerEquity,
      totalCashAndBank,
      accountDetails,
      deptData,
    };
  }, [invoices, expenses, transactions, accountBalances]);

  const handleExportDeptExcel = () => {
    const rows = financialData.deptData.map(dept => ({
      'القسم': dept.name,
      'المبيعات بعد المرتجعات': dept.revenue.toFixed(2),
      'المرتجعات': dept.returns.toFixed(2),
      'المصروفات': dept.expenses.toFixed(2),
      'صافي التشغيل': dept.profit.toFixed(2),
    }));

    exportToExcel(rows, 'تقرير_أداء_الأقسام', 'Departments', 'تقرير أداء الأقسام', 'كل الفترة');
  };

  return (
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-right">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">الملخص المالي الشامل</h2>
          <p className="text-slate-500 mt-2 text-lg">يعتمد هذا الملخص على المبيعات والمصروفات والمرتجعات فقط، دون تكلفة صنف أو COGS.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-8">
            <div className="bg-white shadow-sm border border-slate-200 rounded-3xl overflow-hidden">
              <div className="bg-slate-900 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-indigo-400 text-3xl">account_balance</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">قائمة التشغيل</h3>
                </div>
                <span className="text-slate-400 text-sm font-mono tracking-widest uppercase">Operating Summary</span>
              </div>

              <div className="p-8 space-y-5">
                <SummaryLine label="إجمالي المبيعات المدفوعة" value={financialData.totalRevenue} />
                <SummaryLine label="(-) إجمالي المرتجعات" value={financialData.totalReturnsValue} negative />
                <SummaryHighlight label="صافي المبيعات" value={financialData.netSales} theme="indigo" />
                <SummaryLine label="(-) إجمالي المصروفات" value={financialData.totalExpenses} negative />
                <SummaryHighlight label="صافي التشغيل" value={financialData.netOperating} theme={financialData.netOperating >= 0 ? 'emerald' : 'red'} />
              </div>
            </div>

            <div className="bg-white shadow-sm border border-slate-200 rounded-3xl overflow-hidden">
              <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-indigo-600">splitscreen</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">تقارير الأقسام</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sales - Expenses - Returns</p>
                  </div>
                </div>
                <button onClick={handleExportDeptExcel} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors font-bold border border-emerald-100 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  تصدير تقرير الأقسام
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-4 text-xs font-black text-slate-500 text-right">القسم</th>
                      <th className="p-4 text-xs font-black text-slate-500 text-center">صافي المبيعات</th>
                      <th className="p-4 text-xs font-black text-slate-500 text-center">المرتجعات</th>
                      <th className="p-4 text-xs font-black text-slate-500 text-center">المصروفات</th>
                      <th className="p-4 text-xs font-black text-slate-500 text-left">صافي التشغيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {financialData.deptData.length > 0 ? financialData.deptData.map((dept, index) => (
                      <tr key={index} className={`hover:bg-indigo-50/30 cursor-pointer ${selectedDept === dept.name ? 'bg-indigo-50/50' : ''}`} onClick={() => setSelectedDept(selectedDept === dept.name ? null : dept.name)}>
                        <td className="p-4 font-bold text-slate-800">{dept.name}</td>
                        <td className="p-4 text-center font-mono text-slate-600">{dept.revenue.toFixed(2)}</td>
                        <td className="p-4 text-center font-mono text-red-400">{dept.returns.toFixed(2)}</td>
                        <td className="p-4 text-center font-mono text-orange-500">{dept.expenses.toFixed(2)}</td>
                        <td className="p-4 text-left"><span className={`font-black font-mono text-lg rounded-lg px-2 py-1 ${dept.profit >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>{dept.profit.toFixed(2)}</span></td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="p-12 text-center text-slate-400">لا توجد بيانات للأقسام حالياً</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {selectedDept && (
                <div className="p-8 bg-slate-50 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-black text-slate-800">تفاصيل مصروفات قسم: {selectedDept}</h4>
                    <button onClick={() => setSelectedDept(null)} className="text-slate-400 hover:text-red-500"><span className="material-symbols-outlined">close</span></button>
                  </div>
                  <div className="space-y-3">
                    {financialData.activeExpenses.filter(e => (e.category || 'غير مصنف') === selectedDept).length > 0 ? (
                      financialData.activeExpenses.filter(e => (e.category || 'غير مصنف') === selectedDept).map(exp => (
                        <div key={exp.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{exp.description}</p>
                            <p className="text-[10px] text-slate-400">{new Date(exp.date).toLocaleDateString('ar-EG')} · {exp.processedBy || '-'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-slate-900 font-mono">{(exp.amount ?? 0).toFixed(2)}</p>
                            {exp.notes && <span className="text-[9px] text-indigo-500 font-bold">{exp.notes}</span>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 bg-white/50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">لا يوجد مصروفات مسجلة لهذا القسم حالياً.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-4 space-y-8">
            <div className="bg-white shadow-xl shadow-indigo-100/30 border border-indigo-100 rounded-3xl p-8 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <span className="material-symbols-outlined text-white text-3xl">wallet</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">إجمالي النقدية</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Liquid Balance</p>
                </div>
              </div>
              <p className="text-5xl font-black text-indigo-600 font-mono tracking-tighter">{financialData.totalCashAndBank.toFixed(2)}</p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 mt-4">إجمالي الأرصدة الحالية في الحسابات المالية.</p>
            </div>

            <div className="bg-white shadow-sm border border-slate-200 rounded-3xl overflow-hidden">
              <div className="bg-white p-6 border-b border-slate-100 flex items-center gap-3">
                <span className="material-symbols-outlined text-indigo-600">summarize</span>
                <h3 className="font-black text-slate-800">أرصدة الحسابات</h3>
              </div>
              <div className="p-4 space-y-3">
                {financialData.accountDetails.length > 0 ? financialData.accountDetails.map((acc, index) => (
                  <div key={index} className="flex justify-between items-center p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <span className="text-sm font-bold text-slate-700">{acc.name}</span>
                    <span className={`text-md font-bold font-mono ${acc.balance >= 0 ? 'text-slate-900' : 'text-red-500'}`}>{acc.balance.toFixed(2)}</span>
                  </div>
                )) : <div className="text-center py-10 opacity-40 text-xs font-bold">لا توجد حسابات</div>}
              </div>
            </div>

            <div className="bg-white shadow-sm border border-slate-200 rounded-3xl p-6">
              <h3 className="font-black text-slate-800 mb-3">رأس المال التقديري</h3>
              <SummaryLine label="إيداعات رأس المال" value={financialData.capitalDeposits} />
              <SummaryLine label="+ صافي التشغيل" value={financialData.netOperating} />
              <SummaryHighlight label="حقوق الملكية التقديرية" value={financialData.ownerEquity} theme="indigo" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryLine = ({ label, value, negative = false }: { label: string; value: number; negative?: boolean }) => (
  <div className="flex justify-between items-center py-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors">
    <span className="text-slate-600 font-medium">{label}</span>
    <span className={`text-xl font-bold font-mono ${negative ? 'text-red-500' : 'text-slate-900'}`}>{negative ? `(${value.toFixed(2)})` : value.toFixed(2)}</span>
  </div>
);

const SummaryHighlight = ({ label, value, theme }: { label: string; value: number; theme: 'indigo' | 'emerald' | 'red' }) => {
  const styles = theme === 'emerald' ? 'bg-emerald-600 border-emerald-500 text-white' : theme === 'red' ? 'bg-red-600 border-red-500 text-white' : 'bg-indigo-50 border-indigo-100 text-indigo-900';
  const valueStyle = theme === 'indigo' ? 'text-indigo-700' : 'text-white';
  return (
    <div className={`flex justify-between items-center p-6 rounded-3xl border shadow-inner ${styles}`}>
      <strong className="text-xl">{label}</strong>
      <strong className={`font-black text-3xl font-mono tracking-tighter ${valueStyle}`}>{value.toFixed(2)}</strong>
    </div>
  );
};

export default FinancialSummaryView;
