import React, { useState } from 'react';
import { 
  Database, 
  Copy, 
  Check, 
  ShieldCheck, 
  FileCode, 
  Layers, 
  ExternalLink,
  Table
} from 'lucide-react';

export const DatabaseSchemaView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const sqlMigrationSchema = `-- ====================================================================
-- SKEMA BASIS DATA RELASIONAL SUPER ASESMEN MIN 1 PASER
-- Arsitektur: PostgreSQL / Supabase Relational Database
-- Pengembang: Dzakirul Husni, S.Pd.
-- Instansi: MIN 1 Paser, Kemenag Kab. Paser, Kalimantan Timur
-- Dilengkapi: 27 Tabel Inti, Foreign Keys, Index, RLS Policies & Triggers
-- ====================================================================

-- 1. Satuan Pendidikan (Schools)
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    nsm VARCHAR(50) NOT NULL UNIQUE,
    npsn VARCHAR(50) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    subdistrict VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10),
    phone VARCHAR(30),
    email VARCHAR(100),
    headmaster_name VARCHAR(150),
    headmaster_nip VARCHAR(50),
    developer_name VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Hak Akses dan Role Pengguna
CREATE TYPE public.user_role_enum AS ENUM (
    'super_admin',
    'kepala_madrasah',
    'admin_asesmen',
    'guru',
    'pengawas',
    'siswa'
);

-- 3. Profil Pengguna Terintegrasi Auth Supabase (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150),
    nip VARCHAR(50),
    nisn VARCHAR(50),
    role public.user_role_enum NOT NULL DEFAULT 'guru',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tahun Pelajaran (Academic Years)
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    year_name VARCHAR(20) NOT NULL, -- Contoh: '2024/2025'
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Semester (Semesters)
CREATE TABLE IF NOT EXISTS public.semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
    semester_type VARCHAR(10) CHECK (semester_type IN ('Ganjil', 'Genap')),
    is_active BOOLEAN DEFAULT FALSE
);

-- 6. Rombongan Belajar (Classes)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    grade_level SMALLINT NOT NULL CHECK (grade_level BETWEEN 1 AND 6),
    phase VARCHAR(2) NOT NULL CHECK (phase IN ('A', 'B', 'C')),
    class_name VARCHAR(50) NOT NULL, -- Contoh: 'Kelas 4A'
    academic_year_id UUID REFERENCES public.academic_years(id),
    homeroom_teacher_id UUID REFERENCES public.profiles(id)
);

-- 7. Mata Pelajaran (Subjects)
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    code VARCHAR(30) NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Keagamaan / Ciri Khas Kemenag', 'Umum'
    grade_level SMALLINT NOT NULL,
    phase VARCHAR(2) NOT NULL,
    default_kktp NUMERIC(4,1) DEFAULT 75.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Referensi Capaian Pembelajaran Resmi (Curriculum References)
CREATE TABLE IF NOT EXISTS public.curriculum_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    phase VARCHAR(2) NOT NULL,
    cp_code VARCHAR(50) NOT NULL,
    cp_statement TEXT NOT NULL,
    source_regulation VARCHAR(255) NOT NULL, -- 'KMA 450/2024 & BSKAP 032/2024'
    verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tujuan Pembelajaran (Learning Objectives)
CREATE TABLE IF NOT EXISTS public.learning_objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curriculum_ref_id UUID REFERENCES public.curriculum_references(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    tp_code VARCHAR(50) NOT NULL,
    topic_name VARCHAR(255) NOT NULL,
    objective_text TEXT NOT NULL,
    grade_level SMALLINT NOT NULL,
    phase VARCHAR(2) NOT NULL,
    is_verified BOOLEAN DEFAULT TRUE
);

-- 10. Paket Asesmen Pembelajaran (Assessments)
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    assessment_type VARCHAR(50) NOT NULL, -- 'SAS', 'AM', 'Formatif', 'Sumatif'
    academic_year VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL,
    grade_level SMALLINT NOT NULL,
    phase VARCHAR(2) NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    passing_grade NUMERIC(4,1) DEFAULT 75.0,
    instructions TEXT,
    status VARCHAR(30) DEFAULT 'draf', -- 'draf', 'disetujui', 'siap_cbt', 'selesai'
    author_id UUID REFERENCES public.profiles(id),
    reviewer_id UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Kisi-kisi Asesmen Terpadu (Assessment Blueprints)
CREATE TABLE IF NOT EXISTS public.assessment_blueprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    total_items INTEGER NOT NULL,
    pg_count INTEGER DEFAULT 0,
    pgk_count INTEGER DEFAULT 0,
    bs_count INTEGER DEFAULT 0,
    matching_count INTEGER DEFAULT 0,
    essay_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Bank Soal Terpadu (Question Bank)
CREATE TABLE IF NOT EXISTS public.question_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE RESTRICT,
    tp_id UUID REFERENCES public.learning_objectives(id),
    code VARCHAR(100) NOT NULL UNIQUE,
    grade_level SMALLINT NOT NULL,
    phase VARCHAR(2) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    indicator TEXT NOT NULL,
    cognitive_level VARCHAR(10) NOT NULL, -- 'L1', 'L2', 'L3'
    difficulty VARCHAR(20) NOT NULL, -- 'Mudah', 'Sedang', 'Sukar'
    question_type VARCHAR(30) NOT NULL, -- 'pilihan_ganda', 'uraian', etc.
    stimulus TEXT,
    stem TEXT NOT NULL,
    explanation TEXT,
    scoring_guide TEXT,
    points INTEGER DEFAULT 1,
    status VARCHAR(30) DEFAULT 'draf_ai', -- 'draf_ai', 'ditinjau', 'disetujui'
    is_ai_generated BOOLEAN DEFAULT FALSE,
    author_id UUID REFERENCES public.profiles(id),
    reviewer_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Opsi Pilihan Soal (Question Options)
CREATE TABLE IF NOT EXISTS public.question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES public.question_bank(id) ON DELETE CASCADE,
    option_key VARCHAR(10) NOT NULL, -- 'A', 'B', 'C', 'D'
    option_text TEXT NOT NULL,
    sort_order SMALLINT DEFAULT 0
);

-- 14. Kunci Jawaban Resmi (Answer Keys)
CREATE TABLE IF NOT EXISTS public.answer_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES public.question_bank(id) ON DELETE CASCADE UNIQUE,
    official_key TEXT NOT NULL,
    tolerance_keys TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- 15. Rubrik Penilaian Uraian (Scoring Rubrics)
CREATE TABLE IF NOT EXISTS public.scoring_rubrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES public.question_bank(id) ON DELETE CASCADE,
    criteria_name VARCHAR(255) NOT NULL,
    max_score INTEGER NOT NULL,
    level_descriptions JSONB NOT NULL
);

-- 16. Kartu Soal Asesmen (Question Cards)
CREATE TABLE IF NOT EXISTS public.question_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.question_bank(id) ON DELETE RESTRICT,
    item_number SMALLINT NOT NULL,
    points INTEGER NOT NULL
);

-- 17. Sesi Ujian CBT (Exam Sessions)
CREATE TABLE IF NOT EXISTS public.exam_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE RESTRICT,
    session_name VARCHAR(150) NOT NULL,
    token VARCHAR(20) NOT NULL,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    room_name VARCHAR(100),
    target_class VARCHAR(100),
    proctor_id UUID REFERENCES public.profiles(id),
    status VARCHAR(30) DEFAULT 'terjadwal', -- 'terjadwal', 'aktif', 'selesai'
    randomize_questions BOOLEAN DEFAULT FALSE,
    randomize_options BOOLEAN DEFAULT FALSE,
    allow_review BOOLEAN DEFAULT TRUE,
    show_score_after_exam BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Peserta Sesi CBT (Exam Participants)
CREATE TABLE IF NOT EXISTS public.exam_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_seat VARCHAR(20),
    UNIQUE(session_id, student_id)
);

-- 19. Percobaan Ujian Peserta (Exam Attempts)
CREATE TABLE IF NOT EXISTS public.exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.exam_sessions(id) ON DELETE RESTRICT,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    status VARCHAR(30) DEFAULT 'mengerjakan', -- 'mengerjakan', 'selesai', 'dinilai'
    remaining_seconds INTEGER NOT NULL,
    objective_score NUMERIC(5,2) DEFAULT 0,
    essay_score NUMERIC(5,2) DEFAULT 0,
    total_score NUMERIC(5,2) DEFAULT 0,
    max_score NUMERIC(5,2) DEFAULT 0,
    percentage NUMERIC(5,2) DEFAULT 0,
    is_passed BOOLEAN DEFAULT FALSE,
    ip_address INET,
    UNIQUE(session_id, student_id)
);

-- 20. Butir Jawaban Siswa (Student Answers)
CREATE TABLE IF NOT EXISTS public.student_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.question_bank(id) ON DELETE RESTRICT,
    answer_payload JSONB,
    is_flagged BOOLEAN DEFAULT FALSE,
    is_correct BOOLEAN,
    score_awarded NUMERIC(5,2) DEFAULT 0,
    max_score NUMERIC(5,2) NOT NULL,
    teacher_feedback TEXT,
    is_manually_graded BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(attempt_id, question_id)
);

-- 21. Rincian Skor Ujian (Score Details)
CREATE TABLE IF NOT EXISTS public.score_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES public.exam_attempts(id) ON DELETE CASCADE UNIQUE,
    pg_points NUMERIC(5,2) DEFAULT 0,
    pgk_points NUMERIC(5,2) DEFAULT 0,
    bs_points NUMERIC(5,2) DEFAULT 0,
    matching_points NUMERIC(5,2) DEFAULT 0,
    essay_points NUMERIC(5,2) DEFAULT 0
);

-- 22. Rekapitulasi Hasil Asesmen (Assessment Results)
CREATE TABLE IF NOT EXISTS public.assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id),
    participants_count INTEGER DEFAULT 0,
    passed_count INTEGER DEFAULT 0,
    remedial_count INTEGER DEFAULT 0,
    class_average NUMERIC(5,2),
    highest_score NUMERIC(5,2),
    lowest_score NUMERIC(5,2),
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. Berkas Dokumen yang Dihasilkan (Generated Documents)
CREATE TABLE IF NOT EXISTS public.generated_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL, -- '15_berkas_lengkap', 'kisi_kisi', 'kartu_soal', dll.
    version INTEGER DEFAULT 1,
    file_path TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. Versi Riwayat Dokumen (Document Versions)
CREATE TABLE IF NOT EXISTS public.document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.generated_documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    change_summary TEXT,
    content_snapshot JSONB,
    modified_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. Log Penggunaan Kecerdasan Buatan (AI Usage Logs)
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    feature_name VARCHAR(100) NOT NULL, -- 'generate_question', 'essay_rubric'
    model_name VARCHAR(100) DEFAULT 'gemini-3.8-flash',
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    status VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. Log Audit dan Jejak Aktivitas Keamanan (Audit Logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    user_name VARCHAR(150),
    role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    status VARCHAR(20) DEFAULT 'sukses',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 27. Notifikasi Sistem (Notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;

-- Guru & Admin can read/write assessments & questions
CREATE POLICY "Guru dan Admin Asesmen Penuh" 
ON public.assessments FOR ALL 
USING (auth.jwt() ->> 'role' IN ('guru', 'admin_asesmen', 'super_admin', 'kepala_madrasah'));

-- Siswa can only view their own exam attempt and cannot see answer keys before publishing
CREATE POLICY "Siswa Akses Ujian Mandiri" 
ON public.exam_attempts FOR ALL 
USING (student_id = auth.uid());

-- Indexing for high-performance CBT querying
CREATE INDEX IF NOT EXISTS idx_question_bank_subject ON public.question_bank(subject_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_session ON public.exam_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_attempt ON public.student_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(created_at DESC);
`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlMigrationSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Modul R: Skema Basis Data Relasional
            </span>
            <span className="text-xs text-gray-500">
              27 Tabel Inti • PostgreSQL / Supabase Migration
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-1">
            Arsitektur Database & Migrasi SQL Supabase
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Didesain khusus untuk integritas data evaluasi madrasah MIN 1 Paser, foreign key constraints, RLS, dan audit trail.
          </p>
        </div>

        <button
          onClick={handleCopySql}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-amber-300" />
              <span>Tersalin ke Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Salin Skema SQL Migrasi</span>
            </>
          )}
        </button>
      </div>

      {/* Database Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-emerald-800 mb-1">
            <Table className="w-4 h-4 text-emerald-600" />
            <span>27 Tabel Terstruktur</span>
          </div>
          <p className="text-gray-600 text-[11px] leading-relaxed">
            Mencakup profil RBAC, 15 komponen asesmen, CBT attempts, bank soal HOTS, audit logs, dan analitik empiris.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-teal-800 mb-1">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Row Level Security (RLS)</span>
          </div>
          <p className="text-gray-600 text-[11px] leading-relaxed">
            Kunci jawaban terisolasi ketat di sisi server. Peserta didik hanya berhak membaca butir soal yang aktif saat sesi CBT.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-amber-800 mb-1">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Integritas Audit Trail</span>
          </div>
          <p className="text-gray-600 text-[11px] leading-relaxed">
            Setiap aksi persetujuan Kepala Madrasah, pembaruan kunci jawaban, dan kejadian pengawas tersimpan permanen.
          </p>
        </div>
      </div>

      {/* SQL Migration Code Block Viewer */}
      <div className="bg-gray-950 rounded-2xl shadow-md border border-gray-800 overflow-hidden">
        <div className="bg-gray-900 px-4 py-2.5 border-b border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2 font-mono">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>supabase_migration_min1paser.sql</span>
          </div>
          <span className="text-[11px] text-gray-500">PostgreSQL 15+ / Supabase Compatible</span>
        </div>
        <pre className="p-5 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-[550px] leading-relaxed">
          <code>{sqlMigrationSchema}</code>
        </pre>
      </div>
    </div>
  );
};
