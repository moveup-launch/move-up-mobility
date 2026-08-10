import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pencil, FileText, Phone, ClipboardList, Trash2, MapPin, Home, Video, Mail, MessageSquare } from 'lucide-react';

// Propose 1 à 3 créneaux au choix du client au lieu d'une seule date figée.
// Si aucun créneau n'est saisi, on retombe sur le message "proposition
// d'une date unique" déjà existant (defaultSmsBody / defaultEmailBody).
// uiFr : langue de l'interface (Thomas, qui remplit la fenêtre) — distincte
// de clientFr : langue du message envoyé (celle du client, comme partout
// ailleurs dans ce fichier via msgFr).
function ProposeSlotsModal({ uiFr, clientFr, phone, email, defaultSmsBody, defaultEmailBody, emailSubject, smsSignature, emailSignature, onClose }) {
  const [slots, setSlots] = useState(['', '', '']);
  const setSlot = (i, v) => setSlots(s => s.map((x, idx) => (idx === i ? v : x)));
  const filled = slots.map(s => s.trim()).filter(Boolean);

  const buildBody = (forEmail) => {
    if (filled.length === 0) return forEmail ? defaultEmailBody : defaultSmsBody;
    const list = filled.map((s, i) => `${i + 1}) ${s}`).join('\n');
    const signature = forEmail ? emailSignature : smsSignature;
    return clientFr
      ? `Bonjour, voici plusieurs créneaux possibles pour votre visite de déménagement :\n\n${list}\n\nQuel créneau vous conviendrait le mieux ? N'hésitez pas à nous proposer une autre disponibilité si aucun ne vous convient.\n\n${signature}`
      : `Hello, here are a few possible slots for your moving survey visit:\n\n${list}\n\nWhich one would suit you best? Feel free to suggest another time if none of these work.\n\n${signature}`;
  };

  const sendSMS = () => {
    if (!phone) return;
    window.open(`sms:${phone}?body=${encodeURIComponent(buildBody(false))}`);
    onClose();
  };
  const sendEmail = () => {
    if (!email) return;
    window.open(`mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(buildBody(true))}`);
    onClose();
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', padding: '10px 12px', marginBottom: 8,
    borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'var(--font)',
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4, color: 'var(--text)' }}>
        {uiFr ? 'Proposer des créneaux' : 'Propose time slots'}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 14, lineHeight: 1.5 }}>
        {uiFr
          ? 'Laisse vide pour proposer simplement la date déjà prévue, ou indique 1 à 3 créneaux au choix du client.'
          : 'Leave blank to just propose the currently scheduled date, or enter 1 to 3 slots for the client to choose from.'}
      </div>
      {slots.map((s, i) => (
        <input
          key={i}
          value={s}
          onChange={e => setSlot(i, e.target.value)}
          placeholder={uiFr ? `Créneau ${i + 1} (ex: Lundi 14h)` : `Slot ${i + 1} (e.g. Monday 2pm)`}
          style={inputStyle}
        />
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          onClick={sendSMS}
          disabled={!phone}
          style={{
            flex: 1, padding: '12px', borderRadius: 8, border: '1px solid #FED7AA',
            background: phone ? '#FFF7ED' : 'var(--surface2)', color: phone ? '#C2410C' : 'var(--text3)',
            fontWeight: 700, fontSize: 13, cursor: phone ? 'pointer' : 'not-allowed',
          }}
        >
          {uiFr ? 'Envoyer par SMS →' : 'Send by SMS →'}
        </button>
        <button
          onClick={sendEmail}
          disabled={!email}
          style={{
            flex: 1, padding: '12px', borderRadius: 8, border: '1px solid #BFDBFE',
            background: email ? '#EFF6FF' : 'var(--surface2)', color: email ? '#1D4ED8' : 'var(--text3)',
            fontWeight: 700, fontSize: 13, cursor: email ? 'pointer' : 'not-allowed',
          }}
        >
          {uiFr ? 'Envoyer par Email →' : 'Send by Email →'}
        </button>
      </div>
      <button
        onClick={onClose}
        style={{ width: '100%', marginTop: 8, padding: '10px', background: 'none', border: 'none', color: 'var(--text3)', fontSize: 13, cursor: 'pointer' }}
      >
        {uiFr ? 'Annuler' : 'Cancel'}
      </button>
    </div>
  );
}

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
  const { lang, profile, openModal, closeModal } = useApp();
  const isFr = lang === 'fr';
  const v = visit;

  // Langue du client (pour les messages qui LUI sont destinés), distincte de
  // la langue de l'interface. Stockée dans client_data lors de la création.
  const msgFr = (v.client_data?.clientLang || 'fr') === 'fr';

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
  // Date formatée dans la langue du CLIENT (pour les SMS/emails qui lui sont destinés),
  // distincte de dateStr qui suit la langue de l'interface.
  const dateStrMsg = formatDate(v.visit_date, msgFr);

  // Identifiant universel (réel ou hors-ligne)
  const visitId = v._offlineId || v.id;

  // Boutons SMS + Email
  const clientFirstName = ((v.client_name || v.client_data?.name || '').split(' ')[0]) || '';
  const commercialFullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ');
  const companyName  = profile?.company_name  || '';
  const companyPhone = profile?.company_phone || '';
  const companyEmail = profile?.company_email || '';
  const companyWeb   = profile?.company_website || '';

  // Bloc signature — avec ou sans entreprise
  const smsSignature = companyName
    ? `${commercialFullName}${commercialFullName ? ' — ' : ''}${companyName}${companyPhone ? '\n' + companyPhone : ''}\nPowered by Move Up App`
    : (commercialFullName || 'Move Up App');

  const smsBody = msgFr
    ? `Bonjour ${clientFirstName}, votre visite de déménagement est confirmée le ${dateStrMsg}${timeStr ? ' à ' + timeStr : ''}.\n\n${smsSignature}`
    : `Hello ${clientFirstName}, your moving visit is confirmed on ${dateStrMsg}${timeStr ? ' at ' + timeStr : ''}.\n\n${smsSignature}`;
  const smsHref = phone ? `sms:${phone}?body=${encodeURIComponent(smsBody)}` : '';

  const proposeSmsBody = msgFr
    ? `Bonjour ${clientFirstName}, nous vous proposons de passer réaliser votre visite de déménagement le ${dateStrMsg}${timeStr ? ' à ' + timeStr : ''}. Cette date vous convient-elle ? N'hésitez pas à nous indiquer vos disponibilités si besoin.\n\n${smsSignature}`
    : `Hello ${clientFirstName}, we would like to propose ${dateStrMsg}${timeStr ? ' at ' + timeStr : ''} for your moving survey visit. Does this work for you? Let us know your availability if not.\n\n${smsSignature}`;

  const emailSignature = [
    commercialFullName,
    companyName,
    companyPhone,
    companyEmail,
    companyWeb,
    'Powered by Move Up App',
  ].filter(Boolean).join('\n');

  const emailSubject = msgFr
    ? 'Confirmation de votre visite de déménagement'
    : 'Moving visit confirmation';
  const emailBodyText = msgFr
    ? `Bonjour ${clientFirstName},\n\nNous confirmons votre visite de déménagement :\n\nDate : ${dateStrMsg}\nHeure : ${timeStr || 'À confirmer'}\nAdresse : ${address || 'À confirmer'}\n\nNotre équipe sera présente pour évaluer votre déménagement.\n\n${emailSignature}`
    : `Hello ${clientFirstName},\n\nWe confirm your moving visit:\n\nDate: ${dateStrMsg}\nTime: ${timeStr || 'To be confirmed'}\nAddress: ${address || 'To be confirmed'}\n\nOur team will be there to assess your move.\n\n${emailSignature}`;
  const mailtoHref = email
    ? `mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyText)}`
    : '';

  const proposeEmailSubject = msgFr ? 'Proposition de date de visite' : 'Visit date proposal';
  const proposeEmailBody = msgFr
    ? `Bonjour ${clientFirstName},\n\nNous vous proposons de passer réaliser votre visite de déménagement :\n\nDate proposée : ${dateStrMsg}\nHeure : ${timeStr || 'À définir'}\n\nCette date vous convient-elle ? N'hésitez pas à nous indiquer vos disponibilités si vous préférez un autre créneau.\n\n${emailSignature}`
    : `Hello ${clientFirstName},\n\nWe would like to propose the following for your moving survey visit:\n\nProposed date: ${dateStrMsg}\nTime: ${timeStr || 'To be defined'}\n\nDoes this work for you? Let us know your availability if you'd prefer another slot.\n\n${emailSignature}`;

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
        <div style={{ fontSize: '14px', color: 'var(--danger)', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Trash2 size={16} strokeWidth={2} /> {v.client_name} — {isFr ? 'Supprimer cette visite ?' : 'Delete this visit?'}
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
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span style={{
            fontSize: '11px', fontWeight: '700', padding: '3px 9px', borderRadius: '12px',
            background: isVideo ? '#EDE9FE' : '#F0FDF4',
            color: isVideo ? '#6D28D9' : '#16A34A',
            display: 'inline-flex', alignItems: 'center', gap: '4px',
          }}>
            {isVideo
              ? <><Video size={12} strokeWidth={2.5} /> {isFr ? 'Vidéo' : 'Video'}</>
              : <><Home size={12} strokeWidth={2.5} /> {isFr ? 'Sur place' : 'On site'}</>}
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
          <div style={{ fontSize: '13px', color: 'var(--text2)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <MapPin size={15} strokeWidth={2} style={{ flexShrink: 0, marginTop: '1px', color: 'var(--text3)' }} />
            <span>{address}</span>
          </div>
        )}
        {phone && (
          <a href={`tel:${phone}`} style={{
            fontSize: '13px', color: '#16A34A', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600',
          }}>
            <Phone size={15} strokeWidth={2} style={{ flexShrink: 0 }} /><span>{phone}</span>
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} style={{
            fontSize: '12px', color: 'var(--accent)', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <Mail size={15} strokeWidth={2} style={{ flexShrink: 0 }} /><span>{email}</span>
          </a>
        )}
      </div>

      {/* Boutons d'action */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
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
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            }}
          >
            {isOpening ? '…' : <><Play size={17} strokeWidth={2.5} fill="currentColor" /> {isFr ? 'Démarrer' : 'Start'}</>}
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
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
          }}
        >
          <Pencil size={16} strokeWidth={2} /> {isFr ? 'Modifier' : 'Edit'}
        </button>

        {isPast && (
          <button
            onClick={() => onOpen(visitId, 4)}
            disabled={isOpening}
            style={{
              ...btn, background: 'var(--accent-light)', color: 'var(--accent)',
              border: '1px solid var(--accent)', flex: '1 1 70px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            <FileText size={16} strokeWidth={2} /> PDF
          </button>
        )}

        {phone && (
          <a
            href={`tel:${phone}`}
            style={{
              ...btn, background: 'var(--surface)', color: 'var(--text2)',
              border: '1px solid var(--border)', textDecoration: 'none',
              padding: '9px 12px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title={isFr ? 'Appeler' : 'Call'}
          >
            <Phone size={18} strokeWidth={2} />
          </a>
        )}

        {onQuote && !isPending && (
          <button
            onClick={() => onQuote(visitId)}
            style={{
              ...btn, background: 'var(--surface)', color: 'var(--text2)',
              border: '1px solid var(--border)', padding: '9px 12px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title={isFr ? 'Créer un devis' : 'Create a quote'}
          >
            <ClipboardList size={18} strokeWidth={2} />
          </button>
        )}
        <button
          onClick={() => onDeleteRequest(visitId)}
          style={{
            ...btn, background: 'var(--surface)', color: 'var(--danger)',
            border: '1px solid var(--border)', padding: '9px 12px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          title={isFr ? 'Supprimer' : 'Delete'}
        >
          <Trash2 size={18} strokeWidth={2} />
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
            <Video size={16} strokeWidth={2} style={{ marginRight: 6, verticalAlign: 'middle', display: 'inline' }} />{isFr ? 'Rejoindre la visio' : 'Join video call'}
          </a>
        </div>
      )}

      {!isPast && (
        <>
          <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text3)', marginTop: '8px', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            {isFr ? '1. Proposer la date' : '1. Propose the date'}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              disabled={!phone && !email}
              onClick={() => openModal(
                <ProposeSlotsModal
                  uiFr={isFr}
                  clientFr={msgFr}
                  phone={phone}
                  email={email}
                  defaultSmsBody={proposeSmsBody}
                  defaultEmailBody={proposeEmailBody}
                  emailSubject={proposeEmailSubject}
                  smsSignature={smsSignature}
                  emailSignature={emailSignature}
                  onClose={closeModal}
                />
              )}
              style={{
                ...btn, flex: 1,
                background: (phone || email) ? '#FFF7ED' : 'var(--surface2)',
                color: (phone || email) ? '#C2410C' : 'var(--text3)',
                border: `1px solid ${(phone || email) ? '#FED7AA' : 'var(--border)'}`,
                opacity: (phone || email) ? 1 : 0.4,
                cursor: (phone || email) ? 'pointer' : 'not-allowed',
              }}
            >
              <MessageSquare size={15} strokeWidth={2} style={{marginRight:5,verticalAlign:"middle",display:"inline"}} />
              {isFr ? 'Proposer un créneau' : 'Propose a slot'}
            </button>
          </div>
          <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text3)', marginTop: '8px', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            {isFr ? '2. Confirmer le RDV' : '2. Confirm the appointment'}
          </div>
        </>
      )}
      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
        {phone ? (
          <a
            href={smsHref}
            style={{
              ...btn, flex: 1, background: '#FFF7ED', color: '#C2410C',
              border: '1px solid #FED7AA', textDecoration: 'none',
            }}
          >
            <MessageSquare size={15} strokeWidth={2} style={{marginRight:5,verticalAlign:"middle",display:"inline"}} />SMS
          </a>
        ) : (
          <button
            disabled
            style={{
              ...btn, flex: 1, background: 'var(--surface2)', color: 'var(--text3)',
              border: '1px solid var(--border)', opacity: 0.4, cursor: 'not-allowed',
            }}
          >
            <MessageSquare size={15} strokeWidth={2} style={{marginRight:5,verticalAlign:"middle",display:"inline"}} />SMS
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
            <Mail size={15} strokeWidth={2} style={{marginRight:5,verticalAlign:"middle",display:"inline"}} />Email
          </a>
        ) : (
          <button
            disabled
            style={{
              ...btn, flex: 1, background: 'var(--surface2)', color: 'var(--text3)',
              border: '1px solid var(--border)', opacity: 0.4, cursor: 'not-allowed',
            }}
          >
            <Mail size={15} strokeWidth={2} style={{marginRight:5,verticalAlign:"middle",display:"inline"}} />Email
          </button>
        )}
      </div>
    </div>
  );
}
