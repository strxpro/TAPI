import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, type ViewStyle } from 'react-native';
import { duration as dur, ease } from '../theme/tokens';

/**
 * Klatki kluczowe z prototypu przełożone na `Animated`.
 *
 * CSS nakłada funkcję czasu **między każdą parą klatek**, nie na całość.
 * Dlatego animacje z klatką pośrednią (`popIn`, `growX`) jadą jako sekwencja
 * dwóch odcinków z tym samym `cubic-bezier`, a nie jednym przebiegiem —
 * inaczej odbicie w 62% wypadałoby w innym momencie niż w prototypie.
 *
 * Wszystko poza `strokeDashoffset` idzie po wątku natywnym.
 */

const STD = Easing.bezier(...ease.standard);

/* ─────────────────────────────────────────────────────── wejścia jednorazowe ── */

export type Enter = 'rise' | 'popIn' | 'stagger' | 'fadeIn';

/**
 * @param kind  nazwa klatek z prototypu
 * @param ms    czas trwania — w prototypie różny przy tych samych klatkach
 *              (`rise` bywa 0,3 / 0,34 / 0,4 / 0,5 s)
 * @param delay opóźnienie startu, do kaskady list
 */
export function useEnter(kind: Enter, ms: number, delay = 0): ViewStyle {
  const p = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // `popIn` ma klatkę pośrednią w 62% przebiegu.
    const mid = kind === 'popIn' ? 0.62 : 0;
    const anim = mid
      ? Animated.sequence([
          Animated.timing(p, {
            toValue: mid,
            duration: ms * mid,
            delay,
            easing: STD,
            useNativeDriver: true,
          }),
          Animated.timing(p, {
            toValue: 1,
            duration: ms * (1 - mid),
            easing: STD,
            useNativeDriver: true,
          }),
        ])
      : Animated.timing(p, {
          toValue: 1,
          duration: ms,
          delay,
          easing: STD,
          useNativeDriver: true,
        });

    anim.start();
    return () => anim.stop();
  }, [p, kind, ms, delay]);

  return useMemo(() => {
    if (kind === 'fadeIn') return { opacity: p } as unknown as ViewStyle;

    if (kind === 'rise') {
      // rise: opacity 0→1, translateY 14→0
      return {
        opacity: p,
        transform: [{ translateY: p.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      } as unknown as ViewStyle;
    }

    if (kind === 'stagger') {
      // stagger: opacity 0→1, translateY 10→0, scale 0.985→1
      return {
        opacity: p,
        transform: [
          { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
          { scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] }) },
        ],
      } as unknown as ViewStyle;
    }

    // popIn: opacity 0→1, scale 0.9→1.015→1, translateY 26→0
    return {
      opacity: p.interpolate({ inputRange: [0, 0.62, 1], outputRange: [0, 1, 1] }),
      transform: [
        { translateY: p.interpolate({ inputRange: [0, 0.62, 1], outputRange: [26, 0, 0] }) },
        { scale: p.interpolate({ inputRange: [0, 0.62, 1], outputRange: [0.9, 1.015, 1] }) },
      ],
    } as unknown as ViewStyle;
  }, [p, kind]);
}

/**
 * `growX` — rozwinięcie wyszukiwarki w przyklejonym nagłówku:
 * opacity 0→1 (pełna w 60%), scaleX 0.42→1.
 *
 * CSS ma tu `transform-origin: left center`, a React Native skaluje zawsze
 * względem środka. Dokładamy więc przesunięcie −W/2·(1−s), które przykleja
 * lewą krawędź w miejscu. Dopóki nie znamy szerokości, animujemy bez niego.
 */
export function useGrowX(ms: number, width: number): ViewStyle {
  const p = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.timing(p, { toValue: 0.6, duration: ms * 0.6, easing: STD, useNativeDriver: true }),
      Animated.timing(p, { toValue: 1, duration: ms * 0.4, easing: STD, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [p, ms]);

  return useMemo(() => {
    const scales = [0.42, 0.87, 1];
    const half = width / 2;
    return {
      opacity: p.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 1] }),
      transform: [
        {
          translateX: p.interpolate({
            inputRange: [0, 0.6, 1],
            outputRange: scales.map((s) => -half * (1 - s)),
          }),
        },
        { scaleX: p.interpolate({ inputRange: [0, 0.6, 1], outputRange: scales }) },
      ],
    } as unknown as ViewStyle;
  }, [p, width]);
}

/* ───────────────────────────────────────────────────────────── pętle w tle ── */

/** Wspólny silnik pętli 0→1→0 (klatki `50%` w prototypie są symetryczne). */
function usePingPong(ms: number, easing: (v: number) => number = Easing.inOut(Easing.ease)) {
  const p = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const half = ms / 2;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(p, { toValue: 1, duration: half, easing, useNativeDriver: true }),
        Animated.timing(p, { toValue: 0, duration: half, easing, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [p, ms, easing]);

  return p;
}

/** `floaty` — 0/100% translateY 0, 50% −5 px, 3,6 s */
export function useFloaty(): ViewStyle {
  const p = usePingPong(dur.floaty);
  return useMemo(
    () =>
      ({
        transform: [{ translateY: p.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }],
      }) as unknown as ViewStyle,
    [p],
  );
}

/** `dot` — 0/100% opacity 1, 50% 0.25, 1,4 s */
export function useDot(): ViewStyle {
  const p = usePingPong(dur.dot);
  return useMemo(
    () => ({ opacity: p.interpolate({ inputRange: [0, 1], outputRange: [1, 0.25] }) }) as unknown as ViewStyle,
    [p],
  );
}

/** `skel` — 0/100% opacity 0.6, 50% 1, 1,2 s */
export function useSkeleton(delay = 0): ViewStyle {
  const p = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const half = dur.skel / 2;
    const easing = Easing.inOut(Easing.ease);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(p, { toValue: 1, duration: half, easing, useNativeDriver: true }),
        Animated.timing(p, { toValue: 0, duration: half, easing, useNativeDriver: true }),
      ]),
    );
    const start = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(start);
      loop.stop();
    };
  }, [p, delay]);

  return useMemo(
    () => ({ opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }) as unknown as ViewStyle,
    [p],
  );
}

/**
 * `shine` — refleks przelatujący po szkielecie, liniowo, 1,3 s.
 * Przesunięcie liczone w procentach szerokości paska, tak jak w CSS,
 * więc nie trzeba mierzyć elementu.
 */
export function useShine(): ViewStyle {
  const p = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(p, {
        toValue: 1,
        duration: dur.shine,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [p]);

  return useMemo(
    () =>
      ({
        transform: [
          { translateX: p.interpolate({ inputRange: [0, 1], outputRange: ['-140%', '240%'] }) },
        ],
      }) as unknown as ViewStyle,
    [p],
  );
}

/* ──────────────────────────────────────────────────────────── stan wciśnięty ── */

/**
 * `style-active` z prototypu — skala pod palcem. Wartości w prototypie:
 * 0.88 / 0.9 / 0.92 / 0.94 / 0.96 / 0.97 / 0.98 / 0.985 / 0.99.
 */
export const press =
  (scale: number) =>
  ({ pressed }: { pressed: boolean }): ViewStyle => ({
    transform: [{ scale: pressed ? scale : 1 }],
  });
