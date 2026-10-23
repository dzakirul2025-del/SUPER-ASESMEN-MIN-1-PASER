import React, { useState, useEffect } from 'react';
import { AppStorageService } from './services/storage';
import { UserProfile, School } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AssessmentGeneratorView } from './components/AssessmentGeneratorView';
import { QuestionBankView } from './components/QuestionBankView';
import { CbtExamView } from './components/CbtExamView';
import { CbtProctorMonitor } from './components/CbtProctorMonitor';
import { GradingAndAnalysisView } from './components/GradingAndAnalysisView';
import { CurriculumManager } from './components/CurriculumManager';
import { DatabaseSchemaView } from './components/DatabaseSchemaView';
import { AuditLogView } from './components/AuditLogView';
import { AboutView } from './components/AboutView';
import { AmbientAudioPlayer } from './components/AmbientAudioPlayer';
import { ShieldCheck, HeartHandshake, Building2 } from 'lucide-react';

export default function App() {
  const [school, setSchool] = useState<School>(AppStorageService.getSchool());
  const [allUsers, setAllUsers] = useState<UserProfile[]>(AppStorageService.getAllUsers());
  const [activeUser, setActiveUser] = useState<UserProfile>(AppStorageService.getActiveUser());
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // When activeUser changes (e.g. from role switcher), save to storage
  const handleSelectUser = (user: UserProfile) => {
    setActiveUser(user);
    AppStorageService.setActiveUser(user);
    AppStorageService.logAction(
      'Ganti Peran Pengguna',
      'Otentikasi & Profil',
      `Beralih ke peran ${user.role} (${user.name}).`
    );

    // If user is a student, automatically navigate to CBT Exam
    if (user.role === 'siswa') {
      setCurrentTab('cbt_exam');
    } else if (user.role === 'pengawas') {
      setCurrentTab('proctor_monitor');
    }
  };

  const handleResetData = () => {
    AppStorageService.resetToDefault();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900 font-sans antialiased">
      {/* Official Top Navbar */}
      <Navbar
        school={school}
        activeUser={activeUser}
        allUsers={allUsers}
        onSelectUser={handleSelectUser}
        onResetData={handleResetData}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          role={activeUser.role}
        />

        {/* Main Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />
          )}

          {currentTab === 'generator' && (
            <AssessmentGeneratorView currentUser={activeUser} />
          )}

          {currentTab === 'question_bank' && (
            <QuestionBankView currentUser={activeUser} />
          )}

          {currentTab === 'ai_generator' && (
            <QuestionBankView currentUser={activeUser} />
          )}

          {currentTab === 'cbt_exam' && (
            <CbtExamView currentUser={activeUser} />
          )}

          {currentTab === 'proctor_monitor' && (
            <CbtProctorMonitor currentUser={activeUser} />
          )}

          {currentTab === 'grading' && (
            <GradingAndAnalysisView currentUser={activeUser} />
          )}

          {currentTab === 'analysis' && (
            <GradingAndAnalysisView currentUser={activeUser} />
          )}

          {currentTab === 'curriculum' && (
            <CurriculumManager currentUser={activeUser} />
          )}

          {currentTab === 'database_schema' && (
            <DatabaseSchemaView />
          )}

          {currentTab === 'audit_logs' && (
            <AuditLogView />
          )}

          {currentTab === 'about' && (
            <AboutView />
          )}
        </main>
      </div>

      {/* Official Madrasah Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-xs text-gray-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-800 text-white flex items-center justify-center font-bold text-[10px]">
              MIN
            </div>
            <div>
              <p className="font-bold text-gray-800">
                SUPER ASESMEN MIN 1 PASER • TP 2024/2025
              </p>
              <p className="text-[11px] text-gray-400">
                Madrasah Ibtidaiyah Negeri 1 Paser, Kementerian Agama Kabupaten Paser, Provinsi Kalimantan Timur.
              </p>
            </div>
          </div>

          <div className="text-[11px]">
            <span>Pengembang: </span>
            <span className="font-bold text-emerald-800">{school.developerName}</span>
            <span className="text-gray-400"> (MIN 1 Paser)</span>
          </div>
        </div>
      </footer>

      {/* Unobtrusive Floating Ambient Music Player */}
      <AmbientAudioPlayer />
    </div>
  );
}
