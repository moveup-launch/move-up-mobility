import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
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

  // Sync form when profile loads from Supabase (async after mount)
  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        company_name: profile.company_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile?.id]);

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

/* ─── Mon Entreprise ─────────────────────────────────── */
function CompanySection() {
  const { lang, profile, saveProfile, user } = useApp();
  const isFr = lang === 'fr';

  const [form, setForm] = useState({
    company_name:    profile?.company_name    || '',
    company_address: profile?.company_address || '',
    company_phone:   profile?.company_phone   || '',
    company_email:   profile?.company_email   || '',
    company_website: profile?.company_website || '',
    company_siret:   profile?.company_siret   || '',
    company_color:   profile?.company_color   || '#2B6BE6',
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [status, setStatus] = useState('idle');

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert(isFr ? 'Fichier trop lourd (max 2 Mo)' : 'File too large (max 2MB)');
      e.target.value = '';
      return;
    }
    // Aperçu local immédiat
    const reader = new FileReader();
    reader.onload = ev => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload Supabase Storage
    setUploadingLogo(true);
    const ext = file.name.split('.').pop().toLowerCase().replace('jpg', 'jpeg');
    const path = `${user.id}/logo.${ext}`;
    const { error } = await supabase.storage
      .from('company-logos')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (!error) {
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(path);
      const urlWithBust = `${publicUrl}?t=${Date.now()}`;
      await saveProfile({ company_logo_url: urlWithBust });
    }
    setUploadingLogo(false);
    e.target.value = '';
  };

  const handleRemoveLogo = async () => {
    setLogoPreview(null);
    await saveProfile({ company_logo_url: null });
  };

  const handleSave = async () => {
    setStatus('saving');
    const { error } = await saveProfile(form);
    setStatus(error ? 'error' : 'saved');
    setTimeout(() => setStatus('idle'), 3000);
  };

  const logoUrl = logoPreview || profile?.company_logo_url;
  const headerColor = form.company_color || '#2B6BE6';

  return (
    <Section title={`🏢 ${isFr ? 'Mon entreprise' : 'My company'}`}>

      {/* Logo */}
      <div className="field">
        <label>{isFr ? 'Logo (jpg/png max 2 Mo)' : 'Logo (jpg/png max 2MB)'}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              style={{ height: '48px', maxWidth: '120px', objectFit: 'contain', borderRadius: '6px', border: '1px solid var(--border)', background: '#f8f8f8' }}
            />
          ) : (
            <div style={{
              width: '72px', height: '48px', borderRadius: '6px',
              border: '2px dashed var(--border)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', color: 'var(--text3)', flexShrink: 0,
            }}>
              🖼️
            </div>
          )}
          <label style={{ cursor: uploadingLogo ? 'default' : 'pointer' }}>
            <div style={{
              padding: '8px 14px', borderRadius: '8px',
              border: '1px solid var(--accent)', color: 'var(--accent)',
              fontWeight: '700', fontSize: '12px', background: 'var(--surface)',
              opacity: uploadingLogo ? 0.6 : 1, whiteSpace: 'nowrap',
            }}>
              {uploadingLogo ? '⏳…' : (isFr ? 'Choisir un logo' : 'Choose logo')}
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleLogoChange}
              style={{ display: 'none' }}
              disabled={uploadingLogo}
            />
          </label>
          {logoUrl && (
            <button
              onClick={handleRemoveLogo}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: '16px', lineHeight: 1 }}
              title={isFr ? 'Supprimer le logo' : 'Remove logo'}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Nom entreprise */}
      <div className="field">
        <label>{isFr ? "Nom de l'entreprise" : 'Company name'}</label>
        <input
          type="text"
          value={form.company_name}
          onChange={e => set('company_name', e.target.value)}
          placeholder={isFr ? 'Mon Entreprise Déménagement' : 'My Moving Company'}
        />
      </div>

      {/* Adresse */}
      <div className="field">
        <label>{isFr ? 'Adresse entreprise' : 'Company address'}</label>
        <input
          type="text"
          value={form.company_address}
          onChange={e => set('company_address', e.target.value)}
          placeholder="12 rue des Movers, 75001 Paris"
        />
      </div>

      {/* Téléphone + Email */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div className="field">
          <label>{isFr ? 'Téléphone' : 'Phone'}</label>
          <input
            type="tel"
            value={form.company_phone}
            onChange={e => set('company_phone', e.target.value)}
            placeholder="+33 1 23 45 67 89"
          />
        </div>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={form.company_email}
            onChange={e => set('company_email', e.target.value)}
            placeholder="contact@societe.fr"
          />
        </div>
      </div>

      {/* Site web + SIRET */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div className="field">
          <label>{isFr ? 'Site web' : 'Website'}</label>
          <input
            type="text"
            value={form.company_website}
            onChange={e => set('company_website', e.target.value)}
            placeholder="www.societe.fr"
          />
        </div>
        <div className="field">
          <label>{isFr ? 'SIRET (optionnel)' : 'SIRET (optional)'}</label>
          <input
            type="text"
            value={form.company_siret}
            onChange={e => set('company_siret', e.target.value)}
            placeholder="123 456 789 00012"
          />
        </div>
      </div>

      {/* Couleur principale */}
      <div className="field">
        <label>{isFr ? 'Couleur principale' : 'Brand color'}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="color"
            value={form.company_color}
            onChange={e => set('company_color', e.target.value)}
            style={{
              width: '44px', height: '36px', padding: '2px',
              borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer',
            }}
          />
          <span style={{ fontSize: '13px', color: 'var(--text2)', fontFamily: 'monospace' }}>
            {form.company_color}
          </span>
          {form.company_color !== '#2B6BE6' && (
            <button
              onClick={() => set('company_color', '#2B6BE6')}
              style={{ fontSize: '11px', color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isFr ? 'Réinitialiser' : 'Reset'}
            </button>
          )}
        </div>
      </div>

      {/* Aperçu en-tête PDF — temps réel */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{
          fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em',
          textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '8px',
        }}>
          {isFr ? 'Aperçu en-tête PDF' : 'PDF header preview'}
        </div>
        <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{
            background: headerColor, padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: '10px', minHeight: '58px',
          }}>
            {logoUrl && (
              <img
                src={logoUrl}
                alt=""
                style={{ maxHeight: '36px', maxWidth: '72px', objectFit: 'contain', flexShrink: 0 }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: 'white', fontWeight: '800', fontSize: '13px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {form.company_name || profile?.first_name || (isFr ? 'Nom entreprise' : 'Company name')}
              </div>
              {(form.company_address || form.company_phone || form.company_email) && (
                <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: '9px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {[form.company_address, form.company_phone, form.company_email].filter(Boolean).join(' · ')}
                </div>
              )}
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px' }}>
                {isFr ? 'Rapport de visite de déménagement' : 'Moving Survey Report'}
              </div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '9px', flexShrink: 0, textAlign: 'right', lineHeight: 1.4 }}>
              {new Date().toLocaleDateString(isFr ? 'fr-FR' : 'en-GB')}
            </div>
          </div>
          <div style={{ padding: '4px 8px', background: 'var(--surface2)', textAlign: 'center', fontSize: '8px', color: 'var(--text3)' }}>
            Rapport généré avec Move Up Mobility — moveupapp.com
          </div>
        </div>
      </div>

      {/* Bouton sauvegarde */}
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
        {status === 'saving' ? '⏳…'
          : status === 'saved' ? (isFr ? '✅ Sauvegardé !' : '✅ Saved!')
          : status === 'error' ? '❌ Erreur'
          : `💾 ${isFr ? 'Sauvegarder' : 'Save'}`}
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
          ? "Modifiez le volume par défaut des objets du catalogue. Utilisé quand vous ajoutez un objet à l'inventaire."
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
      <CompanySection />
      <ExpertSection />
      <CustomCatalogSection />
      <VolumeDefaultsSection />
      <PrefsSection />
    </div>
  );
}
