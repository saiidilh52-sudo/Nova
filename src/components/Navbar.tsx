import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Home, 
  MessageSquare, 
  Sparkles, 
  BookOpen, 
  Gamepad2, 
  FileText, 
  TrendingUp, 
  User, 
  LogOut,
  HelpCircle
} from 'lucide-react';
import { Logo } from './Logo';
import { Teacher } from '../types';

interface NavbarProps {
  currentRole: 'landing' | 'student' | 'teacher';
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSwitchRole: (role: 'landing' | 'student' | 'teacher') => void;
  teacher: Teacher | null;
  onLogout: () => void;
  onOpenDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  activeTab,
  onTabChange,
  onSwitchRole,
  teacher,
  onLogout,
  onOpenDocs,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const teacherNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'analysis', label: 'Analisis NOVA', icon: Sparkles },
    { id: 'materials', label: 'Materi Belajar', icon: BookOpen },
    { id: 'games', label: 'Bank Game', icon: Gamepad2 },
    { id: 'rpm', label: 'RPM Otomatis', icon: FileText },
    { id: 'progress', label: 'Perkembangan', icon: TrendingUp },
    { id: 'profile', label: 'Profil Guru', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div 
            onClick={() => onSwitchRole('landing')} 
            className="cursor-pointer py-1"
          >
            <Logo size="md" showTagline={true} />
          </div>

          {/* Desktop Navigation for Teacher */}
          {currentRole === 'teacher' && teacher && (
            <nav className="hidden xl:flex items-center gap-1">
              {teacherNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Action Tools */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={onOpenDocs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition"
              title="Panduan Instalasi Firebase & Apps Script"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
              <span>Panduan & GAS</span>
            </button>

            {currentRole === 'teacher' && teacher ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate">
                  {teacher.namaGuru}
                </span>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : currentRole !== 'landing' ? (
              <button
                onClick={() => onSwitchRole('landing')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Ganti Peran
              </button>
            ) : null}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-fadeIn">
          {currentRole === 'teacher' && teacher && (
            <div className="space-y-1 pb-3 border-b border-slate-100">
              <div className="text-xs font-bold text-indigo-700 px-3 py-1">
                Halo, {teacher.namaGuru}
              </div>
              {teacherNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition ${
                      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenDocs();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-bold text-indigo-600 flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Panduan Firebase & Google Apps Script</span>
            </button>

            {currentRole !== 'landing' && (
              <button
                onClick={() => {
                  onSwitchRole('landing');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl"
              >
                Kembali ke Menu Utama
              </button>
            )}

            {currentRole === 'teacher' && (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
