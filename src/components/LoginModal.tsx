import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types';
import { X, Lock, User as UserIcon } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, users } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Masukkan username');
      return;
    }

    const res = login(username, password);
    if (res.success) {
      showToast('success', 'Berhasil Masuk!', `Selamat datang kembali.`);
      const found = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
      onSuccess(found?.role || 'siswa');
      onClose();
    } else {
      setError(res.message || 'Login gagal.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in-50">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-emerald-600/30 dark:border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-emerald-100 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-950/40 border border-amber-400/40 flex items-center justify-center text-amber-300 mb-3 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Masuk ke PAI-Waris Digital</h3>
          <p className="text-xs text-emerald-100 mt-1">
            Gunakan akun yang telah didaftarkan oleh Guru PAI
          </p>
        </div>

        {/* Modal Form */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Contoh: ahmad_fauzi atau guru_ahmad"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-700/20"
            >
              Masuk Sekarang
            </button>
          </form>

          {/* Help Notice */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Lupa kata sandi? Hubungi Guru PAI atau Administrator Sekolah.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
