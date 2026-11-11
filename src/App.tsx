import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole } from './types';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { StudentDashboard } from './components/student/StudentDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { MonitoringNilai } from './components/teacher/MonitoringNilai';
import { ManajemenSiswa } from './components/teacher/ManajemenSiswa';
import { ManajemenGuru } from './components/teacher/ManajemenGuru';
import { ManajemenMateri } from './components/teacher/ManajemenMateri';
import { ManajemenSoal } from './components/teacher/ManajemenSoal';
import { ImporUser } from './components/teacher/ImporUser';
import { EditProfileModal } from './components/EditProfileModal';
import { AiChatbot } from './components/AiChatbot';
import {
  Menu,
  Shield,
  ShieldCheck,
  Users,
  Sun,
  Moon,
  LogOut,
  Award,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

function MainAppShell() {
  const { currentUser, logout, users, switchUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isAdmin = currentUser?.role === 'admin';
  const isTeacher = currentUser?.role === 'guru';
  const isStaff = isAdmin || isTeacher;

  const [activeRoleView, setActiveRoleView] = useState<UserRole>(() => {
    return currentUser?.role || 'siswa';
  });

  const [activeMenu, setActiveMenu] = useState<string>(() => {
    return isStaff ? 'overview' : 'simulasi';
  });

  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [showSwitchDropdown, setShowSwitchDropdown] = useState<boolean>(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);

  // Synchronize role view when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setActiveRoleView(currentUser.role);
      if (currentUser.role === 'admin' || currentUser.role === 'guru') {
        setActiveMenu('overview');
      } else {
        setActiveMenu('simulasi');
      }
    }
  }, [currentUser?.id, currentUser?.role]);

  // If user is not logged in, display the dedicated Login Portal
  if (!currentUser) {
    return <LoginPage onLoginSuccess={() => {}} />;
  }

  const getPageTitle = () => {
    if (activeRoleView === 'admin' || activeRoleView === 'guru') {
      switch (activeMenu) {
        case 'monitoring':
          return activeRoleView === 'admin' ? 'Monitoring & Laporan Administrator' : 'Monitoring & Rapor Pendidik';
        case 'siswa':
          return activeRoleView === 'admin' ? 'Manajemen Data Siswa' : 'Data Peserta Didik';
        case 'guru_admin':
          return 'Manajemen Akun Guru & Administrator';
        case 'impor_user':
          return 'Impor Data Pengguna (Siswa & Guru)';
        case 'materi_admin':
          return 'Manajemen Modul Pembelajaran';
        case 'soal_admin':
          return 'Bank Soal & Pengaturan Evaluasi';
        default:
          return activeRoleView === 'admin' ? 'Dashboard Administrator Sistem' : 'Dashboard Guru PAI';
      }
    } else {
      switch (activeMenu) {
        case 'materi':
          return 'Materi Pembelajaran Faraidh';
        case 'simulasi':
          return 'Simulasi Hitung Waris Islam';
        case 'latihan':
          return 'Latihan Soal & Gamifikasi';
        default:
          return 'Uji Kemampuan Resmi';
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-row font-sans transition-colors">
      {/* Navigation Sidebar */}
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        activeRoleView={activeRoleView}
        setActiveRoleView={setActiveRoleView}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header Navbar */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-emerald-900/10 dark:border-emerald-500/20 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-xs">
          {/* Left: Mobile Toggle & Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpenMobile(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 lg:hidden transition-colors"
              title="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white capitalize">
                  {getPageTitle()}
                </span>
                {activeRoleView === 'admin' ? (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    <ShieldCheck className="w-3 h-3 text-amber-500" /> Mode Administrator
                  </span>
                ) : activeRoleView === 'guru' ? (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                    <Award className="w-3 h-3 text-blue-500" /> Mode Guru PAI
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    <Sparkles className="w-3 h-3 text-emerald-600" /> Mode Siswa
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick Switcher & User Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Switcher Dropdown (Available for testing / staff preview) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
                title="Ganti akun untuk pengujian"
              >
                <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden md:inline">Ganti Akun</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showSwitchDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in-50">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase">
                      Pilih Akun Terdaftar:
                    </p>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {users.map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          switchUser(u.id);
                          setShowSwitchDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors ${
                          currentUser?.id === u.id
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 font-bold text-emerald-700 dark:text-emerald-300'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="truncate">
                          <p className="truncate text-xs font-bold">{u.nama}</p>
                          <p className="text-[10px] text-slate-400">
                            {u.role === 'admin'
                              ? 'Admin Sekolah'
                              : u.role === 'guru'
                              ? 'Guru PAI'
                              : `${u.kelas} • @${u.username}`}
                          </p>
                        </div>
                        {u.role === 'admin' ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 shrink-0 ml-2">
                            Admin
                          </span>
                        ) : u.role === 'guru' ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800 shrink-0 ml-2">
                            Guru
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-mono shrink-0 ml-2">
                            {u.xp || 0} XP
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Edit Profile for Staff */}
            {isStaff && (
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 transition-colors"
                title="Edit Profil Akun"
              >
                {isAdmin ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <Award className="w-3.5 h-3.5 text-emerald-500" />
                )}
                <span>Profil</span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeRoleView === 'admin' || activeRoleView === 'guru' ? (
            activeMenu === 'monitoring' ? (
              <MonitoringNilai />
            ) : activeMenu === 'siswa' ? (
              <ManajemenSiswa onNavigateToImport={() => setActiveMenu('impor_user')} />
            ) : activeMenu === 'guru_admin' ? (
              <ManajemenGuru onNavigateToImport={() => setActiveMenu('impor_user')} />
            ) : activeMenu === 'impor_user' ? (
              <ImporUser onNavigateToTab={setActiveMenu} />
            ) : activeMenu === 'materi_admin' ? (
              <ManajemenMateri />
            ) : activeMenu === 'soal_admin' ? (
              <ManajemenSoal />
            ) : (
              <TeacherDashboard
                initialTab={activeMenu as any}
                onOpenEditProfile={() => setIsEditProfileOpen(true)}
              />
            )
          ) : (
            <StudentDashboard initialTab={activeMenu as any} />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/aistudio/logo_d004d6e9.png"
                alt="Logo SMKN 1 Sidayu"
                className="w-5 h-5 object-contain"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                PAI-Waris Digital © 2026
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">• SMKN 1 Sidayu Gresik</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Berlandaskan QS. An-Nisa ayat 11, 12, 176 & Hadits Shahih • Sesuai Kaidah Fiqih Syafi'iyyah
            </p>
          </div>
        </footer>

        {/* Floating AI Assistant Chatbot */}
        <AiChatbot />

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MainAppShell />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
