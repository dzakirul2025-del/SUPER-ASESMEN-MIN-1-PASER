import React, { useState, useMemo } from 'react';
import { 
  AppStorageService 
} from '../services/storage';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  FileSpreadsheet, 
  MonitorPlay, 
  CheckCircle2, 
  TrendingUp, 
  FileCheck2,
  Calendar,
  Layers,
  ArrowRight,
  Filter,
  Sparkles,
  Clock,
  School as SchoolIcon
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  // Filters
  const [selectedYear, setSelectedYear] = useState('2024/2025');
  const [selectedSemester, setSelectedSemester] = useState('Semua');
  const [selectedGrade, setSelectedGrade] = useState('Semua');
  const [selectedSubject, setSelectedSubject] = useState('Semua');
  const [selectedType, setSelectedType] = useState('Semua');

  // Real Database entities from storage
  const school = AppStorageService.getSchool();
  const allUsers = AppStorageService.getAllUsers();
  const subjects = AppStorageService.getSubjects();
  const questionBank = AppStorageService.getQuestionBank();
  const packages = AppStorageService.getPackages();
  const sessions = AppStorageService.getSessions();
  const attempts = AppStorageService.getAttempts();
  const auditLogs = AppStorageService.getAuditLogs();

  // Dynamic calculations
  const totalGuru = allUsers.filter(u => u.role === 'guru' || u.role === 'super_admin' || u.role === 'admin_asesmen').length;
  const totalSiswa = allUsers.filter(u => u.role === 'siswa').length;
  const totalKelas = 6; // Kelas 1 s.d. 6 di MIN 1 Paser
  const totalMapel = subjects.length;
  const totalBankSoal = questionBank.length;

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      if (selectedYear !== 'Semua' && pkg.academicYear !== selectedYear) return false;
      if (selectedSemester !== 'Semua' && pkg.semester !== selectedSemester) return false;
      if (selectedGrade !== 'Semua' && pkg.grade.toString() !== selectedGrade) return false;
      if (selectedSubject !== 'Semua' && pkg.subjectName !== selectedSubject) return false;
      if (selectedType !== 'Semua' && pkg.assessmentType !== selectedType) return false;
      return true;
    });
  }, [packages, selectedYear, selectedSemester, selectedGrade, selectedSubject, selectedType]);

  // Exam stats
  const activeExams = sessions.filter(s => s.status === 'aktif').length;
  const finishedExams = sessions.filter(s => s.status === 'selesai').length;

  // Real Average Grade from finished attempts
  const gradedAttempts = attempts.filter(a => a.status === 'dinilai');
  const averageScore = gradedAttempts.length > 0 
    ? (gradedAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / gradedAttempts.length).toFixed(1)
    : '0.0';

  const totalDocumentsGenerated = packages.length * 15; // 15 mandatory document components per approved assessment package

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <SchoolIcon className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-xs text-emerald-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Kementerian Agama Kabupaten Paser • MIN 1 Paser</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Super Asesmen & CBT Terintegrasi
          </h2>
          <p className="mt-2 text-sm text-emerald-100 leading-relaxed">
            Selamat datang di pusat pengelolaan instrumen asesmen, bank soal berstandar HOTS, 
            administrasi 15 dokumen evaluasi kurikulum madrasah, dan sistem ujian digital ramah anak.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('generator')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-xl shadow-md transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Susun Perangkat (15 Dokumen)</span>
            </button>
            <button
              onClick={() => onNavigate('cbt_exam')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-900/80 hover:bg-emerald-950 text-white font-semibold text-xs rounded-xl border border-emerald-600 transition"
            >
              <MonitorPlay className="w-4 h-4 text-emerald-300" />
              <span>Buka Ruang Ujian CBT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-200">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-700 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-emerald-700" />
          <span>Filter Data Asesmen & Statistik</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-gray-500 mb-1">Tahun Pelajaran</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-600"
            >
              <option value="2024/2025">2024/2025</option>
              <option value="Semua">Semua Tahun</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-500 mb-1">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-600"
            >
              <option value="Semua">Semua Semester</option>
              <option value="Genap">Genap</option>
              <option value="Ganjil">Ganjil</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-500 mb-1">Tingkat Kelas</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-600"
            >
              <option value="Semua">Semua Kelas (1-6)</option>
              <option value="1">Kelas 1 (Fase A)</option>
              <option value="2">Kelas 2 (Fase A)</option>
              <option value="3">Kelas 3 (Fase B)</option>
              <option value="4">Kelas 4 (Fase B)</option>
              <option value="5">Kelas 5 (Fase C)</option>
              <option value="6">Kelas 6 (Fase C)</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-500 mb-1">Mata Pelajaran</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-600"
            >
              <option value="Semua">Semua Mapel</option>
              {subjects.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-500 mb-1">Jenis Asesmen</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-600"
            >
              <option value="Semua">Semua Jenis</option>
              <option value="Sumatif Akhir Semester (SAS)">Sumatif Akhir Semester (SAS)</option>
              <option value="Sumatif Lingkup Materi">Sumatif Lingkup Materi</option>
              <option value="Asesmen Madrasah (AM)">Asesmen Madrasah (AM)</option>
              <option value="Formatif">Formatif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold">Guru Pengampu</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-gray-900">{totalGuru}</div>
          <p className="text-[10px] text-gray-400 mt-0.5">Terdaftar di MIN 1 Paser</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold">Peserta Didik</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-gray-900">{totalSiswa}</div>
          <p className="text-[10px] text-gray-400 mt-0.5">Memiliki akun CBT</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold">Mata Pelajaran</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-gray-900">{totalMapel}</div>
          <p className="text-[10px] text-gray-400 mt-0.5">Kemenag & Umum</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold">Bank Soal Teruji</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-gray-900">{totalBankSoal}</div>
          <p className="text-[10px] text-gray-400 mt-0.5">HOTS & Literasi-Numerasi</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold">Paket Asesmen</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 text-2xl font-black text-gray-900">{filteredPackages.length}</div>
          <p className="text-[10px] text-gray-400 mt-0.5">Sesuai filter aktif</p>
        </div>
      </div>

      {/* Secondary Stats: CBT & Documents */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 text-emerald-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Ujian Aktif</span>
            <MonitorPlay className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 text-2xl font-black">{activeExams}</div>
          <span className="text-[11px] text-emerald-700">Token dibuka di lab</span>
        </div>

        <div className="bg-teal-50/70 p-4 rounded-xl border border-teal-200 text-teal-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Ujian Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-teal-700" />
          </div>
          <div className="mt-2 text-2xl font-black">{finishedExams}</div>
          <span className="text-[11px] text-teal-700">Telah tersinkronisasi</span>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 text-amber-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Rata-rata Nilai</span>
            <TrendingUp className="w-4 h-4 text-amber-700" />
          </div>
          <div className="mt-2 text-2xl font-black">{averageScore}</div>
          <span className="text-[11px] text-amber-700">Skala 0 - 100 ({gradedAttempts.length} jawaban)</span>
        </div>

        <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 text-blue-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Dokumen Asesmen</span>
            <FileCheck2 className="w-4 h-4 text-blue-700" />
          </div>
          <div className="mt-2 text-2xl font-black">{totalDocumentsGenerated}</div>
          <span className="text-[11px] text-blue-700">15 Berkas Lengkap/Paket</span>
        </div>
      </div>

      {/* Two Columns: Upcoming CBT Schedules & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jadwal Ujian Mendatang & Aktif */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-sm text-gray-900">Jadwal Asesmen & Sesi CBT</h3>
            </div>
            <button
              onClick={() => onNavigate('cbt_exam')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-medium inline-flex items-center gap-1"
            >
              <span>Ruang Ujian</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {sessions.map((ses) => (
              <div 
                key={ses.id}
                className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-emerald-50/50 transition flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">{ses.sessionName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      ses.status === 'aktif' ? 'bg-emerald-100 text-emerald-800 animate-pulse' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {ses.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 flex flex-wrap items-center gap-3">
                    <span>{ses.subjectName}</span>
                    <span>•</span>
                    <span>{ses.classTarget}</span>
                    <span>•</span>
                    <span>{ses.roomName}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-mono font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-gray-200">
                    Token: {ses.token}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    {ses.date} ({ses.durationMinutes} mnt)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aktivitas Pengguna & Audit Log Terbaru */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-sm text-gray-900">Aktivitas Terkini (Audit Log)</h3>
            </div>
            <button
              onClick={() => onNavigate('audit_logs')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-medium inline-flex items-center gap-1"
            >
              <span>Semua Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="text-xs flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">{log.userName}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{log.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-0.5">{log.details}</p>
                  <span className="inline-block mt-1 text-[10px] font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                    {log.module} • {log.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
