import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Question } from '../../types';
import confetti from 'canvas-confetti';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  Sparkles,
  FileCheck,
  Send,
} from 'lucide-react';

export const UjiKemampuanTab: React.FC = () => {
  const { questions, currentUser, submitResult, testDurationMinutes, testPassingScore } = useAuth();
  const { showToast } = useToast();

  const examQuestions = questions.filter(q => q.kategori === 'uji_kemampuan');

  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(testDurationMinutes * 60);

  // Result metrics
  const [finalScore, setFinalScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const startExam = () => {
    // Shuffle questions
    const shuffled = [...examQuestions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
    setUserAnswers({});
    setTimeLeft(testDurationMinutes * 60);
    setHasStarted(true);
    setIsCompleted(false);
    showToast('info', 'Ujian Dimulai', `Durasi: ${testDurationMinutes} menit. Kerjakan dengan jujur.`);
  };

  // Timer Countdown with Auto-Submit
  useEffect(() => {
    if (!hasStarted || isCompleted) return;

    if (timeLeft <= 0) {
      handleFinishExam(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, isCompleted, timeLeft]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleFinishExam = (isAutoSubmit = false) => {
    let score = 0;
    let correct = 0;
    let wrong = 0;

    const totalWeight = shuffledQuestions.reduce((acc, q) => acc + q.skor, 0) || 100;

    shuffledQuestions.forEach(q => {
      const given = (userAnswers[q.id] || '').trim().toLowerCase();
      const actual = q.jawaban.trim().toLowerCase();
      const isMatch =
        given === actual || (q.tipe === 'isian' && actual.includes(given) && given.length > 2);

      if (isMatch) {
        score += q.skor;
        correct += 1;
      } else {
        wrong += 1;
      }
    });

    const normalizedScore = Math.min(100, Math.round((score / totalWeight) * 100));
    setFinalScore(normalizedScore);
    setCorrectCount(correct);
    setWrongCount(wrong);
    setIsCompleted(true);

    const isPass = normalizedScore >= testPassingScore;

    // Save to Firestore Results
    if (currentUser) {
      submitResult({
        idSiswa: currentUser.id,
        namaSiswa: currentUser.nama,
        kelas: currentUser.kelas,
        tipe: 'uji_kemampuan',
        nilai: normalizedScore,
        jumlahBenar: correct,
        jumlahSalah: wrong,
        totalSoal: shuffledQuestions.length,
        statusTuntas: isPass,
      });
    }

    if (isPass) {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      showToast('success', 'Ujian Selesai! 🎉', `Nilai Anda: ${normalizedScore} (TUNTAS)`);
    } else {
      showToast('warning', 'Ujian Selesai', `Nilai Anda: ${normalizedScore} (Perlu Bimbingan)`);
    }

    if (isAutoSubmit) {
      showToast('info', 'Waktu Habis', 'Jawaban Anda telah otomatis dikirimkan.');
    }
  };

  // Format Time Remaining
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Evaluation Category
  const getCategory = (score: number) => {
    if (score >= 90) return { label: 'Sangat Baik (A)', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500' };
    if (score >= 80) return { label: 'Baik (B)', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-500' };
    if (score >= 70) return { label: 'Cukup (C)', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-500' };
    return { label: 'Perlu Bimbingan (D)', color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border-red-500' };
  };

  const categoryInfo = getCategory(finalScore);

  return (
    <div className="space-y-8 animate-in fade-in-50">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 shadow-xl border border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
              <FileCheck className="w-3.5 h-3.5" /> Evaluasi Kompetensi Resmi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Uji Kemampuan Faraidh
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Tes penilaian resmi materi hukum waris Islam dengan batasan waktu, pengacakan soal, dan penilaian otomatis yang langsung tercatat pada dashboard guru.
            </p>
          </div>

          {/* Test Parameters Badge */}
          <div className="bg-emerald-950/50 p-4 rounded-2xl border border-emerald-500/30 text-xs space-y-1 shrink-0">
            <p className="font-bold text-amber-300">Ketentuan Ujian:</p>
            <p className="text-emerald-100">• Durasi Waktu: {testDurationMinutes} Menit</p>
            <p className="text-emerald-100">• Standar Kelulusan (KKM): {testPassingScore}</p>
            <p className="text-emerald-100">• Jumlah Soal: {examQuestions.length} Butir</p>
          </div>
        </div>
      </div>

      {/* START SCREEN */}
      {!hasStarted && !isCompleted && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-md text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Siap Melaksanakan Uji Kemampuan?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Setelah tombol dimulai ditekan, hitung mundur waktu {testDurationMinutes} menit akan berjalan. Pastikan koneksi stabil dan kerjakan secara mandiri.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/50 text-left text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" /> Perhatian:
            </p>
            <p>1. Soal akan diacak secara otomatis untuk setiap peserta.</p>
            <p>2. Jika waktu habis, sistem akan melakukan submit otomatis terhadap jawaban yang sudah terisi.</p>
            <p>3. Hasil nilai akhir akan langsung masuk ke tabel monitoring Guru PAI.</p>
          </div>

          <button
            onClick={startExam}
            className="py-3 px-8 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-700/20 active:scale-98 transition-all"
          >
            Mulai Ujian Sekarang
          </button>
        </div>
      )}

      {/* EXAM IN PROGRESS */}
      {hasStarted && !isCompleted && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Sticky Timer Bar */}
          <div className="sticky top-20 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Peserta Ujian:</p>
              <p className="text-xs font-black text-slate-900 dark:text-white">
                {currentUser?.nama} ({currentUser?.kelas})
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-black border ${
                  timeLeft <= 180
                    ? 'bg-red-50 dark:bg-red-950 border-red-500 text-red-600 dark:text-red-400 animate-pulse'
                    : 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
              <button
                onClick={() => handleFinishExam(false)}
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Selesai
              </button>
            </div>
          </div>

          {/* List of Questions */}
          <div className="space-y-6">
            {shuffledQuestions.map((q, idx) => {
              const selected = userAnswers[q.id] || '';
              return (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="font-bold text-xs text-emerald-700 dark:text-emerald-400">
                      Soal Nomor {idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Bobot: {q.skor} Poin
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                    {q.soal}
                  </p>

                  {/* Options */}
                  {q.tipe === 'isian' ? (
                    <input
                      type="text"
                      value={selected}
                      onChange={e => handleAnswerSelect(q.id, e.target.value)}
                      placeholder="Ketik jawaban isian Anda..."
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  ) : (
                    <div className="space-y-2">
                      {(q.opsi || []).map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleAnswerSelect(q.id, opt)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center gap-3 ${
                            selected === opt
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-600 font-bold text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                              : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Action */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Terjawab: {Object.keys(userAnswers).length} dari {shuffledQuestions.length} Soal
            </span>
            <button
              onClick={() => handleFinishExam(false)}
              className="py-3 px-8 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-700/20 active:scale-98 transition-all"
            >
              Kirim Jawaban Ujian
            </button>
          </div>
        </div>
      )}

      {/* EXAM RESULT SUMMARY */}
      {isCompleted && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-xl space-y-6 text-center animate-in zoom-in-95">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
            <Award className="w-10 h-10 text-amber-500" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Hasil Resmi Uji Kemampuan
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {currentUser?.nama}
            </h3>
            <p className="text-xs text-slate-500">{currentUser?.kelas}</p>
          </div>

          {/* Score Badge */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 max-w-sm mx-auto space-y-2">
            <p className="text-xs font-bold text-slate-500">Nilai Akhir Ujian:</p>
            <p className="text-5xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {finalScore}
            </p>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border ${categoryInfo.color}`}>
              Kategori: {categoryInfo.label}
            </div>
          </div>

          {/* Breakdown Stats */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-xs">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20">
              <p className="text-slate-500 dark:text-slate-400 text-[10px]">Benar</p>
              <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {correctCount}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-500/20">
              <p className="text-slate-500 dark:text-slate-400 text-[10px]">Salah</p>
              <p className="text-base font-black text-red-600 dark:text-red-400 font-mono">
                {wrongCount}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 text-[10px]">Status KKM</p>
              <p className={`text-xs font-black ${finalScore >= testPassingScore ? 'text-emerald-600' : 'text-red-500'}`}>
                {finalScore >= testPassingScore ? 'TUNTAS' : 'REMEDIAL'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-3 pt-3">
            <button
              onClick={() => {
                setHasStarted(false);
                setIsCompleted(false);
              }}
              className="py-2.5 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
            >
              Kembali ke Menu
            </button>
            <button
              onClick={startExam}
              className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Ulangi Ujian
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
