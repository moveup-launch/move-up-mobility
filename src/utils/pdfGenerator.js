import { jsPDF } from 'jspdf';
import { CATALOG } from '../data/catalog';
import { TRANSLATIONS } from '../data/translations';

function getRoomDisplayName(room, lang) {
  if (!room) return '';
  if (room.isCustomName) return room.name; // nom personnalisé par l'utilisateur → jamais retraduit
  const base = TRANSLATIONS[lang]?.[room.type] || room.type;
  const match = String(room.name || '').match(/(\d+)\s*$/); // ex: "Chambre 2" → garde le "2"
  return match ? `${base} ${match[1]}` : base;
}

function safe(str) {
  return String(str || '')
    .replace(/[—–]/g, '-')
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/[^\x00-\xFF]/g, '')
    .trim();
}

function hexToRgb(hex) {
  const h = (hex || '#000000').replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) || 0,
    parseInt(h.slice(2, 4), 16) || 0,
    parseInt(h.slice(4, 6), 16) || 0,
  ];
}

async function loadImageAsDataUrl(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Logo fetch failed: ${resp.status}`);
  const blob = await resp.blob();
  const dataUrl = await new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(blob);
  });
  const { w, h } = await new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = rej;
    img.src = dataUrl;
  });
  return { dataUrl, w, h };
}

function getSegmentSolution(type, volume, isFr) {
  const v = parseFloat(volume) || 0;
  if (type === 'sea' || type === 'international') {
    if (v < 5)   return isFr ? 'Aérien ou LCL groupage' : 'Air or LCL groupage';
    if (v <= 30) return isFr ? 'Maritime LCL groupage'  : 'Sea LCL groupage';
    if (v <= 60) return isFr ? "Conteneur 20'"          : "20' Container";
    return isFr ? "Conteneur 40' HC" : "40' HC Container";
  }
  if (type === 'air') {
    if (v < 1) return isFr ? 'Colis express'    : 'Express parcel';
    if (v < 5) return isFr ? 'Palette aerienne' : 'Air pallet';
    return isFr ? 'Groupage aerien' : 'Air groupage';
  }
  if (type === 'storage') return isFr ? 'Garde-meuble / box' : 'Storage / warehouse';
  if (type === 'road')    return isFr ? 'Route internationale' : 'International road';
  return isFr ? 'Route / National' : 'Road / National';
}

function getRoomVolume(room) {
  return (room.items || []).reduce((s, i) => s + (i.qty > 0 ? (i.volume_m3 || 0) * i.qty : 0), 0);
}

const catalogItemById = {};
Object.values(CATALOG).forEach(section => {
  if (!Array.isArray(section)) return;
  section.forEach(item => { catalogItemById[item.id] = item; });
});

function getItemName(item, lang) {
  if (item.catalogId === 'custom') return item.name;
  const def = catalogItemById[item.catalogId];
  if (!def) return item.name;
  return def.name[lang] || def.name.fr || def.name.en || item.name;
}

function getVariantLabel(item, lang) {
  if (item.catalogId === 'custom') return item.variantLabel;
  const def = catalogItemById[item.catalogId];
  if (!def) return item.variantLabel;
  const variantId = item.itemId?.slice((item.catalogId?.length || 0) + 1);
  const variant = def.variants?.find(v => v.id === variantId);
  if (!variant) return item.variantLabel;
  return variant.label[lang] || variant.label.fr || variant.label.en || item.variantLabel;
}

export async function generateVisitPDF(visitState, profile, lang) {
  const isFr = lang === 'fr';
  const t = (key) => TRANSLATIONS[lang]?.[key] || key;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  let y = 0;

  const BLACK = [15, 15, 14];
  const GRAY  = [120, 118, 112];
  const LIGHT = [245, 244, 240];

  const FOOTER = isFr
    ? 'Rapport genere avec Move Up Mobility - moveupapp.com'
    : 'Report generated with Move Up Mobility - moveupapp.com';

  function addFooters() {
    const total = doc.internal.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      doc.setPage(p);
      doc.setFontSize(6.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(180, 180, 180);
      doc.text(FOOTER, W / 2, 293, { align: 'center' });
    }
  }

  function addPage() { doc.addPage(); y = 20; }
  function checkY(needed = 10) { if (y + needed > 270) addPage(); }

  // ── PAGE DE GARDE DYNAMIQUE ──────────────────────────────────
  const brandColor = hexToRgb(profile?.company_color || '#2B6BE6');
  const darken = (c, f) => c.map(v => Math.round(v * f));
  const brandDark = darken(brandColor, 0.55);

  const heroH = 92;
  const bands = 60;
  for (let i = 0; i < bands; i++) {
    const t2 = i / (bands - 1);
    const r = Math.round(brandDark[0] + (brandColor[0] - brandDark[0]) * t2);
    const g = Math.round(brandDark[1] + (brandColor[1] - brandDark[1]) * t2);
    const b = Math.round(brandDark[2] + (brandColor[2] - brandDark[2]) * t2);
    doc.setFillColor(r, g, b);
    doc.rect(0, (heroH / bands) * i, W, heroH / bands + 0.5, 'F');
  }

  let coverLogo = null;
  if (profile?.company_logo_url) {
    try { coverLogo = await loadImageAsDataUrl(profile.company_logo_url); } catch { /* skip */ }
  }
  if (coverLogo) {
    try {
      const ratio = coverLogo.w / coverLogo.h;
      const lH = 14, lW = Math.min(lH * ratio, 46);
      doc.addImage(coverLogo.dataUrl, 'PNG', 18, 10, lW, lH);
    } catch { /* skip */ }
  }
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10); doc.setFont('helvetica', 'bold');
  doc.text(safe((profile?.company_name || 'MOVE UP MOBILITY').toUpperCase()), 18, coverLogo ? 30 : 22);
  doc.setFontSize(28); doc.setFont('helvetica', 'bold');
  doc.text(safe(isFr ? 'Rapport de visite' : 'Survey report'), 18, 44);
  doc.setFontSize(11); doc.setFont('helvetica', 'normal');
  doc.setTextColor(230, 235, 245);
  const coverClientName = visitState.client?.name || '';
  const moveTypeLabel = isFr ? 'Demenagement' : 'Move survey';
  doc.text(safe(`${coverClientName}${coverClientName ? ' - ' : ''}${moveTypeLabel}`), 18, 54);

  doc.setFontSize(9); doc.setTextColor(220, 228, 242);
  const coverDateStr = new Date().toLocaleDateString(isFr ? 'fr-FR' : 'en-GB');
  doc.text(safe(coverDateStr), W - 18, 22, { align: 'right' });

  const totalVol = (visitState.rooms || []).reduce((s, rr) => s + getRoomVolume(rr), 0);
  const totalItems = (visitState.rooms || []).reduce((s, rr) => s + (rr.items || []).reduce((a, i) => a + (i.qty > 0 ? i.qty : 0), 0), 0);
  const roomCount = (visitState.rooms || []).filter(rr => (rr.items || []).some(i => i.qty > 0)).length;

  const cardX = 18, cardY = 76, cardW = W - 36, cardH = 46;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(235, 235, 235);
  doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4, 'FD');

  doc.setTextColor(...brandDark);
  doc.setFontSize(34); doc.setFont('helvetica', 'bold');
  const volInt = Math.floor(totalVol);
  const volDec = Math.round((totalVol - volInt) * 10);
  doc.text(safe(`${volInt}`), cardX + 12, cardY + 30);
  const volIntW = doc.getTextWidth(`${volInt}`);
  doc.setFontSize(16); doc.setTextColor(...brandColor);
  doc.text(safe(`,${volDec} m3`), cardX + 12 + volIntW + 1, cardY + 30);
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 120, 120);
  doc.text(safe(isFr ? 'Volume total estime' : 'Total estimated volume'), cardX + 12, cardY + 39);

  doc.setDrawColor(230, 230, 230); doc.setLineWidth(0.3);
  doc.line(cardX + 90, cardY + 8, cardX + 90, cardY + 38);

  doc.setTextColor(...brandDark); doc.setFontSize(16); doc.setFont('helvetica', 'bold');
  doc.text(safe(`${roomCount}`), cardX + 102, cardY + 20);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 120, 120);
  doc.text(safe(isFr ? 'pieces inventoriees' : 'rooms surveyed'), cardX + 112, cardY + 20);
  doc.setTextColor(...brandDark); doc.setFontSize(16); doc.setFont('helvetica', 'bold');
  doc.text(safe(`${totalItems}`), cardX + 102, cardY + 34);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 120, 120);
  doc.text(safe(isFr ? 'objets au total' : 'items in total'), cardX + 112, cardY + 34);

  let cy = cardY + cardH + 18;
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(150, 150, 150);
  doc.text(safe(isFr ? 'TRAJET DU DEMENAGEMENT' : 'MOVE ROUTE'), 18, cy);
  cy += 10;
  const oCity = visitState.origin?.city || (isFr ? 'Depart' : 'Origin');
  const dCity = visitState.destination?.city || (isFr ? 'Arrivee' : 'Destination');
  const oAddr = [visitState.origin?.address, visitState.origin?.postalCode].filter(Boolean).join(', ');
  const dAddr = visitState.destination?.noFixedAddress ? '' : [visitState.destination?.address, visitState.destination?.postalCode].filter(Boolean).join(', ');
  doc.setTextColor(...brandColor); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
  doc.text(safe(isFr ? 'DEPART' : 'ORIGIN'), 18, cy);
  doc.setTextColor(30, 30, 30); doc.setFontSize(15);
  doc.text(safe(oCity), 18, cy + 8);
  doc.setTextColor(130, 130, 130); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text(safe(oAddr), 18, cy + 14);
  doc.setTextColor(...brandColor); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
  doc.text(safe(isFr ? 'ARRIVEE' : 'DESTINATION'), W - 18, cy, { align: 'right' });
  doc.setTextColor(30, 30, 30); doc.setFontSize(15);
  doc.text(safe(dCity), W - 18, cy + 8, { align: 'right' });
  doc.setTextColor(130, 130, 130); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text(safe(dAddr), W - 18, cy + 14, { align: 'right' });
  const trackY = cy + 5;
  const trackX1 = 95, trackX2 = W - 95;
  doc.setDrawColor(...brandColor); doc.setLineWidth(1.2);
  doc.line(trackX1, trackY, trackX2, trackY);
  doc.setFillColor(...brandColor);
  doc.circle(trackX1, trackY, 1.8, 'F');
  doc.circle(trackX2, trackY, 1.8, 'F');

  cy += 30;
  const roomsWithVol = (visitState.rooms || [])
    .map(rr => ({ name: getRoomDisplayName(rr, lang), vol: getRoomVolume(rr) }))
    .filter(rr => rr.vol > 0)
    .sort((a, b) => b.vol - a.vol);

  if (roomsWithVol.length > 0 && totalVol > 0) {
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(150, 150, 150);
    doc.text(safe(isFr ? 'REPARTITION DU VOLUME PAR PIECE' : 'VOLUME BREAKDOWN BY ROOM'), 18, cy);
    cy += 10;
    const maxVol = roomsWithVol[0].vol;
    const barMaxW = 95;
    const barX = 62;
    roomsWithVol.slice(0, 8).forEach(rr => {
      const pct = Math.round((rr.vol / totalVol) * 100);
      const barW = Math.max(6, (rr.vol / maxVol) * barMaxW);
      doc.setTextColor(60, 60, 60); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.text(safe(rr.name.length > 20 ? rr.name.slice(0, 19) + '.' : rr.name), 18, cy + 4.5);
      doc.setFillColor(243, 243, 243);
      doc.roundedRect(barX, cy, barMaxW, 6.5, 1.5, 1.5, 'F');
      doc.setFillColor(...brandColor);
      doc.roundedRect(barX, cy, barW, 6.5, 1.5, 1.5, 'F');
      doc.setTextColor(...brandDark); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
      doc.text(safe(`${rr.vol.toFixed(1)} m3`), barX + barMaxW + 6, cy + 4.8);
      doc.setTextColor(150, 150, 150); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
      doc.text(safe(`${pct}%`), W - 18, cy + 4.8, { align: 'right' });
      cy += 11;
    });
  }

  doc.setDrawColor(240, 240, 240); doc.setLineWidth(0.3);
  doc.line(18, 275, W - 18, 275);
  doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(160, 160, 160);
  doc.text(safe([profile?.company_name, profile?.company_email].filter(Boolean).join(' - ')), 18, 281);
  doc.text(safe(isFr ? 'Genere avec Move Up Mobility' : 'Generated with Move Up Mobility'), W - 18, 281, { align: 'right' });

  doc.addPage();
  y = 20;


  // ── Helpers ──────────────────────────────────────────────────
  function sectionTitle(title) {
    checkY(14);
    doc.setFillColor(...LIGHT);
    doc.roundedRect(12, y, W - 24, 8, 2, 2, 'F');
    doc.setTextColor(...BLACK); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text(safe(title).toUpperCase(), 16, y + 5.5);
    y += 12;
  }

  function row(label, value, indent = 16) {
    checkY(7);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
    doc.text(safe(label), indent, y);
    doc.setTextColor(...BLACK); doc.setFont('helvetica', 'bold');
    const val = safe(value);
    if (val) doc.text(val, 100, y);
    y += 6.5;
  }

  function divider() {
    doc.setDrawColor(...LIGHT);
    doc.line(12, y, W - 12, y);
    y += 4;
  }

  function yesNoLabel(val) {
    if (val === 'yes') return isFr ? 'Oui' : 'Yes';
    if (val === 'no')  return isFr ? 'Non' : 'No';
    return isFr ? 'A verifier' : 'To check';
  }

  function accessBlock(d, title, housingType) {
    sectionTitle(title);
    if (d?.noFixedAddress) {
      row(isFr ? 'Ville' : 'City', d.city || (isFr ? 'Non precisee' : 'Not specified'));
      row(isFr ? 'Sans adresse fixe' : 'No fixed address', isFr ? 'Oui - ville uniquement' : 'Yes - city only');
      divider();
      return;
    }
    if (housingType) row(t('housingType'), t(housingType));
    row(isFr ? 'Adresse' : 'Address', `${d?.address || ''} ${d?.postalCode || ''} ${d?.city || ''}`.trim());
    row(t('floor'), d?.floor);
    if (d?.elevator) row(t('elevator'), yesNoLabel(d.elevator));
    if (d?.elevator === 'yes') {
      row(t('elevatorUsable'), yesNoLabel(d.elevatorUsable));
      row(t('elevatorSize'), yesNoLabel(d.elevatorSize));
    }
    row(t('parkingTruck'), yesNoLabel(d?.parkingAvailable));
    if (d?.accessDifficult && d.accessDifficult !== 'toCheck') row(isFr ? 'Acces difficile' : 'Difficult access', yesNoLabel(d.accessDifficult));
    const distMap = { front: 'Front', lt10: 'Less10', '10_30': '10_30', '30_50': '30_50', gt50: 'More50', unknown: 'Unknown' };
    if (d?.truckDistance) row(isFr ? 'Distance stationnement camion' : 'Truck parking distance', t('truckDistance' + (distMap[d.truckDistance] || '')));
    const liftSection = isFr ? 'Monte-meubles' : 'Furniture lift';
    if (d?.furnitureLiftNeeded && d.furnitureLiftNeeded !== 'toCheck') {
      row(liftSection + ' ' + (isFr ? 'necessaire' : 'needed'), yesNoLabel(d.furnitureLiftNeeded));
      if (d.furnitureLiftNeeded !== 'no') {
        if (d.furnitureLiftFeasible) row(isFr ? '  Mise en place' : '  Setup feasible', yesNoLabel(d.furnitureLiftFeasible));
        if (d.furnitureLiftLocation) row(isFr ? '  Emplacement' : '  Location', d.furnitureLiftLocation);
        if (d.furnitureLiftComment) row(isFr ? '  Commentaire' : '  Comment', d.furnitureLiftComment);
      }
    }
    if (d?.accessNotes) row(t('accessNotes'), d.accessNotes);
    divider();
  }

  // ── Infos client ─────────────────────────────────────────────
  sectionTitle(t('clientInfo'));
  row(t('clientName'), visitState.client?.name);
  row(t('clientPhone'), visitState.client?.phone);
  row(t('clientEmail'), visitState.client?.email);
  row(t('visitDate'), visitState.client?.visitDate);
  row(t('surveyor'), visitState.client?.surveyor);
  row(t('moveDate'), visitState.client?.moveDate);
  if (visitState.client?.notes) row(t('notes'), visitState.client.notes);
  divider();

  // ── Type logement & déménagement ─────────────────────────────
  const moveLabels = {
    local:   isFr ? 'Local / National' : 'Local / National',
    road:    isFr ? 'International routier' : 'International road',
    sea:     isFr ? 'Maritime' : 'Sea freight',
    air:     isFr ? 'Aerien' : 'Air freight',
    storage: isFr ? 'Stockage' : 'Storage',
  };
  const segsForType = visitState.moveSegments || [];
  const primaryMoveType = segsForType.length > 0
    ? segsForType.reduce((a, b) => ((b.volume || 0) > (a.volume || 0) ? b : a)).type
    : (visitState.moveType || 'local');

  sectionTitle(isFr ? 'Type de logement' : 'Housing type');
  if (visitState.housingTypeOrigin) row(isFr ? 'Type logement depart' : 'Origin housing type', t(visitState.housingTypeOrigin));
  if (visitState.housingTypeDestination) row(isFr ? 'Type logement arrivee' : 'Destination housing type', t(visitState.housingTypeDestination));
  divider();

  // ── Groupes transport ────────────────────────────────────────
  const pdfModeGroups = {};
  (visitState.rooms || []).forEach(room => {
    (room.items || []).filter(i => i.qty > 0).forEach(item => {
      const m = item.transportMode || 'none';
      if (!pdfModeGroups[m]) pdfModeGroups[m] = [];
      pdfModeGroups[m].push({ ...item, roomName: getRoomDisplayName(room, lang) });
    });
  });
  const pdfDefinedModes = ['road', 'sea', 'air', 'storage'].filter(m => pdfModeGroups[m]?.length > 0);
  if (pdfDefinedModes.length >= 2) {
    sectionTitle(isFr ? 'Repartition du demenagement' : 'Move breakdown');
    row(t('moveType'), moveLabels[primaryMoveType] || '');
    divider();
  }

  // ── Accès ────────────────────────────────────────────────────
  accessBlock(visitState.origin, t('origin'), visitState.housingTypeOrigin);
  accessBlock(visitState.destination, t('destination'), visitState.housingTypeDestination);

  // ── Inventaire ───────────────────────────────────────────────
  function renderItemList(items) {
    items.forEach(item => {
      checkY(6);
      doc.setTextColor(...BLACK); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
      doc.text(safe(`  ${getItemName(item, lang)} - ${getVariantLabel(item, lang)}`), 16, y);
      doc.setFont('helvetica', 'bold');
      doc.text(safe(`x${item.qty}  ${(item.volume_m3 * item.qty).toFixed(3)} m3`), W - 16, y, { align: 'right' });
      const tags = [];
      if (item.fragile) tags.push('Fragile');
      if (item.heavy) tags.push(isFr ? 'Lourd' : 'Heavy');
      if (item.requires_disassembly) tags.push(isFr ? 'Demontage' : 'Disassembly');
      if (item.possible_furniture_lift) tags.push(isFr ? 'Monte-meubles' : 'Lift required');
      if (item.crate) tags.push(`${isFr ? 'Caisse' : 'Crate'} ${item.crate.l}x${item.crate.w}x${item.crate.h}cm`);
      if (item.roomName) {
        doc.setFont('helvetica', 'italic'); doc.setTextColor(...GRAY); doc.setFontSize(7);
        const tagStr = tags.length ? ` [${tags.join(', ')}]` : '';
        doc.text(safe(`    ${item.roomName}${tagStr}`), 16, y + 4);
        y += 9;
      } else if (tags.length) {
        doc.setFont('helvetica', 'italic'); doc.setTextColor(...GRAY); doc.setFontSize(7);
        doc.text(safe(`    [${tags.join(', ')}]`), 16, y + 4);
        y += 9;
      } else { y += 6; }
      if (item.comment) {
        checkY(4);
        doc.setFont('helvetica', 'italic'); doc.setTextColor(...GRAY); doc.setFontSize(7);
        doc.text(safe(`    > ${item.comment}`), 16, y); y += 4;
      }
    });
  }

  if (pdfDefinedModes.length >= 2) {
    // Bug connu : le mode "route" affichait toujours "Route / National" même
    // pour un déménagement international par la route. On distingue maintenant
    // selon le type de déménagement déclaré pour cette visite.
    const isRoadInternational = primaryMoveType !== 'local';
    const modeHeaders = {
      road:    isRoadInternational
        ? (isFr ? 'ROUTIER INTERNATIONAL' : 'INTERNATIONAL ROAD')
        : (isFr ? 'ROUTE / NATIONAL' : 'ROAD / NATIONAL'),
      sea:     isFr ? 'MARITIME' : 'SEA',
      air:     isFr ? 'AERIEN' : 'AIR',
      storage: isFr ? 'STOCKAGE' : 'STORAGE',
    };
    pdfDefinedModes.forEach(mode => {
      const modeItems = pdfModeGroups[mode] || [];
      const modeVol = modeItems.reduce((s, i) => s + (i.volume_m3 || 0) * i.qty, 0);
      const containerReco = mode === 'sea' ? getSegmentSolution('sea', modeVol, isFr) : null;
      const header = `${modeHeaders[mode]}${containerReco ? '  -  ' + containerReco : ''}  (${modeVol.toFixed(2)} m3)`;
      checkY(12);
      doc.setFillColor(...BLACK);
      doc.roundedRect(12, y, W - 24, 7, 1, 1, 'F');
      doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.text(safe(header), 16, y + 4.8);
      y += 10;
      renderItemList(modeItems);
      y += 3;
    });
    if (pdfModeGroups['none']?.length > 0) {
      checkY(12);
      doc.setFillColor(...GRAY);
      doc.roundedRect(12, y, W - 24, 7, 1, 1, 'F');
      doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.text(safe(isFr ? 'MODE NON DEFINI' : 'UNDEFINED MODE'), 16, y + 4.8);
      y += 10;
      renderItemList(pdfModeGroups['none']);
      y += 3;
    }
  } else {
    sectionTitle(isFr ? 'Inventaire par piece' : 'Inventory by room');
    (visitState.rooms || []).forEach(room => {
      checkY(12);
      doc.setFillColor(...BLACK);
      doc.roundedRect(12, y, W - 24, 7, 1, 1, 'F');
      doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.text(safe(`${getRoomDisplayName(room, lang)}  -  ${getRoomVolume(room).toFixed(2)} m3`), 16, y + 4.8);
      y += 10;

      const items = (room.items || []).filter(i => i.qty > 0);
      if (items.length === 0) {
        doc.setTextColor(...GRAY); doc.setFontSize(8); doc.setFont('helvetica', 'italic');
        doc.text(t('noItems'), 20, y); y += 5;
      } else {
        items.forEach(item => {
          checkY(6);
          doc.setTextColor(...BLACK); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
          doc.text(safe(`  ${getItemName(item, lang)} - ${getVariantLabel(item, lang)}`), 16, y);
          doc.setFont('helvetica', 'bold');
          doc.text(safe(`x${item.qty}  ${(item.volume_m3 * item.qty).toFixed(3)} m3`), W - 16, y, { align: 'right' });
          const tags = [];
          if (item.fragile) tags.push('Fragile');
          if (item.heavy) tags.push(isFr ? 'Lourd' : 'Heavy');
          if (item.requires_disassembly) tags.push(isFr ? 'Demontage' : 'Disassembly');
          if (item.possible_furniture_lift) tags.push(isFr ? 'Monte-meubles' : 'Lift required');
          const modeIcons = { road: '🚛', sea: '🚢', air: '✈', storage: '📦' };
          if (item.transportMode && modeIcons[item.transportMode]) tags.push(modeIcons[item.transportMode]);
          if (item.crate) tags.push(`${isFr ? 'Caisse' : 'Crate'} ${item.crate.l}x${item.crate.w}x${item.crate.h}cm`);
          if (tags.length) {
            doc.setFont('helvetica', 'italic'); doc.setTextColor(...GRAY); doc.setFontSize(7);
            doc.text(safe(`    [${tags.join(', ')}]`), 16, y + 4);
            y += 9;
          } else { y += 6; }
          if (item.comment) {
            checkY(4);
            doc.setFont('helvetica', 'italic'); doc.setTextColor(...GRAY); doc.setFontSize(7);
            doc.text(safe(`    > ${item.comment}`), 16, y); y += 4;
          }
        });
      }

      // Photos de la pièce (dataURL uniquement — absentes depuis l'historique)
      const roomPhotos = (room.photos || []).filter(p => p.dataURL);
      if (roomPhotos.length > 0) {
        const displayPhotos = roomPhotos.slice(0, 4);
        const PHOTO_W = 87, PHOTO_H = 65, PHOTO_GAP = 8, TEXT_H = 14;
        const photoRows = Math.ceil(displayPhotos.length / 2);
        checkY(12);
        doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GRAY);
        doc.text(safe(isFr ? 'Photos :' : 'Photos:'), 18, y); y += 6;
        for (let pr = 0; pr < photoRows; pr++) {
          checkY(PHOTO_H + TEXT_H + 4);
          const rowY = y;
          for (let col = 0; col < 2; col++) {
            const idx = pr * 2 + col;
            if (idx >= displayPhotos.length) break;
            const photo = displayPhotos[idx];
            const x = 12 + col * (PHOTO_W + PHOTO_GAP);
            try { doc.addImage(photo.dataURL, 'JPEG', x, rowY, PHOTO_W, PHOTO_H); } catch { /* skip */ }
            doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GRAY);
            doc.text(safe(photo.category || ''), x, rowY + PHOTO_H + 4);
            if (photo.comment) {
              doc.setFont('helvetica', 'normal'); doc.setTextColor(...BLACK);
              const lines = doc.splitTextToSize(safe(photo.comment), PHOTO_W);
              doc.text(lines[0] || '', x, rowY + PHOTO_H + 9);
            }
          }
          y = rowY + PHOTO_H + TEXT_H + 4;
        }
      }

      // Cartons de cette pièce
      const boxCatIds = new Set(CATALOG.boxes.map(b => b.id));
      const roomBoxItems = (room.items || []).filter(i => i.qty > 0 && boxCatIds.has(i.catalogId));
      if (roomBoxItems.length > 0) {
        checkY(5);
        doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GRAY);
        doc.text(safe(isFr ? 'Cartons :' : 'Boxes:'), 18, y); y += 4.5;
        roomBoxItems.forEach(item => {
          checkY(4);
          doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
          doc.text(safe(`  - ${item.qty} ${getItemName(item, lang)}`), 22, y); y += 4;
        });
      }
      y += 3;
    });
  }
  divider();

  // ── Récap cartons ────────────────────────────────────────────
  {
    const boxCatIds = new Set(CATALOG.boxes.map(b => b.id));
    let grandBoxCount = 0, grandBoxVol = 0;
    const roomsWithBoxes = (visitState.rooms || []).map(r => {
      const boxItems = (r.items || []).filter(i => i.qty > 0 && boxCatIds.has(i.catalogId));
      const total = boxItems.reduce((s, i) => s + i.qty, 0);
      const vol   = boxItems.reduce((s, i) => s + (i.volume_m3 || 0) * i.qty, 0);
      grandBoxCount += total;
      grandBoxVol   += vol;
      return { r, boxItems, total };
    }).filter(x => x.total > 0);

    if (grandBoxCount > 0) {
      sectionTitle(t('boxesSummary'));
      roomsWithBoxes.forEach(({ r, boxItems }) => {
        checkY(5);
        doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLACK);
        doc.text(safe(`${getRoomDisplayName(r, lang)} :`), 16, y);
        const parts = boxItems.map(i => `${i.qty} ${getItemName(i, lang)}`);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
        doc.text(safe(parts.join(', ')), 42, y); y += 5;
      });
      checkY(6);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLACK); doc.setFontSize(8);
      doc.text(safe(`Total : ${grandBoxCount} ${isFr ? 'cartons' : 'boxes'} — ${grandBoxVol.toFixed(2)} m3`), 16, y); y += 6;
      divider();
    } else {
      divider();
    }
  }

  // ── Volume total ─────────────────────────────────────────────
  {
    const totalVol = (visitState.rooms || []).reduce((s, r) => s + getRoomVolume(r), 0);
    row(isFr ? 'Volume total estime' : 'Total estimated volume', `${totalVol.toFixed(1)} m3`);
    divider();
  }

  // ── Signatures ───────────────────────────────────────────────
  checkY(40);
  sectionTitle(isFr ? 'Signatures' : 'Signatures');
  const sigY = y;
  doc.setDrawColor(...GRAY); doc.setLineWidth(0.5);
  doc.line(16, sigY + 20, 85, sigY + 20);
  doc.line(120, sigY + 20, W - 16, sigY + 20);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
  doc.text(safe(t('clientSignature')), 50, sigY + 25, { align: 'center' });
  doc.text(safe(t('surveyorSignature')), W / 2 + 37, sigY + 25, { align: 'center' });

  addFooters();

  doc.save(safe(`MoveUp_${visitState.client?.name || "client"}_${visitState.client?.visitDate || "visite"}.pdf`));
}
