import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Download, 
  Printer, 
  Save, 
  Edit3, 
  Check, 
  Trash2, 
  BookOpen, 
  Gamepad2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Wand2,
  Play,
  X,
  Compass,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Zap,
  Target,
  Sliders,
  Award,
  ListChecks,
  HelpCircle
} from 'lucide-react';
import { RPMStructure, Material, EducationalGame, NovaAnalysis, StudentReflection, GameQuestion } from '../types';
import { apiService } from '../services/api';

interface RpmGeneratorProps {
  rpms: RPMStructure[];
  materials: Material[];
  games: EducationalGame[];
  reflections?: StudentReflection[];
  activeAnalysis?: NovaAnalysis | null;
  initialMaterial?: Material;
  onRefreshRPMs: () => void;
  onBack?: () => void;
  onPlayGame?: (game: EducationalGame) => void;
  onNavigateToCreateGame?: (params: any) => void;
}

export const RpmGenerator: React.FC<RpmGeneratorProps> = ({
  rpms,
  materials,
  games,
  reflections,
  activeAnalysis,
  initialMaterial,
  onRefreshRPMs,
  onBack,
  onPlayGame,
  onNavigateToCreateGame
}) => {
  const [selectedRpm, setSelectedRpm] = useState<RPMStructure | null>(rpms[0] || null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [rpmNotification, setRpmNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // AI Editing State
  const [showAiEditModal, setShowAiEditModal] = useState<boolean>(false);
  const [aiInstruction, setAiInstruction] = useState<string>('');
  const [targetSection, setTargetSection] = useState<string>('ALL');
  const [isAiEditing, setIsAiEditing] = useState<boolean>(false);

  // Generator inputs: Baseline Material & Editable Next Lesson Material
  const [baselineMode, setBaselineMode] = useState<'SELECT' | 'CUSTOM'>('SELECT');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(
    initialMaterial?.id || materials[0]?.id || ''
  );

  const selectedMaterial = materials.find(m => m.id === selectedMaterialId) || initialMaterial || materials[0];

  // Custom Baseline fields if teacher types custom baseline reference
  const [customBaselineTopic, setCustomBaselineTopic] = useState<string>(selectedMaterial?.topik || 'Norma dan Konstitusi UUD NRI Tahun 1945');
  const [customBaselineSubject, setCustomBaselineSubject] = useState<string>(selectedMaterial?.mataPelajaran || 'Pendidikan Pancasila & Kewarganegaraan (PPKn)');
  const [customBaselineKelas, setCustomBaselineKelas] = useState<string>(selectedMaterial?.kelas || 'X (Fase E)');

  // Editable fields for Next Lesson (Materi Pertemuan Berikutnya)
  const [topikBerikutnya, setTopikBerikutnya] = useState<string>(
    selectedMaterial?.topik ? `${selectedMaterial.topik} (Pertemuan Berikutnya)` : 'Penerapan Norma Hukum & Hak Kewajiban Warga Negara'
  );
  const [subTopikBerikutnya, setSubTopikBerikutnya] = useState<string>(
    'Hierarki Peraturan Perundang-undangan RI (UU No. 12/2011), Analisis Pasal UUD 1945, dan Studi Kasus Penegakan Norma di Masyarakat'
  );
  const [kesinambunganMateri, setKesinambunganMateri] = useState<string>(
    'Melanjutkan pemahaman konsep sesi lalu dengan fokus mengurai kesulitan analisis pasal dan mempraktikkan pemecahan kasus nyata.'
  );
  const [mataPelajaranBerikutnya, setMataPelajaranBerikutnya] = useState<string>(selectedMaterial?.mataPelajaran || 'Pendidikan Pancasila & Kewarganegaraan (PPKn)');
  const [kelasBerikutnya, setKelasBerikutnya] = useState<string>(selectedMaterial?.kelas || 'X (Fase E)');
  const [alokasiWaktuBerikutnya, setAlokasiWaktuBerikutnya] = useState<string>(selectedMaterial?.durasi || '2 x 45 Menit (90 Menit)');
  const [capaianBerikutnya, setCapaianBerikutnya] = useState<string>(
    selectedMaterial?.capaianPembelajaran || 'Peserta didik menganalisis norma dan perundang-undangan, mengidentifikasi pelanggaran norma, serta memprakarsai aksi ketaatan hukum berkeadilan.'
  );
  const [tujuanBerikutnya, setTujuanBerikutnya] = useState<string>(
    selectedMaterial?.tujuanPembelajaran || 'Melalui eksplorasi kasus kontekstual dan game edukasi terintegrasi, peserta didik mampu menguraikan tata urutan regulasi hukum dan memecahkan dilema norma bermasyarakat dengan nalar kritis dan gotong royong.'
  );
  const [catatanDiferensiasi, setCatatanDiferensiasi] = useState<string>('');
  const [savingMaterial, setSavingMaterial] = useState<boolean>(false);

  // Live Student Reflection Analysis Extractor (from activeAnalysis or directly from reflections prop)
  const liveInsights = (() => {
    if (activeAnalysis && activeAnalysis.materiSulit && activeAnalysis.materiSulit.length > 0) {
      return {
        materiSulit: activeAnalysis.materiSulit,
        preferensiMedia: activeAnalysis.preferensiMedia || '🎮 Game Interaktif & Quiz Battle',
        preferensiAktivitas: activeAnalysis.preferensiAktivitas || '👥 Diskusi Kelompok & Game Edukasi',
        persentaseButuhBimbingan: activeAnalysis.persentaseButuhBimbingan ?? 28,
        persentasePositif: activeAnalysis.persentasePositif ?? 84,
        kondisiKelas: activeAnalysis.kondisiKelas || 'Siswa antusias dan membutuhkan pengalaman belajar interaktif yang terarah.',
        alasan: activeAnalysis.alasanRekomendasi || 'Siswa memerlukan pembelajaran berbasis tantangan kolaboratif untuk mengurai konsep sulit.'
      };
    }
    if (reflections && reflections.length > 0) {
      const total = reflections.length;
      const diffs: string[] = [];
      const mediaCount: Record<string, number> = {};
      const actCount: Record<string, number> = {};
      let needHelp = 0;
      let positive = 0;

      reflections.forEach((r: StudentReflection) => {
        const mood = (r.mood || '').toLowerCase();
        if (mood.includes('senang') || mood.includes('happy') || mood.includes('semangat') || mood.includes('excited') || mood.includes('biasa')) {
          positive++;
        }
        if (r.tingkatPemahaman === 'Belum Paham' || r.tingkatPemahaman === 'Cukup Paham' || (r.bantuanGuruDibutuhkan && r.bantuanGuruDibutuhkan.length > 0)) {
          needHelp++;
        }
        if (r.bagianMenantang && typeof r.bagianMenantang === 'string') {
          const clean = r.bagianMenantang.replace(/^[^\w\s]+/, '').trim();
          if (clean.length > 2 && !clean.toLowerCase().includes('lancar')) {
            diffs.push(clean);
          }
        }
        (r.pilihanMedia || []).forEach((m: string) => { mediaCount[m] = (mediaCount[m] || 0) + 1; });
        (r.pilihanAktivitas || []).forEach((a: string) => { actCount[a] = (actCount[a] || 0) + 1; });
      });

      const topMedia = Object.entries(mediaCount).sort((a,b) => b[1] - a[1])[0]?.[0] || '🎮 Game Interaktif & Quiz Battle';
      const topAct = Object.entries(actCount).sort((a,b) => b[1] - a[1])[0]?.[0] || '👥 Diskusi Kelompok & Game Edukasi';
      const uniqueDiffs = Array.from(new Set(diffs)).filter(d => d.length > 2);

      return {
        materiSulit: uniqueDiffs.length > 0 ? uniqueDiffs.slice(0, 4) : [
          'Menganalisis Pasal UUD 1945 & Tata Hierarki Norma Hukum',
          'Membedakan Hak dan Kewajiban Warga Negara dalam Praktik Nyata'
        ],
        preferensiMedia: topMedia,
        preferensiAktivitas: topAct,
        persentaseButuhBimbingan: Math.round((needHelp / total) * 100) || 28,
        persentasePositif: Math.round((positive / total) * 100) || 84,
        kondisiKelas: `${Math.round((positive / total) * 100) || 84}% peserta didik bersemangat, namun ${Math.round((needHelp / total) * 100) || 28}% siswa memerlukan pendampingan bertahap.`,
        alasan: `Refleksi dari ${total} murid menunjukkan respon positif jika materi abstrak dikemas ke dalam tantangan gamifikasi tim.`
      };
    }
    return {
      materiSulit: [
        'Menganalisis Pasal UUD 1945 & Tata Hierarki Norma Hukum (PPKn)',
        'Membedakan Hak dan Kewajiban Warga Negara dalam Kasus Nyata'
      ],
      preferensiMedia: '🏎️ Game Balapan Mobil Interaktif',
      preferensiAktivitas: '⚡ Kuis Cepat Tanggap & Diskusi Tim Heterogen',
      persentaseButuhBimbingan: 32,
      persentasePositif: 85,
      kondisiKelas: 'Peserta didik menyukai pembelajaran kolaboratif namun memerlukan jembatan analogi konkret pada konsep sulit.',
      alasan: 'Gamifikasi kolaboratif menjawab kebutuhan penguatan konsep sulit dan keterlibatan aktif.'
    };
  })();

  // Integrated Game Selection Mode: 'RECOMMENDED' (sesuai refleksi murid) | 'BANK' | 'CUSTOM'
  const [gameSourceMode, setGameSourceMode] = useState<'RECOMMENDED' | 'BANK' | 'CUSTOM'>('RECOMMENDED');
  const [selectedGameId, setSelectedGameId] = useState<string>(games[0]?.id || '');
  const [customGameName, setCustomGameName] = useState<string>(() => {
    return activeAnalysis?.recommendedGame?.namaGame || `Balapan Mobil: Sirkuit Norma & Hierarki Hukum`;
  });
  const [customGameCategory, setCustomGameCategory] = useState<string>(() => {
    return activeAnalysis?.recommendedGame?.kategori || 'Balapan Mobil';
  });
  const [fokusHambatanGame, setFokusHambatanGame] = useState<string>(() => {
    return `Mengatasi hambatan siswa pada: ${liveInsights.materiSulit[0] || 'Menganalisis Pasal UUD 1945 & Tata Urutan Regulasi Hukum'}`;
  });
  const [mekanismeTutorSebaya, setMekanismeTutorSebaya] = useState<string>(
    'Pembentukan 4 kelompok heterogen (tutor sebaya) dengan sistem poin apresiatif untuk mendorong murid yang butuh bimbingan.'
  );
  const [durasiGame, setDurasiGame] = useState<string>('25 Menit');
  const [jumlahPemainGame, setJumlahPemainGame] = useState<string>('4-5 orang per tim heterogen');

  const [sekolah, setSekolah] = useState<string>('SMA Negeri Indonesia');
  const [namaGuru, setNamaGuru] = useState<string>(() => apiService.getActiveTeacher()?.namaGuru || 'Dra. Sri Rahayu, M.Pd');

  // Quick edit modal state for existing RPM
  const [showQuickEditModal, setShowQuickEditModal] = useState<boolean>(false);
  const [quickEditTopic, setQuickEditTopic] = useState<string>('');
  const [quickEditMataPelajaran, setQuickEditMataPelajaran] = useState<string>('');
  const [quickEditKelas, setQuickEditKelas] = useState<string>('');
  const [quickEditAlokasi, setQuickEditAlokasi] = useState<string>('');
  const [quickEditGameName, setQuickEditGameName] = useState<string>('');

  // React to initialMaterial changes
  useEffect(() => {
    if (initialMaterial?.id) {
      setSelectedMaterialId(initialMaterial.id);
      setCustomBaselineTopic(initialMaterial.topik);
      setCustomBaselineSubject(initialMaterial.mataPelajaran);
      setCustomBaselineKelas(initialMaterial.kelas);
    }
  }, [initialMaterial?.id]);

  // When selected baseline material changes, populate defaults for next lesson
  useEffect(() => {
    if (selectedMaterial && baselineMode === 'SELECT') {
      const nextTopic = selectedMaterial.topik 
        ? `${selectedMaterial.topik} - Lanjutan & Penegakan Kasus (Pertemuan 2)` 
        : 'Materi Lanjutan';
      setTopikBerikutnya(nextTopic);
      setMataPelajaranBerikutnya(selectedMaterial.mataPelajaran || '');
      setKelasBerikutnya(selectedMaterial.kelas || '');
      setAlokasiWaktuBerikutnya(selectedMaterial.durasi || '2 x 45 Menit (90 Menit)');
      setCapaianBerikutnya(selectedMaterial.capaianPembelajaran || '');
      setTujuanBerikutnya(
        `Melalui eksplorasi kasus kontekstual dan game edukasi terpadu, peserta didik mampu memahami, menganalisis, serta mengaplikasikan prinsip ${selectedMaterial.topik || 'materi'} secara kritis dan gotong royong.`
      );
    }
  }, [selectedMaterialId, baselineMode]);

  // When activeAnalysis or live insights change, sync recommended game and student diagnostic focus
  useEffect(() => {
    if (activeAnalysis?.recommendedGame) {
      setCustomGameName(activeAnalysis.recommendedGame.namaGame);
      setCustomGameCategory(activeAnalysis.recommendedGame.kategori);
    }
    if (liveInsights.materiSulit && liveInsights.materiSulit.length > 0) {
      setCatatanDiferensiasi(
        `Fokus penguatan kesulitan konsep siswa pada: ${liveInsights.materiSulit.join(', ')}. Diselaraskan dengan preferensi media siswa: ${liveInsights.preferensiMedia}.`
      );
      setFokusHambatanGame(`Mengatasi hambatan konsep pada: ${liveInsights.materiSulit.slice(0, 2).join(' dan ')}.`);
    }
  }, [activeAnalysis, liveInsights.materiSulit]);

  // Handle saving new next-lesson material to teacher's materials bank
  const handleSaveNewMaterialToBank = async () => {
    if (!topikBerikutnya.trim()) {
      setRpmNotification({ message: 'Tuliskan topik materi pertemuan berikutnya terlebih dahulu.', type: 'error' });
      return;
    }
    setSavingMaterial(true);
    try {
      const activeTeacher = apiService.getActiveTeacher();
      const saved = await apiService.saveMaterial({
        teacherId: activeTeacher?.id || 'teacher_demo',
        topik: topikBerikutnya.trim(),
        mataPelajaran: mataPelajaranBerikutnya.trim() || 'Pendidikan Pancasila & Kewarganegaraan (PPKn)',
        kelas: kelasBerikutnya.trim() || 'X (Fase E)',
        durasi: alokasiWaktuBerikutnya.trim() || '2 x 45 Menit (90 Menit)',
        capaianPembelajaran: capaianBerikutnya.trim() || 'Peserta didik menganalisis dan menerapkan konsep esensial materi.',
        tujuanPembelajaran: tujuanBerikutnya.trim() || 'Peserta didik memahami konsep melalui eksplorasi kontekstual dan game edukasi.',
        materi: subTopikBerikutnya.trim() || topikBerikutnya.trim(),
        karakteristikPesertaDidik: 'Aktif, menyukai tantangan gamifikasi dan diskusi kelompok interaktif.',
        catatanGuru: catatanDiferensiasi.trim() || 'Fokus pada penguatan konsep sulit dan partisipasi aktif seluruh murid.'
      });
      onRefreshRPMs();
      setRpmNotification({ message: `✅ Materi "${saved.topik}" berhasil disimpan ke Bank Materi Guru!`, type: 'success' });
    } catch (err: any) {
      setRpmNotification({ message: 'Gagal menyimpan materi: ' + (err.message || 'Coba lagi'), type: 'error' });
    } finally {
      setSavingMaterial(false);
    }
  };

  // Preset quick selections for continuous topics
  const handleApplyNextTopicPreset = (presetTopic: string, presetSub: string) => {
    setTopikBerikutnya(presetTopic);
    setSubTopikBerikutnya(presetSub);
    setTujuanBerikutnya(
      `Melalui penyelidikan kasus dan game edukasi terpadu, peserta didik mampu mengidentifikasi, menganalisis keterkaitan, dan memecahkan persoalan ${presetTopic} secara kritis.`
    );
  };

  // Preset quick selection for game tailored to student reflections
  const handleApplyGamePreset = (nama: string, kategori: string, hambatan: string, mekanisme: string) => {
    setGameSourceMode('RECOMMENDED');
    setCustomGameName(nama);
    setCustomGameCategory(kategori);
    setFokusHambatanGame(hambatan);
    setMekanismeTutorSebaya(mekanisme);
    setRpmNotification({
      message: `🎯 Game terintegrasi diselaraskan dengan: "${nama}" (${kategori}) untuk mengatasi ${hambatan}`,
      type: 'success'
    });
  };

  // Generate question items for the integrated game targeting difficult concepts
  const generateGameQuestions = (topic: string, subject: string, difficulties: string[]): GameQuestion[] => {
    const d1 = difficulties[0] || 'Hierarki Peraturan Perundang-undangan';
    const d2 = difficulties[1] || 'Keseimbangan Hak dan Kewajiban Warga Negara';
    return [
      {
        id: 1,
        soal: `Dalam konteks materi "${topic}", norma dasar tertulis tertinggi yang menjadi payung seluruh peraturan perundang-undangan di Indonesia adalah...`,
        pilihan: ['A. Ketetapan MPR', 'B. Undang-Undang Dasar NRI Tahun 1945', 'C. Peraturan Pemerintah', 'D. Peraturan Daerah'],
        kunci: 'B',
        pembahasan: 'Berdasarkan Pasal 7 ayat (1) UU No. 12 Tahun 2011, UUD NRI Tahun 1945 berkedudukan sebagai hukum dasar tertinggi di Indonesia.',
        poin: 100
      },
      {
        id: 2,
        soal: `Untuk mengurai kesulitan pada materi "${d1}", asas hukum manakah yang menegaskan bahwa aturan hukum yang lebih tinggi mengesampingkan aturan hukum yang lebih rendah jika bertentangan?`,
        pilihan: [
          'A. Lex Posterior Derogat Legi Priori',
          'B. Lex Superior Derogat Legi Inferiori',
          'C. Lex Specialis Derogat Legi Generali',
          'D. Asas Kepastian Hukum Mutlak'
        ],
        kunci: 'B',
        pembahasan: 'Asas Lex Superior Derogat Legi Inferiori menegaskan bahwa norma hukum yang berderajat lebih tinggi mengesampingkan norma hukum yang berderajat lebih rendah.',
        poin: 100
      },
      {
        id: 3,
        soal: `Apabila suatu Undang-Undang Republik Indonesia diduga bertentangan dengan Undang-Undang Dasar NRI 1945, lembaga peradilan manakah yang berwenang melakukan pengujian materil?`,
        pilihan: ['A. Mahkamah Agung (MA)', 'B. Komisi Yudisial (KY)', 'C. Mahkamah Konstitusi (MK)', 'D. Dewan Perwakilan Rakyat (DPR)'],
        kunci: 'C',
        pembahasan: 'Mahkamah Konstitusi (MK) berwenang menguji Undang-Undang terhadap Undang-Undang Dasar Negara Republik Indonesia Tahun 1945.',
        poin: 100
      },
      {
        id: 4,
        soal: `Terkait pemahaman "${d2}", contoh perwujudan keseimbangan hak dan kewajiban warga negara yang berkeadilan di lingkungan sekolah adalah...`,
        pilihan: [
          'A. Menuntut guru memberi nilai tinggi tanpa mau mengerjakan tugas',
          'B. Menyampaikan pendapat dan aspirasi secara santun sekaligus mendengarkan dan menghormati pandangan teman',
          'C. Meninggalkan ruang kelas tanpa merapikan bangku',
          'D. Memaksakan kehendak pribadi dalam keputusan diskusi tim'
        ],
        kunci: 'B',
        pembahasan: 'Keseimbangan hak dan kewajiban tercermin ketika siswa berani menggunakan hak berpendapat secara santun sembari menunaikan kewajiban menghormati hak orang lain.',
        poin: 100
      },
      {
        id: 5,
        soal: `Mengapa dalam pembelajaran materi "${topic}" kolaborasi tim heterogen (tutor sebaya) sangat penting saat memecahkan studi kasus nyata?`,
        pilihan: [
          'A. Agar pekerjaan dapat diserahkan ke satu murid saja',
          'B. Menghubungkan keberagaman sudut pandang, saling melengkapi konsep sulit, dan menumbuhkan dimensi Gotong Royong',
          'C. Supaya waktu belajar berkurang drastis',
          'D. Untuk membatasi anggota kelompok dalam bersuara'
        ],
        kunci: 'B',
        pembahasan: 'Kerja sama tim heterogen memungkinkan murid saling belajar (peer learning), memperkuat nalar kritis, dan menginternalisasi nilai gotong royong Profil Pelajar Pancasila.',
        poin: 100
      }
    ];
  };

  // Generate RPM with AI for Next Lesson
  const handleGenerateRPM = async () => {
    setRpmNotification(null);
    if (!topikBerikutnya.trim()) {
      setRpmNotification({ message: 'Tentukan topik materi pembelajaran berikutnya terlebih dahulu.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const activeTeacher = apiService.getActiveTeacher();

      // Next Material Payload (incorporates teacher's custom edits for next lesson)
      const nextMaterialPayload: Material = {
        id: selectedMaterial?.id || 'mat_next_' + Date.now(),
        teacherId: activeTeacher?.id || 'teacher_demo',
        topik: topikBerikutnya.trim(),
        mataPelajaran: mataPelajaranBerikutnya.trim() || 'Pendidikan Pancasila & Kewarganegaraan (PPKn)',
        kelas: kelasBerikutnya.trim() || 'X (Fase E)',
        durasi: alokasiWaktuBerikutnya.trim() || '2 x 45 Menit (90 Menit)',
        capaianPembelajaran: capaianBerikutnya.trim() || 'Peserta didik menganalisis dan menerapkan konsep esensial materi dalam pemecahan masalah kontekstual.',
        tujuanPembelajaran: tujuanBerikutnya.trim() || 'Peserta didik mampu memahami dan mengaplikasikan konsep melalui kegiatan kolaboratif dan game edukasi terintegrasi.',
        materi: subTopikBerikutnya.trim() || topikBerikutnya.trim(),
        karakteristikPesertaDidik: 'Aktif, menyukai tantangan gamifikasi dan diskusi kelompok interaktif.',
        catatanGuru: catatanDiferensiasi.trim() || `Fokus kesinambungan materi: ${kesinambunganMateri}. Penguatan materi sulit: ${liveInsights.materiSulit.join(', ')}.`,
        createdAt: new Date().toISOString()
      };

      // Integrated Game Payload (adapted directly to student reflection analysis)
      let targetGame: EducationalGame | undefined = undefined;
      const gameQuestions = generateGameQuestions(nextMaterialPayload.topik, nextMaterialPayload.mataPelajaran, liveInsights.materiSulit);

      if (gameSourceMode === 'RECOMMENDED') {
        const gameName = customGameName.trim() || `Balapan Mobil: Sirkuit ${nextMaterialPayload.topik}`;
        const gameCat = customGameCategory.trim() || 'Balapan Mobil';
        targetGame = {
          id: 'game_rec_' + Date.now(),
          teacherId: activeTeacher?.id || 'teacher_demo',
          namaGame: gameName,
          kategori: gameCat,
          mataPelajaran: nextMaterialPayload.mataPelajaran,
          kelas: nextMaterialPayload.kelas,
          materi: nextMaterialPayload.topik,
          jumlahPemain: jumlahPemainGame.trim() || '4-5 orang per tim heterogen',
          durasi: durasiGame.trim() || '25 Menit',
          tujuan: `Mengatasi hambatan konsep pada ${liveInsights.materiSulit.slice(0, 2).join(' dan ')} melalui gamifikasi tim serta memfasilitasi tutor sebaya sesuai suara murid`,
          aturan: [
            'Siswa berkumpul dalam kelompok heterogen berdasarkan hasil diagnostik refleksi suara siswa sebelumnya',
            'Setiap tim menganalisis studi kasus dan memvalidasi jawaban kuis bersama',
            'Sistem skor memberikan reward pada sportivitas, nalar kritis, dan gotong royong'
          ],
          langkah: [
            'Guru memproyeksikan game edukasi di layar utama kelas',
            'Kelompok mendiskusikan strategi pemecahan masalah dan verifikasi jawaban bersama',
            'Penarikan kesimpulan konsep dan apresiasi kelompok terkompak'
          ],
          pertanyaan: gameQuestions,
          sistemSkor: '100 poin per jawaban tepat + bonus kecepatan dan kerja sama tim',
          caraMenentukanPemenang: 'Kelompok dengan akumulasi poin tertinggi dan penalaran terbaik',
          createdAt: new Date().toISOString()
        };
      } else if (gameSourceMode === 'BANK') {
        targetGame = games.find(g => g.id === selectedGameId);
      } else if (gameSourceMode === 'CUSTOM') {
        targetGame = {
          id: 'game_custom_' + Date.now(),
          teacherId: activeTeacher?.id || 'teacher_demo',
          namaGame: customGameName.trim() || `Tantangan Game: ${nextMaterialPayload.topik}`,
          kategori: customGameCategory.trim() || 'Kuis Cepat Tanggap',
          mataPelajaran: nextMaterialPayload.mataPelajaran,
          kelas: nextMaterialPayload.kelas,
          materi: nextMaterialPayload.topik,
          jumlahPemain: jumlahPemainGame.trim() || '4-5 orang per tim',
          durasi: durasiGame.trim() || '25 Menit',
          tujuan: `Penguatan pemahaman konsep ${nextMaterialPayload.topik} dan pemecahan hambatan ${liveInsights.materiSulit[0] || 'materi'}`,
          aturan: ['Diskusi tim heterogen', 'Kerja sama kelompok', 'Presentasi temuan'],
          langkah: ['Penyajian kasus', 'Pengerjaan kuis game', 'Refleksi'],
          pertanyaan: gameQuestions,
          sistemSkor: 'Poin akurasi jawaban kelompok',
          caraMenentukanPemenang: 'Tim terbaik',
          createdAt: new Date().toISOString()
        };
      }

      // If we created a targetGame, save it to the database so it's a real, playable game
      if (targetGame && (gameSourceMode === 'RECOMMENDED' || gameSourceMode === 'CUSTOM')) {
        try {
          const savedGame = await apiService.saveGame(targetGame);
          targetGame = savedGame;
        } catch (e) {
          console.warn('Notice saving game to database:', e);
        }
      }

      const generated = await apiService.generateRPMWithAI({
        material: nextMaterialPayload,
        analysis: activeAnalysis || {
          kondisiKelas: liveInsights.kondisiKelas,
          persentasePositif: liveInsights.persentasePositif,
          persentaseButuhBimbingan: liveInsights.persentaseButuhBimbingan,
          materiSulit: liveInsights.materiSulit,
          bagianDisukai: ['Diskusi kelompok', 'Game edukasi interaktif'],
          kebutuhanSiswa: `Bimbingan bertahap pada: ${liveInsights.materiSulit.join(', ')}`,
          preferensiMedia: liveInsights.preferensiMedia,
          preferensiAktivitas: liveInsights.preferensiAktivitas,
          alasanRekomendasi: liveInsights.alasan,
          rekomendasi: {
            strategi: [`Scaffolding bertahap pada: ${liveInsights.materiSulit[0] || nextMaterialPayload.topik}`, 'Cooperative Learning'],
            media: [liveInsights.preferensiMedia, 'LKPD Berdiferensiasi'],
            aktivitas: [liveInsights.preferensiAktivitas, 'Refleksi Digital NOVA'],
            penguatan: ['Tutor sebaya tim heterogen'],
            asesmen: ['Asesmen formatif game edukasi', 'Observasi DPL']
          },
          recommendedGame: {
            namaGame: targetGame?.namaGame || 'Game Edukasi Terpadu',
            kategori: targetGame?.kategori || 'Balapan Mobil',
            alasan: `Diselaraskan dengan ${liveInsights.persentaseButuhBimbingan}% murid yang butuh bimbingan pada ${liveInsights.materiSulit[0] || 'konsep sulit'}.`,
            deskripsiSingkat: targetGame?.tujuan || 'Penguatan pemahaman konsep melalui kompetisi sehat tim.'
          }
        },
        game: targetGame,
        sekolah,
        namaGuru,
      });

      const newRpmData: RPMStructure = {
        ...generated,
        teacherId: activeTeacher?.id || 'teacher_demo',
        materialId: selectedMaterial?.id || 'mat_custom',
        gameId: targetGame?.id,
      };

      const saved = await apiService.saveRPM(newRpmData);
      onRefreshRPMs();
      setSelectedRpm(saved);
      setIsEditing(false);
      setRpmNotification({ 
        message: `✨ Dokumen RPM untuk materi "${nextMaterialPayload.topik}" dengan game terintegrasi "${targetGame?.namaGame || 'Game Edukasi'}" berhasil disusun secara otomatis oleh NOVA!`, 
        type: 'success' 
      });
    } catch (e: any) {
      setRpmNotification({ message: 'Gagal menyusun RPM: ' + (e.message || 'Coba lagi'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Open Quick Edit Modal for current RPM
  const handleOpenQuickEdit = () => {
    if (!selectedRpm) return;
    const idt = getIdentitas(selectedRpm);
    const linkedGame = games.find(g => g.id === selectedRpm.gameId) || games[0];
    setQuickEditTopic(idt.materi || selectedRpm.mataPelajaran || '');
    setQuickEditMataPelajaran(idt.mataPelajaran || selectedRpm.mataPelajaran || '');
    setQuickEditKelas(idt.kelasFase || selectedRpm.kelas || '');
    setQuickEditAlokasi(idt.alokasiWaktu || selectedRpm.alokasiWaktu || '');
    setQuickEditGameName(linkedGame?.namaGame || `Game Edukasi: ${idt.materi}`);
    setShowQuickEditModal(true);
  };

  // Save Quick Edit to current RPM
  const handleSaveQuickEdit = async () => {
    if (!selectedRpm) return;
    try {
      const idt = getIdentitas(selectedRpm);
      const k1 = getKomponen1(selectedRpm);
      const k2 = getKomponen2(selectedRpm);
      const k3 = getKomponen3(selectedRpm);
      const k4 = getKomponen4(selectedRpm);
      const lp = getLampiran(selectedRpm);

      const updatedRpm: RPMStructure = {
        ...selectedRpm,
        judul: `RPM - ${quickEditTopic.trim() || idt.materi}`,
        mataPelajaran: quickEditMataPelajaran.trim() || idt.mataPelajaran,
        kelas: quickEditKelas.trim() || idt.kelasFase,
        alokasiWaktu: quickEditAlokasi.trim() || idt.alokasiWaktu,
        identitas: {
          ...idt,
          materi: quickEditTopic.trim() || idt.materi,
          mataPelajaran: quickEditMataPelajaran.trim() || idt.mataPelajaran,
          kelasFase: quickEditKelas.trim() || idt.kelasFase,
          alokasiWaktu: quickEditAlokasi.trim() || idt.alokasiWaktu,
        },
        komponen1_identifikasi: k1,
        komponen2_desain: {
          ...k2,
          topikKontekstual: `Penerapan praktis prinsip ${quickEditTopic.trim() || idt.materi} dalam mengatasi isu-isu aktual di masyarakat.`
        },
        komponen3_pengalaman: k3,
        komponen4_asesmen: k4,
        lampiran: lp,
        updatedAt: new Date().toISOString()
      };

      await apiService.saveRPM(updatedRpm);
      setSelectedRpm(updatedRpm);
      setShowQuickEditModal(false);
      onRefreshRPMs();
      setRpmNotification({ message: '✅ Materi acuan dan rincian RPM berhasil diperbarui!', type: 'success' });
    } catch (e: any) {
      setRpmNotification({ message: 'Gagal memperbarui RPM: ' + (e.message || 'Coba lagi'), type: 'error' });
    }
  };

  const handleStartEdit = () => {
    if (!selectedRpm) return;
    const fullRpm = {
      ...selectedRpm,
      identitas: getIdentitas(selectedRpm),
      komponen1_identifikasi: getKomponen1(selectedRpm),
      komponen2_desain: getKomponen2(selectedRpm),
      komponen3_pengalaman: getKomponen3(selectedRpm),
      komponen4_asesmen: getKomponen4(selectedRpm),
      lampiran: getLampiran(selectedRpm)
    };
    setSelectedRpm(fullRpm);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedRpm) return;
    try {
      const fullRpmToSave: RPMStructure = {
        ...selectedRpm,
        sekolah: selectedRpm.identitas?.satuanPendidikan || selectedRpm.sekolah,
        guru: selectedRpm.identitas?.namaGuru || selectedRpm.guru,
        kelas: selectedRpm.identitas?.kelasFase || selectedRpm.kelas,
        mataPelajaran: selectedRpm.identitas?.mataPelajaran || selectedRpm.mataPelajaran,
        alokasiWaktu: selectedRpm.identitas?.alokasiWaktu || selectedRpm.alokasiWaktu,
        judul: `RPM - ${selectedRpm.identitas?.materi || selectedRpm.mataPelajaran}`,
        identitas: getIdentitas(selectedRpm),
        komponen1_identifikasi: getKomponen1(selectedRpm),
        komponen2_desain: getKomponen2(selectedRpm),
        komponen3_pengalaman: getKomponen3(selectedRpm),
        komponen4_asesmen: getKomponen4(selectedRpm),
        lampiran: getLampiran(selectedRpm),
        updatedAt: new Date().toISOString()
      };
      await apiService.saveRPM(fullRpmToSave);
      setSelectedRpm(fullRpmToSave);
      setIsEditing(false);
      onRefreshRPMs();
      setRpmNotification({ message: '✅ Seluruh perubahan Dokumen RPM berhasil disimpan!', type: 'success' });
    } catch (e: any) {
      setRpmNotification({ message: 'Gagal menyimpan perubahan RPM: ' + (e?.message || 'Coba lagi'), type: 'error' });
    }
  };

  const handleApplyAiEdit = async (customInstruction?: string) => {
    if (!selectedRpm) return;
    const promptText = (customInstruction || aiInstruction).trim();
    if (!promptText) {
      setRpmNotification({ message: 'Tuliskan instruksi revisi yang kamu inginkan untuk AI.', type: 'error' });
      return;
    }

    setIsAiEditing(true);
    setRpmNotification(null);
    try {
      const updatedRpm = await apiService.editRpmWithAI({
        currentRpm: selectedRpm,
        instruction: promptText,
        targetSection,
      });

      const saved = await apiService.saveRPM(updatedRpm);
      setSelectedRpm(saved);
      onRefreshRPMs();
      setShowAiEditModal(false);
      setAiInstruction('');
      setRpmNotification({ message: '✨ Dokumen RPM berhasil direvisi dan disempurnakan oleh AI NOVA!', type: 'success' });
    } catch (err: any) {
      setRpmNotification({ message: 'Gagal merevisi RPM: ' + (err.message || 'Coba lagi'), type: 'error' });
    } finally {
      setIsAiEditing(false);
    }
  };

  const handleDeleteRpm = async (id: string) => {
    await apiService.deleteRPM(id);
    onRefreshRPMs();
    setSelectedRpm(null);
    setRpmNotification({ message: 'Dokumen RPM telah dihapus.', type: 'success' });
  };

  // Helpers to resolve unified 6 components (with exhaustive depth & DPL 1-8)
  const defaultDplList = [
    'DPL 1: Keimanan & Ketaqwaan kepada Tuhan YME serta Berakhlak Mulia - Mengembangkan integritas, kejujuran akademik, etika berkomunikasi santun, dan mengawali pembelajaran dengan doa serta rasa syukur.',
    'DPL 2: Kebinekaan Global - Menghargai keberagaman latar belakang kelompok, terbuka terhadap perspektif baru, dan adaptif terhadap konteks sosial budaya nasional maupun global.',
    'DPL 3: Gotong Royong / Kolaborasi - Berpartisipasi aktif dalam pembagian peran tim, saling mendukung saat menghadapi tantangan konsep sulit, dan membangun konsensus kelompok secara sinergis.',
    'DPL 4: Kemandirian - Mengembangkan regulasi diri dalam menyelesaikan tugas, memiliki inisiatif eksplorasi mandiri, serta bertanggung jawab atas proses dan hasil belajar pribadi.',
    'DPL 5: Bernalar Kritis - Mengidentifikasi masalah kontekstual, memproses dan memverifikasi data informasi, menganalisis sebab-akibat materi pembelajaran, serta mengambil keputusan logis berbasis bukti.',
    'DPL 6: Kreativitas - Menghasilkan alternatif solusi orisinal dalam pemecahan masalah, mengemas temuan kelompok secara inovatif, dan mengeksplorasi strategi cerdas dalam game edukasi.',
    'DPL 7: Komunikasi & Kepemimpinan - Menyampaikan gagasan kelompok secara jelas, runtut, dan persuasif, menjadi pendengar aktif yang empatik, serta mengarahkan kelompok menuju tujuan bersama.',
    'DPL 8: Kesadaran Lingkungan & Tanggung Jawab Sosial - Menghubungkan pemahaman materi pembelajaran dengan kepedulian terhadap tatanan masyarakat, etika sosial, serta keberlanjutan lingkungan.'
  ];

  const getIdentitas = (rpm: RPMStructure) => rpm.identitas || {
    satuanPendidikan: rpm.sekolah || rpm.sections?.A_identitas?.sekolah || 'SMA Negeri Indonesia',
    namaGuru: rpm.guru || 'Guru Pengampu',
    kelasFase: rpm.kelas || rpm.sections?.A_identitas?.kelasFase || 'X (Fase E)',
    mataPelajaran: rpm.mataPelajaran || rpm.sections?.A_identitas?.mataPelajaran || 'Mata Pelajaran',
    materi: rpm.sections?.A_identitas?.materi || rpm.judul,
    alokasiWaktu: rpm.alokasiWaktu || rpm.sections?.A_identitas?.alokasiWaktu || '2 x 45 Menit (90 Menit)'
  };

  const getKomponen1 = (rpm: RPMStructure) => {
    const k1 = rpm.komponen1_identifikasi || {
      kesiapanPesertaDidik: rpm.sections?.B_identifikasiPesertaDidik || rpm.sections?.C_analisisKebutuhanBelajar || 'Berdasarkan data suara siswa NOVA, sebagian besar murid antusias namun memerlukan bimbingan bertahap (scaffolding) pada materi yang sulit.',
      karakteristikMateri: `Materi bersifat konseptual dan aplikatif yang menuntut kemampuan penalaran kritis dan pemecahan masalah kontekstual.`,
      dimensiProfilLulusan: defaultDplList
    };
    if (!k1.dimensiProfilLulusan || k1.dimensiProfilLulusan.length < 8) {
      k1.dimensiProfilLulusan = defaultDplList;
    }
    return k1;
  };

  const getKomponen2 = (rpm: RPMStructure) => rpm.komponen2_desain || {
    capaianPembelajaran: `Peserta didik mampu memahami, menganalisis, mengevaluasi, serta mengaplikasikan kompetensi inti materi dalam konteks kehidupan nyata dengan nalar kritis dan tanggung jawab.`,
    tujuanPembelajaran: rpm.sections?.D_tujuanPembelajaran || [
      '1. Melalui eksplorasi materi dan tayangan visual, peserta didik mampu mengidentifikasi dan menjelaskan konsep esensial materi secara tepat dan terstruktur.',
      '2. Melalui diskusi kelompok dan pengerjaan LKPD kontekstual, peserta didik mampu menganalisis permasalahan riil serta merumuskan alternatif solusi pemecahan masalah secara kritis.',
      '3. Melalui permainan edukatif terpadu, peserta didik mampu mengaplikasikan pemahaman konsep untuk menyelesaikan tantangan kuis berbasis tim dengan sportivitas tinggi.',
      '4. Melalui sesi refleksi mendalam dan umpan balik antarteman, peserta didik mampu mengaitkan nilai materi dengan pengalaman hidup sehari-hari serta merencanakan perbaikan diri.'
    ],
    topikKontekstual: rpm.sections?.G_materiPembelajaran || 'Penerapan konsep materi pada situasi riil di lingkungan sekitar',
    kaitanLintasDisiplin: 'Keterhubungan dengan penguatan literasi membaca analitis, penalaran numerasi data, sosiologi masyarakat, serta etika teknologi informasi',
    kerangkaPembelajaranMendalam: {
      praktikPedagogis: rpm.sections?.H_modelPembelajaran || 'Model Problem-Based Learning (PBL) dipadukan dengan Game-Based Learning (GBL) serta Scaffolding Berdiferensiasi',
      kemitraanPembelajaran: 'Kolaborasi dinamis antarpeserta didik dalam tim heterogen, fasilitasi pendampingan guru sebagai coach, dan pemantauan refleksi bersama orang tua',
      lingkunganPembelajaran: rpm.sections?.N_pembelajaranSosialEmosional || 'Iklim kelas yang aman secara emosional (psychological safety), inklusif, suportif, berorientasi pada growth mindset, dan bebas dari rasa cemas salah',
      pemanfaatanDigital: (rpm.sections?.J_mediaPembelajaran || ['Aplikasi Suara Siswa Digital NOVA', 'Game Edukasi Interaktif Layar Kelas', 'Proyektor LCD']).join(', ')
    }
  };

  const getKomponen3 = (rpm: RPMStructure) => rpm.komponen3_pengalaman || {
    prinsip: 'Berkesadaran, Bermakna, dan Menggembirakan',
    kegiatanAwal: {
      apersepsi: rpm.sections?.L_langkahPembelajaran?.pendahuluan?.slice(0, 1) || [
        'Langkah 1: Pembiasaan berkesadaran (mindful opening), salam hangat, doa bersama, dan pengecekan kehadiran serta kenyamanan fisik ruang kelas.',
        'Langkah 2: Guru memproyeksikan rangkuman suara refleksi NOVA sesi sebelumnya di layar proyektor, memberikan apresiasi atas kejujuran suara siswa, dan menegaskan bahwa kebutuhan belajar mereka diakomodasi hari ini.',
        'Langkah 3: Penggalian pengetahuan awal melalui pertanyaan pemantik kontekstual yang mengaitkan konsep prasyarat dengan materi hari ini.'
      ],
      orientasiMasalah: rpm.sections?.L_langkahPembelajaran?.pendahuluan?.slice(1, 2) || [
        'Langkah 4: Guru menyajikan tayangan stimulus wacana kasus nyata yang menarik dan problematis terkait penerapan materi.',
        'Langkah 5: Murid secara kritis mengidentifikasi tantangan utama dan merumuskan fokus persoalan yang akan diinvestigasi bersama.'
      ],
      motivasi: rpm.sections?.L_langkahPembelajaran?.pendahuluan?.slice(2) || [
        'Langkah 6: Guru menyampaikan tujuan pembelajaran, kriteria keberhasilan kolaborasi, dan manfaat praktis materi bagi kehidupan masa depan murid.',
        'Langkah 7: Guru memperkenalkan alur permainan game edukasi terpadu, sistem reward tim yang suportif, dan aturan main yang menggembirakan.'
      ]
    },
    kegiatanInti_3M: {
      memahami: rpm.sections?.L_langkahPembelajaran?.kegiatanInti?.slice(0, 1) || [
        'Langkah 8: Murid menyimak pemodelan konsep inti (guided modeling) melalui bagan visual interaktif yang membedah konsep materi.',
        'Langkah 9: Guru memberikan penjelasan bertahap (scaffolding) pada bagian-bagian yang sebelumnya dilaporkan sulit oleh siswa pada refleksi NOVA.',
        'Langkah 10: Sesi tanya jawab dialektis untuk menguji pemahaman awal dan meluruskan miskonsepsi.',
        'Langkah 11: Cek pemahaman kilat (quick check) untuk memastikan kesiapan seluruh murid melangkah ke aktivitas kelompok.'
      ],
      mengaplikasi: rpm.sections?.L_langkahPembelajaran?.kegiatanInti?.slice(1, 2) || [
        'Langkah 12: Murid bergabung ke dalam kelompok kerja heterogen (4-5 orang) yang dibentuk berdasarkan pemetaan kesiapan belajar NOVA.',
        'Langkah 13: Pembagian Lembar Kerja Peserta Didik (LKPD) terstruktur yang memuat studi kasus pemecahan masalah kontekstual.',
        'Langkah 14: Pelaksanaan game edukasi di mana tim secara kolaboratif mendiskusikan strategi, memecahkan butir tantangan, dan beradu skor positif.',
        'Langkah 15: Diferensiasi proses: guru berkeliling memberikan pendampingan intensif bagi kelompok yang butuh bimbingan dan arahan eksplorasi bagi kelompok mahir.',
        'Langkah 16: Setiap tim merumuskan sintesis jawaban dan solusi terpadu pada lembar kerja kelompok masing-masing.'
      ],
      merefleksi: rpm.sections?.L_langkahPembelajaran?.kegiatanInti?.slice(2) || [
        'Langkah 17: Perwakilan tim mempresentasikan hasil temuan solusi kasus dan strategi kerja sama mereka di depan kelas.',
        'Langkah 18: Sesi umpan balik antarteman (peer feedback) apresiatif dengan panduan rubrik konstruktif.',
        'Langkah 19: Penarikan makna personal: murid menghubungkan nilai-nilai materi dengan sikap dan tindakan nyata mereka sehari-hari.'
      ]
    },
    kegiatanPenutup: {
      umpanBalik: rpm.sections?.L_langkahPembelajaran?.penutup?.slice(0, 1) || [
        'Langkah 20: Guru memberikan umpan balik konstruktif menyeluruh terhadap dinamika diskusi, kekompakan tim, dan ketepatan pemahaman konsep murid.'
      ],
      kesimpulan: rpm.sections?.L_langkahPembelajaran?.penutup?.slice(1, 2) || [
        'Langkah 21: Murid bersama guru menyimpulkan butir-butir esensial pembelajaran secara komprehensif.'
      ],
      refleksiTindakLanjut: rpm.sections?.L_langkahPembelajaran?.penutup?.slice(2) || [
        'Langkah 22: Murid mengakses tautan formulir refleksi 5 dimensi NOVA di gawai masing-masing untuk menuangkan perasaan, pemahaman, dan kebutuhan belajar berikutnya.',
        'Langkah 23: Guru mengumumkan apresiasi tim terbaik, menyampaikan topik tantangan pertemuan mendatang, dan menutup kelas dengan doa bersama.'
      ]
    }
  };

  const getKomponen4 = (rpm: RPMStructure) => rpm.komponen4_asesmen || {
    asesmenAwal_diagnostik: `• Jenis Asesmen: Diagnostik Non-Kognitif & Diagnostik Kognitif Awal\n• Tujuan: Memetakan kesiapan sosio-emosional, gaya belajar, dan pemahaman awal prasyarat murid sebelum pembelajaran dimulai.\n• Bentuk Instrumen: Formulir Refleksi Digital Awal NOVA (Cek Mood & Pemahaman Prasyarat) serta 3 Pertanyaan Pemantik Diagnostik Lisan.\n• Tindak Lanjut: Pengelompokan heterogen untuk memastikan setiap tim memiliki tutor sebaya pendamping.`,
    asesmenProses_formatif: `• Jenis Asesmen: Asesmen Formatif (Assessment for and as Learning)\n• Tujuan: Memantau keterlibatan aktif, penalaran kritis, dan perkembangan kolaborasi murid selama proses pembelajaran berlangsung.\n• Bentuk Instrumen: Lembar Observasi Keterampilan Kolaboratif, Lembar Kinerja Penyelesaian LKPD, serta Skor Partisipasi Game Edukasi.\n• Catatan Anekdotal Guru: Dokumentasi respon dan scaffolding yang diberikan kepada murid yang membutuhkan bimbingan bertahap.`,
    asesmenAkhir_sumatif: `• Jenis Asesmen: Asesmen Sumatif (Assessment of Learning)\n• Tujuan: Mengukur ketercapaian Tujuan Pembelajaran (TP) peserta didik pada akhir unit bahasan.\n• Bentuk Instrumen: Tes Tertulis Berbasis Kasus Kontekstual (Pilihan Ganda Kompleks & Soal Uraian HOTS) serta Lembar Portofolio Solusi LKPD.\n• Kriteria Ketercapaian Tujuan Pembelajaran (KKTP): Interval nilai 0-69 (Perlu Remedial Penuh), 70-84 (Tuntas Cukup), 85-100 (Tuntas Mahir & Pengayaan).`
  };

  const getLampiran = (rpm: RPMStructure) => rpm.lampiran || {
    lkpd: `LEMBAR KERJA PESERTA DIDIK (LKPD) KOLABORATIF
Mata Pelajaran: ${rpm.mataPelajaran} | Kelas/Fase: ${rpm.kelas}
Materi Pokok: ${rpm.judul}
Nama Kelompok: ____________________
Anggota Tim: 1. ____________ 2. ____________ 3. ____________ 4. ____________ 5. ____________

A. PETUNJUK PENGERJAAN:
1. Bacalah wacana stimulus kasus kontekstual di bawah ini secara saksama bersama tim Anda.
2. Diskusikan pertanyaan-pertanyaan eksplorasi dengan mendengarkan pendapat setiap anggota kelompok.
3. Manfaatkan petunjuk dari hasil permainan game edukasi untuk memperkuat argumentasi tim.
4. Tuliskan hasil analisis dan solusi pemecahan masalah pada tabel kerja yang tersedia.

B. STIMULUS WACANA KASUS NYATA:
"Di sebuah lingkungan masyarakat, penerapan prinsip materi pembelajaran sering kali menghadapi tantangan nyata. Sebagian warga merasa aturan tersebut membatasi ruang gerak, sementara pihak lain berpendapat bahwa keteraturan dan keadilan hanya bisa tercipta jika prinsip tersebut ditegakkan secara disiplin. Terjadi perdebatan yang menyebabkan beberapa program bersama terhambat."

C. TUGAS & PERTANYAAN EKSPLORASI:
1. Identifikasilah pokok permasalahan yang terjadi dalam wacana kasus di atas! Apa akar penyebab persoalan tersebut menurut kelompok Anda?
2. Hubungkan konsep esensial materi yang telah kalian pelajari hari ini untuk menganalisis mengapa ketidaksepahaman tersebut dapat terjadi!
3. Rumuskan 3 rekomendasi solusi konkret dan berkeadilan yang dapat menyelesaikan permasalahan tersebut secara damai dan berkelanjutan!
4. Bagaimanakah kelompok Anda akan mengomunikasikan solusi tersebut kepada pihak-pihak yang berbeda pendapat agar tercipta kesadaran bersama?

D. TABEL ANALISIS & KESIMPULAN KELOMPOK:
[Kolom 1: Aspek Masalah] -> [Kolom 2: Analisis Konsep] -> [Kolom 3: Solusi Konkret Tim] -> [Kolom 4: Target Dampak Positif]`,

    rubrikPenilaian: `RUBRIK PENILAIAN KOMPREHENSIF & KRITERIA KETERCAPAIAN (KKTP)

1. TABEL RUBRIK OBSERVASI SIKAP (PROFIL LULUSAN DPL):
• Gotong Royong / Kolaborasi:
  - Skor 4 (Sangat Mahir): Sangat aktif berkolaborasi, membagi peran adil, membimbing teman yang kesulitan, dan menyelesaikan tugas tepat waktu.
  - Skor 3 (Mahir): Aktif berkolaborasi dalam kelompok dan berkontribusi positif dalam diskusi penyelesaian tugas.
  - Skor 2 (Berkembang): Cukup berpartisipasi namun masih pasif dalam beberapa bagian diskusi kelompok.
  - Skor 1 (Perlu Bimbingan): Pasif, tidak berkontribusi dalam kelompok, dan memerlukan dorongan intensif guru.

• Bernalar Kritis:
  - Skor 4 (Sangat Mahir): Mampu menganalisis masalah secara mendalam, mengajukan argumen logis berbasis data, dan mengevaluasi solusi alternatif.
  - Skor 3 (Mahir): Mampu menganalisis masalah dengan argumen logis dan memberikan solusi relevan.
  - Skor 2 (Berkembang): Menyampaikan argumen sederhana namun belum didukung data atau analisis mendalam.
  - Skor 1 (Perlu Bimbingan): Kesulitan mengidentifikasi masalah dan belum mampu merumuskan argumen logis.

2. TABEL RUBRIK KINERJA DISKUSI, GAME EDUKASI & LKPD:
• Ketepatan Konsep Materi:
  - Skor 4: Penguasaan konsep 90-100%, jawaban LKPD dan game sangat akurat, elaborasi gagasan sangat komprehensif.
  - Skor 3: Penguasaan konsep 75-89%, jawaban akurat dengan sedikit kekeliruan minor.
  - Skor 2: Penguasaan konsep 60-74%, terdapat beberapa miskonsepsi yang memerlukan pembimbingan guru.
  - Skor 1: Penguasaan konsep <60%, miskonsepsi dominan, memerlukan pendampingan bertahap penuh.

3. PEDOMAN KONVERSI NILAI AKHIR:
Nilai Akhir = (Total Skor Perolehan / Total Skor Maksimal) x 100
- Interval 85 - 100: Kategori Mahir (Tuntas & Diberikan Program Pengayaan)
- Interval 70 - 84: Kategori Cakap (Tuntas Capaian Pembelajaran)
- Interval < 70: Kategori Perlu Bimbingan (Belum Tuntas & Diberikan Program Remedial)`,

    pengayaanDanRemedial: `PROGRAM PENGAYAAN DAN REMEDIAL TERSTRUKTUR

A. PROGRAM REMEDIAL (BAGI PESERTA DIDIK NILAI < 70):
1. Sasaran: Peserta didik yang belum mencapai Kriteria Ketercapaian Tujuan Pembelajaran (KKTP).
2. Bentuk Pelaksanaan:
   a. Pembelajaran Ulang Terfokus: Guru memberikan modul ringkasan infografis dan bimbingan konsep dasar selama 20 menit di luar jam reguler.
   b. Tutor Sebaya: Memasangkan murid yang remedial dengan teman satu kelompok berkategori 'Sangat Mahir' untuk mendiskusikan kembali soal-soal game kuis.
   c. Pemberian Tugas Rekonseptualisasi: Murid mengerjakan 3 butir soal pemahaman bertahap dengan bimbingan bertingkat (scaffolding).
   d. Tes Remedial: Melaksanakan penilaian ulang formatif hingga mencapai batas minimal KKTP (Nilai maksimal remedial: 75).

B. PROGRAM PENGAYAAN (BAGI PESERTA DIDIK NILAI >= 85):
1. Sasaran: Peserta didik yang telah melampaui capaian pembelajaran lebih cepat dengan nilai istimewa.
2. Bentuk Pelaksanaan:
   a. Tantangan Proyek Investigasi Nyata: Murid secara mandiri/berpasangan melakukan riset mini mengenai implementasi topik terkini di lingkungan daerah mereka.
   b. Pembuatan Konten Edukasi Digital: Murid merancang poster digital, infografis, atau kartu tantangan baru untuk ditambahkan ke dalam bank game edukasi kelas.
   c. Peran Asisten Fasilitator: Diberikan kesempatan menjadi mentor sebaya yang melatih keterampilan kepemimpinan dan empati sosial.`,

    sumberBelajarDanSarana: `SUMBER BELAJAR, BUKU, SERTA SARANA DAN PRASARANA

A. SUMBER BELAJAR & REFERENSI UTAMA:
1. Buku Teks Utama Peserta Didik, Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia.
2. Buku Panduan Guru Kurikulum Merdeka, Kemendikbudristek RI.
3. Modul Ajar Pembelajaran Mendalam NOVA: "Suaramu Menjadi Arah Pembelajaran".
4. Artikel Jurnal Ilmiah dan Berita Kontekstual Daring terpercaya mengenai isu terkait.

B. MEDIA DIGITAL & PERANGKAT INTERAKTIF:
1. Aplikasi Digital NOVA (Portal Suara Siswa & Analisis AI Decision Support).
2. Naskah & Platform Game Edukasi Interaktif Layar Kelas.
3. Tayangan Slide Multimedia & Video Studi Kasus Problem-Based Learning.

C. SARANA DAN PRASARANA FISIK KELAS:
1. Proyektor LCD dan Layar Presentasi Kelas.
2. Komputer / Laptop Guru untuk mengoperasikan game edukasi dan rekapitulasi real-time suara siswa.
3. Gawai / Ponsel Siswa (atau lembar kartu respon fisik bagi sekolah dengan keterbatasan gawai).
4. Lembar Kerja Peserta Didik (LKPD) cetak dan Spidol Warna untuk visualisasi peta pikiran tim.
5. Ruang Kelas dengan formasi meja fleksibel (U-shape / format kelompok kolaboratif).`
  };

  // Export DOCX (6 Komponen Lengkap - Multi-Page "Berlembar-Lembar" Formal Style)
  const handleDownloadDocx = () => {
    if (!selectedRpm) return;
    const dateStr = new Date().toISOString().split('T')[0];
    const cleanSubject = selectedRpm.mataPelajaran.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanClass = selectedRpm.kelas.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `RPM_NOVA_LENGKAP_${cleanSubject}_${cleanClass}_${dateStr}.doc`;

    const idt = getIdentitas(selectedRpm);
    const k1 = getKomponen1(selectedRpm);
    const k2 = getKomponen2(selectedRpm);
    const k3 = getKomponen3(selectedRpm);
    const k4 = getKomponen4(selectedRpm);
    const lp = getLampiran(selectedRpm);

    const formatParagraphs = (text: string) => {
      return text
        .split('\n')
        .map(p => p.trim())
        .filter(Boolean)
        .map(p => `<p style="margin-bottom: 4px; text-align: justify;">${p}</p>`)
        .join('');
    };

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${selectedRpm.judul}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            size: A4 portrait;
            margin: 2.0cm 2.0cm 2.0cm 2.0cm;
            mso-page-orientation: portrait;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #111111;
          }
          .page-break {
            page-break-before: always;
            mso-special-character: line-break;
            clear: both;
          }
          .kop-surat {
            text-align: center;
            border-bottom: 3px double #000000;
            padding-bottom: 8px;
            margin-bottom: 14px;
          }
          .kop-surat h1 {
            font-size: 13pt;
            font-weight: bold;
            margin: 0;
            text-transform: uppercase;
          }
          .kop-surat h2 {
            font-size: 12pt;
            font-weight: bold;
            margin: 2px 0;
            text-transform: uppercase;
          }
          .kop-surat p {
            font-size: 9pt;
            margin: 0;
            font-style: italic;
          }
          .doc-title {
            text-align: center;
            font-size: 13pt;
            font-weight: bold;
            margin-top: 10px;
            margin-bottom: 3px;
            text-transform: uppercase;
          }
          .doc-sub {
            text-align: center;
            font-size: 10pt;
            font-weight: bold;
            margin-bottom: 14px;
            color: #333333;
          }
          .chapter-title {
            font-size: 11pt;
            font-weight: bold;
            background-color: #e2e8f0;
            padding: 5px 8px;
            border-left: 5px solid #1e3a8a;
            margin-top: 14px;
            margin-bottom: 6px;
            text-transform: uppercase;
          }
          .sub-chapter {
            font-size: 10.5pt;
            font-weight: bold;
            margin-top: 8px;
            margin-bottom: 3px;
            color: #1e293b;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
            margin-bottom: 10px;
            font-size: 10pt;
          }
          th {
            background-color: #f1f5f9;
            font-weight: bold;
            border: 1px solid #000000;
            padding: 5px 7px;
            text-align: left;
          }
          td {
            border: 1px solid #000000;
            padding: 4px 7px;
            vertical-align: top;
          }
          .table-clean td {
            border: none;
            padding: 2px 4px;
          }
          ul, ol {
            margin-top: 2px;
            margin-bottom: 5px;
            padding-left: 20px;
          }
          li {
            margin-bottom: 3px;
            text-align: justify;
          }
          .box-note {
            border: 1px solid #94a3b8;
            padding: 8px 10px;
            background-color: #f8fafc;
            margin-bottom: 8px;
          }
        </style>
      </head>
      <body>
        <!-- KOP RESMI LEMBAGA -->
        <div class="kop-surat">
          <h1>PEMERINTAH DAERAH / DINAS PENDIDIKAN</h1>
          <h2>${idt.satuanPendidikan.toUpperCase()}</h2>
          <p>Alamat Sekolah • Terakreditasi • Sistem Penjaminan Mutu Pendidikan Nasional</p>
        </div>

        <div class="doc-title">RENCANA PEMBELAJARAN MENDALAM (RPM)</div>
        <div class="doc-sub">BERBASIS REFLEKSI SUARA SISWA (NOVA) & GAMIFIKASI EDUKASI TERPADU</div>

        <!-- 1. BAGIAN IDENTITAS -->
        <div class="chapter-title">1. BAGIAN IDENTITAS (INFORMASI UMUM)</div>
        <table class="table-clean" style="width: 100%; margin-bottom: 8px;">
          <tr>
            <td width="28%"><strong>Satuan Pendidikan</strong></td>
            <td width="3%">:</td>
            <td>${idt.satuanPendidikan}</td>
          </tr>
          <tr>
            <td><strong>Guru Penyusun</strong></td>
            <td>:</td>
            <td>${idt.namaGuru}</td>
          </tr>
          <tr>
            <td><strong>Kelas / Fase</strong></td>
            <td>:</td>
            <td>${idt.kelasFase}</td>
          </tr>
          <tr>
            <td><strong>Mata Pelajaran</strong></td>
            <td>:</td>
            <td>${idt.mataPelajaran}</td>
          </tr>
          <tr>
            <td><strong>Materi / Topik Pokok</strong></td>
            <td>:</td>
            <td><strong>${idt.materi}</strong></td>
          </tr>
          <tr>
            <td><strong>Alokasi Waktu</strong></td>
            <td>:</td>
            <td>${idt.alokasiWaktu}</td>
          </tr>
          <tr>
            <td><strong>Moda Pembelajaran</strong></td>
            <td>:</td>
            <td>Tatap Muka Interaktif (Game-Based & Student-Voice Centered Learning)</td>
          </tr>
        </table>

        <!-- 2. KOMPONEN 1: IDENTIFIKASI -->
        <div class="chapter-title">2. KOMPONEN 1: IDENTIFIKASI (KONDISI AWAL PEMBELAJARAN)</div>
        <div class="sub-chapter">A. Kesiapan Peserta Didik (Hasil Asesmen Diagnostik Suara Siswa NOVA):</div>
        <div class="box-note">
          ${formatParagraphs(k1.kesiapanPesertaDidik)}
        </div>

        <div class="sub-chapter">B. Karakteristik Materi Pelajaran:</div>
        <div class="box-note">
          ${formatParagraphs(k1.karakteristikMateri)}
        </div>

        <div class="sub-chapter">C. Dimensi Profil Lulusan (DPL 1 s/d DPL 8):</div>
        <table>
          <thead>
            <tr>
              <th width="12%">No / Kode</th>
              <th width="28%">Dimensi Profil Lulusan</th>
              <th>Indikator Capaian Perilaku Terukur</th>
            </tr>
          </thead>
          <tbody>
            ${k1.dimensiProfilLulusan.map((d, idx) => {
              const parts = d.split(' - ');
              const title = parts[0] || d;
              const desc = parts[1] || 'Mengembangkan kompetensi perilaku secara berkesadaran dan bertanggung jawab.';
              return `
                <tr>
                  <td style="text-align: center; font-weight: bold;">DPL ${idx + 1}</td>
                  <td><strong>${title.replace(/^DPL\s*\d+:\s*/, '')}</strong></td>
                  <td>${desc}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="page-break"></div>

        <!-- 3. KOMPONEN 2: DESAIN PEMBELAJARAN -->
        <div class="chapter-title">3. KOMPONEN 2: DESAIN PEMBELAJARAN (KERANGKA KOMPETENSI)</div>
        <div class="sub-chapter">A. Capaian Pembelajaran (CP) Elemen & Fase:</div>
        <p style="text-align: justify; margin-bottom: 6px;"><em>${k2.capaianPembelajaran}</em></p>

        <div class="sub-chapter">B. Tujuan Pembelajaran (TP) Terukur (Format ABCD):</div>
        <ol>
          ${k2.tujuanPembelajaran.map(t => `<li>${t}</li>`).join('')}
        </ol>

        <div class="sub-chapter">C. Kontekstualitas & Kaitan Lintas Disiplin:</div>
        <table>
          <tr>
            <td width="30%"><strong>Topik Kontekstual Nyata</strong></td>
            <td>${k2.topikKontekstual}</td>
          </tr>
          <tr>
            <td><strong>Kaitan Lintas Disiplin Ilmu</strong></td>
            <td>${k2.kaitanLintasDisiplin}</td>
          </tr>
        </table>

        <div class="sub-chapter">D. 4 Kerangka Pembelajaran Mendalam (Deep Learning Framework):</div>
        <table>
          <thead>
            <tr>
              <th width="28%">Kerangka Dimensi</th>
              <th>Deskripsi Strategi Operasional di Kelas</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>1. Praktik Pedagogis</strong></td>
              <td>${k2.kerangkaPembelajaranMendalam.praktikPedagogis}</td>
            </tr>
            <tr>
              <td><strong>2. Kemitraan Pembelajaran</strong></td>
              <td>${k2.kerangkaPembelajaranMendalam.kemitraanPembelajaran}</td>
            </tr>
            <tr>
              <td><strong>3. Lingkungan Pembelajaran</strong></td>
              <td>${k2.kerangkaPembelajaranMendalam.lingkunganPembelajaran}</td>
            </tr>
            <tr>
              <td><strong>4. Pemanfaatan Digital</strong></td>
              <td>${k2.kerangkaPembelajaranMendalam.pemanfaatanDigital}</td>
            </tr>
          </tbody>
        </table>

        <div class="page-break"></div>

        <!-- 4. KOMPONEN 3: PENGALAMAN BELAJAR -->
        <div class="chapter-title">4. KOMPONEN 3: PENGALAMAN BELAJAR (LANGKAH-LANGKAH TERPERINCI)</div>
        <p><strong>Prinsip Inti Pembelajaran:</strong> <em>${k3.prinsip}</em></p>

        <div class="sub-chapter">A. Kegiatan Awal (10 - 15 Menit)</div>
        <table>
          <thead>
            <tr>
              <th width="24%">Tahapan / Alokasi</th>
              <th>Aktivitas Guru dan Peserta Didik</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Apersepsi Suara Siswa & Orientasi Awal</strong><br/><small>(5 Menit)</small></td>
              <td>
                <ul>
                  ${k3.kegiatanAwal.apersepsi.map(a => `<li>${a}</li>`).join('')}
                </ul>
              </td>
            </tr>
            <tr>
              <td><strong>Orientasi Masalah Bermakna</strong><br/><small>(5 Menit)</small></td>
              <td>
                <ul>
                  ${k3.kegiatanAwal.orientasiMasalah.map(o => `<li>${o}</li>`).join('')}
                </ul>
              </td>
            </tr>
            <tr>
              <td><strong>Pemberian Motivasi & Alur Game</strong><br/><small>(5 Menit)</small></td>
              <td>
                <ul>
                  ${k3.kegiatanAwal.motivasi.map(m => `<li>${m}</li>`).join('')}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="sub-chapter">B. Kegiatan Inti (Berpusat pada 3M: Memahami - Mengaplikasi - Merefleksi) (50 - 60 Menit)</div>
        <table>
          <thead>
            <tr>
              <th width="24%">Fokus 3M / Sintaks</th>
              <th>Langkah Eksplorasi, Kolaborasi, dan Gamifikasi Terpadu</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>1. MEMAHAMI</strong><br/><small>Eksplorasi Konsep & Analisis Informasi (15 Menit)</small></td>
              <td>
                <ul>
                  ${k3.kegiatanInti_3M.memahami.map(m => `<li>${m}</li>`).join('')}
                </ul>
              </td>
            </tr>
            <tr>
              <td><strong>2. MENGAPLIKASI</strong><br/><small>Proyek Tim, LKPD, & Integrasi Game Edukasi (25 Menit)</small></td>
              <td>
                <ul>
                  ${k3.kegiatanInti_3M.mengaplikasi.map(a => `<li>${a}</li>`).join('')}
                </ul>
              </td>
            </tr>
            <tr>
              <td><strong>3. MEREFLEKSI</strong><br/><small>Pemaknaan Mendalam & Koneksi Diri (15 Menit)</small></td>
              <td>
                <ul>
                  ${k3.kegiatanInti_3M.merefleksi.map(r => `<li>${r}</li>`).join('')}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="sub-chapter">C. Kegiatan Penutup & Refleksi Suara Siswa NOVA (15 Menit)</div>
        <table>
          <thead>
            <tr>
              <th width="24%">Tahapan Penutup</th>
              <th>Uraian Tindakan Penguatan dan Refleksi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Umpan Balik Konstruktif</strong></td>
              <td>
                <ul>
                  ${k3.kegiatanPenutup.umpanBalik.map(u => `<li>${u}</li>`).join('')}
                </ul>
              </td>
            </tr>
            <tr>
              <td><strong>Menyimpulkan Bersama</strong></td>
              <td>
                <ul>
                  ${k3.kegiatanPenutup.kesimpulan.map(k => `<li>${k}</li>`).join('')}
                </ul>
              </td>
            </tr>
            <tr>
              <td><strong>Refleksi Digital NOVA & Progres</strong></td>
              <td>
                <ul>
                  ${k3.kegiatanPenutup.refleksiTindakLanjut.map(r => `<li>${r}</li>`).join('')}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="page-break"></div>

        <!-- 5. KOMPONEN 4: ASESMEN PEMBELAJARAN -->
        <div class="chapter-title">5. KOMPONEN 4: ASESMEN PEMBELAJARAN (ASSESSMENT AS, FOR, & OF LEARNING)</div>
        <table>
          <thead>
            <tr>
              <th width="25%">Bentuk & Jenis Asesmen</th>
              <th>Deskripsi Komprehensif, Instrumen, dan Rubrik Pelaksanaan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>1. Asesmen Awal (Diagnostik)</strong><br/><small>Assessment for Learning</small></td>
              <td>${formatParagraphs(k4.asesmenAwal_diagnostik)}</td>
            </tr>
            <tr>
              <td><strong>2. Asesmen Proses (Formatif)</strong><br/><small>Assessment as & for Learning</small></td>
              <td>${formatParagraphs(k4.asesmenProses_formatif)}</td>
            </tr>
            <tr>
              <td><strong>3. Asesmen Akhir (Sumatif)</strong><br/><small>Assessment of Learning</small></td>
              <td>${formatParagraphs(k4.asesmenAkhir_sumatif)}</td>
            </tr>
          </tbody>
        </table>

        <div class="page-break"></div>

        <!-- 6. LAMPIRAN 1: LKPD -->
        <div class="chapter-title">6. LAMPIRAN 1: LEMBAR KERJA PESERTA DIDIK (LKPD) KOLABORATIF</div>
        <div class="box-note" style="background-color: #ffffff; border: 2px solid #000000; padding: 12px;">
          ${formatParagraphs(lp.lkpd)}
        </div>

        <div class="page-break"></div>

        <!-- 7. LAMPIRAN 2: RUBRIK PENILAIAN -->
        <div class="chapter-title">7. LAMPIRAN 2: RUBRIK PENILAIAN KOMPREHENSIF & KKTP</div>
        <div class="box-note" style="background-color: #ffffff; border: 1px solid #475569; padding: 12px;">
          ${formatParagraphs(lp.rubrikPenilaian)}
        </div>

        <div class="page-break"></div>

        <!-- 8. LAMPIRAN 3 & 4: PROGRAM REMEDIAL/PENGAYAAN & SUMBER BELAJAR -->
        <div class="chapter-title">8. LAMPIRAN 3: PROGRAM PENGAYAAN DAN REMEDIAL TERSTRUKTUR</div>
        <div class="box-note" style="background-color: #ffffff; border: 1px solid #475569; padding: 12px;">
          ${formatParagraphs(lp.pengayaanDanRemedial)}
        </div>

        <div class="chapter-title" style="margin-top: 14px;">9. LAMPIRAN 4: SUMBER BELAJAR, BUKU, SERTA SARANA PRASARANA</div>
        <div class="box-note" style="background-color: #ffffff; border: 1px solid #475569; padding: 12px;">
          ${formatParagraphs(lp.sumberBelajarDanSarana)}
        </div>

        <br/><br/>
        <!-- LEMBAR PENGESAHAN DOKUMEN RESMI -->
        <table class="table-clean" style="width: 100%; margin-top: 24px;">
          <tr>
            <td width="50%" style="text-align: center;">
              Mengetahui,<br/>
              <strong>Kepala Satuan Pendidikan</strong><br/><br/><br/><br/><br/>
              ( ___________________________________ )<br/>
              NIP. ....................................................
            </td>
            <td width="50%" style="text-align: center;">
              Ditetapkan di: .......................................<br/>
              Pada Tanggal: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/><br/>
              <strong>Guru Mata Pelajaran Penyusun</strong><br/><br/><br/><br/>
              <strong>${idt.namaGuru}</strong><br/>
              NIP. ....................................................
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export PDF / Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Notification Banner */}
      {rpmNotification && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border flex items-center justify-between shadow-sm animate-fadeIn ${
            rpmNotification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          <span>{rpmNotification.message}</span>
          <button
            type="button"
            onClick={() => setRpmNotification(null)}
            className="p-1 hover:bg-black/5 rounded-lg text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Generator Control Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer shrink-0"
                title="Kembali ke halaman sebelumnya"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
            )}
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-600" />
                <span>Penyusunan Rencana Pembelajaran Mendalam (RPM)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Rancang RPM pertemuan mendatang berbasis analisis refleksi murid sebelumnya. Sesuaikan materi acuan dan pilih game edukasi terintegrasi yang selaras dengan suara siswa.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateRPM}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white px-7 py-3.5 rounded-2xl text-xs font-black shadow-lg shadow-indigo-200 hover:scale-102 active:scale-98 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>📋 NOVA sedang menyusun RPM berdasarkan kebutuhan siswa...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>📋 BUAT RPM DENGAN NOVA</span>
              </>
            )}
          </button>
        </div>

        {/* Subtitle & Workflow Guidance */}
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-indigo-950">
          <div className="flex items-start gap-2.5">
            <span className="p-1.5 bg-indigo-600 text-white rounded-lg shrink-0 mt-0.5">
              <Compass className="w-4 h-4" />
            </span>
            <div>
              <p className="font-bold text-indigo-900">
                Alur Perencanaan Pembelajaran Berikutnya:
              </p>
              <p className="text-indigo-800 text-[11px] mt-0.5">
                1. Pilih materi acuan refleksi → 2. Edit topik & rincian materi pertemuan berikutnya → 3. Pilih game terintegrasi yang selaras suara siswa → 4. Susun RPM 6 Komponen Utuh.
              </p>
            </div>
          </div>
          {activeAnalysis ? (
            <div className="flex items-center gap-1.5 bg-white/90 border border-indigo-300 rounded-xl px-3 py-1.5 shrink-0 text-[11px] font-semibold text-indigo-900 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Insight Refleksi Siswa Aktif Terhubung ({activeAnalysis.persentaseButuhBimbingan}% butuh bimbingan)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-white/90 border border-slate-200 rounded-xl px-3 py-1.5 shrink-0 text-[11px] font-medium text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Mode Perencanaan RPM Fleksibel</span>
            </div>
          )}
        </div>

        {/* SECTION 1: MATERI ACUAN & KUSTOMISASI MATERI PERTEMUAN BERIKUTNYA */}
        <div className="p-6 rounded-3xl border-2 border-indigo-100 bg-slate-50/70 space-y-5 text-xs shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                <BookOpen className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  1. Acuan Materi & Perencanaan Pembelajaran Berikutnya
                </h3>
                <p className="text-[11px] text-slate-500">
                  Guru dapat mengedit materi acuan dan merancang topik pertemuan berikutnya secara fleksibel
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full self-start sm:self-auto flex items-center gap-1">
              <span>✏️ Acuan Materi Dapat Diedit Bebas</span>
            </span>
          </div>

          {/* Sub-Card A: Basis Acuan Materi (Refleksi Lalu) */}
          <div className="p-4 bg-white rounded-2xl border border-indigo-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                <span>📌 Acuan Materi Sesi Sebelumnya (Basis Refleksi Murid):</span>
              </span>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setBaselineMode('SELECT')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    baselineMode === 'SELECT'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pilih dari Bank Materi
                </button>
                <button
                  type="button"
                  onClick={() => setBaselineMode('CUSTOM')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    baselineMode === 'CUSTOM'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ✏️ Ketik Acuan Kustom
                </button>
              </div>
            </div>

            {baselineMode === 'SELECT' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div className="sm:col-span-2">
                  <select
                    value={selectedMaterialId}
                    onChange={e => setSelectedMaterialId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-indigo-400"
                  >
                    {materials.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.topik} — ({m.mataPelajaran}) • {m.kelas}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-700">Materi Terpilih: </span>
                  {selectedMaterial?.topik || 'Norma dan Konstitusi'}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Topik Acuan Sesi Lalu:</label>
                  <input
                    type="text"
                    value={customBaselineTopic}
                    onChange={e => {
                      setCustomBaselineTopic(e.target.value);
                      if (!topikBerikutnya || topikBerikutnya.includes('Pertemuan Berikutnya')) {
                        setTopikBerikutnya(`${e.target.value} (Pertemuan 2 / Lanjutan)`);
                      }
                    }}
                    placeholder="Contoh: Norma dan Konstitusi UUD NRI 1945"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mata Pelajaran Acuan:</label>
                  <input
                    type="text"
                    value={customBaselineSubject}
                    onChange={e => setCustomBaselineSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sub-Card B: TARGET MATERI PERTEMUAN BERIKUTNYA (Yang Dirancang dalam RPM ini) */}
          <div className="p-5 bg-white rounded-2xl border-2 border-indigo-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <span className="font-black text-indigo-950 text-xs sm:text-sm uppercase tracking-wide">
                  🎯 Target Materi Pertemuan Berikutnya (Yang Dirancang dalam RPM Ini):
                </span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Menindaklanjuti Refleksi Murid
              </span>
            </div>

            {/* Topik Materi Berikutnya */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <span>Topik Pembelajaran Pertemuan Mendatang:</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-indigo-600 font-semibold">Dapat diedit bebas oleh guru</span>
              </div>
              <input
                type="text"
                value={topikBerikutnya}
                onChange={e => setTopikBerikutnya(e.target.value)}
                placeholder="Contoh: Penerapan dan Penegakan Norma Hukum Positif di Masyarakat (Pertemuan 2)"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-indigo-300 bg-white font-black text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 shadow-xs"
              />

              {/* Quick Preset Continuous Topic Chips */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mr-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Saran Topik Kesinambungan:
                </span>
                <button
                  type="button"
                  onClick={() => handleApplyNextTopicPreset(
                    'Tata Hierarki Peraturan Perundang-undangan RI (UU No. 12 Tahun 2011)',
                    'Asas Lex Superior, Pasal 7 ayat 1, Analisis Hierarki TAP MPR dan Perpu, serta Uji Materiil di MK & MA'
                  )}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-semibold text-[10px] border border-indigo-200 transition cursor-pointer"
                >
                  📜 Hierarki Regulasi Hukum (UU 12/2011)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyNextTopicPreset(
                    'Penerapan & Penegakan Norma Hukum Positif di Lingkungan Masyarakat',
                    'Dilema Penegakan Hukum, Sanksi Norma Hukum vs Sosial, Studi Kasus Pelanggaran Perda, dan Solusi Restoratif'
                  )}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-semibold text-[10px] border border-indigo-200 transition cursor-pointer"
                >
                  ⚖️ Penegakan Norma di Masyarakat
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyNextTopicPreset(
                    'Harmonisasi Hak dan Kewajiban Warga Negara dalam UUD NRI 1945',
                    'Pasal 27, 28, dan 30 UUD 1945, Studi Kasus Keadilan Sosial, Hak Bersuara, dan Tanggung Jawab Warga Negara'
                  )}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-semibold text-[10px] border border-indigo-200 transition cursor-pointer"
                >
                  🏛️ Hak & Kewajiban Warga Negara
                </button>
              </div>
            </div>

            {/* Sub-Topik & Rincian Pokok Bahasan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Sub-Topik / Rincian Pokok Bahasan Spesifik:
                </label>
                <textarea
                  rows={2}
                  value={subTopikBerikutnya}
                  onChange={e => setSubTopikBerikutnya(e.target.value)}
                  placeholder="Rincian pasal, konsep kunci, atau kasus kontekstual yang akan dipelajari..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Hubungan Kesinambungan dari Sesi Lalu (Tindak Lanjut):
                </label>
                <textarea
                  rows={2}
                  value={kesinambunganMateri}
                  onChange={e => setKesinambunganMateri(e.target.value)}
                  placeholder="Bagaimana materi ini melanjutkan dan menuntaskan kesulitan konsep murid sebelumnya..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>

            {/* Meta bar: Mata Pelajaran, Kelas, Alokasi Waktu */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran:</label>
                <input
                  type="text"
                  value={mataPelajaranBerikutnya}
                  onChange={e => setMataPelajaranBerikutnya(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kelas / Fase:</label>
                <input
                  type="text"
                  value={kelasBerikutnya}
                  onChange={e => setKelasBerikutnya(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alokasi Waktu:</label>
                <input
                  type="text"
                  value={alokasiWaktuBerikutnya}
                  onChange={e => setAlokasiWaktuBerikutnya(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium"
                />
              </div>
            </div>

            {/* CP, TP, & Catatan Penguatan Diferensiasi (Bebas Diedit Guru) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800">
                    Capaian Pembelajaran (CP) Elemen Pertemuan Berikutnya:
                  </label>
                  <button
                    type="button"
                    onClick={() => setCapaianBerikutnya(
                      `Peserta didik mampu menganalisis, mengevaluasi, serta mengaplikasikan prinsip ${topikBerikutnya} dalam pemecahan kasus nyata di masyarakat dengan berkesadaran nalar kritis dan gotong royong.`
                    )}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                  >
                    ✨ Rumuskan CP Otomatis
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={capaianBerikutnya}
                  onChange={e => setCapaianBerikutnya(e.target.value)}
                  placeholder="Rumusan capaian kurikulum merdeka untuk pertemuan ini..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800">
                    Tujuan Pembelajaran (TP) Spesifik Pertemuan Berikutnya (Format Terukur):
                  </label>
                  <button
                    type="button"
                    onClick={() => setTujuanBerikutnya(
                      `1. Melalui telaah wacana dan tayangan visual, peserta didik mampu menguraikan konsep ${topikBerikutnya} secara tepat.\n2. Melalui game edukasi terintegrasi dan diskusi LKPD kelompok heterogen, peserta didik mampu memecahkan studi kasus kontekstual dengan nalar kritis.\n3. Melalui sesi refleksi 5 dimensi NOVA, peserta didik mampu mengaitkan pemaknaan materi dengan perilaku sehari-hari.`
                    )}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                  >
                    ✨ Rumuskan TP Terstruktur (ABCD)
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={tujuanBerikutnya}
                  onChange={e => setTujuanBerikutnya(e.target.value)}
                  placeholder="Rumusan tujuan pembelajaran spesifik untuk pertemuan mendatang..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-indigo-900 mb-1">
                  Catatan Penguatan Konsep Sulit Murid (Tersinkronisasi dari Suara Refleksi Siswa):
                </label>
                <textarea
                  rows={2}
                  value={catatanDiferensiasi}
                  onChange={e => setCatatanDiferensiasi(e.target.value)}
                  placeholder="Fokus penguatan materi sulit dari refleksi siswa sesi sebelumnya..."
                  className="w-full p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50 text-xs text-indigo-950 font-medium"
                />
              </div>

              {/* Action Button: Save this new material to Materials Bank */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSaveNewMaterialToBank}
                  disabled={savingMaterial}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs"
                  title="Simpan materi pertemuan berikutnya ini ke Bank Materi agar dapat digunakan kembali"
                >
                  <Save className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{savingMaterial ? 'Menyimpan Materi...' : '💾 Simpan Materi Baru Ini ke Bank Materi Guru'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: GAME TERINTEGRASI (DISESUAIKAN DENGAN HASIL ANALISIS REFLEKSI MURID) */}
        <div className="p-6 rounded-3xl border-2 border-purple-200 bg-purple-50/40 space-y-5 text-xs shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-purple-600 text-white rounded-xl shadow-xs">
                <Gamepad2 className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  2. Game Terintegrasi (Disesuaikan dengan Hasil Analisis Refleksi Murid)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Game ini otomatis diinjeksi ke Komponen 3M (Mengaplikasi), Asesmen Formatif, Rubrik & Lembar Kerja Siswa (LKPD)
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-purple-800 bg-purple-100 px-3 py-1 rounded-full self-start sm:self-auto flex items-center gap-1">
              <span>🎯 Menjawab Kesulitan Belajar Siswa</span>
            </span>
          </div>

          {/* LIVE REFLECTION DIAGNOSTIC SUMMARY BANNER */}
          <div className="p-4 bg-white rounded-2xl border border-purple-200 space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-purple-950 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>📊 Hasil Analisis Suara & Refleksi Murid Sesi Sebelumnya:</span>
              </span>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                {liveInsights.persentaseButuhBimbingan}% Murid Membutuhkan Scaffolding
              </span>
            </div>

            {/* Badges of difficult topics from reflections */}
            <div>
              <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                🚨 Materi yang Dilaporkan Paling Menantang oleh Murid:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {liveInsights.materiSulit.map((diff, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                  >
                    <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>{diff}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Student preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-[11px]">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                <strong className="text-purple-900 block mb-0.5">🎮 Media Pilihan Terbanyak Murid:</strong>
                <span>{liveInsights.preferensiMedia}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                <strong className="text-purple-900 block mb-0.5">👥 Aktivitas yang Diinginkan Murid:</strong>
                <span>{liveInsights.preferensiAktivitas}</span>
              </div>
            </div>

            {liveInsights.alasan && (
              <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-xl text-[11px] text-purple-900 leading-relaxed">
                <strong>💡 Alasan Pedagogis Penyelarasan Game:</strong> {liveInsights.alasan}
              </div>
            )}
          </div>

          {/* 4 SMART GAME PRESET CARDS ADAPTED TO REFLECTION */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 text-xs">
                Pilih Model Game Cerdas yang Disesuaikan dengan Kebutuhan Refleksi:
              </span>
              <span className="text-[10px] text-purple-700 font-semibold">Klik salah satu untuk menerapkan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Preset 1 */}
              <button
                type="button"
                onClick={() => handleApplyGamePreset(
                  `Balapan Mobil: Sirkuit ${topikBerikutnya || 'Norma & Konstitusi'}`,
                  'Balapan Mobil',
                  `Mengatasi kesulitan pada: ${liveInsights.materiSulit[0] || 'Menganalisis Pasal UUD & Hierarki Norma'}`,
                  '4 Tim Heterogen (Garuda, Elang, Banteng, Harimau) dengan tutor sebaya saat kuis pit stop'
                )}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  customGameCategory === 'Balapan Mobil'
                    ? 'border-purple-600 bg-white ring-2 ring-purple-400 shadow-sm'
                    : 'border-slate-200 bg-white/80 hover:border-purple-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1 text-purple-950 font-bold text-xs">
                    <span className="text-base">🏎️</span>
                    <span>Balapan Mobil Interaktif</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    Lomba adu cepat skor tim. Jawaban tepat memacu mobil tim menuju garis finish.
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md inline-block self-start">
                  Gaya: Visual & Kinestetik
                </div>
              </button>

              {/* Preset 2 */}
              <button
                type="button"
                onClick={() => handleApplyGamePreset(
                  `Kuis Cepat Tanggap: Master ${topikBerikutnya || 'Hukum & Keadilan'}`,
                  'Kuis Cepat Tanggap',
                  `Mengurai kesulitan konsep pada: ${liveInsights.materiSulit.slice(0, 2).join(' dan ')}`,
                  'Diskusi kilat 30 detik dalam tim heterogen sebelum mengirimkan perwakilan jawaban'
                )}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  customGameCategory === 'Kuis Cepat Tanggap'
                    ? 'border-purple-600 bg-white ring-2 ring-purple-400 shadow-sm'
                    : 'border-slate-200 bg-white/80 hover:border-purple-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1 text-purple-950 font-bold text-xs">
                    <span className="text-base">⚡</span>
                    <span>Kuis Cepat Tanggap</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    Tantangan adu akurasi dan kecepatan berpikir kritis antartim dalam suasana seru.
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md inline-block self-start">
                  Fokus: Tutor Sebaya
                </div>
              </button>

              {/* Preset 3 */}
              <button
                type="button"
                onClick={() => handleApplyGamePreset(
                  `Teka-Teki Silang & Labirin: ${topikBerikutnya || 'Konsep Esensial'}`,
                  'Tebak Kata & Peta Konsep',
                  `Memperkuat pemahaman definisi, pasal, dan struktur urutan regulasi yang sebelumnya sulit`,
                  'Tim bekerja berpasangan untuk melengkapi kata kunci dan peta konsep berjenjang'
                )}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  customGameCategory === 'Tebak Kata & Peta Konsep'
                    ? 'border-purple-600 bg-white ring-2 ring-purple-400 shadow-sm'
                    : 'border-slate-200 bg-white/80 hover:border-purple-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1 text-purple-950 font-bold text-xs">
                    <span className="text-base">🧩</span>
                    <span>Teka-Teki & Peta Konsep</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    Menyusun potongan konsep dan pasal hukum yang membingungkan menjadi utuh.
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md inline-block self-start">
                  Fokus: Definisi & Struktur
                </div>
              </button>

              {/* Preset 4 */}
              <button
                type="button"
                onClick={() => handleApplyGamePreset(
                  `Detektif Kasus: Penegakan Hukum ${topikBerikutnya || 'di Masyarakat'}`,
                  'Petualangan RPG Edukatif',
                  `Penerapan studi kasus nyata dan verifikasi keseimbangan hak-kewajiban warga negara`,
                  'Investigasi tim 4 orang merumuskan berkas putusan kasus berkeadilan'
                )}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  customGameCategory === 'Petualangan RPG Edukatif'
                    ? 'border-purple-600 bg-white ring-2 ring-purple-400 shadow-sm'
                    : 'border-slate-200 bg-white/80 hover:border-purple-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1 text-purple-950 font-bold text-xs">
                    <span className="text-base">🛡️</span>
                    <span>Detektif Kasus Nyata</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    Menganalisis dilema pelanggaran norma dan merumuskan solusi restoratif berkeadilan.
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md inline-block self-start">
                  Fokus: Analisis Kasus
                </div>
              </button>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setGameSourceMode('RECOMMENDED')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                gameSourceMode === 'RECOMMENDED'
                  ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold ring-2 ring-purple-300 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-purple-300 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">🎯</span>
                <span className="font-bold text-xs">Rekomendasi Refleksi NOVA</span>
              </div>
              <p className="text-[11px] font-normal text-slate-500">
                Otomatis diselaraskan dengan kesulitan & media pilihan murid
              </p>
            </button>

            <button
              type="button"
              onClick={() => setGameSourceMode('BANK')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                gameSourceMode === 'BANK'
                  ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold ring-2 ring-purple-300 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-purple-300 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">🎮</span>
                <span className="font-bold text-xs">Pilih dari Bank Game ({games.length})</span>
              </div>
              <p className="text-[11px] font-normal text-slate-500">
                Gunakan game yang sudah Anda buat sebelumnya
              </p>
            </button>

            <button
              type="button"
              onClick={() => setGameSourceMode('CUSTOM')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                gameSourceMode === 'CUSTOM'
                  ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold ring-2 ring-purple-300 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-purple-300 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">✏️</span>
                <span className="font-bold text-xs">Kustomisasi Game Sendiri</span>
              </div>
              <p className="text-[11px] font-normal text-slate-500">
                Tentukan nama dan kategori game khusus untuk RPM ini
              </p>
            </button>
          </div>

          {/* Active Game Configuration Details */}
          {(gameSourceMode === 'RECOMMENDED' || gameSourceMode === 'CUSTOM') && (
            <div className="p-4 bg-white rounded-2xl border border-purple-200 space-y-3 shadow-2xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Game Terintegrasi:</label>
                  <input
                    type="text"
                    value={customGameName}
                    onChange={e => setCustomGameName(e.target.value)}
                    placeholder="Contoh: Balapan Mobil: Sirkuit Norma & Hierarki Hukum"
                    className="w-full px-3 py-2 rounded-xl border border-purple-300 bg-white font-black text-purple-950 text-xs focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori / Model Game:</label>
                  <select
                    value={customGameCategory}
                    onChange={e => setCustomGameCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 text-xs"
                  >
                    <option value="Balapan Mobil">🏎️ Balapan Mobil (Race Challenge)</option>
                    <option value="Kuis Cepat Tanggap">⚡ Kuis Cepat Tanggap (Quick Battle)</option>
                    <option value="Tebak Kata & Peta Konsep">🧩 Tebak Kata & Peta Konsep</option>
                    <option value="Labirin Pengetahuan">🌀 Labirin Pengetahuan (Maze Runner)</option>
                    <option value="Petualangan RPG Edukatif">🛡️ Petualangan RPG Edukatif</option>
                    <option value="Teka-Teki Silang & Studi Kasus">📜 Teka-Teki Silang Kasus Kontekstual</option>
                  </select>
                </div>
              </div>

              {/* Specific connection to student challenges and peer tutoring */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-purple-900 mb-1">
                    🎯 Tantangan Konsep Sulit yang Disasar Game Ini (Disesuaikan Refleksi Murid):
                  </label>
                  <textarea
                    rows={2}
                    value={fokusHambatanGame}
                    onChange={e => setFokusHambatanGame(e.target.value)}
                    placeholder="Contoh: Mengatasi kesulitan siswa dalam membedakan urutan perundangan dan menguji pasal..."
                    className="w-full p-2 rounded-xl border border-purple-200 bg-purple-50/40 text-xs font-medium text-purple-950"
                  />
                </div>

                <div>
                  <label className="block font-bold text-purple-900 mb-1">
                    👥 Mekanisme Diferensiasi & Tutor Sebaya Tim Heterogen:
                  </label>
                  <textarea
                    rows={2}
                    value={mekanismeTutorSebaya}
                    onChange={e => setMekanismeTutorSebaya(e.target.value)}
                    placeholder="Contoh: Pembentukan tim heterogen agar siswa mahir dapat membimbing rekannya..."
                    className="w-full p-2 rounded-xl border border-purple-200 bg-purple-50/40 text-xs font-medium text-purple-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Durasi Game dalam Pembelajaran:</label>
                  <input
                    type="text"
                    value={durasiGame}
                    onChange={e => setDurasiGame(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Format Tim / Jumlah Pemain:</label>
                  <input
                    type="text"
                    value={jumlahPemainGame}
                    onChange={e => setJumlahPemainGame(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {gameSourceMode === 'BANK' && (
            <div className="p-4 bg-white rounded-2xl border border-purple-200 space-y-3 shadow-2xs">
              <label className="block font-bold text-slate-700 mb-1">
                Pilih Game dari Bank Game Anda:
              </label>
              {games.length === 0 ? (
                <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center justify-between gap-3">
                  <span>Belum ada game di Bank Game. Gunakan opsi "Rekomendasi Refleksi" untuk membuat game otomatis sesuai hasil refleksi murid.</span>
                  {onNavigateToCreateGame && (
                    <button
                      type="button"
                      onClick={() => onNavigateToCreateGame({ materi: topikBerikutnya })}
                      className="px-3.5 py-1.5 bg-amber-600 text-white rounded-xl font-bold text-xs hover:bg-amber-700 cursor-pointer shrink-0"
                    >
                      Buat Game Baru
                    </button>
                  )}
                </div>
              ) : (
                <select
                  value={selectedGameId}
                  onChange={e => setSelectedGameId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800"
                >
                  {games.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.namaGame} ({g.kategori}) — Materi: {g.materi}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* SECTION 3: IDENTITAS SATUAN PENDIDIKAN & GURU */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Satuan Pendidikan</label>
            <input
              type="text"
              value={sekolah}
              onChange={e => setSekolah(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Guru Pengampu</label>
            <input
              type="text"
              value={namaGuru}
              onChange={e => setNamaGuru(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* RPM Document Selector & Viewer */}
      {rpms.length > 0 && selectedRpm ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Action Toolbar */}
          <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2">
              <select
                value={selectedRpm.id}
                onChange={e => {
                  const found = rpms.find(r => r.id === e.target.value);
                  if (found) setSelectedRpm(found);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
              >
                {rpms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.judul} ({new Date(r.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => handleDeleteRpm(selectedRpm.id)}
                className="p-2 text-slate-400 hover:text-red-600 transition"
                title="Hapus RPM"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali / Batal</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>💾 SIMPAN RPM</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleOpenQuickEdit}
                    className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                    title="Edit acuan materi, topik, dan game terintegrasi dokumen RPM ini"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>✏️ Sesuaikan Materi & Game RPM</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAiEditModal(true)}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-purple-200 hover:scale-105 active:scale-95 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>✨ EDIT DENGAN AI</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Manual</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={handleDownloadDocx}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>📄 DOWNLOAD DOCX</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>📕 DOWNLOAD PDF / CETAK</span>
              </button>
            </div>
          </div>

          {/* RPM Printable Content Sheet */}
          <div className="p-8 sm:p-12 text-slate-900 max-w-4xl mx-auto space-y-8 font-serif leading-relaxed text-sm">
            {/* INTEGRASI GAME EDUKASI BERKESINAMBUNGAN */}
            {(() => {
              const linkedGame = games.find(g => g.id === selectedRpm.gameId) || 
                                 games.find(g => g.materialId === selectedRpm.materialId) ||
                                 games[0];
              const rpmTopic = selectedRpm.identitas?.materi || selectedRpm.sections?.A_identitas?.materi || selectedRpm.mataPelajaran;
              return (
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-5 rounded-2xl font-sans not-prose shadow-lg border border-purple-500/30 print:hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-pink-500/20 text-pink-300 rounded-lg border border-pink-400/30">
                          <Gamepad2 className="w-4 h-4" />
                        </span>
                        <span className="text-xs font-black uppercase tracking-wider text-pink-300">
                          Game Edukasi Terintegrasi Hasil Refleksi Murid
                        </span>
                        <span className="text-[10px] bg-purple-500/30 text-purple-200 border border-purple-400/30 px-2 py-0.5 rounded-md font-semibold">
                          🎯 Adaptif Suara Siswa
                        </span>
                      </div>
                      {linkedGame ? (
                        <div>
                          <h4 className="text-base font-bold text-white flex items-center gap-2">
                            <span>🎮 {linkedGame.namaGame}</span>
                            <span className="text-xs px-2 py-0.5 bg-indigo-500/30 text-indigo-200 rounded-full font-medium border border-indigo-400/30">
                              {linkedGame.kategori}
                            </span>
                          </h4>
                          <p className="text-xs text-indigo-200 mt-0.5">
                            Durasi: {linkedGame.durasi} • Format: {linkedGame.jumlahPemain} • Terkait Materi: <strong className="text-white">{rpmTopic}</strong>
                          </p>
                          {linkedGame.tujuan && (
                            <p className="text-[11px] text-pink-200/90 mt-1 italic">
                              💡 Fokus: {linkedGame.tujuan}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <h4 className="text-sm font-bold text-white">Belum Ada Game Terhubung Langsung</h4>
                          <p className="text-xs text-slate-300">Rancang game interaktif yang selaras dengan topik RPM ini untuk dimainkan bersama siswa.</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {linkedGame && onPlayGame && (
                        <button
                          type="button"
                          onClick={() => onPlayGame(linkedGame)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Mainkan Game</span>
                        </button>
                      )}
                      {onNavigateToCreateGame && (
                        <button
                          type="button"
                          onClick={() => onNavigateToCreateGame({
                            mataPelajaran: selectedRpm.mataPelajaran,
                            kelas: selectedRpm.kelas,
                            materi: rpmTopic,
                            tujuan: selectedRpm.sections?.D_tujuanPembelajaran?.[0] || selectedRpm.komponen2_desain?.tujuanPembelajaran?.[0] || '',
                            rpmId: selectedRpm.id
                          })}
                          className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Kelola di Game Studio</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Header Document */}
            <div className="text-center pb-6 border-b-2 border-slate-900 font-sans">
              <span className="px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-black uppercase tracking-wider inline-block mb-2">
                Kurikulum Merdeka • Pembelajaran Mendalam
              </span>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950">
                Rencana Pembelajaran Mendalam (RPM)
              </h1>
              <h2 className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-widest mt-1">
                Berbasis Data Refleksi Suara Siswa (NOVA) & Gamifikasi Edukasi Terpadu
              </h2>
            </div>

            {(() => {
              const idt = getIdentitas(selectedRpm);
              const k1 = getKomponen1(selectedRpm);
              const k2 = getKomponen2(selectedRpm);
              const k3 = getKomponen3(selectedRpm);
              const k4 = getKomponen4(selectedRpm);
              const lp = getLampiran(selectedRpm);

              return (
                <div className="space-y-8 font-sans">
                  {/* 1. BAGIAN IDENTITAS (INFORMASI UMUM) */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">1</span>
                        <h3 className="font-black text-sm uppercase text-slate-900 tracking-wide">
                          Bagian Identitas (Informasi Umum)
                        </h3>
                      </div>
                      {isEditing && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md">
                          Mode Edit Aktif
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-slate-600 font-bold block text-[11px] mb-1">Satuan Pendidikan</label>
                          <input
                            type="text"
                            value={idt.satuanPendidikan}
                            onChange={e => setSelectedRpm({
                              ...selectedRpm,
                              sekolah: e.target.value,
                              identitas: { ...idt, satuanPendidikan: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 border border-indigo-200 rounded-lg text-xs bg-white text-slate-900 font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 font-bold block text-[11px] mb-1">Guru Penyusun</label>
                          <input
                            type="text"
                            value={idt.namaGuru}
                            onChange={e => setSelectedRpm({
                              ...selectedRpm,
                              guru: e.target.value,
                              identitas: { ...idt, namaGuru: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 border border-indigo-200 rounded-lg text-xs bg-white text-slate-900 font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 font-bold block text-[11px] mb-1">Kelas / Fase</label>
                          <input
                            type="text"
                            value={idt.kelasFase}
                            onChange={e => setSelectedRpm({
                              ...selectedRpm,
                              kelas: e.target.value,
                              identitas: { ...idt, kelasFase: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 border border-indigo-200 rounded-lg text-xs bg-white text-slate-900 font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 font-bold block text-[11px] mb-1">Mata Pelajaran</label>
                          <input
                            type="text"
                            value={idt.mataPelajaran}
                            onChange={e => setSelectedRpm({
                              ...selectedRpm,
                              mataPelajaran: e.target.value,
                              identitas: { ...idt, mataPelajaran: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 border border-indigo-200 rounded-lg text-xs bg-white text-slate-900 font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 font-bold block text-[11px] mb-1">Materi / Topik Pembelajaran</label>
                          <input
                            type="text"
                            value={idt.materi}
                            onChange={e => setSelectedRpm({
                              ...selectedRpm,
                              judul: `RPM - ${e.target.value}`,
                              identitas: { ...idt, materi: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 border border-indigo-200 rounded-lg text-xs bg-white text-slate-900 font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 font-bold block text-[11px] mb-1">Alokasi Waktu</label>
                          <input
                            type="text"
                            value={idt.alokasiWaktu}
                            onChange={e => setSelectedRpm({
                              ...selectedRpm,
                              alokasiWaktu: e.target.value,
                              identitas: { ...idt, alokasiWaktu: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 border border-indigo-200 rounded-lg text-xs bg-white text-slate-900 font-medium"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <span className="text-slate-500 font-semibold block text-[11px]">Satuan Pendidikan</span>
                          <strong className="text-slate-900 text-xs">{idt.satuanPendidikan}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block text-[11px]">Guru Penyusun</span>
                          <strong className="text-slate-900 text-xs">{idt.namaGuru}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block text-[11px]">Kelas / Fase</span>
                          <strong className="text-slate-900 text-xs">{idt.kelasFase}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block text-[11px]">Mata Pelajaran</span>
                          <strong className="text-slate-900 text-xs">{idt.mataPelajaran}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block text-[11px]">Materi / Topik Pembelajaran</span>
                          <strong className="text-indigo-900 text-xs">{idt.materi}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block text-[11px]">Alokasi Waktu</span>
                          <strong className="text-slate-900 text-xs">{idt.alokasiWaktu}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. KOMPONEN 1: IDENTIFIKASI */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">2</span>
                        <h3 className="font-black text-sm uppercase text-slate-900 tracking-wide">
                          Komponen 1: Identifikasi (Kondisi Awal Pembelajaran)
                        </h3>
                      </div>
                      {isEditing && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md">
                          Mode Edit Aktif
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-200">
                        <span className="font-bold text-purple-950 block mb-1 text-xs">
                          • Kesiapan Peserta Didik (Hasil Diagnostik Suara Refleksi NOVA):
                        </span>
                        {isEditing ? (
                          <textarea
                            rows={4}
                            value={k1.kesiapanPesertaDidik}
                            onChange={e => setSelectedRpm({
                              ...selectedRpm,
                              komponen1_identifikasi: { ...k1, kesiapanPesertaDidik: e.target.value }
                            })}
                            className="w-full p-2.5 border border-purple-300 rounded-lg text-xs bg-white text-slate-800 font-sans"
                            placeholder="Tuliskan hasil asesmen kesiapan diagnostik suara siswa NOVA..."
                          />
                        ) : (
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{k1.kesiapanPesertaDidik}</p>
                        )}
                      </div>

                      <div>
                        <span className="font-bold text-slate-900 block mb-1 text-xs">
                          • Karakteristik Materi Pelajaran (Konseptual/Prosedural, Tingkat Kesulitan, Relevansi Nyata):
                        </span>
                        {isEditing ? (
                          <textarea
                            rows={3}
                            value={k1.karakteristikMateri}
                            onChange={e => setSelectedRpm({
                              ...selectedRpm,
                              komponen1_identifikasi: { ...k1, karakteristikMateri: e.target.value }
                            })}
                            className="w-full p-2.5 border rounded-lg text-xs bg-white text-slate-800 font-sans"
                            placeholder="Tuliskan karakteristik materi pembelajaran..."
                          />
                        ) : (
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{k1.karakteristikMateri}</p>
                        )}
                      </div>

                      <div>
                        <span className="font-bold text-slate-900 block mb-1.5 text-xs">
                          • Dimensi Profil Lulusan (DPL 1 s/d DPL 8 Lengkap):
                        </span>
                        {isEditing ? (
                          <div className="space-y-2">
                            {k1.dimensiProfilLulusan.map((d, i) => (
                              <div key={i} className="flex gap-2 items-center">
                                <span className="font-bold text-purple-800 text-[11px] shrink-0 w-14">DPL {i + 1}:</span>
                                <input
                                  type="text"
                                  value={d}
                                  onChange={e => {
                                    const updated = [...k1.dimensiProfilLulusan];
                                    updated[i] = e.target.value;
                                    setSelectedRpm({
                                      ...selectedRpm,
                                      komponen1_identifikasi: { ...k1, dimensiProfilLulusan: updated }
                                    });
                                  }}
                                  className="flex-1 px-2.5 py-1.5 border border-purple-200 rounded-lg text-xs bg-white text-slate-800"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {k1.dimensiProfilLulusan.map((d, i) => (
                              <span key={i} className="px-3 py-1.5 rounded-xl bg-purple-100/80 text-purple-900 font-semibold border border-purple-200 text-xs shadow-2xs">
                                🎯 {d}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3. KOMPONEN 2: DESAIN PEMBELAJARAN */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">3</span>
                        <h3 className="font-black text-sm uppercase text-slate-900 tracking-wide">
                          Komponen 2: Desain Pembelajaran (Kerangka Pencapaian Kompetensi)
                        </h3>
                      </div>
                      {isEditing && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md">
                          Mode Edit Aktif
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="font-bold text-slate-900 block mb-1 text-xs">
                          • Capaian Pembelajaran (CP) Elemen & Fase:
                        </span>
                        {isEditing ? (
                          <textarea
                            rows={3}
                            value={k2.capaianPembelajaran}
                            onChange={e => setSelectedRpm({
                              ...selectedRpm,
                              komponen2_desain: { ...k2, capaianPembelajaran: e.target.value }
                            })}
                            className="w-full p-2.5 border rounded-lg text-xs bg-white text-slate-800"
                            placeholder="Rumusan Capaian Pembelajaran (CP)..."
                          />
                        ) : (
                          <p className="text-slate-600 italic mb-2">CP: {k2.capaianPembelajaran}</p>
                        )}
                      </div>

                      <div>
                        <span className="font-bold text-slate-900 block mb-1 text-xs">
                          • Tujuan Pembelajaran (TP) Terukur (Format ABCD):
                        </span>
                        {isEditing ? (
                          <div className="space-y-2">
                            {k2.tujuanPembelajaran.map((tp, idx) => (
                              <div key={idx} className="flex gap-2 items-center">
                                <span className="font-bold text-indigo-700 text-[11px] shrink-0 w-8">TP {idx + 1}:</span>
                                <input
                                  type="text"
                                  value={tp}
                                  onChange={e => {
                                    const updated = [...k2.tujuanPembelajaran];
                                    updated[idx] = e.target.value;
                                    setSelectedRpm({
                                      ...selectedRpm,
                                      komponen2_desain: { ...k2, tujuanPembelajaran: updated }
                                    });
                                  }}
                                  className="flex-1 px-2.5 py-1.5 border border-indigo-200 rounded-lg text-xs bg-white text-slate-800"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = k2.tujuanPembelajaran.filter((_, i) => i !== idx);
                                    setSelectedRpm({
                                      ...selectedRpm,
                                      komponen2_desain: { ...k2, tujuanPembelajaran: updated }
                                    });
                                  }}
                                  className="text-slate-400 hover:text-red-500 p-1 text-xs"
                                  title="Hapus TP"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...k2.tujuanPembelajaran, `${k2.tujuanPembelajaran.length + 1}. Peserta didik mampu...`];
                                setSelectedRpm({
                                  ...selectedRpm,
                                  komponen2_desain: { ...k2, tujuanPembelajaran: updated }
                                });
                              }}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer mt-1"
                            >
                              + Tambah Tujuan Pembelajaran (TP)
                            </button>
                          </div>
                        ) : (
                          <ul className="list-disc pl-5 space-y-1 text-slate-800 font-medium">
                            {k2.tujuanPembelajaran.map((t, idx) => (
                              <li key={idx}>{t}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <span className="font-bold text-slate-800 block text-xs mb-1">
                            • Topik Kontekstual Nyata:
                          </span>
                          {isEditing ? (
                            <textarea
                              rows={2}
                              value={k2.topikKontekstual}
                              onChange={e => setSelectedRpm({
                                ...selectedRpm,
                                komponen2_desain: { ...k2, topikKontekstual: e.target.value }
                              })}
                              className="w-full p-2 border rounded-lg text-xs bg-white text-slate-800"
                            />
                          ) : (
                            <p className="text-slate-700">{k2.topikKontekstual}</p>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block text-xs mb-1">
                            • Kaitan Lintas Disiplin Ilmu:
                          </span>
                          {isEditing ? (
                            <textarea
                              rows={2}
                              value={k2.kaitanLintasDisiplin}
                              onChange={e => setSelectedRpm({
                                ...selectedRpm,
                                komponen2_desain: { ...k2, kaitanLintasDisiplin: e.target.value }
                              })}
                              className="w-full p-2 border rounded-lg text-xs bg-white text-slate-800"
                            />
                          ) : (
                            <p className="text-slate-700">{k2.kaitanLintasDisiplin}</p>
                          )}
                        </div>
                      </div>

                      {/* 4 Kerangka Pembelajaran Mendalam */}
                      <div>
                        <span className="font-bold text-indigo-900 block mb-2 text-xs uppercase tracking-wide">
                          • 4 Kerangka Pembelajaran Mendalam:
                        </span>
                        {isEditing ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200">
                              <label className="font-bold text-indigo-950 block text-[11px] mb-1">1. Praktik Pedagogis:</label>
                              <textarea
                                rows={2}
                                value={k2.kerangkaPembelajaranMendalam.praktikPedagogis}
                                onChange={e => setSelectedRpm({
                                  ...selectedRpm,
                                  komponen2_desain: {
                                    ...k2,
                                    kerangkaPembelajaranMendalam: { ...k2.kerangkaPembelajaranMendalam, praktikPedagogis: e.target.value }
                                  }
                                })}
                                className="w-full p-1.5 border border-indigo-300 rounded-lg text-xs bg-white text-slate-800"
                              />
                            </div>
                            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200">
                              <label className="font-bold text-purple-950 block text-[11px] mb-1">2. Kemitraan Pembelajaran:</label>
                              <textarea
                                rows={2}
                                value={k2.kerangkaPembelajaranMendalam.kemitraanPembelajaran}
                                onChange={e => setSelectedRpm({
                                  ...selectedRpm,
                                  komponen2_desain: {
                                    ...k2,
                                    kerangkaPembelajaranMendalam: { ...k2.kerangkaPembelajaranMendalam, kemitraanPembelajaran: e.target.value }
                                  }
                                })}
                                className="w-full p-1.5 border border-purple-300 rounded-lg text-xs bg-white text-slate-800"
                              />
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                              <label className="font-bold text-emerald-950 block text-[11px] mb-1">3. Lingkungan Pembelajaran:</label>
                              <textarea
                                rows={2}
                                value={k2.kerangkaPembelajaranMendalam.lingkunganPembelajaran}
                                onChange={e => setSelectedRpm({
                                  ...selectedRpm,
                                  komponen2_desain: {
                                    ...k2,
                                    kerangkaPembelajaranMendalam: { ...k2.kerangkaPembelajaranMendalam, lingkunganPembelajaran: e.target.value }
                                  }
                                })}
                                className="w-full p-1.5 border border-emerald-300 rounded-lg text-xs bg-white text-slate-800"
                              />
                            </div>
                            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                              <label className="font-bold text-amber-950 block text-[11px] mb-1">4. Pemanfaatan Digital:</label>
                              <textarea
                                rows={2}
                                value={k2.kerangkaPembelajaranMendalam.pemanfaatanDigital}
                                onChange={e => setSelectedRpm({
                                  ...selectedRpm,
                                  komponen2_desain: {
                                    ...k2,
                                    kerangkaPembelajaranMendalam: { ...k2.kerangkaPembelajaranMendalam, pemanfaatanDigital: e.target.value }
                                  }
                                })}
                                className="w-full p-1.5 border border-amber-300 rounded-lg text-xs bg-white text-slate-800"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200">
                              <span className="font-bold text-indigo-950 block text-[11px] mb-0.5">1. Praktik Pedagogis:</span>
                              <p className="text-slate-700 text-xs">{k2.kerangkaPembelajaranMendalam.praktikPedagogis}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200">
                              <span className="font-bold text-purple-950 block text-[11px] mb-0.5">2. Kemitraan Pembelajaran:</span>
                              <p className="text-slate-700 text-xs">{k2.kerangkaPembelajaranMendalam.kemitraanPembelajaran}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                              <span className="font-bold text-emerald-950 block text-[11px] mb-0.5">3. Lingkungan Pembelajaran:</span>
                              <p className="text-slate-700 text-xs">{k2.kerangkaPembelajaranMendalam.lingkunganPembelajaran}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                              <span className="font-bold text-amber-950 block text-[11px] mb-0.5">4. Pemanfaatan Digital:</span>
                              <p className="text-slate-700 text-xs">{k2.kerangkaPembelajaranMendalam.pemanfaatanDigital}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4. KOMPONEN 3: PENGALAMAN BELAJAR (LANGKAH-LANGKAH) */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">4</span>
                        <h3 className="font-black text-sm uppercase text-slate-900 tracking-wide">
                          Komponen 3: Pengalaman Belajar (Langkah-Langkah Terperinci)
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {isEditing && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md">
                            Mode Edit Aktif
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                          Prinsip: {k3.prinsip}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* A. Kegiatan Awal */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                        <span className="font-bold text-slate-900 text-xs block text-indigo-900 uppercase tracking-wide">
                          A. Kegiatan Awal (10 - 15 Menit) • Apersepsi, Orientasi Masalah, & Motivasi
                        </span>

                        {isEditing ? (
                          <div className="space-y-3">
                            <div>
                              <label className="font-bold text-slate-800 block text-[11px] mb-1">
                                • Apersepsi & Penggalian Pengetahuan Awal:
                              </label>
                              {k3.kegiatanAwal.apersepsi.map((step, idx) => (
                                <div key={idx} className="flex gap-2 items-start mb-1.5">
                                  <textarea
                                    rows={2}
                                    value={step}
                                    onChange={e => {
                                      const updated = [...k3.kegiatanAwal.apersepsi];
                                      updated[idx] = e.target.value;
                                      setSelectedRpm({
                                        ...selectedRpm,
                                        komponen3_pengalaman: {
                                          ...k3,
                                          kegiatanAwal: { ...k3.kegiatanAwal, apersepsi: updated }
                                        }
                                      });
                                    }}
                                    className="flex-1 p-2 border rounded-lg text-xs bg-white text-slate-800"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = k3.kegiatanAwal.apersepsi.filter((_, i) => i !== idx);
                                      setSelectedRpm({
                                        ...selectedRpm,
                                        komponen3_pengalaman: {
                                          ...k3,
                                          kegiatanAwal: { ...k3.kegiatanAwal, apersepsi: updated }
                                        }
                                      });
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-500 text-xs"
                                    title="Hapus langkah"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...k3.kegiatanAwal.apersepsi, `Langkah apersepsi baru`];
                                  setSelectedRpm({
                                    ...selectedRpm,
                                    komponen3_pengalaman: {
                                      ...k3,
                                      kegiatanAwal: { ...k3.kegiatanAwal, apersepsi: updated }
                                    }
                                  });
                                }}
                                className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                              >
                                + Tambah Langkah Apersepsi
                              </button>
                            </div>

                            <div>
                              <label className="font-bold text-slate-800 block text-[11px] mb-1">
                                • Orientasi Masalah Bermakna:
                              </label>
                              {k3.kegiatanAwal.orientasiMasalah.map((step, idx) => (
                                <div key={idx} className="flex gap-2 items-start mb-1.5">
                                  <textarea
                                    rows={2}
                                    value={step}
                                    onChange={e => {
                                      const updated = [...k3.kegiatanAwal.orientasiMasalah];
                                      updated[idx] = e.target.value;
                                      setSelectedRpm({
                                        ...selectedRpm,
                                        komponen3_pengalaman: {
                                          ...k3,
                                          kegiatanAwal: { ...k3.kegiatanAwal, orientasiMasalah: updated }
                                        }
                                      });
                                    }}
                                    className="flex-1 p-2 border rounded-lg text-xs bg-white text-slate-800"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = k3.kegiatanAwal.orientasiMasalah.filter((_, i) => i !== idx);
                                      setSelectedRpm({
                                        ...selectedRpm,
                                        komponen3_pengalaman: {
                                          ...k3,
                                          kegiatanAwal: { ...k3.kegiatanAwal, orientasiMasalah: updated }
                                        }
                                      });
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-500 text-xs"
                                    title="Hapus langkah"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...k3.kegiatanAwal.orientasiMasalah, `Langkah orientasi masalah baru`];
                                  setSelectedRpm({
                                    ...selectedRpm,
                                    komponen3_pengalaman: {
                                      ...k3,
                                      kegiatanAwal: { ...k3.kegiatanAwal, orientasiMasalah: updated }
                                    }
                                  });
                                }}
                                className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                              >
                                + Tambah Langkah Orientasi Masalah
                              </button>
                            </div>

                            <div>
                              <label className="font-bold text-slate-800 block text-[11px] mb-1">
                                • Motivasi Menggembirakan & Mekanisme Game:
                              </label>
                              {k3.kegiatanAwal.motivasi.map((step, idx) => (
                                <div key={idx} className="flex gap-2 items-start mb-1.5">
                                  <textarea
                                    rows={2}
                                    value={step}
                                    onChange={e => {
                                      const updated = [...k3.kegiatanAwal.motivasi];
                                      updated[idx] = e.target.value;
                                      setSelectedRpm({
                                        ...selectedRpm,
                                        komponen3_pengalaman: {
                                          ...k3,
                                          kegiatanAwal: { ...k3.kegiatanAwal, motivasi: updated }
                                        }
                                      });
                                    }}
                                    className="flex-1 p-2 border rounded-lg text-xs bg-white text-slate-800"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = k3.kegiatanAwal.motivasi.filter((_, i) => i !== idx);
                                      setSelectedRpm({
                                        ...selectedRpm,
                                        komponen3_pengalaman: {
                                          ...k3,
                                          kegiatanAwal: { ...k3.kegiatanAwal, motivasi: updated }
                                        }
                                      });
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-500 text-xs"
                                    title="Hapus langkah"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...k3.kegiatanAwal.motivasi, `Langkah motivasi baru`];
                                  setSelectedRpm({
                                    ...selectedRpm,
                                    komponen3_pengalaman: {
                                      ...k3,
                                      kegiatanAwal: { ...k3.kegiatanAwal, motivasi: updated }
                                    }
                                  });
                                }}
                                className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                              >
                                + Tambah Langkah Motivasi
                              </button>
                            </div>
                          </div>
                        ) : (
                          <ul className="list-disc pl-5 space-y-1.5 text-slate-800">
                            {k3.kegiatanAwal.apersepsi.map((a, i) => (
                              <li key={i}><strong>Apersepsi & Penggalian Awal:</strong> {a}</li>
                            ))}
                            {k3.kegiatanAwal.orientasiMasalah.map((o, i) => (
                              <li key={i}><strong>Orientasi Masalah Bermakna:</strong> {o}</li>
                            ))}
                            {k3.kegiatanAwal.motivasi.map((m, i) => (
                              <li key={i}><strong>Pemberian Motivasi Menggembirakan:</strong> {m}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* B. Kegiatan Inti (Berpusat pada 3M) */}
                      <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-950 text-xs uppercase tracking-wide">
                            B. Kegiatan Inti (Berpusat pada 3M) (50 - 60 Menit)
                          </span>
                          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                            Memahami • Mengaplikasi • Merefleksi
                          </span>
                        </div>

                        {/* 1M: Memahami */}
                        <div className="space-y-1 border-l-2 border-indigo-400 pl-3">
                          <span className="font-black text-indigo-950 text-xs block">
                            1. Memahami: Eksplorasi Konsep & Analisis Informasi (15 Menit)
                          </span>
                          {isEditing ? (
                            <div className="space-y-1.5 pt-1">
                              {k3.kegiatanInti_3M.memahami.map((step, idx) => (
                                <div key={idx} className="flex gap-2 items-start">
                                  <textarea
                                    rows={2}
                                    value={step}
                                    onChange={e => {
                                      const updated = [...k3.kegiatanInti_3M.memahami];
                                      updated[idx] = e.target.value;
                                      setSelectedRpm({
                                        ...selectedRpm,
                                        komponen3_pengalaman: {
                                          ...k3,
                                          kegiatanInti_3M: { ...k3.kegiatanInti_3M, memahami: updated }
                                        }
                                      });
                                    }}
                                    className="flex-1 p-2 border rounded-lg text-xs bg-white text-slate-800"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = k3.kegiatanInti_3M.memahami.filter((_, i) => i !== idx);
                                      setSelectedRpm({
                                        ...selectedRpm,
                                        komponen3_pengalaman: {
                                          ...k3,
                                          kegiatanInti_3M: { ...k3.kegiatanInti_3M, memahami: updated }
                                        }
                                      });
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-500 text-xs"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...k3.kegiatanInti_3M.memahami, `Langkah memahami baru`];
                                  setSelectedRpm({
                                    ...selectedRpm,
                                    komponen3_pengalaman: {
                                      ...k3,
                                      kegiatanInti_3M: { ...k3.kegiatanInti_3M, memahami: updated }
                                    }
                                  });
                                }}
                                className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                              >
                                + Tambah Langkah Memahami
                              </button>
                            </div>
                          ) : (
                            <ul className="list-disc pl-5 space-y-1 text-slate-800">
                              {k3.kegiatanInti_3M.memahami.map((m, i) => (
                                <li key={i}>{m}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* 2M: Mengaplikasi (Integrasi Game Edukasi) */}
                        <div className="space-y-1 border-l-2 border-pink-500 pl-3 bg-pink-50/40 p-2.5 rounded-r-xl">
                          <div className="flex items-center gap-1.5 text-xs font-black text-pink-950">
                            <Gamepad2 className="w-4 h-4 text-pink-600" />
                            <span>2. Mengaplikasi: Proyek, Diskusi Kelompok, & Integrasi Game Edukasi (25 Menit)</span>
                          </div>
                          {isEditing ? (
                            <div className="space-y-1.5 pt-1">
                              {k3.kegiatanInti_3M.mengaplikasi.map((step, idx) => (
                                <div key={idx} className="flex gap-2 items-start">
                                  <textarea
                                    rows={2}
                                    value={step}
                                    onChange={e => {
                                      const updated = [...k3.kegiatanInti_3M.mengaplikasi];
                                      updated[idx] = e.target.value;
                                      setSelectedRpm({
                                        ...selectedRpm,
                                        komponen3_pengalaman: {
                                          ...k3,
                                          kegiatanInti_3M: { ...k3.kegiatanInti_3M, mengaplikasi: updated }
                                        }
                                      });
                                    }}
                                    className="flex-1 p-2 border rounded-lg text-xs bg-white text-slate-800"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = k3.kegiatanInti_3M.mengaplikasi.filter((_, i) => i !== idx);
                                      setSelectedRpm({
                                        ...selectedRpm,
                                        komponen3_pengalaman: {
                                          ...k3,
                                          kegiatanInti_3M: { ...k3.kegiatanInti_3M, mengaplikasi: updated }
                                        }
                                      });
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-500 text-xs"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...k3.kegiatanInti_3M.mengaplikasi, `Langkah mengaplikasi baru`];
                                  setSelectedRpm({
                                    ...selectedRpm,
                                    komponen3_pengalaman: {
                                      ...k3,
                                      kegiatanInti_3M: { ...k3.kegiatanInti_3M, mengaplikasi: updated }
                                    }
                                  });
                                }}
                                className="text-xs text-pink-700 font-bold hover:underline cursor-pointer"
                              >
                                + Tambah Langkah Mengaplikasi
                              </button>
                            </div>
                          ) : (
                            <ul className="list-disc pl-5 space-y-1 text-slate-800">
                              {k3.kegiatanInti_3M.mengaplikasi.map((a, i) => (
                                <li key={i}>{a}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* 3M: Merefleksi */}
                        <div className="space-y-1 border-l-2 border-emerald-400 pl-3">
                          <span className="font-black text-emerald-950 text-xs block">
                            3. Merefleksi: Memaknai Kembali Pembelajaran & Hubungan ke Diri Siswa (15 Menit)
                          </span>
                          {isEditing ? (
                            <div className="space-y-1.5 pt-1">
                              {k3.kegiatanInti_3M.merefleksi.map((step, idx) => (
                                <div key={idx} className="flex gap-2 items-start">
                                  <textarea
                                    rows={2}
                                    value={step}
                                    onChange={e => {
                                      const updated = [...k3.kegiatanInti_3M.merefleksi];
                                      updated[idx] = e.target.value;
                                      setSelectedRpm({
                                        ...selectedRpm,
                                        komponen3_pengalaman: {
                                          ...k3,
                                          kegiatanInti_3M: { ...k3.kegiatanInti_3M, merefleksi: updated }
                                        }
                                      });
                                    }}
                                    className="flex-1 p-2 border rounded-lg text-xs bg-white text-slate-800"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = k3.kegiatanInti_3M.merefleksi.filter((_, i) => i !== idx);
                                      setSelectedRpm({
                                        ...selectedRpm,
                                        komponen3_pengalaman: {
                                          ...k3,
                                          kegiatanInti_3M: { ...k3.kegiatanInti_3M, merefleksi: updated }
                                        }
                                      });
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-500 text-xs"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...k3.kegiatanInti_3M.merefleksi, `Langkah merefleksi baru`];
                                  setSelectedRpm({
                                    ...selectedRpm,
                                    komponen3_pengalaman: {
                                      ...k3,
                                      kegiatanInti_3M: { ...k3.kegiatanInti_3M, merefleksi: updated }
                                    }
                                  });
                                }}
                                className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                              >
                                + Tambah Langkah Merefleksi
                              </button>
                            </div>
                          ) : (
                            <ul className="list-disc pl-5 space-y-1 text-slate-800">
                              {k3.kegiatanInti_3M.merefleksi.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* C. Kegiatan Penutup */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                        <span className="font-bold text-slate-900 text-xs block text-slate-900 uppercase tracking-wide">
                          C. Kegiatan Penutup (15 Menit) • Umpan Balik, Kesimpulan, & Refleksi Tindak Lanjut NOVA
                        </span>

                        {isEditing ? (
                          <div className="space-y-3">
                            <div>
                              <label className="font-bold text-slate-800 block text-[11px] mb-1">
                                • Umpan Balik Konstruktif:
                              </label>
                              {k3.kegiatanPenutup.umpanBalik.map((step, idx) => (
                                <div key={idx} className="flex gap-2 items-start mb-1.5">
                                  <textarea
                                    rows={2}
                                    value={step}
                                    onChange={e => {
                                      const updated = [...k3.kegiatanPenutup.umpanBalik];
                                      updated[idx] = e.target.value;
                                      setSelectedRpm({
                                        ...selectedRpm,
                                        komponen3_pengalaman: {
                                          ...k3,
                                          kegiatanPenutup: { ...k3.kegiatanPenutup, umpanBalik: updated }
                                        }
                                      });
                                    }}
                                    className="flex-1 p-2 border rounded-lg text-xs bg-white text-slate-800"
                                  />
                                </div>
                              ))}
                            </div>

                            <div>
                              <label className="font-bold text-slate-800 block text-[11px] mb-1">
                                • Menyimpulkan Bersama:
                              </label>
                              {k3.kegiatanPenutup.kesimpulan.map((step, idx) => (
                                <div key={idx} className="flex gap-2 items-start mb-1.5">
                                  <textarea
                                    rows={2}
                                    value={step}
                                    onChange={e => {
                                      const updated = [...k3.kegiatanPenutup.kesimpulan];
                                      updated[idx] = e.target.value;
                                      setSelectedRpm({
                                        ...selectedRpm,
                                        komponen3_pengalaman: {
                                          ...k3,
                                          kegiatanPenutup: { ...k3.kegiatanPenutup, kesimpulan: updated }
                                        }
                                      });
                                    }}
                                    className="flex-1 p-2 border rounded-lg text-xs bg-white text-slate-800"
                                  />
                                </div>
                              ))}
                            </div>

                            <div>
                              <label className="font-bold text-slate-800 block text-[11px] mb-1">
                                • Refleksi Tindak Lanjut NOVA & Penutup:
                              </label>
                              {k3.kegiatanPenutup.refleksiTindakLanjut.map((step, idx) => (
                                <div key={idx} className="flex gap-2 items-start mb-1.5">
                                  <textarea
                                    rows={2}
                                    value={step}
                                    onChange={e => {
                                      const updated = [...k3.kegiatanPenutup.refleksiTindakLanjut];
                                      updated[idx] = e.target.value;
                                      setSelectedRpm({
                                        ...selectedRpm,
                                        komponen3_pengalaman: {
                                          ...k3,
                                          kegiatanPenutup: { ...k3.kegiatanPenutup, refleksiTindakLanjut: updated }
                                        }
                                      });
                                    }}
                                    className="flex-1 p-2 border rounded-lg text-xs bg-white text-slate-800"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <ul className="list-disc pl-5 space-y-1.5 text-slate-800">
                            {k3.kegiatanPenutup.umpanBalik.map((u, i) => (
                              <li key={i}><strong>Umpan Balik Konstruktif:</strong> {u}</li>
                            ))}
                            {k3.kegiatanPenutup.kesimpulan.map((k, i) => (
                              <li key={i}><strong>Menyimpulkan Bersama:</strong> {k}</li>
                            ))}
                            {k3.kegiatanPenutup.refleksiTindakLanjut.map((r, i) => (
                              <li key={i}><strong>Refleksi Tindak Lanjut NOVA:</strong> {r}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 5. KOMPONEN 4: ASESMEN PEMBELAJARAN */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs">5</span>
                        <h3 className="font-black text-sm uppercase text-slate-900 tracking-wide">
                          Komponen 4: Asesmen Pembelajaran (Assessment as, for, & of Learning)
                        </h3>
                      </div>
                      {isEditing && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md">
                          Mode Edit Aktif
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-900 block text-xs mb-1">
                          • Asesmen Awal (Diagnostik):
                        </span>
                        {isEditing ? (
                          <textarea
                            rows={6}
                            value={k4.asesmenAwal_diagnostik}
                            onChange={e => setSelectedRpm({
                              ...selectedRpm,
                              komponen4_asesmen: { ...k4, asesmenAwal_diagnostik: e.target.value }
                            })}
                            className="w-full p-2.5 border rounded-lg text-xs bg-white text-slate-800"
                            placeholder="Uraian asesmen diagnostik awal..."
                          />
                        ) : (
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{k4.asesmenAwal_diagnostik}</p>
                        )}
                      </div>

                      <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-200">
                        <span className="font-bold text-indigo-950 block text-xs mb-1">
                          • Asesmen Proses (Formatif):
                        </span>
                        {isEditing ? (
                          <textarea
                            rows={6}
                            value={k4.asesmenProses_formatif}
                            onChange={e => setSelectedRpm({
                              ...selectedRpm,
                              komponen4_asesmen: { ...k4, asesmenProses_formatif: e.target.value }
                            })}
                            className="w-full p-2.5 border rounded-lg text-xs bg-white text-slate-800"
                            placeholder="Uraian asesmen proses formatif..."
                          />
                        ) : (
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{k4.asesmenProses_formatif}</p>
                        )}
                      </div>

                      <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-200">
                        <span className="font-bold text-purple-950 block text-xs mb-1">
                          • Asesmen Akhir (Sumatif):
                        </span>
                        {isEditing ? (
                          <textarea
                            rows={6}
                            value={k4.asesmenAkhir_sumatif}
                            onChange={e => setSelectedRpm({
                              ...selectedRpm,
                              komponen4_asesmen: { ...k4, asesmenAkhir_sumatif: e.target.value }
                            })}
                            className="w-full p-2.5 border rounded-lg text-xs bg-white text-slate-800"
                            placeholder="Uraian asesmen akhir sumatif & KKTP..."
                          />
                        ) : (
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{k4.asesmenAkhir_sumatif}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 6. LAMPIRAN PENDUKUNG (PELENGKAP) */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs">6</span>
                        <h3 className="font-black text-sm uppercase text-slate-900 tracking-wide">
                          Lampiran Pendukung (Pelengkap Dokumen Multi-Halaman)
                        </h3>
                      </div>
                      {isEditing && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md">
                          Mode Edit Aktif
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <strong className="text-slate-900 block text-xs mb-1">
                          • Lembar Kerja Murid (LKM / LKPD):
                        </strong>
                        {isEditing ? (
                          <textarea
                            rows={10}
                            value={lp.lkpd}
                            onChange={e => setSelectedRpm({
                              ...selectedRpm,
                              lampiran: { ...lp, lkpd: e.target.value }
                            })}
                            className="w-full p-2.5 border rounded-lg text-xs bg-white text-slate-800 font-mono"
                            placeholder="Naskah lengkap LKPD..."
                          />
                        ) : (
                          <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-xs bg-white p-3 rounded-lg border border-slate-100 max-h-72 overflow-y-auto">
                            {lp.lkpd}
                          </div>
                        )}
                      </div>

                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <strong className="text-slate-900 block text-xs mb-1">
                          • Rubrik Penilaian & Kriteria Ketercapaian (KKTP):
                        </strong>
                        {isEditing ? (
                          <textarea
                            rows={10}
                            value={lp.rubrikPenilaian}
                            onChange={e => setSelectedRpm({
                              ...selectedRpm,
                              lampiran: { ...lp, rubrikPenilaian: e.target.value }
                            })}
                            className="w-full p-2.5 border rounded-lg text-xs bg-white text-slate-800 font-mono"
                            placeholder="Tabel rubrik penilaian & KKTP..."
                          />
                        ) : (
                          <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-xs bg-white p-3 rounded-lg border border-slate-100 max-h-72 overflow-y-auto">
                            {lp.rubrikPenilaian}
                          </div>
                        )}
                      </div>

                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <strong className="text-slate-900 block text-xs mb-1">
                          • Program Pengayaan dan Remedial:
                        </strong>
                        {isEditing ? (
                          <textarea
                            rows={10}
                            value={lp.pengayaanDanRemedial}
                            onChange={e => setSelectedRpm({
                              ...selectedRpm,
                              lampiran: { ...lp, pengayaanDanRemedial: e.target.value }
                            })}
                            className="w-full p-2.5 border rounded-lg text-xs bg-white text-slate-800 font-mono"
                            placeholder="Rancangan program remedial dan pengayaan..."
                          />
                        ) : (
                          <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-xs bg-white p-3 rounded-lg border border-slate-100 max-h-72 overflow-y-auto">
                            {lp.pengayaanDanRemedial}
                          </div>
                        )}
                      </div>

                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <strong className="text-slate-900 block text-xs mb-1">
                          • Sumber Belajar, Buku, & Sarana Prasarana:
                        </strong>
                        {isEditing ? (
                          <textarea
                            rows={10}
                            value={lp.sumberBelajarDanSarana}
                            onChange={e => setSelectedRpm({
                              ...selectedRpm,
                              lampiran: { ...lp, sumberBelajarDanSarana: e.target.value }
                            })}
                            className="w-full p-2.5 border rounded-lg text-xs bg-white text-slate-800 font-mono"
                            placeholder="Daftar buku teks, media NOVA, dan sarana kelas..."
                          />
                        ) : (
                          <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-xs bg-white p-3 rounded-lg border border-slate-100 max-h-72 overflow-y-auto">
                            {lp.sumberBelajarDanSarana}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Signature footer */}
                  <div className="pt-6 flex justify-between font-sans text-xs text-center border-t border-slate-200">
                    <div>
                      Mengetahui,<br/>Kepala Satuan Pendidikan<br/><br/><br/><br/>
                      <span className="font-bold">( ............................................ )</span>
                    </div>
                    <div>
                      Guru Mata Pelajaran Penyusun,<br/><br/><br/><br/>
                      <strong className="underline text-slate-900">{idt.namaGuru}</strong>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">📋 Belum ada dokumen RPM yang disusun</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Klik tombol "BUAT RPM DENGAN NOVA" di atas untuk menyusun RPM pertama yang responsif terhadap data refleksi suara siswa.
          </p>
        </div>
      )}

      {/* MODAL: EDIT & REVISI RPM MENGGUNAKAN AI */}
      {showAiEditModal && selectedRpm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 relative">
              <button
                type="button"
                onClick={() => setShowAiEditModal(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Asisten Kurikulum AI NOVA</span>
              </div>

              <h3 className="text-xl font-black text-white">
                Revisi & Sempurnakan RPM dengan AI
              </h3>
              <p className="text-xs text-indigo-200 mt-1">
                RPM: <span className="font-bold text-white">{selectedRpm.judul}</span>
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Target Section */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Fokus Bagian yang Ingin Direvisi:
                </label>
                <select
                  value={targetSection}
                  onChange={e => setTargetSection(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white"
                >
                  <option value="ALL">🌟 Seluruh Dokumen RPM (6 Komponen Lengkap)</option>
                  <option value="identitas">1. Bagian Identitas (Informasi Umum: Sekolah, Guru, Mapel, Alokasi Waktu)</option>
                  <option value="komponen1_identifikasi">2. Komponen 1: Identifikasi (Kesiapan Murid, Karakteristik Materi, DPL 1–8)</option>
                  <option value="komponen2_desain">3. Komponen 2: Desain Pembelajaran (CP, TP, Kontekstual, & 4 Kerangka)</option>
                  <option value="komponen3_pengalaman">4. Komponen 3: Pengalaman Belajar (Prinsip 3M: Memahami, Mengaplikasi, Merefleksi)</option>
                  <option value="komponen4_asesmen">5. Komponen 4: Asesmen Pembelajaran (Diagnostik, Formatif, Sumatif)</option>
                  <option value="lampiran">6. Lampiran Pendukung (LKPD, Rubrik & KKTP, Pengayaan & Remedial, Sarana)</option>
                </select>
              </div>

              {/* Quick AI Prompts */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Pilih Cepat Rekomendasi Instruksi AI:
                </label>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    'Tingkatkan diferensiasi proses untuk siswa yang butuh bimbingan',
                    'Perkuat pembelajaran sosial emosional (PSE) dan mindfulness',
                    'Perdalam integrasi game edukasi pada fase kegiatan inti',
                    'Sederhanakan bahasa indikator asesmen formatif',
                    'Sesuaikan strategi dengan gaya belajar kinestetik dan visual murid'
                  ].map((quick, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAiInstruction(quick)}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-semibold text-[11px] transition text-left cursor-pointer"
                    >
                      ✨ {quick}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Instruksi Khusus dari Guru untuk AI:
                </label>
                <textarea
                  rows={4}
                  value={aiInstruction}
                  onChange={e => setAiInstruction(e.target.value)}
                  placeholder="Contoh: Tolong tambahkan variasi kegiatan scaffolding untuk siswa yang lambat memahami konsep, dan tambahkan ice breaking 2 menit sebelum game dimulai..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs text-slate-800 placeholder-slate-400"
                />
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                💡 <strong>Tips:</strong> AI NOVA akan merevisi susunan RPM secara pedagogis sesuai panduan Kurikulum Merdeka tanpa menghilangkan identitas materi dan struktur resmi.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowAiEditModal(false)}
                disabled={isAiEditing}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => handleApplyAiEdit()}
                disabled={isAiEditing || !aiInstruction.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black rounded-xl shadow-lg shadow-purple-200 transition cursor-pointer disabled:opacity-50"
              >
                {isAiEditing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sedang merevisi RPM dengan AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Terapkan Revisi AI Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SESUAIKAN ACUAN MATERI & GAME RPM */}
      {showQuickEditModal && selectedRpm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-6 relative">
              <button
                type="button"
                onClick={() => setShowQuickEditModal(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-bold text-amber-200 uppercase tracking-wider mb-1">
                <Edit3 className="w-4 h-4 text-amber-200" />
                <span>Pengaturan Acuan Materi & Game</span>
              </div>

              <h3 className="text-lg font-black text-white">
                Sesuaikan Materi Acuan Dokumen RPM Ini
              </h3>
              <p className="text-xs text-amber-100 mt-0.5">
                Ubah topik, alokasi waktu, atau kelas untuk menyesuaikan dengan materi pertemuan berikutnya
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Materi Pokok / Topik Pembelajaran:
                </label>
                <input
                  type="text"
                  value={quickEditTopic}
                  onChange={e => setQuickEditTopic(e.target.value)}
                  placeholder="Contoh: Hierarki Peraturan Perundang-undangan (Pertemuan 2)"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-amber-300 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran:</label>
                  <input
                    type="text"
                    value={quickEditMataPelajaran}
                    onChange={e => setQuickEditMataPelajaran(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas / Fase:</label>
                  <input
                    type="text"
                    value={quickEditKelas}
                    onChange={e => setQuickEditKelas(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alokasi Waktu:</label>
                <input
                  type="text"
                  value={quickEditAlokasi}
                  onChange={e => setQuickEditAlokasi(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                💡 <strong>Catatan:</strong> Perubahan ini akan langsung diperbarui di Bagian Identitas, Desain Pembelajaran, dan seluruh lembar cetak Dokumen RPM.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowQuickEditModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveQuickEdit}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Materi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
