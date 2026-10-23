import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'SUPER ASESMEN MIN 1 PASER',
    developer: 'Dzakirul Husni, S.Pd.',
    hasApiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString(),
  });
});

// AI Question Generator Endpoint (supports up to 150 questions with batching)
app.post('/api/ai/generate-questions', async (req: Request, res: Response) => {
  try {
    const {
      subject,
      grade,
      phase,
      topic,
      learningObjective,
      questionTypes,
      difficulty,
      cognitiveLevel,
      count = 5,
    } = req.body;

    const requestedCount = Math.min(Math.max(1, parseInt(count, 10) || 5), 150);

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: 'Kunci API Gemini belum dikonfigurasi. Menggunakan generator cerdas internal.',
      });
    }

    // Determine batch size (generate in chunks of up to 15 to ensure JSON integrity and token limits)
    const BATCH_SIZE = Math.min(requestedCount, 15);
    const numBatches = Math.ceil(requestedCount / BATCH_SIZE);
    let allQuestions: any[] = [];

    for (let b = 0; b < numBatches; b++) {
      const currentBatchCount = Math.min(BATCH_SIZE, requestedCount - allQuestions.length);
      if (currentBatchCount <= 0) break;

      const prompt = `Anda adalah ahli kurikulum madrasah (MIN 1 Paser Kemenag) dan ahli asesmen pendidikan Indonesia berbasis KMA No. 1503 Tahun 2025 (Kurikulum RA dan Madrasah) serta KMA 450 Tahun 2024.
Buatkan ${currentBatchCount} butir soal asesmen berkualitas tinggi (Batch ${b + 1} dari ${numBatches}) untuk:
- Satuan Pendidikan: MIN 1 Paser (Madrasah Ibtidaiyah)
- Mata Pelajaran: ${subject}
- Kelas: ${grade} (Fase ${phase})
- Materi Pokok: ${topic}
- Tujuan Pembelajaran (TP): ${learningObjective || 'Sesuai kurikulum madrasah terpadu'}
- Tingkat Kesukaran: ${difficulty || 'Sedang'}
- Level Kognitif: ${cognitiveLevel || 'L2 (Aplikasi)'}
- Bentuk Soal: ${Array.isArray(questionTypes) ? questionTypes.join(', ') : 'Pilihan Ganda, PG Kompleks, Isian, Uraian'}

Aturan:
1. Soal kontekstual ramah anak madrasah, moderat, bervariasi, dan tidak repetitif.
2. Butir soal harus memiliki stimulus, indikator yang jelas, dan pembahasan mendalam.
3. Kunci jawaban objektif dan distraktor logis.
4. Format pengembalian HARUS berupa JSON valid tanpa teks pembuka/penutup:
{
  "questions": [
    {
      "type": "pilihan_ganda",
      "cognitiveLevel": "L2",
      "difficulty": "Sedang",
      "topic": "${topic}",
      "indicator": "Disajikan stimulus, peserta didik dapat menganalisis konsep dengan tepat",
      "stimulus": "Teks stimulus jika relevan",
      "stem": "Rumusan pertanyaan butir soal",
      "options": [
        {"key": "A", "text": "Pilihan A"},
        {"key": "B", "text": "Pilihan B"},
        {"key": "C", "text": "Pilihan C"},
        {"key": "D", "text": "Pilihan D"}
      ],
      "answerKey": "A",
      "explanation": "Alasan dan pembahasan mengapa jawaban benar",
      "scoringGuide": "Skor 1 jika benar, 0 jika salah",
      "points": 1
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      try {
        const parsed = JSON.parse(responseText);
        if (Array.isArray(parsed.questions)) {
          allQuestions = allQuestions.concat(parsed.questions);
        }
      } catch (parseErr) {
        console.warn('Batch parse error, continuing with available questions:', parseErr);
      }

      // If we already have enough questions, stop early
      if (allQuestions.length >= requestedCount) break;
    }

    return res.json({
      success: true,
      questions: allQuestions.slice(0, requestedCount),
      totalGenerated: allQuestions.length,
    });
  } catch (error: any) {
    console.error('Gemini generation error:', error);
    return res.status(200).json({
      success: false,
      error: error.message || 'Gagal memanggil model AI Gemini',
      fallback: true,
    });
  }
});

// AI Essay Grader and Rubric Suggestion Endpoint
app.post('/api/ai/suggest-essay-score', async (req: Request, res: Response) => {
  try {
    const { questionStem, rubric, expectedAnswer, studentAnswer, maxPoints = 10 } = req.body;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: 'Kunci API Gemini tidak aktif.',
      });
    }

    const prompt = `Anda adalah penilai asesmen guru profesional di MIN 1 Paser.
Berikan saran penilaian yang adil dan obyektif untuk jawaban uraian siswa madrasah berikut:

Soal: ${questionStem}
Kunci / Jawaban yang Diharapkan: ${expectedAnswer}
Pedoman Penskoran / Rubrik: ${rubric || 'Sesuai kelengkapan konsep dan penalaran'}
Skor Maksimal: ${maxPoints}

Jawaban Siswa: "${studentAnswer}"

Kembalikan respon dalam format JSON murni:
{
  "suggestedScore": 8,
  "confidence": "tinggi",
  "strengths": "Aspek yang sudah dijawab dengan tepat oleh siswa",
  "weaknesses": "Kekurangan atau konsep yang belum lengkap",
  "feedback": "Umpan balik yang mendidik dan memotivasi untuk siswa",
  "justification": "Alasan penilaian skor berdasarkan rubrik"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error('Gemini essay grading error:', error);
    return res.status(200).json({
      success: false,
      error: error.message,
      fallback: true,
    });
  }
});

// Mount Vite or static server
async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server SUPER ASESMEN MIN 1 PASER running on http://0.0.0.0:${port}`);
  });
}

setupServer();
