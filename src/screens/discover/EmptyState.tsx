import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import { duration, em, fonts, ON_ACCENT, radius, size } from '../../theme/tokens';
import { Raw } from '../../ui/Text';
import { press, useEnter } from '../../ui/motion';
import { IconReset } from './icons';
import { discoverCopy } from './copy';

/**
 * Stan pusty listy lokali — TAPI-standalone.html, gałąź `noResults`.
 *
 * Rysunek to lupa z twarzą: obrys i uchwyt rysują się kreską (`dashIn`),
 * oczy mrugają (`blinkEye`), całość kołysze się o ±1,1° (`doodleWob`),
 * a dwie iskierki wskakują (`sparkPop`) i unoszą się (`floaty`).
 *
 * Jedyne odstępstwo: `doodleWob` obraca się w prototypie wokół punktu
 * (58, 46), a React Native obraca zawsze wokół środka widoku (66, 48).
 * Przy 1,1° daje to różnicę poniżej pół piksela.
 */

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

/** cubic-bezier(0.5, 0, 0.3, 1) — obrys lupy */
const DRAW = Easing.bezier(0.5, 0, 0.3, 1);
/** cubic-bezier(0.24, 1.4, 0.4, 1) — wskok iskierki */
const POP = Easing.bezier(0.24, 1.4, 0.4, 1);

export function EmptyState({ onClear }: { onClear: () => void }) {
  const { theme, accent, accentText } = useTheme();
  const { lang } = useI18n();
  const c = discoverCopy[lang];
  const enter = useEnter('popIn', duration.popInLg);

  return (
    <Animated.View
      style={[
        styles.card,
        SHADOW_CARD,
        { backgroundColor: theme.surf, borderColor: theme.hair },
        enter,
      ]}
    >
      <Doodle ink={theme.ink} accent={accentText} />
      <Raw style={[styles.title, { color: theme.ink }]}>{c.emptyTitle}</Raw>
      <Raw style={[styles.sub, { color: theme.sub }]}>{c.emptySub}</Raw>
      <Pressable
        onPress={onClear}
        accessibilityRole="button"
        style={({ pressed }) => [styles.cta, { backgroundColor: accent.hex }, press(0.96)({ pressed })]}
      >
        <IconReset size={13} color={ON_ACCENT} width={2.3} />
        <Raw style={styles.ctaText}>{c.emptyCta}</Raw>
      </Pressable>
    </Animated.View>
  );
}

/* ─────────────────────────────────────────────────────────────── rysunek ── */

function Doodle({ ink, accent }: { ink: string; accent: string }) {
  const ring = useRef(new Animated.Value(152)).current;
  const handle = useRef(new Animated.Value(24)).current;
  const smile = useRef(new Animated.Value(22)).current;
  const wob = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const draw = Animated.parallel([
      Animated.timing(ring, { toValue: 0, duration: 1000, delay: 100, easing: DRAW, useNativeDriver: false }),
      Animated.timing(handle, {
        toValue: 0,
        duration: 400,
        delay: 900,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(smile, {
        toValue: 0,
        duration: 450,
        delay: 1050,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]);

    // doodleWob: 5 s, −1,1° → 1,1° → −1,1°
    const sway = Animated.loop(
      Animated.sequence([
        Animated.timing(wob, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(wob, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );

    // blinkEye: 4,2 s cyklu, przymknięcie tylko między 92% a 100%
    const eyes = Animated.loop(
      Animated.sequence([
        Animated.delay(4200 * 0.92),
        Animated.timing(blink, { toValue: 1, duration: 4200 * 0.04, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 0, duration: 4200 * 0.04, easing: Easing.linear, useNativeDriver: true }),
      ]),
    );

    draw.start();
    sway.start();
    const eyesStart = setTimeout(() => eyes.start(), 1200);

    return () => {
      draw.stop();
      sway.stop();
      eyes.stop();
      clearTimeout(eyesStart);
    };
  }, [ring, handle, smile, wob, blink]);

  const swayStyle = useMemo(
    () => ({
      transform: [
        { rotate: wob.interpolate({ inputRange: [0, 1], outputRange: ['-1.1deg', '1.1deg'] }) },
      ],
    }),
    [wob],
  );

  const blinkStyle = useMemo(
    () => ({
      transform: [{ scaleY: blink.interpolate({ inputRange: [0, 1], outputRange: [1, 0.1] }) }],
    }),
    [blink],
  );

  return (
    <View style={styles.doodle}>
      {/* kołysze się tylko lupa z twarzą — iskierki są poza grupą */}
      <Animated.View style={[StyleSheet.absoluteFill, swayStyle]}>
        <Svg width={132} height={96} viewBox="0 0 132 96" fill="none">
          <AnimatedCircle
            cx={56}
            cy={42}
            r={24}
            stroke={accent}
            strokeWidth={2}
            strokeDasharray="152"
            strokeDashoffset={ring}
          />
          <AnimatedPath
            d="M74 60l16 16"
            stroke={accent}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeDasharray="24"
            strokeDashoffset={handle}
          />
          <AnimatedPath
            d="M48 52c3-3.4 11-3.4 14 0"
            stroke={ink}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.6}
            strokeDasharray="22"
            strokeDashoffset={smile}
          />
        </Svg>

        {/* oczy osobno, bo mrugnięcie to skala pionowa wokół ich środka */}
        <Animated.View style={[styles.eyes, blinkStyle]}>
          <Svg width={20} height={7} viewBox="46 36 20 7" fill="none">
            <Path d="M48 38v3M64 38v3" stroke={ink} strokeWidth={2.2} strokeLinecap="round" opacity={0.7} />
          </Svg>
        </Animated.View>
      </Animated.View>

      <Spark
        box={{ left: 94, top: 24, size: 11.8, viewBox: '94.1 24 11.8 11.8' }}
        d="M100 24l1.6 4.3 4.3 1.6-4.3 1.6-1.6 4.3-1.6-4.3-4.3-1.6 4.3-1.6z"
        color={accent}
        width={1.3}
        op={0.6}
        delay={1200}
        floatMs={3400}
      />
      <Spark
        box={{ left: 12.8, top: 66, size: 10.4, viewBox: '12.8 66 10.4 10.4' }}
        d="M18 66l1.4 3.8 3.8 1.4-3.8 1.4-1.4 3.8-1.4-3.8L12.8 71.2l3.8-1.4z"
        color={accent}
        width={1.2}
        op={0.45}
        delay={1350}
        floatMs={3800}
      />
    </View>
  );
}

/** Iskierka: wskok `sparkPop`, potem nieskończone `floaty`. */
function Spark({
  box,
  d,
  color,
  width,
  op,
  delay,
  floatMs,
}: {
  /** wycinek oryginalnego układu współrzędnych rysunku */
  box: { left: number; top: number; size: number; viewBox: string };
  d: string;
  color: string;
  width: number;
  op: number;
  delay: number;
  floatMs: number;
}) {
  const pop = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // sparkPop: 0 → 62% (scale 1.22, rot 5°) → 100%
    const enter = Animated.sequence([
      Animated.delay(delay),
      Animated.timing(pop, { toValue: 0.62, duration: 600 * 0.62, easing: POP, useNativeDriver: true }),
      Animated.timing(pop, { toValue: 1, duration: 600 * 0.38, easing: POP, useNativeDriver: true }),
    ]);
    const half = floatMs / 2;
    const drift = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: half, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: half, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );

    enter.start();
    const driftStart = setTimeout(() => drift.start(), delay + 700);
    return () => {
      enter.stop();
      drift.stop();
      clearTimeout(driftStart);
    };
  }, [pop, float, delay, floatMs]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: box.left,
        top: box.top,
        opacity: pop.interpolate({ inputRange: [0, 0.62, 1], outputRange: [0, op, op] }),
        transform: [
          { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) },
          { scale: pop.interpolate({ inputRange: [0, 0.62, 1], outputRange: [0, 1.22, 1] }) },
          {
            rotate: pop.interpolate({
              inputRange: [0, 0.62, 1],
              outputRange: ['-26deg', '5deg', '0deg'],
            }),
          },
        ],
      }}
    >
      <Svg width={box.size} height={box.size} viewBox={box.viewBox} fill="none">
        <Path d={d} stroke={color} strokeWidth={width} strokeLinejoin="round" />
      </Svg>
    </Animated.View>
  );
}

/** CSS: 0 18px 38px -34px rgba(22,24,28,0.9) */
const SHADOW_CARD = {
  shadowColor: '#16181C',
  shadowOpacity: 0.16,
  shadowRadius: 11,
  shadowOffset: { width: 0, height: 8 },
  elevation: 3,
} as const;

const styles = StyleSheet.create({
  card: {
    paddingTop: 24,
    paddingHorizontal: 18,
    paddingBottom: 20,
    borderRadius: radius.sheet24,
    borderWidth: 1,
    alignItems: 'center',
  },
  doodle: { width: 132, height: 96 },
  eyes: { position: 'absolute', left: 46, top: 36, width: 20, height: 7 },
  title: {
    fontFamily: fonts.serif,
    fontSize: size.s24,
    letterSpacing: em(size.s24, -0.025),
    marginTop: 14,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.sans,
    fontSize: size.s125,
    lineHeight: size.s125 * 1.5,
    marginTop: 7,
    textAlign: 'center',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: radius.card15,
  },
  ctaText: { fontFamily: fonts.sansSemi, fontSize: size.s13, color: ON_ACCENT },
});
