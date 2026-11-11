import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, UserRole } from '../../types';
import * as XLSX from 'xlsx';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Award,
  ShieldCheck,
  FileText,
  Trash2,
  RefreshCw,
  ArrowRight,
  ClipboardCheck,
  Info,
} from 'lucide-react';

interface ParsedUserRow {
  idTemp: string;
  nama: string;
  username: string;
  password: string;
  kelas: string;
  nomorAbsen?: number;
  role: 'siswa' | 'guru' | 'admin';
  isValid: boolean;
  isDuplicate: boolean;
  errorMessage?: string;
}

interface ImporUserProps {
  onNavigateToTab?: (tabId: string) => void;
  initialMode?: 'siswa' | 'guru';
}

export const ImporUser: React.FC<ImporUserProps> = ({
  onNavigateToTab,
  initialMode = 'siswa',
}) => {
  const { users, addUsersBulk } = useAuth();
  const { showToast } = useToast();

  const [targetRole, setTargetRole] = useState<'siswa' | 'guru'>(initialMode);
  const [parsedRows, setParsedRows] = useState<ParsedUserRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<{ count: number; failed: number } | null>(null);

  // Paste Text input state
  const [isPasteMode, setIsPasteMode] = useState<boolean>(false);
  const [pasteContent, setPasteContent] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Existing usernames set for rapid duplicate lookup
  const existingUsernames = new Set(users.map(u => u.username.toLowerCase()));

  // Normalize column keys
  const normalizeKey = (key: string): string => {
    return key.trim().toLowerCase().replace(/[\s_-]+/g, '');
  };

  // Process raw object rows from Excel / CSV
  const processRawData = (rows: Record<string, any>[]) => {
    if (!rows || rows.length === 0) {
      showToast('warning', 'File Kosong', 'Tidak ditemukan baris data di file yang diunggah.');
      return;
    }

    const currentBatchUsernames = new Set<string>();

    const processed: ParsedUserRow[] = rows.map((row, idx) => {
      // Find matching keys
      const keys = Object.keys(row);

      const findVal = (possibleKeys: string[]): any => {
        for (const k of keys) {
          const norm = normalizeKey(k);
          if (possibleKeys.includes(norm)) {
            return row[k];
          }
        }
        return undefined;
      };

      const rawNama = findVal(['nama', 'namalengkap', 'namasiswa', 'namapendidik', 'name', 'fullname']) || '';
      const rawUser = findVal(['username', 'nisn', 'nis', 'user', 'id', 'nip', 'akun']) || '';
      const rawPass = findVal(['password', 'katasandi', 'pass', 'pin']) || '';
      const rawKelas = findVal(['kelas', 'rombel', 'tingkat', 'jurusan', 'jabatan', 'instansi', 'unit']) || '';
      const rawAbsen = findVal(['nomorabsen', 'noabsen', 'absen', 'no']) || '';
      const rawRole = findVal(['role', 'peran', 'status', 'tipe']) || '';

      const nama = String(rawNama).trim();
      let username = String(rawUser).trim().toLowerCase().replace(/\s+/g, '_');

      // If username is empty but nama exists, generate basic username
      if (!username && nama) {
        username = nama.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 15) + (idx + 1);
      }

      // Default password
      let defaultPassword = targetRole === 'siswa' ? '123' : 'guru123';
      const password = rawPass ? String(rawPass).trim() : defaultPassword;

      // Class / Role
      let kelas = rawKelas ? String(rawKelas).trim() : targetRole === 'siswa' ? 'XII RPL 1' : 'Guru PAI & Budi Pekerti';
      const nomorAbsen = rawAbsen && !isNaN(Number(rawAbsen)) ? Number(rawAbsen) : idx + 1;

      // Determine role
      let rowRole: 'siswa' | 'guru' | 'admin' = targetRole === 'siswa' ? 'siswa' : 'guru';
      if (targetRole === 'guru') {
        const normRole = String(rawRole).toLowerCase();
        if (normRole.includes('admin')) {
          rowRole = 'admin';
        } else {
          rowRole = 'guru';
        }
      }

      // Validation
      let isValid = true;
      let isDuplicate = false;
      let errorMessage = '';

      if (!nama) {
        isValid = false;
        errorMessage = 'Nama wajib diisi.';
      } else if (!username) {
        isValid = false;
        errorMessage = 'Username wajib diisi.';
      } else if (existingUsernames.has(username) || currentBatchUsernames.has(username)) {
        isDuplicate = true;
        isValid = false;
        errorMessage = 'Username sudah dipakai oleh pengguna lain.';
      } else {
        currentBatchUsernames.add(username);
      }

      return {
        idTemp: `temp-${idx}-${Date.now()}`,
        nama,
        username,
        password,
        kelas,
        nomorAbsen: targetRole === 'siswa' ? nomorAbsen : undefined,
        role: rowRole,
        isValid,
        isDuplicate,
        errorMessage,
      };
    });

    setParsedRows(processed);
    setImportResult(null);

    const validCount = processed.filter(p => p.isValid).length;
    showToast('info', 'File Terbaca', `${processed.length} baris terbaca (${validCount} siap diimpor).`);
  };

  // Handle file input change
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const buffer = event.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        processRawData(json);
      } catch (err: any) {
        console.error('Error parsing excel:', err);
        showToast('error', 'Gagal Membaca File', 'Pastikan format file Excel atau CSV valid.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
      setIsProcessing(true);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const buffer = event.target?.result;
          const workbook = XLSX.read(buffer, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          processRawData(json);
        } catch (err) {
          showToast('error', 'Format Tidak Didukung', 'Harap gunakan file Excel .xlsx atau CSV.');
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  // Process pasted text (Tab or Comma separated)
  const handleProcessPastedText = () => {
    if (!pasteContent.trim()) {
      showToast('warning', 'Teks Masih Kosong', 'Tempelkan data tabel terlebih dahulu.');
      return;
    }

    const lines = pasteContent.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return;

    // Detect separator
    const firstLine = lines[0];
    const isTab = firstLine.includes('\t');
    const separator = isTab ? '\t' : ',';

    const headers = firstLine.split(separator).map(h => h.trim().replace(/^["']|["']$/g, ''));

    // Check if first line is a header
    const hasHeader = headers.some(h => {
      const norm = normalizeKey(h);
      return ['nama', 'username', 'nisn', 'kelas', 'password'].includes(norm);
    });

    const dataLines = hasHeader ? lines.slice(1) : lines;
    const effectiveHeaders = hasHeader
      ? headers
      : targetRole === 'siswa'
      ? ['nama', 'username', 'password', 'kelas', 'nomorAbsen']
      : ['nama', 'username', 'password', 'kelas', 'role'];

    const rawObjects: Record<string, any>[] = dataLines.map(line => {
      const cells = line.split(separator).map(c => c.trim().replace(/^["']|["']$/g, ''));
      const obj: Record<string, any> = {};
      effectiveHeaders.forEach((h, i) => {
        obj[h] = cells[i] || '';
      });
      return obj;
    });

    setFileName('Pasted Data');
    processRawData(rawObjects);
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    let sampleData: any[] = [];

    if (targetRole === 'siswa') {
      sampleData = [
        {
          'Nama Siswa': 'Ahmad Fauzi Rahman',
          'Username': 'ahmad_fauzi',
          'Password': '123',
          'Kelas': 'XII RPL 1',
          'Nomor Absen': 1,
        },
        {
          'Nama Siswa': 'Aisyah Putri Azzahra',
          'Username': 'aisyah_putri',
          'Password': '123',
          'Kelas': 'XII RPL 1',
          'Nomor Absen': 2,
        },
        {
          'Nama Siswa': 'Danial Syahputra',
          'Username': 'danial_s',
          'Password': '123',
          'Kelas': 'XII TKJ 2',
          'Nomor Absen': 1,
        },
        {
          'Nama Siswa': 'Khadijah Marwah',
          'Username': 'khadijah_m',
          'Password': '123',
          'Kelas': 'XII OTKP 1',
          'Nomor Absen': 1,
        },
      ];
    } else {
      sampleData = [
        {
          'Nama Lengkap & Gelar': 'Drs. H. Ahmad Fauzan, M.Pd.I',
          'Username': 'guru_fauzan',
          'Password': 'guru123',
          'Jabatan': 'Guru PAI & Budi Pekerti',
          'Role': 'guru',
        },
        {
          'Nama Lengkap & Gelar': 'Siti Maryam, S.Ag',
          'Username': 'guru_maryam',
          'Password': 'guru123',
          'Jabatan': 'Guru Fiqih Mawaris',
          'Role': 'guru',
        },
        {
          'Nama Lengkap & Gelar': 'Admin Kurikulum SMKN 1 Sidayu',
          'Username': 'admin_kurikulum',
          'Password': 'admin123',
          'Jabatan': 'Administrator Kurikulum PAI',
          'Role': 'admin',
        },
      ];
    }

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, targetRole === 'siswa' ? 'Data_Siswa' : 'Data_Guru');

    const fileNameOutput =
      targetRole === 'siswa'
        ? 'Template_Impor_Siswa_SMKN1Sidayu.xlsx'
        : 'Template_Impor_Guru_Admin_SMKN1Sidayu.xlsx';

    XLSX.writeFile(workbook, fileNameOutput);
    showToast('success', 'Template Diunduh', `File ${fileNameOutput} berhasil disimpan.`);
  };

  // Remove a row from parsed table
  const handleRemoveRow = (idTemp: string) => {
    setParsedRows(prev => prev.filter(r => r.idTemp !== idTemp));
  };

  // Execute bulk import
  const handleConfirmImport = async () => {
    const readyToImport = parsedRows.filter(r => r.isValid);

    if (readyToImport.length === 0) {
      showToast('error', 'Tidak Ada Data Valid', 'Periksa kembali data Anda. Baris yang memiliki error atau username duplikat tidak dapat diimpor.');
      return;
    }

    setIsImporting(true);

    try {
      const payload: Omit<User, 'id' | 'createdAt'>[] = readyToImport.map(r => ({
        nama: r.nama,
        username: r.username,
        password: r.password,
        kelas: r.kelas,
        nomorAbsen: r.nomorAbsen,
        role: r.role,
        xp: 0,
        level: 1,
        badges:
          r.role === 'admin'
            ? ['Admin Sistem']
            : r.role === 'guru'
            ? ['Pengajar Faraidh']
            : ['Pemula Waris'],
      }));

      const res = await addUsersBulk(payload);
      setIsImporting(false);
      setImportResult(res);

      showToast(
        'success',
        'Impor Berhasil!',
        `Sebanyak ${res.count} pengguna baru berhasil ditambahkan ke database SMKN 1 Sidayu Gresik.`
      );

      // Clean rows or keep only failed
      setParsedRows(prev => prev.filter(r => !r.isValid));
    } catch (err: any) {
      setIsImporting(false);
      showToast('error', 'Gagal Mengimpor', err?.message || 'Terjadi gangguan koneksi saat menyimpan data.');
    }
  };

  // Reset state
  const handleReset = () => {
    setParsedRows([]);
    setFileName('');
    setImportResult(null);
    setPasteContent('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validRows = parsedRows.filter(r => r.isValid);
  const duplicateRows = parsedRows.filter(r => r.isDuplicate);
  const errorRows = parsedRows.filter(r => !r.isValid && !r.isDuplicate);

  return (
    <div className="space-y-6 animate-in fade-in-50 pb-12">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 shrink-0">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Impor Data Pengguna (Siswa & Guru)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                Excel & CSV
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              SMKN 1 Sidayu Gresik • Tambah akun siswa dan pendidik dalam jumlah banyak secara otomatis melalui file spreadsheet.
            </p>
          </div>
        </div>

        {/* Quick Navigation to User Management */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
            title="Download Template Format Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Unduh Template Excel</span>
          </button>
        </div>
      </div>

      {/* Target Role Selector Tabs */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setTargetRole('siswa');
              handleReset();
            }}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2.5 ${
              targetRole === 'siswa'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <div className="text-left">
              <p className="leading-tight">1. Impor Data Siswa</p>
              <p className="text-[10px] font-normal opacity-90 hidden sm:block">Nama, NISN/Username, Kelas, No Absen</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setTargetRole('guru');
              handleReset();
            }}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2.5 ${
              targetRole === 'guru'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <div className="text-left">
              <p className="leading-tight">2. Impor Data Guru & Administrator</p>
              <p className="text-[10px] font-normal opacity-90 hidden sm:block">Nama & Gelar, Username, Jabatan, Role</p>
            </div>
          </button>
        </div>
      </div>

      {/* Upload Zone & Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upload Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-4">
            {/* Toggle File vs Paste mode */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {isPasteMode ? 'Metode 2: Salin-Tempel dari Excel / Google Sheets' : 'Metode 1: Unggah Dokumen Excel (.xlsx) / CSV'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsPasteMode(!isPasteMode)}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                {isPasteMode ? 'Ganti ke Unggah File' : 'Ganti ke Salin-Tempel Teks'}
              </button>
            </div>

            {!isPasteMode ? (
              /* Drag & Drop Upload Container */
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-2xl p-8 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all space-y-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />

                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    {fileName ? `File Terpilih: ${fileName}` : 'Klik untuk memilih file atau geser (drag & drop) ke sini'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Mendukung format Microsoft Excel (.xlsx, .xls) dan CSV
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-xs">
                  <span>Pilih Dokumen dari Komputer</span>
                </div>
              </div>
            ) : (
              /* Paste text container */
              <div className="space-y-3">
                <textarea
                  rows={6}
                  value={pasteContent}
                  onChange={e => setPasteContent(e.target.value)}
                  placeholder={`Contoh salin baris langsung dari Excel:\n${
                    targetRole === 'siswa'
                      ? 'Muhammad Fauzi\tfauzi_m\t123\tXII RPL 1\t1\nSiti Rahma\trahma_s\t123\tXII RPL 1\t2'
                      : 'H. Ahmad Heru, M.Pd.I\tguru_ahmad\tguru123\tGuru PAI\tguru\nAdmin Sekolah\tadmin_it\tadmin123\tAdmin IT\tadmin'
                  }`}
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleProcessPastedText}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Proses Teks Hasil Salin
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Petunjuk & Template Guide */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 space-y-3.5 text-xs">
            <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Petunjuk Format Kolom:</span>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Pastikan file memiliki baris judul kolom di baris pertama. Sistem mengenali berbagai variasi nama kolom secara otomatis:
            </p>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                  1. Nama Lengkap <span className="text-red-500">*</span>
                </p>
                <p className="text-[10px] text-slate-500">Nama siswa atau nama guru dengan gelar.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                  2. Username / NISN <span className="text-red-500">*</span>
                </p>
                <p className="text-[10px] text-slate-500">ID unik untuk login (tanpa spasi, huruf kecil).</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                  3. Password (Opsional)
                </p>
                <p className="text-[10px] text-slate-500">
                  Default otomatis: {targetRole === 'siswa' ? '"123"' : '"guru123"'} jika dikosongkan.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                  4. {targetRole === 'siswa' ? 'Kelas & No Absen' : 'Jabatan & Role (guru/admin)'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {targetRole === 'siswa' ? 'Contoh: XII RPL 1, XII TKJ 2, dll.' : 'Contoh role: "guru" atau "admin".'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="w-full py-2.5 px-3 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-xl font-bold transition-all border border-emerald-300 dark:border-emerald-700 flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Template {targetRole === 'siswa' ? 'Siswa' : 'Guru'} (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Review & Preview Table Area (Visible when rows are parsed) */}
      {parsedRows.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4">
          {/* Header & Stats Counters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                <span>Pratinjau Data ({parsedRows.length} Baris Terbaca)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Periksa data sebelum mengimpor. Baris dengan status valid akan disimpan ke basis data.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300">
                {validRows.length} Siap Diimpor
              </span>

              {duplicateRows.length > 0 && (
                <span className="px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-300">
                  {duplicateRows.length} Duplikat
                </span>
              )}

              {errorRows.length > 0 && (
                <span className="px-2.5 py-1 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 font-bold text-xs border border-red-300">
                  {errorRows.length} Error
                </span>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                title="Batalkan & Muat Ulang File"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200/80 dark:border-slate-700/80">
                <tr>
                  <th className="p-3">No</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Nama Lengkap</th>
                  <th className="p-3">Username Login</th>
                  <th className="p-3">Password</th>
                  <th className="p-3">{targetRole === 'siswa' ? 'Kelas / Rombel' : 'Penugasan / Jabatan'}</th>
                  {targetRole === 'siswa' ? (
                    <th className="p-3">No. Absen</th>
                  ) : (
                    <th className="p-3">Peran (Role)</th>
                  )}
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {parsedRows.map((row, idx) => (
                  <tr
                    key={row.idTemp}
                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                      !row.isValid ? 'bg-red-50/30 dark:bg-red-950/20' : ''
                    }`}
                  >
                    <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Siap
                        </span>
                      ) : row.isDuplicate ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300" title={row.errorMessage}>
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> Duplikat
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300" title={row.errorMessage}>
                          <XCircle className="w-3 h-3 text-red-600" /> Error
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {row.nama || <span className="text-red-500 italic">Kosong</span>}
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      @{row.username}
                    </td>
                    <td className="p-3 font-mono text-slate-400">
                      {row.password}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
                        {row.kelas}
                      </span>
                    </td>
                    {targetRole === 'siswa' ? (
                      <td className="p-3 font-mono text-slate-500">{row.nomorAbsen || idx + 1}</td>
                    ) : (
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            row.role === 'admin'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {row.role === 'admin' ? 'Administrator' : 'Guru PAI'}
                        </span>
                      </td>
                    )}
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.idTemp)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                        title="Hapus baris ini dari daftar impor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500">
              {duplicateRows.length > 0 && `Perhatian: ${duplicateRows.length} baris duplikat akan dilewati secara otomatis.`}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isImporting || validRows.length === 0}
                onClick={handleConfirmImport}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md shadow-emerald-700/20 active:scale-98 flex items-center gap-2"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan ke Database...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Konfirmasi & Simpan {validRows.length} Akun</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Banner if import result exists */}
      {importResult && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                Impor Pengguna Berhasil Dilakukan
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Sebanyak {importResult.count} akun baru berhasil disimpan ke dalam sistem dan siap digunakan untuk login.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {onNavigateToTab && targetRole === 'siswa' && (
              <button
                type="button"
                onClick={() => onNavigateToTab('siswa')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                <span>Buka Manajemen Siswa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {onNavigateToTab && targetRole === 'guru' && (
              <button
                type="button"
                onClick={() => onNavigateToTab('guru_admin')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                <span>Buka Manajemen Guru</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-colors"
            >
              Impor File Baru
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
