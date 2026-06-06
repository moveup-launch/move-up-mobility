import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

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

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--surface)', width: '100%', maxWidth: '560px',
        borderRadius: '16px 16px 0 0', padding: '20px 16px 32px',
        maxHeight: '92vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text)' }}>
            ✏️ {isFr ? 'Nouvelle visite' : 'New visit'}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text3)', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

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
              placeholder="+33 6 12 34 56 78"
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

        {/* Adresse origine */}
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

        {/* Date */}
        <div className="field">
          <label>{isFr ? 'Date visite' : 'Visit date'} *</label>
          <input
            type="date"
            value={form.visitDate}
            onChange={e => set('visitDate', e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              ...(errors.visitDate ? { borderColor: 'var(--danger)' } : {}),
            }}
          />
          {errors.visitDate && (
            <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '3px' }}>{errors.visitDate}</div>
          )}
        </div>

        {/* Heure */}
        <div className="field">
          <label>{isFr ? 'Heure de visite' : 'Visit time'}</label>
          <input
            type="time"
            value={form.visitTime}
            onChange={e => set('visitTime', e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
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

        <button
          onClick={handleCreate}
          disabled={saving}
          style={{
            width: '100%', padding: '14px', borderRadius: '10px',
            border: 'none', background: 'var(--accent)', color: 'white',
            fontWeight: '700', fontSize: '15px',
            cursor: saving ? 'default' : 'pointer',
            opacity: saving ? 0.7 : 1,
            marginBottom: '8px',
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
            color: 'var(--text2)', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
          }}
        >
          {isFr ? 'Annuler' : 'Cancel'}
        </button>
      </div>
    </div>
  );
}
