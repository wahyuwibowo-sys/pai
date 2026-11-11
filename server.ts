import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolvePort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = Number(process.argv[portArgIndex + 1]);
    if (!isNaN(parsed)) return parsed;
  }
  return 3000;
}

const port = resolvePort();
const app = express();

app.use(express.json());

// Knowledge-based fallback for Faraidh learning if API key is pending or network times out
function getFaraidhExpertReply(query: string, studentName?: string): string {
  const q = query.toLowerCase();
  const sapaan = `Assalamu'alaikum wr. wb.${studentName ? ' ' + studentName : ''}! Barakallahu fiik. 🌟\n\n`;

  if (q.includes('istri')) {
    return sapaan + `**Kaidah Bagian Waris Istri (QS. An-Nisa: 12):**\n` +
      `1. **Mendapat 1/4 (Seperempat):** Jika pewaris (suami) **TIDAK** memiliki keturunan (anak maupun cucu).\n` +
      `2. **Mendapat 1/8 (Seperdelapan):** Jika pewaris (suami) **MEMILIKI** keturunan (anak atau cucu).\n\n` +
      `*Catatan Penting:* Jika pewaris meninggalkan lebih dari 1 orang istri (misal 2, 3, atau 4 istri), maka bagian 1/4 atau 1/8 tersebut dibagi rata sama besar di antara seluruh istri.`;
  }

  if (q.includes('suami')) {
    return sapaan + `**Kaidah Bagian Waris Suami (QS. An-Nisa: 12):**\n` +
      `1. **Mendapat 1/2 (Setengah):** Jika istri yang meninggal **TIDAK** meninggalkan keturunan (anak/cucu).\n` +
      `2. **Mendapat 1/4 (Seperempat):** Jika istri yang meninggal **MEMILIKI** keturunan (anak/cucu).`;
  }

  if (q.includes('ibu')) {
    return sapaan + `**Kaidah Bagian Waris Ibu (QS. An-Nisa: 11):**\n` +
      `1. **Mendapat 1/6 (Seperenam):** Jika ada keturunan (anak/cucu) ATAU ada 2 orang saudara atau lebih (baik saudara kandung, seayah, maupun seibu).\n` +
      `2. **Mendapat 1/3 (Sepertiga):** Jika tidak ada anak/cucu dan saudara kurang dari 2 orang.\n` +
      `3. **Mendapat 1/3 dari Sisa (Tsulutsul Baqi):** Khusus pada kasus *Gharawain / Umariyyatan* (hanya bersama Suami/Istri dan Ayah).`;
  }

  if (q.includes('ayah') || q.includes('bapak')) {
    return sapaan + `**Kaidah Bagian Waris Ayah Kandung (QS. An-Nisa: 11):**\n` +
      `1. **Mendapat 1/6 murni:** Jika ada keturunan laki-laki (anak laki-laki atau cucu laki-laki).\n` +
      `2. **Mendapat 1/6 + 'Ashabah (Sisa):** Jika hanya ada anak perempuan atau cucu perempuan (tanpa anak laki-laki).\n` +
      `3. **Mendapat 'Ashabah penuh (Seluruh Sisa):** Jika pewaris sama sekali tidak meninggalkan keturunan.`;
  }

  if (q.includes('ashabah') || q.includes('sisa')) {
    return sapaan + `**Konsep 'Ashabah (Penerima Hak Sisa Harta):**\n\n` +
      `Dalam ilmu Faraidh, 'Ashabah terbagi menjadi 3 macam:\n` +
      `1. **'Ashabah bi Nafsihi:** Ahli waris laki-laki yang berhak menerima sisa secara mandiri (Anak laki-laki, cucu laki-laki, ayah, kakek, saudara laki-laki kandung/seayah).\n` +
      `2. **'Ashabah bil Ghair:** Ahli waris perempuan yang menjadi penerima sisa karena ditarik oleh saudara laki-lakinya (Anak perempuan ditarik anak laki-laki dengan rasio 2:1).\n` +
      `3. **'Ashabah ma'al Ghair:** Ahli waris perempuan yang menjadi penerima sisa bersama perempuan lain (Saudari kandung bersama anak perempuan).\n\n` +
      `*Dalil:* "Bagikanlah harta warisan kepada yang berhak, lalu sisanya untuk kerabat laki-laki yang terdekat." (HR. Bukhari-Muslim)`;
  }

  if (q.includes('awal') || q.includes('awl') || q.includes('‘awal')) {
    return sapaan + `**Konsep Masalah 'Awal (العول):**\n\n` +
      `Terjadi ketika **jumlah saham bagian Ashabul Furudh melebihi angka Asal Masalah** awal.\n` +
      `*Contoh:* Suami (1/2 = 3 saham) + 2 Saudari Kandung (2/3 = 4 saham). Asal masalah awal = 6. Total saham = 3 + 4 = 7.\n` +
      `*Solusi Fiqih:* Asal masalah dinaikkan menjadi 7, sehingga setiap ahli waris tetap mendapat bagian dengan pengurangan proporsional yang adil tanpa menzalimi satu pihak pun.`;
  }

  if (q.includes('radd')) {
    return sapaan + `**Konsep Masalah Radd (الرد):**\n\n` +
      `Kebalikan dari 'Awal, Radd terjadi ketika **total saham Ashabul Furudh kurang dari Asal Masalah dan tidak ada ahli waris penerima 'Ashabah**.\n` +
      `*Solusi Fiqih:* Sisa harta dikembalikan secara proporsional kepada Ashabul Furudh nasab (seperti Ibu, Anak Perempuan, Saudara Seibu), sedangkan Suami/Istri tidak berhak menerima tambahan radd menurut jumhur ulama.`;
  }

  if (q.includes('asal masalah') || q.includes('kpk')) {
    return sapaan + `**Konsep Asal Masalah (Ashlul Mas'alah):**\n\n` +
      `Asal Masalah adalah angka kelipatan persekutuan terkecil (KPK) dari penyebut-penyebut pecahan furudhul muqaddarah yang ada.\n` +
      `Dalam Faraidh, angka Asal Masalah yang baku hanya ada 7 macam:\n` +
      `**2, 3, 4, 6, 8, 12, dan 24**.\n\n` +
      `Fungsinya agar harta warisan dapat dihitung dan dibagi dalam bentuk bilangan bulat (saham) sebelum dikonversikan ke nominal uang.`;
  }

  return sapaan + `**Langkah Emas Menyelesaikan Kasus Waris (Faraidh):**\n\n` +
    `1. **Langkah 1 (Identifikasi & Hijab):** Cek siapa saja ahli waris yang ada. Tentukan siapa yang terhalang (*mahjub hirman*), misalnya kakek terhalang oleh ayah, cucu terhalang oleh anak laki-laki.\n` +
    `2. **Langkah 2 (Tentukan Furudh):** Tentukan porsi pasti masing-masing ahli waris ($1/2$, $1/4$, $1/8$, $2/3$, $1/3$, $1/6$) atau status 'Ashabah.\n` +
    `3. **Langkah 3 (Cari Asal Masalah):** Hitung KPK dari penyebut pecahan furudh. Periksa apakah terjadi 'Awal (saham > asal masalah) atau Radd (saham < asal masalah).\n` +
    `4. **Langkah 4 (Hitung Nominal):** Kalikan saham masing-masing dengan nilai harta per saham: $(\\text{Saham} / \\text{Asal Masalah}) \\times \\text{Harta Bersih}$.\n\n` +
    `Ada pertanyaan tentang kasus atau bagian ahli waris tertentu? Silakan tanyakan kepada Ustadz AI!`;
}

// AI PAI Assistant Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;
    const lastUserMessage = (messages || []).filter((m: any) => m.role === 'user').slice(-1)[0];
    const userPromptText = lastUserMessage?.text || '';

    // If API key is available, try Gemini 3.8 Flash with a defensive timeout
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const systemInstruction = `Kamu adalah "Ustadz AI Faraidh", asisten cerdas pembelajaran Pendidikan Agama Islam (PAI) materi Pembagian Harta Waris (Ilmu Faraidh) untuk siswa SMA/SMK di aplikasi "PAI-Waris Digital".
Karakter: Ramah, santun, Islami, edukatif, dan memotivasi siswa. Berlandaskan dalil Al-Qur'an (QS. An-Nisa ayat 11, 12, dan 176) serta Hadits Shahih.
PENTING: Jangan langsung membocorkan jawaban akhir jika siswa bertanya tentang soal latihan atau kuis, melainkan bimbing siswa dengan petunjuk: siapa yang mahjub (terhalang), bagian masing-masing (1/2, 1/4, 1/8, dll), dan cara mencari asal masalah.
${context ? `Konteks siswa: ${JSON.stringify(context)}` : ''}`;

        const contents = (messages || []).map((m: { role: string; text: string }) => ({
          role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.text }],
        }));

        // Timeout promise after 5 seconds to guarantee fast UI response
        const apiCall = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: { systemInstruction },
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI response timeout')), 5000)
        );

        const response: any = await Promise.race([apiCall, timeoutPromise]);
        if (response && response.text) {
          return res.json({ reply: response.text });
        }
      } catch (geminiError) {
        console.warn('Gemini dynamic fallback to Faraidh expert KB:', geminiError);
      }
    }

    // High fidelity pedagogical fallback
    const fallbackReply = getFaraidhExpertReply(userPromptText, context?.namaSiswa);
    return res.json({ reply: fallbackReply });
  } catch (error: any) {
    console.error('Server error in /api/ai/chat:', error);
    return res.json({
      reply: "Assalamu'alaikum wr. wb. Terjadi kendala teknis sementara. Untuk perhitungan waris, silakan rujuk Tab Simulasi Waris atau tanyakan kembali tentang bagian ahli waris tertentu.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`PAI-Waris Digital server running on port ${port}`);
  });
}

startServer();
