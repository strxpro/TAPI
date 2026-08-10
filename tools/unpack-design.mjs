/**
 * Rozbiera eksport z Claude Design na normalne pliki źródłowe.
 *
 *   node tools/unpack-design.mjs
 *
 * Po co: `TAPI-standalone.html` to 2,3 MB wygenerowanego pliku, w którym
 * znaczniki i logika siedzą zakodowane jako JSON, a czcionki i biblioteki
 * jako spakowany wykaz pod identyfikatorami. Każda zmiana wymagała
 * dopasowywania tekstu ze znakami ucieczki — to łatanie, nie praca nad kodem.
 *
 * Po rozbiciu dostajesz zwykły projekt:
 *
 *   src/app/template.html   znaczniki — edytujesz wprost
 *   src/app/logic.js        klasa Component — edytujesz wprost
 *   src/app/styles.css      style
 *   src/app/fonts/          kroje pisma
 *   src/app/vendor/         biblioteki (nie ruszamy)
 *
 * Wygląd zostaje ten sam co do znaku — to te same treści, tylko wyjęte
 * z opakowania. Z powrotem składa je `tools/build-app.mjs`.
 *
 * Uruchamiasz to raz, przy pierwszym rozbiciu, albo po nowym eksporcie
 * z Claude Design, gdy chcesz przejąć jego zmiany.
 */

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..', '..');
const SOURCE = join(ROOT, 'TAPI-standalone.html');
const OUT = resolve(here, '..', 'src', 'app');

/** Wyciąga zawartość znacznika `<script type="__bundler/…">`. */
function block(html, type) {
  const open = `<script type="__bundler/${type}">`;
  const a = html.indexOf(open);
  if (a < 0) return null;
  const b = html.indexOf('</script>', a);
  return html.slice(a + open.length, b).trim();
}

/** Rozpoznanie roli pliku po treści — nazwy w wykazie to same identyfikatory. */
function nameFor(uuid, mime, buf) {
  if (mime.includes('font')) return { dir: 'fonts', name: `${uuid.slice(0, 8)}.woff2` };
  const head = buf.slice(0, 4000).toString('utf8');
  if (head.includes('dc-runtime')) return { dir: 'vendor', name: 'dc-runtime.js' };
  if (head.includes('react-dom') || head.includes('ReactDOM')) return { dir: 'vendor', name: 'react-dom.js' };
  if (head.includes('react.production') || /exports\.createElement/.test(head))
    return { dir: 'vendor', name: 'react.js' };
  if (head.includes('leaflet') || head.includes('Leaflet')) return { dir: 'vendor', name: 'leaflet.js' };
  return { dir: 'vendor', name: `${uuid.slice(0, 8)}.js` };
}

async function main() {
  const html = await readFile(SOURCE, 'utf8');

  const template = JSON.parse(block(html, 'template'));
  const manifest = JSON.parse(block(html, 'manifest'));

  await rm(OUT, { recursive: true, force: true });
  for (const dir of ['', 'fonts', 'vendor']) await mkdir(join(OUT, dir), { recursive: true });

  /* ── zasoby: czcionki i biblioteki ── */
  const map = new Map(); // uuid → ścieżka względna
  for (const [uuid, entry] of Object.entries(manifest)) {
    let buf = Buffer.from(entry.data, 'base64');
    if (entry.compressed) buf = gunzipSync(buf);
    const { dir, name } = nameFor(uuid, entry.mime, buf);
    await writeFile(join(OUT, dir, name), buf);
    map.set(uuid, `${dir}/${name}`);
  }

  /* ── dokument: odwołania po identyfikatorach na normalne ścieżki ── */
  let doc = template;
  for (const [uuid, path] of map) doc = doc.split(uuid).join(path);

  /* ── style ── */
  // W dokumencie są dwa bloki: kroje pisma i style aplikacji. Wyjmujemy oba
  // do jednego arkusza, żeby dało się je edytować bez szukania w HTML-u.
  const styles = [];
  doc = doc.replace(/<style>([\s\S]*?)<\/style>/g, (_, css) => {
    styles.push(css.trim());
    return '<!-- STYLES -->';
  });
  // Tylko pierwszy znacznik zastępczy zostaje, resztę usuwamy.
  let first = true;
  doc = doc.replace(/<!-- STYLES -->/g, () => (first ? ((first = false), '<!-- STYLES -->') : ''));

  /* ── znaczniki i logika ── */
  const openTag = doc.indexOf('<x-dc>');
  const closeTag = doc.indexOf('</x-dc>');
  const markup = doc.slice(openTag + '<x-dc>'.length, closeTag).trim();

  const scriptOpen = doc.indexOf('<script type="text/x-dc"', closeTag);
  const scriptBodyStart = doc.indexOf('>', scriptOpen) + 1;
  const scriptEnd = doc.indexOf('</script>', scriptBodyStart);
  const logic = doc.slice(scriptBodyStart, scriptEnd).trim();

  // Atrybut `data-props` trzymamy osobno — to ustawienia edytora, nie kod.
  const propsMatch = /data-props="([^"]*)"/.exec(doc.slice(scriptOpen, scriptBodyStart));
  const props = propsMatch ? propsMatch[1].replace(/&quot;/g, '"') : '{}';

  /* ── szkielet dokumentu ── */
  const shell = doc.slice(0, openTag).replace('<!-- STYLES -->', '<!-- STYLES -->') +
    '<x-dc>\n<!-- TEMPLATE -->\n</x-dc>\n<!-- LOGIC -->\n' +
    doc.slice(doc.indexOf('</script>', scriptEnd) + '</script>'.length);

  await writeFile(join(OUT, 'index.html'), shell, 'utf8');
  await writeFile(join(OUT, 'template.html'), markup + '\n', 'utf8');
  await writeFile(join(OUT, 'logic.js'), logic + '\n', 'utf8');
  await writeFile(join(OUT, 'styles.css'), styles.join('\n\n/* ─── */\n\n') + '\n', 'utf8');
  await writeFile(join(OUT, 'props.json'), JSON.stringify(JSON.parse(props), null, 2) + '\n', 'utf8');

  const kb = (s) => (Buffer.byteLength(s, 'utf8') / 1024).toFixed(0) + ' kB';
  console.log('\n  Rozbite na pliki źródłowe w src/app:\n');
  console.log(`    index.html      ${kb(shell)}  szkielet dokumentu`);
  console.log(`    template.html   ${kb(markup)}  znaczniki — tu edytujesz wygląd`);
  console.log(`    logic.js        ${kb(logic)}  klasa Component — tu edytujesz zachowanie`);
  console.log(`    styles.css      ${kb(styles.join(''))}  style`);
  console.log(`    fonts/          ${[...map.values()].filter((p) => p.startsWith('fonts')).length} plików`);
  console.log(`    vendor/         ${[...map.values()].filter((p) => p.startsWith('vendor')).length} plików`);
  console.log('\n  Teraz: node tools/build-app.mjs\n');
}

main().catch((err) => {
  console.error('\n  Nie udało się rozebrać:', err.message, '\n');
  process.exit(1);
});
