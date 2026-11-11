import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Calculator,
  Zap,
  FileCheck,
  Users,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
  Shield,
  ShieldCheck,
  Award,
  ChevronRight,
  Sparkles,
  Layers,
  UploadCloud,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  activeRoleView: UserRole;
  setActiveRoleView: (role: UserRole) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onOpenEditProfile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeMenu,
  setActiveMenu,
  activeRoleView,
  setActiveRoleView,
  isOpenMobile,
  setIsOpenMobile,
  onOpenEditProfile,
}) => {
  const { currentUser, logout, users } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isAdmin = currentUser?.role === 'admin';
  const isTeacher = currentUser?.role === 'guru';
  const isStaff = isAdmin || isTeacher;

  // Navigation Links for Siswa
  const siswaNavItems = [
    { id: 'materi', label: '1. Materi Faraidh', icon: BookOpen, badge: '5 Bab' },
    { id: 'simulasi', label: '2. Simulasi Waris', icon: Calculator, badge: 'Kalkulator' },
    { id: 'latihan', label: '3. Latihan Soal', icon: Zap, badge: 'XP Game' },
    { id: 'uji', label: '4. Uji Kemampuan', icon: FileCheck, badge: 'Timer' },
  ];

  // Navigation Links for Guru PAI
  const guruNavItems = [
    { id: 'overview', label: 'Dashboard Statistik', icon: LayoutDashboard, badge: 'Grafik' },
    { id: 'monitoring', label: 'Monitoring & Rapor', icon: FileSpreadsheet, badge: 'PDF/Excel' },
    { id: 'siswa', label: 'Data Peserta Didik', icon: Users, badge: `${users.filter(u => u.role === 'siswa').length}` },
    { id: 'impor_user', label: 'Impor Data Siswa', icon: UploadCloud, badge: 'Excel' },
    { id: 'materi_admin', label: 'Modul Pembelajaran', icon: BookOpen, badge: 'Materi' },
    { id: 'soal_admin', label: 'Bank Soal & KKM', icon: HelpCircle, badge: 'Soal' },
  ];

  // Navigation Links for Admin
  const adminNavItems = [
    { id: 'overview', label: 'Dashboard Statistik', icon: LayoutDashboard, badge: 'Sistem' },
    { id: 'monitoring', label: 'Monitoring & Laporan', icon: FileSpreadsheet, badge: 'PDF/Excel' },
    { id: 'siswa', label: 'Manajemen Siswa', icon: Users, badge: `${users.filter(u => u.role === 'siswa').length}` },
    { id: 'guru_admin', label: 'Manajemen Guru & Admin', icon: ShieldCheck, badge: `${users.filter(u => u.role === 'guru' || u.role === 'admin').length}` },
    { id: 'impor_user', label: 'Impor Siswa & Guru', icon: UploadCloud, badge: 'Excel/CSV' },
    { id: 'materi_admin', label: 'Manajemen Materi', icon: BookOpen, badge: 'Editor' },
    { id: 'soal_admin', label: 'Bank Soal & KKM', icon: HelpCircle, badge: 'Pengaturan' },
  ];

  const currentNavItems =
    activeRoleView === 'admin'
      ? adminNavItems
      : activeRoleView === 'guru'
      ? guruNavItems
      : siswaNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-white dark:bg-slate-900 border-r border-emerald-900/10 dark:border-emerald-500/20 shadow-xl lg:shadow-none flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Brand & Header with SMKN 1 Sidayu Logo */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 p-1 flex items-center justify-center shadow-md border border-slate-200 dark:border-slate-700 shrink-0">
              <img
                src="/assets/aistudio/logo_d004d6e9.png"
                alt="Logo SMKN 1 Sidayu Gresik"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white truncate">
                PAI-Waris Digital
              </h2>
              <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider truncate">
                SMKN 1 SIDAYU GRESIK
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpenMobile(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white lg:hidden"
            title="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card inside Sidebar */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0 ${
                  isAdmin
                    ? 'bg-gradient-to-tr from-amber-600 to-emerald-700'
                    : isTeacher
                    ? 'bg-gradient-to-tr from-blue-600 to-teal-700'
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-700'
                }`}
              >
                {currentUser?.nama ? currentUser.nama.charAt(0) : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser?.nama || 'Pengguna'}
                </p>
                <p className="text-[10px] font-semibold truncate flex items-center gap-1">
                  {isAdmin ? (
                    <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-500 shrink-0" />
                      Administrator
                    </span>
                  ) : isTeacher ? (
                    <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <Award className="w-3 h-3 text-emerald-500 shrink-0" />
                      Guru PAI
                    </span>
                  ) : (
                    <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-amber-500 shrink-0" />
                      {currentUser?.kelas || 'Siswa'} • Lvl {currentUser?.level || 1}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Edit Profile Button for Staff */}
            {isStaff && (
              <button
                type="button"
                onClick={onOpenEditProfile}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 text-[10px] font-bold shrink-0 transition-colors"
                title="Edit Profil Akun"
              >
                Edit
              </button>
            )}
          </div>

          {/* Gamification progress bar for Siswa */}
          {!isStaff && currentUser && (
            <div className="mt-2.5 px-1 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <span>XP: {currentUser.xp || 0}</span>
                <span className="text-amber-500">Target Lvl {(currentUser.level || 1) + 1}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, ((currentUser.xp || 0) % 150) / 1.5)}%` }}
                />
              </div>
            </div>
          )}

          {/* VIEW SWITCHER FOR STAFF (Admin or Teacher Preview) */}
          {isAdmin && (
            <div className="mt-3 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block px-1">
                Pratinjau Mode Akses:
              </span>
              <div className="grid grid-cols-3 gap-1 text-[10px] font-extrabold">
                <button
                  type="button"
                  onClick={() => {
                    setActiveRoleView('admin');
                    setActiveMenu('overview');
                  }}
                  className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                    activeRoleView === 'admin'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3 text-amber-300" />
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveRoleView('guru');
                    setActiveMenu('overview');
                  }}
                  className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                    activeRoleView === 'guru'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                  }`}
                >
                  <BookOpen className="w-3 h-3 text-emerald-300" />
                  Guru
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveRoleView('siswa');
                    setActiveMenu('simulasi');
                  }}
                  className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                    activeRoleView === 'siswa'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Siswa
                </button>
              </div>
            </div>
          )}

          {isTeacher && !isAdmin && (
            <div className="mt-3 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block px-1">
                Tampilan Guru:
              </span>
              <div className="grid grid-cols-2 gap-1 text-[11px] font-extrabold">
                <button
                  type="button"
                  onClick={() => {
                    setActiveRoleView('guru');
                    setActiveMenu('overview');
                  }}
                  className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                    activeRoleView === 'guru'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                  }`}
                >
                  <Award className="w-3 h-3 text-amber-400" />
                  Guru
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveRoleView('siswa');
                    setActiveMenu('simulasi');
                  }}
                  className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                    activeRoleView === 'siswa'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Siswa
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Middle: Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 no-scrollbar">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {activeRoleView === 'admin'
              ? 'Menu Administrator'
              : activeRoleView === 'guru'
              ? 'Menu Guru PAI'
              : 'Menu Utama Siswa'}
          </p>

          {currentNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  setIsOpenMobile(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Utilities: Theme Toggle & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs font-bold"
          >
            <div className="flex items-center gap-2.5">
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-500" />
              )}
              <span>{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-mono">{theme}</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>
    </>
  );
};
