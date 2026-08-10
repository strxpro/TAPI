import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { ALWAYS_DARK, duration, ease, em, fonts, radius, size } from '../theme/tokens';
import { Raw } from '../ui/Text';
import { press } from '../ui/motion';
import { cue } from '../ui/feedback';

/**
 * Aparat — nakładka natywna nad warstwą widoku.
 *
 * Strona w widoku przeglądarki nie ma dostępu do aparatu, więc otwiera ten
 * ekran przez most i dostaje z powrotem albo odczytany kod, albo zdjęcie
 * karty menu do przepisania przez model.
 *
 * Wygląd trzyma się projektu: powierzchnia zawsze ciemna (`#14161A`),
 * ramka celownika, przesuwająca się linia skanu i instrukcja pod spodem —
 * dokładnie jak w sekcji „SKANER".
 */

export type CameraMode = 'code' | 'menu';

export type CameraResult =
  | { type: 'code'; value: string }
  | { type: 'photo'; base64: string; mime: string }
  | { type: 'cancel' }
  | { type: 'denied' };

const FRAME = 262;

export function CameraSheet({
  mode,
  open,
  onDone,
}: {
  mode: CameraMode;
  open: boolean;
  onDone: (result: CameraResult) => void;
}) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);
  // Kod potrafi odczytać się kilka razy w sekundę — pierwszy wygrywa.
  const handled = useRef(false);

  const scan = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!open) {
      handled.current = false;
      setBusy(false);
      return;
    }
    if (!permission?.granted) void requestPermission();
  }, [open, permission?.granted, requestPermission]);

  // `scanline` z projektu: 262 px w dół, 2,4 s, w kółko.
  useEffect(() => {
    if (!open || mode !== 'code') return;
    scan.setValue(0);
    const loop = Animated.loop(
      Animated.timing(scan, {
        toValue: 1,
        duration: 2400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [open, mode, scan]);

  const onCode = useCallback(
    (result: BarcodeScanningResult) => {
      if (handled.current || mode !== 'code') return;
      handled.current = true;
      cue('ping');
      onDone({ type: 'code', value: result.data });
    },
    [mode, onDone],
  );

  const shoot = useCallback(async () => {
    if (busy || !camera.current) return;
    setBusy(true);
    cue('tab');
    try {
      const photo = await camera.current.takePictureAsync({
        base64: true,
        // Zdjęcia są u modelu znacznie droższe niż tekst, a karta menu czyta
        // się dobrze także pomniejszona. Stąd mocna kompresja i skala.
        quality: 0.5,
        imageType: 'jpg',
        scale: 0.6,
      });
      if (!photo?.base64) {
        onDone({ type: 'cancel' });
        return;
      }
      onDone({ type: 'photo', base64: photo.base64, mime: 'image/jpeg' });
    } catch {
      onDone({ type: 'cancel' });
    } finally {
      setBusy(false);
    }
  }, [busy, onDone]);

  if (!open) return null;

  const denied = permission && !permission.granted && !permission.canAskAgain;

  return (
    <Modal visible={open} animationType="slide" onRequestClose={() => onDone({ type: 'cancel' })}>
      <View style={styles.root}>
        {permission?.granted && (
          <CameraView
            ref={camera}
            style={StyleSheet.absoluteFill}
            facing="back"
            // Odczyt kodu włączamy tylko wtedy, gdy o niego prosimy — inaczej
            // aparat czytałby przypadkowe kody podczas fotografowania menu.
            barcodeScannerSettings={mode === 'code' ? { barcodeTypes: ['qr', 'ean13', 'code128'] } : undefined}
            onBarcodeScanned={mode === 'code' ? onCode : undefined}
          />
        )}

        {/* ── ramka celownika ── */}
        {mode === 'code' && (
          <View style={styles.center} pointerEvents="none">
            <View style={styles.frame}>
              {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
                <View key={c} style={[styles.corner, styles[c]]} />
              ))}
              <Animated.View
                style={[
                  styles.line,
                  {
                    transform: [
                      { translateY: scan.interpolate({ inputRange: [0, 1], outputRange: [0, FRAME] }) },
                    ],
                    opacity: scan.interpolate({
                      inputRange: [0, 0.07, 0.93, 1],
                      outputRange: [0, 1, 1, 0],
                    }),
                  },
                ]}
              />
            </View>
          </View>
        )}

        {mode === 'menu' && (
          <View style={styles.center} pointerEvents="none">
            <View style={styles.page} />
          </View>
        )}

        {/* ── instrukcja i przyciski ── */}
        <View style={[styles.bottom, { paddingBottom: insets.bottom + 28 }]}>
          <Raw style={styles.title}>
            {mode === 'code' ? 'Zeskanuj naklejkę w witrynie' : 'Zrób zdjęcie karty menu'}
          </Raw>
          <Raw style={styles.sub}>
            {denied
              ? 'Brak zgody na aparat. Włącz ją w ustawieniach telefonu.'
              : mode === 'code'
                ? 'Kod działa 24/7 — także gdy lokal jest zamknięty.'
                : 'Trzymaj kartę w kadrze. Pozycje przepiszemy automatycznie.'}
          </Raw>

          {mode === 'menu' && permission?.granted && (
            <Pressable
              onPress={shoot}
              disabled={busy}
              accessibilityRole="button"
              style={({ pressed }) => [styles.shutter, press(0.94)({ pressed }), busy && styles.dim]}
            >
              <View style={styles.shutterInner} />
            </Pressable>
          )}

          <Pressable
            onPress={() => onDone({ type: 'cancel' })}
            accessibilityRole="button"
            style={({ pressed }) => [styles.cancel, press(0.96)({ pressed })]}
          >
            <Raw style={styles.cancelText}>Anuluj</Raw>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const EDGE = 'rgba(244,242,237,0.9)';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ALWAYS_DARK.bg },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  frame: { width: FRAME, height: FRAME, overflow: 'hidden' },
  page: {
    width: '76%',
    height: '54%',
    borderRadius: radius.sheet,
    borderWidth: 2,
    borderColor: EDGE,
    borderStyle: 'dashed',
  },
  corner: { position: 'absolute', width: 34, height: 34, borderColor: EDGE },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: radius.md },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: radius.md },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: radius.md },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: radius.md },
  line: { position: 'absolute', left: 6, right: 6, height: 2, backgroundColor: '#57C39F' },

  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', paddingHorizontal: 24 },
  title: {
    fontFamily: fonts.serif,
    fontSize: size.s24,
    letterSpacing: em(size.s24, -0.03),
    color: ALWAYS_DARK.ink,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.sans,
    fontSize: size.s125,
    lineHeight: size.s125 * 1.45,
    color: 'rgba(244,242,237,0.6)',
    textAlign: 'center',
    marginTop: 7,
  },
  shutter: {
    marginTop: 22,
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    borderWidth: 3,
    borderColor: EDGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 58, height: 58, borderRadius: radius.pill, backgroundColor: EDGE },
  dim: { opacity: 0.5 },
  cancel: { marginTop: 18, paddingVertical: 10, paddingHorizontal: 22 },
  cancelText: { fontFamily: fonts.sansSemi, fontSize: size.s135, color: 'rgba(244,242,237,0.75)' },
});
