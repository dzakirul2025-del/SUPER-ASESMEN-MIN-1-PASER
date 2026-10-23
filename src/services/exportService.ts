import * as XLSX from 'xlsx';
import { AssessmentPackage, School, ExamAttempt, QuestionBankItem } from '../types';

export class ExportService {
  /**
   * Export Assessment Document or Package to downloadable Word (.doc / .docx compatible HTML)
   */
  static exportToWord(packageData: AssessmentPackage, school: School, docType: string, contentHtml: string): void {
    const title = `${packageData.title} - ${docType}`;
    const headerHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${title}</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.3; color: #000; margin: 20mm; }
          h1, h2, h3, h4 { text-align: center; margin: 4px 0; }
          .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 16px; }
          .kop h2 { font-size: 14pt; margin: 0; }
          .kop h1 { font-size: 16pt; margin: 0; font-weight: bold; }
          .kop p { font-size: 10pt; margin: 2px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; font-size: 11pt; }
          th, td { border: 1px solid #000; padding: 6px 8px; vertical-align: top; }
          th { background-color: #f2f2f2; text-align: center; }
          .table-no-border, .table-no-border td { border: none !important; padding: 3px; }
          .signature-table { width: 100%; margin-top: 30px; border: none; }
          .signature-table td { border: none; text-align: center; width: 50%; }
          .page-break { page-break-after: always; }
        </style>
      </head>
      <body>
        <div class="kop">
          <h2>KEMENTERIAN AGAMA REPUBLIK INDONESIA</h2>
          <h2>KANTOR KEMENTERIAN AGAMA KABUPATEN PASER</h2>
          <h1>MADRASAH IBTIDAIYAH NEGERI 1 PASER</h1>
          <p>${school.address}, ${school.subdistrict}, ${school.district}, ${school.province} ${school.postalCode}</p>
          <p>Email: ${school.email} | NPSN: ${school.npsn} | NSM: ${school.nsm}</p>
        </div>
        ${contentHtml}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', headerHtml], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${packageData.code}_${docType.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export Student Grades and Analysis to XLSX Workbook
   */
  static exportGradesToExcel(
    packageData: AssessmentPackage,
    attempts: ExamAttempt[],
    school: School,
    passingGrade: number
  ): void {
    // Sheet 1: Rekap Nilai Siswa
    const studentRows = attempts.map((att, idx) => {
      const isPassed = att.percentage >= passingGrade;
      return {
        'No': idx + 1,
        'NISN': att.studentNisn,
        'Nama Peserta Didik': att.studentName,
        'Kelas': att.className,
        'Skor PG/Objektif': att.objectiveScore,
        'Skor Uraian': att.essayScore,
        'Total Skor': att.totalScore,
        'Skor Maksimal': att.maxScore,
        'Nilai Akhir (Skala 100)': att.percentage.toFixed(1),
        'Kriteria KKTP': isPassed ? 'TUNTAS' : 'BELUM TUNTAS',
        'Tindak Lanjut': isPassed ? 'Pengayaan' : 'Remedial',
        'Waktu Selesai': att.submittedAt ? new Date(att.submittedAt).toLocaleTimeString('id-ID') : '-',
        'Alamat IP': att.ipAddress || '127.0.0.1'
      };
    });

    const studentWs = XLSX.utils.json_to_sheet(studentRows);

    // Sheet 2: Analisis Butir Soal (Item Analysis)
    const itemAnalysisRows = packageData.questions.map((q, idx) => {
      // Calculate empirical difficulty if attempts exist
      let correctCount = 0;
      attempts.forEach(att => {
        const ans = att.answers[q.id];
        if (ans && ans.isCorrect) correctCount++;
      });
      const difficultyIndex = attempts.length > 0 ? (correctCount / attempts.length).toFixed(2) : '-';
      let empiricalDiff = 'Sedang';
      const numDiff = parseFloat(difficultyIndex);
      if (!isNaN(numDiff)) {
        if (numDiff > 0.70) empiricalDiff = 'Mudah';
        else if (numDiff < 0.30) empiricalDiff = 'Sukar';
      }

      return {
        'No Butir': idx + 1,
        'Kode Soal': q.code,
        'Bentuk Soal': q.type.toUpperCase().replace('_', ' '),
        'Materi Pokok': q.topic,
        'Level Kognitif': q.cognitiveLevel,
        'Tingkat Kesukaran Teoretis': q.difficulty,
        'Bobot Poin': q.points,
        'Jumlah Peserta': attempts.length,
        'Jumlah Jawaban Benar': correctCount,
        'Indeks Kesukaran (P)': difficultyIndex,
        'Status Empiris': empiricalDiff,
        'Status Verifikasi': q.status === 'disetujui' ? 'Valid & Disetujui' : 'Perlu Reviu'
      };
    });

    const itemWs = XLSX.utils.json_to_sheet(itemAnalysisRows);

    // Sheet 3: Identitas Asesmen & Madrasah
    const metaRows = [
      { 'Parameter': 'Satuan Pendidikan', 'Keterangan': school.name },
      { 'Parameter': 'NPSN / NSM', 'Keterangan': `${school.npsn} / ${school.nsm}` },
      { 'Parameter': 'Alamat', 'Keterangan': `${school.address}, ${school.district}` },
      { 'Parameter': 'Kepala Madrasah', 'Keterangan': `${school.headmasterName} (NIP. ${school.headmasterNip})` },
      { 'Parameter': 'Guru Pengampu / Penyusun', 'Keterangan': `${packageData.authorName}` },
      { 'Parameter': 'Mata Pelajaran', 'Keterangan': packageData.subjectName },
      { 'Parameter': 'Kelas / Fase', 'Keterangan': `Kelas ${packageData.grade} / Fase ${packageData.phase}` },
      { 'Parameter': 'Tahun Pelajaran / Semester', 'Keterangan': `${packageData.academicYear} (${packageData.semester})` },
      { 'Parameter': 'KKTP (Kriteria Ketuntasan)', 'Keterangan': `${passingGrade}` },
      { 'Parameter': 'Jumlah Butir Soal', 'Keterangan': `${packageData.questions.length}` },
      { 'Parameter': 'Pengembang Aplikasi', 'Keterangan': `${school.developerName} (MIN 1 Paser)` },
    ];
    const metaWs = XLSX.utils.json_to_sheet(metaRows);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, studentWs, 'Rekap Nilai & Ketuntasan');
    XLSX.utils.book_append_sheet(wb, itemWs, 'Analisis Butir Soal');
    XLSX.utils.book_append_sheet(wb, metaWs, 'Identitas Asesmen');

    XLSX.writeFile(wb, `REKAP_NILAI_${packageData.code}_MIN1PASER.xlsx`);
  }

  /**
   * Export student answers or data to CSV
   */
  static exportToCsv(data: Record<string, any>[], filename: string): void {
    if (data.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Trigger Native Clean Browser Print for PDF Output
   */
  static printDocument(elementId: string): void {
    const printElement = document.getElementById(elementId);
    if (!printElement) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cetak Perangkat Asesmen - MIN 1 Paser</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #111; line-height: 1.4; }
          .no-print { display: none !important; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 8px; }
          th, td { border: 1px solid #333; padding: 5px 8px; vertical-align: top; }
          th { background-color: #f3f4f6; }
          .page-break { page-break-after: always; }
        </style>
      </head>
      <body class="p-4" onload="window.print();window.close();">
        ${printElement.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
  }
}
