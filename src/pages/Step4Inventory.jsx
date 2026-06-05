import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATALOG } from '../data/catalog';

const ROOM_BOX_TYPES = {
  bedroom:      ['box_standard', 'box_wardrobe', 'box_books', 'box_fragile'],
  childBedroom: ['box_standard', 'box_wardrobe', 'box_books', 'box_fragile'],
  dressing:     ['box_wardrobe', 'box_standard'],
  kitchen:      ['box_standard', 'box_dishes', 'box_fragile', 'box_large'],
  diningRoom:   ['box_standard', 'box_dishes', 'box_fragile'],
  livingRoom:   ['box_standard', 'box_books', 'box_fragile', 'box_large'],
  office:       ['box_archives', 'box_books', 'box_standard', 'box_fragile'],
  bathroom:     ['box_standard', 'box_fragile'],
  laundry:      ['box_standard', 'box_large'],
  garage:       ['box_standard', 'box_large'],
  basement:     ['box_standard', 'box_large', 'box_archives'],
  attic:        ['box_standard', 'box_large', 'box_archives'],
  garden:       ['box_standard', 'box_large'],
  storageBox:   ['box_standard', 'box_large', 'box_archives'],
  misc:         ['box_standard', 'box_fragile', 'box_large'],
};

function QuickAdjustSheet({ roomId, catKey, itemId }) {
  const { tCat, lang, state, changeQty, addItemToRoom, closeSheet } = useApp();
  const cat = CATALOG[catKey];
  const item = cat?.find(i => i.id === itemId);
  if (!item) return null;
  const room = state.rooms.find(r => r.id === roomId);
  const roomItems = room?.items || [];
  const isFr = lang === 'fr';

  return (
    <>
      <div className="sheet-handle" />
      <div className="sheet-title">{item.icon} {tCat(item.name)}</div>
      {item.variants.map(v => {
        const uid = `${itemId}_${v.id}`;
        const invItem = roomItems.find(i => i.itemId === uid);
        const qty = invItem?.qty || 0;
        return (
          <div key={v.id} className="variant-option">
            <div style={{ flex: 1 }}>
              <div className="var-name">{tCat(v.label)}</div>
              <div className="var-vol">{v.volume_m3} m³</div>
              {qty === 0 && (
                <div className="var-tags">
                  {v.fragile && <span className="tag tag-fragile">Fragile</span>}
                  {v.heavy && <span className="tag tag-heavy">{isFr ? 'Lourd' : 'Heavy'}</span>}
                  {v.requires_disassembly && <span className="tag tag-disassembly">{isFr ? 'Démontage' : 'Disassembly'}</span>}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {qty > 0 ? (
                <>
                  <button className="qty-btn" onClick={() => changeQty(roomId, uid, -1)}>−</button>
                  <span className="qty-num" style={{ minWidth: '20px', textAlign: 'center' }}>{qty}</span>
                  <button className="qty-btn" onClick={() => changeQty(roomId, uid, 1)}>+</button>
                </>
              ) : (
                <button
                  className="qty-btn"
                  style={{ background: 'var(--accent)', color: 'white', minWidth: '32px' }}
                  onClick={() => addItemToRoom(roomId, catKey, itemId, v.id)}
                >
                  +
                </button>
              )}
            </div>
          </div>
        );
      })}
      <div style={{ padding: '16px' }}>
        <button className="pdf-btn" style={{ width: '100%' }} onClick={closeSheet}>
          {isFr ? 'Fermer' : 'Close'}
        </button>
      </div>
    </>
  );
}

function CustomItemSheet({ roomId }) {
  const { lang, addCustomItemToRoom, closeSheet } = useApp();
  const [name, setName] = useState('');
  const [volume, setVolume] = useState(0.3);
  const [qty, setQty] = useState(1);
  const isFr = lang === 'fr';

  const volumeOpts = [
    { val: 0.1, label: isFr ? 'Petit (0.1 m³)' : 'Small (0.1 m³)' },
    { val: 0.3, label: isFr ? 'Moyen (0.3 m³)' : 'Medium (0.3 m³)' },
    { val: 0.5, label: isFr ? 'Grand (0.5 m³)' : 'Large (0.5 m³)' },
    { val: 1.0, label: isFr ? 'Tres grand (1 m³)' : 'Very large (1 m³)' },
  ];

  const handleAdd = () => {
    if (!name.trim()) return;
    addCustomItemToRoom(roomId, name.trim(), volume, qty);
    closeSheet();
  };

  return (
    <>
      <div className="sheet-handle" />
      <div className="sheet-title">📦 {isFr ? 'Objet non liste' : 'Unlisted item'}</div>
      <div className="field" style={{ padding: '0 16px 12px' }}>
        <label>{isFr ? "Nom de l'objet" : 'Item name'}</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder={isFr ? 'Ex: Tabouret de bar...' : 'Ex: Bar stool...'} />
      </div>
      <div className="field" style={{ padding: '0 16px 12px' }}>
        <label>{isFr ? 'Volume estimé' : 'Estimated volume'}</label>
        <select value={volume} onChange={e => setVolume(parseFloat(e.target.value))}>
          {volumeOpts.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
        </select>
      </div>
      <div className="field" style={{ padding: '0 16px 12px' }}>
        <label>{isFr ? 'Quantite' : 'Quantity'}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
          <span style={{ minWidth: '30px', textAlign: 'center', fontSize: '18px', fontWeight: '600' }}>{qty}</span>
          <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
        </div>
      </div>
      <div style={{ padding: '16px' }}>
        <button className="pdf-btn" style={{ width: '100%', opacity: name.trim() ? 1 : 0.5 }}
          onClick={handleAdd} disabled={!name.trim()}>
          {isFr ? '+ Ajouter' : '+ Add'}
        </button>
      </div>
    </>
  );
}

function RoomBoxSection({ room }) {
  const { t, lang, state, changeBox, setBox } = useApp();
  const boxIds = ROOM_BOX_TYPES[room.type] || ['box_standard', 'box_large'];
  const boxes = CATALOG.boxTypes.filter(b => boxIds.includes(b.id));
  const isFr = lang === 'fr';

  return (
    <div className="card" style={{ marginTop: '6px', background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)' }}>
      <div className="card-title" style={{ fontSize: '13px', color: 'var(--accent)' }}>
        📦 {t('boxesForRoom')}
      </div>
      {boxes.map(bt => (
        <div key={bt.id} className="box-row" style={{ padding: '7px 0' }}>
          <span style={{ fontSize: '16px', marginRight: '8px' }}>{bt.icon}</span>
          <div style={{ flex: 1 }}>
            <div className="box-label" style={{ fontSize: '13px' }}>{t(bt.nameKey)}</div>
            <div className="box-vol" style={{ fontSize: '11px' }}>{bt.volume_m3} m³</div>
          </div>
          <div className="box-qty">
            <button className="qty-btn" onClick={() => changeBox('boxesRemaining', bt.id, -1)}>−</button>
            <input
              type="number" min="0"
              value={state.boxesRemaining[bt.id] || 0}
              onChange={e => setBox('boxesRemaining', bt.id, e.target.value)}
              style={{ width: '44px', padding: '5px', textAlign: 'center', fontSize: '13px', fontWeight: '600' }}
            />
            <button className="qty-btn" onClick={() => changeBox('boxesRemaining', bt.id, 1)}>+</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CatalogSection({ room }) {
  const { tCat, lang, state, addItemToRoom, openSheet, changeQty } = useApp();

  const catLabels = {
    bedroom: lang === 'fr' ? 'Chambre / Bureau' : 'Bedroom / Office',
    livingRoom: lang === 'fr' ? 'Salon / Sejour' : 'Living room',
    kitchen: lang === 'fr' ? 'Cuisine' : 'Kitchen',
    office: lang === 'fr' ? 'Bureau' : 'Office',
    garageBasement: lang === 'fr' ? 'Garage / Cave' : 'Garage / Basement',
    laundry: lang === 'fr' ? 'Buanderie' : 'Laundry',
    bathroom: lang === 'fr' ? 'Salle de bain' : 'Bathroom',
    exceptional: lang === 'fr' ? 'Objets exceptionnels' : 'Exceptional items',
  };

  const cats = CATALOG.roomCatalogMap[room.type] || ['bedroom'];
  const result = [];
  cats.forEach(cat => {
    if (CATALOG[cat]) result.push({ key: cat, items: CATALOG[cat] });
  });

  // Exceptional items filtered by allowedRooms
  const exceptionalForRoom = CATALOG.exceptional.filter(item =>
    item.allowedRooms && item.allowedRooms.includes(room.type)
  );
  if (exceptionalForRoom.length > 0) {
    result.push({ key: 'exceptional', items: exceptionalForRoom });
  }

  const handleItemClick = (item, cat) => {
    if (item.variants.length === 1) {
      addItemToRoom(room.id, cat.key, item.id, item.variants[0].id);
    } else {
      openSheet(<QuickAdjustSheet roomId={room.id} catKey={cat.key} itemId={item.id} />);
    }
  };

  const handleMultiMinus = (e, item) => {
    e.stopPropagation();
    for (const v of item.variants) {
      const uid = `${item.id}_${v.id}`;
      const invItem = (room.items || []).find(i => i.itemId === uid);
      if (invItem && invItem.qty > 0) {
        changeQty(room.id, uid, -1);
        break;
      }
    }
  };

  return (
    <>
      {result.map(cat => (
        <div key={cat.key} className="catalog-category">
          <div className="catalog-category-title">{catLabels[cat.key] || cat.key}</div>
          <div className="item-grid">
            {cat.items.map(item => {
              const qty = (room.items || []).filter(i => i.catalogId === item.id).reduce((s, i) => s + i.qty, 0);
              const isSingle = item.variants.length === 1;
              const singleUid = isSingle ? `${item.id}_${item.variants[0].id}` : null;
              return (
                <div
                  key={item.id}
                  className={`item-card ${qty > 0 ? 'in-inventory' : ''}`}
                  style={{ position: 'relative' }}
                  onClick={() => handleItemClick(item, cat)}
                >
                  {qty > 0 && <div className="item-qty-badge">{qty}</div>}
                  <span className="item-icon">{item.icon}</span>
                  <div className="item-name">{tCat(item.name)}</div>
                  {qty > 0 && (
                    <button
                      onClick={(e) => {
                        if (isSingle) {
                          e.stopPropagation();
                          changeQty(room.id, singleUid, -1);
                        } else {
                          handleMultiMinus(e, item);
                        }
                      }}
                      style={{
                        position: 'absolute', bottom: '4px', right: '4px',
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: 'var(--danger-light)', color: 'var(--danger)',
                        border: 'none', cursor: 'pointer', fontSize: '14px',
                        fontWeight: '700', lineHeight: '1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      −
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div style={{ padding: '8px 0 4px' }}>
        <button
          className="btn btn-secondary"
          style={{ width: '100%', padding: '12px', fontSize: '13px', borderStyle: 'dashed' }}
          onClick={() => openSheet(<CustomItemSheet roomId={room.id} />)}
        >
          + {lang === 'fr' ? 'Divers / Objet non liste' : 'Misc / Unlisted item'}
        </button>
      </div>
    </>
  );
}

function InventoryList({ room }) {
  const { t, lang, changeQty } = useApp();
  const items = (room.items || []).filter(i => i.qty > 0);

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text3)', fontSize: '13px' }}>
        {lang === 'fr' ? 'Cliquez sur un objet pour l\'ajouter' : 'Tap an item to add it'}
      </div>
    );
  }

  return (
    <div style={{ marginTop: '8px' }}>
      <div className="card-title" style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>
        {lang === 'fr' ? 'Inventaire' : 'Inventory'}
      </div>
      {items.map(item => (
        <div key={item.itemId} className="inv-item">
          <div className="inv-icon">{item.icon}</div>
          <div className="inv-info">
            <div className="inv-name">{item.name}</div>
            <div className="inv-variant">{item.variantLabel}</div>
            <div className="inv-vol">{(item.volume_m3 * item.qty).toFixed(3)} m³</div>
            <div className="inv-tags">
              {item.fragile && <span className="tag tag-fragile">{t('tagFragile')}</span>}
              {item.heavy && <span className="tag tag-heavy">{t('tagHeavy')}</span>}
              {item.requires_disassembly && <span className="tag tag-disassembly">{t('tagDisassembly')}</span>}
              {item.possible_furniture_lift && <span className="tag tag-lift">{t('tagLift')}</span>}
            </div>
          </div>
          <div className="inv-qty">
            <button className="qty-btn" onClick={() => changeQty(room.id, item.itemId, -1)}>−</button>
            <span className="qty-num">{item.qty}</span>
            <button className="qty-btn" onClick={() => changeQty(room.id, item.itemId, 1)}>+</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function BoxesSection() {
  const { t, lang, state, changeBox, setBox, setHouseholdPersons, getBoxSuggestions, applyBoxSuggestions } = useApp();
  const isFr = lang === 'fr';
  const suggestions = getBoxSuggestions();
  const hasSuggestions = Object.values(suggestions).some(v => v > 0);

  const sections = [
    { key: 'boxesDone', source: state.boxesDone },
    { key: 'boxesRemaining', source: state.boxesRemaining },
  ];

  return (
    <>
      <div className="card">
        <div className="card-title">{t('nbPeople')}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
          <button className="qty-btn" onClick={() => setHouseholdPersons((state.householdPersons || 0) - 1)}>−</button>
          <span style={{ minWidth: '40px', textAlign: 'center', fontSize: '22px', fontWeight: '700' }}>
            {state.householdPersons || 0}
          </span>
          <button className="qty-btn" onClick={() => setHouseholdPersons((state.householdPersons || 0) + 1)}>+</button>
        </div>
      </div>

      {hasSuggestions && (
        <div className="card" style={{ borderLeft: '3px solid var(--accent)' }}>
          <div className="card-title">{t('boxSuggestions')}</div>
          {Object.entries(suggestions).map(([id, qty]) => {
            const bt = CATALOG.boxTypes.find(b => b.id === id);
            if (!bt || qty === 0) return null;
            return (
              <div key={id} className="box-row">
                <span className="box-icon">{bt.icon}</span>
                <div style={{ flex: 1 }}>
                  <div className="box-label">{t(bt.nameKey)}</div>
                </div>
                <strong style={{ fontSize: '16px' }}>{qty}</strong>
              </div>
            );
          })}
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px', padding: '10px', fontSize: '13px' }}
            onClick={() => applyBoxSuggestions(suggestions)}
          >
            {t('applySuggestions')}
          </button>
        </div>
      )}

      {sections.map(sec => (
        <div key={sec.key} className="card">
          <div className="card-title">{t(sec.key)}</div>
          {CATALOG.boxTypes.map(bt => (
            <div key={bt.id} className="box-row">
              <span className="box-icon">{bt.icon}</span>
              <div style={{ flex: 1 }}>
                <div className="box-label">{t(bt.nameKey)}</div>
                <div className="box-vol">{bt.volume_m3} m³ / {isFr ? 'carton' : 'box'}</div>
              </div>
              <div className="box-qty">
                <button className="qty-btn" onClick={() => changeBox(sec.key, bt.id, -1)}>−</button>
                <input
                  type="number" min="0"
                  value={sec.source[bt.id] || 0}
                  onChange={e => setBox(sec.key, bt.id, e.target.value)}
                  style={{ width: '50px', padding: '6px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}
                />
                <button className="qty-btn" onClick={() => changeBox(sec.key, bt.id, 1)}>+</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

export default function Step4Inventory() {
  const { t, lang, state, getTotalVolume, getRoomVolume, getRoomIcon, setRoomTab, selectRoom } = useApp();

  if (state.rooms.length === 0) {
    return (
      <>
        <div className="section-header"><div className="section-title">{t('inventory')}</div></div>
        <div className="empty-state">
          <div className="empty-icon">🏠</div>
          <div className="empty-title">{lang === 'fr' ? 'Aucune pièce' : 'No rooms'}</div>
          <div className="empty-sub">{lang === 'fr' ? "Ajoutez des pièces à l'étape précédente" : 'Add rooms in the previous step'}</div>
        </div>
      </>
    );
  }

  const room = state.rooms.find(r => r.id === state.currentRoomId) || state.rooms[0];
  const totalVol = getTotalVolume();
  const showBoxes = room._showBoxes || false;

  return (
    <>
      <div className="volume-bar-wrap">
        <div className="volume-big">{totalVol.toFixed(1)}<span> m³</span></div>
        <div className="volume-breakdown">
          {lang === 'fr' ? 'Volume total estimé' : 'Total estimated volume'}<br />
          {lang === 'fr' ? 'Pièce :' : 'Room:'} <strong>{getRoomVolume(room).toFixed(2)} m³</strong>
        </div>
      </div>

      <div className="chip-tabs">
        <div className={`chip-tab ${!showBoxes ? 'active' : ''}`} onClick={() => setRoomTab(false)}>
          {lang === 'fr' ? 'Objets' : 'Items'}
        </div>
        <div className={`chip-tab ${showBoxes ? 'active' : ''}`} onClick={() => setRoomTab(true)}>
          📦 {t('boxes')}
        </div>
      </div>

      <div className="room-selector">
        {state.rooms.map(r => (
          <button
            key={r.id}
            className={`room-sel-btn ${r.id === (state.currentRoomId || state.rooms[0].id) ? 'active' : ''}`}
            onClick={() => selectRoom(r.id)}
          >
            <span className="sel-icon">{getRoomIcon(r.type)}</span>
            <span className="sel-name">{r.name}</span>
          </button>
        ))}
      </div>

      {!showBoxes ? (
        <>
          <CatalogSection room={room} />
          <RoomBoxSection room={room} />
          <InventoryList room={room} />
        </>
      ) : (
        <BoxesSection />
      )}
    </>
  );
}
