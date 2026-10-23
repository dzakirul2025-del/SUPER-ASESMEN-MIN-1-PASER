import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  AppStorageService 
} from '../services/storage';
import { 
  ExamSession, 
  AssessmentPackage, 
  QuestionBankItem, 
  UserProfile, 
  ExamAttempt,
  StudentAnswerRecord 
} from '../types';
import confetti from 'canvas-confetti';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Send,
  Flag,
  RotateCcw,
  Sparkles,
  Award,
  Check,
  X,
  Lock,
  Wifi,
  Eye
} from 'lucide-react';

interface CbtExamViewProps {
  currentUser: UserProfile;
}

export const CbtExamView: React.FC<CbtExamViewProps> = ({ currentUser }) => {
  const sessions = AppStorageService.getSessions();
  const activeSession = sessions[0]; // Active CBT session
  const packages = AppStorageService.getPackages();

  const currentPackage = useMemo(() => {
    if (!activeSession) return packages[0];
    return packages.find(p => p.id === activeSession.packageId) || packages[0];
  }, [activeSession, packages]);

  // CBT State
  const [hasStarted, setHasStarted] = useState(false);
  const [inputToken, setInputToken] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(
    (activeSession?.durationMinutes || 60) * 60
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('Tersimpan otomatis');

  const questions = currentPackage?.questions || [];
  const activeQuestion = questions[currentIndex];

  // Check if existing attempt exists in storage
  useEffect(() => {
    if (activeSession && currentUser) {
      const existing = AppStorageService.getAttemptByStudentAndSession(currentUser.id, activeSession.id);
      if (existing) {
        if (existing.status === 'selesai' || existing.status === 'dinilai') {
          setIsSubmitted(true);
        } else {
          // Resume ongoing test attempt!
          setHasStarted(true);
          const recoveredAnswers: Record<string, any> = {};
          const recoveredFlags: Record<string, boolean> = {};
          Object.values(existing.answers).forEach(rec => {
            recoveredAnswers[rec.questionId] = rec.answer;
            recoveredFlags[rec.questionId] = rec.isFlagged;
          });
          setAnswers(recoveredAnswers);
          setFlagged(recoveredFlags);
          setRemainingSeconds(existing.remainingSeconds);
        }
      }
    }
  }, [currentUser, activeSession]);

  // Real-time Countdown Timer
  useEffect(() => {
    if (!hasStarted || isSubmitted) return;

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam(true); // Auto-submit when time expires!
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, isSubmitted]);

  // Periodic autosave to AppStorage
  useEffect(() => {
    if (!hasStarted || isSubmitted || !activeSession) return;

    const saveInterval = setInterval(() => {
      saveCurrentAttemptToStorage('mengerjakan');
      setAutoSaveStatus(`Tersinkronisasi (${new Date().toLocaleTimeString('id-ID')})`);
    }, 8000);

    return () => clearInterval(saveInterval);
  }, [hasStarted, isSubmitted, answers, flagged, remainingSeconds]);

  // Auto-grade on submit
  const saveCurrentAttemptToStorage = (status: 'mengerjakan' | 'selesai' | 'dinilai') => {
    if (!activeSession) return;

    let objectiveScore = 0;
    let essayScore = 0;
    let maxScore = 0;

    const formattedAnswers: Record<string, StudentAnswerRecord> = {};

    questions.forEach(q => {
      maxScore += q.points;
      const userAns = answers[q.id];
      const isFlag = Boolean(flagged[q.id]);

      let isCorrect = false;
      let awarded = 0;

      if (q.type === 'pilihan_ganda') {
        isCorrect = userAns === q.answerKey;
        awarded = isCorrect ? q.points : 0;
        objectiveScore += awarded;
      } else if (q.type === 'benar_salah') {
        const correctStr = q.correctBool ? 'Benar' : 'Salah';
        isCorrect = userAns === correctStr || userAns === q.correctBool;
        awarded = isCorrect ? q.points : 0;
        objectiveScore += awarded;
      } else if (q.type === 'pg_kompleks') {
        // Multi select
        const requiredKeys = q.answerKey.split(',').map(s => s.trim().toUpperCase());
        const userKeys = Array.isArray(userAns) ? userAns : [];
        const matches = userKeys.filter(k => requiredKeys.includes(k)).length;
        if (matches === requiredKeys.length && userKeys.length === requiredKeys.length) {
          isCorrect = true;
          awarded = q.points;
        } else if (matches > 0) {
          awarded = Math.floor(q.points / 2);
        }
        objectiveScore += awarded;
      } else if (q.type === 'isian_singkat') {
        isCorrect = String(userAns || '').trim().toLowerCase() === q.answerKey.toLowerCase();
        awarded = isCorrect ? q.points : 0;
        objectiveScore += awarded;
      } else if (q.type === 'menjodohkan') {
        // Pairs
        if (typeof userAns === 'object' && userAns !== null) {
          let pairMatches = 0;
          q.matchingPairs?.forEach(mp => {
            if (userAns[mp.premise] === mp.response) pairMatches++;
          });
          awarded = pairMatches;
          isCorrect = pairMatches === (q.matchingPairs?.length || 0);
          objectiveScore += awarded;
        }
      } else if (q.type === 'uraian') {
        // Preliminary essay score based on teacher grading or simulated rubric
        awarded = userAns && String(userAns).length > 20 ? Math.round(q.points * 0.8) : 0;
        essayScore += awarded;
      }

      formattedAnswers[q.id] = {
        questionId: q.id,
        answer: userAns,
        isFlagged: isFlag,
        isCorrect,
        scoreAwarded: awarded,
        maxScore: q.points,
      };
    });

    const totalScore = objectiveScore + essayScore;
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    const attempt: ExamAttempt = {
      id: `att-${currentUser.id}-${activeSession.id}`,
      sessionId: activeSession.id,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentNisn: currentUser.nisn || '0012345678',
      className: currentUser.classId || 'Kelas 4A',
      startedAt: new Date().toISOString(),
      submittedAt: status === 'selesai' || status === 'dinilai' ? new Date().toISOString() : undefined,
      status: status,
      remainingSeconds,
      answers: formattedAnswers,
      objectiveScore,
      essayScore,
      totalScore,
      maxScore,
      percentage: Number(percentage.toFixed(1)),
      isPassed: percentage >= (currentPackage?.passingGrade || 75),
      ipAddress: '192.168.1.105',
      incidentsCount: 0,
    };

    AppStorageService.saveAttempt(attempt);
    return attempt;
  };

  const handleStartExam = () => {
    if (!activeSession) return;
    if (inputToken.trim().toUpperCase() !== activeSession.token.toUpperCase()) {
      setTokenError(`Token salah! Hubungi pengawas ruang (${activeSession.proctorName}) untuk token yang benar.`);
      return;
    }
    setTokenError('');
    setHasStarted(true);
    AppStorageService.logAction(
      'Mulai Mengerjakan CBT',
      'Computer Based Test',
      `Siswa ${currentUser.name} (${currentUser.nisn || 'Siswa'}) memulai ujian ${activeSession.sessionName}.`
    );
  };

  const handleSubmitExam = (isAuto = false) => {
    const finalAttempt = saveCurrentAttemptToStorage('dinilai');
    setIsSubmitted(true);
    setShowSubmitModal(false);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Confetti fallback
    }

    AppStorageService.logAction(
      'Kirim Jawaban CBT',
      'Computer Based Test',
      `Peserta ${currentUser.name} mengakhiri ujian CBT. Nilai: ${finalAttempt?.percentage || 0} (${isAuto ? 'Waktu Habis Otomatis' : 'Mandiri'}).`
    );
  };

  // Answer handlers
  const handleSelectOption = (key: string) => {
    if (!activeQuestion) return;
    setAnswers(prev => ({ ...prev, [activeQuestion.id]: key }));
  };

  const handleToggleMultiSelect = (key: string) => {
    if (!activeQuestion) return;
    const currentList: string[] = answers[activeQuestion.id] || [];
    const exists = currentList.includes(key);
    const updated = exists ? currentList.filter(k => k !== key) : [...currentList, key];
    setAnswers(prev => ({ ...prev, [activeQuestion.id]: updated }));
  };

  const handleSetTrueFalse = (val: boolean) => {
    if (!activeQuestion) return;
    setAnswers(prev => ({ ...prev, [activeQuestion.id]: val ? 'Benar' : 'Salah' }));
  };

  const handleSetTextAnswer = (text: string) => {
    if (!activeQuestion) return;
    setAnswers(prev => ({ ...prev, [activeQuestion.id]: text }));
  };

  const handleToggleFlag = () => {
    if (!activeQuestion) return;
    setFlagged(prev => ({ ...prev, [activeQuestion.id]: !prev[activeQuestion.id] }));
  };

  const handleMatchingPair = (premise: string, response: string) => {
    if (!activeQuestion) return;
    const current = answers[activeQuestion.id] || {};
    setAnswers(prev => ({
      ...prev,
      [activeQuestion.id]: { ...current, [premise]: response },
    }));
  };

  // Stats for submission check
  const answeredCount = questions.filter(q => {
    const a = answers[q.id];
    if (a === undefined || a === null || a === '') return false;
    if (Array.isArray(a) && a.length === 0) return false;
    return true;
  }).length;

  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const unansweredCount = questions.length - answeredCount;

  // Format time
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Font size classes
  const fontClasses = {
    normal: 'text-sm',
    large: 'text-base',
    xlarge: 'text-lg',
  }[fontSize];

  // 1. Pre-Exam Token Entry Screen
  if (!hasStarted && !isSubmitted) {
    return (
      <div className="max-w-xl mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 sm:p-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <ShieldCheck className="w-8 h-8 text-emerald-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Konfirmasi Sesi Ujian CBT
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              MIN 1 Paser • Sistem Asesmen Mandiri & Terstandar
            </p>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Nama Peserta:</span>
              <span className="font-bold text-gray-800">{currentUser.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">NISN / Akun:</span>
              <span className="font-mono text-gray-800">{currentUser.nisn || currentUser.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Mata Pelajaran:</span>
              <span className="font-semibold text-emerald-800">{activeSession?.subjectName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Durasi Pengerjaan:</span>
              <span className="font-bold text-gray-800">{activeSession?.durationMinutes} Menit</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Jumlah Soal:</span>
              <span className="font-bold text-gray-800">{questions.length} Butir</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pengawas Ruang:</span>
              <span className="text-gray-800">{activeSession?.proctorName}</span>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Masukkan Token Ujian:
            </label>
            <input
              type="text"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              placeholder="Contoh: MIN1PASER"
              className="w-full text-center font-mono font-black text-lg uppercase tracking-widest p-3 bg-gray-50 border-2 border-emerald-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {tokenError && (
              <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{tokenError}</span>
              </p>
            )}
            <p className="text-[11px] text-gray-400 mt-2 text-center">
              Token diperoleh dari pengawas ruang saat ujian dimulai.
            </p>
          </div>

          <div className="mt-6">
            <button
              onClick={handleStartExam}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Mulai Mengerjakan Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Exam Completed Celebration Screen
  if (isSubmitted) {
    const attempt = AppStorageService.getAttemptByStudentAndSession(
      currentUser.id, 
      activeSession?.id || ''
    );
    return (
      <div className="max-w-xl mx-auto py-8 px-4 text-center">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <Award className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">
            Alhamdulillah, Ujian Selesai!
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Jawaban Anda telah tersimpan secara resmi dan terverifikasi di server CBT MIN 1 Paser.
          </p>

          {activeSession?.showScoreAfterExam && attempt && (
            <div className="mt-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs uppercase font-bold text-emerald-800">Nilai Hasil Belajar Anda:</span>
              <div className="text-4xl font-black text-emerald-900 mt-1">
                {attempt.percentage}
              </div>
              <p className="text-xs font-semibold text-emerald-700 mt-1">
                {attempt.isPassed ? '✓ Selamat! Anda Mencapai Ketuntasan (KKTP)' : 'Perlu Pendampingan Remedial'}
              </p>
              <div className="mt-3 pt-3 border-t border-emerald-200/60 grid grid-cols-2 text-[11px] text-gray-600">
                <div>Skor Diperoleh: <strong>{attempt.totalScore} / {attempt.maxScore}</strong></div>
                <div>Waktu Selesai: <strong>{new Date(attempt.submittedAt || '').toLocaleTimeString('id-ID')}</strong></div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={() => {
                setHasStarted(false);
                setIsSubmitted(false);
              }}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition"
            >
              Kembali ke Menu Sesi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Active CBT Exam Interface
  return (
    <div className="max-w-6xl mx-auto select-none space-y-4">
      {/* Top Floating Control Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 sticky top-16 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
            {currentIndex + 1}
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-tight">
              Soal Nomor {currentIndex + 1} dari {questions.length}
            </h3>
            <span className="text-[10px] text-gray-400 capitalize">
              Tipe: {activeQuestion?.type.replace('_', ' ')} • Bobot {activeQuestion?.points} Poin
            </span>
          </div>
        </div>

        {/* Center: Font Size Resizer */}
        <div className="hidden sm:flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setFontSize('normal')}
            className={`px-2 py-0.5 rounded font-bold ${fontSize === 'normal' ? 'bg-white shadow-xs' : 'text-gray-500'}`}
            title="Ukuran Tulisan Normal"
          >
            A
          </button>
          <button
            onClick={() => setFontSize('large')}
            className={`px-2 py-0.5 rounded font-bold ${fontSize === 'large' ? 'bg-white shadow-xs' : 'text-gray-500'}`}
            title="Ukuran Tulisan Sedang"
          >
            A+
          </button>
          <button
            onClick={() => setFontSize('xlarge')}
            className={`px-2 py-0.5 rounded font-bold ${fontSize === 'xlarge' ? 'bg-white shadow-xs' : 'text-gray-500'}`}
            title="Ukuran Tulisan Besar"
          >
            A++
          </button>
        </div>

        {/* Right: Autosave status & Countdown Timer */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium">
              <Wifi className="w-3 h-3 text-emerald-600 animate-pulse" />
              <span>{autoSaveStatus}</span>
            </div>
            <div className="text-[10px] text-gray-400">{currentUser.name}</div>
          </div>

          {/* Timer Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-sm shadow-xs ${
            remainingSeconds < 300 
              ? 'bg-red-600 text-white animate-pulse' 
              : 'bg-emerald-800 text-white'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(remainingSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Main Examination Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: Active Question Area (3 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-xs border border-gray-200 p-5 sm:p-7 flex flex-col justify-between min-h-[460px]">
          <div>
            {/* Stimulus jika ada */}
            {activeQuestion?.stimulus && (
              <div className="mb-4 p-3.5 bg-amber-50/70 border-l-4 border-amber-500 rounded-r-xl text-xs text-gray-800 leading-relaxed font-sans">
                <span className="font-bold text-amber-900 block mb-1">Stimulus / Teks Bacaan:</span>
                <p>{activeQuestion.stimulus}</p>
              </div>
            )}

            {/* Stem Soal */}
            <div className={`font-medium text-gray-900 leading-relaxed ${fontClasses}`}>
              {activeQuestion?.stem}
            </div>

            {/* Render Opsi Jawaban Berdasarkan Tipe Soal */}
            <div className="mt-5 space-y-2.5">
              {/* Pilihan Ganda (Single Choice) */}
              {activeQuestion?.type === 'pilihan_ganda' && activeQuestion.options && (
                activeQuestion.options.map((opt) => {
                  const isSelected = answers[activeQuestion.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectOption(opt.key)}
                      className={`w-full text-left p-3.5 rounded-xl border flex items-center gap-3 transition ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold shadow-xs'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {opt.key}
                      </div>
                      <span className={fontClasses}>{opt.text}</span>
                    </button>
                  );
                })
              )}

              {/* Pilihan Ganda Kompleks (Multi Select) */}
              {activeQuestion?.type === 'pg_kompleks' && activeQuestion.options && (
                activeQuestion.options.map((opt) => {
                  const selectedList = answers[activeQuestion.id] || [];
                  const isChecked = selectedList.includes(opt.key);
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleToggleMultiSelect(opt.key)}
                      className={`w-full text-left p-3.5 rounded-xl border flex items-center gap-3 transition ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold shadow-xs'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${
                        isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <span className="font-bold text-xs text-gray-500">[{opt.key}]</span>
                      <span className={fontClasses}>{opt.text}</span>
                    </button>
                  );
                })
              )}

              {/* Benar atau Salah */}
              {activeQuestion?.type === 'benar_salah' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleSetTrueFalse(true)}
                    className={`p-4 rounded-xl border text-center font-bold text-sm transition ${
                      answers[activeQuestion.id] === 'Benar'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
                    }`}
                  >
                    ✓ BENAR
                  </button>
                  <button
                    onClick={() => handleSetTrueFalse(false)}
                    className={`p-4 rounded-xl border text-center font-bold text-sm transition ${
                      answers[activeQuestion.id] === 'Salah'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
                    }`}
                  >
                    ✕ SALAH
                  </button>
                </div>
              )}

              {/* Isian Singkat */}
              {activeQuestion?.type === 'isian_singkat' && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Ketik Jawaban Singkat Anda:
                  </label>
                  <input
                    type="text"
                    value={answers[activeQuestion.id] || ''}
                    onChange={(e) => handleSetTextAnswer(e.target.value)}
                    placeholder="Tuliskan kata kunci jawaban..."
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium text-sm"
                  />
                </div>
              )}

              {/* Menjodohkan */}
              {activeQuestion?.type === 'menjodohkan' && activeQuestion.matchingPairs && (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-gray-500 font-medium">Pilih pasangan yang tepat untuk setiap premis:</p>
                  {activeQuestion.matchingPairs.map((pair, pIdx) => {
                    const currentPairAns = (answers[activeQuestion.id] || {})[pair.premise] || '';
                    return (
                      <div key={pIdx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-gray-800 sm:w-1/2">{pair.premise}</span>
                        <select
                          value={currentPairAns}
                          onChange={(e) => handleMatchingPair(pair.premise, e.target.value)}
                          className="bg-white border border-gray-300 rounded-lg p-2 font-medium focus:ring-1 focus:ring-emerald-600"
                        >
                          <option value="">-- Pasangan Jawaban --</option>
                          {activeQuestion.matchingPairs?.map(opt => (
                            <option key={opt.response} value={opt.response}>{opt.response}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Uraian / Essay */}
              {activeQuestion?.type === 'uraian' && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Tuliskan Jawaban Uraian Lengkap:
                  </label>
                  <textarea
                    rows={6}
                    value={answers[activeQuestion.id] || ''}
                    onChange={(e) => handleSetTextAnswer(e.target.value)}
                    placeholder="Kemukakan analisis, penalaran, atau penjelasan Anda di sini..."
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm leading-relaxed"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Jawaban Anda akan dikoreksi menggunakan rubrik evaluasi resmi guru.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            {/* Ragu-ragu Flag Toggle */}
            <button
              onClick={handleToggleFlag}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                flagged[activeQuestion?.id || '']
                  ? 'bg-amber-400 text-amber-950 shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300'
              }`}
            >
              <Flag className="w-4 h-4" />
              <span>{flagged[activeQuestion?.id || ''] ? 'Ragu-ragu (Aktif)' : 'Ragu-ragu'}</span>
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-emerald-950 text-xs font-black rounded-xl shadow-sm transition"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Ujian</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Question Navigator Grid (1 Col) */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">Peta Soal</span>
              <span className="text-[11px] font-semibold text-emerald-700">{answeredCount}/{questions.length} Terjawab</span>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-1 text-[10px] text-gray-600 mb-3 bg-gray-50 p-2 rounded-lg">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600"></span>
                <span>Terjawab</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-400"></span>
                <span>Ragu-ragu</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-gray-200"></span>
                <span>Kosong</span>
              </div>
            </div>

            {/* Matrix of numbers */}
            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isFlag = Boolean(flagged[q.id]);
                const ans = answers[q.id];
                const hasAns = ans !== undefined && ans !== null && ans !== '' && (!Array.isArray(ans) || ans.length > 0);

                let bgClass = 'bg-gray-100 text-gray-700 border-gray-200';
                if (isFlag) bgClass = 'bg-amber-400 text-amber-950 font-bold border-amber-500';
                else if (hasAns) bgClass = 'bg-emerald-600 text-white font-bold border-emerald-700';

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg border text-xs flex items-center justify-center font-mono transition ${bgClass} ${
                      isCurrent ? 'ring-2 ring-emerald-500 ring-offset-2' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Submit Button */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Selesai & Kumpulkan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal Before Submission */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Konfirmasi Selesai Ujian CBT
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Apakah Anda yakin ingin menyelesaikan dan mengumpulkan lembar jawaban asesmen ini?
            </p>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1.5 mb-5">
              <div className="flex justify-between">
                <span>Total Soal:</span>
                <span className="font-bold">{questions.length} Butir</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Soal Terjawab:</span>
                <span className="font-bold">{answeredCount} Butir</span>
              </div>
              {flaggedCount > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Masih Ragu-ragu:</span>
                  <span className="font-bold">{flaggedCount} Butir</span>
                </div>
              )}
              {unansweredCount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Belum Terjawab:</span>
                  <span className="font-bold">{unansweredCount} Butir</span>
                </div>
              )}
            </div>

            {unansweredCount > 0 && (
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mb-4">
                ⚠️ Peringatan: Terdapat {unansweredCount} butir soal yang belum Anda jawab. Jawaban kosong bernilai 0 poin.
              </p>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition"
              >
                Lanjutkan Mengerjakan
              </button>
              <button
                onClick={() => handleSubmitExam(false)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                Ya, Kumpulkan Jawaban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
