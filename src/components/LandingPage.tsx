import React from 'react';
import { UserCheck, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';
import { Logo } from './Logo';

interface LandingPageProps {
  onSelectRole: (role: 'student' | 'teacher') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole }) => {
  return (
    <div className="space-y-16 animate-fadeIn py-8 sm:py-12">
      {/* Hero Presentation */}
      <div className="text-center max-w-3xl mx-auto px-4 space-y-4">
        <div className="flex justify-center mb-2">
          <Logo size="xl" showTagline={true} />
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          “Suaramu menjadi arah pembelajaran.”
        </h2>

        <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
          NOVA (Narasi, Observasi, Voice, Aspirasi) adalah jembatan refleksi cerdas yang mengubah pengalaman, suara hati, dan kebutuhan belajar siswa menjadi strategi pengajaran mendalam dan game edukasi nyata.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Narasi • Observasi • Voice • Aspirasi • Educational Decision Support</span>
        </div>

        {/* Quick mobile-friendly action for instant student access */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onSelectRole('student')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-7 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <span>👨‍🎓 Klik Di Sini untuk Mengisi Refleksi Siswa</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Role Selection Cards (Separated Portals) */}
      <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Portal Siswa */}
        <div className="bg-gradient-to-b from-white to-indigo-50/40 rounded-3xl p-8 border-2 border-indigo-100 shadow-xl shadow-indigo-100/50 hover:shadow-2xl hover:border-indigo-300 transition-all group flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-9 h-9" />
            </div>

            <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-extrabold uppercase tracking-wider mb-2">
              👨‍🎓 Portal Siswa
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              Saya Siswa
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Sampaikan perasaanmu hari ini, materi yang sudah atau belum kamu pahami, serta pilih game dan aktivitas yang kamu inginkan untuk pertemuan berikutnya.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-700 font-medium mb-8">
              <li className="flex items-center gap-2">
                <span className="text-pink-500 text-sm">💭</span>
                <span>Ekspresikan perasaanmu (My Feeling)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500 text-sm">💡</span>
                <span>Ungkapkan pemahamanmu tanpa rasa cemas</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 text-sm">🎮</span>
                <span>Pilih game dan aktivitas yang kamu sukai</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-500 text-sm">🌱</span>
                <span>Dapatkan pesan Growth Mindset yang membakar semangat</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => onSelectRole('student')}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <span>MASUK SEBAGAI SISWA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Portal Guru */}
        <div className="bg-gradient-to-b from-white to-purple-50/40 rounded-3xl p-8 border-2 border-purple-100 shadow-xl shadow-purple-100/50 hover:shadow-2xl hover:border-purple-300 transition-all group flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-pink-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform">
              <UserCheck className="w-9 h-9" />
            </div>

            <div className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-[11px] font-extrabold uppercase tracking-wider mb-2">
              👨‍🏫 Portal Pendidik
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              Saya Guru
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Akses analitik mendalam NOVA Insight, identifikasi materi sulit murid, buat game pembelajaran interaktif, dan susun RPM otomatis berdasarkan data riil.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-700 font-medium mb-8">
              <li className="flex items-center gap-2">
                <span className="text-indigo-500 text-sm">📊</span>
                <span>Visualisasi analitik grafik interaktif Chart.js</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500 text-sm">🤖</span>
                <span>Analisis AI NOVA: "Mengapa Rekomendasi Ini?"</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-pink-500 text-sm">🏎️</span>
                <span>Game Studio + Mainkan Balapan Mobil di Browser</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500 text-sm">📋</span>
                <span>Generator RPM (A sampai S) & Ekspor DOCX/PDF</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => onSelectRole('teacher')}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-purple-200 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <span>MASUK SEBAGAI GURU</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feature Pillars Preview */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <div className="text-center mb-8">
          <h3 className="text-lg font-black text-slate-900">
            Arsitektur Fitur NOVA
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Dirancang khusus untuk mendukung Kurikulum Merdeka dan Pembelajaran Mendalam
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-2xl mb-2">🗣️</div>
            <h4 className="font-bold text-slate-900 mb-1">Student Voice</h4>
            <p className="text-slate-500">
              Formulir 5 dimensi tanpa beban login: My Feeling, Understanding, Voice, Wish, dan Choice.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-2xl mb-2">💡</div>
            <h4 className="font-bold text-slate-900 mb-1">Data-Driven Insight</h4>
            <p className="text-slate-500">
              Menghubungkan data suara nyata siswa dengan argumentasi pedagogik terstruktur.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-2xl mb-2">🎮</div>
            <h4 className="font-bold text-slate-900 mb-1">Playable Games</h4>
            <p className="text-slate-500">
              Bank game edukasi yang tidak sekadar konsep, tapi bisa dimainkan langsung di layar kelas.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-2xl mb-2">📋</div>
            <h4 className="font-bold text-slate-900 mb-1">Automated RPM</h4>
            <p className="text-slate-500">
              Menghasilkan Rencana Pembelajaran Mendalam resmi (6 Komponen Lengkap) siap cetak dan ekspor Word.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
