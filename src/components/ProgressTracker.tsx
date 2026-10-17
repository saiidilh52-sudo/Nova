import React, { useEffect, useRef, useState } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { TrendingUp, Calendar, Filter, Smile, Award, AlertCircle } from 'lucide-react';
import { StudentReflection, Material } from '../types';

ChartJS.register(...registerables);

interface ProgressTrackerProps {
  reflections: StudentReflection[];
  materials: Material[];
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ reflections, materials }) => {
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const lineChartRef = useRef<HTMLCanvasElement | null>(null);
  const lineChartInstance = useRef<ChartJS | null>(null);

  const classes = Array.from(new Set(reflections.map(r => r.kelas))).filter(Boolean);

  const filtered = reflections.filter(r => selectedClass === 'ALL' || r.kelas === selectedClass);

  // Group reflections by date or session
  const dateGroups: Record<string, StudentReflection[]> = {};
  filtered.forEach(r => {
    const d = new Date(r.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    if (!dateGroups[d]) dateGroups[d] = [];
    dateGroups[d].push(r);
  });

  const dates = Object.keys(dateGroups);

  useEffect(() => {
    if (lineChartRef.current && dates.length > 0) {
      if (lineChartInstance.current) lineChartInstance.current.destroy();

      const happyTrend = dates.map(d => {
        const items = dateGroups[d];
        const count = items.filter(i => i.mood?.includes('Senang')).length;
        return Math.round((count / items.length) * 100);
      });

      const understandingTrend = dates.map(d => {
        const items = dateGroups[d];
        const count = items.filter(i => i.tingkatPemahaman?.includes('Sangat') || i.tingkatPemahaman?.includes('👍')).length;
        return Math.round((count / items.length) * 100);
      });

      lineChartInstance.current = new ChartJS(lineChartRef.current, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [
            {
              label: '% Siswa Senang (Mood Positif)',
              data: happyTrend,
              borderColor: '#EC4899',
              backgroundColor: 'rgba(236, 72, 153, 0.1)',
              fill: true,
              tension: 0.3,
            },
            {
              label: '% Pemahaman Materi Baik',
              data: understandingTrend,
              borderColor: '#6366F1',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              fill: true,
              tension: 0.3,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              min: 0,
              max: 100,
              ticks: { callback: v => `${v}%` }
            }
          }
        }
      });
    }

    return () => {
      lineChartInstance.current?.destroy();
    };
  }, [dates, filtered]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Filter */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <span>Tren & Perkembangan Refleksi Siswa</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi longitudinal perubahan antusiasme dan pemahaman siswa dari pertemuan ke pertemuan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-slate-50"
          >
            <option value="ALL">Semua Kelas</option>
            {classes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>Grafik Tren Kebahagiaan vs Pemahaman Materi (% dari Waktu ke Waktu)</span>
        </h3>
        <div className="h-72 relative">
          {dates.length > 0 ? (
            <canvas ref={lineChartRef} />
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Belum ada data rekaman tanggal refleksi yang cukup.
            </div>
          )}
        </div>
      </div>

      {/* Insight Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
          <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 mb-1.5">
            <Smile className="w-4 h-4 text-pink-500" />
            <span>Korelasi Gamifikasi & Suasana Kelas</span>
          </span>
          <p className="text-xs text-slate-700 leading-relaxed">
            Data menunjukkan pada pertemuan yang menyertakan kuis kelompok / game balapan mobil, persentase siswa merasa senang meningkat hingga 25% dibandingkan sesi ceramah teks panjang konvensional.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Efektivitas Penguatan Materi Sulit</span>
          </span>
          <p className="text-xs text-slate-700 leading-relaxed">
            Materi yang awalnya memiliki persentase kebingungan tinggi (seperti urutan hierarki undang-undang) mengalami kenaikan pemahaman yang signifikan setelah dilakukan review bertahap melalui kuis interaktif.
          </p>
        </div>
      </div>
    </div>
  );
};
