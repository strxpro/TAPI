/**
 * Odczyt sekretu — najpierw zmienne środowiskowe, potem Vault.
 *
 * Supabase ma dwa osobne miejsca na sekrety i łatwo je pomylić:
 *
 *   Edge Functions → Secrets   zmienne środowiskowe, `Deno.env.get()`
 *   Integrations → Vault       zaszyfrowane w bazie, widoczne w SQL
 *
 * Klucz wpisany w jednym jest **niewidoczny w drugim**. Kosztowało nas to
 * jedną rundę „przecież wpisałem klucze, a nie działa", więc zamiast wymagać
 * wpisywania ich dwa razy — sprawdzamy oba. Najpierw środowisko, bo jest
 * szybsze i nie wymaga zapytania do bazy.
 *
 * Odczyt z Vault idzie przez `public.get_secret`, którą wykonać może wyłącznie
 * `service_role`. Klucz roli serwisowej funkcja dostaje od Supabase i nigdy
 * nie opuszcza serwera.
 *
 * Wynik trzymamy w pamięci na czas życia instancji — Vault nie musi
 * odpowiadać przy każdym zapytaniu.
 */

const cache = new Map<string, string>();

export async function secret(name: string): Promise<string | null> {
  const cached = cache.get(name);
  if (cached) return cached;

  const fromEnv = Deno.env.get(name);
  if (fromEnv) {
    cache.set(name, fromEnv);
    return fromEnv;
  }

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return null;

  try {
    const res = await fetch(`${url}/rest/v1/rpc/get_secret`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ secret_name: name }),
    });
    if (!res.ok) {
      console.error('Vault odmówił', name, res.status, await res.text());
      return null;
    }
    const value = await res.json();
    if (typeof value !== 'string' || !value) return null;
    cache.set(name, value);
    return value;
  } catch (err) {
    console.error('Odczyt sekretu padł:', err);
    return null;
  }
}
