import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import { duration, em, fonts, ON_ACCENT, radius, size, space } from '../../theme/tokens';
import { Raw } from '../../ui/Text';
import { press, useEnter, useFloaty, useShine, useSkeleton } from '../../ui/motion';
import {
  IconArrow,
  IconCalendar,
  IconChevron,
  IconLayers,
  IconPeak,
  IconPin,
  IconSpark,
  IconTag,
} from './icons';
import { discoverCopy } from './copy';
import type { Suggestion } from './model';

/**
 * Górna część ekranu Odkrywaj — TAPI-standalone.html:
 * baner planera AI, lista podpowiedzi, wiersz zainteresowań,
 * wiersz filtrów i szkielety ładowania.
 */

/* ──────────────────────────────────────────────────────── baner planera AI ── */

export function PlannerBanner({ onPress }: { onPress: () => void }) {
  const { theme, accent, accentText } = useTheme();
  const { lang } = useI18n();
  const c = discoverCopy[lang];
  const enter = useEnter('rise', duration.rise);

  return (
    <Animated.View style={enter}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => press(0.97)({ pressed })}
      >
        <LinearGradient
          // linear-gradient(135deg, paper 0%, rgba(87,195,159,0.18) 100%)
          colors={[theme.paper, 'rgba(87,195,159,0.18)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.banner, SHADOW_BANNER, { borderColor: accent.hex }]}
        >
          <View style={styles.bannerPeak}>
            <IconPeak size={120} color={accent.hex} />
          </View>

          <View style={styles.bannerRow}>
            <View style={[styles.bannerBadge, { backgroundColor: accent.hex }]}>
              <Raw style={styles.bannerBadgeText}>{c.plannerBadge}</Raw>
            </View>
            <Raw style={[styles.bannerKicker, { color: accentText }]}>{c.plannerKicker}</Raw>
          </View>

          <Raw style={[styles.bannerTitle, { color: theme.ink }]}>{c.plannerTitle}</Raw>
          <Raw style={[styles.bannerSub, { color: theme.sub }]}>{c.plannerSub}</Raw>

          <View style={styles.bannerCta}>
            <Raw style={[styles.bannerCtaText, { color: accentText }]}>{c.plannerCta}</Raw>
            <IconArrow size={14} color={accentText} width={2.4} />
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

/* ──────────────────────────────────────────────────────────── podpowiedzi ── */

const SUG_ICON = {
  venue: IconPin,
  event: IconCalendar,
  tag: IconTag,
  area: IconLayers,
} as const;

export function SuggestionList({
  items,
  onPick,
  /**
   * `inline` — lista pod wyszukiwarką: odstęp 9 px, wiersze wchodzą kaskadą
   * `header` — lista w przyklejonym nagłówku: odstęp 8 px, mocniejszy cień,
   *            wiersze bez kaskady (prototyp nie daje im `animation-delay`)
   */
  variant = 'inline',
}: {
  items: Suggestion[];
  onPick: (s: Suggestion) => void;
  variant?: 'inline' | 'header';
}) {
  const { theme, accent, accentText, accentSoft } = useTheme();
  const enter = useEnter('rise', duration.micro);
  const inline = variant === 'inline';

  return (
    <Animated.View
      style={[
        styles.sugBox,
        inline ? styles.sugBoxInline : styles.sugBoxHeader,
        inline ? SHADOW_SUG : SHADOW_SUG_HEAD,
        { backgroundColor: theme.surf, borderColor: accent.hex },
        enter,
      ]}
    >
      {items.map((s, i) => (
        <SuggestionRow
          key={s.key}
          item={s}
          delay={inline ? i * 45 : 0}
          animate={inline}
          onPress={() => onPick(s)}
          hair={theme.hair}
          ink={theme.ink}
          sub={theme.sub}
          soft={accentSoft}
          accent={accentText}
        />
      ))}
    </Animated.View>
  );
}

function SuggestionRow({
  item,
  delay,
  animate,
  onPress,
  hair,
  ink,
  sub,
  soft,
  accent,
}: {
  item: Suggestion;
  delay: number;
  animate: boolean;
  onPress: () => void;
  hair: string;
  ink: string;
  sub: string;
  soft: string;
  accent: string;
}) {
  const enter = useEnter('rise', 340, delay);
  const Icon = SUG_ICON[item.kind];

  return (
    <Animated.View style={animate ? enter : undefined}>
      <Pressable onPress={onPress} accessibilityRole="button" style={[styles.sugRow, { borderBottomColor: hair }]}>
        <View style={[styles.sugIcon, { backgroundColor: soft }]}>
          <Icon size={14} color={accent} width={1.9} />
        </View>
        <View style={styles.sugBody}>
          <Raw numberOfLines={1} style={[styles.sugName, { color: ink }]}>
            {item.pre}
            <Raw style={[styles.sugHit, { color: accent }]}>{item.hit}</Raw>
            {item.post}
          </Raw>
          <Raw numberOfLines={1} style={[styles.sugSub, { color: sub }]}>
            {item.sub}
          </Raw>
        </View>
        <Raw style={[styles.sugKind, { color: sub }]}>{item.label}</Raw>
      </Pressable>
    </Animated.View>
  );
}

/* ────────────────────────────────────────────── wiersze pod wyszukiwarką ── */

/** Wiersz „Znajdź, co cię interesuje" */
export function InterestsRow({
  sub,
  outlined,
  onPress,
}: {
  sub: string;
  /** dopóki zainteresowania nie są zapisane, wiersz ma obwódkę w akcencie */
  outlined: boolean;
  onPress: () => void;
}) {
  const { theme, accent, accentText, accentSoft } = useTheme();
  const { lang } = useI18n();
  const c = discoverCopy[lang];
  const float = useFloaty();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[
        styles.entryRow,
        { backgroundColor: accentSoft, borderColor: outlined ? accentText : 'transparent' },
      ]}
    >
      <View style={[styles.entryIcon, { backgroundColor: accent.hex }]}>
        <Animated.View style={float}>
          <IconSpark size={14} color={ON_ACCENT} width={1.9} />
        </Animated.View>
      </View>
      <View style={styles.entryBody}>
        <Raw style={[styles.entryLabel, { color: accentText }]}>{c.intBtnLabel}</Raw>
        <Raw numberOfLines={1} style={[styles.entrySub, { color: theme.sub }]}>
          {sub}
        </Raw>
      </View>
      <IconChevron size={14} color={accentText} width={2.4} />
    </Pressable>
  );
}

/** Wiersz podsumowania po zapisaniu zainteresowań */
export function InterestsSummary({ text, onEdit }: { text: string; onEdit: () => void }) {
  const { theme, accent, accentText } = useTheme();
  const { lang } = useI18n();
  const c = discoverCopy[lang];
  const enter = useEnter('stagger', duration.list);

  return (
    <Animated.View style={enter}>
      <Pressable
        onPress={onEdit}
        accessibilityRole="button"
        style={[
          styles.summary,
          { backgroundColor: theme.dark ? accent.softDark : accent.soft },
        ]}
      >
        <IconSpark size={15} color={accentText} width={1.9} />
        <Raw style={[styles.summaryText, { color: accentText }]}>{text}</Raw>
        <Raw style={[styles.summaryEdit, { color: accentText }]}>{c.intEdit}</Raw>
      </Pressable>
    </Animated.View>
  );
}

/* ───────────────────────────────────────────────────────────────── szkielet ── */

export function Skeletons() {
  const { theme } = useTheme();
  const first = useSkeleton(0);
  const second = useSkeleton(100);
  const third = useSkeleton(200);
  const shine = useShine();
  const skin = { backgroundColor: theme.surf, borderColor: theme.hair };

  return (
    <View style={styles.skelWrap}>
      <Animated.View style={[styles.skelTall, skin, first]}>
        <Animated.View style={[styles.skelShine, shine]}>
          <LinearGradient
            colors={['transparent', 'rgba(22,24,28,0.05)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.skelShort, skin, second]} />
      <Animated.View style={[styles.skelShort, skin, third]} />
    </View>
  );
}

/* ─────────────────────────────────────────────────────────────────── style ── */

/** CSS: 0 16px 36px -16px rgba(31,90,70,0.3) */
const SHADOW_BANNER = {
  shadowColor: '#1F5A46',
  shadowOpacity: 0.22,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 9 },
  elevation: 4,
} as const;

/** CSS: 0 18px 34px -30px rgba(22,24,28,0.9) */
const SHADOW_SUG = {
  shadowColor: '#16181C',
  shadowOpacity: 0.18,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 7 },
  elevation: 5,
} as const;

/** CSS: 0 22px 40px -32px rgba(22,24,28,0.95) */
const SHADOW_SUG_HEAD = {
  shadowColor: '#16181C',
  shadowOpacity: 0.2,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 9 },
  elevation: 6,
} as const;

const styles = StyleSheet.create({
  /* ── baner planera ── */
  banner: {
    marginTop: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: radius.sheet22,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  bannerPeak: {
    position: 'absolute',
    right: -20,
    bottom: -30,
    opacity: 0.15,
    transform: [{ rotate: '-15deg' }],
  },
  bannerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bannerBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.badge },
  bannerBadgeText: {
    fontFamily: fonts.sansExtra,
    fontSize: size.s9,
    letterSpacing: em(size.s9, 0.1),
    textTransform: 'uppercase',
    color: '#FFFFFF',
  },
  bannerKicker: {
    fontFamily: fonts.sansBold,
    fontSize: size.s11,
    letterSpacing: em(size.s11, 0.1),
    textTransform: 'uppercase',
  },
  bannerTitle: {
    fontFamily: fonts.serif,
    fontSize: size.s32,
    letterSpacing: em(size.s32, -0.02),
    lineHeight: size.s32 * 1.1,
    marginTop: 8,
  },
  bannerSub: {
    fontFamily: fonts.sans,
    fontSize: size.s125,
    lineHeight: size.s125 * 1.45,
    marginTop: 6,
    maxWidth: '85%',
  },
  bannerCta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  bannerCtaText: { fontFamily: fonts.sansBold, fontSize: size.s13 },

  /* ── podpowiedzi ── */
  sugBox: { borderRadius: radius.card16, borderWidth: 1, overflow: 'hidden' },
  sugBoxInline: { marginTop: 9 },
  sugBoxHeader: { marginTop: 8 },
  sugRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  sugIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.tile10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sugBody: { flex: 1, minWidth: 0 },
  sugName: {
    fontFamily: fonts.sans,
    fontSize: size.s135,
    letterSpacing: em(size.s135, -0.01),
  },
  sugHit: { fontFamily: fonts.sansBold, fontSize: size.s135 },
  sugSub: { fontFamily: fonts.sans, fontSize: size.s11, marginTop: 2 },
  sugKind: {
    fontFamily: fonts.sans,
    fontSize: size.s9,
    letterSpacing: em(size.s9, 0.11),
    textTransform: 'uppercase',
  },

  /* ── wiersze wejściowe ── */
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 9,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.card15,
    borderWidth: 1,
  },
  entryIcon: {
    width: 26,
    height: 26,
    borderRadius: radius.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryBody: { flex: 1, minWidth: 0 },
  entryLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: size.s125,
    letterSpacing: em(size.s125, -0.01),
  },
  entrySub: { fontFamily: fonts.sans, fontSize: size.s105, marginTop: 2 },

  /* ── podsumowanie zainteresowań ── */
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.card16,
  },
  summaryText: {
    flex: 1,
    minWidth: 0,
    fontFamily: fonts.sans,
    fontSize: size.s12,
    lineHeight: size.s12 * 1.4,
  },
  summaryEdit: { fontFamily: fonts.sansSemi, fontSize: size.s115 },

  /* ── szkielet ── */
  skelWrap: { paddingTop: 14, paddingHorizontal: space.screen, gap: 10 },
  skelTall: { height: 150, borderRadius: radius.card16, borderWidth: 1, overflow: 'hidden' },
  skelShine: { position: 'absolute', top: 0, bottom: 0, width: '40%' },
  skelShort: { height: 92, borderRadius: radius.card16, borderWidth: 1 },
});
