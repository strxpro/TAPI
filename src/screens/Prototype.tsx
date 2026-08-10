import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { cue, useFeedbackWarmUp, type Cue } from '../ui/feedback';
import { BRIDGE_SCRIPT, isBridgeRequest } from '../bridge/protocol';
import { HANDLERS } from '../bridge/handlers';
import { Asset } from 'expo-asset';
// SDK 54 wycofało `readAsStringAsync` z głównego wejścia modułu i rzuca
// wyjątkiem przy próbie użycia. Stara wersja jest nadal dostarczana pod
// `/legacy` i robi dokładnie to, czego potrzebujemy — jeden odczyt pliku.
import * as FileSystem from 'expo-file-system/legacy';
import { ALWAYS_DARK } from '../theme/tokens';
import { Text } from '../ui/Text';

/**
 * Warstwa widoku aplikacji.
 *
 * Do niedawna był tu wprost eksport z Claude Design — 2,3 MB wygenerowanego
 * pliku, w którym każda zmiana wymagała dopasowywania tekstu ze znakami
 * ucieczki. Teraz dokument powstaje z normalnych plików źródłowych:
 *
 *   src/app/template.html   znaczniki
 *   src/app/logic.js        zachowanie
 *   src/app/styles.css      wygląd
 *
 * Składa je `npm run app` do `assets/app.html`. Wygląd jest ten sam co do
 * piksela — sprawdzone porównaniem zrzutów: identyczne bajt w bajt.
 *
 * Rzeczy, których strona nie potrafi (konta, baza, model AI, aparat), robi
 * warstwa natywna przez most — patrz `src/bridge/`.
 *
 * ⚠️ Sama strona w widoku przeglądarki nie przejdzie do App Store (zasada 4.2
 * Apple). Przejdzie, gdy dojdą funkcje natywne: aparat, NFC i powiadomienia —
 * i po to jest most.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const SOURCE = require('../../assets/app.html');

/**
 * Poprawki wstrzykiwane do strony po jej wczytaniu.
 *
 * Eksport z Claude Design przebudowuje cały dokument po starcie i kasuje
 * wszystko, co dopisalibyśmy do pliku. Dlatego działamy stąd i powtarzamy
 * co 300 ms — dzięki temu przeżywa każde przerysowanie.
 *
 * Zadania:
 *  1. zdjąć atrapę iPhone'a (sztywne 402×874) i rozciągnąć treść na ekran,
 *  2. ukryć jej ozdoby: wyspę, sztuczny pasek stanu i kreskę gestu,
 *  3. wyzerować scenę, która wyśrodkowywała ramkę na szarym tle.
 */
const INJECTED = `
(function () {
  if (window.__tapiFix) return true;
  window.__tapiFix = true;

  function styles() {
    if (document.getElementById('tapi-native')) return;
    var el = document.createElement('style');
    el.id = 'tapi-native';
    el.textContent =
      'html,body{height:100%;display:block!important;margin:0;padding:0;' +
      'background:#F4F2ED;overscroll-behavior:none;-webkit-user-select:none;' +
      'user-select:none;-webkit-tap-highlight-color:transparent;' +
      'touch-action:manipulation;-webkit-text-size-adjust:100%;text-size-adjust:100%;' +
      '-webkit-font-smoothing:antialiased;transform:translateZ(0);}' +
      'div[style*="402px"][style*="874px"]{' +
      'width:100vw!important;height:100dvh!important;max-width:none!important;' +
      'border-radius:0!important;box-shadow:none!important;}' +
      '#__bundler_loading,#__bundler_thumbnail{display:none!important}';
    (document.head || document.documentElement).appendChild(el);
  }

  function lockZoom() {
    var m = document.querySelector('meta[name=viewport]');
    if (!m) {
      m = document.createElement('meta');
      m.setAttribute('name', 'viewport');
      (document.head || document.documentElement).appendChild(m);
    }
    var want = 'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover';
    if (m.getAttribute('content') !== want) m.setAttribute('content', want);
  }

  function strip(frame) {
    if (!frame || frame.__stripped) return;
    frame.__stripped = true;
    var s = frame.style;
    s.setProperty('width', '100vw', 'important');
    s.setProperty('height', '100dvh', 'important');
    s.setProperty('max-width', 'none', 'important');
    s.setProperty('border-radius', '0', 'important');
    s.setProperty('box-shadow', 'none', 'important');

    for (var i = 0; i < frame.children.length; i++) {
      var kid = frame.children[i];
      if (kid.style && kid.style.position === 'absolute') {
        kid.style.setProperty('display', 'none', 'important');
      }
    }

    var p = frame.parentElement;
    while (p && p !== document.body) {
      p.style.setProperty('padding', '0', 'important');
      p.style.setProperty('display', 'block', 'important');
      p.style.setProperty('background', 'transparent', 'important');
      p = p.parentElement;
    }
  }

  function fit() {
    var frame = document.querySelector('div[style*="402px"][style*="874px"]');
    if (frame) {
      strip(frame);
      return true;
    }
    return false;
  }

  /* iOS honoruje maximum-scale tylko częściowo — szczypanie dwoma palcami
     i dwuklik nadal potrafią powiększyć stronę. Blokujemy je wprost. */
  function blockZoom() {
    if (window.__tapiNoZoom) return;
    window.__tapiNoZoom = true;

    ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (name) {
      document.addEventListener(name, function (e) { e.preventDefault(); }, { passive: false });
    });

    document.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches.length > 1) e.preventDefault();
    }, { passive: false });

    var last = 0;
    document.addEventListener('touchend', function (e) {
      var now = Date.now();
      if (now - last < 320) e.preventDefault();
      last = now;
    }, { passive: false });
  }

  styles();
  lockZoom();
  blockZoom();
  if (!fit()) {
    var obs = new MutationObserver(function () {
      if (fit()) obs.disconnect();
    });
    obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
  }
})();
true;
`;

export function Prototype() {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const webRef = useRef<WebView>(null);

  // Odtwarzacze budzimy z góry, żeby pierwsze stuknięcie nie było głuche.
  useFeedbackWarmUp();

  /**
   * Most czucia: strona zgłasza dotknięcie, resztę robi system.
   * To jedyna droga na iPhonie — `navigator.vibrate` tam nie istnieje.
   *
   * Prototyp woła `buzz(ms, kind)` i zna tylko pięć rodzajów. Przekładamy je
   * na wspólne `cue()`, dzięki czemu prototyp dostaje nie tylko drgnięcie,
   * ale i dźwięk — te same trzy pliki, co ekrany natywne, i te same
   * przełączniki w ustawieniach.
   */
  const onMessage = useCallback((event: WebViewMessageEvent) => {
    let msg: unknown;
    try {
      msg = JSON.parse(event.nativeEvent.data);
    } catch {
      return; // Wiadomości spoza naszego mostu ignorujemy po cichu.
    }

    // ── zapytanie przez most: strona prosi, my robimy naprawdę ──
    if (isBridgeRequest(msg)) {
      const handler = HANDLERS[msg.method];
      const reply = (ok: boolean, data: unknown) =>
        webRef.current?.injectJavaScript(
          `window.__tapiReply(${msg.id}, ${ok}, ${JSON.stringify(data)}); true;`,
        );

      if (!handler) {
        reply(false, { message: `Nieznana metoda: ${msg.method}` });
        return;
      }

      handler(msg.params ?? {})
        .then((data) => reply(true, data))
        .catch((err) => reply(false, { message: String(err?.message ?? err) }));
      return;
    }

    // ── stary most haptyczny: prototyp woła `buzz(ms, kind)` ──
    const m = msg as { type?: string; kind?: string };
    if (m.type !== 'haptic') return;

    const map: Record<string, Cue> = {
      // skan naklejki i odbiór nagrody — moment, w którym ping ma sens
      success: 'ping',
      medium: 'tab',
      warning: 'save',
      error: 'error',
      light: 'select',
    };
    cue(map[m.kind ?? 'light'] ?? 'select');
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const asset = Asset.fromModule(SOURCE);
        await asset.downloadAsync();
        if (!asset.localUri) throw new Error('Brak lokalnej kopii prototypu');

        // Wczytujemy treść i podajemy ją wprost, zamiast wskazywać plik.
        // Dzięki temu nie zależymy od uprawnień do file:// na iOS i Androidzie.
        const content = await FileSystem.readAsStringAsync(asset.localUri);
        if (alive) setHtml(content);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : String(err));
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (error) {
    return (
      <View style={[styles.center, styles.root]}>
        <Text style={styles.errorTitle}>Nie udało się wczytać prototypu</Text>
        <Text style={styles.errorBody}>{error}</Text>
        <Text style={styles.errorHint}>
          Uruchom w katalogu projektu:{'\n'}node tools/build-prototype.mjs
        </Text>
      </View>
    );
  }

  if (!html) {
    return (
      <View style={[styles.center, styles.root]}>
        <ActivityIndicator color="#57C39F" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <WebView
        source={{ html, baseUrl: 'https://tapi.local' }}
        originWhitelist={['*']}
        style={styles.web}
        injectedJavaScript={BRIDGE_SCRIPT + INJECTED}
        onLoadEnd={() => webRef.current?.injectJavaScript(BRIDGE_SCRIPT + INJECTED)}
        ref={webRef}
        onMessage={onMessage}
        scalesPageToFit={false}
        allowsLinkPreview={false}
        bounces={false}
        overScrollMode="never"
        scrollEnabled={false}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        textZoom={100}
        setSupportMultipleWindows={false}
        // Nic nie ma się powiększać: ani szczypaniem, ani dwuklikiem, ani
        // przyciskami zoomu Androida. Sam `maximum-scale` w meta nie wystarcza,
        // bo WebView potrafi go zignorować.
        setBuiltInZoomControls={false}
        setDisplayZoomControls={false}
        javaScriptEnabled
        domStorageEnabled
        androidLayerType="hardware"
        renderToHardwareTextureAndroid
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F2ED' },
  web: { flex: 1, backgroundColor: 'transparent' },
  center: { alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  errorTitle: { fontSize: 15, fontWeight: '700', color: ALWAYS_DARK.bg, textAlign: 'center' },
  errorBody: { fontSize: 12, color: '#6C6F75', textAlign: 'center' },
  errorHint: { fontSize: 11, color: '#6C6F75', textAlign: 'center', marginTop: 8 },
});
