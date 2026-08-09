import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as FS from 'expo-file-system/legacy';
import QRCode from 'qrcode';
import * as THREE from 'three';
import { InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans';
import { buildLabelHtml, type LabelFonts, type LabelPayload } from './labelHtml';
import { STAND_INK, STAND_STAR, type StandConfig } from './config';

/**
 * Naklejka stojaka: rysunek powstaje w ukrytym WebView, wraca jako PNG
 * i ląduje jako tekstura three.js.
 *
 * `TextureLoader` w React Native jest podmieniony przez `@react-three/fiber`
 * i przyjmuje `data:` wprost — sam zapisuje plik do katalogu podręcznego
 * i buduje teksturę pod uploader z expo-gl. Dlatego wystarczy podać mu
 * to, co przyszło z canvasu.
 *
 * Zwraca teksturę i element `<LabelSurface />`, który trzeba gdzieś
 * zamontować — jest niewidoczny i nie zajmuje miejsca.
 */

/** Orientacja tekstury na siatce z glTF — patrz komentarz przy użyciu. */
const LABEL_FLIP_Y = false;

export function useStandLabel(config: StandConfig) {
  const [fonts, setFonts] = useState<LabelFonts | null>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [error, setError] = useState<string | null>(null);
  const webRef = useRef<WebView>(null);
  const ready = useRef(false);
  // Zbudowana tekstura trzyma pamięć GPU — starą trzeba zwolnić ręcznie.
  const previous = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    let alive = true;
    loadFonts()
      .then((f) => alive && setFonts(f))
      .catch(() => alive && setFonts({}));
    return () => {
      alive = false;
    };
  }, []);

  const html = useMemo(() => (fonts ? buildLabelHtml(fonts) : null), [fonts]);

  const payload = useMemo<LabelPayload | null>(() => {
    const qr = qrMatrix(config.qrPayload);
    if (!qr) return null;
    return {
      venue: config.venue,
      cta: config.cta,
      ink: STAND_INK[config.color],
      star: STAND_STAR,
      stars: config.stars,
      qr,
    };
  }, [config.qrPayload, config.venue, config.cta, config.color, config.stars]);

  const redraw = useCallback(() => {
    if (!ready.current || !payload || !webRef.current) return;
    webRef.current.injectJavaScript(`window.__draw(${JSON.stringify(payload)}); true;`);
  }, [payload]);

  // Każda zmiana konfiguracji przerysowuje naklejkę.
  useEffect(redraw, [redraw]);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      let msg: { type: string; payload: string | null };
      try {
        msg = JSON.parse(event.nativeEvent.data);
      } catch {
        return;
      }

      if (msg.type === 'ready') {
        ready.current = true;
        redraw();
        return;
      }

      if (msg.type === 'error') {
        setError(msg.payload);
        return;
      }

      if (msg.type !== 'png' || !msg.payload) return;

      new THREE.TextureLoader().load(
        msg.payload,
        (next) => {
          next.colorSpace = THREE.SRGBColorSpace;
          // Naklejka jest jedna na obiekt — nie powtarzamy jej po UV.
          next.wrapS = THREE.ClampToEdgeWrapping;
          next.wrapT = THREE.ClampToEdgeWrapping;
          next.anisotropy = 8;
          // Podmieniony `TextureLoader` ustawia `flipY = true`, bo tak
          // zachowuje się obrazek na stronie. Siatki z glTF mają UV liczone
          // od górnej krawędzi, czyli odwrotnie — stąd jawne `false`.
          // Gdyby naklejka wyszła do góry nogami, to jest ta jedna linijka.
          next.flipY = LABEL_FLIP_Y;
          previous.current?.dispose();
          previous.current = next;
          setTexture(next);
          setError(null);
        },
        undefined,
        (err) => setError(String(err)),
      );
    },
    [redraw],
  );

  useEffect(
    () => () => {
      previous.current?.dispose();
      previous.current = null;
    },
    [],
  );

  const LabelSurface = useCallback(
    () =>
      html ? (
        <View style={styles.hidden} pointerEvents="none">
          <WebView
            ref={webRef}
            source={{ html }}
            originWhitelist={['*']}
            javaScriptEnabled
            onMessage={onMessage}
            // Rysunek jest jednorazowy, nie ma czego przewijać ani zaznaczać.
            scrollEnabled={false}
            style={styles.web}
          />
        </View>
      ) : null,
    [html, onMessage],
  );

  return { texture, error, LabelSurface };
}

/* ─────────────────────────────────────────────────────────────────── QR ── */

/**
 * Macierz kodu liczymy po stronie aplikacji i podajemy do canvasu gotową —
 * dzięki temu do WebView nie trzeba wstrzykiwać całej biblioteki QR.
 */
function qrMatrix(text: string): { size: number; data: number[] } | null {
  try {
    const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
    return { size: qr.modules.size, data: Array.from(qr.modules.data as Uint8Array) };
  } catch {
    return null;
  }
}

/* ──────────────────────────────────────────────────────────────── kroje ── */

async function loadFonts(): Promise<LabelFonts> {
  const [serif, sans] = await Promise.all([
    fontToBase64(InstrumentSerif_400Regular),
    fontToBase64(PlusJakartaSans_600SemiBold),
  ]);
  return { serif, sans };
}

async function fontToBase64(mod: number | string): Promise<string | undefined> {
  try {
    const asset = await Asset.fromModule(mod).downloadAsync();
    const uri = asset.localUri ?? asset.uri;
    if (!uri) return undefined;
    return await FS.readAsStringAsync(uri, { encoding: FS.EncodingType.Base64 });
  } catch {
    // Bez kroju firmowego canvas weźmie zastępczy z systemu. Napis będzie,
    // tylko w innych proporcjach — lepsze to niż pusta naklejka.
    return undefined;
  }
}

const styles = StyleSheet.create({
  // WebView musi być zamontowany, żeby narysować — ale ma być niewidoczny.
  hidden: { position: 'absolute', width: 1, height: 1, opacity: 0, top: -10, left: -10 },
  web: { width: 1, height: 1, backgroundColor: 'transparent' },
});
