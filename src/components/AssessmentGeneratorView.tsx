import React, { useState, useMemo } from 'react';
import { 
  AppStorageService 
} from '../services/storage';
import { ExportService } from '../services/exportService';
import { 
  AssessmentPackage, 
  QuestionBankItem, 
  School,
  UserProfile,
  ExamAttempt
} from '../types';
import {
  FileText,
  Printer,
  Download,
  FileSpreadsheet,
  CheckCircle,
  Sparkles,
  Edit3,
  Layers,
  Award,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Eye,
  RefreshCw,
  Plus
} from 'lucide-react';

interface AssessmentGeneratorViewProps {
  currentUser: UserProfile;
}

export const AssessmentGeneratorView: React.FC<AssessmentGeneratorViewProps> = ({ currentUser }) => {
  const school = AppStorageService.getSchool();
  const packages = AppStorageService.getPackages();
  const attempts = AppStorageService.getAttempts();
  const allQuestions = AppStorageService.getQuestionBank();

  const [selectedPackageId, setSelectedPackageId] = useState<string>(packages[0]?.id || '');
  const [activeTab, setActiveTab] = useState<number>(0); // 0..14 for the 15 components
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const currentPackage = useMemo(() => {
    return packages.find(p => p.id === selectedPackageId) || packages[0];
  }, [packages, selectedPackageId]);

  const packageAttempts = useMemo(() => {
    return attempts.filter(a => a.sessionId.includes('ipas') || a.className.includes('4A'));
  }, [attempts]);

  const canApprove = currentUser.role === 'super_admin' || currentUser.role === 'kepala_madrasah';

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleApprove = () => {
    if (!currentPackage) return;
    const updated: AssessmentPackage = {
      ...currentPackage,
      status: 'disetujui',
      reviewerName: currentUser.name,
      approvedAt: new Date().toISOString(),
    };
    AppStorageService.savePackage(updated);
    AppStorageService.logAction(
      'Persetujuan Dokumen Asesmen',
      'Generator Perangkat',
      `Paket "${currentPackage.title}" disetujui secara resmi oleh ${currentUser.name}.`
    );
    showNotification('Dokumen perangkat asesmen berhasil diverifikasi dan disetujui secara sah!');
  };

  // The 15 Mandatory Assessment Components
  const documentComponents = [
    { id: 'identitas', label: '1. Identitas Asesmen' },
    { id: 'cp_analisis', label: '2. Analisis Capaian Pembelajaran' },
    { id: 'tp', label: '3. Tujuan Pembelajaran (TP)' },
    { id: 'indikator', label: '4. Indikator Ketercapaian TP' },
    { id: 'kisi_kisi', label: '5. Kisi-kisi Soal Standar' },
    { id: 'kartu_soal', label: '6. Kartu Soal Per Butir' },
    { id: 'naskah_siswa', label: '7. Naskah Soal Peserta Didik' },
    { id: 'naskah_guru', label: '8. Naskah Soal & Kunci Guru' },
    { id: 'kunci_jawaban', label: '9. Lembar Kunci Jawaban' },
    { id: 'pedoman_skor', label: '10. Pedoman Penskoran' },
    { id: 'rubrik', label: '11. Rubrik Penilaian Holistik/Analitik' },
    { id: 'ljpd', label: '12. Lembar Jawaban Peserta Didik (LJPD)' },
    { id: 'pedoman_pelaksanaan', label: '13. Pedoman Pelaksanaan Ujian' },
    { id: 'analisis_hasil', label: '14. Analisis Hasil & Butir Soal' },
    { id: 'remedial_pengayaan', label: '15. Program Remedial & Pengayaan' },
  ];

  if (!currentPackage) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
        Belum ada paket asesmen. Buat paket baru melalui menu Bank Soal.
      </div>
    );
  }

  const handlePrint = () => {
    ExportService.printDocument('printable-assessment-document');
  };

  const handleExportDocx = () => {
    const content = document.getElementById('printable-assessment-document');
    if (!content) return;
    ExportService.exportToWord(
      currentPackage,
      school,
      documentComponents[activeTab].label,
      content.innerHTML
    );
    showNotification('Dokumen berhasil diekspor ke format DOCX / Word!');
  };

  const handleExportExcel = () => {
    ExportService.exportGradesToExcel(
      currentPackage,
      packageAttempts,
      school,
      currentPackage.passingGrade
    );
    showNotification('Rekap nilai dan analisis butir soal berhasil diekspor ke Excel (XLSX)!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Package Selector */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              {currentPackage.code}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              currentPackage.status === 'disetujui' 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              {currentPackage.status === 'disetujui' ? '✓ Disetujui Kepala Madrasah' : 'Draf Pemeriksaan'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-1">
            {currentPackage.title}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Mata Pelajaran: <span className="font-semibold text-gray-700">{currentPackage.subjectName}</span> • Kelas {currentPackage.grade} (Fase {currentPackage.phase}) • TP {currentPackage.academicYear} ({currentPackage.semester})
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {canApprove && currentPackage.status !== 'disetujui' && (
            <button
              onClick={handleApprove}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Setujui Dokumen</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-lg transition"
            title="Cetak PDF Resmi"
          >
            <Printer className="w-3.5 h-3.5 text-gray-600" />
            <span>Cetak / PDF</span>
          </button>

          <button
            onClick={handleExportDocx}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-medium rounded-lg transition"
            title="Download Word"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh DOCX</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-medium rounded-lg transition"
            title="Download Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Unduh XLSX</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main 15 Components Tabs */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50/80 p-2 overflow-x-auto flex gap-1 scrollbar-thin">
          {documentComponents.map((comp, idx) => (
            <button
              key={comp.id}
              onClick={() => setActiveTab(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                activeTab === idx
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/60'
              }`}
            >
              {comp.label}
            </button>
          ))}
        </div>

        {/* Document Printable Paper Container */}
        <div className="p-4 sm:p-8 bg-gray-100/60 overflow-x-auto flex justify-center">
          <div 
            id="printable-assessment-document"
            className="bg-white text-gray-900 shadow-md border border-gray-300 rounded-sm p-8 sm:p-12 w-full max-w-4xl min-h-[900px] text-xs leading-relaxed"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
          >
            {/* Kop Resmi Madrasah Kemenag */}
            <div className="text-center border-b-4 border-double border-gray-900 pb-3 mb-6 select-none">
              <h3 className="text-xs uppercase tracking-wider font-bold">KEMENTERIAN AGAMA REPUBLIK INDONESIA</h3>
              <h3 className="text-xs uppercase tracking-wider font-bold">KANTOR KEMENTERIAN AGAMA KABUPATEN PASER</h3>
              <h2 className="text-base sm:text-lg font-black tracking-tight mt-0.5 text-gray-900">
                MADRASAH IBTIDAIYAH NEGERI 1 PASER
              </h2>
              <p className="text-[10px] text-gray-600 mt-0.5">
                {school.address}, Kec. {school.subdistrict}, {school.district}, {school.province} {school.postalCode}
              </p>
              <p className="text-[9px] text-gray-500">
                Email: {school.email} | NPSN: {school.npsn} | NSM: {school.nsm}
              </p>
            </div>

            {/* Render Selected Component Content */}
            {activeTab === 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-center uppercase underline mb-4">
                  DOKUMEN 1: IDENTITAS PERANGKAT ASESMEN
                </h3>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="w-1/3 py-1 font-semibold">Satuan Pendidikan</td>
                      <td className="py-1">: {school.name}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold">Tahun Pelajaran / Semester</td>
                      <td className="py-1">: {currentPackage.academicYear} / Semester {currentPackage.semester}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold">Jenjang / Fase / Kelas</td>
                      <td className="py-1">: Madrasah Ibtidaiyah (MI) / Fase {currentPackage.phase} / Kelas {currentPackage.grade}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold">Mata Pelajaran</td>
                      <td className="py-1">: {currentPackage.subjectName}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold">Jenis Asesmen</td>
                      <td className="py-1">: {currentPackage.assessmentType}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold">Alokasi Waktu</td>
                      <td className="py-1">: {currentPackage.durationMinutes} Menit</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold">Kriteria Ketercapaian (KKTP)</td>
                      <td className="py-1">: {currentPackage.passingGrade}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold">Jumlah Butir Soal</td>
                      <td className="py-1">: {currentPackage.questions.length} Butir</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold">Penyusun / Guru Pengampu</td>
                      <td className="py-1">: {currentPackage.authorName}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold">Penelaah / Kepala Madrasah</td>
                      <td className="py-1">: {school.headmasterName} (NIP. {school.headmasterNip})</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold">Landasan Regulasi</td>
                      <td className="py-1">: KMA No. 1503 Tahun 2025, KMA No. 450 Tahun 2024 & Keputusan BSKAP No. 032/H/KR/2024</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 1 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-center uppercase underline mb-4">
                  DOKUMEN 2: ANALISIS CAPAIAN PEMBELAJARAN (CP)
                </h3>
                <p className="text-[11px] mb-2 text-justify">
                  Berdasarkan regulasi resmi kurikulum madrasah (<strong>KMA No. 1503 Tahun 2025</strong> dan <strong>KMA No. 450 Tahun 2024</strong>), capaian pembelajaran dirumuskan untuk membentuk kompetensi holistik anak madrasah:
                </p>
                <div className="border border-gray-400 p-3 rounded-xs bg-gray-50/50 mb-3">
                  <span className="font-bold block text-gray-800">Elemen Pemahaman dan Keterampilan Proses:</span>
                  <p className="mt-1 text-justify">
                    Peserta didik menganalisis struktur tubuh tumbuhan, proses fotosintesis sebagai sumber oksigen dan energi bumi, serta siklus wujud zat dan perubahannya dalam kehidupan sehari-hari secara kontekstual di lingkungan Kabupaten Paser.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-center uppercase underline mb-4">
                  DOKUMEN 3: TUJUAN PEMBELAJARAN (TP)
                </h3>
                <table className="w-full border-collapse border border-gray-400">
                  <thead className="bg-gray-100 font-bold text-center">
                    <tr>
                      <th className="border border-gray-400 p-2 w-12">No</th>
                      <th className="border border-gray-400 p-2 w-28">Kode TP</th>
                      <th className="border border-gray-400 p-2">Rumusan Tujuan Pembelajaran</th>
                      <th className="border border-gray-400 p-2 w-44">Materi Pokok</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-400 p-2 text-center">1</td>
                      <td className="border border-gray-400 p-2 font-mono text-center">TP.IPAS.4.1</td>
                      <td className="border border-gray-400 p-2">Mengidentifikasi struktur dan fungsi daun, batang, dan akar tumbuhan dalam proses fotosintesis.</td>
                      <td className="border border-gray-400 p-2">Tumbuhan Sumber Kehidupan</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-400 p-2 text-center">2</td>
                      <td className="border border-gray-400 p-2 font-mono text-center">TP.IPAS.4.2</td>
                      <td className="border border-gray-400 p-2">Menganalisis siklus perubahan wujud zat mencair, membeku, menguap, dan mengembun melalui percobaan sederhana.</td>
                      <td className="border border-gray-400 p-2">Wujud Zat dan Perubahannya</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 3 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-center uppercase underline mb-4">
                  DOKUMEN 4: INDIKATOR KETERCAPAIAN TUJUAN PEMBELAJARAN (IKTP)
                </h3>
                <table className="w-full border-collapse border border-gray-400">
                  <thead className="bg-gray-100 font-bold text-center">
                    <tr>
                      <th className="border border-gray-400 p-2 w-12">No</th>
                      <th className="border border-gray-400 p-2 w-28">Tujuan (TP)</th>
                      <th className="border border-gray-400 p-2">Indikator Soal / Ketercapaian</th>
                      <th className="border border-gray-400 p-2 w-20">Level</th>
                      <th className="border border-gray-400 p-2 w-20">Nomor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPackage.questions.map((q, idx) => (
                      <tr key={q.id}>
                        <td className="border border-gray-400 p-2 text-center">{idx + 1}</td>
                        <td className="border border-gray-400 p-2 text-center font-mono">{q.tpId || 'TP.4.1'}</td>
                        <td className="border border-gray-400 p-2">{q.indicator}</td>
                        <td className="border border-gray-400 p-2 text-center font-semibold">{q.cognitiveLevel}</td>
                        <td className="border border-gray-400 p-2 text-center">{idx + 1}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 4 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-center uppercase underline mb-4">
                  DOKUMEN 5: KISI-KISI PENULISAN SOAL ASESMEN
                </h3>
                <table className="w-full border-collapse border border-gray-400 text-[10px]">
                  <thead className="bg-gray-100 font-bold text-center">
                    <tr>
                      <th className="border border-gray-400 p-1 w-8">No</th>
                      <th className="border border-gray-400 p-1">Materi Pokok</th>
                      <th className="border border-gray-400 p-1">Indikator Soal</th>
                      <th className="border border-gray-400 p-1 w-12">Level</th>
                      <th className="border border-gray-400 p-1 w-20">Bentuk Soal</th>
                      <th className="border border-gray-400 p-1 w-10">No Soal</th>
                      <th className="border border-gray-400 p-1 w-12">Kunci</th>
                      <th className="border border-gray-400 p-1 w-10">Skor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPackage.questions.map((q, idx) => (
                      <tr key={q.id}>
                        <td className="border border-gray-400 p-1 text-center">{idx + 1}</td>
                        <td className="border border-gray-400 p-1">{q.topic}</td>
                        <td className="border border-gray-400 p-1">{q.indicator}</td>
                        <td className="border border-gray-400 p-1 text-center font-semibold">{q.cognitiveLevel}</td>
                        <td className="border border-gray-400 p-1 text-center capitalize">{q.type.replace('_', ' ')}</td>
                        <td className="border border-gray-400 p-1 text-center font-bold">{idx + 1}</td>
                        <td className="border border-gray-400 p-1 text-center font-mono truncate max-w-[60px]">{q.answerKey}</td>
                        <td className="border border-gray-400 p-1 text-center font-bold">{q.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 5 && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-center uppercase underline mb-4">
                  DOKUMEN 6: KARTU SOAL BUTIR ASESMEN
                </h3>
                {currentPackage.questions.map((q, idx) => (
                  <div key={q.id} className="border-2 border-gray-800 p-4 rounded-xs mb-4 page-break">
                    <div className="text-center font-bold border-b border-gray-400 pb-2 mb-2">
                      KARTU SOAL NOMOR {idx + 1} ({q.type.toUpperCase().replace('_', ' ')})
                    </div>
                    <table className="w-full border-collapse mb-3 text-[10px]">
                      <tbody>
                        <tr>
                          <td className="w-1/4 font-semibold">Mata Pelajaran</td>
                          <td className="w-1/4">: {currentPackage.subjectName}</td>
                          <td className="w-1/4 font-semibold">Penyusun</td>
                          <td className="w-1/4">: {q.authorName}</td>
                        </tr>
                        <tr>
                          <td className="font-semibold">Kelas / Fase</td>
                          <td>: {currentPackage.grade} / {currentPackage.phase}</td>
                          <td className="font-semibold">Bentuk Soal</td>
                          <td>: {q.type.toUpperCase().replace('_', ' ')}</td>
                        </tr>
                        <tr>
                          <td className="font-semibold">Level Kognitif</td>
                          <td>: {q.cognitiveLevel} ({q.difficulty})</td>
                          <td className="font-semibold">Bobot Nilai</td>
                          <td>: {q.points} Poin</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="border border-gray-300 p-2.5 bg-gray-50 text-[11px] mb-2">
                      <span className="font-bold block text-gray-700">Indikator Soal:</span>
                      <p>{q.indicator}</p>
                    </div>

                    {q.stimulus && (
                      <div className="italic text-[11px] bg-amber-50/50 p-2 border-l-2 border-amber-600 mb-2">
                        <strong>Stimulus:</strong> {q.stimulus}
                      </div>
                    )}

                    <div className="font-medium text-[11px] my-2">
                      <strong>Rumusan Butir Soal:</strong> {q.stem}
                    </div>

                    {q.options && (
                      <div className="grid grid-cols-2 gap-1 text-[11px] my-2">
                        {q.options.map(o => (
                          <div key={o.key}><strong>{o.key}.</strong> {o.text}</div>
                        ))}
                      </div>
                    )}

                    <div className="border-t border-gray-300 pt-2 mt-2 text-[10px] grid grid-cols-2 gap-4">
                      <div>
                        <strong>Kunci Jawaban:</strong> <span className="font-mono font-bold">{q.answerKey}</span>
                        <p className="mt-1"><strong>Pedoman Skor:</strong> {q.scoringGuide}</p>
                      </div>
                      <div>
                        <strong>Pembahasan & Rasionalisasi:</strong>
                        <p className="text-gray-600 mt-0.5">{q.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 6 && (
              <div className="space-y-4">
                <div className="text-center font-bold mb-4">
                  <h3 className="text-sm uppercase underline">DOKUMEN 7: NASKAH SOAL PESERTA DIDIK</h3>
                  <p className="text-xs font-normal text-gray-600">Petunjuk: Pilihlah atau jawablah pertanyaan di bawah ini dengan jujur dan teliti!</p>
                </div>
                <div className="space-y-5">
                  {currentPackage.questions.map((q, idx) => (
                    <div key={q.id} className="text-[11px]">
                      <div className="flex gap-2">
                        <span className="font-bold">{idx + 1}.</span>
                        <div className="flex-1">
                          {q.stimulus && (
                            <p className="bg-gray-50 p-2 rounded-xs border-l-2 border-gray-400 italic mb-1.5 text-gray-800">
                              {q.stimulus}
                            </p>
                          )}
                          <p className="font-semibold">{q.stem}</p>

                          {q.options && (
                            <div className="mt-2 space-y-1 pl-2">
                              {q.options.map(opt => (
                                <div key={opt.key} className="flex gap-2">
                                  <span className="font-bold">{opt.key}.</span>
                                  <span>{opt.text}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {q.type === 'benar_salah' && (
                            <div className="mt-2 flex gap-4 pl-2 font-medium">
                              <span>[ &nbsp; ] BENAR</span>
                              <span>[ &nbsp; ] SALAH</span>
                            </div>
                          )}

                          {q.matchingPairs && (
                            <div className="mt-2 border border-gray-300 p-2 rounded-xs">
                              <p className="font-bold text-[10px] mb-1">Premis dan Pasangan:</p>
                              {q.matchingPairs.map((p, pIdx) => (
                                <div key={pIdx} className="flex justify-between border-b border-gray-200 py-1">
                                  <span>{pIdx + 1}. {p.premise}</span>
                                  <span className="font-medium text-gray-600">➔ [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ]</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {q.type === 'isian_singkat' && (
                            <div className="mt-3 border-b border-dashed border-gray-400 pb-1 text-gray-400">
                              Jawaban: ..........................................................................................
                            </div>
                          )}

                          {q.type === 'uraian' && (
                            <div className="mt-4 border border-dashed border-gray-300 p-4 text-gray-400 h-24">
                              Tuliskan lembar uraian jawaban Anda di sini secara lengkap:
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 7 && (
              <div className="space-y-4">
                <div className="text-center font-bold mb-4">
                  <h3 className="text-sm uppercase underline">DOKUMEN 8: NASKAH SOAL GURU & PEDOMAN PENSKORAN</h3>
                  <p className="text-xs font-normal text-emerald-800 font-semibold">(Memuat Kunci Jawaban Lengkap, Pembahasan, & Bobot Poin)</p>
                </div>
                <div className="space-y-6">
                  {currentPackage.questions.map((q, idx) => (
                    <div key={q.id} className="text-[11px] border border-gray-300 p-3 rounded-xs bg-emerald-50/20">
                      <div className="flex justify-between font-bold border-b border-gray-200 pb-1 mb-2">
                        <span>Nomor {idx + 1} ({q.type.toUpperCase()})</span>
                        <span>Bobot: {q.points} Poin | Level {q.cognitiveLevel}</span>
                      </div>
                      <p className="font-medium">{q.stem}</p>
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                        <p className="font-bold text-emerald-900">Kunci Jawaban: {q.answerKey}</p>
                        <p className="text-gray-600 mt-1"><strong>Pedoman Skor:</strong> {q.scoringGuide}</p>
                        <p className="text-gray-600 mt-1"><strong>Pembahasan Guru:</strong> {q.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 8 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-center uppercase underline mb-4">
                  DOKUMEN 9: LEMBAR KUNCI JAWABAN LENGKAP
                </h3>
                <table className="w-full border-collapse border border-gray-400">
                  <thead className="bg-gray-100 font-bold text-center">
                    <tr>
                      <th className="border border-gray-400 p-2 w-12">No</th>
                      <th className="border border-gray-400 p-2 w-28">Bentuk Soal</th>
                      <th className="border border-gray-400 p-2">Kunci Jawaban Resmi</th>
                      <th className="border border-gray-400 p-2 w-20">Bobot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPackage.questions.map((q, idx) => (
                      <tr key={q.id}>
                        <td className="border border-gray-400 p-2 text-center font-bold">{idx + 1}</td>
                        <td className="border border-gray-400 p-2 capitalize text-center">{q.type.replace('_', ' ')}</td>
                        <td className="border border-gray-400 p-2 font-mono font-semibold">{q.answerKey}</td>
                        <td className="border border-gray-400 p-2 text-center">{q.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 9 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-center uppercase underline mb-4">
                  DOKUMEN 10: PEDOMAN PENSKORAN DAN FORMULA NILAI
                </h3>
                <div className="border border-gray-300 p-4 bg-gray-50/50 rounded-xs">
                  <h4 className="font-bold text-xs uppercase mb-2">Formula Perhitungan Nilai Akhir Asesmen:</h4>
                  <div className="p-3 bg-white border border-gray-300 text-center font-mono font-bold text-sm my-2">
                    Nilai Akhir = (Skor Perolehan / Skor Maksimal) × 100
                  </div>
                  <p className="text-[11px] text-gray-700 leading-normal mt-2">
                    Keterangan:
                    <br />• Skor maksimal paket ini = <strong>{currentPackage.questions.reduce((a, b) => a + b.points, 0)} Poin</strong>
                    <br />• Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) = <strong>{currentPackage.passingGrade}</strong>
                    <br />• Peserta didik dengan Nilai &ge; {currentPackage.passingGrade} dinyatakan <strong>Tuntas (Pengayaan)</strong>
                    <br />• Peserta didik dengan Nilai &lt; {currentPackage.passingGrade} mengikuti program <strong>Remedial</strong>
                  </p>
                </div>
              </div>
            )}

            {activeTab === 10 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-center uppercase underline mb-4">
                  DOKUMEN 11: RUBRIK PENILAIAN HOLISTIK & ANALITIK
                </h3>
                <table className="w-full border-collapse border border-gray-400 text-[10px]">
                  <thead className="bg-gray-100 font-bold text-center">
                    <tr>
                      <th className="border border-gray-400 p-2 w-28">Kriteria Aspek</th>
                      <th className="border border-gray-400 p-2">Sangat Baik (Skor 5)</th>
                      <th className="border border-gray-400 p-2">Baik (Skor 3-4)</th>
                      <th className="border border-gray-400 p-2">Cukup (Skor 1-2)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-400 p-2 font-bold">Ketepatan Konsep</td>
                      <td className="border border-gray-400 p-2">Menjelaskan konsep ilmiah fotosintesis dan wujud zat secara akurat dan komprehensif.</td>
                      <td className="border border-gray-400 p-2">Menjelaskan sebagian besar konsep secara tepat dengan sedikit kekurangan.</td>
                      <td className="border border-gray-400 p-2">Konsep masih rancu atau hanya menyebutkan istilah tanpa elaborasi.</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-400 p-2 font-bold">Penalaran & Logika (HOTS)</td>
                      <td className="border border-gray-400 p-2">Memberikan analisis sebab-akibat yang runtut, menghubungkan materi dengan ekosistem bumi.</td>
                      <td className="border border-gray-400 p-2">Penalaran logis namun elaborasi hubungan ekosistem masih sederhana.</td>
                      <td className="border border-gray-400 p-2">Argumen belum terstruktur atau kurang berdasar pada materi.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 11 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-center uppercase underline mb-4">
                  DOKUMEN 12: LEMBAR JAWABAN PESERTA DIDIK (LJPD / LJK CETAK)
                </h3>
                <div className="border border-gray-400 p-4">
                  <div className="grid grid-cols-2 gap-4 border-b border-gray-300 pb-3 mb-4">
                    <div>
                      <p>Nama Peserta : ................................................................</p>
                      <p className="mt-2">Nomor / NISN : ................................................................</p>
                    </div>
                    <div>
                      <p>Kelas / Ruang : ................................................................</p>
                      <p className="mt-2">Hari / Tanggal : ................................................................</p>
                    </div>
                  </div>
                  <p className="font-bold text-center text-xs mb-3">PILIHAN GANDA</p>
                  <div className="grid grid-cols-5 gap-3 text-[10px]">
                    {[1, 2, 3, 4, 5].map(n => (
                      <div key={n} className="flex items-center gap-1">
                        <span className="font-bold w-4">{n}.</span>
                        <span>(A)</span>
                        <span>(B)</span>
                        <span>(C)</span>
                        <span>(D)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 12 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-center uppercase underline mb-4">
                  DOKUMEN 13: PEDOMAN PELAKSANAAN ASESMEN MADRASAH
                </h3>
                <ol className="list-decimal pl-5 space-y-1.5 text-justify text-[11px]">
                  <li>Peserta didik memasuki ruang ujian CBT / kelas 15 menit sebelum waktu dimulai.</li>
                  <li>Pengawas membacakan tata tertib asesmen dan membagikan token sesi ujian.</li>
                  <li>Peserta dilarang membuka tab browser lain, berdiskusi, atau berbuat curang.</li>
                  <li>Apabila terjadi gangguan jaringan, sistem akan memulihkan data jawaban otomatis dari penyimpanan lokal.</li>
                  <li>Pengawas mencatat kejadian luar biasa pada lembar Berita Acara Ujian.</li>
                </ol>
              </div>
            )}

            {activeTab === 13 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-center uppercase underline mb-4">
                  DOKUMEN 14: ANALISIS HASIL ASESMEN & BUTIR SOAL
                </h3>
                <table className="w-full border-collapse border border-gray-400 text-[10px]">
                  <thead className="bg-gray-100 font-bold text-center">
                    <tr>
                      <th className="border border-gray-400 p-1">No</th>
                      <th className="border border-gray-400 p-1">Kode Soal</th>
                      <th className="border border-gray-400 p-1">Indeks Kesukaran (P)</th>
                      <th className="border border-gray-400 p-1">Status P</th>
                      <th className="border border-gray-400 p-1">Daya Pembeda (D)</th>
                      <th className="border border-gray-400 p-1">Rekomendasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPackage.questions.map((q, idx) => (
                      <tr key={q.id}>
                        <td className="border border-gray-400 p-1 text-center font-bold">{idx + 1}</td>
                        <td className="border border-gray-400 p-1 font-mono text-center">{q.code}</td>
                        <td className="border border-gray-400 p-1 text-center">0.75</td>
                        <td className="border border-gray-400 p-1 text-center text-emerald-800 font-semibold">Sedang/Baik</td>
                        <td className="border border-gray-400 p-1 text-center">0.45</td>
                        <td className="border border-gray-400 p-1 text-center">Diterima di Bank Soal</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 14 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-center uppercase underline mb-4">
                  DOKUMEN 15: PROGRAM REMEDIAL DAN PENGAYAAN
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-amber-300 p-3 bg-amber-50/40 rounded-xs">
                    <h4 className="font-bold text-xs text-amber-900 border-b border-amber-200 pb-1 mb-2">
                      Rencana Tindak Lanjut Remedial (&lt; {currentPackage.passingGrade})
                    </h4>
                    <p className="text-[10px] text-gray-700 leading-normal">
                      Bagi siswa yang belum mencapai KKTP, diberikan pendampingan tutorial sebaya dan penugasan ulang terstruktur pada materi fotosintesis dan perubahan wujud zat.
                    </p>
                  </div>
                  <div className="border border-emerald-300 p-3 bg-emerald-50/40 rounded-xs">
                    <h4 className="font-bold text-xs text-emerald-900 border-b border-emerald-200 pb-1 mb-2">
                      Rencana Tindak Lanjut Pengayaan (&ge; {currentPackage.passingGrade})
                    </h4>
                    <p className="text-[10px] text-gray-700 leading-normal">
                      Bagi siswa yang tuntas, diberikan pengayaan berupa proyek mini observasi keanekaragaman tumbuhan di halaman MIN 1 Paser.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Official Signature Footer for all Madrasah Documents */}
            <div className="mt-12 pt-6 border-t border-gray-300 grid grid-cols-2 text-center text-[11px] select-none">
              <div>
                <p>Mengetahui,</p>
                <p className="font-semibold">Kepala MIN 1 Paser</p>
                <div className="h-16 flex items-center justify-center">
                  {currentPackage.status === 'disetujui' && (
                    <span className="text-[10px] font-mono text-emerald-800 border border-emerald-600 px-2 py-0.5 rounded bg-emerald-50 font-bold">
                      ✓ TTE SAH MIN 1 PASER
                    </span>
                  )}
                </div>
                <p className="font-bold underline">{school.headmasterName}</p>
                <p className="text-[10px] text-gray-600">NIP. {school.headmasterNip}</p>
              </div>

              <div>
                <p>Tanah Grogot, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-semibold">Guru Pengampu / Penyusun</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[10px] font-mono text-gray-500 italic">
                    (Tertanda Digital)
                  </span>
                </div>
                <p className="font-bold underline">{currentPackage.authorName}</p>
                <p className="text-[10px] text-gray-600">NIP. 199208152019031008</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
