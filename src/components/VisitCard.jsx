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
  isPending = false,
  isOpening = false,
  isConfirmingDelete = false,
  isDeleting = false,
  onOpen,
  onQuote = null,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
  statusSelector = null,
}) {
  const { lang, profile } = useApp();
  const isFr = lang === 'fr';
  const v = visit;

  const status    = getStatusInfo(v.visit_status, isFr);
  const phone     = v.client_phone || v.client_data?.phone || '';
  const email     = v.client_email || v.client_data?.email || '';
  const isVideo   = v.visit_type === 'video';
  const videoLink = v.video_link || '';

  const addrParts = [];
  if (v.origin_data?.address) addrParts.push(v.origin_data.address);
  const cityPart = [v.origin_data?.postalCode, v.origin_data?.city].filter(Boolean).join(' ');
  if (cityPart) addrParts.push(cityPart);
  const address = addrParts.join(', ');

  const dateStr = formatDate(v.visit_date, isFr);
  const timeStr = formatTime(v.visit_time);

  // Identifiant universel (réel ou hors-ligne)
  const visitId = v._offlineId || v.id;

  // Boutons SMS + Email
  const clientFirstName = (v.client_name || '').split(' ')[0] || '';
  const commercialFullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ');
  const companyName  = profile?.company_name  || '';
  const companyPhone = profile?.company_phone || '';
  const companyEmail = profile?.company_email || '';
  const companyWeb   = profile?.company_website || '';

  // Bloc signature — avec ou sans entreprise
  const smsSignature = companyName
    ? `${commercialFullName}${commercialFullName ? ' — ' : ''}${companyName}${companyPhone ? '\n' + companyPhone : ''}\nPowered by Move Up Mobility`
    : (commercialFullName || 'Move Up Mobility');

  const smsBody = isFr
    ? `Bonjour ${clientFirstName}, votre visite de déménagement est confirmée le ${dateStr}${timeStr ? ' à ' + timeStr : ''}.\n\n${smsSignature}`
    : `Hello ${clientFirstName}, your moving visit is confirmed on ${dateStr}${timeStr ? ' at ' + timeStr : ''}.\n\n${smsSignature}`;
  const smsHref = phone ? `sms:${phone}?body=${encodeURIComponent(smsBody)}` : '';

  const emailSignature = [
    commercialFullName,
    companyName,
    companyPhone,
    companyEmail,
    companyWeb,
    'Powered by Move Up Mobility',
  ].filter(Boolean).join('\n');

  const emailSubject = isFr
    ? 'Confirmation de votre visite de déménagement'
    : 'Moving visit confirmation';
  const emailBodyText = isFr
    ? `Bonjour ${clientFirstName},\n\nNous confirmons votre visite de déménagement :\n\nDate : ${dateStr}\nHeure : ${timeStr || 'À confirmer'}\nAdresse : ${address || 'À confirmer'}\n\nNotre équipe sera présente pour évaluer votre déménagement.\n\n${emailSignature}`
    : `Hello ${clientFirstName},\n\nWe confirm your moving visit:\n\nDate: ${dateStr}\nTime: ${timeStr || 'To be confirmed'}\nAddress: ${address || 'To be confirmed'}\n\nOur team will be there to assess your move.\n\n${emailSignature}`;
  const mailtoHref = email
    ? `mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyText)}`
    : '';

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
            onClick={() => onDeleteConfirm(visitId)}
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
      borderLeft: `4px solid ${isPending ? '#F59E0B' : status.color}`,
      opacity: v.visit_status === 'annulee' ? 0.65 : 1,
    }}>

      {/* Badge hors-ligne */}
      {isPending && (
        <div style={{
          fontSize: '11px', fontWeight: '700', color: '#92400E',
          background: '#FEF3C7', border: '1px solid #FCD34D',
          borderRadius: '6px', padding: '3px 8px', marginBottom: '8px',
          display: 'inline-block',
        }}>
          ⏳ {isFr ? 'En attente de synchronisation' : 'Pending sync'}
        </div>
      )}

      {/* Ligne 1 : date + heure — badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', gap: '8px', overflow: 'hidden' }}>
        <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '600', lineHeight: 1.4, flex: 1, minWidth: 0, overflow: 'hidden' }}>
          {dateStr}
          {timeStr && (
            <span style={{ color: 'var(--accent)', fontWeight: '700' }}> — {timeStr}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
          <span style={{
            fontSize: '11px', fontWeight: '700', padding: '2px 7px', borderRadius: '12px',
            background: isVideo ? '#EDE9FE' : '#F0FDF4',
            color: isVideo ? '#6D28D9' : '#16A34A',
          }}>
            {isVideo ? '📹 Vidéo' : '🏠 Physique'}
          </span>
          {statusSelector || (
            <span style={{
              fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px',
              background: status.bg, color: status.color, whiteSpace: 'nowrap',
              maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {status.label}
            </span>
          )}
        </div>
      </div>

      {/* Nom client */}
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
            onClick={() => !isPending && onOpen(visitId, 0)}
            disabled={isOpening || isPending}
            style={{
              ...btn,
              background: isPending ? 'var(--surface2)' : 'var(--accent)',
              color: isPending ? 'var(--text3)' : 'white',
              flex: '2 1 120px',
              opacity: (isOpening || isPending) ? 0.6 : 1,
              cursor: isPending ? 'default' : 'pointer',
            }}
          >
            {isOpening ? '⏳' : `▶ ${isFr ? 'Démarrer' : 'Start'}`}
          </button>
        )}

        <button
          onClick={() => !isPending && onOpen(visitId, 0)}
          disabled={isOpening || isPending}
          style={{
            ...btn,
            background: 'var(--surface2)',
            color: isPending ? 'var(--text3)' : 'var(--text)',
            border: '1px solid var(--border)',
            flex: '1 1 90px',
            opacity: isPending ? 0.5 : 1,
            cursor: isPending ? 'default' : 'pointer',
          }}
        >
          ✏️ {isFr ? 'Modifier' : 'Edit'}
        </button>

        {isPast && (
          <button
            onClick={() => onOpen(visitId, 4)}
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

        {onQuote && !isPending && (
          <button
            onClick={() => onQuote(visitId)}
            style={{
              ...btn, background: '#F5F3FF', color: '#7C3AED',
              border: '1px solid #7C3AED', padding: '9px 11px', flexShrink: 0,
            }}
            title={isFr ? 'Créer un devis' : 'Create a quote'}
          >
            📋
          </button>
        )}
        <button
          onClick={() => onDeleteRequest(visitId)}
          style={{
            ...btn, background: 'var(--danger-light)', color: 'var(--danger)',
            border: '1px solid var(--danger)', padding: '9px 11px', flexShrink: 0,
          }}
        >
          🗑️
        </button>
      </div>

      {/* Lien visio */}
      {isVideo && videoLink && (
        <div style={{ marginTop: '6px' }}>
          <a
            href={videoLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...btn,
              width: '100%', justifyContent: 'center',
              background: '#EDE9FE', color: '#6D28D9',
              border: '1px solid #C4B5FD',
              textDecoration: 'none', boxSizing: 'border-box',
            }}
          >
            📹 {isFr ? 'Rejoindre la visio' : 'Join video call'}
          </a>
        </div>
      )}

      {/* Boutons confirmation SMS + Email */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
        {phone ? (
          <a
            href={smsHref}
            style={{
              ...btn, flex: 1, background: '#FFF7ED', color: '#C2410C',
              border: '1px solid #FED7AA', textDecoration: 'none',
            }}
          >
            📱 SMS
          </a>
        ) : (
          <button
            disabled
            style={{
              ...btn, flex: 1, background: 'var(--surface2)', color: 'var(--text3)',
              border: '1px solid var(--border)', opacity: 0.4, cursor: 'not-allowed',
            }}
          >
            📱 SMS
          </button>
        )}
        {email ? (
          <a
            href={mailtoHref}
            style={{
              ...btn, flex: 1, background: '#EFF6FF', color: '#1D4ED8',
              border: '1px solid #BFDBFE', textDecoration: 'none',
            }}
          >
            📧 Email
          </a>
        ) : (
          <button
            disabled
            style={{
              ...btn, flex: 1, background: 'var(--surface2)', color: 'var(--text3)',
              border: '1px solid var(--border)', opacity: 0.4, cursor: 'not-allowed',
            }}
          >
            📧 Email
          </button>
        )}
      </div>
    </div>
  );
}
