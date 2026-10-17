import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  Smile, 
  AlertTriangle, 
  Gamepad2, 
  Compass, 
  BookOpen, 
  ArrowRight, 
  FileText,
  CheckCircle,
  Lightbulb,
  Target,
  Download,
  FileSpreadsheet,
  Printer,
  Users,
  BarChart3,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { NovaAnalysis, Material, StudentReflection } from '../types';
import { apiService } from '../services/api';

interface NovaInsightViewProps {
  analysis: NovaAnalysis | null;
  activeMaterial?: Material;
  materials?: Material[];
  reflections: StudentReflection[];
  onAnalysisGenerated: (analysis: NovaAnalysis) => void;
  onNavigateToGameGenerator: (recommendedGameData: any) => void;
  onNavigateToRPM: (analysis: NovaAnalysis, material?: Material) => void;
}

export const NovaInsightView: React.FC<NovaInsightViewProps> = ({
  analysis,
  activeMaterial,
  materials = [],
  reflections,
  onAnalysisGenerated,
  onNavigateToGameGenerator,
  onNavigateToRPM
}) => {
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(activeMaterial?.id || 'ALL');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showStudentList, setShowStudentList] = useState<boolean>(true);
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [downloadNotice, setDownloadNotice] = useState<string>('');

  // Target material based on selection
  const currentMaterial = selectedMaterialId === 'ALL'
    ? activeMaterial || materials[0]
    : materials.find(m => m.id === selectedMaterialId) || activeMaterial;

  // Filter reflections for the chosen material (or all)
  const targetReflections = reflections.filter(r => {
    if (selectedMaterialId === 'ALL') return true;
    return r.materialId === selectedMaterialId || (!r.materialId && selectedMaterialId === activeMaterial?.id);
  });

  // Calculate live reflection preview statistics
  const totalReflections = targetReflections.length;
  const happyStudents = targetReflections.filter(r => r.mood?.includes('Senang') || r.mood?.includes('😍') || r.mood?.includes('😊')).length;
  const pctHappy = totalReflections > 0 ? Math.round((happyStudents / totalReflections) * 100) : 0;
  
  const needHelpStudents = targetReflections.filter(r => 
    r.mood?.includes('Kurang') || r.mood?.includes('Tidak') || r.mood?.includes('😕') || r.mood?.includes('😞') ||
    r.tingkatPemahaman?.includes('Belum') || r.tingkatPemahaman?.includes('Cukup') || r.tingkatPemahaman?.includes('❓')
  ).length;
  const pctNeedHelp = totalReflections > 0 ? Math.round((needHelpStudents / totalReflections) * 100) : 0;

  // Accurate breakdown of Understanding levels
  const cntSangatPaham = targetReflections.filter(r => r.tingkatPemahaman?.includes('Sangat')).length;
  const cntPaham = targetReflections.filter(r => r.tingkatPemahaman === '👍 Paham' || (r.tingkatPemahaman?.includes('Paham') && !r.tingkatPemahaman?.includes('Sangat') && !r.tingkatPemahaman?.includes('Cukup') && !r.tingkatPemahaman?.includes('Belum'))).length;
  const cntCukupPaham = targetReflections.filter(r => r.tingkatPemahaman?.includes('Cukup')).length;
  const cntBelumPaham = targetReflections.filter(r => r.tingkatPemahaman?.includes('Belum')).length;

  const pctSangatPaham = totalReflections > 0 ? Math.round((cntSangatPaham / totalReflections) * 100) : 0;
  const pctPahamNormal = totalReflections > 0 ? Math.round((cntPaham / totalReflections) * 100) : 0;
  const pctCukupPaham = totalReflections > 0 ? Math.round((cntCukupPaham / totalReflections) * 100) : 0;
  const pctBelumPaham = totalReflections > 0 ? Math.round((cntBelumPaham / totalReflections) * 100) : 0;

  // Accurate tally of student challenges (Bagian Menantang)
  const challengeTally: Record<string, number> = {};
  targetReflections.forEach(r => {
    if (r.bagianMenantang && typeof r.bagianMenantang === 'string') {
      const clean = r.bagianMenantang.trim();
      if (clean) challengeTally[clean] = (challengeTally[clean] || 0) + 1;
    }
  });

  const challengeStatsList = Object.entries(challengeTally)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      label,
      count,
      pct: totalReflections > 0 ? Math.round((count / totalReflections) * 100) : 0
    }));

  // Accurate media preference tally
  const mediaTally: Record<string, number> = {};
  targetReflections.forEach(r => {
    (Array.isArray(r.pilihanMedia) ? r.pilihanMedia : []).forEach(m => {
      const clean = String(m).trim();
      if (clean) mediaTally[clean] = (mediaTally[clean] || 0) + 1;
    });
  });
  const topMediaList = Object.entries(mediaTally)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      label,
      count,
      pct: totalReflections > 0 ? Math.round((count / totalReflections) * 100) : 0
    }));

  // Accurate activity preference tally
  const activityTally: Record<string, number> = {};
  targetReflections.forEach(r => {
    (Array.isArray(r.pilihanAktivitas) ? r.pilihanAktivitas : []).forEach(a => {
      const clean = String(a).trim();
      if (clean) activityTally[clean] = (activityTally[clean] || 0) + 1;
    });
  });
  const topActivityList = Object.entries(activityTally)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      label,
      count,
      pct: totalReflections > 0 ? Math.round((count / totalReflections) * 100) : 0
    }));

  // Filtered students for in-app table search
  const filteredStudents = targetReflections.filter(r => {
    if (!searchStudent.trim()) return true;
    const q = searchStudent.toLowerCase();
    return (
      (r.namaSiswa || '').toLowerCase().includes(q) ||
      (r.kelas || '').toLowerCase().includes(q) ||
      (r.bagianMenantang || '').toLowerCase().includes(q) ||
      (r.belumDipahami || '').toLowerCase().includes(q)
    );
  });

  // Export full student reflections & statistical analysis to CSV / Excel
  const handleDownloadStudentDataCsv = () => {
    if (targetReflections.length === 0) {
      setErrorMsg('Belum ada data refleksi siswa untuk diunduh.');
      return;
    }

    const matName = currentMaterial?.topik || 'Mata Pelajaran';
    const subName = currentMaterial?.mataPelajaran || 'Umum';
    const kelasName = currentMaterial?.kelas || '-';
    const timestampStr = new Date().toLocaleString('id-ID');

    // UTF-8 BOM so Excel opens Indonesian accents/symbols without encoding issues
    let csv = '\uFEFF';
    csv += `LAPORAN REKAPITULASI DATA SISWA & ANALISIS PERSENTASE NOVA INSIGHT\n`;
    csv += `Mata Pelajaran:,"${subName.replace(/"/g, '""')}"\n`;
    csv += `Topik / Materi:,"${matName.replace(/"/g, '""')}"\n`;
    csv += `Kelas / Fase:,"${kelasName.replace(/"/g, '""')}"\n`;
    csv += `Waktu Unduh Data:,"${timestampStr}"\n`;
    csv += `Total Siswa Mengisi:,"${totalReflections} Siswa"\n`;
    csv += `Persentase Antusias / Positif:,"${pctHappy}% (${happyStudents} siswa)"\n`;
    csv += `Persentase Butuh Bimbingan:,"${pctNeedHelp}% (${needHelpStudents} siswa)"\n`;
    csv += `\n`;

    // 1. RINGKASAN PERSENTASE TINGKAT PEMAHAMAN
    csv += `--- RINGKASAN PERSENTASE TINGKAT PEMAHAMAN KELAS ---\n`;
    csv += `Tingkat Pemahaman,Persentase,Jumlah Siswa,Deskripsi\n`;
    csv += `"⭐ Sangat Paham",${pctSangatPaham}%,${cntSangatPaham},"Bisa menjelaskan ke teman"\n`;
    csv += `"👍 Paham",${pctPahamNormal}%,${cntPaham},"Mengerti konsep utama materi"\n`;
    csv += `"😐 Cukup Paham",${pctCukupPaham}%,${cntCukupPaham},"Masih ragu pada beberapa bagian"\n`;
    csv += `"❓ Belum Paham",${pctBelumPaham}%,${cntBelumPaham},"Perlu bimbingan & penjelasan ulang"\n`;
    csv += `\n`;

    // 2. TABULASI TANTANGAN PEMBELAJARAN (PPKn & MATA PELAJARAN LAIN)
    csv += `--- DISTRIBUSI TANTANGAN PEMAHAMAN SISWA (PPKn & MAPEL LAIN) ---\n`;
    csv += `Bagian yang Paling Menantang,Persentase Siswa,Jumlah Siswa\n`;
    if (challengeStatsList.length > 0) {
      challengeStatsList.forEach(item => {
        csv += `"${item.label.replace(/"/g, '""')}",${item.pct}%,${item.count}\n`;
      });
    } else {
      csv += `"Tidak ada data tantangan khusus",0%,0\n`;
    }
    csv += `\n`;

    // 3. PREFERENSI MEDIA & AKTIVITAS
    csv += `--- PREFERENSI MEDIA & AKTIVITAS FAVORIT SISWA ---\n`;
    csv += `Kategori,Pilihan Siswa,Jumlah Pemilih,Persentase\n`;
    topMediaList.forEach(m => {
      csv += `"Media Belajar","${m.label.replace(/"/g, '""')}",${m.count},${m.pct}%\n`;
    });
    topActivityList.forEach(a => {
      csv += `"Aktivitas Kelas","${a.label.replace(/"/g, '""')}",${a.count},${a.pct}%\n`;
    });
    csv += `\n`;

    // 4. DATA LENGKAP DETAIL SISWA
    csv += `--- TABEL DATA SISWA YANG MENGISI REFLEKSI (LENGKAP) ---\n`;
    csv += `No,Nama Siswa,Kelas,No Absen,Mood / Emosi,Alasan Mood,Tingkat Pemahaman,Bagian Paling Menantang,Apa yang Sudah Dipahami,Apa yang Belum Dipahami,Hal yang Paling Disukai,Pilihan Media,Pilihan Aktivitas,Gaya Belajar,Bantuan Guru Dibutuhkan,Suasana Belajar Impian,Harapan Siswa,Waktu Pengisian\n`;

    targetReflections.forEach((r, idx) => {
      const row = [
        idx + 1,
        `"${(r.namaSiswa || '').replace(/"/g, '""')}"`,
        `"${(r.kelas || '').replace(/"/g, '""')}"`,
        `"${(r.noAbsen || '').replace(/"/g, '""')}"`,
        `"${(r.mood || '').replace(/"/g, '""')}"`,
        `"${(r.alasanMood || '').replace(/"/g, '""')}"`,
        `"${(r.tingkatPemahaman || '').replace(/"/g, '""')}"`,
        `"${(r.bagianMenantang || '').replace(/"/g, '""')}"`,
        `"${(r.sudahDipahami || '').replace(/"/g, '""')}"`,
        `"${(r.belumDipahami || '').replace(/"/g, '""')}"`,
        `"${(r.halDisukai || '').replace(/"/g, '""')}"`,
        `"${(Array.isArray(r.pilihanMedia) ? r.pilihanMedia.join('; ') : '').replace(/"/g, '""')}"`,
        `"${(Array.isArray(r.pilihanAktivitas) ? r.pilihanAktivitas.join('; ') : '').replace(/"/g, '""')}"`,
        `"${(Array.isArray(r.gayaBelajar) ? r.gayaBelajar.join('; ') : '').replace(/"/g, '""')}"`,
        `"${(Array.isArray(r.bantuanGuruDibutuhkan) ? r.bantuanGuruDibutuhkan.join('; ') : '').replace(/"/g, '""')}"`,
        `"${(r.suasanaBelajar || '').replace(/"/g, '""')}"`,
        `"${(r.harapanBerikutnya || '').replace(/"/g, '""')}"`,
        `"${(r.timestamp ? new Date(r.timestamp).toLocaleString('id-ID') : '-').replace(/"/g, '""')}"`
      ];
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTopic = (currentMaterial?.topik || 'Refleksi').replace(/[^a-zA-Z0-9]/g, '_');
    const safeFilename = `Rekap_Siswa_NOVA_${safeTopic}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', safeFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadNotice(`✅ File rekap siswa & persentase berhasil diunduh (${safeFilename})!`);
    setTimeout(() => setDownloadNotice(''), 6000);
  };

  // Extract real student quote samples from belumDipahami or bagianMenantang
  const sampledDifficulties: string[] = [];
  targetReflections.forEach(r => {
    if (r.belumDipahami && typeof r.belumDipahami === 'string' && r.belumDipahami.trim().length > 2) {
      const clean = r.belumDipahami.trim();
      if (!clean.toLowerCase().match(/^(tidak ada|gada|ngga ada|paham semua|nihil|aman|-|\.)$/)) {
        sampledDifficulties.push(clean);
      }
    }
    if (r.bagianMenantang && typeof r.bagianMenantang === 'string') {
      const cleanChip = r.bagianMenantang.replace(/^[^\w\s]+/, '').trim();
      if (cleanChip.length > 2 && !cleanChip.toLowerCase().includes('lancar')) {
        sampledDifficulties.push(cleanChip);
      }
    }
  });
  const topDifficultTags = Array.from(new Set(sampledDifficulties)).slice(0, 4);

  const runAnalysis = async () => {
    if (targetReflections.length === 0) {
      setErrorMsg('Belum ada data refleksi siswa untuk materi ini. Ajak siswa mengisi refleksi pembelajaran terlebih dahulu.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await apiService.analyzeReflections(targetReflections, currentMaterial);
      onAnalysisGenerated(res);
    } catch (err: any) {
      setErrorMsg(err.message || '⚠️ Maaf, terjadi kendala saat memproses analisis NOVA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Edu-Analytics Engine • Refleksi Siswa</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              NOVA INSIGHT
            </h1>
            <p className="text-indigo-200 text-xs sm:text-sm mt-1 leading-relaxed">
              Analisis cerdas dan presisi terhadap suara dan pengalaman siswa untuk menentukan arah pembelajaran serta perancangan RPM berikutnya.
            </p>
            {currentMaterial && (
              <div className="mt-3 text-xs bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5 inline-block text-white">
                Fokus Analisis: <span className="font-bold text-amber-300">{currentMaterial.topik}</span> ({currentMaterial.mataPelajaran})
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <button
              type="button"
              onClick={runAnalysis}
              disabled={loading || targetReflections.length === 0}
              className="w-full md:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 px-7 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Menganalisis Suara Siswa...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>🤖 ANALISIS DENGAN NOVA</span>
                </>
              )}
            </button>
            <span className="text-[11px] text-indigo-300 font-medium">
              ⚡ Analisis cepat & selaras data siswa
            </span>
          </div>
        </div>
      </div>

      {/* Filter Scope & Live Reflection Preview Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Pilih Ruang Lingkup Materi:
            </span>
          </div>

          <select
            value={selectedMaterialId}
            onChange={e => setSelectedMaterialId(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white"
          >
            <option value="ALL">Semua Refleksi Siswa ({reflections.length} Respon Masuk)</option>
            {materials.map(m => {
              const count = reflections.filter(r => r.materialId === m.id).length;
              return (
                <option key={m.id} value={m.id}>
                  {m.topik} ({m.mataPelajaran}) — {count} Respon Siswa
                </option>
              );
            })}
          </select>
        </div>

        {/* Live Student Reflection Stats Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
            <span className="text-[11px] font-bold text-indigo-700 block uppercase">Respon Refleksi</span>
            <div className="text-base sm:text-lg font-black text-indigo-950 mt-0.5">
              {totalReflections} Siswa
            </div>
            <span className="text-[10px] text-indigo-600">Terdata di sistem</span>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <span className="text-[11px] font-bold text-emerald-700 block uppercase">Siswa Antusias</span>
            <div className="text-base sm:text-lg font-black text-emerald-950 mt-0.5">
              {pctHappy}% ({happyStudents} anak)
            </div>
            <span className="text-[10px] text-emerald-600">Perasaan senang/sangat senang</span>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
            <span className="text-[11px] font-bold text-amber-700 block uppercase">Perlu Bimbingan</span>
            <div className="text-base sm:text-lg font-black text-amber-950 mt-0.5">
              {pctNeedHelp}% ({needHelpStudents} anak)
            </div>
            <span className="text-[10px] text-amber-600">Ragu/belum paham konsep</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] font-bold text-slate-600 block uppercase">Fokus Penguatan</span>
            <div className="text-xs font-bold text-slate-800 mt-1 truncate">
              {topDifficultTags[0] || currentMaterial?.topik || 'Konsep Materi'}
            </div>
            <span className="text-[10px] text-slate-500">Materi paling menantang</span>
          </div>
        </div>

        {topDifficultTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
            <span className="font-bold text-red-700 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Suara Kesulitan Murid:</span>
            </span>
            {topDifficultTags.map((tag, i) => (
              <span key={i} className="px-2.5 py-0.5 rounded-lg bg-red-50 text-red-800 border border-red-200 font-medium">
                "{tag}"
              </span>
            ))}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* When analysis has not been run yet */}
      {!analysis && !loading && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Siap Menganalisis {totalReflections} Respon Siswa
          </h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Klik tombol <span className="font-bold text-indigo-600">"ANALISIS DENGAN NOVA"</span> di atas. Sistem akan membaca seluruh respon murid, menguraikan materi yang masih membingungkan, preferensi media, serta merumuskan strategi dan rekomendasi RPM yang relevan.
          </p>
        </div>
      )}

      {/* ANALYSIS RESULTS */}
      {analysis && (
        <div className="space-y-6">
          {/* Section: 🔎 NOVA INSIGHT Summary */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Compass className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    🔎 RINGKASAN NOVA INSIGHT
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kondisi kelas, tantangan pemahaman, dan preferensi murid berdasar suara refleksi nyata
                  </p>
                </div>
              </div>

              {/* Action buttons: Download CSV & Print */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleDownloadStudentDataCsv}
                  disabled={targetReflections.length === 0}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-200 transition cursor-pointer disabled:opacity-50"
                  title="Unduh seluruh data pengisi refleksi beserta persentase pemahaman ke format CSV / Excel"
                >
                  <Download className="w-4 h-4" />
                  <span>📥 UNDUH DATA SISWA & PERSENTASE (.CSV / EXCEL)</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl font-semibold text-xs border border-slate-200 transition cursor-pointer"
                  title="Cetak atau simpan ringkasan analisis NOVA ke PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span>🖨️ Cetak / PDF</span>
                </button>
              </div>
            </div>

            {/* Notification banner when downloaded */}
            {downloadNotice && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{downloadNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDownloadNotice('')}
                  className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-0.5 rounded cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* 4 Core Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200">
                <span className="text-[11px] font-bold text-indigo-700 uppercase block tracking-wider">Kondisi Kelas</span>
                <p className="text-xs font-semibold text-indigo-950 mt-1 leading-relaxed">{analysis.kondisiKelas}</p>
                <div className="mt-2 text-[10px] text-indigo-600 font-medium">
                  {pctHappy}% Murid Merasa Senang & Antusias
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <span className="text-[11px] font-bold text-amber-800 uppercase block tracking-wider">Perlu Bimbingan</span>
                <p className="text-xs font-semibold text-amber-950 mt-1 leading-relaxed">
                  {analysis.persentaseButuhBimbingan}% siswa masih ragu atau bingung pada konsep tertentu ({needHelpStudents} dari {totalReflections} anak).
                </p>
                <div className="mt-2 text-[10px] text-amber-700 font-medium">
                  Fokus Penguatan: Scaffolding bertahap
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200">
                <span className="text-[11px] font-bold text-purple-800 uppercase block tracking-wider">Preferensi Media</span>
                <p className="text-xs font-semibold text-purple-950 mt-1 leading-relaxed">{analysis.preferensiMedia}</p>
                <div className="mt-2 text-[10px] text-purple-700 font-medium">
                  Dominan: Visual & Gamifikasi Interaktif
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 uppercase block tracking-wider">Preferensi Aktivitas</span>
                <p className="text-xs font-semibold text-emerald-950 mt-1 leading-relaxed">{analysis.preferensiAktivitas}</p>
                <div className="mt-2 text-[10px] text-emerald-700 font-medium">
                  Dominan: Kolaborasi tim & tantangan kuis
                </div>
              </div>
            </div>

            {/* Difficult Materials List */}
            {analysis.materiSulit && analysis.materiSulit.length > 0 && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 text-xs font-bold text-red-800 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Tantangan & Konsep yang Masih Sulit Berdasarkan Suara Murid:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.materiSulit.map((m, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-xl bg-white text-xs font-semibold text-red-700 border border-red-200 shadow-xs flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>{m}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Visual Breakdown of Understanding & Challenges */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
              {/* Kolom 1: Persentase Tingkat Pemahaman */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    <span>Distribusi Tingkat Pemahaman ({totalReflections} Siswa)</span>
                  </h4>
                  <span className="text-[11px] font-bold text-indigo-600">{pctHappy}% Positif</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-slate-700">⭐ Sangat Paham</span>
                      <span className="font-bold text-emerald-700">{pctSangatPaham}% ({cntSangatPaham} anak)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pctSangatPaham}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-slate-700">👍 Paham</span>
                      <span className="font-bold text-blue-700">{pctPahamNormal}% ({cntPaham} anak)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pctPahamNormal}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-slate-700">😐 Cukup Paham</span>
                      <span className="font-bold text-amber-700">{pctCukupPaham}% ({cntCukupPaham} anak)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pctCukupPaham}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-slate-700">❓ Belum Paham</span>
                      <span className="font-bold text-rose-700">{pctBelumPaham}% ({cntBelumPaham} anak)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${pctBelumPaham}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom 2: Distribusi Tantangan Utama (PPKn & Mapel Lain) */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Tantangan Utama yang Dihadapi Murid (PPKn & Mapel)</span>
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500">{challengeStatsList.length} Kategori</span>
                </div>

                <div className="space-y-2 text-xs">
                  {challengeStatsList.length > 0 ? (
                    challengeStatsList.slice(0, 5).map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-slate-700 truncate pr-2" title={item.label}>
                            {item.label}
                          </span>
                          <span className="font-bold text-slate-900 shrink-0">
                            {item.pct}% ({item.count} siswa)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full" 
                            style={{ width: `${item.pct}%` }} 
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 italic text-center py-4">Belum ada respon spesifik tantangan materi.</p>
                  )}
                </div>
              </div>
            </div>

            {/* TABEL DATA SISWA YANG MENGISI REFLEKSI (INTERAKTIF & BISA DI-DOWNLOAD) */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4.5 h-4.5 text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    📋 Data Siswa yang Mengisi Refleksi ({totalReflections} Murid)
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowStudentList(!showStudentList)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 ml-2 cursor-pointer flex items-center gap-0.5"
                  >
                    <span>{showStudentList ? 'Sembunyikan' : 'Tampilkan'}</span>
                    {showStudentList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchStudent}
                      onChange={e => setSearchStudent(e.target.value)}
                      placeholder="Cari nama siswa / kelas..."
                      className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-44 sm:w-56"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadStudentDataCsv}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-xs transition cursor-pointer"
                    title="Unduh tabel data siswa ke Excel / CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Unduh CSV</span>
                  </button>
                </div>
              </div>

              {showStudentList && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                        <tr>
                          <th className="py-2.5 px-3 w-10 text-center">No</th>
                          <th className="py-2.5 px-3">Nama Siswa</th>
                          <th className="py-2.5 px-3">Kelas & Absen</th>
                          <th className="py-2.5 px-3">Mood</th>
                          <th className="py-2.5 px-3">Pemahaman</th>
                          <th className="py-2.5 px-3">Bagian Menantang</th>
                          <th className="py-2.5 px-3">Belum Dipahami</th>
                          <th className="py-2.5 px-3">Aspirasi Media / Game</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((r, i) => (
                            <tr key={r.id || i} className="hover:bg-slate-50 transition">
                              <td className="py-2.5 px-3 text-center text-slate-400 font-semibold">{i + 1}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-900">{r.namaSiswa}</td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-medium">
                                  {r.kelas || '-'} {r.noAbsen ? `(No. ${r.noAbsen})` : ''}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-medium">
                                  {r.mood || '😊 Senang'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded-md font-semibold border ${
                                  r.tingkatPemahaman?.includes('Sangat')
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : r.tingkatPemahaman?.includes('Paham') && !r.tingkatPemahaman?.includes('Belum') && !r.tingkatPemahaman?.includes('Cukup')
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : r.tingkatPemahaman?.includes('Cukup')
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}>
                                  {r.tingkatPemahaman || '👍 Paham'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 max-w-[180px] truncate" title={r.bagianMenantang}>
                                <span className="text-slate-800 font-medium">
                                  {r.bagianMenantang || '-'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 max-w-[200px] truncate text-slate-600" title={r.belumDipahami}>
                                {r.belumDipahami || '-'}
                              </td>
                              <td className="py-2.5 px-3 max-w-[160px] truncate text-indigo-700 font-medium" title={Array.isArray(r.pilihanMedia) ? r.pilihanMedia.join(', ') : ''}>
                                {Array.isArray(r.pilihanMedia) && r.pilihanMedia.length > 0 ? r.pilihanMedia.slice(0, 2).join(', ') : '🎮 Game Interaktif'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="py-6 text-center text-slate-400 italic">
                              {searchStudent ? 'Tidak ada siswa yang cocok dengan pencarian.' : 'Belum ada data siswa.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: 💡 MENGAPA REKOMENDASI INI? (DATA -> ANALISIS -> ALASAN -> REKOMENDASI) */}
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-3xl p-6 sm:p-8 border-2 border-amber-300/80 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <span className="p-2.5 bg-amber-500 text-white rounded-xl shadow-md shadow-amber-300">
                <Lightbulb className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-lg font-black text-amber-950">
                  💡 MENGAPA NOVA MEMBERIKAN REKOMENDASI INI?
                </h3>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  Alur Ilmiah: DATA → ANALISIS → ALASAN → REKOMENDASI
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-amber-950 font-medium leading-relaxed bg-white/70 p-5 rounded-2xl border border-amber-200 shadow-inner">
              {analysis.alasanRekomendasi}
            </p>
          </div>

          {/* Section: Rekomendasi Detail Pembelajaran */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              <span>Rekomendasi Tindak Lanjut Pembelajaran</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">🎯 Strategi Pembelajaran</h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {analysis.rekomendasi.strategi.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">🎬 Media yang Disarankan</h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {analysis.rekomendasi.media.map((m, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">🎮 Aktivitas Kelas</h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {analysis.rekomendasi.aktivitas.map((a, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5">📚 Penguatan Materi Sulit</h4>
                <ul className="space-y-1 text-xs text-slate-700">
                  {analysis.rekomendasi.penguatan.map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-100">
                <h4 className="text-xs font-bold text-cyan-900 uppercase tracking-wider mb-1.5">📝 Asesmen Formatif Ramah</h4>
                <ul className="space-y-1 text-xs text-slate-700">
                  {analysis.rekomendasi.asesmen.map((as, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-cyan-600 font-bold">✓</span>
                      <span>{as}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section: 🎮 GAME YANG DIREKOMENDASIKAN NOVA */}
          {analysis.recommendedGame && (
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-pink-400 uppercase tracking-wider mb-2">
                  <Gamepad2 className="w-4 h-4" />
                  <span>GAME YANG DIREKOMENDASIKAN NOVA</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  🏎️ {analysis.recommendedGame.namaGame}
                </h3>
                <p className="text-xs sm:text-sm text-indigo-200 mt-1 leading-relaxed">
                  {analysis.recommendedGame.alasan}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-400/30 px-3 py-1 rounded-full">
                    Kategori: {analysis.recommendedGame.kategori}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigateToGameGenerator({
                  namaGame: analysis.recommendedGame?.namaGame,
                  jenisGame: analysis.recommendedGame?.kategori || 'Balapan Mobil',
                  materi: activeMaterial?.topik || 'Hierarki Peraturan Perundang-Undangan',
                  mataPelajaran: activeMaterial?.mataPelajaran || 'PPKn',
                  kelas: activeMaterial?.kelas || 'X',
                  tujuan: activeMaterial?.tujuanPembelajaran || 'Penguatan konsep materi',
                })}
                className="shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-7 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-pink-500/30 hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>✨ BUAT GAME INI</span>
              </button>
            </div>
          )}

          {/* Action: Buat RPM Berdasarkan Refleksi & Game */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Rencana Pembelajaran Mendalam (RPM)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Rancang 6 Komponen Lengkap RPM (Identitas, Identifikasi, Desain Pembelajaran, Pengalaman Belajar 3M, Asesmen, Lampiran) secara otomatis berbasis suara siswa.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToRPM(analysis, currentMaterial)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              <span>📋 BUAT RPM DENGAN NOVA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
