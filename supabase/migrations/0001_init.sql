-- TAPI — schemat początkowy.
--
-- Odpowiada temu, czego dziś używa aplikacja: konta gości, katalog lokali
-- i wydarzeń, zapisane, obserwowane, zainteresowania, skany, kupony, punkty,
-- plany wyjazdu i zamówienia stojaka.
--
-- Zasada: każdy wiersz należy do kogoś. Wszędzie RLS, bez wyjątków —
-- klucz publikowalny trafia do aplikacji, więc baza musi bronić się sama.

create extension if not exists "pgcrypto";

/* ─────────────────────────────────────────────────────────────── profile ── */

create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  name        text,
  email       text,
  phone       text,
  city        text default 'Kraków',
  born        text,
  bio         text,
  avatar      text,
  lang        text not null default 'it' check (lang in ('pl', 'en', 'it')),
  -- konto firmowe widzi to co gość plus swoje narzędzia
  is_business boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profil widzi właściciel" on public.profiles
  for select using (auth.uid() = id);
create policy "profil zmienia właściciel" on public.profiles
  for update using (auth.uid() = id);
create policy "profil zakłada właściciel" on public.profiles
  for insert with check (auth.uid() = id);

-- Profil powstaje razem z kontem, żeby aplikacja nie musiała o tym pamiętać.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

/* ──────────────────────────────────────────────────────── lokale i wydarzenia ── */

create type public.venue_cat as enum ('noc', 'kawa', 'event', 'gastro');

create table public.venues (
  id              text primary key,
  name            text not null,
  cat             public.venue_cat not null,
  cat_label       text not null,
  lat             double precision,
  lng             double precision,
  rating          numeric(2, 1) default 0,
  votes           integer default 0,
  -- poziom cenowy zapisany tak jak w interfejsie: •, ••, •••
  price           text,
  district        text,
  address         text,
  phone           text,
  site            text,
  google_place_id text unique,
  -- kolory zastępczego gradientu, dopóki nie ma zdjęć
  grad            text[],
  owner_id        uuid references public.profiles on delete set null,
  created_at      timestamptz not null default now()
);

alter table public.venues enable row level security;

create policy "lokale czyta każdy" on public.venues for select using (true);
create policy "lokal zmienia właściciel" on public.venues
  for update using (auth.uid() = owner_id);

create table public.events (
  id         uuid primary key default gen_random_uuid(),
  venue_id   text references public.venues on delete cascade,
  starts_at  timestamptz not null,
  price      integer not null default 0,
  cat        text,
  district   text,
  title_pl   text not null,
  title_en   text not null,
  title_it   text not null,
  place      text,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;
create policy "wydarzenia czyta każdy" on public.events for select using (true);

create index events_starts_at_idx on public.events (starts_at);
create index venues_district_idx on public.venues (district);

/* ────────────────────────────────────────────────── to, co gość odkłada ── */

create table public.saved_venues (
  user_id  uuid references public.profiles on delete cascade,
  venue_id text references public.venues on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, venue_id)
);

create table public.saved_events (
  user_id  uuid references public.profiles on delete cascade,
  event_id uuid references public.events on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create table public.follows (
  user_id  uuid references public.profiles on delete cascade,
  venue_id text references public.venues on delete cascade,
  primary key (user_id, venue_id)
);

create table public.user_interests (
  user_id     uuid references public.profiles on delete cascade,
  interest_id text not null,
  primary key (user_id, interest_id)
);

-- Wszystkie cztery mają tę samą zasadę: widzi i zmienia wyłącznie właściciel.
do $$
declare t text;
begin
  foreach t in array array['saved_venues', 'saved_events', 'follows', 'user_interests'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "tylko swoje — odczyt" on public.%I for select using (auth.uid() = user_id)', t);
    execute format(
      'create policy "tylko swoje — zapis" on public.%I for insert with check (auth.uid() = user_id)', t);
    execute format(
      'create policy "tylko swoje — usuwanie" on public.%I for delete using (auth.uid() = user_id)', t);
  end loop;
end $$;

/* ───────────────────────────────────────────── skany, kupony i punkty ── */

create table public.coupons (
  id         uuid primary key default gen_random_uuid(),
  venue_id   text references public.venues on delete cascade,
  title_pl   text not null,
  title_en   text not null,
  title_it   text not null,
  condition  text,
  -- 0 = bez ograniczenia
  max_uses   integer not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.coupons enable row level security;
create policy "kupony czyta każdy" on public.coupons for select using (active);
create policy "kupony prowadzi właściciel lokalu" on public.coupons
  for all using (
    exists (select 1 from public.venues v where v.id = venue_id and v.owner_id = auth.uid())
  );

create table public.scans (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles on delete cascade,
  venue_id   text references public.venues on delete cascade,
  points     integer not null default 60,
  created_at timestamptz not null default now()
);

alter table public.scans enable row level security;
create policy "swoje skany — odczyt" on public.scans
  for select using (auth.uid() = user_id);
create policy "swoje skany — zapis" on public.scans
  for insert with check (auth.uid() = user_id);

create table public.coupon_redemptions (
  id          uuid primary key default gen_random_uuid(),
  coupon_id   uuid references public.coupons on delete cascade,
  user_id     uuid references public.profiles on delete cascade,
  redeemed_at timestamptz,
  created_at  timestamptz not null default now()
);

alter table public.coupon_redemptions enable row level security;
create policy "swoje kupony — odczyt" on public.coupon_redemptions
  for select using (auth.uid() = user_id);
create policy "swoje kupony — zapis" on public.coupon_redemptions
  for insert with check (auth.uid() = user_id);

-- Punkty liczymy z historii, nie z licznika — inaczej przy błędzie nie ma
-- jak odtworzyć salda.
create table public.points_ledger (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles on delete cascade,
  points     integer not null,
  reason     text not null,
  created_at timestamptz not null default now()
);

alter table public.points_ledger enable row level security;
create policy "swoje punkty" on public.points_ledger
  for select using (auth.uid() = user_id);

create view public.points_balance with (security_invoker = true) as
  select user_id, coalesce(sum(points), 0)::integer as points
  from public.points_ledger group by user_id;

/* ────────────────────────────────────────────────── planer i Smart Stand ── */

create table public.trip_plans (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles on delete cascade,
  days       integer not null,
  budget     integer,
  pace       text,
  who        text,
  interests  text[],
  -- gotowa trasa z modelu, dzień po dniu
  plan       jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.trip_plans enable row level security;
create policy "swoje plany — odczyt" on public.trip_plans
  for select using (auth.uid() = user_id);
create policy "swoje plany — zapis" on public.trip_plans
  for insert with check (auth.uid() = user_id);

create table public.stand_orders (
  id         uuid primary key default gen_random_uuid(),
  venue_id   text references public.venues on delete cascade,
  user_id    uuid references public.profiles on delete set null,
  color      text not null default 'black' check (color in ('black', 'white')),
  print_text text,
  stars      integer not null default 5 check (stars between 0 and 5),
  status     text not null default 'draft'
             check (status in ('draft', 'ordered', 'shipped', 'delivered')),
  created_at timestamptz not null default now()
);

alter table public.stand_orders enable row level security;
create policy "swoje zamówienia" on public.stand_orders
  for all using (auth.uid() = user_id);
