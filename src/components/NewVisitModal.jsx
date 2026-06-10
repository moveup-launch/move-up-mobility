import { useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { addOfflineVisit } from '../lib/offlineQueue';

export default function NewVisitModal({ onClose, onCreated }) {
  const { user, lang } = useApp();
  const isFr = lang === 'fr';

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

    // ── Sauvegarde hors-ligne ─────────────────────────────────
    if (!navigator.onLine) {
      const visitData = {
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
      };
      const offlineVisit = addOfflineVisit(visitData);
      onCreated(offlineVisit);
      return;
    }

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

  /*
   * Approche iOS Safari :
   * - L'overlay est position:fixed + overflow-y:scroll → il RESTE dans le
   *   visual viewport même quand le clavier s'ouvre (avec interactive-widget
   *   dans le viewport meta, bottom:0 remonte au-dessus du clavier).
   * - Le contenu intérieur a min-height:100% + padding-bottom:400px →
   *   il y a toujours de l'espace à scroller, le browser scroll auto vers
   *   l'input focusé.
   * - font-size:16px sur tous les inputs → iOS ne zoom pas.
   */
  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999,
        overflowY: 'scroll',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Backdrop avec dark overlay + contenu scrollable */}
      <div
        style={{
          minHeight: '100%',
          background: 'rgba(0,0,0,0.55)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          paddingTop: 'calc(env(safe-area-inset-top, 44px) + 15vh)',
        }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Sheet blanc */}
        <div style={{
          background: 'var(--surface)',
          width: '100%',
          maxWidth: '560px',
          margin: '0 auto',
          borderRadius: '16px 16px 0 0',
          padding: '0 16px',
          /* 400px padding bas : quand le clavier ouvre, l'utilisateur peut
             scroller pour voir tous les champs au-dessus du clavier */
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 400px)',
        }}>

          {/* Handle de drag + header sticky */}
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
              style={{
                fontSize: '16px',
                touchAction: 'manipulation',
                ...(errors.name ? { borderColor: 'var(--danger)' } : {}),
              }}
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
                style={{ fontSize: '16px', touchAction: 'manipulation' }}
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="jean@email.com"
                style={{ fontSize: '16px', touchAction: 'manipulation' }}
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
              style={{ fontSize: '16px', touchAction: 'manipulation' }}
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
                style={{ fontSize: '16px', touchAction: 'manipulation' }}
              />
            </div>
            <div className="field">
              <label>{isFr ? 'Code postal' : 'Postal'}</label>
              <input
                type="text"
                value={form.postalCode}
                onChange={e => set('postalCode', e.target.value)}
                placeholder="75000"
                style={{ fontSize: '16px', touchAction: 'manipulation' }}
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
                style={{
                  fontSize: '16px',
                  touchAction: 'manipulation',
                  ...(errors.visitDate ? { borderColor: 'var(--danger)' } : {}),
                }}
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
                style={{ fontSize: '16px', touchAction: 'manipulation' }}
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
              style={{ fontSize: '16px', touchAction: 'manipulation' }}
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
                touchAction: 'manipulation',
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
                touchAction: 'manipulation',
              }}
            >
              {isFr ? 'Annuler' : 'Cancel'}
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
