import React from 'react';
import { UserProfile, UserRole, School } from '../types';
import { 
  Building2, 
  UserCircle2, 
  RotateCcw, 
  ChevronDown, 
  ShieldCheck, 
  GraduationCap, 
  Award, 
  Clock,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  school: School;
  activeUser: UserProfile;
  allUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onResetData: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  school,
  activeUser,
  allUsers,
  onSelectUser,
  onResetData,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const [showRoleMenu, setShowRoleMenu] = React.useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Super Admin', bg: 'bg-emerald-800 text-emerald-100', icon: ShieldCheck };
      case 'kepala_madrasah':
        return { label: 'Kepala Madrasah', bg: 'bg-amber-600 text-amber-100', icon: Award };
      case 'admin_asesmen':
        return { label: 'Admin Asesmen', bg: 'bg-teal-700 text-teal-100', icon: GraduationCap };
      case 'guru':
        return { label: 'Guru Madrasah', bg: 'bg-emerald-600 text-white', icon: UserCircle2 };
      case 'pengawas':
        return { label: 'Pengawas Ujian', bg: 'bg-indigo-700 text-indigo-100', icon: Clock };
      case 'siswa':
        return { label: 'Peserta Didik', bg: 'bg-blue-600 text-white', icon: GraduationCap };
    }
  };

  const badge = getRoleBadge(activeUser.role);
  const BadgeIcon = badge.icon;

  return (
    <header className="bg-emerald-800 text-white sticky top-0 z-40 shadow-md border-b border-emerald-900 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg bg-emerald-900/60 hover:bg-emerald-700 text-white transition focus:outline-none"
              title="Buka / Tutup Menu Navigasi"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-emerald-600 flex items-center justify-center font-bold text-emerald-950 text-lg shadow">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                    SUPER ASESMEN
                    <span className="bg-amber-400 text-emerald-950 text-xs font-black px-1.5 py-0.5 rounded shadow-sm">
                      MIN 1 PASER
                    </span>
                  </h1>
                </div>
                <p className="text-[11px] text-emerald-200 hidden sm:block">
                  Kemenag Kab. Paser Kalimantan Timur | KMA 1503 Tahun 2025 & KMA 450
                </p>
              </div>
            </div>
          </div>

          {/* Right: User Role Switcher & Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Year Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/80 text-xs text-emerald-100 border border-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>TP 2024/2025 Genap</span>
            </div>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 bg-emerald-900/90 hover:bg-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-700/80 text-left transition text-sm shadow-sm"
              >
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-white leading-tight">{activeUser.name}</div>
                  <div className="text-[10px] text-emerald-300 flex items-center gap-1">
                    <BadgeIcon className="w-3 h-3" />
                    <span>{badge.label}</span>
                  </div>
                </div>
                <div className={`sm:hidden p-1 rounded ${badge.bg}`}>
                  <BadgeIcon className="w-4 h-4" />
                </div>
                <ChevronDown className="w-4 h-4 text-emerald-300" />
              </button>

              {/* Role Dropdown Menu */}
              {showRoleMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowRoleMenu(false)}></div>
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-200 text-gray-800 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold uppercase text-gray-400">Pilih Peran Pengguna (Simulasi RBAC):</p>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                      {allUsers.map((u) => {
                        const uBadge = getRoleBadge(u.role);
                        const isSelected = u.id === activeUser.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              onSelectUser(u);
                              setShowRoleMenu(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between hover:bg-emerald-50 transition ${
                              isSelected ? 'bg-emerald-50/80 font-semibold' : ''
                            }`}
                          >
                            <div>
                              <div className="text-gray-900 font-medium">{u.name}</div>
                              <div className="text-[11px] text-gray-500">{u.nip ? `NIP. ${u.nip}` : u.nisn ? `NISN. ${u.nisn}` : u.email}</div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${uBadge.bg}`}>
                              {uBadge.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="p-2 border-t border-gray-100 bg-gray-50 text-[11px] text-gray-500 text-center">
                      Pengembang: <span className="font-semibold text-emerald-800">{school.developerName}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Reset Data Button */}
            <button
              onClick={() => {
                if (confirm('Kembalikan seluruh data ke kondisi awal simulasi MIN 1 Paser?')) {
                  onResetData();
                }
              }}
              title="Reset Data Simulasi"
              className="p-2 rounded-lg bg-emerald-900/60 hover:bg-emerald-700 text-emerald-200 hover:text-white transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
