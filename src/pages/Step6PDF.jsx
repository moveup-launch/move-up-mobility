import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useApp } from '../context/AppContext';

export default function Step6PDF() {
  const {
    t, lang, state,
    getTotalVolume, getRecommendedTruck, getRecommendedTeam, getEquipment,
    getTotalBoxes, getBoxVolume, getRoomVolume,
  } = useApp();
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const generatePDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210;
    let y = 0;

    function addPage() { doc.addPage(); y = 20; }
    function checkY(needed = 10) { if (y + needed > 270) addPage(); }

    const BLACK = [15, 15, 14];
    const GRAY = [120, 118, 112];
    const LIGHT = [245, 244, 240];

    doc.setFillColor(...BLACK);
    doc.rect(0, 0, W, 32, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('MOVE UP MOBILITY', 16, 14);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text(lang === 'fr' ? 'Rapport de visite de déménagement' : 'Moving Survey Report', 16, 22);
    const today = new Date();
    doc.text(today.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB'), W - 16, 22, { align: 'right' });
    y = 44;

    function sectionTitle(title) {
      checkY(14);
      doc.setFillColor(...LIGHT);
      doc.roundedRect(12, y, W - 24, 8, 2, 2, 'F');
      doc.setTextColor(...BLACK);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(title.toUpperCase(), 16, y + 5.5);
      y += 12;
    }

    function row(label, value, indent = 16) {
      checkY(7);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...GRAY);
      doc.text(label, indent, y);
      doc.setTextColor(...BLACK);
      doc.setFont('helvetica', 'bold');
      doc.text(String(value || '—'), 100, y);
      y += 6.5;
    }

    function divider() { doc.setDrawColor(...LIGHT); doc.line(12, y, W - 12, y); y += 4; }

    sectionTitle(t('clientInfo'));
    row(t('clientName'), state.client.name);
    row(t('clientPhone'), state.client.phone);
    row(t('clientEmail'), state.client.email);
    row(t('visitDate'), state.client.visitDate);
    row(t('surveyor'), state.client.surveyor);
    row(t('moveDate'), state.client.moveDate);
    if (state.client.notes) row(t('notes'), state.client.notes);
    divider();

    sectionTitle(t('housingType'));
    row(t('housingType'), t(state.housingType));
    divider();

    sectionTitle(t('origin'));
    row(lang === 'fr' ? 'Adresse' : 'Address', `${state.origin.address} ${state.origin.postalCode} ${state.origin.city}`.trim());
    row(t('floor'), state.origin.floor);
    row(t('elevator'), t(`elevator${state.origin.elevator.charAt(0).toUpperCase() + state.origin.elevator.slice(1)}`));
    row(t('furnitureLift'), state.origin.furnitureLift ? t('yes') : t('no'));
    const distMap = { front: 'Front', lt10: 'Less10', '10_30': '10_30', '30_50': '30_50', gt50: 'More50', unknown: 'Unknown' };
    if (state.origin.truckDistance) row(t('truckDistance'), t('truckDistance' + (distMap[state.origin.truckDistance] || '')));
    if (state.origin.accessNotes) row(t('accessNotes'), state.origin.accessNotes);
    divider();

    sectionTitle(t('destination'));
    row(lang === 'fr' ? 'Adresse' : 'Address', `${state.destination.address} ${state.destination.postalCode} ${state.destination.city}`.trim());
    row(t('floor'), state.destination.floor);
    row(t('elevator'), t(`elevator${state.destination.elevator.charAt(0).toUpperCase() + state.destination.elevator.slice(1)}`));
    row(t('furnitureLift'), state.destination.furnitureLift ? t('yes') : t('no'));
    if (state.destination.accessNotes) row(t('accessNotes'), state.destination.accessNotes);
    divider();

    sectionTitle(lang === 'fr' ? 'Inventaire par pièce' : 'Inventory by room');
    state.rooms.forEach(room => {
      checkY(12);
      doc.setFillColor(...BLACK);
      doc.roundedRect(12, y, W - 24, 7, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${room.name}  —  ${getRoomVolume(room).toFixed(2)} m³`, 16, y + 4.8);
      y += 10;

      const items = (room.items || []).filter(i => i.qty > 0);
      if (items.length === 0) {
        doc.setTextColor(...GRAY); doc.setFontSize(8); doc.setFont('helvetica', 'italic');
        doc.text(t('noItems'), 20, y); y += 5;
      } else {
        items.forEach(item => {
          checkY(6);
          doc.setTextColor(...BLACK); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
          doc.text(`  ${item.name} — ${item.variantLabel}`, 16, y);
          doc.setFont('helvetica', 'bold');
          doc.text(`×${item.qty}  ${(item.volume_m3 * item.qty).toFixed(3)} m³`, W - 16, y, { align: 'right' });
          const tags = [];
          if (item.fragile) tags.push('Fragile');
          if (item.heavy) tags.push(lang === 'fr' ? 'Lourd' : 'Heavy');
          if (item.requires_disassembly) tags.push(lang === 'fr' ? 'Démontage' : 'Disassembly');
          if (tags.length) {
            doc.setFont('helvetica', 'italic'); doc.setTextColor(...GRAY); doc.setFontSize(7);
            doc.text(`    [${tags.join(', ')}]`, 16, y + 4);
            y += 9;
          } else { y += 6; }
        });
      }
      y += 3;
    });
    divider();

    sectionTitle(t('boxesSummary'));
    const bDone = getTotalBoxes(state.boxesDone);
    const bRem = getTotalBoxes(state.boxesRemaining);
    row(t('boxesPacked'), `${bDone} ${lang === 'fr' ? 'cartons' : 'boxes'} (${getBoxVolume(state.boxesDone).toFixed(2)} m³)`);
    row(t('boxesEstimated'), `${bRem} ${lang === 'fr' ? 'cartons' : 'boxes'} (${getBoxVolume(state.boxesRemaining).toFixed(2)} m³)`);
    divider();

    const vol = getTotalVolume();
    sectionTitle(lang === 'fr' ? 'Recommandations' : 'Recommendations');
    doc.setFillColor(43, 107, 230);
    doc.roundedRect(12, y, W - 24, 16, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`${vol.toFixed(1)} m³`, W / 2, y + 7, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(t('totalVolumeLabel'), W / 2, y + 12, { align: 'center' });
    y += 22;
    row(t('recommendedTruck'), getRecommendedTruck(vol));
    row(t('recommendedTeam'), getRecommendedTeam(vol));
    getEquipment().forEach(e => {
      checkY(6);
      doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...BLACK);
      doc.text(`  • ${e}`, 20, y); y += 5.5;
    });
    divider();

    checkY(40);
    sectionTitle(lang === 'fr' ? 'Signatures' : 'Signatures');
    const sigY = y;
    doc.setDrawColor(...GRAY); doc.setLineWidth(0.5);
    doc.line(16, sigY + 20, 85, sigY + 20);
    doc.line(120, sigY + 20, W - 16, sigY + 20);
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
    doc.text(t('clientSignature'), 50, sigY + 25, { align: 'center' });
    doc.text(t('surveyorSignature'), W / 2 + 37, sigY + 25, { align: 'center' });

    doc.save(`MoveUp_${state.client.name || 'client'}_${state.client.visitDate || 'visite'}.pdf`);
    setPdfSuccess(true);
  };

  const vol = getTotalVolume();

  return (
    <>
      <div className="section-header">
        <div className="section-title">{t('surveyReport')}</div>
        <div className="section-subtitle">{lang === 'fr' ? 'Générez et téléchargez le rapport de visite' : 'Generate and download the survey report'}</div>
      </div>
      <div className="card">
        <div className="card-title">{lang === 'fr' ? 'Récapitulatif' : 'Summary'}</div>
        <ul className="item-list-summary">
          <li><span>{t('clientName')}</span><strong>{state.client.name || '—'}</strong></li>
          <li><span>{t('visitDate')}</span><strong>{state.client.visitDate || '—'}</strong></li>
          <li><span>{lang === 'fr' ? 'Volume total' : 'Total volume'}</span><strong>{vol.toFixed(1)} m³</strong></li>
          <li><span>{t('recommendedTruck')}</span><strong>{getRecommendedTruck(vol)}</strong></li>
          <li><span>{t('recommendedTeam')}</span><strong>{getRecommendedTeam(vol)}</strong></li>
        </ul>
      </div>
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
