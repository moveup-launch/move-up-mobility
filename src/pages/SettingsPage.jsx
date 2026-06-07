import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATALOG } from '../data/catalog';

const CATEGORIES_FR = ['chambre', 'salon', 'cuisine', 'bureau', 'garage', 'autre'];
const CATEGORIES_EN = ['bedroom', 'living room', 'kitchen', 'office', 'garage', 'other'];

function Toggle({ on, onChange }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width: '48px', height: '26px', borderRadius: '13px', cursor: 'pointer',
        background: on ? 'var(--accent)' : 'var(--border)', position: 'relative',
        transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: '3px',
        left: on ? '25px' : '3px',
        width: '20px', height: '20px', borderRadius: '50%',
        background: 'white', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'var(--text3)',
        marginBottom: '10px', paddingBottom: '6px',
        borderBottom: '1px solid var(--border)',
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

/* ─── Profil ─────────────────────────────────────────── */
function ProfileSection() {
  const { t, lang, profile, saveProfile } = useApp();
  const isFr = lang === 'fr';
  const [form, setForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    company_name: profile?.company_name || '',
    phone: profile?.phone || '',
  });
  const [status, setStatus] = useState('idle');

  const handleSave = async () => {
    setStatus('saving');
    const { error } = await saveProfile(form);
    setStatus(error ? 'error' : 'saved');
    setTimeout(() => setStatus('idle'), 3000);
  };

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  return (
    <Section title={`👤 ${t('settingsProfile')}`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
        <div className="field">
          <label>{t('firstName')}</label>
          <input type="text" value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Jean" />
        </div>
        <div className="field">
          <label>{t('lastName')}</label>
          <input type="text" value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Dupont" />
        </div>
      </div>
      <div className="field">
        <label>{t('companyName')}</label>
        <input type="text" value={form.company_name} onChange={e => set('company_name', e.target.value)} placeholder="Move Up SAS" />
      </div>
      <div className="field">
        <label>{t('phone')}</label>
        <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+33 6 12 34 56 78" />
      </div>
      <button
        onClick={handleSave}
        disabled={status === 'saving'}
        style={{
          width: '100%', padding: '12px', borderRadius: '10px',
          border: 'none', fontWeight: '700', fontSize: '14px',
          cursor: status === 'saving' ? 'default' : 'pointer',
          background: status === 'saved' ? '#16A34A' : status === 'error' ? 'var(--danger)' : 'var(--accent)',
          color: 'white', opacity: status === 'saving' ? 0.7 : 1,
        }}
      >
        {status === 'saving' ? '⏳…' : status === 'saved' ? `✅ ${t('profileSaved')}` : status === 'error' ? '❌ Erreur' : `💾 ${t('saveProfile')}`}
      </button>
    </Section>
  );
}

/* ─── Mode Expert ─────────────────────────────────────── */
function ExpertSection() {
  const { t, expertMode, setExpertMode } = useApp();
  return (
    <Section title={`🔧 ${t('settingsExpert')}`}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 16px', background: 'var(--surface2)', borderRadius: '10px',
      }}>
        <div>
          <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '2px' }}>{t('settingsExpert')}</div>
          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{t('settingsExpertDesc')}</div>
        </div>
        <Toggle on={expertMode} onChange={setExpertMode} />
      </div>
    </Section>
  );
}

/* ─── Catalogue personnalisé ──────────────────────────── */
function CustomCatalogSection() {
  const { t, lang, customCatalog, addCustomCatalogItem, deleteCustomCatalogItem } = useApp();
  const isFr = lang === 'fr';
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nameFr: '', nameEn: '', icon: '📦',
    volume_m3: 0.3, category: 'autre',
    fragile: false, heavy: false, requires_disassembly: false,
  });

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleAdd = () => {
    if (!form.nameFr.trim()) return;
    addCustomCatalogItem({
      name: { fr: form.nameFr.trim(), en: form.nameEn.trim() || form.nameFr.trim() },
      icon: form.icon || '📦',
      volume_m3: parseFloat(form.volume_m3) || 0.3,
      category: form.category,
      fragile: form.fragile,
      heavy: form.heavy,
      requires_disassembly: form.requires_disassembly,
    });
    setForm({ nameFr: '', nameEn: '', icon: '📦', volume_m3: 0.3, category: 'autre', fragile: false, heavy: false, requires_disassembly: false });
    setShowForm(false);
  };

  return (
    <Section title={`📦 ${t('settingsCustomCatalog')}`}>
      {customCatalog.length === 0 && !showForm && (
        <div style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '10px', textAlign: 'center', padding: '12px' }}>
          {isFr ? 'Aucun objet personnalisé' : 'No custom items yet'}
        </div>
      )}

      {customCatalog.map(item => (
        <div key={item.id} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', background: 'var(--surface2)', borderRadius: '8px', marginBottom: '6px',
        }}>
          <span style={{ fontSize: '22px', flexShrink: 0 }}>{item.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '13px' }}>
              {isFr ? item.name?.fr : item.name?.en || item.name?.fr}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
              {item.volume_m3} m³ · {item.category}
              {item.fragile ? ' · fragile' : ''}{item.heavy ? ' · lourd' : ''}
            </div>
          </div>
          <button
            onClick={() => deleteCustomCatalogItem(item.id)}
            style={{
              background: 'var(--danger-light)', color: 'var(--danger)',
              border: '1px solid var(--danger)', borderRadius: '6px',
              padding: '4px 8px', cursor: 'pointer', fontSize: '13px',
            }}
          >
            🗑️
          </button>
        </div>
      ))}

      {showForm ? (
        <div style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '14px', marginBottom: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div className="field">
              <label>{t('customItemName')}</label>
              <input type="text" value={form.nameFr} onChange={e => set('nameFr', e.target.value)} placeholder="Tabouret" />
            </div>
            <div className="field">
              <label>{t('customItemNameEn')}</label>
              <input type="text" value={form.nameEn} onChange={e => set('nameEn', e.target.value)} placeholder="Bar stool" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div className="field">
              <label>{t('customItemIcon')}</label>
              <input type="text" value={form.icon} onChange={e => set('icon', e.target.value)} maxLength={2} style={{ fontSize: '20px', textAlign: 'center' }} />
            </div>
            <div className="field">
              <label>{t('customItemVolume')}</label>
              <input type="number" step="0.01" min="0.001" value={form.volume_m3} onChange={e => set('volume_m3', e.target.value)} />
            </div>
            <div className="field">
              <label>{t('customItemCategory')}</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES_FR.map((c, i) => (
                  <option key={c} value={c}>{isFr ? c : CATEGORIES_EN[i]}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            {[['fragile', t('customItemFragile')], ['heavy', t('customItemHeavy')], ['requires_disassembly', t('customItemDisassembly')]].map(([field, label]) => (
              <label key={field} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form[field]} onChange={e => set(field, e.target.checked)} />
                {label}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleAdd}
              disabled={!form.nameFr.trim()}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                background: 'var(--accent)', color: 'white', fontWeight: '700',
                cursor: form.nameFr.trim() ? 'pointer' : 'default',
                opacity: form.nameFr.trim() ? 1 : 0.5,
              }}
            >
              ✅ {isFr ? 'Ajouter' : 'Add'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: '10px 16px', borderRadius: '8px',
                border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontWeight: '600',
              }}
            >
              {isFr ? 'Annuler' : 'Cancel'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          style={{
            width: '100%', padding: '11px', borderRadius: '8px',
            border: '2px dashed var(--border)', background: 'none',
            color: 'var(--accent)', fontWeight: '700', cursor: 'pointer', fontSize: '13px',
          }}
        >
          + {t('addCustomItem')}
        </button>
      )}
    </Section>
  );
}

/* ─── Volumes par défaut ──────────────────────────────── */
function VolumeDefaultsSection() {
  const { t, lang, volumeOverrides, setVolumeOverride, resetVolumeOverride } = useApp();
  const isFr = lang === 'fr';

  const mainItems = [];
  ['bedroom', 'livingRoom', 'kitchen'].forEach(cat => {
    (CATALOG[cat] || []).forEach(item => {
      item.variants.forEach(v => {
        const uid = `${item.id}_${v.id}`;
        mainItems.push({
          uid,
          name: (isFr ? item.name?.fr : item.name?.en) || '',
          variant: (isFr ? v.label?.fr : v.label?.en) || '',
          icon: item.icon,
          defaultVol: v.volume_m3,
          overrideVol: volumeOverrides[uid],
        });
      });
    });
  });

  return (
    <Section title={`📐 ${t('settingsVolumeDefaults')}`}>
      <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '10px' }}>
        {isFr
          ? 'Modifiez le volume par défaut des objets du catalogue. Utilisé quand vous ajoutez un objet à l\'inventaire.'
          : 'Override default volumes for catalog items. Applied when adding items to inventory.'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {mainItems.map(item => (
          <div key={item.uid} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 10px', background: 'var(--surface2)', borderRadius: '6px',
          }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1, fontSize: '12px' }}>
              <div style={{ fontWeight: '600' }}>{item.name}</div>
              <div style={{ color: 'var(--text3)' }}>{item.variant}</div>
            </div>
            <input
              type="number"
              step="0.01"
              min="0.001"
              value={item.overrideVol ?? item.defaultVol}
              onChange={e => setVolumeOverride(item.uid, e.target.value)}
              style={{
                width: '70px', padding: '4px 6px', fontSize: '12px',
                borderRadius: '4px', border: `1px solid ${item.overrideVol ? 'var(--accent)' : 'var(--border)'}`,
                fontWeight: item.overrideVol ? '700' : '400',
                color: item.overrideVol ? 'var(--accent)' : 'var(--text)',
              }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text3)', flexShrink: 0 }}>m³</span>
            {item.overrideVol && (
              <button
                onClick={() => resetVolumeOverride(item.uid)}
                title={t('resetDefault')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '14px', color: 'var(--text3)', padding: '2px',
                }}
              >
                ↩
              </button>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── Préférences ─────────────────────────────────────── */
function PrefsSection() {
  const { t, lang, setLang } = useApp();
  const isFr = lang === 'fr';
  return (
    <Section title={`🌐 ${t('settingsPrefs')}`}>
      <div style={{ padding: '12px 14px', background: 'var(--surface2)', borderRadius: '10px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>{t('settingsLanguage')}</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[['fr', 'Français'], ['en', 'English']].map(([code, label]) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              style={{
                padding: '8px 20px', borderRadius: '8px', fontWeight: '700',
                border: `2px solid ${lang === code ? 'var(--accent)' : 'var(--border)'}`,
                background: lang === code ? 'var(--accent)' : 'var(--surface)',
                color: lang === code ? 'white' : 'var(--text2)', cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─── Page principale ─────────────────────────────────── */
export default function SettingsPage() {
  const { t, user } = useApp();
  return (
    <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto' }}>
      <div className="section-header">
        <div className="section-title">⚙️ {t('settings')}</div>
        <div className="section-subtitle">{user?.email}</div>
      </div>
      <ProfileSection />
      <ExpertSection />
      <CustomCatalogSection />
      <VolumeDefaultsSection />
      <PrefsSection />
    </div>
  );
}
