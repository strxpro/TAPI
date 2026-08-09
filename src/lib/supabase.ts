// React Native 0.81 ma własne URL, wystarczające dla supabase-js.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

/**
 * Połączenie z Supabase.
 *
 * Do aplikacji trafia wyłącznie adres projektu i klucz publikowalny — ten
 * jest jawny z założenia, a dostępu pilnuje RLS w bazie. Klucze płatnych
 * usług (Gemini, Google Maps) siedzą w funkcjach brzegowych i telefon
 * ich nie zna.
 *
 * Wartości idą przez `extra` w `app.json`, żeby dało się je podmienić
 * na budowie bez ruszania kodu.
 */

type Extra = { supabaseUrl?: string; supabaseKey?: string };

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const SUPABASE_URL = extra.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_KEY = extra.supabaseKey ?? process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '';

/** Czy w ogóle mamy czym się połączyć. Bez tego aplikacja chodzi na danych z pliku. */
export const hasBackend = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const supabase = createClient(SUPABASE_URL || 'http://localhost', SUPABASE_KEY || 'anon', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // W aplikacji mobilnej nie ma adresu z powrotem, więc sesji nie czytamy z URL-a.
    detectSessionInUrl: false,
  },
});
