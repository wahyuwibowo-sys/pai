import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';
import {
  GraduationCap,
  Shield,
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Calculator,
  Award,
  Sun,
  Moon,
  Eye,
  EyeOff,
  HelpCircle,
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('siswa');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Switch role tab
  const handleTabChange = (role: UserRole) => {
    setActiveRoleTab(role);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Masukkan username akun Anda.');
      return;
    }

    if (!password) {
      setError('Masukkan kata sandi / password akun Anda.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(username, password, activeRoleTab);
      setIsLoading(false);
      if (res.success) {
        showToast('success', 'Berhasil Masuk', `Ahlan wa sahlan! Selamat datang di PAI-Waris Digital.`);
        onLoginSuccess();
      } else {
        setError(res.message || 'Username atau password tidak sesuai.');
        showToast('error', 'Login Gagal', res.message || 'Periksa kembali data login Anda.');
      }
    }, 200);
  };

  const roleMeta = {
    siswa: {
      title: 'Portal Siswa',
      badge: 'Peserta Didik',
      desc: 'Akses modul materi, kalkulator simulasi waris, dan uji kemampuan resmi.',
      placeholder: 'Username siswa (cth: ahmad_fauzi)',
      icon: GraduationCap,
      color: 'emerald',
    },
    guru: {
      title: 'Portal Guru',
      badge: 'Pendidik PAI',
      desc: 'Akses monitoring nilai rapor, bank soal, modul materi, dan bimbingan siswa.',
      placeholder: 'Username guru (cth: guru_ahmad)',
      icon: BookOpen,
      color: 'blue',
    },
    admin: {
      title: 'Portal Admin',
      badge: 'Administrator',
      desc: 'Akses administrasi sistem, manajemen akun guru & siswa, dan pengaturan evaluasi.',
      placeholder: 'Username admin (cth: admin)',
      icon: ShieldCheck,
      color: 'amber',
    },
  }[activeRoleTab];

  const RoleIcon = roleMeta.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 flex flex-col justify-between text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header Navbar with Official School Logo */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 p-1.5 flex items-center justify-center shadow-md border border-slate-200/80 dark:border-slate-700 shrink-0">
            <img
              src="/assets/aistudio/logo_d004d6e9.png"
              alt="Logo SMKN 1 Sidayu Gresik"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-700 dark:from-emerald-400 dark:via-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
                PAI-Waris Digital
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                Faraidh Syar'i
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 tracking-wider">
              SMKN 1 SIDAYU GRESIK
            </p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-xs transition-colors"
          title="Ubah Tema"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Login Center Area */}
      <main className="max-w-5xl w-full mx-auto px-4 py-6 sm:py-10 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
        {/* Left Side: School Branding & Features */}
        <div className="flex-1 space-y-6 text-center lg:text-left max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300/80 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Media Pembelajaran Resmi PAI & Budi Pekerti
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Perhitungan Harta Waris Islam (Faraidh) SMKN 1 Sidayu
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Aplikasi interaktif kurikulum PAI SMA/SMK. Dilengkapi materi fiqih mawaris, simulasi kalkulator waris otomatis, latihan soal gamifikasi XP, serta ujian kemampuan bersertifikat.
          </p>

          {/* 3 Key Feature Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Kalkulator Waris</p>
              <p className="text-[11px] text-slate-500">Diagram pie & dalil Al-Qur'an</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <BookOpen className="w-5 h-5 text-amber-500" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Materi Lengkap</p>
              <p className="text-[11px] text-slate-500">QS. An-Nisa: 11, 12, 176</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <Award className="w-5 h-5 text-blue-500" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Monitoring & Rapor</p>
              <p className="text-[11px] text-slate-500">Ekspor laporan PDF & Excel</p>
            </div>
          </div>
        </div>

        {/* Right Side: The Branded Login Card */}
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xl space-y-5">
          {/* Logo Header Inside Card */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 dark:bg-slate-800 p-2 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              <img
                src="/assets/aistudio/logo_d004d6e9.png"
                alt="Logo SMKN 1 Sidayu"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Masuk ke Aplikasi
              </h3>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                SMK NEGERI 1 SIDAYU GRESIK
              </p>
            </div>
          </div>

          {/* Three Separated Role Tabs: Siswa, Guru, Admin */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">
              Pilih Akses Masuk:
            </label>
            <div className="grid grid-cols-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => handleTabChange('siswa')}
                className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  activeRoleTab === 'siswa'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span>Siswa</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('guru')}
                className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  activeRoleTab === 'guru'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span>Guru PAI</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('admin')}
                className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  activeRoleTab === 'admin'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Active Portal Indicator Banner */}
          <div className="p-2.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/20 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <RoleIcon className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{roleMeta.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold">
                  {roleMeta.badge}
                </span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {roleMeta.desc}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 font-semibold animate-in fade-in-50 leading-relaxed">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Username Akun ({roleMeta.badge})
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={roleMeta.placeholder}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Password / Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi akun..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-700/20 active:scale-98 flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Memverifikasi...' : `Masuk sebagai ${roleMeta.title}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Secure Institutional Help Footer (Replacing 1-click test access) */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center space-y-1">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Butuh bantuan akses akun atau lupa kata sandi?</span>
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Silakan hubungi Guru Pengampu PAI atau Administrator IT SMKN 1 Sidayu Gresik.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-slate-400 border-t border-slate-200/80 dark:border-slate-800">
        PAI-Waris Digital • SMK Negeri 1 Sidayu Gresik © 2026 • Kurikulum Fiqih Mawaris Syafi'iyyah
      </footer>
    </div>
  );
};
