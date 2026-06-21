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
const GD = '#C8A876'; // dorée (poignées)

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
};
