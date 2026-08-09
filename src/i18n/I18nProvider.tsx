import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { FALLBACK_LANG, LANGS, dict, type Key, type Lang } from './dict';

const STORAGE_KEY = 'tapi.lang';

/**
 * Wykrycie języka telefonu.
 * Docelowo dojdą kolejne języki — wtedy zmienia się tylko tablica LANGS
 * i słownik, ta funkcja zostaje bez zmian.
 */
export function detectLang(): Lang {
  try {
    for (const locale of getLocales()) {
      const code = locale.languageCode?.toLowerCase();
      if (code && (LANGS as readonly string[]).includes(code)) return code as Lang;
    }
  } catch {
    /* w razie czego schodzimy do języka awaryjnego */
  }
  return FALLBACK_LANG;
}

type Ctx = {
  lang: Lang;
  /** true, dopóki nie wiemy, czy użytkownik ma zapisany własny wybór */
  ready: boolean;
  setLang: (l: Lang) => void;
  t: (k: Key) => string;
  /** doraźne teksty poza słownikiem — kolejność: pl, en, it */
  l3: (p: string, e: string, i: string) => string;
};

const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);
  const [ready, setReady] = useState(false);

  // Wybór użytkownika ma pierwszeństwo przed językiem telefonu.
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (!alive) return;
        if (saved && (LANGS as readonly string[]).includes(saved)) {
          setLangState(saved as Lang);
        }
      })
      .catch(() => {})
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    void AsyncStorage.setItem(STORAGE_KEY, l).catch(() => {});
  }, []);

  const value = useMemo<Ctx>(() => {
    const table = dict[lang];
    return {
      lang,
      ready,
      setLang,
      t: (k) => table[k],
      l3: (p, e, i) => (lang === 'pl' ? p : lang === 'it' ? i : e),
    };
  }, [lang, ready, setLang]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error('useI18n musi być wewnątrz <I18nProvider>');
  return ctx;
}

/** Skrót na najczęstszy przypadek: const t = useT(); t('navDiscover') */
export function useT() {
  return useI18n().t;
}
