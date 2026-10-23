export type UserRole = 
  | 'super_admin' 
  | 'kepala_madrasah' 
  | 'admin_asesmen' 
  | 'guru' 
  | 'pengawas' 
  | 'siswa';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  nip?: string;
  nisn?: string;
  role: UserRole;
  email: string;
  schoolId: string;
  classId?: string;
  subjectNames?: string[];
  avatar?: string;
}

export interface School {
  id: string;
  name: string;
  nsm: string;
  npsn: string;
  address: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  headmasterName: string;
  headmasterNip: string;
  developerName: string;
}

export type Phase = 'A' | 'B' | 'C';
export type ClassLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2024/2025"
  semester: 'Ganjil' | 'Genap';
  isCurrent: boolean;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  category: 'Keagamaan / Ciri Khas Kemenag' | 'Umum' | 'Muatan Lokal';
  grade: ClassLevel;
  phase: Phase;
  kktp: number; // Kriteria Ketercapaian Tujuan Pembelajaran, default 75
}

export interface CurriculumRegulation {
  id: string;
  nomor: string;
  tentang: string;
  instansi: string;
  tahun: number;
  status: 'Berlaku Resmi' | 'Penyempurnaan';
  url: string;
  keterangan: string;
}

export interface LearningObjective {
  id: string;
  subjectId: string;
  phase: Phase;
  grade: ClassLevel;
  code: string; // e.g. "TP-01"
  cpReference: string; // Capaian Pembelajaran
  objectiveText: string;
  topic: string;
  verified: boolean;
  sourceDoc: string;
}

export type QuestionType = 
  | 'pilihan_ganda' 
  | 'pg_kompleks' 
  | 'benar_salah' 
  | 'menjodohkan' 
  | 'isian_singkat' 
  | 'uraian';

export type CognitiveLevel = 'L1' | 'L2' | 'L3'; // L1=Pemahaman/C1-C2, L2=Aplikasi/C3, L3=Penalaran/HOTS/C4-C6
export type DifficultyLevel = 'Mudah' | 'Sedang' | 'Sukar';

export interface OptionItem {
  key: string; // "A", "B", "C", "D"
  text: string;
}

export interface MatchingPair {
  premise: string;
  response: string;
}

export interface QuestionBankItem {
  id: string;
  code: string;
  subjectId: string;
  subjectName: string;
  grade: ClassLevel;
  phase: Phase;
  topic: string;
  tpId?: string;
  tpText?: string;
  indicator: string;
  cognitiveLevel: CognitiveLevel;
  difficulty: DifficultyLevel;
  type: QuestionType;
  stimulus?: string; // Teks bacaan, tabel, infografis stimulus
  stem: string; // Pokok soal
  options?: OptionItem[]; // Untuk PG dan PG Kompleks
  matchingPairs?: MatchingPair[]; // Untuk menjodohkan
  correctBool?: boolean; // Untuk Benar/Salah
  answerKey: string; // Kunci jawaban ("A", "A,C", "Benar", teks isian, dll)
  explanation: string; // Pembahasan rasional
  scoringGuide: string; // Pedoman penskoran
  points: number; // Bobot nilai (e.g. PG=1, Uraian=5)
  status: 'draf_ai' | 'ditinjau' | 'disetujui';
  authorName: string;
  reviewerName?: string;
  createdAt: string;
  updatedAt: string;
  isAiGenerated?: boolean;
}

export type AssessmentType = 
  | 'Formatif' 
  | 'Sumatif Lingkup Materi' 
  | 'Sumatif Akhir Semester (SAS)' 
  | 'Asesmen Madrasah (AM)' 
  | 'Simulasi CBT';

export interface AssessmentPackage {
  id: string;
  code: string;
  title: string;
  assessmentType: AssessmentType;
  subjectId: string;
  subjectName: string;
  grade: ClassLevel;
  phase: Phase;
  semester: 'Ganjil' | 'Genap';
  academicYear: string;
  durationMinutes: number;
  passingGrade: number; // KKTP
  instructions: string;
  questions: QuestionBankItem[];
  status: 'draf' | 'disetujui' | 'siap_cbt' | 'selesai';
  authorName: string;
  reviewerName?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface ExamSession {
  id: string;
  packageId: string;
  packageTitle: string;
  subjectName: string;
  grade: ClassLevel;
  sessionName: string;
  token: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  durationMinutes: number;
  classTarget: string; // "Kelas 4A, 4B"
  roomName: string;
  proctorName: string;
  status: 'terjadwal' | 'aktif' | 'selesai';
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  allowReview: boolean;
  showScoreAfterExam: boolean;
}

export interface StudentAnswerRecord {
  questionId: string;
  answer: any; // string | string[] | Record<string, string>
  isFlagged: boolean; // Ragu-ragu
  isCorrect?: boolean;
  scoreAwarded?: number;
  maxScore: number;
  teacherFeedback?: string;
  isManuallyGraded?: boolean;
}

export interface ExamAttempt {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  studentNisn: string;
  className: string;
  startedAt: string;
  submittedAt?: string;
  status: 'mengerjakan' | 'selesai' | 'dinilai';
  remainingSeconds: number;
  answers: Record<string, StudentAnswerRecord>;
  objectiveScore: number;
  essayScore: number;
  totalScore: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  ipAddress: string;
  incidentsCount: number;
}

export interface ExamIncident {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  timestamp: string;
  note: string;
  proctorName: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userName: string;
  role: UserRole;
  action: string;
  module: string;
  details: string;
  status: 'sukses' | 'peringatan' | 'gagal';
}

export interface AssessmentDocumentSet {
  id: string;
  packageId: string;
  title: string;
  createdAt: string;
  version: number;
  components: {
    identity: boolean;
    cpAnalysis: boolean;
    learningObjectives: boolean;
    indicators: boolean;
    blueprint: boolean;
    questionCards: boolean;
    studentQuestionSheet: boolean;
    teacherQuestionSheet: boolean;
    answerKey: boolean;
    scoringGuide: boolean;
    rubric: boolean;
    studentAnswerSheet: boolean;
    executionGuide: boolean;
    resultAnalysis: boolean;
    remedialProgram: boolean;
    gradeRecap: boolean;
  };
}
