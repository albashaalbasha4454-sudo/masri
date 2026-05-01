import React, { useMemo } from 'react';
import type { Invoice, Expense, FinancialTransaction } from '../types';
import { exportToExcel } from '../services/excelService';

const StatCard = ({ title, value, icon, valueClassName, subtext }: { title: string, value: string | number, icon: string, valueClassName?: string, subtext?: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4 border border-slate-200">
        <div className={`p-3 rounded-full ${valueClassName} bg-opacity-10`}>
            <span className={`material-symbols-outlined text-4xl ${valueClassName}`}>{icon}</span>
        </div>
        <div>
            <h3 className="text-slate-600 text-md">{title}</h3>
            <p className={`text-2xl font-bold ${valueClassName || 'text-slate-800'}`}>{value}</p>
            {subtext && <p className="text-sm text-slate-400">{subtext}</p>}
        </div>
    </div>
);

const FinancialSummaryView: React.FC<{
  invoices: Invoice[];
  expenses: Expense[];
  transactions: FinancialTransaction[];
  accountBalances: Map<string, number>;
}> = ({ invoices, expenses, transactions, accountBalances }) => {

    const [selectedDept, setSelectedDept] = React.useState<string | null>(null);

    const financialData = useMemo(() => {
        // Income Statement
        const completedSales = invoices.filter(inv => (inv.type === 'sale' || (inv.type === 'dine_in' || inv.type === 'takeaway' || inv.type === 'shipping')) && inv.paymentStatus === 'paid');
        const returns = invoices.filter(inv => inv.type === 'return');
        
        const totalRevenue = completedSales.reduce((sum, inv) => sum + inv.total, 0);
        const totalReturnsValue = Math.abs(returns.reduce((sum, inv) => sum + inv.total, 0));
        
        const cogs = completedSales.reduce((sum, inv) => sum + (inv.totalCost || 0), 0);
        const grossProfit = totalRevenue - totalReturnsValue - cogs;

        const totalExpenses = expenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);
        const netProfit = grossProfit - totalExpenses;

        // Statement of Capital
        const capitalDeposits = transactions.filter(tx => tx.type === 'capital_deposit').reduce((sum: number, tx) => sum + tx.amount, 0);
        const profitWithdrawals = transactions.filter(tx => tx.type === 'profit_withdrawal').reduce((sum: number, tx) => sum + tx.amount, 0);
        const ownerEquity = (capitalDeposits - profitWithdrawals) + netProfit;

        const totalCashAndBank = Array.from(accountBalances.values()).reduce((sum: number, b: number) => sum + b, 0);
        const accountDetails = Array.from(accountBalances.entries()).map(([name, balance]) => ({ name, balance }));

        // Departmental Breakdown
        const departments = new Set<string>();
        completedSales.forEach(inv => inv.items.forEach(item => item.category && departments.add(item.category)));
        expenses.forEach(exp => exp.category && departments.add(exp.category));

        const deptData = Array.from(departments).map(dept => {
            const deptSales = completedSales.reduce((sum: number, inv) => {
                const itemsTotal = inv.items
                    .filter(item => item.category === dept)
                    .reduce((iSum: number, item) => {
                        const modTotal = item.modifiers?.reduce((s: number, m) => s + m.price, 0) || 0;
                        const manualAdd = item.manualAddition || 0;
                        const itemTotal = (item.price - (item.discount || 0) + modTotal + manualAdd) * item.quantity;
                        return iSum + itemTotal;
                    }, 0);
                return sum + itemsTotal;
            }, 0);

            const deptCOGS = completedSales.reduce((sum: number, inv) => {
                const itemsCost = inv.items
                    .filter(item => item.category === dept)
                    .reduce((iSum: number, item) => iSum + ((item.cost || 0) * item.quantity), 0);
                return sum + itemsCost;
            }, 0);

            const deptExpenses = expenses
                .filter(exp => exp.category === dept)
                .reduce((sum: number, exp) => sum + exp.amount, 0);

            const deptReturns = returns.reduce((sum: number, inv) => {
                const itemsTotal = inv.items
                    .filter(item => item.category === dept)
                    .reduce((iSum: number, item) => iSum + (item.price * item.quantity), 0);
                return sum + itemsTotal;
            }, 0);

            const netDeptRevenue = deptSales - Math.abs(deptReturns);
            const deptProfit = netDeptRevenue - deptCOGS - deptExpenses;

            return {
                name: dept,
                revenue: netDeptRevenue,
                cogs: deptCOGS,
                expenses: deptExpenses,
                profit: deptProfit
            };
        }).sort((a, b) => b.profit - a.profit);

        const handleExportDeptExcel = () => {
            const exportData = deptData.map(dept => ({
                'القسم': dept.name,
                'الإيرادات': dept.revenue.toFixed(2),
                'التكاليف (COGS)': dept.cogs.toFixed(2),
                'المصروفات': dept.expenses.toFixed(2),
                'صافي الربح': dept.profit.toFixed(2)
            }));
            exportToExcel(exportData, 'تقرير_أداء_الأقسام', 'Departments');
        };
        
        return {
            totalRevenue, totalReturnsValue, cogs,
            grossProfit, totalExpenses, netProfit,
            capitalDeposits, profitWithdrawals, ownerEquity,
            totalCashAndBank, accountDetails, deptData,
            handleExportDeptExcel
        };

    }, [invoices, expenses, transactions, accountBalances]);

  const { deptData, handleExportDeptExcel } = financialData;

  return (
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-right">
           <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">الملخص المالي الشامل</h2>
           <p className="text-slate-500 mt-2 text-lg">نظرة عامة على الأداء المالي للمطعم منذ بداية التسجيل.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Main Financial Statements */}
            <div className="xl:col-span-8 space-y-8">
                {/* Profit & Loss Statement */}
                <div className="bg-white shadow-sm border border-slate-200 rounded-3xl overflow-hidden">
                    <div className="bg-slate-900 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-indigo-400 text-3xl">account_balance</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white">قائمة الأرباح والخسائر</h3>
                        </div>
                        <span className="text-slate-400 text-sm font-mono tracking-widest uppercase">Income Statement</span>
                    </div>
                    
                    <div className="p-8 space-y-5">
                        <div className="flex justify-between items-center py-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors">
                            <span className="text-slate-600 font-medium">إجمالي الإيرادات (من المبيعات)</span> 
                            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{financialData.totalRevenue.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors">
                            <span className="text-slate-600 font-medium">(-) إجمالي المرتجعات</span> 
                            <span className="text-xl font-bold text-red-500 font-mono">({financialData.totalReturnsValue.toFixed(2)})</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors">
                            <span className="text-slate-600 font-medium">(-) تكلفة البضاعة المباعة</span> 
                            <span className="text-xl font-bold text-orange-600 font-mono">({financialData.cogs.toFixed(2)})</span>
                        </div>
                        
                        <div className="mx-4 h-px bg-slate-100"></div>
                        
                        <div className="flex justify-between items-center p-6 bg-indigo-50 rounded-3xl border border-indigo-100 shadow-inner">
                            <strong className="text-indigo-900 text-xl">مجمل الربح</strong> 
                            <strong className="font-black text-3xl text-indigo-700 font-mono tracking-tighter">{financialData.grossProfit.toFixed(2)}</strong>
                        </div>
                        
                        <div className="flex justify-between items-center py-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors">
                            <span className="text-slate-600 font-medium">(-) إجمالي المصروفات</span> 
                            <span className="text-xl font-bold text-red-600 font-mono">({financialData.totalExpenses.toFixed(2)})</span>
                        </div>
                        
                        <div className="pt-4">
                            <div className={`flex justify-between items-center p-6 rounded-3xl border shadow-lg ${financialData.netProfit >= 0 ? 'bg-emerald-600 border-emerald-500 shadow-emerald-200' : 'bg-red-600 border-red-500 shadow-red-200'}`}>
                                <div className="text-white">
                                    <strong className="text-2xl block">صافي الربح</strong>
                                    <span className="text-white/70 text-xs font-bold uppercase tracking-widest">{financialData.netProfit >= 0 ? 'Profitable' : 'Loss'}</span>
                                </div>
                                <strong className="font-black text-4xl text-white font-mono tracking-tighter">{financialData.netProfit.toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Independent Departmental Reports for Accountability */}
                <div className="bg-white shadow-sm border border-slate-200 rounded-3xl overflow-hidden mt-8">
                    <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-indigo-600">splitscreen</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">تقارير الأقسام (مستقلة للرقابة والمسؤولية)</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Departmental Profitability & Cost Control</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleExportDeptExcel}
                            className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors font-bold border border-emerald-100 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            تصدير تقرير الأقسام
                        </button>
                    </div>
                    
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">القسم الجاري</th>
                                    <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">الإيرادات</th>
                                    <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">التكاليف (COGS)</th>
                                    <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">المصروفات</th>
                                    <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-left">صافي مربح القسم</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {financialData.deptData.length > 0 ? (
                                    financialData.deptData.map((dept, idx) => (
                                        <tr 
                                            key={idx} 
                                            className={`hover:bg-indigo-50/30 transition-colors group cursor-pointer ${selectedDept === dept.name ? 'bg-indigo-50/50 outline outline-2 outline-indigo-500/20' : ''}`}
                                            onClick={() => setSelectedDept(selectedDept === dept.name ? null : dept.name)}
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${selectedDept === dept.name ? 'bg-indigo-600 animate-pulse' : 'bg-indigo-400'}`}></div>
                                                    <span className="font-bold text-slate-800">{dept.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center font-mono text-sm text-slate-600">{dept.revenue.toFixed(2)}</td>
                                            <td className="p-4 text-center font-mono text-sm text-orange-500">{dept.cogs.toFixed(2)}</td>
                                            <td className="p-4 text-center font-mono text-sm text-red-400">{dept.expenses.toFixed(2)}</td>
                                            <td className="p-4 text-left">
                                                <div className="flex items-center justify-end gap-3">
                                                    <span className={`font-black font-mono text-lg rounded-lg px-2 py-1 ${dept.profit >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                                                        {dept.profit.toFixed(2)}
                                                    </span>
                                                    <span className={`material-symbols-outlined text-slate-300 transition-transform ${selectedDept === dept.name ? 'rotate-90 text-indigo-500' : ''}`}>chevron_left</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-slate-400">
                                            <span className="material-symbols-outlined text-4xl mb-2 opacity-20">inventory_2</span>
                                            <p className="text-sm font-bold">لا يوجد بيانات للأقسام حالياً</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {selectedDept && (
                        <div className="p-8 bg-slate-50 border-t border-slate-200 animate-in fade-in slide-in-from-top-4">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-indigo-600">receipt_long</span>
                                    <h4 className="text-lg font-black text-slate-800">تفاصيل مصروفات قسم: {selectedDept}</h4>
                                </div>
                                <button onClick={() => setSelectedDept(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                {expenses.filter(e => e.category === selectedDept).length > 0 ? (
                                    expenses.filter(e => e.category === selectedDept).map(exp => (
                                        <div key={exp.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                                    <span className="material-symbols-outlined text-md">payment</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{exp.description}</p>
                                                    <div className="flex items-center gap-3 mt-0.5">
                                                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold">{new Date(exp.date).toLocaleDateString('ar-EG')}</span>
                                                        <span className="text-[10px] text-slate-400">{exp.processedBy}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-slate-900 font-mono tracking-tighter">{exp.amount.toFixed(2)}</p>
                                                {exp.notes && <span className="text-[9px] text-indigo-500 font-bold">{exp.notes}</span>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 bg-white/50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-slate-400 text-sm">لا يوجد مصروفات مسجلة لهذا القسم حالياً.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Shareholders Equity Statement */}
                <div className="bg-white shadow-sm border border-slate-200 rounded-3xl overflow-hidden">
                    <div className="bg-slate-800 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-amber-400 text-3xl">foundation</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white">قائمة رأس المال (حقوق الملكية)</h3>
                        </div>
                        <span className="text-slate-400 text-sm font-mono tracking-widest uppercase">Equity</span>
                    </div>

                    <div className="p-8 space-y-4">
                        <div className="flex justify-between items-center py-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors">
                            <span className="text-slate-600 font-medium">(+) إيداعات رأس المال</span> 
                            <span className="text-xl font-bold text-emerald-600 font-mono">+{financialData.capitalDeposits.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors">
                            <span className="text-slate-600 font-medium">(-) مسحوبات الأرباح</span> 
                            <span className="text-xl font-bold text-red-500 font-mono">({financialData.profitWithdrawals.toFixed(2)})</span>
                        </div>

                        <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative">
                            <div className="relative z-10 flex justify-between items-end">
                                <div>
                                    <h4 className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-1">حقوق الملكية (تقديري)</h4>
                                    <p className="text-[10px] text-slate-500 max-w-[200px]">تشمل الأرباح المرحلة ورأس المال المستثمر ناقصاً المسحوبات.</p>
                                </div>
                                <strong className="font-black text-4xl text-amber-400 font-mono tracking-tighter">{financialData.ownerEquity.toFixed(2)}</strong>
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar: Financial Position & Departments */}
            <div className="xl:col-span-4 space-y-8">
                <div className="sticky top-8 space-y-8">
                    {/* Overall Cash Position */}
                    <div className="bg-white shadow-xl shadow-indigo-100/30 border border-indigo-100 rounded-3xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                                    <span className="material-symbols-outlined text-white text-3xl">wallet</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800">إجمالي النقدية</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Liquid Balance</p>
                                </div>
                            </div>
                            
                            <div className="mb-2">
                                <span className="text-sm font-bold text-slate-400 block mb-1">إجمالي المبلغ المتوفر</span>
                                <p className="text-5xl font-black text-indigo-600 font-mono tracking-tighter tabular-nums drop-shadow-sm">{financialData.totalCashAndBank.toFixed(2)}</p>
                            </div>
                            
                            <p className="text-xs text-slate-500 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">المبلغ الإجمالي المتوفر حالياً في جميع الخزائن، الحسابات البنكية، والمحافظ الإلكترونية.</p>
                        </div>
                    </div>

                    {/* Department Balances */}
                    <div className="bg-white shadow-sm border border-slate-200 rounded-3xl overflow-hidden">
                        <div className="bg-white p-6 border-b border-slate-100 flex items-center gap-3">
                            <span className="material-symbols-outlined text-indigo-600">summarize</span>
                            <h3 className="font-black text-slate-800">ملخص المركز المالي (حسب القسم)</h3>
                        </div>
                        
                        <div className="p-4 space-y-3">
                            {financialData.accountDetails.length > 0 ? (
                                financialData.accountDetails.map((acc, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 transition-all group/acc shadow-sm hover:shadow-md">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover/acc:bg-indigo-50 transition-colors">
                                                <span className="material-symbols-outlined text-slate-400 group-hover/acc:text-indigo-500 text-lg">
                                                    {acc.name.includes('بنك') ? 'account_balance' : 'payments'}
                                                </span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{acc.name}</span>
                                        </div>
                                        <span className={`text-md font-bold font-mono ${acc.balance >= 0 ? 'text-slate-900' : 'text-red-500'}`}>
                                            {acc.balance.toFixed(2)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 opacity-40">
                                    <span className="material-symbols-outlined text-4xl mb-2">empty_dashboard</span>
                                    <p className="text-xs font-bold">لا يوجد بيانات للأقسام</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};


export default FinancialSummaryView;