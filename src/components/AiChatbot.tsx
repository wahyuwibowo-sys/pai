import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, User, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

const QUICK_PROMPTS = [
  'Bagian istri jika ada anak dan jika tidak ada anak?',
  'Apa perbedaan Ashabah bi Nafsihi dan bil Ghair?',
  'Kapan terjadi masalah \'Awal dan bagaimana solusinya?',
  'Bantu petunjuk langkah menghitung soal waris nomor 1',
  'Siapa saja yang terhalang jika ada anak laki-laki?',
];

export const AiChatbot: React.FC = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-01',
      role: 'assistant',
      text: `Assalamu'alaikum wr. wb. Ahlan wa sahlan ${currentUser?.nama ? currentUser.nama.split(' ')[0] : 'Siswa'}! 🌟\n\nSaya **Ustadz AI Faraidh**, asisten pembimbingmu dalam belajar materi Waris Islam. Kamu bisa bertanya konsep hukum, rukun waris, bagian ahli waris, maupun meminta petunjuk cara menyelesaikan soal latihan tanpa langsung membocorkan jawaban akhir. Ada yang bisa saya bantu?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            text: m.text,
          })),
          context: {
            namaSiswa: currentUser?.nama,
            kelas: currentUser?.kelas,
            role: currentUser?.role,
            xp: currentUser?.xp,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi server AI');
      }

      const data = await response.json();
      const aiReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        text: data.reply || 'Mohon maaf, terjadi kendala teknis dalam merespons pertanyaanmu.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiReply]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `Afwan, koneksi ke asisten AI sedang terhambat. Silakan coba kembali sesaat lagi. (${err?.message || 'Error'})`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-emerald-400/30 group"
          title="Buka Ustadz AI Pembimbing Faraidh"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
            </span>
          </div>
          <span className="text-sm font-semibold tracking-wide flex items-center gap-1.5">
            Ustadz AI <Sparkles className="w-3.5 h-3.5 text-amber-300 inline" />
          </span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-full max-w-md h-[580px] max-h-[85vh] bg-white dark:bg-slate-900 border border-emerald-600/30 dark:border-emerald-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-900 p-4 text-white flex items-center justify-between border-b border-emerald-600/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-950/60 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-inner">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5 text-emerald-50">
                  Ustadz AI Pembimbing
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded font-mono">
                    PAI Faraidh
                  </span>
                </h3>
                <p className="text-[11px] text-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Bimbingan Faraidh Sesuai Syariat
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: 'welcome-reset',
                      role: 'assistant',
                      text: "Assalamu'alaikum! Obrolan telah di-reset. Apa yang ingin kamu diskusikan seputar materi waris?",
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                }
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-600/40 transition-colors"
                title="Bersihkan obrolan"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-600/40 transition-colors"
                title="Tutup chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/30 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0 px-1">
              Tanya Cepat:
            </span>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="text-[11px] whitespace-nowrap bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700/50 hover:border-emerald-500 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 px-2.5 py-1 rounded-full transition-all shadow-xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Message History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/50">
            {messages.map(msg => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-full bg-emerald-700 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                      isAssistant
                        ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none'
                        : 'bg-emerald-600 dark:bg-emerald-700 text-white rounded-tr-none'
                    }`}
                  >
                    <div className="whitespace-pre-line space-y-1">
                      {msg.text}
                    </div>
                    <div
                      className={`text-[9px] mt-1 text-right ${
                        isAssistant ? 'text-slate-400' : 'text-emerald-200'
                      }`}
                    >
                      {msg.time}
                    </div>
                  </div>
                  {!isAssistant && (
                    <div className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[11px] text-slate-400 ml-1.5">Ustadz AI sedang menelaah dalil & kaidah...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Tanyakan konsep waris atau minta petunjuk soal..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
