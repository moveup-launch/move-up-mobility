import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useApp } from '../context/AppContext';

function safe(str) {
  return String(str || '')
    .replace(/[—–]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x00-\xFF]/g, '')
    .trim();
}

export default function Step6PDF() {
  const {
    t, lang, state,
    getTotalVolume, getRecommendedTruck, getRecommendedTeam, getEquipment, getCheckPoints, getSegmentSolution,
    getTotalBoxes, getBoxVolume, getRoomVolume,
  } = useApp();
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const isFr = lang === 'fr';

  const generatePDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210;
    let y = 0;

    const BLACK = [15, 15, 14];
    const GRAY = [120, 118, 112];
    const LIGHT = [245, 244, 240];
    const BLUE = [43, 107, 230];
    const WARN = [220, 140, 20];

    function addPage() { doc.addPage(); y = 20; }
    function checkY(needed = 10) { if (y + needed > 270) addPage(); }

    // En-tête
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

    function accessBlock(d, title) {
      sectionTitle(title);
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

      // Monte-meubles
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

    // Infos client
    sectionTitle(t('clientInfo'));
    row(t('clientName'), state.client.name);
    row(t('clientPhone'), state.client.phone);
    row(t('clientEmail'), state.client.email);
    row(t('visitDate'), state.client.visitDate);
    row(t('surveyor'), state.client.surveyor);
    row(t('moveDate'), state.client.moveDate);
    if (state.client.notes) row(t('notes'), state.client.notes);
    divider();

    // Type logement
    sectionTitle(t('housingType'));
    row(t('housingType'), t(state.housingType));
    const moveLabels = {
      local: isFr ? 'Local / National' : 'Local / National',
      road: isFr ? 'International routier' : 'International road',
      sea: isFr ? 'Maritime' : 'Sea freight',
      air: isFr ? 'Aerien' : 'Air freight',
      storage: isFr ? 'Stockage' : 'Storage',
    };
    row(t('moveType'), moveLabels[state.moveType || 'local'] || '');
    divider();

    // Accès
    accessBlock(state.origin, t('origin'));
    accessBlock(state.destination, t('destination'));

    // Points à vérifier
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

    // Inventaire par pièce
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
          if (tags.length) {
            doc.setFont('helvetica', 'italic'); doc.setTextColor(...GRAY); doc.setFontSize(7);
            doc.text(safe(`    [${tags.join(', ')}]`), 16, y + 4);
            y += 9;
          } else { y += 6; }
        });
      }
      y += 3;
    });
    divider();

    // Cartons
    sectionTitle(t('boxesSummary'));
    const bDone = getTotalBoxes(state.boxesDone);
    const bRem = getTotalBoxes(state.boxesRemaining);
    row(t('boxesPacked'), `${bDone} ${isFr ? 'cartons' : 'boxes'} (${getBoxVolume(state.boxesDone).toFixed(2)} m3)`);
    row(t('boxesEstimated'), `${bRem} ${isFr ? 'cartons' : 'boxes'} (${getBoxVolume(state.boxesRemaining).toFixed(2)} m3)`);
    divider();

    // Solution logistique
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
    row(isFr ? 'Solution logistique' : 'Logistics solution', getRecommendedTruck(vol));
    const mt = state.moveType || 'local';
    if (mt === 'local' || mt === 'road') {
      row(safe(t('recommendedTeam')), getRecommendedTeam(vol));
    }

    // Segments de déménagement
    const segments = state.moveSegments || [];
    if (segments.length > 0) {
      checkY(6);
      doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLACK);
      doc.text(safe(isFr ? 'Repartition du demenagement' : 'Move breakdown'), 16, y); y += 5;
      const segTypeLabels = {
        local: isFr ? 'Local / National' : 'Local / National',
        road: isFr ? 'Routier international' : 'International road',
        sea: isFr ? 'Maritime' : 'Sea freight',
        air: isFr ? 'Aerien' : 'Air freight',
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

    // Signatures
    checkY(40);
    sectionTitle(isFr ? 'Signatures' : 'Signatures');
    const sigY = y;
    doc.setDrawColor(...GRAY); doc.setLineWidth(0.5);
    doc.line(16, sigY + 20, 85, sigY + 20);
    doc.line(120, sigY + 20, W - 16, sigY + 20);
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
    doc.text(safe(t('clientSignature')), 50, sigY + 25, { align: 'center' });
    doc.text(safe(t('surveyorSignature')), W / 2 + 37, sigY + 25, { align: 'center' });

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
