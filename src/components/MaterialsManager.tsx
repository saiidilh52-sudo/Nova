import React, { useState } from 'react';
import { BookOpen, Plus, Sparkles, Trash2, Calendar, Clock, Users, FileText } from 'lucide-react';
import { Material } from '../types';
import { apiService } from '../services/api';

interface MaterialsManagerProps {
  materials: Material[];
  onRefreshMaterials: () => void;
  onAnalyzeMaterial: (material: Material) => void;
}

export const MaterialsManager: React.FC<MaterialsManagerProps> = ({
  materials,
  onRefreshMaterials,
  onAnalyzeMaterial,
}) => {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [mataPelajaran, setMataPelajaran] = useState<string>('Pendidikan Pancasila & Kewarganegaraan');
  const [kelas, setKelas] = useState<string>('X (Fase E)');
  const [topik, setTopik] = useState<string>('');
  const [capaianPembelajaran, setCapaianPembelajaran] = useState<string>('');
  const [tujuanPembelajaran, setTujuanPembelajaran] = useState<string>('');
  const [materi, setMateri] = useState<string>('');
  const [durasi, setDurasi] = useState<string>('2 x 45 Menit (90 Menit)');
  const [karakteristikPesertaDidik, setKarakteristikPesertaDidik] = useState<string>('Aktif, senang belajar visual dan berkelompok.');
  const [catatanGuru, setCatatanGuru] = useState<string>('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!topik.trim()) {
      setFormError('Topik materi wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const activeTeacher = apiService.getActiveTeacher();
      await apiService.saveMaterial({
        teacherId: activeTeacher?.id || 'teacher_demo',
        mataPelajaran,
        kelas,
        topik: topik.trim(),
        capaianPembelajaran: capaianPembelajaran.trim(),
        tujuanPembelajaran: tujuanPembelajaran.trim(),
        materi: materi.trim(),
        durasi,
        karakteristikPesertaDidik: karakteristikPesertaDidik.trim(),
        catatanGuru: catatanGuru.trim(),
      });
      setShowAddForm(false);
      setTopik('');
      setCapaianPembelajaran('');
      setTujuanPembelajaran('');
      setMateri('');
      setCatatanGuru('');
      onRefreshMaterials();
    } catch (e) {
      setFormError('Gagal menyimpan materi. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await apiService.deleteMaterial(id);
    onRefreshMaterials();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <span>Materi Pembelajaran</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola topik dan kompetensi pembelajaran sebagai acuan analisis refleksi siswa
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Tutup Formulir' : 'Tambah Materi Baru'}</span>
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 sm:p-8 border border-indigo-100 shadow-lg space-y-5">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Formulir Materi Pembelajaran
          </h3>

          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">
              ⚠️ {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran *</label>
              <input
                type="text"
                required
                value={mataPelajaran}
                onChange={e => setMataPelajaran(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kelas / Fase *</label>
              <input
                type="text"
                required
                value={kelas}
                onChange={e => setKelas(e.target.value)}
                placeholder="Contoh: X (Fase E)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alokasi Waktu / Durasi *</label>
              <input
                type="text"
                required
                value={durasi}
                onChange={e => setDurasi(e.target.value)}
                placeholder="Contoh: 2 x 45 Menit"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Topik / Materi Pokok *</label>
            <input
              type="text"
              required
              value={topik}
              onChange={e => setTopik(e.target.value)}
              placeholder="Contoh: Hierarki Peraturan Perundang-Undangan di Indonesia"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Capaian Pembelajaran (CP)</label>
              <textarea
                rows={3}
                value={capaianPembelajaran}
                onChange={e => setCapaianPembelajaran(e.target.value)}
                placeholder="Rumusan Capaian Pembelajaran pada fase ini..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tujuan Pembelajaran (TP) *</label>
              <textarea
                rows={3}
                required
                value={tujuanPembelajaran}
                onChange={e => setTujuanPembelajaran(e.target.value)}
                placeholder="Rumusan indikator / tujuan pembelajaran yang ingin dicapai..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ringkasan Materi Pokok</label>
            <textarea
              rows={3}
              value={materi}
              onChange={e => setMateri(e.target.value)}
              placeholder="Poin-poin konsep esensial yang dibahas..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Karakteristik Peserta Didik</label>
              <input
                type="text"
                value={karakteristikPesertaDidik}
                onChange={e => setKarakteristikPesertaDidik(e.target.value)}
                placeholder="Gaya belajar, tingkat antusiasme, kebiasaan belajar..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Khusus Guru</label>
              <input
                type="text"
                value={catatanGuru}
                onChange={e => setCatatanGuru(e.target.value)}
                placeholder="Contoh: Pertemuan sebelumnya banyak yang bingung perbedaan PP dan Perpres"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition"
            >
              {loading ? 'Menyimpan...' : 'SIMPAN MATERI'}
            </button>
          </div>
        </form>
      )}

      {/* Materials List */}
      {materials.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">📚 Belum ada materi pembelajaran</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tambahkan materi untuk mulai menggunakan analisis otomatis NOVA dan menghubungkan suara refleksi siswa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map(mat => (
            <div key={mat.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {mat.mataPelajaran} • {mat.kelas}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(mat.id)}
                    className="text-slate-400 hover:text-red-500 transition p-1"
                    title="Hapus materi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-1.5">{mat.topik}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                  <span className="font-semibold text-slate-700">Tujuan: </span>
                  {mat.tujuanPembelajaran || '-'}
                </p>

                {mat.catatanGuru && (
                  <div className="p-2.5 bg-amber-50 rounded-xl text-[11px] text-amber-800 border border-amber-200/60 mb-3">
                    <span className="font-bold">Catatan Guru: </span>
                    {mat.catatanGuru}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{mat.durasi}</span>
                </span>

                <button
                  type="button"
                  onClick={() => onAnalyzeMaterial(mat)}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>ANALISIS REFLEKSI MATERI INI</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
