// Vercel Serverless Function — POST /api/stripe-webhook
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return res.status(500).json({ error: 'STRIPE_WEBHOOK_SECRET not configured' });

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  const planFromPriceId = (priceId) => {
    if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro';
    if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return 'enterprise';
    return 'pro';
  };

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    if (!userId) return res.status(400).json({ error: 'No userId in metadata' });
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    const priceId = subscription.items.data[0]?.price.id;
    await supabase.from('profiles').upsert({
      id: userId,
      plan: planFromPriceId(priceId),
      stripe_customer_id: session.customer,
      subscription_status: 'active',
    });
  }

  if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.paused') {
    const subscription = event.data.object;
    const customerId = subscription.customer;
    const { data: profiles } = await supabase
      .from('profiles').select('id').eq('stripe_customer_id', customerId).limit(1);
    if (profiles?.[0]) {
      await supabase.from('profiles').update({
        plan: 'free',
        subscription_status: 'inactive',
      }).eq('id', profiles[0].id);
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object;
    const customerId = subscription.customer;
    const status = subscription.status;
    const { data: profiles } = await supabase
      .from('profiles').select('id').eq('stripe_customer_id', customerId).limit(1);
    if (profiles?.[0]) {
      await supabase.from('profiles').update({ subscription_status: status }).eq('id', profiles[0].id);
    }
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object;
    const customerId = invoice.customer;
    const { data: profiles } = await supabase
      .from('profiles').select('id').eq('stripe_customer_id', customerId).limit(1);
    if (profiles?.[0]) {
      await supabase.from('profiles').update({ subscription_status: 'past_due' }).eq('id', profiles[0].id);
    }
    // Alerte email via Resend si configuré
    if (process.env.RESEND_API_KEY && invoice.customer_email) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Move Up Mobility <no-reply@moveupapp.com>',
          to: [invoice.customer_email],
          subject: '⚠️ Problème de paiement — Move Up Mobility',
          html: `<p>Bonjour,</p><p>Le paiement de votre abonnement Move Up Mobility a échoué. Veuillez mettre à jour vos informations de paiement pour continuer à accéder au Plan Pro.</p><p><a href="https://billing.stripe.com/p/login" style="background:#2B6BE6;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Mettre à jour mon moyen de paiement</a></p><p>L'équipe Move Up Mobility</p>`,
        }),
      }).catch(err => console.error('Resend error on payment_failed:', err));
    }
  }

  res.status(200).json({ received: true });
}
