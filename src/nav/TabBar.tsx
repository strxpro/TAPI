import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeProvider';
import { useT } from '../i18n/I18nProvider';
import { duration, ease, radius, shadow } from '../theme/tokens';
import { Text } from '../ui/Text';
import { IconDiscover, IconFriends, IconMap, IconProfile, IconScan } from '../ui/icons';
import { TABS, TAB_LABEL, type Tab } from './routes';

/**
 * Pasek nawigacji — odwzorowanie prototypu.
 *
 * Prototyp NIE ma wyniesionego środkowego przycisku skanera (README myli się
 * w tym punkcie): jest pięć równych pozycji w jednej pigułce, a pod aktywną
 * jeżdżąca pigułka z poświatą.
 *
 * Wymiary z prototypu: wysokość 62, padding 6, promień 999,
 * kontener 0 12px 24px, ikony 19 px, etykieta 9 px / 0.03em.
 *
 * Rozmycie tła (`backdrop-filter: blur(20px) saturate(1.4)` na pasku
 * i `blur(8px) saturate(1.9)` na pigułce) robi teraz `expo-blur`. Wcześniej
 * było tylko półprzezroczyste tło o tej samej wartości alfa — kolor się
 * zgadzał, ale nic pod spodem nie było rozmyte (ROZBIEZNOSCI §8).
 */

const ICONS = {
  discover: IconDiscover,
  map: IconMap,
  scan: IconScan,
  friends: IconFriends,
  profile: IconProfile,
} as const;

/** `blur(20px)` w CSS to mniej więcej `intensity 55` w expo-blur. */
const BAR_BLUR = 55;
const PILL_BLUR = 26;

const BAR_H = 62;
const PAD = 6;
const SIDE = 12;
const BOTTOM = 24;

export function TabBar({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  const { theme, accent, accentSoft } = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const active = theme.dark ? accent.text : accent.hex;

  // Szerokość jednej komórki: (szerokość paska − 2×padding) / liczba pozycji.
  const inner = width - SIDE * 2 - PAD * 2;
  const cell = inner / TABS.length;
  const index = Math.max(0, TABS.indexOf(tab));

  const pillX = useRef(new Animated.Value(index * cell)).current;
  // Wejście paska: @keyframes navUp — translateY(26px) scale(0.96) → none
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: duration.navUp,
      easing: Easing.bezier(...ease.standard),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  useEffect(() => {
    Animated.timing(pillX, {
      toValue: index * cell,
      duration: duration.pillLeft,
      easing: Easing.bezier(...ease.pillLeft),
      useNativeDriver: true,
    }).start();
  }, [index, cell, pillX]);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.dock,
        {
          paddingBottom: BOTTOM + insets.bottom,
          opacity: enter,
          transform: [
            {
              translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [26, 0] }),
            },
            {
              scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }),
            },
          ],
        },
      ]}
    >
      <View style={[styles.bar, { borderColor: theme.hair }, shadow.nav]}>
        {/* rozmycie tego, co pod paskiem */}
        <BlurView
          intensity={BAR_BLUR}
          tint={theme.dark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        {/* Warstwa koloru na szkle. Alfa niższa niż 0.86 z prototypu, bo tam
            barwa i rozmycie były w jednym; tu rozmycie robi warstwa wyżej. */}
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.dark ? 'rgba(29,32,37,0.55)' : 'rgba(255,255,255,0.55)' },
          ]}
        />

        {/* jeżdżąca pigułka — linia 4007 */}
        <Animated.View
          style={[
            styles.pill,
            {
              width: cell,
              transform: [{ translateX: pillX }],
              borderColor: theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)',
            },
            shadow.pill,
          ]}
        >
          <BlurView
            intensity={PILL_BLUR}
            tint={theme.dark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={
              theme.dark
                ? ['rgba(255,255,255,0.18)', 'rgba(87,195,159,0.14)']
                : ['rgba(255,255,255,0.96)', accentSoft]
            }
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* połysk ::before — left 12%, right 12%, top 2, height 38% */}
          <View
            style={[
              styles.gloss,
              {
                backgroundColor: theme.dark
                  ? 'rgba(255,255,255,0.10)'
                  : 'rgba(255,255,255,0.75)',
              },
            ]}
          />
        </Animated.View>

        {TABS.map((id) => (
          <Item
            key={id}
            id={id}
            label={t(TAB_LABEL[id])}
            selected={tab === id}
            activeColor={active}
            subColor={theme.sub}
            // Drgnięcie i dźwięk dokłada `setTab` w powłoce — jedno miejsce
            // dla stuknięcia i dla gestu.
            onPress={() => onTab(id)}
          />
        ))}
      </View>
    </Animated.View>
  );
}

/* ─────────────────────────────────────────────────────────────── pozycja ── */

function Item({
  id,
  label,
  selected,
  activeColor,
  subColor,
  onPress,
}: {
  id: Tab;
  label: string;
  selected: boolean;
  activeColor: string;
  subColor: string;
  onPress: () => void;
}) {
  const Icon = ICONS[id];

  // linia 4010: translateY(-2px) scale(1.18) na aktywnej ikonie
  const iconAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;
  // linia 4009: translateY(-1px) na aktywnej pozycji
  const lift = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(iconAnim, {
      toValue: selected ? 1 : 0,
      duration: duration.icon,
      easing: Easing.bezier(...ease.icon),
      useNativeDriver: true,
    }).start();
    Animated.timing(lift, {
      toValue: selected ? 1 : 0,
      duration: duration.microLg,
      easing: Easing.bezier(...ease.navBar),
      useNativeDriver: true,
    }).start();
  }, [selected, iconAnim, lift]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={styles.item}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.itemInner,
            {
              transform: [
                { translateY: lift.interpolate({ inputRange: [0, 1], outputRange: [0, -1] }) },
                // style-active: translateY(1px) scale(0.9)
                { scale: pressed ? 0.9 : 1 },
                { translateY: pressed ? 1 : 0 },
              ],
            },
          ]}
        >
          <Animated.View
            style={{
              transform: [
                { translateY: iconAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) },
                { scale: iconAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) },
              ],
            }}
          >
            <Icon color={selected ? activeColor : subColor} />
          </Animated.View>
          <Text color={selected ? activeColor : subColor} variant={selected ? 'navLabelOn' : 'navLabel'}>
            {label}
          </Text>
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SIDE,
    zIndex: 120,
  },
  bar: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'stretch',
    height: BAR_H,
    padding: PAD,
    borderRadius: radius.pill,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pill: {
    position: 'absolute',
    top: PAD,
    bottom: PAD,
    left: PAD,
    borderRadius: radius.pill,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    left: '12%',
    right: '12%',
    top: 2,
    height: '38%',
    borderRadius: radius.pill,
  },
  item: { flex: 1, zIndex: 1 },
  itemInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
});
