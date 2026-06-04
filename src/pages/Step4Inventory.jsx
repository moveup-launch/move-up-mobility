import { useApp } from '../context/AppContext';
import { CATALOG } from '../data/catalog';

function VariantSheet({ roomId, catKey, itemId }) {
  const { tCat, lang, addItemToRoom, closeSheet } = useApp();
  const cat = CATALOG[catKey];
  const item = cat?.find(i => i.id === itemId);
  if (!item) return null;

  return (
    <>
      <div className="sheet-handle" />
      <div className="sheet-title">{item.icon} {tCat(item.name)}</div>
      {item.variants.map(v => (
        <div key={v.id} className="variant-option" onClick={() => { addItemToRoom(roomId, catKey, itemId, v.id); closeSheet(); }}>
          <div style={{ flex: 1 }}>
            <div className="var-name">{tCat(v.label)}</div>
            <div className="var-vol">{v.volume_m3} m³</div>
          </div>
          <div className="var-tags">
            {v.fragile && <span className="tag tag-fragile">Fragile</span>}
            {v.heavy && <span className="tag tag-heavy">{lang === 'fr' ? 'Lourd' : 'Heavy'}</span>}
            {v.requires_disassembly && <span className="tag tag-disassembly">{lang === 'fr' ? 'Démontage' : 'Disassembly'}</span>}
          </div>
        </div>
      ))}
    </>
  );
}

function CatalogSection({ room }) {
  const { tCat, lang, openSheet } = useApp();

  const catLabels = {
    bedroom: lang === 'fr' ? 'Chambre / Bureau' : 'Bedroom / Office',
    livingRoom: lang === 'fr' ? 'Salon / Séjour' : 'Living room',
    kitchen: lang === 'fr' ? 'Cuisine' : 'Kitchen',
    office: lang === 'fr' ? 'Bureau' : 'Office',
    garageBasement: lang === 'fr' ? 'Garage / Cave' : 'Garage / Basement',
    exceptional: lang === 'fr' ? 'Objets exceptionnels' : 'Exceptional items',
  };

  const cats = CATALOG.roomCatalogMap[room.type] || ['bedroom'];
  const result = [];
  cats.forEach(cat => {
    if (CATALOG[cat]) result.push({ key: cat, items: CATALOG[cat] });
  });
  if (!cats.includes('exceptional')) result.push({ key: 'exceptional', items: CATALOG.exceptional });

  return (
    <>
      {result.map(cat => (
        <div key={cat.key} className="catalog-category">
          <div className="catalog-category-title">{catLabels[cat.key] || cat.key}</div>
          <div className="item-grid">
            {cat.items.map(item => {
              const qty = (room.items || []).filter(i => i.catalogId === item.id).reduce((s, i) => s + i.qty, 0);
              return (
                <div
                  key={item.id}
                  className={`item-card ${qty > 0 ? 'in-inventory' : ''}`}
                  onClick={() => openSheet(<VariantSheet roomId={room.id} catKey={cat.key} itemId={item.id} />)}
                >
                  {qty > 0 && <div className="item-qty-badge">{qty}</div>}
                  <span className="item-icon">{item.icon}</span>
                  <div className="item-name">{tCat(item.name)}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

function InventoryList({ room }) {
  const { t, lang, changeQty } = useApp();
  const items = (room.items || []).filter(i => i.qty > 0);

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: '13px' }}>
        {lang === 'fr' ? 'Aucun objet ajouté' : 'No items added'}
      </div>
    );
  }

  return (
    <div style={{ marginTop: '8px' }}>
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
  const { t, lang, state, changeBox, setBox } = useApp();
  const sections = [
    { key: 'boxesDone', source: state.boxesDone },
    { key: 'boxesRemaining', source: state.boxesRemaining },
  ];

  return (
    <>
      {sections.map(sec => (
        <div key={sec.key} className="card">
          <div className="card-title">{t(sec.key)}</div>
          {CATALOG.boxTypes.map(bt => (
            <div key={bt.id} className="box-row">
              <span className="box-icon">{bt.icon}</span>
              <div style={{ flex: 1 }}>
                <div className="box-label">{t(bt.nameKey)}</div>
                <div className="box-vol">{bt.volume_m3} m³ / {lang === 'fr' ? 'carton' : 'box'}</div>
              </div>
              <div className="box-qty">
                <button className="qty-btn" onClick={() => changeBox(sec.key, bt.id, -1)}>−</button>
                <input
                  type="number"
                  min="0"
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
          {lang === 'fr' ? 'Pièce en cours :' : 'Current room:'} <strong>{getRoomVolume(room).toFixed(2)} m³</strong>
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
          <InventoryList room={room} />
        </>
      ) : (
        <BoxesSection />
      )}
    </>
  );
}
