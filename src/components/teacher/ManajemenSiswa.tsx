import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User } from '../../types';
import {
  UserPlus,
  Search,
  KeyRound,
  Trash2,
  Edit2,
  Users,
  ShieldAlert,
  Check,
  X,
  UploadCloud,
} from 'lucide-react';

interface ManajemenSiswaProps {
  onNavigateToImport?: () => void;
}

export const ManajemenSiswa: React.FC<ManajemenSiswaProps> = ({ onNavigateToImport }) => {
  const { users, addUser, updateUser, deleteUser, resetPassword } = useAuth();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('Semua');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    password: '',
    kelas: 'XII RPL 1',
    nomorAbsen: 1,
  });

  const studentList = users.filter(u => u.role === 'siswa');
  const classList = ['Semua', ...Array.from(new Set(studentList.map(s => s.kelas)))];

  const filteredStudents = studentList.filter(s => {
    const matchClass = filterClass === 'Semua' || s.kelas === filterClass;
    const matchSearch =
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.username.toLowerCase().includes(search.toLowerCase());
    return matchClass && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      nama: '',
      username: '',
      password: '123',
      kelas: 'XII RPL 1',
      nomorAbsen: studentList.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      nama: user.nama,
      username: user.username,
      password: user.password || '123',
      kelas: user.kelas,
      nomorAbsen: user.nomorAbsen || 1,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama.trim() || !formData.username.trim()) {
      showToast('warning', 'Data Belum Lengkap', 'Nama dan username wajib diisi.');
      return;
    }

    if (editingUser) {
      await updateUser({
        ...editingUser,
        nama: formData.nama,
        username: formData.username,
        password: formData.password,
        kelas: formData.kelas,
        nomorAbsen: Number(formData.nomorAbsen),
      });
      showToast('success', 'Siswa Diperbarui', `Data ${formData.nama} berhasil diubah.`);
    } else {
      await addUser({
        nama: formData.nama,
        username: formData.username,
        password: formData.password || '123',
        kelas: formData.kelas,
        nomorAbsen: Number(formData.nomorAbsen),
        role: 'siswa',
        xp: 0,
        level: 1,
        badges: ['Pemula Waris'],
      });
      showToast('success', 'Siswa Ditambahkan', `Akun untuk ${formData.nama} berhasil dibuat.`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data siswa ${name}?`)) {
      await deleteUser(id);
      showToast('info', 'Siswa Dihapus', `${name} telah dihapus dari sistem.`);
    }
  };

  const handleResetPass = async (id: string, name: string) => {
    const defaultPass = '123456';
    await resetPassword(id, defaultPass);
    showToast('success', 'Password Direset', `Password ${name} direset menjadi: ${defaultPass}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Manajemen Akun Siswa ({studentList.length} Terdaftar)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kelola data akun siswa, kelas, nomor absen, dan reset password login siswa.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onNavigateToImport && (
            <button
              type="button"
              onClick={onNavigateToImport}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all shadow-xs"
              title="Buka menu impor massal siswa dari Excel atau CSV"
            >
              <UploadCloud className="w-4 h-4 text-emerald-600" />
              <span>Impor Excel</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Siswa Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama atau username siswa..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs"
          />
        </div>

        <select
          value={filterClass}
          onChange={e => setFilterClass(e.target.value)}
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 shadow-xs font-semibold"
        >
          {classList.map(c => (
            <option key={c} value={c}>
              {c === 'Semua' ? 'Semua Kelas' : `Kelas ${c}`}
            </option>
          ))}
        </select>
      </div>

      {/* Table of Students */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Absen</th>
                <th className="p-3.5">Nama Siswa</th>
                <th className="p-3.5">Username</th>
                <th className="p-3.5">Password</th>
                <th className="p-3.5">Kelas</th>
                <th className="p-3.5">XP & Level</th>
                <th className="p-3.5 text-center">Aksi Guru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-slate-500">
                    #{student.nomorAbsen || 1}
                  </td>
                  <td className="p-3.5 font-bold">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                        {student.nama.charAt(0)}
                      </div>
                      <span>{student.nama}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                    @{student.username}
                  </td>
                  <td className="p-3.5 font-mono text-slate-500">
                    {student.password || '123'}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 font-semibold text-[10px]">
                      {student.kelas}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-amber-500 font-bold">
                    {student.xp || 0} XP (Lvl {student.level || 1})
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleResetPass(student.id, student.nama)}
                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                        title="Reset Password ke '123456'"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(student)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                        title="Edit Data Siswa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id, student.nama)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Hapus Siswa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL (Add / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in-50">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingUser ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Siswa:
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={e => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Muhammad Ihsan"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Username:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="m_ihsan"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password Awal:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="123"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kelas:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.kelas}
                    onChange={e => setFormData({ ...formData, kelas: e.target.value })}
                    placeholder="XII RPL 1"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor Absen:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.nomorAbsen}
                    onChange={e => setFormData({ ...formData, nomorAbsen: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
