import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    // Clear potentially corrupted transient view states while keeping user data
    try {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('reload', Date.now().toString());
        window.location.href = url.toString();
      }
    } catch {
      window.location.reload();
    }
  };

  private handleResetToHome = () => {
    try {
      if (typeof window !== 'undefined') {
        window.location.href = window.location.origin;
      }
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-800/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
              <Logo size="md" theme="dark" showTagline={false} />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Data Aman</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl shrink-0 text-rose-400">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Sistem Pemulihan Tampilan NOVA
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Terjadi kendala saat merender komponen visual. Seluruh data refleksi, materi, dan game Anda tetap tersimpan dengan aman di database.
                </p>
              </div>
            </div>

            {/* Error detail for troubleshooting if available */}
            {this.state.error && (
              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/50 text-xs font-mono text-slate-400 overflow-x-auto max-h-32">
                <p className="text-rose-400 font-bold mb-1">{this.state.error.name}: {this.state.error.message}</p>
                {this.state.error.stack && (
                  <pre className="text-[11px] text-slate-500 whitespace-pre-wrap">{this.state.error.stack.split('\n').slice(0, 3).join('\n')}</pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-indigo-500/25 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Muat Ulang Halaman</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetToHome}
                className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-5 py-3 rounded-xl border border-slate-600 transition cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Kembali ke Beranda</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
