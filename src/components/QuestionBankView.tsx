import React, { useState, useMemo } from 'react';
import { 
  AppStorageService 
} from '../services/storage';
import { AiService } from '../services/aiService';
import { ExportService } from '../services/exportService';
import { 
  QuestionBankItem, 
  QuestionType, 
  CognitiveLevel, 
  DifficultyLevel, 
  UserProfile 
} from '../types';
import {
  FileText,
  Plus,
  Brain,
  Search,
  Filter,
  CheckCircle,
  Copy,
  Trash2,
  Edit2,
  Download,
  Upload,
  AlertCircle,
  Sparkles,
  ChevronDown,
  Layers,
  BookOpen
} from 'lucide-react';

interface QuestionBankViewProps {
  currentUser: UserProfile;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({ currentUser }) => {
  const [questions, setQuestions] = useState<QuestionBankItem[]>(AppStorageService.getQuestionBank());
  const subjects = AppStorageService.getSubjects();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Semua');
  const [selectedType, setSelectedType] = useState('Semua');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Semua');
  const [selectedCognitive, setSelectedCognitive] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  // Modal states
  const [showAiModal, setShowAiModal] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // AI Generator Form states
  const [aiSubject, setAiSubject] = useState(subjects[0]?.name || 'IPAS');
  const [aiGrade, setAiGrade] = useState<number>(4);
  const [aiTopic, setAiTopic] = useState('Tumbuhan, Sumber Kehidupan di Bumi');
  const [aiTp, setAiTp] = useState('Mengidentifikasi struktur dan fungsi daun dalam fotosintesis');
  const [aiCognitive, setAiCognitive] = useState<CognitiveLevel>('L2');
  const [aiDifficulty, setAiDifficulty] = useState<DifficultyLevel>('Sedang');
  const [aiCount, setAiCount] = useState<number>(25);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  // Pagination for large sets (up to 150+ items)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Filtered Question list
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (selectedSubject !== 'Semua' && q.subjectName !== selectedSubject) return false;
      if (selectedType !== 'Semua' && q.type !== selectedType) return false;
      if (selectedDifficulty !== 'Semua' && q.difficulty !== selectedDifficulty) return false;
      if (selectedCognitive !== 'Semua' && q.cognitiveLevel !== selectedCognitive) return false;
      if (selectedStatus !== 'Semua' && q.status !== selectedStatus) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchStem = q.stem.toLowerCase().includes(query);
        const matchTopic = q.topic.toLowerCase().includes(query);
        const matchCode = q.code.toLowerCase().includes(query);
        if (!matchStem && !matchTopic && !matchCode) return false;
      }
      return true;
    });
  }, [questions, searchQuery, selectedSubject, selectedType, selectedDifficulty, selectedCognitive, selectedStatus]);

  // Actions
  const handleDelete = (id: string) => {
    if (confirm('Hapus butir soal ini dari bank soal?')) {
      AppStorageService.deleteQuestion(id);
      setQuestions(AppStorageService.getQuestionBank());
      showToast('Butir soal berhasil dihapus.');
    }
  };

  const handleDuplicate = (item: QuestionBankItem) => {
    const duplicated: QuestionBankItem = {
      ...item,
      id: 'q-dup-' + Math.random().toString(36).substring(2, 9),
      code: item.code + '-DUP',
      status: 'ditinjau',
      authorName: currentUser.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    AppStorageService.saveQuestion(duplicated);
    setQuestions(AppStorageService.getQuestionBank());
    showToast('Soal berhasil diduplikasi ke draf reviu.');
  };

  const handleApprove = (item: QuestionBankItem) => {
    const approved: QuestionBankItem = {
      ...item,
      status: 'disetujui',
      reviewerName: currentUser.name,
      updatedAt: new Date().toISOString(),
    };
    AppStorageService.saveQuestion(approved);
    setQuestions(AppStorageService.getQuestionBank());
    showToast(`Soal ${item.code} resmi disetujui untuk ujian.`);
  };

  // AI Generator trigger supporting up to 150 questions
  const handleRunAiGenerator = async () => {
    setIsGeneratingAi(true);
    setGenerationProgress({ current: 0, total: aiCount });

    try {
      const generated = await AiService.generateQuestions({
        subject: aiSubject,
        grade: aiGrade,
        phase: aiGrade <= 2 ? 'A' : aiGrade <= 4 ? 'B' : 'C',
        topic: aiTopic,
        learningObjective: aiTp,
        questionTypes: ['pilihan_ganda', 'pg_kompleks', 'benar_salah', 'menjodohkan', 'isian_singkat', 'uraian'],
        difficulty: aiDifficulty,
        cognitiveLevel: aiCognitive,
        count: aiCount,
        authorName: currentUser.name,
        onProgress: (current, total) => {
          setGenerationProgress({ current, total });
        },
      });

      // Save as DRAF AI per requirements
      generated.forEach(q => AppStorageService.saveQuestion(q));
      setQuestions(AppStorageService.getQuestionBank());
      setShowAiModal(false);
      showToast(`Sukses! ${generated.length} butir soal AI berhasil ditambahkan berstatus DRAF ke Bank Soal.`);
    } catch (e) {
      console.error(e);
      showToast('Terjadi kesalahan saat memproses generator soal.');
    } finally {
      setIsGeneratingAi(false);
      setGenerationProgress({ current: 0, total: 0 });
    }
  };

  // Export questions to Excel
  const handleExportQuestions = () => {
    const data = filteredQuestions.map((q, idx) => ({
      'No': idx + 1,
      'Kode Soal': q.code,
      'Mata Pelajaran': q.subjectName,
      'Kelas / Fase': `Kelas ${q.grade} (Fase ${q.phase})`,
      'Topik / Materi': q.topic,
      'Indikator': q.indicator,
      'Level Kognitif': q.cognitiveLevel,
      'Tingkat Kesukaran': q.difficulty,
      'Bentuk Soal': q.type.toUpperCase(),
      'Rumusan Butir Soal': q.stem,
      'Kunci Jawaban': q.answerKey,
      'Bobot Skor': q.points,
      'Status': q.status.toUpperCase(),
      'Penyusun': q.authorName,
    }));
    ExportService.exportToCsv(data, `BANK_SOAL_MIN1PASER_${new Date().toISOString().split('T')[0]}`);
    showToast('Bank soal berhasil diekspor ke CSV/Excel.');
  };

  // Paginated questions for smooth navigation with up to 150+ items
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Modul 6 & 7
            </span>
            <span className="text-xs text-gray-500">
              Standar Kompetensi & HOTS Terverifikasi
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-1">
            Bank Soal Terpadu MIN 1 Paser
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Total {questions.length} butir soal tersimpan ({questions.filter(q => q.status === 'disetujui').length} siap uji, {questions.filter(q => q.status === 'draf_ai').length} draf AI).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAiModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <Brain className="w-4 h-4 text-amber-300" />
            <span>AI Generator Soal (s.d. 150 Butir)</span>
          </button>

          <button
            onClick={handleExportQuestions}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-xl transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Soal</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-200 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari rumusan soal, kode, materi pokok, atau indikator..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
          <div>
            <label className="block text-gray-400 text-[10px] uppercase font-bold mb-1">Mata Pelajaran</label>
            <select
              value={selectedSubject}
              onChange={(e) => { setSelectedSubject(e.target.value); setCurrentPage(1); }}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-xs"
            >
              <option value="Semua">Semua Mapel</option>
              {subjects.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-[10px] uppercase font-bold mb-1">Bentuk Soal</label>
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-xs"
            >
              <option value="Semua">Semua Bentuk</option>
              <option value="pilihan_ganda">Pilihan Ganda</option>
              <option value="pg_kompleks">PG Kompleks</option>
              <option value="benar_salah">Benar / Salah</option>
              <option value="menjodohkan">Menjodohkan</option>
              <option value="isian_singkat">Isian Singkat</option>
              <option value="uraian">Uraian / Essay</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-[10px] uppercase font-bold mb-1">Tingkat Kesukaran</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => { setSelectedDifficulty(e.target.value); setCurrentPage(1); }}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-xs"
            >
              <option value="Semua">Semua Kesukaran</option>
              <option value="Mudah">Mudah</option>
              <option value="Sedang">Sedang</option>
              <option value="Sukar">Sukar</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-[10px] uppercase font-bold mb-1">Level Kognitif</label>
            <select
              value={selectedCognitive}
              onChange={(e) => { setSelectedCognitive(e.target.value); setCurrentPage(1); }}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-xs"
            >
              <option value="Semua">Semua Level</option>
              <option value="L1">L1 (Pemahaman/C1-C2)</option>
              <option value="L2">L2 (Aplikasi/C3)</option>
              <option value="L3">L3 (Penalaran/HOTS)</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-[10px] uppercase font-bold mb-1">Status Verifikasi</label>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-xs"
            >
              <option value="Semua">Semua Status</option>
              <option value="disetujui">Disetujui Guru</option>
              <option value="draf_ai">Draf AI</option>
              <option value="ditinjau">Ditinjau</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pagination & Item Counter Bar */}
      <div className="bg-white px-4 py-2.5 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="text-gray-500">
          Menampilkan <strong>{Math.min(filteredQuestions.length, startIndex + 1)} - {Math.min(filteredQuestions.length, startIndex + pageSize)}</strong> dari <strong>{filteredQuestions.length}</strong> butir soal
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-gray-600">
            <span>Tampilkan per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-xs"
            >
              <option value={15}>15 Soal</option>
              <option value={25}>25 Soal</option>
              <option value={50}>50 Soal</option>
              <option value={100}>100 Soal</option>
              <option value={150}>150 Soal</option>
            </select>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={validCurrentPage === 1}
                className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-xs font-semibold"
              >
                Prev
              </button>
              <span className="px-2 font-mono font-bold text-gray-700">
                {validCurrentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={validCurrentPage === totalPages}
                className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-xs font-semibold"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-500 text-xs">
            Tidak ditemukan butir soal yang sesuai dengan kriteria filter saat ini.
          </div>
        ) : (
          paginatedQuestions.map((q) => (
            <div 
              key={q.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:border-emerald-300 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                    {q.code}
                  </span>
                  <span className="text-xs font-semibold text-emerald-800">
                    {q.subjectName} • Kelas {q.grade} (Fase {q.phase})
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">
                    {q.type.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    q.status === 'disetujui'
                      ? 'bg-emerald-100 text-emerald-800'
                      : q.status === 'draf_ai'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {q.status === 'disetujui' ? '✓ Disetujui' : q.status === 'draf_ai' ? 'Draf AI (Perlu Reviu)' : 'Ditinjau'}
                  </span>

                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                    {q.cognitiveLevel} • {q.difficulty}
                  </span>
                </div>
              </div>

              {/* Question Content */}
              <div className="text-xs space-y-2 text-gray-800">
                {q.stimulus && (
                  <div className="p-2.5 bg-amber-50/60 border-l-2 border-amber-500 rounded-r text-[11px] text-gray-700 italic">
                    <strong>Stimulus:</strong> {q.stimulus}
                  </div>
                )}

                <p className="font-semibold text-gray-900 leading-relaxed text-sm">
                  {q.stem}
                </p>

                {/* Options display */}
                {q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 pl-2">
                    {q.options.map(opt => (
                      <div 
                        key={opt.key}
                        className={`p-2 rounded-lg text-xs flex gap-2 ${
                          opt.key === q.answerKey || q.answerKey.split(',').includes(opt.key)
                            ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                            : 'bg-gray-50 text-gray-600'
                        }`}
                      >
                        <span className="font-bold">[{opt.key}]</span>
                        <span>{opt.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Explanation and Scoring */}
                <div className="mt-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100 text-[11px] grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="font-bold text-emerald-900 block">Kunci Jawaban: {q.answerKey}</span>
                    <span className="text-gray-500">Bobot Nilai: {q.points} Poin</span>
                    <p className="text-gray-600 mt-1">Pedoman: {q.scoringGuide}</p>
                  </div>
                  <div>
                    <span className="font-bold text-gray-700 block">Pembahasan / Rasionalisasi:</span>
                    <p className="text-gray-600 mt-0.5">{q.explanation}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-400">
                <span>Penyusun: {q.authorName}</span>

                <div className="flex items-center gap-1.5">
                  {q.status !== 'disetujui' && (
                    <button
                      onClick={() => handleApprove(q)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition shadow-xs"
                    >
                      Setujui Soal
                    </button>
                  )}
                  <button
                    onClick={() => handleDuplicate(q)}
                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                    title="Duplikasi Butir Soal"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                    title="Hapus Soal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                <Brain className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  AI Generator Soal Kurikulum Madrasah
                </h3>
                <p className="text-[11px] text-gray-500">
                  Ditenagai model Gemini AI untuk menghasilkan draf soal HOTS berstandar Kemenag.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs my-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mata Pelajaran:</label>
                <select
                  value={aiSubject}
                  onChange={(e) => setAiSubject(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tingkat Kelas:</label>
                  <select
                    value={aiGrade}
                    onChange={(e) => setAiGrade(Number(e.target.value))}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value={1}>Kelas 1 (Fase A)</option>
                    <option value={2}>Kelas 2 (Fase A)</option>
                    <option value={3}>Kelas 3 (Fase B)</option>
                    <option value={4}>Kelas 4 (Fase B)</option>
                    <option value={5}>Kelas 5 (Fase C)</option>
                    <option value={6}>Kelas 6 (Fase C)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Jumlah Butir Soal (1 s.d. 150 Soal):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={150}
                      value={aiCount}
                      onChange={(e) => setAiCount(Math.min(150, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                      className="w-24 p-2 bg-gray-50 border border-gray-300 rounded-xl font-mono font-bold text-sm text-center"
                    />
                    <div className="flex-1 flex flex-wrap gap-1">
                      {[5, 10, 25, 50, 75, 100, 150].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setAiCount(num)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                            aiCount === num
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={150}
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    className="w-full mt-2 accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>1 Butir</span>
                    <span className="font-bold text-emerald-800 font-mono">{aiCount} Butir Terpilih</span>
                    <span>Maks. 150 Butir</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Topik / Materi Pokok:</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Contoh: Fotosintesis pada Tumbuhan Hijau"
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tujuan Pembelajaran (TP):</label>
                <textarea
                  rows={2}
                  value={aiTp}
                  onChange={(e) => setAiTp(e.target.value)}
                  placeholder="Contoh: Peserta didik dapat menganalisis fungsi klorofil dan fotosintesis..."
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Level Kognitif Dominan:</label>
                  <select
                    value={aiCognitive}
                    onChange={(e) => setAiCognitive(e.target.value as CognitiveLevel)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="L1">L1 - Pengetahuan / Pemahaman</option>
                    <option value="L2">L2 - Aplikasi Konseptual</option>
                    <option value="L3">L3 - Penalaran HOTS</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tingkat Kesukaran Dominan:</label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="Mudah">Mudah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Sukar">Sukar</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Live Progress Bar if Generating */}
            {isGeneratingAi && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 mb-4 animate-in fade-in">
                <div className="flex justify-between items-center text-xs font-semibold text-emerald-900 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin"></span>
                    <span>Memproses generasi paket soal ({aiCount} butir)...</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-800">
                    {generationProgress.current} / {generationProgress.total || aiCount}
                  </span>
                </div>
                <div className="w-full bg-emerald-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.max(
                        6,
                        ((generationProgress.current || 1) / (generationProgress.total || aiCount)) * 100
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-emerald-700 mt-1">
                  Sistem menyusun butir soal HOTS, stimulus, kunci, rubrik, dan distraktor logis.
                </p>
              </div>
            )}

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 mb-4">
              📌 <strong>Integritas Asesmen:</strong> Seluruh soal buatan AI (sampai 150 butir) otomatis berstatus <em>DRAF</em> sampai guru menelaah dan menyetujuinya.
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAiModal(false)}
                disabled={isGeneratingAi}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleRunAiGenerator}
                disabled={isGeneratingAi}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2"
              >
                {isGeneratingAi ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Menghasilkan {generationProgress.current || 0}/{aiCount} Soal...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Hasilkan {aiCount} Butir Soal AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
