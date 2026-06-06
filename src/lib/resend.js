export async function sendConfirmationEmail({ to, clientName, visitDate, visitTime, commercialName, originAddress, lang }) {
  const key = import.meta.env.VITE_RESEND_API_KEY;
  const from = import.meta.env.VITE_RESEND_FROM || 'onboarding@resend.dev';

  if (!key || key.startsWith('re_xxx')) return { error: 'VITE_RESEND_API_KEY non configurée' };
  if (!to) return { error: 'Adresse email manquante' };

  const isFr = lang === 'fr';

  const dateStr = visitDate ? (() => {
    try {
      return new Date(visitDate + 'T12:00:00').toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      });
    } catch { return visitDate; }
  })() : '';

  const subject = isFr
    ? 'Confirmation de visite – Move Up Mobility'
    : 'Moving survey confirmation – Move Up Mobility';

  const html = isFr ? `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#333">
  <div style="background:#0F0F0E;padding:20px 24px;border-radius:8px;margin-bottom:24px">
    <h1 style="color:white;margin:0;font-size:20px">📦 Move Up Mobility</h1>
    <p style="color:#aaa;margin:4px 0 0;font-size:13px">Spécialiste en déménagement international</p>
  </div>
  <p style="font-size:16px">Bonjour <strong>${clientName || ''}</strong>,</p>
  <p style="font-size:16px">Votre visite de déménagement est confirmée pour le :</p>
  <div style="background:#EEF4FF;border-left:4px solid #2B6BE6;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0">
    <p style="margin:0;font-size:18px;font-weight:700;color:#2B6BE6">${dateStr}${visitTime ? ` à ${visitTime}` : ''}</p>
    ${originAddress ? `<p style="margin:8px 0 0;color:#555;font-size:14px">📍 ${originAddress}</p>` : ''}
    ${commercialName ? `<p style="margin:6px 0 0;color:#555;font-size:14px">👤 Votre commercial : <strong>${commercialName}</strong></p>` : ''}
  </div>
  <p style="font-size:14px;color:#555">N'hésitez pas à nous contacter si vous avez des questions.</p>
  <p style="font-size:14px;color:#555">À très bientôt,<br><strong>L'équipe Move Up Mobility</strong></p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#aaa;font-size:11px">Message envoyé automatiquement. Merci de ne pas y répondre directement.</p>
</div>` : `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#333">
  <div style="background:#0F0F0E;padding:20px 24px;border-radius:8px;margin-bottom:24px">
    <h1 style="color:white;margin:0;font-size:20px">📦 Move Up Mobility</h1>
    <p style="color:#aaa;margin:4px 0 0;font-size:13px">International moving specialist</p>
  </div>
  <p style="font-size:16px">Hello <strong>${clientName || ''}</strong>,</p>
  <p style="font-size:16px">Your moving survey is confirmed for:</p>
  <div style="background:#EEF4FF;border-left:4px solid #2B6BE6;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0">
    <p style="margin:0;font-size:18px;font-weight:700;color:#2B6BE6">${dateStr}${visitTime ? ` at ${visitTime}` : ''}</p>
    ${originAddress ? `<p style="margin:8px 0 0;color:#555;font-size:14px">📍 ${originAddress}</p>` : ''}
    ${commercialName ? `<p style="margin:6px 0 0;color:#555;font-size:14px">👤 Your consultant: <strong>${commercialName}</strong></p>` : ''}
  </div>
  <p style="font-size:14px;color:#555">Please don't hesitate to contact us if you have any questions.</p>
  <p style="font-size:14px;color:#555">See you soon,<br><strong>The Move Up Mobility team</strong></p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#aaa;font-size:11px">Automated message. Please do not reply directly.</p>
</div>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.message || `HTTP ${res.status}` };
    return { data };
  } catch (e) {
    return { error: e.message };
  }
}
