import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useApp } from '../context/AppContext';
import { CATALOG } from '../data/catalog';

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

function loadImageAsDataUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      resolve({ dataUrl: canvas.toDataURL('image/png'), w: img.width, h: img.height });
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function Step6PDF() {
  const {
    t, lang, state, profile,
    getTotalVolume, getRecommendedTruck, getRecommendedTeam, getEquipment, getCheckPoints, getSegmentSolution,
    getRoomVolume, getAllCrateItems,
  } = useApp();
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const isFr = lang === 'fr';

  const generatePDF = async () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210;
    let y = 0;

    const BLACK = [15, 15, 14];
    const GRAY  = [120, 118, 112];
    const LIGHT = [245, 244, 240];
    const BLUE  = [43, 107, 230];
    const WARN  = [220, 140, 20];

    const FOOTER = isFr
      ? 'Rapport genere avec Move Up Mobility - moveupapp.com'
      : 'Report generated with Move Up Mobility - moveupapp.com';

    function addFooters() {
      const total = doc.internal.getNumberOfPages();
      for (let p = 1; p <= total; p++) {
        doc.setPage(p);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(180, 180, 180);
        doc.text(FOOTER, W / 2, 293, { align: 'center' });
      }
    }

    function addPage() { doc.addPage(); y = 20; }
    function checkY(needed = 10) { if (y + needed > 270) addPage(); }

    // ── En-tête ──────────────────────────────────────────────────
    const hasCompany = profile?.company_name || profile?.company_logo_url;

    if (hasCompany) {
      // Chargement logo
      let logoInfo = null;
      if (profile.company_logo_url) {
        try { logoInfo = await loadImageAsDataUrl(profile.company_logo_url); }
        catch { /* logo non disponible */ }
      }

      const brandColor = hexToRgb(profile?.company_color || '#000000');
      const headerH = 42;
      doc.setFillColor(...brandColor);
      doc.rect(0, 0, W, headerH, 'F');

      let textX = 16;

      // Logo à gauche (max 20mm de hauteur)
      if (logoInfo) {
        const maxLogoH = 22;
        const ratio = logoInfo.w / logoInfo.h;
        const logoH = Math.min(maxLogoH, 22);
        const logoW = Math.min(logoH * ratio, 45);
        const logoY = (headerH - logoH) / 2;
        try {
          doc.addImage(logoInfo.dataUrl, 'PNG', 14, logoY, logoW, logoH);
          textX = 14 + logoW + 8;
        } catch { /* skip */ }
      }

      // Nom entreprise
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text(safe(profile.company_name || ''), textX, 13);

      // Détails (adresse · téléphone · email)
      const details = [profile.company_address, profile.company_phone, profile.company_email]
        .filter(Boolean).join('  |  ');
      if (details) {
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(210, 210, 210);
        doc.text(safe(details), textX, 21);
      }

      // Sous-titre rapport
      doc.setFontSize(8);
      doc.setTextColor(170, 170, 170);
      doc.text(
        isFr ? 'Rapport de visite de demenagement' : 'Moving Survey Report',
        textX, 30
      );

      // Site web si disponible
      if (profile.company_website) {
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(safe(profile.company_website), textX, 37);
      }

      // Date à droite
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        new Date().toLocaleDateString(isFr ? 'fr-FR' : 'en-GB'),
        W - 16, 30, { align: 'right' }
      );

      y = headerH + 12;
    } else {
      // En-tête Move Up par défaut
      doc.setFillColor(...BLACK);
      doc.rect(0, 0, W, 32, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('MOVE UP MOBILITY', 16, 14);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 200, 200);
      doc.text(isFr ? 'Rapport de visite de demenagement' : 'Moving Survey Report', 16, 22);
      doc.text(new Date().toLocaleDateString(isFr ? 'fr-FR' : 'en-GB'), W - 16, 22, { align: 'right' });
      y = 44;
    }

    // ── Helpers contenu ──────────────────────────────────────────
    function sectionTitle(title) {
      checkY(14);
      doc.setFillColor(...LIGHT);
      doc.roundedRect(12, y, W - 24, 8, 2, 2, 'F');
      doc.setTextColor(...BLACK);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(safe(title).toUpperCase(), 16, y + 5.5);
      y += 12;
    }

    function row(label, value, indent = 16) {
      checkY(7);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...GRAY);
      doc.text(safe(label), indent, y);
      doc.setTextColor(...BLACK);
      doc.setFont('helvetica', 'bold');
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
      if (val === 'no') return isFr ? 'Non' : 'No';
      return isFr ? 'A verifier' : 'To check';
    }

    function accessBlock(d, title, housingType) {
      sectionTitle(title);
      if (d.noFixedAddress) {
        row(isFr ? 'Ville' : 'City', d.city || (isFr ? 'Non precisee' : 'Not specified'));
        row(isFr ? 'Sans adresse fixe' : 'No fixed address', isFr ? 'Oui - ville uniquement' : 'Yes - city only');
        divider();
        return;
      }
      if (housingType) row(t('housingType'), t(housingType));
      row(isFr ? 'Adresse' : 'Address', `${d.address || ''} ${d.postalCode || ''} ${d.city || ''}`.trim());
      row(t('floor'), d.floor);
      if (d.elevator) row(t('elevator'), yesNoLabel(d.elevator));
      if (d.elevator === 'yes') {
        row(t('elevatorUsable'), yesNoLabel(d.elevatorUsable));
        row(t('elevatorSize'), yesNoLabel(d.elevatorSize));
      }
      row(t('parkingTruck'), yesNoLabel(d.parkingAvailable));
      if (d.accessDifficult && d.accessDifficult !== 'toCheck') row(isFr ? 'Acces difficile' : 'Difficult access', yesNoLabel(d.accessDifficult));
      const distMap = { front: 'Front', lt10: 'Less10', '10_30': '10_30', '30_50': '30_50', gt50: 'More50', unknown: 'Unknown' };
      if (d.truckDistance) row(isFr ? 'Distance stationnement camion' : 'Truck parking distance', t('truckDistance' + (distMap[d.truckDistance] || '')));
      const liftSection = isFr ? 'Monte-meubles' : 'Furniture lift';
      if (d.furnitureLiftNeeded && d.furnitureLiftNeeded !== 'toCheck') {
        row(liftSection + ' ' + (isFr ? 'necessaire' : 'needed'), yesNoLabel(d.furnitureLiftNeeded));
        if (d.furnitureLiftNeeded !== 'no') {
          if (d.furnitureLiftFeasible) row(isFr ? '  Mise en place' : '  Setup feasible', yesNoLabel(d.furnitureLiftFeasible));
          if (d.furnitureLiftLocation) row(isFr ? '  Emplacement' : '  Location', d.furnitureLiftLocation);
          if (d.furnitureLiftComment) row(isFr ? '  Commentaire' : '  Comment', d.furnitureLiftComment);
        }
      }
      if (d.accessNotes) row(t('accessNotes'), d.accessNotes);
      divider();
    }

    // ── Infos client ─────────────────────────────────────────────
    sectionTitle(t('clientInfo'));
    row(t('clientName'), state.client.name);
    row(t('clientPhone'), state.client.phone);
    row(t('clientEmail'), state.client.email);
    row(t('visitDate'), state.client.visitDate);
    row(t('surveyor'), state.client.surveyor);
    row(t('moveDate'), state.client.moveDate);
    if (state.client.notes) row(t('notes'), state.client.notes);
    divider();

    // ── Type logement & déménagement ─────────────────────────────
    const moveLabels = {
      local:   isFr ? 'Local / National' : 'Local / National',
      road:    isFr ? 'International routier' : 'International road',
      sea:     isFr ? 'Maritime' : 'Sea freight',
      air:     isFr ? 'Aerien' : 'Air freight',
      storage: isFr ? 'Stockage' : 'Storage',
    };
    const segsForType = state.moveSegments || [];
    const primaryMoveType = segsForType.length > 0
      ? segsForType.reduce((a, b) => ((b.volume || 0) > (a.volume || 0) ? b : a)).type
      : (state.moveType || 'local');

    // Type de logement (toujours affiché)
    sectionTitle(isFr ? 'Type de logement' : 'Housing type');
    if (state.housingTypeOrigin) row(isFr ? 'Type logement depart' : 'Origin housing type', t(state.housingTypeOrigin));
    if (state.housingTypeDestination) row(isFr ? 'Type logement arrivee' : 'Destination housing type', t(state.housingTypeDestination));
    divider();

    // Répartition du déménagement (seulement si plusieurs modes sur les objets)
    const pdfModeGroups = {};
    state.rooms.forEach(room => {
      (room.items || []).filter(i => i.qty > 0).forEach(item => {
        const m = item.transportMode || 'none';
        if (!pdfModeGroups[m]) pdfModeGroups[m] = [];
        pdfModeGroups[m].push({ ...item, roomName: room.name });
      });
    });
    const pdfDefinedModes = ['road', 'sea', 'air', 'storage'].filter(m => pdfModeGroups[m]?.length > 0);
    if (pdfDefinedModes.length >= 2) {
      sectionTitle(isFr ? 'Repartition du demenagement' : 'Move breakdown');
      row(t('moveType'), moveLabels[primaryMoveType] || '');
      divider();
    }

    // ── Accès ────────────────────────────────────────────────────
    accessBlock(state.origin, t('origin'), state.housingTypeOrigin);
    accessBlock(state.destination, t('destination'), state.housingTypeDestination);

    // ── Points à vérifier ────────────────────────────────────────
    const checkPoints = getCheckPoints();
    if (checkPoints.length > 0) {
      checkY(12);
      doc.setFillColor(...WARN);
      doc.roundedRect(12, y, W - 24, 8, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text((isFr ? 'POINTS A VERIFIER' : 'POINTS TO CHECK'), 16, y + 5.5);
      y += 12;
      checkPoints.forEach(pt => {
        checkY(6);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...BLACK);
        doc.text(safe(`  - ${pt}`), 16, y);
        y += 5.5;
      });
      divider();
    }

    // ── Inventaire ───────────────────────────────────────────────
    // Helper: afficher les items d'une liste avec tags et photos de pièce
    function renderItemList(items) {
      items.forEach(item => {
        checkY(6);
        doc.setTextColor(...BLACK); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
        doc.text(safe(`  ${item.name} - ${item.variantLabel}`), 16, y);
        doc.setFont('helvetica', 'bold');
        doc.text(safe(`x${item.qty}  ${(item.volume_m3 * item.qty).toFixed(3)} m3`), W - 16, y, { align: 'right' });
        const tags = [];
        if (item.fragile) tags.push('Fragile');
        if (item.heavy) tags.push(isFr ? 'Lourd' : 'Heavy');
        if (item.requires_disassembly) tags.push(isFr ? 'Demontage' : 'Disassembly');
        if (item.crate) tags.push(`Caisse ${item.crate.l}x${item.crate.w}x${item.crate.h}cm`);
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
      });
    }

    if (pdfDefinedModes.length >= 2) {
      // Inventaire groupé par mode de transport
      const modeHeaders = {
        road:    isFr ? 'ROUTE / NATIONAL' : 'ROAD / NATIONAL',
        sea:     isFr ? 'MARITIME' : 'SEA',
        air:     isFr ? 'AERIEN' : 'AIR',
        storage: isFr ? 'STOCKAGE' : 'STORAGE',
      };
      pdfDefinedModes.forEach(mode => {
        const modeItems = pdfModeGroups[mode] || [];
        const modeVol = modeItems.reduce((s, i) => s + (i.volume_m3 || 0) * i.qty, 0);
        const containerReco = mode === 'sea' ? getSegmentSolution('sea', modeVol) : null;
        const header = `${modeHeaders[mode]}${containerReco ? '  -  ' + containerReco : ''}  (${modeVol.toFixed(2)} m3)`;
        checkY(12);
        doc.setFillColor(...BLACK);
        doc.roundedRect(12, y, W - 24, 7, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(safe(header), 16, y + 4.8);
        y += 10;
        renderItemList(modeItems);
        y += 3;
      });
      // Items sans mode défini
      if (pdfModeGroups['none']?.length > 0) {
        checkY(12);
        doc.setFillColor(...GRAY);
        doc.roundedRect(12, y, W - 24, 7, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(safe(isFr ? 'MODE NON DEFINI' : 'UNDEFINED MODE'), 16, y + 4.8);
        y += 10;
        renderItemList(pdfModeGroups['none']);
        y += 3;
      }
    } else {
      // Inventaire normal par pièce
      sectionTitle(isFr ? 'Inventaire par piece' : 'Inventory by room');
      state.rooms.forEach(room => {
        checkY(12);
        doc.setFillColor(...BLACK);
        doc.roundedRect(12, y, W - 24, 7, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(safe(`${room.name}  -  ${getRoomVolume(room).toFixed(2)} m3`), 16, y + 4.8);
        y += 10;

        const items = (room.items || []).filter(i => i.qty > 0);
        if (items.length === 0) {
          doc.setTextColor(...GRAY); doc.setFontSize(8); doc.setFont('helvetica', 'italic');
          doc.text(t('noItems'), 20, y); y += 5;
        } else {
          items.forEach(item => {
            checkY(6);
            doc.setTextColor(...BLACK); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
            doc.text(safe(`  ${item.name} - ${item.variantLabel}`), 16, y);
            doc.setFont('helvetica', 'bold');
            doc.text(safe(`x${item.qty}  ${(item.volume_m3 * item.qty).toFixed(3)} m3`), W - 16, y, { align: 'right' });
            const tags = [];
            if (item.fragile) tags.push('Fragile');
            if (item.heavy) tags.push(isFr ? 'Lourd' : 'Heavy');
            if (item.requires_disassembly) tags.push(isFr ? 'Demontage' : 'Disassembly');
            const modeIcons = { road: '🚛', sea: '🚢', air: '✈', storage: '📦' };
            if (item.transportMode && modeIcons[item.transportMode]) tags.push(modeIcons[item.transportMode]);
            if (item.crate) tags.push(`Caisse ${item.crate.l}x${item.crate.w}x${item.crate.h}cm`);
            if (tags.length) {
              doc.setFont('helvetica', 'italic'); doc.setTextColor(...GRAY); doc.setFontSize(7);
              doc.text(safe(`    [${tags.join(', ')}]`), 16, y + 4);
              y += 9;
            } else { y += 6; }
          });
        }

        // Photos de la pièce (max 4, 2 par ligne)
        const roomPhotos = (room.photos || []).filter(p => p.dataURL);
        if (roomPhotos.length > 0) {
          const displayPhotos = roomPhotos.slice(0, 4);
          const PHOTO_W = 87; const PHOTO_H = 65;
          const PHOTO_GAP = 8; const TEXT_H = 14;
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
        // Cartons de cette pièce (items du catalogue boxes)
        const boxCatIds = new Set(CATALOG.boxes.map(b => b.id));
        const roomBoxItems = (room.items || []).filter(i => i.qty > 0 && boxCatIds.has(i.catalogId));
        if (roomBoxItems.length > 0) {
          checkY(5);
          doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GRAY);
          doc.text(safe(isFr ? 'Cartons :' : 'Boxes:'), 18, y); y += 4.5;
          roomBoxItems.forEach(item => {
            checkY(4);
            doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
            doc.text(safe(`  - ${item.qty} ${item.name}`), 22, y); y += 4;
          });
        }

        y += 3;
      });
    }
    divider();

    // ── Cartons (récap par pièce + total) ────────────────────────
    {
      const boxCatIds = new Set(CATALOG.boxes.map(b => b.id));
      let grandBoxCount = 0;
      let grandBoxVol = 0;
      const roomsWithBoxes = state.rooms.map(r => {
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
          doc.text(safe(`${r.name} :`), 16, y);
          const parts = boxItems.map(i => `${i.qty} ${i.name}`);
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

    // ── Solution logistique ──────────────────────────────────────
    const vol = getTotalVolume();
    sectionTitle(isFr ? 'Solution logistique recommandee' : 'Recommended logistics');
    doc.setFillColor(...BLUE);
    doc.roundedRect(12, y, W - 24, 16, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${vol.toFixed(1)} m3`, W / 2, y + 7, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(safe(t('totalVolumeLabel')), W / 2, y + 12, { align: 'center' });
    y += 22;
    const truck = state.transportOverride || getRecommendedTruck(vol);
    row(isFr ? 'Solution logistique' : 'Logistics solution', truck);
    if (primaryMoveType === 'local' || primaryMoveType === 'road') {
      const team = getRecommendedTeam(vol);
      row(safe(t('recommendedTeam')), team.label);
      if (team.reasons.length > 0) {
        checkY(team.reasons.length * 5 + 4);
        doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(...GRAY);
        team.reasons.forEach(r => { doc.text(safe(`    ${r}`), 100, y); y += 4.5; });
      }
    }

    const crateItems = getAllCrateItems();
    if (crateItems.length > 0) {
      checkY(6);
      doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WARN);
      doc.text(safe(isFr ? 'Caisses sur mesure' : 'Custom crates'), 16, y); y += 5;
      crateItems.forEach(item => {
        checkY(5);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(...BLACK);
        const crateStr = item.crate
          ? ` — Caisse ${item.crate.l}x${item.crate.w}x${item.crate.h} cm (${item.crate.vol} m3)`
          : '';
        doc.text(safe(`  - ${item.name} (${item.roomName}) x${item.qty}${crateStr}`), 20, y); y += 5;
      });
    }

    const segments = state.moveSegments || [];
    if (segments.length > 0) {
      checkY(6);
      doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLACK);
      doc.text(safe(isFr ? 'Repartition du demenagement' : 'Move breakdown'), 16, y); y += 5;
      const segTypeLabels = {
        local:   isFr ? 'Local / National' : 'Local / National',
        road:    isFr ? 'Routier international' : 'International road',
        sea:     isFr ? 'Maritime' : 'Sea freight',
        air:     isFr ? 'Aerien' : 'Air freight',
        storage: isFr ? 'Stockage' : 'Storage',
      };
      segments.forEach(seg => {
        checkY(6);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
        const typeLabel = segTypeLabels[seg.type] || seg.type;
        const solution = getSegmentSolution(seg.type, seg.volume);
        const volStr = seg.volume ? ` ${seg.volume}m3` : '';
        const commentStr = seg.comment ? ` - ${seg.comment}` : '';
        doc.text(safe(`  - ${typeLabel}${volStr} : ${solution}${commentStr}`), 20, y);
        y += 5;
      });
    }

    const equip = getEquipment();
    if (equip.length > 0) {
      checkY(6);
      doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLACK);
      doc.text(safe(t('requiredEquipment')), 16, y); y += 5;
      equip.forEach(e => {
        checkY(5);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
        doc.text(safe(`  - ${e}`), 20, y); y += 5;
      });
    }
    divider();

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

    // ── SIRET en bas si renseigné ─────────────────────────────────
    if (profile?.company_siret) {
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(180, 180, 180);
      doc.text(safe(`SIRET : ${profile.company_siret}`), 16, 293);
    }

    // ── Pied de page sur toutes les pages ─────────────────────────
    addFooters();

    doc.save(safe(`MoveUp_${state.client.name || 'client'}_${state.client.visitDate || 'visite'}.pdf`));
    setPdfSuccess(true);
  };

  const vol = getTotalVolume();
  const checkPoints = getCheckPoints();

  return (
    <>
      <div className="section-header">
        <div className="section-title">{t('surveyReport')}</div>
        <div className="section-subtitle">
          {isFr ? 'Generez et telechargez le rapport' : 'Generate and download the report'}
        </div>
      </div>
      <div className="card">
        <div className="card-title">{isFr ? 'Recapitulatif' : 'Summary'}</div>
        <ul className="item-list-summary">
          <li><span>{t('clientName')}</span><strong>{state.client.name || '—'}</strong></li>
          <li><span>{t('visitDate')}</span><strong>{state.client.visitDate || '—'}</strong></li>
          <li><span>{isFr ? 'Volume total' : 'Total volume'}</span><strong>{vol.toFixed(1)} m³</strong></li>
          <li>
            <span>{isFr ? 'Solution logistique' : 'Logistics'}</span>
            <strong>{getRecommendedTruck(vol)}</strong>
          </li>
        </ul>
      </div>
      {checkPoints.length > 0 && (
        <div className="card" style={{ borderLeft: '3px solid var(--warn)' }}>
          <div className="card-title" style={{ color: 'var(--warn)', fontSize: '13px' }}>
            ⚠️ {t('checkPoints')} ({checkPoints.length})
          </div>
          {checkPoints.map((pt, i) => (
            <div key={i} style={{ fontSize: '12px', color: 'var(--text2)', padding: '3px 0' }}>- {pt}</div>
          ))}
        </div>
      )}
      <button className="pdf-btn" onClick={generatePDF}>
        📄 {t('generatePDF')}
      </button>
      {pdfSuccess && (
        <div style={{ textAlign: 'center', padding: '12px', fontSize: '14px', color: 'var(--success)' }}>
          ✅ {t('pdfGenerated')}
        </div>
      )}
    </>
  );
}
