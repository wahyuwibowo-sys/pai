import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Question } from '../../types';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Award,
  Zap,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface MatchPair {
  id: string;
  heir: string;
  condition: string;
  fraction: string;
}

const MATCHING_PAIRS_GAME: MatchPair[] = [
  { id: 'm1', heir: 'Suami', condition: 'Tanpa anak/cucu', fraction: '1/2' },
  { id: 'm2', heir: 'Istri', condition: 'Ada anak/cucu', fraction: '1/8' },
  { id: 'm3', heir: 'Ibu', condition: 'Ada anak atau 2+ saudara', fraction: '1/6' },
  { id: 'm4', heir: '2 Anak Perempuan', condition: 'Tanpa anak laki-laki', fraction: '2/3' },
  { id: 'm5', heir: 'Ayah', condition: 'Ada keturunan laki-laki', fraction: '1/6' },
  { id: 'm6', heir: 'Saudara Seibu (tunggal)', condition: 'Kondisi kalalah', fraction: '1/6' },
];

export const LatihanTab: React.FC = () => {
  const { questions, currentUser, addStudentXP } = useAuth();
  const { showToast } = useToast();

  const [activeMode, setActiveMode] = useState<'soal' | 'matching'>('soal');
  const practiceQuestions = questions.filter(q => q.kategori === 'latihan');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [scoreEarned, setScoreEarned] = useState(0);

  // Matching game state
  const [selectedHeir, setSelectedHeir] = useState<MatchPair | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [matchingWrong, setMatchingWrong] = useState<boolean>(false);

  const currentQ: Question | undefined = practiceQuestions[currentIndex];

  const handleAnswerSubmit = () => {
    if (!currentQ) return;
    const answer = currentQ.tipe === 'isian' ? typedAnswer.trim() : selectedAnswer;
    if (!answer) {
      showToast('warning', 'Pilih Jawaban', 'Silakan pilih atau ketik jawabanmu terlebih dahulu.');
      return;
    }

    const check =
      answer.toLowerCase() === currentQ.jawaban.toLowerCase() ||
      (currentQ.tipe === 'isian' && currentQ.jawaban.toLowerCase().includes(answer.toLowerCase()));

    setIsCorrect(check);
    setIsSubmitted(true);

    if (check) {
      setScoreEarned(prev => prev + currentQ.skor);
      if (currentUser) {
        addStudentXP(currentUser.id, currentQ.skor);
      }
      showToast('success', 'Jawaban Benar! 🎉', `+${currentQ.skor} XP ditambahkan ke profilmu.`);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });
    } else {
      showToast('error', 'Jawaban Kurang Tepat', 'Pelajari pembahasan fiqih di bawah ini.');
    }
  };

  const handleNext = () => {
    if (currentIndex < practiceQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer('');
      setTypedAnswer('');
      setIsSubmitted(false);
      setIsCorrect(false);
    } else {
      showToast('success', 'Latihan Selesai!', `Kamu telah menyelesaikan semua soal latihan.`);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedAnswer('');
    setTypedAnswer('');
    setIsSubmitted(false);
    setIsCorrect(false);
    setScoreEarned(0);
  };

  // Matching Game Handler
  const handleSelectFraction = (fraction: string) => {
    if (!selectedHeir) return;

    if (selectedHeir.fraction === fraction) {
      setMatchedIds(prev => [...prev, selectedHeir.id]);
      setSelectedHeir(null);
      setMatchingWrong(false);
      if (currentUser) addStudentXP(currentUser.id, 15);
      showToast('success', 'Pasangan Tepat! 🎯', `${selectedHeir.heir} (${selectedHeir.condition}) = ${fraction} (+15 XP)`);

      if (matchedIds.length + 1 === MATCHING_PAIRS_GAME.length) {
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
        showToast('success', 'Selamat!', 'Semua pasangan furudh berhasil dicocokkan!');
      }
    } else {
      setMatchingWrong(true);
      setTimeout(() => setMatchingWrong(false), 1200);
      showToast('error', 'Belum Tepat', 'Pecahan tidak cocok dengan kondisi ahli waris tersebut.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-50">
      {/* Banner with Gamification Bar */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 shadow-xl border border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
              <Zap className="w-3.5 h-3.5" /> Latihan Interaktif & Gamifikasi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Latihan Soal & Kasus Waris
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Asah kemampuan analisis faraidhmu melalui aneka model soal: Pilihan Ganda, Benar/Salah, Isian, Studi Kasus, dan Mencocokkan Pasangan.
            </p>
          </div>

          {/* Gamification Stats Card */}
          {currentUser && (
            <div className="bg-emerald-950/50 p-4 rounded-2xl border border-amber-400/30 flex items-center gap-4 shrink-0 shadow-inner">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-black text-xl border border-amber-400/40">
                Lvl {currentUser.level || 1}
              </div>
              <div>
                <p className="text-[11px] font-semibold text-emerald-200">Perolehan XP Anda:</p>
                <p className="text-lg font-black text-amber-300 font-mono">
                  {currentUser.xp || 0} XP
                </p>
                <div className="w-32 bg-emerald-900/80 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className="bg-amber-400 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, ((currentUser.xp || 0) % 150) / 1.5)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setActiveMode('soal')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeMode === 'soal'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Soal Latihan Bertahap ({practiceQuestions.length} Soal)
        </button>
        <button
          onClick={() => setActiveMode('matching')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeMode === 'matching'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-400" /> Game Mencocokkan Pasangan Furudh
        </button>
      </div>

      {/* MODE 1: SOAL LATIHAN BERTAHAP */}
      {activeMode === 'soal' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {currentQ ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                    Soal {currentIndex + 1} dari {practiceQuestions.length}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] uppercase font-semibold">
                    {currentQ.tipe.replace('_', ' ')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-semibold">
                    {currentQ.tingkatKesulitan}
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                  +{currentQ.skor} XP
                </span>
              </div>

              {/* Soal Prompt */}
              <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                {currentQ.soal}
              </p>

              {/* Options / Input Field */}
              {currentQ.tipe === 'isian' ? (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Ketikkan jawaban Anda:
                  </label>
                  <input
                    type="text"
                    value={typedAnswer}
                    disabled={isSubmitted}
                    onChange={e => setTypedAnswer(e.target.value)}
                    placeholder="Ketik jawaban di sini..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(currentQ.opsi || []).map((opt, oIdx) => {
                    const isSelected = selectedAnswer === opt;
                    let optionStyle = 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-emerald-500';

                    if (isSubmitted) {
                      if (opt === currentQ.jawaban) {
                        optionStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
                      } else if (isSelected && !isCorrect) {
                        optionStyle = 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-800 dark:text-red-200 line-through';
                      }
                    } else if (isSelected) {
                      optionStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-800 dark:text-emerald-300 font-semibold shadow-xs';
                    }

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => setSelectedAnswer(opt)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${optionStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isSubmitted && opt === currentQ.jawaban && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {isSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Automatic Explanation Box after Submission */}
              {isSubmitted && (
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in-50 ${
                    isCorrect
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-900 dark:text-emerald-100'
                      : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500/40 text-amber-900 dark:text-amber-100'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {isCorrect ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Jawaban Anda Tepat (+{currentQ.skor} XP)
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" /> Kunci Jawaban: {currentQ.jawaban}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-bold">Pembahasan Faraidh:</span>
                    <p className="mt-1 whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-300">
                      {currentQ.pembahasan}
                    </p>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={handleReset}
                  className="p-2.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Ulangi
                </button>

                {!isSubmitted ? (
                  <button
                    onClick={handleAnswerSubmit}
                    className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-700/20"
                  >
                    Kirim Jawaban
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="py-2.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                  >
                    {currentIndex < practiceQuestions.length - 1 ? 'Soal Berikutnya' : 'Selesai'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl">
              <p>Belum ada soal latihan.</p>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: MATCHING PAIRS GAME */}
      {activeMode === 'matching' && (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              Game Mencocokkan: Ahli Waris & Fraksi Furudh
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Petunjuk: 1) Klik salah satu kartu Ahli Waris di sebelah kiri, 2) Lalu klik kartu Fraksi Pecahan yang sesuai di sebelah kanan!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Ahli Waris & Kondisi */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pilih Ahli Waris:
              </h4>
              <div className="space-y-2">
                {MATCHING_PAIRS_GAME.map(pair => {
                  const isMatched = matchedIds.includes(pair.id);
                  const isSelected = selectedHeir?.id === pair.id;

                  return (
                    <button
                      key={pair.id}
                      disabled={isMatched}
                      onClick={() => {
                        setSelectedHeir(pair);
                        setMatchingWrong(false);
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-all ${
                        isMatched
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-800 dark:text-emerald-300 opacity-60'
                          : isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-400 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{pair.heir}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{pair.condition}</p>
                        </div>
                        {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Fraksi Target */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cocokkan dengan Pecahan Bagian:
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {['1/2', '1/4', '1/8', '2/3', '1/3', '1/6'].map(fraction => (
                  <button
                    key={fraction}
                    disabled={!selectedHeir}
                    onClick={() => handleSelectFraction(fraction)}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      matchingWrong
                        ? 'bg-red-50 dark:bg-red-950 border-red-500'
                        : selectedHeir
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:scale-105 shadow-md border-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className="text-2xl font-black font-mono">{fraction}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reset matching button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setMatchedIds([]);
                setSelectedHeir(null);
                showToast('info', 'Game Direset', 'Semua pasangan dapat dicocokkan kembali.');
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              Reset Game Pasangan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
