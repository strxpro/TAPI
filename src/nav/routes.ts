import type { Key } from '../i18n/dict';

/**
 * Kolejność z prototypu — `navOrder` w TAPI-standalone.html:
 * discover · map · scan · friends · profile
 *
 * Pięć równych pozycji w jednym pasku. Skaner nie jest wyniesionym
 * przyciskiem pośrodku — README opisuje to niezgodnie z prototypem.
 *
 * Uwaga na zmianę wobec starszego `Bywalec.dc.html`: czwartą pozycją było
 * tam „Wyjazd". W nowym prototypie są tam „Znajomi", a plan wyjazdu stał się
 * ekranem otwieranym z banera planera AI — tak jak wizytówka lokalu, czyli
 * poza paskiem.
 */
export const TABS = ['discover', 'map', 'scan', 'friends', 'profile'] as const;
export type Tab = (typeof TABS)[number];

export const TAB_LABEL: Record<Tab, Key> = {
  discover: 'navDiscover',
  map: 'navMap',
  scan: 'navScan',
  friends: 'navFriends',
  profile: 'navProfile',
};
