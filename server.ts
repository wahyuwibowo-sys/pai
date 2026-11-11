import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolvePort(): number {
  // 1. If explicit --port argument is provided (e.g. dev server runner)
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = Number(process.argv[portArgIndex + 1]);
    if (!isNaN(parsed)) return parsed;
  }
  // 2. In Cloud Run deployment, PORT environment variable is required
  if (process.env.PORT) {
    const parsed = Number(process.env.PORT);
    if (process.env.NODE_ENV === 'production' || process.env.K_SERVICE || !process.argv.includes('--port')) {
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  // 3. Fallback to 3000
  return 3000;
}

const port = resolvePort();
const app = express();

app.use(express.json());

// Health check endpoint for Cloud Run and deployment probes
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Knowledge-based pedagogical engine for Faraidh learning and robust AI assistant fallback
function getFaraidhExpertReply(query: string, studentName?: string): string {
  const q = query.toLowerCase().trim();
  const sapaan = `Assalamu'alaikum wr. wb.${studentName ? ' ' + studentName : ''}! Barakallahu fiik. 🌟\n\n`;

  // 1. Soal Latihan & Uji Kemampuan (Spesifik sesuai Bank Soal PAI-Waris Digital)
  if (q.includes('soal') && (q.includes('nomor 1') || q.includes('no 1') || q.includes('no. 1') || q.includes('pertama') || q.includes('q-01'))) {
    return sapaan + `**Petunjuk Langkah Pengerjaan Soal Waris Nomor 1 (Kasus Pak Ahmad):**\n\n` +
      `Kasus: Pak Ahmad wafat meninggalkan seorang Istri, seorang Anak Laki-laki, dan harta warisan bersih.\n\n` +
      `📌 **Langkah Analisis:**\n` +
      `1. **Identifikasi Keturunan:** Pewaris memiliki anak laki-laki (furu').\n` +
      `2. **Tentukan Bagian Istri:** Berdasarkan QS. An-Nisa ayat 12, jika suami yang meninggal memiliki anak/keturunan, maka bagian Istri berkurang (*Hijab Nuqshan*) dari 1/4 menjadi **1/8 (Seperdelapan)**.\n` +
      `3. **Hak Anak Laki-laki:** Anak laki-laki berstatus sebagai penerima hak sisa (**'Ashabah bi Nafsihi**) dan mengambil sisa 7/8 harta.\n\n` +
      `💡 *Kunci Jawaban:* Bagian pasti (furudh) yang diperoleh Istri adalah **1/8**.`;
  }

  if (q.includes('soal') && (q.includes('nomor 2') || q.includes('no 2') || q.includes('no. 2') || q.includes('kedua') || q.includes('q-02'))) {
    return sapaan + `**Petunjuk Langkah Pengerjaan Soal Waris Nomor 2:**\n\n` +
      `Kasus: Seorang perempuan wafat meninggalkan seorang Suami dan Ayah kandung (tanpa memiliki anak).\n\n` +
      `📌 **Langkah Analisis:**\n` +
      `1. **Cek Keturunan:** Pewaris **TIDAK** meninggalkan keturunan (anak maupun cucu).\n` +
      `2. **Tentukan Bagian Suami:** Sesuai QS. An-Nisa ayat 12: *"Dan bagimu (suami-suami) seperdua dari harta yang ditinggalkan oleh istri-istrimu, jika mereka tidak mempunyai anak..."* -> Suami mendapat **1/2 (Setengah)**.\n` +
      `3. **Bagian Ayah Kandung:** Karena tidak ada keturunan sama sekali, Ayah bertindak sebagai **'Ashabah bi Nafsihi** yang mengambil seluruh sisa harta (1/2 bagian sisanya).\n\n` +
      `💡 *Kunci Jawaban:* Bagian Suami adalah **1/2**.`;
  }

  if (q.includes('soal') && (q.includes('nomor 3') || q.includes('no 3') || q.includes('no. 3') || q.includes('ketiga') || q.includes('q-03'))) {
    return sapaan + `**Petunjuk Langkah Pengerjaan Soal Nomor 3 (Kakek bersama Ayah):**\n\n` +
      `Pernyataan: *"Kakek shahih tetap mendapatkan bagian waris meskipun pewaris masih memiliki Ayah kandung."*\n\n` +
      `📌 **Analisis Kaidah Fiqih:**\n` +
      `- Dalam kaidah Hijab Hirman berlaku prinsip: **"Al-Aqrab fa Al-Aqrab"** (Kerabat yang lebih dekat derajatnya menghalangi kerabat yang lebih jauh).\n` +
      `- Kakek hanya bisa mewarisi jika ia terhubung melalui Ayah. Jika Ayah kandung masih hidup, maka Kakek terhalang total (**Mahjub Hirman**) oleh Ayah.\n\n` +
      `💡 *Kunci Jawaban:* Pernyataan tersebut adalah **Salah**. Kakek terhalang total oleh Ayah kandung.`;
  }

  if (q.includes('soal') && (q.includes('nomor 4') || q.includes('no 4') || q.includes('no. 4') || q.includes('keempat') || q.includes('q-04'))) {
    return sapaan + `**Petunjuk Langkah Pengerjaan Soal Nomor 4:**\n\n` +
      `Pertanyaan: Kondisi di mana total saham para Ashabul Furudh melebihi angka Asal Masalah sehingga penyebut harus dinaikkan disebut masalah...\n\n` +
      `📌 **Kaidah:**\n` +
      `- Terjadi defisit karena saham furudh > asal masalah (misal total saham 7 dari asal masalah 6).\n` +
      `- Pertama kali diputuskan pada masa Khalifah Umar bin Khattab radhiyallahu 'anhu dengan menaikkan asal masalah menjadi 7 secara adil.\n\n` +
      `💡 *Kunci Jawaban:* Disebut masalah **'Awal** (العول).`;
  }

  if (q.includes('hamdan') || (q.includes('120') && (q.includes('juta') || q.includes('000'))) || (q.includes('soal') && (q.includes('nomor 5') || q.includes('no 5') || q.includes('no. 5') || q.includes('kelima') || q.includes('q-05')))) {
    return sapaan + `**Petunjuk Langkah Pengerjaan Soal Studi Kasus Pak Hamdan (Rp 120.000.000):**\n\n` +
      `Kasus: Ahli waris terdiri dari: **Istri**, **1 Anak Laki-laki**, dan **1 Anak Perempuan**. Harta bersih: **Rp 120.000.000**.\n\n` +
      `📌 **Langkah Perhitungan Lengkap:**\n` +
      `1. **Bagian Istri (Ashabul Furudh):** Karena ada anak, Istri mendapat 1/8.\n` +
      `   $$\\text{Bagian Istri} = \\frac{1}{8} \\times \\text{Rp 120.000.000} = \\mathbf{\\text{Rp 15.000.000}}$$\n` +
      `2. **Hitung Sisa Harta ('Ashabah):**\n` +
      `   $$\\text{Sisa Harta} = \\text{Rp 120.000.000} - \\text{Rp 15.000.000} = \\mathbf{\\text{Rp 105.000.000}}$$\n` +
      `3. **Pembagian untuk Anak (Rasio 2 : 1):**\n` +
      `   - Anak laki-laki = 2 bagian, Anak perempuan = 1 bagian. Total bagian = $2 + 1 = 3$ porsi.\n` +
      `   - Nilai 1 bagian = $\\text{Rp 105.000.000} / 3 = \\text{Rp 35.000.000}$.\n` +
      `4. **Nominal Masing-masing Anak:**\n` +
      `   - **Anak Laki-laki:** $2 \\times \\text{Rp 35.000.000} = \\mathbf{\\text{Rp 70.000.000}}$\n` +
      `   - **Anak Perempuan:** $1 \\times \\text{Rp 35.000.000} = \\mathbf{\\text{Rp 35.000.000}}$\n\n` +
      `💡 *Kunci Jawaban:* Nominal yang diterima anak laki-laki adalah **Rp 70.000.000**.`;
  }

  // 2. Pertanyaan Quick Prompts Utama
  // Prompts: "Siapa saja yang terhalang jika ada anak laki-laki?"
  if ((q.includes('terhalang') || q.includes('mahjub')) && (q.includes('anak laki') || q.includes('anak laki-laki'))) {
    return sapaan + `**Daftar Ahli Waris yang Terhalang Total (Mahjub Hirman) oleh Anak Laki-laki:**\n\n` +
      `Anak laki-laki kandung adalah kerabat terdekat (*furu' dzukur*) yang memiliki hak 'Ashabah bi Nafsihi terkuat. Keberadaannya menghalangi:\n\n` +
      `1. **Cucu Laki-laki & Cucu Perempuan** (dari anak laki-laki) - Terhalang total karena posisinya digantikan oleh anak kandung.\n` +
      `2. **Saudara Laki-laki Kandung & Saudara Perempuan Kandung** - Terhalang total.\n` +
      `3. **Saudara Laki-laki Seayah & Saudara Perempuan Seayah** - Terhalang total.\n` +
      `4. **Saudara Laki-laki Seibu & Saudara Perempuan Seibu** - Terhalang total.\n` +
      `5. **Keponakan** (anak laki-laki saudara kandung / seayah) - Terhalang total.\n` +
      `6. **Paman Kandung & Paman Seayah** - Terhalang total.\n` +
      `7. **Anak Laki-laki Paman (Sepupu)** - Terhalang total.\n\n` +
      `⚠️ **Siapa yang TIDAK terhalang oleh anak laki-laki?**\n` +
      `- **Ayah:** Tetap mendapat 1/6 murni (QS. An-Nisa: 11).\n` +
      `- **Ibu:** Tetap mendapat 1/6 murni (QS. An-Nisa: 11).\n` +
      `- **Suami / Istri:** Tetap mendapat hak furudh (Suami 1/4, Istri 1/8).\n` +
      `- **Anak Perempuan:** Tidak terhalang, melainkan ditarik menjadi penerima sisa bersama (**'Ashabah bil Ghair**) dengan rasio 2:1.`;
  }

  // Prompts: "Siapa yang tidak pernah terhalang sama sekali?"
  if (q.includes('tidak pernah terhalang') || q.includes('pasti dapat') || q.includes('pasti mewarisi')) {
    return sapaan + `**6 Ahli Waris yang TIDAK PERNAH Terhalang Total (Laa Yuhjabun Hirmanan Abadan):**\n\n` +
      `Dalam syariat Islam, ada 6 golongan ahli waris utama yang **selalu pasti mendapatkan hak waris** selama tidak melakukan penghalang waris (*mawani'ul irtsi*):\n\n` +
      `1. **Anak Laki-laki Kandung**\n` +
      `2. **Anak Perempuan Kandung**\n` +
      `3. **Ayah Kandung**\n` +
      `4. **Ibu Kandung**\n` +
      `5. **Suami** (jika yang wafat istri)\n` +
      `6. **Istri** (jika yang wafat suami)\n\n` +
      `*Catatan:* Mereka berenam hanya bisa mengalami **Hijab Nuqshan** (pengurangan porsi hak), namun tidak akan pernah gugur haknya secara total (*Hijab Hirman*) oleh ahli waris mana pun.`;
  }

  // Prompts: "Perbedaan Ashabah bi Nafsihi, bil Ghair, ma'al Ghair"
  if (q.includes('ashabah') || q.includes('sisa')) {
    return sapaan + `**Konsep Lengkap 'Ashabah (Penerima Hak Sisa Harta):**\n\n` +
      `Dalam ilmu Faraidh, ahli waris penerima hak sisa ('Ashabah) terbagi menjadi 3 macam:\n\n` +
      `1. **'Ashabah bi Nafsihi (عصبة بنفسه):**\n` +
      `   - Ahli waris laki-laki yang berhak menerima sisa secara mandiri tanpa membutuhkan bantuan orang lain.\n` +
      `   - *Contoh:* Anak laki-laki, cucu laki-laki, ayah, kakek, saudara laki-laki kandung/seayah, paman kandung/seayah, anak paman.\n\n` +
      `2. **'Ashabah bil Ghair (عصبة بالغير):**\n` +
      `   - Ahli waris perempuan (ashabul furudh) yang menjadi penerima sisa karena ditarik oleh saudara laki-lakinya yang sederajat, dengan pembagian porsi **2:1** (*Lidz-dzakari mitslu hazhzhil untsayain*).\n` +
      `   - *Contoh:* Anak perempuan ditarik oleh anak laki-laki; Cucu perempuan ditarik oleh cucu laki-laki; Saudari kandung ditarik oleh saudara kandung.\n\n` +
      `3. **'Ashabah ma'al Ghair (عصبة مع الغير):**\n` +
      `   - Ahli waris perempuan yang menjadi penerima hak sisa bersama ahli waris perempuan lainnya.\n` +
      `   - *Contoh:* Saudara perempuan kandung/seayah menjadi 'ashabah apabila bersama dengan anak perempuan atau cucu perempuan.\n` +
      `   - *Dalil Hadits Bukhari:* *"Jadikanlah saudara perempuan bersama anak perempuan sebagai 'ashabah."*`;
  }

  // Prompts: "Bagian istri"
  if (q.includes('istri')) {
    return sapaan + `**Kaidah Bagian Waris Istri (QS. An-Nisa: 12):**\n\n` +
      `1. **Mendapat 1/4 (Seperempat):** Jika pewaris (suami yang meninggal) **TIDAK MEMILIKI** keturunan (anak maupun cucu).\n` +
      `2. **Mendapat 1/8 (Seperdelapan):** Jika pewaris (suami yang meninggal) **MEMILIKI** keturunan (anak atau cucu).\n\n` +
      `📌 *Catatan Fiqih:* Apabila pewaris meninggalkan lebih dari 1 istri (2, 3, atau 4 istri), porsi 1/4 atau 1/8 tersebut **dibagi rata sama besar** di antara seluruh istri.`;
  }

  // Prompts: "Bagian suami"
  if (q.includes('suami')) {
    return sapaan + `**Kaidah Bagian Waris Suami (QS. An-Nisa: 12):**\n\n` +
      `1. **Mendapat 1/2 (Setengah):** Jika istri yang meninggal **TIDAK** meninggalkan keturunan (anak maupun cucu).\n` +
      `2. **Mendapat 1/4 (Seperempat):** Jika istri yang meninggal **MEMILIKI** keturunan (anak atau cucu).`;
  }

  // Prompts: "Bagian anak perempuan"
  if (q.includes('anak perempuan') || q.includes('anak wanita')) {
    return sapaan + `**Kaidah Bagian Waris Anak Perempuan (QS. An-Nisa: 11):**\n\n` +
      `1. **Mendapat 1/2 (Setengah):** Jika ia **seorang diri (tunggal)** dan tidak ada anak laki-laki.\n` +
      `2. **Mendapat 2/3 (Dua Pertiga):** Jika berjumlah **2 orang atau lebih**, dan tidak ada anak laki-laki (dibagi rata sama banyak).\n` +
      `3. **Menjadi 'Ashabah bil Ghair:** Jika ada saudara laki-lakinya (anak laki-laki), maka ia tidak mendapat pecahan furudh, melainkan menerima sisa harta dengan perbandingan **2 : 1** (bagian 1 anak laki-laki = 2x bagian anak perempuan).`;
  }

  // Prompts: "Bagian anak laki-laki"
  if (q.includes('anak laki') || q.includes('anak laki-laki')) {
    return sapaan + `**Kaidah Bagian Waris Anak Laki-laki:**\n\n` +
      `1. **Status Hukum:** Anak laki-laki adalah penerima hak sisa utama (**'Ashabah bi Nafsihi**) dan tidak memiliki furudh pecahan tertentu dalam Al-Qur'an.\n` +
      `2. **Jika Sendiri / Bersama Anak Laki-laki Lain:** Menghabiskan seluruh sisa harta setelah Ashabul Furudh mengambil haknya. Jika hanya ada anak laki-laki saja tanpa ahli waris lain, ia mengambil 100% harta.\n` +
      `3. **Jika Bersama Anak Perempuan:** Menjadikan anak perempuan sebagai 'Ashabah bil Ghair dengan perbandingan $2:1$ (QS. An-Nisa: 11).\n` +
      `4. **Kekuatan Hijab:** Menghalangi total cucu, saudara (kandung/seayah/seibu), keponakan, paman, dan sepupu.`;
  }

  // Prompts: "Bagian ibu"
  if (q.includes('ibu')) {
    return sapaan + `**Kaidah Bagian Waris Ibu (QS. An-Nisa: 11):**\n\n` +
      `1. **Mendapat 1/6 (Seperenam):** Jika pewaris memiliki keturunan (anak/cucu) ATAU ada 2 orang saudara atau lebih (baik saudara kandung, seayah, maupun seibu).\n` +
      `2. **Mendapat 1/3 (Sepertiga):** Jika tidak ada anak/cucu dan jumlah saudara kurang dari 2 orang.\n` +
      `3. **Mendapat 1/3 dari Sisa (Tsulutsul Baqi):** Khusus pada kasus *Gharawain / Umariyyatan* (pewaris hanya meninggalkan Suami/Istri, Ibu, dan Ayah).`;
  }

  // Prompts: "Bagian ayah / bapak"
  if (q.includes('ayah') || q.includes('bapak')) {
    return sapaan + `**Kaidah Bagian Waris Ayah Kandung (QS. An-Nisa: 11):**\n\n` +
      `1. **Mendapat 1/6 murni:** Jika pewaris memiliki keturunan laki-laki (anak laki-laki atau cucu laki-laki).\n` +
      `2. **Mendapat 1/6 + 'Ashabah (Sisa):** Jika pewaris hanya memiliki anak perempuan atau cucu perempuan (tanpa ada anak laki-laki).\n` +
      `3. **Mendapat 'Ashabah penuh (Seluruh Sisa):** Jika pewaris sama sekali tidak meninggalkan keturunan (anak maupun cucu).`;
  }

  // Prompts: "Kakek dan Nenek"
  if (q.includes('kakek') || q.includes('nenek')) {
    return sapaan + `**Kaidah Waris Kakek & Nenek Shahihah:**\n\n` +
      `1. **Kakek Shahih (Ayah dari Ayah):**\n` +
      `   - Terhalang total (*Mahjub Hirman*) jika **Ayah kandung masih hidup**.\n` +
      `   - Jika Ayah telah wafat, Kakek menggantikan kedudukan Ayah (mendapat 1/6 jika ada anak laki-laki, atau 'ashabah jika tanpa anak).\n\n` +
      `2. **Nenek Shahihah (Ibu dari Ibu atau Ibu dari Ayah):**\n` +
      `   - Terhalang total jika **Ibu kandung masih hidup**.\n` +
      `   - Jika Ibu tidak ada, Nenek berhak mendapatkan bagian pasti **1/6 (Seperenam)**. Jika ada lebih dari satu nenek yang sah, porsi 1/6 dibagi rata.`;
  }

  // Prompts: "Cucu laki-laki dan cucu perempuan"
  if (q.includes('cucu')) {
    return sapaan + `**Kaidah Waris Cucu (dari jalur Anak Laki-laki):**\n\n` +
      `1. **Cucu Laki-laki:**\n` +
      `   - Terhalang total (*Mahjub Hirman*) oleh **Anak Laki-laki**.\n` +
      `   - Jika tidak ada anak laki-laki, ia menggantikan posisi anak laki-laki sebagai penerima **'Ashabah bi Nafsihi**.\n\n` +
      `2. **Cucu Perempuan:**\n` +
      `   - Mendapat **1/2** jika tunggal tanpa anak dan tanpa cucu laki-laki.\n` +
      `   - Mendapat **2/3** jika 2 orang atau lebih tanpa anak dan cucu laki-laki.\n` +
      `   - Mendapat **1/6 sebagai Takmilah Ats-Tsulutsain** (penyempurna 2/3) apabila bersama 1 orang anak perempuan kandung.\n` +
      `   - Terhalang total jika ada anak laki-laki atau jika sudah ada 2 orang anak perempuan (kecuali ada cucu laki-laki yang menjadikannya 'ashabah).`;
  }

  // Prompts: "Saudara kandung, saudara seayah, saudara seibu, kalalah"
  if (q.includes('saudara') || q.includes('saudari') || q.includes('kalalah')) {
    return sapaan + `**Kaidah Waris Saudara Pewaris (Kondisi Kalalah - QS. An-Nisa: 12 & 176):**\n\n` +
      `Saudara hanya bisa mewarisi jika pewaris dalam kondisi **Kalalah** (tidak meninggalkan keturunan laki-laki dan tidak ada Ayah).\n\n` +
      `1. **Saudara Seibu ( الأخ لأم / الأخت لأم ):**\n` +
      `   - Jika 1 orang: Mendapat **1/6** (QS. An-Nisa: 12).\n` +
      `   - Jika 2 orang atau lebih: Berserikat dalam **1/3 dibagi rata sama rata antara laki-laki dan perempuan**.\n` +
      `   - Terhalang oleh keturunan (anak/cucu) dan ushul laki-laki (ayah/kakek).\n\n` +
      `2. **Saudara Kandung / Seayah:**\n` +
      `   - Laki-laki menjadi **'Ashabah bi Nafsihi**.\n` +
      `   - Perempuan tunggal mendapat **1/2**, 2 orang atau lebih mendapat **2/3** (QS. An-Nisa: 176).\n` +
      `   - Jika ada saudara laki-laki dan perempuan bersama-sama, menjadi **'Ashabah bil Ghair (2:1)**.`;
  }

  // Prompts: "Paman dan Sepupu"
  if (q.includes('paman') || q.includes('sepupu')) {
    return sapaan + `**Kaidah Bagian Waris Paman dan Sepupu (Kerabat Laki-laki Jalur Ayah):**\n\n` +
      `1. **Status Hukum:** Paman kandung/seayah dan sepupu laki-laki berstatus sebagai penerima sisa (**'Ashabah bi Nafsihi**).\n` +
      `2. **Kondisi Terhalang (Mahjub):** Paman dan sepupu terhalang total oleh:\n` +
      `   - Keturunan laki-laki (anak laki-laki & cucu laki-laki).\n` +
      `   - Leluhur laki-laki (ayah & kakek shahih).\n` +
      `   - Saudara laki-laki kandung & seayah beserta anak laki-lakinya (keponakan).\n` +
      `3. **Penyaluran Hak:** Hanya berhak mendapatkan warisan jika seluruh ahli waris laki-laki yang lebih dekat tidak ada.`;
  }

  // Prompts: "Hijab Hirman vs Hijab Nuqsan"
  if (q.includes('hijab') || q.includes('penghalang')) {
    return sapaan + `**Konsep Hijab dalam Ilmu Waris Islam:**\n\n` +
      `Hijab artinya tabir penghalang hak waris seseorang karena adanya kerabat yang lebih dekat. Terbagi menjadi 2 jenis:\n\n` +
      `1. **Hijab Hirman (حجب الحرمان):**\n` +
      `   - Pengguguran hak waris secara **total** sehingga yang terhalang sama sekali tidak mendapatkan warisan.\n` +
      `   - *Contoh:* Kakek terhalang oleh Ayah; Cucu terhalang oleh Anak laki-laki; Saudara terhalang oleh Ayah atau Anak laki-laki.\n\n` +
      `2. **Hijab Nuqshan (حجب النقصان):**\n` +
      `   - Pengurangan porsi bagian waris dari jumlah yang lebih besar ke jumlah yang lebih kecil.\n` +
      `   - *Contoh:* Istri dari 1/4 berkurang menjadi 1/8 karena ada anak; Suami dari 1/2 berkurang menjadi 1/4 karena ada anak; Ibu dari 1/3 berkurang menjadi 1/6 karena ada anak/2 saudara.`;
  }

  // Prompts: "Masalah 'Awal"
  if (q.includes('awal') || q.includes('awl') || q.includes('‘awal')) {
    return sapaan + `**Konsep Masalah 'Awal (العول) dalam Faraidh:**\n\n` +
      `📌 **Definisi:** 'Awal terjadi ketika **jumlah saham bagian Ashabul Furudh melebihi angka Asal Masalah** awal, sehingga terjadi kekurangan harta jika dibagikan sesuai pecahan normal.\n\n` +
      `📌 **Asal Masalah yang Bisa Mengalami 'Awal:**\n` +
      `- **Asal Masalah 6:** Dapat naik menjadi **7, 8, 9, atau 10**.\n` +
      `- **Asal Masalah 12:** Dapat naik menjadi **13, 15, atau 17**.\n` +
      `- **Asal Masalah 24:** Dapat naik menjadi **27** (Kasus Al-Minbariyyah).\n\n` +
      `📌 **Solusi Syar'i:** Angka Asal Masalah dinaikkan senilai jumlah total saham, sehingga setiap ahli waris tetap menerima haknya dengan pengurangan persentase secara proporsional dan adil tanpa menzalimi satu pihak pun.`;
  }

  // Prompts: "Masalah Radd"
  if (q.includes('radd')) {
    return sapaan + `**Konsep Masalah Radd (الرد) dalam Faraidh:**\n\n` +
      `📌 **Definisi:** Radd adalah kebalikan dari 'Awal. Terjadi ketika **total saham Ashabul Furudh kurang dari Asal Masalah dan tidak ada ahli waris penerima 'Ashabah**.\n\n` +
      `📌 **Kaidah Penyaluran:**\n` +
      `1. Suami atau Istri mengambil hak furudhnya lebih dulu tanpa tambahan radd (menurut jumhur ulama).\n` +
      `2. Sisa harta setelah diambil suami/istri dikembalikan secara proporsional (**di-Radd**) kepada Ashabul Furudh nasab (seperti Ibu, Anak Perempuan, Saudara Seibu, dll).\n` +
      `3. Hal ini berlandaskan pada firman Allah SWT: *"Dan orang-orang yang mempunyai hubungan kerabat itu sebagiannya lebih berhak terhadap sesamanya (daripada yang bukan kerabat) di dalam Kitab Allah..."* (QS. Al-Anfal: 75).`;
  }

  // Prompts: "Gharawain / Umariyyatan"
  if (q.includes('gharawain') || q.includes('umariyyatan') || q.includes('tsulutsul baqi')) {
    return sapaan + `**Kasus Khusus Gharawain / Umariyyatan (العمريتان):**\n\n` +
      `📌 **Kondisi Kasus:** Terjadi jika ahli waris hanya terdiri dari:\n` +
      `1. **Suami + Ibu + Ayah**, ATAU\n` +
      `2. **Istri + Ibu + Ayah** (tanpa keturunan dan tanpa saudara).\n\n` +
      `📌 **Ijtihad Umar bin Khattab ra.:**\n` +
      `- Jika Ibu diberi 1/3 murni dari seluruh harta, maka porsi Ibu akan lebih besar atau sama dengan Ayah, padahal derajat mereka sederajat (seharusnya laki-laki 2x perempuan).\n` +
      `- Oleh karena itu, Suami/Istri mengambil haknya lebih dahulu. Kemudian Ibu mendapatkan **1/3 dari sisa harta (Tsulutsul Baqi)**, dan Ayah mengambil seluruh sisa setelahnya (2/3 dari sisa).\n` +
      `- Dengan demikian, bagian Ayah tetap 2 kali lipat dari bagian Ibu secara proporsional.`;
  }

  // Prompts: "Asal Masalah / KPK"
  if (q.includes('asal masalah') || q.includes('ashlul mas') || q.includes('kpk')) {
    return sapaan + `**Konsep Asal Masalah (Ashlul Mas'alah):**\n\n` +
      `Asal Masalah adalah angka kelipatan persekutuan terkecil (KPK) dari penyebut-penyebut pecahan furudhul muqaddarah yang ada dalam suatu kasus waris.\n\n` +
      `📌 **7 Angka Asal Masalah yang Baku dalam Faraidh:**\n` +
      `**2, 3, 4, 6, 8, 12, dan 24**.\n\n` +
      `📌 **Fungsi:** Memudahkan pembagian harta peninggalan dalam bentuk bilangan bulat (saham) sebelum dikalikan dengan nominal uang rupiah.`;
  }

  // Prompts: "Rukun dan Syarat Waris"
  if (q.includes('rukun') || q.includes('syarat')) {
    return sapaan + `**Rukun dan Syarat Kewarisan dalam Islam:**\n\n` +
      `📌 **3 Rukun Waris (Arkanul Irtsi):**\n` +
      `1. **Al-Muwarrits:** Orang yang meninggal dunia dan meninggalkan harta kekayaan.\n` +
      `2. **Al-Warits:** Ahli waris yang masih hidup ketika muwarrits wafat dan berhak mewarisi.\n` +
      `3. **Al-Mauruts / Tirkah:** Harta benda halal yang ditinggalkan oleh muwarrits.\n\n` +
      `📌 **Syarat Sah Waris:**\n` +
      `1. Meninggalnya muwarrits secara hakiki atau putusan pengadilan.\n` +
      `2. Hidupnya ahli waris pada saat muwarrits meninggal dunia.\n` +
      `3. Diketahui hubungan kekerabatan/sebab mewarisi (nasab, nikah, atau wala').\n` +
      `4. Tidak adanya faktor penghalang waris (*mawani'ul irtsi*).`;
  }

  // Prompts: "Hak Harta Waris Sebelum Dibagi / Tajhiz / Hutang / Wasiat"
  if (q.includes('sebelum') || q.includes('kewajiban') || q.includes('tirkah') || q.includes('tajhiz') || q.includes('wasiat') || q.includes('hutang')) {
    return sapaan + `**4 Kewajiban Terhadap Harta Peninggalan Sebelum Dibagi Waris:**\n\n` +
      `Sebelum harta warisan dibagikan kepada para ahli waris, wajib diselesaikan 4 hak secara tertib dan berurutan:\n\n` +
      `1. **Tajhiz Al-Janazah (Biaya Pengurusan Jenazah):** Pembelian kain kafan, pemakaman, dll secara wajar tanpa berlebih-lebihan.\n` +
      `2. **Pelunasan Hutang (Qadha' Ad-Duyun):** Wajib dilunasi terlebih dahulu, baik hutang kepada Allah (zakat, kafarat, nadzar) maupun hutang kepada sesama manusia.\n` +
      `3. **Pelaksanaan Wasiat (Tanfidz Al-Washaya):** Wasiat dilaksanakan setelah hutang lunas, dengan syarat maksimal **1/3 dari sisa harta** dan **tidak boleh ditujukan kepada ahli waris** (*Laa washiyyata li waaritsin*).\n` +
      `4. **Pembagian Hak Waris (Taqsimul Mauruts):** Harta bersih yang tersisa baru dibagikan kepada para ahli waris sesuai kaidah ilmu faraidh.`;
  }

  // Prompts: "Penghalang waris / Mawani'ul irtsi"
  if (q.includes('penghalang waris') || q.includes('mawani') || q.includes('batal mewarisi') || q.includes('beda agama') || q.includes('membunuh')) {
    return sapaan + `**3 Penghalang Mendapat Warisan (Mawani'ul Irtsi):**\n\n` +
      `Seseorang yang semula berstatus sebagai ahli waris sah dapat gugur hak warisnya secara mutlak apabila terjadi salah satu dari 3 hal berikut:\n\n` +
      `1. **Pembunuhan (Al-Qatl):** Ahli waris yang membunuh pewaris secara sengaja tidak berhak mendapatkan warisan sedikit pun (HR. Abu Dawud & At-Tirmidzi: *"Pembunuh tidak berhak mewarisi"*).\n` +
      `2. **Perbedaan Agama (Ikhtilaf Ad-Din):** Muslim tidak mewarisi dari kerabat non-muslim, dan non-muslim tidak mewarisi dari kerabat muslim (HR. Bukhari-Muslim).\n` +
      `3. **Perbudakan (Ar-Riqqu):** Seseorang yang berstatus hamba sahaya tidak mewarisi dan tidak diwarisi karena status dirinya dan hartanya adalah milik tuannya.`;
  }

  // Prompts: "Anak angkat / adopsi"
  if (q.includes('anak angkat') || q.includes('adopsi')) {
    return sapaan + `**Kedudukan Hukum Anak Angkat dalam Waris Islam:**\n\n` +
      `1. **Bukan Ahli Waris Nasab:** Anak angkat **TIDAK TERMASUK** ahli waris nasab dan tidak berhak mendapatkan bagian furudhul muqaddarah maupun 'ashabah (QS. Al-Ahzab: 4-5).\n` +
      `2. **Solusi Syar'i (Wasiat Wajibah):** Dalam hukum Islam di Indonesia (Kompilasi Hukum Islam / KHI Pasal 209), anak angkat dapat diberikan bagian melalui jalan **Wasiat Wajibah**, dengan ketentuan maksimal **sebanyak-banyaknya 1/3 (sepertiga)** dari harta peninggalan orang tua angkatnya.`;
  }

  // Prompts: "Pengertian Faraidh / Ilmu Waris"
  if (q.includes('apa itu') || q.includes('pengertian') || q.includes('definisi') || q.includes('faraidh')) {
    return sapaan + `**Pengertian Ilmu Faraidh (Ilmu Waris Islam):**\n\n` +
      `Ilmu Faraidh adalah disiplin ilmu fiqih yang mempelajari kaidah-kaidah syariat Islam untuk mengetahui:\n` +
      `- Siapa saja ahli waris yang berhak menerima harta peninggalan (*tirkah*).\n` +
      `- Siapa yang terhalang (*mahjub*).\n` +
      `- Kadar pecahan pasti (*furudh*) atau bagian sisa (*'ashabah*) yang diterima masing-masing pihak secara adil.\n\n` +
      `📖 **Dalil Keutamaan:**\n` +
      `Rasulullah SAW bersabda:\n` +
      `*"Pelajarilah ilmu faraidh dan ajarkanlah kepada manusia, sesungguhnya ia adalah setengah dari ilmu dan ia akan mudah dilupakan serta ilmu yang pertama kali dicabut dari umatku."* (HR. Ibnu Majah & Ad-Daruquthni).\n\n` +
      `Ada konsep tertentu yang ingin kamu pelajari lebih dalam? Silakan tanyakan kepada Ustadz AI!`;
  }

  // Default Guidance & Socratic Learning Roadmap
  return sapaan + `**Langkah Emas Menyelesaikan Permasalahan Waris Islam (Faraidh):**\n\n` +
    `1. **Langkah 1 (Identifikasi Ahli Waris & Hijab):**\n` +
    `   - Catat seluruh keluarga yang ditinggalkan.\n` +
    `   - Cek siapa yang terhalang total (*Mahjub Hirman*), misalnya kakek terhalang oleh ayah, atau cucu dan saudara terhalang oleh anak laki-laki.\n\n` +
    `2. **Langkah 2 (Tentukan Ashabul Furudh & Porsinya):**\n` +
    `   - Tetapkan porsi pasti (1/2, 1/4, 1/8, 2/3, 1/3, 1/6) sesuai QS. An-Nisa ayat 11, 12, dan 176.\n\n` +
    `3. **Langkah 3 (Cari Asal Masalah):**\n` +
    `   - Hitung KPK dari angka penyebut pecahan furudh (2, 3, 4, 6, 8, 12, atau 24).\n` +
    `   - Periksa apakah kasus tergolong Adil, 'Awal (saham > asal masalah), atau Radd (saham < asal masalah tanpa 'ashabah).\n\n` +
    `4. **Langkah 4 (Hitung Nominal Hak Bersih):**\n` +
    `   - Rumus: $\\frac{\\text{Saham}}{\\text{Asal Masalah}} \\times \\text{Harta Bersih (Tirkah)}$.\n\n` +
    `💡 Kamu bisa bertanya porsi ahli waris tertentu (misal: *Istri*, *Anak Perempuan*, *Ibu*, *Ayah*), konsep *Hijab Hirman*, petunjuk *Soal Latihan 1-5*, atau minta bantuan hitung studi kasus!`;
}

// AI PAI Assistant Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;
    const lastUserMessage = (messages || []).filter((m: any) => m.role === 'user').slice(-1)[0];
    const userPromptText = lastUserMessage?.text || '';

    // If API key is available, attempt Gemini 3.8 Flash call with properly formatted turns
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

        const systemInstruction = `Kamu adalah "Ustadz AI Faraidh", asisten cerdas pembelajaran Pendidikan Agama Islam (PAI) materi Pembagian Harta Waris (Ilmu Faraidh) untuk siswa SMA/SMK di aplikasi "PAI-Waris Digital" SMKN 1 Sidayu Gresik.
Karakter: Ramah, santun, Islami, edukatif, dan memotivasi siswa. Berlandaskan dalil Al-Qur'an (QS. An-Nisa ayat 11, 12, dan 176) serta Hadits Shahih.
PENTING:
- Jika siswa menanyakan konsep hukum, dalil, bagian ahli waris, atau kaidah hijab, jelaskan secara jelas, runtut, berpoin, dan mudah dipahami.
- Jika siswa bertanya tentang soal latihan atau ujian, berikan petunjuk langkah bertahap (Socratic guidance): sebutkan siapa yang mahjub (terhalang), bagian pasti masing-masing, dan cara mencari asal masalah.
- Gunakan bahasa Indonesia yang santun dan ejaan yang rapi.
${context ? `Konteks pengguna: Nama: ${context.namaSiswa || 'Siswa'}, Kelas: ${context.kelas || '-'}, Role: ${context.role || 'siswa'}, XP: ${context.xp || 0}` : ''}`;

        // Sanitize messages into alternating turns starting with a user turn
        const rawTurns: Array<{ role: 'user' | 'model'; text: string }> = [];
        for (const m of messages || []) {
          const isModel = m.role === 'assistant' || m.role === 'model';
          const role: 'user' | 'model' = isModel ? 'model' : 'user';
          const text = (typeof m.text === 'string' ? m.text : '').trim();
          if (text) {
            rawTurns.push({ role, text });
          }
        }

        // Remove any leading model turns so turn 0 is strictly 'user'
        while (rawTurns.length > 0 && rawTurns[0].role === 'model') {
          rawTurns.shift();
        }

        // Ensure non-empty
        if (rawTurns.length === 0 && userPromptText) {
          rawTurns.push({ role: 'user', text: userPromptText });
        }

        // Collapse consecutive same-role turns into strictly alternating sequence
        const cleanContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
        for (const turn of rawTurns) {
          const prev = cleanContents[cleanContents.length - 1];
          if (prev && prev.role === turn.role) {
            prev.parts[0].text += `\n\n${turn.text}`;
          } else {
            cleanContents.push({
              role: turn.role,
              parts: [{ text: turn.text }],
            });
          }
        }

        // Ensure the last turn is from user
        if (cleanContents.length > 0 && cleanContents[cleanContents.length - 1].role === 'model') {
          cleanContents.pop();
        }

        if (cleanContents.length > 0) {
          // Timeout promise after 20 seconds to allow model adequate inference time
          const apiCall = ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: cleanContents,
            config: { systemInstruction },
          });

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('AI response timeout')), 20000)
          );

          const response: any = await Promise.race([apiCall, timeoutPromise]);
          if (response && response.text) {
            return res.json({ reply: response.text });
          }
        }
      } catch (geminiError: any) {
        console.warn('Gemini API dynamic fallback triggered:', geminiError?.message || geminiError);
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
  const distPath = path.resolve(__dirname, 'dist');
  const distIndexPath = path.resolve(distPath, 'index.html');
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.K_SERVICE) ||
    (!process.argv.includes('--port') && fs.existsSync(distIndexPath));

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(distIndexPath);
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`PAI-Waris Digital server running on port ${port} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
