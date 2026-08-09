import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

/**
 * Znak „tapi" rysowany kreską — Bywalec.dc.html, linie 152–166 (splash)
 * i 184–198 (logowanie). Ta sama grafika, inne kolory i inne opóźnienia.
 *
 * Prototyp normalizuje długości przez pathLength="100"; react-native-svg tego
 * atrybutu nie honoruje, więc podajemy zmierzone długości ścieżek.
 */

const APath = Animated.createAnimatedComponent(Path);
const ACircle = Animated.createAnimatedComponent(Circle);
const AG = Animated.createAnimatedComponent(G);

/** cubic-bezier(0.5, 0, 0.3, 1) — rysowanie kreski */
const DRAW = [0.5, 0, 0.3, 1] as const;
/** cubic-bezier(0.3, 1.5, 0.4, 1) — opadająca pinezka */
const DROP = [0.3, 1.5, 0.4, 1] as const;

/** Zmierzone długości ścieżek w kolejności rysowania. */
const LEN = { tStem: 44, tBar: 21, aBowl: 69, aStem: 21, pBowl: 69, pStem: 33, iStem: 18 } as const;

export type WordmarkDelays = {
  tStem: number;
  tBar: number;
  aBowl: number;
  aStem: number;
  pBowl: number;
  pStem: number;
  iStem: number;
  pin: number;
};

/** Opóźnienia ze splashu (linie 154–162). */
export const SPLASH_DELAYS: WordmarkDelays = {
  tStem: 220,
  tBar: 520,
  aBowl: 420,
  aStem: 740,
  pBowl: 640,
  pStem: 960,
  iStem: 1080,
  pin: 1280,
};

/** Opóźnienia z ekranu logowania (linie 186–194) — o 160 ms wcześniej. */
export const AUTH_DELAYS: WordmarkDelays = {
  tStem: 60,
  tBar: 360,
  aBowl: 260,
  aStem: 580,
  pBowl: 480,
  pStem: 800,
  iStem: 920,
  pin: 1120,
};

function useDash(length: number, durationMs: number, delayMs: number) {
  const v = useRef(new Animated.Value(length)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 0,
      duration: durationMs,
      delay: delayMs,
      easing: Easing.bezier(DRAW[0], DRAW[1], DRAW[2], DRAW[3]),
      useNativeDriver: false,
    }).start();
  }, [v, length, durationMs, delayMs]);
  return v;
}

export function Wordmark({
  width,
  height,
  stroke,
  pin,
  dot,
  delays,
}: {
  width: number;
  height: number;
  /** kolor liter */
  stroke: string;
  /** wypełnienie pinezki */
  pin: string;
  /** kropka w pinezce */
  dot: string;
  delays: WordmarkDelays;
}) {
  const tStem = useDash(LEN.tStem, 460, delays.tStem);
  const tBar = useDash(LEN.tBar, 280, delays.tBar);
  const aBowl = useDash(LEN.aBowl, 620, delays.aBowl);
  const aStem = useDash(LEN.aStem, 300, delays.aStem);
  const pBowl = useDash(LEN.pBowl, 620, delays.pBowl);
  const pStem = useDash(LEN.pStem, 340, delays.pStem);
  const iStem = useDash(LEN.iStem, 300, delays.iStem);

  // @keyframes pinDrop
  const drop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(drop, {
      toValue: 1,
      duration: 620,
      delay: delays.pin,
      easing: Easing.bezier(DROP[0], DROP[1], DROP[2], DROP[3]),
      useNativeDriver: false,
    }).start();
  }, [drop, delays.pin]);

  return (
    <Svg width={width} height={height} viewBox="0 -5 152 69" fill="none">
      <G stroke={stroke} strokeWidth={9} strokeLinecap="round" fill="none">
        <APath
          d="M20 8V38c0 7 4 10 10 10"
          strokeDasharray={String(LEN.tStem)}
          strokeDashoffset={tStem}
        />
        <APath d="M10 20H31" strokeDasharray={String(LEN.tBar)} strokeDashoffset={tBar} />
        <ACircle cx={55} cy={37} r={11} strokeDasharray={String(LEN.aBowl)} strokeDashoffset={aBowl} />
        <APath d="M66 27V48" strokeDasharray={String(LEN.aStem)} strokeDashoffset={aStem} />
        <ACircle cx={99} cy={37} r={11} strokeDasharray={String(LEN.pBowl)} strokeDashoffset={pBowl} />
        <APath d="M88 27V60" strokeDasharray={String(LEN.pStem)} strokeDashoffset={pStem} />
        <APath d="M133 30V48" strokeDasharray={String(LEN.iStem)} strokeDashoffset={iStem} />
      </G>
      <AG
        originX={133}
        originY={22}
        opacity={drop.interpolate({ inputRange: [0, 0.58, 1], outputRange: [0, 1, 1] })}
        scale={drop.interpolate({
          inputRange: [0, 0.58, 0.78, 1],
          outputRange: [0.72, 1.06, 0.98, 1],
        })}
        translateY={drop.interpolate({
          inputRange: [0, 0.58, 0.78, 1],
          outputRange: [-26, 0, -2, 0],
        })}
      >
        <Path
          d="M133 -1a11 11 0 0111 11c0 7.6-11 12-11 12s-11-4.4-11-12a11 11 0 0111-11z"
          fill={pin}
        />
        <Circle cx={133} cy={10} r={4.6} fill={dot} />
      </AG>
    </Svg>
  );
}
