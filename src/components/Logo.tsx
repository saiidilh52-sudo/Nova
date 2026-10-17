import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  theme?: 'dark' | 'light';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = true,
  theme = 'light',
  className = ''
}) => {
  // Sizing definitions
  const sizeMap = {
    sm: {
      icon: 34,
      text: 'text-xl',
      badge: 'text-[9px] px-1.5 py-0.5',
      sub: 'text-[9px] tracking-normal',
      gap: 'gap-2',
    },
    md: {
      icon: 46,
      text: 'text-2xl',
      badge: 'text-[10px] px-2 py-0.5',
      sub: 'text-[10px] tracking-tight',
      gap: 'gap-3',
    },
    lg: {
      icon: 60,
      text: 'text-3xl sm:text-4xl',
      badge: 'text-xs px-2.5 py-1',
      sub: 'text-xs tracking-normal',
      gap: 'gap-3.5',
    },
    xl: {
      icon: 84,
      text: 'text-4xl sm:text-5xl',
      badge: 'text-xs px-3 py-1',
      sub: 'text-xs sm:text-sm tracking-normal',
      gap: 'gap-4',
    },
  };

  const { icon, text, badge, sub, gap } = sizeMap[size];
  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center ${gap} select-none ${className}`}>
      {/* 🌟 ICON: MODERN 3D GEOMETRIC LETTER 'N' WITH APERSEPSI GLOW */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md transition-transform hover:scale-105 duration-300"
      >
        <defs>
          {/* Left Vertical Ribbon Gradient (Narasi - Story & Context) */}
          <linearGradient id="nLeftPillar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />   {/* Deep Indigo */}
            <stop offset="60%" stopColor="#6366F1" />  {/* Electric Indigo */}
            <stop offset="100%" stopColor="#06B6D4" /> {/* Cyan spark */}
          </linearGradient>

          {/* Diagonal Dynamic Ribbon (Observasi & Voice - Flow & Connection) */}
          <linearGradient id="nDiagonal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />   {/* Royal Purple */}
            <stop offset="45%" stopColor="#C026D3" />  {/* Fuchsia */}
            <stop offset="100%" stopColor="#EC4899" /> {/* Vivid Pink */}
          </linearGradient>

          {/* Right Vertical Ribbon (Aspirasi - Illumination & Voice) */}
          <linearGradient id="nRightPillar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F43F5E" />   {/* Crimson Rose */}
            <stop offset="50%" stopColor="#EC4899" />  {/* Bright Pink */}
            <stop offset="100%" stopColor="#8B5CF6" /> {/* Violet */}
          </linearGradient>

          {/* Specular Highlight Gloss */}
          <linearGradient id="nGlassHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
          </linearGradient>

          {/* Spark Glow Filter */}
          <filter id="aspirasiSparkGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Drop shadow for 3D depth */}
          <filter id="ribbonDepth" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="1.5" dy="3" stdDeviation="2.5" floodColor="#1E1B4B" floodOpacity="0.28" />
          </filter>
        </defs>

        {/* Ambient background aura */}
        <circle cx="50" cy="50" r="44" fill={isDark ? '#4338CA' : '#EEF2FF'} opacity={isDark ? '0.15' : '0.4'} />

        {/* 1. LEFT PILLAR OF 'N' */}
        <path
          d="M 23,24 C 23,19 27,15 32,15 L 35,15 C 40,15 44,19 44,24 L 44,76 C 44,81 40,85 35,85 L 32,85 C 27,85 23,81 23,76 Z"
          fill="url(#nLeftPillar)"
          filter="url(#ribbonDepth)"
        />

        {/* Gloss on left pillar */}
        <path
          d="M 24,24 C 24,20 27,16 31,16 L 33,16 C 30,19 29,24 29,29 L 29,74 C 29,78 26,82 24,84 Z"
          fill="url(#nGlassHighlight)"
        />

        {/* 2. DYNAMIC DIAGONAL FOLD OF 'N' */}
        <path
          d="
            M 26,18 
            C 29.5,15.5 34.5,16.5 37,20 
            L 74,78 
            C 76.5,82 74,86 69.5,86 
            L 59,86 
            C 55.5,86 52.5,83.8 50.5,80.5 
            L 22,27 
            C 19.8,23.5 22,18.8 26,18 Z
          "
          fill="url(#nDiagonal)"
          filter="url(#ribbonDepth)"
        />

        {/* Glass reflection streak on diagonal */}
        <path
          d="M 33,21 L 64,74 C 62,75 60,76 57,75 L 29,26 C 30,23 31.5,22 33,21 Z"
          fill="url(#nGlassHighlight)"
        />

        {/* 3. RIGHT PILLAR OF 'N' */}
        <path
          d="M 56,24 C 56,19 60,15 65,15 L 68,15 C 73,15 77,19 77,24 L 77,76 C 77,81 73,85 68,85 L 65,85 C 60,85 56,81 56,76 Z"
          fill="url(#nRightPillar)"
          filter="url(#ribbonDepth)"
        />

        {/* Inner shadow/crease between diagonal and right pillar */}
        <path
          d="M 56,38 L 74,68 L 77,65 L 56,32 Z"
          fill="#1E1B4B"
          opacity="0.18"
        />

        {/* 4. ASPIRASI BEACON (Radiant 4-point star on the crest of N) */}
        <g transform="translate(73, 16)" filter="url(#aspirasiSparkGlow)">
          {/* Glowing Starburst */}
          <path
            d="M 0,-7 Q 0,0 7,0 Q 0,0 0,7 Q 0,0 -7,0 Q 0,0 0,-7 Z"
            fill="#FBBF24"
          />
          <circle cx="0" cy="0" r="2.2" fill="#FFFFFF" />
        </g>

        {/* Small subtle intellect spark on left */}
        <circle cx="21" cy="38" r="2" fill="#06B6D4" opacity="0.8" />
        <circle cx="79" cy="62" r="1.8" fill="#EC4899" opacity="0.75" />
      </svg>

      {/* 📝 TYPOGRAPHY: "NOVA" + "NARASI, OBSERVASI, VOICE, ASPIRASI" */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 leading-none">
            {/* Main Brand Title: NOVA */}
            <span
              className={`font-black tracking-tight font-sans ${text} ${
                isDark
                  ? 'bg-gradient-to-r from-white via-indigo-200 to-pink-300 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-600 bg-clip-text text-transparent'
              }`}
            >
              NOVA
            </span>

            {/* Smart Technology Pill Badge */}
            <span
              className={`font-extrabold uppercase rounded-full border shadow-2xs ${badge} ${
                isDark
                  ? 'bg-indigo-950/80 text-amber-300 border-indigo-700'
                  : 'bg-gradient-to-r from-indigo-50 to-pink-50 text-indigo-700 border-indigo-200/80'
              }`}
            >
              AI EDU
            </span>
          </div>

            {/* Subtitle / Meaning: (Narasi, Observasi, Voice, Aspirasi) */}
            {(showTagline || size === 'xl' || size === 'lg') && (
              <div className="mt-1 flex items-center">
                <span
                  className={`font-bold tracking-tight whitespace-nowrap block ${sub} ${
                    isDark ? 'text-indigo-300/90' : 'text-slate-600'
                  }`}
                >
                  (<span className="text-indigo-600 font-black">Narasi</span>,{' '}
                  <span className="text-purple-600 font-black">Observasi</span>,{' '}
                  <span className="text-pink-600 font-black">Voice</span>,{' '}
                  <span className="text-rose-600 font-black">Aspirasi</span>)
                </span>
              </div>
            )}
        </div>
      )}
    </div>
  );
};
