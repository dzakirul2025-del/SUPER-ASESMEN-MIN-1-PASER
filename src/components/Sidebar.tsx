import React from 'react';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  Brain,
  MonitorCheck,
  Eye,
  CheckCheck,
  BarChart3,
  BookOpen,
  Database,
  History,
  Info,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'generator'
  | 'question_bank'
  | 'ai_generator'
  | 'cbt_exam'
  | 'proctor_monitor'
  | 'grading'
  | 'analysis'
  | 'curriculum'
  | 'database_schema'
  | 'audit_logs'
  | 'about';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  role,
}) => {
  // Role permissions check
  const isSiswa = role === 'siswa';

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Utama',
      icon: LayoutDashboard,
      badge: 'Aktif',
      visible: true,
    },
    {
      id: 'cbt_exam',
      label: 'Ruang Ujian CBT',
      icon: MonitorCheck,
      badge: isSiswa ? 'Wajib' : 'Simulasi',
      visible: true,
      highlight: true,
    },
    {
      id: 'generator',
      label: 'Generator Perangkat (15 Dokumen)',
      icon: FileSpreadsheet,
      badge: '15 Format',
      visible: !isSiswa,
    },
    {
      id: 'question_bank',
      label: 'Bank Soal Terpadu',
      icon: FileText,
      badge: 'HOTS',
      visible: !isSiswa,
    },
    {
      id: 'ai_generator',
      label: 'AI Generator Soal',
      icon: Brain,
      badge: 'Gemini',
      visible: !isSiswa && role !== 'pengawas',
    },
    {
      id: 'proctor_monitor',
      label: 'Monitoring Pengawas CBT',
      icon: Eye,
      badge: 'Live',
      visible: !isSiswa,
    },
    {
      id: 'grading',
      label: 'Penilaian & Koreksi Uraian',
      icon: CheckCheck,
      badge: 'Auto/AI',
      visible: !isSiswa && role !== 'pengawas',
    },
    {
      id: 'analysis',
      label: 'Analisis Hasil & Butir Soal',
      icon: BarChart3,
      badge: 'Statistik',
      visible: !isSiswa && role !== 'pengawas',
    },
    {
      id: 'curriculum',
      label: 'Kurikulum & Mapel Madrasah',
      icon: BookOpen,
      badge: 'KMA 450',
      visible: role === 'super_admin' || role === 'kepala_madrasah' || role === 'admin_asesmen' || role === 'guru',
    },
    {
      id: 'database_schema',
      label: 'Skema Database & Supabase',
      icon: Database,
      badge: '27 Tabel',
      visible: role === 'super_admin' || role === 'admin_asesmen',
    },
    {
      id: 'audit_logs',
      label: 'Riwayat & Audit Log',
      icon: History,
      badge: 'Audit',
      visible: role === 'super_admin' || role === 'kepala_madrasah',
    },
    {
      id: 'about',
      label: 'Tentang Aplikasi & Tim',
      icon: Info,
      visible: true,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-emerald-950/60 z-30 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-16 h-[calc(100vh-4rem)] z-30 w-72 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-200 ease-in-out select-none shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation List */}
        <div className="p-3 overflow-y-auto flex-1 space-y-1">
          <div className="flex items-center justify-between px-3 py-2 lg:hidden border-b border-gray-100 mb-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Navigasi Menu</span>
            <button onClick={onClose} className="p-1 rounded text-gray-500 hover:text-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Menu Utama
          </div>

          {menuItems.filter(item => item.visible).map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id as NavTab);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/20'
                    : item.highlight
                    ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-amber-700' : 'text-emerald-700'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                      isActive
                        ? 'bg-emerald-800 text-emerald-100'
                        : item.highlight
                        ? 'bg-amber-200 text-amber-950'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Identity Block */}
        <div className="p-3 border-t border-gray-100 bg-emerald-50/40 text-xs text-gray-600">
          <div className="flex items-center gap-2 mb-1 text-emerald-800 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>MIN 1 Paser - Kemenag</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-tight">
            Pengembang: <span className="font-medium text-emerald-900">Dzakirul Husni, S.Pd.</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Versi 2.4.0 • Terakreditasi A
          </p>
        </div>
      </aside>
    </>
  );
};
