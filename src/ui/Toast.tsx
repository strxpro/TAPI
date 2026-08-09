import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text as RNText, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { duration, ease, em, fonts, ON_ACCENT, radius, size } from '../theme/tokens';

/**
 * Komunikat u góry ekranu — TAPI-standalone.html, sekcja „TOAST".
 *
 * Jeden na raz, znika po 2,6 s. Wjeżdża klatkami `sheetDown`
 * (translateY −104% własnej wysokości → 0), a pasek pod spodem odlicza
 * czas przez `lineGrow` puszczone wstecz (scaleX 1 → 0, liniowo).
 *
 * W prototypie toast jest elementem aplikacji, nie ekranu. Do czasu, aż
 * powstanie wspólna powłoka, montuje go ekran, który go wywołuje.
 */

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((msg: string) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(msg);
    timer.current = setTimeout(() => setMessage(null), duration.toast);
  }, []);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  return { message, toast };
}

export function Toast({ message }: { message: string | null }) {
  const { theme, accent } = useTheme();
  const [height, setHeight] = useState(0);
  const slide = useRef(new Animated.Value(0)).current;
  const bar = useRef(new Animated.Value(1)).current;

  // Kluczem jest treść: nowy komunikat ma zagrać wejście od nowa.
  useEffect(() => {
    if (!message || !height) return;
    slide.setValue(0);
    bar.setValue(1);
    const anim = Animated.parallel([
      Animated.timing(slide, {
        toValue: 1,
        duration: duration.sheetDown,
        easing: Easing.bezier(...ease.standard),
        useNativeDriver: true,
      }),
      // Pasek kurczy się od prawej (`transform-origin: left`). W React Native
      // `scaleX` skaluje względem środka, więc zamiast skalować — zwężamy.
      Animated.timing(bar, {
        toValue: 0,
        duration: duration.toast,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [message, height, slide, bar]);

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
      style={[
        styles.root,
        SHADOW,
        {
          backgroundColor: theme.ink,
          // dopóki nie znamy wysokości, trzymamy komunikat schowany
          opacity: height ? 1 : 0,
          transform: [
            {
              translateY: slide.interpolate({
                inputRange: [0, 1],
                outputRange: [height * -1.04, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.mark, { backgroundColor: accent.hex }]}>
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={ON_ACCENT} strokeWidth={2.6}>
            <Path d="M4 12l5 5L20 6" />
          </Svg>
        </View>
        <RNText allowFontScaling={false} numberOfLines={3} style={[styles.text, { color: theme.paper }]}>
          {message}
        </RNText>
      </View>
      <Animated.View
        style={[
          styles.bar,
          {
            backgroundColor: accent.hex,
            width: bar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          },
        ]}
      />
    </Animated.View>
  );
}

/** CSS: 0 20px 40px -20px rgba(22,24,28,0.7) */
const SHADOW = {
  shadowColor: '#16181C',
  shadowOpacity: 0.3,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 11 },
  elevation: 10,
} as const;

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 52,
    left: 14,
    right: 14,
    zIndex: 400,
    borderRadius: radius.card16,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 13, paddingHorizontal: 15 },
  mark: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: size.s125,
    lineHeight: size.s125 * 1.35,
    letterSpacing: em(size.s125, 0),
  },
  bar: { height: 2 },
});
