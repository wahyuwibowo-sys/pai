import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Question, QuestionType, DifficultyLevel, QuestionCategory } from '../../types';
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  Search,
  Sliders,
  Settings,
  CheckCircle2,
  X,
} from 'lucide-react';

export const ManajemenSoal: React.FC = () => {
  const {
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    testDurationMinutes,
    testPassingScore,
    updateTestSettings,
  } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'bank' | 'pengaturan'>('bank');
  const [filterCategory, setFilterCategory] = useState<'Semua' | QuestionCategory>('Semua');
  const [search, setSearch] = useState('');

  // Settings State
  const [durationInput, setDurationInput] = useState(testDurationMinutes);
  const [passingScoreInput, setPassingScoreInput] = useState(testPassingScore);

  // Question Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | null>(null);

  const [formData, setFormData] = useState({
    tipe: 'pilihan_ganda' as QuestionType,
    kategori: 'latihan' as QuestionCategory,
    soal: '',
    opsiA: '',
    opsiB: '',
    opsiC: '',
    opsiD: '',
    jawaban: '',
    pembahasan: '',
    skor: 20,
    tingkatKesulitan: 'sedang' as DifficultyLevel,
  });

  const filteredQuestions = questions.filter(q => {
    const matchCat = filterCategory === 'Semua' || q.kategori === filterCategory;
    const matchSearch = q.soal.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingQ(null);
    setFormData({
      tipe: 'pilihan_ganda',
      kategori: 'latihan',
      soal: '',
      opsiA: '',
      opsiB: '',
      opsiC: '',
      opsiD: '',
      jawaban: '',
      pembahasan: '',
      skor: 20,
      tingkatKesulitan: 'sedang',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQ(q);
    setFormData({
      tipe: q.tipe,
      kategori: q.kategori,
      soal: q.soal,
      opsiA: q.opsi?.[0] || '',
      opsiB: q.opsi?.[1] || '',
      opsiC: q.opsi?.[2] || '',
      opsiD: q.opsi?.[3] || '',
      jawaban: q.jawaban,
      pembahasan: q.pembahasan,
      skor: q.skor,
      tingkatKesulitan: q.tingkatKesulitan,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.soal.trim() || !formData.jawaban.trim()) {
      showToast('warning', 'Data Kurang', 'Soal dan kunci jawaban wajib diisi.');
      return;
    }

    let opsi: string[] | undefined = undefined;
    if (formData.tipe === 'pilihan_ganda' || formData.tipe === 'studi_kasus') {
      opsi = [formData.opsiA, formData.opsiB, formData.opsiC, formData.opsiD].filter(Boolean);
    } else if (formData.tipe === 'benar_salah') {
      opsi = ['Benar', 'Salah'];
    }

    if (editingQ) {
      await updateQuestion({
        ...editingQ,
        tipe: formData.tipe,
        kategori: formData.kategori,
        soal: formData.soal,
        opsi,
        jawaban: formData.jawaban,
        pembahasan: formData.pembahasan,
        skor: Number(formData.skor),
        tingkatKesulitan: formData.tingkatKesulitan,
      });
      showToast('success', 'Soal Diperbarui', 'Perubahan butir soal berhasil disimpan.');
    } else {
      await addQuestion({
        tipe: formData.tipe,
        kategori: formData.kategori,
        soal: formData.soal,
        opsi,
        jawaban: formData.jawaban,
        pembahasan: formData.pembahasan,
        skor: Number(formData.skor),
        tingkatKesulitan: formData.tingkatKesulitan,
      });
      showToast('success', 'Soal Ditambahkan', 'Butir soal baru berhasil dimasukkan ke bank soal.');
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus butir soal ini?')) {
      await deleteQuestion(id);
      showToast('info', 'Soal Dihapus', 'Soal telah dihapus dari bank.');
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateTestSettings(Number(durationInput), Number(passingScoreInput));
    showToast('success', 'Pengaturan Disimpan', 'Durasi dan KKM Ujian Kemampuan telah diperbarui.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            Bank Soal & Manajemen Paket Uji Kemampuan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kelola soal pilihan ganda, benar/salah, isian, serta atur durasi dan batas kelulusan (KKM).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab(activeTab === 'bank' ? 'pengaturan' : 'bank')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              activeTab === 'pengaturan'
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            Pengaturan Ujian
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Soal
          </button>
        </div>
      </div>

      {activeTab === 'pengaturan' ? (
        /* TEST SETTINGS PANEL */
        <div className="max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            Pengaturan Paket Tes & Standar Kelulusan (KKM)
          </h4>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Durasi Waktu Ujian (Menit):
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={durationInput}
                onChange={e => setDurationInput(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Hitung mundur timer pada sesi siswa akan disesuaikan dengan nilai ini.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Standar Kriteria Ketuntasan Minimal (KKM):
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={passingScoreInput}
                onChange={e => setPassingScoreInput(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Siswa dengan nilai &gt;= KKM akan mendapatkan status "TUNTAS".
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
              >
                Simpan Konfigurasi Ujian
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* QUESTION BANK LIST */
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari teks soal..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs"
              />
            </div>

            <div className="flex gap-2">
              {(['Semua', 'latihan', 'uji_kemampuan'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    filterCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {cat === 'Semua' ? 'Semua' : cat === 'latihan' ? 'Latihan' : 'Uji Kemampuan'}
                </button>
              ))}
            </div>
          </div>

          {/* Question Cards */}
          <div className="space-y-3">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-500">#{idx + 1}</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase">
                      {q.kategori.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold">
                      {q.tipe.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                      Tingkat: {q.tingkatKesulitan}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-600">
                      Skor: {q.skor}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(q)}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {q.soal}
                </p>

                {q.opsi && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {q.opsi.map((op, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2 rounded-xl border ${
                          op === q.jawaban
                            ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 font-bold text-emerald-800 dark:text-emerald-300'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="font-bold mr-1">{String.fromCharCode(65 + oIdx)}.</span> {op}
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                  <p className="font-bold text-emerald-700 dark:text-emerald-400">
                    Kunci Jawaban: {q.jawaban}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Pembahasan: {q.pembahasan}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUESTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in-50">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingQ ? 'Edit Soal' : 'Tambah Soal Baru'}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori:
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={e => setFormData({ ...formData, kategori: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <option value="latihan">Latihan Soal</option>
                    <option value="uji_kemampuan">Uji Kemampuan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipe Soal:
                  </label>
                  <select
                    value={formData.tipe}
                    onChange={e => setFormData({ ...formData, tipe: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <option value="pilihan_ganda">Pilihan Ganda</option>
                    <option value="benar_salah">Benar / Salah</option>
                    <option value="isian">Isian Singkat</option>
                    <option value="studi_kasus">Studi Kasus</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kesulitan:
                  </label>
                  <select
                    value={formData.tingkatKesulitan}
                    onChange={e => setFormData({ ...formData, tingkatKesulitan: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <option value="mudah">Mudah</option>
                    <option value="sedang">Sedang</option>
                    <option value="sulit">Sulit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pertanyaan / Kasus Waris:
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.soal}
                  onChange={e => setFormData({ ...formData, soal: e.target.value })}
                  placeholder="Ketik deskripsi soal waris..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              {(formData.tipe === 'pilihan_ganda' || formData.tipe === 'studi_kasus') && (
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Opsi Pilihan Jawaban:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Opsi A"
                      value={formData.opsiA}
                      onChange={e => setFormData({ ...formData, opsiA: e.target.value })}
                      className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                    <input
                      type="text"
                      placeholder="Opsi B"
                      value={formData.opsiB}
                      onChange={e => setFormData({ ...formData, opsiB: e.target.value })}
                      className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                    <input
                      type="text"
                      placeholder="Opsi C"
                      value={formData.opsiC}
                      onChange={e => setFormData({ ...formData, opsiC: e.target.value })}
                      className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                    <input
                      type="text"
                      placeholder="Opsi D"
                      value={formData.opsiD}
                      onChange={e => setFormData({ ...formData, opsiD: e.target.value })}
                      className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kunci Jawaban Tepat:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jawaban}
                    onChange={e => setFormData({ ...formData, jawaban: e.target.value })}
                    placeholder="Contoh: 1/8 atau Benar"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bobot Skor Poin:
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={formData.skor}
                    onChange={e => setFormData({ ...formData, skor: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pembahasan Faraidh Lengkap:
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.pembahasan}
                  onChange={e => setFormData({ ...formData, pembahasan: e.target.value })}
                  placeholder="Jelaskan alasan fiqih dan dalilnya..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
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
                  Simpan Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
