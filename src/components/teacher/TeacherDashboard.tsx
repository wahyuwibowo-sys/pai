import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ManajemenSiswa } from './ManajemenSiswa';
import { ManajemenGuru } from './ManajemenGuru';
import { ManajemenMateri } from './ManajemenMateri';
import { ManajemenSoal } from './ManajemenSoal';
import { MonitoringNilai } from './MonitoringNilai';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  BookOpen,
  HelpCircle,
  FileSpreadsheet,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  Clock,
  Award,
} from 'lucide-react';

interface TeacherDashboardProps {
  initialTab?: 'overview' | 'siswa' | 'guru' | 'materi' | 'soal' | 'monitoring';
  onOpenEditProfile?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  initialTab = 'overview',
  onOpenEditProfile,
}) => {
  const { users, materials, questions, results, testPassingScore, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'siswa' | 'guru' | 'materi' | 'soal' | 'monitoring'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const studentUsers = users.filter(u => u.role === 'siswa');
  const classList = Array.from(new Set(studentUsers.map(s => s.kelas)));

  // Metrics
  const totalStudents = studentUsers.length;
  const totalQuestions = questions.length;
  const totalClasses = classList.length;

  const examResults = results.filter(r => r.tipe === 'uji_kemampuan');
  const finishedStudentsCount = new Set(examResults.map(r => r.idSiswa)).size;

  const averageScore = examResults.length > 0
    ? Math.round(examResults.reduce((acc, r) => acc + r.nilai, 0) / examResults.length)
    : 0;

  const passedCount = examResults.filter(r => r.statusTuntas).length;
  const passRate = examResults.length > 0
    ? Math.round((passedCount / examResults.length) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-16">
      {/* Teacher Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-emerald-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-400/30">
                <GraduationCap className="w-3.5 h-3.5" /> Portal Guru & Administrator PAI
              </span>
              <span className="text-xs text-emerald-200">
                • {currentUser?.nama}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Dashboard Manajemen & Monitoring Faraidh
            </h1>
            <p className="text-xs text-emerald-100/80 max-w-xl">
              Pusat kendali pembelajaran: pantau hasil belajar, kelola modul, bank soal, dan ekspor laporan resmi.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {onOpenEditProfile && (
              <button
                type="button"
                onClick={onOpenEditProfile}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <span>Edit Profil Guru</span>
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2 bg-emerald-950/60 px-3.5 py-2 rounded-xl border border-emerald-500/20">
              <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                PAI
              </div>
              <div>
                <p className="text-xs font-bold text-white">SMK / SMA</p>
                <p className="text-[10px] text-emerald-300">T.A. 2026/2027</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeTab === 'overview'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard Overview
        </button>

        <button
          onClick={() => setActiveTab('monitoring')}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeTab === 'monitoring'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          Monitoring & Laporan (PDF/Excel)
        </button>

        <button
          onClick={() => setActiveTab('siswa')}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeTab === 'siswa'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Manajemen Siswa ({totalStudents})
        </button>

        <button
          onClick={() => setActiveTab('guru')}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeTab === 'guru'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          Manajemen Guru & Admin ({users.filter(u => u.role === 'guru' || u.role === 'admin').length})
        </button>

        <button
          onClick={() => setActiveTab('materi')}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeTab === 'materi'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Manajemen Materi ({materials.length})
        </button>

        <button
          onClick={() => setActiveTab('soal')}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeTab === 'soal'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-amber-500" />
          Manajemen Soal ({totalQuestions})
        </button>
      </div>

      {/* OVERVIEW TAB CONTENT */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 6 Summary Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Jumlah Siswa
              </span>
              <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {totalStudents}
              </p>
              <span className="text-[10px] text-slate-400">Terdaftar aktif</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Jumlah Kelas
              </span>
              <p className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                {totalClasses}
              </p>
              <span className="text-[10px] text-slate-400">RPL, TKJ, OTKP, BDP</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Bank Soal
              </span>
              <p className="text-2xl font-black font-mono text-amber-500">
                {totalQuestions}
              </p>
              <span className="text-[10px] text-slate-400">Pilihan & Kasus</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Rata-rata Nilai
              </span>
              <p className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400">
                {averageScore}
              </p>
              <span className="text-[10px] text-slate-400">Skala 100</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Ujian Selesai
              </span>
              <p className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                {finishedStudentsCount}
              </p>
              <span className="text-[10px] text-slate-400">Siswa submit</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Ketuntasan
              </span>
              <p className="text-2xl font-black font-mono text-emerald-600">
                {passRate}%
              </p>
              <span className="text-[10px] text-slate-400">KKM &gt;= {testPassingScore}</span>
            </div>
          </div>

          {/* Graphical Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Bar Chart: Per-Class Average */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Grafik Perkembangan Rata-rata Nilai per Kelas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Perbandingan performa pemahaman materi waris antar rombongan belajar
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Target KKM: {testPassingScore}
                </span>
              </div>

              {/* Custom SVG Bar Chart */}
              <div className="space-y-4 pt-2">
                {classList.map(cls => {
                  const classResults = examResults.filter(r => r.kelas === cls);
                  const classAvg = classResults.length > 0
                    ? Math.round(classResults.reduce((a, b) => a + b.nilai, 0) / classResults.length)
                    : 78; // baseline
                  const isPassing = classAvg >= testPassingScore;

                  return (
                    <div key={cls} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-800 dark:text-slate-200">Kelas {cls}</span>
                        <span className={`font-mono font-bold ${isPassing ? 'text-emerald-600' : 'text-amber-500'}`}>
                          {classAvg} / 100 ({classResults.length} Peserta)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden">
                        <div
                          className={`h-3.5 rounded-full transition-all duration-500 ${
                            isPassing
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                              : 'bg-gradient-to-r from-amber-500 to-orange-500'
                          }`}
                          style={{ width: `${classAvg}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Students Leaderboard */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Siswa Berprestasi (Nilai Tertinggi)
              </h3>

              <div className="space-y-2.5">
                {studentUsers
                  .sort((a, b) => (b.xp || 0) - (a.xp || 0))
                  .slice(0, 5)
                  .map((s, idx) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                            idx === 0
                              ? 'bg-amber-400 text-amber-950 shadow-sm'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-800'
                              : idx === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{s.nama}</p>
                          <p className="text-[10px] text-slate-500">{s.kelas}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {s.xp || 0} XP
                        </span>
                        <p className="text-[10px] text-slate-400 font-semibold">Lvl {s.level || 1}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MONITORING TAB */}
      {activeTab === 'monitoring' && <MonitoringNilai />}

      {/* SISWA TAB */}
      {activeTab === 'siswa' && <ManajemenSiswa />}

      {/* GURU TAB */}
      {activeTab === 'guru' && <ManajemenGuru />}

      {/* MATERI TAB */}
      {activeTab === 'materi' && <ManajemenMateri />}

      {/* SOAL TAB */}
      {activeTab === 'soal' && <ManajemenSoal />}
    </div>
  );
};
