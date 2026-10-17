import React, { useState } from 'react';
import { 
  Gamepad2, 
  Plus, 
  Sparkles, 
  Play, 
  Trash2, 
  Copy, 
  Clock, 
  Users, 
  HelpCircle, 
  Award,
  Filter,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Share2,
  ArrowLeft
} from 'lucide-react';
import { EducationalGame, Material, RPMStructure } from '../types';
import { apiService } from '../services/api';
import { PlayableGameModal } from './PlayableGameModal';
import { ShareGameModal } from './ShareGameModal';

interface GameStudioProps {
  games: EducationalGame[];
  materials: Material[];
  rpms?: RPMStructure[];
  onRefreshGames: () => void;
  initialParams?: any;
  onBack?: () => void;
  onNavigateToRPM?: (rpmId?: string) => void;
}

export const GAME_CATEGORIES = [
  '🏎️ Balapan Mobil',
  '🎯 Quiz Battle',
  '🎡 Roda Keberuntungan',
  '🧠 Puzzle',
  '🃏 Kartu Pertanyaan',
  '⚡ Cepat Tepat',
  '🔤 Tebak Kata',
  '❓ Benar/Salah',
  '🏆 Jeopardy',
  '🔐 Escape Room',
  '👥 Team Challenge',
  '💰 Millionaire Quiz',
  '🎲 Dadu Tantangan'
];

export const GameStudio: React.FC<GameStudioProps> = ({
  games,
  materials,
  rpms,
  onRefreshGames,
  initialParams,
  onBack,
  onNavigateToRPM
}) => {
  const [activeTab, setActiveTab] = useState<'bank' | 'creator'>(initialParams ? 'creator' : 'bank');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedGameForPlay, setSelectedGameForPlay] = useState<EducationalGame | null>(null);
  const [selectedGameForShare, setSelectedGameForShare] = useState<EducationalGame | null>(null);
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);

  // Link to RPM
  const [selectedRpmId, setSelectedRpmId] = useState<string>(initialParams?.rpmId || '');

  // Generator State
  const [mataPelajaran, setMataPelajaran] = useState<string>(initialParams?.mataPelajaran || 'Pendidikan Pancasila & Kewarganegaraan');
  const [kelas, setKelas] = useState<string>(initialParams?.kelas || 'X (Fase E)');
  const [materi, setMateri] = useState<string>(initialParams?.materi || 'Hierarki Perundang-Undangan & Norma Hukum');
  const [tujuan, setTujuan] = useState<string>(initialParams?.tujuan || 'Memahami tata urutan norma dan UU di Indonesia');
  const [jumlahSiswa, setJumlahSiswa] = useState<number>(32);
  const [durasi, setDurasi] = useState<number>(20);
  const [jenisGame, setJenisGame] = useState<string>(initialParams?.jenisGame || 'Balapan Mobil');
  const [tingkatKesulitan, setTingkatKesulitan] = useState<string>('Sedang');

  const [loading, setLoading] = useState<boolean>(false);
  const [generatorError, setGeneratorError] = useState<string | null>(null);

  const handleSelectRpm = (rpmId: string) => {
    setSelectedRpmId(rpmId);
    const matchedRpm = rpms?.find(r => r.id === rpmId);
    if (matchedRpm) {
      setMataPelajaran(matchedRpm.mataPelajaran);
      setKelas(matchedRpm.kelas);
      setMateri(matchedRpm.sections.A_identitas.materi || matchedRpm.judul);
      if (matchedRpm.sections.D_tujuanPembelajaran?.[0]) {
        setTujuan(matchedRpm.sections.D_tujuanPembelajaran[0]);
      }
    }
  };

  const handleGenerateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneratorError(null);
    try {
      const activeTeacher = apiService.getActiveTeacher();
      const generated = await apiService.generateGameWithAI({
        mataPelajaran,
        kelas,
        materi,
        tujuan,
        jumlahSiswa,
        durasi,
        jenisGame,
        tingkatKesulitan,
      });

      // Save to game bank with rpmId linkage
      const saved = await apiService.saveGame({
        ...generated,
        teacherId: activeTeacher?.id || 'teacher_demo',
        rpmId: selectedRpmId || undefined,
      });

      onRefreshGames();
      setActiveTab('bank');
      setExpandedGameId(saved.id);
    } catch (err: any) {
      setGeneratorError('Gagal merancang game: ' + (err.message || 'Coba beberapa saat lagi'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGame = async (id: string) => {
    await apiService.deleteGame(id);
    onRefreshGames();
  };

  const handleDuplicateGame = async (game: EducationalGame) => {
    const copy = {
      ...game,
      namaGame: `${game.namaGame} (Duplikat)`,
      id: undefined,
    };
    await apiService.saveGame(copy);
    onRefreshGames();
  };

  const filteredGames = games.filter(g => {
    if (selectedCategory === 'ALL') return true;
    return g.kategori?.includes(selectedCategory.replace(/[^a-zA-Z0-9 ]/g, '').trim());
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Navigation Switch */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {(onBack || activeTab === 'creator') && (
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'creator') {
                  setActiveTab('bank');
                } else if (onBack) {
                  onBack();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer shrink-0"
              title="Kembali ke sebelumnya"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
          )}
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-indigo-600" />
              <span>Bank & Studio Game Edukasi NOVA</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rancang game interaktif dengan AI dan mainkan langsung di browser bersama murid
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('bank')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'bank' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎮 Bank Game ({games.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('creator')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'creator' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ Buat Game Baru</span>
          </button>
        </div>
      </div>

      {/* TAB 1: BANK GAME */}
      {activeTab === 'bank' && (
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold shrink-0 transition ${
                selectedCategory === 'ALL'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Semua Kategori
            </button>
            {GAME_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold shrink-0 transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Games Grid */}
          {filteredGames.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Gamepad2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">🎮 Belum ada game dalam kategori ini</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Gunakan tab "Buat Game Baru" untuk merancang game pembelajaran pertama menggunakan AI NOVA.
              </p>
              <button
                onClick={() => setActiveTab('creator')}
                className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                Buat Game Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGames.map(g => {
                const isExpanded = expandedGameId === g.id;
                return (
                  <div key={g.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          {g.kategori}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDuplicateGame(g)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition"
                            title="Duplikasi game"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGame(g.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition"
                            title="Hapus game"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base mb-1">{g.namaGame}</h3>
                      <p className="text-xs text-slate-600 mb-2">
                        <span className="font-semibold text-slate-700">Materi: </span>{g.materi} ({g.mataPelajaran} - {g.kelas})
                      </p>

                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>{g.jumlahPemain}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{g.durasi}</span>
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-indigo-600">
                          {g.pertanyaan?.length || 0} Soal Kuis
                        </span>
                      </div>

                      {/* Expandable Preview */}
                      <button
                        type="button"
                        onClick={() => setExpandedGameId(isExpanded ? null : g.id)}
                        className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1 py-1"
                      >
                        <span>{isExpanded ? 'Tutup Rincian' : 'Lihat Aturan & Soal'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs space-y-2 border border-slate-200">
                          <div>
                            <span className="font-bold text-slate-800 block">Tujuan:</span>
                            <p className="text-slate-600">{g.tujuan}</p>
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block">Sistem Skor:</span>
                            <p className="text-slate-600">{g.sistemSkor}</p>
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block">Pertanyaan ({g.pertanyaan?.length}):</span>
                            <ul className="list-disc pl-4 text-slate-600 space-y-1 mt-1">
                              {g.pertanyaan?.map(q => (
                                <li key={q.id}>
                                  <span className="font-medium">{q.soal}</span> (Kunci: {q.kunci})
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Terhubung dengan RPM */}
                      {g.rpmId && (
                        <div className="mt-2.5 p-2 bg-purple-50 text-purple-900 rounded-xl border border-purple-200 text-[11px] flex items-center justify-between">
                          <span className="font-semibold">📋 Terintegrasi dengan Dokumen RPM</span>
                          {onNavigateToRPM && (
                            <button
                              type="button"
                              onClick={() => onNavigateToRPM(g.rpmId)}
                              className="font-bold text-purple-700 underline hover:text-purple-900 cursor-pointer"
                            >
                              Lihat RPM
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action: PLAY & SHARE GAME */}
                    <div className="pt-4 mt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedGameForShare(g)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
                        title="Bagikan Tautan & Kode PIN Game ke Siswa"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>🔗 Bagikan ke Siswa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedGameForPlay(g)}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>▶️ MAINKAN DI BROWSER</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GENERATOR GAME */}
      {activeTab === 'creator' && (
        <form onSubmit={handleGenerateGame} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <button
                type="button"
                onClick={() => setActiveTab('bank')}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600 transition cursor-pointer mb-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Kembali ke Bank Game</span>
              </button>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>✨ Rancang Game Pembelajaran NOVA dengan AI</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                AI akan menyusun mekanika, aturan, daftar soal kuis, kunci jawaban, dan visualisasi permainan interaktif yang berkesinambungan dengan materi pembelajaran.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('bank')}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 self-start sm:self-auto cursor-pointer"
            >
              Batal
            </button>
          </div>

          {generatorError && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold">
              ⚠️ {generatorError}
            </div>
          )}

          {/* Interkoneksi Game & Dokumen RPM */}
          {rpms && rpms.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 space-y-1.5">
              <label className="block text-xs font-black text-purple-950">
                📋 Selaraskan Game ini dengan Dokumen RPM (Berkesinambungan):
              </label>
              <select
                value={selectedRpmId}
                onChange={e => handleSelectRpm(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-purple-300 text-xs font-semibold text-purple-950 bg-white"
              >
                <option value="">(Opsional: Pilih RPM untuk menyelaraskan topik & tujuan otomatis)</option>
                {rpms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.judul} ({r.mataPelajaran} - {r.kelas})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-purple-700">
                Memilih RPM akan otomatis mengintegrasikan topik, fase kelas, dan capaian pembelajaran sehingga game dan RPM berjalan berkesinambungan.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran</label>
              <input
                type="text"
                required
                value={mataPelajaran}
                onChange={e => setMataPelajaran(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kelas</label>
              <input
                type="text"
                required
                value={kelas}
                onChange={e => setKelas(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Siswa</label>
              <input
                type="number"
                value={jumlahSiswa}
                onChange={e => setJumlahSiswa(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Durasi Game (Menit)</label>
              <input
                type="number"
                value={durasi}
                onChange={e => setDurasi(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Topik / Materi Pokok *</label>
              <input
                type="text"
                required
                value={materi}
                onChange={e => setMateri(e.target.value)}
                placeholder="Contoh: Hierarki Peraturan Perundang-Undangan UU 12/2011"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Jenis / Format Game *</label>
              <select
                value={jenisGame}
                onChange={e => setJenisGame(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Balapan Mobil">🏎️ Balapan Mobil (Car Racing Quiz)</option>
                <option value="Quiz Battle">🎯 Quiz Battle (Adu Cepat Tim)</option>
                <option value="Roda Keberuntungan">🎡 Roda Keberuntungan</option>
                <option value="Tebak Kata">🔤 Tebak Kata Edukasi</option>
                <option value="Puzzle">🧠 Puzzle Logika & Konsep</option>
                <option value="Benar/Salah">❓ Benar/Salah Cepat</option>
                <option value="Jeopardy">🏆 Jeopardy Poin Bertingkat</option>
                <option value="Team Challenge">👥 Team Challenge Kolaboratif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tujuan Pembelajaran</label>
            <textarea
              rows={2}
              value={tujuan}
              onChange={e => setTujuan(e.target.value)}
              placeholder="Contoh: Menguji dan memperdalam pemahaman konsep materi secara kompetitif dan sportif..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('bank')}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Bank Game</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-7 py-3 rounded-xl font-black text-xs shadow-lg shadow-purple-200 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>🎮 NOVA sedang membuat game...</span>
                </>
              ) : (
                <>
                  <Gamepad2 className="w-4 h-4" />
                  <span>🎮 BUAT GAME</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Real Playable Game Modal */}
      {selectedGameForPlay && (
        <PlayableGameModal
          game={selectedGameForPlay}
          onClose={() => setSelectedGameForPlay(null)}
        />
      )}

      {/* Share Game to Students Modal */}
      {selectedGameForShare && (
        <ShareGameModal
          game={selectedGameForShare}
          onClose={() => setSelectedGameForShare(null)}
          onPlayNow={g => {
            setSelectedGameForShare(null);
            setSelectedGameForPlay(g);
          }}
        />
      )}
    </div>
  );
};
