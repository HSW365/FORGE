-- HSW365 Offer Forge — orders table (applied to project ucgymjcenpddqshokybj)
create table if not exists public.hsw365_orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique,
  email text,
  amount_total integer,
  currency text,
  payment_status text,
  payment_method text,
  product text default 'offer-forge',
  sku text,
  fulfilled boolean default false,
  raw jsonb,
  created_at timestamptz default now()
);

alter table public.hsw365_orders enable row level security;
-- No public policies: anon/authenticated cannot read or write.
-- Only the service_role (stripe-webhook function) bypasses RLS.

create index if not exists hsw365_orders_created_idx on public.hsw365_orders (created_at desc);
create index if not exists hsw365_orders_email_idx  on public.hsw365_orders (email);
