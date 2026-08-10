/**
 * Google Places i Geocoding za jedną furtką.
 *
 * Klucz zostaje po stronie serwera. Klucz Google wpuszczony do aplikacji
 * mobilnej da się z niej wyjąć, a rachunek idzie na właściciela projektu —
 * dlatego telefon nie zna go wcale.
 *
 * Sekret bierzemy ze zmiennych środowiskowych albo z Vault — patrz
 * _shared/secret.ts. Wdrożone przez MCP Supabase.
 *
 * Wywołanie:
 *   POST { op: 'search',  query: 'Nokturn', lat?, lng? }
 *   POST { op: 'details', placeId: '...' }
 *   POST { op: 'geocode', address: 'ul. Józefa 12, Kraków' }
 *   POST { op: 'reverse', lat: 50.05, lng: 19.94 }
 */

import { secret } from '../_shared/secret.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

type Body =
  | { op: 'search'; query: string; lat?: number; lng?: number }
  | { op: 'details'; placeId: string }
  | { op: 'geocode'; address: string }
  | { op: 'reverse'; lat: number; lng: number };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Tylko POST' }, 405);

  const key = await secret('GOOGLE_MAPS_API_KEY');
  if (!key) return json({ error: 'Brak GOOGLE_MAPS_API_KEY — ani w środowisku, ani w Vault' }, 500);

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Nieczytelne dane' }, 400);
  }

  try {
    if (body.op === 'search') {
      const q = (body.query ?? '').trim();
      // Dwa znaki to próg z prototypu (`gHits`) — poniżej podpowiedzi nie mają sensu
      // i tylko podbijają rachunek za zapytania.
      if (q.length < 2) return json({ results: [] });

      const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.formattedAddress,places.rating,' +
            'places.userRatingCount,places.location,places.priceLevel',
        },
        body: JSON.stringify({
          textQuery: q,
          languageCode: 'pl',
          regionCode: 'PL',
          maxResultCount: 8,
          ...(body.lat != null && body.lng != null
            ? {
                locationBias: {
                  circle: { center: { latitude: body.lat, longitude: body.lng }, radius: 20000 },
                },
              }
            : {}),
        }),
      });

      if (!res.ok) {
        console.error('Places searchText', res.status, await res.text());
        return json({ error: 'Wyszukiwarka miejsc niedostępna' }, 502);
      }

      const data = await res.json();
      return json({
        results: (data.places ?? []).map((p: Record<string, any>) => ({
          placeId: p.id,
          name: p.displayName?.text ?? '',
          address: p.formattedAddress ?? '',
          rating: p.rating ?? null,
          votes: p.userRatingCount ?? 0,
          lat: p.location?.latitude ?? null,
          lng: p.location?.longitude ?? null,
          priceLevel: p.priceLevel ?? null,
        })),
      });
    }

    if (body.op === 'details') {
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(body.placeId)}?languageCode=pl`,
        {
          headers: {
            'X-Goog-Api-Key': key,
            'X-Goog-FieldMask':
              'id,displayName,formattedAddress,internationalPhoneNumber,websiteUri,' +
              'rating,userRatingCount,location,regularOpeningHours,priceLevel',
          },
        },
      );
      if (!res.ok) {
        console.error('Places details', res.status, await res.text());
        return json({ error: 'Szczegóły miejsca niedostępne' }, 502);
      }
      const p = await res.json();
      return json({
        placeId: p.id,
        name: p.displayName?.text ?? '',
        address: p.formattedAddress ?? '',
        phone: p.internationalPhoneNumber ?? null,
        site: p.websiteUri ?? null,
        rating: p.rating ?? null,
        votes: p.userRatingCount ?? 0,
        lat: p.location?.latitude ?? null,
        lng: p.location?.longitude ?? null,
        hours: p.regularOpeningHours?.weekdayDescriptions ?? [],
      });
    }

    // Geocoding — adres na współrzędne i z powrotem.
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('key', key);
    url.searchParams.set('language', 'pl');
    if (body.op === 'geocode') url.searchParams.set('address', body.address);
    else url.searchParams.set('latlng', `${body.lat},${body.lng}`);

    const res = await fetch(url);
    if (!res.ok) {
      console.error('Geocoding', res.status, await res.text());
      return json({ error: 'Geokodowanie niedostępne' }, 502);
    }

    const data = await res.json();
    const first = data.results?.[0];
    if (!first) return json({ result: null });

    const part = (type: string) =>
      first.address_components?.find((c: Record<string, any>) => c.types?.includes(type))?.long_name ??
      null;

    return json({
      result: {
        address: first.formatted_address,
        lat: first.geometry?.location?.lat ?? null,
        lng: first.geometry?.location?.lng ?? null,
        city: part('locality'),
        // dzielnica — po niej aplikacja grupuje lokale
        district: part('sublocality') ?? part('neighborhood'),
        country: part('country'),
      },
    });
  } catch (err) {
    console.error('places padło:', err);
    return json({ error: 'Usługa map chwilowo niedostępna' }, 502);
  }
});
