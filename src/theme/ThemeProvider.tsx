import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  accents,
  themes,
  type Accent,
  type AccentName,
  type Theme,
  type ThemeName,
} from './tokens';

const KEY_MODE = 'tapi.themeMode';
const KEY_ACCENT = 'tapi.accent';

/** 'auto' idzie za ustawieniem systemowym telefonu. */
export type ThemeMode = 'auto' | ThemeName;

type Ctx = {
  /** rozstrzygnięty motyw — nigdy 'auto' */
  theme: Theme;
  themeName: ThemeName;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  accent: Accent;
  accentName: AccentName;
  setAccent: (a: AccentName) => void;
  /** wariant tła akcentu właściwy dla bieżącego motywu */
  accentSoft: string;
  /**
   * Akcent w wersji do pisania po tle strony — w prototypie zmienna `at`
   * (linia 5626): w ciemnym motywie jaśniejszy wariant, w jasnym pełny kolor.
   */
  accentText: string;
  ready: boolean;
};

const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('auto');
  const [accentName, setAccentState] = useState<AccentName>('las');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([AsyncStorage.getItem(KEY_MODE), AsyncStorage.getItem(KEY_ACCENT)])
      .then(([m, a]) => {
        if (!alive) return;
        if (m === 'auto' || m === 'papier' || m === 'noc') setModeState(m);
        if (a && a in accents) setAccentState(a as AccentName);
      })
      .catch(() => {})
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    void AsyncStorage.setItem(KEY_MODE, m).catch(() => {});
  }, []);

  const setAccent = useCallback((a: AccentName) => {
    setAccentState(a);
    void AsyncStorage.setItem(KEY_ACCENT, a).catch(() => {});
  }, []);

  const value = useMemo<Ctx>(() => {
    const themeName: ThemeName = mode === 'auto' ? (system === 'dark' ? 'noc' : 'papier') : mode;
    const theme = themes[themeName];
    const accent = accents[accentName];
    return {
      theme,
      themeName,
      mode,
      setMode,
      accent,
      accentName,
      setAccent,
      accentSoft: theme.dark ? accent.softDark : accent.soft,
      accentText: theme.dark ? accent.text : accent.hex,
      ready,
    };
  }, [mode, system, accentName, setMode, setAccent, ready]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme musi być wewnątrz <ThemeProvider>');
  return ctx;
}
