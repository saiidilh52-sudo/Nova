import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Smile, 
  HelpCircle, 
  MessageSquare, 
  Sparkles, 
  Gamepad2, 
  Send, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  BookOpen, 
  Flame,
  Award
} from 'lucide-react';
import { apiService } from '../services/api';
import { Material } from '../types';
import { getRandomGrowthQuote, GrowthQuote } from '../data/growthMindsetQuotes';
import { Logo } from './Logo';

interface StudentReflectionFlowProps {
  onBackToHome: () => void;
  initialMaterialId?: string;
}

export const StudentReflectionFlow: React.FC<StudentReflectionFlowProps> = ({ onBackToHome, initialMaterialId }) => {
  // Step tracker: 0 = Info, 1 = Feeling, 2 = Understanding, 3 = Voice, 4 = Wish, 5 = Choice, 6 = Success
  const [step, setStep] = useState<number>(0);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(initialMaterialId || '');

  // Form State
  const [namaSiswa, setNamaSiswa] = useState<string>('');
  const [kelas, setKelas] = useState<string>('');
  const [noAbsen, setNoAbsen] = useState<string>('');

  // 1. My Feeling
  const [mood, setMood] = useState<string>('');
  const [alasanMood, setAlasanMood] = useState<string>('');

  // 2. My Understanding
  const [sudahDipahami, setSudahDipahami] = useState<string>('');
  const [belumDipahami, setBelumDipahami] = useState<string>('');
  const [tingkatPemahaman, setTingkatPemahaman] = useState<string>('');
  const [bagianMenantang, setBagianMenantang] = useState<string>('');
  const [isCustomMenantang, setIsCustomMenantang] = useState<boolean>(false);
  const [customMenantangText, setCustomMenantangText] = useState<string>('');

  // 3. My Voice
  const [kesan, setKesan] = useState<string>('');
  const [halDisukai, setHalDisukai] = useState<string>('');

  // 4. My Wish (Pilihan lebih dari satu)
  const [keinginanPembelajaran, setKeinginanPembelajaran] = useState<string[]>([]);
  const [bantuanGuruDibutuhkan, setBantuanGuruDibutuhkan] = useState<string[]>([]);
  const [harapanBerikutnya, setHarapanBerikutnya] = useState<string>('');

  // 5. My Choice & Gaya Belajar (untuk RPM)
  const [gayaBelajar, setGayaBelajar] = useState<string[]>([]);
  const [suasanaBelajar, setSuasanaBelajar] = useState<string>('');
  const [pilihanMedia, setPilihanMedia] = useState<string[]>([]);
  const [pilihanAktivitas, setPilihanAktivitas] = useState<string[]>([]);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [growthQuote, setGrowthQuote] = useState<GrowthQuote | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    apiService.getMaterials()
      .then(res => {
        setMaterials(res);
        if (res.length > 0) {
          if (initialMaterialId && res.some(m => m.id === initialMaterialId)) {
            setSelectedMaterialId(initialMaterialId);
          } else if (!selectedMaterialId) {
            setSelectedMaterialId(res[0].id);
          }
        }
      })
      .catch(err => {
        console.warn('Failed to fetch materials, using local fallback:', err);
      });
  }, [initialMaterialId]);

  const handleNext = () => {
    setValidationError(null);
    if (step === 0) {
      if (!namaSiswa.trim()) {
        setValidationError('Mohon isi nama lengkapmu terlebih dahulu.');
        return;
      }
      if (!kelas.trim()) {
        setValidationError('Mohon tuliskan kelas atau rombelmu terlebih dahulu.');
        return;
      }
      if (!noAbsen.trim()) {
        setValidationError('Mohon isi nomor absen.');
        return;
      }
    }
    if (step === 1 && !mood) {
      setValidationError('Pilih perasaanmu hari ini ya!');
      return;
    }
    if (step === 2 && !tingkatPemahaman) {
      setValidationError('Pilih tingkat pemahamanmu terlebih dahulu.');
      return;
    }
    setStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setValidationError(null);
    setStep(prev => Math.max(0, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleChoice = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(x => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSubmit = async () => {
    setValidationError(null);
    setIsSubmitting(true);
    try {
      const selectedMat = materials.find(m => m.id === selectedMaterialId);
      await apiService.saveReflection({
        namaSiswa: namaSiswa.trim(),
        kelas,
        noAbsen: noAbsen.trim(),
        mood: mood || '😊 Senang',
        alasanMood: alasanMood || 'Menyenangkan',
        sudahDipahami: sudahDipahami || 'Konsep inti materi hari ini',
        belumDipahami: belumDipahami || 'Perlu pendalaman bertahap',
        tingkatPemahaman: tingkatPemahaman || '👍 Paham',
        bagianMenantang: bagianMenantang || '🧩 Memahami istilah & konsep baru',
        kesan: kesan || 'Pembelajaran menarik dan interaktif',
        halDisukai: halDisukai || 'Diskusi dan penjelasan guru',
        keinginanPembelajaran: keinginanPembelajaran.length > 0 ? keinginanPembelajaran : ['🎮 Game Interaktif'],
        bantuanGuruDibutuhkan: bantuanGuruDibutuhkan.length > 0 ? bantuanGuruDibutuhkan : ['💡 Diberikan contoh kasus nyata dalam kehidupan sehari-hari'],
        harapanBerikutnya: harapanBerikutnya || 'Pembelajaran interaktif berikutnya',
        gayaBelajar: gayaBelajar.length > 0 ? gayaBelajar : ['👁️ Visual', '🏃 Kinestetik / Gerak'],
        suasanaBelajar: suasanaBelajar || '🤝 Kerja sama tim yang kompak dan saling menyemangati',
        pilihanMedia: pilihanMedia.length > 0 ? pilihanMedia : ['🎮 Game Edukasi', '🎬 Video Pembelajaran'],
        pilihanAktivitas: pilihanAktivitas.length > 0 ? pilihanAktivitas : ['🎮 Game Interaktif', '👥 Diskusi Kelompok'],
        materialId: selectedMaterialId || undefined,
        teacherId: selectedMat?.teacherId || undefined,
      });

      const quote = getRandomGrowthQuote();
      setGrowthQuote(quote);
      setStep(6);

      // Trigger celebration confetti
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      setValidationError('Maaf, terjadi kendala saat menyimpan data. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentMaterial = materials.find(m => m.id === selectedMaterialId);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top Banner & Progress */}
      {step < 6 && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Langkah {step + 1} dari 6</span>
            <span className="text-indigo-600 font-bold">
              {step === 0 && 'Data Siswa'}
              {step === 1 && '💭 My Feeling'}
              {step === 2 && '💡 My Understanding'}
              {step === 3 && '🗣️ My Voice'}
              {step === 4 && '🚀 My Wish'}
              {step === 5 && '🎮 My Choice'}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / 6) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Validation Error Banner */}
      {validationError && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-sm font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⚠️</span>
            <span>{validationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="p-1 rounded-lg text-amber-700 hover:bg-amber-200 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* STEP 0: DATA SISWA */}
      {step === 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 animate-fadeIn">
          <div className="text-center mb-6 flex flex-col items-center">
            <div className="mb-3">
              <Logo size="md" showTagline={true} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              👋 Halo, Siswa Hebat!
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-md mx-auto">
              Bagaimana pengalaman belajarmu hari ini? Suaramu sangat berarti untuk menentukan cara belajar kita selanjutnya.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Materi Pembelajaran Hari Ini
              </label>
              {materials.length > 0 ? (
                <select
                  value={selectedMaterialId}
                  onChange={e => setSelectedMaterialId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-800 font-medium"
                >
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.mataPelajaran} - {m.topik} ({m.kelas})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs border border-amber-200">
                  Refleksi pembelajaran umum (Materi belum diinput oleh guru).
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nama Lengkap Siswa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={namaSiswa}
                onChange={e => setNamaSiswa(e.target.value)}
                placeholder="Contoh: Muhammad Rizky Pratama"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Kelas / Rombel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kelas}
                  onChange={e => setKelas(e.target.value)}
                  placeholder="Tulis kelasmu (misal: X-1, XI MIPA 2, XII RPL)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nomor Absen <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={noAbsen}
                  onChange={e => setNoAbsen(e.target.value)}
                  placeholder="Contoh: 17"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-800"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onBackToHome}
                className="px-5 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition text-sm"
              >
                Kembali ke Beranda
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-7 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
              >
                <span>Mulai Refleksi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: MY FEELING */}
      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 animate-fadeIn">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-3 bg-pink-100 text-pink-600 rounded-xl">
              <Smile className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                💭 MY FEELING
              </h2>
              <p className="text-xs text-slate-500">Bagikan emosi dan rasamu tanpa ragu</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-base font-semibold text-slate-800 mb-3">
              Bagaimana perasaanmu setelah pembelajaran hari ini? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { emoji: '😍', label: 'Sangat Senang', color: 'hover:border-pink-400 hover:bg-pink-50' },
                { emoji: '😊', label: 'Senang', color: 'hover:border-indigo-400 hover:bg-indigo-50' },
                { emoji: '😐', label: 'Biasa Saja', color: 'hover:border-slate-400 hover:bg-slate-50' },
                { emoji: '😕', label: 'Kurang Paham', color: 'hover:border-amber-400 hover:bg-amber-50' },
                { emoji: '😞', label: 'Tidak Menyenangkan', color: 'hover:border-red-400 hover:bg-red-50' },
              ].map(item => {
                const isSelected = mood === `${item.emoji} ${item.label}`;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setMood(`${item.emoji} ${item.label}`)}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-md scale-105'
                        : `border-slate-200 bg-white ${item.color}`
                    }`}
                  >
                    <span className="text-3xl mb-1.5">{item.emoji}</span>
                    <span className="text-xs font-bold text-slate-800">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Apa yang membuat kamu merasa seperti itu?
            </label>
            <textarea
              rows={3}
              value={alasanMood}
              onChange={e => setAlasanMood(e.target.value)}
              placeholder="Ceritakan alasan perasaanmu, misalnya: materi tadi seru karena ada video, atau aku merasa bingung saat latihan soal..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-800 text-sm"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-sm transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-indigo-200 transition"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: MY UNDERSTANDING */}
      {step === 2 && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 animate-fadeIn">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-3 bg-amber-100 text-amber-600 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                💡 MY UNDERSTANDING
              </h2>
              <p className="text-xs text-slate-500">Ukur dan sampaikan sejauh mana pemahaman materimu</p>
            </div>
          </div>

          <div className="space-y-5 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                1. Apa yang sudah kamu pahami dari pembelajaran hari ini?
              </label>
              <textarea
                rows={2}
                value={sudahDipahami}
                onChange={e => setSudahDipahami(e.target.value)}
                placeholder="Tuliskan konsep atau bagian yang sudah jelas bagimu..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition text-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                2. Apa yang masih belum kamu pahami?
              </label>
              <textarea
                rows={2}
                value={belumDipahami}
                onChange={e => setBelumDipahami(e.target.value)}
                placeholder="Tuliskan rumus, istilah, urutan, atau bagian yang masih membuatmu bingung..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition text-slate-800 text-sm"
              />
            </div>

            {/* Bagian yang paling menantang */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-800">
                  3. Bagian mana yang paling menantang bagimu?
                </label>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Pilih yang paling menggambarkan kesulitanmu
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-2.5">
                Membantu bapak/ibu guru memahami tantangan spesifik pada materi PPKn maupun mata pelajaran lainnya:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { icon: '⚖️', label: 'Menganalisis norma, aturan hukum & pasal konstitusi (PPKn)' },
                  { icon: '🏛️', label: 'Membedakan hak, kewajiban & sistem kenegaraan (PPKn/IPS)' },
                  { icon: '🔍', label: 'Menganalisis studi kasus nyata & dilema moral (PPKn/Sosial)' },
                  { icon: '🧩', label: 'Memahami definisi istilah abstrak & konsep teoretis baru' },
                  { icon: '📐', label: 'Menghitung rumus, penalaran aljabar, atau angka (MTK/Eksak)' },
                  { icon: '🔬', label: 'Memahami proses ilmiah, reaksi, atau fenomena alam (IPA/Sains)' },
                  { icon: '📜', label: 'Membaca & menelaah teks bacaan panjang / literasi (Bahasa)' },
                  { icon: '📝', label: 'Mengerjakan soal analisis pemecahan masalah (HOTS)' },
                  { icon: '🗣️', label: 'Menyampaikan argumen & berdiskusi dalam kelompok' },
                  { icon: '✨', label: 'Semuanya relatif lancar, jelas & mudah dipahami' },
                ].map(opt => {
                  const val = `${opt.icon} ${opt.label}`;
                  const isSelected = !isCustomMenantang && bagianMenantang === val;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => {
                        setIsCustomMenantang(false);
                        setBagianMenantang(val);
                      }}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs transition cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-sm ring-1 ring-amber-300'
                          : 'border-slate-200 bg-white hover:border-amber-300 text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base shrink-0">{opt.icon}</span>
                        <span className="leading-snug">{opt.label}</span>
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>

              {/* Opsi Tantangan Lainnya (Tuliskan Sendiri) */}
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomMenantang(true);
                    if (customMenantangText.trim()) {
                      setBagianMenantang(`✏️ ${customMenantangText.trim()}`);
                    } else {
                      setBagianMenantang('✏️ Tantangan spesifik lainnya');
                    }
                  }}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition cursor-pointer ${
                    isCustomMenantang
                      ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-sm ring-1 ring-amber-300'
                      : 'border-slate-200 bg-white hover:border-amber-300 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">✏️</span>
                    <span>Tantangan lainnya (Tuliskan sendiri tantangan spesifikmu...)</span>
                  </span>
                  {isCustomMenantang && <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />}
                </button>

                {isCustomMenantang && (
                  <div className="mt-2 pl-2">
                    <input
                      type="text"
                      value={customMenantangText}
                      onChange={e => {
                        const val = e.target.value;
                        setCustomMenantangText(val);
                        setBagianMenantang(val.trim() ? `✏️ ${val.trim()}` : '✏️ Tantangan spesifik lainnya');
                      }}
                      placeholder="Ketik tantangan materi yang kamu rasakan di sini..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2.5">
                4. Tingkat pemahaman saya: <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: '⭐', label: 'Sangat Paham', desc: 'Bisa menjelaskan ke teman' },
                  { icon: '👍', label: 'Paham', desc: 'Mengerti konsep utama' },
                  { icon: '😐', label: 'Cukup Paham', desc: 'Masih ragu beberapa hal' },
                  { icon: '❓', label: 'Belum Paham', desc: 'Perlu bimbingan ulang' },
                ].map(item => {
                  const val = `${item.icon} ${item.label}`;
                  const isSelected = tingkatPemahaman === val;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setTingkatPemahaman(val)}
                      className={`p-3.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/80 shadow-md scale-102 font-bold'
                          : 'border-slate-200 bg-white hover:border-amber-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-sm font-bold text-slate-800">{item.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-sm transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-amber-200 transition"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: MY VOICE */}
      {step === 3 && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 animate-fadeIn">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <MessageSquare className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                🗣️ MY VOICE
              </h2>
              <p className="text-xs text-slate-500">Ruang bebas untuk menyuarakan aspirasi dan kesanmu</p>
            </div>
          </div>

          <div className="space-y-5 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                1. Apa pendapat atau kesanmu tentang pembelajaran hari ini?
              </label>
              <textarea
                rows={3}
                value={kesan}
                onChange={e => setKesan(e.target.value)}
                placeholder="Bagikan pengalamanmu, cara guru menyampaikan materi, suasana kelas, dsb..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                2. Hal apa yang paling kamu sukai dari pembelajaran hari ini?
              </label>
              <textarea
                rows={3}
                value={halDisukai}
                onChange={e => setHalDisukai(e.target.value)}
                placeholder="Contoh: waktu diskusi kelompok, waktu kuis, saat guru memberikan contoh nyata..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-sm transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-200 transition"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: MY WISH */}
      {step === 4 && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 animate-fadeIn">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                🚀 MY WISH
              </h2>
              <p className="text-xs text-slate-500">Tentukan arah pembelajaranmu di pertemuan berikutnya</p>
            </div>
          </div>

          {/* 1. Keinginan Pembelajaran (Bisa pilih lebih dari satu) */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="block text-sm font-semibold text-slate-800">
                1. Pembelajaran seperti apa yang kamu inginkan pada pertemuan berikutnya?
              </label>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                Boleh pilih lebih dari satu ✨
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Klik opsi yang kamu sukai (bebas memilih beberapa sekaligus):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {[
                { icon: '🎬', label: 'Video Pembelajaran' },
                { icon: '🎮', label: 'Game Interaktif' },
                { icon: '👥', label: 'Diskusi Kelompok' },
                { icon: '🧩', label: 'Permainan Tim' },
                { icon: '📖', label: 'Penjelasan Guru Bertahap' },
                { icon: '💻', label: 'Media Digital' },
                { icon: '📝', label: 'Latihan & Bedah Soal' },
                { icon: '🎯', label: 'Praktik / Simulasi Nyata' },
                { icon: '🧪', label: 'Proyek / Eksperimen' },
                { icon: '🏆', label: 'Kuis Cepat Berhadiah' },
              ].map(opt => {
                const fullVal = `${opt.icon} ${opt.label}`;
                const isSelected = keinginanPembelajaran.includes(fullVal);
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => toggleChoice(fullVal, keinginanPembelajaran, setKeinginanPembelajaran)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between gap-1.5 transition cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold shadow-sm ring-1 ring-purple-300'
                        : 'border-slate-200 bg-white hover:border-purple-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl shrink-0">{opt.icon}</span>
                      <span className="text-xs truncate">{opt.label}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Bentuk Bantuan Guru yang Dibutuhkan */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="block text-sm font-semibold text-slate-800">
                2. Bantuan seperti apa yang paling kamu butuhkan dari gurumu?
              </label>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                Boleh pilih lebih dari satu 💡
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Pilihanmu membantu guru menyusun pendampingan yang tepat sasaran:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { icon: '🐢', label: 'Penjelasan yang lebih pelan dan bertahap' },
                { icon: '💡', label: 'Diberikan contoh kasus nyata dalam kehidupan sehari-hari' },
                { icon: '👥', label: 'Bimbingan intensif dalam kelompok kecil' },
                { icon: '🤝', label: 'Didampingi teman sebaya (tutor sebaya)' },
                { icon: '📑', label: 'Diberikan ringkasan poin inti / rumus ringkas' },
                { icon: '🎯', label: 'Tantangan latihan bertingkat (mudah ke sulit)' },
              ].map(opt => {
                const fullVal = `${opt.icon} ${opt.label}`;
                const isSelected = bantuanGuruDibutuhkan.includes(fullVal);
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => toggleChoice(fullVal, bantuanGuruDibutuhkan, setBantuanGuruDibutuhkan)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold shadow-sm ring-1 ring-indigo-300'
                        : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl shrink-0">{opt.icon}</span>
                      <span className="text-xs font-medium leading-snug">{opt.label}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Harapan Berikutnya */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              3. Apa harapan khususmu untuk pembelajaran berikutnya?
            </label>
            <textarea
              rows={3}
              value={harapanBerikutnya}
              onChange={e => setHarapanBerikutnya(e.target.value)}
              placeholder="Contoh: Semoga ada kuis balapan mobil atau roda kuis kelompok, pembahasannya lebih santai dan ada game lagi..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-slate-800 text-sm"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-sm transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-purple-200 transition"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: MY CHOICE & GAYA BELAJAR */}
      {step === 5 && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 animate-fadeIn">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <Gamepad2 className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                🎮 MY CHOICE & GAYA BELAJAR
              </h2>
              <p className="text-xs text-slate-500">Profil belajarmu akan langsung membentuk diferensiasi di Rencana Pembelajaran Guru (RPM)</p>
            </div>
          </div>

          {/* 1. Gaya Belajar */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="block text-sm font-semibold text-slate-800">
                1. Gaya belajar apa yang paling membantumu cepat paham?
              </label>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Boleh pilih lebih dari satu
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '👁️', title: 'Visual', desc: 'Melihat gambar, video, bagan warna, dan diagram alur' },
                { icon: '👂', title: 'Auditori', desc: 'Mendengar penjelasan guru, tanya-jawab, & diskusi santai' },
                { icon: '🏃', title: 'Kinestetik / Gerak', desc: 'Praktik langsung, simulasi nyata, dan kuis game interaktif' },
                { icon: '📖', title: 'Membaca / Menulis', desc: 'Membaca teks panduan, merangkum poin inti, dan menulis catatan' },
              ].map(opt => {
                const fullVal = `${opt.icon} ${opt.title}`;
                const isSelected = gayaBelajar.includes(fullVal);
                return (
                  <button
                    key={opt.title}
                    type="button"
                    onClick={() => toggleChoice(fullVal, gayaBelajar, setGayaBelajar)}
                    className={`p-3.5 rounded-xl border text-left flex items-start justify-between gap-2 transition cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-sm ring-1 ring-emerald-300'
                        : 'border-slate-200 bg-white hover:border-emerald-300 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{opt.icon}</span>
                        <span className="text-sm font-bold text-slate-900">{opt.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Suasana Kelas PSE */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              2. Suasana kelas seperti apa yang paling membantumu fokus dan nyaman belajar?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { icon: '🧘', label: 'Tenang, hening, dan teratur tanpa banyak kegaduhan' },
                { icon: '🎵', label: 'Interaktif ceria dengan musik santai dan suasana riang' },
                { icon: '🤝', label: 'Kerja sama tim yang kompak dan saling menyemangati' },
                { icon: '🏆', label: 'Kompetisi game kuis yang seru, hidup, dan menantang' },
              ].map(opt => {
                const fullVal = `${opt.icon} ${opt.label}`;
                const isSelected = suasanaBelajar === fullVal;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSuasanaBelajar(fullVal)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold shadow-sm ring-1 ring-teal-300'
                        : 'border-slate-200 bg-white hover:border-teal-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl shrink-0">{opt.icon}</span>
                      <span className="text-xs font-medium leading-snug">{opt.label}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Pilihan Aktivitas Favorit */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="block text-sm font-semibold text-slate-800">
                3. Aktivitas yang paling kamu sukai di kelas:
              </label>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Boleh pilih lebih dari satu
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { icon: '🎬', label: '🎬 Video Edukasi' },
                { icon: '🎮', label: '🎮 Game Interaktif' },
                { icon: '👥', label: '👥 Diskusi Kelompok' },
                { icon: '🧩', label: '🧩 Permainan Kelompok' },
                { icon: '📖', label: '📖 Penjelasan Guru' },
                { icon: '💻', label: '💻 Media Digital' },
                { icon: '🎯', label: '🎯 Praktik Nyata' },
                { icon: '📝', label: '📝 Latihan & Kuis' },
              ].map(item => {
                const isSelected = pilihanAktivitas.includes(item.label);
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => toggleChoice(item.label, pilihanAktivitas, setPilihanAktivitas)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-sm'
                        : 'border-slate-200 bg-white hover:border-emerald-300'
                    }`}
                  >
                    <span className="text-xs font-semibold">{item.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 text-xs text-slate-600">
            <p className="font-semibold text-slate-800 mb-1">Ringkasan Pengirim:</p>
            <p>Siswa: <span className="font-bold text-indigo-700">{namaSiswa}</span> | Kelas: {kelas} | Absen: {noAbsen}</p>
            {currentMaterial && <p className="mt-0.5">Materi: {currentMaterial.topik}</p>}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-sm transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sedang menyimpan suaramu...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>🚀 KIRIM REFLEKSI</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: CELEBRATION & GROWTH MINDSET SCREEN */}
      {step === 6 && growthQuote && (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-12 text-center animate-fadeIn">
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-teal-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200 animate-bounce">
            <Award className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            Terima kasih sudah menyampaikan suaramu!
          </h2>
          <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">
            Refleksimu telah berhasil tersimpan dan akan menjadi dasar bagi bapak/ibu guru untuk merancang pembelajaran berikutnya yang lebih seru.
          </p>

          {/* Growth Mindset Card */}
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200/60 rounded-2xl p-6 sm:p-8 mb-8 text-left relative overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Pesan Growth Mindset Hari Ini:</span>
            </div>
            <p className="text-base sm:text-lg text-slate-800 font-semibold italic leading-relaxed">
              "{growthQuote.quote}"
            </p>
            <div className="mt-3 text-[11px] font-bold text-purple-600 uppercase tracking-widest">
              🌱 Tema: {growthQuote.theme.replace('-', ' ')}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setStep(0);
                setMood('');
                setAlasanMood('');
                setSudahDipahami('');
                setBelumDipahami('');
                setTingkatPemahaman('');
                setKesan('');
                setHalDisukai('');
                setBagianMenantang('');
                setKeinginanPembelajaran([]);
                setBantuanGuruDibutuhkan([]);
                setHarapanBerikutnya('');
                setGayaBelajar([]);
                setSuasanaBelajar('');
                setPilihanAktivitas([]);
                setPilihanMedia([]);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition text-sm"
            >
              Isi Refleksi Lagi
            </button>
            <button
              type="button"
              onClick={onBackToHome}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-200 transition text-sm"
            >
              Selesai & Ke Beranda
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
