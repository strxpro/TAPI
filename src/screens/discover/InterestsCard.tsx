import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import { duration, em, fonts, ON_ACCENT, radius, size } from '../../theme/tokens';
import { Raw } from '../../ui/Text';
import { useEnter, useFloaty } from '../../ui/motion';
import { interests } from '../../data/interests';
import { IconBell, IconCheck, IconSpark } from './icons';
import { alertsCta, discoverCopy } from './copy';
import { pick } from './model';

/**
 * Karta „Co cię interesuje?" — TAPI-standalone.html, gałąź `interestsCard`.
 *
 * Wybór jest wieloznaczny: przycisk zapisu zapala się dopiero przy pierwszej
 * zaznaczonej pozycji. Zapis przestawia filtr kategorii na kategorię
 * pierwszego wyboru — tak działa `saveInterests` w prototypie.
 */

export function InterestsCard({
  chosen,
  onToggle,
  onSave,
  onSkip,
}: {
  chosen: string[];
  onToggle: (id: string) => void;
  onSave: () => void;
  onSkip: () => void;
}) {
  const { theme, accent, accentText, accentSoft } = useTheme();
  const { lang } = useI18n();
  const c = discoverCopy[lang];
  const enter = useEnter('popIn', duration.popInLg);
  const float = useFloaty();

  const ready = chosen.length > 0;

  return (
    <Animated.View
      style={[styles.card, SHADOW, { backgroundColor: theme.surf, borderColor: theme.hair }, enter]}
    >
      <View style={styles.head}>
        <View style={[styles.headIcon, { backgroundColor: accentSoft }]}>
          <Animated.View style={float}>
            <IconSpark size={17} color={accentText} width={1.8} />
          </Animated.View>
        </View>
        <View style={styles.headBody}>
          <Raw style={[styles.title, { color: theme.ink }]}>{c.intTitle}</Raw>
          <Raw style={[styles.sub, { color: theme.sub }]}>{c.intSub}</Raw>
        </View>
      </View>

      <View style={styles.chips}>
        {interests.map((i) => {
          const on = chosen.includes(i.id);
          return (
            <Pressable
              key={i.id}
              onPress={() => onToggle(i.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={[
                styles.chip,
                {
                  backgroundColor: on ? accent.hex : theme.surf,
                  borderColor: on ? accent.hex : theme.hair,
                },
              ]}
            >
              <Raw style={[styles.chipText, { color: on ? ON_ACCENT : theme.sub }]}>
                {pick(lang, i.pl, i.en, i.it)}
              </Raw>
              {on && <IconCheck size={11} color={ON_ACCENT} width={3.2} />}
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={onSave}
        disabled={!ready}
        accessibilityRole="button"
        style={[styles.cta, { backgroundColor: ready ? accent.hex : theme.hair }]}
      >
        <IconBell size={14} color={ready ? ON_ACCENT : theme.sub} width={1.9} />
        <Raw style={[styles.ctaText, { color: ready ? ON_ACCENT : theme.sub }]}>
          {alertsCta(lang, chosen.length)}
        </Raw>
      </Pressable>

      <Pressable onPress={onSkip} accessibilityRole="button" style={styles.skip}>
        <Raw style={[styles.skipText, { color: theme.sub }]}>{c.intSkip}</Raw>
      </Pressable>
    </Animated.View>
  );
}

/** CSS: 0 18px 38px -34px rgba(22,24,28,0.9) */
const SHADOW = {
  shadowColor: '#16181C',
  shadowOpacity: 0.16,
  shadowRadius: 11,
  shadowOffset: { width: 0, height: 8 },
  elevation: 3,
} as const;

const styles = StyleSheet.create({
  card: {
    paddingTop: 17,
    paddingHorizontal: 17,
    paddingBottom: 15,
    borderRadius: radius.sheet22,
    borderWidth: 1,
  },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headBody: { flex: 1, minWidth: 0 },
  title: {
    fontFamily: fonts.serif,
    fontSize: size.s22,
    letterSpacing: em(size.s22, -0.025),
    lineHeight: size.s22 * 1.12,
  },
  sub: {
    fontFamily: fonts.sans,
    fontSize: size.s12,
    lineHeight: size.s12 * 1.45,
    marginTop: 5,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 14 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  chipText: { fontFamily: fonts.sans, fontSize: size.s125 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    height: 50,
    borderRadius: radius.card16,
  },
  ctaText: { fontFamily: fonts.sansSemi, fontSize: size.s135 },
  skip: { marginTop: 7, paddingVertical: 5, alignItems: 'center' },
  skipText: { fontFamily: fonts.sans, fontSize: size.s12 },
});
