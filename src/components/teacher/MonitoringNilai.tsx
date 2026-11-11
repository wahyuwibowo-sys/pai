import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ExamResult } from '../../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  FileText,
  Filter,
  Search,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Download,
  Send,
  Eye,
} from 'lucide-react';

export const MonitoringNilai: React.FC = () => {
  const { results, users, addTeacherFeedback, testPassingScore } = useAuth();
  const { showToast } = useToast();

  const [selectedClass, setSelectedClass] = useState<string>('Semua');
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');

  // Feedback Modal
  const [feedbackTarget, setFeedbackTarget] = useState<ExamResult | null>(null);
  const [feedbackInput, setFeedbackInput] = useState<string>('');

  const studentUsers = users.filter(u => u.role === 'siswa');
  const classList = ['Semua', ...Array.from(new Set(studentUsers.map(s => s.kelas)))];

  // Filtered Results
  const filteredResults = results.filter(res => {
    const matchClass = selectedClass === 'Semua' || res.kelas === selectedClass;
    const matchName = res.namaSiswa.toLowerCase().includes(searchStudent.toLowerCase());
    const matchDate = !filterDate || res.tanggal.startsWith(filterDate);
    return matchClass && matchName && matchDate;
  });

  const handleOpenFeedback = (res: ExamResult) => {
    setFeedbackTarget(res);
    setFeedbackInput(res.feedbackGuru || '');
  };

  const handleSaveFeedback = async () => {
    if (!feedbackTarget) return;
    await addTeacherFeedback(feedbackTarget.id, feedbackInput);
    showToast('success', 'Feedback Disimpan', `Catatan guru untuk ${feedbackTarget.namaSiswa} telah diperbarui.`);
    setFeedbackTarget(null);
  };

  // EXPORT EXCEL
  const handleExportExcel = () => {
    const dataForExcel = filteredResults.map((r, i) => ({
      No: i + 1,
      'Nama Siswa': r.namaSiswa,
      Kelas: r.kelas,
      'Tipe Ujian': r.tipe === 'uji_kemampuan' ? 'Uji Kemampuan' : 'Latihan',
      Nilai: r.nilai,
      'Jumlah Benar': r.jumlahBenar,
      'Jumlah Salah': r.jumlahSalah,
      'Status Kelulusan': r.statusTuntas ? 'TUNTAS' : 'BELUM TUNTAS',
      'Tanggal Pelaksanaan': r.tanggal,
      'Feedback Guru': r.feedbackGuru || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Faraidh');
    XLSX.writeFile(workbook, `Laporan_Nilai_PAI_Waris_${selectedClass}_${new Date().toISOString().split('T')[0]}.xlsx`);

    showToast('success', 'Excel Berhasil Diunduh', 'File laporan spreadsheet (.xlsx) siap digunakan.');
  };

  // EXPORT PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Header KOP Surat Sekolah
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('SMK NEGERI 1 SIDAYU GRESIK', 105, 18, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('REKAPITULASI HASIL EVALUASI PEMBELAJARAN PAI & BUDI PEKERTI', 105, 25, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Materi: Faraidh (Simulasi Pembagian Harta Waris Islam) | KKM: 75', 105, 31, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(14, 34, 196, 34);

    // Meta details
    doc.setFontSize(9);
    doc.text(`Filter Kelas: ${selectedClass}`, 14, 40);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`, 196, 40, { align: 'right' });

    // Table
    const tableData = filteredResults.map((r, i) => [
      i + 1,
      r.namaSiswa,
      r.kelas,
      r.tipe === 'uji_kemampuan' ? 'Tes Resmi' : 'Latihan',
      r.nilai,
      r.statusTuntas ? 'TUNTAS' : 'REMEDIAL',
      r.feedbackGuru || '-',
    ]);

    autoTable(doc, {
      startY: 44,
      head: [['No', 'Nama Siswa', 'Kelas', 'Kategori', 'Nilai', 'Status KKM', 'Catatan Guru']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [4, 120, 87], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 },
    });

    // Signature Footer
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(9);
    doc.text('Mengetahui,', 145, finalY + 15);
    doc.text('Guru Mata Pelajaran PAI', 145, finalY + 20);
    doc.setFont('helvetica', 'bold');
    doc.text('H. Ahmad Heru Santoso, M.Pd.I', 145, finalY + 38);
    doc.setFont('helvetica', 'normal');
    doc.text('NIP. 19850412 201001 1 012', 145, finalY + 43);

    doc.save(`Laporan_Nilai_PAI_Waris_${selectedClass}.pdf`);
    showToast('success', 'PDF Berhasil Dibuat', 'Laporan resmi format cetak (.pdf) telah diunduh.');
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Tabel Monitoring & Penilaian Guru
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pantau hasil latihan, nilai ujian, serta berikan catatan dan feedback perbaikan langsung ke siswa.
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Download Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Filter per kelas */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Filter Kelas:
            </label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-semibold"
            >
              {classList.map(c => (
                <option key={c} value={c}>
                  {c === 'Semua' ? 'Semua Kelas' : `Kelas ${c}`}
                </option>
              ))}
            </select>
          </div>

          {/* Search by student name */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Cari Nama Siswa:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchStudent}
                onChange={e => setSearchStudent(e.target.value)}
                placeholder="Ketik nama siswa..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Filter date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Filter Tanggal:
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Monitoring Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Nama Siswa</th>
                <th className="p-3.5">Kelas</th>
                <th className="p-3.5">Tipe Tes</th>
                <th className="p-3.5 text-center">Benar / Salah</th>
                <th className="p-3.5 text-center">Nilai</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Feedback Guru</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredResults.length > 0 ? (
                filteredResults.map(res => (
                  <tr key={res.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold">{res.namaSiswa}</td>
                    <td className="p-3.5 text-slate-500">{res.kelas}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold uppercase">
                        {res.tipe === 'uji_kemampuan' ? 'Uji Kemampuan' : 'Latihan'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-mono">
                      <span className="text-emerald-600 font-bold">{res.jumlahBenar}</span> /{' '}
                      <span className="text-red-500 font-bold">{res.jumlahSalah}</span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                        {res.nilai}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          res.statusTuntas
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                        }`}
                      >
                        {res.statusTuntas ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> TUNTAS
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> BELUM
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono text-[10px]">
                      {res.tanggal}
                    </td>
                    <td className="p-3.5 max-w-[200px]">
                      {res.feedbackGuru ? (
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300 line-clamp-2 italic">
                          "{res.feedbackGuru}"
                        </p>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Belum ada feedback</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleOpenFeedback(res)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors flex items-center gap-1 mx-auto"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Beri Feedback
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Tidak ditemukan data hasil yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FEEDBACK MODAL */}
      {feedbackTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in-50">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-emerald-600/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Beri Feedback & Catatan Perbaikan
                </h4>
                <p className="text-xs text-slate-500">
                  Siswa: <span className="font-bold text-emerald-600">{feedbackTarget.namaSiswa}</span> ({feedbackTarget.kelas}) • Nilai: {feedbackTarget.nilai}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Catatan Evaluasi Guru:
              </label>
              <textarea
                rows={4}
                value={feedbackInput}
                onChange={e => setFeedbackInput(e.target.value)}
                placeholder="Tuliskan apresiasi, materi yang perlu diulang (remedial), atau catatan penguatan fiqih..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFeedbackTarget(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveFeedback}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Simpan Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
