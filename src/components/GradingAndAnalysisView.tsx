import React, { useState } from 'react';
import { 
  AppStorageService 
} from '../services/storage';
import { AiService } from '../services/aiService';
import { ExportService } from '../services/exportService';
import { 
  ExamAttempt, 
  QuestionBankItem, 
  UserProfile, 
  StudentAnswerRecord 
} from '../types';
import {
  CheckCircle2,
  FileCheck,
  Brain,
  BarChart3,
  Award,
  TrendingUp,
  Download,
  Check,
  ChevronRight,
  Sparkles,
  Users,
  AlertCircle
} from 'lucide-react';

interface GradingAndAnalysisViewProps {
  currentUser: UserProfile;
}

export const GradingAndAnalysisView: React.FC<GradingAndAnalysisViewProps> = ({ currentUser }) => {
  const school = AppStorageService.getSchool();
  const packages = AppStorageService.getPackages();
  const activePackage = packages[0];
  const [attempts, setAttempts] = useState<ExamAttempt[]>(AppStorageService.getAttempts());
  
  // Selected attempt for grading inspection
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttempt | null>(attempts[0] || null);
  const [selectedQuestionForEssay, setSelectedQuestionForEssay] = useState<QuestionBankItem | null>(null);

  // AI Essay Grading state
  const [isAiGrading, setIsAiGrading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any | null>(null);
  const [manualEssayScore, setManualEssayScore] = useState<number>(0);
  const [teacherFeedback, setTeacherFeedback] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Statistical calculations
  const scores = attempts.map(a => a.percentage);
  const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0';
  const highest = scores.length > 0 ? Math.max(...scores).toFixed(1) : '0';
  const lowest = scores.length > 0 ? Math.min(...scores).toFixed(1) : '0';
  
  // Median
  const sortedScores = [...scores].sort((a, b) => a - b);
  const median = sortedScores.length > 0 
    ? (sortedScores[Math.floor(sortedScores.length / 2)]).toFixed(1)
    : '0';

  const kktpThreshold = activePackage?.passingGrade || 75;
  const passedStudents = attempts.filter(a => a.percentage >= kktpThreshold);
  const remedialStudents = attempts.filter(a => a.percentage < kktpThreshold);
  const passingRate = attempts.length > 0 
    ? ((passedStudents.length / attempts.length) * 100).toFixed(1)
    : '0';

  // Request AI Essay Grading suggestion
  const handleRequestAiEssaySuggestion = async (q: QuestionBankItem, studentAns: string) => {
    setIsAiGrading(true);
    setAiSuggestion(null);

    try {
      const result = await AiService.suggestEssayScore({
        questionStem: q.stem,
        rubric: q.scoringGuide,
        expectedAnswer: q.answerKey,
        studentAnswer: studentAns || '(Siswa tidak mengisi jawaban)',
        maxPoints: q.points,
      });

      setAiSuggestion(result);
      setManualEssayScore(result.suggestedScore);
      setTeacherFeedback(result.feedback);
    } catch (e) {
      console.error(e);
      showToast('Gagal memanggil asisten AI.');
    } finally {
      setIsAiGrading(false);
    }
  };

  // Save manual essay grading
  const handleSaveEssayGrade = () => {
    if (!selectedAttempt || !selectedQuestionForEssay) return;

    const currentRec = selectedAttempt.answers[selectedQuestionForEssay.id] || {
      questionId: selectedQuestionForEssay.id,
      answer: '',
      isFlagged: false,
      maxScore: selectedQuestionForEssay.points,
    };

    const updatedRec: StudentAnswerRecord = {
      ...currentRec,
      scoreAwarded: manualEssayScore,
      isCorrect: manualEssayScore >= Math.round(selectedQuestionForEssay.points * 0.7),
      isManuallyGraded: true,
      teacherFeedback,
    };

    // Recompute total attempt score
    const updatedAnswers = {
      ...selectedAttempt.answers,
      [selectedQuestionForEssay.id]: updatedRec,
    };

    let newObjective = 0;
    let newEssay = 0;
    let maxSc = 0;

    Object.values(updatedAnswers).forEach(rec => {
      const q = activePackage.questions.find(item => item.id === rec.questionId);
      maxSc += rec.maxScore || q?.points || 1;
      if (q?.type === 'uraian') {
        newEssay += rec.scoreAwarded || 0;
      } else {
        newObjective += rec.scoreAwarded || 0;
      }
    });

    const newTotal = newObjective + newEssay;
    const newPercentage = Number(((newTotal / maxSc) * 100).toFixed(1));

    const updatedAttempt: ExamAttempt = {
      ...selectedAttempt,
      answers: updatedAnswers,
      objectiveScore: newObjective,
      essayScore: newEssay,
      totalScore: newTotal,
      percentage: newPercentage,
      isPassed: newPercentage >= kktpThreshold,
      status: 'dinilai',
    };

    AppStorageService.saveAttempt(updatedAttempt);
    setAttempts(AppStorageService.getAttempts());
    setSelectedAttempt(updatedAttempt);
    setSelectedQuestionForEssay(null);
    setAiSuggestion(null);

    AppStorageService.logAction(
      'Koreksi Soal Uraian Guru',
      'Penilaian & Evaluasi',
      `Guru ${currentUser.name} memberikan skor ${manualEssayScore} untuk siswa ${selectedAttempt.studentName}.`
    );
    showToast('Nilai uraian dan umpan balik berhasil disimpan secara sah.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Modul 9 & 10
            </span>
            <span className="text-xs text-gray-500">
              Evaluasi Objektif & Koreksi Uraian Terpadu
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-1">
            Penilaian Otomatis & Analisis Hasil Asesmen
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Paket: <span className="font-semibold text-gray-700">{activePackage?.title}</span> • KKTP Standar: {kktpThreshold} Poin
          </p>
        </div>

        <button
          onClick={() => {
            ExportService.exportGradesToExcel(activePackage, attempts, school, kktpThreshold);
            showToast('Rekapitulasi lengkap berhasil diunduh ke format Excel (XLSX).');
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Unduh Rekap Nilai (XLSX)</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Statistical Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 text-center shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Rata-rata Kelas</span>
          <div className="text-xl font-black text-gray-900 mt-1">{avg}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 text-center shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Median Nilai</span>
          <div className="text-xl font-black text-gray-900 mt-1">{median}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 text-center shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Nilai Tertinggi</span>
          <div className="text-xl font-black text-emerald-700 mt-1">{highest}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 text-center shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Nilai Terendah</span>
          <div className="text-xl font-black text-red-600 mt-1">{lowest}</div>
        </div>
        <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 text-center">
          <span className="text-[10px] font-bold text-emerald-800 uppercase">Ketuntasan (KKTP)</span>
          <div className="text-xl font-black text-emerald-950 mt-1">{passingRate}%</div>
        </div>
        <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 text-center">
          <span className="text-[10px] font-bold text-amber-800 uppercase">Perlu Remedial</span>
          <div className="text-xl font-black text-amber-950 mt-1">{remedialStudents.length} Siswa</div>
        </div>
      </div>

      {/* Main 2 Column Section: Attempts Table & Detailed Scoring Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Students Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xs border border-gray-200 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <h3 className="font-bold text-sm text-gray-900">
              Daftar Hasil & Koreksi Peserta Didik
            </h3>
            <span className="text-xs text-gray-500">
              Pilih baris untuk memeriksa butir jawaban
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-gray-600 font-semibold">
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Skor PG</th>
                  <th className="p-3">Skor Uraian</th>
                  <th className="p-3">Total Skor</th>
                  <th className="p-3">Nilai Akhir</th>
                  <th className="p-3">Status KKTP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attempts.map((att) => {
                  const isSelected = selectedAttempt?.id === att.id;
                  return (
                    <tr
                      key={att.id}
                      onClick={() => setSelectedAttempt(att)}
                      className={`cursor-pointer transition ${
                        isSelected ? 'bg-emerald-50/90 font-semibold' : 'hover:bg-gray-50/70'
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-bold text-gray-900">{att.studentName}</div>
                        <div className="text-[10px] text-gray-400 font-mono">NISN: {att.studentNisn}</div>
                      </td>
                      <td className="p-3">{att.className}</td>
                      <td className="p-3 font-mono">{att.objectiveScore} Poin</td>
                      <td className="p-3 font-mono">{att.essayScore} Poin</td>
                      <td className="p-3 font-mono font-bold">{att.totalScore} / {att.maxScore}</td>
                      <td className="p-3">
                        <span className="text-sm font-black text-emerald-800">{att.percentage}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          att.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {att.isPassed ? '✓ TUNTAS' : 'REMEDIAL'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Detailed Inspection Drawer (1 Col) */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5">
          {selectedAttempt ? (
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                  Rincian Butir Jawaban Siswa
                </span>
                <h4 className="font-bold text-sm text-gray-900 mt-0.5">
                  {selectedAttempt.studentName}
                </h4>
                <p className="text-xs text-gray-500">
                  Nilai: <strong>{selectedAttempt.percentage}</strong> ({selectedAttempt.isPassed ? 'Tuntas' : 'Belum Tuntas'})
                </p>
              </div>

              {/* List of answers for all questions */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {activePackage.questions.map((q, idx) => {
                  const rec = selectedAttempt.answers[q.id];
                  const hasAnswered = rec && rec.answer !== undefined && rec.answer !== null;
                  const isEssay = q.type === 'uraian';

                  return (
                    <div 
                      key={q.id}
                      className={`p-3 rounded-xl border text-xs ${
                        rec?.isCorrect 
                          ? 'border-emerald-200 bg-emerald-50/30' 
                          : 'border-gray-200 bg-gray-50/40'
                      }`}
                    >
                      <div className="flex justify-between items-center font-bold mb-1">
                        <span>No. {idx + 1} ({q.type.replace('_', ' ')})</span>
                        <span className="font-mono text-emerald-800">
                          Skor: {rec?.scoreAwarded || 0} / {q.points}
                        </span>
                      </div>
                      <p className="text-gray-700 text-[11px] line-clamp-2">{q.stem}</p>

                      <div className="mt-2 pt-2 border-t border-gray-100 text-[11px]">
                        <div>
                          <span className="text-gray-400">Jawaban Siswa: </span>
                          <span className="font-mono font-bold text-gray-800">
                            {typeof rec?.answer === 'object' && rec?.answer !== null
                              ? JSON.stringify(rec.answer)
                              : String(rec?.answer || '(Kosong)')}
                          </span>
                        </div>
                        <div className="mt-0.5">
                          <span className="text-gray-400">Kunci: </span>
                          <span className="font-mono text-emerald-800">{q.answerKey}</span>
                        </div>

                        {/* Button for Essay correction */}
                        {isEssay && (
                          <div className="mt-2.5">
                            <button
                              onClick={() => {
                                setSelectedQuestionForEssay(q);
                                setManualEssayScore(rec?.scoreAwarded || 0);
                                setTeacherFeedback(rec?.teacherFeedback || '');
                              }}
                              className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold text-[11px] rounded-lg shadow-xs transition flex items-center justify-center gap-1.5"
                            >
                              <Brain className="w-3.5 h-3.5" />
                              <span>Koreksi Rubrik Uraian & Rekomendasi AI</span>
                            </button>
                          </div>
                        )}

                        {rec?.teacherFeedback && (
                          <div className="mt-1.5 p-2 bg-emerald-100/60 rounded text-[10px] text-emerald-900">
                            <strong>Catatan Guru:</strong> {rec.teacherFeedback}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-12">
              Pilih peserta didik untuk melihat lembar jawaban.
            </p>
          )}
        </div>
      </div>

      {/* Essay Rubric & AI Grading Modal */}
      {selectedQuestionForEssay && selectedAttempt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  Koreksi Jawaban Uraian & Rubrik Penilaian
                </h3>
                <p className="text-xs text-gray-500">
                  Peserta: <span className="font-semibold">{selectedAttempt.studentName}</span>
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs my-4 max-h-96 overflow-y-auto pr-1">
              {/* Question Stem */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="font-bold text-gray-700 block mb-1">Rumusan Soal Uraian:</span>
                <p className="text-gray-800">{selectedQuestionForEssay.stem}</p>
              </div>

              {/* Rubric Guide */}
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-emerald-950">
                <span className="font-bold block mb-1">Pedoman Penskoran / Rubrik Guru:</span>
                <p>{selectedQuestionForEssay.scoringGuide}</p>
              </div>

              {/* Student Actual Answer */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                <span className="font-bold text-blue-950 block mb-1">Jawaban Siswa:</span>
                <p className="font-medium text-blue-900 italic">
                  "{selectedAttempt.answers[selectedQuestionForEssay.id]?.answer || '(Tidak diisi)'}"
                </p>
              </div>

              {/* AI Recommendation Trigger */}
              <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-amber-700" />
                    <span>Asisten AI Evaluasi Rubrik</span>
                  </span>
                  <button
                    onClick={() => handleRequestAiEssaySuggestion(
                      selectedQuestionForEssay,
                      String(selectedAttempt.answers[selectedQuestionForEssay.id]?.answer || '')
                    )}
                    disabled={isAiGrading}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold rounded-lg transition text-[11px]"
                  >
                    {isAiGrading ? 'Menganalisis...' : 'Minta Rekomendasi AI'}
                  </button>
                </div>

                {aiSuggestion && (
                  <div className="mt-3 pt-2 border-t border-amber-200/80 text-[11px] text-amber-950 space-y-1">
                    <div>Saran Skor AI: <strong className="text-sm font-black text-emerald-800">{aiSuggestion.suggestedScore} / {selectedQuestionForEssay.points}</strong></div>
                    <p><strong>Alasan:</strong> {aiSuggestion.justification}</p>
                    <p><strong>Kekuatan:</strong> {aiSuggestion.strengths}</p>
                  </div>
                )}
              </div>

              {/* Teacher Decision Inputs */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Skor Final Guru (Skor Maksimal {selectedQuestionForEssay.points}):
                </label>
                <input
                  type="number"
                  min={0}
                  max={selectedQuestionForEssay.points}
                  value={manualEssayScore}
                  onChange={(e) => setManualEssayScore(Math.min(selectedQuestionForEssay.points, Math.max(0, Number(e.target.value))))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Umpan Balik / Catatan untuk Siswa:
                </label>
                <textarea
                  rows={2}
                  value={teacherFeedback}
                  onChange={(e) => setTeacherFeedback(e.target.value)}
                  placeholder="Tuliskan apresiasi dan saran perbaikan..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setSelectedQuestionForEssay(null);
                  setAiSuggestion(null);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEssayGrade}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Simpan Penilaian Sah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
