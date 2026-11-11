import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, UserRole } from '../../types';
import {
  ShieldCheck,
  UserPlus,
  Search,
  KeyRound,
  Trash2,
  Edit2,
  Shield,
  Check,
  X,
  School,
  Lock,
  User as UserIcon,
  Award,
} from 'lucide-react';

export const ManajemenGuru: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, resetPassword, currentUser } = useAuth();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<{
    nama: string;
    username: string;
    password: string;
    kelas: string;
    role: 'guru' | 'admin';
  }>({
    nama: '',
    username: '',
    password: '',
    kelas: 'Guru PAI & Budi Pekerti',
    role: 'guru',
  });

  const teacherList = users.filter(u => u.role === 'guru' || u.role === 'admin');

  const filteredTeachers = teacherList.filter(t =>
    t.nama.toLowerCase().includes(search.toLowerCase()) ||
    t.username.toLowerCase().includes(search.toLowerCase()) ||
    (t.kelas && t.kelas.toLowerCase().includes(search.toLowerCase())) ||
    t.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      nama: '',
      username: '',
      password: 'guru' + Math.floor(100 + Math.random() * 900),
      kelas: 'Guru PAI & Budi Pekerti',
      role: 'guru',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      nama: user.nama,
      username: user.username,
      password: user.password || 'guru123',
      kelas: user.kelas || (user.role === 'admin' ? 'Administrator IT' : 'Guru PAI & Budi Pekerti'),
      role: user.role === 'admin' ? 'admin' : 'guru',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama.trim() || !formData.username.trim() || !formData.password.trim()) {
      showToast('warning', 'Data Belum Lengkap', 'Nama, username, dan password wajib diisi.');
      return;
    }

    // Check duplicate username
    const normalizedUsername = formData.username.trim().toLowerCase();
    const existing = users.find(
      u => u.username.toLowerCase() === normalizedUsername && u.id !== editingUser?.id
    );
    if (existing) {
      showToast('error', 'Username Sudah Dipakai', 'Silakan gunakan username lain.');
      return;
    }

    try {
      if (editingUser) {
        await updateUser({
          ...editingUser,
          nama: formData.nama.trim(),
          username: normalizedUsername,
          password: formData.password.trim(),
          kelas: formData.kelas.trim(),
          role: formData.role,
        });
        showToast('success', 'Akun Diperbarui', `Data ${formData.nama} berhasil disimpan.`);
      } else {
        await addUser({
          nama: formData.nama.trim(),
          username: normalizedUsername,
          password: formData.password.trim(),
          kelas: formData.kelas.trim() || (formData.role === 'admin' ? 'Administrator IT' : 'Guru PAI & Budi Pekerti'),
          role: formData.role,
          nomorAbsen: 0,
          xp: 0,
          level: 1,
          badges: formData.role === 'admin' ? ['Admin Sistem'] : ['Pengajar Faraidh'],
        });
        showToast('success', 'Akun Berhasil Ditambahkan', `Akun ${formData.role === 'admin' ? 'Admin' : 'Guru'} untuk ${formData.nama} siap digunakan login.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast('error', 'Gagal Menyimpan', err?.message || 'Terjadi kesalahan sistem.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (id === currentUser?.id) {
      showToast('error', 'Tidak Dapat Menghapus', 'Anda tidak dapat menghapus akun yang sedang digunakan saat ini.');
      return;
    }

    if (teacherList.length <= 1) {
      showToast('warning', 'Aksi Ditolak', 'Harus ada minimal satu akun Guru/Admin di dalam sistem.');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus akun ${name}? Tindakan ini permanen.`)) {
      await deleteUser(id);
      showToast('info', 'Akun Dihapus', `${name} telah dihapus dari sistem.`);
    }
  };

  const handleResetPass = async (id: string, name: string) => {
    const defaultPass = 'guru123';
    await resetPassword(id, defaultPass);
    showToast('success', 'Password Direset', `Password akun ${name} direset menjadi: ${defaultPass}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-amber-600 dark:text-amber-300 flex items-center justify-center shadow-xs shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Manajemen Akun Guru & Administrator
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                {teacherList.length} Akun Staf
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              SMKN 1 Sidayu Gresik • Tambah, edit peran akses pendidik atau admin, dan atur kata sandi akun.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 active:scale-98"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari akun guru / admin berdasarkan nama lengkap, username, atau penugasan..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs font-medium"
        />
      </div>

      {/* Table of Teachers & Admins */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200/80 dark:border-slate-700/80">
              <tr>
                <th className="p-3.5">No</th>
                <th className="p-3.5">Nama & Identitas</th>
                <th className="p-3.5">Peran Akun</th>
                <th className="p-3.5">Username Login</th>
                <th className="p-3.5">Password</th>
                <th className="p-3.5">Penugasan / Jabatan</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredTeachers.map((teacher, idx) => {
                const isCurrent = teacher.id === currentUser?.id;
                const isAdmin = teacher.role === 'admin';
                return (
                  <tr
                    key={teacher.id}
                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                      isCurrent ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                    }`}
                  >
                    <td className="p-3.5 font-mono text-slate-400 font-semibold">{idx + 1}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0 ${
                            isAdmin
                              ? 'bg-gradient-to-tr from-amber-600 to-amber-700'
                              : 'bg-gradient-to-tr from-emerald-600 to-teal-700'
                          }`}
                        >
                          {teacher.nama.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{teacher.nama}</span>
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-300">
                                Anda
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400">SMKN 1 Sidayu Gresik</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                          <ShieldCheck className="w-3 h-3 text-amber-500" /> Administrator
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                          <Award className="w-3 h-3 text-blue-500" /> Guru PAI
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      @{teacher.username}
                    </td>
                    <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">
                      {teacher.password || '******'}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                        {teacher.kelas || (isAdmin ? 'Admin IT' : 'Guru PAI')}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> Aktif
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleResetPass(teacher.id, teacher.nama)}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          title="Reset Password ke 'guru123'"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(teacher)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          title="Edit Akun"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher.id, teacher.nama)}
                          disabled={isCurrent}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isCurrent
                              ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                              : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40'
                          }`}
                          title={isCurrent ? 'Tidak dapat menghapus akun sendiri' : 'Hapus Akun'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL (Add / Edit Guru / Admin) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <h4 className="font-black text-sm text-slate-900 dark:text-white">
                  {editingUser ? 'Edit Data Akun Staf' : 'Tambah Akun Baru'}
                </h4>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Role Selection */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Peran Akun:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'guru', kelas: formData.kelas === 'Administrator IT' ? 'Guru PAI & Budi Pekerti' : formData.kelas })}
                    className={`p-2.5 rounded-xl border text-left font-bold flex items-center gap-2 transition-all ${
                      formData.role === 'guru'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Award className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-xs">Guru PAI</p>
                      <p className="text-[10px] text-slate-400 font-normal">Akses nilai & materi</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'admin', kelas: formData.kelas === 'Guru PAI & Budi Pekerti' ? 'Administrator IT' : formData.kelas })}
                    className={`p-2.5 rounded-xl border text-left font-bold flex items-center gap-2 transition-all ${
                      formData.role === 'admin'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="text-xs">Administrator</p>
                      <p className="text-[10px] text-slate-400 font-normal">Akses penuh sistem</p>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap & Gelar Akademik:
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={e => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Drs. H. Ahmad Fauzan, M.Pd.I"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jabatan / Penugasan:
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.kelas}
                    onChange={e => setFormData({ ...formData, kelas: e.target.value })}
                    placeholder={formData.role === 'admin' ? 'Administrator IT & Sistem' : 'Guru PAI & Budi Pekerti'}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Username Login:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                    placeholder={formData.role === 'admin' ? 'admin_fauzan' : 'guru_fauzan'}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Password Akun:
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Password login"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                Akun ini memiliki hak akses sesuai perannya untuk memantau kemajuan belajar siswa, mengelola data, modul pembelajaran, dan laporan resmi SMKN 1 Sidayu Gresik.
              </p>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Akun</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
