/**
 * Zainteresowania gościa — przepisane 1:1 z TAPI-standalone.html (`interestDefs`).
 *
 * Zapisanie pierwszego wybranego przestawia filtr kategorii na `cat` — tak
 * działa `saveInterests` w prototypie.
 *
 * Włoskie etykiety pochodzą z mapy `itMap` prototypu (reguła „Your interests: …").
 */

import type { VenueCat } from './venues';

export type Interest = {
  id: string;
  pl: string;
  en: string;
  it: string;
  cat: VenueCat;
};

export const interests: Interest[] = [
  { id: 'kawa', pl: 'Kawa', en: 'Coffee', it: 'Caffè', cat: 'kawa' },
  { id: 'wino', pl: 'Wino', en: 'Wine', it: 'Vino', cat: 'noc' },
  { id: 'sniadania', pl: 'Śniadania', en: 'Breakfast', it: 'Colazioni', cat: 'gastro' },
  { id: 'koncerty', pl: 'Koncerty', en: 'Live music', it: 'Concerti', cat: 'event' },
  { id: 'kluby', pl: 'Kluby', en: 'Clubs', it: 'Club', cat: 'noc' },
  { id: 'sztuka', pl: 'Sztuka', en: 'Art', it: 'Arte', cat: 'event' },
  { id: 'street', pl: 'Street food', en: 'Street food', it: 'Street food', cat: 'gastro' },
  { id: 'targi', pl: 'Targi', en: 'Markets', it: 'Mercatini', cat: 'event' },
  { id: 'kino', pl: 'Kino', en: 'Cinema', it: 'Cinema', cat: 'event' },
  { id: 'winyle', pl: 'Winyle', en: 'Vinyl', it: 'Vinile', cat: 'noc' },
];
