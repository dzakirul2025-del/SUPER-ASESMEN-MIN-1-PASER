import React, { useState } from 'react';
import { 
  AppStorageService 
} from '../services/storage';
import { 
  ExamSession, 
  UserProfile, 
  ExamAttempt,
  ExamIncident 
} from '../types';
import {
  Eye,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
  RotateCcw,
  Printer,
  ShieldAlert,
  Send,
  Plus
} from 'lucide-react';

interface CbtProctorMonitorProps {
  currentUser: UserProfile;
}

export const CbtProctorMonitor: React.FC<CbtProctorMonitorProps> = ({ currentUser }) => {
  const school = AppStorageService.getSchool();
  const sessions = AppStorageService.getSessions();
  const allUsers = AppStorageService.getAllUsers();
  const students = allUsers.filter(u => u.role === 'siswa');
  const attempts = AppStorageService.getAttempts();
  const incidents = AppStorageService.getIncidents();

  const [selectedSessionId, setSelectedSessionId] = useState(sessions[0]?.id || '');
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [selectedStudentForIncident, setSelectedStudentForIncident] = useState('');
  const [incidentText, setIncidentText] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const activeSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];

  const handleAddIncident = () => {
    if (!incidentText.trim()) return;
    const targetStudent = students.find(s => s.id === selectedStudentForIncident) || students[0];
    
    const incident: ExamIncident = {
      id: 'inc-' + Math.random().toString(36).substring(2, 9),
      sessionId: activeSession.id,
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      timestamp: new Date().toLocaleTimeString('id-ID'),
      note: incidentText,
      proctorName: currentUser.name,
    };

    AppStorageService.logIncident(incident);
    setIncidentText('');
    setShowIncidentModal(false);
    setFeedbackMsg('Catatan kejadian resmi berhasil dicatat dalam Berita Acara!');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handlePrintBeritaAcara = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Session Selector & Header */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
              Panel Pengawasan CBT
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Monitoring
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-1">
            {activeSession?.sessionName}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Ruang: <span className="font-semibold text-gray-700">{activeSession?.roomName}</span> • Sasaran: {activeSession?.classTarget} • Pengawas: {activeSession?.proctorName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[10px] text-emerald-800 font-medium block">Token Ujian Aktif:</span>
            <span className="text-sm font-mono font-black text-emerald-900 tracking-wider">
              {activeSession?.token}
            </span>
          </div>

          <button
            onClick={() => setShowIncidentModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-emerald-950 text-xs font-bold rounded-xl shadow-xs transition"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Catat Kejadian</span>
          </button>

          <button
            onClick={handlePrintBeritaAcara}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-xl transition"
          >
            <Printer className="w-3.5 h-3.5 text-gray-600" />
            <span>Cetak Berita Acara</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Participant Monitoring Grid */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5">
        <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center justify-between">
          <span>Daftar Peserta & Progres Pengerjaan Real-Time</span>
          <span className="text-xs font-normal text-gray-500">
            Total {students.length} Peserta Terdaftar di Sesi Ini
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-gray-600 font-semibold">
                <th className="p-3">No</th>
                <th className="p-3">NISN</th>
                <th className="p-3">Nama Peserta Didik</th>
                <th className="p-3">Kelas</th>
                <th className="p-3">Status CBT</th>
                <th className="p-3">Progres Soal</th>
                <th className="p-3">Waktu Mulai</th>
                <th className="p-3">IP Komputer</th>
                <th className="p-3">Kejadian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student, idx) => {
                const att = attempts.find(a => a.studentId === student.id && a.sessionId === activeSession.id);
                const hasAttempt = Boolean(att);
                const status = att?.status || 'belum_mulai';

                const totalQ = 6;
                const answeredQ = att ? Object.keys(att.answers).length : 0;
                const percent = Math.min(100, Math.round((answeredQ / totalQ) * 100));

                return (
                  <tr key={student.id} className="hover:bg-gray-50/70 transition">
                    <td className="p-3 font-semibold text-gray-400">{idx + 1}</td>
                    <td className="p-3 font-mono">{student.nisn || student.username}</td>
                    <td className="p-3 font-bold text-gray-900">{student.name}</td>
                    <td className="p-3">{student.classId || '4A'}</td>
                    <td className="p-3">
                      {status === 'dinilai' || status === 'selesai' ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                          ✓ Selesai
                        </span>
                      ) : status === 'mengerjakan' ? (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-full text-[10px] animate-pulse">
                          ● Mengerjakan
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 font-medium rounded-full text-[10px]">
                          Belum Masuk
                        </span>
                      )}
                    </td>
                    <td className="p-3 w-40">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={`h-full ${status === 'dinilai' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-gray-500">{percent}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-500 font-mono text-[11px]">
                      {att?.startedAt ? new Date(att.startedAt).toLocaleTimeString('id-ID') : '-'}
                    </td>
                    <td className="p-3 text-gray-500 font-mono text-[11px]">
                      {att?.ipAddress || '192.168.1.1' + (idx + 4)}
                    </td>
                    <td className="p-3">
                      {incidents.filter(i => i.studentId === student.id).length > 0 ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                          Ada Catatan
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px]">Tertib</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Berita Acara Incident Log */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5">
        <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-700" />
          <span>Berita Acara Pelaksanaan Ujian (Catatan Kejadian Khusus)</span>
        </h3>

        {incidents.length === 0 ? (
          <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-xl">
            Belum ada catatan kejadian khusus selama pelaksanaan ujian. Ujian berlangsung tertib dan lancar.
          </p>
        ) : (
          <div className="space-y-2">
            {incidents.map((inc) => (
              <div key={inc.id} className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-xs flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between font-bold text-gray-800">
                    <span>{inc.studentName}</span>
                    <span className="font-mono font-normal text-gray-500">{inc.timestamp}</span>
                  </div>
                  <p className="text-gray-700 mt-0.5">{inc.note}</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Dicatat oleh Pengawas: {inc.proctorName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incident Input Modal */}
      {showIncidentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Catat Kejadian Pengawasan Ujian
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Kejadian ini akan tercatat dalam Berita Acara resmi MIN 1 Paser.
            </p>

            <div className="space-y-3 text-xs mb-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Peserta Didik Terkait:</label>
                <select
                  value={selectedStudentForIncident}
                  onChange={(e) => setSelectedStudentForIncident(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.nisn})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Uraian Kejadian / Catatan:</label>
                <textarea
                  rows={4}
                  value={incidentText}
                  onChange={(e) => setIncidentText(e.target.value)}
                  placeholder="Contoh: Komputer peserta mengalami kendala restart pada menit ke-20, pengerjaan dilanjutkan dengan token yang sama tanpa kehilangan jawaban..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowIncidentModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleAddIncident}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-emerald-950 text-xs font-bold rounded-xl shadow-xs"
              >
                Simpan ke Berita Acara
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
