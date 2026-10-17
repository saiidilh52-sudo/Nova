import React, { useState } from 'react';
import { Lock, Mail, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { apiService, safeStorage } from '../services/api';
import { Teacher } from '../types';
import { Logo } from './Logo';

interface TeacherAuthProps {
  onSuccess: (teacher: Teacher) => void;
  onBackToHome: () => void;
}

export const TeacherAuth: React.FC<TeacherAuthProps> = ({ onSuccess, onBackToHome }) => {
  const [isRegister, setIsRegister] = useState<boolean>(false);

  // Form State
  const [namaGuru, setNamaGuru] = useState<string>('');
  const [email, setEmail] = useState<string>(() => {
    try {
      const active = safeStorage.getItem('nova_active_teacher');
      if (active) return JSON.parse(active).email || '';
      const reg = safeStorage.getItem('nova_registered_accounts');
      if (reg) {
        const list = JSON.parse(reg);
        if (list.length > 0) return list[list.length - 1].email || '';
      }
    } catch (e) {}
    return '';
  });
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Status
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const validate = (): boolean => {
    setErrorMessage('');
    if (isRegister && !namaGuru.trim()) {
      setErrorMessage('Nama lengkap guru wajib diisi.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Masukkan alamat email yang valid.');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('Password minimal harus 6 karakter.');
      return false;
    }
    if (isRegister && password !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok dengan password.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (isRegister) {
        const res = await apiService.registerTeacher(namaGuru.trim(), email.trim(), password);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.teacher) {
          setSuccessMessage('Akun guru berhasil dibuat. Sedang masuk ke dashboard...');
          setTimeout(() => {
            onSuccess(res.teacher!);
          }, 800);
        }
      } else {
        const res = await apiService.loginTeacher(email.trim(), password);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.teacher) {
          onSuccess(res.teacher);
        }
      }
    } catch (err: any) {
      setErrorMessage('⚠️ Terjadi kendala saat menghubungkan akun. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-4">
            <Logo size="lg" showTagline={true} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isRegister ? 'Buat Akun Guru' : '👨‍🏫 Login Guru NOVA'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isRegister
              ? 'Daftarkan akun untuk mengelola refleksi, game & RPM'
              : 'Akses insight kelas, rekomendasi AI, bank game & RPM'}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 mb-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Lengkap & Gelar
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={namaGuru}
                  onChange={e => setNamaGuru(e.target.value)}
                  placeholder="Contoh: Dra. Sri Rahayu, M.Pd"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama.guru@sekolah.sch.id"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password di atas"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-bold shadow-md shadow-indigo-200 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Daftar Sekarang' : 'Masuk ke NOVA'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            {isRegister ? 'Sudah memiliki akun guru?' : 'Belum punya akun guru?'}
          </p>
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className="mt-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
          >
            {isRegister ? 'Login di sini' : 'Daftar Guru Baru'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onBackToHome}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium"
          >
            ← Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
};
