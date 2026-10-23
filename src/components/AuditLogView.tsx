import React, { useState } from 'react';
import { AppStorageService } from '../services/storage';
import { AuditLogItem } from '../types';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  Clock, 
  Download,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { ExportService } from '../services/exportService';

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>(AppStorageService.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('Semua');

  const filteredLogs = logs.filter(log => {
    if (selectedModule !== 'Semua' && log.module !== selectedModule) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!log.details.toLowerCase().includes(q) && !log.userName.toLowerCase().includes(q) && !log.action.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleExportLogs = () => {
    const exportData = filteredLogs.map((l, idx) => ({
      'No': idx + 1,
      'Waktu Kejadian': l.timestamp,
      'Nama Pengguna': l.userName,
      'Peran (Role)': l.role,
      'Modul Sistem': l.module,
      'Jenis Tindakan': l.action,
      'Rincian Aktivitas': l.details,
      'Status': l.status.toUpperCase(),
    }));
    ExportService.exportToCsv(exportData, `AUDIT_LOG_MIN1PASER_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Modul 12: Keamanan & Audit Trail
            </span>
            <span className="text-xs text-gray-500">
              Jejak Rekam Aktivitas Tak Terhapuskan
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-1">
            Log Audit & Riwayat Perubahan Sistem
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Mencatat setiap pembuatan instrumen asesmen, verifikasi Kepala Madrasah, aktivitas pengawas, dan kejadian CBT.
          </p>
        </div>

        <button
          onClick={handleExportLogs}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-xl transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Ekspor Log Audit (CSV)</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-200 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pengguna, tindakan, atau rincian aktivitas..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700"
        >
          <option value="Semua">Semua Modul Sistem</option>
          <option value="Sistem Inti">Sistem Inti</option>
          <option value="Generator Perangkat">Generator Perangkat</option>
          <option value="Bank Soal">Bank Soal</option>
          <option value="Computer Based Test">Computer Based Test (CBT)</option>
          <option value="Pengawasan Ujian">Pengawasan Ujian</option>
          <option value="Penilaian & Evaluasi">Penilaian & Evaluasi</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-gray-600 font-semibold">
                <th className="p-3 w-40">Waktu</th>
                <th className="p-3 w-48">Pengguna & Peran</th>
                <th className="p-3 w-36">Modul</th>
                <th className="p-3 w-40">Tindakan</th>
                <th className="p-3">Rincian Aktivitas</th>
                <th className="p-3 w-24">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50/70 transition">
                  <td className="p-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-gray-900">{log.userName}</div>
                    <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded font-mono uppercase">
                      {log.role}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-gray-700">{log.module}</td>
                  <td className="p-3 font-semibold text-gray-800">{log.action}</td>
                  <td className="p-3 text-gray-600 leading-normal">{log.details}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      log.status === 'sukses' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
