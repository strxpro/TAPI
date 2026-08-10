import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { duration, ease, radius, space } from '../theme/tokens';
import { cue } from './feedback';

/**
 * Arkusz zsuwany palcem w dół.
 *
 * Wszystkie arkusze w aplikacji mają zachowywać się tak samo, więc mechanika
 * siedzi w jednym miejscu:
 *
 *  - ciągnięcie w dół przesuwa arkusz palec w palec, bez opóźnienia
 *  - ciągnięcie w górę stawia opór (ruch dzielony przez 3), żeby było czuć,
 *    że to koniec — zamiast pozwalać odkleić arkusz od góry ekranu
 *  - puszczenie zamyka, gdy przejechało się ponad 1/4 wysokości **albo**
 *    gdy ruch był szybki; inaczej arkusz wraca na miejsce
 *  - zamknięcie gestem daje to samo drgnięcie co dotknięcie tła
 *
 * Uchwyt u góry jest polem gestu, ale ciągnąć można za całą górną belkę —
 * trafienie w kreskę szerokości 36 px byłoby loterią.
 */

/** Ile trzeba przejechać w dół, żeby puszczenie zamknęło — ułamek wysokości. */
const CLOSE_RATIO = 0.25;
/** Albo szybciej niż tyle pikseli na milisekundę. */
const CLOSE_VELOCITY = 0.7;

export function Sheet({
  open,
  onClose,
  children,
  /** maksymalna wysokość jako ułamek ekranu */
  maxHeight = '88%',
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight?: `${number}%`;
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: screen } = useWindowDimensions();

  // Przesunięcie w pikselach: 0 = na miejscu, rośnie w dół.
  const shift = useRef(new Animated.Value(screen)).current;

  const slideIn = useCallback(() => {
    Animated.timing(shift, {
      toValue: 0,
      duration: duration.sheet,
      easing: Easing.bezier(...ease.standard),
      useNativeDriver: true,
    }).start();
  }, [shift]);

  const slideOut = useCallback(
    (velocity = 0) => {
      Animated.timing(shift, {
        toValue: screen,
        // Przy szybkim rzucie skracamy wyjście, żeby nadążało za palcem.
        duration: velocity > CLOSE_VELOCITY ? 180 : 260,
        easing: Easing.bezier(0.4, 0, 1, 1),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onClose();
      });
    },
    [shift, screen, onClose],
  );

  useEffect(() => {
    if (open) {
      shift.setValue(screen);
      slideIn();
    }
  }, [open, shift, screen, slideIn]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        // Zaczynamy dopiero przy wyraźnym ruchu pionowym — inaczej gest
        // odbierałby przewijanie treści w środku arkusza.
        onMoveShouldSetPanResponder: (_e, g) =>
          Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderMove: (_e, g) => {
          // W górę stawiamy opór, w dół idziemy palec w palec.
          shift.setValue(g.dy < 0 ? g.dy / 3 : g.dy);
        },
        onPanResponderRelease: (_e, g) => {
          const far = g.dy > screen * CLOSE_RATIO;
          const fast = g.vy > CLOSE_VELOCITY && g.dy > 40;
          if (far || fast) {
            cue('select');
            slideOut(g.vy);
            return;
          }
          Animated.spring(shift, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
            speed: 14,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(shift, { toValue: 0, useNativeDriver: true, speed: 14 }).start();
        },
      }),
    [shift, screen, slideOut],
  );

  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      onRequestClose={() => slideOut()}
      statusBarTranslucent
    >
      <View style={styles.root}>
        {/* Tło ciemnieje razem z arkuszem — przy zsuwaniu rozjaśnia się. */}
        <Animated.View
          style={[
            styles.scrim,
            {
              opacity: shift.interpolate({
                inputRange: [0, screen],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => slideOut()} accessibilityRole="button" />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            SHADOW,
            {
              maxHeight,
              backgroundColor: theme.paper,
              paddingBottom: 26 + insets.bottom,
              transform: [{ translateY: shift }],
            },
          ]}
        >
          {/* Cała górna belka łapie gest, nie sama kreska. */}
          <View {...pan.panHandlers} style={styles.grabber}>
            <View style={[styles.grip, { backgroundColor: theme.hair }]} />
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

/** CSS: 0 -30px 60px -40px rgba(22,24,28,0.9) */
const SHADOW = {
  shadowColor: '#16181C',
  shadowOpacity: 0.2,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: -12 },
  elevation: 20,
} as const;

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(22,24,28,0.45)' },
  sheet: {
    borderTopLeftRadius: radius.sheet28,
    borderTopRightRadius: radius.sheet28,
    paddingHorizontal: space.screen,
  },
  // 44 px to najmniejsze pole dotyku, które da się trafić bez celowania
  grabber: { height: 44, alignItems: 'center', justifyContent: 'center' },
  grip: { width: 36, height: 4, borderRadius: 4 },
});
