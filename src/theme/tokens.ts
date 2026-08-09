/**
 * Tokeny projektowe TAPI — wypisane z Bywalec.dc.html.
 *
 * Źródłem prawdy jest prototyp, nie README. Każda wartość poniżej ma
 * odpowiednik w pliku HTML; nie ma tu wartości pośrednich ani wymyślonych.
 * Rozbieżności wobec README są opisane komentarzem przy wartości.
 */

/* ────────────────────────────────────────────────── motywy (linia 4048) ── */

export type ThemeName = 'papier' | 'noc';

export type Theme = {
  paper: string;
  ink: string;
  sub: string;
  surf: string;
  hair: string;
  dark: boolean;
};

export const themes: Record<ThemeName, Theme> = {
  papier: {
    paper: '#F4F2ED',
    ink: '#16181C',
    sub: '#6C6F75',
    surf: '#FFFFFF',
    hair: 'rgba(22,24,28,0.10)',
    dark: false,
  },
  noc: {
    paper: '#14161A',
    ink: '#EDECE8',
    sub: '#9A9DA3',
    surf: '#1D2025',
    hair: 'rgba(237,236,232,0.13)',
    dark: true,
  },
};

/**
 * Powierzchnie zawsze ciemne, niezależnie od motywu: splash (linia 112),
 * skaner, arkusz spalania kuponu, karta Smart Stand.
 * README podaje tu #0E1013 — w prototypie ten kolor jest wyłącznie
 * wypełnieniem kropki w logo (linia 164). Wygrywa prototyp.
 */
export const ALWAYS_DARK = { bg: '#14161A', ink: '#F4F2ED' } as const;

/* ───────────────────────────────────────────────── akcenty (linia 4052) ── */

export type AccentName = 'las' | 'kobalt' | 'glina' | 'sliwka';

export type Accent = {
  hex: string;
  soft: string;
  softDark: string;
  text: string;
  label: string;
};

export const accents: Record<AccentName, Accent> = {
  las: {
    hex: '#1F5A46',
    soft: 'rgba(31,90,70,0.10)',
    softDark: 'rgba(87,195,159,0.16)',
    text: '#57C39F',
    label: 'Las',
  },
  kobalt: {
    hex: '#2B4AC7',
    soft: 'rgba(43,74,199,0.10)',
    softDark: 'rgba(143,164,255,0.16)',
    text: '#9CB0FF',
    label: 'Kobalt',
  },
  glina: {
    hex: '#B65C36',
    soft: 'rgba(182,92,54,0.10)',
    softDark: 'rgba(232,150,110,0.16)',
    text: '#E8966E',
    label: 'Glina',
  },
  sliwka: {
    hex: '#6C3F6B',
    soft: 'rgba(108,63,107,0.10)',
    softDark: 'rgba(204,150,203,0.16)',
    text: '#CC96CB',
    label: 'Śliwka',
  },
};

/** Tekst na tle akcentu — 119 wystąpień w prototypie. */
export const ON_ACCENT = '#FBFAF7';
/** Ciepły akcent plakietek i pierścieni rang. */
export const WARM = '#D2A177';

/* ──────────────────────────────────────────────────────────── promienie ── */
/* Częstotliwość w prototypie: 999 (109×), 16 (61×), 13 (46×), 20 (44×),
   18 (40×), 14 (39×), 12 (32×), 15 (30×), 11 (23×), 17 (21×). */

export const radius = {
  xs: 4,
  /** plakietki nad zdjęciem karty (TAPI-standalone: „Dziś w mieście") */
  badge: 6,
  sm: 8,
  /** kwadratowe kafelki ikon 26 px w wierszach Odkrywaj */
  tile: 9,
  tile10: 10,
  md: 11,
  lg: 12,
  card: 13,
  card14: 14,
  card15: 15,
  card16: 16,
  row: 17,
  row18: 18,
  sheet: 20,
  sheet22: 22,
  /** karta stanu pustego */
  sheet24: 24,
  /** arkusz filtrów, górne rogi */
  sheet28: 28,
  pill: 999,
} as const;

/* ────────────────────────────────────────────────────────────── odstępy ── */

export const space = {
  screen: 20,
  card: 16,
  section: 28,
  afterHeading: 12,
  group: 7,
  groupLg: 12,
} as const;

/* ─────────────────────────────────────────────────────────────── cienie ── */
/* React Native nie zna ujemnego spreadu z CSS. Odwzorowujemy wygląd:
   ujemny spread zmniejsza zasięg i podnosi przesunięcie, więc skracamy
   promień i przenosimy różnicę na offsetY. */

export const shadow = {
  /** 0 2px 5px rgba(22,24,28,0.25) — 8× w prototypie */
  tap: {
    shadowColor: '#16181C',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  /** 0 18px 32px -20px rgba(22,24,28,0.85) — 5× */
  card: {
    shadowColor: '#16181C',
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 9 },
    elevation: 4,
  },
  /** 0 20px 44px -34px rgba(22,24,28,0.9) — 3× */
  soft: {
    shadowColor: '#16181C',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  /** 0 22px 44px -20px rgba(22,24,28,0.5) — pasek nawigacji, stan spoczynku */
  nav: {
    shadowColor: '#16181C',
    shadowOpacity: 0.34,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  /** 0 30px 56px -18px rgba(22,24,28,0.6) — pasek nawigacji przy przeciąganiu */
  navDrag: {
    shadowColor: '#16181C',
    shadowOpacity: 0.44,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 18,
  },
  /** 0 8px 18px -10px — pigułka pod aktywną zakładką */
  pill: {
    shadowColor: '#16181C',
    shadowOpacity: 0.22,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
} as const;

/* ───────────────────────────────────────────────────────────────── ruch ── */

export const ease = {
  /** domyślny easing całego produktu */
  standard: [0.16, 1, 0.3, 1] as const,
  /** sprężysty — README */
  spring: [0.24, 1.5, 0.4, 1] as const,
  /** pasek nawigacji i podnoszenie zakładki (prototyp, linia 4006/4009) */
  navBar: [0.28, 1.4, 0.4, 1] as const,
  /** przesuw pigułki w lewo/prawo (linia 4007) */
  pillLeft: [0.34, 1.42, 0.4, 1] as const,
  /** zmiana szerokości pigułki (linia 4007) */
  pillWidth: [0.2, 0.9, 0.35, 1] as const,
  /** skok ikony aktywnej zakładki (linia 4010) */
  icon: [0.3, 1.5, 0.45, 1] as const,
  /** wyjście splashu (linia 112) */
  splash: [0.7, 0, 0.3, 1] as const,
} as const;

export const duration = {
  micro: 300,
  microLg: 500,
  list: 500,
  /* Czasy klatek kluczowych z TAPI-standalone.html, sekcja @keyframes. */
  /** `rise` — wejście karty i wiersza listy */
  rise: 400,
  /** `popIn` — karta wchodząca z przeskalowaniem; 600 ms w wariancie dużym */
  popIn: 400,
  popInLg: 600,
  /** `growX` — rozwinięcie wyszukiwarki w przyklejonym nagłówku */
  growX: 440,
  /** `floaty` — unoszenie ikony iskierki */
  floaty: 3600,
  /** `dot` — pulsowanie kropki „na żywo" */
  dot: 1400,
  /** `skel` — pulsowanie szkieletu ładowania */
  skel: 1200,
  /** `shine` — refleks przelatujący po szkielecie */
  shine: 1300,
  /** `sheetUp` — wjazd arkusza od dołu */
  sheet: 550,
  /** `sheetDown` — zjazd komunikatu od góry */
  sheetDown: 450,
  /** czas życia komunikatu (`toast`) */
  toast: 2600,
  fog: 1250,
  navBar: 420,
  pillLeft: 340,
  pillWidth: 300,
  icon: 520,
  navUp: 700,
  color: 350,
} as const;

/** wejścia list: 500 ms ze stagger 55–80 ms */
export const stagger = { step: 65, min: 55, max: 80 } as const;

/* ───────────────────────────────────────────────────────────── typografia ── */

/**
 * Waga 400 nie występuje w prototypie ani razu — najlżejsza użyta to 500.
 * README podaje „400–800"; wygrywa prototyp, więc 400 nie jest ładowane.
 * Rozkład wag: 500 (79×), 600 (180×), 700 (79×), 800 (7×).
 */
export const fonts = {
  sans: 'PlusJakartaSans_500Medium',
  sansSemi: 'PlusJakartaSans_600SemiBold',
  sansBold: 'PlusJakartaSans_700Bold',
  sansExtra: 'PlusJakartaSans_800ExtraBold',
  serif: 'InstrumentSerif_400Regular',
  archivo: 'Archivo_600SemiBold',
  archivoBold: 'Archivo_700Bold',
} as const;

/**
 * Rozmiary tekstu wprost z prototypu. Częstotliwość:
 * 12,5 (103×) · 11,5 (81×) · 10,5 (68×) · 11 (62×) · 12 (57×) · 13 (54×)
 * · 10 (47×) · 13,5 (42×) · 14 (29×) · 9,5 (20×) · 15 (20×) · 9 (18×)
 *
 * Letter-spacing w prototypie jest w `em`; React Native liczy w punktach,
 * więc przeliczamy: px = fontSize × em.
 */
export const size = {
  /** Poniższe pięć wartości dochodzi z TAPI-standalone.html (ekran Odkrywaj):
   *  8,5 (miesiąc w kostce daty) · 15,5 (nazwa lokalu) · 20 (dzień w kostce)
   *  · 32 i 34 (nagłówek powitania i baner planera). */
  s85: 8.5,
  s9: 9,
  s95: 9.5,
  s10: 10,
  s105: 10.5,
  s11: 11,
  s115: 11.5,
  s12: 12,
  s125: 12.5,
  s13: 13,
  s135: 13.5,
  s14: 14,
  s145: 14.5,
  s15: 15,
  s155: 15.5,
  s19: 19,
  s20: 20,
  s21: 21,
  s22: 22,
  s24: 24,
  s26: 26,
  s27: 27,
  s30: 30,
  s32: 32,
  s34: 34,
} as const;

/** Najczęstsze wartości letter-spacing w em (do przeliczenia na punkty). */
export const tracking = {
  tightest: -0.04,
  tighter: -0.035,
  tight: -0.03,
  snug: -0.025,
  slight: -0.02,
  hair: -0.015,
  micro: -0.01,
  wide: 0.08,
  wider: 0.1,
  label: 0.14,
  labelWide: 0.16,
  widest: 0.2,
} as const;

/** em → punkty */
export const em = (fontSize: number, value: number) => fontSize * value;

export const icon = { size: 19, stroke: 1.8, strokeScan: 1.9 } as const;
