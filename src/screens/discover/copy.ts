/**
 * Kopia ekranu Odkrywaj — z TAPI-standalone.html.
 *
 * Prototyp trzyma polski i angielski wprost w `renderVals()`, a włoski
 * dokłada osobną warstwą: mapą `itMap` i regułami `itRules`, przez które
 * przechodzi każdy tekst w `tr()`. Poniższe tłumaczenia są wyjęte dokładnie
 * z tej mapy — nic tu nie jest tłumaczone od nowa.
 *
 * Teksty arkusza filtrów zniknęły razem z samym arkuszem — listę zawęża
 * teraz wyłącznie wyszukiwarka.
 *
 * Dwa miejsca, których mapa nie pokrywa, dostają angielski i są opisane
 * w ROZBIEZNOSCI.md: `evEmptyAll` i `evSaved`. Baner planera AI jest
 * w prototypie **wyłącznie po polsku** — powielamy to 1:1 i czekamy
 * na zatwierdzoną kopię EN/IT.
 */

import type { Lang } from '../../i18n/dict';

type Copy = {
  /* nagłówek */
  greeting: string;
  subGreeting: string;

  /* baner planera AI */
  plannerBadge: string;
  plannerKicker: string;
  plannerTitle: string;
  plannerSub: string;
  plannerCta: string;

  /* podpowiedzi */
  sugVenue: string;
  sugEvent: string;
  sugCategory: string;
  sugArea: string;
  sugFilterList: string;
  sugShowNearby: string;

  /* wiersz zainteresowań i karta */
  intBtnLabel: string;
  intBtnSub: string;
  intTitle: string;
  intSub: string;
  intSkip: string;
  intPickOne: string;
  intEdit: string;
  intActive: string;
  intSaved: string;

  /* sekcje */
  todayCount: string;
  nearRadius: string;
  evHead: string;

  /* stan pusty listy lokali */
  emptyTitle: string;
  emptySub: string;
  emptyCta: string;

  /* wydarzenia */
  evEmptyAll: string;
  evFree: string;
  evSaved: string;
  evUnsaved: string;

  /* zapisywanie lokalu */
  venueSaved: string;
  venueUnsaved: string;
};

const pl: Copy = {
  greeting: 'Dobry wieczór',
  subGreeting: 'Czwartek, 18:24 · Kazimierz',

  plannerBadge: 'AI Planner',
  plannerKicker: 'Twój idealny dzień',
  plannerTitle: 'Zaplanuj swój dzień w mieście',
  plannerSub: 'Odpowiedz na 4 pytania i odbierz gotową trasę na wyjście solo lub z ekipą.',
  plannerCta: 'Rozpocznij planowanie',

  sugVenue: 'Lokal',
  sugEvent: 'Wydarzenie',
  sugCategory: 'Kategoria',
  sugArea: 'Dzielnica',
  sugFilterList: 'Pokaż w wyszukiwarce',
  sugShowNearby: 'Pokaż wszystko w okolicy',

  intBtnLabel: 'Znajdź, co cię interesuje',
  intBtnSub: 'Kawa, wino, koncerty, targi, kino…',
  intTitle: 'Co cię interesuje?',
  intSub: 'Wybierz kilka rzeczy — dopasujemy kanał i wyślemy powiadomienie, gdy coś takiego pojawi się obok.',
  intSkip: 'Później',
  intPickOne: 'Wybierz choć jedno',
  intEdit: 'Zmień',
  intActive: 'Twoje kategorie: ',
  intSaved: 'Gotowe. Damy znać, gdy pojawi się coś z twoich kategorii.',

  todayCount: '3',
  nearRadius: '900 m',
  evHead: 'Nadchodzące wydarzenia',

  emptyTitle: 'Nic nie pasuje',
  emptySub:
    'Zbyt ciasne filtry albo literówka w wyszukiwaniu. Zacznij od czystej listy — miasto ma więcej do pokazania.',
  emptyCta: 'Wyczyść wszystko',

  evEmptyAll: 'W tym terminie nic nie zaplanowano. Zobacz „Wszystkie" — w tym tygodniu dzieje się więcej.',
  evFree: 'wejście wolne',
  evSaved: 'Zapisane. Przypomnimy dzień wcześniej.',
  evUnsaved: 'Usunięte z zapisanych.',

  venueSaved: 'Zapisano w twojej liście.',
  venueUnsaved: 'Usunięto z zapisanych.',
};

const en: Copy = {
  greeting: 'Good evening',
  subGreeting: 'Thursday, 6:24 pm · Kazimierz',

  plannerBadge: pl.plannerBadge,
  plannerKicker: pl.plannerKicker,
  plannerTitle: pl.plannerTitle,
  plannerSub: pl.plannerSub,
  plannerCta: pl.plannerCta,

  sugVenue: 'Venue',
  sugEvent: 'Event',
  sugCategory: 'Category',
  sugArea: 'Area',
  sugFilterList: 'Show in search',
  sugShowNearby: 'Show everything nearby',

  intBtnLabel: 'Find what you are into',
  intBtnSub: 'Coffee, wine, gigs, markets, cinema…',
  intTitle: 'What are you into?',
  intSub: 'Pick a few — we tune your feed and ping you when something like it pops up nearby.',
  intSkip: 'Later',
  intPickOne: 'Pick at least one',
  intEdit: 'Edit',
  intActive: 'Your interests: ',
  intSaved: 'Done. We will ping you when something matches.',

  todayCount: '3',
  nearRadius: '900 m',
  evHead: 'Upcoming events',

  emptyTitle: 'Nothing matches',
  emptySub:
    'Filters too tight, or a typo in the search. Start from a clean list — the city has more to show.',
  emptyCta: 'Clear everything',

  evEmptyAll: 'Nothing scheduled then. Try “All” — there is more this week.',
  evFree: 'free entry',
  evSaved: 'Saved. We will remind you a day before.',
  evUnsaved: 'Removed from saved.',

  venueSaved: 'Saved to your list.',
  venueUnsaved: 'Removed from saved.',
};

const it: Copy = {
  greeting: 'Buonasera',
  subGreeting: 'Giovedì, 18:24 · Kazimierz',

  plannerBadge: pl.plannerBadge,
  plannerKicker: pl.plannerKicker,
  plannerTitle: pl.plannerTitle,
  plannerSub: pl.plannerSub,
  plannerCta: pl.plannerCta,

  sugVenue: 'Locale',
  sugEvent: 'Evento',
  sugCategory: 'Categoria',
  sugArea: 'Zona',
  sugFilterList: 'Mostra nella ricerca',
  sugShowNearby: 'Mostra tutto qui vicino',

  intBtnLabel: 'Trova quello che ti piace',
  intBtnSub: 'Caffè, vino, concerti, mercatini, cinema…',
  intTitle: 'Cosa ti interessa?',
  intSub:
    'Scegline qualcuno — adattiamo il feed e ti avvisiamo quando spunta qualcosa di simile vicino a te.',
  intSkip: 'Più tardi',
  intPickOne: 'Scegline almeno uno',
  intEdit: 'Modifica',
  intActive: 'I tuoi interessi: ',
  intSaved: 'Fatto. Ti avviseremo quando arriva qualcosa di adatto.',

  todayCount: '3',
  nearRadius: '900 m',
  evHead: 'Prossimi eventi',

  emptyTitle: 'Nessun risultato',
  emptySub:
    'Filtri troppo stretti o un errore di battitura. Riparti da una lista pulita — la città ha altro da mostrare.',
  emptyCta: 'Azzera tutto',

  // brak we `itMap` prototypu — zostaje angielski, patrz ROZBIEZNOSCI.md
  evEmptyAll: en.evEmptyAll,
  evFree: 'ingresso libero',
  evSaved: en.evSaved,
  evUnsaved: 'Rimosso dai salvati.',

  venueSaved: 'Salvato nella tua lista.',
  venueUnsaved: 'Rimosso dai salvati.',
};

export const discoverCopy: Record<Lang, Copy> = { pl, en, it };

/* ────────────────────────────────────────────── teksty z liczbą w środku ── */

/** Polska odmiana „miejsce": 1 · 2–4 · reszta. Prototyp, `plMiejsc`. */
function places(n: number): string {
  if (n === 1) return ' miejsce';
  return n >= 2 && n <= 4 ? ' miejsca' : ' miejsc';
}

/** „4 miejsca w okolicy" · „4 places nearby" · „4 locali qui vicino" */
export function resultLine(lang: Lang, n: number): string {
  if (lang === 'pl') return n + places(n) + ' w okolicy';
  return lang === 'it' ? `${n} locali qui vicino` : `${n} places nearby`;
}

/** Licznik przy nagłówku wydarzeń: „8 w kalendarzu" */
export function eventCount(lang: Lang, n: number): string {
  if (lang === 'pl') return `${n} w kalendarzu`;
  return lang === 'it' ? `${n} in calendario` : `${n} scheduled`;
}

/** CTA karty zainteresowań: „Włącz powiadomienia (3)" */
export function alertsCta(lang: Lang, n: number): string {
  if (!n) return discoverCopy[lang].intPickOne;
  if (lang === 'pl') return `Włącz powiadomienia (${n})`;
  return lang === 'it' ? `Attiva le notifiche (${n})` : `Turn on alerts (${n})`;
}
