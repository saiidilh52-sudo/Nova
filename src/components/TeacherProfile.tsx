import React, { useState } from 'react';
import { User, Mail, Calendar, LogOut, CheckCircle2 } from 'lucide-react';
import { Teacher } from '../types';

interface TeacherProfileProps {
  teacher: Teacher;
  onUpdateName: (newName: string) => void;
  onLogout: () => void;
}

export const TeacherProfile: React.FC<TeacherProfileProps> = ({ teacher, onUpdateName, onLogout }) => {
  const [editing, setEditing] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(teacher.namaGuru);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    onUpdateName(nameInput.trim());
    setEditing(false);
    setSuccessMsg('Profil berhasil diperbarui!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const joinDate = teacher.createdAt 
    ? new Date(teacher.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
    : '6 Oktober 2026';

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
        <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-200 text-3xl font-black">
          {teacher.namaGuru.substring(0, 2).toUpperCase()}
        </div>

        <h2 className="text-2xl font-black text-slate-900">{teacher.namaGuru}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{teacher.email}</p>

        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Mail className="w-3.5 h-3.5 text-indigo-500" />
              <span>Email Akun</span>
            </span>
            <p className="text-xs font-bold text-slate-800">{teacher.email}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>Tanggal Bergabung</span>
            </span>
            <p className="text-xs font-bold text-slate-800">{joinDate}</p>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="mt-6 pt-6 border-t border-slate-100 text-left space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ubah Nama Lengkap & Gelar</label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm"
              >
                Simpan Perubahan
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Batal
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
            >
              Ubah Profil
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar (Logout)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
