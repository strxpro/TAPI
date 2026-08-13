-- TAPI — warstwa firmowa: wizytówka, rezerwacje, wypłaty i relacje.
--
-- Uzgadnia z rzeczywistością to, co opisywał `create_tapi_merchants_schema.sql`.
-- Tamten plik nigdy nie wszedł do bazy i wejść nie mógł: zakładał `venues.id`
-- typu UUID, a w bazie identyfikatorem lokalu jest tekstowy skrót ('nokturn').
-- `bookings.venue_id UUID REFERENCES venues(id)` wywróciłoby się na typie.
-- Tu jest to samo, tyle że dopasowane do istniejących tabel — i z RLS,
-- którego tamten plik nie miał wcale.
--
-- Zasada zostaje ta sama co w 0001: każdy wiersz należy do kogoś.

/* ────────────────────────────────────────────────── kto prowadzi lokal ── */

-- Powtarza się w każdej polityce poniżej, więc niech będzie jedno miejsce.
--
-- Świadomie `security invoker`: lokale i tak czyta każdy (polityka z 0001),
-- więc funkcja nie musi omijać RLS. Jako `definer` byłaby furtką, którą
-- trzeba pilnować przy każdej zmianie — a niczego by nie ułatwiła.
create or replace function public.owns_venue(v text) returns boolean
language sql stable security invoker set search_path = '' as $$
  select exists (
    select 1 from public.venues where id = v and owner_id = auth.uid()
  );
$$;

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

/* ─────────────────────────────────────────── lokal: pola firmowe i karta ── */

do $$ begin
  create type public.venue_archetype as enum
    ('HOSPITALITY', 'NOCLEGI', 'BEAUTY', 'NIGHTLIFE', 'SERVICES');
exception when duplicate_object then null;
end $$;

alter table public.venues
  add column if not exists archetype              public.venue_archetype,
  add column if not exists is_manual_registration boolean not null default false,
  add column if not exists registration_doc_url   text,
  add column if not exists verification_status    text not null default 'PENDING',
  add column if not exists tos_accepted_at        timestamptz,
  add column if not exists tos_version            text,
  -- Reszta wizytówki, która dotąd żyła wyłącznie w `src/app/mock-data.js`.
  -- Bez tych kolumn `db.venues` nie ma jak zwrócić pełnego lokalu.
  add column if not exists hours                  jsonb,
  add column if not exists reward                 text,
  add column if not exists reward_code            text,
  add column if not exists menu                   jsonb,
  add column if not exists opinions               jsonb,
  add column if not exists updated_at             timestamptz not null default now();

do $$ begin
  alter table public.venues add constraint venues_verification_status_check
    check (verification_status in ('PENDING', 'VERIFIED', 'REJECTED'));
exception when duplicate_object then null;
end $$;

drop trigger if exists venues_touch on public.venues;
create trigger venues_touch before update on public.venues
  for each row execute function public.touch_updated_at();

-- Wizytówkę zakłada zalogowana firma; 0001 dał tylko odczyt i zmianę.
drop policy if exists "lokal zaklada firma" on public.venues;
create policy "lokal zaklada firma" on public.venues
  for insert to authenticated with check (auth.uid() = owner_id);

/* ────────────────────────────────────────────────── ustawienia modułów ── */

create table if not exists public.venue_settings (
  venue_id                  text primary key references public.venues on delete cascade,
  show_menu_scanner         boolean not null default false,
  show_table_booking        boolean not null default false,
  show_ical_booking         boolean not null default false,
  show_service_booking      boolean not null default false,
  ical_sync_url             text,
  google_calendar_id        text,
  ai_auto_responder_enabled boolean not null default true,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

alter table public.venue_settings enable row level security;

-- Które moduły pokazać na wizytówce, musi wiedzieć każdy odwiedzający.
create policy "ustawienia czyta kazdy" on public.venue_settings
  for select using (true);
create policy "ustawienia prowadzi wlasciciel" on public.venue_settings
  for all to authenticated
  using (public.owns_venue(venue_id)) with check (public.owns_venue(venue_id));

drop trigger if exists venue_settings_touch on public.venue_settings;
create trigger venue_settings_touch before update on public.venue_settings
  for each row execute function public.touch_updated_at();

/* ───────────────────────────────────────────────── wypłaty i rozliczenia ── */

create table if not exists public.venue_payout_profiles (
  venue_id               text primary key references public.venues on delete cascade,
  stripe_account_id      text,
  stripe_charges_enabled boolean not null default false,
  payout_bank_account    text,   -- IBAN
  payout_bank_name       text,
  payout_holder_name     text,
  is_verified            boolean not null default false,
  balance_available_eur  numeric(10, 2) not null default 0,
  balance_pending_eur    numeric(10, 2) not null default 0,
  -- Jeden warunek zamiast rozsypanych po kodzie sprawdzeń „czy można już brać
  -- pieniądze". Liczy baza, więc interfejs nie ma jak się pomylić.
  payout_setup_completed boolean generated always as (
    (stripe_account_id is not null and stripe_charges_enabled)
    or (payout_bank_account is not null and payout_holder_name is not null and is_verified)
  ) stored,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

alter table public.venue_payout_profiles enable row level security;

-- Numer konta widzi wyłącznie właściciel. Żadnego publicznego odczytu.
create policy "wyplaty tylko wlasciciel" on public.venue_payout_profiles
  for all to authenticated
  using (public.owns_venue(venue_id)) with check (public.owns_venue(venue_id));

/**
 * Saldo i weryfikacja nie należą do firmy.
 *
 * Polityka wyżej daje właścicielowi prawo zapisu do całego wiersza, a wiersz
 * zawiera stan konta. Bez tego strażnika firma mogłaby wpisać sobie dowolne
 * saldo i status „zweryfikowana". Te kolumny zmienia wyłącznie serwer:
 * Stripe przez webhook, rozliczenia przez funkcję brzegową.
 */
create or replace function public.guard_payout_money() returns trigger
language plpgsql set search_path = '' as $$
begin
  if coalesce(auth.role(), 'service_role') = 'service_role' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.stripe_charges_enabled := false;
    new.is_verified            := false;
    new.balance_available_eur  := 0;
    new.balance_pending_eur    := 0;
  else
    new.stripe_account_id      := old.stripe_account_id;
    new.stripe_charges_enabled := old.stripe_charges_enabled;
    new.is_verified            := old.is_verified;
    new.balance_available_eur  := old.balance_available_eur;
    new.balance_pending_eur    := old.balance_pending_eur;
  end if;
  return new;
end;
$$;

drop trigger if exists payout_guard on public.venue_payout_profiles;
create trigger payout_guard before insert or update on public.venue_payout_profiles
  for each row execute function public.guard_payout_money();

drop trigger if exists venue_payout_touch on public.venue_payout_profiles;
create trigger venue_payout_touch before update on public.venue_payout_profiles
  for each row execute function public.touch_updated_at();

/* ──────────────────────────────── rezerwacje dopiero po danych do wypłat ── */

/**
 * Firma nie włączy rezerwacji online, dopóki nie ma gdzie odesłać pieniędzy.
 *
 * Trzyma to baza, nie ekran. Interfejs też o tym uprzedzi, ale gdyby ktoś
 * ominął ekran i uderzył prosto w API, warunek i tak zadziała.
 */
create or replace function public.guard_booking_gating() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.show_table_booking or new.show_ical_booking or new.show_service_booking then
    if not exists (
      select 1 from public.venue_payout_profiles p
      where p.venue_id = new.venue_id and p.payout_setup_completed
    ) then
      raise exception
        'Rezerwacje online wymagaja uzupelnionych danych do wyplat (Stripe albo IBAN)'
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists booking_gating on public.venue_settings;
create trigger booking_gating before insert or update on public.venue_settings
  for each row execute function public.guard_booking_gating();

-- Droga powrotna: gdy dane do wypłat przestają być kompletne, rezerwacje
-- gasną same. Inaczej lokal zbierałby wpłaty, których nie ma jak przekazać.
create or replace function public.disable_bookings_without_payout() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not new.payout_setup_completed then
    update public.venue_settings
       set show_table_booking = false,
           show_ical_booking = false,
           show_service_booking = false
     where venue_id = new.venue_id
       and (show_table_booking or show_ical_booking or show_service_booking);
  end if;
  return new;
end;
$$;

drop trigger if exists payout_gone on public.venue_payout_profiles;
create trigger payout_gone after update on public.venue_payout_profiles
  for each row execute function public.disable_bookings_without_payout();

/* ─────────────────────────────────────────────────────────── rezerwacje ── */

create table if not exists public.bookings (
  id                  uuid primary key default gen_random_uuid(),
  venue_id            text not null references public.venues on delete cascade,
  customer_id         uuid not null references public.profiles on delete cascade,
  booking_type        text not null check (booking_type in ('TABLE', 'ROOM', 'SERVICE', 'TICKET')),
  status              text not null default 'PENDING'
                        check (status in ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
  guests              integer not null default 2 check (guests > 0),
  total_amount        numeric(10, 2) not null default 0,
  platform_fee_amount numeric(10, 2) not null default 0,  -- prowizja TAPI
  merchant_amount     numeric(10, 2) not null default 0,
  note                text,
  booking_start       timestamptz not null,
  booking_end         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists bookings_venue_start on public.bookings (venue_id, booking_start desc);
create index if not exists bookings_customer on public.bookings (customer_id, booking_start desc);

alter table public.bookings enable row level security;

create policy "rezerwacje widzi gosc i lokal" on public.bookings
  for select to authenticated
  using (auth.uid() = customer_id or public.owns_venue(venue_id));

-- Rezerwuje się u siebie i tylko tam, gdzie rezerwacje są naprawdę włączone.
create policy "rezerwuje gosc" on public.bookings
  for insert to authenticated with check (
    auth.uid() = customer_id
    -- `bookings.venue_id` z pełną nazwą tabeli, bo samo `venue_id` w tym
    -- podzapytaniu trafiłoby na kolumnę z `venue_settings` i warunek zawsze
    -- byłby prawdziwy — czyli rezerwacje wpuszczałyby wszędzie.
    and exists (
      select 1 from public.venue_settings s
      where s.venue_id = bookings.venue_id
        and (s.show_table_booking or s.show_ical_booking or s.show_service_booking)
    )
  );

create policy "rezerwacje prowadzi lokal" on public.bookings
  for update to authenticated using (public.owns_venue(venue_id));

-- Gość może odwołać swoją — ograniczenie do statusu siedzi w wyzwalaczu niżej.
create policy "swoja rezerwacje odwoluje gosc" on public.bookings
  for update to authenticated
  using (auth.uid() = customer_id) with check (auth.uid() = customer_id);

/**
 * Kwoty ustala serwer, nie zamawiający.
 *
 * Bez tego gość wpisałby sobie `total_amount = 0` przy rezerwacji stolika
 * z zadatkiem. Gość może zmienić w swojej rezerwacji tylko status na
 * odwołany — resztę zostawiamy taką, jaka była.
 */
create or replace function public.guard_booking_amounts() returns trigger
language plpgsql set search_path = '' as $$
begin
  if coalesce(auth.role(), 'service_role') = 'service_role' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    if not public.owns_venue(new.venue_id) then
      new.total_amount        := 0;
      new.platform_fee_amount := 0;
      new.merchant_amount     := 0;
      new.status              := 'PENDING';
    end if;
  elsif auth.uid() = old.customer_id and not public.owns_venue(old.venue_id) then
    new                       := old;
    new.status                := 'CANCELLED';
    new.updated_at            := now();
  end if;
  return new;
end;
$$;

drop trigger if exists booking_amounts on public.bookings;
create trigger booking_amounts before insert or update on public.bookings
  for each row execute function public.guard_booking_amounts();

drop trigger if exists bookings_touch on public.bookings;
create trigger bookings_touch before update on public.bookings
  for each row execute function public.touch_updated_at();

/* ────────────────────────────────────────────────────────────── relacje ── */

create table if not exists public.stories (
  id           uuid primary key default gen_random_uuid(),
  venue_id     text not null references public.venues on delete cascade,
  kind         text not null default 'photo' check (kind in ('photo', 'video', 'offer', 'event')),
  title        text,
  body         text,
  media_path   text,   -- ścieżka w Storage, nie adres — adres podpisujemy przy odczycie
  poster_path  text,
  cta_label    text,
  cta_url      text,
  published_at timestamptz not null default now(),
  -- Relacja znika sama. Doba to domyślna długość życia, jak w każdym innym
  -- miejscu, gdzie ludzie widzieli relacje — nie trzeba tego tłumaczyć.
  expires_at   timestamptz not null default now() + interval '24 hours',
  views        integer not null default 0,
  created_by   uuid references public.profiles on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists stories_live on public.stories (venue_id, published_at desc);

alter table public.stories enable row level security;

-- Dwie osobne ścieżki odczytu zamiast jednej z „albo". Niezalogowany widzi
-- wyłącznie to, co akurat trwa, i nie musi mieć prawa wołania `owns_venue`.
create policy "zywe relacje czyta kazdy" on public.stories
  for select using (now() between published_at and expires_at);
create policy "swoje relacje widzi lokal" on public.stories
  for select to authenticated using (public.owns_venue(venue_id));
create policy "relacje prowadzi lokal" on public.stories
  for all to authenticated
  using (public.owns_venue(venue_id)) with check (public.owns_venue(venue_id));

-- Kto obejrzał. Osobna tabela, bo licznika w `stories` nie można oddać
-- do zapisu gościom — podnieśliby też cudze.
create table if not exists public.story_views (
  story_id uuid not null references public.stories on delete cascade,
  user_id  uuid not null references public.profiles on delete cascade,
  seen_at  timestamptz not null default now(),
  primary key (story_id, user_id)
);

alter table public.story_views enable row level security;

create policy "swoje odslony" on public.story_views
  for select to authenticated
  using (auth.uid() = user_id or public.owns_venue(
    (select s.venue_id from public.stories s where s.id = story_views.story_id)));

/** Podbicie licznika. Wołane raz na widza — powtórka nic nie zmienia. */
create or replace function public.mark_story_seen(story uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare fresh integer;
begin
  if auth.uid() is null then return; end if;
  insert into public.story_views (story_id, user_id) values (story, auth.uid())
  on conflict do nothing;
  get diagnostics fresh = row_count;
  if fresh > 0 then
    update public.stories set views = views + 1 where id = story;
  end if;
end;
$$;

revoke all on function public.mark_story_seen(uuid) from public;
revoke all on function public.mark_story_seen(uuid) from anon;
grant execute on function public.mark_story_seen(uuid) to authenticated;
