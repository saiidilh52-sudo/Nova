export interface StudentReflection {
  id: string;
  timestamp: string;
  namaSiswa: string;
  kelas: string;
  noAbsen: string;
  mood: string;
  alasanMood: string;
  sudahDipahami: string;
  belumDipahami: string;
  tingkatPemahaman: string;
  kesan: string;
  halDisukai: string;
  // Multi-choice wish (bisa lebih dari satu opsi)
  keinginanPembelajaran: string | string[];
  harapanBerikutnya: string;
  pilihanMedia: string[];
  pilihanAktivitas: string[];
  // Pertanyaan refleksi mendalam tambahan untuk RPM
  gayaBelajar?: string[]; // Visual, Auditori, Kinestetik, Membaca/Menulis
  bantuanGuruDibutuhkan?: string[]; // Penjelasan pelan, Contoh nyata, Bimbingan intensif, dll.
  suasanaBelajar?: string; // Suasana kelas yang diinginkan (PSE)
  bagianMenantang?: string; // Istilah baru, rumus/urutan, analisis kasus, dll.
  materialId?: string;
  teacherId?: string;
}

export interface Teacher {
  id: string;
  namaGuru: string;
  email: string;
  createdAt?: string;
}

export interface Material {
  id: string;
  teacherId: string;
  mataPelajaran: string;
  kelas: string;
  topik: string;
  capaianPembelajaran: string;
  tujuanPembelajaran: string;
  materi: string;
  durasi: string;
  karakteristikPesertaDidik: string;
  catatanGuru: string;
  createdAt: string;
}

export interface GameQuestion {
  id: number;
  soal: string;
  pilihan: string[];
  kunci: string;
  pembahasan: string;
  poin: number;
  bonus?: string;
}

export interface EducationalGame {
  id: string;
  code?: string;
  teacherId: string;
  materialId?: string;
  rpmId?: string;
  namaGame: string;
  kategori: string;
  mataPelajaran: string;
  kelas: string;
  materi: string;
  jumlahPemain: string;
  durasi: string;
  tujuan: string;
  aturan: string[];
  langkah: string[];
  pertanyaan: GameQuestion[];
  sistemSkor: string;
  bonus?: string;
  caraMenentukanPemenang: string;
  createdAt: string;
}

export interface RpmIdentitas {
  satuanPendidikan: string;
  namaGuru: string;
  kelasFase: string;
  mataPelajaran: string;
  materi: string;
  alokasiWaktu: string;
}

export interface RpmKomponen1Identifikasi {
  kesiapanPesertaDidik: string;
  karakteristikMateri: string;
  dimensiProfilLulusan: string[];
}

export interface RpmKomponen2Desain {
  capaianPembelajaran: string;
  tujuanPembelajaran: string[];
  topikKontekstual: string;
  kaitanLintasDisiplin: string;
  kerangkaPembelajaranMendalam: {
    praktikPedagogis: string;
    kemitraanPembelajaran: string;
    lingkunganPembelajaran: string;
    pemanfaatanDigital: string;
  };
}

export interface RpmKomponen3Pengalaman {
  prinsip: string; // "Berkesadaran, Bermakna, dan Menggembirakan"
  kegiatanAwal: {
    apersepsi: string[];
    orientasiMasalah: string[];
    motivasi: string[];
  };
  kegiatanInti_3M: {
    memahami: string[];
    mengaplikasi: string[];
    merefleksi: string[];
  };
  kegiatanPenutup: {
    umpanBalik: string[];
    kesimpulan: string[];
    refleksiTindakLanjut: string[];
  };
}

export interface RpmKomponen4Asesmen {
  asesmenAwal_diagnostik: string;
  asesmenProses_formatif: string;
  asesmenAkhir_sumatif: string;
}

export interface RpmLampiran {
  lkpd: string;
  rubrikPenilaian: string;
  pengayaanDanRemedial: string;
  sumberBelajarDanSarana: string;
}

export interface RPMStructure {
  id: string;
  teacherId: string;
  materialId?: string;
  gameId?: string;
  judul: string;
  sekolah: string;
  mataPelajaran: string;
  kelas: string;
  alokasiWaktu: string;
  guru: string;
  // 6 Bagian Lengkap Standar RPM NOVA
  identitas: RpmIdentitas;
  komponen1_identifikasi: RpmKomponen1Identifikasi;
  komponen2_desain: RpmKomponen2Desain;
  komponen3_pengalaman: RpmKomponen3Pengalaman;
  komponen4_asesmen: RpmKomponen4Asesmen;
  lampiran: RpmLampiran;
  // Legacy sections optional for backward compatibility
  sections?: any;
  createdAt: string;
  updatedAt: string;
}

export interface NovaAnalysis {
  kondisiKelas: string;
  persentasePositif: number;
  persentaseButuhBimbingan: number;
  materiSulit: string[];
  bagianDisukai: string[];
  kebutuhanSiswa: string;
  preferensiMedia: string;
  preferensiAktivitas: string;
  alasanRekomendasi: string;
  rekomendasi: {
    strategi: string[];
    media: string[];
    aktivitas: string[];
    penguatan: string[];
    asesmen: string[];
  };
  recommendedGame?: {
    namaGame: string;
    kategori: string;
    alasan: string;
    deskripsiSingkat: string;
  };
}
