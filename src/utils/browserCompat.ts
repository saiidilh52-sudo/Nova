/**
 * Utilities for cross-browser resilience, mobile compatibility, and offline fallbacks.
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  // 1. Try modern async Clipboard API if available and securely permitted
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.warn('Modern clipboard failed, attempting legacy fallback:', e);
    }
  }

  // 2. Legacy execCommand fallback (works in non-HTTPS, older Safari, Android webview, iframe)
  try {
    if (typeof document !== 'undefined') {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.top = '-9999px';
      textArea.style.left = '-9999px';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('All clipboard methods failed:', err);
  }
  return false;
}

export function parseBrowserNavigation(): {
  role: 'landing' | 'student' | 'teacher';
  materialId?: string;
  gameId?: string;
  isPlay: boolean;
} {
  if (typeof window === 'undefined') {
    return { role: 'landing', isPlay: false };
  }

  try {
    const href = window.location.href;
    const url = new URL(href);
    const searchParams = url.searchParams;
    const rawHash = window.location.hash || '';
    const hash = rawHash.toLowerCase();
    const pathname = (window.location.pathname || '').toLowerCase();

    // Parse parameters from search query
    let mode = searchParams.get('mode') || searchParams.get('role') || searchParams.get('view') || '';
    let gId = searchParams.get('gameId') || searchParams.get('game') || searchParams.get('pin') || searchParams.get('code') || undefined;
    let mId = searchParams.get('materialId') || searchParams.get('material') || searchParams.get('mId') || undefined;

    // Also parse parameters from hash if present (e.g., #/refleksi?materialId=123 or #mode=student&materialId=123)
    if (rawHash.includes('?') || rawHash.includes('=')) {
      try {
        const hashQuery = rawHash.includes('?') ? rawHash.split('?')[1] : rawHash.replace(/^#\/?/, '');
        const hashParams = new URLSearchParams(hashQuery);
        if (!mode) mode = hashParams.get('mode') || hashParams.get('role') || hashParams.get('view') || '';
        if (!gId) gId = hashParams.get('gameId') || hashParams.get('game') || hashParams.get('pin') || hashParams.get('code') || undefined;
        if (!mId) mId = hashParams.get('materialId') || hashParams.get('material') || hashParams.get('mId') || undefined;
      } catch (e) {
        // Safe ignore
      }
    }

    // Check for student indications in mode, hash, or pathname
    const isStudent = 
      mode.toLowerCase() === 'student' || 
      mode.toLowerCase() === 'refleksi' || 
      mode.toLowerCase() === 'siswa' ||
      mode.toLowerCase() === 'murid' ||
      searchParams.has('refleksi') ||
      searchParams.has('siswa') ||
      searchParams.has('student') ||
      hash.includes('refleksi') || 
      hash.includes('student') || 
      hash.includes('siswa') ||
      hash.includes('murid') ||
      pathname.includes('refleksi') ||
      pathname.includes('siswa') ||
      Boolean(mId); // If a material ID is provided in URL, it's a student reflection link

    // Check for game play mode
    const isPlay = (mode.toLowerCase() === 'play' || hash.includes('play')) && Boolean(gId);

    // Check for teacher mode
    const isTeacher = 
      !Boolean(mId) && (
        mode.toLowerCase() === 'teacher' || 
        mode.toLowerCase() === 'guru' || 
        hash.includes('guru') ||
        searchParams.has('guru')
      );

    if (isPlay) {
      return { role: 'landing', materialId: mId, gameId: gId, isPlay: true };
    }

    if (isStudent) {
      return { role: 'student', materialId: mId, gameId: gId, isPlay: false };
    }

    if (isTeacher) {
      return { role: 'teacher', materialId: mId, gameId: gId, isPlay: false };
    }
  } catch (e) {
    console.warn('Error parsing browser navigation:', e);
  }

  return { role: 'landing', isPlay: false };
}

/**
 * Returns the public direct application URL for students and mobile sharing.
 * Avoids sharing internal AI Studio wrapper URLs which trigger Google AI Studio regional/account prompts on mobile.
 */
export function getPublicAppUrl(): string {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  // If previewing inside an AI Studio internal frame or if hostname is googleusercontent/aistudio
  if (origin.includes('aistudio.google.com') || origin.includes('googleusercontent.com')) {
    return 'https://ais-pre-jcy2aabh7s4wo2tofbsbgw-760445689581.asia-southeast1.run.app';
  }
  return origin;
}
