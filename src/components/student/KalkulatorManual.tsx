import React, { useState } from 'react';
import { HeirInput, CalculationResult, HeirShare } from '../../types';
import { calculateFaraidh, formatRupiah } from '../../utils/faraidh';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  Calculator,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Scale,
  Award,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Eye,
  Check,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

interface ManualHeirRow {
  key: string;
  title: string;
  count: number;
  selectedFraction: string; // '1/2' | '1/4' | '1/8' | '2/3' | '1/3' | '1/6' | 'Ashabah' | 'Mahjub' | ''
  manualSaham: string; // number as string
  manualNominal: string; // number as string
}

interface CasePreset {
  id: string;
  name: string;
  deskripsi: string;
  tirkah: number;
  gender: 'laki' | 'perempuan';
  heirInput: HeirInput;
}

const PRESET_CASES: CasePreset[] = [
  {
    id: 'case-1',
    name: 'Kasus 1: Standar Keluarga Inti',
    deskripsi: 'Pewaris suami wafat meninggalkan Istri, 1 Anak Laki-laki, dan 1 Anak Perempuan.',
    tirkah: 120000000,
    gender: 'laki',
    heirInput: {
      suami: 0,
      istri: 1,
      ayah: false,
      ibu: false,
      anakLaki: 1,
      anakPerempuan: 1,
      cucuLaki: 0,
      cucuPerempuan: 0,
      kakek: false,
      nenek: false,
      saudaraLakiKandung: 0,
      saudaraPerempuanKandung: 0,
      saudaraSeibu: 0,
    },
  },
  {
    id: 'case-2',
    name: 'Kasus 2: Kasus \'Awal (Defisit Saham)',
    deskripsi: 'Istri wafat meninggalkan Suami dan 2 Saudara Perempuan Kandung (Kalalah).',
    tirkah: 60000000,
    gender: 'perempuan',
    heirInput: {
      suami: 1,
      istri: 0,
      ayah: false,
      ibu: false,
      anakLaki: 0,
      anakPerempuan: 0,
      cucuLaki: 0,
      cucuPerempuan: 0,
      kakek: false,
      nenek: false,
      saudaraLakiKandung: 0,
      saudaraPerempuanKandung: 2,
      saudaraSeibu: 0,
    },
  },
  {
    id: 'case-3',
    name: 'Kasus 3: Pasangan, Orang Tua & Anak',
    deskripsi: 'Istri wafat meninggalkan Suami, Ibu, dan 1 Anak Laki-laki.',
    tirkah: 48000000,
    gender: 'perempuan',
    heirInput: {
      suami: 1,
      istri: 0,
      ayah: false,
      ibu: true,
      anakLaki: 1,
      anakPerempuan: 0,
      cucuLaki: 0,
      cucuPerempuan: 0,
      kakek: false,
      nenek: false,
      saudaraLakiKandung: 0,
      saudaraPerempuanKandung: 0,
      saudaraSeibu: 0,
    },
  },
  {
    id: 'case-4',
    name: 'Kasus 4: Dua Anak Perempuan & Orang Tua',
    deskripsi: 'Pewaris suami wafat meninggalkan 2 Anak Perempuan, Ibu, dan Ayah.',
    tirkah: 96000000,
    gender: 'laki',
    heirInput: {
      suami: 0,
      istri: 0,
      ayah: true,
      ibu: true,
      anakLaki: 0,
      anakPerempuan: 2,
      cucuLaki: 0,
      cucuPerempuan: 0,
      kakek: false,
      nenek: false,
      saudaraLakiKandung: 0,
      saudaraPerempuanKandung: 0,
      saudaraSeibu: 0,
    },
  },
];

const FRACTION_OPTIONS = [
  { value: '1/2', label: '1/2 (Setengah)' },
  { value: '1/4', label: '1/4 (Seperempat)' },
  { value: '1/8', label: '1/8 (Seperdelapan)' },
  { value: '2/3', label: '2/3 (Dua Pertiga)' },
  { value: '1/3', label: '1/3 (Sepertiga)' },
  { value: '1/6', label: '1/6 (Seperenam)' },
  { value: 'Ashabah', label: '\'Ashabah (Hak Sisa)' },
  { value: 'Mahjub', label: 'Mahjub (Terhalang)' },
];

export const KalkulatorManual: React.FC = () => {
  const { showToast } = useToast();
  const { currentUser, addStudentXP } = useAuth();

  const [tirkahInput, setTirkahInput] = useState<number>(120000000);
  const [pewarisGender, setPewarisGender] = useState<'laki' | 'perempuan'>('laki');

  const [heirState, setHeirState] = useState<HeirInput>({
    suami: 0,
    istri: 1,
    ayah: false,
    ibu: false,
    anakLaki: 1,
    anakPerempuan: 1,
    cucuLaki: 0,
    cucuPerempuan: 0,
    kakek: false,
    nenek: false,
    saudaraLakiKandung: 0,
    saudaraPerempuanKandung: 0,
    saudaraSeibu: 0,
  });

  // Manual calculation inputs by student
  const [manualAsalMasalah, setManualAsalMasalah] = useState<string>('24');
  const [manualTipeKasus, setManualTipeKasus] = useState<'Adil' | 'Awal' | 'Radd'>('Adil');
  const [manualRows, setManualRows] = useState<Record<string, { fraction: string; saham: string; nominal: string }>>({
    istri: { fraction: '1/8', saham: '3', nominal: '15000000' },
    anakLaki: { fraction: 'Ashabah', saham: '14', nominal: '70000000' },
    anakPerempuan: { fraction: 'Ashabah', saham: '7', nominal: '35000000' },
  });

  // Evaluation & Comparison states
  const [autoResult, setAutoResult] = useState<CalculationResult | null>(null);
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);
  const [evaluationScore, setEvaluationScore] = useState<number | null>(null);
  const [showAutoComparison, setShowAutoComparison] = useState<boolean>(false);

  // Apply a preset case
  const applyPreset = (preset: CasePreset) => {
    setTirkahInput(preset.tirkah);
    setPewarisGender(preset.gender);
    setHeirState(preset.heirInput);
    setHasEvaluated(false);
    setAutoResult(null);
    setShowAutoComparison(false);

    // Initialize manual rows for heirs in preset
    const newRows: Record<string, { fraction: string; saham: string; nominal: string }> = {};
    const input = preset.heirInput;
    if (input.suami > 0) newRows.suami = { fraction: '', saham: '', nominal: '' };
    if (input.istri > 0) newRows.istri = { fraction: '', saham: '', nominal: '' };
    if (input.ayah) newRows.ayah = { fraction: '', saham: '', nominal: '' };
    if (input.ibu) newRows.ibu = { fraction: '', saham: '', nominal: '' };
    if (input.anakLaki > 0) newRows.anakLaki = { fraction: '', saham: '', nominal: '' };
    if (input.anakPerempuan > 0) newRows.anakPerempuan = { fraction: '', saham: '', nominal: '' };
    if (input.cucuLaki > 0) newRows.cucuLaki = { fraction: '', saham: '', nominal: '' };
    if (input.cucuPerempuan > 0) newRows.cucuPerempuan = { fraction: '', saham: '', nominal: '' };
    if (input.kakek) newRows.kakek = { fraction: '', saham: '', nominal: '' };
    if (input.nenek) newRows.nenek = { fraction: '', saham: '', nominal: '' };
    if (input.saudaraLakiKandung > 0) newRows.saudaraLakiKandung = { fraction: '', saham: '', nominal: '' };
    if (input.saudaraPerempuanKandung > 0) newRows.saudaraPerempuanKandung = { fraction: '', saham: '', nominal: '' };
    if (input.saudaraSeibu > 0) newRows.saudaraSeibu = { fraction: '', saham: '', nominal: '' };

    setManualRows(newRows);
    setManualAsalMasalah('');
    showToast('info', 'Studi Kasus Dimuat', `${preset.name} siap dihitung secara manual.`);
  };

  // Get active heirs list for manual calculation
  const getActiveHeirs = (): { key: string; label: string; count: number }[] => {
    const list: { key: string; label: string; count: number }[] = [];
    if (heirState.suami > 0) list.push({ key: 'suami', label: 'Suami', count: 1 });
    if (heirState.istri > 0) list.push({ key: 'istri', label: `Istri (${heirState.istri} org)`, count: heirState.istri });
    if (heirState.ibu) list.push({ key: 'ibu', label: 'Ibu', count: 1 });
    if (heirState.ayah) list.push({ key: 'ayah', label: 'Ayah', count: 1 });
    if (heirState.anakLaki > 0) list.push({ key: 'anakLaki', label: `Anak Laki-laki (${heirState.anakLaki} org)`, count: heirState.anakLaki });
    if (heirState.anakPerempuan > 0) list.push({ key: 'anakPerempuan', label: `Anak Perempuan (${heirState.anakPerempuan} org)`, count: heirState.anakPerempuan });
    if (heirState.cucuLaki > 0) list.push({ key: 'cucuLaki', label: `Cucu Laki-laki (${heirState.cucuLaki} org)`, count: heirState.cucuLaki });
    if (heirState.cucuPerempuan > 0) list.push({ key: 'cucuPerempuan', label: `Cucu Perempuan (${heirState.cucuPerempuan} org)`, count: heirState.cucuPerempuan });
    if (heirState.kakek) list.push({ key: 'kakek', label: 'Kakek Shahih', count: 1 });
    if (heirState.nenek) list.push({ key: 'nenek', label: 'Nenek Shahihah', count: 1 });
    if (heirState.saudaraLakiKandung > 0) list.push({ key: 'saudaraLakiKandung', label: `Saudara Laki Kandung (${heirState.saudaraLakiKandung} org)`, count: heirState.saudaraLakiKandung });
    if (heirState.saudaraPerempuanKandung > 0) list.push({ key: 'saudaraPerempuanKandung', label: `Saudari Perempuan Kandung (${heirState.saudaraPerempuanKandung} org)`, count: heirState.saudaraPerempuanKandung });
    if (heirState.saudaraSeibu > 0) list.push({ key: 'saudaraSeibu', label: `Saudara Seibu (${heirState.saudaraSeibu} org)`, count: heirState.saudaraSeibu });
    return list;
  };

  const activeHeirList = getActiveHeirs();

  const handleManualRowChange = (key: string, field: 'fraction' | 'saham' | 'nominal', value: string) => {
    setManualRows(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || { fraction: '', saham: '', nominal: '' }),
        [field]: value,
      },
    }));
  };

  // Run the authoritative Faraidh calculation for validation and comparison
  const executeAutoCalculation = (): CalculationResult => {
    const calc = calculateFaraidh(tirkahInput, heirState);
    setAutoResult(calc);
    return calc;
  };

  // Action: Evaluate Student's Manual Work
  const handleCheckManual = () => {
    if (tirkahInput <= 0) {
      showToast('warning', 'Harta Kosong', 'Masukkan nominal harta warisan (Tirkah) terlebih dahulu.');
      return;
    }
    if (activeHeirList.length === 0) {
      showToast('warning', 'Pilih Ahli Waris', 'Pilih minimal satu orang ahli waris.');
      return;
    }

    const calc = executeAutoCalculation();
    setHasEvaluated(true);

    // Compute evaluation accuracy score
    let points = 0;
    let maxPoints = 0;

    // Check Asal Masalah (worth 25 points)
    maxPoints += 25;
    const parsedAsalMasalah = parseInt(manualAsalMasalah, 10);
    if (parsedAsalMasalah === calc.asalMasalah) {
      points += 25;
    }

    // Check Tipe Kasus (worth 15 points)
    maxPoints += 15;
    if (manualTipeKasus === calc.tipeKasus) {
      points += 15;
    }

    // Check each active heir's fraction and nominal
    for (const h of activeHeirList) {
      maxPoints += 30; // fraction + nominal
      const studentData = manualRows[h.key] || { fraction: '', saham: '', nominal: '' };
      const autoShare = calc.shares.find(s =>
        s.title.toLowerCase().includes(h.label.toLowerCase().split(' ')[0])
      );

      if (autoShare) {
        // Check fraction / status
        const isAshabah = autoShare.status === 'Ashabah';
        const isMahjub = autoShare.status === 'Mahjub';
        let fractionCorrect = false;

        if (isMahjub && studentData.fraction === 'Mahjub') {
          fractionCorrect = true;
        } else if (isAshabah && studentData.fraction === 'Ashabah') {
          fractionCorrect = true;
        } else if (autoShare.fractionStr.includes(studentData.fraction) && studentData.fraction !== '') {
          fractionCorrect = true;
        }

        if (fractionCorrect) points += 15;

        // Check nominal (tolerance 5%)
        const parsedNominal = parseFloat(studentData.nominal.replace(/[^0-9]/g, ''));
        if (!isNaN(parsedNominal) && Math.abs(parsedNominal - autoShare.nominalTotal) < (autoShare.nominalTotal * 0.05 + 1000)) {
          points += 15;
        }
      }
    }

    const finalScore = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0;
    setEvaluationScore(finalScore);

    if (finalScore >= 80) {
      showToast('success', 'Perhitungan Sangat Akurat! 🌟', `Skor ketelitian: ${finalScore}/100. Keren!`);
      if (currentUser) {
        addStudentXP(currentUser.id, 25);
      }
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    } else if (finalScore >= 50) {
      showToast('info', 'Cukup Baik! Perlu Ketelitian', `Skor ketelitian: ${finalScore}/100. Klik "Bandingkan dengan Auto" untuk melihat detail koreksi.`);
    } else {
      showToast('error', 'Ada Beberapa Ketidaksesuaian', `Skor ketelitian: ${finalScore}/100. Cek kembali penentuan pecahan dan asal masalah.`);
    }
  };

  // Action: Toggle Auto Calculator Comparison
  const handleToggleAutoComparison = () => {
    if (!autoResult) {
      executeAutoCalculation();
    }
    setShowAutoComparison(prev => !prev);
    if (!showAutoComparison) {
      showToast('info', 'Pembanding Otomatis Aktif', 'Kunci hitungan otomatis sistem ditampilkan untuk membandingkan langkahmu.');
    }
  };

  const handleResetAll = () => {
    setTirkahInput(0);
    setPewarisGender('laki');
    setHeirState({
      suami: 0,
      istri: 0,
      ayah: false,
      ibu: false,
      anakLaki: 0,
      anakPerempuan: 0,
      cucuLaki: 0,
      cucuPerempuan: 0,
      kakek: false,
      nenek: false,
      saudaraLakiKandung: 0,
      saudaraPerempuanKandung: 0,
      saudaraSeibu: 0,
    });
    setManualRows({});
    setManualAsalMasalah('');
    setHasEvaluated(false);
    setAutoResult(null);
    setShowAutoComparison(false);
    setEvaluationScore(null);
    showToast('info', 'Lembar Kerja Direset', 'Semua isian telah dikosongkan.');
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 sm:p-7 shadow-xl border border-emerald-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Scale className="w-3.5 h-3.5" /> Kalkulator Hitung Manual Siswa
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Latihan Menghitung Faraidh Mandiri
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
              Tuliskan langkah analisismu sendiri: tentukan porsi furudh, hitung asal masalah, dan bagi sahamnya secara manual. Gunakan tombol pembanding otomatis untuk memverifikasi ketepatan jawabanmu!
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetAll}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/20"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Isian
            </button>
          </div>
        </div>
      </div>

      {/* Preset Case Quick Selectors */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            Pilih Studi Kasus Latihan (Preset Siap Hitung) atau Buat Sendiri:
          </h3>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Tersedia {PRESET_CASES.length} Studi Kasus
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_CASES.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="text-left p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all group flex flex-col justify-between"
            >
              <div>
                <p className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  {preset.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {preset.deskripsi}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
                <span>{formatRupiah(preset.tirkah)}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tirkah & Ahli Waris Input (4 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">1</span>
              Harta Bersih & Pewaris
            </h3>

            {/* Gender of Deceased */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Jenis Kelamin Pewaris yang Meninggal:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPewarisGender('laki');
                    setHeirState(prev => ({ ...prev, suami: 0 }));
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    pewarisGender === 'laki'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Laki-laki (Meninggalkan Istri)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPewarisGender('perempuan');
                    setHeirState(prev => ({ ...prev, istri: 0 }));
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    pewarisGender === 'perempuan'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Perempuan (Meninggalkan Suami)
                </button>
              </div>
            </div>

            {/* Tirkah Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Harta Warisan Bersih (Tirkah):</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatRupiah(tirkahInput)}
                </span>
              </label>
              <input
                type="number"
                value={tirkahInput || ''}
                onChange={e => setTirkahInput(Math.max(0, Number(e.target.value)))}
                placeholder="Contoh: 120000000"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              />
              <div className="flex gap-1.5 flex-wrap pt-1">
                {[48000000, 60000000, 96000000, 120000000, 240000000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTirkahInput(val)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {val / 1000000} Jt
                  </button>
                ))}
              </div>
            </div>

            {/* Heirs Selection Checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Pilih Ahli Waris yang Ditinggalkan:
              </label>

              {/* Pasangan */}
              {pewarisGender === 'laki' ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Istri:</span>
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3, 4].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setHeirState(prev => ({ ...prev, istri: num }))}
                        className={`w-6 h-6 rounded-lg text-xs font-bold ${
                          heirState.istri === num
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Suami:</span>
                  <div className="flex items-center gap-1.5">
                    {[0, 1].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setHeirState(prev => ({ ...prev, suami: num }))}
                        className={`w-6 h-6 rounded-lg text-xs font-bold ${
                          heirState.suami === num
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {num === 1 ? 'Ada' : 'Tidak'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ibu & Ayah */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setHeirState(prev => ({ ...prev, ibu: !prev.ibu }))}
                  className={`p-2 rounded-xl border text-left font-semibold transition-all ${
                    heirState.ibu
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="inline-block w-4">{heirState.ibu ? '✓' : '○'}</span> Ibu Kandung
                </button>
                <button
                  type="button"
                  onClick={() => setHeirState(prev => ({ ...prev, ayah: !prev.ayah }))}
                  className={`p-2 rounded-xl border text-left font-semibold transition-all ${
                    heirState.ayah
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="inline-block w-4">{heirState.ayah ? '✓' : '○'}</span> Ayah Kandung
                </button>
              </div>

              {/* Anak Laki & Perempuan */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                    <span>Anak Laki:</span>
                    <span className="font-bold text-emerald-600">{heirState.anakLaki}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      type="button"
                      onClick={() => setHeirState(prev => ({ ...prev, anakLaki: Math.max(0, prev.anakLaki - 1) }))}
                      className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 font-bold flex items-center justify-center text-xs"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeirState(prev => ({ ...prev, anakLaki: prev.anakLaki + 1 }))}
                      className="w-5 h-5 rounded bg-emerald-600 text-white font-bold flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                    <span>Anak Pr:</span>
                    <span className="font-bold text-emerald-600">{heirState.anakPerempuan}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      type="button"
                      onClick={() => setHeirState(prev => ({ ...prev, anakPerempuan: Math.max(0, prev.anakPerempuan - 1) }))}
                      className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 font-bold flex items-center justify-center text-xs"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeirState(prev => ({ ...prev, anakPerempuan: prev.anakPerempuan + 1 }))}
                      className="w-5 h-5 rounded bg-emerald-600 text-white font-bold flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Saudara Kandung */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                    <span>Sdr Laki:</span>
                    <span className="font-bold text-emerald-600">{heirState.saudaraLakiKandung}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      type="button"
                      onClick={() => setHeirState(prev => ({ ...prev, saudaraLakiKandung: Math.max(0, prev.saudaraLakiKandung - 1) }))}
                      className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 font-bold flex items-center justify-center text-xs"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeirState(prev => ({ ...prev, saudaraLakiKandung: prev.saudaraLakiKandung + 1 }))}
                      className="w-5 h-5 rounded bg-emerald-600 text-white font-bold flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                    <span>Sdr Pr:</span>
                    <span className="font-bold text-emerald-600">{heirState.saudaraPerempuanKandung}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      type="button"
                      onClick={() => setHeirState(prev => ({ ...prev, saudaraPerempuanKandung: Math.max(0, prev.saudaraPerempuanKandung - 1) }))}
                      className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 font-bold flex items-center justify-center text-xs"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeirState(prev => ({ ...prev, saudaraPerempuanKandung: prev.saudaraPerempuanKandung + 1 }))}
                      className="w-5 h-5 rounded bg-emerald-600 text-white font-bold flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Lembar Kerja Hitung Manual Siswa (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                Lembar Kerja Hitung Manual Siswa
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">
                {activeHeirList.length} Ahli Waris Aktif
              </span>
            </div>

            {/* Asal Masalah & Tipe Kasus Manual */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span>Asal Masalah (KPK):</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={manualAsalMasalah}
                    onChange={e => setManualAsalMasalah(e.target.value)}
                    placeholder="Contoh: 24"
                    className="w-24 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex gap-1 flex-wrap">
                    {[6, 8, 12, 24].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setManualAsalMasalah(String(num))}
                        className="px-2 py-1 rounded bg-white dark:bg-slate-700 text-[10px] font-mono border border-slate-200 dark:border-slate-600"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Tipe Kasus Menurut Hitunganmu:
                </label>
                <div className="flex gap-1.5">
                  {(['Adil', 'Awal', 'Radd'] as const).map(kasus => (
                    <button
                      key={kasus}
                      type="button"
                      onClick={() => setManualTipeKasus(kasus)}
                      className={`flex-1 py-1.5 px-2 rounded-xl font-bold text-[11px] border transition-all ${
                        manualTipeKasus === kasus
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {kasus === 'Adil' ? 'Adil (Pas)' : kasus === 'Awal' ? '\'Awal (Kurang)' : 'Radd (Sisa)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table of Heirs Manual Shares */}
            {activeHeirList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold">
                      <th className="pb-2.5">Ahli Waris</th>
                      <th className="pb-2.5 w-36">Porsi / Status</th>
                      <th className="pb-2.5 w-24">Saham</th>
                      <th className="pb-2.5 w-40">Nominal Rupiah (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activeHeirList.map(h => {
                      const rowData = manualRows[h.key] || { fraction: '', saham: '', nominal: '' };
                      return (
                        <tr key={h.key} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-2.5 pr-2 font-semibold text-slate-800 dark:text-slate-200">
                            {h.label}
                          </td>
                          <td className="py-2.5 pr-2">
                            <select
                              value={rowData.fraction}
                              onChange={e => handleManualRowChange(h.key, 'fraction', e.target.value)}
                              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                            >
                              <option value="">-- Pilih Porsi --</option>
                              {FRACTION_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2.5 pr-2">
                            <input
                              type="number"
                              value={rowData.saham}
                              onChange={e => handleManualRowChange(h.key, 'saham', e.target.value)}
                              placeholder="Saham"
                              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs focus:outline-none focus:border-emerald-500"
                            />
                          </td>
                          <td className="py-2.5">
                            <input
                              type="text"
                              value={rowData.nominal}
                              onChange={e => handleManualRowChange(h.key, 'nominal', e.target.value)}
                              placeholder="Nominal Rp"
                              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs focus:outline-none focus:border-emerald-500"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                Pilih minimal satu orang ahli waris di kolom kiri untuk mulai menghitung manual.
              </div>
            )}

            {/* Action Buttons: 1) Cek Hitungan Manual, 2) Hitung Auto Pembanding */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleCheckManual}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                Cek & Koreksi Hitungan Saya
              </button>

              <button
                type="button"
                onClick={handleToggleAutoComparison}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${
                  showAutoComparison
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                }`}
              >
                <Eye className="w-4 h-4" />
                {showAutoComparison ? 'Sembunyikan Pembanding Auto' : 'Bandingkan dengan Hitung Otomatis'}
              </button>
            </div>

            {/* Evaluation Score Badge */}
            {hasEvaluated && evaluationScore !== null && (
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 animate-in fade-in-50 ${
                  evaluationScore >= 80
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-900 dark:text-emerald-100'
                    : evaluationScore >= 50
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500/40 text-amber-900 dark:text-amber-100'
                    : 'bg-red-50 dark:bg-red-950/40 border-red-500/40 text-red-900 dark:text-red-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                      evaluationScore >= 80
                        ? 'bg-emerald-600 text-white'
                        : evaluationScore >= 50
                        ? 'bg-amber-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {evaluationScore}%
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">
                      {evaluationScore >= 80
                        ? 'Keren! Hitungan Manualmu Sangat Tepat! 🎉'
                        : evaluationScore >= 50
                        ? 'Sudah Cukup Bagus, Ada Sebagian Perlu Dikoreksi.'
                        : 'Masih Ada Kekeliruan pada Pecahan atau Asal Masalah.'}
                    </h4>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      {evaluationScore >= 80
                        ? '+25 XP berhasil ditambahkan ke profilmu.'
                        : 'Buka tombol "Bandingkan dengan Hitung Otomatis" untuk memeriksa kunci dan pembahasannya.'}
                    </p>
                  </div>
                </div>

                {!showAutoComparison && (
                  <button
                    onClick={() => setShowAutoComparison(true)}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-[11px] font-bold shadow-xs shrink-0"
                  >
                    Lihat Kunci
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Panel (Manual vs Auto) */}
      {showAutoComparison && autoResult && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border-2 border-emerald-500/40 shadow-xl space-y-5 animate-in slide-in-from-top-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                Kunci Jawaban & Validasi Fiqih
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600" />
                Tabel Perbandingan: Hitungan Manual Kamu vs Kunci Sistem
              </h3>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                <span className="text-slate-400 text-[10px] block">Asal Masalah Kunci:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {autoResult.asalMasalah} ({autoResult.tipeKasus})
                </span>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-800/50">
                  <th className="p-3 rounded-l-xl">Ahli Waris</th>
                  <th className="p-3">Porsi Manual Kamu</th>
                  <th className="p-3">Kunci Porsi Syariat</th>
                  <th className="p-3">Nominal Manual</th>
                  <th className="p-3">Kunci Nominal Syariat</th>
                  <th className="p-3 rounded-r-xl">Status Validasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeHeirList.map(h => {
                  const studentData = manualRows[h.key] || { fraction: '', saham: '', nominal: '' };
                  const autoShare = autoResult.shares.find(s =>
                    s.title.toLowerCase().includes(h.label.toLowerCase().split(' ')[0])
                  );

                  // Evaluation logic for this row
                  const isAshabah = autoShare?.status === 'Ashabah';
                  const isMahjub = autoShare?.status === 'Mahjub';
                  let isFractionMatch = false;

                  if (isMahjub && studentData.fraction === 'Mahjub') {
                    isFractionMatch = true;
                  } else if (isAshabah && studentData.fraction === 'Ashabah') {
                    isFractionMatch = true;
                  } else if (autoShare && autoShare.fractionStr.includes(studentData.fraction) && studentData.fraction !== '') {
                    isFractionMatch = true;
                  }

                  const studentNum = parseFloat(studentData.nominal.replace(/[^0-9]/g, '')) || 0;
                  const autoNum = autoShare?.nominalTotal || 0;
                  const isNominalMatch = Math.abs(studentNum - autoNum) < (autoNum * 0.05 + 1000);

                  const isFullyCorrect = isFractionMatch && (isNominalMatch || isMahjub);

                  return (
                    <tr key={h.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {h.label}
                      </td>
                      <td className="p-3 font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                          {studentData.fraction || '-'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                          {autoShare ? autoShare.fractionStr : '-'}
                        </span>
                        {autoShare?.alasan && (
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{autoShare.alasan}</p>
                        )}
                      </td>
                      <td className="p-3 font-mono">
                        {studentNum > 0 ? formatRupiah(studentNum) : '-'}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                        {autoShare ? formatRupiah(autoShare.nominalTotal) : '-'}
                      </td>
                      <td className="p-3">
                        {isFullyCorrect ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                            <Check className="w-3 h-3" /> Tepat & Cocok
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                            <AlertCircle className="w-3 h-3" /> Perlu Dikoreksi
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Fiqh Explanation Footer */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-500/20 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
            <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Penjelasan Kaidah Fiqih Kasus Ini:
            </span>
            <p className="leading-relaxed">
              {autoResult.penjelasanKasus}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
