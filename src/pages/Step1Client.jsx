import { useApp } from '../context/AppContext';

export default function Step1Client() {
  const { t, lang, state, updateClient } = useApp();
  const d = state.client;

  return (
    <>
      <div className="section-header">
        <div className="section-title">{t('clientInfo')}</div>
        <div className="section-subtitle">{lang === 'fr' ? 'Informations générales sur la visite' : 'General visit information'}</div>
      </div>
      <div className="card">
        <div className="card-title">{t('clientInfo')}</div>
        <div className="field">
          <label>{t('clientName')} *</label>
          <input type="text" value={d.name} onChange={e => updateClient('name', e.target.value)} placeholder="Jean Dupont" />
        </div>
        <div className="field">
          <label>{t('clientPhone')}</label>
          <input type="tel" value={d.phone} onChange={e => updateClient('phone', e.target.value)} placeholder="+33 6 12 34 56 78" />
        </div>
        <div className="field">
          <label>{t('clientEmail')}</label>
          <input type="email" value={d.email} onChange={e => updateClient('email', e.target.value)} placeholder="jean@email.com" />
        </div>
      </div>
      <div className="card">
        <div className="card-title">{lang === 'fr' ? 'Visite' : 'Visit'}</div>
        <div className="field">
          <label>{t('visitDate')} *</label>
          <input type="date" value={d.visitDate} onChange={e => updateClient('visitDate', e.target.value)} />
        </div>
        <div className="field">
          <label>{t('surveyor')}</label>
          <input type="text" value={d.surveyor} onChange={e => updateClient('surveyor', e.target.value)} placeholder={lang === 'fr' ? 'Nom du commercial' : 'Sales rep name'} />
        </div>
        <div className="field">
          <label>{t('moveDate')}</label>
          <input type="date" value={d.moveDate} onChange={e => updateClient('moveDate', e.target.value)} />
        </div>
        <div className="field">
          <label>{t('notes')}</label>
          <textarea value={d.notes} onChange={e => updateClient('notes', e.target.value)} placeholder={lang === 'fr' ? 'Notes libres...' : 'Free notes...'} />
        </div>
      </div>
    </>
  );
}
