/**
 * Stan obrotu stojaka. Trzymamy go w zwykłym `ref`, nie w stanie Reacta —
 * pętla renderowania czyta go co klatkę i przerysowywanie komponentu
 * sześćdziesiąt razy na sekundę byłoby czystą stratą.
 */

export type SpinState = {
  /** obrót wokół osi pionowej, w radianach */
  y: number;
  /** przechył góra–dół, ograniczony, żeby model nie wjeżdżał pod podłogę */
  x: number;
  /** ustawienie z chwili złapania palcem — przesunięcie liczymy od niego */
  base: { x: number; y: number };
  dragging: boolean;
  /** znacznik ostatniego dotknięcia — po chwili bezruchu wraca autoobrót */
  touched: number;
};

/** Granice przechyłu. Prototyp startuje z lekkim spojrzeniem z góry. */
export const TILT_MIN = -0.22;
export const TILT_MAX = 0.5;

/** Ile radianów na piksel przesunięcia palca. */
export const DRAG_SPEED = 0.011;

export const initialSpin = (): SpinState => ({
  y: -0.32,
  x: 0.14,
  base: { x: 0.14, y: -0.32 },
  dragging: false,
  touched: 0,
});

export const clampTilt = (x: number) => Math.min(TILT_MAX, Math.max(TILT_MIN, x));
