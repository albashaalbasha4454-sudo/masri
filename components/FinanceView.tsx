import React, { useState, useMemo } from 'react';
import type { FinancialAccount, FinancialTransaction, Budget } from '../types';
import AccountModal from './AccountModal';
import FinancialTransactionModal from './FinancialTransactionModal';
import BudgetModal from './BudgetModal';
import { exportToExcel } from '../services/excelService';

interface FinanceViewProps {
  accounts: FinancialAccount[];
  accountBalances: Map<string, number>;
  transactions: FinancialTransaction[];
  budgets: Budget[];
  onSaveAccount: (data: Omit<FinancialAccount, 'id'>) => void;
  onSaveTransaction: (data: any) => void;
  onSaveBudget: (data: Omit<Budget, 'id'>) => void;
}

type ManualTransactionType = 'sale_income' | 'expense' | 'capital_deposit' | 'transfer';

const money = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 0 });

const FinanceView: React.FC<FinanceViewProps> = ({ accounts, accountBalances, transactions, budgets, onSaveAccount, onSaveTransaction, onSaveBudget }) => {
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<ManualTransactionType>('sale_income');

  const drawerAccount = accounts.find(acc => acc.id === 'cash-default');
  const falafelCustody = accounts.find(acc => acc.id === 'falafel-manager-custody' || acc.name.includes('عهدة مسؤول قسم الفلافل'));

  const summary = useMemo(() => {
    const totalSalesIncome = transactions.filter(tx => tx.type === 'sale_income').reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpenses = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const totalCustody = transactions.filter(tx => tx.type === 'capital_deposit' && (tx.toAccountId === falafelCustody?.id || tx.category?.includes('عهدة'))).reduce((sum, tx) => sum + tx.amount, 0);
    const drawerIn = transactions.filter(tx => tx.toAccountId === 'cash-default').reduce((sum, tx) => sum + tx.amount, 0);
    const drawerOut = transactions.filter(tx => tx.fromAccountId === 'cash-default').reduce((sum, tx) => sum + tx.amount, 0);
    return { totalSalesIncome, totalExpenses, totalCustody, drawerIn, drawerOut, drawerNet: drawerIn - drawerOut };
  }, [transactions, falafelCustody?.id]);

  const handleExportExcel = () => {
    const exportData = transactions.map(tx => {
      const from = accounts.find(acc => acc.id === tx.fromAccountId)?.name || '';
      const to = accounts.find(acc => acc.id === tx.toAccountId)?.name || '';
      return {
        'التاريخ': new Date(tx.date).toLocaleString('ar-EG'),
        'النوع': tx.type,
        'البيان': tx.description,
        'القسم / التصنيف': tx.category || '',
        'من حساب': from,
        'إلى حساب': to,
        'المبلغ': tx.amount,
      };
    });
    exportToExcel(exportData, 'سجل_حركات_الخزينة', 'Treasury', 'سجل تفصيلي لحركات الدرج والعهد والمبيعات والمصروفات');
  };

  const openTransaction = (type: ManualTransactionType) => {
    setTransactionType(type);
    setIsTransactionModalOpen(true);
  };

  const budgetProgress = useMemo(() => {
    const progress = new Map<string, number>();
    budgets.forEach(b => {
      const fundedAmount = transactions
        .filter(tx => tx.category === `تمويل: ${b.name}` && tx.type === 'transfer')
        .reduce((sum, tx) => sum + tx.amount, 0);
      progress.set(b.id, fundedAmount);
    });
    return progress;
  }, [budgets, transactions]);

  const describeTransaction = (tx: FinancialTransaction) => {
    const from = accounts.find(a => a.id === tx.fromAccountId)?.name;
    const to = accounts.find(a => a.id === tx.toAccountId)?.name;
    if (tx.type === 'sale_income') return `غلة مبيعات: ${tx.description} → ${to || 'غير محدد'}`;
    if (tx.type === 'expense') return `مصروف: ${tx.description} من ${from || 'غير محدد'}`;
    if (tx.type === 'capital_deposit') return `دفعة إدارة / عهدة: ${tx.description} → ${to || 'غير محدد'}`;
    if (tx.type === 'transfer') return `تحويل: ${from || '-'} → ${to || '-'}`;
    if (tx.type === 'expense_reversal') return `إلغاء مصروف: ${tx.description}`;
    return tx.description;
  };

  const amountClass = (tx: FinancialTransaction) => tx.toAccountId && !tx.fromAccountId ? 'text-emerald-700' : tx.type === 'transfer' ? 'text-blue-700' : 'text-rose-700';

  return (
    <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <div>
              <h3 className="text-2xl font-black text-slate-900">الخزينة والحسابات</h3>
              <p className="text-sm text-slate-500 mt-1">إدارة دقيقة للغلة، المصروفات، العهد، ودرج المحل. لا تسجل المبيعات كمصروفات.</p>
            </div>
            <button onClick={handleExportExcel} className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors font-bold border border-emerald-100 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">download</span>
              تصدير سجل الخزينة Excel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
              <p className="text-xs text-emerald-700 font-bold">إجمالي غلة المبيعات</p>
              <p className="text-2xl font-black text-emerald-800 mt-1">{money(summary.totalSalesIncome)}</p>
            </div>
            <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4">
              <p className="text-xs text-rose-700 font-bold">إجمالي المصروفات</p>
              <p className="text-2xl font-black text-rose-800 mt-1">{money(summary.totalExpenses)}</p>
            </div>
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
              <p className="text-xs text-blue-700 font-bold">عهد مسؤولين/أقسام</p>
              <p className="text-2xl font-black text-blue-800 mt-1">{money(summary.totalCustody)}</p>
            </div>
            <div className="rounded-2xl bg-slate-900 text-white p-4">
              <p className="text-xs text-slate-300 font-bold">صافي درج المحل</p>
              <p className="text-2xl font-black mt-1">{money(summary.drawerNet)}</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-950 leading-7">
            <p><b>طريقة العمل:</b> زر غلة المبيعات للمبيعات الداخلة. زر المصروف للمبالغ الخارجة. زر عهدة مسؤول قسم للدفعات المسلمة لمسؤول قسم مثل الفلافل. زر التحويل لنقل المال بين حسابين فقط.</p>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6 border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-4">أرصدة الحسابات</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map(acc => (
              <div key={acc.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-700">{acc.name}</h4>
                <p className="text-2xl font-black text-green-600 mt-1">{money(accountBalances.get(acc.id) || 0)} ل.س</p>
                {acc.id === drawerAccount?.id && <p className="text-xs text-slate-500 mt-2">يمثل النقد الموجود فعلياً في درج المحل.</p>}
                {acc.id === falafelCustody?.id && <p className="text-xs text-slate-500 mt-2">يمثل مبلغاً مسلماً لمسؤول قسم الفلافل كعهدة.</p>}
              </div>
            ))}
            <button onClick={() => setIsAccountModalOpen(true)} className="min-h-[112px] flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 text-slate-500 rounded-xl hover:bg-slate-100 hover:border-slate-400 transition">
              <span className="material-symbols-outlined">add</span>
              <span>إضافة حساب</span>
            </button>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6 border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-4">آخر الحركات المالية</h3>
          <div className="overflow-x-auto max-h-[480px]">
            <table className="w-full table-auto text-right text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0">
                <tr>
                  <th className="py-2 px-4">التاريخ</th>
                  <th className="py-2 px-4">البيان</th>
                  <th className="py-2 px-4">التصنيف</th>
                  <th className="py-2 px-4">المبلغ</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {[...transactions].reverse().slice(0, 80).map(tx => (
                  <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-4 whitespace-nowrap">{new Date(tx.date).toLocaleString('ar-EG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-2 px-4 font-medium">{describeTransaction(tx)}</td>
                    <td className="py-2 px-4 text-xs text-slate-500">{tx.category || '-'}</td>
                    <td className={`py-2 px-4 font-black ${amountClass(tx)}`}>{money(tx.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6 border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-4">المخصصات المالية</h3>
          <div className="space-y-4">
            {budgets.map(b => {
              const funded = budgetProgress.get(b.id) || 0;
              const percentage = b.targetAmount > 0 ? (funded / b.targetAmount) * 100 : 0;
              return (
                <div key={b.id} className="p-4 border rounded-xl">
                  <div className="flex justify-between items-center mb-2"><span className="font-bold">{b.name}</span><span className="font-bold text-sm">{money(funded)} / {money(b.targetAmount)}</span></div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5"><div className="h-2.5 rounded-full bg-indigo-600" style={{ width: `${Math.min(percentage, 100)}%` }} /></div>
                </div>
              );
            })}
            <button onClick={() => setIsBudgetModalOpen(true)} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 text-slate-500 rounded-xl hover:bg-slate-100 hover:border-slate-400 transition py-4">
              <span className="material-symbols-outlined">add</span>
              <span>إضافة مخصص جديد</span>
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-4">إدخال يدوي دقيق</h3>
          <div className="flex flex-col gap-3">
            <button onClick={() => openTransaction('sale_income')} className="w-full text-right flex items-center gap-3 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition border border-emerald-100" title="المبيعات والغلة الداخلة إلى درج المحل">
              <span className="material-symbols-outlined text-emerald-700">point_of_sale</span><span className="font-bold text-emerald-900">تسجيل غلة مبيعات</span>
            </button>
            <button onClick={() => openTransaction('expense')} className="w-full text-right flex items-center gap-3 p-4 bg-rose-50 hover:bg-rose-100 rounded-xl transition border border-rose-100" title="المبالغ الخارجة كمصروفات">
              <span className="material-symbols-outlined text-rose-700">payments</span><span className="font-bold text-rose-900">تسجيل مصروف</span>
            </button>
            <button onClick={() => openTransaction('capital_deposit')} className="w-full text-right flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition border border-blue-100" title="دفعة إدارة أو عهدة لمسؤول قسم">
              <span className="material-symbols-outlined text-blue-700">account_balance_wallet</span><span className="font-bold text-blue-900">تسجيل عهدة مسؤول قسم</span>
            </button>
            <button onClick={() => openTransaction('transfer')} className="w-full text-right flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition border border-slate-200" title="نقل مبلغ بين حسابين">
              <span className="material-symbols-outlined text-slate-700">sync_alt</span><span className="font-bold text-slate-900">تحويل بين الحسابات</span>
            </button>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6 border border-slate-100 text-sm leading-7 text-slate-600">
          <h3 className="text-lg font-black text-slate-800 mb-3">تعليمات الإدخال</h3>
          <p><b>المبيعات:</b> لا تسجل كمصروف. استخدم زر تسجيل غلة مبيعات.</p>
          <p><b>المصروف:</b> هو مبلغ خرج فعلياً من درج أو عهدة.</p>
          <p><b>العهدة:</b> مبلغ سلمته الإدارة لمسؤول قسم، مثل مسؤول الفلافل.</p>
          <p><b>كل يوم مستقل:</b> 30/4 لا يخلط مع 1/5 أو 2/5.</p>
        </div>
      </div>

      {isAccountModalOpen && <AccountModal account={null} onClose={() => setIsAccountModalOpen(false)} onSave={onSaveAccount} />}
      {isTransactionModalOpen && <FinancialTransactionModal type={transactionType} accounts={accounts} budgets={budgets} onClose={() => setIsTransactionModalOpen(false)} onSave={onSaveTransaction} />}
      {isBudgetModalOpen && <BudgetModal onClose={() => setIsBudgetModalOpen(false)} onSave={onSaveBudget} />}
    </div>
  );
};

export default FinanceView;
