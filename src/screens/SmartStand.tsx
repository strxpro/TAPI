import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/I18nProvider';
import { ALWAYS_DARK, em, fonts, ON_ACCENT, radius, size, space } from '../theme/tokens';
import { Raw } from '../ui/Text';
import { press } from '../ui/motion';
import { cue } from '../ui/feedback';
import { StandViewer } from '../stand/StandViewer';
import { defaultStand, STAND_STAR, type StandColor, type StandConfig } from '../stand/config';

/**
 * Konfigurator stojaka TAPI — na razie sam podgląd 3D i ustawienia naklejki.
 *
 * Wycena, dwa kroki arkusza i zamówienie dochodzą w punkcie 10 planu; ten
 * ekran powstał wcześniej, bo model `stojak.glb` był gotowy.
 */

export function SmartStand() {
  const { theme, accent, accentText, accentSoft } = useTheme();
  const { l3 } = useI18n();
  const [config, setConfig] = useState<StandConfig>(defaultStand);
  // Czy gość już cokolwiek w konfiguratorze zmienił.
  const [touched, setTouched] = useState(false);

  const set = (patch: Partial<StandConfig>) => {
    setTouched(true);
    setConfig((c) => ({ ...c, ...patch }));
  };

  const colors: { id: StandColor; label: string; swatch: string; border: string }[] = [
    {
      id: 'white',
      label: l3('Biały', 'White', 'Bianco'),
      swatch: '#FFFFFF',
      border: 'rgba(22,24,28,0.18)',
    },
    {
      id: 'black',
      label: l3('Czarny', 'Black', 'Nero'),
      swatch: '#111111',
      border: 'rgba(255,255,255,0.18)',
    },
  ];

  return (
    <ScrollView
      style={{ backgroundColor: theme.paper }}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.head}>
        <Raw style={[styles.kicker, { color: theme.sub }]}>
          {l3('Urządzenie przy ladzie', 'Counter device', 'Dispositivo al banco')}
        </Raw>
        <Raw style={[styles.title, { color: theme.ink }]}>TAPI Smart Stand</Raw>
      </View>

      {/* ── podgląd 3D ── */}
      <View style={[styles.stage, { backgroundColor: ALWAYS_DARK.bg }]}>
        <StandViewer config={config} height={340} />
        <Raw style={styles.hint}>
          {l3(
            'Obróć palcem, żeby obejrzeć dookoła',
            'Drag to look around',
            'Trascina per girarlo',
          )}
        </Raw>
      </View>

      {/* ── kolor obudowy ── */}
      <Raw style={[styles.section, { color: theme.sub }]}>
        {l3('Kolor obudowy', 'Body colour', 'Colore della scocca')}
      </Raw>
      <View style={styles.row}>
        {colors.map((c) => {
          const on = config.color === c.id;
          return (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => {
                cue('select');
                set({ color: c.id });
              }}
              style={({ pressed }) => [
                styles.color,
                {
                  backgroundColor: on ? accentSoft : theme.surf,
                  borderColor: on ? accentText : theme.hair,
                },
                press(0.96)({ pressed }),
              ]}
            >
              <View style={[styles.swatch, { backgroundColor: c.swatch, borderColor: c.border }]} />
              <Raw style={[styles.colorLabel, { color: on ? accentText : theme.ink }]}>{c.label}</Raw>
            </Pressable>
          );
        })}
      </View>

      {/* ── nadruk ── */}
      <Raw style={[styles.section, { color: theme.sub }]}>
        {l3('Nadruk na naklejce', 'Sticker print', 'Stampa sull’adesivo')}
      </Raw>
      <View style={[styles.field, { backgroundColor: theme.surf, borderColor: theme.hair }]}>
        <TextInput
          value={config.venue}
          onChangeText={(venue) => set({ venue })}
          placeholder={l3('Nazwa lokalu', 'Venue name', 'Nome del locale')}
          placeholderTextColor={theme.sub}
          style={[styles.input, { color: theme.ink }]}
          allowFontScaling={false}
          maxLength={28}
        />
      </View>

      {/* ── gwiazdki ── */}
      <Raw style={[styles.section, { color: theme.sub }]}>
        {l3('Ocena na naklejce', 'Rating on the sticker', 'Voto sull’adesivo')}
      </Raw>
      <View style={styles.row}>
        {[0, 3, 4, 5].map((n) => {
          const on = config.stars === n;
          return (
            <Pressable
              key={n}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => set({ stars: n })}
              style={({ pressed }) => [
                styles.stars,
                {
                  backgroundColor: on ? theme.ink : theme.surf,
                  borderColor: on ? theme.ink : theme.hair,
                },
                press(0.94)({ pressed }),
              ]}
            >
              <Raw
                style={[
                  styles.starsLabel,
                  { color: on ? theme.paper : n === 0 ? theme.sub : STAND_STAR },
                ]}
              >
                {n === 0 ? l3('Bez ocen', 'None', 'Nessuno') : '★'.repeat(n)}
              </Raw>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.note, { borderColor: theme.hair }]}>
        <Raw style={[styles.noteText, { color: theme.sub }]}>
          {l3(
            'Naklejka powstaje na żywo: nazwa, kod QR, zachęta, znak TAPI i gwiazdki lecą prosto na model.',
            'The sticker is generated live: name, QR code, prompt, the TAPI mark and stars go straight onto the model.',
            'L’adesivo si genera in diretta: nome, codice QR, invito, il segno TAPI e le stelle finiscono dritti sul modello.',
          )}
        </Raw>
      </View>

      {/* Cennik pokazuje się dopiero, gdy gość coś w konfiguratorze ruszy —
          dopóki tylko ogląda model, nie ma po co straszyć ceną. */}
      {touched && (
        <Pressable
          onPress={() => cue('success')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.cta, { backgroundColor: accent.hex }, press(0.98)({ pressed })]}
        >
          <Raw style={styles.ctaText}>
            {l3('Wycena w punkcie 10', 'Pricing lands in step 10', 'Il prezzo arriva al punto 10')}
          </Raw>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 54, paddingBottom: 128, paddingHorizontal: space.screen },
  head: { paddingTop: 14, paddingBottom: 16 },
  kicker: {
    fontFamily: fonts.sans,
    fontSize: size.s105,
    letterSpacing: em(size.s105, 0.14),
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: size.s34,
    letterSpacing: em(size.s34, -0.03),
    lineHeight: size.s34 * 1.05,
    marginTop: 8,
  },
  stage: { borderRadius: radius.sheet28, overflow: 'hidden', paddingBottom: 14 },
  hint: {
    fontFamily: fonts.sans,
    fontSize: size.s105,
    letterSpacing: em(size.s105, 0.1),
    textTransform: 'uppercase',
    textAlign: 'center',
    color: 'rgba(244,242,237,0.6)',
  },
  section: {
    fontFamily: fonts.sansSemi,
    fontSize: size.s10,
    letterSpacing: em(size.s10, 0.14),
    textTransform: 'uppercase',
    marginTop: space.section,
    marginBottom: 9,
  },
  row: { flexDirection: 'row', gap: 7 },
  color: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.card16,
    borderWidth: 1,
  },
  swatch: { width: 22, height: 22, borderRadius: radius.pill, borderWidth: 1 },
  colorLabel: { fontFamily: fonts.sansSemi, fontSize: size.s125 },
  field: { height: 48, borderRadius: radius.card, borderWidth: 1, justifyContent: 'center', paddingHorizontal: 14 },
  input: { fontFamily: fonts.sans, fontSize: size.s14, padding: 0 },
  stars: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: radius.card14,
    borderWidth: 1,
  },
  starsLabel: { fontFamily: fonts.sansSemi, fontSize: size.s12 },
  note: {
    marginTop: space.section,
    padding: 14,
    borderRadius: radius.card16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  noteText: { fontFamily: fonts.sans, fontSize: size.s12, lineHeight: size.s12 * 1.5 },
  cta: {
    marginTop: 12,
    height: 54,
    borderRadius: radius.row,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontFamily: fonts.sansSemi, fontSize: size.s14, color: ON_ACCENT },
});
