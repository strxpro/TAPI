/**
 * Przepisanie lokalu z bazy na kształt, którego oczekuje widok.
 *
 * Prototyp powstał na danych z `src/app/mock-data.js` i czyta je po swojemu:
 * godziny jako krotki `['Pon', '17:00 – 1:00']`, gradient jako gotowy napis
 * CSS, ocena jako liczba. Baza trzyma to samo w postaci wygodnej do edycji
 * w panelu firmy — obiekty z nazwanymi polami i osobne kolumny.
 *
 * Tłumaczenie siedzi tutaj, w jednym miejscu, zamiast w widoku. Dzięki temu
 * ekrany zostają nietknięte, a gdy panel firmy zacznie zapisywać godziny,
 * zmienia się wyłącznie ten plik.
 */

type Row = Record<string, any>;

/** Krotki z prototypu: `['Pon', '17:00 – 1:00']`. */
type HourPair = [string, string];

/* ────────────────────────────────────────────────────── czy teraz otwarte ── */

/** Kolejność z bazy odpowiada `Date.getDay()`: niedziela jest zerem. */
const DNI = ['Ndz', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];

/** `'17:00 – 1:00'` → `[1020, 60]`. `'Zamknięte'` i śmieci → `null`. */
function zakres(value: string | undefined): [number, number] | null {
  const m = /(\d{1,2}):(\d{2})\D+(\d{1,2}):(\d{2})/.exec(value ?? '');
  if (!m) return null;
  return [Number(m[1]) * 60 + Number(m[2]), Number(m[3]) * 60 + Number(m[4])];
}

const godzina = (minuty: number) =>
  `${Math.floor(minuty / 60)}:${String(minuty % 60).padStart(2, '0')}`;

/**
 * Czy lokal jest teraz otwarty i o której zamyka.
 *
 * Sedno jest w przejściu przez północ. Wine bar czynny „17:00 – 3:00" o pierwszej
 * w nocy jest otwarty, choć w dzisiejszym wierszu doba już się skończyła —
 * trzeba zajrzeć do wczorajszego. Bez tego każdy lokal nocny wyglądałby na
 * zamknięty dokładnie wtedy, kiedy ma najwięcej gości.
 */
export function czyOtwarte(
  hours: Array<{ day: string; hours: string }> | null | undefined,
  teraz = new Date(),
): { isOpen: boolean; closes: string } {
  const wg = new Map((hours ?? []).map((h) => [h.day, h.hours]));
  const minuty = teraz.getHours() * 60 + teraz.getMinutes();

  const dzis = zakres(wg.get(DNI[teraz.getDay()]));
  if (dzis) {
    const [od, do_] = dzis;
    const przezPolnoc = do_ <= od;
    if (minuty >= od && (przezPolnoc || minuty < do_)) {
      return { isOpen: true, closes: godzina(do_) };
    }
  }

  const wczoraj = zakres(wg.get(DNI[(teraz.getDay() + 6) % 7]));
  if (wczoraj) {
    const [od, do_] = wczoraj;
    if (do_ <= od && minuty < do_) return { isOpen: true, closes: godzina(do_) };
  }

  // Zamknięte: pokazujemy najbliższą godzinę zamknięcia, żeby napis „do 19:00"
  // miał co wyświetlić, gdy lokal otworzy się później tego samego dnia.
  return { isOpen: false, closes: dzis ? godzina(dzis[1]) : '' };
}

/* ─────────────────────────────────────────────────────────────── odległość ── */

export type Punkt = { lat: number; lng: number };

/** Odległość po kuli, w metrach. */
function metry(a: Punkt, b: Punkt): number {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Napis o odległości w postaci, jakiej używa widok: „320 m", „1,4 km".
 *
 * Bez pozycji gościa zwracamy myślnik zamiast zmyślonej liczby. Prototyp miał
 * tu stałe wartości i wyglądały wiarygodnie — ale „320 m" od kogoś, kto jest
 * w innym mieście, to nie jest drobiazg do przemilczenia.
 */
export function odleglosc(od: Punkt | null, lokal: Row): string {
  if (!od || typeof lokal.lat !== 'number' || typeof lokal.lng !== 'number') return '—';
  const m = metry(od, { lat: lokal.lat, lng: lokal.lng });
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  return `${(m / 1000).toFixed(1).replace('.', ',')} km`;
}

/* ──────────────────────────────────────────────────────────────── gradient ── */

/**
 * Baza trzyma trzy kolory, widok chce gotowy napis CSS.
 *
 * Kąt musi zostać `150deg`: wizytówka robi z niego dwa dodatkowe ujęcia przez
 * `grad.replace('150deg', '20deg')`. Zmiana kąta tutaj po cichu wyłączyłaby
 * tamten efekt, bo `replace` nie miałby czego znaleźć.
 */
export function gradient(kolory: string[] | null | undefined): string {
  const k = kolory ?? [];
  if (k.length < 3) return 'linear-gradient(150deg, #E8E4DC, #B9B2A6 55%, #4A453C)';
  return `linear-gradient(150deg, ${k[0]}, ${k[1]} 55%, ${k[2]})`;
}

/* ────────────────────────────────────────────────────────────── cały lokal ── */

export function naWidok(
  row: Row,
  relacje: Array<{ id?: string; title: string | null; body: string | null }>,
  od: Punkt | null,
): Row {
  const { isOpen, closes } = czyOtwarte(row.hours);

  return {
    id: row.id,
    name: row.name,
    cat: row.cat,
    catLabel: row.cat_label,
    lat: row.lat,
    lng: row.lng,
    // `rating` przychodzi z Postgresa jako napis (numeric), a widok woła na nim
    // `toFixed(1)` — bez tej zamiany wysypuje się cała lista.
    rating: Number(row.rating ?? 0),
    votes: Number(row.votes ?? 0),
    price: row.price ?? '••',
    district: row.district ?? '',
    address: row.address ?? '',
    phone: row.phone ?? '',
    site: row.site ?? '',
    grad: gradient(row.grad),
    dist: odleglosc(od, row),
    isOpen,
    closes,
    reward: row.reward ?? '',
    code: row.reward_code ?? '',
    hours: ((row.hours ?? []) as Array<{ day: string; hours: string }>).map(
      (h): HourPair => [h.day, h.hours],
    ),
    menu: ((row.menu ?? []) as Array<{ name: string; note: string; price: string }>).map((m) => [
      m.name,
      m.note,
      m.price,
    ]),
    opinions: ((row.opinions ?? []) as Array<{ author: string; stars: number; text: string }>).map(
      (o) => [o.author, o.stars, o.text],
    ),
    // Trzeci element to identyfikator relacji — widok czyta tylko dwa
    // pierwsze, a odtwarzacz potrzebuje go do zapisania odsłony. Dane
    // testowe mają krotki dwuelementowe i to nadal działa: wtedy po prostu
    // nie ma czego zapisywać.
    stories: relacje.map((s) => [s.title ?? '', s.body ?? '', s.id ?? null]),
  };
}

/* ────────────────────────────────────────────────────────────── wydarzenia ── */

/** Kolejność jak w `Date.getDay()`. Skróty takie, jakich używa prototyp. */
const DOW = {
  pl: ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'],
  en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  it: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
};

const MIESIACE = {
  pl: ['STY', 'LUT', 'MAR', 'KWI', 'MAJ', 'CZE', 'LIP', 'SIE', 'WRZ', 'PAŹ', 'LIS', 'GRU'],
  en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
  it: ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'],
};

/**
 * Ile pełnych dni dzieli dziś od wydarzenia.
 *
 * Liczymy po dobach kalendarzowych, nie po godzinach: koncert dziś o 23:00
 * i jutro o 1:00 dzieli dwie godziny, ale to „dziś" i „jutro", i tak trzeba
 * je podpisać. Widok robi z tej liczby etykiety JUTRO / WEEKEND / ZA TYDZIEŃ.
 */
function zaIleDni(kiedy: Date, dzis: Date): number {
  const a = Date.UTC(dzis.getFullYear(), dzis.getMonth(), dzis.getDate());
  const b = Date.UTC(kiedy.getFullYear(), kiedy.getMonth(), kiedy.getDate());
  return Math.round((b - a) / 86400000);
}

export function wydarzenieNaWidok(
  row: Row,
  lokal: { lat?: number; lng?: number } | undefined,
  od: Punkt | null,
  dzis = new Date(),
): Row {
  const kiedy = new Date(row.starts_at);

  return {
    id: row.id,
    venue: row.venue_id,
    d: zaIleDni(kiedy, dzis),
    day: kiedy.getDate(),
    // Prototyp miał tu wpisane na sztywno „SIE" — na danych z pliku nikt tego
    // nie zauważył, bo wszystkie wydarzenia były sierpniowe. Z prawdziwymi
    // datami wrześniowy koncert podpisałby się sierpniem.
    mon: [MIESIACE.pl[kiedy.getMonth()], MIESIACE.en[kiedy.getMonth()], MIESIACE.it[kiedy.getMonth()]],
    dow: [DOW.pl[kiedy.getDay()], DOW.en[kiedy.getDay()], DOW.it[kiedy.getDay()]],
    time: `${kiedy.getHours()}:${String(kiedy.getMinutes()).padStart(2, '0')}`,
    price: Number(row.price ?? 0),
    cat: row.cat ?? '',
    district: row.district ?? '',
    pl: row.title_pl ?? '',
    en: row.title_en ?? row.title_pl ?? '',
    it: row.title_it ?? row.title_pl ?? '',
    place: row.place ?? '',
    dist: odleglosc(od, lokal ?? {}),
  };
}
