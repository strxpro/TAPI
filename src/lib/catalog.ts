import { useEffect, useState } from 'react';
import { hasBackend, supabase } from './supabase';
import { venues as localVenues, type Venue, type VenueCat } from '../data/venues';
import { cityEvents as localEvents, type CityEvent, type EventCat } from '../data/events';

/**
 * Katalog lokali i wydarzeń — z bazy, z zapasem w pliku.
 *
 * Zasada: aplikacja **zawsze** ma co pokazać. Startuje na danych wbudowanych
 * i podmienia je, gdy odpowie baza. Brak sieci, pusty projekt albo błąd
 * zapytania nie robią pustego ekranu, tylko zostawiają to, co było.
 *
 * Dzięki temu ekrany nie muszą znać stanu połączenia ani obsługiwać ładowania.
 */

/* ───────────────────────────────────────────────────────────────── lokale ── */

type VenueRow = {
  id: string;
  name: string;
  cat: VenueCat;
  cat_label: string;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  votes: number | null;
  price: string | null;
  district: string | null;
  address: string | null;
  phone: string | null;
  site: string | null;
  grad: string[] | null;
};

/**
 * Wiersz z bazy na kształt, którego oczekują ekrany.
 *
 * Pola, których baza jeszcze nie prowadzi (godziny, menu, opinie, nagroda),
 * bierzemy z danych wbudowanych dla tego samego identyfikatora — inaczej
 * wizytówka lokalu zrobiłaby się pusta.
 */
function toVenue(row: VenueRow): Venue {
  const fallback = localVenues.find((v) => v.id === row.id);
  const grad = row.grad && row.grad.length === 3 ? (row.grad as [string, string, string]) : null;

  return {
    id: row.id,
    name: row.name,
    cat: row.cat,
    catLabel: row.cat_label,
    lat: row.lat ?? fallback?.lat ?? 0,
    lng: row.lng ?? fallback?.lng ?? 0,
    rating: row.rating ?? 0,
    votes: row.votes ?? 0,
    price: row.price ?? '•',
    // Dystans liczy się względem gościa — dojdzie z geolokalizacją.
    dist: fallback?.dist ?? '',
    district: row.district ?? '',
    isOpen: fallback?.isOpen ?? true,
    closes: fallback?.closes ?? '',
    address: row.address ?? fallback?.address ?? '',
    phone: row.phone ?? fallback?.phone ?? '',
    site: row.site ?? fallback?.site ?? '',
    grad: grad ?? fallback?.grad ?? ['#EAD6DE', '#A8788C', '#4E3040'],
    hours: fallback?.hours ?? [],
    reward: fallback?.reward ?? '',
    code: fallback?.code ?? '',
    menu: fallback?.menu ?? [],
    opinions: fallback?.opinions ?? [],
    stories: fallback?.stories ?? [],
  };
}

/* ────────────────────────────────────────────────────────────── wydarzenia ── */

type EventRow = {
  id: string;
  venue_id: string | null;
  starts_at: string;
  price: number;
  cat: string | null;
  district: string | null;
  title_pl: string;
  title_en: string;
  title_it: string;
  place: string | null;
};

const DOW: [string, string, string][] = [
  ['Nd', 'Su', 'Dom'],
  ['Pn', 'Mo', 'Lun'],
  ['Wt', 'Tu', 'Mar'],
  ['Śr', 'We', 'Mer'],
  ['Cz', 'Th', 'Gio'],
  ['Pt', 'Fr', 'Ven'],
  ['So', 'Sa', 'Sab'],
];

function toEvent(row: EventRow): CityEvent {
  const when = new Date(row.starts_at);
  const now = new Date();
  // Ile dni od dziś — po tym idzie filtr terminu i plakietka nad tytułem.
  const days = Math.round((when.getTime() - now.getTime()) / 86_400_000);
  const fallback = localEvents.find((e) => e.venue === row.venue_id);

  return {
    id: row.id,
    venue: row.venue_id ?? '',
    d: Math.max(0, days),
    day: when.getDate(),
    dow: DOW[when.getDay()],
    time: when.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
    price: row.price,
    cat: (row.cat as EventCat) ?? 'koncerty',
    district: row.district ?? '',
    pl: row.title_pl,
    en: row.title_en,
    it: row.title_it,
    place: row.place ?? '',
    dist: fallback?.dist ?? '',
  };
}

/* ─────────────────────────────────────────────────────────────────── hooki ── */

export type Catalog = {
  venues: Venue[];
  events: CityEvent[];
  /** true, gdy pokazujemy dane z bazy, a nie zapas z pliku */
  live: boolean;
};

export function useCatalog(): Catalog {
  const [state, setState] = useState<Catalog>({
    venues: localVenues,
    events: localEvents,
    live: false,
  });

  useEffect(() => {
    if (!hasBackend) return;
    let alive = true;

    void (async () => {
      const [v, e] = await Promise.all([
        supabase.from('venues').select('*').order('rating', { ascending: false }),
        supabase.from('events').select('*').order('starts_at'),
      ]);

      if (!alive) return;
      // Pusta tabela to nie to samo co odpowiedź — na pustej zostajemy
      // przy danych wbudowanych, żeby ekran nie zrobił się pusty.
      const venues = v.error || !v.data?.length ? localVenues : (v.data as VenueRow[]).map(toVenue);
      const events = e.error || !e.data?.length ? localEvents : (e.data as EventRow[]).map(toEvent);
      const live = !v.error && Boolean(v.data?.length);

      setState({ venues, events, live });
    })();

    return () => {
      alive = false;
    };
  }, []);

  return state;
}
