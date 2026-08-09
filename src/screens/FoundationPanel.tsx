import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, type ThemeMode } from '../theme/ThemeProvider';
import { useI18n, useT } from '../i18n/I18nProvider';
import { LANGS, LANG_LABEL, type Lang } from '../i18n/dict';
import { accents, radius, space, type AccentName } from '../theme/tokens';
import { Text } from '../ui/Text';

/**
 * Sterowanie motywem, akcentem i językiem — sprawdzian fundamentu.
 * Docelowo trafi do zakładki Impostazioni w profilu.
 */
export function FoundationPanel() {
  const { theme, accent, accentSoft, mode, setMode, accentName, setAccent } = useTheme();
  const { lang, setLang } = useI18n();
  const t = useT();

  const at = theme.dark ? accent.text : accent.hex;
  const tap = () => void Haptics.selectionAsync().catch(() => {});

  const MODES: { id: ThemeMode; label: string }[] = [
    { id: 'papier', label: 'Papier' },
    { id: 'noc', label: 'Noc' },
    { id: 'auto', label: 'Auto' },
  ];

  return (
    <View style={{ marginTop: space.section }}>
      <Text variant="label" upper tone="sub">
        {t('theme')}
      </Text>
      <View style={[styles.group, { backgroundColor: theme.surf, borderColor: theme.hair }]}>
        {MODES.map(({ id, label }) => {
          const on = mode === id;
          return (
            <Pressable
              key={id}
              onPress={() => {
                tap();
                setMode(id);
              }}
              style={({ pressed }) => [
                styles.segment,
                on && { backgroundColor: accentSoft },
                pressed && styles.pressed,
              ]}
            >
              <Text variant={on ? 'bodySemi' : 'body'} color={on ? at : theme.sub}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text variant="label" upper tone="sub" style={styles.heading}>
        {t('accent')}
      </Text>
      <View style={styles.swatches}>
        {(Object.keys(accents) as AccentName[]).map((name) => {
          const a = accents[name];
          const on = accentName === name;
          return (
            <Pressable
              key={name}
              onPress={() => {
                tap();
                setAccent(name);
              }}
              style={({ pressed }) => [
                styles.swatchWrap,
                {
                  backgroundColor: theme.surf,
                  borderColor: on ? (theme.dark ? a.text : a.hex) : theme.hair,
                },
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.swatch, { backgroundColor: theme.dark ? a.text : a.hex }]} />
              <Text variant="body" tone={on ? 'ink' : 'sub'}>
                {a.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text variant="label" upper tone="sub" style={styles.heading}>
        {t('language')}
      </Text>
      <View style={[styles.group, { backgroundColor: theme.surf, borderColor: theme.hair }]}>
        {LANGS.map((l: Lang) => {
          const on = lang === l;
          return (
            <Pressable
              key={l}
              onPress={() => {
                tap();
                setLang(l);
              }}
              style={({ pressed }) => [
                styles.segment,
                on && { backgroundColor: accentSoft },
                pressed && styles.pressed,
              ]}
            >
              <Text variant={on ? 'bodySemi' : 'body'} color={on ? at : theme.sub}>
                {LANG_LABEL[l]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text variant="label" upper tone="sub" style={styles.heading}>
        {t('settings')}
      </Text>
      <View style={[styles.card, { backgroundColor: theme.surf, borderColor: theme.hair }]}>
        <Text variant="serifXl">Instrument Serif</Text>
        <Text variant="numLg" tone="accent">
          1 240
        </Text>
        <Text variant="title">Plus Jakarta Sans 700 — tytuł wiersza</Text>
        <Text variant="body" tone="sub">
          Plus Jakarta Sans 500 — 12,5 px, najczęstszy rozmiar w prototypie
        </Text>
        <Text variant="label" upper tone="sub">
          Etykieta 10,5 · 0.14em
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: space.section },
  group: {
    flexDirection: 'row',
    marginTop: space.afterHeading,
    padding: 4,
    gap: 4,
    borderRadius: radius.row,
    borderWidth: 1,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: radius.card,
  },
  pressed: { opacity: 0.72 },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.group,
    marginTop: space.afterHeading,
  },
  swatchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.group,
    paddingVertical: 9,
    paddingHorizontal: space.afterHeading,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  swatch: { width: 15, height: 15, borderRadius: radius.sm },
  card: {
    marginTop: space.afterHeading,
    padding: space.card,
    borderRadius: radius.card16,
    borderWidth: 1,
    gap: space.group,
  },
});
