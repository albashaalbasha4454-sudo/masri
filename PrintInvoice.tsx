

import React, { useEffect } from 'react';
import type { Invoice } from './types';
import { Logo } from './components/Logo';

interface PrintInvoiceProps {
  invoice: Invoice;
  onClose: () => void;
  shopName: string;
  shopAddress: string;
  mode?: 'customer' | 'kitchen' | 'summary';
}

const PrintInvoice: React.FC<PrintInvoiceProps> = ({ invoice, onClose, shopName, shopAddress, mode = 'customer' }) => {
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  const subtotal = invoice.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const totalDiscount = invoice.items.reduce((sum, item) => sum + ((item.discount || 0) * (item.quantity || 1)), 0);
  const totalManualAdds = invoice.items.reduce((sum, item) => sum + ((item.manualAddition || 0) * (item.quantity || 1)), 0);
  const totalModifiers = invoice.items.reduce((sum, item) => {
    const mods = item.modifiers?.reduce((s, m) => s + m.price, 0) || 0;
    return sum + (mods * (item.quantity || 1));
  }, 0);

  const isKitchen = mode === 'kitchen';
  const isSummary = mode === 'summary';

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 p-4 sm:p-8 overflow-y-auto print:p-0 print:bg-white">
      <div className={`max-w-4xl mx-auto bg-white shadow-lg ${isKitchen ? 'p-4' : 'p-8 sm:p-12'} relative print:shadow-none print:p-0`}>
        <div id="print-area" className="text-right" dir="rtl">
          {/* Header Section */}
          {!isSummary && (
            <div className="flex flex-col items-center mb-8 border-b-2 border-dark-800 pb-8">
                {isKitchen ? (
                    <h1 className="text-4xl font-black text-dark-800">بون المطبخ / القسم</h1>
                ) : (
                    <>
                        <Logo className="h-32 w-40" />
                        <div className="text-center mt-4">
                            <h1 className="text-4xl font-black text-dark-800">{shopName}</h1>
                            <p className="text-brand-600 font-medium tracking-widest uppercase">East Food Restaurant</p>
                        </div>
                    </>
                )}
            </div>
          )}

          {isSummary && (
            <div className="text-center mb-10 border-b-4 border-dark-800 pb-6">
                <h1 className="text-4xl font-black mb-2">ملخص مبيعات الفاتورة</h1>
                <p className="text-dark-500 font-bold uppercase tracking-[0.2em]">Sales Summary Report</p>
            </div>
          )}

          {/* Invoice Details Section */}
          <div className="flex justify-between items-end mb-10 bg-dark-50 p-6 rounded-xl border border-dark-100">
            <div className="text-right">
                <h2 className={`font-black text-dark-200 uppercase tracking-widest mb-4 ${isSummary ? 'text-3xl' : 'text-5xl'}`}>
                    {isKitchen ? 'ORDER SLIP' : isSummary ? 'SUMMARY' : 'INVOICE'}
                </h2>
                <div className="space-y-2 text-base">
                    <p><span className="text-dark-400 ml-2">رقم الفاتورة:</span> <span className="font-mono font-bold text-dark-800 text-lg">#{invoice.id.substring(0,8).toUpperCase()}</span></p>
                </div>
            </div>
            <div className="text-left space-y-1 text-sm">
                <p><span className="text-dark-400 ml-2">التاريخ:</span> <span className="font-bold text-dark-800">{new Date(invoice.date).toLocaleDateString('ar-EG')}</span></p>
                <p><span className="text-dark-400 ml-2">الوقت:</span> <span className="font-bold text-dark-800">{new Date(invoice.date).toLocaleTimeString('ar-EG')}</span></p>
            </div>
          </div>

          {/* Table */}
          <div className="mb-10">
            <table className="w-full text-right border-collapse">
                <thead>
                    <tr className="bg-dark-800 text-white">
                        <th className="p-3 text-sm font-bold rounded-tr-lg">#</th>
                        <th className="p-3 text-sm font-bold">الصنف</th>
                        <th className="p-3 text-sm font-bold text-center">الكمية</th>
                        {!isKitchen && <th className="p-3 text-sm font-bold text-left">السعر</th>}
                        {!isKitchen && <th className="p-3 text-sm font-bold text-left">الخصم</th>}
                        {!isKitchen && <th className="p-3 text-sm font-bold text-left rounded-tl-lg">الإجمالي</th>}
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.map((item, index) => (
                        <tr key={`${item.productId}-${index}`} className={`border-b border-dark-100 ${index % 2 === 0 ? 'bg-white' : 'bg-dark-50/50'} page-break-inside-avoid`}>
                            <td className="p-3 text-dark-400 text-xs">{index + 1}</td>
                            <td className="p-3 font-bold text-dark-800">
                                {item.productName}
                                {item.manualAddition && item.manualAddition > 0 && !isKitchen ? (
                                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md font-bold mr-2">إضافة خاصة</span>
                                ) : null}
                                {(item.notes || (item.modifiers && item.modifiers.length > 0)) && (
                                    <div className="text-xs text-brand-600 font-bold mt-1 space-y-1 bg-brand-50 p-2 rounded-lg">
                                        {item.notes && <p className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">edit_note</span> {item.notes}</p>}
                                        {item.modifiers?.map((mod, i) => (
                                            <p key={i}>+ {mod.name}</p>
                                        ))}
                                    </div>
                                )}
                            </td>
                            <td className="p-3 text-center font-black font-mono text-dark-800 text-xl">{item.quantity || 1}</td>
                            {!isKitchen && (
                                <td className="p-3 text-left text-dark-700">
                                    {item.price.toFixed(2)}
                                    {item.manualAddition && item.manualAddition > 0 && (
                                        <div className="text-[10px] text-indigo-600 font-bold mt-1">
                                            +{item.manualAddition.toFixed(2)} (إضافي)
                                        </div>
                                    )}
                                </td>
                            )}
                            {!isKitchen && <td className="p-3 text-left text-red-500">{((item.discount || 0) * (item.quantity || 1)).toFixed(2)}</td>}
                            {!isKitchen && (
                                <td className="p-3 text-left font-bold text-dark-800">
                                    {((item.price - (item.discount || 0) + (item.manualAddition || 0) + (item.modifiers?.reduce((s, m) => s + m.price, 0) || 0)) * (item.quantity || 1)).toFixed(2)}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>

          {!isKitchen && (
            <div className="flex justify-between items-start gap-10">
                <div className="flex-1">
                    <div className="bg-dark-50 p-6 rounded-2xl border border-dark-100">
                        <h4 className="text-xs font-black text-dark-400 uppercase tracking-widest mb-4 border-b border-dark-200 pb-2">تفاصيل إضافية</h4>
                        <div className="space-y-2 text-sm">
                            <p><span className="text-dark-400 ml-2">نوع الطلب:</span> <span className="font-bold">{invoice.type === 'dine_in' ? 'محلي' : invoice.type === 'takeaway' ? 'سفري' : 'توصيل'}</span></p>
                            <p><span className="text-dark-400 ml-2">حالة الدفع:</span> <span className={`font-bold ${invoice.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>{invoice.paymentStatus === 'paid' ? 'تم الدفع' : 'آجل'}</span></p>
                        </div>
                    </div>
                </div>
                <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm p-2">
                        <span className="text-dark-500">المجموع الفرعي:</span>
                        <span className="font-medium text-dark-800">{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm p-2 text-red-500">
                        <span>إجمالي الخصم:</span>
                        <span>-{totalDiscount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-black p-3 bg-dark-800 text-white rounded-lg shadow-md">
                        <span>الإجمالي:</span>
                        <span>{invoice.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
          )}

          {isKitchen && (
            <div className="mt-8 border-t-2 border-dashed border-dark-200 pt-4">
                <p className="text-center font-black text-lg">بون طلبات المطبخ - يرجى التنفيذ فوراً</p>
            </div>
          )}

          {!isKitchen && !isSummary && (
            <div className="mt-20 text-center border-t border-dark-100 pt-6">
                <p className="text-dark-400 text-xs text-center">خدمتكم شرف لنا - مطابخ الشرق</p>
            </div>
          )}
        </div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 print:hidden flex flex-wrap gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/20 z-50">
           <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <span className="material-symbols-outlined">print</span>
            طباعة (الحالي)
          </button>
          
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-white text-dark-600 px-6 py-3 rounded-xl font-bold border border-dark-200 hover:bg-dark-50 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">close</span>
            إغلاق
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .page-break-inside-avoid { page-break-inside: avoid; }
          @page { margin: 2cm; }
        }
      `}</style>
    </div>
  );
};

export default PrintInvoice;