-- =====================================================================
-- El Gran Checkout — Schema completo
-- Ejecuta en: Supabase → SQL Editor
-- =====================================================================

-- ──────────────────────────────────────────────────────────────────────
-- 1. EXTENSIÓN UUID
-- ──────────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────────────────────────────
-- 2. TABLA: profiles
--    Almacena nombre y rol de cada usuario autenticado.
-- ──────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id        uuid primary key references auth.users(id) on delete cascade,
  name      text        not null,
  role      text        not null check (role in ('vendedor', 'comprador')),
  created_at timestamptz not null default now()
);

-- Índice para búsquedas por rol
create index if not exists idx_profiles_role on public.profiles(role);

-- RLS
alter table public.profiles enable row level security;

-- Cada usuario solo puede ver y editar su propio perfil
create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

-- ──────────────────────────────────────────────────────────────────────
-- 3. FUNCIÓN: auto-crear perfil al registrarse
-- ──────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuario'),
    coalesce(new.raw_user_meta_data->>'role', 'comprador')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger para ejecutar la función en cada nuevo usuario
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ──────────────────────────────────────────────────────────────────────
-- 4. TABLA: payments
--    merchant_id → UUID del comprador (quien generó el QR)
--    seller_id   → UUID del vendedor (quien escaneó y cobró)
-- ──────────────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id              uuid        primary key default uuid_generate_v4(),
  transaction_id  text        unique,
  merchant_id     uuid        not null references auth.users(id),
  merchant_name   text        not null,
  seller_id       uuid        references auth.users(id),
  amount          numeric(12,2) not null check (amount > 0),
  currency        text        not null default 'MXN',
  description     text,
  reference       text,
  status          text        not null check (status in ('success', 'failed', 'pending')),
  error_code      text,
  error_message   text,
  created_at      timestamptz not null default now()
);

-- Índices para consultas frecuentes
create index if not exists idx_payments_merchant_id on public.payments(merchant_id);
create index if not exists idx_payments_seller_id   on public.payments(seller_id);
create index if not exists idx_payments_status      on public.payments(status);
create index if not exists idx_payments_created_at  on public.payments(created_at desc);

-- RLS
alter table public.payments enable row level security;

-- El comprador ve sus propios pagos (merchant_id = yo)
create policy "payments: comprador select own"
  on public.payments for select
  using (auth.uid() = merchant_id);

-- El vendedor ve los pagos que él procesó (seller_id = yo)
create policy "payments: vendedor select own"
  on public.payments for select
  using (auth.uid() = seller_id);

-- Cualquier usuario autenticado puede insertar un pago
create policy "payments: authenticated insert"
  on public.payments for insert
  with check (auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────────────────
-- 5. TABLA: push_tokens
--    Un token por dispositivo (upsert on conflict).
-- ──────────────────────────────────────────────────────────────────────
create table if not exists public.push_tokens (
  id         uuid        primary key default uuid_generate_v4(),
  token      text        not null unique,
  user_id    uuid        references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_push_tokens_user_id on public.push_tokens(user_id);

-- RLS
alter table public.push_tokens enable row level security;

-- Cualquier usuario autenticado puede insertar/actualizar su token
create policy "push_tokens: authenticated upsert"
  on public.push_tokens for insert
  with check (auth.role() = 'authenticated');

create policy "push_tokens: authenticated update"
  on public.push_tokens for update
  using (auth.role() = 'authenticated');

-- El servicio de backend lee todos los tokens para enviar notificaciones
-- (la función sendPushNotification se llama server-side desde paymentService)
create policy "push_tokens: service select"
  on public.push_tokens for select
  using (auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────────────────
-- 6. VISTA: resumen de pagos por comprador
-- ──────────────────────────────────────────────────────────────────────
create or replace view public.payments_summary as
select
  p.merchant_id,
  pr.name                                        as merchant_name,
  count(*)                                       as total_payments,
  count(*) filter (where p.status = 'success')   as successful,
  count(*) filter (where p.status = 'failed')    as failed,
  sum(p.amount) filter (where p.status = 'success') as total_amount,
  max(p.created_at)                              as last_payment_at
from public.payments p
left join public.profiles pr on pr.id = p.merchant_id
group by p.merchant_id, pr.name;

-- ──────────────────────────────────────────────────────────────────────
-- FIN DEL SCHEMA
-- ──────────────────────────────────────────────────────────────────────
