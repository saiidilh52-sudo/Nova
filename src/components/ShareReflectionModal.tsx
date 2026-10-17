import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  MessageCircle, 
  BookOpen, 
  Share2, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Material } from '../types';
import { copyToClipboard, getPublicAppUrl } from '../utils/browserCompat';

interface ShareReflectionModalProps {
  material?: Material;
  onClose: () => void;
  onOpenFormNow: (material?: Material) => void;
}

export const ShareReflectionModal: React.FC<ShareReflectionModalProps> = ({
  material,
  onClose,
  onOpenFormNow
}) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  const origin = getPublicAppUrl();
  const reflectionUrl = material 
    ? `${origin}/?mode=student&materialId=${material.id}`
    : `${origin}/?mode=student`;

  const announcement = `📢 Refleksi Pembelajaran Hari Ini - NOVA\n\nHalo teman-teman! Mohon luangkan waktu 2-3 menit untuk mengisi suara refleksi pembelajaran hari ini:\nTopik: ${material?.topik || 'Refleksi Pembelajaran'}\nMata Pelajaran: ${material?.mataPelajaran || 'Umum'} (${material?.kelas || 'SMA'})\n\n🔗 Tautan Refleksi:\n${reflectionUrl}\n\nSuaramu menjadi arah bagi guru untuk merancang pembelajaran berikutnya yang lebih seru dan menyenangkan! 🌱✨`;

  const copyLink = async () => {
    const success = await copyToClipboard(reflectionUrl);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const copyText = async () => {
    const success = await copyToClipboard(announcement);
    if (success) {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
            <Share2 className="w-4 h-4" />
            <span>Sesi Refleksi Siswa NOVA</span>
          </div>

          <h3 className="text-xl font-black text-white">
            {material ? material.topik : 'Sesi Refleksi Pembelajaran'}
          </h3>
          <p className="text-xs text-indigo-200 mt-1">
            {material ? `${material.mataPelajaran} • ${material.kelas}` : 'Refleksi Suara Siswa'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {material && (
            <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-100 text-xs text-indigo-950">
              <span className="font-bold block text-indigo-900 mb-0.5">Tujuan Pembelajaran:</span>
              <p className="text-slate-700">{material.tujuanPembelajaran}</p>
            </div>
          )}

          {/* Tautan Refleksi Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tautan Formulir Refleksi Siswa
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={reflectionUrl}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-700 bg-slate-50 font-mono select-all"
              />
              <button
                onClick={copyLink}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>

          {/* Quick Share Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(announcement)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition text-center"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Bagikan ke WhatsApp Kelas</span>
            </a>

            <button
              onClick={copyText}
              className="flex items-center justify-center gap-2 p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {copiedText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedText ? 'Tersalin!' : 'Salin Pesan Pengumuman'}</span>
            </button>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">
              📌 Petunjuk Pelaksanaan:
            </p>
            <p>• Siswa cukup mengisi Nama, Kelas, dan No. Absen tanpa perlu login atau password.</p>
            <p>• Jawaban siswa akan langsung masuk ke Dashboard Guru secara real-time dan dianalisis oleh NOVA Insight.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
          >
            Tutup
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenFormNow(material);
            }}
            className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buka Formulir Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
