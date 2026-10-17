export interface GrowthQuote {
  quote: string;
  theme: 'proses' | 'usaha' | 'keberanian' | 'ketekunan' | 'perkembangan' | 'belajar-dari-kesalahan';
}

export const GROWTH_MINDSET_QUOTES: GrowthQuote[] = [
  {
    quote: "Belum paham bukan berarti tidak bisa. Kamu sedang dalam proses belajar menuju pemahaman yang lebih dalam.",
    theme: "proses"
  },
  {
    quote: "Kesalahan bukan akhir dari segalanya. Kesalahan adalah kesempatan berharga untuk menemukan cara yang lebih baik.",
    theme: "belajar-dari-kesalahan"
  },
  {
    quote: "Tidak harus langsung sempurna hari ini. Terus mencoba dengan tekun, dan kamu pasti akan berkembang.",
    theme: "perkembangan"
  },
  {
    quote: "Setiap usaha kecil yang kamu lakukan hari ini adalah langkah pasti menuju kemampuan yang jauh lebih besar.",
    theme: "usaha"
  },
  {
    quote: "Kalau hari ini belum berhasil, coba lagi dengan sudut pandang yang berbeda. Rasa ingin tahumu adalah kekuatanmu.",
    theme: "ketekunan"
  },
  {
    quote: "Berani mencoba hal baru dan berani bertanya adalah bagian terpenting dari keberhasilan belajar.",
    theme: "keberanian"
  },
  {
    quote: "Otak kita seperti otot; semakin sering kita latih untuk memecahkan hal sulit, semakin kuat dan cerdas ia berkembang.",
    theme: "perkembangan"
  },
  {
    quote: "Tantangan bukan dinding penghalang, melainkan tangga yang sedang kamu daki untuk naik ke tingkat pemahaman berikutnya.",
    theme: "ketekunan"
  },
  {
    quote: "Keberanian untuk mengakui bagian yang belum dipahami adalah awal dari kecerdasan yang sejati.",
    theme: "keberanian"
  },
  {
    quote: "Fokuslah pada seberapa jauh kamu melangkah hari ini dibandingkan kemarin, bukan pada kesempurnaan instan.",
    theme: "proses"
  },
  {
    quote: "Setiap ahli dulunya adalah seorang pemula yang tidak pernah berhenti mencoba ketika menghadapi kesulitan.",
    theme: "ketekunan"
  },
  {
    quote: "Suaramu dalam refleksi ini sangat berharga. Kamu sedang mengambil kendali penuh atas perjalanan belajarmu sendiri.",
    theme: "keberanian"
  },
  {
    quote: "Jatuh dan bingung adalah tanda bahwa tokomu sedang merestrukturisasi konsep baru yang lebih kokoh di dalam pikiran.",
    theme: "belajar-dari-kesalahan"
  },
  {
    quote: "Bakat hanyalah titik awal. Kerja keras, strategi belajar yang tepat, dan kemauan berlatih yang membuatmu luar biasa.",
    theme: "usaha"
  },
  {
    quote: "Jangan bandingkan prosesmu dengan orang lain. Setiap bunga mekar pada musimnya masing-masing dengan keindahannya sendiri.",
    theme: "proses"
  },
  {
    quote: "Ketika kamu merasa sulit, ingatkan dirimu: 'Ini bukan karena aku tidak mampu, tapi karena konsep ini baru bagiku.'",
    theme: "perkembangan"
  },
  {
    quote: "Kekuatan terbesar seorang pembelajar terletak pada kata 'BELUM': 'Aku BELUM paham sekarang, tapi aku PASTI akan memahaminya.'",
    theme: "perkembangan"
  },
  {
    quote: "Rasa penasaranmu jauh lebih berharga daripada rasa takut salah. Teruslah bertanya dan bereksplorasi!",
    theme: "keberanian"
  },
  {
    quote: "Ketika kamu berani mengulang soal yang sulit, kamu sedang membangun ketahanan mental yang akan berguna seumur hidup.",
    theme: "ketekunan"
  },
  {
    quote: "Terima kasih telah jujur dengan perasaan dan pemahamanmu. Kejujuran adalah langkah awal guru membantumu melompat lebih tinggi.",
    theme: "keberanian"
  },
  {
    quote: "Umpan balik dan evaluasi bukan penilaian harga dirimu, melainkan petunjuk arah jalan menuju keunggulanmu.",
    theme: "belajar-dari-kesalahan"
  },
  {
    quote: "Langkah kecil setiap hari menghasilkan perubahan besar di akhir tahun. Konsistensi mengalahkan kecepatan.",
    theme: "usaha"
  },
  {
    quote: "Setiap kali kamu memecahkan satu kebingungan, kamu telah membuka satu pintu kecerdasan baru.",
    theme: "proses"
  },
  {
    quote: "Kamu memiliki potensi yang jauh melampaui apa yang kamu bayangkan saat ini. Percayalah pada proses belajarmu!",
    theme: "perkembangan"
  }
];

export function getRandomGrowthQuote(): GrowthQuote {
  const randomIndex = Math.floor(Math.random() * GROWTH_MINDSET_QUOTES.length);
  return GROWTH_MINDSET_QUOTES[randomIndex];
}
