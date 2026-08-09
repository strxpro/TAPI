import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { useI18n } from '../i18n/I18nProvider';
import { ALWAYS_DARK, ease, em, fonts, radius, size } from '../theme/tokens';
import { Text } from '../ui/Text';

/**
 * Splash — odwzorowanie Bywalec.dc.html, linie 110–176.
 *
 * Tło #14161A, tekst #F4F2ED (linia 112). README podaje tu #0E1013;
 * ten kolor w prototypie jest wyłącznie wypełnieniem kropki w pinezce
 * logo (linia 164), więc wygrywa prototyp.
 *
 * Sekwencja: poświata → rysowany szkic lokalu → odznaka z ptaszkiem →
 * napis „tapi" z opadającą pinezką → lockup → pasek postępu.
 * Wyjście po 1500 ms, animacja 720 ms.
 *
 * Transformacje grup SVG idą przez własne właściwości react-native-svg
 * (scale / rotation / translateY / originX / originY), a nie przez `style` —
 * biblioteka nie honoruje tam transformów.
 */

const APath = Animated.createAnimatedComponent(Path);
const ACircle = Animated.createAnimatedComponent(Circle);
const AG = Animated.createAnimatedComponent(G);

const EXIT_DELAY = 1500;
const EXIT_DURATION = 720;
const BAR_W = 132;

/** cubic-bezier(0.25, 0.1, 0.25, 1) — css `ease` */
const CSS_EASE = [0.25, 0.1, 0.25, 1] as const;
/** cubic-bezier(0.5, 0, 0.3, 1) — rysowanie kreski w prototypie */
const DRAW = [0.5, 0, 0.3, 1] as const;

/* ────────────────────────────────────────────────────────────── pomocnicze ── */

/** Animowany `stroke-dashoffset`: length → 0. Nie może iść przez natywny sterownik. */
function useDash(length: number, durationMs: number, delayMs: number, curve: readonly number[]) {
  const v = useRef(new Animated.Value(length)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 0,
      duration: durationMs,
      delay: delayMs,
      easing: Easing.bezier(curve[0], curve[1], curve[2], curve[3]),
      useNativeDriver: false,
    }).start();
  }, [v, length, durationMs, delayMs, curve]);
  return v;
}

/** Postęp 0 → 1 z opóźnieniem. */
function useProgress(
  durationMs: number,
  delayMs: number,
  curve: readonly number[],
  native = true,
) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: durationMs,
      delay: delayMs,
      easing: Easing.bezier(curve[0], curve[1], curve[2], curve[3]),
      useNativeDriver: native,
    }).start();
  }, [v, durationMs, delayMs, curve, native]);
  return v;
}

/** @keyframes sparkPop — scale 0 → 1.22 → 1, rotate −26° → 5° → 0° */
function useSparkPop(durationMs: number, delayMs: number, curve: readonly number[]) {
  const p = useProgress(durationMs, delayMs, curve, false);
  return {
    opacity: p.interpolate({ inputRange: [0, 0.62, 1], outputRange: [0, 1, 1] }),
    scale: p.interpolate({ inputRange: [0, 0.62, 1], outputRange: [0, 1.22, 1] }),
    rotation: p.interpolate({ inputRange: [0, 0.62, 1], outputRange: [-26, 5, 0] }),
  };
}

/* ─────────────────────────────────────────────────────────────────── ekran ── */

export function Splash({ onDone }: { onDone: () => void }) {
  const { lang } = useI18n();

  // splashLabel w prototypie ma warunek dwustanowy (pl / reszta), więc włoski
  // dostaje tekst angielski. Zgłoszone jako rozbieżność — czekam na wersję IT.
  const label =
    lang === 'pl' ? 'Przewodnik po lokalach i wydarzeniach' : 'Guide to venues and events';

  const exit = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  // @keyframes pulseSoft — 3,4 s, w kółko
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // @keyframes splashExit — startuje po 1,5 s
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(exit, {
        toValue: 1,
        duration: EXIT_DURATION,
        easing: Easing.bezier(...ease.splash),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onDone();
      });
    }, EXIT_DELAY);
    return () => clearTimeout(timer);
  }, [exit, onDone]);

  /* ── szkic lokalu (184×116), linie 116–138 ── */
  const ground = useDash(152, 600, 50, CSS_EASE);
  const wall = useDash(162, 850, 120, DRAW);
  const awning = useDash(154, 700, 350, DRAW);
  const stripes = useDash(64, 450, 580, CSS_EASE);
  const door = useDash(84, 500, 620, CSS_EASE);
  const trail = useDash(58, 500, 720, DRAW);
  const qr = useSparkPop(550, 800, [0.24, 1.3, 0.4, 1]);
  const pin = useSparkPop(650, 1000, [0.24, 1.35, 0.4, 1]);
  const spark = useSparkPop(550, 1200, [0.24, 1.4, 0.4, 1]);

  /* ── odznaka z ptaszkiem (72×72), linie 141–148 ── */
  const check = useDash(72, 720, 180, [0.5, 0, 0.25, 1]);
  const core = useProgress(700, 820, [0.24, 1.3, 0.4, 1], false);

  /* ── napis „tapi", linie 152–166 ──
     Prototyp używa pathLength="100"; react-native-svg tego atrybutu nie
     honoruje, więc podajemy zmierzone długości ścieżek. */
  const tStem = useDash(44, 460, 220, DRAW);
  const tBar = useDash(21, 280, 520, DRAW);
  const aBowl = useDash(69, 620, 420, DRAW);
  const aStem = useDash(21, 300, 740, DRAW);
  const pBowl = useDash(69, 620, 640, DRAW);
  const pStem = useDash(33, 340, 960, DRAW);
  const iStem = useDash(18, 300, 1080, DRAW);
  const drop = useProgress(620, 1280, [0.3, 1.5, 0.4, 1], false);

  const lockup = useProgress(800, 1050, CSS_EASE);
  const caption = useProgress(700, 550, CSS_EASE);
  const bar = useProgress(1450, 0, [0.42, 0, 0.25, 1]);

  return (
    <Animated.View
      style={[
        styles.root,
        {
          opacity: exit.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
          transform: [{ scale: exit.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] }) }],
        },
      ]}
    >
      {/* poświata — linia 113 */}
      <Animated.View
        style={[
          styles.glow,
          {
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0.55] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) }],
          },
        ]}
      />

      {/* ── szkic lokalu ── */}
      <View style={styles.doodle}>
        <Svg width={184} height={116} viewBox="0 0 184 116" fill="none">
          <APath
            d="M16 100h152"
            stroke="rgba(244,242,237,0.2)"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeDasharray="152"
            strokeDashoffset={ground}
          />
          <APath
            d="M32 100V52h60v48"
            stroke="#F4F2ED"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray="162"
            strokeDashoffset={wall}
          />
          <APath
            d="M25 52l9-15h56l9 15z"
            stroke="#57C39F"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeDasharray="154"
            strokeDashoffset={awning}
          />
          <APath
            d="M34 52V37M52 52V37M70 52V37M88 52V37"
            stroke="#57C39F"
            strokeWidth={1.2}
            opacity={0.5}
            strokeDasharray="64"
            strokeDashoffset={stripes}
          />
          <APath
            d="M68 100V70h18v30"
            stroke="#F4F2ED"
            strokeWidth={1.6}
            strokeLinejoin="round"
            opacity={0.55}
            strokeDasharray="84"
            strokeDashoffset={door}
          />
          <AG originX={47} originY={71} opacity={qr.opacity} scale={qr.scale} rotation={qr.rotation}>
            <Rect x={38} y={62} width={19} height={19} rx={3.4} stroke="#57C39F" strokeWidth={1.5} />
            <Rect x={41.4} y={65.4} width={4.6} height={4.6} rx={1.1} fill="#57C39F" />
            <Rect x={49.2} y={65.4} width={4.6} height={4.6} rx={1.1} fill="#57C39F" />
            <Rect x={41.4} y={73.2} width={4.6} height={4.6} rx={1.1} fill="#57C39F" />
            <Rect x={49.6} y={73.6} width={3.2} height={3.2} rx={0.9} fill="#57C39F" opacity={0.6} />
          </AG>
          <APath
            d="M100 82c15 0 11-28 27-32"
            stroke="#57C39F"
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeDasharray="58"
            strokeDashoffset={trail}
            opacity={0.5}
          />
          <AG
            originX={137}
            originY={62}
            opacity={pin.opacity}
            scale={pin.scale}
            rotation={pin.rotation}
          >
            <Circle cx={137} cy={46} r={16} fill="rgba(87,195,159,0.13)" />
            <Path
              d="M137 63s10.5-8.8 10.5-15.6a10.5 10.5 0 10-21 0C126.5 54.2 137 63 137 63z"
              stroke="#F4F2ED"
              strokeWidth={2}
              strokeLinejoin="round"
            />
            <Circle cx={137} cy={46} r={3.5} fill="#57C39F" />
          </AG>
          <AG
            originX={160}
            originY={32}
            opacity={spark.opacity}
            scale={spark.scale}
            rotation={spark.rotation}
          >
            <Path
              d="M160 25l1.9 5 5 1.9-5 1.9-1.9 5-1.9-5-5-1.9 5-1.9z"
              stroke="#57C39F"
              strokeWidth={1.3}
              strokeLinejoin="round"
            />
          </AG>
        </Svg>
      </View>

      {/* ── odznaka z ptaszkiem ── */}
      <View style={styles.badge}>
        <Svg width={72} height={72} viewBox="0 0 72 72" fill="none">
          <Rect
            x={1.5}
            y={1.5}
            width={69}
            height={69}
            rx={22}
            stroke="rgba(244,242,237,0.16)"
            strokeWidth={1.5}
          />
          <APath
            d="M19 30l14 21L53 17"
            stroke="#F4F2ED"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="72"
            strokeDashoffset={check}
          />
          {/* @keyframes coreIn — scale 0 → 1.22 → 1 */}
          <AG
            originX={53}
            originY={17}
            opacity={core.interpolate({ inputRange: [0, 0.55, 1], outputRange: [0, 1, 1] })}
            scale={core.interpolate({ inputRange: [0, 0.55, 1], outputRange: [0, 1.22, 1] })}
          >
            <Circle cx={53} cy={17} r={6.5} fill="#57C39F" />
          </AG>
          <Circle cx={53} cy={17} r={13} stroke="#57C39F" strokeWidth={1.3} opacity={0.4} />
        </Svg>
      </View>

      {/* ── napis „tapi" ── */}
      <View style={styles.wordmarkWrap}>
        <Svg width={214} height={97} viewBox="0 -5 152 69" fill="none">
          <G stroke="#F4F2ED" strokeWidth={9} strokeLinecap="round" fill="none">
            <APath d="M20 8V38c0 7 4 10 10 10" strokeDasharray="44" strokeDashoffset={tStem} />
            <APath d="M10 20H31" strokeDasharray="21" strokeDashoffset={tBar} />
            <ACircle cx={55} cy={37} r={11} strokeDasharray="69" strokeDashoffset={aBowl} />
            <APath d="M66 27V48" strokeDasharray="21" strokeDashoffset={aStem} />
            <ACircle cx={99} cy={37} r={11} strokeDasharray="69" strokeDashoffset={pBowl} />
            <APath d="M88 27V60" strokeDasharray="33" strokeDashoffset={pStem} />
            <APath d="M133 30V48" strokeDasharray="18" strokeDashoffset={iStem} />
          </G>
          {/* pinezka — @keyframes pinDrop */}
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
              fill="#57C39F"
            />
            <Circle cx={133} cy={10} r={4.6} fill="#0E1013" />
          </AG>
        </Svg>

        {/* lockup — linia 168 */}
        <Animated.View style={{ opacity: lockup, marginTop: 15 }}>
          <Text style={styles.lockup}>tap · take · go</Text>
        </Animated.View>
      </View>

      {/* pasek postępu — linie 171–173.
          transform-origin: left odtwarzamy przesunięciem o połowę szerokości. */}
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              transform: [
                {
                  translateX: bar.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-BAR_W / 2, 0],
                  }),
                },
                { scaleX: bar },
              ],
            },
          ]}
        />
      </View>

      {/* podpis — linia 174 */}
      <Animated.View style={{ opacity: caption, marginTop: 14 }}>
        <Text style={styles.caption}>{label}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 300,
    backgroundColor: ALWAYS_DARK.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  glow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(87,195,159,0.16)',
  },
  doodle: { marginBottom: 6 },
  badge: { width: 72, height: 72 },
  wordmarkWrap: { marginTop: 22, alignItems: 'center' },
  lockup: {
    fontFamily: fonts.sansSemi,
    fontSize: size.s95,
    letterSpacing: em(size.s95, 0.34),
    textTransform: 'uppercase',
    color: 'rgba(244,242,237,0.5)',
  },
  track: {
    width: BAR_W,
    height: 2,
    borderRadius: 2,
    marginTop: 20,
    backgroundColor: 'rgba(244,242,237,0.14)',
    overflow: 'hidden',
  },
  fill: {
    width: BAR_W,
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#57C39F',
  },
  caption: {
    fontFamily: fonts.sans,
    fontSize: size.s10,
    letterSpacing: em(size.s10, 0.2),
    textTransform: 'uppercase',
    color: 'rgba(244,242,237,0.42)',
    textAlign: 'center',
  },
});
