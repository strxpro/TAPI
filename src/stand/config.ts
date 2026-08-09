/**
 * Konfiguracja stojaka TAPI — to, co użytkownik zmienia na żywo
 * w konfiguratorze: kolor obudowy, treść naklejki, ocena.
 */

import { ALWAYS_DARK, WARM } from '../theme/tokens';

export type StandColor = 'black' | 'white';

export type StandConfig = {
  color: StandColor;
  /** nazwa lokalu na górze naklejki */
  venue: string;
  /** co koduje QR — docelowo głęboki odnośnik do wizytówki */
  qrPayload: string;
  /** zachęta pod kodem */
  cta: string;
  /** 0 = bez gwiazdek, 1–5 = tyle wypełnionych */
  stars: number;
};

/** Kolory brył z prototypu (DECYZJE.md) i tokenów. */
export const STAND_BODY: Record<StandColor, string> = {
  black: '#111111',
  white: '#FFFFFF',
};

/**
 * Kolor druku na naklejce. Na czarnej obudowie jasny, na białej ciemny —
 * inaczej napisy znikają. Wartości z palety, nie dobierane.
 */
export const STAND_INK: Record<StandColor, string> = {
  black: ALWAYS_DARK.ink,
  white: '#16181C',
};

/** Gwiazdki idą ciepłym akcentem plakietek. */
export const STAND_STAR = WARM;

export const defaultStand: StandConfig = {
  color: 'black',
  venue: 'Ristorante Bella',
  qrPayload: 'https://tapi.app/v/demo',
  cta: 'Zeskanuj lub przybliż telefon, aby odebrać nagrodę',
  stars: 5,
};
