import {
  School,
  UserProfile,
  AcademicYear,
  Subject,
  LearningObjective,
  CurriculumRegulation,
  QuestionBankItem,
  AssessmentPackage,
  ExamSession,
  ExamAttempt,
  ExamIncident,
  AuditLogItem,
  UserRole
} from '../types';

export const INITIAL_REGULATIONS: CurriculumRegulation[] = [
  {
    id: 'reg-kma-1503-2025',
    nomor: 'KMA Nomor 1503 Tahun 2025',
    tentang: 'Kurikulum pada Raudhatul Athfal dan Madrasah (MI, MTs, MA, dan MAK)',
    instansi: 'Kementerian Agama Republik Indonesia',
    tahun: 2025,
    status: 'Berlaku Resmi',
    url: 'https://www.ayomadrasah.id/2025/11/kma-1503-tahun-2025-kurikulum-ra-madrasah.html',
    keterangan: 'Penyempurnaan pedoman implementasi kurikulum madrasah nasional terbaru, memuat struktur kurikulum MI, prinsip asesmen autentik, dan penguatan Profil Pelajar Pancasila & Rahmatan Lil Alamin (P5-PPRA).',
  },
  {
    id: 'reg-kma-450-2024',
    nomor: 'KMA Nomor 450 Tahun 2024',
    tentang: 'Pedoman Implementasi Kurikulum pada Madrasah',
    instansi: 'Kementerian Agama Republik Indonesia',
    tahun: 2024,
    status: 'Penyempurnaan',
    url: 'https://kemenag.go.id',
    keterangan: 'Pedoman kurikulum merdeka pada jenjang RA, MI, MTs, dan MA dalam kerangka moderasi beragama dan penguatan literasi-numerasi.',
  },
  {
    id: 'reg-bskap-032-2024',
    nomor: 'Keputusan BSKAP No. 032/H/KR/2024',
    tentang: 'Capaian Pembelajaran pada PAUD, Jenjang Pendidikan Dasar, dan Menengah',
    instansi: 'Badan Standar, Kurikulum, dan Asesmen Pendidikan Kemendikbudristek',
    tahun: 2024,
    status: 'Berlaku Resmi',
    url: 'https://kurikulum.kemdikbud.go.id',
    keterangan: 'Rujukan nasional capaian pembelajaran (CP) fase A, B, dan C untuk jenjang Sekolah Dasar / Madrasah Ibtidaiyah.',
  },
];

export const INITIAL_SCHOOL: School = {
  id: 'sch-min1paser',
  name: 'MIN 1 Paser',
  nsm: '111164020001',
  npsn: '60728912',
  address: 'Jl. Kusuma Bangsa Km. 2, Tepian Batang, Tanah Grogot',
  subdistrict: 'Tanah Grogot',
  district: 'Kabupaten Paser',
  province: 'Kalimantan Timur',
  postalCode: '76251',
  phone: '(0543) 21105',
  email: 'min1paser@kemenag.go.id',
  headmasterName: 'Dra. Hj. Siti Romlah, M.Pd.',
  headmasterNip: '197003121996032001',
  developerName: 'Dzakirul Husni, S.Pd.',
};

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-dev',
    name: 'Dzakirul Husni, S.Pd.',
    username: 'dzakirul',
    nip: '199208152019031008',
    role: 'super_admin',
    email: 'dzakirul2025@gmail.com',
    schoolId: 'sch-min1paser',
    subjectNames: ['IPAS', 'Fikih', 'Al-Qur\'an Hadis'],
  },
  {
    id: 'usr-kepala',
    name: 'Dra. Hj. Siti Romlah, M.Pd.',
    username: 'kamad',
    nip: '197003121996032001',
    role: 'kepala_madrasah',
    email: 'kamad.min1paser@gmail.com',
    schoolId: 'sch-min1paser',
  },
  {
    id: 'usr-admin-cbt',
    name: 'Ahmad Fauzi, S.Kom.',
    username: 'admincbt',
    nip: '198805212015021004',
    role: 'admin_asesmen',
    email: 'cbt.min1paser@gmail.com',
    schoolId: 'sch-min1paser',
  },
  {
    id: 'usr-guru-1',
    name: 'Nurul Hidayati, S.Pd.I.',
    username: 'nurul',
    nip: '198511042010012020',
    role: 'guru',
    email: 'nurul.min1paser@gmail.com',
    schoolId: 'sch-min1paser',
    subjectNames: ['Akidah Akhlak', 'Fikih'],
  },
  {
    id: 'usr-pengawas',
    name: 'Muhammad Ridwan, S.Pd.',
    username: 'ridwan',
    nip: '199002142018011003',
    role: 'pengawas',
    email: 'pengawas.cbt@min1paser.sch.id',
    schoolId: 'sch-min1paser',
  },
  {
    id: 'usr-siswa-1',
    name: 'Muhammad Al-Fatih Pratama',
    username: '0012345678',
    nisn: '0012345678',
    role: 'siswa',
    email: 'alfatih.siswa@min1paser.sch.id',
    schoolId: 'sch-min1paser',
    classId: '4A',
  },
  {
    id: 'usr-siswa-2',
    name: 'Aisyah Putri Azzahra',
    username: '0012345679',
    nisn: '0012345679',
    role: 'siswa',
    email: 'aisyah.siswa@min1paser.sch.id',
    schoolId: 'sch-min1paser',
    classId: '4A',
  },
];

export const INITIAL_ACADEMIC_YEARS: AcademicYear[] = [
  { id: 'ay-2024-genap', name: '2024/2025', semester: 'Genap', isCurrent: true },
  { id: 'ay-2024-ganjil', name: '2024/2025', semester: 'Ganjil', isCurrent: false },
];

export const INITIAL_SUBJECTS: Subject[] = [
  // Ciri Khas Kemenag
  { id: 'sbj-qurhad', code: 'QH-04', name: 'Al-Qur\'an Hadis', category: 'Keagamaan / Ciri Khas Kemenag', grade: 4, phase: 'B', kktp: 75 },
  { id: 'sbj-akidah', code: 'AA-04', name: 'Akidah Akhlak', category: 'Keagamaan / Ciri Khas Kemenag', grade: 4, phase: 'B', kktp: 75 },
  { id: 'sbj-fikih', code: 'FK-04', name: 'Fikih', category: 'Keagamaan / Ciri Khas Kemenag', grade: 4, phase: 'B', kktp: 75 },
  { id: 'sbj-ski', code: 'SK-04', name: 'Sejarah Kebudayaan Islam (SKI)', category: 'Keagamaan / Ciri Khas Kemenag', grade: 4, phase: 'B', kktp: 75 },
  { id: 'sbj-barab', code: 'BA-04', name: 'Bahasa Arab', category: 'Keagamaan / Ciri Khas Kemenag', grade: 4, phase: 'B', kktp: 72 },
  // Umum
  { id: 'sbj-ipas', code: 'IPAS-04', name: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)', category: 'Umum', grade: 4, phase: 'B', kktp: 75 },
  { id: 'sbj-mat', code: 'MAT-04', name: 'Matematika', category: 'Umum', grade: 4, phase: 'B', kktp: 70 },
  { id: 'sbj-bind', code: 'BIND-04', name: 'Bahasa Indonesia', category: 'Umum', grade: 4, phase: 'B', kktp: 75 },
  { id: 'sbj-ppkn', code: 'PPKN-04', name: 'Pendidikan Pancasila', category: 'Umum', grade: 4, phase: 'B', kktp: 75 },
];

export const INITIAL_LEARNING_OBJECTIVES: LearningObjective[] = [
  {
    id: 'tp-ipas-01',
    subjectId: 'sbj-ipas',
    phase: 'B',
    grade: 4,
    code: 'TP.IPAS.4.1',
    cpReference: 'Peserta didik mengidentifikasi bagian tubuh tumbuhan dan mendeskripsikan fungsinya.',
    objectiveText: 'Mengidentifikasi struktur dan fungsi daun, batang, dan akar tumbuhan dalam proses fotosintesis.',
    topic: 'Tumbuhan, Sumber Kehidupan di Bumi',
    verified: true,
    sourceDoc: 'KMA No. 1503 Tahun 2025, KMA 450 Tahun 2024 & BSKAP 032/H/KR/2024',
  },
  {
    id: 'tp-ipas-02',
    subjectId: 'sbj-ipas',
    phase: 'B',
    grade: 4,
    code: 'TP.IPAS.4.2',
    cpReference: 'Peserta didik menganalisis wujud zat dan perubahannya dalam kehidupan sehari-hari.',
    objectiveText: 'Menganalisis siklus perubahan wujud zat mencair, membeku, menguap, dan mengembun melalui percobaan sederhana.',
    topic: 'Wujud Zat dan Perubahannya',
    verified: true,
    sourceDoc: 'KMA No. 1503 Tahun 2025 & Keputusan BSKAP No. 032/H/KR/2024',
  },
  {
    id: 'tp-fikih-01',
    subjectId: 'sbj-fikih',
    phase: 'B',
    grade: 4,
    code: 'TP.FK.4.1',
    cpReference: 'Peserta didik memahami konsep khitan, tanda baligh, dan konsekuensi syar\'i bagi anak muslim.',
    objectiveText: 'Menjelaskan tanda-tanda baligh menurut ilmu fikih dan biologi serta kewajiban menjalankan ibadah syar\'i.',
    topic: 'Tanda-tanda Baligh dan Kewajiban Ibadah',
    verified: true,
    sourceDoc: 'KMA No. 1503 Tahun 2025, KMA 450 Tahun 2024 dan KMA 183 Tahun 2019',
  },
];

export const INITIAL_QUESTIONS: QuestionBankItem[] = [
  {
    id: 'q-ipas-001',
    code: 'Q-IPAS-04-01',
    subjectId: 'sbj-ipas',
    subjectName: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    grade: 4,
    phase: 'B',
    topic: 'Tumbuhan, Sumber Kehidupan di Bumi',
    tpId: 'tp-ipas-01',
    tpText: 'Mengidentifikasi struktur dan fungsi daun dalam fotosintesis',
    indicator: 'Disajikan narasi percobaan fotosintesis, peserta didik dapat menentukan gas yang dihasilkan dengan tepat.',
    cognitiveLevel: 'L2',
    difficulty: 'Sedang',
    type: 'pilihan_ganda',
    stimulus: 'Siswa kelas 4 MIN 1 Paser melakukan pengamatan tumbuhan air Hydrilla di bawah sinar matahari langsung dalam corong kaca. Setelah 15 menit, muncul gelembung-gelembung udara kecil yang terkumpul di ujung tabung reaksi.',
    stem: 'Berdasarkan percobaan tersebut, gelembung udara yang dihasilkan membuktikan bahwa fotosintesis melepaskan gas ...',
    options: [
      { key: 'A', text: 'Karbondioksida (CO₂)' },
      { key: 'B', text: 'Oksigen (O₂)' },
      { key: 'C', text: 'Nitrogen (N₂)' },
      { key: 'D', text: 'Hidrogen (H₂)' },
    ],
    answerKey: 'B',
    explanation: 'Pada fotosintesis, tumbuhan hijau memanfaatkan cahaya matahari, air, dan karbondioksida untuk menghasilkan glukosa dan melepaskan gas oksigen (O₂). Gelembung udara pada tanaman Hydrilla membuktikan pelepasan oksigen.',
    scoringGuide: 'Jawaban benar mendapat poin 1, salah mendapat poin 0.',
    points: 1,
    status: 'disetujui',
    authorName: 'Dzakirul Husni, S.Pd.',
    reviewerName: 'Dra. Hj. Siti Romlah, M.Pd.',
    createdAt: '2026-03-10T08:00:00Z',
    updatedAt: '2026-03-10T08:00:00Z',
  },
  {
    id: 'q-ipas-002',
    code: 'Q-IPAS-04-02',
    subjectId: 'sbj-ipas',
    subjectName: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    grade: 4,
    phase: 'B',
    topic: 'Tumbuhan, Sumber Kehidupan di Bumi',
    tpId: 'tp-ipas-01',
    tpText: 'Mengidentifikasi zat yang dibutuhkan tumbuhan untuk fotosintesis',
    indicator: 'Peserta didik dapat memilih lebih dari satu komponen utama yang dibutuhkan tumbuhan untuk melakukan fotosintesis.',
    cognitiveLevel: 'L2',
    difficulty: 'Sedang',
    type: 'pg_kompleks',
    stimulus: 'Tumbuhan hijau bertindak sebagai produsen di lingkungan madrasah karena mampu memasak makanannya sendiri melalui klorofil.',
    stem: 'Manakah dari komponen berikut yang dibutuhkan tumbuhan hijau dalam proses fotosintesis? (Pilih semua yang benar)',
    options: [
      { key: 'A', text: 'Karbondioksida dari udara' },
      { key: 'B', text: 'Air yang diserap melalui akar' },
      { key: 'C', text: 'Cahaya matahari yang ditangkap klorofil' },
      { key: 'D', text: 'Pupuk kimia buatan secara berlebihan' },
    ],
    answerKey: 'A,B,C',
    explanation: 'Komponen esensial fotosintesis adalah air (H₂O), karbondioksida (CO₂), dan energi sinar matahari dengan bantuan klorofil.',
    scoringGuide: 'Memilih ketiga opsi tepat (A, B, C) mendapat skor 2. Menjawab 2 opsi tepat mendapat 1. Salah satu opsi salah mendapat 0.',
    points: 2,
    status: 'disetujui',
    authorName: 'Dzakirul Husni, S.Pd.',
    reviewerName: 'Dra. Hj. Siti Romlah, M.Pd.',
    createdAt: '2026-03-10T08:30:00Z',
    updatedAt: '2026-03-10T08:30:00Z',
  },
  {
    id: 'q-ipas-003',
    code: 'Q-IPAS-04-03',
    subjectId: 'sbj-ipas',
    subjectName: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    grade: 4,
    phase: 'B',
    topic: 'Wujud Zat dan Perubahannya',
    tpId: 'tp-ipas-02',
    tpText: 'Menganalisis siklus perubahan wujud zat dalam kehidupan sehari-hari',
    indicator: 'Disajikan pernyataan peristiwa mencair dan membeku, peserta didik dapat menentukan kebenaran pernyataan tersebut.',
    cognitiveLevel: 'L1',
    difficulty: 'Mudah',
    type: 'benar_salah',
    stem: 'Ketika es batu diletakkan di piring terbuka di terik matahari Tanah Grogot, peristiwa es berubah menjadi air disebut proses menyublim.',
    correctBool: false,
    answerKey: 'Salah',
    explanation: 'Perubahan wujud dari padat menjadi cair disebut mencair (melebur). Sedangkan menyublim adalah perubahan dari padat langsung menjadi gas.',
    scoringGuide: 'Skor 1 jika memilih Salah, skor 0 jika memilih Benar.',
    points: 1,
    status: 'disetujui',
    authorName: 'Dzakirul Husni, S.Pd.',
    createdAt: '2026-03-11T09:00:00Z',
    updatedAt: '2026-03-11T09:00:00Z',
  },
  {
    id: 'q-ipas-004',
    code: 'Q-IPAS-04-04',
    subjectId: 'sbj-ipas',
    subjectName: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    grade: 4,
    phase: 'B',
    topic: 'Wujud Zat dan Perubahannya',
    tpId: 'tp-ipas-02',
    tpText: 'Menjodohkan peristiwa perubahan wujud dengan istilah ilmiahnya',
    indicator: 'Peserta didik dapat menjodohkan contoh peristiwa fisika dengan nama perubahan wujud zat yang sesuai.',
    cognitiveLevel: 'L2',
    difficulty: 'Sedang',
    type: 'menjodohkan',
    stem: 'Jodohkanlah peristiwa sehari-hari berikut dengan istilah perubahan wujud zat yang tepat!',
    matchingPairs: [
      { premise: 'Titik-titik air di luar gelas berisi es', response: 'Mengembun' },
      { premise: 'Kapur barus di dalam lemari yang makin mengecil', response: 'Menyublim' },
      { premise: 'Mentega yang dipanaskan di atas wajan', response: 'Mencair' },
      { premise: 'Air dimasukkan ke dalam freezer kulkas', response: 'Membeku' },
    ],
    answerKey: '1-Mengembun; 2-Menyublim; 3-Mencair; 4-Membeku',
    explanation: 'Kondensasi/mengembun terjadi ketika uap gas melepaskan kalor. Sublimasi zat padat menjadi gas. Mencair padat jadi cair. Membeku cair jadi padat.',
    scoringGuide: 'Setiap pasangan tepat bernilai 1 poin (Maksimal 4 poin).',
    points: 4,
    status: 'disetujui',
    authorName: 'Dzakirul Husni, S.Pd.',
    createdAt: '2026-03-11T10:00:00Z',
    updatedAt: '2026-03-11T10:00:00Z',
  },
  {
    id: 'q-ipas-005',
    code: 'Q-IPAS-04-05',
    subjectId: 'sbj-ipas',
    subjectName: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    grade: 4,
    phase: 'B',
    topic: 'Tumbuhan, Sumber Kehidupan di Bumi',
    tpId: 'tp-ipas-01',
    tpText: 'Menjelaskan fungsi klorofil pada daun',
    indicator: 'Peserta didik dapat melengkapi kalimat rumpang mengenai zat hijau daun.',
    cognitiveLevel: 'L1',
    difficulty: 'Mudah',
    type: 'isian_singkat',
    stem: 'Zat hijau daun pada tumbuhan yang berfungsi untuk menyerap energi cahaya matahari disebut ...',
    answerKey: 'klorofil',
    explanation: 'Klorofil merupakan pigmen hijau yang terdapat di kloroplas dan bertindak menangkap energi foton matahari.',
    scoringGuide: 'Skor 1 untuk jawaban tepat "klorofil" atau "zat klorofil".',
    points: 1,
    status: 'disetujui',
    authorName: 'Dzakirul Husni, S.Pd.',
    createdAt: '2026-03-12T07:30:00Z',
    updatedAt: '2026-03-12T07:30:00Z',
  },
  {
    id: 'q-ipas-006',
    code: 'Q-IPAS-04-06',
    subjectId: 'sbj-ipas',
    subjectName: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    grade: 4,
    phase: 'B',
    topic: 'Tumbuhan, Sumber Kehidupan di Bumi',
    tpId: 'tp-ipas-01',
    tpText: 'Menganalisis dampak ketiadaan tumbuhan hijau bagi kehidupan di bumi',
    indicator: 'Disajikan studi kasus kepunahan hutan, peserta didik dapat menguraikan dampak rantai makanan dan ketersediaan oksigen secara komprehensif.',
    cognitiveLevel: 'L3',
    difficulty: 'Sukar',
    type: 'uraian',
    stimulus: 'Hutan di sekitar wilayah Paser Kalimantan Timur memiliki keanekaragaman flora yang melimpah. Hutan menjadi paru-paru bumi sekaligus penghasil makanan bagi berbagai satwa dan manusia.',
    stem: 'Jelaskan apa yang akan terjadi terhadap kelangsungan hidup manusia dan hewan jika semua tumbuhan hijau di muka bumi ini musnah! Uraikan minimal 2 alasan logis dari aspek pernapasan dan rantai makanan.',
    answerKey: 'Jawaban harus memuat: (1) Aspek pernapasan: manusia dan hewan akan kekurangan oksigen (O₂) untuk bernapas karena tidak ada tumbuhan yang berfotosintesis. (2) Aspek rantai makanan: hewan herbivora akan mati kelaparan, disusul kepunahan karnivora dan manusia karena produsen utama hilang.',
    explanation: 'Tumbuhan merupakan produsen primer rantai makanan dan penghasil utama O₂ di atmosfer bumi.',
    scoringGuide: 'Skor 5: Menjelaskan aspek O₂ dan rantai makanan secara runtut dan tepat. Skor 3-4: Menjelaskan 1 aspek lengkap atau 2 aspek secara umum. Skor 1-2: Menjawab sebagian kecil tanpa elaborasi logis.',
    points: 5,
    status: 'disetujui',
    authorName: 'Dzakirul Husni, S.Pd.',
    reviewerName: 'Dra. Hj. Siti Romlah, M.Pd.',
    createdAt: '2026-03-12T08:00:00Z',
    updatedAt: '2026-03-12T08:00:00Z',
  },
  {
    id: 'q-fikih-001',
    code: 'Q-FK-04-01',
    subjectId: 'sbj-fikih',
    subjectName: 'Fikih',
    grade: 4,
    phase: 'B',
    topic: 'Tanda-tanda Baligh dan Kewajiban Ibadah',
    tpId: 'tp-fikih-01',
    tpText: 'Menjelaskan tanda baligh dan hukum ibadah',
    indicator: 'Disajikan narasi usia anak madrasah, peserta didik dapat menentukan status mukalaf secara syar\'i.',
    cognitiveLevel: 'L2',
    difficulty: 'Sedang',
    type: 'pilihan_ganda',
    stem: 'Seorang anak muslim yang telah mencapai usia baligh mulai dibebani kewajiban syariat seperti salat lima waktu dan puasa Ramadan. Dalam ilmu fikih, anak tersebut disebut ...',
    options: [
      { key: 'A', text: 'Muallaf' },
      { key: 'B', text: 'Mukallaf' },
      { key: 'C', text: 'Munafik' },
      { key: 'D', text: 'Musafir' },
    ],
    answerKey: 'B',
    explanation: 'Mukallaf adalah orang yang sudah baligh dan berakal sehingga wajib mematuhi seluruh hukum syariat Islam.',
    scoringGuide: 'Skor 1 untuk jawaban B, skor 0 untuk opsi lain.',
    points: 1,
    status: 'disetujui',
    authorName: 'Nurul Hidayati, S.Pd.I.',
    createdAt: '2026-03-12T09:00:00Z',
    updatedAt: '2026-03-12T09:00:00Z',
  },
];

export const INITIAL_PACKAGES: AssessmentPackage[] = [
  {
    id: 'pkg-sas-ipas-4',
    code: 'SAS-IPAS-4-2025',
    title: 'Sumatif Akhir Semester (SAS) IPAS Kelas 4 Fase B',
    assessmentType: 'Sumatif Akhir Semester (SAS)',
    subjectId: 'sbj-ipas',
    subjectName: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    grade: 4,
    phase: 'B',
    semester: 'Genap',
    academicYear: '2024/2025',
    durationMinutes: 60,
    passingGrade: 75,
    instructions: '1. Berdoalah sebelum mengerjakan soal.\n2. Periksa kembali jawaban Anda sebelum mengirim ujian.\n3. Kerjakan dengan jujur dan penuh ketelitian.',
    questions: INITIAL_QUESTIONS.filter(q => q.subjectId === 'sbj-ipas'),
    status: 'siap_cbt',
    authorName: 'Dzakirul Husni, S.Pd.',
    reviewerName: 'Dra. Hj. Siti Romlah, M.Pd.',
    createdAt: '2026-03-12T10:00:00Z',
    approvedAt: '2026-03-12T11:00:00Z',
  },
];

export const INITIAL_SESSIONS: ExamSession[] = [
  {
    id: 'ses-ipas-01',
    packageId: 'pkg-sas-ipas-4',
    packageTitle: 'Sumatif Akhir Semester (SAS) IPAS Kelas 4 Fase B',
    subjectName: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    grade: 4,
    sessionName: 'Sesi 1 - CBT SAS IPAS Kelas 4A',
    token: 'MIN1PASER',
    date: '2026-03-15',
    startTime: '08:00',
    endTime: '09:00',
    durationMinutes: 60,
    classTarget: 'Kelas 4A',
    roomName: 'Laboratorium Komputer MIN 1 Paser',
    proctorName: 'Muhammad Ridwan, S.Pd.',
    status: 'aktif',
    randomizeQuestions: false,
    randomizeOptions: false,
    allowReview: true,
    showScoreAfterExam: true,
  },
];

export const INITIAL_ATTEMPTS: ExamAttempt[] = [
  {
    id: 'att-siswa-1',
    sessionId: 'ses-ipas-01',
    studentId: 'usr-siswa-1',
    studentName: 'Muhammad Al-Fatih Pratama',
    studentNisn: '0012345678',
    className: 'Kelas 4A',
    startedAt: '2026-03-15T08:02:10Z',
    submittedAt: '2026-03-15T08:42:15Z',
    status: 'dinilai',
    remainingSeconds: 1065,
    answers: {
      'q-ipas-001': { questionId: 'q-ipas-001', answer: 'B', isFlagged: false, isCorrect: true, scoreAwarded: 1, maxScore: 1 },
      'q-ipas-002': { questionId: 'q-ipas-002', answer: ['A', 'B', 'C'], isFlagged: false, isCorrect: true, scoreAwarded: 2, maxScore: 2 },
      'q-ipas-003': { questionId: 'q-ipas-003', answer: false, isFlagged: false, isCorrect: true, scoreAwarded: 1, maxScore: 1 },
      'q-ipas-004': { questionId: 'q-ipas-004', answer: { 'Titik-titik air di luar gelas berisi es': 'Mengembun', 'Kapur barus di dalam lemari yang makin mengecil': 'Menyublim', 'Mentega yang dipanaskan di atas wajan': 'Mencair', 'Air dimasukkan ke dalam freezer kulkas': 'Membeku' }, isFlagged: false, isCorrect: true, scoreAwarded: 4, maxScore: 4 },
      'q-ipas-005': { questionId: 'q-ipas-005', answer: 'klorofil', isFlagged: false, isCorrect: true, scoreAwarded: 1, maxScore: 1 },
      'q-ipas-006': { questionId: 'q-ipas-006', answer: 'Jika semua tumbuhan musnah, tidak ada lagi fotosintesis sehingga bumi kehabisan oksigen dan makhluk hidup tidak bisa bernapas. Selain itu hewan pemakan tumbuhan akan mati dan rantai makanan terputus.', isFlagged: false, isCorrect: true, scoreAwarded: 5, maxScore: 5, isManuallyGraded: true, teacherFeedback: 'Jawaban sangat komprehensif, mencakup aspek respirasi dan ekosistem rantai makanan secara tepat.' },
    },
    objectiveScore: 9,
    essayScore: 5,
    totalScore: 14,
    maxScore: 14,
    percentage: 100,
    isPassed: true,
    ipAddress: '192.168.1.104',
    incidentsCount: 0,
  },
  {
    id: 'att-siswa-2',
    sessionId: 'ses-ipas-01',
    studentId: 'usr-siswa-2',
    studentName: 'Aisyah Putri Azzahra',
    studentNisn: '0012345679',
    className: 'Kelas 4A',
    startedAt: '2026-03-15T08:03:00Z',
    submittedAt: '2026-03-15T08:50:00Z',
    status: 'dinilai',
    remainingSeconds: 600,
    answers: {
      'q-ipas-001': { questionId: 'q-ipas-001', answer: 'B', isFlagged: false, isCorrect: true, scoreAwarded: 1, maxScore: 1 },
      'q-ipas-002': { questionId: 'q-ipas-002', answer: ['A', 'B'], isFlagged: false, isCorrect: false, scoreAwarded: 1, maxScore: 2 },
      'q-ipas-003': { questionId: 'q-ipas-003', answer: false, isFlagged: false, isCorrect: true, scoreAwarded: 1, maxScore: 1 },
      'q-ipas-004': { questionId: 'q-ipas-004', answer: { 'Titik-titik air di luar gelas berisi es': 'Mengembun', 'Kapur barus di dalam lemari yang makin mengecil': 'Menyublim', 'Mentega yang dipanaskan di atas wajan': 'Mencair', 'Air dimasukkan ke dalam freezer kulkas': 'Membeku' }, isFlagged: false, isCorrect: true, scoreAwarded: 4, maxScore: 4 },
      'q-ipas-005': { questionId: 'q-ipas-005', answer: 'klorofil', isFlagged: false, isCorrect: true, scoreAwarded: 1, maxScore: 1 },
      'q-ipas-006': { questionId: 'q-ipas-006', answer: 'Manusia dan hewan akan kekurangan oksigen.', isFlagged: false, isCorrect: false, scoreAwarded: 2, maxScore: 5, isManuallyGraded: true, teacherFeedback: 'Sudah menyebutkan aspek oksigen, namun aspek rantai makanan belum diuraikan.' },
    },
    objectiveScore: 8,
    essayScore: 2,
    totalScore: 10,
    maxScore: 14,
    percentage: 71.4,
    isPassed: false,
    ipAddress: '192.168.1.108',
    incidentsCount: 0,
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log-001',
    timestamp: '2026-03-10 08:30:12',
    userName: 'Dzakirul Husni, S.Pd.',
    role: 'super_admin',
    action: 'Inisialisasi Sistem',
    module: 'Sistem Inti',
    details: 'Konfigurasi identitas madrasah MIN 1 Paser & Kurikulum Madrasah KMA 450 Tahun 2024.',
    status: 'sukses',
  },
  {
    id: 'log-002',
    timestamp: '2026-03-12 11:00:45',
    userName: 'Dra. Hj. Siti Romlah, M.Pd.',
    role: 'kepala_madrasah',
    action: 'Persetujuan Dokumen',
    module: 'Generator Asesmen',
    details: 'Persetujuan Paket Soal SAS-IPAS-4-2025 untuk pelaksanaan CBT.',
    status: 'sukses',
  },
  {
    id: 'log-003',
    timestamp: '2026-03-15 07:55:00',
    userName: 'Muhammad Ridwan, S.Pd.',
    role: 'pengawas',
    action: 'Aktivasi Sesi Ujian',
    module: 'Computer Based Test',
    details: 'Token ujian MIN1PASER dibuka untuk Sesi 1 Kelas 4A.',
    status: 'sukses',
  },
];

// Local storage keys
const STORAGE_PREFIX = 'super_asesmen_min1paser_';

export class AppStorageService {
  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(STORAGE_PREFIX + key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }

  // School Profile
  static getSchool(): School {
    return this.getItem<School>('school', INITIAL_SCHOOL);
  }

  static updateSchool(school: School): void {
    this.setItem('school', school);
  }

  // Active User / Auth simulation
  static getActiveUser(): UserProfile {
    return this.getItem<UserProfile>('active_user', INITIAL_USERS[0]);
  }

  static setActiveUser(user: UserProfile): void {
    this.setItem('active_user', user);
  }

  static getAllUsers(): UserProfile[] {
    return this.getItem<UserProfile[]>('users', INITIAL_USERS);
  }

  static addUser(user: UserProfile): void {
    const list = this.getAllUsers();
    list.push(user);
    this.setItem('users', list);
  }

  // Subjects & Curriculum
  static getSubjects(): Subject[] {
    return this.getItem<Subject[]>('subjects', INITIAL_SUBJECTS);
  }

  static getRegulations(): CurriculumRegulation[] {
    return this.getItem<CurriculumRegulation[]>('regulations', INITIAL_REGULATIONS);
  }

  static addRegulation(reg: CurriculumRegulation): void {
    const list = this.getRegulations();
    list.unshift(reg);
    this.setItem('regulations', list);
    this.logAction('Pembaruan Regulasi Kurikulum', 'Kurikulum Madrasah', `Regulasi [${reg.nomor}] ditambahkan.`);
  }

  static getLearningObjectives(): LearningObjective[] {
    return this.getItem<LearningObjective[]>('learning_objectives', INITIAL_LEARNING_OBJECTIVES);
  }

  static addLearningObjective(lo: LearningObjective): void {
    const list = this.getLearningObjectives();
    list.push(lo);
    this.setItem('learning_objectives', list);
  }

  // Question Bank
  static getQuestionBank(): QuestionBankItem[] {
    return this.getItem<QuestionBankItem[]>('question_bank', INITIAL_QUESTIONS);
  }

  static saveQuestion(question: QuestionBankItem): void {
    const list = this.getQuestionBank();
    const index = list.findIndex(q => q.id === question.id);
    if (index >= 0) {
      list[index] = { ...question, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...question, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.setItem('question_bank', list);
    this.logAction('Penyimpanan Soal', 'Bank Soal', `Soal [${question.code}] (${question.type}) disimpan.`);
  }

  static deleteQuestion(id: string): void {
    const list = this.getQuestionBank().filter(q => q.id !== id);
    this.setItem('question_bank', list);
    this.logAction('Penghapusan Soal', 'Bank Soal', `Soal ID ${id} dihapus dari bank soal.`);
  }

  // Assessment Packages
  static getPackages(): AssessmentPackage[] {
    return this.getItem<AssessmentPackage[]>('packages', INITIAL_PACKAGES);
  }

  static savePackage(pkg: AssessmentPackage): void {
    const list = this.getPackages();
    const index = list.findIndex(p => p.id === pkg.id);
    if (index >= 0) {
      list[index] = pkg;
    } else {
      list.unshift(pkg);
    }
    this.setItem('packages', list);
    this.logAction('Penyusunan Paket Asesmen', 'Generator Perangkat', `Paket "${pkg.title}" (${pkg.questions.length} butir) disimpan.`);
  }

  // Exam Sessions
  static getSessions(): ExamSession[] {
    return this.getItem<ExamSession[]>('sessions', INITIAL_SESSIONS);
  }

  static saveSession(session: ExamSession): void {
    const list = this.getSessions();
    const index = list.findIndex(s => s.id === session.id);
    if (index >= 0) {
      list[index] = session;
    } else {
      list.unshift(session);
    }
    this.setItem('sessions', list);
    this.logAction('Pengaturan Jadwal CBT', 'Computer Based Test', `Sesi CBT "${session.sessionName}" token: ${session.token} diperbarui.`);
  }

  // Exam Attempts & Grading
  static getAttempts(): ExamAttempt[] {
    return this.getItem<ExamAttempt[]>('attempts', INITIAL_ATTEMPTS);
  }

  static getAttemptByStudentAndSession(studentId: string, sessionId: string): ExamAttempt | undefined {
    return this.getAttempts().find(a => a.studentId === studentId && a.sessionId === sessionId);
  }

  static saveAttempt(attempt: ExamAttempt): void {
    const list = this.getAttempts();
    const index = list.findIndex(a => a.id === attempt.id);
    if (index >= 0) {
      list[index] = attempt;
    } else {
      list.push(attempt);
    }
    this.setItem('attempts', list);
  }

  // Incidents
  static getIncidents(sessionId?: string): ExamIncident[] {
    const incidents = this.getItem<ExamIncident[]>('incidents', []);
    return sessionId ? incidents.filter(i => i.sessionId === sessionId) : incidents;
  }

  static logIncident(incident: ExamIncident): void {
    const list = this.getIncidents();
    list.unshift(incident);
    this.setItem('incidents', list);
    this.logAction('Berita Acara Kejadian CBT', 'Pengawasan Ujian', `Peserta ${incident.studentName}: ${incident.note}`, 'peringatan');
  }

  // Audit Logs
  static getAuditLogs(): AuditLogItem[] {
    return this.getItem<AuditLogItem[]>('audit_logs', INITIAL_AUDIT_LOGS);
  }

  static logAction(action: string, module: string, details: string, status: 'sukses' | 'peringatan' | 'gagal' = 'sukses'): void {
    const activeUser = this.getActiveUser();
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const newLog: AuditLogItem = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      timestamp: formattedDate,
      userName: activeUser.name,
      role: activeUser.role,
      action,
      module,
      details,
      status,
    };

    const logs = this.getAuditLogs();
    logs.unshift(newLog);
    // Keep last 150 entries
    this.setItem('audit_logs', logs.slice(0, 150));
  }

  // Reset to default sample data
  static resetToDefault(): void {
    localStorage.removeItem(STORAGE_PREFIX + 'school');
    localStorage.removeItem(STORAGE_PREFIX + 'users');
    localStorage.removeItem(STORAGE_PREFIX + 'subjects');
    localStorage.removeItem(STORAGE_PREFIX + 'learning_objectives');
    localStorage.removeItem(STORAGE_PREFIX + 'question_bank');
    localStorage.removeItem(STORAGE_PREFIX + 'packages');
    localStorage.removeItem(STORAGE_PREFIX + 'sessions');
    localStorage.removeItem(STORAGE_PREFIX + 'attempts');
    localStorage.removeItem(STORAGE_PREFIX + 'audit_logs');
    localStorage.removeItem(STORAGE_PREFIX + 'incidents');
    window.location.reload();
  }
}
