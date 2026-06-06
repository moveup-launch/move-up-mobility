import { useApp } from '../context/AppContext';

function getStatusInfo(status, isFr) {
  const map = {
    prevue:   { label: isFr ? 'Prévue' : 'Planned',      color: '#2B6BE6', bg: '#EEF4FF' },
    en_cours: { label: isFr ? 'En cours' : 'In progress', color: '#D97706', bg: '#FFFBEB' },
    terminee: { label: isFr ? 'Terminée' : 'Completed',   color: '#16A34A', bg: '#F0FDF4' },
    annulee:  { label: isFr ? 'Annulée' : 'Cancelled',    color: '#6B7280', bg: '#F3F4F6' },
  };
  return map[status || 'prevue'] || map.prevue;
}

function formatDate(dateStr, isFr) {
  if (!dateStr) return '—';
  try {
    const str = new Date(dateStr + 'T12:00:00').toLocaleDateString(
      isFr ? 'fr-FR' : 'en-GB',
      { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    );
    return str.charAt(0).toUpperCase() + str.slice(1);
  } catch { return dateStr; }
}

function formatTime(timeStr) {
  if (!timeStr) return null;
  return timeStr.replace(':', 'h');
}

export default function VisitCard({
  visit,
  isPast = false,
  isOpening = false,
  isConfirmingDelete = false,
  isDeleting = false,
  onOpen,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
  statusSelector = null,
}) {
  const { lang } = useApp();
  const isFr = lang === 'fr';
  const v = visit;

  const status = getStatusInfo(v.visit_status, isFr);
  const phone  = v.client_phone || v.client_data?.phone || '';
  const email  = v.client_email || v.client_data?.email || '';

  const addrParts = [];
  if (v.origin_data?.address) addrParts.push(v.origin_data.address);
  const cityPart = [v.origin_data?.postalCode, v.origin_data?.city].filter(Boolean).join(' ');
  if (cityPart) addrParts.push(cityPart);
  const address = addrParts.join(', ');

  const dateStr = formatDate(v.visit_date, isFr);
  const timeStr = formatTime(v.visit_time);

  const btn = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '4px', padding: '9px 12px', borderRadius: '8px',
    fontWeight: '700', fontSize: '13px', cursor: 'pointer', border: 'none',
  };

  /* ── Confirmation suppression ─────────────────────────────── */
  if (isConfirmingDelete) {
    return (
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--danger)',
        borderRadius: 'var(--radius-sm)', padding: '14px',
        borderLeft: '4px solid var(--danger)',
      }}>
        <div style={{ fontSize: '14px', color: 'var(--danger)', fontWeight: '700', marginBottom: '10px' }}>
          🗑️ {v.client_name} — {isFr ? 'Supprimer cette visite ?' : 'Delete this visit?'}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onDeleteConfirm(v.id)}
            disabled={isDeleting}
            style={{ ...btn, background: 'var(--danger)', color: 'white', flex: 1 }}
          >
            {isDeleting ? '…' : (isFr ? 'Oui, supprimer' : 'Yes, delete')}
          </button>
          <button
            onClick={onDeleteCancel}
            style={{ ...btn, background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)', flex: 1 }}
          >
            {isFr ? 'Annuler' : 'Cancel'}
          </button>
        </div>
      </div>
    );
  }

  /* ── Carte normale ────────────────────────────────────────── */
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)', padding: '14px',
      borderLeft: `4px solid ${status.color}`,
      opacity: v.visit_status === 'annulee' ? 0.65 : 1,
    }}>

      {/* Ligne 1 : date + heure — statut */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', gap: '8px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '600', lineHeight: 1.4 }}>
          {dateStr}
          {timeStr && (
            <span style={{ color: 'var(--accent)', fontWeight: '700' }}> — {timeStr}</span>
          )}
        </div>
        {statusSelector || (
          <span style={{
            fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px',
            background: status.bg, color: status.color, whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {status.label}
          </span>
        )}
      </div>

      {/* Ligne 2 : Nom client */}
      <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text)', marginBottom: '8px', lineHeight: 1.2 }}>
        {v.client_name || (isFr ? 'Client sans nom' : 'Unnamed client')}
      </div>

      {/* Infos de contact */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
        {address && (
          <div style={{ fontSize: '13px', color: 'var(--text2)', display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
            <span style={{ flexShrink: 0, marginTop: '1px' }}>📍</span>
            <span>{address}</span>
          </div>
        )}
        {phone && (
          <a href={`tel:${phone}`} style={{
            fontSize: '13px', color: '#16A34A', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600',
          }}>
            <span>📞</span><span>{phone}</span>
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} style={{
            fontSize: '12px', color: 'var(--accent)', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '5px',
          }}>
            <span>✉️</span><span>{email}</span>
          </a>
        )}
      </div>

      {/* Boutons d'action */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {!isPast && (
          <button
            onClick={() => onOpen(v.id, 0)}
            disabled={isOpening}
            style={{
              ...btn, background: 'var(--accent)', color: 'white',
              flex: '2 1 120px', opacity: isOpening ? 0.7 : 1,
            }}
          >
            {isOpening ? '⏳' : `▶ ${isFr ? 'Démarrer' : 'Start'}`}
          </button>
        )}

        <button
          onClick={() => onOpen(v.id, 0)}
          disabled={isOpening}
          style={{
            ...btn, background: 'var(--surface2)', color: 'var(--text)',
            border: '1px solid var(--border)', flex: '1 1 90px',
          }}
        >
          ✏️ {isFr ? 'Modifier' : 'Edit'}
        </button>

        {isPast && (
          <button
            onClick={() => onOpen(v.id, 4)}
            disabled={isOpening}
            style={{
              ...btn, background: 'var(--accent-light)', color: 'var(--accent)',
              border: '1px solid var(--accent)', flex: '1 1 70px',
            }}
          >
            📄 PDF
          </button>
        )}

        {phone && (
          <a
            href={`tel:${phone}`}
            style={{
              ...btn, background: '#F0FDF4', color: '#16A34A',
              border: '1px solid #BBF7D0', textDecoration: 'none',
              padding: '9px 13px', flexShrink: 0,
            }}
          >
            📞
          </a>
        )}

        <button
          onClick={() => onDeleteRequest(v.id)}
          style={{
            ...btn, background: 'var(--danger-light)', color: 'var(--danger)',
            border: '1px solid var(--danger)', padding: '9px 11px', flexShrink: 0,
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
