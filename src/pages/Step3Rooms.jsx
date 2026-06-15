import { useState } from 'react';
import { useApp } from '../context/AppContext';

export function AddRoomSheet() {
  const { t, lang, getRoomIcon, addRoom, closeSheet } = useApp();
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const isFr = lang === 'fr';

  const roomTypes = ['livingRoom', 'diningRoom', 'kitchen', 'bedroom', 'childBedroom', 'office', 'bathroom', 'dressing', 'entrance', 'laundry', 'garage', 'basement', 'attic', 'garden', 'storageBox', 'misc']
    .sort((a, b) => t(a).localeCompare(t(b), isFr ? 'fr' : 'en', { sensitivity: 'base' }));

  const handleAdd = (rt) => {
    addRoom(rt);
    closeSheet();
  };

  const handleCustom = () => {
    if (!customName.trim()) return;
    addRoom('misc', customName.trim());
    closeSheet();
  };

  return (
    <>
      <div className="sheet-handle" />
      <div className="sheet-title">{t('addRoom')}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        {roomTypes.map(rt => (
          <div key={rt} className="radio-option" style={{ padding: '14px 10px' }} onClick={() => handleAdd(rt)}>
            <span className="radio-icon" style={{ fontSize: '24px' }}>{getRoomIcon(rt)}</span>
            <span className="radio-label" style={{ fontSize: '12px' }}>{t(rt)}</span>
          </div>
        ))}
      </div>
      {!showCustom ? (
        <div style={{ padding: '0 0 16px' }}>
          <button
            className="btn btn-secondary"
            style={{ width: '100%', padding: '12px', borderStyle: 'dashed', fontSize: '13px' }}
            onClick={() => setShowCustom(true)}
          >
            ✏️ {isFr ? 'Pièce personnalisée' : 'Custom room'}
          </button>
        </div>
      ) : (
        <div style={{ padding: '0 0 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            autoFocus
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCustom()}
            placeholder={isFr ? 'Ex: Bureau Thomas, Cave box 12...' : 'Ex: Thomas office, Storage 1...'}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: '8px',
              border: '1px solid var(--accent)', fontSize: '14px',
              background: 'var(--bg)', color: 'var(--text)',
            }}
          />
          <button
            className="btn btn-primary"
            style={{ padding: '10px 16px', flexShrink: 0, opacity: customName.trim() ? 1 : 0.5 }}
            onClick={handleCustom}
            disabled={!customName.trim()}
          >
            {isFr ? 'Ajouter' : 'Add'}
          </button>
        </div>
      )}
    </>
  );
}

function RenameModal({ room }) {
  const { t, renameRoom, closeModal } = useApp();
  const [value, setValue] = useState(room.name);

  const handleSave = () => {
    if (value.trim()) renameRoom(room.id, value.trim());
    closeModal();
  };

  return (
    <>
      <div className="modal-title">✏️ {t('renameRoom')}</div>
      <div className="field">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          style={{ fontSize: '16px' }}
          autoFocus
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />
      </div>
      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={closeModal}>{t('cancel')}</button>
        <button className="btn btn-primary" onClick={handleSave}>{t('save')}</button>
      </div>
    </>
  );
}

function ConfirmDeleteModal({ onConfirm }) {
  const { t, closeModal } = useApp();
  return (
    <>
      <div className="modal-title">{t('confirmDelete')}</div>
      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={closeModal}>{t('cancel')}</button>
        <button className="btn btn-danger" onClick={() => { onConfirm(); closeModal(); }}>{t('confirm')}</button>
      </div>
    </>
  );
}

export default function Step3Rooms() {
  const { t, lang, state, deleteRoom, selectRoom, getRoomVolume, getRoomIcon, openSheet, openModal } = useApp();

  return (
    <>
      <div className="section-header">
        <div className="section-title">{t('rooms')}</div>
        <div className="section-subtitle">{lang === 'fr' ? 'Créez les pièces du logement' : 'Create the rooms of the home'}</div>
      </div>
      <div className="room-list">
        {state.rooms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏠</div>
            <div className="empty-title">{t('noRooms')}</div>
            <div className="empty-sub">{t('addFirstRoom')}</div>
          </div>
        ) : (
          state.rooms.map(r => (
            <div key={r.id} className={`room-card ${state.currentRoomId === r.id ? 'active' : ''}`}>
              <div className="room-icon">{getRoomIcon(r.type)}</div>
              <div className="room-info" onClick={() => selectRoom(r.id)}>
                <div className="room-name">{r.name}</div>
                <div className="room-vol">
                  {getRoomVolume(r).toFixed(2)} m³ — {(r.items || []).length} {lang === 'fr' ? 'objet(s)' : 'item(s)'}
                </div>
              </div>
              <div className="room-actions">
                <button className="icon-btn" onClick={() => openModal(<RenameModal room={r} />)} title={t('renameRoom')}>✏️</button>
                <button className="icon-btn" onClick={() => openModal(<ConfirmDeleteModal onConfirm={() => deleteRoom(r.id)} />)} title={t('deleteRoom')}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>
      <button className="add-room-btn" onClick={() => openSheet(<AddRoomSheet />)} style={{ marginTop: '12px' }}>
        + {t('addRoom')}
      </button>
    </>
  );
}
