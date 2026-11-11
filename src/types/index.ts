export type UserRole = 'admin' | 'guru' | 'siswa';

export interface User {
  id: string;
  nama: string;
  username: string;
  password?: string;
  kelas: string;
  nomorAbsen?: number;
  role: UserRole;
  xp?: number;
  level?: number;
  badges?: string[];
  createdAt?: string;
}

export interface Material {
  id: string;
  judul: string;
  kategori: 'Pengertian' | 'Rukun & Syarat' | 'Sebab Mewarisi' | 'Hijab & Mahjub' | 'Bagian Ahli Waris' | 'Kasus Khusus';
  ringkasan: string;
  isi: string;
  dalil?: string;
  gambarUrl?: string;
  pdfUrl?: string;
  urutan: number;
  createdAt?: string;
}

export type QuestionType = 'pilihan_ganda' | 'benar_salah' | 'isian' | 'studi_kasus';
export type DifficultyLevel = 'mudah' | 'sedang' | 'sulit';
export type QuestionCategory = 'latihan' | 'uji_kemampuan';

export interface Question {
  id: string;
  tipe: QuestionType;
  kategori: QuestionCategory;
  soal: string;
  opsi?: string[];
  jawaban: string;
  pembahasan: string;
  skor: number;
  tingkatKesulitan: DifficultyLevel;
  createdAt?: string;
}

export interface ExamResult {
  id: string;
  idSiswa: string;
  namaSiswa: string;
  kelas: string;
  tipe: 'latihan' | 'uji_kemampuan';
  nilai: number;
  jumlahBenar: number;
  jumlahSalah: number;
  totalSoal: number;
  statusTuntas: boolean;
  feedbackGuru?: string;
  tanggal: string;
}

export interface HeirInput {
  suami: number;
  istri: number;
  ayah: boolean;
  ibu: boolean;
  anakLaki: number;
  anakPerempuan: number;
  cucuLaki: number;
  cucuPerempuan: number;
  kakek: boolean;
  nenek: boolean;
  saudaraLakiKandung: number;
  saudaraPerempuanKandung: number;
  saudaraSeibu: number;
}

export interface HeirShare {
  title: string;
  count: number;
  status: 'Furudh' | 'Ashabah' | 'Mahjub' | 'Terkendala';
  fractionStr: string;
  sharePerPerson: number;
  totalShare: number;
  nominalTotal: number;
  nominalPerPerson: number;
  alasan: string;
  dalil: string;
  color: string;
}

export interface CalculationResult {
  tirkah: number;
  asalMasalah: number;
  totalSaham: number;
  tipeKasus: 'Adil' | 'Awal' | 'Radd';
  penjelasanKasus: string;
  shares: HeirShare[];
  steps: {
    title: string;
    description: string;
    detail?: string[];
  }[];
}
