# Offer Forge — Cash App checkout (HSW365)

**No Stripe. No keys. Nothing to configure.** Host `index.html` and it works.

## Flow
`index.html` → buyer enters email → `cashapp-order` (Supabase) records a PENDING
order + returns a code `OF-XXXXX` → buyer pays **$47 to $hsw365** with that code
in the Cash App note → you match the code and email the PDF.

## Already live (project ucgymjcenpddqshokybj)
- `hsw365_orders` table — now has an `order_code` column (RLS on, service-role only).
- `cashapp-order` edge function — inserts the pending order, returns the code.
  Uses the auto-injected service role, so **zero secrets to set**.
- `index.html` — email-capture modal → Cash App handoff, wired to the live function.

## Your only step
Host `index.html` anywhere: Render static site, a Shopify page, or GitHub Pages.
That's it — payments work immediately.

## Fulfilling an order (manual — this is the Cash App tradeoff)
1. A buyer pays $47 to **$hsw365** with a note like `OF-7K3QM`.
2. Match that code to the row in `hsw365_orders` (same `order_code`) to get their email.
3. Email them `HSW365_Offer_Forge_System.pdf`.
4. Set `fulfilled = true` on that row.

Quick lookup (Supabase SQL editor):
```sql
select email, order_code, created_at, fulfilled
from hsw365_orders
where payment_status = 'pending' and not fulfilled
order by created_at desc;
```

## Why manual?
A personal Cash App cashtag ($hsw365) has **no developer API** — nothing can detect
the payment for you. The only automated Cash App path is **Cash App Pay via Square**
(or Stripe). If you ever want hands-off auto-delivery, say the word and I'll wire
Square (keeps Cash App) or add email auto-send.

## Want auto-delivery even on the manual flow?
Add Resend/SendGrid to a small function that emails the PDF the moment you flip
`fulfilled = true`. One more step whenever you're ready.

---
`_stripe_dormant/` holds the earlier Stripe functions — unused now, kept for reference.
The `create-checkout` / `stripe-webhook` functions still exist in Supabase but are
inert (no keys set). Ignore them.
