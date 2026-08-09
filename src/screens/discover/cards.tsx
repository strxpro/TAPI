import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n, useT } from '../../i18n/I18nProvider';
import { duration, em, fonts, ON_ACCENT, radius, size } from '../../theme/tokens';
import { Raw } from '../../ui/Text';
import { press, useEnter } from '../../ui/motion';
import type { Venue } from '../../data/venues';
import type { CityEvent } from '../../data/events';
import { IconBookmark } from './icons';
import { catLabel, eventDow, eventMonth, eventTag, type TodayCard } from './model';
import { discoverCopy } from './copy';

/**
 * Karty i wiersze list ekranu Odkrywaj — TAPI-standalone.html,
 * sekcje „Dziś w mieście", „Blisko ciebie", „Nadchodzące wydarzenia".
 *
 * Kaskada wejścia (`rise` 0,5 s) ma w prototypie różny krok: 70 ms dla kart
 * i lokali, 60 ms dla wydarzeń.
 */

export const STEP_CARD = 70;
export const STEP_EVENT = 60;

/** Kąt 150° z prototypu — ta sama para punktów co w pozostałych ekranach. */
const GRAD_START = { x: 0.1, y: 0 } as const;
const GRAD_END = { x: 0.9, y: 1 } as const;

/* ────────────────────────────────────────────────────────── dziś w mieście ── */

export function TodayCardView({ card, index, onPress }: { card: TodayCard; index: number; onPress: () => void }) {
  const { theme } = useTheme();
  const enter = useEnter('rise', duration.list, index * STEP_CARD);

  return (
    <Animated.View style={enter}>
      <Pressable onPress={onPress} accessibilityRole="button">
        <View style={[styles.today, { backgroundColor: theme.surf, borderColor: theme.hair }]}>
          <LinearGradient
            colors={card.grad}
            locations={[0, 0.6, 1]}
            start={GRAD_START}
            end={GRAD_END}
            style={styles.todayImage}
          >
            <View style={styles.todayTag}>
              <Raw style={styles.todayTagText}>{card.tag}</Raw>
            </View>
            <View style={styles.todayWhen}>
              <Raw style={styles.todayWhenText}>{card.when}</Raw>
            </View>
          </LinearGradient>
          <View style={styles.todayBody}>
            <Raw style={[styles.todayTitle, { color: theme.ink }]}>{card.title}</Raw>
            <Raw style={[styles.todayPlace, { color: theme.sub }]}>{card.place}</Raw>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/* ────────────────────────────────────────────────────────────── lokal ── */

export function VenueRow({
  venue,
  index,
  saved,
  onPress,
  onSave,
}: {
  venue: Venue;
  index: number;
  saved: boolean;
  onPress: () => void;
  onSave: () => void;
}) {
  const { theme, accent, accentText } = useTheme();
  const { lang } = useI18n();
  const t = useT();
  const enter = useEnter('rise', duration.list, index * STEP_CARD);

  const status = venue.isOpen ? `${t('open')} · ${t('until')} ${venue.closes}` : t('closed');

  return (
    <Animated.View style={enter}>
      <Pressable onPress={onPress} accessibilityRole="button">
        <View style={[styles.row, { backgroundColor: theme.surf, borderColor: theme.hair }]}>
          <LinearGradient
            colors={venue.grad}
            locations={[0, 0.55, 1]}
            start={GRAD_START}
            end={GRAD_END}
            style={styles.rowThumb}
          />
          <View style={styles.rowBody}>
            <Raw numberOfLines={1} style={[styles.rowName, { color: theme.ink }]}>
              {venue.name}
            </Raw>
            {/* każdy element to osobny span z odstępem 6 px — także kropki */}
            <View style={styles.rowMeta}>
              <Raw style={[styles.rowRating, { color: theme.ink }]}>{venue.rating.toFixed(1)}</Raw>
              <Raw style={[styles.rowStar, { color: accentText }]}>★</Raw>
              <Raw style={[styles.rowMetaText, { color: theme.sub }]}>{`(${venue.votes})`}</Raw>
              <Raw style={[styles.rowMetaText, { color: theme.sub }]}>·</Raw>
              <Raw style={[styles.rowMetaText, { color: theme.sub }]}>
                {catLabel(lang, venue.catLabel)}
              </Raw>
              <Raw style={[styles.rowMetaText, { color: theme.sub }]}>·</Raw>
              <Raw style={[styles.rowMetaText, { color: theme.sub }]}>{venue.price}</Raw>
            </View>
            <View style={styles.rowStatus}>
              <Raw style={[styles.rowStatusLabel, { color: venue.isOpen ? accentText : theme.sub }]}>
                {status}
              </Raw>
              <Raw style={[styles.rowMetaText, { color: theme.sub }]}>
                {`${venue.dist} · ${venue.district}`}
              </Raw>
            </View>
          </View>
          <Pressable
            onPress={onSave}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityState={{ selected: saved }}
            style={styles.rowSave}
          >
            <IconBookmark size={16} color={accentText} width={1.7} fill={saved ? accent.hex : 'none'} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/* ───────────────────────────────────────────────────────────── wydarzenie ── */

export function EventRow({
  event,
  index,
  saved,
  onPress,
  onSave,
}: {
  event: CityEvent;
  index: number;
  saved: boolean;
  onPress: () => void;
  onSave: () => void;
}) {
  const { theme, accent, accentText, accentSoft } = useTheme();
  const { lang } = useI18n();
  const c = discoverCopy[lang];
  const enter = useEnter('rise', duration.list, index * STEP_EVENT);

  const soon = event.d <= 1;
  const free = event.price === 0;
  const title = lang === 'pl' ? event.pl : lang === 'it' ? event.it : event.en;

  return (
    <Animated.View style={enter}>
      <Pressable onPress={onPress} accessibilityRole="button">
        <View style={[styles.event, { backgroundColor: theme.surf, borderColor: theme.hair }]}>
          <View style={[styles.eventDate, { backgroundColor: soon ? accent.hex : accentSoft }]}>
            <Raw style={[styles.eventMon, { color: soon ? ON_ACCENT : accentText }]}>
              {eventMonth(lang)}
            </Raw>
            <Raw style={[styles.eventDay, { color: soon ? ON_ACCENT : accentText }]}>{event.day}</Raw>
            <Raw style={[styles.eventDow, { color: soon ? ON_ACCENT : accentText }]}>
              {eventDow(lang, event.dow)}
            </Raw>
          </View>
          <View style={styles.rowBody}>
            <View style={styles.eventTagRow}>
              <View
                style={[
                  styles.eventTag,
                  {
                    backgroundColor: free
                      ? accentSoft
                      : theme.dark
                        ? 'rgba(255,255,255,0.07)'
                        : 'rgba(22,24,28,0.06)',
                  },
                ]}
              >
                <Raw style={[styles.eventTagText, { color: free ? accentText : theme.sub }]}>
                  {eventTag(lang, event.d)}
                </Raw>
              </View>
              <Raw style={[styles.eventTime, { color: theme.sub }]}>{event.time}</Raw>
            </View>
            <Raw style={[styles.eventTitle, { color: theme.ink }]}>{title}</Raw>
            <View style={styles.eventMeta}>
              <Raw style={[styles.rowMetaText, { color: theme.sub }]}>{event.place}</Raw>
              <Raw style={[styles.rowMetaText, { color: theme.sub }]}>·</Raw>
              <Raw style={[styles.rowMetaText, { color: theme.sub }]}>{event.dist}</Raw>
              <Raw style={[styles.rowMetaText, { color: theme.sub }]}>·</Raw>
              <Raw style={[styles.eventPrice, { color: accentText }]}>
                {free ? c.evFree : `${event.price} zł`}
              </Raw>
            </View>
          </View>
          <Pressable
            onPress={onSave}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityState={{ selected: saved }}
            style={({ pressed }) => [
              styles.eventSave,
              { backgroundColor: saved ? accentSoft : 'transparent' },
              press(0.88)({ pressed }),
            ]}
          >
            <IconBookmark
              size={14}
              event
              width={1.9}
              color={saved ? accent.hex : theme.sub}
              fill={saved ? accent.hex : 'none'}
            />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  /* ── dziś w mieście ── */
  today: { width: 208, borderRadius: radius.card16, borderWidth: 1, overflow: 'hidden' },
  todayImage: { height: 108 },
  todayTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.badge,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  todayTagText: {
    fontFamily: fonts.sansSemi,
    fontSize: size.s9,
    letterSpacing: em(size.s9, 0.1),
    color: '#16181C',
  },
  todayWhen: {
    position: 'absolute',
    bottom: 9,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.badge,
    backgroundColor: 'rgba(22,24,28,0.72)',
  },
  todayWhenText: { fontFamily: fonts.sans, fontSize: size.s10, color: '#F4F2ED' },
  todayBody: { paddingTop: 12, paddingHorizontal: 13, paddingBottom: 14 },
  todayTitle: {
    fontFamily: fonts.sans,
    fontSize: size.s14,
    letterSpacing: em(size.s14, -0.015),
    lineHeight: size.s14 * 1.25,
  },
  todayPlace: { fontFamily: fonts.sans, fontSize: size.s115, marginTop: 5 },

  /* ── lokal ── */
  row: {
    flexDirection: 'row',
    gap: 12,
    padding: 11,
    borderRadius: radius.card16,
    borderWidth: 1,
  },
  rowThumb: { width: 66, height: 66, borderRadius: radius.lg },
  rowBody: { flex: 1, minWidth: 0 },
  rowName: {
    fontFamily: fonts.sans,
    fontSize: size.s155,
    letterSpacing: em(size.s155, -0.02),
  },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  rowRating: { fontFamily: fonts.sansSemi, fontSize: size.s115 },
  rowStar: { fontFamily: fonts.sans, fontSize: size.s115 },
  rowMetaText: { fontFamily: fonts.sans, fontSize: size.s115 },
  rowStatus: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  rowStatusLabel: { fontFamily: fonts.sans, fontSize: size.s115 },
  rowSave: {
    width: 32,
    height: 32,
    borderRadius: radius.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── wydarzenie ── */
  event: {
    flexDirection: 'row',
    gap: 12,
    padding: 11,
    borderRadius: radius.row18,
    borderWidth: 1,
  },
  eventDate: {
    width: 52,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
  },
  eventMon: {
    fontFamily: fonts.sans,
    fontSize: size.s85,
    letterSpacing: em(size.s85, 0.11),
    textTransform: 'uppercase',
    opacity: 0.75,
  },
  eventDay: {
    fontFamily: fonts.sansBold,
    fontSize: size.s20,
    letterSpacing: em(size.s20, -0.035),
    lineHeight: size.s20 * 1.15,
  },
  eventDow: { fontFamily: fonts.sans, fontSize: size.s9, opacity: 0.75 },
  eventTagRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  eventTag: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.badge },
  eventTagText: {
    fontFamily: fonts.sansBold,
    fontSize: size.s85,
    letterSpacing: em(size.s85, 0.08),
  },
  eventTime: { fontFamily: fonts.sans, fontSize: size.s11 },
  eventTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: size.s145,
    letterSpacing: em(size.s145, -0.02),
    marginTop: 6,
    lineHeight: size.s145 * 1.25,
  },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  eventPrice: { fontFamily: fonts.sansSemi, fontSize: size.s115 },
  eventSave: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
