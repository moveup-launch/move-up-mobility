import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

// Suit la hauteur du visual viewport en temps réel.
// Quand le clavier iOS s'ouvre, window.visualViewport.height diminue
// (exclut la zone clavier) alors que window.innerHeight reste inchangé.
// Cela permet de redimensionner la feuille pour qu'elle reste AU-DESSUS
// du clavier plutôt que derrière lui.
function useVisualViewportHeight() {
  const [height, setHeight] = useState(
    () => window.visualViewport?.height ?? window.innerHeight
  );
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setHeight(vv.height);
    vv.addEventListener('resize', update);
    return () => vv.removeEventListener('resize', update);
  }, []);
  return height;
}

export default function NewVisitModal({ onClose, onCreated }) {
  const { user, lang } = useApp();
  const isFr = lang === 'fr';
  const vpHeight = useVisualViewportHeight();

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    address: '', city: '', postalCode: '',
    visitDate: '', visitTime: '', notes: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = isFr ? 'Obligatoire' : 'Required';
    if (!form.visitDate) e.visitDate = isFr ? 'Obligatoire' : 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    if (!user) {
      setSaveError(isFr ? 'Non connecté — rechargez la page' : 'Not logged in — reload the page');
      return;
    }
    setSaving(true);
    setSaveError(null);

    try {
      const { data, error } = await supabase
        .from('visits')
        .insert({
          user_id: user.id,
          client_name: form.name.trim() || null,
          client_phone: form.phone.trim() || null,
          client_email: form.email.trim() || null,
          visit_date: form.visitDate || null,
          visit_time: form.visitTime || null,
          visit_status: 'prevue',
          agenda_notes: form.notes.trim() || null,
          origin_data: {
            address: form.address.trim(),
            city: form.city.trim(),
            postalCode: form.postalCode.trim(),
          },
          client_data: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
            visitDate: form.visitDate,
            visitTime: form.visitTime,
            agendaNotes: form.notes.trim(),
          },
        })
        .select()
        .single();

      if (error) {
        console.error('NewVisitModal insert error:', error);
        setSaveError(`${error.message} (code: ${error.code || '?'})`);
        setSaving(false);
        return;
      }
      onCreated(data);
    } catch (err) {
      console.error('NewVisitModal unexpected error:', err);
      setSaveError(err?.message || 'Erreur inattendue');
      setSaving(false);
    }
  };

  return createPortal(
    /*
     * L'overlay utilise height = vpHeight (visual viewport) au lieu de inset:0.
     * Quand le clavier s'ouvre vpHeight rétrécit → la feuille remonte
     * automatiquement au-dessus du clavier, sans JS supplémentaire.
     * transition: height évite le saut brusque pendant l'animation clavier.
     */
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: `${vpHeight}px`,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingTop: 'env(safe-area-inset-top, 44px)',
        transition: 'height 0.25s ease',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--surface)',
        width: '100%',
        maxWidth: '560px',
        borderRadius: '16px 16px 0 0',
        padding: '0 16px',
        /* padding-bottom : safe area home bar + espace de respiration */
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
        /*
         * maxHeight = visual viewport - notch - marge de 6px visible au-dessus.
         * Quand clavier ouvert la feuille se rétrécit automatiquement
         * et overflowY:auto permet de scroller jusqu'aux champs du bas.
         */
        maxHeight: `calc(${vpHeight}px - env(safe-area-inset-top, 44px) - 6px)`,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        /* scroll-behavior lisse pour le focus automatique sur les inputs */
        scrollBehavior: 'smooth',
      }}>

        {/* Handle de drag + sticky header dans la feuille */}
        <div style={{
          position: 'sticky', top: 0,
          background: 'var(--surface)',
          paddingTop: '12px',
          paddingBottom: '4px',
          zIndex: 1,
        }}>
          <div style={{
            width: 36, height: 4, borderRadius: 2,
            background: 'var(--border)', margin: '0 auto 12px',
          }} />
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '16px',
          }}>
            <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text)' }}>
              ✏️ {isFr ? 'Nouvelle visite' : 'New visit'}
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', fontSize: '20px',
                cursor: 'pointer', color: 'var(--text3)', lineHeight: 1,
                padding: '4px',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ─── Formulaire ─────────────────────────────────────── */}

        {/* Nom */}
        <div className="field">
          <label>{isFr ? 'Nom client' : 'Client name'} *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Jean Dupont"
            autoFocus
            style={errors.name ? { borderColor: 'var(--danger)' } : {}}
          />
          {errors.name && (
            <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '3px' }}>{errors.name}</div>
          )}
        </div>

        {/* Téléphone + Email */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div className="field">
            <label>{isFr ? 'Téléphone' : 'Phone'}</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="+33 6 12 34 56"
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="jean@email.com"
            />
          </div>
        </div>

        {/* Adresse */}
        <div className="field">
          <label>{isFr ? "Adresse d'origine" : 'Origin address'}</label>
          <input
            type="text"
            value={form.address}
            onChange={e => set('address', e.target.value)}
            placeholder={isFr ? '12 rue des Lilas' : '12 Lilac Street'}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
          <div className="field">
            <label>{isFr ? 'Ville' : 'City'}</label>
            <input
              type="text"
              value={form.city}
              onChange={e => set('city', e.target.value)}
              placeholder="Paris"
            />
          </div>
          <div className="field">
            <label>{isFr ? 'Code postal' : 'Postal'}</label>
            <input
              type="text"
              value={form.postalCode}
              onChange={e => set('postalCode', e.target.value)}
              placeholder="75000"
            />
          </div>
        </div>

        {/* Date + Heure */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div className="field">
            <label>{isFr ? 'Date visite' : 'Visit date'} *</label>
            <input
              type="date"
              value={form.visitDate}
              onChange={e => set('visitDate', e.target.value)}
              style={errors.visitDate ? { borderColor: 'var(--danger)' } : {}}
            />
            {errors.visitDate && (
              <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '3px' }}>{errors.visitDate}</div>
            )}
          </div>
          <div className="field">
            <label>{isFr ? 'Heure' : 'Time'}</label>
            <input
              type="time"
              value={form.visitTime}
              onChange={e => set('visitTime', e.target.value)}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="field">
          <label>{isFr ? 'Notes' : 'Notes'}</label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder={isFr ? 'Accès, interphone, code digicode...' : 'Access, intercom, code...'}
            rows={2}
          />
        </div>

        {/* Erreur Supabase */}
        {saveError && (
          <div style={{
            padding: '12px 14px', background: 'var(--danger-light)',
            border: '1px solid var(--danger)', borderRadius: '8px',
            marginBottom: '12px', fontSize: '13px', color: 'var(--danger)',
            fontWeight: '600', wordBreak: 'break-word',
          }}>
            ⚠️ {saveError}
          </div>
        )}

        {/* Boutons */}
        <div style={{ paddingTop: '4px' }}>
          <button
            onClick={handleCreate}
            disabled={saving}
            style={{
              width: '100%', padding: '14px', borderRadius: '10px',
              border: 'none', background: 'var(--accent)', color: 'white',
              fontWeight: '700', fontSize: '15px',
              cursor: saving ? 'default' : 'pointer',
              opacity: saving ? 0.7 : 1, marginBottom: '8px',
            }}
          >
            {saving
              ? (isFr ? '⏳ Création en cours…' : '⏳ Creating…')
              : `✅ ${isFr ? 'Créer la visite' : 'Create visit'}`}
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px',
              border: '1px solid var(--border)', background: 'var(--surface2)',
              color: 'var(--text2)', fontWeight: '600', fontSize: '14px',
              cursor: 'pointer', marginBottom: '8px',
            }}
          >
            {isFr ? 'Annuler' : 'Cancel'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
