import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, User, Lock, Building, FileText, Check, Shield } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUser } = useAuth();
  const { showToast } = useToast();

  const [nama, setNama] = useState(currentUser?.nama || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [password, setPassword] = useState(currentUser?.password || '');
  const [kelas, setKelas] = useState(currentUser?.kelas || 'Guru PAI & Budi Pekerti');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !username.trim()) {
      showToast('warning', 'Data Kurang', 'Nama dan username tidak boleh kosong.');
      return;
    }

    setIsLoading(true);
    try {
      await updateUser({
        ...currentUser,
        nama: nama.trim(),
        username: username.trim(),
        password: password.trim(),
        kelas: kelas.trim(),
      });
      showToast('success', 'Profil Diperbarui', 'Data akun pengajar berhasil disimpan.');
      onClose();
    } catch (err: any) {
      showToast('error', 'Gagal Menyimpan', err?.message || 'Terjadi kesalahan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Edit Profil Pengajar</h3>
              <p className="text-xs text-emerald-100">Kredensial Akun Administrator & Guru</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Nama Lengkap & Gelar:
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={nama}
                onChange={e => setNama(e.target.value)}
                placeholder="Contoh: H. Ahmad Heru Santoso, M.Pd.I"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Jabatan / Peran Pengajar:
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={kelas}
                onChange={e => setKelas(e.target.value)}
                placeholder="Guru PAI & Budi Pekerti"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Username Login:
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="guru_ahmad"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Password:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password akun"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
            Nama lengkap akan otomatis dicantumkan pada bagian tanda tangan laporan PDF yang diunduh.
          </p>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {isLoading ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
