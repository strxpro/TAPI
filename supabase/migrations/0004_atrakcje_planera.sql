-- Miejsca, z których planer układa dzień.
--
-- Dotąd dwadzieścia atrakcji żyło wyłącznie w `src/app/mock-data.js`, więc
-- dołożenie jednej wymagało przebudowania aplikacji i wydania nowej wersji.
-- Teraz to wiersz w bazie.
--
-- Zasiew: `node tools/seed-from-mock.mjs` wypisuje polecenia na podstawie
-- tego samego pliku, którego używa aplikacja — bez przepisywania ręką.

create table if not exists public.spots (
  id         text primary key,
  pl         text not null,
  en         text,
  it         text,
  tags       text[] not null default '{}',
  price      integer not null default 0,
  -- ile zajmuje, w minutach
  dur        integer not null default 60 check (dur > 0),
  -- pora dnia: rano, popołudnie, wieczór
  slot       text not null check (slot in ('am', 'pm', 'eve')),
  area       text,
  -- gdy atrakcja jest lokalem z katalogu, planer podlinkuje wizytówkę
  venue_id   text references public.venues on delete set null,
  note_pl    text,
  note_en    text,
  created_at timestamptz not null default now()
);

create index if not exists spots_slot on public.spots (slot, price);

alter table public.spots enable row level security;

-- Katalog atrakcji jest publiczny; zmienia go wyłącznie serwer.
create policy "atrakcje czyta kazdy" on public.spots for select using (true);
