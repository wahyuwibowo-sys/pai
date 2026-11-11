import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Search, CheckCircle2, ChevronRight, Share2, Volume2, Bookmark, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const FURUDH_INFOGRAPHICS = [
  {
    fraction: '1/2',
    name: 'An-Nishf (Setengah)',
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-500/40',
    recipients: [
      { who: 'Suami', condition: 'Jika istri yang wafat TIDAK memiliki keturunan (anak/cucu).' },
      { who: 'Anak Perempuan Tunggal', condition: 'Jika sendirian dan tidak ada anak laki-laki.' },
      { who: 'Cucu Perempuan Tunggal', condition: 'Jika sendirian tanpa anak perempuan dan tanpa cucu laki-laki.' },
      { who: 'Saudari Kandung Tunggal', condition: 'Jika kalalah (tanpa anak & tanpa ayah) dan tanpa saudara laki-laki.' },
      { who: 'Saudari Seayah Tunggal', condition: 'Jika tanpa saudari kandung dan tanpa saudara seayah.' },
    ],
  },
  {
    fraction: '1/4',
    name: 'Ar-Rubu\' (Seperempat)',
    color: 'from-teal-500 to-cyan-600',
    border: 'border-teal-500/40',
    recipients: [
      { who: 'Suami', condition: 'Jika istri yang wafat MEMILIKI keturunan (anak/cucu).' },
      { who: 'Istri (1 atau lebih)', condition: 'Jika suami yang wafat TIDAK memiliki keturunan (dibagi rata jika lebih dari 1).' },
    ],
  },
  {
    fraction: '1/8',
    name: 'Ats-Tsumun (Seperdelapan)',
    color: 'from-blue-500 to-indigo-600',
    border: 'border-blue-500/40',
    recipients: [
      { who: 'Istri (1 atau lebih)', condition: 'Jika suami yang wafat MEMILIKI keturunan (anak/cucu).' },
    ],
  },
  {
    fraction: '2/3',
    name: 'Ats-Tsulutsan (Dua Pertiga)',
    color: 'from-amber-500 to-orange-600',
    border: 'border-amber-500/40',
    recipients: [
      { who: '2 Anak Perempuan atau lebih', condition: 'Jika tidak didampingi anak laki-laki.' },
      { who: '2 Cucu Perempuan atau lebih', condition: 'Jika tanpa anak dan tanpa cucu laki-laki.' },
      { who: '2 Saudari Kandung atau lebih', condition: 'Jika kalalah dan tidak ada saudara laki-laki kandung.' },
      { who: '2 Saudari Seayah atau lebih', condition: 'Jika tanpa saudara kandung dan tanpa saudara laki-laki seayah.' },
    ],
  },
  {
    fraction: '1/3',
    name: 'Ats-Tsuluts (Sepertiga)',
    color: 'from-violet-500 to-purple-600',
    border: 'border-violet-500/40',
    recipients: [
      { who: 'Ibu', condition: 'Jika pewaris TIDAK memiliki keturunan dan jumlah saudara kurang dari 2 orang.' },
      { who: '2 Saudara Seibu atau lebih', condition: 'Dibagi sama rata antara laki-laki dan perempuan pada kondisi kalalah.' },
    ],
  },
  {
    fraction: '1/6',
    name: 'As-Sudus (Seperenam)',
    color: 'from-rose-500 to-pink-600',
    border: 'border-rose-500/40',
    recipients: [
      { who: 'Ayah', condition: 'Jika pewaris memiliki keturunan laki-laki (anak/cucu laki-laki).' },
      { who: 'Ibu', condition: 'Jika pewaris memiliki keturunan ATAU memiliki 2 saudara atau lebih.' },
      { who: 'Kakek Shahih', condition: 'Menggantikan posisi ayah jika tidak ada ayah dan ada keturunan laki-laki.' },
      { who: 'Nenek Shahihah', condition: 'Jika pewaris tidak memiliki ibu.' },
      { who: '1 Saudara Seibu', condition: 'Jika sendiri pada kondisi kalalah.' },
      { who: 'Cucu Perempuan', condition: 'Bersama 1 anak perempuan kandung (sebagai pelengkap 2/3).' },
    ],
  },
];

export const MateriTab: React.FC = () => {
  const { materials } = useAuth();
  const { showToast } = useToast();

  const [activeMaterialId, setActiveMaterialId] = useState<string>(materials[0]?.id || 'mat-01');
  const [selectedFurudh, setSelectedFurudh] = useState<string>('1/2');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const categories = ['Semua', 'Pengertian', 'Rukun & Syarat', 'Sebab Mewarisi', 'Bagian Ahli Waris', 'Kasus Khusus'];

  const filteredMaterials = materials.filter(m => {
    const matchCat = selectedCategory === 'Semua' || m.kategori === selectedCategory;
    const matchSearch =
      m.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.ringkasan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const activeMaterial = materials.find(m => m.id === activeMaterialId) || materials[0];

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`>]/g, ''));
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      showToast('info', 'Audio Reader', 'Browser Anda belum mendukung text-to-speech.');
    }
  };

  const currentFurudhData = FURUDH_INFOGRAPHICS.find(f => f.fraction === selectedFurudh) || FURUDH_INFOGRAPHICS[0];

  return (
    <div className="space-y-8 animate-in fade-in-50">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-600/30">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15),transparent_70%)] pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold border border-amber-400/30 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" /> Kurikulum PAI SMA/SMK Kelas XII
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Materi Pembelajaran Ilmu Waris (Faraidh)
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Kuasai konsep dasar hukum waris Islam, rukun & syarat, ashabul furudh, hijab hirman, hingga kasus perhitungan khusus secara interaktif dan komprehensif.
          </p>
        </div>
      </div>

      {/* INTERACTIVE INFOGRAPHIC: FURUDHUL MUQADDARAH */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-emerald-900/10 dark:border-emerald-500/20 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Infografis Interaktif
            </span>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
              6 Pecahan Pokok Bagian Pasti (Furudhul Muqaddarah)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Klik setiap pecahan untuk mempelajari siapa saja yang berhak menerimanya dan syarat-syarat syar'inya:
            </p>
          </div>
        </div>

        {/* Fraction Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {FURUDH_INFOGRAPHICS.map(item => {
            const isSelected = selectedFurudh === item.fraction;
            return (
              <button
                key={item.fraction}
                onClick={() => setSelectedFurudh(item.fraction)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                  isSelected
                    ? `bg-gradient-to-br ${item.color} text-white shadow-lg scale-105 ${item.border}`
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200'
                }`}
              >
                <span className="text-xl sm:text-2xl font-black font-mono">{item.fraction}</span>
                <span className="text-[10px] mt-1 font-semibold truncate text-center w-full">
                  {item.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detailed Recipients for Selected Fraction */}
        <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono font-black text-xs">
                {currentFurudhData.fraction}
              </span>
              Penerima Hak {currentFurudhData.name} ({currentFurudhData.recipients.length} Kategori Ahli Waris)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentFurudhData.recipients.map((rec, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800/90 p-3.5 rounded-xl border border-emerald-500/20 shadow-xs flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{rec.who}</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {rec.condition}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Material Reader & Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-4 space-y-4">
          {/* Search & Filter */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari materi waris..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Category Badges */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* List of Materials */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filteredMaterials.map(mat => {
              const isActive = mat.id === activeMaterialId;
              return (
                <button
                  key={mat.id}
                  onClick={() => setActiveMaterialId(mat.id)}
                  className={`w-full text-left p-3.5 transition-all flex items-start justify-between gap-2 ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      {mat.kategori}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {mat.judul}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {mat.ringkasan}
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive ? 'text-emerald-600 translate-x-1' : 'text-slate-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Viewer */}
        <div className="lg:col-span-8">
          {activeMaterial ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
              {/* Header */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-5 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    {activeMaterial.kategori}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSpeak(`${activeMaterial.judul}. ${activeMaterial.ringkasan}. ${activeMaterial.isi}`)}
                      className={`p-2 rounded-xl text-xs flex items-center gap-1.5 font-medium transition-colors ${
                        isSpeaking
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600'
                      }`}
                      title={isSpeaking ? 'Hentikan Pembaca Suara' : 'Dengarkan Materi (TTS)'}
                    >
                      <Volume2 className="w-4 h-4" />
                      <span className="hidden sm:inline">{isSpeaking ? 'Stop Audio' : 'Dengarkan'}</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="p-2 rounded-xl text-xs flex items-center gap-1.5 font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors"
                      title="Cetak atau Simpan Bab Materi sebagai PDF"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Cetak Bab</span>
                    </button>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {activeMaterial.judul}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {activeMaterial.ringkasan}
                </p>
              </div>

              {/* Dalil Box */}
              {activeMaterial.dalil && (
                <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-700/50 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <Bookmark className="w-4 h-4" /> Landasan Dalil Syar'i (Al-Qur'an & As-Sunnah)
                  </div>
                  <div className="text-right text-base sm:text-lg font-serif text-slate-900 dark:text-amber-100 leading-loose py-2">
                    {activeMaterial.dalil.split('\n')[0]}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-amber-200/90 italic font-medium">
                    {activeMaterial.dalil.split('\n')[1] || ''}
                  </p>
                </div>
              )}

              {/* Main Content (Markdown styled) */}
              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
                {activeMaterial.isi.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h3 key={idx} className="text-sm sm:text-base font-bold text-emerald-800 dark:text-emerald-300 mt-4 mb-1">
                        {paragraph.replace('### ', '')}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith('> ')) {
                    return (
                      <blockquote key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-l-4 border-emerald-500 italic my-2">
                        {paragraph.replace('> ', '')}
                      </blockquote>
                    );
                  }
                  if (paragraph.startsWith('---')) {
                    return <hr key={idx} className="border-slate-200 dark:border-slate-800 my-4" />;
                  }
                  return (
                    <p key={idx} className="whitespace-pre-line leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>Pilih materi untuk membaca</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
