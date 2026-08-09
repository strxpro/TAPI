import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/I18nProvider';
import { ease, em, fonts, radius, size, space } from '../theme/tokens';
import { Text } from '../ui/Text';
import { venues } from '../data/venues';

/**
 * Mapa — odwzorowanie Bywalec.dc.html, linie 610–786.
 *
 * ⚠️ Bez prawdziwych kafelków. W prototypie jest Leaflet + OSM, a mgła to
 * `backdrop-filter: grayscale(1)` z wyciętymi okręgami — czego React Native
 * nie ma. To jest wersja tymczasowa: siatka, pinezki i dolny panel ze
 * statystykami, wszystko na tokenach z prototypu.
 *
 * Docelowe rozwiązanie mgły czeka na twoją decyzję (dwa podejścia opisane
 * w DECYZJE.md) — dlatego nie udaję tu efektu, którego nie potrafię oddać.
 */

const EXPLORED = 62; // procent odkrytej mapy — wartość demonstracyjna z prototypu

export function MapScreen() {
  const { theme, accentText, accentSoft } = useTheme();
  const { lang } = useI18n();
  const PL = lang === 'pl';

  // pasek postępu odkrycia
  const bar = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(bar, {
      toValue: 1,
      duration: 1250, // animacja mgły z README
      easing: Easing.bezier(...ease.standard),
      useNativeDriver: false,
    }).start();
  }, [bar]);

  return (
    <View style={[styles.root, { backgroundColor: theme.paper }]}>
      {/* ── podkład mapy ── */}
      <View style={[styles.canvas, { backgroundColor: theme.dark ? '#191C21' : '#EFECE5' }]}>
        {Array.from({ length: 14 }).map((_, i) => (
          <View
            key={`h${i}`}
            style={[styles.gridH, { top: i * 58, backgroundColor: theme.hair }]}
          />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={`v${i}`}
            style={[styles.gridV, { left: i * 58, backgroundColor: theme.hair }]}
          />
        ))}

        {/* pinezki lokali — rozłożone wg współrzędnych z danych */}
        {venues.map((v, i) => {
          const x = 40 + ((v.lng - 19.9358) / 0.0177) * 240;
          const y = 150 + ((50.0512 - v.lat) / 0.0057) * 210;
          return (
            <View key={v.id} style={[styles.pinWrap, { left: x, top: y }]}>
              <View style={[styles.pin, { backgroundColor: accentText, borderColor: theme.paper }]}>
                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={theme.paper} strokeWidth={2.2}>
                  <Path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" />
                  <Circle cx={12} cy={10} r={2.2} />
                </Svg>
              </View>
              <Text style={[styles.pinLabel, { color: theme.ink }]} numberOfLines={1}>
                {v.name}
              </Text>
            </View>
          );
        })}
      </View>

      {/* ── dolny panel, linie 700–786 ── */}
      <View style={[styles.panel, { backgroundColor: theme.surf, borderColor: theme.hair }]}>
        <View style={[styles.grabber, { backgroundColor: theme.hair }]} />

        <Text style={[styles.pct, { color: theme.ink }]}>{EXPLORED}%</Text>
        <Text variant="caption" color={theme.sub}>
          {PL ? 'odkrytej mapy' : 'of the map uncovered'}
        </Text>

        <View style={[styles.track, { backgroundColor: theme.hair }]}>
          <Animated.View
            style={[
              styles.fill,
              {
                backgroundColor: accentText,
                width: bar.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', `${EXPLORED}%`],
                }),
              },
            ]}
          />
        </View>

        <View style={styles.stats}>
          <Stat value="7" label={PL ? 'kwartały' : 'blocks'} />
          <Stat value={String(venues.length)} label={PL ? 'miejsca' : 'places'} />
          <Stat value="2" label={PL ? 'zapisane' : 'saved'} />
        </View>
      </View>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: theme.ink }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.sub }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject },
  canvas: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  gridH: { position: 'absolute', left: 0, right: 0, height: 1 },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: 1 },
  pinWrap: { position: 'absolute', alignItems: 'center', gap: 4 },
  pin: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinLabel: { fontFamily: fonts.sansSemi, fontSize: size.s10 },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    paddingHorizontal: space.screen,
    paddingBottom: 118,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
  },
  grabber: { width: 36, height: 4, borderRadius: 4, marginBottom: 16 },
  pct: { fontFamily: fonts.archivoBold, fontSize: 28, letterSpacing: em(28, -0.035) },
  track: { width: '100%', height: 6, borderRadius: 6, marginTop: 14, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },
  stats: { flexDirection: 'row', gap: 12, marginTop: 18, width: '100%' },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontFamily: fonts.archivo, fontSize: size.s22 },
  statLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: size.s9,
    letterSpacing: em(size.s9, 0.16),
    textTransform: 'uppercase',
  },
});
