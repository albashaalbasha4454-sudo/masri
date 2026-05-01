import React, { useState, useMemo } from 'react';
import type { Expense, FinancialAccount, User } from '../types';
import Modal from './Modal';
import InputField from './common/InputField';
import Pagination from './common/Pagination';
import { exportToExcel } from '../services/excelService';

interface ExpensesViewProps {
  expenses: Expense[];
  accounts: FinancialAccount[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Omit<Expense, 'id'>>) => void;
  currentUser?: User;
}

const ITEMS_PER_PAGE = 10;

const ExpensesView: React.FC<ExpensesViewProps> = ({ expenses, accounts, addExpense, updateExpense, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  const handleExportExcel = () => {
    const exportData = sortedExpenses.map(exp => ({
        'التاريخ': new Date(exp.date).toLocaleDateString('ar-EG'),
        'البيان': exp.description,
        'المبلغ': exp.amount.toFixed(2),
        'القسم/التصنيف': exp.category || '-',
        'الحساب': accounts.find(a => a.id === exp.accountId)?.name || 'غير معروف',
        'بواسطة': exp.processedBy || '-',
        'ملاحظات': exp.notes || '-'
    }));
    exportToExcel(exportData, 'تقرير_المصروفات', 'Expenses', 'سجل المصروفات التشغيلية', 'جميع الأوقات');
  };
  
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedExpenses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedExpenses, currentPage]);
  const totalPages = Math.ceil(sortedExpenses.length / ITEMS_PER_PAGE);

  const handleSave = (expenseData: Omit<Expense, 'id'>) => {
    if (editingExpense) {
        updateExpense(editingExpense.id, expenseData);
    } else {
        addExpense({
            ...expenseData,
            processedBy: currentUser?.username
        });
    }
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white shadow-lg rounded-xl">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">سجل المصروفات</h2>
              <p className="text-sm text-slate-500 mt-1">عرض وتصفح جميع المصروفات المسجلة.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <button 
                    onClick={handleExportExcel}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 font-bold py-2 px-4 rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-100 shadow-sm"
                >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    تصدير Excel
                </button>
                <button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    تسجيل مصروف
                </button>
            </div>
        </div>
        <div className="space-y-4 md:space-y-0">
            {/* Desktop Header */}
            <div className="hidden md:grid md:grid-cols-7 gap-4 items-center bg-slate-50 text-slate-600 uppercase text-xs font-bold px-6 py-3 rounded-t-lg">
                <div>التاريخ</div>
                <div className="col-span-2">البيان والملاحظات</div>
                <div>المبلغ</div>
                <div>التصنيف</div>
                <div>دُفع من</div>
                <div className="text-center">الإجراءات</div>
            </div>

            {/* Expenses List / Cards */}
            <div className="space-y-3 md:space-y-0 text-right">
            {paginatedExpenses.map((expense) => (
                <div key={expense.id} className={`
                    md:grid md:grid-cols-7 md:gap-4 md:items-center
                    p-4 md:px-6 md:py-3 border-b border-slate-200 
                    hover:bg-slate-50 bg-white md:bg-transparent
                    block rounded-lg md:rounded-none shadow-sm md:shadow-none
                `}>
                    {/* Mobile Header */}
                    <div className="flex justify-between items-start mb-2 md:hidden">
                        <h3 className="font-bold text-slate-800">{expense.description}</h3>
                        <span className="font-bold text-red-600">{expense.amount.toFixed(2)}</span>
                    </div>

                    {/* Desktop Data Cells */}
                    <div className="hidden md:block text-sm">{new Date(expense.date).toLocaleDateString('ar-EG')}</div>
                    <div className="hidden md:block font-semibold text-sm col-span-2">
                        {expense.description}
                        {expense.notes && (
                            <div className={`text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded inline-block ${expense.notes.includes('✔') || expense.notes.includes('❓') ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                {expense.notes}
                            </div>
                        )}
                        <div className="text-[9px] text-slate-400 mt-0.5 italic">بواسطة: {expense.processedBy || '-'}</div>
                    </div>
                    <div className="hidden md:block font-bold text-red-600 text-sm">{expense.amount.toFixed(2)}</div>
                    <div className="hidden md:block text-sm">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                            {expense.category || '-'}
                        </span>
                    </div>
                    <div className="hidden md:block text-sm text-slate-500">{accounts.find(a => a.id === expense.accountId)?.name || 'غير معروف'}</div>
                    
                    <div className="text-center">
                        {isAdmin && (
                            <button 
                                onClick={() => handleEdit(expense)}
                                className="flex items-center gap-1 mx-auto bg-slate-100 text-slate-600 px-3 py-1 rounded-lg hover:bg-slate-200 transition-colors text-xs font-bold"
                            >
                                <span className="material-symbols-outlined text-sm">edit</span>
                                تعديل
                            </button>
                        )}
                    </div>

                    {/* Mobile Grid Data */}
                    <div className="grid grid-cols-2 gap-y-2 text-xs md:hidden pt-2 border-t border-slate-100 mt-2">
                        <div><span className="text-slate-500">التاريخ:</span> {new Date(expense.date).toLocaleDateString('ar-EG')}</div>
                        <div><span className="text-slate-500">التصنيف:</span> {expense.category || '-'}</div>
                        <div><span className="text-slate-500">دُفع من:</span> {accounts.find(a => a.id === expense.accountId)?.name || 'غير معروف'}</div>
                        <div><span className="text-slate-500">بواسطة:</span> {expense.processedBy || '-'}</div>
                        {expense.notes && <div className="col-span-2 text-red-500 font-bold">{expense.notes}</div>}
                    </div>
                </div>
            ))}
            </div>
            {sortedExpenses.length === 0 && <p className="text-center py-8 text-slate-500">لا يوجد مصروفات لعرضها.</p>}
        </div>
        <div className="p-6 border-t border-slate-200 bg-slate-50/30">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={sortedExpenses.length}
          />
        </div>
      </div>
      {isModalOpen && (
        <ExpenseModal
          onClose={handleCloseModal}
          onSave={handleSave}
          accounts={accounts}
          initialData={editingExpense || undefined}
        />
      )}
    </div>
  );
};

const ExpenseModal: React.FC<{
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'>) => void;
  accounts: FinancialAccount[];
  initialData?: Expense;
}> = ({ onClose, onSave, accounts, initialData }) => {
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [accountId, setAccountId] = useState(initialData?.accountId || accounts.find(a => a.type === 'cash')?.id || '');
  const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    if (!description.trim()) newErrors.description = 'البيان مطلوب.';
    const numAmount = parseFloat(amount);
    if (!initialData && (isNaN(numAmount) || numAmount < 0)) newErrors.amount = 'المبلغ يجب أن يكون رقماً موجباً.';
    if (!accountId) newErrors.accountId = 'يجب تحديد حساب الدفع.';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave({ 
        description, 
        amount: parseFloat(amount) || 0, 
        category, 
        date: new Date(date).toISOString(), 
        accountId, 
        notes,
        processedBy: initialData?.processedBy 
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={initialData ? 'تعديل المصروف' : 'إضافة مصروف جديد'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField id="description" label="البيان" value={description} onChange={(e) => setDescription(e.target.value)} error={errors.description}/>
        <InputField id="amount" label="المبلغ" value={amount} onChange={(e) => setAmount(e.target.value)} type="number" error={errors.amount} placeholder={initialData?.amount === 0 ? "أدخل السعر الآن..." : ""}/>
        
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <label htmlFor="category" className="block text-indigo-900 text-sm font-bold mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">splitscreen</span>
                القسم
            </label>
            <input 
                id="category" 
                list="category-suggestions"
                placeholder="مثلاً: الفلافل، الفرن، الشرقي..."
                className="w-full p-2.5 border border-indigo-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500/20"
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
            />
            <datalist id="category-suggestions">
                <option value="الفلافل" />
                <option value="الفرن" />
                <option value="الشرقي" />
                <option value="المشويات" />
                <option value="الغربي" />
            </datalist>
        </div>

        <div>
            <label htmlFor="accountId" className="block text-slate-700 text-sm font-bold mb-2">الدفع من حساب</label>
            <select id="accountId" value={accountId} onChange={e => setAccountId(e.target.value)} className={`w-full p-2.5 border rounded-lg bg-white ${errors.accountId ? 'border-red-500' : 'border-slate-200'}`}>
                <option value="">-- اختر --</option>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
            {errors.accountId && <p className="text-red-500 text-xs italic mt-1">{errors.accountId}</p>}
        </div>

        <div>
            <label htmlFor="notes" className="block text-slate-700 text-sm font-bold mb-2">ملاحظات</label>
            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg bg-white" rows={3} placeholder="اكتب تفاصيل أو ملاحظات حول المراجعة..."></textarea>
        </div>

        <InputField id="date" label="التاريخ" value={date} onChange={(e) => setDate(e.target.value)} type="date" />

        <div className="flex items-center justify-end gap-3 pt-6 mt-4 border-t border-slate-200">
          <button type="button" onClick={onClose} className="bg-slate-100 text-slate-700 font-bold py-2 px-6 rounded-xl hover:bg-slate-200 transition-colors">إلغاء</button>
          <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
            {initialData ? 'تحديث البيانات' : 'حفظ المصروف'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ExpensesView;