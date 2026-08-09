import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { cue } from '../ui/feedback';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n, useT } from '../i18n/I18nProvider';
import { em, fonts, radius, size, space } from '../theme/tokens';
import { Text } from '../ui/Text';
import type { Venue } from '../data/venues';

/**
 * Wizytówka lokalu — odwzorowanie Bywalec.dc.html, linie 838–1000.
 *
 * Zdjęcie 240 px (w prototypie gradient-placeholder) z przyciemnieniem od 55%,
 * karta z nazwą wysunięta o −34 px, potem nagroda, menu, godziny, opinie.
 */

export function VenueDetail({ venue, onBack }: { venue: Venue; onBack: () => void }) {
  const { theme, accentText, accentSoft } = useTheme();
  const { lang } = useI18n();
  const t = useT();
  const [saved, setSaved] = useState(false);

  const PL = lang === 'pl';

  return (
    <View style={[styles.root, { backgroundColor: theme.paper }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── nagłówek ze zdjęciem, linie 840–858 ── */}
        <View style={styles.hero}>
          <LinearGradient
            colors={venue.grad}
            locations={[0, 0.55, 1]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['transparent', 'rgba(22,24,28,0.45)']}
            locations={[0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroBar}>
            <Pressable onPress={onBack} style={styles.circleBtn} accessibilityRole="button">
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#16181C" strokeWidth={2}>
                <Path d="M14 6l-6 6 6 6" />
              </Svg>
            </Pressable>
            <Pressable
              onPress={() => {
                cue('save');
                setSaved((s) => !s);
              }}
              style={styles.circleBtn}
              accessibilityRole="button"
            >
              <Svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill={saved ? '#16181C' : 'none'}
                stroke="#16181C"
                strokeWidth={1.7}
              >
                <Path d="M6 4h12v16l-6-4.5L6 20z" />
              </Svg>
            </Pressable>
          </View>
        </View>

        {/* ── karta z nazwą, linie 860–870 ── */}
        <View style={styles.pad}>
          <View style={[styles.nameCard, { backgroundColor: theme.surf, borderColor: theme.hair }]}>
            <Text style={[styles.kicker, { color: theme.sub }]}>
              {venue.catLabel} · {venue.district}
            </Text>
            <Text style={[styles.name, { color: theme.ink }]}>{venue.name}</Text>
            <View style={styles.metaRow}>
              <Text style={[styles.rating, { color: theme.ink }]}>{venue.rating.toFixed(1)}</Text>
              <Text style={{ color: accentText }}>★★★★★</Text>
              <Text variant="body" color={theme.sub}>
                {venue.votes} {PL ? 'opinii' : 'reviews'} · {venue.price}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: venue.isOpen ? accentText : theme.sub },
                ]}
              />
              <Text variant="caption" color={theme.sub}>
                {venue.isOpen
                  ? `${PL ? 'Otwarte do' : 'Open until'} ${venue.closes}`
                  : PL
                    ? 'Zamknięte'
                    : 'Closed'}{' '}
                · {venue.dist}
              </Text>
            </View>
          </View>

          {/* ── nagroda za skan ── */}
          <View style={[styles.reward, { backgroundColor: accentSoft, borderColor: theme.hair }]}>
            <View style={[styles.rewardIcon, { backgroundColor: accentText }]}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={theme.paper} strokeWidth={2.2}>
                <Path d="M12 3.4l1.9 5 5.1 1.9-5.1 1.9-1.9 5-1.9-5L5 10.3l5.1-1.9z" strokeLinejoin="round" />
              </Svg>
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={[styles.rewardLabel, { color: accentText }]}>
                {PL ? 'Nagroda za skan' : 'Scan reward'}
              </Text>
              <Text variant="body" color={theme.ink}>
                {venue.reward}
              </Text>
            </View>
          </View>

          {/* ── menu ── */}
          <Section title={PL ? 'Menu' : 'Menu'}>
            {venue.menu.map(([title, desc, price]) => (
              <View
                key={title}
                style={[styles.listRow, { backgroundColor: theme.surf, borderColor: theme.hair }]}
              >
                <View style={{ flex: 1, gap: 3 }}>
                  <Text variant="title" color={theme.ink}>
                    {title}
                  </Text>
                  <Text variant="caption" color={theme.sub}>
                    {desc}
                  </Text>
                </View>
                <Text style={[styles.price, { color: accentText }]}>{price}</Text>
              </View>
            ))}
          </Section>

          {/* ── godziny ── */}
          <Section title={t('hours')}>
            <View style={[styles.hoursCard, { backgroundColor: theme.surf, borderColor: theme.hair }]}>
              {venue.hours.map(([day, range], i) => (
                <View
                  key={day}
                  style={[
                    styles.hourRow,
                    i > 0 && { borderTopWidth: 1, borderTopColor: theme.hair },
                  ]}
                >
                  <Text variant="body" color={theme.sub}>
                    {day}
                  </Text>
                  <Text variant="bodySemi" color={theme.ink}>
                    {range}
                  </Text>
                </View>
              ))}
            </View>
          </Section>

          {/* ── opinie ── */}
          <Section title={PL ? 'Opinie' : 'Reviews'}>
            {venue.opinions.map(([who, stars, body]) => (
              <View
                key={who}
                style={[styles.listRow, styles.opinion, { backgroundColor: theme.surf, borderColor: theme.hair }]}
              >
                <View style={styles.opinionHead}>
                  <Text variant="title" color={theme.ink}>
                    {who}
                  </Text>
                  <Text style={{ color: accentText }}>{'★'.repeat(stars)}</Text>
                </View>
                <Text variant="body" color={theme.sub}>
                  {body}
                </Text>
              </View>
            ))}
          </Section>

          {/* ── kontakt ── */}
          <Section title={t('address')}>
            <View style={[styles.hoursCard, { backgroundColor: theme.surf, borderColor: theme.hair }]}>
              <View style={styles.hourRow}>
                <Text variant="body" color={theme.sub}>
                  {t('address')}
                </Text>
                <Text variant="bodySemi" color={theme.ink} style={styles.contactValue}>
                  {venue.address}
                </Text>
              </View>
              <View style={[styles.hourRow, { borderTopWidth: 1, borderTopColor: theme.hair }]}>
                <Text variant="body" color={theme.sub}>
                  {t('phone')}
                </Text>
                <Text variant="bodySemi" color={theme.ink}>
                  {venue.phone}
                </Text>
              </View>
            </View>
          </Section>
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.ink }]}>{title}</Text>
      <View style={{ gap: 9 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject },
  scroll: { paddingBottom: 124 },
  hero: { height: 240 },
  heroBar: {
    position: 'absolute',
    top: 54,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16181C',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  pad: { paddingHorizontal: space.card },
  nameCard: {
    marginTop: -34,
    padding: 16,
    paddingHorizontal: 17,
    borderRadius: radius.row18,
    borderWidth: 1,
    shadowColor: '#16181C',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  kicker: {
    fontFamily: fonts.sansSemi,
    fontSize: size.s105,
    letterSpacing: em(size.s105, 0.14),
    textTransform: 'uppercase',
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 34,
    letterSpacing: em(34, -0.03),
    lineHeight: 34 * 1.04,
    marginTop: 6,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 9 },
  rating: { fontFamily: fonts.sansBold, fontSize: size.s125 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 7 },
  dot: { width: 6, height: 6, borderRadius: radius.pill },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.row18,
    borderWidth: 1,
    marginTop: space.afterHeading,
  },
  rewardIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: size.s10,
    letterSpacing: em(size.s10, 0.14),
    textTransform: 'uppercase',
  },
  section: { marginTop: space.section },
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: size.s24,
    letterSpacing: em(size.s24, -0.03),
    marginBottom: space.afterHeading,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.row18,
    borderWidth: 1,
  },
  price: { fontFamily: fonts.archivo, fontSize: size.s135 },
  hoursCard: { borderRadius: radius.row18, borderWidth: 1, overflow: 'hidden' },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  contactValue: { flex: 1, textAlign: 'right' },
  opinion: { flexDirection: 'column', alignItems: 'stretch', gap: 6 },
  opinionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
