import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Moon,
  Sun,
  User,
  Shield,
  GraduationCap,
  LogOut,
  Sparkles,
  Users,
  Award,
} from 'lucide-react';

import { UserRole } from '../types';

interface NavbarProps {
  onOpenLogin: () => void;
  activeRoleView: UserRole;
  setActiveRoleView: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLogin,
  activeRoleView,
  setActiveRoleView,
}) => {
  const { currentUser, logout, users, switchUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);

  const isTeacher = currentUser?.role === 'guru';

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-emerald-900/10 dark:border-emerald-500/20 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center text-amber-300 shadow-md shadow-emerald-900/20 border border-emerald-400/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-700 dark:from-emerald-400 dark:via-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
                PAI-Waris Digital
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                Faraidh SMA/SMK
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Simulasi & Pembelajaran Interaktif Ilmu Waris Islam
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Quick Account Switcher for Demo/Testing */}
          <div className="relative">
            <button
              onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
              title="Ganti Akun Cepat (Testing)"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">Ganti Akun</span>
            </button>

            {showSwitchDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in-50">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase">
                    Pilih Akun Pengujian
                  </p>
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setActiveRoleView(u.role);
                        setShowSwitchDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors ${
                        currentUser?.id === u.id ? 'bg-emerald-50/80 dark:bg-emerald-950/40 font-bold text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="truncate">
                        <p className="truncate text-xs">{u.nama}</p>
                        <p className="text-[10px] text-slate-400">
                          {u.role === 'guru' ? 'Guru / Admin' : `${u.kelas} • @${u.username}`}
                        </p>
                      </div>
                      {u.role === 'guru' ? (
                        <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-2" />
                      ) : (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono shrink-0 ml-2">
                          {u.xp || 0} XP
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Current User Pill */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-1 sm:pl-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[140px]">
                  {currentUser.nama}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1 font-medium">
                  {isTeacher ? (
                    <>
                      <Shield className="w-3 h-3 text-amber-500 inline" /> Guru PAI (Admin)
                    </>
                  ) : (
                    <>
                      <Award className="w-3 h-3 text-amber-500 inline" /> {currentUser.kelas} • Lvl {currentUser.level || 1}
                    </>
                  )}
                </span>
              </div>

              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-emerald-500/30">
                {currentUser.nama.charAt(0)}
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <User className="w-3.5 h-3.5" />
              Masuk
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
