import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import InputField from './common/InputField';
import type { FinancialAccount, Budget, FinancialTransactionType } from '../types';

type ModalTransactionType = Extract<FinancialTransactionType, 'sale_income' | 'expense' | 'capital_deposit' | 'transfer'>;

interface FinancialTransactionModalProps {
  type: ModalTransactionType;
  accounts: FinancialAccount[];
  budgets: Budget[];
  onClose: () => void;
  onSave: (data: any) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const FinancialTransactionModal: React.FC<FinancialTransactionModalProps> = ({ type, accounts, budgets, onClose, onSave }) => {
  const defaultCashAccount = accounts.find(a => a.id === 'cash-default')?.id || accounts.find(a => a.type === 'cash')?.id || '';
  const defaultCustodyAccount = accounts.find(a => a.name.includes('عهدة') || a.id.includes('custody'))?.id || defaultCashAccount;

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [fromAccountId, setFromAccountId] = useState(defaultCashAccount);
  const [toAccountId, setToAccountId] = useState(type === 'capital_deposit' ? defaultCustodyAccount : defaultCashAccount);
  const [category, setCategory] = useState(type === 'sale_income' ? 'قسم الفلافل / غلة مبيعات' : type === 'capital_deposit' ? 'قسم الفلافل / عهدة مسؤول القسم' : '');
  const [date, setDate] = useState(today());
  const [error, setError] = useState('');

  const { title, help, fields } = useMemo(() => {
    switch (type) {
      case 'sale_income':
        return {
          title: 'تسجيل غلة مبيعات',
          help: 'استخدم هذا الزر للمبيعات والغلة فقط. المبلغ يدخل إلى درج المحل أو الحساب الذي تختاره.',
          fields: ['date', 'description', 'amount', 'to', 'category']
        };
      case 'expense':
        return {
          title: 'تسجيل مصروف',
          help: 'استخدم هذا الزر للمبالغ الخارجة فقط. اختر الحساب الذي خرج منه المال.',
          fields: ['date', 'description', 'amount', 'from', 'category']
        };
      case 'capital_deposit':
        return {
          title: 'تسجيل دفعة إدارة / عهدة قسم',
          help: 'استخدم هذا الزر عند تسليم مبلغ لمسؤول قسم. لا تسجله كغلة مبيعات ولا كمصروف.',
          fields: ['date', 'description', 'amount', 'to', 'category']
        };
      case 'transfer':
        return {
          title: 'تحويل بين الحسابات',
          help: 'استخدمه فقط عند نقل مبلغ من حساب إلى حساب آخر.',
          fields: ['date', 'amount', 'from', 'to', 'description', 'category']
        };
      default:
        return { title: 'حركة مالية', help: '', fields: [] };
    }
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('المبلغ يجب أن يكون رقماً موجباً.'); return;
    }
    if (!description.trim()) {
      setError('البيان مطلوب.'); return;
    }
    if ((type === 'expense' || type === 'transfer') && !fromAccountId) {
      setError('يجب تحديد الحساب المصدر.'); return;
    }
    if ((type === 'sale_income' || type === 'capital_deposit' || type === 'transfer') && !toAccountId) {
      setError('يجب تحديد الحساب الهدف.'); return;
    }
    if (type === 'transfer' && fromAccountId === toAccountId) {
      setError('لا يمكن التحويل من وإلى نفس الحساب.'); return;
    }

    onSave({
      type,
      description: description.trim(),
      amount: numAmount,
      category: category.trim(),
      date: new Date(`${date}T12:00:00`).toISOString(),
      fromAccountId: (type === 'expense' || type === 'transfer') ? fromAccountId : undefined,
      toAccountId: (type === 'sale_income' || type === 'capital_deposit' || type === 'transfer') ? toAccountId : undefined,
    });
    onClose();
  };

  const accountSelector = (id: string, label: string, value: string, setValue: (val: string) => void) => (
    <div>
      <label htmlFor={id} className="block text-slate-700 text-sm font-bold mb-2">{label}</label>
      <select id={id} value={value} onChange={e => setValue(e.target.value)} className="w-full p-3 border rounded-xl bg-white border-slate-300">
        <option value="">-- اختر --</option>
        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
      </select>
    </div>
  );

  return (
    <Modal isOpen={true} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {help && <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 p-4 text-sm font-bold leading-7">{help}</div>}
        {fields.includes('date') && <InputField id="date" label="التاريخ" value={date} onChange={e => setDate(e.target.value)} type="date" />}
        {fields.includes('description') && <InputField id="description" label="البيان / الوصف" value={description} onChange={e => setDescription(e.target.value)} placeholder={type === 'sale_income' ? 'مثال: غلة مبيعات قسم الفلافل ليوم 1/5' : type === 'capital_deposit' ? 'مثال: دفعة من الإدارة إلى مسؤول قسم الفلافل' : 'اكتب البيان'} />}
        {fields.includes('amount') && <InputField id="amount" label="المبلغ بالليرة" value={amount} onChange={e => setAmount(e.target.value)} type="number" />}
        {fields.includes('from') && accountSelector('fromAccount', 'من حساب', fromAccountId, setFromAccountId)}
        {fields.includes('to') && accountSelector('toAccount', 'إلى حساب', toAccountId, setToAccountId)}
        {fields.includes('category') && (
          <div>
            <label htmlFor="category-input" className="block text-slate-700 text-sm font-bold mb-2">القسم / التصنيف</label>
            <input list="categories" id="category-input" value={category} onChange={e => setCategory(e.target.value)} className="appearance-none border rounded-xl w-full py-3 px-3 text-slate-700" />
            <datalist id="categories">
              <option value="قسم الفلافل / غلة مبيعات" />
              <option value="قسم الفلافل / عهدة مسؤول القسم" />
              <option value="قسم الفلافل / مصروفات" />
              <option value="قسم الفرن / مصروفات" />
              <option value="درج المحل" />
              <option value="مصاريف تشغيلية" />
              {budgets.map(b => <option key={b.id} value={`تمويل: ${b.name}`} />)}
            </datalist>
          </div>
        )}

        {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
        <div className="flex items-center justify-end gap-3 pt-6 mt-4 border-t border-slate-200">
          <button type="button" onClick={onClose} className="bg-slate-100 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-200 transition-colors">إلغاء</button>
          <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">حفظ الحركة</button>
        </div>
      </form>
    </Modal>
  );
};

export default FinancialTransactionModal;
