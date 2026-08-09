// HSW365 Offer Forge — Cash App order capture (no Stripe).
// Records a PENDING order + returns a unique code the buyer puts in their Cash App note.
// Deployed to project ucgymjcenpddqshokybj (verify_jwt = false). No secrets required.
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const PRODUCTS: Record<string, { amount: number; sku: string }> = {
  'offer-forge': { amount: 4700, sku: 'HSW365-FORGE-V01' },
};

function code() {
  const c = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 5; i++) s += c[Math.floor(Math.random() * c.length)];
  return `OF-${s}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const { email, product = 'offer-forge' } = await req.json().catch(() => ({}));
    const p = PRODUCTS[product];
    if (!p) return json({ error: 'Unknown product' }, 400);
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: 'Valid email required' }, 400);

    const order_code = code();
    const { error } = await supabase.from('hsw365_orders').insert({
      email, order_code, product, sku: p.sku,
      amount_total: p.amount, currency: 'usd',
      payment_method: 'cashapp', payment_status: 'pending',
    });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, order_code, amount: p.amount / 100 }, 200);
  } catch (e) {
    return json({ error: (e as Error).message }, 400);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}
