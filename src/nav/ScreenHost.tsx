import { useEffect, useRef } from 'react';
import { Animated, Easing, PanResponder, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { ease } from '../theme/tokens';
import { TABS, type Tab } from './routes';

/**
 * Gospodarz ekranów: wejście `slideInR` / `slideInL` zależne od kierunku
 * (prototyp, `scrIn` i `navDir`) oraz gest poziomy przełączający zakładki.
 *
 * Zasady gestu — tak, żeby nie łapał niczego przy okazji:
 *
 *  1. Ruch musi być wyraźnie poziomy: 28 px w bok i dwa razy więcej
 *     w poziomie niż w pionie. Poniżej tego progu gest należy do przewijania.
 *  2. Nie przejmujemy gestu, który złapało już dziecko. Poziome karuzele
 *     („Dziś w mieście", pigułki terminów) i suwaki obracające model 3D
 *     zgłaszają się pierwsze i zostają przy swoim — dlatego nie ma tu
 *     wariantu `Capture`.
 *  3. Liczy się też prędkość. Powolne przeciągnięcie przez pół ekranu to
 *     zwykle pomyłka przy przewijaniu, nie chęć zmiany zakładki.
 *  4. Gdy na wierzchu leży wizytówka albo planer, gest jest wyłączony —
 *     przełączanie zakładek pod spodem byłoby zaskoczeniem.
 */

/** Ile pikseli w bok, żeby w ogóle zacząć rozważać gest. */
const CLAIM_DX = 28;
/** Ile razy ruch musi być bardziej poziomy niż pionowy. */
const CLAIM_RATIO = 2;
/** Ile trzeba przejechać, żeby zakładka faktycznie się zmieniła. */
const SWITCH_DX = 70;
/** Albo szybciej niż tyle pikseli na milisekundę przy krótszym ruchu. */
const SWITCH_VX = 0.35;

export function ScreenHost({
  tab,
  onTab,
  enabled = true,
  children,
}: {
  tab: Tab;
  onTab: (t: Tab) => void;
  /** false, gdy na wierzchu leży ekran przykrywający zakładki */
  enabled?: boolean;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const shift = useRef(new Animated.Value(0)).current;

  // Kierunek wejścia: w prawo, gdy idziemy dalej w pasku, w lewo — gdy wstecz.
  const previous = useRef<Tab>(tab);

  useEffect(() => {
    const from = TABS.indexOf(previous.current);
    const to = TABS.indexOf(tab);
    previous.current = tab;
    const forward = to >= from;

    opacity.setValue(0);
    shift.setValue(forward ? 26 : -26);
    const anim = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 440,
        easing: Easing.bezier(...ease.standard),
        useNativeDriver: true,
      }),
      Animated.timing(shift, {
        toValue: 0,
        duration: 440,
        easing: Easing.bezier(...ease.standard),
        useNativeDriver: true,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [tab, opacity, shift]);

  // PanResponder powstaje raz, więc bieżące dane czytamy z refów.
  const tabRef = useRef<Tab>(tab);
  tabRef.current = tab;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const onTabRef = useRef(onTab);
  onTabRef.current = onTab;

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) =>
        enabledRef.current &&
        Math.abs(g.dx) > CLAIM_DX &&
        Math.abs(g.dx) > Math.abs(g.dy) * CLAIM_RATIO,
      onPanResponderRelease: (_e, g) => {
        if (!enabledRef.current) return;
        const far = Math.abs(g.dx) >= SWITCH_DX;
        const fast = Math.abs(g.vx) >= SWITCH_VX && Math.abs(g.dx) > CLAIM_DX;
        if (!far && !fast) return;

        const i = TABS.indexOf(tabRef.current);
        if (i < 0) return;
        const next = TABS[g.dx < 0 ? i + 1 : i - 1];
        if (next) onTabRef.current(next);
      },
    }),
  ).current;

  return (
    <View style={[styles.fill, { backgroundColor: theme.paper }]} {...pan.panHandlers}>
      <Animated.View style={[styles.fill, { opacity, transform: [{ translateX: shift }] }]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
