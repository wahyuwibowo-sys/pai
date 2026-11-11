import React, { useState } from 'react';
import { HeirInput, CalculationResult } from '../../types';
import { calculateFaraidh, formatRupiah } from '../../utils/faraidh';
import { PieChart } from '../PieChart';
import {
  Calculator,
  RotateCcw,
  Sparkles,
  Users,
  Wallet,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Printer,
  Download,
  BookOpen,
  Info,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useToast } from '../../context/ToastContext';

export const SimulasiTab: React.FC = () => {
  const { showToast } = useToast();

  const [tirkahInput, setTirkahInput] = useState<number>(0); // Diawali 0 saat awal buka
  const [pewarisGender, setPewarisGender] = useState<'laki' | 'perempuan'>('laki');
  const [showExtendedHeirs, setShowExtendedHeirs] = useState<boolean>(false);
  const [showSteps, setShowSteps] = useState<boolean>(true);

  // Semua ahli waris diawali 0 / false saat awal buka
  const [heirState, setHeirState] = useState<HeirInput>({
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

  // Belum diklik hitung: result diawali null
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleGenderChange = (gender: 'laki' | 'perempuan') => {
    setPewarisGender(gender);
    if (gender === 'laki') {
      setHeirState(prev => ({ ...prev, suami: 0 }));
    } else {
      setHeirState(prev => ({ ...prev, istri: 0 }));
    }
  };

  const handleCalculate = () => {
    if (tirkahInput <= 0) {
      showToast('warning', 'Harta Waris Nol', 'Silakan masukkan nominal harta waris (Tirkah) lebih dari Rp 0.');
      return;
    }

    const hasAnyHeir =
      heirState.suami > 0 ||
      heirState.istri > 0 ||
      heirState.ayah ||
      heirState.ibu ||
      heirState.anakLaki > 0 ||
      heirState.anakPerempuan > 0 ||
      heirState.cucuLaki > 0 ||
      heirState.cucuPerempuan > 0 ||
      heirState.kakek ||
      heirState.nenek ||
      heirState.saudaraLakiKandung > 0 ||
      heirState.saudaraPerempuanKandung > 0 ||
      heirState.saudaraSeibu > 0;

    if (!hasAnyHeir) {
      showToast('warning', 'Ahli Waris Belum Dipilih', 'Pilih minimal satu ahli waris yang ditinggalkan.');
      return;
    }

    const calcResult = calculateFaraidh(tirkahInput, heirState);
    setResult(calcResult);
    showToast('success', 'Perhitungan Selesai', `Asal Masalah: ${calcResult.asalMasalah} (${calcResult.tipeKasus})`);
  };

  const handleReset = () => {
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
    setResult(null);
    setShowExtendedHeirs(false);
    showToast('info', 'Formulir Direset', 'Semua isian telah dikembalikan ke angka nol.');
  };

  // Count active extended heirs for badge
  const extendedHeirCount =
    (heirState.cucuLaki || 0) +
    (heirState.cucuPerempuan || 0) +
    (heirState.kakek ? 1 : 0) +
    (heirState.nenek ? 1 : 0) +
    (heirState.saudaraLakiKandung || 0) +
    (heirState.saudaraPerempuanKandung || 0) +
    (heirState.saudaraSeibu || 0);

  // Preset scenarios
  const loadPreset = (presetName: string) => {
    if (presetName === 'standar') {
      setPewarisGender('laki');
      setTirkahInput(120000000);
      setHeirState({
        suami: 0,
        istri: 1,
        ayah: true,
        ibu: true,
        anakLaki: 2,
        anakPerempuan: 1,
        cucuLaki: 0,
        cucuPerempuan: 0,
        kakek: false,
        nenek: false,
        saudaraLakiKandung: 0,
        saudaraPerempuanKandung: 0,
        saudaraSeibu: 0,
      });
      setShowExtendedHeirs(false);
    } else if (presetName === 'awal') {
      setPewarisGender('perempuan');
      setTirkahInput(70000000);
      setHeirState({
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
      });
      setShowExtendedHeirs(true);
    } else if (presetName === 'radd') {
      setPewarisGender('laki');
      setTirkahInput(80000000);
      setHeirState({
        suami: 0,
        istri: 1,
        ayah: false,
        ibu: true,
        anakLaki: 0,
        anakPerempuan: 1,
        cucuLaki: 0,
        cucuPerempuan: 0,
        kakek: false,
        nenek: false,
        saudaraLakiKandung: 0,
        saudaraPerempuanKandung: 0,
        saudaraSeibu: 0,
      });
      setShowExtendedHeirs(false);
    } else if (presetName === 'kalalah') {
      setPewarisGender('laki');
      setTirkahInput(60000000);
      setHeirState({
        suami: 0,
        istri: 1,
        ayah: false,
        ibu: false,
        anakLaki: 0,
        anakPerempuan: 0,
        cucuLaki: 0,
        cucuPerempuan: 0,
        kakek: false,
        nenek: false,
        saudaraLakiKandung: 1,
        saudaraPerempuanKandung: 1,
        saudaraSeibu: 2,
      });
      setShowExtendedHeirs(true);
    }
    showToast('info', 'Kasus Dimuat', `Skenario ${presetName.toUpperCase()} siap dihitung.`);
  };

  const handleExportSimulationPDF = () => {
    if (!result) return;
    const doc = new jsPDF();

    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('LEMBAR HASIL PERHITUNGAN HARTA WARIS (ILMU FARAIDH)', 105, 18, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Media Edukasi PAI-Waris Digital • Sesuai Kaidah Fiqih Syafi\'iyyah & KHI', 105, 24, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(14, 28, 196, 28);

    doc.setFontSize(9);
    doc.text(`Total Harta Bersih (Tirkah): ${formatRupiah(result.tirkah)}`, 14, 35);
    doc.text(`Pewaris: ${pewarisGender === 'laki' ? 'Laki-laki (Meninggalkan Istri)' : 'Perempuan (Meninggalkan Suami)'}`, 14, 40);
    doc.text(`Asal Masalah: ${result.asalMasalah} Saham | Status Kasus: ${result.tipeKasus.toUpperCase()}`, 14, 45);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`, 196, 35, { align: 'right' });

    const tableRows = result.shares.map((s, idx) => [
      idx + 1,
      s.title,
      s.status,
      s.fractionStr,
      s.status === 'Mahjub' ? 'Rp 0' : formatRupiah(s.nominalPerPerson),
      s.status === 'Mahjub' ? 'Rp 0' : formatRupiah(s.nominalTotal),
      s.dalil,
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['No', 'Ahli Waris', 'Status', 'Fraksi Bagian', 'Nominal / Orang', 'Nominal Total', 'Dalil Syar\'i']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 140;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Catatan Hukum & Alasan Fiqih:', 14, finalY + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const splitNote = doc.splitTextToSize(result.penjelasanKasus, 180);
    doc.text(splitNote, 14, finalY + 15);

    doc.save(`Hasil_Perhitungan_Waris_${result.tipeKasus}_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('success', 'PDF Berhasil Diunduh', 'Lembar hasil perhitungan waris telah disimpan.');
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Sleek, Modern Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold border border-emerald-300 dark:border-emerald-700">
              <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Kalkulator Faraidh
            </span>
            <span className="text-xs text-slate-400">QS. An-Nisa: 11, 12, 176</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Simulasi Perhitungan Harta Waris Islam
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            Tentukan nominal harta dan susunan ahli waris. Sistem menghitung fraksi furudh, 'Awal, Radd, dan Ashabah secara instan.
          </p>
        </div>

        {/* Minimalist Preset Pills */}
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">Kasus:</span>
          <button
            onClick={() => loadPreset('standar')}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-slate-700/80 font-bold transition-colors"
          >
            1. Standar
          </button>
          <button
            onClick={() => loadPreset('awal')}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-slate-700/80 font-bold transition-colors"
          >
            2. 'Awal
          </button>
          <button
            onClick={() => loadPreset('radd')}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-slate-700/80 font-bold transition-colors"
          >
            3. Radd
          </button>
          <button
            onClick={() => loadPreset('kalalah')}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-slate-700/80 font-bold transition-colors"
          >
            4. Kalalah
          </button>
        </div>
      </div>

      {/* Main Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Input Form */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 1: Harta Bersih & Pewaris */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                1. Harta Bersih (Tirkah)
              </h3>
              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatRupiah(tirkahInput)}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                type="number"
                min="0"
                step="1000000"
                value={tirkahInput}
                onChange={e => setTirkahInput(Number(e.target.value) || 0)}
                className="w-full pl-10 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Quick chips */}
            <div className="flex gap-1.5 flex-wrap">
              {[50000000, 100000000, 250000000, 500000000, 1000000000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTirkahInput(amt)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border font-mono font-semibold transition-colors ${
                    tirkahInput === amt
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {amt >= 1000000000 ? `${amt / 1000000000} M` : `${amt / 1000000} Jt`}
                </button>
              ))}
            </div>

            {/* Pewaris Segmented Button */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Jenis Kelamin Pewaris yang Meninggal:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleGenderChange('laki')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    pewarisGender === 'laki'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span>👨 Laki-laki</span>
                  <span className="text-[10px] opacity-80">(Meninggalkan Istri)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderChange('perempuan')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    pewarisGender === 'perempuan'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span>👩 Perempuan</span>
                  <span className="text-[10px] opacity-80">(Meninggalkan Suami)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Ahli Waris Pokok (Utama) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              2. Ahli Waris Pokok
            </h3>

            {/* Pasangan Hidup */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {pewarisGender === 'laki' ? 'Istri' : 'Suami'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {pewarisGender === 'laki' ? 'Maksimal 4 orang' : 'Pasangan sah'}
                </p>
              </div>
              {pewarisGender === 'laki' ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHeirState(p => ({ ...p, istri: Math.max(0, p.istri - 1) }))}
                    className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="w-5 text-center text-xs font-mono font-bold">{heirState.istri}</span>
                  <button
                    type="button"
                    onClick={() => setHeirState(p => ({ ...p, istri: Math.min(4, p.istri + 1) }))}
                    className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setHeirState(p => ({ ...p, suami: p.suami > 0 ? 0 : 1 }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    heirState.suami > 0
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  {heirState.suami > 0 ? 'Ada (1)' : 'Tidak Ada'}
                </button>
              )}
            </div>

            {/* Orang Tua Kandung */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setHeirState(p => ({ ...p, ayah: !p.ayah }))}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors ${
                  heirState.ayah
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>Ayah Kandung</span>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  heirState.ayah ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                }`}>
                  {heirState.ayah ? '✓' : ''}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setHeirState(p => ({ ...p, ibu: !p.ibu }))}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors ${
                  heirState.ibu
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>Ibu Kandung</span>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  heirState.ibu ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                }`}>
                  {heirState.ibu ? '✓' : ''}
                </span>
              </button>
            </div>

            {/* Anak Kandung */}
            <div className="space-y-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Anak Laki-laki</p>
                  <p className="text-[10px] text-slate-400">Ashabah bil-Ghair (2:1)</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHeirState(p => ({ ...p, anakLaki: Math.max(0, p.anakLaki - 1) }))}
                    className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="w-5 text-center text-xs font-mono font-bold">{heirState.anakLaki}</span>
                  <button
                    type="button"
                    onClick={() => setHeirState(p => ({ ...p, anakLaki: p.anakLaki + 1 }))}
                    className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Anak Perempuan</p>
                  <p className="text-[10px] text-slate-400">Fardh (1/2 atau 2/3) / Ashabah</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHeirState(p => ({ ...p, anakPerempuan: Math.max(0, p.anakPerempuan - 1) }))}
                    className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="w-5 text-center text-xs font-mono font-bold">{heirState.anakPerempuan}</span>
                  <button
                    type="button"
                    onClick={() => setHeirState(p => ({ ...p, anakPerempuan: p.anakPerempuan + 1 }))}
                    className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Kerabat Lainnya (Collapsible to keep UI super clean) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setShowExtendedHeirs(!showExtendedHeirs)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Ahli Waris Lainnya (Kakek, Cucu, Saudara)
                </span>
                {extendedHeirCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                    {extendedHeirCount} Dipilih
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <span>{showExtendedHeirs ? 'Sembunyikan' : 'Buka'}</span>
                {showExtendedHeirs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showExtendedHeirs && (
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in-50">
                <p className="text-[11px] text-slate-400 pt-2">
                  Dapat terhalang (mahjub) jika ada anak laki-laki atau ayah kandung.
                </p>

                {/* Kakek & Nenek */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setHeirState(p => ({ ...p, kakek: !p.kakek }))}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors ${
                      heirState.kakek
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>Kakek (dari Ayah)</span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      heirState.kakek ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                    }`}>
                      {heirState.kakek ? '✓' : ''}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHeirState(p => ({ ...p, nenek: !p.nenek }))}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors ${
                      heirState.nenek
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>Nenek (Shahihah)</span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      heirState.nenek ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                    }`}>
                      {heirState.nenek ? '✓' : ''}
                    </span>
                  </button>
                </div>

                {/* Cucu */}
                <div className="space-y-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Cucu Laki-laki</p>
                      <p className="text-[10px] text-slate-400">Dari anak laki-laki</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setHeirState(p => ({ ...p, cucuLaki: Math.max(0, p.cucuLaki - 1) }))}
                        className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="w-5 text-center text-xs font-mono font-bold">{heirState.cucuLaki}</span>
                      <button
                        type="button"
                        onClick={() => setHeirState(p => ({ ...p, cucuLaki: p.cucuLaki + 1 }))}
                        className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Cucu Perempuan</p>
                      <p className="text-[10px] text-slate-400">Dari anak laki-laki</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setHeirState(p => ({ ...p, cucuPerempuan: Math.max(0, p.cucuPerempuan - 1) }))}
                        className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="w-5 text-center text-xs font-mono font-bold">{heirState.cucuPerempuan}</span>
                      <button
                        type="button"
                        onClick={() => setHeirState(p => ({ ...p, cucuPerempuan: p.cucuPerempuan + 1 }))}
                        className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Saudara Kandung & Seibu */}
                <div className="space-y-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Saudara Laki Kandung</p>
                      <p className="text-[10px] text-slate-400">Ashabah bin-Nafs</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setHeirState(p => ({ ...p, saudaraLakiKandung: Math.max(0, p.saudaraLakiKandung - 1) }))}
                        className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="w-5 text-center text-xs font-mono font-bold">{heirState.saudaraLakiKandung}</span>
                      <button
                        type="button"
                        onClick={() => setHeirState(p => ({ ...p, saudaraLakiKandung: p.saudaraLakiKandung + 1 }))}
                        className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Saudari Perempuan Kandung</p>
                      <p className="text-[10px] text-slate-400">1/2, 2/3, atau Ashabah</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setHeirState(p => ({ ...p, saudaraPerempuanKandung: Math.max(0, p.saudaraPerempuanKandung - 1) }))}
                        className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="w-5 text-center text-xs font-mono font-bold">{heirState.saudaraPerempuanKandung}</span>
                      <button
                        type="button"
                        onClick={() => setHeirState(p => ({ ...p, saudaraPerempuanKandung: p.saudaraPerempuanKandung + 1 }))}
                        className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Saudara / Saudari Seibu</p>
                      <p className="text-[10px] text-slate-400">1/6 (1 org) atau 1/3 (&gt;1 org)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setHeirState(p => ({ ...p, saudaraSeibu: Math.max(0, p.saudaraSeibu - 1) }))}
                        className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="w-5 text-center text-xs font-mono font-bold">{heirState.saudaraSeibu}</span>
                      <button
                        type="button"
                        onClick={() => setHeirState(p => ({ ...p, saudaraSeibu: p.saudaraSeibu + 1 }))}
                        className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleCalculate}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Hitung Pembagian Waris</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors"
              title="Kembalikan isian ke nilai awal"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Results Section */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Summary Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 uppercase">
                      Kasus: {result.tipeKasus.toUpperCase()}
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                      Hasil Pembagian Harta Waris
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 font-bold">
                      Asal Masalah: <span className="text-emerald-600 dark:text-emerald-400 font-mono">{result.asalMasalah}</span>
                    </span>
                    <button
                      onClick={handleExportSimulationPDF}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-colors flex items-center gap-1.5 text-xs font-bold"
                      title="Unduh Lembar PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Cetak"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Case Note */}
                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/20 text-xs text-slate-700 dark:text-emerald-200 leading-relaxed">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300">Catatan Fiqih: </span>
                  {result.penjelasanKasus}
                </div>

                {/* Donut Chart */}
                <div className="py-2">
                  <PieChart shares={result.shares} tirkah={result.tirkah} />
                </div>

                {/* Table of Shares */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Rincian Hak Ahli Waris:
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-2.5">Ahli Waris</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5">Fraksi</th>
                          <th className="p-2.5 text-right">Nominal Total</th>
                          <th className="p-2.5 text-right">Per Orang</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                        {result.shares.map((share, idx) => {
                          const isMahjub = share.status === 'Mahjub';
                          return (
                            <tr
                              key={idx}
                              className={isMahjub ? 'bg-slate-50/40 dark:bg-slate-900/30 opacity-50' : 'hover:bg-emerald-50/30 dark:hover:bg-slate-800/30'}
                            >
                              <td className="p-2.5 font-semibold">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: share.color }}
                                  />
                                  <span>{share.title}</span>
                                </div>
                              </td>
                              <td className="p-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    isMahjub
                                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                      : share.status === 'Ashabah'
                                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                  }`}
                                >
                                  {share.status}
                                </span>
                              </td>
                              <td className="p-2.5 font-mono font-semibold text-slate-600 dark:text-slate-300">
                                {share.fractionStr}
                              </td>
                              <td className="p-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                {isMahjub ? 'Rp 0' : formatRupiah(share.nominalTotal)}
                              </td>
                              <td className="p-2.5 text-right font-medium text-slate-600 dark:text-slate-400 font-mono">
                                {isMahjub ? 'Rp 0' : formatRupiah(share.nominalPerPerson)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Collapsible Steps & Fiqih Grounds */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowSteps(!showSteps)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      Langkah Perhitungan Lengkap & Dalil Syar'i
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <span>{showSteps ? 'Tutup' : 'Lihat Detail'}</span>
                    {showSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {showSteps && (
                  <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in-50">
                    <div className="space-y-2 pt-2">
                      {result.steps.map((step, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1"
                        >
                          <h5 className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            {step.title}
                          </h5>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {step.description}
                          </p>
                          {step.detail && step.detail.length > 0 && (
                            <ul className="list-disc list-inside text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 pl-1">
                              {step.detail.map((d, dIdx) => (
                                <li key={dIdx}>{d}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Reasons for each heir */}
                    <div className="pt-2 space-y-1.5">
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Alasan Syar'i Tiap Ahli Waris:
                      </h5>
                      <div className="space-y-1.5">
                        {result.shares.map((s, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-500/20 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-emerald-900 dark:text-emerald-200">
                                {s.title}
                              </span>
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                                {s.dalil}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                              {s.alasan}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center text-slate-400 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <Calculator className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-600" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                Siap Menghitung Pembagian Waris
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Tentukan nilai harta waris bersih dan pilih ahli waris di panel sebelah kiri, kemudian klik tombol "Hitung Pembagian Waris".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
