import Svg, { Circle, Path } from 'react-native-svg';
import { icon } from '../theme/tokens';

/**
 * Ikony nawigacji — ścieżki przepisane znak w znak z Bywalec.dc.html,
 * linie 4011–4015. Rozmiar 19×19, viewBox 24×24, stroke 1.8 (skaner 1.9).
 *
 * Uwaga: „Odkrywaj" to lupa, nie pinezka. „Wyjazd" to rower z trasą.
 */

type Props = {
  size?: number;
  color: string;
  strokeWidth?: number;
};

function Base({
  size = icon.size,
  color,
  strokeWidth = icon.stroke,
  children,
}: Props & { children: React.ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
      {children}
    </Svg>
  );
}

/** linia 4011 */
export function IconDiscover(p: Props) {
  return (
    <Base {...p}>
      <Circle cx={11} cy={11} r={7} />
      <Path d="M20 20l-3.8-3.8" strokeLinecap="round" />
    </Base>
  );
}

/** linia 4012 */
export function IconMap(p: Props) {
  return (
    <Base {...p}>
      <Path d="M4 7l5-2 6 2 5-2v12l-5 2-6-2-5 2z" strokeLinejoin="round" />
      <Path d="M9 5v12M15 7v12" />
    </Base>
  );
}

/** linia 4014 */
export function IconScan(p: Props) {
  return (
    <Base {...p} strokeWidth={p.strokeWidth ?? icon.strokeScan}>
      <Path d="M4 8V5.5A1.5 1.5 0 015.5 4H8" strokeLinecap="round" />
      <Path d="M16 4h2.5A1.5 1.5 0 0120 5.5V8" strokeLinecap="round" />
      <Path d="M20 16v2.5A1.5 1.5 0 0118.5 20H16" strokeLinecap="round" />
      <Path d="M8 20H5.5A1.5 1.5 0 014 18.5V16" strokeLinecap="round" />
      <Path d="M4 12h16" strokeLinecap="round" />
    </Base>
  );
}

/**
 * Czwarta zakładka w nowym prototypie (TAPI-standalone.html, `n.isFriends`).
 * Zastąpiła „Wyjazd" — ten jest teraz ekranem otwieranym z banera planera,
 * nie pozycją paska.
 */
export function IconFriends(p: Props) {
  return (
    <Base {...p}>
      <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <Circle cx={9} cy={7} r={4} />
      <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </Base>
  );
}

/** linia 4013 — ekran Wyjazd, poza paskiem */
export function IconTrip(p: Props) {
  return (
    <Base {...p}>
      <Path d="M5 18c0-2.6 3-2.6 3-5.2S5 10.2 5 7.6" strokeLinecap="round" />
      <Circle cx={5} cy={19.4} r={1.7} />
      <Path d="M13.5 6.6h4.2a2.3 2.3 0 010 4.6H13a2.3 2.3 0 000 4.6h5" strokeLinecap="round" />
      <Circle cx={12.6} cy={5.4} r={1.5} />
    </Base>
  );
}

/** linia 4015 */
export function IconProfile(p: Props) {
  return (
    <Base {...p}>
      <Circle cx={12} cy={8.5} r={3.5} />
      <Path d="M5 20c1.4-3.3 4-5 7-5s5.6 1.7 7 5" strokeLinecap="round" />
    </Base>
  );
}
