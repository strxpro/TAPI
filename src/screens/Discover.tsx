import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n, useT } from '../i18n/I18nProvider';
import { duration, ease, em, fonts, ON_ACCENT, radius, size, space } from '../theme/tokens';
import { Raw } from '../ui/Text';
import { press, useDot, useGrowX } from '../ui/motion';
import { Toast, useToast } from '../ui/Toast';
import { cue } from '../ui/feedback';
import { interests } from '../data/interests';
import { cityEvents } from '../data/events';
import { EmptyState } from './discover/EmptyState';
import { InterestsCard } from './discover/InterestsCard';
import { EventRow, TodayCardView, VenueRow } from './discover/cards';
import {
  InterestsRow,
  InterestsSummary,
  PlannerBanner,
  Skeletons,
  SuggestionList,
} from './discover/parts';
import { IconClose, IconSearch } from './discover/icons';
import { discoverCopy, eventCount, resultLine } from './discover/copy';
import {
  filterEvents,
  pick,
  searchVenues,
  suggestFor,
  todayCards,
  whenOptions,
  type Suggestion,
  type WhenId,
} from './discover/model';

/**
 * Odkrywaj — na podstawie TAPI-standalone.html, sekcja „ODKRYWAJ".
 *
 * Kolejność bloków: powitanie, wyszukiwarka z podpowiedziami, baner planera
 * AI, wiersz zainteresowań, przyklejony nagłówek z liczbą wyników, karta
 * zainteresowań, „Dziś w mieście", „Blisko ciebie", „Nadchodzące wydarzenia".
 *
 * Dwie świadome różnice wobec prototypu, obie na prośbę właściciela:
 * planer zszedł pod wyszukiwarkę, a filtrowanie i sortowanie zniknęło —
 * razem z arkuszem, przyciskiem, wierszem wejściowym i pigułką w nagłówku.
 * Listę zawęża wyłącznie wyszukiwarka, więc u góry nie ma już dwóch
 * sterowań robiących to samo.
 *
 * Stan trzymamy lokalnie. `savedIds`, `following` i `interests` są
 * w prototypie stanem całej aplikacji — przeniosą się do wspólnego magazynu
 * razem z ekranem Zapisane (punkt 5) i Profilem (punkt 4).
 */

/** Prototyp: `onDiscScroll` przełącza nagłówek po przewinięciu 46 px. */
const SCROLL_TRIGGER = 46;
/** `go('discover')` pokazuje szkielety na 420 ms przy powrocie na zakładkę. */
const WARMUP_MS = 420;

export function Discover({
  onOpenVenue,
  onOpenPlanner,
  warmup = false,
}: {
  onOpenVenue: (id: string) => void;
  onOpenPlanner: () => void;
  /** true, gdy wchodzimy na zakładkę z paska — wtedy lecą szkielety */
  warmup?: boolean;
}) {
  const { theme, accentText, accentSoft } = useTheme();
  const { lang } = useI18n();
  const t = useT();
  const c = discoverCopy[lang];
  const { message, toast } = useToast();

  const [query, setQuery] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>(['brama']);
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string[]>([]);
  const [interestsSaved, setInterestsSaved] = useState(false);
  const [interestsOpen, setInterestsOpen] = useState(false);
  const [when, setWhen] = useState<WhenId>('all');
  const [scrolled, setScrolled] = useState(false);
  const [headSearch, setHeadSearch] = useState(false);
  const [loading, setLoading] = useState(warmup);

  useEffect(() => {
    if (!warmup) return;
    const id = setTimeout(() => setLoading(false), WARMUP_MS);
    return () => clearTimeout(id);
  }, [warmup]);

  const list = useMemo(() => searchVenues(query), [query]);
  const suggestions = useMemo(() => suggestFor(lang, query, c), [lang, query, c]);
  const cards = useMemo(() => todayCards(lang), [lang]);
  const events = useMemo(() => filterEvents(when), [when]);

  const chosenLabels = interests
    .filter((i) => chosen.includes(i.id))
    .map((i) => pick(lang, i.pl, i.en, i.it));

  const pickSuggestion = (s: Suggestion) => {
    cue('select');
    if (s.action.type === 'venue') {
      onOpenVenue(s.action.id);
      return;
    }
    // Kategoria i dzielnica nie ustawiają już filtra — wpisują się
    // w wyszukiwarkę, bo to jedyne, co zawęża listę.
    setQuery(s.action.text);
  };

  const toggleSaved = (id: string) => {
    cue('save');
    const has = savedIds.includes(id);
    setSavedIds(has ? savedIds.filter((x) => x !== id) : savedIds.concat(id));
    toast(has ? c.venueUnsaved : c.venueSaved);
  };

  const toggleSavedEvent = (id: string) => {
    cue('save');
    const has = savedEvents.includes(id);
    setSavedEvents(has ? savedEvents.filter((x) => x !== id) : savedEvents.concat(id));
    toast(has ? c.evUnsaved : c.evSaved);
  };

  const saveInterests = () => {
    if (!chosen.length) return;
    cue('success');
    setInterestsSaved(true);
    toast(c.intSaved);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const past = e.nativeEvent.contentOffset.y > SCROLL_TRIGGER;
    if (past !== scrolled) setScrolled(past);
    if (!past && headSearch) setHeadSearch(false);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={{ backgroundColor: theme.paper }}
        contentContainerStyle={styles.scroll}
        stickyHeaderIndices={[2]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* ── powitanie ── */}
        <View style={styles.top}>
          <View style={styles.greetBox}>
            <Raw style={[styles.kicker, { color: theme.sub }]}>{c.subGreeting}</Raw>
            <Raw style={[styles.greeting, { color: theme.ink }]}>{c.greeting}</Raw>
          </View>
        </View>

        {/* ── wyszukiwarka, planer, zainteresowania ── */}
        <View style={styles.searchBlock}>
          <View style={[styles.search, { backgroundColor: theme.surf, borderColor: theme.hair }]}>
            <IconSearch size={16} color={theme.sub} width={2} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('searchPh')}
              placeholderTextColor={theme.sub}
              style={[styles.input, { color: theme.ink }]}
              returnKeyType="search"
              allowFontScaling={false}
            />
            {query.length > 0 && (
              <Pressable
                onPress={() => setQuery('')}
                hitSlop={8}
                accessibilityRole="button"
                style={[styles.clear, { backgroundColor: accentSoft }]}
              >
                <IconClose size={10} color={accentText} width={3} />
              </Pressable>
            )}
          </View>

          {suggestions.length > 0 && (
            <SuggestionList items={suggestions} onPick={pickSuggestion} />
          )}

          {/* Planer siedzi tuż pod wyszukiwarką — to pierwsza rzecz,
              którą gość ma zobaczyć po wpisaniu albo niewpisaniu niczego. */}
          <PlannerBanner
            onPress={() => {
              cue('select');
              onOpenPlanner();
            }}
          />

          <InterestsRow
            outlined={!interestsSaved}
            sub={interestsSaved && chosenLabels.length ? chosenLabels.join(' · ') : c.intBtnSub}
            onPress={() => {
              cue('select');
              setInterestsSaved(false);
              setInterestsOpen(true);
            }}
          />
        </View>

        {/* ── przyklejony nagłówek ── */}
        <StickyHead
          scrolled={scrolled}
          open={headSearch}
          query={query}
          onQuery={setQuery}
          onOpen={() => {
            cue('select');
            setHeadSearch(true);
          }}
          // `closeHeadSearch` czyści też zapytanie — obie wyszukiwarki
          // pokazują to samo pole stanu.
          onClose={() => {
            setHeadSearch(false);
            setQuery('');
          }}
          result={resultLine(lang, list.length)}
          suggestions={headSearch ? suggestions : []}
          onPick={pickSuggestion}
        />

        {/* ── zainteresowania ── */}
        {!interestsSaved && interestsOpen && (
          <View style={styles.interestsBlock}>
            <InterestsCard
              chosen={chosen}
              onToggle={(id) =>
                setChosen(chosen.includes(id) ? chosen.filter((x) => x !== id) : chosen.concat(id))
              }
              onSave={saveInterests}
              onSkip={() => setInterestsOpen(false)}
            />
          </View>
        )}
        {interestsSaved && (
          <View style={styles.interestsBlock}>
            <InterestsSummary
              text={c.intActive + chosenLabels.join(', ')}
              onEdit={() => {
                setInterestsSaved(false);
                setInterestsOpen(true);
              }}
            />
          </View>
        )}

        {/* ── treść ── */}
        {loading ? (
          <Skeletons />
        ) : (
          <View style={{ minHeight: query.trim() ? 780 : 0 }}>
            <SectionHead title={t('today')} right={<LiveCount label={c.todayCount} />} first />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsRow}
            >
              {cards.map((card, i) => (
                <TodayCardView
                  key={card.venue}
                  card={card}
                  index={i}
                  onPress={() => onOpenVenue(card.venue)}
                />
              ))}
            </ScrollView>

            <SectionHead
              title={t('near')}
              right={<Raw style={[styles.headMeta, { color: theme.sub }]}>{c.nearRadius}</Raw>}
            />
            <View style={styles.rows}>
              {list.map((v, i) => (
                <VenueRow
                  key={v.id}
                  venue={v}
                  index={i}
                  saved={savedIds.includes(v.id)}
                  onPress={() => onOpenVenue(v.id)}
                  onSave={() => toggleSaved(v.id)}
                />
              ))}
              {list.length === 0 && <EmptyState onClear={() => setQuery('')} />}
            </View>

            <SectionHead
              title={c.evHead}
              right={
                <Raw style={[styles.headMetaTight, { color: theme.sub }]}>
                  {eventCount(lang, cityEvents.length)}
                </Raw>
              }
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.whenRow}
            >
              {whenOptions(lang).map((w) => {
                const on = when === w.id;
                return (
                  <Pressable
                    key={w.id}
                    onPress={() => {
                      cue('select');
                      setWhen(w.id);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    style={({ pressed }) => [
                      styles.whenPill,
                      {
                        backgroundColor: on ? theme.ink : theme.surf,
                        borderColor: on ? theme.ink : theme.hair,
                      },
                      press(0.94)({ pressed }),
                    ]}
                  >
                    <Raw style={[styles.whenLabel, { color: on ? theme.paper : theme.sub }]}>
                      {w.label}
                    </Raw>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.eventRows}>
              {events.map((e, i) => (
                <EventRow
                  key={e.id}
                  event={e}
                  index={i}
                  saved={savedEvents.includes(e.id)}
                  onPress={() => onOpenVenue(e.venue)}
                  onSave={() => toggleSavedEvent(e.id)}
                />
              ))}
              {events.length === 0 && (
                <View style={[styles.eventsEmpty, { borderColor: theme.hair }]}>
                  <Raw style={[styles.eventsEmptyText, { color: theme.sub }]}>
                    {c.evEmptyAll}
                  </Raw>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <Toast message={message} />
    </View>
  );
}

/* ────────────────────────────────────────────────────── przyklejony nagłówek ── */

function StickyHead({
  scrolled,
  open,
  query,
  onQuery,
  onOpen,
  onClose,
  result,
  suggestions,
  onPick,
}: {
  scrolled: boolean;
  open: boolean;
  query: string;
  onQuery: (v: string) => void;
  onOpen: () => void;
  onClose: () => void;
  result: string;
  suggestions: Suggestion[];
  onPick: (s: Suggestion) => void;
}) {
  const { theme } = useTheme();
  const t = useT();

  // Szerokość wiersza potrzebna, żeby pole rozwijało się od lewej krawędzi.
  const [rowWidth, setRowWidth] = useState(0);

  // width 0.45 s, opacity 0.32 s — dwa różne czasy, więc dwa sterowniki
  const wide = useRef(new Animated.Value(scrolled ? 1 : 0)).current;
  const fade = useRef(new Animated.Value(scrolled ? 1 : 0)).current;

  useEffect(() => {
    const to = scrolled ? 1 : 0;
    const anim = Animated.parallel([
      Animated.timing(wide, {
        toValue: to,
        duration: 450,
        easing: Easing.bezier(...ease.standard),
        useNativeDriver: false,
      }),
      Animated.timing(fade, {
        toValue: to,
        duration: 320,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [scrolled, wide, fade]);

  /** CSS: 0 14px 18px -18px {headShade} */
  const shade = theme.dark
    ? { shadowColor: '#000000', shadowOpacity: scrolled ? 0.6 : 0.28 }
    : { shadowColor: '#16181C', shadowOpacity: scrolled ? 0.2 : 0.06 };

  return (
    <View
      style={[
        styles.sticky,
        { backgroundColor: theme.paper, shadowRadius: 6, shadowOffset: { width: 0, height: 5 }, ...shade },
      ]}
    >
      <Animated.View
        onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
        style={[
          styles.stickyRow,
          { paddingRight: wide.interpolate({ inputRange: [0, 1], outputRange: [0, 64] }) },
        ]}
      >
        {open ? (
          <HeadSearchField width={rowWidth} query={query} onQuery={onQuery} onClose={onClose} />
        ) : (
          <>
            <Animated.View
              style={[
                styles.backWrap,
                {
                  width: wide.interpolate({ inputRange: [0, 1], outputRange: [0, 41] }),
                  opacity: fade,
                },
              ]}
            >
              <Pressable
                onPress={onOpen}
                accessibilityRole="button"
                accessibilityLabel={t('searchPh')}
                style={({ pressed }) => [
                  styles.backBtn,
                  { backgroundColor: theme.surf, borderColor: theme.hair },
                  press(0.9)({ pressed }),
                ]}
              >
                <IconSearch size={15} color={theme.ink} width={2} />
              </Pressable>
            </Animated.View>

            <Raw numberOfLines={1} style={[styles.result, { color: theme.sub }]}>
              {result}
            </Raw>
          </>
        )}
      </Animated.View>

      {suggestions.length > 0 && (
        <SuggestionList items={suggestions} onPick={onPick} variant="header" />
      )}
    </View>
  );
}

/**
 * Pole wyszukiwania w przyklejonym nagłówku. Osobny komponent, bo `growX`
 * ma zagrać przy każdym otwarciu — a to znaczy przy każdym zamontowaniu.
 */
function HeadSearchField({
  width,
  query,
  onQuery,
  onClose,
}: {
  width: number;
  query: string;
  onQuery: (v: string) => void;
  onClose: () => void;
}) {
  const { theme, accent, accentText, accentSoft } = useTheme();
  const t = useT();
  const grow = useGrowX(duration.growX, width);

  return (
    <Animated.View
      style={[
        styles.headField,
        SHADOW_FIELD,
        { backgroundColor: theme.surf, borderColor: accent.hex },
        grow,
      ]}
    >
      <IconSearch size={15} color={accentText} width={2.1} />
      <TextInput
        value={query}
        onChangeText={onQuery}
        placeholder={t('searchPh')}
        placeholderTextColor={theme.sub}
        style={[styles.headInput, { color: theme.ink }]}
        allowFontScaling={false}
        autoFocus
      />
      <Pressable
        onPress={onClose}
        hitSlop={8}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.headClose,
          { backgroundColor: accentSoft },
          press(0.88)({ pressed }),
        ]}
      >
        <IconClose size={10} color={accentText} width={3} />
      </Pressable>
    </Animated.View>
  );
}

/* ───────────────────────────────────────────────────────── nagłówki sekcji ── */

function SectionHead({
  title,
  right,
  first,
}: {
  title: string;
  right: React.ReactNode;
  /** pierwsza sekcja nie ma odstępu 28 px nad sobą */
  first?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <View style={[styles.sectionHead, first ? styles.sectionHeadFirst : null]}>
      <Raw style={[styles.sectionTitle, { color: theme.ink }]}>{title}</Raw>
      {right}
    </View>
  );
}

/** Kropka „na żywo" przy nagłówku „Dziś w mieście". */
function LiveCount({ label }: { label: string }) {
  const { theme, accent } = useTheme();
  const blink = useDot();
  return (
    <View style={styles.live}>
      <Animated.View style={[styles.liveDot, { backgroundColor: accent.hex }, blink]} />
      <Raw style={[styles.headMetaTight, { color: theme.sub }]}>{label}</Raw>
    </View>
  );
}

/* ─────────────────────────────────────────────────────────────────── style ── */

/** CSS: 0 12px 26px -20px rgba(22,24,28,0.9) */
const SHADOW_FIELD = {
  shadowColor: '#16181C',
  shadowOpacity: 0.18,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 5 },
  elevation: 3,
} as const;

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingTop: 54, paddingBottom: 128 },

  /* ── powitanie ── */
  top: { paddingTop: 14, paddingHorizontal: space.screen },
  greetBox: { paddingRight: 62 },
  kicker: {
    fontFamily: fonts.sans,
    fontSize: size.s105,
    letterSpacing: em(size.s105, 0.14),
    textTransform: 'uppercase',
  },
  greeting: {
    fontFamily: fonts.serif,
    fontSize: size.s34,
    letterSpacing: em(size.s34, -0.03),
    lineHeight: size.s34 * 1.05,
    marginTop: 8,
  },

  /* ── wyszukiwarka ── */
  searchBlock: { paddingTop: 12, paddingHorizontal: space.screen },
  search: {
    flex: 1,
    minWidth: 0,
    height: 48,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  input: { flex: 1, minWidth: 0, fontFamily: fonts.sans, fontSize: size.s14, padding: 0 },
  clear: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── przyklejony nagłówek ── */
  sticky: {
    zIndex: 30,
    marginTop: 16,
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: space.screen,
  },
  stickyRow: { flexDirection: 'row', alignItems: 'center' },
  headField: {
    flex: 1,
    minWidth: 0,
    height: 38,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 11,
  },
  headInput: { flex: 1, minWidth: 0, fontFamily: fonts.sans, fontSize: size.s135, padding: 0 },
  headClose: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backWrap: { overflow: 'hidden' },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  result: {
    flex: 1,
    minWidth: 0,
    fontFamily: fonts.sans,
    fontSize: size.s105,
    letterSpacing: em(size.s105, 0.1),
    textTransform: 'uppercase',
  },

  /* ── zainteresowania ── */
  interestsBlock: { paddingTop: 6, paddingHorizontal: space.screen },

  /* ── sekcje ── */
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: space.section,
    paddingHorizontal: space.screen,
    paddingBottom: space.afterHeading,
  },
  sectionHeadFirst: { marginTop: 0, paddingTop: 20 },
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: size.s22,
    letterSpacing: em(size.s22, -0.02),
  },
  headMeta: {
    fontFamily: fonts.sans,
    fontSize: size.s105,
    letterSpacing: em(size.s105, 0.1),
    textTransform: 'uppercase',
  },
  headMetaTight: {
    fontFamily: fonts.sans,
    fontSize: size.s10,
    letterSpacing: em(size.s10, 0.12),
    textTransform: 'uppercase',
  },
  live: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 5, height: 5, borderRadius: radius.pill },

  /* ── listy ── */
  cardsRow: { paddingHorizontal: space.screen, paddingBottom: 4, gap: 10 },
  rows: { paddingHorizontal: space.screen, gap: 9 },
  whenRow: { paddingHorizontal: space.screen, paddingBottom: 2, gap: 7 },
  whenPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  whenLabel: { fontFamily: fonts.sansSemi, fontSize: size.s12 },
  eventRows: { paddingTop: 13, paddingHorizontal: space.screen, gap: 9 },
  eventsEmpty: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: radius.row18,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  eventsEmptyText: {
    fontFamily: fonts.sans,
    fontSize: size.s125,
    lineHeight: size.s125 * 1.5,
    textAlign: 'center',
  },
});
