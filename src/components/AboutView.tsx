import React from 'react';
import { AppStorageService } from '../services/storage';
import { 
  Building2, 
  GraduationCap, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  HeartHandshake, 
  MapPin, 
  Mail, 
  Phone,
  Code2,
  BookOpen
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const school = AppStorageService.getSchool();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-600/60 text-xs text-amber-300 font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kementerian Agama Kabupaten Paser • Kalimantan Timur</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            SUPER ASESMEN MIN 1 PASER
          </h1>
          <p className="mt-2 text-base text-emerald-100 font-medium">
            Generator Perangkat Asesmen dan Computer Based Test (CBT) Terintegrasi
          </p>
          <p className="mt-4 text-xs sm:text-sm text-emerald-200/90 leading-relaxed text-justify">
            Aplikasi inovatif yang dirancang khusus untuk memfasilitasi pendidik madrasah dalam merancang kisi-kisi, kartu soal, naskah ujian, pedoman penskoran, hingga penyelenggaraan Computer Based Test ramah anak dan analisis butir soal secara akuntabel, objektif, dan terstandar.
          </p>
        </div>
      </div>

      {/* Profile Two Columns: Developer & Institution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Developer Card */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold mb-4 shadow-xs">
              <Code2 className="w-6 h-6 text-amber-800" />
            </div>
            <span className="text-[11px] font-bold uppercase text-amber-800 tracking-wider">
              Profil Pengembang Aplikasi
            </span>
            <h3 className="text-xl font-bold text-gray-900 mt-1">
              {school.developerName}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              Guru Madrasah • Senior Full-Stack Education Software Engineer
            </p>

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Unit Kerja: MIN 1 Paser, Kab. Paser, Kaltim</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Kementerian Agama Republik Indonesia</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Kontak: dzakirul2025@gmail.com</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-950">
            "Mewujudkan asesmen madrasah yang adil, humanis, berstandar HOTS, dan terintegrasi teknologi digital."
          </div>
        </div>

        {/* Institution Card */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold mb-4 shadow-xs">
              <Building2 className="w-6 h-6 text-emerald-800" />
            </div>
            <span className="text-[11px] font-bold uppercase text-emerald-800 tracking-wider">
              Satuan Pendidikan Penyelenggara
            </span>
            <h3 className="text-xl font-bold text-gray-900 mt-1">
              {school.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Kepala Madrasah: <span className="font-semibold text-gray-800">{school.headmasterName}</span> (NIP. {school.headmasterNip})
            </p>

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{school.address}, {school.subdistrict}, {school.district}, {school.province}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>NPSN: {school.npsn} • NSM: {school.nsm}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Email Resmi: {school.email}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-600">
            Terakreditasi A • Membina karakter Qur'ani, cerdas, berakhlakul karimah, dan berwawasan lingkungan.
          </div>
        </div>
      </div>

      {/* Key Architectural Principles */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6">
        <h3 className="font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-700" />
          <span>Prinsip Utama Asesmen dan Kurikulum</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
            <span className="font-bold text-emerald-900 block mb-1">1. Kesesuaian KMA 1503/2025 & KMA 450</span>
            <p className="text-gray-600 text-[11px] leading-relaxed">
              Disusun mengacu pada regulasi kurikulum madrasah KMA No. 1503 Tahun 2025 (Kurikulum RA dan Madrasah), KMA 450 Tahun 2024, dan Keputusan BSKAP No. 032/H/KR/2024.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
            <span className="font-bold text-emerald-900 block mb-1">2. 15 Dokumen Administrasi Sah</span>
            <p className="text-gray-600 text-[11px] leading-relaxed">
              Mulai dari Analisis CP, TP, Kisi-kisi, Kartu Soal, Rubrik, LJPD, hingga Program Remedial & Pengayaan dapat diekspor ke Word & Excel.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
            <span className="font-bold text-emerald-900 block mb-1">3. CBT Tangguh & Ramah Siswa</span>
            <p className="text-gray-600 text-[11px] leading-relaxed">
              Dilengkapi autosave berkala, pemulihan jika jaringan putus, timer server, penanda ragu-ragu, dan koreksi otomatis.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
            <span className="font-bold text-emerald-900 block mb-1">4. Integritas Soal Hasil AI</span>
            <p className="text-gray-600 text-[11px] leading-relaxed">
              Soal buatan AI selalu berstatus DRAF sampai diverifikasi dan disetujui guru agar kualitas pedagogik tetap terjaga.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
            <span className="font-bold text-emerald-900 block mb-1">5. Analisis Butir Empiris</span>
            <p className="text-gray-600 text-[11px] leading-relaxed">
              Menghitung indeks kesukaran (P), daya pembeda (D), dan efektivitas distraktor berbasis data pengerjaan riil siswa.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
            <span className="font-bold text-emerald-900 block mb-1">6. Perlindungan Data & Hak Akses</span>
            <p className="text-gray-600 text-[11px] leading-relaxed">
              Role-Based Access Control (RBAC) dengan pemisahan kewenangan Super Admin, Kamad, Guru, Pengawas, dan Siswa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
