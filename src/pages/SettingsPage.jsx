import { useState, useEffect } from 'react';
import {
  CreditCard, User, Building2, Smartphone, MapPin, Mail, Globe, Receipt, Palette,
  FileText, Save, Wrench, Package, Ruler, Undo2, HelpCircle, BookOpen, ClipboardList,
  Lock, ExternalLink, AlertTriangle, Trash2, X, Check, Settings, Image as ImageIcon, Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { CATALOG } from '../data/catalog';
import { openProCheckout, openBillingPortal } from '../lib/stripe';
import Onboarding from '../components/Onboarding';
import Guide from '../components/Guide';

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
    <Section title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><User size={14} strokeWidth={2} /> {t('settingsProfile')}</span>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
        <div className="field">
          <label><span className="field-icon"><User size={16} strokeWidth={2} /></span>{t('firstName')}</label>
          <input type="text" value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Jean" />
        </div>
        <div className="field">
          <label><span className="field-icon"><User size={16} strokeWidth={2} /></span>{t('lastName')}</label>
          <input type="text" value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Dupont" />
        </div>
      </div>
      <div className="field">
        <label><span className="field-icon"><Building2 size={16} strokeWidth={2} /></span>{t('companyName')}</label>
        <input type="text" value={form.company_name} onChange={e => set('company_name', e.target.value)} placeholder="Move Up SAS" />
      </div>
      <div className="field">
        <label><span className="field-icon"><Smartphone size={16} strokeWidth={2} /></span>{t('phone')}</label>
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
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        }}
      >
        {status === 'saving' ? '⏳…' : status === 'saved' ? `✅ ${t('profileSaved')}` : status === 'error' ? '❌ Erreur' : <><Save size={16} strokeWidth={2} /> {t('saveProfile')}</>}
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
    default_vat_rate: profile?.default_vat_rate ?? '',
    quote_terms:     profile?.quote_terms     || '',
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [status, setStatus] = useState('idle');

  // Sync form quand le profil charge de façon asynchrone
  useEffect(() => {
    if (profile) {
      setForm({
        company_name:    profile.company_name    || '',
        company_address: profile.company_address || '',
        company_phone:   profile.company_phone   || '',
        company_email:   profile.company_email   || '',
        company_website: profile.company_website || '',
        company_siret:   profile.company_siret   || '',
        company_color:   profile.company_color   || '#2B6BE6',
        default_vat_rate: profile.default_vat_rate ?? '',
        quote_terms:     profile.quote_terms     || '',
      });
    }
  }, [profile?.id]);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert(isFr ? 'Fichier trop lourd (max 2 Mo)' : 'File too large (max 2MB)');
      e.target.value = '';
      return;
    }

    setUploadError(null);
    setUploadingLogo(true);

    // Aperçu local immédiat (base64)
    const reader = new FileReader();
    reader.onload = ev => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);

    try {
      // Normalisation MIME (image/jpg → image/jpeg)
      const ext = file.name.split('.').pop().toLowerCase().replace('jpg', 'jpeg');
      const contentType = file.type === 'image/jpg' ? 'image/jpeg' : (file.type || `image/${ext}`);
      const path = `${user.id}/logo.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('company-logos')
        .upload(path, file, { upsert: true, contentType });

      if (uploadErr) {
        console.error('Logo upload error:', uploadErr);
        setUploadError(isFr
          ? `Erreur upload : ${uploadErr.message}`
          : `Upload error: ${uploadErr.message}`);
        setLogoPreview(null);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('company-logos')
          .getPublicUrl(path);

        // Cache-buster : l'URL du logo est toujours la même (logo.<ext> écrasé),
        // donc le navigateur/CDN resservirait l'ancienne image en cache.
        // On ajoute un paramètre unique à chaque upload pour forcer le rechargement.
        const bustedUrl = `${publicUrl}?v=${Date.now()}`;

        const { error: saveErr } = await saveProfile({ company_logo_url: bustedUrl });
        if (saveErr) {
          console.error('Logo save error:', saveErr);
          setUploadError(isFr
            ? `Erreur sauvegarde : ${saveErr.message}`
            : `Save error: ${saveErr.message}`);
          setLogoPreview(null);
        } else {
          setLogoPreview(null);
        }
      }
    } catch (err) {
      console.error('Logo upload unexpected error:', err);
      setUploadError(isFr ? 'Erreur inattendue' : 'Unexpected error');
      setLogoPreview(null);
    }

    setUploadingLogo(false);
    e.target.value = '';
  };

  const handleRemoveLogo = async () => {
    setLogoPreview(null);
    setUploadError(null);
    // Suppression du fichier dans Storage
    if (profile?.company_logo_url) {
      // On retire l'éventuel paramètre ?v=... (cache-buster) avant d'extraire le chemin
      const cleanUrl = profile.company_logo_url.split('?')[0];
      const match = cleanUrl.match(/company-logos\/(.+)$/);
      if (match) {
        await supabase.storage.from('company-logos').remove([match[1]]);
      }
    }
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
    <Section title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Building2 size={14} strokeWidth={2} /> {isFr ? 'Mon entreprise' : 'My company'}</span>}>

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
              color: 'var(--text3)', flexShrink: 0,
            }}>
              <ImageIcon size={20} strokeWidth={2} />
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
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', alignItems: 'center' }}
              title={isFr ? 'Supprimer le logo' : 'Remove logo'}
            >
              <X size={16} strokeWidth={2} />
            </button>
          )}
        </div>
        {uploadError && (
          <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--danger)', fontWeight: '600' }}>
            ❌ {uploadError}
          </div>
        )}
      </div>

      {/* Nom entreprise */}
      <div className="field">
        <label><span className="field-icon"><Building2 size={16} strokeWidth={2} /></span>{isFr ? "Nom de l'entreprise" : 'Company name'}</label>
        <input
          type="text"
          value={form.company_name}
          onChange={e => set('company_name', e.target.value)}
          placeholder={isFr ? 'Mon Entreprise Déménagement' : 'My Moving Company'}
        />
      </div>

      {/* Adresse */}
      <div className="field">
        <label><span className="field-icon"><MapPin size={16} strokeWidth={2} /></span>{isFr ? 'Adresse entreprise' : 'Company address'}</label>
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
          <label><span className="field-icon"><Smartphone size={16} strokeWidth={2} /></span>{isFr ? 'Téléphone' : 'Phone'}</label>
          <input
            type="tel"
            value={form.company_phone}
            onChange={e => set('company_phone', e.target.value)}
            placeholder="+33 1 23 45 67 89"
          />
        </div>
        <div className="field">
          <label><span className="field-icon"><Mail size={16} strokeWidth={2} /></span>Email</label>
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
          <label><span className="field-icon"><Globe size={16} strokeWidth={2} /></span>{isFr ? 'Site web' : 'Website'}</label>
          <input
            type="text"
            value={form.company_website}
            onChange={e => set('company_website', e.target.value)}
            placeholder="www.societe.fr"
          />
        </div>
        <div className="field">
          <label><span className="field-icon"><Receipt size={16} strokeWidth={2} /></span>{isFr ? 'SIRET (optionnel)' : 'SIRET (optional)'}</label>
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
        <label><span className="field-icon"><Palette size={16} strokeWidth={2} /></span>{isFr ? 'Couleur principale' : 'Brand color'}</label>
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

      {/* Taux de TVA par défaut (pour les devis) */}
      <div className="field">
        <label><span className="field-icon">%</span>{isFr ? 'Taux de TVA par défaut (devis)' : 'Default VAT rate (quotes)'}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="0.1"
            value={form.default_vat_rate}
            onChange={e => set('default_vat_rate', e.target.value)}
            placeholder={isFr ? 'ex. 20' : 'e.g. 20'}
            style={{ width: '100px' }}
          />
          <span style={{ fontSize: '13px', color: 'var(--text2)' }}>%</span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
          {isFr
            ? "Valeur pré-remplie sur les nouveaux devis. Modifiable devis par devis. Laissez vide si vous n'appliquez pas de TVA."
            : 'Pre-filled on new quotes. Editable per quote. Leave empty if you do not apply VAT.'}
        </div>
      </div>

      {/* Phrase de renvoi CGV (pied de devis) */}
      <div className="field">
        <label><span className="field-icon"><FileText size={16} strokeWidth={2} /></span>{isFr ? 'Mention conditions générales (devis)' : 'Terms note (quotes)'}</label>
        <textarea
          rows={2}
          value={form.quote_terms}
          onChange={e => set('quote_terms', e.target.value)}
          placeholder={isFr
            ? 'ex. Devis soumis à nos conditions générales de vente disponibles sur moveupapp.com'
            : 'e.g. Quote subject to our terms and conditions available at moveupapp.com'}
          style={{ width: '100%', resize: 'vertical' }}
        />
        <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
          {isFr
            ? 'Affichée en bas de vos devis PDF. Laissez vide pour ne rien afficher.'
            : 'Shown at the bottom of your PDF quotes. Leave empty to show nothing.'}
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
            Rapport généré avec Move Up App — moveupapp.com
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
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        }}
      >
        {status === 'saving' ? '⏳…'
          : status === 'saved' ? (isFr ? '✅ Sauvegardé !' : '✅ Saved!')
          : status === 'error' ? '❌ Erreur'
          : <><Save size={16} strokeWidth={2} /> {isFr ? 'Sauvegarder' : 'Save'}</>}
      </button>
    </Section>
  );
}

/* ─── Abonnement ───────────────────────────────────────── */
function SubscriptionSection() {
  const { lang, profile, user } = useApp();
  const isFr = lang === 'fr';
  const isPro = profile?.plan === 'pro';

  return (
    <Section title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><CreditCard size={14} strokeWidth={2} /> {isFr ? 'Abonnement' : 'Subscription'}</span>}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 16px', background: 'var(--surface2)', borderRadius: '10px', marginBottom: '10px',
      }}>
        <div style={{ fontSize: '13px', color: 'var(--text2)' }}>
          {isFr ? 'Plan actuel : ' : 'Current plan: '}
          <strong>{isPro ? 'Pro' : (isFr ? 'Gratuit' : 'Free')}</strong>
        </div>
      </div>

      {isPro ? (
        <button
          onClick={() => openBillingPortal(user.id)}
          style={{
            width: '100%', padding: '12px', borderRadius: '10px',
            border: '1px solid var(--accent)', background: 'var(--surface)',
            color: 'var(--accent)', fontWeight: '700', fontSize: '14px',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px',
          }}
        >
          <CreditCard size={16} />
          {isFr ? 'Gérer mon abonnement' : 'Manage subscription'}
        </button>
      ) : (
        <button
          onClick={() => openProCheckout(user?.email, user?.id)}
          style={{
            width: '100%', padding: '12px', borderRadius: '10px',
            border: 'none', background: 'var(--accent)',
            color: 'white', fontWeight: '700', fontSize: '14px',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px',
          }}
        >
          <CreditCard size={16} />
          {isFr ? "S'abonner au plan Pro" : 'Subscribe to Pro'}
        </button>
      )}
    </Section>
  );
}

/* ─── Mode Expert ─────────────────────────────────────── */
function ExpertSection() {
  const { t, expertMode, setExpertMode } = useApp();
  return (
    <Section title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Wrench size={14} strokeWidth={2} /> {t('settingsExpert')}</span>}>
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
    <Section title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Package size={14} strokeWidth={2} /> {t('settingsCustomCatalog')}</span>}>
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
              display: 'flex', alignItems: 'center',
            }}
          >
            <Trash2 size={14} strokeWidth={2} />
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
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              <Check size={16} strokeWidth={2} /> {isFr ? 'Ajouter' : 'Add'}
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
// 15 catégories du catalogue — libellés locaux car translations.js n'a pas
// de clé pour garageBasement/babyEquip/common/exceptional/vehicles.
const VOLUME_CATEGORIES = [
  { key: 'bedroom',        fr: 'Chambre',              en: 'Bedroom' },
  { key: 'livingRoom',     fr: 'Salon',                en: 'Living room' },
  { key: 'kitchen',        fr: 'Cuisine',              en: 'Kitchen' },
  { key: 'diningRoom',     fr: 'Salle à manger',       en: 'Dining room' },
  { key: 'office',         fr: 'Bureau',               en: 'Office' },
  { key: 'garden',         fr: 'Jardin / extérieur',   en: 'Garden / outdoor' },
  { key: 'garageBasement', fr: 'Garage / Cave',        en: 'Garage / Basement' },
  { key: 'laundry',        fr: 'Buanderie',            en: 'Laundry room' },
  { key: 'bathroom',       fr: 'Salle de bain',        en: 'Bathroom' },
  { key: 'babyEquip',      fr: 'Bébé',                 en: 'Baby' },
  { key: 'common',         fr: 'Objets communs',       en: 'Common items' },
  { key: 'exceptional',    fr: 'Objets exceptionnels', en: 'Special items' },
  { key: 'boxes',          fr: 'Cartons',              en: 'Boxes' },
  { key: 'entrance',       fr: 'Entrée',               en: 'Entryway' },
  { key: 'vehicles',       fr: 'Véhicules',            en: 'Vehicles' },
];

const normalizeSearch = str => (str || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function VolumeDefaultsSection() {
  const { t, lang, volumeOverrides, setVolumeOverride, resetVolumeOverride } = useApp();
  const isFr = lang === 'fr';
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const mainItems = [];
  VOLUME_CATEGORIES.forEach(({ key: cat }) => {
    (CATALOG[cat] || []).forEach(item => {
      item.variants.forEach(v => {
        const uid = `${item.id}_${v.id}`;
        const searchText = normalizeSearch([
          item.name?.fr, item.name?.en, v.label?.fr, v.label?.en, ...(item.keywords || []),
        ].filter(Boolean).join(' '));
        mainItems.push({
          uid,
          catKey: cat,
          name: (isFr ? item.name?.fr : item.name?.en) || '',
          variant: (isFr ? v.label?.fr : v.label?.en) || '',
          icon: item.icon,
          defaultVol: v.volume_m3,
          overrideVol: volumeOverrides[uid],
          searchText,
        });
      });
    });
  });

  const query = normalizeSearch(search);
  const visibleItems = mainItems.filter(item =>
    (catFilter === 'all' || item.catKey === catFilter) &&
    (!query || item.searchText.includes(query))
  );

  return (
    <Section title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Ruler size={14} strokeWidth={2} /> {t('settingsVolumeDefaults')}</span>}>
      <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '10px' }}>
        {isFr
          ? "Modifiez le volume par défaut des objets du catalogue. Utilisé quand vous ajoutez un objet à l'inventaire."
          : 'Override default volumes for catalog items. Applied when adding items to inventory.'}
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} strokeWidth={2} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isFr ? 'Rechercher un objet...' : 'Search an item...'}
            style={{
              width: '100%', padding: '8px 10px 8px 32px', fontSize: '13px',
              borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          style={{
            padding: '8px 10px', fontSize: '13px', borderRadius: '8px',
            border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)',
            flexShrink: 0, maxWidth: '150px',
          }}
        >
          <option value="all">{isFr ? 'Toutes les catégories' : 'All categories'}</option>
          {VOLUME_CATEGORIES.map(c => (
            <option key={c.key} value={c.key}>{isFr ? c.fr : c.en}</option>
          ))}
        </select>
      </div>
      {visibleItems.length === 0 && (
        <div style={{ fontSize: '12px', color: 'var(--text3)', textAlign: 'center', padding: '16px 0' }}>
          {isFr ? 'Aucun objet ne correspond.' : 'No matching item.'}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {visibleItems.map(item => (
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
                  color: 'var(--text3)', padding: '2px', display: 'flex', alignItems: 'center',
                }}
              >
                <Undo2 size={14} strokeWidth={2} />
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
    <Section title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Globe size={14} strokeWidth={2} /> {t('settingsPrefs')}</span>}>
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

/* ─── Supprimer le compte ─────────────────────────────── */
function DangerZoneSection() {
  const { lang, signOut } = useApp();
  const isFr = lang === 'fr';
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setError(isFr ? 'Session expirée, reconnectez-vous.' : 'Session expired, please log in again.');
        setDeleting(false);
        return;
      }
      const res = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await signOut();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || (isFr ? 'Erreur lors de la suppression.' : 'Deletion failed.'));
      }
    } catch (e) {
      setError(e.message);
    }
    setDeleting(false);
  };

  return (
    <Section title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--danger)' }}><AlertTriangle size={14} strokeWidth={2} /> {isFr ? 'Zone de danger' : 'Danger zone'}</span>}>
      {!confirming ? (
        <div>
          <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: 12, lineHeight: 1.5 }}>
            {isFr
              ? 'Supprime définitivement votre compte et toutes vos données (visites, photos, devis).'
              : 'Permanently deletes your account and all your data (visits, photos, quotes).'}
          </p>
          <button
            onClick={() => setConfirming(true)}
            style={{
              padding: '10px 16px', borderRadius: '8px',
              border: '1px solid var(--danger)', background: 'var(--danger-light)',
              color: 'var(--danger)', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            <Trash2 size={16} strokeWidth={2} /> {isFr ? 'Supprimer mon compte' : 'Delete my account'}
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontWeight: '700', color: 'var(--danger)', marginBottom: 8, fontSize: '14px' }}>
            {isFr ? 'Êtes-vous absolument sûr ?' : 'Are you absolutely sure?'}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: 14, lineHeight: 1.5 }}>
            {isFr
              ? 'Cette action est irréversible. Toutes vos visites, photos et données seront supprimées définitivement. Votre abonnement Pro sera annulé.'
              : 'This action cannot be undone. All your visits, photos and data will be permanently deleted. Your Pro subscription will be cancelled.'}
          </p>
          {error && (
            <div style={{ color: 'var(--danger)', fontSize: '12px', marginBottom: 10, fontWeight: '600' }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px',
                background: 'var(--danger)', color: 'white',
                border: 'none', fontWeight: '700', cursor: deleting ? 'not-allowed' : 'pointer',
                fontSize: '13px', opacity: deleting ? 0.7 : 1,
              }}
            >
              {deleting ? '...' : (isFr ? 'Oui, supprimer définitivement' : 'Yes, delete permanently')}
            </button>
            <button
              onClick={() => { setConfirming(false); setError(''); }}
              style={{
                padding: '10px 16px', borderRadius: '8px',
                background: 'var(--surface2)', color: 'var(--text2)',
                border: '1px solid var(--border)', cursor: 'pointer', fontSize: '13px',
              }}
            >
              {isFr ? 'Annuler' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </Section>
  );
}

/* ─── Page principale ─────────────────────────────────── */
export default function SettingsPage() {
  const { t, lang, user, setViewMode } = useApp();
  const isFr = lang === 'fr';
  const [showGuide, setShowGuide] = useState(false);
  return (
    <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto' }}>
      <div className="section-header">
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Settings size={18} strokeWidth={2} /> {t('settings')}
        </div>
        <div className="section-subtitle">{user?.email}</div>
      </div>
      <ProfileSection />
      <CompanySection />
      <SubscriptionSection />
      <ExpertSection />
      <CustomCatalogSection />
      <VolumeDefaultsSection />
      <PrefsSection />

      {/* Guide d'utilisation */}
      <Section title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><HelpCircle size={14} strokeWidth={2} /> {isFr ? "Guide d'utilisation" : 'User guide'}</span>}>
        <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: 12, lineHeight: 1.5 }}>
          {isFr
            ? 'Revoyez les bases : créer une visite, faire un inventaire, générer un PDF, partager un lien de suivi.'
            : 'Review the basics: create a visit, build an inventory, generate a PDF, share a tracking link.'}
        </p>
        <button
          onClick={() => setShowGuide(true)}
          style={{
            padding: '10px 16px', borderRadius: '8px',
            border: '1px solid var(--accent)', background: 'var(--accent-light, #EEF3FD)',
            color: 'var(--accent)', fontSize: '13px', fontWeight: '600',
            cursor: 'pointer', width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          <BookOpen size={16} strokeWidth={2} /> {isFr ? 'Revoir le guide' : 'Review the guide'}
        </button>
      </Section>

      {/* Liens légaux */}
      <Section title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><ClipboardList size={14} strokeWidth={2} /> {isFr ? 'Mentions légales' : 'Legal'}</span>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <a href="/cgu" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <FileText size={14} strokeWidth={2} /> {isFr ? "Conditions Générales d'Utilisation" : 'Terms of Service'} <ExternalLink size={12} strokeWidth={2} />
          </a>
          <a href="/confidentialite" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Lock size={14} strokeWidth={2} /> {isFr ? 'Politique de confidentialité' : 'Privacy Policy'} <ExternalLink size={12} strokeWidth={2} />
          </a>
        </div>
      </Section>

      <DangerZoneSection />

      {showGuide && <Guide onDone={() => setShowGuide(false)} />}
    </div>
  );
}
