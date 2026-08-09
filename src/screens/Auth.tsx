import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { cue } from '../ui/feedback';
import Svg, { Path, Rect } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { useT } from '../i18n/I18nProvider';
import { duration, ease, em, fonts, size } from '../theme/tokens';
import { Text } from '../ui/Text';
import { AUTH_DELAYS, Wordmark } from '../ui/Wordmark';

/**
 * Logowanie — odwzorowanie Bywalec.dc.html, linie 179–231.
 *
 * Układ: padding 96/26/54, znak i hasło wyśrodkowane w górnej części,
 * przyciski przyklejone do dołu. Wejście: authIn 0.8 s.
 */

/* ────────────────────────────────────────────────────────────────── ikony ── */

/** linia 207 — logo Google w oryginalnych kolorach */
function GoogleIcon() {
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z"
      />
      <Path
        fill="#34A853"
        d="M12 22c2.7 0 4.9-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a5.9 5.9 0 01-5.6-4.1H3.1v2.6A10 10 0 0012 22z"
      />
      <Path fill="#FBBC05" d="M6.4 14a6 6 0 010-3.8V7.6H3.1a10 10 0 000 8.8L6.4 14z" />
      <Path
        fill="#EA4335"
        d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 003.1 7.6l3.3 2.6A5.9 5.9 0 0112 6.1z"
      />
    </Svg>
  );
}

/** linia 212 */
function MailIcon({ color }: { color: string }) {
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7}>
      <Rect x={3} y={5} width={18} height={14} rx={2.5} />
      <Path d="M3.6 6.5l8.4 6 8.4-6" />
    </Svg>
  );
}

/** linie 209 / 214 */
function Chevron({ color }: { color: string }) {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Path d="M9 5l7 7-7 7" />
    </Svg>
  );
}

/* ────────────────────────────────────────────────────────────── pomocnicze ── */

/** @keyframes rise — opacity 0 → 1, translateY 14 → 0 */
function useRise(delayMs: number, durationMs = 600) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: durationMs,
      delay: delayMs,
      easing: Easing.bezier(...ease.standard),
      useNativeDriver: true,
    }).start();
  }, [v, delayMs, durationMs]);
  return {
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
  };
}

/* ─────────────────────────────────────────────────────────────────── ekran ── */

export function Auth({
  onGoogle,
  onEmail,
  onSkip,
  onBusiness,
}: {
  onGoogle: () => void;
  onEmail: () => void;
  onSkip: () => void;
  onBusiness: () => void;
}) {
  const { theme, accentText } = useTheme();
  const t = useT();

  // @keyframes authIn — scale 0.982 + translateY 10
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 800,
      easing: Easing.bezier(...ease.standard),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  // @keyframes pop — logo (linia 182)
  const logoPop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(logoPop, {
      toValue: 1,
      duration: 600,
      easing: Easing.bezier(...ease.standard),
      useNativeDriver: true,
    }).start();
  }, [logoPop]);

  // lockup: fadeIn 0.7 s ease 0.5 s (linia 201)
  const lockup = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(lockup, {
      toValue: 1,
      duration: 700,
      delay: 500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start();
  }, [lockup]);

  const tagline = useRise(160, 600);
  const actions = useRise(240, 650);

  return (
    <Animated.View
      style={[
        styles.root,
        {
          backgroundColor: theme.paper,
          opacity: enter,
          transform: [
            { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.982, 1] }) },
            { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
          ],
        },
      ]}
    >
      {/* ── góra: znak, lockup, hasło (linie 181–203) ── */}
      <View style={styles.hero}>
        <Animated.View
          style={{
            opacity: logoPop,
            transform: [
              { scale: logoPop.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
            ],
          }}
        >
          <Wordmark
            width={182}
            height={83}
            stroke={theme.ink}
            pin={accentText}
            dot={theme.paper}
            delays={AUTH_DELAYS}
          />
        </Animated.View>

        <Animated.View style={{ opacity: lockup, marginTop: 13 }}>
          <Text style={[styles.lockup, { color: accentText }]}>tap · take · go</Text>
        </Animated.View>

        <Animated.View style={[tagline, styles.taglineWrap]}>
          <Text style={[styles.tagline, { color: theme.ink }]}>{t('tagline')}</Text>
        </Animated.View>
      </View>

      {/* ── dół: przyciski (linie 205–229) ── */}
      <Animated.View style={[actions, styles.actions]}>
        <Row
          icon={<GoogleIcon />}
          label={t('google')}
          onPress={onGoogle}
          surface={theme.surf}
          hair={theme.hair}
          ink={theme.ink}
          sub={theme.sub}
        />
        <Row
          icon={<MailIcon color={theme.ink} />}
          label={t('email')}
          onPress={onEmail}
          surface={theme.surf}
          hair={theme.hair}
          ink={theme.ink}
          sub={theme.sub}
        />

        {/* separator — linie 217–221 */}
        <View style={styles.sep}>
          <View style={[styles.sepLine, { backgroundColor: theme.hair }]} />
          <Text style={[styles.sepLabel, { color: theme.sub }]}>{t('or')}</Text>
          <View style={[styles.sepLine, { backgroundColor: theme.hair }]} />
        </View>

        {/* pomiń — linia 223 */}
        <Pressable
          onPress={() => {
            cue('select');
            onSkip();
          }}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.skip,
            {
              borderColor: theme.hair,
              backgroundColor: pressed ? theme.hair : 'transparent',
            },
          ]}
        >
          <Text style={[styles.skipLabel, { color: theme.ink }]}>{t('skip')}</Text>
        </Pressable>

        {/* stopka — linie 225–228 */}
        <View style={[styles.footer, { borderTopColor: theme.hair }]}>
          <Text variant="body" color={theme.sub}>
            {t('bizQ')}
          </Text>
          <Pressable onPress={onBusiness} accessibilityRole="link" hitSlop={8}>
            <Text
              style={[styles.bizLink, { color: accentText, borderBottomColor: accentText }]}
            >
              {t('bizLink')}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

/* ───────────────────────────────────────────────────────── wiersz-przycisk ── */

function Row({
  icon,
  label,
  onPress,
  surface,
  hair,
  ink,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  surface: string;
  hair: string;
  ink: string;
  sub: string;
}) {
  const press = useRef(new Animated.Value(0)).current;

  const animate = (to: number) =>
    Animated.timing(press, {
      toValue: to,
      duration: duration.micro,
      easing: Easing.bezier(...ease.standard),
      useNativeDriver: true,
    }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animate(1)}
      onPressOut={() => animate(0)}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Animated.View
        style={[
          styles.row,
          {
            backgroundColor: surface,
            borderColor: hair,
            // style-hover: translateY(-2px) — na dotyku odwracamy na wciśnięcie
            transform: [
              { translateY: press.interpolate({ inputRange: [0, 1], outputRange: [0, 2] }) },
            ],
          },
        ]}
      >
        {icon}
        <Text style={[styles.rowLabel, { color: ink }]}>{label}</Text>
        <Chevron color={sub} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
    paddingTop: 96,
    paddingHorizontal: 26,
    paddingBottom: 54,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  lockup: {
    fontFamily: fonts.sansSemi,
    fontSize: size.s95,
    letterSpacing: em(size.s95, 0.34),
    textTransform: 'uppercase',
  },
  taglineWrap: { marginTop: 12, maxWidth: 262 },
  tagline: {
    fontFamily: fonts.serif,
    fontSize: size.s21,
    letterSpacing: em(size.s21, -0.02),
    lineHeight: size.s21 * 1.28,
    textAlign: 'center',
  },
  actions: { gap: 9 },
  row: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    // 0 10px 24px -20px rgba(22,24,28,0.9)
    shadowColor: '#16181C',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: size.s145,
  },
  sep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    marginBottom: 2,
  },
  sepLine: { flex: 1, height: 1 },
  sepLabel: {
    fontFamily: fonts.sans,
    fontSize: size.s10,
    letterSpacing: em(size.s10, 0.18),
  },
  skip: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipLabel: { fontFamily: fonts.sans, fontSize: size.s14 },
  footer: {
    marginTop: 14,
    paddingTop: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bizLink: {
    fontFamily: fonts.sansSemi,
    fontSize: size.s125,
    borderBottomWidth: 1,
    paddingBottom: 1,
  },
});
