/**
 * Dokument rysujący naklejkę stojaka na prawdziwym `<canvas>`.
 *
 * React Native nie ma canvasu, a naklejka musi powstawać na żywo: nazwa
 * lokalu, kod QR, zachęta, znak TAPI i gwiazdki zmieniają się w konfiguratorze.
 * Dlatego rysunek robi ukryty WebView (`react-native-webview` i tak jest
 * w projekcie), a gotowy PNG z przezroczystym tłem wraca do aplikacji jako
 * `data:` i idzie prosto na materiał `Stojak_Etykieta`.
 *
 * Kroje wstrzykujemy z paczek `@expo-google-fonts` jako `@font-face` w base64,
 * żeby napis nie wyszedł krojem systemowym telefonu.
 */

export type LabelPayload = {
  /** nazwa lokalu, góra naklejki */
  venue: string;
  /** zachęta pod kodem */
  cta: string;
  /** kolor druku (zależny od koloru obudowy) */
  ink: string;
  /** kolor gwiazdek */
  star: string;
  /** ile gwiazdek wypełnionych, 0 = sekcja ocen wyłączona */
  stars: number;
  /** macierz kodu QR: bok w modułach i tablica 0/1 wierszami */
  qr: { size: number; data: number[] };
};

export type LabelFonts = { serif?: string; sans?: string };

/** Bok tekstury. Potęga dwójki — GL nie musi jej wtedy przeskalowywać. */
export const LABEL_SIZE = 1024;

export function buildLabelHtml(fonts: LabelFonts): string {
  const face = (family: string, base64?: string) =>
    base64
      ? `@font-face{font-family:'${family}';src:url(data:font/ttf;base64,${base64}) format('truetype');font-display:block;}`
      : '';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  html,body{margin:0;padding:0;background:transparent;overflow:hidden}
  canvas{display:block}
  ${face('TapiSerif', fonts.serif)}
  ${face('TapiSans', fonts.sans)}
</style></head>
<body>
<canvas id="c" width="${LABEL_SIZE}" height="${LABEL_SIZE}"></canvas>
<script>
(function () {
  var S = ${LABEL_SIZE};
  var c = document.getElementById('c');
  var ctx = c.getContext('2d');
  var SERIF = '"TapiSerif", Georgia, serif';
  var SANS = '"TapiSans", system-ui, -apple-system, sans-serif';

  function send(type, payload) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload }));
  }

  /* ── nazwa lokalu: 10–22% wysokości ── */
  function drawVenue(cfg) {
    var top = 0.10 * S, bottom = 0.22 * S;
    var max = S * 0.84;
    var size = 88;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    do {
      ctx.font = size + 'px ' + SERIF;
      if (ctx.measureText(cfg.venue).width <= max) break;
      size -= 2;
    } while (size > 28);
    ctx.fillStyle = cfg.ink;
    ctx.fillText(cfg.venue, S / 2, (top + bottom) / 2);
  }

  /* ── kod QR w kółku: 28–60% wysokości ── */
  function drawQr(cfg) {
    var top = 0.28 * S, bottom = 0.60 * S;
    var cy = (top + bottom) / 2;
    var r = (bottom - top) / 2;

    // Tło zawsze białe, niezależnie od koloru obudowy — czytniki lubią
    // ciemne moduły na jasnym tle. Cienki pierścień, żeby krążek był
    // widoczny także na białym stojaku.
    ctx.beginPath();
    ctx.arc(S / 2, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(20,22,26,0.16)';
    ctx.stroke();

    var n = cfg.qr.size;
    if (!n) return;
    // Kwadrat wpisany w koło ma bok r·√2; bierzemy wyraźnie mniej, żeby
    // wokół kodu została cisza, której wymagają czytniki.
    var side = r * 1.16;
    var x0 = S / 2 - side / 2;
    var y0 = cy - side / 2;
    var cell = side / n;
    ctx.fillStyle = '#14161A';
    for (var row = 0; row < n; row++) {
      for (var col = 0; col < n; col++) {
        if (!cfg.qr.data[row * n + col]) continue;
        // pół piksela zapasu, żeby między modułami nie prześwitywały szpary
        ctx.fillRect(x0 + col * cell, y0 + row * cell, cell + 0.6, cell + 0.6);
      }
    }
  }

  /* ── zachęta: 65–75% wysokości ── */
  function drawCta(cfg) {
    var top = 0.65 * S, bottom = 0.75 * S;
    var max = S * 0.80;
    ctx.font = '600 34px ' + SANS;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    var words = String(cfg.cta).split(' ');
    var lines = [];
    var line = '';
    for (var i = 0; i < words.length; i++) {
      var next = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(next).width > max && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);

    var lh = 44;
    var block = lines.length * lh;
    var y = (top + bottom) / 2 - block / 2 + lh / 2;
    ctx.fillStyle = cfg.ink;
    ctx.globalAlpha = 0.82;
    for (var k = 0; k < lines.length; k++) ctx.fillText(lines[k], S / 2, y + k * lh);
    ctx.globalAlpha = 1;
  }

  /* ── znak TAPI: ścieżki 1:1 z src/ui/Wordmark.tsx (viewBox 0 -5 152 69) ── */
  function drawWordmark(x, y, w, ink) {
    var s = w / 152;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.translate(0, 5);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke(new Path2D('M20 8V38c0 7 4 10 10 10'));
    ctx.stroke(new Path2D('M10 20H31'));
    ctx.beginPath(); ctx.arc(55, 37, 11, 0, Math.PI * 2); ctx.stroke();
    ctx.stroke(new Path2D('M66 27V48'));
    ctx.beginPath(); ctx.arc(99, 37, 11, 0, Math.PI * 2); ctx.stroke();
    ctx.stroke(new Path2D('M88 27V60'));
    ctx.stroke(new Path2D('M133 30V48'));
    // pinezka zamiast kropki nad „i"
    ctx.fillStyle = ink;
    ctx.fill(new Path2D('M133 -1a11 11 0 0111 11c0 7.6-11 12-11 12s-11-4.4-11-12a11 11 0 0111-11z'));
    ctx.restore();
    return w * (69 / 152);
  }

  /* ── gwiazdki ── */
  function starPath(cx, cy, r) {
    var p = new Path2D();
    for (var i = 0; i < 10; i++) {
      var rad = i % 2 === 0 ? r : r * 0.45;
      var a = (Math.PI / 5) * i - Math.PI / 2;
      var px = cx + Math.cos(a) * rad;
      var py = cy + Math.sin(a) * rad;
      if (i === 0) p.moveTo(px, py); else p.lineTo(px, py);
    }
    p.closePath();
    return p;
  }

  function drawStars(cfg, cy) {
    var count = 5;
    var r = 17;
    var gap = 14;
    var total = count * (r * 2) + (count - 1) * gap;
    var x = S / 2 - total / 2 + r;
    for (var i = 0; i < count; i++) {
      var p = starPath(x + i * (r * 2 + gap), cy, r);
      if (i < cfg.stars) {
        ctx.fillStyle = cfg.star;
        ctx.fill(p);
      } else {
        ctx.strokeStyle = cfg.star;
        ctx.lineWidth = 2.4;
        ctx.globalAlpha = 0.55;
        ctx.stroke(p);
        ctx.globalAlpha = 1;
      }
    }
  }

  /* ── dół: 80–95% wysokości ── */
  function drawFooter(cfg) {
    var top = 0.80 * S, bottom = 0.95 * S;
    var logoW = 196;
    var logoH = drawWordmark(S / 2 - logoW / 2, top + 4, logoW, cfg.ink);
    if (cfg.stars > 0) drawStars(cfg, Math.min(top + logoH + 46, bottom - 18));
  }

  window.__draw = function (cfg) {
    try {
      ctx.clearRect(0, 0, S, S);
      drawVenue(cfg);
      drawQr(cfg);
      drawCta(cfg);
      drawFooter(cfg);
      send('png', c.toDataURL('image/png'));
    } catch (err) {
      send('error', String((err && err.message) || err));
    }
  };

  // Kroje muszą być gotowe, zanim mierzymy szerokość tekstu — inaczej
  // nazwa lokalu skaluje się do fontu zastępczego.
  function ready() { send('ready', null); }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(ready).catch(ready);
  } else {
    ready();
  }
})();
</script>
</body></html>`;
}
