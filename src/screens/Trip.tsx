import { ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/I18nProvider';
import { em, fonts, radius, size, space } from '../theme/tokens';
import { Text } from '../ui/Text';
import { venues } from '../data/venues';

/**
 * Wyjazd — trasa złożona z lokali, w kolejności zwiedzania.
 *
 * ⚠️ W prototypie ta zakładka jest rozbudowana (planer z wyborem godzin).
 * To jest wersja skrócona: kolejność, przejścia i nagrody. Rozbudowa
 * po tym, jak potwierdzisz układ pozostałych ekranów.
 */

export function Trip() {
  const { theme, accentText, accentSoft } = useTheme();
  const { lang } = useI18n();
  const PL = lang === 'pl';

  // Trasa demonstracyjna: kawa → jedzenie → wino → wydarzenie
  const route = ['brama', 'ostra', 'nokturn', 'forum']
    .map((id) => venues.find((v) => v.id === id))
    .filter((v): v is NonNullable<typeof v> => Boolean(v));

  const walk = ['8 min', '11 min', '6 min'];

  return (
    <ScrollView
      style={{ backgroundColor: theme.paper }}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.sub }]}>
          {PL ? 'Czwartek · Kazimierz' : 'Thursday · Kazimierz'}
        </Text>
        <Text style={[styles.title, { color: theme.ink }]}>
          {PL ? 'Plan na wieczór' : 'Tonight’s plan'}
        </Text>
      </View>

      <View style={styles.list}>
        {route.map((v, i) => (
          <View key={v.id}>
            <View style={[styles.stop, { backgroundColor: theme.surf, borderColor: theme.hair }]}>
              <View style={[styles.index, { backgroundColor: accentSoft }]}>
                <Text style={[styles.indexLabel, { color: accentText }]}>{i + 1}</Text>
              </View>
              <LinearGradient
                colors={v.grad}
                locations={[0, 0.55, 1]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.thumb}
              />
              <View style={{ flex: 1, gap: 3 }}>
                <Text variant="title" color={theme.ink} numberOfLines={1}>
                  {v.name}
                </Text>
                <Text variant="caption" color={theme.sub} numberOfLines={1}>
                  {v.catLabel} · {v.dist}
                </Text>
              </View>
            </View>

            {i < walk.length && (
              <View style={styles.walk}>
                <View style={[styles.walkLine, { backgroundColor: theme.hair }]} />
                <Text style={[styles.walkLabel, { color: theme.sub }]}>
                  {PL ? 'spacer' : 'walk'} {walk[i]}
                </Text>
                <View style={[styles.walkLine, { backgroundColor: theme.hair }]} />
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 54, paddingBottom: 128 },
  header: { paddingTop: 14, paddingHorizontal: space.screen },
  kicker: {
    fontFamily: fonts.sansSemi,
    fontSize: size.s105,
    letterSpacing: em(size.s105, 0.14),
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 34,
    letterSpacing: em(34, -0.03),
    lineHeight: 34 * 1.05,
    marginTop: 8,
  },
  list: { marginTop: space.section, paddingHorizontal: space.screen },
  stop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: radius.row18,
    borderWidth: 1,
  },
  index: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexLabel: { fontFamily: fonts.archivoBold, fontSize: size.s12 },
  thumb: { width: 46, height: 46, borderRadius: radius.card },
  walk: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  walkLine: { flex: 1, height: 1 },
  walkLabel: {
    fontFamily: fonts.sans,
    fontSize: size.s10,
    letterSpacing: em(size.s10, 0.14),
    textTransform: 'uppercase',
  },
});
