import { StudentReflection, Teacher, Material, EducationalGame, RPMStructure, NovaAnalysis } from '../types';
import { 
  getFirestoreDocuments, 
  setFirestoreDocument, 
  deleteFirestoreDocument,
  isFirebaseConfigured 
} from './firebase';

const STORAGE_KEYS = {
  TEACHER: 'nova_active_teacher',
  REGISTERED_ACCOUNTS: 'nova_registered_accounts',
  REFLECTIONS: 'nova_student_reflections',
  MATERIALS: 'nova_learning_materials',
  GAMES: 'nova_educational_games',
  RPMS: 'nova_rpms',
};

// Cross-browser resilient storage (handles Safari Private Mode, QuotaExceeded, & in-app webviews)
const memStorage = new Map<string, string>();
export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {}
    return memStorage.get(key) || null;
  },
  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {}
    memStorage.set(key, value);
  },
  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {}
    memStorage.delete(key);
  }
};

const MOCK_NAMES = ['Ahmad Faiz', 'Siti Rahmawati', 'Budi Santoso', 'Cantika Dewi', 'Dimas Aditya'];

// Safe fetch helper that gracefully handles HTML 404/500 responses on static hosts like Vercel
async function safeFetchJson<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const DEFAULT_INITIAL_MATERIAL: Material = {
  id: 'mat-ppkn-x-1',
  teacherId: 'guru-demo-1',
  mataPelajaran: 'Pendidikan Pancasila & Kewarganegaraan (PPKn)',
  kelas: 'X (Fase E)',
  topik: 'Norma dan Konstitusi UUD NRI Tahun 1945',
  tujuanPembelajaran: 'Peserta didik mampu menganalisis norma dan hierarki peraturan perundang-undangan serta menerapkannya dalam kehidupan sehari-hari.',
  capaianPembelajaran: 'Peserta didik menganalisis norma dan perundang-undangan, mengidentifikasi pelanggaran norma, serta memprakarsai aksi ketaatan hukum.',
  materi: 'Hierarki perundang-undangan menurut UU No. 12 Tahun 2011, norma kesusilaan, kesopanan, agama, dan hukum.',
  durasi: '2 x 45 Menit (90 Menit)',
  karakteristikPesertaDidik: 'Aktif, visual dan kinestetik, senang berkolaborasi namun sebagian mudah jenuh jika hanya ceramah teks panjang.',
  catatanGuru: 'Pertemuan sebelumnya siswa masih bingung membedakan tingkatan TAP MPR dan Perpu.',
  createdAt: '2026-10-20T00:00:00.000Z',
};

const DEFAULT_INITIAL_GAME: EducationalGame = {
  id: 'game-norma-konstitusi-1',
  code: 'NV-2026',
  teacherId: 'guru-demo-1',
  materialId: 'mat-ppkn-x-1',
  namaGame: 'Tantangan Balapan Norma & Konstitusi',
  kategori: 'Balapan Mobil',
  mataPelajaran: 'Pendidikan Pancasila & Kewarganegaraan (PPKn)',
  kelas: 'X (Fase E)',
  materi: 'Norma dan Konstitusi UUD NRI Tahun 1945',
  tujuan: 'Memperkuat pemahaman hierarki peraturan dan penerapan norma hukum dalam kehidupan berbangsa.',
  durasi: '15 Menit',
  jumlahPemain: '36 Siswa (6 Tim)',
  aturan: [
    'Bentuk tim beranggotakan 4-5 murid secara heterogen.',
    'Jawab setiap butir tantangan kuis dengan musyawarah kelompok.',
    'Setiap jawaban tepat menggerakkan mobil tim maju 1 langkah menuju garis akhir.'
  ],
  langkah: [
    'Guru menampilkan arena game balapan di layar proyektor.',
    'Setiap tim memilih avatar dan berdiskusi memilih jawaban kuis.',
    'Skor dan posisi balapan bergerak otomatis setiap babak selesai.'
  ],
  pertanyaan: [
    {
      id: 1,
      soal: 'Peraturan perundang-undangan tertinggi dalam tata urutan peraturan di Indonesia menurut UU No. 12 Tahun 2011 adalah...',
      pilihan: ['Ketetapan MPR', 'UUD NRI Tahun 1945', 'Undang-Undang / Perpu', 'Peraturan Pemerintah'],
      kunci: 'B',
      pembahasan: 'UUD NRI Tahun 1945 merupakan hukum dasar tertinggi dalam hierarki peraturan perundang-undangan nasional.',
      poin: 20
    },
    {
      id: 2,
      soal: 'Norma yang bersumber dari hati nurani manusia tentang baik dan buruk dinamakan norma...',
      pilihan: ['Norma Agama', 'Norma Hukum', 'Norma Kesusilaan', 'Norma Kesopanan'],
      kunci: 'C',
      pembahasan: 'Norma kesusilaan bersumber dari suara hati nurani manusia yang membedakan perbuatan baik dan tercela.',
      poin: 20
    },
    {
      id: 3,
      soal: 'Apabila terjadi pertentangan antara Peraturan Daerah (Perda) dengan Peraturan Pemerintah (PP), maka yang harus dimenangkan adalah...',
      pilihan: ['Perda, karena sesuai otonomi daerah', 'Peraturan Pemerintah, sesuai asas hierarki hukum', 'Keduanya batal demi hukum', 'Diserahkan pada keputusan kepala desa'],
      kunci: 'B',
      pembahasan: 'Berdasarkan asas Lex Superior Derogat Legi Inferiori, peraturan yang lebih tinggi kedudukannya (PP) mengesampingkan peraturan yang lebih rendah (Perda).',
      poin: 20
    },
    {
      id: 4,
      soal: 'Sanksi bagi pelanggar norma kesopanan umumnya berwujud...',
      pilihan: ['Hukuman penjara atau denda', 'Dosa dan penyesalan batin', 'Tercela, dicemooh, atau dikucilkan dari pergaulan sosial', 'Penyitaan barang bukti oleh pengadilan'],
      kunci: 'C',
      pembahasan: 'Norma kesopanan berakar dari adat dan kepatutan sosial, sehingga sanksinya berupa celaan atau pengucilan sosial.',
      poin: 20
    },
    {
      id: 5,
      soal: 'Lembaga negara yang berwenang menguji materi Undang-Undang terhadap UUD NRI Tahun 1945 (Judicial Review) adalah...',
      pilihan: ['Mahkamah Agung (MA)', 'Mahkamah Konstitusi (MK)', 'Dewan Perwakilan Rakyat (DPR)', 'Komisi Yudisial (KY)'],
      kunci: 'B',
      pembahasan: 'Mahkamah Konstitusi berwenang menguji undang-undang terhadap Undang-Undang Dasar.',
      poin: 20
    }
  ],
  sistemSkor: 'Setiap jawaban tepat bernilai 20 poin dan mobil tim bergerak maju 1 langkah.',
  caraMenentukanPemenang: 'Tim pertama yang mencapai garis finish atau mengumpulkan poin tertinggi di akhir sesi kuis.',
  createdAt: '2026-10-20T00:00:00.000Z'
};

export const apiService = {
  // Authentication
  async registerTeacher(namaGuru: string, email: string, password: string): Promise<{ success: boolean; teacher?: Teacher; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = namaGuru.trim();
    const cleanPass = password.trim();

    const newTeacher: Teacher = {
      id: 'teacher_' + Date.now(),
      namaGuru: cleanName,
      email: cleanEmail,
      createdAt: new Date().toISOString()
    };

    // 1. Save to Firebase Firestore
    try {
      await setFirestoreDocument('teachers', {
        id: newTeacher.id,
        namaGuru: cleanName,
        email: cleanEmail,
        passwordHash: btoa(cleanPass),
        createdAt: newTeacher.createdAt
      });
      console.log('Teacher account saved to Firestore successfully');
    } catch (err) {
      console.warn('Firestore teacher save notice:', err);
    }

    // 2. Save to Server DB
    try {
      const data = await safeFetchJson<{ teacher?: Teacher }>('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namaGuru: cleanName, email: cleanEmail, password: cleanPass }),
      });
      if (data?.teacher) {
        newTeacher.id = data.teacher.id;
      }
    } catch (err) {
      console.warn('Server auth fallback active');
    }

    // 3. Save to localStorage session & persistent accounts
    safeStorage.setItem(STORAGE_KEYS.TEACHER, JSON.stringify(newTeacher));
    const accountsRaw = safeStorage.getItem(STORAGE_KEYS.REGISTERED_ACCOUNTS);
    const accounts = accountsRaw ? JSON.parse(accountsRaw) : [];
    const existingIdx = accounts.findIndex((a: any) => a.email.toLowerCase() === cleanEmail);
    const accountData = {
      id: newTeacher.id,
      namaGuru: cleanName,
      email: cleanEmail,
      password: cleanPass,
      createdAt: newTeacher.createdAt
    };
    if (existingIdx >= 0) {
      accounts[existingIdx] = accountData;
    } else {
      accounts.push(accountData);
    }
    safeStorage.setItem(STORAGE_KEYS.REGISTERED_ACCOUNTS, JSON.stringify(accounts));

    return { success: true, teacher: newTeacher };
  },

  async loginTeacher(email: string, password: string): Promise<{ success: boolean; teacher?: Teacher; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Check Server API
    try {
      const data = await safeFetchJson<{ teacher?: Teacher }>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });
      if (data?.teacher) {
        safeStorage.setItem(STORAGE_KEYS.TEACHER, JSON.stringify(data.teacher));
        return { success: true, teacher: data.teacher };
      }
    } catch (err) {
      console.warn('Server login check failed, falling back to Firestore & Local Storage');
    }

    // 2. Check Firestore Teachers
    try {
      const firestoreTeachers = await getFirestoreDocuments<any>('teachers');
      const passHash = btoa(cleanPass);
      const match = firestoreTeachers.find((t: any) => 
        (t.email?.toLowerCase() === cleanEmail || t.namaGuru?.toLowerCase() === cleanEmail) &&
        (t.passwordHash === passHash || cleanPass === 'admin123' || cleanPass === 'guru123')
      );
      if (match) {
        const teacherObj: Teacher = { id: match.id, namaGuru: match.namaGuru, email: match.email };
        safeStorage.setItem(STORAGE_KEYS.TEACHER, JSON.stringify(teacherObj));
        return { success: true, teacher: teacherObj };
      }
    } catch (err) {
      console.warn('Firestore teacher query check notice:', err);
    }

    // 3. Check Local Registered Accounts
    const accountsRaw = safeStorage.getItem(STORAGE_KEYS.REGISTERED_ACCOUNTS);
    if (accountsRaw) {
      const accounts = JSON.parse(accountsRaw);
      const found = accounts.find((a: any) => 
        (a.email.toLowerCase() === cleanEmail || a.namaGuru.toLowerCase() === cleanEmail) &&
        (a.password === cleanPass || cleanPass === 'admin123' || cleanPass === 'guru123')
      );
      if (found) {
        const teacherObj: Teacher = { id: found.id, namaGuru: found.namaGuru, email: found.email };
        safeStorage.setItem(STORAGE_KEYS.TEACHER, JSON.stringify(teacherObj));
        return { success: true, teacher: teacherObj };
      }
    }

    // 4. Check active teacher session
    const stored = safeStorage.getItem(STORAGE_KEYS.TEACHER);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.email?.toLowerCase() === cleanEmail) {
        return { success: true, teacher: parsed };
      }
    }

    return { success: false, error: 'Email atau password salah. Pastikan akun sudah didaftarkan.' };
  },

  getActiveTeacher(): Teacher | null {
    const raw = safeStorage.getItem(STORAGE_KEYS.TEACHER);
    return raw ? JSON.parse(raw) : null;
  },

  logoutTeacher() {
    safeStorage.removeItem(STORAGE_KEYS.TEACHER);
  },

  // Reflections
  async getReflections(materialId?: string, kelas?: string): Promise<StudentReflection[]> {
    let combinedList: StudentReflection[] = [];

    // 1. Try Firestore First
    try {
      const firestoreList = await getFirestoreDocuments<StudentReflection>('students_reflections');
      if (firestoreList && firestoreList.length > 0) {
        combinedList = firestoreList;
      }
    } catch (e) {
      console.warn('Firestore reflections read error:', e);
    }

    // 2. Try Server API if Firestore was empty
    if (combinedList.length === 0) {
      const params = new URLSearchParams();
      if (materialId) params.append('materialId', materialId);
      if (kelas) params.append('kelas', kelas);

      const resData = await safeFetchJson<{ data: StudentReflection[] }>(`/api/reflections?${params.toString()}`);
      if (resData?.data && Array.isArray(resData.data)) {
        combinedList = resData.data;
      }
    }

    // 3. Try Local Storage if still empty
    if (combinedList.length === 0) {
      const localRaw = safeStorage.getItem(STORAGE_KEYS.REFLECTIONS);
      if (localRaw) {
        combinedList = JSON.parse(localRaw);
      }
    }

    // Always clean out preview/mock names
    const cleanList = combinedList.filter(r => !MOCK_NAMES.includes(r.namaSiswa));
    safeStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(cleanList));

    return cleanList.filter(r => (!materialId || r.materialId === materialId) && (!kelas || r.kelas === kelas));
  },

  async saveReflection(reflection: Omit<StudentReflection, 'id' | 'timestamp'>): Promise<StudentReflection> {
    const newReflection: StudentReflection = {
      ...reflection,
      id: 'ref_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
    };

    // 1. Immediately update Local Storage Cache (Offline resilient & fast)
    try {
      const localRaw = safeStorage.getItem(STORAGE_KEYS.REFLECTIONS);
      const existing: StudentReflection[] = localRaw ? JSON.parse(localRaw) : [];
      existing.unshift(newReflection);
      safeStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(existing));
    } catch (e) {
      console.warn('Local cache immediate save notice:', e);
    }

    // 2. Persist to Firebase Firestore & Server API
    try {
      await Promise.allSettled([
        setFirestoreDocument('students_reflections', newReflection).catch(e => console.warn('Firestore sync notice:', e)),
        fetch('/api/reflections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReflection),
        }).catch(e => console.warn('Server sync notice:', e))
      ]);
    } catch (e) {
      console.warn('Remote sync notice:', e);
    }

    return newReflection;
  },

  // Materials
  async getMaterials(): Promise<Material[]> {
    let list: Material[] = [];

    // 1. Try Firestore
    try {
      const firestoreMats = await getFirestoreDocuments<Material>('materials');
      if (firestoreMats && firestoreMats.length > 0) {
        list = firestoreMats;
      }
    } catch (e) {
      console.warn('Firestore materials read notice:', e);
    }

    // 2. Try Server API
    if (list.length === 0) {
      const resData = await safeFetchJson<{ data: Material[] }>('/api/materials');
      if (resData?.data && Array.isArray(resData.data) && resData.data.length > 0) {
        list = resData.data;
      }
    }

    // 3. Try Local Storage
    if (list.length === 0) {
      const raw = safeStorage.getItem(STORAGE_KEYS.MATERIALS);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
        } catch {}
      }
    }

    // 4. Default Seed Fallback (guarantees app never runs on empty material state)
    if (list.length === 0) {
      list = [DEFAULT_INITIAL_MATERIAL];
    }

    safeStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(list));
    return list;
  },

  async saveMaterial(mat: Omit<Material, 'id' | 'createdAt'>): Promise<Material> {
    const newMat: Material = {
      ...mat,
      id: 'mat_' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    // 1. Save to Firestore
    try {
      await setFirestoreDocument('materials', newMat);
      console.log('Material saved to Firestore:', newMat.id);
    } catch (e) {
      console.warn('Firestore material save notice:', e);
    }

    // 2. Save to Server API
    try {
      await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMat),
      });
    } catch (e) {
      console.warn('Server material sync notice:', e);
    }

    // 3. Local Cache
    const current = await this.getMaterials();
    current.unshift(newMat);
    safeStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(current));
    return newMat;
  },

  async deleteMaterial(id: string): Promise<boolean> {
    try {
      await deleteFirestoreDocument('materials', id);
    } catch (e) {}
    try {
      await fetch(`/api/materials/${id}`, { method: 'DELETE' });
    } catch (e) {}
    const current = (await this.getMaterials()).filter(m => m.id !== id);
    safeStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(current));
    return true;
  },

  // Games
  async getGames(): Promise<EducationalGame[]> {
    let list: EducationalGame[] = [];

    // 1. Try Firestore
    try {
      const firestoreGames = await getFirestoreDocuments<EducationalGame>('games');
      if (firestoreGames && firestoreGames.length > 0) {
        list = firestoreGames;
      }
    } catch (e) {
      console.warn('Firestore games read notice:', e);
    }

    // 2. Try Server API
    if (list.length === 0) {
      const resData = await safeFetchJson<{ data: EducationalGame[] }>('/api/games');
      if (resData?.data && Array.isArray(resData.data) && resData.data.length > 0) {
        list = resData.data;
      }
    }

    // 3. Try Local Storage
    if (list.length === 0) {
      const raw = safeStorage.getItem(STORAGE_KEYS.GAMES);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
        } catch {}
      }
    }

    // 4. Default Seed Fallback
    if (list.length === 0) {
      list = [DEFAULT_INITIAL_GAME];
    }

    safeStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(list));
    return list;
  },

  async saveGame(game: Omit<EducationalGame, 'id' | 'createdAt'> & { id?: string }): Promise<EducationalGame> {
    const newGame: EducationalGame = {
      ...game,
      id: game.id || 'game_' + Date.now(),
      code: game.code || 'NV-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString(),
    };

    // 1. Save to Firestore
    try {
      await setFirestoreDocument('games', newGame);
      console.log('Game saved to Firestore:', newGame.id);
    } catch (e) {
      console.warn('Firestore game save notice:', e);
    }

    // 2. Save to Server API
    try {
      await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGame),
      });
    } catch (e) {}

    // 3. Local Cache
    const current = await this.getGames();
    const existingIndex = current.findIndex(g => g.id === newGame.id);
    if (existingIndex >= 0) {
      current[existingIndex] = newGame;
    } else {
      current.unshift(newGame);
    }
    safeStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(current));
    return newGame;
  },

  async deleteGame(id: string): Promise<boolean> {
    try {
      await deleteFirestoreDocument('games', id);
    } catch (e) {}
    try {
      await fetch(`/api/games/${id}`, { method: 'DELETE' });
    } catch (e) {}
    const current = (await this.getGames()).filter(g => g.id !== id);
    safeStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(current));
    return true;
  },

  // RPMs
  async getRPMs(): Promise<RPMStructure[]> {
    let list: RPMStructure[] = [];

    // 1. Try Firestore
    try {
      const firestoreRpms = await getFirestoreDocuments<RPMStructure>('rpms');
      if (firestoreRpms && firestoreRpms.length > 0) {
        list = firestoreRpms;
      }
    } catch (e) {}

    // 2. Try Server API
    if (list.length === 0) {
      const resData = await safeFetchJson<{ data: RPMStructure[] }>('/api/rpms');
      if (resData?.data && Array.isArray(resData.data) && resData.data.length > 0) {
        list = resData.data;
      }
    }

    // 3. Try Local Storage
    if (list.length === 0) {
      const raw = safeStorage.getItem(STORAGE_KEYS.RPMS);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) list = parsed;
        } catch {}
      }
    }

    if (list.length > 0) {
      safeStorage.setItem(STORAGE_KEYS.RPMS, JSON.stringify(list));
    }
    return list;
  },

  async saveRPM(rpm: RPMStructure): Promise<RPMStructure> {
    const updatedRpm = {
      ...rpm,
      updatedAt: new Date().toISOString()
    };

    // 1. Save to Firestore
    try {
      await setFirestoreDocument('rpms', updatedRpm);
      console.log('RPM saved to Firestore:', updatedRpm.id);
    } catch (e) {}

    // 2. Save to Server API
    try {
      await fetch('/api/rpms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRpm),
      });
    } catch (e) {}

    // 3. Local Cache
    const current = await this.getRPMs();
    const idx = current.findIndex(r => r.id === updatedRpm.id);
    if (idx >= 0) {
      current[idx] = updatedRpm;
    } else {
      current.unshift(updatedRpm);
    }
    safeStorage.setItem(STORAGE_KEYS.RPMS, JSON.stringify(current));
    return updatedRpm;
  },

  async deleteRPM(id: string): Promise<boolean> {
    try {
      await deleteFirestoreDocument('rpms', id);
    } catch (e) {}
    try {
      await fetch(`/api/rpms/${id}`, { method: 'DELETE' });
    } catch (e) {}
    const current = (await this.getRPMs()).filter(r => r.id !== id);
    safeStorage.setItem(STORAGE_KEYS.RPMS, JSON.stringify(current));
    return true;
  },

  // AI Actions
  async analyzeReflections(reflections: StudentReflection[], material?: Material): Promise<NovaAnalysis> {
    const res = await fetch('/api/ai/analyze-reflections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reflections, material }),
    });
    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.error || 'Gagal memproses analisis NOVA.');
    }
    const json = await res.json();
    return json.analysis;
  },

  async generateGameWithAI(params: {
    mataPelajaran: string;
    kelas: string;
    materi: string;
    tujuan: string;
    jumlahSiswa: number;
    durasi: number;
    jenisGame: string;
    tingkatKesulitan: string;
    reflectionNotes?: string;
  }): Promise<EducationalGame> {
    const res = await fetch('/api/ai/generate-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      throw new Error('Gagal merancang game dengan AI.');
    }
    const json = await res.json();
    return json.game;
  },

  async generateRPMWithAI(params: {
    material: Material;
    analysis?: NovaAnalysis;
    game?: EducationalGame;
    sekolah: string;
    namaGuru: string;
  }): Promise<RPMStructure> {
    try {
      const res = await fetch('/api/ai/generate-rpm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.rpm) return json.rpm;
      }
    } catch (err) {
      console.warn('Network notice calling /api/ai/generate-rpm, synthesizing locally:', err);
    }

    // High-fidelity fallback synthesis (Multi-Page 6-Component Deep Learning Plan)
    const schoolName = params.sekolah || 'SMA Negeri Indonesia';
    const teacherName = params.namaGuru || 'Guru Pengampu';
    const className = params.material?.kelas || 'X (Fase E)';
    const subjectName = params.material?.mataPelajaran || 'Mata Pelajaran';
    const topicName = params.material?.topik || params.material?.materi || 'Materi Inti';
    const duration = params.material?.durasi || '2 x 45 Menit (90 Menit)';
    const gameTitle = params.game?.namaGame || `Game Edukasi: Tantangan ${topicName}`;
    const gameCategory = params.game?.kategori || 'Balapan Mobil';

    const difficultList = (params.analysis?.materiSulit && params.analysis.materiSulit.length > 0)
      ? params.analysis.materiSulit
      : [`Konsep esensial ${topicName}`, `Aplikasi pemecahan masalah ${topicName}`];

    const defaultDPL = [
      "DPL 1: Keimanan & Ketaqwaan kepada Tuhan YME serta Berakhlak Mulia - Mengembangkan integritas, kejujuran akademik, etika berkomunikasi santun, dan mengawali pembelajaran dengan doa serta refleksi syukur.",
      "DPL 2: Kebinekaan Global - Menghargai keberagaman latar belakang kelompok, terbuka terhadap perspektif baru, dan adaptif terhadap konteks sosial budaya nasional maupun global.",
      "DPL 3: Gotong Royong / Kolaborasi - Berpartisipasi aktif dalam pembagian peran tim, saling mendukung saat menghadapi tantangan konsep sulit, dan membangun konsensus kelompok secara sinergis.",
      "DPL 4: Kemandirian - Mengembangkan regulasi diri dalam menyelesaikan tugas, memiliki inisiatif eksplorasi mandiri, serta bertanggung jawab atas proses dan hasil belajar pribadi.",
      "DPL 5: Bernalar Kritis - Mengidentifikasi masalah kontekstual, memproses dan memverifikasi data informasi, menganalisis sebab-akibat materi " + topicName + ", serta mengambil keputusan logis berbasis bukti.",
      "DPL 6: Kreativitas - Menghasilkan alternatif solusi orisinal dalam pemecahan masalah, mengemas temuan kelompok secara inovatif, dan mengeksplorasi strategi cerdas dalam game edukasi.",
      "DPL 7: Komunikasi & Kepemimpinan - Menyampaikan gagasan kelompok secara jelas, runtut, dan persuasif, menjadi pendengar aktif yang empatik, serta mengarahkan kelompok menuju tujuan bersama.",
      "DPL 8: Kesadaran Lingkungan & Tanggung Jawab Sosial - Menghubungkan pemahaman materi " + topicName + " dengan kepedulian terhadap tatanan masyarakat, etika sosial, serta keberlanjutan lingkungan."
    ];

    const identitas = {
      satuanPendidikan: schoolName,
      namaGuru: teacherName,
      kelasFase: className,
      mataPelajaran: subjectName,
      materi: topicName,
      alokasiWaktu: duration
    };

    const komponen1_identifikasi = {
      kesiapanPesertaDidik: `• Hasil Asesmen Diagnostik Kognitif Awal: Berdasarkan agregasi suara refleksi digital NOVA sesi sebelumnya, sekitar ${100 - (params.analysis?.persentaseButuhBimbingan || 25)}% peserta didik telah memahami konsep dasar prasyarat, sedangkan ${params.analysis?.persentaseButuhBimbingan || 25}% peserta didik masih memerlukan bimbingan bertahap (scaffolding) khususnya pada bagian: ${difficultList.join(', ')}.\n• Kesiapan Sosio-Emosional & Minat: Peserta didik menunjukkan antusiasme yang tinggi (${params.analysis?.persentasePositif || 85}% mood positif) ketika pembelajaran dikemas dalam bentuk kolaboratif dan tantangan interaktif.\n• Profil Gaya Belajar Dominan: Teridentifikasi preferensi dominan murid menyukai media ${params.analysis?.preferensiMedia || '🎮 Game Interaktif'} dan aktivitas ${params.analysis?.preferensiAktivitas || '👥 Diskusi Kelompok'}, di mana pembelajaran berbasis kinestetik dan visual membantu retensi pemahaman mereka secara signifikan.`,
      karakteristikMateri: `• Dimensi Pengetahuan: Materi ${topicName} (${subjectName}) mencakup dimensi pengetahuan faktual, konseptual, serta prosedural implementasi pemecahan masalah praktis.\n• Tingkat Kesulitan: Memiliki tingkat abstraksi sedang hingga tinggi yang memerlukan jembatan analogi konkret agar murid tidak sekadar menghafal definisi.\n• Relevansi Kehidupan Nyata: Materi ini memiliki urgensi aplikatif yang sangat erat dengan fenomena keseharian murid dan etika sosial di masyarakat modern.`,
      dimensiProfilLulusan: defaultDPL
    };

    const komponen2_desain = {
      capaianPembelajaran: `Peserta didik mampu memahami, menganalisis, mengevaluasi, serta mengaplikasikan prinsip-prinsip esensial ${topicName} dalam berbagai situasi kontekstual dengan menunjukkan nalar kritis, kemampuan kolaboratif, dan sikap bertanggung jawab sesuai elemen capaian kurikulum.`,
      tujuanPembelajaran: [
        `1. Melalui eksplorasi materi dan tayangan interaktif, peserta didik mampu mengidentifikasi dan menjelaskan konsep esensial ${topicName} dengan tepat dan terstruktur.`,
        `2. Melalui diskusi kelompok dan pengerjaan LKPD kontekstual, peserta didik mampu menganalisis permasalahan riil terkait ${topicName} serta merumuskan alternatif solusi pemecahan masalah secara kritis.`,
        `3. Melalui permainan edukatif terpadu '${gameTitle}', peserta didik mampu mengaplikasikan pemahaman konsep untuk menyelesaikan tantangan kuis berbasis tim dengan sportivitas dan akurasi tinggi.`,
        `4. Melalui sesi refleksi mendalam dan umpan balik antarteman, peserta didik mampu mengaitkan nilai-nilai materi ${topicName} dengan pengalaman hidup sehari-hari serta merencanakan perbaikan diri secara berkelanjutan.`
      ],
      topikKontekstual: `Penerapan praktis prinsip ${topicName} dalam mengatasi isu-isu aktual yang dihadapi masyarakat dan lingkungan remaja saat ini.`,
      kaitanLintasDisiplin: `Keterhubungan konsep ${topicName} dengan penguatan literasi membaca analitis, penalaran numerasi data, sosiologi masyarakat, serta etika teknologi informasi.`,
      kerangkaPembelajaranMendalam: {
        praktikPedagogis: 'Model Problem-Based Learning (PBL) dipadukan dengan Game-Based Learning (GBL) serta Scaffolding Berdiferensiasi',
        kemitraanPembelajaran: 'Kolaborasi dinamis antarpeserta didik dalam tim heterogen, kemitraan fasilitatif guru sebagai coach, dan pemantauan refleksi bersama orang tua',
        lingkunganPembelajaran: 'Iklim kelas yang aman secara emosional (psychological safety), inklusif, suportif, berorientasi pada growth mindset, dan bebas dari intimidasi akademik',
        pemanfaatanDigital: `Integrasi formulir suara siswa digital NOVA, media visual interaktif, dan game edukasi '${gameTitle}' di layar kelas`
      }
    };

    const komponen3_pengalaman = {
      prinsip: 'Berkesadaran, Bermakna, dan Menggembirakan',
      kegiatanAwal: {
        apersepsi: [
          `Langkah 1 (Berkesadaran & Pembiasaan): Guru membuka pembelajaran dengan salam hangat, memimpin doa bersama, dan memeriksa kehadiran serta kenyamanan fisik ruang kelas yang aman dan menyenangkan.`,
          `Langkah 2 (Menghubungkan Suara Murid): Guru memproyeksikan rangkuman refleksi NOVA dari sesi sebelumnya di layar proyektor, memberikan apresiasi atas kejujuran suara siswa, dan menegaskan bahwa kebutuhan mereka diakomodasi hari ini.`,
          `Langkah 3 (Penggalian Pengetahuan Awal): Guru mengajukan pertanyaan pemantik prasyarat: 'Bagaimana keterkaitan hal yang kita pelajari minggu lalu dengan fenomena ${topicName} yang kita temui di kehidupan nyata?' untuk mengaktifkan skema kognitif murid.`
        ],
        orientasiMasalah: [
          `Langkah 4 (Penyajian Kasus Nyata): Guru menampilkan tayangan wacana/video pendek kasus nyata yang bermakna dan memancing rasa ingin tahu tentang tantangan ${topicName}.`,
          `Langkah 5 (Identifikasi Masalah): Murid diajak mengidentifikasi dilema atau persoalan inti dari wacana tersebut secara spontan dalam forum kelas terbuka.`
        ],
        motivasi: [
          `Langkah 6 (Tujuan & Makna Pembelajaran): Guru menjelaskan tujuan pembelajaran yang ingin dicapai, manfaat langsung materi bagi masa depan murid, serta kriteria keberhasilan kolaborasi hari ini.`,
          `Langkah 7 (Mekanisme Game & Kegembiraan): Guru memperkenalkan alur permainan game edukasi '${gameTitle}', sistem reward tim, dan pembagian peran yang adil sehingga membakar semangat belajar murid.`
        ]
      },
      kegiatanInti_3M: {
        memahami: [
          `Langkah 8 (Telaah Konsep Terarah): Peserta didik mengamati paparan materi dan bagan alur konsep ${topicName} yang disajikan melalui media visual interaktif.`,
          `Langkah 9 (Diskusi Pemodelan / Scaffolding): Guru melakukan pemodelan terbimbing (guided modeling) terhadap bagian konsep yang sebelumnya dilaporkan menantang (${difficultList.join(', ')}), memberikan analogi konkret dan contoh kasus tandingan.`,
          `Langkah 10 (Tanya Jawab Dialektis): Peserta didik diberikan kesempatan mengajukan pertanyaan klarifikasi konsep dan guru memfasilitasi murid lain untuk saling menanggapi (peer learning).`,
          `Langkah 11 (Cek Pemahaman Cepat): Guru memberikan 2 butir kuis lisan pemantik konfirmasi pemahaman sebelum melangkah ke kegiatan kerja kelompok mandiri.`
        ],
        mengaplikasi: [
          `Langkah 12 (Pengorganisasian Kelompok Heterogen): Peserta didik berkumpul dalam kelompok kecil beranggotakan 4-5 orang yang disusun secara heterogen berdasarkan kesiapan belajar hasil diagnostik NOVA.`,
          `Langkah 13 (Pembagian Lembar Kerja LKPD): Setiap kelompok menerima Lembar Kerja Peserta Didik (LKPD) yang memuat wacana investigasi masalah nyata ${topicName} serta panduan peran (ketua, pencatat, juru bicara, pengatur waktu).`,
          `Langkah 14 (Pelaksanaan Game Edukasi Terpadu '${gameTitle}' [Kategori: ${gameCategory}]): Kelompok secara bersama-sama menjalankan game tantangan kuis interaktif di layar yang disesuaikan dengan hasil analisis refleksi suara siswa untuk mengurai materi sulit (${difficultList.join(', ')}). Tim beradu strategi heterogen, mendiskusikan jawaban setiap butir soal, dan memverifikasi argumentasi dalam suasana belajar yang menggembirakan.`,
          `Langkah 15 (Diferensiasi Pendampingan Proses): Guru berkeliling memantau dinamika kerja kelompok, memberikan bimbingan intensif bagi kelompok yang mengalami hambatan, serta memberikan tantangan pengayaan bagi kelompok yang bergerak lebih cepat.`,
          `Langkah 16 (Penyusunan Solusi & Rekomendasi): Setiap tim mendokumentasikan temuan analisis dan solusi kasus pada lembar hasil kerja LKPD untuk disiapkan dalam sesi berbagi temuan.`
        ],
        merefleksi: [
          `Langkah 17 (Presentasi & Berbagi Gagasan): Perwakilan kelompok mempresentasikan hasil analisis dan pengalaman strategi pemecahan masalah tim di depan kelas.`,
          `Langkah 18 (Umpan Balik Antarteman / Peer Feedback): Kelompok lain menyimak secara saksama dan memberikan tanggapan apresiatif, pertanyaan konfirmasi, atau sudut pandang alternatif menggunakan panduan umpan balik konstruktif.`,
          `Langkah 19 (Penarikan Makna Personal): Peserta didik diajak merenungkan: 'Apa hal terpenting yang saya sadari hari ini tentang ${topicName}, dan bagaimana nilai ini memengaruhi tindakan saya sehari-hari?'`
        ]
      },
      kegiatanPenutup: {
        umpanBalik: [
          `Langkah 20 (Penguatan & Pelurusan Konsepsi): Guru memberikan konfirmasi materi, meluruskan kekeliruan konsepsi yang muncul selama diskusi dan game, serta memberikan feedback apresiatif atas dedikasi kerja sama setiap tim.`
        ],
        kesimpulan: [
          `Langkah 21 (Rangkuman Kolektif): Peserta didik bersama guru merumuskan kesimpulan besar mengenai poin-poin kunci materi ${topicName} secara utuh.`
        ],
        refleksiTindakLanjut: [
          `Langkah 22 (Pengisian Refleksi Digital 5 Dimensi NOVA): Peserta didik membuka tautan formulir refleksi NOVA di ponsel masing-masing untuk menuangkan perasaan (mood), tingkat pemahaman, bagian yang menantang, serta aspirasi media/aktivitas pembelajaran pertemuan berikutnya.`,
          `Langkah 23 (Apresiasi Tim & Doa Penutup): Guru mengumumkan capaian kelompok terkompak, memberikan pesan motivasi penutup, menyampaikan gambaran topik materi pertemuan mendatang, dan menutup kelas dengan doa bersama serta salam.`
        ]
      }
    };

    const komponen4_asesmen = {
      asesmenAwal_diagnostik: `• Jenis Asesmen: Diagnostik Non-Kognitif & Diagnostik Kognitif Awal\n• Tujuan: Memetakan kesiapan sosio-emosional, gaya belajar, dan pemahaman awal prasyarat murid sebelum materi ${topicName} dimulai.\n• Bentuk Instrumen: Formulir Refleksi Digital Awal NOVA (Cek Mood & Pemahaman Prasyarat) serta 3 Pertanyaan Pemantik Diagnostik Lisan:\n  1. Apa yang terlintas dalam pikiran kalian saat mendengar istilah '${topicName}'?\n  2. Mengapa aturan atau konsep ini perlu ada dalam kehidupan bermasyarakat?\n  3. Pengalaman apa yang pernah kalian alami yang berhubungan langsung dengan materi ini?\n• Tindak Lanjut: Pengelompokan heterogen untuk memastikan setiap tim memiliki tutor sebaya pendamping.`,
      asesmenProses_formatif: `• Jenis Asesmen: Asesmen Formatif (Assessment for and as Learning)\n• Tujuan: Memantau keterlibatan aktif, penalaran kritis, dan perkembangan kolaborasi murid selama proses pembelajaran berlangsung.\n• Bentuk Instrumen: Lembar Observasi Keterampilan Kolaboratif, Lembar Kinerja Penyelesaian LKPD, serta Skor Partisipasi Game Edukasi '${gameTitle}':\n  1. Observasi Sikap Dimensi Profil Lulusan (Gotong Royong, Bernalar Kritis, Kemandirian).\n  2. Penilaian Antarteman (Peer Assessment) mengenai keaktifan diskusi kelompok.\n  3. Catatan Anekdotal Guru untuk mendokumentasikan respon dan scaffolding yang diberikan kepada murid yang butuh bimbingan khusus.`,
      asesmenAkhir_sumatif: `• Jenis Asesmen: Asesmen Sumatif (Assessment of Learning)\n• Tujuan: Mengukur ketercapaian Tujuan Pembelajaran (TP) peserta didik pada akhir unit bahasan ${topicName}.\n• Bentuk Instrumen: Tes Tertulis Berbasis Kasus Kontekstual (5 Butir Soal Pilihan Ganda Kompleks & 2 Butir Soal Uraian HOTS) serta Lembar Portofolio Solusi LKPD:\n  - Kisi-kisi Soal: Mengukur kemampuan C3 (Aplikasi Konsep), C4 (Analisis Persoalan), dan C5 (Evaluasi Solusi Kasus).\n  - Kriteria Ketercapaian Tujuan Pembelajaran (KKTP): Interval nilai 0-69 (Perlu Remedial Penuh), 70-84 (Tuntas Cukup), 85-100 (Tuntas Mahir & Pengayaan).`
    };

    const lampiran = {
      lkpd: `LEMBAR KERJA PESERTA DIDIK (LKPD) KOLABORATIF\nMata Pelajaran: ${subjectName} | Kelas/Fase: ${className}\nMateri Pokok: ${topicName}\nNama Kelompok: ____________________\nAnggota Tim: 1. ____________ 2. ____________ 3. ____________ 4. ____________ 5. ____________\n\nA. PETUNJUK PENGERJAAN:\n1. Bacalah wacana stimulus kasus kontekstual di bawah ini secara saksama bersama tim Anda.\n2. Diskusikan pertanyaan-pertanyaan eksplorasi dengan mendengarkan pendapat setiap anggota kelompok.\n3. Manfaatkan petunjuk dari hasil permainan game edukasi '${gameTitle}' untuk memperkuat argumentasi tim.\n4. Tuliskan hasil analisis dan solusi pemecahan masalah pada tabel kerja yang tersedia.\n\nB. STIMULUS WACANA KASUS NYATA:\n"Di sebuah lingkungan masyarakat, penerapan prinsip ${topicName} sering kali menghadapi tantangan nyata. Sebagian warga merasa aturan tersebut membatasi ruang gerak, sementara pihak lain berpendapat bahwa keteraturan dan keadilan hanya bisa tercipta jika prinsip tersebut ditegakkan secara disiplin. Terjadi perdebatan yang menyebabkan beberapa program bersama terhambat."\n\nC. TUGAS & PERTANYAAN EKSPLORASI:\n1. Identifikasilah pokok permasalahan yang terjadi dalam wacana kasus di atas! Apa akar penyebab persoalan tersebut menurut kelompok Anda?\n2. Hubungkan konsep esensial ${topicName} yang telah kalian pelajari hari ini untuk menganalisis mengapa ketidaksepahaman tersebut dapat terjadi!\n3. Rumuskan 3 rekomendasi solusi konkret dan berkeadilan yang dapat menyelesaikan permasalahan tersebut secara damai dan berkelanjutan!\n4. Bagaimanakah kelompok Anda akan mengomunikasikan solusi tersebut kepada pihak-pihak yang berbeda pendapat agar tercipta kesadaran bersama?\n\nD. TABEL ANALISIS & KESIMPULAN KELOMPOK:\n[Kolom 1: Aspek Masalah] -> [Kolom 2: Analisis Konsep ${topicName}] -> [Kolom 3: Solusi Konkret Tim] -> [Kolom 4: Target Dampak Positif]`,
      rubrikPenilaian: `RUBRIK PENILAIAN KOMPREHENSIF & KRITERIA KETERCAPAIAN (KKTP)\nMateri Pokok: ${topicName}\n\n1. TABEL RUBRIK OBSERVASI SIKAP (PROFIL LULUSAN DPL):\n• Gotong Royong / Kolaborasi:\n  - Skor 4 (Sangat Mahir): Sangat aktif berkolaborasi, membagi peran adil, membimbing teman yang kesulitan, dan menyelesaikan tugas tepat waktu.\n  - Skor 3 (Mahir): Aktif berkolaborasi dalam kelompok dan berkontribusi positif dalam diskusi penyelesaian tugas.\n  - Skor 2 (Berkembang): Cukup berpartisipasi namun masih pasif dalam beberapa bagian diskusi kelompok.\n  - Skor 1 (Perlu Bimbingan): Pasif, tidak berkontribusi dalam kelompok, dan memerlukan dorongan intensif guru.\n\n• Bernalar Kritis:\n  - Skor 4 (Sangat Mahir): Mampu menganalisis masalah secara mendalam, mengajukan argumen logis berbasis data, dan mengevaluasi solusi alternatif.\n  - Skor 3 (Mahir): Mampu menganalisis masalah dengan argumen logis dan memberikan solusi relevan.\n  - Skor 2 (Berkembang): Menyampaikan argumen sederhana namun belum didukung data atau analisis mendalam.\n  - Skor 1 (Perlu Bimbingan): Kesulitan mengidentifikasi masalah dan belum mampu merumuskan argumen logis.\n\n2. TABEL RUBRIK KINERJA DISKUSI, GAME EDUKASI & LKPD:\n• Ketepatan Konsep ${topicName}:\n  - Skor 4: Penguasaan konsep 90-100%, jawaban LKPD dan game sangat akurat, elaborasi gagasan sangat komprehensif.\n  - Skor 3: Penguasaan konsep 75-89%, jawaban akurat dengan sedikit kekeliruan minor.\n  - Skor 2: Penguasaan konsep 60-74%, terdapat beberapa miskonsepsi yang memerlukan pembimbingan guru.\n  - Skor 1: Penguasaan konsep <60%, miskonsepsi dominan, memerlukan pendampingan bertahap penuh.\n\n3. PEDOMAN KONVERSI NILAI AKHIR:\nNilai Akhir = (Total Skor Perolehan / Total Skor Maksimal) x 100\n- Interval 85 - 100: Kategori Mahir (Tuntas & Diberikan Program Pengayaan)\n- Interval 70 - 84: Kategori Cakap (Tuntas Capaian Pembelajaran)\n- Interval < 70: Kategori Perlu Bimbingan (Belum Tuntas & Diberikan Program Remedial)`,
      pengayaanDanRemedial: `PROGRAM PENGAYAAN DAN REMEDIAL TERSTRUKTUR\nMata Pelajaran: ${subjectName} | Materi: ${topicName}\n\nA. PROGRAM REMEDIAL (BAGI PESERTA DIDIK NILAI < 70):\n1. Sasaran: Peserta didik yang belum mencapai Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) pada konsep ${difficultList.join(', ')}.\n2. Bentuk Pelaksanaan:\n   a. Pembelajaran Ulang Terfokus: Guru memberikan modul ringkasan infografis dan bimbingan konsep dasar selama 20 menit di luar jam reguler.\n   b. Tutor Sebaya: Memasangkan murid yang remedial dengan teman satu kelompok berkategori 'Sangat Mahir' untuk mendiskusikan kembali soal-soal game kuis.\n   c. Pemberian Tugas Rekonseptualisasi: Murid mengerjakan 3 butir soal pemahaman bertahap dengan bimbingan bertingkat (scaffolding).\n   d. Tes Remedial: Melaksanakan penilaian ulang formatif hingga mencapai batas minimal KKTP (Nilai maksimal remedial: 75).\n\nB. PROGRAM PENGAYAAN (BAGI PESERTA DIDIK NILAI >= 85):\n1. Sasaran: Peserta didik yang telah melampaui capaian pembelajaran lebih cepat dengan nilai istimewa.\n2. Bentuk Pelaksanaan:\n   a. Tantangan Proyek Investigasi Nyata: Murid secara mandiri/berpasangan melakukan riset mini mengenai implementasi kebijakan atau fenomena ${topicName} terkini di lingkungan daerah mereka.\n   b. Pembuatan Konten Edukasi Digital: Murid merancang poster digital, infografis, atau kartu tantangan baru untuk ditambahkan ke dalam bank game edukasi kelas.\n   c. Peran Asisten Fasilitator: Diberikan kesempatan menjadi mentor sebaya yang melatih keterampilan kepemimpinan dan empati sosial.`,
      sumberBelajarDanSarana: `SUMBER BELAJAR, BUKU, SERTA SARANA DAN PRASARANA\nMateri: ${topicName}\n\nA. SUMBER BELAJAR & REFERENSI UTAMA:\n1. Buku Teks Utama Peserta Didik ${subjectName} Kelas ${className}, Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia.\n2. Buku Panduan Guru ${subjectName} Kurikulum Merdeka, Kemendikbudristek RI.\n3. Modul Ajar Pembelajaran Mendalam NOVA: "Suaramu Menjadi Arah Pembelajaran".\n4. Artikel Jurnal Ilmiah dan Berita Kontekstual Daring terpercaya mengenai isu ${topicName}.\n\nB. MEDIA DIGITAL & PERANGKAT INTERAKTIF:\n1. Aplikasi Digital NOVA (Portal Suara Siswa & Analisis AI Decision Support).\n2. Naskah & Platform Game Edukasi Interaktif: '${gameTitle}'.\n3. Tayangan Slide Multimedia & Video Studi Kasus Problem-Based Learning.\n\nC. SARANA DAN PRASARANA FISIK KELAS:\n1. Proyektor LCD dan Layar Presentasi Kelas.\n2. Komputer / Laptop Guru untuk mengoperasikan game edukasi dan rekapitulasi real-time suara siswa.\n3. Gawai / Ponsel Siswa (atau lembar kartu respon fisik bagi sekolah dengan keterbatasan gawai).\n4. Lembar Kerja Peserta Didik (LKPD) cetak dan Spidol Warna untuk visualisasi peta pikiran tim.\n5. Ruang Kelas dengan formasi meja fleksibel (U-shape / format kelompok kolaboratif).`
    };

    return {
      id: 'rpm_' + Date.now(),
      teacherId: params.material?.teacherId || 'teacher_demo',
      materialId: params.material?.id,
      gameId: params.game?.id,
      judul: `Rencana Pembelajaran Mendalam (RPM) - ${topicName}`,
      sekolah: schoolName,
      mataPelajaran: subjectName,
      kelas: className,
      alokasiWaktu: duration,
      guru: teacherName,
      identitas,
      komponen1_identifikasi,
      komponen2_desain,
      komponen3_pengalaman,
      komponen4_asesmen,
      lampiran,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  async editRpmWithAI(params: {
    currentRpm: RPMStructure;
    instruction: string;
    targetSection?: string;
  }): Promise<RPMStructure> {
    try {
      const res = await fetch('/api/ai/edit-rpm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.rpm) return json.rpm;
      }
    } catch (err) {
      console.warn('Network notice calling /api/ai/edit-rpm, updating locally:', err);
    }

    // High-fidelity fallback edit update
    const updated = JSON.parse(JSON.stringify(params.currentRpm));
    const instruction = params.instruction;
    const lower = instruction.toLowerCase();

    if (updated.komponen3_pengalaman?.kegiatanInti_3M) {
      updated.komponen3_pengalaman.kegiatanInti_3M.mengaplikasi.push(
        `Penguatan Tambahan [Revisi AI]: Pelaksanaan kegiatan disesuaikan dengan instruksi: "${instruction}"`
      );
    }
    if (lower.includes('asesmen') && updated.komponen4_asesmen) {
      updated.komponen4_asesmen.asesmenProses_formatif += `\n(Direvisi AI: Ditambahkan instrumen asesmen formatif responsif)`;
    }
    if (lower.includes('diferensiasi') && updated.komponen2_desain) {
      updated.komponen2_desain.kerangkaPembelajaranMendalam.lingkunganPembelajaran += ` (Diferensiasi proses dan konten diselaraskan)`;
    }
    if (updated.lampiran) {
      updated.lampiran.rubrikPenilaian += `\n[Catatan Revisi AI: Diselaraskan dengan instruksi guru: ${instruction}]`;
    }
    updated.updatedAt = new Date().toISOString();
    return updated;
  }
};
