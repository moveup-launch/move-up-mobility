import { useApp } from '../context/AppContext';

const STATUS_OPTS_FR = [
  { val: 'prevue',   label: 'Prévue',   cls: 'status-prevue' },
  { val: 'en_cours', label: 'En cours', cls: 'status-encours' },
  { val: 'terminee', label: 'Terminée', cls: 'status-terminee' },
  { val: 'annulee',  label: 'Annulée',  cls: 'status-annulee' },
];
const STATUS_OPTS_EN = [
  { val: 'prevue',   label: 'Planned',    cls: 'status-prevue' },
  { val: 'en_cours', label: 'In progress',cls: 'status-encours' },
  { val: 'terminee', label: 'Completed',  cls: 'status-terminee' },
  { val: 'annulee',  label: 'Cancelled',  cls: 'status-annulee' },
];

export default function Step1Client() {
  const { t, lang, state, updateClient } = useApp();
  const d = state.client;
  const isFr = lang === 'fr';
  const statusOpts = isFr ? STATUS_OPTS_FR : STATUS_OPTS_EN;

  return (
    <>
      <div className="section-header">
        <div className="section-title">{t('clientInfo')}</div>
        <div className="section-subtitle">{isFr ? 'Informations générales sur la visite' : 'General visit information'}</div>
      </div>
      <div className="card">
        <div className="card-title">{t('clientInfo')}</div>
        <div className="field">
          <label><span className="field-icon">👤</span>{t('clientName')} *</label>
          <input type="text" value={d.name} onChange={e => updateClient('name', e.target.value)} placeholder="Jean Dupont" />
        </div>
        <div className="field">
          <label><span className="field-icon">📱</span>{t('clientPhone')}</label>
          <input type="tel" value={d.phone} onChange={e => updateClient('phone', e.target.value)} placeholder="+33 6 12 34 56 78" />
        </div>
        <div className="field">
          <label><span className="field-icon">✉️</span>{t('clientEmail')}</label>
          <input type="email" value={d.email} onChange={e => updateClient('email', e.target.value)} placeholder="jean@email.com" />
        </div>
      </div>

      <div className="card">
        <div className="card-title">{isFr ? 'Visite' : 'Visit'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div className="field">
            <label><span className="field-icon">📅</span>{t('visitDate')} *</label>
            <input type="date" value={d.visitDate} onChange={e => updateClient('visitDate', e.target.value)} />
          </div>
          <div className="field">
            <label><span className="field-icon">🕐</span>{t('visitTime')}</label>
            <input type="time" value={d.visitTime || ''} onChange={e => updateClient('visitTime', e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>{t('visitStatus')}</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {statusOpts.map(opt => (
              <div
                key={opt.val}
                className={`radio-option ${opt.cls} ${d.visitStatus === opt.val ? 'selected' : ''}`}
                style={{ flex: 1, minWidth: '70px', padding: '8px 6px', justifyContent: 'center' }}
                onClick={() => updateClient('visitStatus', opt.val)}
              >
                <span className="radio-label" style={{ fontSize: '12px', textAlign: 'center', fontWeight: 600 }}>{opt.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="field">
          <label><span className="field-icon">🧑‍💼</span>{t('surveyor')}</label>
          <input type="text" value={d.surveyor} onChange={e => updateClient('surveyor', e.target.value)} placeholder={isFr ? 'Nom du commercial' : 'Sales rep name'} />
        </div>
        <div className="field">
          <label><span className="field-icon">🚚</span>{t('moveDate')}</label>
          <input type="date" value={d.moveDate} onChange={e => updateClient('moveDate', e.target.value)} />
        </div>
        <div className="field">
          <label><span className="field-icon">📝</span>{t('agendaNotes')}</label>
          <textarea
            value={d.agendaNotes || ''}
            onChange={e => updateClient('agendaNotes', e.target.value)}
            placeholder={isFr ? 'Notes avant visite (accès, interphone, code...)' : 'Pre-visit notes (access, intercom, code...)'}
            rows={2}
          />
        </div>
        <div className="field">
          <label><span className="field-icon">💬</span>{t('notes')}</label>
          <textarea value={d.notes} onChange={e => updateClient('notes', e.target.value)} placeholder={isFr ? 'Notes libres...' : 'Free notes...'} />
        </div>
      </div>
    </>
  );
}
