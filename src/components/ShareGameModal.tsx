import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  MessageCircle, 
  ExternalLink, 
  Gamepad2, 
  QrCode, 
  Sparkles,
  Play
} from 'lucide-react';
import { EducationalGame } from '../types';
import { copyToClipboard, getPublicAppUrl } from '../utils/browserCompat';

interface ShareGameModalProps {
  game: EducationalGame;
  onClose: () => void;
  onPlayNow: (game: EducationalGame) => void;
}

export const ShareGameModal: React.FC<ShareGameModalProps> = ({ game, onClose, onPlayNow }) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedPin, setCopiedPin] = useState<boolean>(false);
  const [copiedAnnouncement, setCopiedAnnouncement] = useState<boolean>(false);

  const gameCode = game.code || `NV-${game.id.slice(-4).toUpperCase()}`;
  const origin = getPublicAppUrl();
  const shareUrl = `${origin}/?mode=play&gameId=${game.id}`;

  const announcementText = `📢 Halo teman-teman!\n\nYuk bermain game edukasi "${game.namaGame}" (${game.kategori}) untuk materi ${game.materi} di NOVA.\n\n🔗 Klik tautan ini untuk bermain langsung:\n${shareUrl}\n\nAtau buka NOVA dan masukkan Kode Game: ${gameCode}\n\nSelamat belajar dan bersenang-senang! 🚀🎮`;

  const copyLink = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const copyPin = async () => {
    const success = await copyToClipboard(gameCode);
    if (success) {
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2500);
    }
  };

  const copyAnnouncement = async () => {
    const success = await copyToClipboard(announcementText);
    if (success) {
      setCopiedAnnouncement(true);
      setTimeout(() => setCopiedAnnouncement(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-pink-400 uppercase tracking-wider mb-2">
            <Share2 className="w-4 h-4" />
            <span>Bagikan Game ke Siswa</span>
          </div>

          <h3 className="text-xl font-black text-white">{game.namaGame}</h3>
          <p className="text-xs text-indigo-200 mt-1">
            {game.materi} • {game.mataPelajaran} ({game.kelas})
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Game PIN Code Box */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 block">
                Kode PIN Permainan
              </span>
              <span className="text-2xl font-black font-mono tracking-widest text-slate-900">
                {gameCode}
              </span>
            </div>

            <button
              onClick={copyPin}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              {copiedPin ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedPin ? 'Tersalin!' : 'Salin Kode'}</span>
            </button>
          </div>

          {/* Direct Link Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tautan Langsung Permainan (Siswa Langsung Main)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-700 bg-slate-50 font-mono select-all"
              />
              <button
                onClick={copyLink}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>

          {/* Quick Share Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(announcementText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition text-center"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Bagikan ke WhatsApp</span>
            </a>

            <button
              onClick={copyAnnouncement}
              className="flex items-center justify-center gap-2 p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {copiedAnnouncement ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAnnouncement ? 'Teks Tersalin!' : 'Salin Teks Pengumuman'}</span>
            </button>
          </div>

          {/* Info Banner */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">
              💡 Cara Siswa Bermain:
            </p>
            <p>1. Siswa membuka tautan langsung atau memasukkan kode PIN di beranda.</p>
            <p>2. Game akan langsung berjalan di browser HP/Laptop tanpa perlu unduh aplikasi.</p>
          </div>
        </div>

        {/* Footer Actions */}
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
              onPlayNow(game);
            }}
            className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Coba Mainkan Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
