import React, { useState, useMemo } from 'react';
import type { ActivityLog } from '../types';
import Pagination from './common/Pagination';
import { exportToExcel } from '../services/excelService';

interface ActivityLogViewProps {
  logs: ActivityLog[];
}

const ITEMS_PER_PAGE = 20;

const ActivityLogView: React.FC<ActivityLogViewProps> = ({ logs }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => 
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, searchTerm]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);

  const handleExportExcel = () => {
    const exportData = filteredLogs.map(log => ({
      'المستخدم': log.username,
      'العملية': log.operation,
      'الوصف': log.description,
      'التاريخ والوقت': new Date(log.date).toLocaleString('ar-EG')
    }));
    exportToExcel(exportData, 'سجل_النشاط', 'ActivityLog', 'سجل نشاط النظام (المستخدمين والعمليات)');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">history</span>
              سجل النشاط
            </h2>
            <p className="text-sm text-slate-500 mt-1">تتبع جميع العمليات التي قام بها المستخدمون على النظام.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
                onClick={handleExportExcel}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors font-bold border border-emerald-100 shadow-sm"
            >
                <span className="material-symbols-outlined text-[18px]">download</span>
                تصدير Excel (سجل النشاط)
            </button>
            <div className="relative flex-1 md:w-64">
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input 
                    type="text" 
                    placeholder="بحث في السجل..." 
                    className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">المستخدم</th>
                <th className="p-4">العملية</th>
                <th className="p-4">الوصف</th>
                <th className="p-4">التاريخ والوقت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-indigo-50/10 transition-colors">
                  <td className="p-4 font-bold text-slate-700">{log.username}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-black uppercase">
                      {log.operation}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{log.description}</td>
                  <td className="p-4 font-mono text-xs text-slate-500">
                    {new Date(log.date).toLocaleString('ar-EG')}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-500 italic">
                    لا يوجد سجلات نشاط مطابقة للبحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredLogs.length}
          />
        </div>
      </div>
    </div>
  );
};

export default ActivityLogView;
