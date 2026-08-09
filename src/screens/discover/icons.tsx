import Svg, { Path, Circle, Rect } from 'react-native-svg';

/**
 * Ikony ekranu Odkrywaj — ścieżki przepisane znak w znak
 * z TAPI-standalone.html, sekcja „ODKRYWAJ" i „FILTRY I SORTOWANIE".
 *
 * Rozmiar i grubość kreski podaje wywołujący, bo ta sama ikona występuje
 * w kilku miejscach w różnej skali (lupa: 16/1.8, 15/2.1, 15/2).
 */

type P = { size: number; color: string; width?: number };

const box = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24' as const });

export function IconSearch({ size, color, width = 2 }: P) {
  return (
    <Svg {...box(size)} fill="none" stroke={color} strokeWidth={width}>
      <Circle cx={11} cy={11} r={7} />
      <Path d="M20 20l-3.8-3.8" strokeLinecap="round" />
    </Svg>
  );
}

export function IconClose({ size, color, width = 3 }: P) {
  return (
    <Svg {...box(size)} fill="none" stroke={color} strokeWidth={width}>
      <Path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

/** Suwaki — przycisk filtrów, wiersz „Filtry i sortowanie", pigułka sortowania */
export function IconSliders({ size, color, width = 1.9 }: P) {
  return (
    <Svg {...box(size)} fill="none" stroke={color} strokeWidth={width}>
      <Path d="M4 7h16M7 12h10M10 17h4" strokeLinecap="round" />
    </Svg>
  );
}

/** Podpowiedź: lokal */
export function IconPin({ size, color, width = 1.9 }: P) {
  return (
    <Svg {...box(size)} fill="none" stroke={color} strokeWidth={width}>
      <Path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" />
      <Circle cx={12} cy={10} r={2.2} />
    </Svg>
  );
}

/** Podpowiedź: wydarzenie */
export function IconCalendar({ size, color, width = 1.9 }: P) {
  return (
    <Svg {...box(size)} fill="none" stroke={color} strokeWidth={width}>
      <Rect x={4} y={5} width={16} height={16} rx={3} />
      <Path d="M4 10h16M9 3v4M15 3v4" strokeLinecap="round" />
    </Svg>
  );
}

/** Podpowiedź: kategoria */
export function IconTag({ size, color, width = 1.9 }: P) {
  return (
    <Svg {...box(size)} fill="none" stroke={color} strokeWidth={width}>
      <Path d="M4 11V5h6l10 10-6 6L4 11z" strokeLinejoin="round" />
      <Circle cx={8} cy={9} r={1.3} />
    </Svg>
  );
}

/** Podpowiedź: dzielnica */
export function IconLayers({ size, color, width = 1.9 }: P) {
  return (
    <Svg {...box(size)} fill="none" stroke={color} strokeWidth={width}>
      <Path d="M9 4L4 6v14l5-2 6 2 5-2V4l-5 2-6-2z" strokeLinejoin="round" />
      <Path d="M9 4v14M15 6v14" />
    </Svg>
  );
}

/** Iskierka — wiersz i karta zainteresowań */
export function IconSpark({ size, color, width = 1.9 }: P) {
  return (
    <Svg {...box(size)} fill="none" stroke={color} strokeWidth={width}>
      <Path d="M12 3.4l1.9 5 5.1 1.9-5.1 1.9-1.9 5-1.9-5L5 10.3l5.1-1.9z" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconChevron({ size, color, width = 2.4 }: P) {
  return (
    <Svg {...box(size)} fill="none" stroke={color} strokeWidth={width}>
      <Path d="M9 5l7 7-7 7" />
    </Svg>
  );
}

/** Strzałka w prawo — wezwanie w banerze planera */
export function IconArrow({ size, color, width = 2.4 }: P) {
  return (
    <Svg {...box(size)} fill="none" stroke={color} strokeWidth={width}>
      <Path d="M5 12h13" />
      <Path d="M12 5l7 7-7 7" />
    </Svg>
  );
}

export function IconBell({ size, color, width = 1.9 }: P) {
  return (
    <Svg {...box(size)} fill="none" stroke={color} strokeWidth={width}>
      <Path d="M18 15V10a6 6 0 10-12 0v5l-1.5 2.5h15z" />
      <Path d="M10 19a2 2 0 004 0" />
    </Svg>
  );
}

export function IconCheck({ size, color, width = 3.2 }: P) {
  return (
    <Svg {...box(size)} fill="none" stroke={color} strokeWidth={width}>
      <Path d="M4 12l5 5L20 6" />
    </Svg>
  );
}

/** Zakładka „zapisz". Wersja wydarzeń ma inne wcięcie (4,4 zamiast 4,5). */
export function IconBookmark({
  size,
  color,
  width = 1.7,
  fill = 'none',
  event,
}: P & { fill?: string; event?: boolean }) {
  return (
    <Svg {...box(size)} fill={fill} stroke={color} strokeWidth={width}>
      <Path
        d={event ? 'M6 4h12v16l-6-4.4L6 20z' : 'M6 4h12v16l-6-4.5L6 20z'}
        strokeLinejoin={event ? 'round' : undefined}
      />
    </Svg>
  );
}

/** Kółko ze strzałką — „Wyczyść wszystko" w stanie pustym */
export function IconReset({ size, color, width = 2.3 }: P) {
  return (
    <Svg {...box(size)} fill="none" stroke={color} strokeWidth={width}>
      <Path d="M20 11a8 8 0 10-2.6 5.9" strokeLinecap="round" />
      <Path d="M20 5v6h-6" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Znak wodny w banerze planera — trójkąt wypełniony akcentem */
export function IconPeak({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2L2 22l10-3 10 3L12 2z" />
    </Svg>
  );
}
