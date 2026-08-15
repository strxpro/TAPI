import { supabase, hasBackend } from '../lib/supabase';
import { planDay, searchPlaces, geocode, reverseGeocode } from '../lib/api';
import { cue, type Cue } from '../ui/feedback';
import { naWidok, wydarzenieNaWidok, type Punkt } from './venueShape';

/**
 * Co potrafi most.
 *
 * Każda pozycja to jedna rzecz, której strona nie zrobi sama: konto, baza,
 * model AI, mapy. Wygląd zostaje w prototypie — tu jest wyłącznie silnik.
 *
 * Zasada dla wszystkich: nie rzucamy niczego, czego strona nie umiałaby
 * obsłużyć. Błąd wraca jako `{ error }`, a nie jako wywrócony most.
 */

type Params = Record<string, unknown>;
type Handler = (params: Params) => Promise<unknown>;

const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback);
const num = (v: unknown, fallback = 0) => (typeof v === 'number' ? v : fallback);

/* ─────────────────────────────────────────────────────────────── konto ── */

/**
 * Logowanie kodem z e-maila. Supabase wysyła sześciocyfrowy kod, dokładnie
 * jak ścieżka w prototypie: adres → kod → konto gotowe.
 *
 * `shouldCreateUser: true` znaczy, że rejestracja i logowanie to jedno
 * wejście — nie ma osobnej podzakładki „załóż konto".
 */
const authSendCode: Handler = async (p) => {
  const email = str(p.email).trim();
  if (!email.includes('@')) return { error: 'Podaj poprawny adres e-mail' };
  if (!hasBackend) return { error: 'Brak połączenia z bazą' };

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      // Konto firmowe rozpoznajemy od pierwszego wejścia — trafia do profilu
      // przez wyzwalacz `handle_new_user`.
      data: { is_business: p.business === true },
    },
  });
  return error ? { error: error.message } : { sent: true };
};

const authVerifyCode: Handler = async (p) => {
  const email = str(p.email).trim();
  const token = str(p.code).trim();
  if (token.length < 6) return { error: 'Kod ma sześć cyfr' };

  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) return { error: error.message };

  // Znacznik firmy z metadanych wchodzi do profilu przy pierwszym logowaniu.
  if (p.business === true && data.user) {
    await supabase.from('profiles').update({ is_business: true }).eq('id', data.user.id);
  }
  return sessionShape();
};

const authGoogle: Handler = async () => {
  if (!hasBackend) return { error: 'Brak połączenia z bazą' };
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { skipBrowserRedirect: true, redirectTo: 'tapi://auth' },
  });
  if (error) return { error: error.message };
  // Adres otwiera warstwa natywna — strona nie ma jak pokazać okna zgody.
  return { url: data.url };
};

const authSignOut: Handler = async () => {
  await supabase.auth.signOut();
  return { ok: true };
};

async function sessionShape() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { user: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email, city, is_business, lang')
    .eq('id', data.user.id)
    .maybeSingle();

  return {
    user: {
      id: data.user.id,
      email: data.user.email ?? profile?.email ?? '',
      name: profile?.name ?? data.user.user_metadata?.full_name ?? '',
      city: profile?.city ?? 'Kraków',
      isBusiness: profile?.is_business ?? false,
    },
  };
}

/* ──────────────────────────────────────────────────────────────── baza ── */

/**
 * Katalog lokali w kształcie, jakiego oczekuje widok.
 *
 * `lat` i `lng` są opcjonalne — gdy strona zna pozycję gościa, odległości są
 * prawdziwe; gdy nie, w ich miejscu jest myślnik. Przepisanie kształtu robi
 * `venueShape.ts`, żeby ekrany zostały nietknięte.
 */
const dbVenues: Handler = async (p) => {
  if (!hasBackend) return { error: 'Brak połączenia z bazą' };
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .order('rating', { ascending: false });
  if (error) return { error: error.message };

  // Relacje jednym zapytaniem zamiast jednego na lokal. RLS i tak odda
  // wyłącznie te, które akurat trwają.
  const { data: stories } = await supabase
    .from('stories')
    .select('id, venue_id, title, body')
    .order('published_at', { ascending: false });

  const wgLokalu = new Map<string, Array<{ id: string; title: string | null; body: string | null }>>();
  for (const s of stories ?? []) {
    const lista = wgLokalu.get(s.venue_id) ?? [];
    lista.push({ id: s.id, title: s.title, body: s.body });
    wgLokalu.set(s.venue_id, lista);
  }

  const od: Punkt | null =
    typeof p.lat === 'number' && typeof p.lng === 'number'
      ? { lat: p.lat as number, lng: p.lng as number }
      : null;

  return { venues: (data ?? []).map((v) => naWidok(v, wgLokalu.get(v.id) ?? [], od)) };
};

/**
 * Wydarzenia, które dopiero będą.
 *
 * Odcięcie przeszłości robimy tutaj, a nie w widoku: aplikacja odpowiada na
 * pytanie „co się dzieje w mieście", a wczorajszy koncert nie jest odpowiedzią.
 * Widok liczy z daty etykiety JUTRO / WEEKEND, więc ujemna liczba dni
 * podpisałaby wydarzenie sprzed tygodnia słowem „JUTRO".
 */
const dbEvents: Handler = async (p) => {
  if (!hasBackend) return { error: 'Brak połączenia z bazą' };
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at');
  if (error) return { error: error.message };

  // Odległość liczy się od lokalu, a wydarzenie zna tylko jego identyfikator.
  const { data: lokale } = await supabase.from('venues').select('id, lat, lng');
  const wg = new Map((lokale ?? []).map((v) => [v.id, v]));

  const od: Punkt | null =
    typeof p.lat === 'number' && typeof p.lng === 'number'
      ? { lat: p.lat as number, lng: p.lng as number }
      : null;

  return { events: (data ?? []).map((e) => wydarzenieNaWidok(e, wg.get(e.venue_id), od)) };
};

const dbToggleSaved: Handler = async (p) => {
  const venueId = str(p.venueId);
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return { error: 'Trzeba być zalogowanym' };

  const { data: existing } = await supabase
    .from('saved_venues')
    .select('venue_id')
    .eq('user_id', u.user.id)
    .eq('venue_id', venueId)
    .maybeSingle();

  if (existing) {
    await supabase.from('saved_venues').delete().eq('user_id', u.user.id).eq('venue_id', venueId);
    return { saved: false };
  }
  await supabase.from('saved_venues').insert({ user_id: u.user.id, venue_id: venueId });
  return { saved: true };
};

/* ────────────────────────────────────────────────────────────── relacje ── */

/**
 * Odsłona relacji.
 *
 * Licznika w `stories` nie da się oddać do zapisu gościom — podnieśliby też
 * cudze. Robi to funkcja w bazie, która najpierw zapisuje, kto obejrzał,
 * i podbija licznik wyłącznie przy pierwszym obejrzeniu.
 *
 * Cisza przy niepowodzeniu jest tu zamierzona: nikt nie ogląda relacji po to,
 * żeby dowiedzieć się, że licznik nie zadziałał.
 */
const storiesSeen: Handler = async (p) => {
  const id = str(p.id);
  if (!id || !hasBackend) return { ok: false };
  const { error } = await supabase.rpc('mark_story_seen', { story: id });
  return { ok: !error };
};

/** Lokal prowadzony przez zalogowane konto. Bez niego nie ma co publikować. */
async function mojLokal() {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return { error: 'Trzeba być zalogowanym' as const };
  const { data } = await supabase
    .from('venues')
    .select('id, name')
    .eq('owner_id', u.user.id)
    .limit(1)
    .maybeSingle();
  if (!data) return { error: 'Nie widzę lokalu przypisanego do tego konta' as const };
  return { venue: data, userId: u.user.id };
}

/**
 * Publikacja relacji przez panel firmy.
 *
 * Czas życia podaje lokal — doba to domyślna, ale zapowiedź wydarzenia
 * za tydzień nie ma sensu gasnąć jutro rano.
 *
 * Do którego lokalu trafia, ustala serwer po właścicielu konta, a nie strona.
 * Gdyby identyfikator przychodził z ekranu, dałoby się nim podstawić cudzy —
 * RLS by to odrzuciło, ale lepiej nie budować drogi, którą trzeba zamykać.
 */
const storiesPublish: Handler = async (p) => {
  if (!hasBackend) return { error: 'Brak połączenia z bazą' };

  const title = str(p.title).trim();
  if (title.length < 3) return { error: 'Napisz, co ogłaszasz' };

  const moj = await mojLokal();
  if ('error' in moj) return { error: moj.error };

  const godzin = Math.min(Math.max(num(p.hours, 24), 1), 24 * 30);
  const { data, error } = await supabase
    .from('stories')
    .insert({
      venue_id: moj.venue.id,
      kind: str(p.kind, 'offer'),
      title,
      body: str(p.body) || null,
      created_by: moj.userId,
      expires_at: new Date(Date.now() + godzin * 3600_000).toISOString(),
    })
    .select('id, title, expires_at')
    .single();

  return error ? { error: error.message } : { story: data, venue: moj.venue.name };
};

/** Relacje lokalu, także wygasłe — właściciel widzi swoje archiwum. */
const storiesMine: Handler = async () => {
  if (!hasBackend) return { error: 'Brak połączenia z bazą' };
  const moj = await mojLokal();
  if ('error' in moj) return { error: moj.error };

  const { data, error } = await supabase
    .from('stories')
    .select('id, title, body, views, published_at, expires_at')
    .eq('venue_id', moj.venue.id)
    .order('published_at', { ascending: false })
    .limit(30);
  if (error) return { error: error.message };

  const teraz = Date.now();
  return {
    stories: (data ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      body: s.body,
      views: s.views,
      live: new Date(s.expires_at).getTime() > teraz,
    })),
  };
};

const storiesRemove: Handler = async (p) => {
  if (!hasBackend) return { error: 'Brak połączenia z bazą' };
  const { error } = await supabase.from('stories').delete().eq('id', str(p.id));
  return error ? { error: error.message } : { ok: true };
};

/* ────────────────────────────────────────────────────── pokoje wieczoru ── */

const roomsJoin: Handler = async (p) => {
  const code = str(p.code).trim();
  if (code.length < 4) return { error: 'Kod ma co najmniej cztery znaki' };
  const { data, error } = await supabase.rpc('join_room', { room_code: code });
  return error ? { error: error.message } : { room: data?.[0] ?? null };
};

const roomsMine: Handler = async () => {
  const { data, error } = await supabase
    .from('rooms')
    .select('id, code, name, reveal_at, starts_at')
    .order('starts_at', { ascending: false });
  return error ? { error: error.message } : { rooms: data ?? [] };
};

/**
 * Zdjęcia pokoju. Reguła „cudze dopiero nazajutrz" siedzi w RLS bazy, więc
 * tutaj nie ma czego sprawdzać — baza po prostu nie odda tego, czego jeszcze
 * nie wolno pokazać.
 */
const roomsPhotos: Handler = async (p) => {
  const roomId = str(p.roomId);
  const { data, error } = await supabase
    .from('room_photos')
    .select('id, user_id, storage_path, caption, created_at')
    .eq('room_id', roomId)
    .order('created_at');
  return error ? { error: error.message } : { photos: data ?? [] };
};

const roomsSend: Handler = async (p) => {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return { error: 'Trzeba być zalogowanym' };

  const { error } = await supabase.from('room_messages').insert({
    room_id: str(p.roomId),
    user_id: u.user.id,
    kind: str(p.kind, 'text'),
    body: str(p.body) || null,
    payload: (p.payload as object) ?? null,
  });
  return error ? { error: error.message } : { sent: true };
};

const roomsMessages: Handler = async (p) => {
  const { data, error } = await supabase
    .from('room_messages')
    .select('id, user_id, kind, body, payload, created_at')
    .eq('room_id', str(p.roomId))
    .order('created_at');
  return error ? { error: error.message } : { messages: data ?? [] };
};

/* ────────────────────────────────────────────────────── planer i mapy ── */

const aiPlanDay: Handler = async (p) => {
  const plan = await planDay({
    days: num(p.days, 1),
    budget: typeof p.budget === 'number' ? p.budget : null,
    pace: (str(p.pace, 'normal') as 'spokojne' | 'normal' | 'intensywne') ?? 'normal',
    who: str(p.who, 'solo'),
    interests: Array.isArray(p.interests) ? (p.interests as string[]) : [],
    lang: (str(p.lang, 'pl') as 'pl' | 'en' | 'it') ?? 'pl',
    city: str(p.city, 'Kraków'),
  });
  return plan ? { plan } : { error: 'Planer chwilowo niedostępny' };
};

const mapsSearch: Handler = async (p) => ({
  results: await searchPlaces(
    str(p.query),
    typeof p.lat === 'number' && typeof p.lng === 'number'
      ? { lat: p.lat as number, lng: p.lng as number }
      : undefined,
  ),
});

const mapsGeocode: Handler = async (p) => ({ result: await geocode(str(p.address)) });
const mapsReverse: Handler = async (p) => ({
  result: await reverseGeocode(num(p.lat), num(p.lng)),
});

/* ─────────────────────────────────────────────────────────────── czucie ── */

/** Prototyp woła to zamiast `navigator.vibrate`, którego iPhone nie ma. */
const feel: Handler = async (p) => {
  cue(str(p.kind, 'select') as Cue);
  return { ok: true };
};

/* ────────────────────────────────────────────────────────────── katalog ── */

export const HANDLERS: Record<string, Handler> = {
  'auth.session': sessionShape,
  'auth.sendCode': authSendCode,
  'auth.verifyCode': authVerifyCode,
  'auth.google': authGoogle,
  'auth.signOut': authSignOut,

  'db.venues': dbVenues,
  'db.events': dbEvents,
  'db.toggleSaved': dbToggleSaved,

  'stories.seen': storiesSeen,
  'stories.publish': storiesPublish,
  'stories.mine': storiesMine,
  'stories.remove': storiesRemove,

  'rooms.join': roomsJoin,
  'rooms.mine': roomsMine,
  'rooms.photos': roomsPhotos,
  'rooms.messages': roomsMessages,
  'rooms.send': roomsSend,

  'ai.planDay': aiPlanDay,

  'maps.search': mapsSearch,
  'maps.geocode': mapsGeocode,
  'maps.reverse': mapsReverse,

  feel,
};

/** Nazwy do podglądu w diagnostyce. */
export const BRIDGE_METHODS = Object.keys(HANDLERS);
