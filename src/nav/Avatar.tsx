import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n, useT } from '../i18n/I18nProvider';
import { LANG_LABEL, LANGS } from '../i18n/dict';
import { accents, duration, ease, em, fonts, ON_ACCENT, radius, size, space } from '../theme/tokens';
import { Raw } from '../ui/Text';
import { press } from '../ui/motion';
import { Sheet } from '../ui/Sheet';
import {
  cue,
  feedbackStatus,
  isHapticEnabled,
  isSoundEnabled,
  setHapticEnabled,
  setSoundEnabled,
  type Cue,
} from '../ui/feedback';
import type { ThemeMode } from '../theme/ThemeProvider';
import type { AccentName } from '../theme/tokens';

/**
 * Pływający awatar z szybkimi ustawieniami — prototyp, sekcja
 * „AWATAR I SZYBKIE USTAWIENIA".
 *
 * Gdzie siedzi i dlaczego tam: prawy górny róg, `insets.top + 12` od góry
 * (DECYZJE.md, bezpieczne obszary) i 20 px od krawędzi, czyli na siatce
 * ekranu. Ekrany zostawiają na niego miejsce same — Odkrywaj ma 62 px
 * odstępu przy powitaniu, a przyklejony nagłówek dokłada 64 px po zwinięciu.
 * Dzięki temu awatar nigdy nie leży na treści.
 *
 * Prototyp chowa go na skanerze i pod arkuszami — tu tak samo, przez `hidden`.
 */

const SIZE = 38;

export function Avatar({ hidden, name }: { hidden?: boolean; name?: string | null }) {
  const { theme, accent, accentText } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const fade = useRef(new Animated.Value(hidden ? 0 : 1)).current;

  useEffect(() => {
    const anim = Animated.timing(fade, {
      toValue: hidden ? 0 : 1,
      duration: duration.micro,
      easing: Easing.bezier(...ease.standard),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [hidden, fade]);

  const initials = (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <>
      <Animated.View
        pointerEvents={hidden ? 'none' : 'box-none'}
        style={[
          styles.dock,
          {
            top: insets.top + 12,
            opacity: fade,
            transform: [{ scale: fade.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
          },
        ]}
      >
        <Pressable
          onPress={() => {
            cue('select');
            setOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel={initials || 'TAPI'}
          style={({ pressed }) => [
            styles.button,
            SHADOW,
            { backgroundColor: theme.surf, borderColor: accent.hex },
            press(0.92)({ pressed }),
          ]}
        >
          {initials ? (
            <Raw style={[styles.initials, { color: accentText }]}>{initials}</Raw>
          ) : (
            <View style={[styles.dot, { backgroundColor: accent.hex }]} />
          )}
        </Pressable>
      </Animated.View>

      <QuickSettings open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/* ────────────────────────────────────────────────────── szybkie ustawienia ── */

function QuickSettings({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { theme, accent, mode, setMode, accentName, setAccent } = useTheme();
  const { lang, setLang, l3 } = useI18n();
  const t = useT();
  const [sound, setSound] = useState(isSoundEnabled);
  const [haptic, setHaptic] = useState(isHapticEnabled);


  const modes: { id: ThemeMode; label: string }[] = [
    { id: 'auto', label: l3('Jak w telefonie', 'Match phone', 'Come il telefono') },
    { id: 'papier', label: l3('Jasny', 'Light', 'Chiaro') },
    { id: 'noc', label: l3('Ciemny', 'Dark', 'Scuro') },
  ];

  return (
    <Sheet open={open} onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false}>
  
              <Raw style={[styles.title, { color: theme.ink }]}>{t('settings')}</Raw>
  
              {/* ── język ── */}
              <Raw style={[styles.head, { color: theme.sub }]}>{t('language')}</Raw>
              <View style={styles.row}>
                {LANGS.map((id) => (
                  <Choice
                    key={id}
                    label={LANG_LABEL[id]}
                    on={lang === id}
                    onPress={() => {
                      cue('select');
                      setLang(id);
                    }}
                  />
                ))}
              </View>
  
              {/* ── motyw ── */}
              <Raw style={[styles.head, { color: theme.sub }]}>{t('theme')}</Raw>
              <View style={styles.row}>
                {modes.map((m) => (
                  <Choice
                    key={m.id}
                    label={m.label}
                    on={mode === m.id}
                    onPress={() => {
                      cue('select');
                      setMode(m.id);
                    }}
                  />
                ))}
              </View>
  
              {/* ── akcent ── */}
              <Raw style={[styles.head, { color: theme.sub }]}>{t('accent')}</Raw>
              <View style={styles.row}>
                {(Object.keys(accents) as AccentName[]).map((id) => {
                  const on = accentName === id;
                  return (
                    <Pressable
                      key={id}
                      accessibilityRole="button"
                      accessibilityLabel={accents[id].label}
                      accessibilityState={{ selected: on }}
                      onPress={() => {
                        cue('select');
                        setAccent(id);
                      }}
                      style={({ pressed }) => [
                        styles.swatchWrap,
                        { borderColor: on ? accents[id].hex : theme.hair },
                        press(0.92)({ pressed }),
                      ]}
                    >
                      <View style={[styles.swatch, { backgroundColor: accents[id].hex }]} />
                    </Pressable>
                  );
                })}
              </View>
  
              {/* ── czucie ── */}
              <Raw style={[styles.head, { color: theme.sub }]}>
                {l3('Dźwięk i wibracje', 'Sound and vibration', 'Suono e vibrazione')}
              </Raw>
              <Toggle
                label={l3('Dźwięki interfejsu', 'Interface sounds', 'Suoni dell’interfaccia')}
                sub={l3(
                  'Ciche stuknięcia i ping po skanie',
                  'Quiet taps and a ping after a scan',
                  'Tocchi discreti e un ping dopo la scansione',
                )}
                on={sound}
                onPress={() => {
                  const next = !sound;
                  setSound(next);
                  setSoundEnabled(next);
                  if (next) cue('ping');
                }}
              />
              <Toggle
                label={l3('Wibracje', 'Vibration', 'Vibrazione')}
                sub={l3(
                  'Krótkie drgnięcie przy wyborze',
                  'A short buzz on selection',
                  'Un breve tocco alla selezione',
                )}
                on={haptic}
                onPress={() => {
                  const next = !haptic;
                  setHaptic(next);
                  setHapticEnabled(next);
                  if (next) cue('save');
                }}
              />
  
              {/* ── sprawdzenie czucia ── */}
              <Raw style={[styles.head, { color: theme.sub }]}>
                {l3('Sprawdź', 'Test it', 'Prova')}
              </Raw>
              <View style={styles.row}>
                {(
                  [
                    ['tab', l3('Stuknięcie', 'Tap', 'Tocco')],
                    ['save', l3('Zapis', 'Save', 'Salva')],
                    ['ping', l3('Ping', 'Ping', 'Ping')],
                    ['success', l3('Gotowe', 'Done', 'Fatto')],
                  ] as [Cue, string][]
                ).map(([kind, label]) => (
                  <Choice key={kind} label={label} on={false} onPress={() => cue(kind)} />
                ))}
              </View>
              <Diagnostics />
  
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.done,
                  { backgroundColor: accent.hex },
                  press(0.98)({ pressed }),
                ]}
              >
                <Raw style={styles.doneText}>{l3('Gotowe', 'Done', 'Fatto')}</Raw>
              </Pressable>
            </ScrollView>
    </Sheet>
  );
}

/**
 * Krótki odczyt stanu czucia.
 *
 * „Nie czuję nic" znaczy co innego na symulatorze, co innego przy wyłączonych
 * wibracjach dotykowych w systemie, a jeszcze co innego przy błędzie modułu.
 * Zamiast zgadywać z zewnątrz — aplikacja mówi to sama.
 */
function Diagnostics() {
  const { theme, accentText } = useTheme();
  const { l3 } = useI18n();
  const [status, setStatus] = useState(feedbackStatus);

  // Odświeżamy co sekundę, bo stan zmienia się dopiero po pierwszej próbie.
  useEffect(() => {
    const id = setInterval(() => setStatus(feedbackStatus()), 1000);
    return () => clearInterval(id);
  }, []);

  const mark = (v: boolean | null) => (v === null ? '—' : v ? '✓' : '✕');
  const tone = (v: boolean | null) => (v === null ? theme.sub : v ? accentText : '#B65C36');

  const rows: [string, boolean | null][] = [
    [l3('Wibracje odpowiadają', 'Haptics respond', 'Le vibrazioni rispondono'), status.hapticsWork],
    [l3('Dźwięk odpowiada', 'Sound responds', 'Il suono risponde'), status.audioWorks],
  ];

  return (
    <View style={[styles.diag, { borderColor: theme.hair }]}>
      {rows.map(([label, ok]) => (
        <View key={label} style={styles.diagRow}>
          <Raw style={[styles.diagLabel, { color: theme.sub }]}>{label}</Raw>
          <Raw style={[styles.diagMark, { color: tone(ok) }]}>{mark(ok)}</Raw>
        </View>
      ))}
      <Raw style={[styles.diagNote, { color: theme.sub }]}>
        {status.emulator
          ? l3(
              'To symulator — wibracji nie ma tu fizycznie. Sprawdź na telefonie.',
              'This is a simulator — there is no vibration hardware. Try a real phone.',
              'Questo è un simulatore — non c’è vibrazione. Prova su un telefono.',
            )
          : l3(
              `${status.platform} · wczytane dźwięki: ${status.soundsLoaded} z 3`,
              `${status.platform} · sounds loaded: ${status.soundsLoaded} of 3`,
              `${status.platform} · suoni caricati: ${status.soundsLoaded} su 3`,
            )}
      </Raw>
      {(status.hapticError || status.audioError) && (
        <Raw numberOfLines={3} style={[styles.diagNote, { color: '#B65C36' }]}>
          {status.hapticError ?? status.audioError}
        </Raw>
      )}
    </View>
  );
}

function Choice({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        { backgroundColor: on ? theme.ink : theme.surf, borderColor: on ? theme.ink : theme.hair },
        press(0.94)({ pressed }),
      ]}
    >
      <Raw style={[styles.choiceText, { color: on ? theme.paper : theme.sub }]}>{label}</Raw>
    </Pressable>
  );
}

function Toggle({
  label,
  sub,
  on,
  onPress,
}: {
  label: string;
  sub: string;
  on: boolean;
  onPress: () => void;
}) {
  const { theme, accentText } = useTheme();
  const knob = useRef(new Animated.Value(on ? 1 : 0)).current;

  useEffect(() => {
    const anim = Animated.timing(knob, {
      toValue: on ? 1 : 0,
      duration: 400,
      easing: Easing.bezier(...ease.standard),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [on, knob]);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      onPress={onPress}
      style={[styles.toggle, { backgroundColor: theme.surf, borderColor: theme.hair }]}
    >
      <View style={styles.toggleBody}>
        <Raw style={[styles.toggleLabel, { color: theme.ink }]}>{label}</Raw>
        <Raw style={[styles.toggleSub, { color: theme.sub }]}>{sub}</Raw>
      </View>
      <View style={[styles.track, { backgroundColor: on ? accentText : theme.hair }]}>
        <Animated.View
          style={[
            styles.knob,
            KNOB_SHADOW,
            { transform: [{ translateX: knob.interpolate({ inputRange: [0, 1], outputRange: [0, 18] }) }] },
          ]}
        />
      </View>
    </Pressable>
  );
}

/* ─────────────────────────────────────────────────────────────────── style ── */

/** CSS: 0 12px 26px -18px rgba(22,24,28,0.9) */
const SHADOW = {
  shadowColor: '#16181C',
  shadowOpacity: 0.2,
  shadowRadius: 9,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
} as const;

const KNOB_SHADOW = {
  shadowColor: '#16181C',
  shadowOpacity: 0.25,
  shadowRadius: 5,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;

const styles = StyleSheet.create({
  dock: { position: 'absolute', right: space.screen, zIndex: 200 },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontFamily: fonts.sansBold, fontSize: size.s125, letterSpacing: em(size.s125, 0.02) },
  dot: { width: 9, height: 9, borderRadius: radius.pill },

  title: { fontFamily: fonts.serif, fontSize: size.s27, letterSpacing: em(size.s27, -0.03) },
  head: {
    fontFamily: fonts.sansSemi,
    fontSize: size.s10,
    letterSpacing: em(size.s10, 0.14),
    textTransform: 'uppercase',
    marginTop: 18,
    marginBottom: 9,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  choice: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: radius.lg, borderWidth: 1 },
  choiceText: { fontFamily: fonts.sansSemi, fontSize: size.s125 },
  swatchWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: { width: 26, height: 26, borderRadius: radius.pill },
  diag: { marginTop: 9, padding: 13, borderRadius: radius.card16, borderWidth: 1, borderStyle: 'dashed', gap: 5 },
  diagRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  diagLabel: { fontFamily: fonts.sans, fontSize: size.s115 },
  diagMark: { fontFamily: fonts.sansBold, fontSize: size.s135 },
  diagNote: { fontFamily: fonts.sans, fontSize: size.s105, lineHeight: size.s105 * 1.45, marginTop: 3 },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 7,
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: radius.row,
    borderWidth: 1,
  },
  toggleBody: { flex: 1, minWidth: 0 },
  toggleLabel: { fontFamily: fonts.sans, fontSize: size.s135 },
  toggleSub: { fontFamily: fonts.sans, fontSize: size.s11, marginTop: 3, lineHeight: size.s11 * 1.4 },
  track: { width: 40, height: 22, borderRadius: 99, padding: 3 },
  knob: { width: 16, height: 16, borderRadius: radius.pill, backgroundColor: '#FFFFFF' },
  done: {
    marginTop: 18,
    height: 54,
    borderRadius: radius.row,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: { fontFamily: fonts.sansSemi, fontSize: size.s14, color: ON_ACCENT },
});
