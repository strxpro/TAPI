import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { useT } from '../i18n/I18nProvider';
import { ALWAYS_DARK, ease, em, fonts, size } from '../theme/tokens';
import { Text } from '../ui/Text';

/**
 * Skaner — odwzorowanie Bywalec.dc.html, linie 788–826.
 *
 * Powierzchnia zawsze ciemna (#14161A / #F4F2ED) niezależnie od motywu.
 * Celownik 280×280 na pozycji top 176 / left 61, cztery narożniki 44 px,
 * linia skanu przebiega 262 px w 2,4 s.
 *
 * Prawdziwy podgląd z aparatu wejdzie razem z expo-camera; tu jest wierny
 * układ i animacja, tak jak w prototypie (który też nie ma podglądu).
 */

const FRAME = 280;
const CORNER = 44;
const SCAN_TRAVEL = 262;

export function Scan() {
  const { accent } = useTheme();
  const t = useT();

  // W prototypie linia skanu używa var(--accl) — jaśniejszego wariantu akcentu.
  const glow = accent.text;

  // @keyframes scanline — 2,4 s, cubic-bezier(0.45,0,0.25,1), w pętli
  const scan = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(scan, {
        toValue: 1,
        duration: 2400,
        easing: Easing.bezier(0.45, 0, 0.25, 1),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [scan]);

  // @keyframes rise — treść pod celownikiem
  const rise = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(rise, {
      toValue: 1,
      duration: 500,
      easing: Easing.bezier(...ease.standard),
      useNativeDriver: true,
    }).start();
  }, [rise]);

  // @keyframes ringOut — pierścień wokół przycisku
  const ring = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(ring, {
        toValue: 1,
        duration: 2400,
        easing: Easing.bezier(...ease.standard),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [ring]);

  const travel = scan.interpolate({ inputRange: [0, 1], outputRange: [0, SCAN_TRAVEL] });
  const scanOpacity = scan.interpolate({
    inputRange: [0, 0.07, 0.93, 1],
    outputRange: [0, 1, 1, 0],
  });

  const corner = { borderColor: glow };

  return (
    <View style={styles.root}>
      {/* subtelne prążki tła — linia 790 */}
      <View style={styles.scanlines} pointerEvents="none" />

      <Text style={styles.title}>{t('navScan')}</Text>

      {/* ── celownik ── */}
      <View style={styles.frame}>
        <View style={styles.frameBorder} />

        <View style={[styles.corner, styles.cornerTL, corner]} />
        <View style={[styles.corner, styles.cornerTR, corner]} />
        <View style={[styles.corner, styles.cornerBL, corner]} />
        <View style={[styles.corner, styles.cornerBR, corner]} />

        {/* poświata pod linią — linia 800 */}
        <Animated.View
          style={[
            styles.sweep,
            { opacity: 0.12, transform: [{ translateY: travel }] },
          ]}
        >
          <LinearGradient colors={[glow, 'transparent']} style={StyleSheet.absoluteFill} />
        </Animated.View>

        {/* linia skanu — linia 799 */}
        <Animated.View
          style={[styles.beam, { opacity: scanOpacity, transform: [{ translateY: travel }] }]}
        >
          <LinearGradient
            colors={['transparent', glow, glow, 'transparent']}
            locations={[0, 0.12, 0.88, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[StyleSheet.absoluteFill, styles.beamGlow, { shadowColor: glow }]}
          />
        </Animated.View>

        {/* siatka w środku — linia 801 */}
        <View style={styles.grid} pointerEvents="none">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <View key={`h${i}`} style={[styles.gridLineH, { top: i * 24 }]} />
          ))}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <View key={`v${i}`} style={[styles.gridLineV, { left: i * 24 }]} />
          ))}
        </View>
      </View>

      {/* ── treść, linie 804–819 ── */}
      <Animated.View
        style={[
          styles.bottom,
          {
            opacity: rise,
            transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
          },
        ]}
      >
        <Text style={styles.headline}>{t('scanTitle')}</Text>
        <Text style={styles.sub}>{t('scanSub')}</Text>

        <View style={styles.ctaWrap}>
          <Animated.View
            style={[
              styles.ring,
              {
                borderColor: glow,
                opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
                transform: [
                  { scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.5] }) },
                ],
              },
            ]}
            pointerEvents="none"
          />
          <Pressable
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            }}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: glow, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <Text style={styles.ctaLabel}>{t('scanBtn')}</Text>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={ALWAYS_DARK.bg} strokeWidth={2.4}>
              <Path d="M5 12h13" />
              <Path d="M13 6l6 6-6 6" />
            </Svg>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: ALWAYS_DARK.bg },
  scanlines: { ...StyleSheet.absoluteFillObject, opacity: 0.02, backgroundColor: '#FFFFFF' },
  title: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: fonts.sans,
    fontSize: size.s11,
    letterSpacing: em(size.s11, 0.16),
    textTransform: 'uppercase',
    color: 'rgba(244,242,237,0.55)',
  },
  frame: { position: 'absolute', top: 176, left: 61, width: FRAME, height: FRAME },
  frameBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(244,242,237,0.14)',
  },
  corner: { position: 'absolute', width: CORNER, height: CORNER },
  cornerTL: { left: 0, top: 0, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 28 },
  cornerTR: { right: 0, top: 0, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 28 },
  cornerBL: { left: 0, bottom: 0, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 28 },
  cornerBR: { right: 0, bottom: 0, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 28 },
  beam: { position: 'absolute', left: 10, right: 10, top: 8, height: 2, borderRadius: 2 },
  beamGlow: { shadowOpacity: 0.55, shadowRadius: 11, shadowOffset: { width: 0, height: 0 } },
  sweep: { position: 'absolute', left: 10, right: 10, top: 8, height: 78, borderRadius: 12 },
  grid: {
    position: 'absolute',
    top: 40,
    left: 40,
    right: 40,
    bottom: 40,
    opacity: 0.1,
    overflow: 'hidden',
  },
  gridLineH: { position: 'absolute', left: 0, right: 0, height: 12, backgroundColor: '#F4F2ED' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 12, backgroundColor: '#F4F2ED' },
  bottom: { position: 'absolute', bottom: 150, left: 26, right: 26, alignItems: 'center' },
  headline: {
    fontFamily: fonts.serif,
    fontSize: size.s27,
    lineHeight: size.s27 * 1.1,
    letterSpacing: em(size.s27, -0.025),
    color: ALWAYS_DARK.ink,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.sans,
    fontSize: size.s125,
    lineHeight: size.s125 * 1.5,
    color: 'rgba(244,242,237,0.6)',
    marginTop: 9,
    textAlign: 'center',
  },
  ctaWrap: { marginTop: 20, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', left: -6, right: -6, top: -6, bottom: -6, borderRadius: 18, borderWidth: 1 },
  cta: {
    width: 200,
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  ctaLabel: { fontFamily: fonts.sansSemi, fontSize: size.s135, color: ALWAYS_DARK.bg },
});
