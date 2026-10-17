import React from 'react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Core Educational Flow Bar */}
        <div className="bg-slate-800/80 rounded-2xl p-4 sm:p-6 mb-10 border border-slate-700/60">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-3 text-center sm:text-left">
            Siklus Pembelajaran Berkelanjutan NOVA:
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-slate-300">
            <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg">SUARA SISWA</span>
            <span className="text-slate-500">➔</span>
            <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-lg">REFLEKSI</span>
            <span className="text-slate-500">➔</span>
            <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-lg">DATA</span>
            <span className="text-slate-500">➔</span>
            <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg">ANALISIS</span>
            <span className="text-slate-500">➔</span>
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg">INSIGHT</span>
            <span className="text-slate-500">➔</span>
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg">REKOMENDASI</span>
            <span className="text-slate-500">➔</span>
            <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 rounded-lg">GAME/MEDIA</span>
            <span className="text-slate-500">➔</span>
            <span className="px-2.5 py-1 bg-violet-500/20 text-violet-300 rounded-lg">RPM</span>
            <span className="text-slate-500">➔</span>
            <span className="px-2.5 py-1 bg-emerald-400 text-slate-950 font-black rounded-lg">PEMBELAJARAN BERIKUTNYA</span>
          </div>
        </div>

        {/* Main Footer Details */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800 text-center md:text-left">
          <div>
            <Logo size="lg" theme="dark" showTagline={true} />
            <p className="text-sm font-semibold text-indigo-400 mt-2">
              “Suaramu menjadi arah pembelajaran.”
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              New Voice, New Learning • Educational Technology Specialist
            </p>
          </div>

          <div className="text-xs text-slate-400 max-w-sm space-y-1">
            <p className="font-semibold text-slate-200">
              Sistem Pendukung Keputusan Pedagogik
            </p>
            <p>
              Dikembangkan untuk mengintegrasikan suara siswa, analitik AI adaptif, gamifikasi kelas, dan penyusunan Rencana Pembelajaran Mendalam (RPM).
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © 2026 NOVA (Narasi, Observasi, Voice, Aspirasi). Hak Cipta Dilindungi.
          </div>
          <div className="flex items-center gap-4">
            <span>Kurikulum Merdeka</span>
            <span>•</span>
            <span>Gamifikasi Edukasi</span>
            <span>•</span>
            <span>Gemini AI Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
