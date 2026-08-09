import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/I18nProvider';
import { duration, ease, em, fonts, radius, size, space } from '../theme/tokens';
import { Text } from '../ui/Text';
import { FoundationPanel } from './FoundationPanel';
import { venues } from '../data/venues';

/**
 * Profil gościa — odwzorowanie Bywalec.dc.html, linie 1560–1700.
 *
 * Awatar z pierścieniem postępu do następnego poziomu, pod nim cztery
 * zakładki z jeżdżącą pigułką (Konto · Zapisane · Nagrody · Ustawienia,
 * linie 5681–5684).
 *
 * Obwód pierścienia w prototypie to 238,8 (r = 38) — stąd `ringDash`.
 */

const RING_R = 38;
const RING_C = 238.8;
const AVATAR = 96;

const TABS = [
  { id: 'konto', pl: 'Konto', en: 'Account', it: 'Account' },
  { id: 'saved', pl: 'Zapisane', en: 'Saved', it: 'Salvati' },
  { id: 'plan', pl: 'Nagrody', en: 'Rewards', it: 'Premi' },
  { id: 'set', pl: 'Ustawienia', en: 'Settings', it: 'Impostazioni' },
] as const;

type ProfTab = (typeof TABS)[number]['id'];

/** Stan demonstracyjny z prototypu: poziom 3, 240 z 400 punktów. */
const LVL = 3;
const LVL_PTS = 240;
const LVL_SIZE = 400;

export function Profile({ onOpenStand }: { onOpenStand?: () => void } = {}) {
  const { theme, accentText, accentSoft } = useTheme();
  const { lang, l3 } = useI18n();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<ProfTab>('konto');

  const PL = lang === 'pl';
  const pct = LVL_PTS / LVL_SIZE;

  // Pierścień rysuje się przy wejściu.
  const ring = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(ring, {
      toValue: 1,
      duration: 900,
      easing: Easing.bezier(...ease.standard),
      useNativeDriver: false,
    }).start();
  }, [ring]);

  // Jeżdżąca pigułka pod zakładkami.
  const inner = width - space.screen * 2 - 8;
  const cell = inner / TABS.length;
  const index = TABS.findIndex((x) => x.id === tab);
  const pillX = useRef(new Animated.Value(index * cell)).current;

  useEffect(() => {
    Animated.timing(pillX, {
      toValue: index * cell,
      duration: duration.pillLeft,
      easing: Easing.bezier(...ease.standard),
      useNativeDriver: true,
    }).start();
  }, [index, cell, pillX]);

  return (
    <ScrollView
      style={{ backgroundColor: theme.paper }}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* ── awatar z pierścieniem ── */}
      <View style={styles.hero}>
        <View style={styles.avatarWrap}>
          <Svg width={AVATAR} height={AVATAR} style={StyleSheet.absoluteFill}>
            <Circle
              cx={AVATAR / 2}
              cy={AVATAR / 2}
              r={RING_R}
              stroke={theme.hair}
              strokeWidth={4}
              fill="none"
            />
            <AnimatedCircle
              cx={AVATAR / 2}
              cy={AVATAR / 2}
              r={RING_R}
              stroke={accentText}
              strokeWidth={4}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${RING_C} ${RING_C}`}
              strokeDashoffset={ring.interpolate({
                inputRange: [0, 1],
                outputRange: [RING_C, RING_C * (1 - pct)],
              })}
              // start od godziny 12
              rotation={-90}
              originX={AVATAR / 2}
              originY={AVATAR / 2}
            />
          </Svg>
          <View style={[styles.avatar, { backgroundColor: accentSoft }]}>
            <Text style={[styles.lvl, { color: accentText }]}>{LVL}</Text>
            <Text style={[styles.lvlKicker, { color: theme.sub }]}>
              {PL ? 'poziom' : 'level'}
            </Text>
          </View>
        </View>

        <Text variant="serifLg" color={theme.ink} style={styles.name}>
          {PL ? 'Dobry wieczór' : 'Good evening'}
        </Text>
        <Text variant="caption" color={theme.sub} style={styles.next}>
          {PL
            ? `Jeszcze ${LVL_SIZE - LVL_PTS} pkt do poziomu ${LVL + 1}.`
            : `${LVL_SIZE - LVL_PTS} pts to level ${LVL + 1}.`}
        </Text>
      </View>

      {/* ── zakładki ── */}
      <View style={[styles.tabs, { backgroundColor: theme.surf, borderColor: theme.hair }]}>
        <Animated.View
          style={[
            styles.tabPill,
            { width: cell, backgroundColor: theme.ink, transform: [{ translateX: pillX }] },
          ]}
        />
        {TABS.map((x) => {
          const on = x.id === tab;
          return (
            <Pressable
              key={x.id}
              onPress={() => {
                void Haptics.selectionAsync().catch(() => {});
                setTab(x.id);
              }}
              style={styles.tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
            >
              <Text style={[styles.tabLabel, { color: on ? theme.paper : theme.sub }]}>
                {l3(x.pl, x.en, x.it)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── treść zakładki ── */}
      <View style={styles.body}>
        {tab === 'konto' && <AccountTab onOpenStand={onOpenStand} />}
        {tab === 'saved' && <SavedTab />}
        {tab === 'plan' && <RewardsTab />}
        {tab === 'set' && <FoundationPanel />}
      </View>
    </ScrollView>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/* ─────────────────────────────────────────────────────────────── zakładki ── */

function AccountTab({ onOpenStand }: { onOpenStand?: () => void }) {
  const { theme, accent, accentText } = useTheme();
  const { lang, l3 } = useI18n();
  const PL = lang === 'pl';

  // linie 6056–6060 — sposoby zdobywania punktów
  const ways = [
    { v: '+20', k: PL ? 'za zapisane miejsce' : 'per saved place' },
    { v: '+60', k: PL ? 'za skan naklejki' : 'per sticker scan' },
    { v: '+40', k: PL ? 'za opinię' : 'per review' },
  ];

  return (
    <View style={{ gap: 9 }}>
      <Text variant="label" color={theme.sub} style={styles.sectionLabel}>
        {PL ? 'Jak zdobywasz punkty' : 'How you earn points'}
      </Text>
      {ways.map((w) => (
        <View
          key={w.v}
          style={[styles.card, { backgroundColor: theme.surf, borderColor: theme.hair }]}
        >
          <Text style={[styles.wayValue, { color: accentText }]}>{w.v}</Text>
          <Text variant="body" color={theme.ink} style={{ flex: 1 }}>
            {w.k}
          </Text>
        </View>
      ))}

      {/* Panel firmy mieszka w Profilu — tak mówi samouczek w prototypie.
          Na razie jest tu jedno wejście: konfigurator stojaka. */}
      {onOpenStand && (
        <>
          <Text variant="label" color={theme.sub} style={styles.sectionLabel}>
            {l3('Dla lokalu', 'For venues', 'Per i locali')}
          </Text>
          <Pressable
            onPress={onOpenStand}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: theme.surf, borderColor: accent.hex, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text variant="title" color={theme.ink}>
                TAPI Smart Stand
              </Text>
              <Text variant="caption" color={theme.sub}>
                {l3(
                  'Stojak na ladę — obejrzyj model i ustaw naklejkę',
                  'Counter stand — see the model and set the sticker',
                  'Espositore da banco — guarda il modello e imposta l’adesivo',
                )}
              </Text>
            </View>
            <Text style={[styles.wayValue, { color: accentText }]}>3D</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

function SavedTab() {
  const { theme } = useTheme();
  const { lang } = useI18n();
  return (
    <View style={{ gap: 9 }}>
      <Text variant="label" color={theme.sub} style={styles.sectionLabel}>
        {lang === 'pl' ? 'Zapisane miejsca' : 'Saved places'}
      </Text>
      {venues.slice(0, 2).map((v) => (
        <View
          key={v.id}
          style={[styles.card, { backgroundColor: theme.surf, borderColor: theme.hair }]}
        >
          <View style={{ flex: 1, gap: 3 }}>
            <Text variant="title" color={theme.ink}>
              {v.name}
            </Text>
            <Text variant="caption" color={theme.sub}>
              {v.catLabel} · {v.dist}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function RewardsTab() {
  const { theme, accentText } = useTheme();
  const { lang } = useI18n();
  return (
    <View style={{ gap: 9 }}>
      <Text variant="label" color={theme.sub} style={styles.sectionLabel}>
        {lang === 'pl' ? 'Nagrody' : 'Rewards'}
      </Text>
      {venues.map((v) => (
        <View
          key={v.id}
          style={[styles.card, { backgroundColor: theme.surf, borderColor: theme.hair }]}
        >
          <View style={{ flex: 1, gap: 3 }}>
            <Text variant="title" color={theme.ink}>
              {v.name}
            </Text>
            <Text variant="caption" color={theme.sub} numberOfLines={2}>
              {v.reward}
            </Text>
          </View>
          <Text style={[styles.code, { color: accentText }]}>{v.code}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 54, paddingBottom: 128 },
  hero: { alignItems: 'center', paddingTop: 14, paddingHorizontal: space.screen },
  avatarWrap: { width: AVATAR, height: AVATAR, alignItems: 'center', justifyContent: 'center' },
  avatar: {
    width: AVATAR - 20,
    height: AVATAR - 20,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lvl: { fontFamily: fonts.archivoBold, fontSize: size.s30, letterSpacing: em(size.s30, -0.035) },
  lvlKicker: {
    fontFamily: fonts.sansSemi,
    fontSize: size.s9,
    letterSpacing: em(size.s9, 0.16),
    textTransform: 'uppercase',
    marginTop: -2,
  },
  name: { marginTop: 14 },
  next: { marginTop: 6, textAlign: 'center' },
  tabs: {
    flexDirection: 'row',
    marginTop: space.section,
    marginHorizontal: space.screen,
    padding: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  tabPill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: radius.pill,
  },
  tab: { flex: 1, height: 38, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontFamily: fonts.sansSemi, fontSize: size.s12 },
  body: { marginTop: space.section, paddingHorizontal: space.screen },
  sectionLabel: { textTransform: 'uppercase', marginBottom: 3 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.row18,
    borderWidth: 1,
  },
  wayValue: { fontFamily: fonts.archivoBold, fontSize: size.s19 },
  code: { fontFamily: fonts.archivo, fontSize: size.s12 },
});
