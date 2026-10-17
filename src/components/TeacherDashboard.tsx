import React, { useEffect, useRef, useState } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { 
  Smile, 
  Award, 
  AlertTriangle, 
  Gamepad2, 
  Filter, 
  Sparkles, 
  MessageSquare, 
  Search,
  BookOpen,
  Calendar,
  Users
} from 'lucide-react';
import { StudentReflection, Material } from '../types';
import { ShareReflectionModal } from './ShareReflectionModal';

ChartJS.register(...registerables);

interface TeacherDashboardProps {
  reflections: StudentReflection[];
  materials: Material[];
  onTriggerAnalysis: (material?: Material) => void;
  onNavigateToGames: () => void;
  onNavigateToMaterials: () => void;
  onOpenReflectionForm?: (material?: Material) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  reflections,
  materials,
  onTriggerAnalysis,
  onNavigateToGames,
  onNavigateToMaterials,
  onOpenReflectionForm
}) => {
  // Filters & State
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(materials[0]?.id || 'ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showShareReflectionModal, setShowShareReflectionModal] = useState<boolean>(false);

  // Canvas Refs for Chart.js
  const moodChartRef = useRef<HTMLCanvasElement | null>(null);
  const moodChartInstance = useRef<ChartJS | null>(null);

  const understandingChartRef = useRef<HTMLCanvasElement | null>(null);
  const understandingChartInstance = useRef<ChartJS | null>(null);

  const mediaChartRef = useRef<HTMLCanvasElement | null>(null);
  const mediaChartInstance = useRef<ChartJS | null>(null);

  const activityChartRef = useRef<HTMLCanvasElement | null>(null);
  const activityChartInstance = useRef<ChartJS | null>(null);

  // Filter reflections
  const filteredReflections = reflections.filter(r => {
    const matchClass = selectedClass === 'ALL' || r.kelas === selectedClass;
    const matchMat = selectedMaterialId === 'ALL' || r.materialId === selectedMaterialId;
    const matchSearch = !searchQuery || 
      r.namaSiswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.belumDipahami?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.kesan?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchMat && matchSearch;
  });

  const total = filteredReflections.length;

  // Analytics Computation
  const happyCount = filteredReflections.filter(r => r.mood?.includes('Senang')).length;
  const neutralCount = filteredReflections.filter(r => r.mood?.includes('Biasa')).length;
  const confusedCount = filteredReflections.filter(r => r.mood?.includes('Kurang') || r.mood?.includes('Tidak')).length;

  const understoodCount = filteredReflections.filter(r => r.tingkatPemahaman?.includes('Sangat') || r.tingkatPemahaman?.includes('👍')).length;
  const needSupportCount = filteredReflections.filter(r => r.tingkatPemahaman?.includes('Cukup') || r.tingkatPemahaman?.includes('Belum')).length;

  const wantGameCount = filteredReflections.filter(r => 
    r.keinginanPembelajaran?.includes('Game') || 
    r.pilihanAktivitas?.some(a => a.includes('Game')) ||
    r.pilihanMedia?.some(m => m.includes('Game'))
  ).length;

  const percentHappy = total > 0 ? Math.round((happyCount / total) * 100) : 0;
  const percentUnderstood = total > 0 ? Math.round((understoodCount / total) * 100) : 0;
  const percentNeedSupport = total > 0 ? Math.round((needSupportCount / total) * 100) : 0;
  const percentWantGame = total > 0 ? Math.round((wantGameCount / total) * 100) : 0;

  // Unique classes for filter
  const classesList = Array.from(new Set(reflections.map(r => r.kelas))).filter(Boolean);

  // Render Charts with Chart.js
  useEffect(() => {
    // 1. Mood Chart (Doughnut)
    if (moodChartRef.current) {
      if (moodChartInstance.current) moodChartInstance.current.destroy();

      const moodCounts = {
        'Sangat Senang': filteredReflections.filter(r => r.mood?.includes('Sangat Senang')).length,
        'Senang': filteredReflections.filter(r => r.mood?.includes('Senang') && !r.mood?.includes('Sangat')).length,
        'Biasa Saja': filteredReflections.filter(r => r.mood?.includes('Biasa')).length,
        'Kurang Paham': filteredReflections.filter(r => r.mood?.includes('Kurang')).length,
        'Tidak Menyenangkan': filteredReflections.filter(r => r.mood?.includes('Tidak')).length,
      };

      moodChartInstance.current = new ChartJS(moodChartRef.current, {
        type: 'doughnut',
        data: {
          labels: Object.keys(moodCounts),
          datasets: [{
            data: Object.values(moodCounts),
            backgroundColor: ['#EC4899', '#6366F1', '#94A3B8', '#F59E0B', '#EF4444'],
            borderWidth: 2,
            borderColor: '#FFFFFF',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
          }
        }
      });
    }

    // 2. Understanding Chart (Bar)
    if (understandingChartRef.current) {
      if (understandingChartInstance.current) understandingChartInstance.current.destroy();

      const uCounts = {
        'Sangat Paham': filteredReflections.filter(r => r.tingkatPemahaman?.includes('Sangat')).length,
        'Paham': filteredReflections.filter(r => r.tingkatPemahaman?.includes('👍') || r.tingkatPemahaman === 'Paham').length,
        'Cukup Paham': filteredReflections.filter(r => r.tingkatPemahaman?.includes('Cukup')).length,
        'Belum Paham': filteredReflections.filter(r => r.tingkatPemahaman?.includes('Belum')).length,
      };

      understandingChartInstance.current = new ChartJS(understandingChartRef.current, {
        type: 'bar',
        data: {
          labels: Object.keys(uCounts),
          datasets: [{
            label: 'Jumlah Siswa',
            data: Object.values(uCounts),
            backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } }
          }
        }
      });
    }

    // 3. Media Preferences (Horizontal Bar)
    if (mediaChartRef.current) {
      if (mediaChartInstance.current) mediaChartInstance.current.destroy();

      const mediaTally: Record<string, number> = {};
      filteredReflections.forEach(r => {
        (r.pilihanMedia || []).forEach(m => {
          const clean = m.replace(/[^\w\s/]/gi, '').trim();
          mediaTally[clean] = (mediaTally[clean] || 0) + 1;
        });
      });

      const labels = Object.keys(mediaTally);
      const values = Object.values(mediaTally);

      mediaChartInstance.current = new ChartJS(mediaChartRef.current, {
        type: 'bar',
        data: {
          labels: labels.length > 0 ? labels : ['Belum Ada'],
          datasets: [{
            label: 'Pilihan Siswa',
            data: values.length > 0 ? values : [0],
            backgroundColor: '#8B5CF6',
            borderRadius: 6,
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }
        }
      });
    }

    // 4. Activity Preferences (Doughnut / Bar)
    if (activityChartRef.current) {
      if (activityChartInstance.current) activityChartInstance.current.destroy();

      const actTally: Record<string, number> = {};
      filteredReflections.forEach(r => {
        (r.pilihanAktivitas || []).forEach(a => {
          const clean = a.replace(/[^\w\s/]/gi, '').trim();
          actTally[clean] = (actTally[clean] || 0) + 1;
        });
      });

      activityChartInstance.current = new ChartJS(activityChartRef.current, {
        type: 'bar',
        data: {
          labels: Object.keys(actTally).length > 0 ? Object.keys(actTally) : ['Belum Ada'],
          datasets: [{
            label: 'Peminat Aktivitas',
            data: Object.values(actTally).length > 0 ? Object.values(actTally) : [0],
            backgroundColor: '#06B6D4',
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
        }
      });
    }

    return () => {
      moodChartInstance.current?.destroy();
      understandingChartInstance.current?.destroy();
      mediaChartInstance.current?.destroy();
      activityChartInstance.current?.destroy();
    };
  }, [filteredReflections]);

  const activeMaterial = materials.find(m => m.id === selectedMaterialId) || materials[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Kolom Materi Hari Ini & Tombol Buat Refleksi */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-indigo-800/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Materi Hari Ini</span>
              </span>

              {materials.length > 1 && (
                <div className="flex items-center gap-1.5 text-xs text-indigo-200">
                  <span>Ganti:</span>
                  <select
                    value={activeMaterial?.id || ''}
                    onChange={e => setSelectedMaterialId(e.target.value)}
                    className="bg-white/10 text-white border border-white/20 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-300"
                  >
                    {materials.map(m => (
                      <option key={m.id} value={m.id} className="text-slate-900">
                        {m.topik} ({m.mataPelajaran})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {activeMaterial ? (
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {activeMaterial.topik}
                </h2>
                <p className="text-xs text-indigo-200 mt-1">
                  <span className="font-bold text-amber-300">{activeMaterial.mataPelajaran}</span> • Kelas {activeMaterial.kelas} • Durasi {activeMaterial.durasi}
                </p>
                {activeMaterial.tujuanPembelajaran && (
                  <p className="text-xs text-slate-300 line-clamp-2 mt-2 bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <strong className="text-indigo-200">Tujuan: </strong>{activeMaterial.tujuanPembelajaran}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-white">Belum Ada Materi Terpilih</h2>
                <p className="text-xs text-slate-300 mt-1">
                  Tambahkan materi pembelajaran baru untuk mengaitkan suara refleksi siswa.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons: Buat Refleksi & Analisis */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowShareReflectionModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-200" />
              <span>🚀 BUAT REFLEKSI</span>
            </button>

            <button
              type="button"
              onClick={() => onTriggerAnalysis(activeMaterial)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-3.5 rounded-2xl font-bold text-xs hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              <span>🤖 ANALISIS NOVA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Action & Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Filter Data:</span>
          </div>

          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-slate-50 focus:bg-white"
          >
            <option value="ALL">Semua Kelas ({reflections.length} Siswa)</option>
            {classesList.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedMaterialId}
            onChange={e => setSelectedMaterialId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-slate-50 focus:bg-white max-w-[200px] truncate"
          >
            <option value="ALL">Semua Materi Pembelajaran</option>
            {materials.map(m => (
              <option key={m.id} value={m.id}>
                {m.topik} ({m.kelas})
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onNavigateToMaterials}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
        >
          <BookOpen className="w-4 h-4" />
          <span>Kelola Semua Materi</span>
        </button>
      </div>

      {/* EMPTY STATE */}
      {total === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            📭 Belum ada data refleksi siswa
          </h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Minta siswa mengisi refleksi melalui dashboard siswa terlebih dahulu agar NOVA dapat mengolah data dan memberikan insight pembelajaran yang akurat.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={onNavigateToMaterials}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
            >
              Kelola Materi Pembelajaran
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Mood */}
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-5 text-white shadow-lg shadow-pink-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-100">
                  📊 Mood Siswa
                </span>
                <span className="p-2 bg-white/20 rounded-xl">
                  <Smile className="w-5 h-5 text-white" />
                </span>
              </div>
              <div>
                <div className="text-3xl font-black mb-1">{percentHappy}%</div>
                <p className="text-xs text-pink-100 leading-snug">
                  {percentHappy}% siswa merasa senang & antusias mengikuti sesi.
                </p>
              </div>
            </div>

            {/* 2. Understanding */}
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">
                  📚 Pemahaman
                </span>
                <span className="p-2 bg-white/20 rounded-xl">
                  <Award className="w-5 h-5 text-white" />
                </span>
              </div>
              <div>
                <div className="text-3xl font-black mb-1">{percentUnderstood}%</div>
                <p className="text-xs text-indigo-100 leading-snug">
                  {percentUnderstood}% siswa memahami konsep inti dengan baik.
                </p>
              </div>
            </div>

            {/* 3. Difficult Concepts */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-amber-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
                  ⚠️ Materi Belum Dipahami
                </span>
                <span className="p-2 bg-white/20 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </span>
              </div>
              <div>
                <div className="text-3xl font-black mb-1">{percentNeedSupport}%</div>
                <p className="text-xs text-amber-100 leading-snug">
                  {percentNeedSupport}% siswa masih membutuhkan penguatan konsep tertentu.
                </p>
              </div>
            </div>

            {/* 4. Games / Media */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-purple-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
                  🎮 Minat Media / Game
                </span>
                <span className="p-2 bg-white/20 rounded-xl">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </span>
              </div>
              <div>
                <div className="text-3xl font-black mb-1">{percentWantGame}%</div>
                <p className="text-xs text-purple-200 leading-snug">
                  {percentWantGame}% siswa mendambakan game & aktivitas kolaboratif.
                </p>
              </div>
            </div>
          </div>

          {/* 4 Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Mood */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Smile className="w-4 h-4 text-pink-500" />
                  <span>Distribusi Emosi & Mood Siswa</span>
                </h4>
                <span className="text-xs font-semibold text-slate-400">{total} Respon</span>
              </div>
              <div className="h-64 relative">
                <canvas ref={moodChartRef} />
              </div>
            </div>

            {/* Chart 2: Understanding */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-500" />
                  <span>Tingkat Pemahaman Konsep Materi</span>
                </h4>
                <span className="text-xs font-semibold text-slate-400">Skala 4 Tingkat</span>
              </div>
              <div className="h-64 relative">
                <canvas ref={understandingChartRef} />
              </div>
            </div>

            {/* Chart 3: Media */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-purple-500" />
                  <span>Media Pembelajaran yang Diinginkan</span>
                </h4>
                <span className="text-xs font-semibold text-slate-400">Frekuensi Pilihan</span>
              </div>
              <div className="h-64 relative">
                <canvas ref={mediaChartRef} />
              </div>
            </div>

            {/* Chart 4: Activities */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-500" />
                  <span>Aktivitas Belajar Terfavorit Siswa</span>
                </h4>
                <span className="text-xs font-semibold text-slate-400">Multi-Pilihan</span>
              </div>
              <div className="h-64 relative">
                <canvas ref={activityChartRef} />
              </div>
            </div>
          </div>

          {/* Student Voices & Comments Stream */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  <span>Suara & Refleksi Siswa ({filteredReflections.length})</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Narasi orisinal murid tentang pemahaman dan kebutuhan belajarnya
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari nama atau topik sulit..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
              {filteredReflections.map(r => (
                <div key={r.id} className="py-4 hover:bg-slate-50/60 rounded-xl px-2 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{r.namaSiswa}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 font-medium text-slate-600">
                        {r.kelas} • No. {r.noAbsen}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                        {r.mood}
                      </span>
                      <span className="text-xs font-medium text-slate-600">
                        {r.tingkatPemahaman}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700 mt-2">
                    <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <span className="font-bold text-emerald-800 block mb-0.5">Sudah Dipahami:</span>
                      <p>{r.sudahDipahami || '-'}</p>
                    </div>

                    <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-100">
                      <span className="font-bold text-amber-800 block mb-0.5">Belum Dipahami:</span>
                      <p>{r.belumDipahami || '-'}</p>
                    </div>
                  </div>

                  {r.harapanBerikutnya && (
                    <div className="mt-2 text-xs text-slate-600 italic">
                      <span className="font-semibold text-slate-700">Harapan ke depan: </span>
                      "{r.harapanBerikutnya}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Modal Bagikan Sesi Refleksi Siswa */}
      {showShareReflectionModal && (
        <ShareReflectionModal
          material={activeMaterial}
          onClose={() => setShowShareReflectionModal(false)}
          onOpenFormNow={mat => {
            setShowShareReflectionModal(false);
            if (onOpenReflectionForm) {
              onOpenReflectionForm(mat);
            }
          }}
        />
      )}
    </div>
  );
};
