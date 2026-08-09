import { hasBackend, supabase } from './supabase';
import type { Lang } from '../i18n/dict';

/**
 * Wywołania funkcji brzegowych: planer AI i mapy.
 *
 * Aplikacja nie rozmawia z Google ani z Gemini wprost — klucze do obu są
 * płatne i dałoby się je wyjąć z paczki. Telefon woła własne funkcje,
 * podpisując się tokenem sesji Supabase.
 *
 * Każda funkcja zwraca `null` zamiast rzucać: brak sieci nie może wywrócić
 * ekranu, a wołający i tak musi mieć wariant awaryjny.
 */

/* ─────────────────────────────────────────────────────────── planer AI ── */

export type TripStop = {
  time: string;
  name: string;
  note: string;
  area?: string;
  price: number;
  minutes: number;
};

export type TripDay = { day: number; title: string; stops: TripStop[] };
export type TripPlan = { days: TripDay[]; total: number };

export type TripRequest = {
  days: number;
  budget: number | null;
  pace: 'spokojne' | 'normal' | 'intensywne';
  who: string;
  interests: string[];
  lang: Lang;
  city?: string;
};

export async function planDay(req: TripRequest): Promise<TripPlan | null> {
  if (!hasBackend) return null;
  try {
    const { data, error } = await supabase.functions.invoke<{ plan: TripPlan }>('plan-day', {
      body: req,
    });
    if (error || !data?.plan) return null;
    return data.plan;
  } catch {
    return null;
  }
}

/* ──────────────────────────────────────────────────────── mapy i miejsca ── */

export type PlaceHit = {
  placeId: string;
  name: string;
  address: string;
  rating: number | null;
  votes: number;
  lat: number | null;
  lng: number | null;
};

/** Wyszukiwarka lokali przy rejestracji firmy — to, co w prototypie robi `gHits`. */
export async function searchPlaces(
  query: string,
  near?: { lat: number; lng: number },
): Promise<PlaceHit[]> {
  if (!hasBackend || query.trim().length < 2) return [];
  try {
    const { data, error } = await supabase.functions.invoke<{ results: PlaceHit[] }>('places', {
      body: { op: 'search', query, lat: near?.lat, lng: near?.lng },
    });
    if (error || !data?.results) return [];
    return data.results;
  } catch {
    return [];
  }
}

export type GeoResult = {
  address: string;
  lat: number | null;
  lng: number | null;
  city: string | null;
  district: string | null;
  country: string | null;
};

/** Adres → współrzędne. */
export async function geocode(address: string): Promise<GeoResult | null> {
  return callGeo({ op: 'geocode', address });
}

/** Współrzędne → adres i dzielnica. Po tym drugim aplikacja grupuje lokale. */
export async function reverseGeocode(lat: number, lng: number): Promise<GeoResult | null> {
  return callGeo({ op: 'reverse', lat, lng });
}

async function callGeo(body: Record<string, unknown>): Promise<GeoResult | null> {
  if (!hasBackend) return null;
  try {
    const { data, error } = await supabase.functions.invoke<{ result: GeoResult | null }>('places', {
      body,
    });
    if (error) return null;
    return data?.result ?? null;
  } catch {
    return null;
  }
}
