// Mascotte "carton qui prend vie" — discrète, réutilisable dans toute l'app.
// moods : 'neutral' (par défaut), 'happy' (célébration), 'loading' (yeux fermés)
export default function BoxMascot({ mood = 'neutral', size = 64, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Corps du carton */}
      <rect x="14" y="24" width="72" height="60" rx="8" fill="#C89B6D" stroke="#9C7645" strokeWidth="2.5" />
      {/* Bande de scotch verticale */}
      <rect x="44" y="24" width="12" height="60" fill="#E8D4B0" opacity="0.85" />
      {/* Pli horizontal du haut (rabat) */}
      <line x1="14" y1="38" x2="86" y2="38" stroke="#9C7645" strokeWidth="2" opacity="0.6" />

      {mood === 'loading' ? (
        <>
          <path d="M32 54 Q38 58 44 54" stroke="#2A2018" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M56 54 Q62 58 68 54" stroke="#2A2018" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M44 68 Q50 70 56 68" stroke="#2A2018" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : mood === 'happy' ? (
        <>
          <path d="M31 55 Q38 47 45 55" stroke="#2A2018" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M55 55 Q62 47 69 55" stroke="#2A2018" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M38 66 Q50 80 62 66" stroke="#2A2018" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <circle cx="28" cy="64" r="4" fill="#E88A5A" opacity="0.5" />
          <circle cx="72" cy="64" r="4" fill="#E88A5A" opacity="0.5" />
        </>
      ) : (
        <>
          <circle cx="38" cy="55" r="4.5" fill="#2A2018" />
          <circle cx="62" cy="55" r="4.5" fill="#2A2018" />
          <path d="M40 67 Q50 74 60 67" stroke="#2A2018" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
