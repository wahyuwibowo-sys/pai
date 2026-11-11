import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Material } from '../../types';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Search,
  FileText,
  Image,
  Link2,
  X,
  Bookmark,
} from 'lucide-react';

export const ManajemenMateri: React.FC = () => {
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useAuth();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMat, setEditingMat] = useState<Material | null>(null);

  const [formData, setFormData] = useState({
    judul: '',
    kategori: 'Pengertian' as Material['kategori'],
    ringkasan: '',
    isi: '',
    dalil: '',
    gambarUrl: '',
    pdfUrl: '',
    urutan: 1,
  });

  const categories: Material['kategori'][] = [
    'Pengertian',
    'Rukun & Syarat',
    'Sebab Mewarisi',
    'Hijab & Mahjub',
    'Bagian Ahli Waris',
    'Kasus Khusus',
  ];

  const filteredMaterials = materials.filter(m =>
    m.judul.toLowerCase().includes(search.toLowerCase()) ||
    m.kategori.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingMat(null);
    setFormData({
      judul: '',
      kategori: 'Pengertian',
      ringkasan: '',
      isi: '',
      dalil: '',
      gambarUrl: '',
      pdfUrl: '',
      urutan: materials.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Material) => {
    setEditingMat(m);
    setFormData({
      judul: m.judul,
      kategori: m.kategori,
      ringkasan: m.ringkasan,
      isi: m.isi,
      dalil: m.dalil || '',
      gambarUrl: m.gambarUrl || '',
      pdfUrl: m.pdfUrl || '',
      urutan: m.urutan,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.judul.trim() || !formData.isi.trim()) {
      showToast('warning', 'Data Kurang', 'Judul dan isi materi wajib diisi.');
      return;
    }

    if (editingMat) {
      await updateMaterial({
        ...editingMat,
        judul: formData.judul,
        kategori: formData.kategori,
        ringkasan: formData.ringkasan,
        isi: formData.isi,
        dalil: formData.dalil,
        gambarUrl: formData.gambarUrl,
        pdfUrl: formData.pdfUrl,
        urutan: Number(formData.urutan),
      });
      showToast('success', 'Materi Diperbarui', `Materi "${formData.judul}" berhasil diubah.`);
    } else {
      await addMaterial({
        judul: formData.judul,
        kategori: formData.kategori,
        ringkasan: formData.ringkasan,
        isi: formData.isi,
        dalil: formData.dalil,
        gambarUrl: formData.gambarUrl,
        pdfUrl: formData.pdfUrl,
        urutan: Number(formData.urutan),
      });
      showToast('success', 'Materi Dibuat', `Materi baru berhasil dipublikasikan.`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, judul: string) => {
    if (confirm(`Hapus materi "${judul}"?`)) {
      await deleteMaterial(id);
      showToast('info', 'Materi Dihapus', `Materi telah dihapus.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Manajemen Materi Pembelajaran Faraidh ({materials.length} Bab)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Susun modul pembelajaran, input dalil Al-Qur'an & Hadits, gambar ilustrasi, atau tautan PDF.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Buat Materi Baru
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari judul materi atau kategori..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs"
        />
      </div>

      {/* Materials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMaterials.map(mat => (
          <div
            key={mat.id}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {mat.kategori}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Bab #{mat.urutan}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {mat.judul}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {mat.ringkasan}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> {mat.isi.length} Karakter
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(mat)}
                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                  title="Edit Materi"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(mat.id, mat.judul)}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  title="Hapus Materi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in-50">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingMat ? 'Edit Materi Pembelajaran' : 'Buat Materi Baru'}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Judul Materi:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.judul}
                    onChange={e => setFormData({ ...formData, judul: e.target.value })}
                    placeholder="Contoh: Rukun dan Syarat Waris dalam Islam"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori:
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={e => setFormData({ ...formData, kategori: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ringkasan Singkat:
                </label>
                <input
                  type="text"
                  value={formData.ringkasan}
                  onChange={e => setFormData({ ...formData, ringkasan: e.target.value })}
                  placeholder="Ringkasan 1-2 kalimat untuk preview siswa..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Landasan Dalil (Ayat Al-Qur'an / Hadits):
                </label>
                <textarea
                  rows={2}
                  value={formData.dalil}
                  onChange={e => setFormData({ ...formData, dalil: e.target.value })}
                  placeholder="Ketik teks Arab dan terjemahnya..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-serif text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Isi Materi Lengkap (Mendukung Markdown):
                </label>
                <textarea
                  rows={6}
                  required
                  value={formData.isi}
                  onChange={e => setFormData({ ...formData, isi: e.target.value })}
                  placeholder="Gunakan ### untuk judul sub-bab, > untuk kutipan..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    URL Gambar Ilustrasi:
                  </label>
                  <input
                    type="url"
                    value={formData.gambarUrl}
                    onChange={e => setFormData({ ...formData, gambarUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    URL Dokumen PDF / Modul:
                  </label>
                  <input
                    type="url"
                    value={formData.pdfUrl}
                    onChange={e => setFormData({ ...formData, pdfUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Simpan Materi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
