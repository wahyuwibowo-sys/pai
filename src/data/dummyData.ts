import { User, Material, Question, ExamResult } from '../types';

export const INITIAL_ADMIN: User = {
  id: 'admin-01',
  nama: 'Administrator SMKN 1 Sidayu',
  username: 'admin',
  password: 'admin123',
  kelas: 'Administrator Sekolah & IT',
  nomorAbsen: 1,
  role: 'admin',
  createdAt: '2026-01-01T08:00:00Z',
};

export const INITIAL_TEACHER: User = {
  id: 'guru-ahmad-01',
  nama: 'H. Ahmad Heru Santoso, M.Pd.I',
  username: 'guru_ahmad',
  password: 'guru123',
  kelas: 'Guru PAI',
  nomorAbsen: 1,
  role: 'guru',
  createdAt: '2026-01-10T08:00:00Z',
};

export const INITIAL_STUDENTS: User[] = [
  { id: 'siswa-01', nama: 'Ahmad Fauzi Rahman', username: 'ahmad_fauzi', password: '123', kelas: 'XII RPL 1', nomorAbsen: 1, role: 'siswa', xp: 480, level: 3, badges: ['Pakar Furudh', 'Rajin Latihan'] },
  { id: 'siswa-02', nama: 'Aisyah Putri Azzahra', username: 'aisyah_putri', password: '123', kelas: 'XII RPL 1', nomorAbsen: 2, role: 'siswa', xp: 520, level: 4, badges: ['Pakar Furudh', 'Master Faraidh', 'Nilai Sempurna'] },
  { id: 'siswa-03', nama: 'Ali Zainal Abidin', username: 'ali_zainal', password: '123', kelas: 'XII RPL 1', nomorAbsen: 3, role: 'siswa', xp: 320, level: 2, badges: ['Pemula Waris'] },
  { id: 'siswa-04', nama: 'Annisa Fitriani', username: 'annisa_f', password: '123', kelas: 'XII RPL 1', nomorAbsen: 4, role: 'siswa', xp: 460, level: 3, badges: ['Pakar Furudh', 'Penakluk Ashabah'] },
  { id: 'siswa-05', nama: 'Bagas Pratama', username: 'bagas_p', password: '123', kelas: 'XII RPL 1', nomorAbsen: 5, role: 'siswa', xp: 240, level: 2, badges: ['Pemula Waris'] },
  { id: 'siswa-06', nama: 'Bilqis Humaira', username: 'bilqis_h', password: '123', kelas: 'XII RPL 1', nomorAbsen: 6, role: 'siswa', xp: 560, level: 4, badges: ['Master Faraidh', 'Pakar Furudh'] },
  { id: 'siswa-07', nama: 'Danial Syahputra', username: 'danial_s', password: '123', kelas: 'XII TKJ 2', nomorAbsen: 1, role: 'siswa', xp: 390, level: 3, badges: ['Penakluk Ashabah'] },
  { id: 'siswa-08', nama: 'Fatimah Az-Zahra', username: 'fatimah_az', password: '123', kelas: 'XII TKJ 2', nomorAbsen: 2, role: 'siswa', xp: 500, level: 4, badges: ['Master Faraidh', 'Nilai Sempurna'] },
  { id: 'siswa-09', nama: 'Fajar Hidayatullah', username: 'fajar_h', password: '123', kelas: 'XII TKJ 2', nomorAbsen: 3, role: 'siswa', xp: 180, level: 1, badges: ['Pemula Waris'] },
  { id: 'siswa-10', nama: 'Ghaida Nurul Izzah', username: 'ghaida_n', password: '123', kelas: 'XII TKJ 2', nomorAbsen: 4, role: 'siswa', xp: 420, level: 3, badges: ['Pakar Furudh'] },
  { id: 'siswa-11', nama: 'Hafizh Nur Ramadan', username: 'hafizh_nr', password: '123', kelas: 'XII TKJ 2', nomorAbsen: 5, role: 'siswa', xp: 350, level: 2, badges: ['Penakluk Ashabah'] },
  { id: 'siswa-12', nama: 'Ibrahim Maulana', username: 'ibrahim_m', password: '123', kelas: 'XII TKJ 2', nomorAbsen: 6, role: 'siswa', xp: 470, level: 3, badges: ['Pakar Furudh', 'Rajin Latihan'] },
  { id: 'siswa-13', nama: 'Khadijah Marwah', username: 'khadijah_m', password: '123', kelas: 'XII OTKP 1', nomorAbsen: 1, role: 'siswa', xp: 580, level: 4, badges: ['Master Faraidh', 'Pakar Furudh', 'Nilai Sempurna'] },
  { id: 'siswa-14', nama: 'Luqman Hakim', username: 'luqman_h', password: '123', kelas: 'XII OTKP 1', nomorAbsen: 2, role: 'siswa', xp: 440, level: 3, badges: ['Penakluk Ashabah'] },
  { id: 'siswa-15', nama: 'Maryam Salimah', username: 'maryam_s', password: '123', kelas: 'XII OTKP 1', nomorAbsen: 3, role: 'siswa', xp: 390, level: 3, badges: ['Pakar Furudh'] },
  { id: 'siswa-16', nama: 'Muhammad Rizky', username: 'm_rizky', password: '123', kelas: 'XII OTKP 1', nomorAbsen: 4, role: 'siswa', xp: 210, level: 2, badges: ['Pemula Waris'] },
  { id: 'siswa-17', nama: 'Nadia Salsabila', username: 'nadia_sal', password: '123', kelas: 'XII OTKP 1', nomorAbsen: 5, role: 'siswa', xp: 510, level: 4, badges: ['Master Faraidh', 'Rajin Latihan'] },
  { id: 'siswa-18', nama: 'Rafi Al-Fatih', username: 'rafi_af', password: '123', kelas: 'XII OTKP 1', nomorAbsen: 6, role: 'siswa', xp: 380, level: 3, badges: ['Penakluk Ashabah'] },
  { id: 'siswa-19', nama: 'Siti Aminah', username: 'siti_aminah', password: '123', kelas: 'XII BDP 2', nomorAbsen: 1, role: 'siswa', xp: 460, level: 3, badges: ['Pakar Furudh'] },
  { id: 'siswa-20', nama: 'Yusuf Habibi', username: 'yusuf_h', password: '123', kelas: 'XII BDP 2', nomorAbsen: 2, role: 'siswa', xp: 300, level: 2, badges: ['Pemula Waris'] },
  { id: 'siswa-21', nama: 'Zahra Maulida', username: 'zahra_m', password: '123', kelas: 'XII BDP 2', nomorAbsen: 3, role: 'siswa', xp: 540, level: 4, badges: ['Master Faraidh', 'Nilai Sempurna'] },
];

export const INITIAL_MATERIALS: Material[] = [
  {
    id: 'mat-01',
    judul: 'Pengertian Waris dalam Islam (Ilmu Faraidh)',
    kategori: 'Pengertian',
    ringkasan: 'Definisi, kedudukan hukum, tujuan keadilan, dan urgensi mempelajari Ilmu Faraidh.',
    dalil: 'تَعَلَّمُوا الفَرَائِضَ وَعَلِّمُوهَا النَّاسَ فَإِنَّهَا نِصْفُ العِلْمِ\n"Pelajarilah ilmu faraidh dan ajarkanlah kepada manusia, sesungguhnya ia adalah setengah dari ilmu..." (HR. Ibnu Majah & Ad-Daruquthni)',
    isi: `### 1. Definisi Waris (Faraidh)
Kata **Mawaris** adalah bentuk jamak dari *mirats*, yang secara etimologi berarti perpindahan sesuatu dari seseorang kepada orang lain. Secara terminologi Fiqih Islam:
> **Ilmu Waris (Faraidh)** adalah ilmu yang mempelajari kaidah-kaidah penentuan siapa yang berhak mewarisi, siapa yang terhalang, dan berapa kadar bagian yang diterima masing-masing ahli waris dari harta peninggalan (*tirkah*).

### 2. Dasar Hukum Kewarisan
Kewarisan dalam Islam bersumber langsung dari ketetapan Allah SWT dalam Al-Qur'an Surat An-Nisa:
- **QS. An-Nisa ayat 7:** Hak bagi laki-laki dan perempuan atas harta peninggalan orang tua dan kerabat.
- **QS. An-Nisa ayat 11:** Bagian anak laki-laki, anak perempuan, serta kedua orang tua.
- **QS. An-Nisa ayat 12:** Bagian suami, istri, dan saudara seibu.
- **QS. An-Nisa ayat 176:** Ketentuan bagi saudara kandung / seayah pada kasus Kalalah.

### 3. Tujuan dan Hikmah Kewarisan Islam
1. **Keadilan Sosial & Finansial:** Menjamin pembagian harta yang proporsional sesuai beban nafkah syar'i.
2. **Mencegah Konflik Keluarga:** Memberikan kepastian hukum Ilahi agar tidak terjadi perselisihan antar ahli waris.
3. **Perlindungan Terhadap Kaum Lemah:** Menjamin hak anak yatim, janda, dan perempuan secara bermartabat tanpa diskriminasi.`,
    urutan: 1,
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'mat-02',
    judul: 'Rukun dan Syarat Waris dalam Islam',
    kategori: 'Rukun & Syarat',
    ringkasan: 'Tiga rukun pokok: Muwarrits, Warits, Mauruts, serta syarat-syarat sahnya proses pembagian.',
    dalil: 'وَلِكُلٍّ جَعَلْنَا مَوَالِيَ مِمَّا تَرَكَ الْوَالِدَانِ وَالْأَقْرَبُونَ\n"Dan untuk masing-masing (laki-laki dan perempuan) Kami telah menetapkan ahli waris dari apa yang ditinggalkan oleh kedua orang tua dan karib kerabat." (QS. An-Nisa: 33)',
    isi: `### Tiga Rukun Waris Pokok
1. **Al-Muwarrits (المُوَرِّث):**
   Orang yang meninggal dunia dan meninggalkan harta kekayaan, baik mati secara hakiki (nyata) maupun mati secara *hukmi* (vonis hakim pengadilan seperti orang hilang berpuluh tahun).
2. **Al-Warits (الوَارِث):**
   Ahli waris yang masih hidup ketika muwarrits meninggal dunia dan memiliki hubungan yang sah untuk mewarisi (nasab, pernikahan, atau wala').
3. **Al-Mauruts / Tirkah (المَوْرُوث / التِّرْكَة):**
   Harta benda atau hak kebendaan bersih yang ditinggalkan setelah diselesaikan kewajiban muwarrits.

---

### Hak-Hak yang Terkait dengan Tirkah Sebelum Dibagi
Sebelum harta warisan dibagikan kepada ahli waris, wajib diselesaikan 4 kewajiban berurutan:
1. **Biaya Perawatan Jenazah (Tajhiz Al-Janazah):** Pembelian kain kafan, pemakaman, dll secara wajar.
2. **Pelunasan Hutang (Qadha' Ad-Duyun):** Baik hutang kepada Allah (zakat, nadzar) maupun kepada sesama manusia.
3. **Pelaksanaan Wasiat (Tanfidz Al-Washaya):** Maksimal 1/3 dari sisa harta dan bukan ditujukan kepada ahli waris.
4. **Pembagian Hak Waris (Taqsimul Mauruts):** Sisa harta bersih baru dibagikan sesuai ilmu faraidh.`,
    urutan: 2,
    createdAt: '2026-01-16T09:00:00Z',
  },
  {
    id: 'mat-03',
    judul: 'Sebab Mendapat dan Sebab Terhalang Warisan',
    kategori: 'Sebab Mewarisi',
    ringkasan: 'Asbab al-irts (Nasab, Nikah, Wala\') dan Mawani\' al-irts (Pembunuhan, Beda Agama, Perbudakan).',
    dalil: 'لاَ يَرِثُ المُسْلِمُ الكَافِرَ وَلاَ الكَافِرُ المُسْلِمَ\n"Orang muslim tidak mewarisi orang kafir, dan orang kafir tidak mewarisi orang muslim." (HR. Bukhari dan Muslim)',
    isi: `### Tiga Sebab Mewarisi (Asbab Al-Irts)
1. **Hubungan Kekerabatan / Nasab (An-Nasab):**
   Hubungan darah yang sah (anak, ayah, ibu, cucu, kakek, nenek, paman, saudara).
2. **Pernikahan yang Sah (An-Nikah Ash-Shahih):**
   Akad nikah yang sah menurut syariat, meskipun belum sempat berhubungan intim. Jika talak raj'i dalam masa 'iddah, masih saling mewarisi.
3. **Memerdekakan Budak (Al-Wala'):**
   Hubungan kekerabatan hukum karena seseorang memerdekakan budak.

---

### Penghalang Mendapat Warisan (Mawani' Al-Irts)
Seseorang yang semula berhak menjadi ahli waris gugur haknya secara mutlak jika terdapat salah satu dari 3 hal:
1. **Pembunuhan (Al-Qatl):**
   Ahli waris yang membunuh pewaris secara sengaja atau zalim tidak berhak mendapat warisan (*Al-Qatilu laa yarits*).
2. **Perbedaan Agama (Ikhtilaf Ad-Din):**
   Muslim tidak mewarisi dari non-muslim, dan non-muslim tidak mewarisi dari muslim.
3. **Perbudakan (Ar-Riqqu):**
   Seorang budak tidak berhak mewarisi karena dirinya dan hartanya adalah milik tuannya.`,
    urutan: 3,
    createdAt: '2026-01-17T09:00:00Z',
  },
  {
    id: 'mat-04',
    judul: 'Bagian Pasti (Furudhul Muqaddarah) & Infografis',
    kategori: 'Bagian Ahli Waris',
    ringkasan: 'Visualisasi 6 pecahan pokok: 1/2, 1/4, 1/8, 2/3, 1/3, 1/6 dan para penerimanya.',
    dalil: 'فَرِيضَةً مِنَ اللَّهِ ۗ إِنَّ اللَّهَ كَانَ عَلِيمًا حَكِيمًا\n"...Ini adalah ketetapan dari Allah. Sungguh, Allah Maha Mengetahui, Maha Bijaksana." (QS. An-Nisa: 11)',
    isi: `### 6 Macam Furudhul Muqaddarah
Dalam Al-Qur'an, bagian pasti ahli waris hanya ada 6 macam:

1. **Bagian 1/2 (Setengah):**
   - **Suami:** Jika pewaris tidak memiliki keturunan (anak/cucu).
   - **Anak Perempuan Tunggal:** Jika sendiri tanpa anak laki-laki.
   - **Cucu Perempuan Tunggal:** Jika tanpa cucu laki-laki dan tanpa anak.
   - **Saudara Perempuan Kandung Tunggal:** Jika kalalah (tanpa anak/ayah) dan tanpa saudara laki-laki kandung.
   - **Saudara Perempuan Seayah Tunggal:** Jika tanpa saudara laki-laki seayah dan tanpa saudara kandung.

2. **Bagian 1/4 (Seperempat):**
   - **Suami:** Jika pewaris memiliki keturunan (anak/cucu).
   - **Istri (satu atau lebih):** Jika pewaris tidak memiliki keturunan.

3. **Bagian 1/8 (Seperdelapan):**
   - **Istri (satu atau lebih dibagi rata):** Jika pewaris memiliki keturunan (anak/cucu).

4. **Bagian 2/3 (Dua Pertiga):**
   - **2 Orang Anak Perempuan atau Lebih:** Jika tidak ada anak laki-laki.
   - **2 Orang Cucu Perempuan atau Lebih:** Jika tidak ada cucu laki-laki dan tanpa anak.
   - **2 Saudara Perempuan Kandung atau Lebih:** Jika kalalah tanpa saudara laki-laki.

5. **Bagian 1/3 (Sepertiga):**
   - **Ibu:** Jika pewaris tidak memiliki anak/cucu dan saudaranya kurang dari 2 orang.
   - **2 Orang atau Lebih Saudara Seibu:** Dibagi rata antara laki-laki dan perempuan.

6. **Bagian 1/6 (Seperenam):**
   - **Ayah:** Jika ada keturunan laki-laki (anak/cucu laki-laki).
   - **Ibu:** Jika ada keturunan atau ada 2 orang saudara atau lebih.
   - **Kakek Shahih:** Menggantikan posisi ayah jika ada keturunan laki-laki.
   - **Nenek Shahihah:** Jika tidak ada ibu.
   - **1 Orang Saudara Seibu:** Jika sendiri pada kondisi kalalah.
   - **Cucu Perempuan:** Bersama 1 anak perempuan tunggal (pelengkap 2/3).`,
    urutan: 4,
    createdAt: '2026-01-18T09:00:00Z',
  },
  {
    id: 'mat-05',
    judul: 'Konsep Khusus: Ashabah, Hijab, \'Awal, dan Radd',
    kategori: 'Kasus Khusus',
    ringkasan: 'Pendalaman materi: macam-macam ashabah, hijab hirman & nuqshan, serta penyelesaian masalah \'awal dan radd.',
    dalil: 'أَلْحِقُوا الفَرَائِضَ بِأَهْلِهَا فَمَا بَقِيَ فَهُوَ لِأَوْلَى رَجُلٍ ذَكَرٍ\n"Bagikanlah harta warisan kepada yang berhak. Lalu apa yang tersisa, maka bagikanlah kepada laki-laki yang paling dekat kekerabatannya." (HR. Bukhari & Muslim)',
    isi: `### 1. Ashabah (Penerima Hak Sisa)
- **Ashabah bi Nafsihi:** Ahli waris laki-laki yang berhak menerima sisa secara mandiri (Anak laki-laki, cucu laki-laki, ayah, kakek, saudara laki-laki kandung/seayah, paman).
- **Ashabah bil Ghair:** Ahli waris perempuan yang menjadi ashabah karena ditarik oleh saudara laki-lakinya dengan perbandingan 2:1 (Anak perempuan bersama anak laki-laki).
- **Ashabah ma'al Ghair:** Ahli waris perempuan yang menjadi ashabah bersama perempuan lain (Saudara perempuan kandung bersama anak perempuan).

### 2. Hijab (Penghalang)
- **Hijab Nuqshan:** Mengurangi porsi warisan (contoh: bagian istri dari 1/4 turun jadi 1/8 karena ada anak).
- **Hijab Hirman:** Menghalangi total dari hak waris (contoh: kakek terhalang oleh ayah, cucu terhalang oleh anak).

### 3. Masalah 'Awal (العول)
Terjadi jika jumlah saham pecahan Ashabul Furudh melebihi Asal Masalah (contoh: total saham 7 dari asal masalah 6).
Solusinya: Asal masalah dinaikkan menjadi 7, sehingga masing-masing ahli waris menanggung pengurangan nilai secara proporsional.

### 4. Masalah Radd (الرد)
Terjadi jika jumlah saham pecahan kurang dari Asal Masalah dan tidak ada penerima ashabah. Sisa harta dikembalikan secara proporsional kepada Ashabul Furudh nasab.`,
    urutan: 5,
    createdAt: '2026-01-19T09:00:00Z',
  },
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q-01',
    tipe: 'pilihan_ganda',
    kategori: 'latihan',
    soal: 'Seorang suami meninggal dunia dengan meninggalkan seorang istri, ibu, dan seorang anak laki-laki. Berapakah porsi bagian pasti (furudh) untuk istri?',
    opsi: ['1/2', '1/4', '1/8', '1/3'],
    jawaban: '1/8',
    pembahasan: 'Istri mendapatkan bagian 1/8 (seperdelapan) karena pewaris (suami) memiliki keturunan, yaitu seorang anak laki-laki. Hal ini berlandaskan pada QS. An-Nisa ayat 12.',
    skor: 20,
    tingkatKesulitan: 'mudah',
  },
  {
    id: 'q-02',
    tipe: 'pilihan_ganda',
    kategori: 'latihan',
    soal: 'Seorang perempuan wafat meninggalkan seorang suami dan ayah kandung (tanpa anak). Berapakah bagian yang diperoleh oleh suami?',
    opsi: ['1/2', '1/4', '1/3', 'Ashabah'],
    jawaban: '1/2',
    pembahasan: 'Suami mendapatkan bagian 1/2 (setengah) karena pewaris tidak meninggalkan keturunan (anak maupun cucu), sesuai ketentuan QS. An-Nisa ayat 12.',
    skor: 20,
    tingkatKesulitan: 'mudah',
  },
  {
    id: 'q-03',
    tipe: 'benar_salah',
    kategori: 'latihan',
    soal: 'Pernyataan: "Kakek shahih tetap mendapatkan bagian waris meskipun pewaris masih memiliki Ayah kandung."',
    opsi: ['Benar', 'Salah'],
    jawaban: 'Salah',
    pembahasan: 'Salah. Kakek terhalang secara total (Hijab Hirman) oleh keberadaan Ayah kandung, karena Ayah lebih dekat derajat kekerabatannya kepada pewaris (Kaidah Al-Aqrab fa Al-Aqrab).',
    skor: 20,
    tingkatKesulitan: 'sedang',
  },
  {
    id: 'q-04',
    tipe: 'isian',
    kategori: 'latihan',
    soal: 'Kondisi di mana total saham para Ashabul Furudh melebihi angka Asal Masalah sehingga penyebut harus dinaikkan disebut masalah... (Jawab dengan satu kata)',
    jawaban: 'Awal',
    pembahasan: 'Masalah tersebut dinamakan \'Awal (العول), yakni naiknya jumlah saham bagian melebihi asal masalah awal, yang pertama kali diputuskan pada masa Khalifah Umar bin Khattab ra.',
    skor: 20,
    tingkatKesulitan: 'sedang',
  },
  {
    id: 'q-05',
    tipe: 'studi_kasus',
    kategori: 'latihan',
    soal: 'Pak Hamdan wafat meninggalkan harta bersih Rp 120.000.000. Ahli waris terdiri dari: Istri, 1 Anak Laki-laki, dan 1 Anak Perempuan. Berapakah nominal yang diterima anak laki-laki?',
    opsi: ['Rp 15.000.000', 'Rp 35.000.000', 'Rp 70.000.000', 'Rp 105.000.000'],
    jawaban: 'Rp 70.000.000',
    pembahasan: '1) Bagian Istri = 1/8 × Rp 120.000.000 = Rp 15.000.000.\n2) Sisa Harta = Rp 105.000.000 (menjadi \'Ashabah bil Ghair untuk anak laki-laki & anak perempuan dengan rasio 2:1).\n3) Jumlah porsi = 2 + 1 = 3 porsi.\n4) Bagian Anak Laki-laki = 2/3 × Rp 105.000.000 = Rp 70.000.000.',
    skor: 20,
    tingkatKesulitan: 'sulit',
  },
  // Pertanyaan Uji Kemampuan Resmi
  {
    id: 'exam-01',
    tipe: 'pilihan_ganda',
    kategori: 'uji_kemampuan',
    soal: 'Berapakah bagian yang didapatkan oleh 2 orang anak perempuan jika pewaris tidak memiliki anak laki-laki?',
    opsi: ['1/2', '1/3', '2/3', 'Ashabah'],
    jawaban: '2/3',
    pembahasan: 'Dua orang anak perempuan atau lebih yang tidak disertai anak laki-laki mendapatkan bagian 2/3 (dua pertiga) dibagi rata, berdasarkan QS. An-Nisa ayat 11.',
    skor: 15,
    tingkatKesulitan: 'mudah',
  },
  {
    id: 'exam-02',
    tipe: 'pilihan_ganda',
    kategori: 'uji_kemampuan',
    soal: 'Ayah mendapatkan bagian warisan berupa 1/6 ditambah \'Ashabah (sisa) apabila pewaris...',
    opsi: ['Meninggalkan anak laki-laki', 'Hanya meninggalkan anak perempuan', 'Tidak meninggalkan anak sama sekali', 'Meninggalkan cucu laki-laki'],
    jawaban: 'Hanya meninggalkan anak perempuan',
    pembahasan: 'Jika pewaris hanya meninggalkan anak perempuan (tanpa anak laki-laki), Ayah mendapatkan 1/6 sebagai furudh dan berhak mengambil sisa jika ada sebagai \'ashabah.',
    skor: 15,
    tingkatKesulitan: 'sedang',
  },
  {
    id: 'exam-03',
    tipe: 'benar_salah',
    kategori: 'uji_kemampuan',
    soal: 'Seorang pembunuh pewaris tetap berhak mendapatkan warisan jika ia adalah anak kandung tunggal.',
    opsi: ['Benar', 'Salah'],
    jawaban: 'Salah',
    pembahasan: 'Salah. Pembunuhan adalah salah satu Mawani\'ul Irtsi (penghalang waris mutlak). Rasulullah SAW bersabda: "Pembunuh tidak berhak mendapatkan warisan sedikit pun." (HR. Abu Dawud).',
    skor: 15,
    tingkatKesulitan: 'mudah',
  },
  {
    id: 'exam-04',
    tipe: 'isian',
    kategori: 'uji_kemampuan',
    soal: 'KPK dari penyebut pecahan furudhul muqaddarah yang digunakan sebagai patokan dasar pembagian waris disebut Asal...',
    jawaban: 'Masalah',
    pembahasan: 'Disebut Asal Masalah (Ashlul Mas\'alah). Angka-angka asal masalah dalam faraidh yang disepakati adalah 2, 3, 4, 6, 8, 12, dan 24.',
    skor: 15,
    tingkatKesulitan: 'mudah',
  },
  {
    id: 'exam-05',
    tipe: 'studi_kasus',
    kategori: 'uji_kemampuan',
    soal: 'Ibu wafat meninggalkan harta Rp 48.000.000. Ahli waris: Suami, Ibu, dan 1 Anak Laki-laki. Berapakah bagian yang diterima oleh Ibu?',
    opsi: ['Rp 16.000.000', 'Rp 12.000.000', 'Rp 8.000.000', 'Rp 6.000.000'],
    jawaban: 'Rp 8.000.000',
    pembahasan: 'Karena ada anak laki-laki, Ibu mendapat 1/6. Perhitungan: 1/6 × Rp 48.000.000 = Rp 8.000.000. (Suami 1/4 = Rp 12.000.000, Anak Laki-laki ashabah sisa Rp 28.000.000).',
    skor: 20,
    tingkatKesulitan: 'sedang',
  },
  {
    id: 'exam-06',
    tipe: 'studi_kasus',
    kategori: 'uji_kemampuan',
    soal: 'Seseorang meninggal meninggalkan harta Rp 60.000.000. Ahli waris: Suami dan 2 Saudara Perempuan Kandung. Asal masalah awal 6 berubah menjadi 7 (\'Awal). Berapakah uang yang diterima Suami?',
    opsi: ['Rp 30.000.000', 'Rp 25.714.286', 'Rp 34.285.714', 'Rp 20.000.000'],
    jawaban: 'Rp 25.714.286',
    pembahasan: 'Saham: Suami 1/2 = 3 saham, 2 Saudari Kandung 2/3 = 4 saham. Total saham = 3 + 4 = 7 (terjadi \'Awal). Bagian Suami = 3/7 × Rp 60.000.000 = Rp 25.714.286.',
    skor: 20,
    tingkatKesulitan: 'sulit',
  },
];

export const INITIAL_RESULTS: ExamResult[] = [
  { id: 'res-01', idSiswa: 'siswa-01', namaSiswa: 'Ahmad Fauzi Rahman', kelas: 'XII RPL 1', tipe: 'uji_kemampuan', nilai: 85, jumlahBenar: 5, jumlahSalah: 1, totalSoal: 6, statusTuntas: true, feedbackGuru: 'Sangat baik, teliti lagi pada pembagian sisa ashabah.', tanggal: '2026-02-01 10:15' },
  { id: 'res-02', idSiswa: 'siswa-02', namaSiswa: 'Aisyah Putri Azzahra', kelas: 'XII RPL 1', tipe: 'uji_kemampuan', nilai: 100, jumlahBenar: 6, jumlahSalah: 0, totalSoal: 6, statusTuntas: true, feedbackGuru: 'Mumtaz! Pemahaman faraidh sangat matang dan akurat.', tanggal: '2026-02-01 10:20' },
  { id: 'res-03', idSiswa: 'siswa-03', namaSiswa: 'Ali Zainal Abidin', kelas: 'XII RPL 1', tipe: 'uji_kemampuan', nilai: 65, jumlahBenar: 3, jumlahSalah: 3, totalSoal: 6, statusTuntas: false, feedbackGuru: 'Perlu bimbingan tambahan konsep Hijab Hirman dan Ashabul Furudh.', tanggal: '2026-02-01 10:25' },
  { id: 'res-04', idSiswa: 'siswa-04', namaSiswa: 'Annisa Fitriani', kelas: 'XII RPL 1', tipe: 'uji_kemampuan', nilai: 90, jumlahBenar: 5, jumlahSalah: 1, totalSoal: 6, statusTuntas: true, feedbackGuru: 'Bagus sekali! Pertahankan ketelitian perhitungan.', tanggal: '2026-02-01 10:30' },
  { id: 'res-05', idSiswa: 'siswa-06', namaSiswa: 'Bilqis Humaira', kelas: 'XII RPL 1', tipe: 'uji_kemampuan', nilai: 95, jumlahBenar: 6, jumlahSalah: 0, totalSoal: 6, statusTuntas: true, feedbackGuru: 'Luar biasa, penguasaan rumus sangat komprehensif.', tanggal: '2026-02-01 10:35' },
  { id: 'res-06', idSiswa: 'siswa-08', namaSiswa: 'Fatimah Az-Zahra', kelas: 'XII TKJ 2', tipe: 'uji_kemampuan', nilai: 100, jumlahBenar: 6, jumlahSalah: 0, totalSoal: 6, statusTuntas: true, feedbackGuru: 'Sempurna! Siap menjadi tutor sebaya di kelas.', tanggal: '2026-02-01 11:00' },
  { id: 'res-07', idSiswa: 'siswa-07', namaSiswa: 'Danial Syahputra', kelas: 'XII TKJ 2', tipe: 'uji_kemampuan', nilai: 75, jumlahBenar: 4, jumlahSalah: 2, totalSoal: 6, statusTuntas: true, feedbackGuru: 'Tuntas KKM, perdalam lagi studi kasus masalah \'Awal.', tanggal: '2026-02-01 11:05' },
  { id: 'res-08', idSiswa: 'siswa-09', namaSiswa: 'Fajar Hidayatullah', kelas: 'XII TKJ 2', tipe: 'uji_kemampuan', nilai: 60, jumlahBenar: 3, jumlahSalah: 3, totalSoal: 6, statusTuntas: false, feedbackGuru: 'Remedial dianjurkan untuk bab furudhul muqaddarah.', tanggal: '2026-02-01 11:15' },
  { id: 'res-09', idSiswa: 'siswa-13', namaSiswa: 'Khadijah Marwah', kelas: 'XII OTKP 1', tipe: 'uji_kemampuan', nilai: 100, jumlahBenar: 6, jumlahSalah: 0, totalSoal: 6, statusTuntas: true, feedbackGuru: 'Sangat menguasai dalil dan kalkulasi faraidh.', tanggal: '2026-02-01 11:30' },
  { id: 'res-10', idSiswa: 'siswa-14', namaSiswa: 'Luqman Hakim', kelas: 'XII OTKP 1', tipe: 'uji_kemampuan', nilai: 80, jumlahBenar: 5, jumlahSalah: 1, totalSoal: 6, statusTuntas: true, feedbackGuru: 'Sudah bagus, perhatikan rincian syarat kalalah.', tanggal: '2026-02-01 11:40' },
  { id: 'res-11', idSiswa: 'siswa-17', namaSiswa: 'Nadia Salsabila', kelas: 'XII OTKP 1', tipe: 'uji_kemampuan', nilai: 90, jumlahBenar: 5, jumlahSalah: 1, totalSoal: 6, statusTuntas: true, feedbackGuru: 'Sangat baik dan teratur langkah penyelesaiannya.', tanggal: '2026-02-01 11:50' },
  { id: 'res-12', idSiswa: 'siswa-21', namaSiswa: 'Zahra Maulida', kelas: 'XII BDP 2', tipe: 'uji_kemampuan', nilai: 95, jumlahBenar: 6, jumlahSalah: 0, totalSoal: 6, statusTuntas: true, feedbackGuru: 'Mantap! Terus berlatih simulasi waris mandiri.', tanggal: '2026-02-01 12:10' },
];
