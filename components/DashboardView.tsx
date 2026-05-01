import React, { useMemo, useState, useEffect, useRef } from 'react';
import type { Invoice, Product, Expense, Customer } from '../types';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const lineNet = (item: Invoice['items'][number]) => {
  const modifiersTotal = item.modifiers?.reduce((sum, mod) => sum + mod.price, 0) ?? 0;
  const manualAddition = item.manualAddition ?? 0;
  return ((item.price - (item.discount ?? 0)) + modifiersTotal + manualAddition) * item.quantity;
};

const isPaidRevenueInvoice = (invoice: Invoice) => {
  return invoice.paymentStatus === 'paid' && ['sale', 'delivery', 'reservation', 'dine_in', 'takeaway'].includes(invoice.type) && invoice.status !== 'cancelled';
};

const StatCard = ({ title, value, icon, colorTheme, subtext }: { title: string, value: string | number, icon: string, colorTheme: 'emerald' | 'indigo' | 'red' | 'orange', subtext?: string }) => {
  const themeStyles = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
  }[colorTheme];

  return (
    <div className={`bg-white p-6 rounded-[1.5rem] shadow-sm flex items-center gap-5 border ${themeStyles.border} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
      <div className={`p-4 rounded-2xl ${themeStyles.bg} flex items-center justify-center`}>
        <span className={`material-symbols-outlined text-3xl ${themeStyles.text}`}>{icon}</span>
      </div>
      <div>
        <h3 className="text-slate-500 text-sm font-semibold">{title}</h3>
        <p className={`text-3xl font-black mt-1 ${themeStyles.text}`}>{value}</p>
        {subtext && <p className="text-xs text-slate-400 mt-1 font-medium">{subtext}</p>}
      </div>
    </div>
  );
};

const InfoListCard: React.FC<{ title: string; icon: string; children: React.ReactNode; }> = ({ title, icon, children }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-slate-50 rounded-lg">
        <span className="material-symbols-outlined text-slate-600">{icon}</span>
      </div>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
    </div>
    <div className="space-y-3 text-sm flex-1 overflow-y-auto pr-2 custom-scrollbar">
      {children}
    </div>
  </div>
);

const DashboardView: React.FC<{
  invoices: Invoice[];
  products: Product[];
  expenses: Expense[];
  customers: Customer[];
}> = ({ invoices, expenses }) => {
  const [dateRange, setDateRange] = useState<'all' | '7' | '30'>('30');
  const salesTrendChartRef = useRef<HTMLCanvasElement>(null);
  const expenseBreakdownChartRef = useRef<HTMLCanvasElement>(null);
  const topProductsChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<{ [key: string]: Chart | null }>({});

  const {
    netSales,
    totalExpenses,
    netOperating,
    pendingOrders,
    recentSales,
    dailyData,
    todayNetSales,
    expenseBreakdown,
    topProducts,
  } = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const rangeStart = new Date();

    if (dateRange !== 'all') {
      rangeStart.setDate(today.getDate() - parseInt(dateRange, 10));
    } else {
      rangeStart.setFullYear(1970);
    }
    rangeStart.setHours(0, 0, 0, 0);

    const dateFilter = (itemDateStr?: string) => {
      if (!itemDateStr) return false;
      return new Date(itemDateStr) >= rangeStart;
    };

    const isToday = (dateStr?: string) => Boolean(dateStr && dateStr.split('T')[0] === todayStr);

    const completedSales = invoices.filter(inv => isPaidRevenueInvoice(inv) && dateFilter(inv.paidDate ?? inv.date));
    const returns = invoices.filter(inv => inv.type === 'return' && dateFilter(inv.date));
    const filteredExpenses = expenses.filter(exp => dateFilter(exp.date) && exp.status !== 'draft' && exp.status !== 'cancelled');

    const totalSalesValue = completedSales.reduce((sum, inv) => sum + inv.total, 0);
    const totalReturnsValue = returns.reduce((sum, inv) => sum + Math.abs(inv.total), 0);
    const netSales = totalSalesValue - totalReturnsValue;
    const totalExpensesValue = filteredExpenses.reduce((sum, exp) => sum + (exp.amount ?? 0), 0);
    const netOperating = netSales - totalExpensesValue;

    const todaySales = invoices.filter(inv => isPaidRevenueInvoice(inv) && isToday(inv.paidDate ?? inv.date));
    const todayReturns = invoices.filter(inv => inv.type === 'return' && isToday(inv.date));
    const todayNetSales = todaySales.reduce((sum, inv) => sum + inv.total, 0) - todayReturns.reduce((sum, inv) => sum + Math.abs(inv.total), 0);

    const pendingOrders = invoices.filter(inv => inv.status === 'pending' && ['delivery', 'reservation', 'dine_in', 'takeaway'].includes(inv.type)).length;

    const recentSales = completedSales
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const dailyData: { [date: string]: { expense: number; sales: number; net: number } } = {};
    if (dateRange !== 'all') {
      const days = parseInt(dateRange, 10);
      for (let i = days; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        dailyData[d.toISOString().split('T')[0]] = { expense: 0, sales: 0, net: 0 };
      }
    }

    completedSales.forEach(inv => {
      const day = new Date(inv.date).toISOString().split('T')[0];
      if (!dailyData[day]) dailyData[day] = { expense: 0, sales: 0, net: 0 };
      dailyData[day].sales += inv.total;
      dailyData[day].net += inv.total;
    });

    returns.forEach(inv => {
      const day = new Date(inv.date).toISOString().split('T')[0];
      if (!dailyData[day]) dailyData[day] = { expense: 0, sales: 0, net: 0 };
      dailyData[day].sales -= Math.abs(inv.total);
      dailyData[day].net -= Math.abs(inv.total);
    });

    filteredExpenses.forEach(exp => {
      const day = new Date(exp.date).toISOString().split('T')[0];
      if (!dailyData[day]) dailyData[day] = { expense: 0, sales: 0, net: 0 };
      dailyData[day].expense += exp.amount ?? 0;
      dailyData[day].net -= exp.amount ?? 0;
    });

    const expenseBreakdown: { [category: string]: number } = {};
    filteredExpenses.forEach(exp => {
      const category = exp.category ?? 'غير مصنف';
      expenseBreakdown[category] = (expenseBreakdown[category] || 0) + (exp.amount ?? 0);
    });

    const productSales: { [id: string]: { name: string; count: number; total: number } } = {};
    completedSales.forEach(inv => {
      inv.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.productName, count: 0, total: 0 };
        }
        productSales[item.productId].count += item.quantity;
        productSales[item.productId].total += lineNet(item);
      });
    });

    const topProducts = Object.values(productSales).sort((a, b) => b.total - a.total).slice(0, 5);

    return { netSales, totalExpenses: totalExpensesValue, netOperating, pendingOrders, recentSales, dailyData, todayNetSales, expenseBreakdown, topProducts };
  }, [invoices, expenses, dateRange]);

  const [printContent, setPrintContent] = useState<{ title: string; items: any[]; type: 'sales' | 'expenses' } | null>(null);
  const dateRangeText = dateRange === 'all' ? 'كل الأوقات' : `آخر ${dateRange} يوم`;

  const handlePrint = (type: 'sales' | 'expenses') => {
    const rangeStart = new Date();
    if (dateRange !== 'all') rangeStart.setDate(new Date().getDate() - parseInt(dateRange, 10));

    if (type === 'sales') {
      setPrintContent({
        title: `تقرير المبيعات - ${dateRangeText}`,
        items: invoices.filter(inv => isPaidRevenueInvoice(inv) && (dateRange === 'all' || new Date(inv.date) >= rangeStart)),
        type,
      });
    } else {
      setPrintContent({
        title: `تقرير المصروفات - ${dateRangeText}`,
        items: expenses.filter(exp => dateRange === 'all' || new Date(exp.date) >= rangeStart),
        type,
      });
    }

    setTimeout(() => {
      window.print();
      setPrintContent(null);
    }, 100);
  };

  useEffect(() => {
    Object.keys(chartInstances.current).forEach(key => chartInstances.current[key]?.destroy());
    const sortedDays = Object.keys(dailyData).sort();
    const labels = sortedDays.map(d => new Date(d).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }));

    const ctxSales = salesTrendChartRef.current?.getContext('2d');
    if (ctxSales) {
      chartInstances.current.salesTrend = new Chart(ctxSales, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'صافي المبيعات', data: sortedDays.map(day => dailyData[day].sales), backgroundColor: 'rgba(99, 102, 241, 0.8)', borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } },
      });
    }

    const ctxExpense = expenseBreakdownChartRef.current?.getContext('2d');
    if (ctxExpense) {
      const categories = Object.keys(expenseBreakdown);
      const data = Object.values(expenseBreakdown);
      chartInstances.current.expenseBreakdown = new Chart(ctxExpense, {
        type: 'doughnut',
        data: { labels: categories.length ? categories : ['لا يوجد مصروفات'], datasets: [{ data: data.length ? data : [1], backgroundColor: data.length ? ['rgba(239, 68, 68, 0.8)', 'rgba(249, 115, 22, 0.8)', 'rgba(234, 179, 8, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(139, 92, 246, 0.8)'] : ['rgba(200, 200, 200, 0.3)'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right' } } },
      });
    }

    const ctxTopProducts = topProductsChartRef.current?.getContext('2d');
    if (ctxTopProducts) {
      chartInstances.current.topProducts = new Chart(ctxTopProducts, {
        type: 'doughnut',
        data: { labels: topProducts.length ? topProducts.map(p => p.name) : ['لا يوجد مبيعات'], datasets: [{ data: topProducts.length ? topProducts.map(p => p.total) : [1], backgroundColor: topProducts.length ? ['rgba(99, 102, 241, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(236, 72, 153, 0.8)', 'rgba(14, 165, 233, 0.8)'] : ['rgba(200, 200, 200, 0.3)'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right' } } },
      });
    }

    return () => Object.keys(chartInstances.current).forEach(key => chartInstances.current[key]?.destroy());
  }, [dailyData, expenseBreakdown, topProducts]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">لوحة التحكم</h2>
          <p className="text-slate-500 mt-2">نظرة تشغيلية على مبيعات ومصروفات مطابخ الشرق.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
          <button onClick={() => setDateRange('7')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${dateRange === '7' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>آخر 7 أيام</button>
          <button onClick={() => setDateRange('30')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${dateRange === '30' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>آخر 30 يوم</button>
          <button onClick={() => setDateRange('all')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${dateRange === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>كل الأوقات</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard title="صافي المبيعات اليوم" value={`${todayNetSales.toFixed(2)}`} icon="today" colorTheme="emerald" subtext="اليوم فقط" />
        <StatCard title="صافي المبيعات" value={`${netSales.toFixed(2)}`} icon="monitoring" colorTheme="indigo" subtext={dateRangeText} />
        <StatCard title="المصروفات" value={`${totalExpenses.toFixed(2)}`} icon="receipt_long" colorTheme="red" subtext={dateRangeText} />
        <StatCard title="صافي التشغيل" value={`${netOperating.toFixed(2)}`} icon="calculate" colorTheme="orange" subtext="المبيعات - المصروفات - المرتجعات" />
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
        <button onClick={() => handlePrint('sales')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 sm:px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:bg-slate-50 transition-all text-slate-700 font-medium text-sm">
          <span className="material-symbols-outlined text-indigo-600 text-lg">print</span>
          <span className="whitespace-nowrap">طباعة المبيعات</span>
        </button>
        <button onClick={() => handlePrint('expenses')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 sm:px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:bg-slate-50 transition-all text-slate-700 font-medium text-sm">
          <span className="material-symbols-outlined text-red-600 text-lg">print</span>
          <span className="whitespace-nowrap">طباعة المصروفات</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-indigo-500">bar_chart</span>اتجاه صافي المبيعات ({dateRangeText})</h3>
          <div className="relative h-72"><canvas ref={salesTrendChartRef}></canvas></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-amber-500">pie_chart</span>الأصناف الأكثر مبيعاً ({dateRangeText})</h3>
          <div className="relative h-64"><canvas ref={topProductsChartRef}></canvas></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-red-500">donut_large</span>توزيع المصروفات ({dateRangeText})</h3>
          <div className="relative h-64"><canvas ref={expenseBreakdownChartRef}></canvas></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="h-96">
          <InfoListCard title="آخر المبيعات" icon="receipt_long">
            {recentSales.length > 0 ? recentSales.map(inv => (
              <div key={inv.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600"><span className="material-symbols-outlined text-sm">shopping_bag</span></div><div><p className="font-bold text-slate-800">{inv.customerInfo?.name || 'بيع مباشر'}</p><p className="text-xs text-slate-500">{new Date(inv.date).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}</p></div></div>
                <div className="text-right"><span className="font-bold text-green-600 block">{inv.total.toFixed(2)}</span><span className="text-[10px] text-slate-400 font-mono">{inv.id.substring(0, 8)}</span></div>
              </div>
            )) : <p className="text-slate-500 p-4 text-center">لا يوجد مبيعات حديثة.</p>}
          </InfoListCard>
        </div>
      </div>

      {printContent && (
        <div id="print-area" className="p-8 bg-white text-right" dir="rtl">
          <h1 className="text-2xl font-bold mb-4 text-center border-b pb-4">{printContent.title}</h1>
          <p className="mb-6 text-slate-500 text-center">تاريخ التقرير: {new Date().toLocaleString('ar-EG')}</p>
          <table className="w-full border-collapse border border-slate-300">
            <thead><tr className="bg-slate-100"><th className="border border-slate-300 p-2">التاريخ</th><th className="border border-slate-300 p-2">البيان / الوصف</th><th className="border border-slate-300 p-2">المبلغ</th></tr></thead>
            <tbody>{printContent.items.map((item, idx) => (<tr key={idx}><td className="border border-slate-300 p-2">{new Date(item.date).toLocaleDateString()}</td><td className="border border-slate-300 p-2">{printContent.type === 'expenses' ? item.description : (item.customerInfo?.name || 'طلب مباشر')}</td><td className="border border-slate-300 p-2">{(item.total ?? item.amount ?? 0).toFixed(2)}</td></tr>))}</tbody>
            <tfoot><tr className="font-bold bg-slate-50"><td colSpan={2} className="border border-slate-300 p-2 text-left">الإجمالي:</td><td className="border border-slate-300 p-2">{printContent.items.reduce((sum, i) => sum + (i.total ?? i.amount ?? 0), 0).toFixed(2)}</td></tr></tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
