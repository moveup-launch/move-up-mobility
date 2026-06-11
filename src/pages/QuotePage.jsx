import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

// PDF translation strings
const QT = {
  en: {
    title: 'QUOTATION',
    ref: 'Reference', date: 'Date', validUntil: 'Valid Until',
    preparedFor: 'PREPARED FOR',
    shipment: 'SHIPMENT DETAILS',
    origin: 'Origin', destination: 'Destination',
    loadingPort: 'Port of Loading', destinationPort: 'Port of Destination',
    volume: 'Volume (CBM)', mode: 'Transport Mode',
    carrier: 'Carrier', transit: 'Transit Time',
    costs: 'COST BREAKDOWN',
    desc: 'Description', amount: 'Amount', currency: 'EUR',
    total: 'TOTAL AMOUNT',
    included: 'SERVICES INCLUDED', exclusions: 'EXCLUSIONS',
    optional: 'OPTIONAL SERVICES',
    notes: 'TERMS & CONDITIONS',
    signCommercial: 'Commercial Signature', signClient: 'Client Signature',
    footer: 'Generated with Move Up Mobility',
  },
  fr: {
    title: 'DEVIS',
    ref: 'Référence', date: 'Date', validUntil: 'Valable jusqu\'au',
    preparedFor: 'DESTINATAIRE',
    shipment: 'DÉTAILS DE L\'EXPÉDITION',
    origin: 'Origine', destination: 'Destination',
    loadingPort: 'Port de chargement', destinationPort: 'Port de destination',
    volume: 'Volume (CBM)', mode: 'Mode de transport',
    carrier: 'Transporteur', transit: 'Transit estimé',
    costs: 'DÉTAIL DES COÛTS',
    desc: 'Prestation', amount: 'Montant', currency: 'EUR',
    total: 'TOTAL',
    included: 'PRESTATIONS INCLUSES', exclusions: 'EXCLUSIONS',
    optional: 'SERVICES OPTIONNELS',
    notes: 'CONDITIONS PARTICULIÈRES',
    signCommercial: 'Signature commercial', signClient: 'Signature client',
    footer: 'Généré avec Move Up Mobility',
  },
};

const MODE_LABELS = {
  sea:     { en: 'Sea Freight', fr: 'Maritime' },
  air:     { en: 'Air Freight', fr: 'Aérien' },
  road:    { en: 'International Road', fr: 'Routier international' },
  storage: { en: 'Storage', fr: 'Stockage' },
  local:   { en: 'Local / National', fr: 'Local / National' },
};

const DEFAULT_COST_LINES = {
  sea:     ['Origin Services (Packing, Loading & Crating)', 'Haulage to Terminal', 'THC / Export Clearance / Documentation', 'Ocean Freight & Surcharges'],
  air:     ['Airfreight Packing & Collection', 'Export Handling & Documentation', 'Airfreight'],
  road:    ['Packing & Loading', 'Transportation', 'Delivery & Unpacking'],
  storage: ['Collection & Packing', 'Storage (per month)', 'Delivery'],
};

const DEFAULT_OPTIONAL = [
  'Assurance ad valorem (2% valeur déclarée)',
  'Caisse bois TV / objets fragiles',
  'Garde-meuble',
];

const DEFAULT_INCLUDED = [
  'Emballage professionnel export',
  'Chargement et calage conteneur',
  'Fret maritime / aérien',
  'Formalités douanières export',
  'Documentation standard',
  'Remontage meubles démontés',
  'Évacuation déchets emballages',
];

const DEFAULT_EXCLUSIONS = [
  'DTHC (Destination Terminal Handling)',
  'Livraison étage difficile accès',
  'Services navette / grue / permis stationnement',
  'Objets spéciaux (piano, coffre-fort)',
  'Droits et taxes douanières',
  'Frais de surestarie',
  'Frais inspection douanière',
  'Stockage transit',
  'Stockage entrepôt',
];

function safe(str) {
  if (!str) return '';
  return String(str)
    .replace(/[—–]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x00-\xFF]/g, '')
    .trim();
}

function hexToRgb(hex) {
  const h = (hex || '#2B6BE6').replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) || 0;
  const g = parseInt(h.slice(2, 4), 16) || 0;
  const b = parseInt(h.slice(4, 6), 16) || 0;
  return [r, g, b];
}

function loadImgAsDataUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      c.getContext('2d').drawImage(img, 0, 0);
      resolve({ dataUrl: c.toDataURL('image/png'), w: img.width, h: img.height });
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function QuotePage() {
  const { lang, profile, user, quoteVisit, editingQuoteId, setViewMode } = useApp();
  const isFr = lang === 'fr';

  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus]   = useState('idle');

  // Quote fields
  const [quoteId, setQuoteId]           = useState(null);
  const [visitId, setVisitId]           = useState(null);
  const [quoteLang, setQuoteLang]       = useState('en');
  const [reference, setReference]       = useState('');
  const [status, setStatus]             = useState('draft');
  const [validityDate, setValidityDate] = useState('');
  const [clientName, setClientName]     = useState('');
  const [clientEmail, setClientEmail]   = useState('');
  const [clientPhone, setClientPhone]   = useState('');
  const [origin, setOrigin]             = useState('');
  const [destination, setDestination]   = useState('');
  const [loadingPort, setLoadingPort]   = useState('');
  const [destPort, setDestPort]         = useState('');
  const [volumeCBM, setVolumeCBM]       = useState('');
  const [transportMode, setTransportMode] = useState('sea');
  const [carrier, setCarrier]           = useState('');
  const [transitTime, setTransitTime]   = useState('');
  const [costLines, setCostLines]       = useState([]);
  const [optionalServices, setOptionalServices] = useState([]);
  const [servicesIncluded, setServicesIncluded] = useState([]);
  const [exclusions, setExclusions]     = useState([]);
  const [notes, setNotes]               = useState('');

  useEffect(() => { init(); }, []);

  const buildRef = async () => {
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id)
      .gte('created_at', `${year}-01-01`);
    return `QT-${year}-${String((count || 0) + 1).padStart(3, '0')}`;
  };

  const initCostLines = (mode) =>
    (DEFAULT_COST_LINES[mode] || DEFAULT_COST_LINES.sea).map((d, i) => ({
      id: `cl_${i}`, description: d, amount: '',
    }));

  const init = async () => {
    const ref = await buildRef();

    if (editingQuoteId) {
      const { data } = await supabase.from('quotes').select('*').eq('id', editingQuoteId).single();
      if (data) {
        setQuoteId(data.id);
        setReference(data.reference || ref);
        setStatus(data.status || 'draft');
        setQuoteLang(data.language || 'en');
        setValidityDate(data.validity_date || '');
        setVisitId(data.visit_id);
        setClientName(data.client_name || '');
        setClientEmail(data.client_email || '');
        setClientPhone(data.client_phone || '');
        setOrigin(data.origin || '');
        setDestination(data.destination || '');
        setLoadingPort(data.loading_port || '');
        setDestPort(data.destination_port || '');
        setVolumeCBM(String(data.volume_cbm || ''));
        setTransportMode(data.transport_mode || 'sea');
        setCarrier(data.carrier || '');
        setTransitTime(data.transit_time || '');
        setCostLines(data.cost_lines?.length ? data.cost_lines : initCostLines(data.transport_mode || 'sea'));
        setOptionalServices(data.optional_services?.length ? data.optional_services : buildDefaultOptional());
        setServicesIncluded(data.services_included?.length ? data.services_included : buildDefaultIncluded());
        setExclusions(data.exclusions?.length ? data.exclusions : buildDefaultExclusions());
        setNotes(data.notes || '');
        setLoading(false);
        return;
      }
    }

    // New quote — pre-fill from visit if available
    setReference(ref);
    const vd = new Date();
    vd.setDate(vd.getDate() + 30);
    setValidityDate(vd.toISOString().split('T')[0]);

    const visit = quoteVisit;
    if (visit) {
      setVisitId(visit.id);
      setClientName(visit.client_name || '');
      setClientEmail(visit.client_email || visit.client_data?.email || '');
      setClientPhone(visit.client_phone || visit.client_data?.phone || '');

      const od = visit.origin_data;
      const dd = visit.destination_data;
      setOrigin([od?.address, od?.city].filter(Boolean).join(', '));
      setDestination(dd?.noFixedAddress
        ? (dd?.city || '')
        : [dd?.address, dd?.city].filter(Boolean).join(', '));
      setVolumeCBM(String(visit.total_volume || ''));

      // Detect primary transport mode
      const segs = (visit.client_data?.moveSegments || []).filter(s => s.type);
      let mode = 'sea';
      if (segs.length > 0) {
        mode = segs.reduce((a, b) => ((b.volume || 0) > (a.volume || 0) ? b : a)).type || 'sea';
      } else {
        const mc = {};
        (visit.rooms_data || []).forEach(r =>
          (r.items || []).filter(i => i.transportMode).forEach(i => {
            mc[i.transportMode] = (mc[i.transportMode] || 0) + (i.qty || 1);
          })
        );
        if (Object.keys(mc).length > 0) {
          mode = Object.entries(mc).sort((a, b) => b[1] - a[1])[0][0];
        }
      }
      if (!['sea', 'air', 'road', 'storage'].includes(mode)) mode = 'sea';
      setTransportMode(mode);
      setCostLines(initCostLines(mode));
    } else {
      setCostLines(initCostLines('sea'));
    }

    setOptionalServices(buildDefaultOptional());
    setServicesIncluded(buildDefaultIncluded());
    setExclusions(buildDefaultExclusions());
    setLoading(false);
  };

  const buildDefaultOptional = () =>
    DEFAULT_OPTIONAL.map((d, i) => ({ id: `os_${i}`, desc: d, amount: '', included: false }));

  const buildDefaultIncluded = () =>
    DEFAULT_INCLUDED.map((l, i) => ({ id: `si_${i}`, label: l, checked: i < 5 }));

  const buildDefaultExclusions = () =>
    DEFAULT_EXCLUSIONS.map((l, i) => ({ id: `ex_${i}`, label: l, checked: i < 7 }));

  const totalCost = costLines.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0);
  const totalOptIncl = optionalServices
    .filter(s => s.included)
    .reduce((s, o) => s + (parseFloat(o.amount) || 0), 0);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      visit_id: visitId || null,
      user_id: user?.id,
      reference,
      status,
      validity_date: validityDate,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      origin,
      destination,
      loading_port: loadingPort,
      destination_port: destPort,
      volume_cbm: parseFloat(volumeCBM) || 0,
      transport_mode: transportMode,
      carrier,
      transit_time: transitTime,
      cost_lines: costLines,
      optional_services: optionalServices,
      services_included: servicesIncluded,
      exclusions,
      notes,
      total_amount: totalCost + totalOptIncl,
      currency: 'EUR',
      language: quoteLang,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (quoteId) {
      ({ error } = await supabase.from('quotes').update(payload).eq('id', quoteId));
    } else {
      const { data, error: e } = await supabase.from('quotes').insert(payload).select().single();
      error = e;
      if (data) setQuoteId(data.id);
    }

    setSaving(false);
    setSaveStatus(error ? 'error' : 'saved');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const buildPDF = async () => {
    const qt = QT[quoteLang] || QT.en;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210;
    const MARGIN = 14;
    const CW = W - MARGIN * 2;
    let y = 0;

    const BRAND = hexToRgb(profile?.company_color || '#2B6BE6');
    const DARK  = [20, 20, 18];
    const GRAY  = [110, 108, 102];
    const LGRAY = [240, 238, 234];

    let currentPage = 1;
    const addPage = () => { doc.addPage(); y = 20; currentPage++; };
    const checkY = (need = 8) => { if (y + need > 272) addPage(); };

    const sectionBar = (title, color) => {
      checkY(12);
      const col = color || BRAND;
      doc.setFillColor(...col);
      doc.roundedRect(MARGIN, y, CW, 8, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8.5); doc.setFont('helvetica', 'bold');
      doc.text(safe(title), MARGIN + 4, y + 5.5);
      y += 12;
    };

    const labelValue = (label, value, labelX = MARGIN + 2, valueX = 95) => {
      checkY(6.5);
      doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
      doc.setTextColor(...GRAY);
      doc.text(safe(label), labelX, y);
      doc.setTextColor(...DARK); doc.setFont('helvetica', 'bold');
      if (safe(value)) {
        const lines = doc.splitTextToSize(safe(value), W - valueX - MARGIN);
        doc.text(lines, valueX, y);
      }
      y += 6.5;
    };

    // ── Logo + header ──────────────────────────────────────────────
    let logoInfo = null;
    if (profile?.company_logo_url) {
      try { logoInfo = await loadImgAsDataUrl(profile.company_logo_url); } catch {}
    }

    const headerH = 44;
    doc.setFillColor(...BRAND);
    doc.rect(0, 0, W, headerH, 'F');

    // Company info (left)
    let textX = MARGIN;
    if (logoInfo) {
      const maxH = 22; const ratio = logoInfo.w / logoInfo.h;
      const lh = Math.min(maxH, 22); const lw = Math.min(lh * ratio, 48);
      const ly = (headerH - lh) / 2;
      try { doc.addImage(logoInfo.dataUrl, 'PNG', MARGIN, ly, lw, lh); textX = MARGIN + lw + 6; } catch {}
    }

    doc.setTextColor(255, 255, 255);
    if (profile?.company_name) {
      doc.setFontSize(15); doc.setFont('helvetica', 'bold');
      doc.text(safe(profile.company_name), textX, 14);
    }
    const addr = [profile?.company_address, profile?.company_phone, profile?.company_email].filter(Boolean).join('  |  ');
    if (addr) {
      doc.setFontSize(7); doc.setFont('helvetica', 'normal');
      doc.setTextColor(210, 210, 210);
      doc.text(safe(addr), textX, 22);
    }
    if (profile?.company_website) {
      doc.setFontSize(6.5); doc.setTextColor(180, 180, 180);
      doc.text(safe(profile.company_website), textX, 29);
    }

    // Quote title + ref (right)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20); doc.setFont('helvetica', 'bold');
    doc.text(qt.title, W - MARGIN, 16, { align: 'right' });

    doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
    doc.setTextColor(215, 215, 215);
    const locale = quoteLang === 'fr' ? 'fr-FR' : 'en-GB';
    const nowStr = new Date().toLocaleDateString(locale);
    const validStr = validityDate
      ? new Date(validityDate + 'T12:00:00').toLocaleDateString(locale)
      : '-';
    doc.text(safe(`${qt.ref} : ${reference}`), W - MARGIN, 26, { align: 'right' });
    doc.text(safe(`${qt.date} : ${nowStr}`), W - MARGIN, 33, { align: 'right' });
    doc.text(safe(`${qt.validUntil} : ${validStr}`), W - MARGIN, 40, { align: 'right' });

    y = headerH + 10;

    // ── Client ─────────────────────────────────────────────────────
    sectionBar(qt.preparedFor);
    if (clientName)  labelValue(quoteLang === 'fr' ? 'Nom' : 'Name', clientName);
    if (clientEmail) labelValue('Email', clientEmail);
    if (clientPhone) labelValue(quoteLang === 'fr' ? 'Téléphone' : 'Phone', clientPhone);
    y += 4;

    // ── Shipment details ───────────────────────────────────────────
    sectionBar(qt.shipment);
    if (origin)      labelValue(qt.origin, origin);
    if (destination) labelValue(qt.destination, destination);
    if (loadingPort) labelValue(qt.loadingPort, loadingPort);
    if (destPort)    labelValue(qt.destinationPort, destPort);
    if (volumeCBM)   labelValue(qt.volume, `${volumeCBM} CBM`);
    labelValue(qt.mode, MODE_LABELS[transportMode]?.[quoteLang] || transportMode);
    if (carrier)     labelValue(qt.carrier, carrier);
    if (transitTime) labelValue(qt.transit, transitTime);
    y += 4;

    // ── Cost table ─────────────────────────────────────────────────
    checkY(20);
    sectionBar(qt.costs);

    // Table header row
    doc.setFillColor(...LGRAY);
    doc.rect(MARGIN, y - 1, CW, 7.5, 'F');
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GRAY);
    doc.text(safe(qt.desc), MARGIN + 3, y + 4);
    doc.text(safe(`${qt.amount} (${qt.currency})`), W - MARGIN - 2, y + 4, { align: 'right' });
    y += 9;

    const visibleLines = costLines.filter(l => l.description);
    visibleLines.forEach((line, i) => {
      checkY(7);
      if (i % 2 === 0) {
        doc.setFillColor(250, 249, 246);
        doc.rect(MARGIN, y - 1, CW, 7, 'F');
      }
      doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK);
      const descLines = doc.splitTextToSize(safe(line.description), CW - 40);
      doc.text(descLines[0] || '', MARGIN + 3, y + 3.5);
      doc.setFont('helvetica', 'bold');
      const amt = parseFloat(line.amount) || 0;
      doc.text(amt > 0 ? safe(`${amt.toFixed(2)}`) : '—', W - MARGIN - 2, y + 3.5, { align: 'right' });
      y += 7;
    });

    // Included optional services as additional lines
    optionalServices.filter(s => s.included && s.desc).forEach((s, i) => {
      checkY(7);
      doc.setFontSize(8.5); doc.setFont('helvetica', 'italic'); doc.setTextColor(...GRAY);
      doc.text(safe(`+ ${s.desc}`), MARGIN + 3, y + 3.5);
      const amt = parseFloat(s.amount) || 0;
      doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK);
      doc.text(amt > 0 ? safe(`${amt.toFixed(2)}`) : '—', W - MARGIN - 2, y + 3.5, { align: 'right' });
      y += 7;
    });

    // Total bar
    checkY(14);
    y += 2;
    doc.setFillColor(...BRAND);
    doc.roundedRect(MARGIN, y, CW, 11, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.text(safe(qt.total), MARGIN + 4, y + 7.5);
    doc.text(safe(`${(totalCost + totalOptIncl).toFixed(2)} ${qt.currency}`), W - MARGIN - 2, y + 7.5, { align: 'right' });
    y += 16;

    // ── Services included + Exclusions (2 columns) ─────────────────
    const inclList = servicesIncluded.filter(s => s.checked);
    const exclList = exclusions.filter(e => e.checked);
    if (inclList.length > 0 || exclList.length > 0) {
      const halfW = CW / 2 - 3;
      const maxRows = Math.max(inclList.length, exclList.length);
      checkY(14 + maxRows * 5.5 + 8);

      const leftX  = MARGIN;
      const rightX = MARGIN + halfW + 6;

      // Headers
      doc.setFillColor(...BRAND);
      doc.roundedRect(leftX, y, halfW, 7.5, 1.5, 1.5, 'F');
      doc.setFillColor(185, 50, 50);
      doc.roundedRect(rightX, y, halfW, 7.5, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8); doc.setFont('helvetica', 'bold');
      doc.text(safe(qt.included), leftX + 4, y + 5);
      doc.text(safe(qt.exclusions), rightX + 4, y + 5);
      y += 11;

      const rowH = 5.2;
      inclList.forEach((s, i) => {
        const ry = y + i * rowH;
        doc.setFontSize(7.8); doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 140, 60);
        doc.text(String.fromCharCode(0xF6), leftX + 2, ry + 4);
        doc.setTextColor(...DARK);
        const txt = doc.splitTextToSize(safe(s.label), halfW - 10);
        doc.text(txt[0] || '', leftX + 7, ry + 4);
      });
      exclList.forEach((e, i) => {
        const ry = y + i * rowH;
        doc.setFontSize(7.8); doc.setFont('helvetica', 'normal');
        doc.setTextColor(185, 50, 50);
        doc.text('x', rightX + 2, ry + 4);
        doc.setTextColor(...DARK);
        const txt = doc.splitTextToSize(safe(e.label), halfW - 10);
        doc.text(txt[0] || '', rightX + 7, ry + 4);
      });
      y += maxRows * rowH + 10;
    }

    // ── Optional services (full list) ──────────────────────────────
    const allOpt = optionalServices.filter(s => s.desc);
    if (allOpt.length > 0) {
      checkY(14 + allOpt.length * 6.5);
      sectionBar(qt.optional, GRAY);
      allOpt.forEach(s => {
        checkY(7);
        doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK);
        const tag = s.included
          ? (quoteLang === 'fr' ? '[Inclus]' : '[Included]')
          : (quoteLang === 'fr' ? '[Sur demande]' : '[On request]');
        doc.text(safe(`${s.desc}  ${tag}`), MARGIN + 3, y + 3.5);
        const amt = parseFloat(s.amount) || 0;
        doc.setFont('helvetica', 'bold');
        doc.text(amt > 0 ? safe(`${amt.toFixed(2)} ${qt.currency}`) : '—', W - MARGIN - 2, y + 3.5, { align: 'right' });
        y += 7;
      });
      y += 4;
    }

    // ── Notes ──────────────────────────────────────────────────────
    if (notes) {
      const noteLines = doc.splitTextToSize(safe(notes), CW - 8);
      checkY(14 + noteLines.length * 5);
      sectionBar(qt.notes, GRAY);
      noteLines.forEach(line => {
        checkY(5);
        doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK);
        doc.text(line, MARGIN + 3, y);
        y += 5;
      });
      y += 8;
    }

    // ── Signatures ─────────────────────────────────────────────────
    checkY(38);
    y += 4;
    const sigY = y;
    doc.setDrawColor(...GRAY); doc.setLineWidth(0.4);
    doc.line(MARGIN, sigY + 20, 85, sigY + 20);
    doc.line(120, sigY + 20, W - MARGIN, sigY + 20);
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
    const midLeft  = (MARGIN + 85) / 2;
    const midRight = (120 + W - MARGIN) / 2;
    doc.text(safe(qt.signCommercial), midLeft, sigY + 26, { align: 'center' });
    doc.text(safe(qt.signClient), midRight, sigY + 26, { align: 'center' });

    // ── Footer on every page ───────────────────────────────────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFontSize(6.5); doc.setFont('helvetica', 'normal');
      doc.setTextColor(180, 178, 172);
      doc.text(safe(`${qt.footer} — moveupapp.com`), W / 2, 294, { align: 'center' });
      if (profile?.company_siret) {
        doc.text(safe(`SIRET : ${profile.company_siret}`), MARGIN, 294);
      }
      doc.text(safe(`${p} / ${pageCount}`), W - MARGIN, 294, { align: 'right' });
    }

    return doc;
  };

  const handlePDF = async () => {
    const doc = await buildPDF();
    const fname = safe(`Devis_${reference}_${clientName || 'client'}`).replace(/\s+/g, '_');
    doc.save(`${fname}.pdf`);
  };

  const handleSendEmail = async () => {
    if (!clientEmail) return;
    setSendingEmail(true);
    setEmailStatus('sending');
    try {
      const doc = await buildPDF();
      const b64 = doc.output('datauristring').split(',')[1];
      const key  = import.meta.env.VITE_RESEND_API_KEY;
      const from = import.meta.env.VITE_RESEND_FROM || 'onboarding@resend.dev';
      const compName = profile?.company_name || 'Move Up Mobility';
      const commercial = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || compName;
      const subj = quoteLang === 'fr'
        ? `Devis déménagement — Réf. ${reference}`
        : `Moving quotation — Ref. ${reference}`;
      const html = quoteLang === 'fr' ? `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#333">
  <div style="background:#0F0F0E;padding:18px 20px;border-radius:8px;margin-bottom:20px">
    <h2 style="color:white;margin:0;font-size:18px">📦 ${safe(compName)}</h2>
  </div>
  <p>Bonjour <strong>${safe(clientName)}</strong>,</p>
  <p>Veuillez trouver ci-joint votre devis de déménagement.</p>
  <table style="background:#EEF4FF;border-left:4px solid #2B6BE6;padding:14px 18px;border-radius:0 8px 8px 0;width:100%;border-collapse:collapse;margin:16px 0">
    <tr><td style="color:#2B6BE6;font-weight:700;padding:2px 0">Référence</td><td>${reference}</td></tr>
    <tr><td style="color:#555;padding:2px 0">Départ</td><td>${safe(origin)}</td></tr>
    <tr><td style="color:#555;padding:2px 0">Destination</td><td>${safe(destination)}</td></tr>
    <tr><td style="font-weight:700;padding:2px 0">Total HT</td><td style="font-weight:700">${(totalCost + totalOptIncl).toFixed(2)} EUR</td></tr>
    <tr><td style="color:#555;padding:2px 0">Validité</td><td>${validityDate}</td></tr>
  </table>
  <p>N'hésitez pas à nous contacter pour toute question.</p>
  <p>Cordialement,<br><strong>${safe(commercial)}</strong></p>
</div>` : `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#333">
  <div style="background:#0F0F0E;padding:18px 20px;border-radius:8px;margin-bottom:20px">
    <h2 style="color:white;margin:0;font-size:18px">📦 ${safe(compName)}</h2>
  </div>
  <p>Dear <strong>${safe(clientName)}</strong>,</p>
  <p>Please find attached your moving quotation.</p>
  <table style="background:#EEF4FF;border-left:4px solid #2B6BE6;padding:14px 18px;border-radius:0 8px 8px 0;width:100%;border-collapse:collapse;margin:16px 0">
    <tr><td style="color:#2B6BE6;font-weight:700;padding:2px 0">Reference</td><td>${reference}</td></tr>
    <tr><td style="color:#555;padding:2px 0">From</td><td>${safe(origin)}</td></tr>
    <tr><td style="color:#555;padding:2px 0">To</td><td>${safe(destination)}</td></tr>
    <tr><td style="font-weight:700;padding:2px 0">Total</td><td style="font-weight:700">${(totalCost + totalOptIncl).toFixed(2)} EUR</td></tr>
    <tr><td style="color:#555;padding:2px 0">Valid until</td><td>${validityDate}</td></tr>
  </table>
  <p>Please don't hesitate to contact us if you have any questions.</p>
  <p>Best regards,<br><strong>${safe(commercial)}</strong></p>
</div>`;

      if (!key || key.length < 10) {
        // Fallback to mailto
        window.open(`mailto:${clientEmail}?subject=${encodeURIComponent(subj)}`);
        setEmailStatus('sent');
      } else {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from, to: clientEmail, subject: subj, html,
            attachments: [{ filename: `Devis_${reference}.pdf`, content: b64 }],
          }),
        });
        if (res.ok) {
          setEmailStatus('sent');
          if (quoteId) {
            await supabase.from('quotes').update({ status: 'sent', updated_at: new Date().toISOString() }).eq('id', quoteId);
            setStatus('sent');
          }
        } else {
          setEmailStatus('error');
        }
      }
    } catch {
      setEmailStatus('error');
    }
    setSendingEmail(false);
    setTimeout(() => setEmailStatus('idle'), 4000);
  };

  const MODES = [
    { val: 'sea',     icon: '🚢', labelFr: 'Maritime',     labelEn: 'Sea' },
    { val: 'air',     icon: '✈️',  labelFr: 'Aérien',       labelEn: 'Air' },
    { val: 'road',    icon: '🚛', labelFr: 'Route',         labelEn: 'Road' },
    { val: 'storage', icon: '📦', labelFr: 'Stockage',      labelEn: 'Storage' },
  ];

  const STATUS_OPTS = [
    { val: 'draft',    labelFr: 'Brouillon',  labelEn: 'Draft' },
    { val: 'sent',     labelFr: 'Envoyé',     labelEn: 'Sent' },
    { val: 'accepted', labelFr: 'Accepté',    labelEn: 'Accepted' },
    { val: 'refused',  labelFr: 'Refusé',     labelEn: 'Refused' },
  ];

  if (loading) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text3)' }}>
        ⏳ {isFr ? 'Chargement…' : 'Loading…'}
      </div>
    );
  }

  const inputStyle = {
    width: '100%', padding: '8px 10px', borderRadius: '8px',
    border: '1px solid var(--border)', fontSize: '13px',
    background: 'var(--bg)', color: 'var(--text)',
    boxSizing: 'border-box',
  };

  return (
    <>
      {/* Header */}
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <button
            onClick={() => setViewMode('quotes')}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: 'var(--text2)', fontSize: '13px', flexShrink: 0 }}
          >
            ← {isFr ? 'Retour' : 'Back'}
          </button>
          <div>
            <div className="section-title">📋 {reference || (isFr ? 'Nouveau devis' : 'New quote')}</div>
            <div className="section-subtitle">{isFr ? 'Édition du devis' : 'Quote editor'}</div>
          </div>
        </div>
      </div>

      {/* Lang + Status */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['fr', 'en'].map(l => (
            <button
              key={l}
              onClick={() => setQuoteLang(l)}
              style={{
                padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
                fontWeight: '700', border: '1px solid',
                background: quoteLang === l ? 'var(--accent)' : 'var(--surface2)',
                color: quoteLang === l ? 'white' : 'var(--text2)',
                borderColor: quoteLang === l ? 'var(--accent)' : 'var(--border)',
              }}
            >
              {l === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
            </button>
          ))}
        </div>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px', background: 'var(--bg)', color: 'var(--text)' }}
        >
          {STATUS_OPTS.map(o => <option key={o.val} value={o.val}>{isFr ? o.labelFr : o.labelEn}</option>)}
        </select>
        {totalCost > 0 && (
          <div style={{ marginLeft: 'auto', fontSize: '18px', fontWeight: '800', color: 'var(--accent)' }}>
            {(totalCost + totalOptIncl).toFixed(2)} €
          </div>
        )}
      </div>

      {/* A — Header */}
      <div className="card">
        <div className="card-title">📋 {isFr ? 'En-tête' : 'Header'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div className="field">
            <label>{isFr ? 'Référence' : 'Reference'}</label>
            <input style={inputStyle} value={reference} onChange={e => setReference(e.target.value)} />
          </div>
          <div className="field">
            <label>{isFr ? 'Valable jusqu\'au' : 'Valid until'}</label>
            <input type="date" style={inputStyle} value={validityDate} onChange={e => setValidityDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* B — Client */}
      <div className="card">
        <div className="card-title">👤 {isFr ? 'Client' : 'Client'}</div>
        <div className="field">
          <label>{isFr ? 'Nom complet' : 'Full name'}</label>
          <input style={inputStyle} value={clientName} onChange={e => setClientName(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div className="field">
            <label>Email</label>
            <input type="email" style={inputStyle} value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>{isFr ? 'Téléphone' : 'Phone'}</label>
            <input type="tel" style={inputStyle} value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
          </div>
        </div>
      </div>

      {/* C — Shipment */}
      <div className="card">
        <div className="card-title">🗺️ {isFr ? 'Expédition' : 'Shipment'}</div>
        <div className="field">
          <label>{isFr ? 'Origine' : 'Origin'}</label>
          <input style={inputStyle} value={origin} onChange={e => setOrigin(e.target.value)} />
        </div>
        <div className="field">
          <label>{isFr ? 'Destination' : 'Destination'}</label>
          <input style={inputStyle} value={destination} onChange={e => setDestination(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div className="field">
            <label>{isFr ? 'Port de chargement' : 'Loading port'}</label>
            <input style={inputStyle} value={loadingPort} onChange={e => setLoadingPort(e.target.value)} placeholder="Le Havre, Paris..." />
          </div>
          <div className="field">
            <label>{isFr ? 'Port de destination' : 'Destination port'}</label>
            <input style={inputStyle} value={destPort} onChange={e => setDestPort(e.target.value)} placeholder="Dubai, Singapore..." />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div className="field">
            <label>Volume CBM</label>
            <input type="number" step="0.1" style={inputStyle} value={volumeCBM} onChange={e => setVolumeCBM(e.target.value)} />
          </div>
          <div className="field">
            <label>{isFr ? 'Transit estimé' : 'Transit time'}</label>
            <input style={inputStyle} value={transitTime} onChange={e => setTransitTime(e.target.value)} placeholder="25-30 days" />
          </div>
        </div>
        <div className="field">
          <label>{isFr ? 'Mode de transport' : 'Transport mode'}</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {MODES.map(m => (
              <div
                key={m.val}
                className={`radio-option${transportMode === m.val ? ' selected' : ''}`}
                style={{ flex: '1 1 80px', padding: '10px 8px', justifyContent: 'center', cursor: 'pointer' }}
                onClick={() => {
                  setTransportMode(m.val);
                  setCostLines(initCostLines(m.val));
                }}
              >
                <span className="radio-icon">{m.icon}</span>
                <span className="radio-label" style={{ fontSize: '12px' }}>{isFr ? m.labelFr : m.labelEn}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="field">
          <label>{isFr ? 'Compagnie / Transporteur' : 'Carrier'}</label>
          <input style={inputStyle} value={carrier} onChange={e => setCarrier(e.target.value)} placeholder="CMA CGM, MSC, Air France..." />
        </div>
      </div>

      {/* D — Costs */}
      <div className="card">
        <div className="card-title">💰 {isFr ? 'Détail des coûts' : 'Cost breakdown'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 28px', gap: '6px', marginBottom: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '600', textTransform: 'uppercase', paddingLeft: '2px' }}>
            {isFr ? 'Prestation' : 'Description'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'right' }}>
            {isFr ? 'Montant (€)' : 'Amount (€)'}
          </div>
          <div />
        </div>
        {costLines.map(line => (
          <div key={line.id} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 28px', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
            <input
              value={line.description}
              onChange={e => setCostLines(ls => ls.map(l => l.id === line.id ? { ...l, description: e.target.value } : l))}
              placeholder={isFr ? 'Description…' : 'Description…'}
              style={inputStyle}
            />
            <input
              type="number" step="0.01" min="0"
              value={line.amount}
              onChange={e => setCostLines(ls => ls.map(l => l.id === line.id ? { ...l, amount: e.target.value } : l))}
              placeholder="0.00"
              style={{ ...inputStyle, textAlign: 'right' }}
            />
            <button
              onClick={() => setCostLines(ls => ls.filter(l => l.id !== line.id))}
              style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: 'none', borderRadius: '8px', width: '28px', height: '36px', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
            >
              −
            </button>
          </div>
        ))}
        <button
          className="btn btn-secondary"
          style={{ width: '100%', padding: '10px', borderStyle: 'dashed', fontSize: '13px', marginTop: '4px' }}
          onClick={() => setCostLines(ls => [...ls, { id: `cl_${Date.now()}`, description: '', amount: '' }])}
        >
          + {isFr ? 'Ajouter une ligne' : 'Add line'}
        </button>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '2px solid var(--accent)', marginTop: '8px' }}>
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent)' }}>
            Total : {totalCost.toFixed(2)} €
          </div>
        </div>
      </div>

      {/* E — Optional services */}
      <div className="card">
        <div className="card-title">⭐ {isFr ? 'Services optionnels' : 'Optional services'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 48px 28px', gap: '6px', marginBottom: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '600', textTransform: 'uppercase' }}>{isFr ? 'Service' : 'Service'}</div>
          <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'right' }}>{isFr ? 'Montant' : 'Amount'}</div>
          <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' }}>{isFr ? 'Inclus' : 'Incl.'}</div>
          <div />
        </div>
        {optionalServices.map(s => (
          <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 48px 28px', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
            <input
              value={s.desc}
              onChange={e => setOptionalServices(arr => arr.map(x => x.id === s.id ? { ...x, desc: e.target.value } : x))}
              placeholder={isFr ? 'Service…' : 'Service…'}
              style={{ ...inputStyle, fontSize: '12px' }}
            />
            <input
              type="number" step="0.01" min="0"
              value={s.amount}
              onChange={e => setOptionalServices(arr => arr.map(x => x.id === s.id ? { ...x, amount: e.target.value } : x))}
              placeholder="0.00"
              style={{ ...inputStyle, textAlign: 'right', fontSize: '12px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <input
                type="checkbox"
                checked={s.included}
                onChange={e => setOptionalServices(arr => arr.map(x => x.id === s.id ? { ...x, included: e.target.checked } : x))}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>
            <button
              onClick={() => setOptionalServices(arr => arr.filter(x => x.id !== s.id))}
              style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: 'none', borderRadius: '8px', width: '28px', height: '36px', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
            >
              −
            </button>
          </div>
        ))}
        <button
          className="btn btn-secondary"
          style={{ width: '100%', padding: '10px', borderStyle: 'dashed', fontSize: '13px', marginTop: '4px' }}
          onClick={() => setOptionalServices(arr => [...arr, { id: `os_${Date.now()}`, desc: '', amount: '', included: false }])}
        >
          + {isFr ? 'Ajouter' : 'Add'}
        </button>
      </div>

      {/* F — Services inclus */}
      <div className="card">
        <div className="card-title">✅ {isFr ? 'Prestations incluses' : 'Included services'}</div>
        {servicesIncluded.map(s => (
          <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
            <input
              type="checkbox"
              checked={s.checked}
              onChange={e => setServicesIncluded(arr => arr.map(x => x.id === s.id ? { ...x, checked: e.target.checked } : x))}
              style={{ flexShrink: 0, width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <input
              value={s.label}
              onChange={e => setServicesIncluded(arr => arr.map(x => x.id === s.id ? { ...x, label: e.target.value } : x))}
              style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '13px', color: 'var(--text)', padding: 0, outline: 'none' }}
            />
          </label>
        ))}
        <button
          className="btn btn-secondary"
          style={{ width: '100%', padding: '8px', borderStyle: 'dashed', fontSize: '12px', marginTop: '8px' }}
          onClick={() => setServicesIncluded(arr => [...arr, { id: `si_${Date.now()}`, label: '', checked: true }])}
        >
          + {isFr ? 'Ajouter' : 'Add'}
        </button>
      </div>

      {/* G — Exclusions */}
      <div className="card">
        <div className="card-title">❌ {isFr ? 'Exclusions' : 'Exclusions'}</div>
        {exclusions.map(e => (
          <label key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
            <input
              type="checkbox"
              checked={e.checked}
              onChange={ev => setExclusions(arr => arr.map(x => x.id === e.id ? { ...x, checked: ev.target.checked } : x))}
              style={{ flexShrink: 0, width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <input
              value={e.label}
              onChange={ev => setExclusions(arr => arr.map(x => x.id === e.id ? { ...x, label: ev.target.value } : x))}
              style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '13px', color: 'var(--text)', padding: 0, outline: 'none' }}
            />
          </label>
        ))}
        <button
          className="btn btn-secondary"
          style={{ width: '100%', padding: '8px', borderStyle: 'dashed', fontSize: '12px', marginTop: '8px' }}
          onClick={() => setExclusions(arr => [...arr, { id: `ex_${Date.now()}`, label: '', checked: true }])}
        >
          + {isFr ? 'Ajouter' : 'Add'}
        </button>
      </div>

      {/* H — Notes */}
      <div className="card">
        <div className="card-title">📝 {isFr ? 'Notes et conditions' : 'Notes & conditions'}</div>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={4}
          placeholder={isFr ? 'Conditions particulières, remarques…' : 'Special conditions, remarks…'}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* I — Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', marginBottom: '32px' }}>
        <button
          className={`save-visit-btn${saveStatus === 'error' ? ' error' : ''}`}
          onClick={handleSave}
          disabled={saving}
          style={{ width: '100%' }}
        >
          {saving
            ? '⏳ …'
            : saveStatus === 'saved'
              ? `✅ ${isFr ? 'Sauvegardé !' : 'Saved!'}`
              : saveStatus === 'error'
                ? (isFr ? '❌ Erreur' : '❌ Error')
                : `💾 ${isFr ? 'Sauvegarder le devis' : 'Save quote'}`}
        </button>
        <button
          className="pdf-btn"
          onClick={handlePDF}
          style={{ width: '100%' }}
        >
          📄 {isFr ? 'Générer PDF du devis' : 'Generate PDF quote'}
        </button>
        <button
          onClick={handleSendEmail}
          disabled={!clientEmail || sendingEmail}
          style={{
            width: '100%', padding: '14px', borderRadius: '10px',
            border: '2px solid var(--accent)', background: 'var(--accent-light)',
            color: 'var(--accent)', fontWeight: '700', fontSize: '14px',
            cursor: clientEmail ? 'pointer' : 'not-allowed',
            opacity: clientEmail ? 1 : 0.5,
          }}
        >
          {sendingEmail
            ? '⏳ …'
            : emailStatus === 'sent'
              ? `✅ ${isFr ? 'Email envoyé !' : 'Email sent!'}`
              : emailStatus === 'error'
                ? `❌ ${isFr ? 'Erreur envoi' : 'Send error'}`
                : `📧 ${isFr ? 'Envoyer par email' : 'Send by email'}`}
        </button>
        {!clientEmail && (
          <p style={{ fontSize: '12px', color: 'var(--text3)', textAlign: 'center', margin: 0 }}>
            {isFr ? 'Renseignez un email client pour envoyer.' : 'Add a client email to send.'}
          </p>
        )}
      </div>
    </>
  );
}
