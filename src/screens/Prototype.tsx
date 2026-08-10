import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { cue, useFeedbackWarmUp, type Cue } from '../ui/feedback';
import { Asset } from 'expo-asset';
// SDK 54 wycofało `readAsStringAsync` z głównego wejścia modułu i rzuca
// wyjątkiem przy próbie użycia. Stara wersja jest nadal dostarczana pod
// `/legacy` i robi dokładnie to, czego potrzebujemy — jeden odczyt pliku.
import * as FileSystem from 'expo-file-system/legacy';
import { ALWAYS_DARK } from '../theme/tokens';
import { Text } from '../ui/Text';

/**
 * Prototyp z Claude Design — wyświetlany 1:1.
 *
 * To nie jest odwzorowanie, tylko sam plik `Bywalec.dc.html` z handoffu,
 * złożony w jeden dokument przez `tools/build-prototype.mjs` i pokazany
 * w widoku przeglądarki. Wszystko, co zaprojektowałeś, działa tu tak samo:
 * te same animacje, ten sam układ, ten sam panel firmy.
 *
 * Ekrany natywne z `src/screens/` zostają w repozytorium i będą podmieniane
 * pojedynczo, w miarę zatwierdzania.
 *
 * ⚠️ Do App Store ta forma nie przejdzie (zasada 4.2 Apple o minimalnej
 * funkcjonalności). Do pracy, pokazów i testów na telefonie — w porządku.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const SOURCE = require('../../assets/prototype.html');

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
      'touch-action:pan-x pan-y;-webkit-text-size-adjust:100%;text-size-adjust:100%;' +
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

  styles();
  lockZoom();
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
    try {
      const msg = JSON.parse(event.nativeEvent.data) as { type?: string; kind?: string };
      if (msg.type !== 'haptic') return;

      const map: Record<string, Cue> = {
        // skan naklejki i odbiór nagrody — moment, w którym ping ma sens
        success: 'ping',
        medium: 'tab',
        warning: 'save',
        error: 'error',
        light: 'select',
      };
      cue(map[msg.kind ?? 'light'] ?? 'select');
    } catch {
      // Wiadomości spoza naszego mostu ignorujemy po cichu.
    }
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
        injectedJavaScript={INJECTED}
        onLoadEnd={() => webRef.current?.injectJavaScript(INJECTED)}
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
