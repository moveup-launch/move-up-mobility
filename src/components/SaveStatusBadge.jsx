import { useApp } from '../context/AppContext';

// Reflète saveStatus (AppContext), calculé par l'auto-save mais jamais
// affiché nulle part avant — réassurance passive, pas un bouton d'action.
export default function SaveStatusBadge() {
  const { saveStatus, lang } = useApp();
  const isFr = lang === 'fr';

  const config = {
    saving: { label: isFr ? 'Enregistrement…' : 'Saving…', color: 'var(--text3)' },
    saved: { label: isFr ? '✓ Enregistré' : '✓ Saved', color: 'var(--success)' },
    offline: { label: isFr ? 'Hors ligne — sera synchronisé' : 'Offline — will sync', color: 'var(--warn)' },
  };
  const c = config[saveStatus];
  if (!c) return null;

  return (
    <span style={{ fontSize: '11px', fontWeight: '600', color: c.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
      {c.label}
    </span>
  );
}
