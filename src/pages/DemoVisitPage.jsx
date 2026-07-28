import { X, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  DEMO_VISIT, getDemoRoomVolume, getDemoTotalVolume,
  getDemoFragileItems, getDemoHeavyItems, getDemoDisassemblyItems,
} from '../data/demoVisit';

const ROOM_ICONS = { livingRoom: '🛋️', bedroom: '🛏️', kitchen: '🍳' };

function FlaggedList({ title, items, lang }) {
  if (items.length === 0) return null;
  return (
    <div className="card">
      <div className="card-title">{title} ({items.length})</div>
      <ul className="item-list-summary">
        {items.map((it, i) => (
          <li key={`${it.itemId}_${i}`}>
            <span>{it.icon} {it.name[lang]} <em style={{ fontSize: '11px', color: 'var(--text3)' }}>{it.roomName[lang]}</em></span>
            <strong>x{it.qty}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DemoVisitPage({ onClose, onCreateAccount }) {
  const { t, lang } = useApp();
  const isFr = lang === 'fr';

  const totalVolume = getDemoTotalVolume();
  const fragile = getDemoFragileItems();
  const heavy = getDemoHeavyItems();
  const disassembly = getDemoDisassemblyItems();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Bandeau démo */}
      <div style={{
        background: '#FCD34D', color: '#1A1917', padding: '10px 16px',
        fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 12, flexWrap: 'wrap', textAlign: 'center',
        lineHeight: 1.5, flexShrink: 0,
      }}>
        <span>
          {isFr
            ? 'Exemple de démonstration — Créez votre compte pour gérer vos propres visites'
            : 'Demo example — Create your account to manage your own visits'}
        </span>
        <button
          onClick={onCreateAccount}
          style={{
            background: '#1A1917', color: 'white', border: 'none', borderRadius: 8,
            padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 4,
          }}
        >
          {isFr ? 'Créer mon compte' : 'Create my account'} <ArrowRight size={14} strokeWidth={2} />
        </button>
      </div>

      <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: '8px',
            padding: '6px 12px', cursor: 'pointer', color: 'var(--text2)', fontSize: 13,
            display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 16,
          }}
        >
          <X size={14} strokeWidth={2} /> {isFr ? 'Retour à la connexion' : 'Back to login'}
        </button>

        <div className="section-header">
          <div className="section-title">{t('summary')}</div>
          <div className="section-subtitle">{DEMO_VISIT.client_name[lang]}</div>
        </div>

        <div className="summary-big">
          <div className="big-num">{totalVolume.toFixed(1)}</div>
          <div className="big-unit">m³</div>
          <div className="big-label">{t('totalVolumeLabel')}</div>
        </div>

        <div className="card">
          <div className="card-title">{isFr ? 'Récapitulatif' : 'Summary'}</div>
          <ul className="item-list-summary">
            <li><span>{t('clientName')}</span><strong>{DEMO_VISIT.client_name[lang]}</strong></li>
            <li><span>{t('visitDate')}</span><strong>{DEMO_VISIT.visit_date}</strong></li>
            <li><span>{t('origin')}</span><strong>{DEMO_VISIT.origin_data.address}, {DEMO_VISIT.origin_data.city}</strong></li>
            <li><span>{t('destination')}</span><strong>{DEMO_VISIT.destination_data.address}, {DEMO_VISIT.destination_data.city}</strong></li>
            <li><span>{isFr ? 'Volume total' : 'Total volume'}</span><strong>{totalVolume.toFixed(1)} m³</strong></li>
            <li><span>{isFr ? 'Solution logistique' : 'Logistics'}</span><strong>{DEMO_VISIT.recommended_truck[lang]}</strong></li>
          </ul>
        </div>

        <div className="card">
          <div className="card-title">{t('perRoom')}</div>
          <ul className="item-list-summary">
            {DEMO_VISIT.rooms_data.map(r => (
              <li key={r.id}>
                <span>{ROOM_ICONS[r.type]} {r.name[lang]}</span>
                <strong>{getDemoRoomVolume(r).toFixed(2)} m³</strong>
              </li>
            ))}
          </ul>
        </div>

        {DEMO_VISIT.rooms_data.map(r => (
          <div className="card" key={r.id}>
            <div className="card-title">{ROOM_ICONS[r.type]} {r.name[lang]}</div>
            <ul className="item-list-summary">
              {r.items.map(it => (
                <li key={it.itemId}>
                  <span>{it.icon} {it.name[lang]}{it.qty > 1 ? ` ×${it.qty}` : ''}</span>
                  <strong>{(it.volume_m3 * it.qty).toFixed(2)} m³</strong>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <FlaggedList title={t('fragileItems')} items={fragile} lang={lang} />
        <FlaggedList title={t('heavyItems')} items={heavy} lang={lang} />
        <FlaggedList title={t('disassemblyItems')} items={disassembly} lang={lang} />

        <div style={{ textAlign: 'center', margin: '28px 0 16px' }}>
          <button
            onClick={onCreateAccount}
            className="btn btn-primary"
            style={{ padding: '14px 28px', display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            {isFr ? 'Créer mon compte pour commencer' : 'Create my account to get started'} <ArrowRight size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
