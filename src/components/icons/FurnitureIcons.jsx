// Palette matériaux
const W  = '#C8A876'; // bois clair
const WD = '#B89060'; // bois clair – ombre
const WM = '#A88452'; // bois clair – moyen
const WK = '#7A5C3E'; // chêne foncé
const WKD= '#5C4631'; // chêne foncé – ombre
const WKM= '#6A4C2E'; // chêne foncé – milieu
const FB = '#8D9AA9'; // tissu gris-bleu clair
const FB2= '#7D8A99'; // tissu gris-bleu
const FBD= '#6D7A89'; // tissu gris-bleu foncé
const MT = '#3A3A3A'; // métal
const MTD= '#2A2A2A'; // métal foncé
const CW = '#D4C8B8'; // blanc crème
const CWD= '#B8A898'; // blanc crème – foncé
const GD  = '#C8A876'; // dorée (poignées)
const AP  = '#D8DCE0'; // électroménager blanc-gris
const APD = '#B8BCC0'; // électroménager – ombre
const APH = '#8A9096'; // poignée métal clair
const WB  = '#B8D4E8'; // eau / bleu ciel
const RC  = '#C8885A'; // tapis – brun chaud
const RD  = '#A06840'; // tapis – ombre
const GR  = '#4A8A3A'; // vert jardin
const GRD = '#3A7A2A'; // vert foncé jardin

// Chaise de salle à manger – bois clair, dossier haut
export function IconChair({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="9" y="2" width="14" height="13" rx="2.5" fill={W}/>
      <rect x="6" y="14" width="20" height="5" rx="2" fill={WM}/>
      <rect x="9" y="19" width="3.5" height="12" rx="1.75" fill={W}/>
      <rect x="19.5" y="19" width="3.5" height="12" rx="1.75" fill={W}/>
    </svg>
  );
}

// Banc d'entrée – bois clair, large, sans dossier
export function IconBench({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="1" y="12" width="30" height="6" rx="2.5" fill={W}/>
      <rect x="3" y="18" width="4.5" height="13" rx="2.25" fill={WD}/>
      <rect x="24.5" y="18" width="4.5" height="13" rx="2.25" fill={WD}/>
      <rect x="3" y="26" width="26" height="2" rx="1" fill={WM}/>
    </svg>
  );
}

// Tabouret haut – métal noir, 3 pieds
export function IconStool({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <ellipse cx="16" cy="6" rx="11" ry="4" fill={MT}/>
      <rect x="14.5" y="10" width="3" height="9" fill={MTD}/>
      <ellipse cx="16" cy="20" rx="7" ry="2" fill="none" stroke={MT} strokeWidth="2"/>
      <path d="M9 20 L5 31" stroke={MTD} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M23 20 L27 31" stroke={MTD} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M16 22 L16 31" stroke={MTD} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

// Console d'entrée / table console – bois clair, fine et haute
export function IconConsoleTable({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="1" y="7" width="30" height="4" rx="2" fill={W}/>
      <rect x="3" y="11" width="26" height="3" rx="1" fill={WM}/>
      <rect x="4" y="14" width="3" height="17" rx="1.5" fill={W}/>
      <rect x="25" y="14" width="3" height="17" rx="1.5" fill={W}/>
      <rect x="4" y="26" width="24" height="2.5" rx="1.25" fill={WD}/>
    </svg>
  );
}

// Table de salle à manger – bois clair, large
export function IconDiningTable({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="1" y="8" width="30" height="6" rx="2.5" fill={W}/>
      <rect x="3" y="14" width="26" height="3" rx="1" fill={WM}/>
      <rect x="5" y="17" width="4" height="14" rx="2" fill={WD}/>
      <rect x="23" y="17" width="4" height="14" rx="2" fill={WD}/>
    </svg>
  );
}

// Canapé 2/3 places – tissu gris-bleu
export function IconSofa({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="4" y="8" width="24" height="10" rx="2.5" fill={FB}/>
      <rect x="1" y="8" width="5" height="18" rx="2.5" fill={FBD}/>
      <rect x="26" y="8" width="5" height="18" rx="2.5" fill={FBD}/>
      <rect x="4" y="17" width="24" height="9" rx="2" fill={FB2}/>
      <rect x="5.5" y="26" width="3.5" height="5" rx="1.75" fill={MT}/>
      <rect x="23" y="26" width="3.5" height="5" rx="1.75" fill={MT}/>
    </svg>
  );
}

// Armoire 2 portes – chêne foncé
export function IconWardrobe({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="2" y="2" width="28" height="30" rx="2" fill={WK}/>
      <rect x="2" y="2" width="28" height="4" rx="2" fill={WKD}/>
      <rect x="4" y="6" width="10" height="24" rx="1" fill={WKM}/>
      <rect x="18" y="6" width="10" height="24" rx="1" fill={WKM}/>
      <rect x="14.5" y="6" width="1.5" height="24" fill={WKD}/>
      <rect x="12" y="16" width="1.5" height="4" rx="0.75" fill={GD}/>
      <rect x="18.5" y="16" width="1.5" height="4" rx="0.75" fill={GD}/>
    </svg>
  );
}

// Penderie / Dressing – blanc crème, tringle et cintres
export function IconWalkInCloset({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="2" y="2" width="3.5" height="30" rx="1.75" fill={CW}/>
      <rect x="26.5" y="2" width="3.5" height="30" rx="1.75" fill={CW}/>
      <rect x="2" y="5" width="28" height="3" rx="1.5" fill={CWD}/>
      <rect x="2" y="28" width="28" height="4" rx="2" fill={CW}/>
      <path d="M10 8 Q10 5.5 12 5.5 Q14 5.5 14 8" stroke="#8A7A6A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <line x1="12" y1="8" x2="12" y2="21" stroke="#8A7A6A" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="9" y="21" width="6" height="6" rx="1" fill={FB2} opacity="0.85"/>
      <path d="M19 8 Q19 5.5 21 5.5 Q23 5.5 23 8" stroke="#8A7A6A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <line x1="21" y1="8" x2="21" y2="21" stroke="#8A7A6A" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="18" y="21" width="6" height="6" rx="1" fill={W} opacity="0.85"/>
    </svg>
  );
}

// Fauteuil – tissu gris-bleu, accoudoirs larges
export function IconArmchair({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="5" y="6" width="22" height="13" rx="2.5" fill={FB}/>
      <rect x="2" y="9" width="5" height="14" rx="2.5" fill={FBD}/>
      <rect x="25" y="9" width="5" height="14" rx="2.5" fill={FBD}/>
      <rect x="5" y="18" width="22" height="8" rx="2.5" fill={FB2}/>
      <rect x="7" y="26" width="3" height="5.5" rx="1.5" fill={MT}/>
      <rect x="22" y="26" width="3" height="5.5" rx="1.5" fill={MT}/>
    </svg>
  );
}

// Bibliothèque – bois clair, livres colorés
export function IconBookshelf({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="3" y="1" width="26" height="31" rx="1.5" fill={W}/>
      <rect x="5" y="3" width="22" height="27" fill={WD}/>
      <rect x="3" y="11.5" width="26" height="2.5" fill="#9C7A4F"/>
      <rect x="3" y="22" width="26" height="2.5" fill="#9C7A4F"/>
      {/* Rangée du haut */}
      <rect x="5.5" y="3.5" width="4" height="7.5" rx="0.5" fill="#C84040"/>
      <rect x="10" y="4" width="3" height="7" rx="0.5" fill="#4070C8"/>
      <rect x="13.5" y="3.5" width="4" height="7.5" rx="0.5" fill="#40A040"/>
      <rect x="18" y="4" width="3.5" height="7" rx="0.5" fill="#C87040"/>
      <rect x="22" y="3.5" width="4.5" height="7.5" rx="0.5" fill="#9040C8"/>
      {/* Rangée du milieu */}
      <rect x="5.5" y="14" width="3" height="7.5" rx="0.5" fill="#40A080"/>
      <rect x="9" y="14" width="4" height="7.5" rx="0.5" fill="#C84060"/>
      <rect x="13.5" y="14" width="3.5" height="7.5" rx="0.5" fill="#6040C8"/>
      <rect x="17.5" y="14" width="4" height="7.5" rx="0.5" fill="#C8A040"/>
      <rect x="22" y="14" width="4.5" height="7.5" rx="0.5" fill="#40A0C8"/>
    </svg>
  );
}

// Commode 3 tiroirs – bois clair
export function IconDresser({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="2" y="3" width="28" height="27" rx="2" fill={W}/>
      <rect x="4" y="5" width="24" height="7" rx="1" fill={WD}/>
      <rect x="14" y="8" width="5" height="1.5" rx="0.75" fill="#9C7A4F"/>
      <rect x="4" y="13" width="24" height="7" rx="1" fill={WD}/>
      <rect x="14" y="16" width="5" height="1.5" rx="0.75" fill="#9C7A4F"/>
      <rect x="4" y="21" width="24" height="7" rx="1" fill={WD}/>
      <rect x="14" y="24" width="5" height="1.5" rx="0.75" fill="#9C7A4F"/>
      <rect x="5" y="30" width="6" height="2" rx="1" fill="#9C7A4F"/>
      <rect x="21" y="30" width="6" height="2" rx="1" fill="#9C7A4F"/>
    </svg>
  );
}

// Table de nuit – bois clair, petite, 1 tiroir
export function IconNightstand({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="4" y="5" width="24" height="3.5" rx="1.75" fill={WM}/>
      <rect x="5.5" y="8.5" width="21" height="21" rx="2" fill={W}/>
      <rect x="7.5" y="10.5" width="17" height="8" rx="1" fill={WD}/>
      <rect x="14" y="14" width="5" height="1.5" rx="0.75" fill="#9C7A4F"/>
      <rect x="7.5" y="20" width="17" height="8" rx="1" fill={WM} opacity="0.45"/>
      <rect x="7" y="28.5" width="4" height="3.5" rx="2" fill="#9C7A4F"/>
      <rect x="21" y="28.5" width="4" height="3.5" rx="2" fill="#9C7A4F"/>
    </svg>
  );
}

// Table basse – bois clair, large et basse
export function IconCoffeeTable({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="1" y="11" width="30" height="5" rx="2.5" fill={W}/>
      <rect x="3" y="16" width="26" height="2.5" rx="0.5" fill={WM}/>
      <rect x="4" y="18.5" width="4" height="12.5" rx="2" fill={WD}/>
      <rect x="24" y="18.5" width="4" height="12.5" rx="2" fill={WD}/>
      <rect x="9" y="18" width="2.5" height="11.5" rx="1.25" fill={WM}/>
      <rect x="20.5" y="18" width="2.5" height="11.5" rx="1.25" fill={WM}/>
    </svg>
  );
}

// Meuble TV – bois clair, très large et bas
export function IconTVUnit({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="1" y="11" width="30" height="17" rx="2" fill={W}/>
      <rect x="3" y="13.5" width="12" height="11" rx="1" fill={WD}/>
      <rect x="8.5" y="18.5" width="1.5" height="3" rx="0.75" fill="#9C7A4F"/>
      <rect x="17" y="13.5" width="12" height="11" rx="1" fill={WD}/>
      <rect x="22" y="18.5" width="1.5" height="3" rx="0.75" fill="#9C7A4F"/>
      <rect x="4" y="28" width="6" height="3.5" rx="1.75" fill="#9C7A4F"/>
      <rect x="22" y="28" width="6" height="3.5" rx="1.75" fill="#9C7A4F"/>
    </svg>
  );
}

// Buffet / Bahut – chêne foncé, 2 portes
export function IconBuffet({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="1" y="9" width="30" height="20" rx="2" fill={WK}/>
      <rect x="1" y="9" width="30" height="3.5" rx="2" fill={WKD}/>
      <rect x="3" y="12.5" width="12" height="14.5" rx="1" fill={WKM}/>
      <rect x="17" y="12.5" width="12" height="14.5" rx="1" fill={WKM}/>
      <rect x="15.25" y="12.5" width="1.5" height="14.5" fill={WKD}/>
      <ellipse cx="10.5" cy="20" rx="1.5" ry="1.2" fill={GD}/>
      <ellipse cx="21.5" cy="20" rx="1.5" ry="1.2" fill={GD}/>
      <rect x="4" y="29" width="6" height="3" rx="1.5" fill={WKD}/>
      <rect x="22" y="29" width="6" height="3" rx="1.5" fill={WKD}/>
    </svg>
  );
}

// Lit double – bois clair, oreillers et couette
export function IconBed({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="2" y="3" width="28" height="9" rx="3" fill={W}/>
      <rect x="2" y="12" width="28" height="15" rx="2" fill="#E8E4DF"/>
      <rect x="4" y="13" width="9" height="6" rx="2" fill="white"/>
      <rect x="19" y="13" width="9" height="6" rx="2" fill="white"/>
      <rect x="2" y="19" width="28" height="8" rx="2" fill={FB}/>
      <rect x="2" y="12" width="3" height="15" rx="1" fill={WD}/>
      <rect x="27" y="12" width="3" height="15" rx="1" fill={WD}/>
      <rect x="3" y="27" width="3.5" height="5" rx="1.75" fill={WM}/>
      <rect x="25.5" y="27" width="3.5" height="5" rx="1.75" fill={WM}/>
    </svg>
  );
}

// Matelas – crème capitonné, coutures visibles
export function IconMattress({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="2" y="7" width="28" height="18" rx="3" fill="#E8E4DF"/>
      <rect x="2" y="15" width="28" height="2" fill="#D0CBC4"/>
      <circle cx="9" cy="11" r="2" stroke="#C0B8B0" strokeWidth="1"/>
      <circle cx="16" cy="11" r="2" stroke="#C0B8B0" strokeWidth="1"/>
      <circle cx="23" cy="11" r="2" stroke="#C0B8B0" strokeWidth="1"/>
      <circle cx="9" cy="20" r="2" stroke="#C0B8B0" strokeWidth="1"/>
      <circle cx="16" cy="20" r="2" stroke="#C0B8B0" strokeWidth="1"/>
      <circle cx="23" cy="20" r="2" stroke="#C0B8B0" strokeWidth="1"/>
      <rect x="2" y="7" width="28" height="18" rx="3" stroke="#B8B4B0" strokeWidth="1"/>
    </svg>
  );
}

// Bureau – bois clair, caisson de tiroirs à gauche
export function IconDesk({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="1" y="8" width="30" height="5" rx="2.5" fill={W}/>
      <rect x="3" y="13" width="26" height="2.5" rx="1" fill={WM}/>
      <rect x="2" y="15.5" width="10" height="16.5" rx="1.5" fill={WD}/>
      <rect x="3.5" y="17" width="7" height="4" rx="0.5" fill={W}/>
      <rect x="6" y="18.5" width="2" height="1" rx="0.5" fill={WM}/>
      <rect x="3.5" y="22" width="7" height="4" rx="0.5" fill={W}/>
      <rect x="6" y="23.5" width="2" height="1" rx="0.5" fill={WM}/>
      <rect x="3.5" y="27" width="7" height="4" rx="0.5" fill={W}/>
      <rect x="6" y="28.5" width="2" height="1" rx="0.5" fill={WM}/>
      <rect x="27" y="15.5" width="3" height="16.5" rx="1.5" fill={W}/>
    </svg>
  );
}

// Chaise de bureau – tissu, accoudoirs, base étoile avec roulettes
export function IconOfficeChair({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="9" y="2" width="14" height="12" rx="2.5" fill={FB}/>
      <rect x="5.5" y="10" width="4" height="7" rx="2" fill={FBD}/>
      <rect x="22.5" y="10" width="4" height="7" rx="2" fill={FBD}/>
      <rect x="7" y="13" width="18" height="5" rx="2" fill={FB2}/>
      <rect x="14.5" y="18" width="3" height="7" fill={MT}/>
      <path d="M16 25 L7 29 M16 25 L25 29 M16 25 L11 31 M16 25 L21 31" stroke={MT} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="7" cy="29" r="1.5" fill={MTD}/>
      <circle cx="25" cy="29" r="1.5" fill={MTD}/>
      <circle cx="11" cy="31" r="1.5" fill={MTD}/>
      <circle cx="21" cy="31" r="1.5" fill={MTD}/>
    </svg>
  );
}

// Réfrigérateur – gris métal, congélateur en haut, poignées
export function IconFridge({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="5" y="2" width="22" height="10" rx="2" fill={APD}/>
      <rect x="5" y="13" width="22" height="19" rx="2" fill={AP}/>
      <rect x="5" y="11.5" width="22" height="2" fill="#A8ACAF"/>
      <rect x="22.5" y="4.5" width="2" height="5" rx="1" fill={APH}/>
      <rect x="22.5" y="15" width="2" height="8" rx="1" fill={APH}/>
      <rect x="5" y="30" width="22" height="2" rx="1" fill={APD}/>
    </svg>
  );
}

// Machine à laver – blanc, hublot bleu
export function IconWashingMachine({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="4" y="2" width="24" height="30" rx="3" fill={AP}/>
      <rect x="4" y="2" width="24" height="8" rx="3" fill={APD}/>
      <rect x="4" y="7" width="24" height="3" fill={APD}/>
      <circle cx="10" cy="5.5" r="2" fill={APH}/>
      <circle cx="10" cy="5.5" r="1" fill={APD}/>
      <rect x="16" y="4" width="8" height="3" rx="1" fill="#A0A8B0"/>
      <circle cx="16" cy="20" r="8" fill={APH}/>
      <circle cx="16" cy="20" r="7" fill={WB}/>
      <circle cx="16" cy="20" r="5.5" fill="#8ABCD8"/>
      <path d="M13 20 Q16 17 19 20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// Meuble sous vasque – blanc, 2 portes, vasque et robinet
export function IconVanityUnit({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="3" y="7" width="26" height="4" rx="1" fill={AP}/>
      <rect x="7" y="7" width="18" height="4" rx="2" fill={WB}/>
      <rect x="14.5" y="4" width="3" height="4" rx="1" fill={APH}/>
      <rect x="15.5" y="2" width="1" height="3" rx="0.5" fill={APH}/>
      <rect x="3" y="11" width="26" height="21" rx="2" fill="#E8E0D0"/>
      <rect x="5" y="13" width="10" height="17" rx="1" fill={CW}/>
      <rect x="17" y="13" width="10" height="17" rx="1" fill={CW}/>
      <rect x="15.5" y="13" width="1" height="17" fill={CWD}/>
      <rect x="12.5" y="21" width="1.5" height="1" rx="0.5" fill="#8A8070"/>
      <rect x="18" y="21" width="1.5" height="1" rx="0.5" fill="#8A8070"/>
    </svg>
  );
}

// Tapis – brun chaud, motif géométrique et franges
export function IconRug({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="3" y="2" width="2" height="4" rx="1" fill={RD}/>
      <rect x="8" y="2" width="2" height="4" rx="1" fill={RD}/>
      <rect x="13" y="2" width="2" height="4" rx="1" fill={RD}/>
      <rect x="18" y="2" width="2" height="4" rx="1" fill={RD}/>
      <rect x="23" y="2" width="2" height="4" rx="1" fill={RD}/>
      <rect x="28" y="2" width="2" height="4" rx="1" fill={RD}/>
      <rect x="2" y="6" width="28" height="20" rx="2" fill={RC}/>
      <rect x="4" y="8" width="24" height="16" rx="1" fill="none" stroke={RD} strokeWidth="1.5"/>
      <path d="M16 10 L22 16 L16 22 L10 16 Z" fill="#E8A870" opacity="0.7"/>
      <rect x="3" y="26" width="2" height="4" rx="1" fill={RD}/>
      <rect x="8" y="26" width="2" height="4" rx="1" fill={RD}/>
      <rect x="13" y="26" width="2" height="4" rx="1" fill={RD}/>
      <rect x="18" y="26" width="2" height="4" rx="1" fill={RD}/>
      <rect x="23" y="26" width="2" height="4" rx="1" fill={RD}/>
      <rect x="28" y="26" width="2" height="4" rx="1" fill={RD}/>
    </svg>
  );
}

// Porte-manteau sur pied – bois clair, crochets courbés
export function IconCoatRack({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="14.5" y="1" width="3" height="28" rx="1.5" fill={W}/>
      <rect x="5" y="5" width="22" height="2.5" rx="1.25" fill={WD}/>
      <path d="M5 5 Q3.5 5 3.5 7 Q3.5 9.5 5.5 9.5" stroke={WD} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M27 5 Q28.5 5 28.5 7 Q28.5 9.5 26.5 9.5" stroke={WD} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <rect x="9" y="13" width="14" height="2" rx="1" fill={WD}/>
      <path d="M9 13 Q7.5 13 7.5 15 Q7.5 17 9.5 17" stroke={WD} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M23 13 Q24.5 13 24.5 15 Q24.5 17 22.5 17" stroke={WD} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M16 29 L8 31 M16 29 L24 31 M16 29 L16 32" stroke={WM} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

// Meuble à chaussures – bois clair, portes inclinées
export function IconShoeCabinet({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="4" y="4" width="24" height="28" rx="2" fill={W}/>
      <rect x="4" y="4" width="24" height="3" rx="2" fill={WD}/>
      <path d="M6 8 L26 8 L26 14 L6 15 Z" fill={WD}/>
      <path d="M6 16 L26 15 L26 21 L6 22 Z" fill={WD}/>
      <path d="M6 23 L26 22 L26 28 L6 29 Z" fill={WD}/>
      <rect x="14" y="10.5" width="4" height="1.5" rx="0.75" fill={WM}/>
      <rect x="14" y="17.5" width="4" height="1.5" rx="0.75" fill={WM}/>
      <rect x="14" y="24.5" width="4" height="1.5" rx="0.75" fill={WM}/>
    </svg>
  );
}

// Baignoire – blanche, eau bleue, pieds galbés
export function IconBathtub({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="2" y="9" width="28" height="17" rx="6" fill={AP}/>
      <rect x="5" y="12" width="22" height="11" rx="4" fill="white"/>
      <rect x="5" y="17" width="22" height="6" rx="4" fill={WB}/>
      <rect x="12" y="6" width="8" height="4" rx="1.5" fill={APD}/>
      <rect x="15" y="3" width="2" height="4" rx="1" fill={APH}/>
      <path d="M6 25 Q6 31 10 31" stroke={APD} strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M26 25 Q26 31 22 31" stroke={APD} strokeWidth="3" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// Transat / chaise longue – tissu et cadre métal
export function IconGardenLounger({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <path d="M3 19 L13 4" stroke={FB} strokeWidth="6" strokeLinecap="round"/>
      <rect x="3" y="18" width="26" height="6" rx="2.5" fill={FB2}/>
      <path d="M3 19 L13 4" stroke={MT} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <rect x="5" y="24" width="3" height="8" rx="1.5" fill={MT}/>
      <rect x="24" y="24" width="3" height="8" rx="1.5" fill={MT}/>
    </svg>
  );
}

// Table de jardin – ronde, pied central, base en croix
export function IconGardenTable({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <ellipse cx="16" cy="10" rx="13" ry="5" fill={WD}/>
      <ellipse cx="16" cy="9" rx="13" ry="5" fill={W}/>
      <ellipse cx="16" cy="9" rx="13" ry="5" fill="none" stroke={WM} strokeWidth="1"/>
      <rect x="14.5" y="14" width="3" height="11" fill={WM}/>
      <rect x="7" y="24" width="18" height="2.5" rx="1.25" fill={WD}/>
    </svg>
  );
}

// Vaisselier – bois clair, vitrine haut, portes bas
export function IconChinaCabinet({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="3" y="2" width="26" height="30" rx="2" fill={W}/>
      <rect x="5" y="4" width="22" height="14" rx="1" fill={WB} opacity="0.75"/>
      <rect x="15.5" y="4" width="1.5" height="14" fill={WM} opacity="0.7"/>
      <rect x="5" y="10.5" width="22" height="1" fill={WM} opacity="0.5"/>
      <rect x="12" y="10" width="1.5" height="3.5" rx="0.75" fill={WM}/>
      <rect x="18.5" y="10" width="1.5" height="3.5" rx="0.75" fill={WM}/>
      <rect x="3" y="18" width="26" height="2" fill={WM}/>
      <rect x="5" y="20" width="10" height="10" rx="1" fill={WD}/>
      <rect x="17" y="20" width="10" height="10" rx="1" fill={WD}/>
      <rect x="15.5" y="20" width="1.5" height="10" fill={WM}/>
      <rect x="11.5" y="24" width="1.5" height="2.5" rx="0.75" fill={WM}/>
      <rect x="19" y="24" width="1.5" height="2.5" rx="0.75" fill={WM}/>
    </svg>
  );
}

// ─── Phase 3 ──────────────────────────────────────────────────────────────

// Télévision – écran plat, pied central
export function IconTV({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="2" y="4" width="28" height="18" rx="2" fill={MT}/>
      <rect x="4" y="6" width="24" height="14" rx="1" fill="#1A3050"/>
      <rect x="4" y="6" width="24" height="5" rx="1" fill="#2A5080" opacity="0.5"/>
      <rect x="11" y="22" width="10" height="1.5" rx="0.75" fill={MTD}/>
      <rect x="14.5" y="22" width="3" height="5" fill={MT}/>
      <rect x="10" y="27" width="12" height="2.5" rx="1.25" fill={MT}/>
    </svg>
  );
}

// Four / Cuisinière – 4 feux + porte four
export function IconOven({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="4" y="2" width="24" height="30" rx="2" fill={APD}/>
      <rect x="4" y="2" width="24" height="12" rx="2" fill="#B0B4B8"/>
      <circle cx="11" cy="7" r="3" stroke="#808488" strokeWidth="1.5"/>
      <circle cx="11" cy="7" r="1.5" stroke="#808488" strokeWidth="1"/>
      <circle cx="21" cy="7" r="3" stroke="#808488" strokeWidth="1.5"/>
      <circle cx="21" cy="7" r="1.5" stroke="#808488" strokeWidth="1"/>
      <rect x="4" y="14" width="24" height="2.5" fill={APH}/>
      <circle cx="9" cy="15.25" r="1.2" fill={AP}/>
      <circle cx="14" cy="15.25" r="1.2" fill={AP}/>
      <circle cx="19" cy="15.25" r="1.2" fill={AP}/>
      <circle cx="24" cy="15.25" r="1.2" fill={AP}/>
      <rect x="6" y="17.5" width="20" height="13" rx="1" fill="#9A9FA4"/>
      <rect x="10" y="19" width="12" height="2" rx="1" fill={APH}/>
      <rect x="9" y="22" width="14" height="8" rx="1" fill="#1A2A40" opacity="0.7"/>
    </svg>
  );
}

// Lave-vaisselle – blanc, touches contrôle, clayettes
export function IconDishwasher({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="4" y="2" width="24" height="30" rx="3" fill={AP}/>
      <rect x="4" y="2" width="24" height="7" rx="3" fill={APD}/>
      <rect x="4" y="7" width="24" height="2" fill={APD}/>
      <circle cx="11" cy="5.5" r="1.5" fill={APH}/>
      <circle cx="16" cy="5.5" r="1.5" fill={APH}/>
      <circle cx="21" cy="5.5" r="1.5" fill={APH}/>
      <rect x="8" y="10" width="16" height="2" rx="1" fill={APH}/>
      <rect x="6" y="13" width="20" height="17" rx="1" fill="#D0D4D8"/>
      <rect x="8.5" y="15" width="1" height="13" fill={APD}/>
      <rect x="12.5" y="15" width="1" height="13" fill={APD}/>
      <rect x="16.5" y="15" width="1" height="13" fill={APD}/>
      <rect x="20.5" y="15" width="1" height="13" fill={APD}/>
      <rect x="6" y="21.5" width="20" height="1" fill={APD}/>
    </svg>
  );
}

// Micro-ondes – horizontal, hublot à gauche, contrôles à droite
export function IconMicrowave({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="1" y="8" width="30" height="16" rx="3" fill={APD}/>
      <rect x="3" y="10" width="18" height="12" rx="2" fill="#B0B4B8"/>
      <rect x="5" y="12" width="14" height="8" rx="2" fill="#1A2540" opacity="0.85"/>
      <rect x="5" y="12" width="14" height="3" rx="2" fill="white" opacity="0.08"/>
      <rect x="22" y="10" width="7" height="12" rx="1" fill="#9A9FA4"/>
      <rect x="23.5" y="12" width="4" height="1.5" rx="0.75" fill={AP}/>
      <rect x="23.5" y="14.5" width="4" height="1.5" rx="0.75" fill={AP}/>
      <circle cx="25.5" cy="19.5" r="1.8" fill="#3A8A3A"/>
      <rect x="20.5" y="13" width="1.5" height="6" rx="0.75" fill={APH}/>
    </svg>
  );
}

// Écran PC – pied fin, base rectangulaire
export function IconMonitor({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="3" y="3" width="26" height="17" rx="2" fill={MT}/>
      <rect x="5" y="5" width="22" height="13" rx="1" fill="#1A3050"/>
      <rect x="5" y="5" width="22" height="4" rx="1" fill="#2A5080" opacity="0.4"/>
      <rect x="14.5" y="20" width="3" height="5" fill="#5A5A5A"/>
      <rect x="9" y="25" width="14" height="2.5" rx="1.25" fill={MT}/>
    </svg>
  );
}

// Caisson classeur – métal, 3 tiroirs avec poignées
export function IconFilingCabinet({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="7" y="2" width="18" height="30" rx="2" fill={APD}/>
      <rect x="7" y="2" width="18" height="3.5" rx="2" fill="#A0A4A8"/>
      <rect x="9" y="7" width="14" height="6.5" rx="1" fill={AP}/>
      <rect x="13" y="9.5" width="6" height="1.5" rx="0.75" fill={APH}/>
      <rect x="9" y="14.5" width="14" height="6.5" rx="1" fill={AP}/>
      <rect x="13" y="17" width="6" height="1.5" rx="0.75" fill={APH}/>
      <rect x="9" y="22" width="14" height="8" rx="1" fill={AP}/>
      <rect x="13" y="25.5" width="6" height="1.5" rx="0.75" fill={APH}/>
    </svg>
  );
}

// Colonne rangement SDB – haute et étroite, 2 sections
export function IconStorageColumn({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="9" y="1" width="14" height="31" rx="2" fill={AP}/>
      <rect x="11" y="3" width="10" height="13" rx="1" fill={APD}/>
      <rect x="15" y="8.5" width="2" height="1.5" rx="0.5" fill={APH}/>
      <rect x="9" y="16.5" width="14" height="1.5" fill={APH}/>
      <rect x="11" y="18.5" width="4.5" height="11" rx="1" fill={APD}/>
      <rect x="16.5" y="18.5" width="4.5" height="11" rx="1" fill={APD}/>
      <rect x="15.5" y="18.5" width="1" height="11" fill={AP}/>
      <rect x="12.5" y="23" width="1.5" height="1" rx="0.5" fill={APH}/>
      <rect x="18" y="23" width="1.5" height="1" rx="0.5" fill={APH}/>
    </svg>
  );
}

// Armoire de toilette – murale, 2 portes miroir
export function IconMedicineCabinet({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="6" y="4" width="4" height="3" rx="1" fill="#A0A4A8"/>
      <rect x="22" y="4" width="4" height="3" rx="1" fill="#A0A4A8"/>
      <rect x="3" y="7" width="26" height="22" rx="2" fill={APD}/>
      <rect x="5" y="9" width="11" height="18" rx="1" fill="#C8D8E8" opacity="0.85"/>
      <rect x="17" y="9" width="11" height="18" rx="1" fill="#C8D8E8" opacity="0.85"/>
      <rect x="6" y="10" width="3" height="9" rx="1" fill="white" opacity="0.2"/>
      <rect x="18" y="10" width="3" height="9" rx="1" fill="white" opacity="0.2"/>
      <rect x="15.5" y="9" width="1" height="18" fill={APH}/>
      <rect x="14" y="17" width="1.5" height="1" rx="0.5" fill={APH}/>
      <rect x="16.5" y="17" width="1.5" height="1" rx="0.5" fill={APH}/>
    </svg>
  );
}

// Vasque autoportante – cuvette + pied colonne + base
export function IconWashbasin({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="13.5" y="3" width="5" height="3" rx="1" fill={APH}/>
      <rect x="15.5" y="1" width="1" height="3.5" rx="0.5" fill={APH}/>
      <path d="M6 10 Q6 7 16 7 Q26 7 26 10 L24 19 Q24 21 16 21 Q8 21 8 19 Z" fill={AP}/>
      <path d="M9 11 Q9 9 16 9 Q23 9 23 11 L21 18 Q21 20 16 20 Q11 20 11 18 Z" fill="white"/>
      <circle cx="16" cy="19" r="1" fill={APD}/>
      <rect x="13" y="21" width="6" height="9" rx="1" fill={APD}/>
      <rect x="9" y="29" width="14" height="3" rx="1.5" fill={AP}/>
    </svg>
  );
}

// Table à repasser – plateau effilé + pieds croisés
export function IconIroningBoard({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <path d="M14 9 Q22 9 24 12 L12 12 Z" fill={APD}/>
      <rect x="12" y="10.5" width="12" height="1.5" rx="0.5" fill={APH}/>
      <rect x="19" y="7" width="3.5" height="3.5" rx="1.75" fill="#9A9FA4"/>
      <path d="M2 15 Q1 13.5 2 12.5 L5 12 L30 12 L30 15 Z" fill={AP}/>
      <rect x="2" y="15" width="28" height="2.5" fill={APD}/>
      <path d="M8 17.5 L5 29" stroke={APD} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M8 17.5 L14 29" stroke={APD} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M24 17.5 L21 29" stroke={APD} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M24 17.5 L27 29" stroke={APD} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

// Étendoir à linge – barre supérieure + pieds en X + barre médiane
export function IconClothesRack({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="4" y="5" width="24" height="2.5" rx="1.25" fill={AP}/>
      <path d="M8 7.5 L5 28" stroke={APD} strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 7.5 L14 28" stroke={APD} strokeWidth="2" strokeLinecap="round"/>
      <path d="M24 7.5 L18 28" stroke={APD} strokeWidth="2" strokeLinecap="round"/>
      <path d="M24 7.5 L27 28" stroke={APD} strokeWidth="2" strokeLinecap="round"/>
      <rect x="7" y="18" width="18" height="2" rx="1" fill={AP}/>
      <rect x="3" y="27" width="5" height="2" rx="1" fill={APD}/>
      <rect x="24" y="27" width="5" height="2" rx="1" fill={APD}/>
    </svg>
  );
}

// Aspirateur balai – corps + buse sol
export function IconVacuumCleaner({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="13" y="1" width="6" height="3" rx="1.5" fill={APH}/>
      <rect x="14.5" y="4" width="3" height="14" rx="1.5" fill={APD}/>
      <rect x="10" y="12" width="12" height="9" rx="2" fill={AP}/>
      <rect x="12" y="14" width="8" height="2" rx="1" fill={APH}/>
      <circle cx="20" cy="17.5" r="1.5" fill="#3A8A3A"/>
      <rect x="10" y="21" width="12" height="3" rx="1" fill={APD}/>
      <rect x="7" y="24" width="18" height="4" rx="2" fill={MT}/>
      <rect x="9" y="25.5" width="14" height="2" rx="1" fill={MTD}/>
    </svg>
  );
}

// Étagères garage/cave – montants métal + 4 tablettes
export function IconShelving({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="3" y="1" width="2.5" height="31" rx="1.25" fill="#5A6066"/>
      <rect x="26.5" y="1" width="2.5" height="31" rx="1.25" fill="#5A6066"/>
      <rect x="3" y="3" width="26" height="2.5" rx="0.5" fill={APH}/>
      <rect x="3" y="11" width="26" height="2.5" rx="0.5" fill={APH}/>
      <rect x="3" y="19" width="26" height="2.5" rx="0.5" fill={APH}/>
      <rect x="3" y="27" width="26" height="2.5" rx="0.5" fill={APH}/>
    </svg>
  );
}

// Vélo – silhouette cadre diamant + 2 roues
export function IconBike({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <circle cx="8" cy="23" r="6" stroke={MT} strokeWidth="2"/>
      <circle cx="8" cy="23" r="2" fill={MT}/>
      <circle cx="24" cy="23" r="6" stroke={MT} strokeWidth="2"/>
      <circle cx="24" cy="23" r="2" fill={MT}/>
      <path d="M8 23 L15 19 L10 11 L21 11 M15 19 L21 11 M21 11 L24 23"
            stroke={MT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="7" y="9" width="6" height="2" rx="1" fill={MT}/>
      <rect x="21" y="8" width="5" height="2" rx="1" fill={MT}/>
      <rect x="22" y="8" width="2" height="4" rx="1" fill={MT}/>
      <circle cx="15" cy="19" r="1.5" fill={MT}/>
    </svg>
  );
}

// Barbecue – cuve ronde avec couvercle + 3 pieds
export function IconBBQ({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="14" y="4" width="4" height="5" rx="2" fill={W}/>
      <path d="M6 16 Q6 8 16 8 Q26 8 26 16 Z" fill={MT}/>
      <rect x="6" y="15" width="20" height="2.5" rx="1" fill={MTD}/>
      <path d="M6 17.5 Q6 25 16 25 Q26 25 26 17.5 Z" fill="#4A4A4A"/>
      <rect x="8" y="20" width="16" height="1" rx="0.5" fill="#707070" opacity="0.7"/>
      <rect x="8" y="22.5" width="16" height="1" rx="0.5" fill="#707070" opacity="0.7"/>
      <path d="M10 25 L7 32" stroke={MT} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M22 25 L25 32" stroke={MT} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M16 25 L16 32" stroke={MT} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

// Tondeuse à gazon – corps vert + roues + guidon
export function IconLawnmower({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <path d="M20 4 L29 18" stroke={MT} strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="18" y="3" width="5" height="2.5" rx="1.25" fill={MT}/>
      <rect x="10" y="10" width="12" height="4" rx="1.5" fill={MT}/>
      <rect x="4" y="13" width="24" height="4" rx="2" fill={GRD}/>
      <rect x="4" y="16" width="24" height="9" rx="3" fill={GR}/>
      <circle cx="8" cy="25" r="4" stroke={MTD} strokeWidth="2"/>
      <circle cx="8" cy="25" r="1.5" fill={MTD}/>
      <circle cx="24" cy="25" r="4" stroke={MTD} strokeWidth="2"/>
      <circle cx="24" cy="25" r="1.5" fill={MTD}/>
    </svg>
  );
}

// Poussette bébé – capote + siège + 2 roues
export function IconStroller({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="5" y="8" width="4" height="2.5" rx="1.25" fill={MT}/>
      <path d="M9 9 Q11 9 11 14" stroke={MT} strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M11 14 Q11 6 20 6 Q27 6 27 14 Z" fill={FB}/>
      <rect x="9" y="14" width="18" height="8" rx="2" fill={FB2}/>
      <path d="M11 22 L8 29" stroke={MT} strokeWidth="2" strokeLinecap="round"/>
      <path d="M27 22 L28 29" stroke={MT} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="8" cy="29" r="3" stroke={MT} strokeWidth="2"/>
      <circle cx="28" cy="29" r="3" stroke={MT} strokeWidth="2"/>
    </svg>
  );
}

// Chaise haute bébé – dossier + plateau + longues jambes + repose-pieds
export function IconHighChair({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="9" y="3" width="14" height="11" rx="2.5" fill={W}/>
      <rect x="5" y="11" width="22" height="3" rx="1.5" fill={WD}/>
      <rect x="8" y="14" width="16" height="4" rx="2" fill={WM}/>
      <rect x="9" y="18" width="3.5" height="14" rx="1.75" fill={W}/>
      <rect x="19.5" y="18" width="3.5" height="14" rx="1.75" fill={W}/>
      <rect x="7" y="27" width="18" height="2.5" rx="1.25" fill={WM}/>
    </svg>
  );
}

// Sèche-serviettes – 2 montants + 5 barres horizontales
export function IconTowelRail({ size = 28, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <rect x="8" y="2" width="2.5" height="30" rx="1.25" fill={APD}/>
      <rect x="21.5" y="2" width="2.5" height="30" rx="1.25" fill={APD}/>
      <rect x="8" y="4.5" width="16" height="2" rx="1" fill={AP}/>
      <rect x="8" y="10" width="16" height="2" rx="1" fill={AP}/>
      <rect x="8" y="15.5" width="16" height="2" rx="1" fill={AP}/>
      <rect x="8" y="21" width="16" height="2" rx="1" fill={AP}/>
      <rect x="8" y="26.5" width="16" height="2" rx="1" fill={AP}/>
      <rect x="7" y="2" width="4.5" height="2.5" rx="1" fill="#A0A4A8" opacity="0.6"/>
      <rect x="20.5" y="2" width="4.5" height="2.5" rx="1" fill="#A0A4A8" opacity="0.6"/>
    </svg>
  );
}

// Mapping ID de catalogue → composant SVG
// Les emoji restent dans catalog.js pour la sérialisation JSON (Supabase).
// Ce mapping est utilisé uniquement pour l'affichage.
export const CATALOG_ICON_BY_ID = {
  // Chaises
  dining_chair: IconChair,
  chairs: IconChair,
  // Bancs
  bench_hallway: IconBench,
  entr_bench: IconBench,
  // Tabourets
  bath_stool: IconStool,
  // Consoles
  console: IconConsoleTable,
  entr_console: IconConsoleTable,
  // Tables
  dining_table: IconDiningTable,
  kitchen_table: IconDiningTable,
  // Canapés
  sofa2: IconSofa,
  sofa3: IconSofa,
  sofa_corner: IconSofa,
  sofa_bed: IconSofa,
  // Armoires
  wardrobe: IconWardrobe,
  // Fauteuils
  armchair: IconArmchair,
  // Bibliothèques
  bookshelf: IconBookshelf,
  dining_shelf: IconBookshelf,
  office_shelf: IconBookshelf,
  // Commodes
  dresser: IconDresser,
  // Tables de nuit
  nightstand: IconNightstand,
  // Tables basses
  coffee_table: IconCoffeeTable,
  // Meubles TV
  tv_unit: IconTVUnit,
  // Buffets
  buffet: IconBuffet,
  dining_console: IconBuffet,
  // Lit
  bed: IconBed,
  // Matelas
  mattress: IconMattress,
  // Bureau
  desk: IconDesk,
  office_desk: IconDesk,
  // Chaise de bureau
  officechair: IconOfficeChair,
  office_chair2: IconOfficeChair,
  // Réfrigérateur / congélateur
  fridge: IconFridge,
  fridge_small: IconFridge,
  fridge_combo: IconFridge,
  fridge_american: IconFridge,
  freezer_upright: IconFridge,
  // Machine à laver / sèche-linge
  washing_machine: IconWashingMachine,
  dryer: IconWashingMachine,
  washer_dryer: IconWashingMachine,
  // Meuble sous vasque
  vanity_unit: IconVanityUnit,
  // Tapis
  rug: IconRug,
  // Porte-manteau
  coat_rack: IconCoatRack,
  entr_coat_rack: IconCoatRack,
  // Meuble à chaussures
  shoe_cabinet: IconShoeCabinet,
  entr_shoe_cabinet: IconShoeCabinet,
  // Baignoire
  bathtub: IconBathtub,
  // Jardin
  garden_lounger: IconGardenLounger,
  garden_table: IconGardenTable,
  garden_chairs: IconChair,
  garden_set: IconGardenTable,
  // Vaisselier
  china_cabinet: IconChinaCabinet,
  // Réutilisations cross-pièces
  office_wardrobe: IconWardrobe,
  laundry_cabinet: IconWardrobe,
  // Phase 3 – TV
  tv: IconTV,
  living_tv: IconTV,
  dining_tv: IconTV,
  office_tv: IconTV,
  // Phase 3 – Cuisine
  oven: IconOven,
  dishwasher: IconDishwasher,
  microwave: IconMicrowave,
  freezer_chest: IconFridge,
  // Phase 3 – Bureau
  monitor: IconMonitor,
  filing_cabinet: IconFilingCabinet,
  server_rack: IconFilingCabinet,
  // Phase 3 – Salle de bain
  storage_column_bath: IconStorageColumn,
  medicine_cabinet: IconMedicineCabinet,
  washbasin: IconWashbasin,
  heated_towel_rail: IconTowelRail,
  bath_towel_rack: IconTowelRail,
  bath_shelf: IconBookshelf,
  // Phase 3 – Buanderie
  iron_board: IconIroningBoard,
  ironing_board_standalone: IconIroningBoard,
  clothes_rack: IconClothesRack,
  vacuum_cleaner: IconVacuumCleaner,
  steam_cleaner: IconVacuumCleaner,
  // Phase 3 – Garage/Cave
  shelving: IconShelving,
  bike_child: IconBike,
  bike_adult: IconBike,
  bike_electric: IconBike,
  garden_bike: IconBike,
  // Phase 3 – Jardin
  garden_bbq: IconBBQ,
  mower: IconLawnmower,
  garden_mower: IconLawnmower,
  // Phase 3 – Bébé
  stroller_single: IconStroller,
  stroller_double: IconStroller,
  baby_pram: IconStroller,
  high_chair: IconHighChair,
  baby_changing_dresser: IconDresser,
  baby_bath: IconBathtub,
};
