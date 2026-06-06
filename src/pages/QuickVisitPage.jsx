import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { sendConfirmationEmail } from '../lib/resend';

export default function QuickVisitPage() {
  const { t, lang, state, updateClient, updateOrigin, saveVisit, setViewMode } = useApp();
  const isFr = lang === 'fr';
  const d = state.client;
  const o = state.origin;

  const [status, setStatus] = useState('idle');
  const [errors, setErrors] = useState({});
  const [emailStatus, setEmailStatus] = useState('idle');

  const validate = () => {
    const e = {};
    if (!d.name.trim()) e.name = isFr ? 'Obligatoire' : 'Required';
    if (!d.phone.trim()) e.phone = isFr ? 'Obligatoire' : 'Required';
    if (!d.visitDate) e.visitDate = isFr ? 'Obligatoire' : 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setStatus('saving');
    const { error } = await saveVisit();
    if (error) {
      console.error('saveVisit error:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }
    setStatus('saved');
  };

  const handleSendEmail = async () => {
    if (!d.email) return;
    setEmailStatus('sending');
    const { error } = await sendConfirmationEmail({
      to: d.email,
      clientName: d.name,
      visitDate: d.visitDate,
      visitTime: d.visitTime,
      commercialName: d.surveyor,
      originAddress: [o.address, o.postalCode, o.city].filter(Boolean).join(', '),
      lang,
    });
    if (error) {
      setEmailStatus('error');
      setTimeout(() => setEmailStatus('idle'), 4000);
    } else {
      setEmailStatus('sent');
    }
  };

  if (status === 'saved') {
    return (
      <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '32px 0 20px' }}>
          <div style={{ fontSize: '52px', marginBottom: '12px' }}>✅</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', marginBottom: '6px' }}>
            {t('visitCreated')}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text3)' }}>
            {d.name}
            {d.visitDate && <> · <span style={{ color: 'var(--accent)', fontWeight: '600' }}>{d.visitDate}</span></>}
            {d.visitTime && <> · {d.visitTime}</>}
          </div>
        </div>

        {/* Bouton email */}
        <div style={{ marginBottom: '12px' }}>
          {!d.email ? (
            <div style={{
              padding: '12px 16px', background: 'var(--surface2)', borderRadius: '10px',
              fontSize: '13px', color: 'var(--text3)', textAlign: 'center',
            }}>
              {isFr ? 'Aucun email client — confirmation non envoyable' : 'No client email — cannot send confirmation'}
            </div>
          ) : emailStatus === 'sent' ? (
            <div style={{
              background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px',
              padding: '14px 16px', textAlign: 'center', color: '#16A34A', fontWeight: '700', fontSize: '15px',
            }}>
              ✅ {t('confirmEmailSent')} — {d.email}
            </div>
          ) : (
            <button
              onClick={handleSendEmail}
              disabled={emailStatus === 'sending'}
              style={{
                width: '100%', padding: '14px', borderRadius: '10px',
                border: '2px solid var(--accent)', background: 'var(--accent-light)',
                color: 'var(--accent)', fontWeight: '700', fontSize: '15px',
                cursor: emailStatus === 'sending' ? 'default' : 'pointer',
                opacity: emailStatus === 'sending' ? 0.7 : 1,
              }}
            >
              {emailStatus === 'sending'
                ? (isFr ? '⏳ Envoi…' : '⏳ Sending…')
                : emailStatus === 'error'
                  ? `❌ ${t('confirmEmailError')} — ${isFr ? 'réessayer' : 'retry'}`
                  : `✉️ ${t('sendConfirmEmail')}`}
            </button>
          )}
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '15px', marginBottom: '8px' }}
          onClick={() => setViewMode('agenda')}
        >
          📅 {t('viewAgenda')}
        </button>
        <button
          className="btn btn-secondary"
          style={{ width: '100%', padding: '12px', fontSize: '14px' }}
          onClick={() => setViewMode('dashboard')}
        >
          🏠 {isFr ? 'Tableau de bord' : 'Dashboard'}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="section-header">
        <div className="section-title">✏️ {t('quickVisit')}</div>
        <div className="section-subtitle">
          {isFr ? 'Créez une visite en quelques secondes' : 'Create a visit in seconds'}
        </div>
      </div>

      {/* Infos client */}
      <div className="card">
        <div className="card-title">👤 {t('clientInfo')}</div>

        <div className="field">
          <label>{t('clientName')} *</label>
          <input
            type="text"
            value={d.name}
            onChange={e => { updateClient('name', e.target.value); setErrors(er => ({ ...er, name: undefined })); }}
            placeholder="Jean Dupont"
            style={errors.name ? { borderColor: 'var(--danger)' } : {}}
          />
          {errors.name && <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '3px' }}>{errors.name}</div>}
        </div>

        <div className="field">
          <label>{t('clientPhone')} *</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="tel"
              value={d.phone}
              onChange={e => { updateClient('phone', e.target.value); setErrors(er => ({ ...er, phone: undefined })); }}
              placeholder="+33 6 12 34 56 78"
              style={{ flex: 1, ...(errors.phone ? { borderColor: 'var(--danger)' } : {}) }}
            />
            {d.phone && (
              <a href={`tel:${d.phone}`} style={{
                padding: '10px 12px', borderRadius: '8px', background: '#F0FDF4',
                color: '#16A34A', textDecoration: 'none', fontSize: '16px',
                border: '1px solid #BBF7D0', flexShrink: 0,
              }}>
                📞
              </a>
            )}
          </div>
          {errors.phone && <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '3px' }}>{errors.phone}</div>}
        </div>

        <div className="field">
          <label>{t('clientEmail')}</label>
          <input
            type="email"
            value={d.email}
            onChange={e => updateClient('email', e.target.value)}
            placeholder="jean@email.com"
          />
        </div>
      </div>

      {/* Adresse de départ */}
      <div className="card">
        <div className="card-title">📍 {isFr ? "Adresse d'origine" : 'Origin address'}</div>
        <div className="field">
          <label>{isFr ? 'Adresse' : 'Address'}</label>
          <input
            type="text"
            value={o.address || ''}
            onChange={e => updateOrigin('address', e.target.value)}
            placeholder={isFr ? '12 rue des Lilas' : '12 Lilac Street'}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
          <div className="field">
            <label>{t('city')}</label>
            <input
              type="text"
              value={o.city || ''}
              onChange={e => updateOrigin('city', e.target.value)}
              placeholder="Paris"
            />
          </div>
          <div className="field">
            <label>{t('postalCode')}</label>
            <input
              type="text"
              value={o.postalCode || ''}
              onChange={e => updateOrigin('postalCode', e.target.value)}
              placeholder="75000"
            />
          </div>
        </div>
      </div>

      {/* Date & heure */}
      <div className="card">
        <div className="card-title">📅 {isFr ? 'Date & heure de la visite' : 'Visit date & time'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div className="field">
            <label>{t('visitDate')} *</label>
            <input
              type="date"
              value={d.visitDate}
              onChange={e => { updateClient('visitDate', e.target.value); setErrors(er => ({ ...er, visitDate: undefined })); }}
              style={errors.visitDate ? { borderColor: 'var(--danger)' } : {}}
            />
            {errors.visitDate && <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '3px' }}>{errors.visitDate}</div>}
          </div>
          <div className="field">
            <label>{t('visitTime')}</label>
            <input
              type="time"
              value={d.visitTime || ''}
              onChange={e => updateClient('visitTime', e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label>{t('agendaNotes')}</label>
          <textarea
            value={d.agendaNotes || ''}
            onChange={e => updateClient('agendaNotes', e.target.value)}
            placeholder={isFr ? 'Notes rapides (accès, interphone, code digicode...)' : 'Quick notes (access code, intercom...)'}
            rows={2}
          />
        </div>
      </div>

      <div style={{ marginTop: '8px', marginBottom: '24px' }}>
        <button
          className={`save-visit-btn${status === 'error' ? ' error' : ''}`}
          onClick={handleCreate}
          disabled={status === 'saving'}
        >
          {status === 'saving'
            ? (isFr ? '⏳ Création en cours…' : '⏳ Creating…')
            : status === 'error'
              ? (isFr ? '❌ Erreur — réessayer' : '❌ Error — retry')
              : `✅ ${t('createVisit')}`}
        </button>
      </div>
    </>
  );
}
