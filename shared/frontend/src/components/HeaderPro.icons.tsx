export const AELogo = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" role="img" aria-label="Aevorex logo">
    <circle cx="12" cy="12" r="12" fill="#1E3A8A"/>
    <text x="12" y="16" textAnchor="middle" fontFamily="Inter" fontSize="10" fontWeight="700" fill="#fff">AE</text>
  </svg>
);

export const SearchIcon = () => (
  <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6" />
    <line x1="13" y1="13" x2="10.5" y2="10.5" />
  </svg>
);

export const HamburgerIcon = () => (
  <svg viewBox="0 0 20 20" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="17" y2="6"/>
    <line x1="3" y1="10" x2="17" y2="10"/>
    <line x1="3" y1="14" x2="17" y2="14"/>
  </svg>
);

export const SunMoonToggle = () => (
  <svg viewBox="0 0 20 20" className="w-5 h-5" stroke="currentColor" fill="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <mask id="m"><rect x="0" y="0" width="20" height="20" fill="white"/>
      <circle cx="13" cy="7" r="7" fill="black"/></mask>
    <circle cx="10" cy="10" r="4" mask="url(#m)"/>
    <g stroke="currentColor">
      <line x1="10" y1="1" x2="10" y2="3"/>
      <line x1="10" y1="17" x2="10" y2="19"/>
      <line x1="3.5" y1="3.5" x2="4.7" y2="4.7"/>
      <line x1="15.3" y1="15.3" x2="16.5" y2="16.5"/>
      <line x1="1" y1="10" x2="3" y2="10"/>
      <line x1="17" y1="10" x2="19" y2="10"/>
      <line x1="3.5" y1="16.5" x2="4.7" y2="15.3"/>
      <line x1="15.3" y1="4.7" x2="16.5" y2="3.5"/>
    </g>
  </svg>
);

export const ChatIcon = () => (
  <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 3v-3H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
  </svg>
); 