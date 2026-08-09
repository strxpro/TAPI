/**
 * Logika ekranu Odkrywaj — przeniesiona z TAPI-standalone.html
 * (`sugFor()`, `evHits`, `todayCards`, `evWhen`).
 *
 * Filtrowania i sortowania tu nie ma. Prototyp miał je w osobnym arkuszu,
 * ale zostało zdjęte na prośbę właściciela: listę zawęża wyłącznie
 * wyszukiwarka. Wybór terminu przy wydarzeniach zostaje — to nie filtr
 * listy lokali, tylko sposób przeglądania kalendarza.
 *
 * Sam widok niczego nie liczy — bierze gotowe listy stąd. Dzięki temu
 * podmiana danych na backend ruszy tylko ten plik.
 */

import type { Lang } from '../../i18n/dict';
import { cityEvents, type CityEvent } from '../../data/events';
import { venues, type Venue } from '../../data/venues';

export type WhenId = 'all' | 'tom' | 'week' | 'next' | 'free';

const pick = <T,>(lang: Lang, pl: T, en: T, it: T): T => (lang === 'pl' ? pl : lang === 'it' ? it : en);

/* ─────────────────────────────────────────────────────── etykiety kategorii ── */

/**
 * `catLabel` lokalu jest w danych po polsku. Prototyp przepuszcza go przez
 * `dt()`: najpierw `dataMap` (pl → en), potem `itMap` (en → it). Tu ta sama
 * ścieżka, spisana wprost — dotyczy czterech wartości, jakie występują.
 */
const CAT_LABEL: Record<string, [string, string]> = {
  'Wine bar': ['Wine bar', 'Wine bar'],
  Kawiarnia: ['Coffee bar', 'Caffetteria'],
  Wydarzenia: ['Events', 'Eventi'],
  Bistro: ['Bistro', 'Bistrot'],
};

export function catLabel(lang: Lang, plLabel: string): string {
  if (lang === 'pl') return plLabel;
  const pair = CAT_LABEL[plLabel];
  if (!pair) return plLabel;
  return lang === 'it' ? pair[1] : pair[0];
}

/* ──────────────────────────────────────────────────────────── lista lokali ── */

/** Jedyne zawężenie listy: to, co gość wpisał w wyszukiwarkę. */
export function searchVenues(query: string, list: Venue[] = venues): Venue[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((v) =>
    (v.name + ' ' + v.catLabel + ' ' + v.district).toLowerCase().includes(q),
  );
}

/* ────────────────────────────────────────────────────────────── podpowiedzi ── */

export type Suggestion = {
  key: string;
  kind: 'venue' | 'event' | 'tag' | 'area';
  /** nazwa rozbita na część przed trafieniem, trafienie i resztę */
  pre: string;
  hit: string;
  post: string;
  sub: string;
  label: string;
  /** co zrobić po tapnięciu */
  action: { type: 'venue'; id: string } | { type: 'query'; text: string };
};

type SugCopy = {
  sugVenue: string;
  sugEvent: string;
  sugCategory: string;
  sugArea: string;
  sugFilterList: string;
  sugShowNearby: string;
};

/**
 * Do sześciu pozycji: lokale, wydarzenia, kategorie, dzielnice — w tej
 * kolejności. Kategoria i dzielnica nie ustawiają już filtra (nie ma go),
 * tylko wpisują się w wyszukiwarkę — efekt dla gościa jest ten sam.
 */
export function suggestFor(lang: Lang, query: string, c: SugCopy): Suggestion[] {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];

  const split = (s: string) => {
    const i = s.toLowerCase().indexOf(q);
    return i < 0
      ? { pre: s, hit: '', post: '' }
      : { pre: s.slice(0, i), hit: s.slice(i, i + q.length), post: s.slice(i + q.length) };
  };

  const out: Suggestion[] = [];

  venues.forEach((v) => {
    if (!(v.name + ' ' + v.catLabel + ' ' + v.district).toLowerCase().includes(q)) return;
    out.push({
      key: 'v-' + v.id,
      kind: 'venue',
      ...split(v.name),
      sub: catLabel(lang, v.catLabel) + ' · ' + v.district + ' · ' + v.dist,
      label: c.sugVenue,
      action: { type: 'venue', id: v.id },
    });
  });

  cityEvents.forEach((e) => {
    const name = pick(lang, e.pl, e.en, e.it);
    if (!(name + ' ' + e.place).toLowerCase().includes(q)) return;
    out.push({
      key: 'e-' + e.id,
      kind: 'event',
      ...split(name),
      sub: e.place + ' · ' + e.time,
      label: c.sugEvent,
      action: { type: 'venue', id: e.venue },
    });
  });

  (
    [
      ['Jedzenie', 'Food', 'Cibo'],
      ['Kawa', 'Coffee', 'Caffè'],
      ['Wieczorem', 'Nightlife', 'Serata'],
      ['Wydarzenia', 'Events', 'Eventi'],
    ] as [string, string, string][]
  ).forEach((names) => {
    const label = pick(lang, names[0], names[1], names[2]);
    if (!label.toLowerCase().includes(q)) return;
    out.push({
      key: 'c-' + names[0],
      kind: 'tag',
      ...split(label),
      sub: c.sugFilterList,
      label: c.sugCategory,
      action: { type: 'query', text: label },
    });
  });

  districts.forEach((a) => {
    if (!a.toLowerCase().includes(q)) return;
    out.push({
      key: 'a-' + a,
      kind: 'area',
      ...split(a),
      sub: c.sugShowNearby,
      label: c.sugArea,
      action: { type: 'query', text: a },
    });
  });

  return out.slice(0, 6);
}

export const districts: string[] = venues
  .map((v) => v.district)
  .filter((d, i, arr) => arr.indexOf(d) === i);

/* ────────────────────────────────────────────────────────────── wydarzenia ── */

export function filterEvents(when: WhenId, list: CityEvent[] = cityEvents): CityEvent[] {
  if (when === 'tom') return list.filter((e) => e.d <= 1);
  if (when === 'week') return list.filter((e) => e.d >= 3 && e.d <= 5);
  if (when === 'next') return list.filter((e) => e.d >= 6 && e.d <= 9);
  if (when === 'free') return list.filter((e) => e.price === 0);
  return list;
}

export function whenOptions(lang: Lang): { id: WhenId; label: string }[] {
  const rows: [WhenId, [string, string, string]][] = [
    ['all', ['Wszystkie', 'All', 'Tutto']],
    ['tom', ['Jutro', 'Tomorrow', 'Domani']],
    ['week', ['Weekend', 'This weekend', 'Questo fine settimana']],
    ['next', ['Za tydzień', 'Next week', 'Prossima settimana']],
    ['free', ['Bezpłatne', 'Free entry', 'Ingresso libero']],
  ];
  return rows.map(([id, l]) => ({ id, label: pick(lang, l[0], l[1], l[2]) }));
}

/** Plakietka nad tytułem wydarzenia — zależna od odległości w dniach. */
export function eventTag(lang: Lang, d: number): string {
  if (d <= 1) return pick(lang, 'JUTRO', 'TOMORROW', 'DOMANI');
  if (d <= 5) return 'WEEKEND';
  if (d <= 9) return pick(lang, 'ZA TYDZIEŃ', 'NEXT WEEK', 'PROSSIMA SETT.');
  return pick(lang, 'PÓŹNIEJ', 'LATER', 'PIÙ AVANTI');
}

/** Miesiąc w kostce daty. Prototyp ma tu sierpień na sztywno. */
export function eventMonth(lang: Lang): string {
  return pick(lang, 'SIE', 'AUG', 'AGO');
}

export function eventDow(lang: Lang, dow: [string, string, string]): string {
  return pick(lang, dow[0], dow[1], dow[2]);
}

/* ─────────────────────────────────────────────────────────── dziś w mieście ── */

export type TodayCard = {
  venue: string;
  title: string;
  when: string;
  place: string;
  tag: string;
  grad: [string, string, string];
};

export function todayCards(lang: Lang): TodayCard[] {
  return [
    {
      venue: 'forum',
      title: pick(lang, 'Silent disco, 3 kanały', 'Silent disco, 3 channels', 'Silent disco, 3 canali'),
      when: '23:00',
      place: 'Hala Forum',
      tag: 'LIVE',
      grad: ['#EFDDC4', '#D2A177', '#7A5535'],
    },
    {
      venue: 'ostra',
      title: pick(lang, 'Nowa karta jesienna', 'New autumn menu', 'Nuovo menu d’autunno'),
      when: '17:00',
      place: 'Ostra Kuchnia',
      tag: pick(lang, 'DZIŚ', 'TODAY', 'OGGI'),
      grad: ['#DDE7D6', '#7EA083', '#33503C'],
    },
    {
      venue: 'nokturn',
      title: pick(lang, 'Dostawa z Friuli', 'Delivery from Friuli', 'Consegna dal Friuli'),
      when: '19:00',
      place: 'Nokturn',
      tag: pick(lang, 'NOWE', 'NEW', 'NUOVO'),
      grad: ['#EAD6DE', '#A8788C', '#4E3040'],
    },
  ];
}

export { pick };
