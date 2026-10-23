import React, { useState } from 'react';
import { 
  AppStorageService 
} from '../services/storage';
import { 
  Subject, 
  LearningObjective, 
  Phase, 
  ClassLevel,
  UserProfile 
} from '../types';
import {
  BookOpen,
  Plus,
  CheckCircle,
  ShieldCheck,
  FileText,
  Search,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';

interface CurriculumManagerProps {
  currentUser: UserProfile;
}

export const CurriculumManager: React.FC<CurriculumManagerProps> = ({ currentUser }) => {
  const [subjects, setSubjects] = useState<Subject[]>(AppStorageService.getSubjects());
  const [objectives, setObjectives] = useState<LearningObjective[]>(AppStorageService.getLearningObjectives());
  const [regulations, setRegulations] = useState(AppStorageService.getRegulations());

  // Filters
  const [selectedPhase, setSelectedPhase] = useState<string>('Semua');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Add TP Modal
  const [showAddTpModal, setShowAddTpModal] = useState(false);
  const [newTpCode, setNewTpCode] = useState('TP.IPAS.4.3');
  const [newTpSubject, setNewTpSubject] = useState(subjects[0]?.id || '');
  const [newTpPhase, setNewTpPhase] = useState<Phase>('B');
  const [newTpGrade, setNewTpGrade] = useState<ClassLevel>(4);
  const [newTpTopic, setNewTpTopic] = useState('');
  const [newTpText, setNewTpText] = useState('');
  const [newTpCp, setNewTpCp] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddLearningObjective = () => {
    if (!newTpTopic.trim() || !newTpText.trim()) {
      alert('Mohon lengkapi topik dan rumusan tujuan pembelajaran!');
      return;
    }

    const lo: LearningObjective = {
      id: 'tp-' + Math.random().toString(36).substring(2, 9),
      subjectId: newTpSubject,
      phase: newTpPhase,
      grade: newTpGrade,
      code: newTpCode,
      cpReference: newTpCp || 'Peserta didik menguasai konsep esensial materi.',
      objectiveText: newTpText,
      topic: newTpTopic,
      verified: true,
      sourceDoc: 'KMA No. 1503 Tahun 2025 & KMA 450 Tahun 2024',
    };

    AppStorageService.addLearningObjective(lo);
    setObjectives(AppStorageService.getLearningObjectives());
    setShowAddTpModal(false);
    setNewTpTopic('');
    setNewTpText('');
    setNewTpCp('');
    showToast('Tujuan Pembelajaran (TP) berhasil didaftarkan ke kurikulum.');
  };

  const filteredObjectives = objectives.filter(o => {
    if (selectedPhase !== 'Semua' && o.phase !== selectedPhase) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!o.topic.toLowerCase().includes(q) && !o.objectiveText.toLowerCase().includes(q) && !o.code.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Modul 13
            </span>
            <span className="text-xs text-gray-500">
              KMA No. 1503 Tahun 2025 & KMA No. 450 Tahun 2024
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-1">
            Pengaturan Kurikulum & Regulasi MIN 1 Paser
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Pengelolaan regulasi Kemenag, Capaian Pembelajaran (CP), Tujuan Pembelajaran (TP), dan Kriteria Ketercapaian (KKTP).
          </p>
        </div>

        <button
          onClick={() => setShowAddTpModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Tujuan Pembelajaran (TP)</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Payung Hukum & Regulasi Resmi Kemenag (Dasar Kevalidan Data) */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-sm text-gray-900">
                Landasan Hukum & Regulasi Resmi Kurikulum Madrasah
              </h3>
              <p className="text-xs text-gray-500">
                Dokumen rujukan terverifikasi yang menjadi dasar keabsahan dan kevalidan data asesmen.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Terverifikasi Kemenag RI
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {regulations.map((reg) => (
            <div
              key={reg.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                reg.id === 'reg-kma-1503-2025'
                  ? 'border-emerald-300 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-400/40'
                  : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {reg.nomor}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                    {reg.status}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-gray-900 leading-snug">
                  {reg.tentang}
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {reg.instansi} • Tahun {reg.tahun}
                </p>
                <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                  {reg.keterangan}
                </p>
              </div>

              <div className="mt-3.5 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
                <span className="text-gray-400 font-mono">Tahun: {reg.tahun}</span>
                <a
                  href={reg.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-800 hover:text-emerald-950 hover:underline flex items-center gap-1"
                >
                  <span>Buka Dokumen</span>
                  <span className="text-xs">↗</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Madrasah Subjects Grid */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5">
        <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center justify-between">
          <span>Struktur Mata Pelajaran MIN 1 Paser</span>
          <span className="text-xs font-normal text-gray-500">{subjects.length} Mapel Aktif</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subjects.map(s => (
            <div key={s.id} className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:border-emerald-300 transition">
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-xs font-bold text-gray-500">{s.code}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  s.category.includes('Keagamaan') ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {s.category.includes('Keagamaan') ? 'Ciri Khas Kemenag' : 'Umum'}
                </span>
              </div>
              <h4 className="font-bold text-sm text-gray-900">{s.name}</h4>
              <div className="mt-2 text-xs text-gray-500 flex justify-between">
                <span>Fase {s.phase} (Kelas {s.grade})</span>
                <span className="font-bold text-emerald-800">KKTP: {s.kktp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified TP & CP References List */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 mb-4">
          <div>
            <h3 className="font-bold text-sm text-gray-900">
              Referensi Tujuan Pembelajaran (TP) Terverifikasi
            </h3>
            <p className="text-xs text-gray-500">
              Menjadi acuan penyusunan kisi-kisi dan kartu soal asesmen.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-xs font-medium"
            >
              <option value="Semua">Semua Fase (A, B, C)</option>
              <option value="A">Fase A (Kelas 1-2)</option>
              <option value="B">Fase B (Kelas 3-4)</option>
              <option value="C">Fase C (Kelas 5-6)</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredObjectives.map(obj => (
            <div key={obj.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/30 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {obj.code}
                </span>
                <span className="text-[10px] text-gray-500">
                  Fase {obj.phase} (Kelas {obj.grade}) • Sumber: {obj.sourceDoc}
                </span>
              </div>

              <div>
                <span className="font-bold text-gray-900">Topik / Materi: </span>
                <span className="text-gray-800">{obj.topic}</span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                <span className="font-bold text-emerald-950 block mb-0.5">Rumusan Tujuan Pembelajaran (TP):</span>
                <p className="text-gray-700">{obj.objectiveText}</p>
              </div>

              <div className="text-[11px] text-gray-500 italic">
                <strong>Elemen CP Terkait:</strong> "{obj.cpReference}"
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add TP Modal */}
      {showAddTpModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Tambah Tujuan Pembelajaran (TP) Baru
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Daftarkan capaian kompetensi untuk digunakan pada bank soal dan kisi-kisi.
            </p>

            <div className="space-y-3 text-xs mb-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Kode TP:</label>
                  <input
                    type="text"
                    value={newTpCode}
                    onChange={(e) => setNewTpCode(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Mata Pelajaran:</label>
                  <select
                    value={newTpSubject}
                    onChange={(e) => setNewTpSubject(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Fase:</label>
                  <select
                    value={newTpPhase}
                    onChange={(e) => setNewTpPhase(e.target.value as Phase)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="A">Fase A (Kelas 1-2)</option>
                    <option value="B">Fase B (Kelas 3-4)</option>
                    <option value="C">Fase C (Kelas 5-6)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tingkat Kelas:</label>
                  <select
                    value={newTpGrade}
                    onChange={(e) => setNewTpGrade(Number(e.target.value) as ClassLevel)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value={1}>Kelas 1</option>
                    <option value={2}>Kelas 2</option>
                    <option value={3}>Kelas 3</option>
                    <option value={4}>Kelas 4</option>
                    <option value={5}>Kelas 5</option>
                    <option value={6}>Kelas 6</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Materi Pokok / Topik:</label>
                <input
                  type="text"
                  value={newTpTopic}
                  onChange={(e) => setNewTpTopic(e.target.value)}
                  placeholder="Contoh: Mengenal Ekosistem dan Rantai Makanan"
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Rumusan Tujuan Pembelajaran (TP):</label>
                <textarea
                  rows={2}
                  value={newTpText}
                  onChange={(e) => setNewTpText(e.target.value)}
                  placeholder="Contoh: Peserta didik dapat mendeskripsikan peran produsen, konsumen, dan dekomposer..."
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Referensi Capaian Pembelajaran (CP):</label>
                <textarea
                  rows={2}
                  value={newTpCp}
                  onChange={(e) => setNewTpCp(e.target.value)}
                  placeholder="Contoh: Peserta didik mengidentifikasi interaksi antarmakhluk hidup dan lingkungannya..."
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddTpModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleAddLearningObjective}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Simpan Tujuan Pembelajaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
