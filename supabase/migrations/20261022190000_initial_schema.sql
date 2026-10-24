create extension if not exists pgcrypto with schema extensions;

create type public.staff_role as enum ('admin', 'staff');
create type public.pricing_type as enum ('fixed', 'quotation');
create type public.payment_status as enum (
  'unpaid',
  'submitted',
  'under_review',
  'confirmed',
  'rejected',
  'refund_pending',
  'refunded'
);
create type public.fulfilment_status as enum (
  'not_started',
  'queued',
  'processing',
  'completed',
  'failed',
  'cancelled'
);
create type public.payment_submission_status as enum (
  'submitted',
  'under_review',
  'confirmed',
  'rejected'
);
create type public.appointment_status as enum (
  'requested',
  'confirmed',
  'rejected',
  'rescheduled',
  'cancelled',
  'completed'
);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  email text not null,
  role public.staff_role not null default 'staff',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and is_active = true
  );
$$;

revoke all on function public.is_active_staff() from public;
grant execute on function public.is_active_staff() to authenticated;

create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  image_path text,
  is_active boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.service_categories (id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text not null default '',
  instructions text not null default '',
  form_schema jsonb not null default '{"fields":[]}'::jsonb,
  base_price_minor bigint check (base_price_minor is null or base_price_minor >= 0),
  service_fee_minor bigint not null default 0 check (service_fee_minor >= 0),
  pricing_type public.pricing_type not null default 'quotation',
  processing_estimate text,
  image_path text,
  is_active boolean not null default false,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fixed_price_required check (
    pricing_type <> 'fixed' or base_price_minor is not null
  )
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_reference text not null unique,
  tracking_token_hash text not null unique,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  service_id uuid references public.services (id) on delete restrict,
  service_name_snapshot text not null,
  service_details jsonb not null default '{}'::jsonb,
  subtotal_minor bigint not null check (subtotal_minor >= 0),
  service_fee_minor bigint not null check (service_fee_minor >= 0),
  total_minor bigint not null check (total_minor >= 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  payment_status public.payment_status not null default 'unpaid',
  fulfilment_status public.fulfilment_status not null default 'not_started',
  customer_notes text,
  internal_notes text,
  payment_instructions_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint order_total_matches check (
    total_minor = subtotal_minor + service_fee_minor
  )
);

create index orders_created_at_idx on public.orders (created_at desc);
create index orders_payment_status_idx on public.orders (payment_status, created_at desc);
create index orders_fulfilment_status_idx on public.orders (fulfilment_status, created_at desc);
create index orders_customer_phone_idx on public.orders (customer_phone);

create table public.payment_submissions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  amount_reported_minor bigint not null check (amount_reported_minor >= 0),
  payment_reference text,
  payment_date date,
  receipt_storage_path text,
  status public.payment_submission_status not null default 'submitted',
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  customer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payment_submissions_order_id_idx on public.payment_submissions (order_id, created_at desc);
create index payment_submissions_status_idx on public.payment_submissions (status, created_at desc);

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  payment_submission_id uuid references public.payment_submissions (id) on delete set null,
  actor_id uuid references public.profiles (id) on delete set null,
  event_type text not null,
  reason text,
  transaction_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index payment_events_order_id_idx on public.payment_events (order_id, created_at desc);

create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  actor_id uuid references public.profiles (id) on delete set null,
  event_type text not null,
  previous_status text,
  new_status text,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index order_events_order_id_idx on public.order_events (order_id, created_at desc);

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  image_path text,
  placement text not null default 'homepage',
  destination_url text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promotion_dates_valid check (ends_at > starts_at)
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  published_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcement_dates_valid check (
    expires_at is null or published_at is null or expires_at > published_at
  )
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  service_id uuid references public.services (id) on delete set null,
  requested_start timestamptz not null,
  requested_end timestamptz not null,
  status public.appointment_status not null default 'requested',
  customer_notes text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointment_duration_valid check (requested_end > requested_start)
);

create index appointments_requested_start_idx on public.appointments (requested_start);

create table public.business_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id, created_at desc);
create index audit_logs_actor_idx on public.audit_logs (actor_id, created_at desc);

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger categories_set_updated_at before update on public.service_categories
  for each row execute function public.set_updated_at();
create trigger services_set_updated_at before update on public.services
  for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
create trigger payment_submissions_set_updated_at before update on public.payment_submissions
  for each row execute function public.set_updated_at();
create trigger promotions_set_updated_at before update on public.promotions
  for each row execute function public.set_updated_at();
create trigger announcements_set_updated_at before update on public.announcements
  for each row execute function public.set_updated_at();
create trigger appointments_set_updated_at before update on public.appointments
  for each row execute function public.set_updated_at();
create trigger business_settings_set_updated_at before update on public.business_settings
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.orders enable row level security;
alter table public.payment_submissions enable row level security;
alter table public.payment_events enable row level security;
alter table public.order_events enable row level security;
alter table public.promotions enable row level security;
alter table public.announcements enable row level security;
alter table public.appointments enable row level security;
alter table public.business_settings enable row level security;
alter table public.audit_logs enable row level security;

create policy "Public can read active categories"
  on public.service_categories for select to anon, authenticated
  using (is_active = true);
create policy "Staff can manage categories"
  on public.service_categories for all to authenticated
  using ((select public.is_active_staff()))
  with check ((select public.is_active_staff()));

create policy "Public can read active services"
  on public.services for select to anon, authenticated
  using (is_active = true);
create policy "Staff can manage services"
  on public.services for all to authenticated
  using ((select public.is_active_staff()))
  with check ((select public.is_active_staff()));

create policy "Staff can read profiles"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_active_staff()));

create policy "Staff can manage orders"
  on public.orders for all to authenticated
  using ((select public.is_active_staff()))
  with check ((select public.is_active_staff()));
create policy "Staff can manage payment submissions"
  on public.payment_submissions for all to authenticated
  using ((select public.is_active_staff()))
  with check ((select public.is_active_staff()));
create policy "Staff can read payment events"
  on public.payment_events for select to authenticated
  using ((select public.is_active_staff()));
create policy "Staff can read order events"
  on public.order_events for select to authenticated
  using ((select public.is_active_staff()));
create policy "Staff can manage promotions"
  on public.promotions for all to authenticated
  using ((select public.is_active_staff()))
  with check ((select public.is_active_staff()));
create policy "Public can read active promotions"
  on public.promotions for select to anon, authenticated
  using (
    is_active = true
    and starts_at <= now()
    and ends_at > now()
  );
create policy "Public can read active announcements"
  on public.announcements for select to anon, authenticated
  using (
    is_active = true
    and published_at is not null
    and published_at <= now()
    and (expires_at is null or expires_at > now())
  );
create policy "Staff can manage announcements"
  on public.announcements for all to authenticated
  using ((select public.is_active_staff()))
  with check ((select public.is_active_staff()));
create policy "Staff can manage appointments"
  on public.appointments for all to authenticated
  using ((select public.is_active_staff()))
  with check ((select public.is_active_staff()));
create policy "Staff can manage business settings"
  on public.business_settings for all to authenticated
  using ((select public.is_active_staff()))
  with check ((select public.is_active_staff()));
create policy "Staff can read audit logs"
  on public.audit_logs for select to authenticated
  using ((select public.is_active_staff()));

grant select on public.service_categories, public.services, public.promotions,
  public.announcements to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;

revoke insert, update, delete on public.profiles from authenticated, anon;
revoke update, delete on public.payment_events, public.order_events, public.audit_logs
  from authenticated, anon;
revoke all on public.orders, public.payment_submissions, public.payment_events,
  public.order_events, public.appointments, public.business_settings, public.audit_logs
  from anon;
