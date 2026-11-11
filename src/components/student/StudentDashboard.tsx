import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MateriTab } from './MateriTab';
import { SimulasiTab } from './SimulasiTab';
import { LatihanTab } from './LatihanTab';
import { UjiKemampuanTab } from './UjiKemampuanTab';
import {
  BookOpen,
  Calculator,
  Zap,
  FileCheck,
  Award,
  TrendingUp,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface StudentDashboardProps {
  initialTab?: 'materi' | 'simulasi' | 'latihan' | 'uji';
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ initialTab = 'simulasi' }) => {
  const { currentUser, results } = useAuth();
  const [activeTab, setActiveTab] = useState<'materi' | 'simulasi' | 'latihan' | 'uji'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Calculate Student Stats
  const studentResults = results.filter(r => r.idSiswa === currentUser?.id);
  const latestResult = studentResults[0]; // results are sorted newest first
  const completedCount = studentResults.length;
  const badges = currentUser?.badges || ['Pemula Waris'];

  const navTabs = [
    { id: 'materi', label: '1. Materi Faraidh', icon: BookOpen },
    { id: 'simulasi', label: '2. Simulasi Waris', icon: Calculator },
    { id: 'latihan', label: '3. Latihan Soal', icon: Zap },
    { id: 'uji', label: '4. Uji Kemampuan', icon: FileCheck },
  ] as const;

  return (
    <div className="space-y-5 pb-16 animate-in fade-in-50">
      {/* Sleek, Modern Student Overview Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0">
            {currentUser?.nama.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                {currentUser?.nama}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shrink-0">
                Lvl {currentUser?.level || 1}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kelas: <span className="font-semibold text-slate-700 dark:text-slate-200">{currentUser?.kelas}</span> • Absen: #{currentUser?.nomorAbsen || 1}
            </p>
          </div>
        </div>

        {/* Compact Metrics & Badges */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs">
            <span className="text-slate-400 font-semibold text-[11px]">XP:</span>
            <span className="font-black text-amber-500 font-mono">{currentUser?.xp || 0}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs">
            <span className="text-slate-400 font-semibold text-[11px]">Nilai Terakhir:</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {latestResult ? latestResult.nilai : '-'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs">
            <span className="text-slate-400 font-semibold text-[11px]">Ujian Selesai:</span>
            <span className="font-black text-blue-600 dark:text-blue-400 font-mono">{completedCount}x</span>
          </div>

          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>{badges[0] || 'Pemula Waris'}</span>
          </div>
        </div>
      </div>

      {/* Modern, Compact Tab Navigation Pills */}
      <div className="flex items-center p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-x-auto no-scrollbar gap-1">
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[120px] sm:min-w-[140px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs border border-slate-200/60 dark:border-slate-700/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'materi' && <MateriTab />}
        {activeTab === 'simulasi' && <SimulasiTab />}
        {activeTab === 'latihan' && <LatihanTab />}
        {activeTab === 'uji' && <UjiKemampuanTab />}
      </div>
    </div>
  );
};
