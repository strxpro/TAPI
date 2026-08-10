import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, PanResponder, StyleSheet, View, useWindowDimensions } from 'react-native';
import { duration, ease } from '../theme/tokens';
import { cue } from '../ui/feedback';

/**
 * Ekran przykrywający zakładki, zsuwany palcem w dół.
 *
 * Wizytówka lokalu, planer i konfigurator stojaka wchodzą na wierzch i muszą
 * dać się zamknąć tak samo, jak zamyka się kartę w każdej innej aplikacji.
 *
 * Dlaczego gest zaczyna się tylko przy górnej krawędzi: pod spodem są listy
 * przewijane w pionie. Gdyby ekran łapał każdy ruch w dół, nie dałoby się
 * przewinąć treści do góry — palec zamykałby kartę zamiast przewijać.
 * Dlatego liczy się tylko ruch rozpoczęty w pasie `GRAB_ZONE` od góry,
 * czyli tam, gdzie i tak nie ma czego przewijać.
 */

/** Ile pikseli od góry łapie gest zamykania. */
const GRAB_ZONE = 120;
/** Ile trzeba przejechać w dół, żeby puszczenie zamknęło. */
const CLOSE_RATIO = 0.22;
const CLOSE_VELOCITY = 0.6;

export function Dismissable({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { height: screen } = useWindowDimensions();
  const shift = useRef(new Animated.Value(0)).current;
  // Czy gest zaczął się w pasie łapania — czytane w trakcie ruchu.
  const grabbed = useRef(false);

  useEffect(() => {
    shift.setValue(0);
  }, [shift]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (e, g) => {
          const fromTop = e.nativeEvent.pageY - g.dy;
          grabbed.current = fromTop < GRAB_ZONE;
          return (
            grabbed.current && g.dy > 8 && g.dy > Math.abs(g.dx) * 1.5
          );
        },
        onPanResponderMove: (_e, g) => {
          if (g.dy > 0) shift.setValue(g.dy);
        },
        onPanResponderRelease: (_e, g) => {
          const far = g.dy > screen * CLOSE_RATIO;
          const fast = g.vy > CLOSE_VELOCITY && g.dy > 40;
          if (far || fast) {
            cue('select');
            Animated.timing(shift, {
              toValue: screen,
              duration: 240,
              easing: Easing.bezier(0.4, 0, 1, 1),
              useNativeDriver: true,
            }).start(({ finished }) => finished && onClose());
            return;
          }
          Animated.timing(shift, {
            toValue: 0,
            duration: duration.micro,
            easing: Easing.bezier(...ease.standard),
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.timing(shift, {
            toValue: 0,
            duration: duration.micro,
            easing: Easing.bezier(...ease.standard),
            useNativeDriver: true,
          }).start();
        },
      }),
    [shift, screen, onClose],
  );

  return (
    <Animated.View
      style={[styles.fill, { transform: [{ translateY: shift }] }]}
      {...pan.panHandlers}
    >
      {children}
      {/* Kreska u góry — jedyny znak, że kartę da się zsunąć. */}
      <View pointerEvents="none" style={styles.hint}>
        <View style={styles.hintBar} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  hint: { position: 'absolute', top: 8, left: 0, right: 0, alignItems: 'center' },
  hintBar: {
    width: 36,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(128,128,128,0.35)',
  },
});
