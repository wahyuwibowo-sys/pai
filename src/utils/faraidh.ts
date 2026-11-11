import { HeirInput, CalculationResult, HeirShare } from '../types';

// Helper to calculate Greatest Common Divisor
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

// Helper to calculate Least Common Multiple
function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

// Multiple LCM
function lcmArray(numbers: number[]): number {
  return numbers.reduce((acc, curr) => lcm(acc, curr), 1);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function calculateFaraidh(tirkah: number, input: HeirInput): CalculationResult {
  const steps: { title: string; description: string; detail?: string[] }[] = [];
  const shares: HeirShare[] = [];

  // Step 1: Identifikasi Keberadaan Furu' (Keturunan) dan Ushul (Leluhur)
  const hasFuruLaki = input.anakLaki > 0 || input.cucuLaki > 0;
  const hasFuruPerempuan = input.anakPerempuan > 0 || input.cucuPerempuan > 0;
  const hasFuru = hasFuruLaki || hasFuruPerempuan;
  const totalSaudara = input.saudaraLakiKandung + input.saudaraPerempuanKandung + input.saudaraSeibu;
  const hasMultiSaudara = totalSaudara >= 2;

  steps.push({
    title: 'Langkah 1: Identifikasi Ahli Waris & Kondisi Penghalang (Hijab)',
    description: 'Memeriksa keberadaan keturunan (furu\'), orang tua (ushul), serta relasi kekerabatan yang mempengaruhi porsi hak waris.',
    detail: [
      `Harta Warisan Bersih (Tirkah): ${formatRupiah(tirkah)}`,
      `Keberadaan Keturunan (Anak/Cucu): ${hasFuru ? 'Ada (' + (hasFuruLaki ? 'Ada keturunan laki-laki' : 'Hanya keturunan perempuan') + ')' : 'Tidak Ada'}`,
      `Jumlah Saudara Pewaris: ${totalSaudara} orang ${hasMultiSaudara ? '(>= 2 orang, mempengaruhi bagian Ibu)' : ''}`,
    ]
  });

  // Track Furudh shares with fractions (numerator, denominator)
  interface RawFurudh {
    title: string;
    count: number;
    num: number;
    den: number;
    alasan: string;
    dalil: string;
    color: string;
    isSpouse?: boolean;
  }
  const rawFurudhList: RawFurudh[] = [];

  // 1. Suami
  if (input.suami > 0) {
    if (hasFuru) {
      rawFurudhList.push({
        title: 'Suami',
        count: 1,
        num: 1,
        den: 4,
        alasan: 'Mendapat 1/4 karena pewaris memiliki keturunan (anak/cucu).',
        dalil: 'QS. An-Nisa: 12',
        color: '#059669',
        isSpouse: true,
      });
    } else {
      rawFurudhList.push({
        title: 'Suami',
        count: 1,
        num: 1,
        den: 2,
        alasan: 'Mendapat 1/2 karena pewaris tidak meninggalkan keturunan.',
        dalil: 'QS. An-Nisa: 12',
        color: '#059669',
        isSpouse: true,
      });
    }
  }

  // 2. Istri
  if (input.istri > 0) {
    if (hasFuru) {
      rawFurudhList.push({
        title: input.istri > 1 ? `Istri (${input.istri} orang)` : 'Istri',
        count: input.istri,
        num: 1,
        den: 8,
        alasan: `Mendapat 1/8 (dibagi rata untuk ${input.istri} orang) karena ada keturunan (anak/cucu).`,
        dalil: 'QS. An-Nisa: 12',
        color: '#10b981',
        isSpouse: true,
      });
    } else {
      rawFurudhList.push({
        title: input.istri > 1 ? `Istri (${input.istri} orang)` : 'Istri',
        count: input.istri,
        num: 1,
        den: 4,
        alasan: `Mendapat 1/4 (dibagi rata untuk ${input.istri} orang) karena tidak ada keturunan.`,
        dalil: 'QS. An-Nisa: 12',
        color: '#10b981',
        isSpouse: true,
      });
    }
  }

  // 3. Ibu
  if (input.ibu) {
    // Cek kasus Umariyyatan / Gharawain (Hanya Suami/Istri + Ayah + Ibu)
    const isUmariyyatan = !hasFuru && totalSaudara === 0 && input.ayah && (input.suami > 0 || input.istri > 0);

    if (hasFuru || hasMultiSaudara) {
      rawFurudhList.push({
        title: 'Ibu',
        count: 1,
        num: 1,
        den: 6,
        alasan: hasFuru
          ? 'Mendapat 1/6 karena pewaris memiliki keturunan.'
          : 'Mendapat 1/6 karena pewaris memiliki 2 orang saudara atau lebih (Hijab Nuqshan).',
        dalil: 'QS. An-Nisa: 11',
        color: '#d97706',
      });
    } else if (isUmariyyatan) {
      // Pada Umariyyatan, Ibu mendapat 1/3 dari sisa setelah bagian Suami/Istri
      // Jika dengan Suami (1/2): Sisa 1/2. 1/3 dari 1/2 = 1/6. Ayah sisa 2/6.
      // Jika dengan Istri (1/4): Sisa 3/4. 1/3 dari 3/4 = 1/4. Ayah sisa 2/4.
      if (input.suami > 0) {
        rawFurudhList.push({
          title: 'Ibu (Kasus Umariyyatan)',
          count: 1,
          num: 1,
          den: 6,
          alasan: 'Mendapat 1/3 dari sisa harta (tsulutsul baqi) setara 1/6 dari keseluruhan, agar bagian Ayah tetap 2x bagian Ibu.',
          dalil: 'Ijtihad Umar bin Khattab ra. & Ijma Shahabat',
          color: '#d97706',
        });
      } else {
        rawFurudhList.push({
          title: 'Ibu (Kasus Umariyyatan)',
          count: 1,
          num: 1,
          den: 4,
          alasan: 'Mendapat 1/3 dari sisa harta setelah bagian istri setara 1/4 dari total, menjaga proporsi laki-laki 2:1 terhadap ayah.',
          dalil: 'Ijtihad Umar bin Khattab ra. & Ijma Shahabat',
          color: '#d97706',
        });
      }
    } else {
      rawFurudhList.push({
        title: 'Ibu',
        count: 1,
        num: 1,
        den: 3,
        alasan: 'Mendapat 1/3 karena tidak ada anak/cucu dan saudara kurang dari 2 orang.',
        dalil: 'QS. An-Nisa: 11',
        color: '#d97706',
      });
    }
  }

  // 4. Ayah
  // Ayah bisa: 1/6 (jika ada anak laki), 1/6 + Ashabah (jika hanya ada anak perempuan), atau Ashabah murni (jika tidak ada anak)
  let ayahStatus: 'furudh' | 'furudh_ashabah' | 'ashabah' | 'none' = 'none';
  if (input.ayah) {
    if (hasFuruLaki) {
      ayahStatus = 'furudh';
      rawFurudhList.push({
        title: 'Ayah',
        count: 1,
        num: 1,
        den: 6,
        alasan: 'Mendapat 1/6 murni karena pewaris memiliki keturunan laki-laki (anak/cucu laki-laki).',
        dalil: 'QS. An-Nisa: 11',
        color: '#b45309',
      });
    } else if (hasFuruPerempuan) {
      ayahStatus = 'furudh_ashabah';
      rawFurudhList.push({
        title: 'Ayah (Bagian Furudh)',
        count: 1,
        num: 1,
        den: 6,
        alasan: 'Mendapat 1/6 sebagai Ashabul Furudh ditambah hak sisa (\'Ashabah) jika ada sisa harta.',
        dalil: 'QS. An-Nisa: 11',
        color: '#b45309',
      });
    } else {
      ayahStatus = 'ashabah';
    }
  }

  // 5. Nenek (Shahihah)
  if (input.nenek) {
    if (input.ibu) {
      shares.push({
        title: 'Nenek',
        count: 1,
        status: 'Mahjub',
        fractionStr: 'Terhalang (Mahjub)',
        sharePerPerson: 0,
        totalShare: 0,
        nominalTotal: 0,
        nominalPerPerson: 0,
        alasan: 'Mahjub Hirman (terhalang total) karena ada Ibu kandung.',
        dalil: 'Ijma\' Ulama Faraidh',
        color: '#9ca3af',
      });
    } else {
      rawFurudhList.push({
        title: 'Nenek',
        count: 1,
        num: 1,
        den: 6,
        alasan: 'Mendapat 1/6 sebagai pengganti Ibu yang telah meninggal/tidak ada.',
        dalil: 'Hadits Abu Bakar Ash-Shiddiq ra.',
        color: '#f59e0b',
      });
    }
  }

  // 6. Kakek (Shahih)
  let kakekStatus: 'furudh' | 'ashabah' | 'mahjub' | 'none' = 'none';
  if (input.kakek) {
    if (input.ayah) {
      kakekStatus = 'mahjub';
      shares.push({
        title: 'Kakek',
        count: 1,
        status: 'Mahjub',
        fractionStr: 'Terhalang (Mahjub)',
        sharePerPerson: 0,
        totalShare: 0,
        nominalTotal: 0,
        nominalPerPerson: 0,
        alasan: 'Mahjub Hirman (terhalang) karena ada Ayah kandung yang lebih dekat kekerabatannya.',
        dalil: 'Kaidah Al-Aqrab fa Al-Aqrab',
        color: '#9ca3af',
      });
    } else {
      if (hasFuruLaki) {
        kakekStatus = 'furudh';
        rawFurudhList.push({
          title: 'Kakek',
          count: 1,
          num: 1,
          den: 6,
          alasan: 'Mendapat 1/6 menggantikan Ayah karena pewaris memiliki keturunan laki-laki.',
          dalil: 'Ijma\' Shahabat',
          color: '#78716c',
        });
      } else {
        kakekStatus = 'ashabah';
      }
    }
  }

  // 7. Anak Perempuan
  // Jika tidak ada anak laki-laki: 1 orang = 1/2; 2+ orang = 2/3
  // Jika ada anak laki-laki: menjadi 'Ashabah bil Ghair (laki : perempuan = 2 : 1)
  const isAnakAshabah = input.anakLaki > 0 && input.anakPerempuan > 0;
  if (input.anakPerempuan > 0 && input.anakLaki === 0) {
    if (input.anakPerempuan === 1) {
      rawFurudhList.push({
        title: 'Anak Perempuan (Tunggal)',
        count: 1,
        num: 1,
        den: 2,
        alasan: 'Mendapat 1/2 karena hanya seorang diri dan tidak ada anak laki-laki.',
        dalil: 'QS. An-Nisa: 11',
        color: '#ec4899',
      });
    } else {
      rawFurudhList.push({
        title: `Anak Perempuan (${input.anakPerempuan} orang)`,
        count: input.anakPerempuan,
        num: 2,
        den: 3,
        alasan: `Mendapat 2/3 (dibagi rata ${input.anakPerempuan} orang) karena berjumlah 2 atau lebih tanpa anak laki-laki.`,
        dalil: 'QS. An-Nisa: 11',
        color: '#ec4899',
      });
    }
  }

  // 8. Cucu Perempuan (dari Anak Laki-laki)
  if (input.cucuPerempuan > 0) {
    if (input.anakLaki > 0) {
      shares.push({
        title: `Cucu Perempuan (${input.cucuPerempuan} org)`,
        count: input.cucuPerempuan,
        status: 'Mahjub',
        fractionStr: 'Terhalang (Mahjub)',
        sharePerPerson: 0,
        totalShare: 0,
        nominalTotal: 0,
        nominalPerPerson: 0,
        alasan: 'Mahjub Hirman karena terhalang oleh keberadaan Anak Laki-laki pewaris.',
        dalil: 'Kaidah Faraidh',
        color: '#9ca3af',
      });
    } else if (input.anakPerempuan >= 2 && input.cucuLaki === 0) {
      shares.push({
        title: `Cucu Perempuan (${input.cucuPerempuan} org)`,
        count: input.cucuPerempuan,
        status: 'Mahjub',
        fractionStr: 'Terhalang (Mahjub)',
        sharePerPerson: 0,
        totalShare: 0,
        nominalTotal: 0,
        nominalPerPerson: 0,
        alasan: 'Hak 2/3 untuk anak perempuan sudah dihabiskan oleh 2 orang anak perempuan kandung (Istiqra\' Ats-Tsulutsain).',
        dalil: 'Hadits Ibnu Mas\'ud ra.',
        color: '#9ca3af',
      });
    } else if (input.anakPerempuan === 1 && input.cucuLaki === 0) {
      rawFurudhList.push({
        title: `Cucu Perempuan (${input.cucuPerempuan} org)`,
        count: input.cucuPerempuan,
        num: 1,
        den: 6,
        alasan: 'Mendapat 1/6 sebagai penyempurna bagian 2/3 (Takmilah Ats-Tsulutsain) bersama 1 orang anak perempuan.',
        dalil: 'Hadits Shahih Bukhari dari Ibnu Mas\'ud ra.',
        color: '#f43f5e',
      });
    }
  }

  // 9. Cucu Laki-laki (dari anak laki-laki)
  let cucuLakiStatus: 'ashabah' | 'mahjub' | 'none' = 'none';
  if (input.cucuLaki > 0) {
    if (input.anakLaki > 0) {
      cucuLakiStatus = 'mahjub';
      shares.push({
        title: `Cucu Laki-laki (${input.cucuLaki} org)`,
        count: input.cucuLaki,
        status: 'Mahjub',
        fractionStr: 'Terhalang (Mahjub)',
        sharePerPerson: 0,
        totalShare: 0,
        nominalTotal: 0,
        nominalPerPerson: 0,
        alasan: 'Mahjub Hirman karena terhalang oleh Anak Laki-laki kandung.',
        dalil: 'Ijma\' Ulama',
        color: '#9ca3af',
      });
    } else {
      cucuLakiStatus = 'ashabah';
    }
  }

  // 10. Saudara Seibu
  if (input.saudaraSeibu > 0) {
    if (hasFuru || input.ayah || (input.kakek && !input.ayah)) {
      shares.push({
        title: `Saudara Seibu (${input.saudaraSeibu} org)`,
        count: input.saudaraSeibu,
        status: 'Mahjub',
        fractionStr: 'Terhalang (Mahjub)',
        sharePerPerson: 0,
        totalShare: 0,
        nominalTotal: 0,
        nominalPerPerson: 0,
        alasan: 'Mahjub Hirman oleh Furu\' (keturunan) atau Ushul Laki-laki (Ayah/Kakek).',
        dalil: 'QS. An-Nisa: 12 (Kaidah Kalalah)',
        color: '#9ca3af',
      });
    } else {
      if (input.saudaraSeibu === 1) {
        rawFurudhList.push({
          title: 'Saudara Seibu (1 orang)',
          count: 1,
          num: 1,
          den: 6,
          alasan: 'Mendapat 1/6 karena seorang diri pada kondisi Kalalah (tanpa anak dan tanpa ayah).',
          dalil: 'QS. An-Nisa: 12',
          color: '#8b5cf6',
        });
      } else {
        rawFurudhList.push({
          title: `Saudara Seibu (${input.saudaraSeibu} orang)`,
          count: input.saudaraSeibu,
          num: 1,
          den: 3,
          alasan: `Mendapat 1/3 berserikat dibagi rata (laki-laki dan perempuan sama porsinya) untuk ${input.saudaraSeibu} orang.`,
          dalil: 'QS. An-Nisa: 12',
          color: '#8b5cf6',
        });
      }
    }
  }

  // 11. Saudara Kandung (Laki & Perempuan)
  const isMahjubSaudara = hasFuruLaki || input.ayah || (input.kakek && !input.ayah);
  if (input.saudaraLakiKandung > 0 && isMahjubSaudara) {
    shares.push({
      title: `Saudara Laki-laki Kandung (${input.saudaraLakiKandung} org)`,
      count: input.saudaraLakiKandung,
      status: 'Mahjub',
      fractionStr: 'Terhalang (Mahjub)',
      sharePerPerson: 0,
      totalShare: 0,
      nominalTotal: 0,
      nominalPerPerson: 0,
      alasan: 'Mahjub Hirman karena terhalang oleh Ayah atau keturunan laki-laki (anak/cucu laki-laki).',
      dalil: 'Kaidah Al-Aqrab fa Al-Aqrab',
      color: '#9ca3af',
    });
  }
  if (input.saudaraPerempuanKandung > 0 && isMahjubSaudara) {
    shares.push({
      title: `Saudara Perempuan Kandung (${input.saudaraPerempuanKandung} org)`,
      count: input.saudaraPerempuanKandung,
      status: 'Mahjub',
      fractionStr: 'Terhalang (Mahjub)',
      sharePerPerson: 0,
      totalShare: 0,
      nominalTotal: 0,
      nominalPerPerson: 0,
      alasan: 'Mahjub Hirman terhalang oleh Ayah atau keturunan laki-laki.',
      dalil: 'QS. An-Nisa: 176',
      color: '#9ca3af',
    });
  }

  // Jika saudara kandung tidak mahjub dan tidak ada anak perempuan (tanpa furu')
  let isSaudaraAshabah = false;
  if (!isMahjubSaudara) {
    if (input.saudaraLakiKandung > 0) {
      isSaudaraAshabah = true;
    } else if (input.saudaraPerempuanKandung > 0) {
      if (hasFuruPerempuan) {
        // Ashabah ma'al Ghair bersama anak/cucu perempuan
        isSaudaraAshabah = true;
      } else {
        // Sebagai Ashabul Furudh
        if (input.saudaraPerempuanKandung === 1) {
          rawFurudhList.push({
            title: 'Saudara Perempuan Kandung (Tunggal)',
            count: 1,
            num: 1,
            den: 2,
            alasan: 'Mendapat 1/2 karena tidak ada anak, ayah, maupun saudara laki-laki kandung.',
            dalil: 'QS. An-Nisa: 176',
            color: '#a855f7',
          });
        } else {
          rawFurudhList.push({
            title: `Saudara Perempuan Kandung (${input.saudaraPerempuanKandung} org)`,
            count: input.saudaraPerempuanKandung,
            num: 2,
            den: 3,
            alasan: `Mendapat 2/3 (dibagi rata ${input.saudaraPerempuanKandung} orang) tanpa anak dan saudara laki-laki.`,
            dalil: 'QS. An-Nisa: 176',
            color: '#a855f7',
          });
        }
      }
    }
  }

  // Step 2: Menentukan Asal Masalah dari KPK Penyebut Furudh
  const denominators = rawFurudhList.map(f => f.den);
  let asalMasalah = denominators.length > 0 ? lcmArray(denominators) : 1;
  // Standardise ke kaidah faraidh (2, 3, 4, 6, 8, 12, 24)
  if (asalMasalah === 1 && (input.anakLaki > 0 || ayahStatus === 'ashabah' || isSaudaraAshabah)) {
    asalMasalah = 24; // default base if pure ashabah with potential splits
  }

  steps.push({
    title: 'Langkah 2: Menentukan Ashabul Furudh & Asal Masalah',
    description: `Menghitung Asal Masalah (KPK dari penyebut pecahan furudh) untuk memudahkan pembagian saham secara adil.`,
    detail: [
      `Daftar Pecahan Furudh: ${rawFurudhList.map(f => `${f.title} (${f.num}/${f.den})`).join(', ') || 'Tidak ada Ashabul Furudh murni'}`,
      `Asal Masalah Terbentuk: ${asalMasalah} Saham`,
    ]
  });

  // Calculate Saham for each Furudh
  let sumSahamFurudh = 0;
  interface FurudhCalculated {
    raw: RawFurudh;
    saham: number;
  }
  const calculatedFurudh: FurudhCalculated[] = rawFurudhList.map(f => {
    const saham = (f.num * asalMasalah) / f.den;
    sumSahamFurudh += saham;
    return { raw: f, saham };
  });

  // Cek apakah ada penerima 'Ashabah
  const hasAshabah =
    input.anakLaki > 0 ||
    isAnakAshabah ||
    (cucuLakiStatus === 'ashabah') ||
    (ayahStatus === 'ashabah' || ayahStatus === 'furudh_ashabah') ||
    (kakekStatus === 'ashabah') ||
    isSaudaraAshabah;

  let tipeKasus: 'Adil' | 'Awal' | 'Radd' = 'Adil';
  let penjelasanKasus = 'Total saham pas dengan asal masalah (Masa\'alah Adil). Harta dibagikan tepat tanpa kelebihan atau kekurangan.';
  let finalAsalMasalah = asalMasalah;

  // Kasus 1: 'AWAL (Saham Furudh > Asal Masalah)
  if (sumSahamFurudh > asalMasalah) {
    tipeKasus = 'Awal';
    finalAsalMasalah = sumSahamFurudh;
    penjelasanKasus = `Terjadi 'AWAL karena jumlah saham bagian Ashabul Furudh (${sumSahamFurudh}) melebihi Asal Masalah awal (${asalMasalah}). Asal Masalah dinaikkan menjadi ${finalAsalMasalah} sehingga semua ahli waris menanggung pengurangan secara adil dan proporsional.`;

    steps.push({
      title: 'Langkah 3: Penanganan Kasus \'AWAL',
      description: penjelasanKasus,
      detail: [
        `Asal Masalah Awal: ${asalMasalah}`,
        `Total Saham Seluruh Furudh: ${sumSahamFurudh}`,
        `Asal Masalah Baru (\'Awal): ${finalAsalMasalah}`,
        `Sisa untuk \'Ashabah: Habis (0 saham)`
      ]
    });

    // Populate Furudh with 'Awal
    for (const item of calculatedFurudh) {
      const nominalTotal = (item.saham / finalAsalMasalah) * tirkah;
      const nominalPerPerson = nominalTotal / item.raw.count;
      shares.push({
        title: item.raw.title,
        count: item.raw.count,
        status: 'Furudh',
        fractionStr: `${item.saham}/${finalAsalMasalah} (Asal ${item.raw.num}/${item.raw.den})`,
        sharePerPerson: (item.saham / finalAsalMasalah) / item.raw.count,
        totalShare: item.saham / finalAsalMasalah,
        nominalTotal,
        nominalPerPerson,
        alasan: `${item.raw.alasan} (Mengalami pengurangan proporsional karena 'Awal).`,
        dalil: item.raw.dalil,
        color: item.raw.color,
      });
    }

    // Penerima ashabah tidak mendapat apa-apa karena habis
    if (input.anakLaki === 0 && ayahStatus === 'furudh_ashabah') {
      // Ayah sudah dapat dari Furudh
    }

  } else if (sumSahamFurudh === asalMasalah || hasAshabah) {
    // Kasus 2: ADIL atau ada 'ASHABAH yang mengambil sisa
    const sisaSaham = asalMasalah - sumSahamFurudh;

    steps.push({
      title: 'Langkah 3: Pembagian Saham & Alokasi Sisa (\'Ashabah)',
      description: sisaSaham > 0 && hasAshabah
        ? `Terdapat sisa saham sebesar ${sisaSaham} dari ${asalMasalah} yang dibagikan kepada penerima \'Ashabah.`
        : `Pembagian langsung memenuhi seluruh saham.`,
      detail: [
        `Total Saham Ashabul Furudh: ${sumSahamFurudh}`,
        `Sisa Saham untuk \'Ashabah: ${sisaSaham}`,
      ]
    });

    // Add furudh shares
    for (const item of calculatedFurudh) {
      const nominalTotal = (item.saham / asalMasalah) * tirkah;
      const nominalPerPerson = nominalTotal / item.raw.count;
      shares.push({
        title: item.raw.title,
        count: item.raw.count,
        status: 'Furudh',
        fractionStr: `${item.raw.num}/${item.raw.den} (${item.saham}/${asalMasalah} Saham)`,
        sharePerPerson: (item.saham / asalMasalah) / item.raw.count,
        totalShare: item.saham / asalMasalah,
        nominalTotal,
        nominalPerPerson,
        alasan: item.raw.alasan,
        dalil: item.raw.dalil,
        color: item.raw.color,
      });
    }

    // Allocate 'Ashabah
    if (sisaSaham > 0 && hasAshabah) {
      const sisaNominal = (sisaSaham / asalMasalah) * tirkah;

      // Prioritas 1: Anak Laki-laki (dan Anak Perempuan sebagai Ashabah bil Ghair)
      if (input.anakLaki > 0) {
        const headsCount = (input.anakLaki * 2) + input.anakPerempuan;
        const nominalPerHead = sisaNominal / headsCount;

        const totalNominalLaki = nominalPerHead * 2 * input.anakLaki;
        const nominalPerLaki = totalNominalLaki / input.anakLaki;

        shares.push({
          title: input.anakLaki > 1 ? `Anak Laki-laki (${input.anakLaki} orang)` : 'Anak Laki-laki',
          count: input.anakLaki,
          status: 'Ashabah',
          fractionStr: `\'Ashabah bi Nafsihi (${(totalNominalLaki / tirkah * 100).toFixed(1)}%)`,
          sharePerPerson: (nominalPerLaki / tirkah),
          totalShare: totalNominalLaki / tirkah,
          nominalTotal: totalNominalLaki,
          nominalPerPerson: nominalPerLaki,
          alasan: '\'Ashabah bi Nafsihi: Menghabiskan sisa harta warisan setelah Ashabul Furudh mengambil haknya.',
          dalil: 'QS. An-Nisa: 11 & HR. Bukhari Muslim',
          color: '#1e40af',
        });

        if (input.anakPerempuan > 0) {
          const totalNominalPerempuan = nominalPerHead * input.anakPerempuan;
          const nominalPerPerempuan = totalNominalPerempuan / input.anakPerempuan;

          shares.push({
            title: input.anakPerempuan > 1 ? `Anak Perempuan (${input.anakPerempuan} orang)` : 'Anak Perempuan',
            count: input.anakPerempuan,
            status: 'Ashabah',
            fractionStr: `\'Ashabah bil Ghair (${(totalNominalPerempuan / tirkah * 100).toFixed(1)}%)`,
            sharePerPerson: (nominalPerPerempuan / tirkah),
            totalShare: totalNominalPerempuan / tirkah,
            nominalTotal: totalNominalPerempuan,
            nominalPerPerson: nominalPerPerempuan,
            alasan: '\'Ashabah bil Ghair: Bersama anak laki-laki dengan perbandingan 2:1 (bagian laki-laki dua kali perempuan).',
            dalil: 'QS. An-Nisa: 11',
            color: '#3b82f6',
          });
        }
      } else if (cucuLakiStatus === 'ashabah') {
        // Cucu Laki-laki
        shares.push({
          title: `Cucu Laki-laki (${input.cucuLaki} org)`,
          count: input.cucuLaki,
          status: 'Ashabah',
          fractionStr: `\'Ashabah (${sisaSaham}/${asalMasalah})`,
          sharePerPerson: (sisaSaham / asalMasalah) / input.cucuLaki,
          totalShare: sisaSaham / asalMasalah,
          nominalTotal: sisaNominal,
          nominalPerPerson: sisaNominal / input.cucuLaki,
          alasan: '\'Ashabah bi Nafsihi menggantikan posisi anak laki-laki.',
          dalil: 'Kaidah Faraidh',
          color: '#2563eb',
        });
      } else if (ayahStatus === 'ashabah' || ayahStatus === 'furudh_ashabah') {
        // Ayah menerima sisa
        if (ayahStatus === 'ashabah') {
          shares.push({
            title: 'Ayah',
            count: 1,
            status: 'Ashabah',
            fractionStr: `\'Ashabah bi Nafsihi (${sisaSaham}/${asalMasalah})`,
            sharePerPerson: sisaSaham / asalMasalah,
            totalShare: sisaSaham / asalMasalah,
            nominalTotal: sisaNominal,
            nominalPerPerson: sisaNominal,
            alasan: 'Menerima sisa seluruh harta karena tidak ada keturunan (furu\').',
            dalil: 'HR. Bukhari & Muslim',
            color: '#b45309',
          });
        } else {
          // Tambahan sisa untuk ayah
          const existingAyah = shares.find(s => s.title.includes('Ayah'));
          if (existingAyah) {
            existingAyah.nominalTotal += sisaNominal;
            existingAyah.nominalPerPerson += sisaNominal;
            existingAyah.totalShare += (sisaSaham / asalMasalah);
            existingAyah.fractionStr += ` + Sisa \'Ashabah`;
            existingAyah.alasan += ` Mendapatkan sisa tambahan sebesar ${formatRupiah(sisaNominal)}.`;
          }
        }
      } else if (kakekStatus === 'ashabah') {
        shares.push({
          title: 'Kakek',
          count: 1,
          status: 'Ashabah',
          fractionStr: `\'Ashabah (${sisaSaham}/${asalMasalah})`,
          sharePerPerson: sisaSaham / asalMasalah,
          totalShare: sisaSaham / asalMasalah,
          nominalTotal: sisaNominal,
          nominalPerPerson: sisaNominal,
          alasan: 'Menerima sisa sebagai pengganti ayah.',
          dalil: 'Kaidah Faraidh',
          color: '#78716c',
        });
      } else if (isSaudaraAshabah) {
        // Saudara Laki-laki / Perempuan Kandung
        if (input.saudaraLakiKandung > 0) {
          const totalHeads = (input.saudaraLakiKandung * 2) + input.saudaraPerempuanKandung;
          const nominalPerHead = sisaNominal / (totalHeads || 1);
          const totalLaki = nominalPerHead * 2 * input.saudaraLakiKandung;

          shares.push({
            title: `Saudara Laki-laki Kandung (${input.saudaraLakiKandung} org)`,
            count: input.saudaraLakiKandung,
            status: 'Ashabah',
            fractionStr: `\'Ashabah bi Nafsihi`,
            sharePerPerson: (totalLaki / input.saudaraLakiKandung) / tirkah,
            totalShare: totalLaki / tirkah,
            nominalTotal: totalLaki,
            nominalPerPerson: totalLaki / input.saudaraLakiKandung,
            alasan: '\'Ashabah bi Nafsihi mengambil sisa karena pewaris dalam kondisi Kalalah.',
            dalil: 'QS. An-Nisa: 176',
            color: '#6366f1',
          });

          if (input.saudaraPerempuanKandung > 0) {
            const totalPerempuan = nominalPerHead * input.saudaraPerempuanKandung;
            shares.push({
              title: `Saudara Perempuan Kandung (${input.saudaraPerempuanKandung} org)`,
              count: input.saudaraPerempuanKandung,
              status: 'Ashabah',
              fractionStr: `\'Ashabah bil Ghair`,
              sharePerPerson: (totalPerempuan / input.saudaraPerempuanKandung) / tirkah,
              totalShare: totalPerempuan / tirkah,
              nominalTotal: totalPerempuan,
              nominalPerPerson: totalPerempuan / input.saudaraPerempuanKandung,
              alasan: '\'Ashabah bil Ghair bersama saudara laki-laki dengan rasio 2:1.',
              dalil: 'QS. An-Nisa: 176',
              color: '#818cf8',
            });
          }
        } else if (input.saudaraPerempuanKandung > 0 && hasFuruPerempuan) {
          // Ashabah Ma'al Ghair
          shares.push({
            title: `Saudara Perempuan Kandung (${input.saudaraPerempuanKandung} org)`,
            count: input.saudaraPerempuanKandung,
            status: 'Ashabah',
            fractionStr: `\'Ashabah ma\'al Ghair`,
            sharePerPerson: (sisaNominal / input.saudaraPerempuanKandung) / tirkah,
            totalShare: sisaNominal / tirkah,
            nominalTotal: sisaNominal,
            nominalPerPerson: sisaNominal / input.saudaraPerempuanKandung,
            alasan: '\'Ashabah ma\'al Ghair: Menjadi \'ashabah bersama anak/cucu perempuan.',
            dalil: 'Hadits Riwayat Bukhari: "Jadikan saudara perempuan bersama anak perempuan sebagai \'ashabah."',
            color: '#818cf8',
          });
        }
      }
    }

  } else {
    // Kasus 3: RADD (Saham Furudh < Asal Masalah & TIDAK ADA 'ASHABAH)
    tipeKasus = 'Radd';
    // Menurut hukum fiqih Jumhur & Kompilasi Hukum Islam (KHI):
    // Suami / Istri mengambil hak furudhnya lebih dulu tanpa radd.
    // Sisa harta dikembalikan (di-radd) secara proporsional kepada Ashabul Furudh nasab (Ibu, Anak Perempuan, Saudara Seibu, Nenek).
    const spouseShare = calculatedFurudh.find(f => f.raw.isSpouse);
    const nonSpouseShares = calculatedFurudh.filter(f => !f.raw.isSpouse);

    let spouseNominal = 0;
    if (spouseShare) {
      spouseNominal = (spouseShare.saham / asalMasalah) * tirkah;
      shares.push({
        title: spouseShare.raw.title,
        count: spouseShare.raw.count,
        status: 'Furudh',
        fractionStr: `${spouseShare.raw.num}/${spouseShare.raw.den}`,
        sharePerPerson: (spouseShare.saham / asalMasalah) / spouseShare.raw.count,
        totalShare: spouseShare.saham / asalMasalah,
        nominalTotal: spouseNominal,
        nominalPerPerson: spouseNominal / spouseShare.raw.count,
        alasan: `${spouseShare.raw.alasan} (Suami/Istri tidak berhak menerima Radd menurut jumhur ulama).`,
        dalil: spouseShare.raw.dalil,
        color: spouseShare.raw.color,
      });
    }

    const tirkahForRadd = tirkah - spouseNominal;
    const totalSahamRadd = nonSpouseShares.reduce((acc, f) => acc + f.saham, 0);

    penjelasanKasus = `Terjadi RADD karena jumlah saham Ashabul Furudh (${sumSahamFurudh}) kurang dari Asal Masalah (${asalMasalah}) dan tidak ada penerima \'Ashabah. Sisa harta sebesar ${formatRupiah(tirkahForRadd)} dikembalikan secara proporsional kepada ahli waris nasab.`;

    steps.push({
      title: 'Langkah 3: Penanganan Kasus RADD',
      description: penjelasanKasus,
      detail: [
        `Asal Masalah: ${asalMasalah}`,
        `Total Saham Terpakai: ${sumSahamFurudh} dari ${asalMasalah}`,
        `Sisa yang di-Radd: ${formatRupiah(tirkahForRadd)}`,
      ]
    });

    if (totalSahamRadd > 0) {
      for (const item of nonSpouseShares) {
        const nominalTotal = (item.saham / totalSahamRadd) * tirkahForRadd;
        const nominalPerPerson = nominalTotal / item.raw.count;
        shares.push({
          title: item.raw.title,
          count: item.raw.count,
          status: 'Furudh',
          fractionStr: `Furudh + Radd (${((nominalTotal / tirkah) * 100).toFixed(1)}%)`,
          sharePerPerson: (nominalTotal / tirkah) / item.raw.count,
          totalShare: nominalTotal / tirkah,
          nominalTotal,
          nominalPerPerson,
          alasan: `${item.raw.alasan} + Menerima tambahan pengembalian sisa (Radd) secara proporsional.`,
          dalil: 'QS. Al-Anfal: 75 & KHI Pasal 193',
          color: item.raw.color,
        });
      }
    } else if (spouseShare) {
      // Jika hanya ada suami/istri saja tanpa ahli waris nasab sama sekali (baitul mal / KHI)
      // Dalam hukum modern KHI Pasal 193 sisa diberikan ke suami/istri atau baitul mal
    }
  }

  // Langkah 4: Rangkuman & Pembagian Akhir
  steps.push({
    title: 'Langkah 4: Rekapitulasi & Nominal Pembagian Bersih',
    description: `Seluruh harta sebesar ${formatRupiah(tirkah)} telah terbagi habis kepada ahli waris yang berhak sesuai syariat Islam.`,
    detail: shares
      .filter(s => s.status !== 'Mahjub')
      .map(s => `${s.title}: ${formatRupiah(s.nominalTotal)} (${(s.totalShare * 100).toFixed(1)}%)`),
  });

  return {
    tirkah,
    asalMasalah: finalAsalMasalah,
    totalSaham: sumSahamFurudh,
    tipeKasus,
    penjelasanKasus,
    shares,
    steps,
  };
}
