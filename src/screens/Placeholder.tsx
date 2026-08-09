import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { useT } from '../i18n/I18nProvider';
import { radius, space } from '../theme/tokens';
import { Text } from '../ui/Text';
import type { Key } from '../i18n/dict';

/** Ekran zastępczy na czas punktu 1. Siatka 20 px od krawędzi. */
export function Placeholder({
  titleKey,
  step,
  children,
}: {
  titleKey: Key;
  step: string;
  children?: React.ReactNode;
}) {
  const t = useT();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={{
        paddingTop: insets.top + space.afterHeading,
        // wysokość paska 62 + odstęp dolny 24 + oddech
        paddingBottom: insets.bottom + 62 + 24 + space.section,
        paddingHorizontal: space.screen,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text variant="labelWide" upper tone="sub">
        {step}
      </Text>
      <Text variant="serifLg" style={styles.title}>
        {t(titleKey)}
      </Text>

      {children ?? (
        <View style={[styles.note, { backgroundColor: theme.surf, borderColor: theme.hair }]}>
          <Text variant="body" tone="sub">
            Ekran dojdzie w kolejnym punkcie wdrożenia. Fundament — nawigacja, motywy,
            tłumaczenia i typografia — już działa.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  title: { marginTop: 6 },
  note: {
    marginTop: space.section,
    padding: space.card,
    borderRadius: radius.card16,
    borderWidth: 1,
  },
});
