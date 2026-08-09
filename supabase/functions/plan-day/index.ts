/**
 * Planer AI — układa trasę po mieście na podstawie czterech odpowiedzi.
 *
 * Klucz do Gemini **nigdy nie trafia do aplikacji**. Da się go wyciągnąć
 * z każdej paczki mobilnej, a jest płatny — dlatego rozmowę z modelem
 * prowadzi ta funkcja, a telefon woła tylko ją, ze swoim tokenem sesji.
 *
 * Wgranie:
 *   supabase secrets set GEMINI_API_KEY=...
 *   supabase functions deploy plan-day
 */

const MODEL = 'gemini-flash-latest';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

type Body = {
  days: number;
  budget: number | null;
  pace: 'spokojne' | 'normal' | 'intensywne';
  who: string;
  interests: string[];
  lang: 'pl' | 'en' | 'it';
  city?: string;
};

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

/** Kształt odpowiedzi wymuszamy schematem, nie prośbą w prompcie. */
const SCHEMA = {
  type: 'object',
  properties: {
    days: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          day: { type: 'integer' },
          title: { type: 'string' },
          stops: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                time: { type: 'string' },
                name: { type: 'string' },
                note: { type: 'string' },
                area: { type: 'string' },
                price: { type: 'integer' },
                minutes: { type: 'integer' },
              },
              required: ['time', 'name', 'note', 'price', 'minutes'],
            },
          },
        },
        required: ['day', 'title', 'stops'],
      },
    },
    total: { type: 'integer' },
  },
  required: ['days', 'total'],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Tylko POST' }, 405);

  const key = Deno.env.get('GEMINI_API_KEY');
  if (!key) return json({ error: 'Brak GEMINI_API_KEY po stronie serwera' }, 500);

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Nieczytelne dane' }, 400);
  }

  if (!body.days || body.days < 1 || body.days > 14) {
    return json({ error: 'Liczba dni musi mieścić się w 1–14' }, 400);
  }

  const city = body.city ?? 'Kraków';
  const langName = { pl: 'polsku', en: 'angielsku', it: 'włosku' }[body.lang] ?? 'polsku';
  const budget = body.budget ? `${body.budget} zł na osobę na cały pobyt` : 'bez limitu';

  const prompt = [
    `Ułóż plan zwiedzania miasta ${city} na ${body.days} dni.`,
    `Budżet: ${budget}. Tempo: ${body.pace}. Skład: ${body.who}.`,
    `Zainteresowania: ${body.interests.join(', ') || 'brak wskazań'}.`,
    '',
    `Odpowiedz po ${langName}.`,
    'Każdy dzień ma mieć od trzech do sześciu przystanków z godziną, nazwą',
    'miejsca, jednym zdaniem uzasadnienia, dzielnicą, ceną w złotych',
    '(0 gdy wstęp wolny) i czasem w minutach.',
    'Liczby mają się sumować do budżetu albo być poniżej niego.',
    'Podawaj prawdziwe miejsca, nie wymyślaj nazw lokali.',
  ].join('\n');

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          responseMimeType: 'application/json',
          responseSchema: SCHEMA,
        },
      }),
    });

    if (!res.ok) {
      // Treści błędu od dostawcy nie podajemy dalej — mogłaby wynieść szczegóły
      // konfiguracji. Do dziennika, nie do telefonu.
      console.error('Gemini odpowiedziało', res.status, await res.text());
      return json({ error: 'Planer chwilowo niedostępny' }, 502);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return json({ error: 'Pusta odpowiedź modelu' }, 502);

    return json({ plan: JSON.parse(text) });
  } catch (err) {
    console.error('plan-day padło:', err);
    return json({ error: 'Planer chwilowo niedostępny' }, 502);
  }
});
