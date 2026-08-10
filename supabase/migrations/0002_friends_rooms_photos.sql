-- Znajomi, pokoje wieczoru, czat i zdjęcia odsłaniane następnego dnia.
--
-- Ta migracja jest już wgrana na projekt (`friends_rooms_photos`
-- + `hide_room_helper_from_api`). Trzymamy ją w repo, żeby dało się odtworzyć
-- bazę od zera.
--
-- Najważniejsza zasada siedzi w RLS, nie w aplikacji: cudze zdjęcia z pokoju
-- stają się widoczne dopiero po `reveal_at`. Swoje widać zawsze i zawsze można
-- je skasować. Gdyby ta reguła była w kliencie, wystarczyłby podmieniony
-- klient, żeby podejrzeć wieczór przed czasem.
--
-- Sprawdzone testem z asercją: przed terminem widać 1 zdjęcie (swoje),
-- po terminie 3 (cała kolekcja).

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

/* ────────────────────────────────────────────────────────────── znajomi ── */

create table public.friendships (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles on delete cascade,
  friend_id  uuid not null references public.profiles on delete cascade,
  status     text not null default 'pending' check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamptz not null default now(),
  unique (user_id, friend_id),
  constraint bez_samego_siebie check (user_id <> friend_id)
);

alter table public.friendships enable row level security;

create policy "znajomosci widza obie strony" on public.friendships
  for select using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "zaproszenie wysyla nadawca" on public.friendships
  for insert with check (auth.uid() = user_id);
create policy "zaproszenie przyjmuje odbiorca" on public.friendships
  for update using (auth.uid() = friend_id or auth.uid() = user_id);
create policy "znajomosc zrywa kazda ze stron" on public.friendships
  for delete using (auth.uid() = user_id or auth.uid() = friend_id);

/* ──────────────────────────────────────────────────── pokoje wieczoru ── */

create table public.rooms (
  id         uuid primary key default gen_random_uuid(),
  -- kod do dołączenia, krótki i czytelny na głos
  code       text not null unique,
  name       text not null,
  venue_id   text references public.venues on delete set null,
  created_by uuid not null references public.profiles on delete cascade,
  starts_at  timestamptz not null default now(),
  -- moment odsłonięcia zdjęć; domyślnie następnego dnia rano
  reveal_at  timestamptz not null,
  created_at timestamptz not null default now()
);

create index rooms_code_idx on public.rooms (code);

create table public.room_members (
  room_id   uuid references public.rooms on delete cascade,
  user_id   uuid references public.profiles on delete cascade,
  role      text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

alter table public.rooms enable row level security;
alter table public.room_members enable row level security;

-- Czy jestem w tym pokoju. Osobna funkcja, bo bez niej zasady na `rooms`
-- i `room_members` odwoływałyby się nawzajem i wpadały w pętlę.
--
-- Siedzi w schemacie `private`, bo PostgREST go nie wystawia. Uprawnienia
-- roli `authenticated` odebrać nie można — zasady RLS wykonują się w kontekście
-- pytającego i przestałyby działać.
create function private.is_room_member(target uuid) returns boolean
language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.room_members m
    where m.room_id = target and m.user_id = auth.uid()
  );
$$;

create policy "pokoj widzi czlonek" on public.rooms
  for select using (private.is_room_member(id) or auth.uid() = created_by);
create policy "pokoj zaklada zalogowany" on public.rooms
  for insert with check (auth.uid() = created_by);
create policy "pokoj zmienia zalozyciel" on public.rooms
  for update using (auth.uid() = created_by);

create policy "sklad widzi czlonek" on public.room_members
  for select using (private.is_room_member(room_id));
create policy "dolaczam sam siebie" on public.room_members
  for insert with check (auth.uid() = user_id);
create policy "wychodze sam" on public.room_members
  for delete using (auth.uid() = user_id);

/* ──────────────────────────────────────────────────────────────── czat ── */

create table public.room_messages (
  id         uuid primary key default gen_random_uuid(),
  room_id    uuid not null references public.rooms on delete cascade,
  user_id    uuid not null references public.profiles on delete cascade,
  -- 'text'     — zwykła wiadomość
  -- 'place'    — „idziemy tutaj", z lokalem w payload
  -- 'location' — punkt na mapie, z lat i lng w payload
  kind       text not null default 'text' check (kind in ('text', 'place', 'location')),
  body       text,
  payload    jsonb,
  created_at timestamptz not null default now()
);

create index room_messages_room_idx on public.room_messages (room_id, created_at desc);

alter table public.room_messages enable row level security;

create policy "czat czyta czlonek" on public.room_messages
  for select using (private.is_room_member(room_id));
create policy "pisze czlonek we wlasnym imieniu" on public.room_messages
  for insert with check (auth.uid() = user_id and private.is_room_member(room_id));
create policy "kasuje swoje" on public.room_messages
  for delete using (auth.uid() = user_id);

/* ─────────────────────────────────────────── zdjecia odslaniane nazajutrz ── */

create table public.room_photos (
  id           uuid primary key default gen_random_uuid(),
  room_id      uuid not null references public.rooms on delete cascade,
  user_id      uuid not null references public.profiles on delete cascade,
  storage_path text not null,
  caption      text,
  created_at   timestamptz not null default now()
);

create index room_photos_room_idx on public.room_photos (room_id, created_at);

alter table public.room_photos enable row level security;

-- Tu jest cała mechanika wieczoru.
create policy "swoje od razu, cudze po odsłonieciu" on public.room_photos
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.rooms r
      where r.id = room_id
        and now() >= r.reveal_at
        and private.is_room_member(r.id)
    )
  );

create policy "wrzuca czlonek we wlasnym imieniu" on public.room_photos
  for insert with check (auth.uid() = user_id and private.is_room_member(room_id));

-- „swoje zdjęcia można zobaczyć i usunąć w razie czego" — także po odsłonięciu.
create policy "kasuje swoje zdjecia" on public.room_photos
  for delete using (auth.uid() = user_id);

/* ─────────────────────────────────────────────── dolaczanie po kodzie ── */

-- Kod pokoju jest kluczem do wejścia, więc samo `rooms` zostaje zamknięte.
-- Dołączanie idzie przez funkcję: sprawdza kod, dopisuje wołającego do składu
-- i zwraca pokój. Dzięki temu nikt nie dostaje prawa czytania cudzych pokoi.
--
-- Ta jedna funkcja **ma** być wołalna przez zalogowanych i linter Supabase
-- słusznie ją pokazuje — to jest wejście dla gościa z kodem, nie przeoczenie.
create function public.join_room(room_code text)
returns table (id uuid, name text, code text, reveal_at timestamptz)
language plpgsql security definer set search_path = '' as $$
declare found public.rooms;
begin
  if auth.uid() is null then
    raise exception 'Trzeba być zalogowanym';
  end if;

  select * into found from public.rooms r where upper(r.code) = upper(room_code);
  if not found.id is not null then
    raise exception 'Nie ma pokoju o takim kodzie';
  end if;

  insert into public.room_members (room_id, user_id)
  values (found.id, auth.uid())
  on conflict do nothing;

  return query select found.id, found.name, found.code, found.reveal_at;
end;
$$;

revoke execute on function public.join_room(text) from public, anon;
grant execute on function public.join_room(text) to authenticated;
