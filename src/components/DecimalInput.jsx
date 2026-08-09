import { useState, useRef, useEffect } from 'react';

// Remplace type="number" pour les champs décimaux : accepte point ET virgule
// comme séparateur (type="number" natif dépend de la locale navigateur/OS
// pour interpréter le séparateur, ce qui pouvait faire disparaître le point
// saisi). Affiche tel que tapé ; onChange renvoie toujours une chaîne
// normalisée au point — donc parseFloat(e.target.value) côté appelant
// continue de fonctionner sans aucun changement.
export default function DecimalInput({ value, onChange, integer = false, min, max, onFocus, onBlur, ...rest }) {
  const toStr = (v) => (v === null || v === undefined ? '' : String(v));
  const [display, setDisplay] = useState(toStr(value));
  const focusedRef = useRef(false);

  // Ne resynchronise l'affichage depuis `value` que si l'utilisateur n'est
  // pas en train de taper — sinon un aller-retour de state du parent pourrait
  // effacer la virgule/point en cours de frappe.
  useEffect(() => {
    if (!focusedRef.current) setDisplay(toStr(value));
  }, [value]);

  const sanitize = (raw) => {
    let s = integer ? raw.replace(/[^0-9]/g, '') : raw.replace(/[^0-9,.]/g, '');
    if (!integer) {
      const i = s.search(/[,.]/);
      if (i !== -1) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/[,.]/g, '');
    }
    return s;
  };

  const handleChange = (e) => {
    const s = sanitize(e.target.value);
    setDisplay(s);
    onChange({ target: { value: s.replace(',', '.') } });
  };

  const handleFocus = (e) => { focusedRef.current = true; onFocus?.(e); };

  const handleBlur = (e) => {
    focusedRef.current = false;
    const num = parseFloat(display.replace(',', '.'));
    if (!Number.isNaN(num)) {
      let clamped = num;
      if (min != null && clamped < min) clamped = min;
      if (max != null && clamped > max) clamped = max;
      if (clamped !== num) {
        const s = String(clamped);
        setDisplay(s);
        onChange({ target: { value: s } });
      }
    }
    onBlur?.(e);
  };

  return (
    <input
      type="text"
      inputMode={integer ? 'numeric' : 'decimal'}
      value={display}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...rest}
    />
  );
}
