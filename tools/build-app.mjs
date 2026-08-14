/**
 * Składa aplikację z plików źródłowych w `src/app` do jednego dokumentu.
 *
 *   npm run app        — raz
 *   npm run app:watch  — i pilnuje zmian
 *
 * To odwrotność `unpack-design.mjs`. Edytujesz normalne pliki:
 *
 *   src/app/template.html   znaczniki
 *   src/app/logic.js        zachowanie
 *   src/app/styles.css      wygląd
 *
 * a tutaj powstaje `assets/app.html` — jeden samowystarczalny dokument,
 * który ładuje widok w aplikacji. Czcionki i biblioteki wchodzą do środka,
 * żeby nic nie zależało od dostępu do plików ani od sieci.
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { watch } from 'node:fs';
import { dirname, join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const APP = resolve(here, '..', 'src', 'app');
const OUT = resolve(here, '..', 'assets', 'app.html');

/** Kolejność ma znaczenie: React musi być przed runtime'em, który go używa. */
const VENDOR_ORDER = ['react.js', 'react-dom.js', 'dc-runtime.js'];

async function vendorFiles() {
  const all = (await readdir(join(APP, 'vendor'))).filter((f) => extname(f) === '.js');
  const rest = all.filter((f) => !VENDOR_ORDER.includes(f)).sort();
  return [...VENDOR_ORDER.filter((f) => all.includes(f)), ...rest];
}

/**
 * Czcionki wchodzą do arkusza jako dane, nie jako pliki.
 *
 * Widok w aplikacji dostaje dokument wprost, bez katalogu obok, więc
 * odwołanie do `fonts/…woff2` nie miałoby czego znaleźć.
 */
async function inlineFonts(css) {
  const dir = join(APP, 'fonts');
  const files = await readdir(dir).catch(() => []);
  let out = css;
  for (const file of files) {
    const data = await readFile(join(dir, file));
    out = out.split(`fonts/${file}`).join(`data:font/woff2;base64,${data.toString('base64')}`);
  }
  return out;
}

async function build() {
  const [shell, template, logic, rawCss, props] = await Promise.all([
    readFile(join(APP, 'index.html'), 'utf8'),
    readFile(join(APP, 'template.html'), 'utf8'),
    readFile(join(APP, 'logic.js'), 'utf8'),
    readFile(join(APP, 'styles.css'), 'utf8'),
    readFile(join(APP, 'props.json'), 'utf8').catch(() => '{}'),
  ]);

  const css = await inlineFonts(rawCss);

  let scripts = '';
  for (const file of await vendorFiles()) {
    let code = await readFile(join(APP, 'vendor', file), 'utf8');
    // HTML parser recognises <script and </script> inside a <script> block
    // even when they're inside JS strings. Standard inline-script fix:
    // replace the literal '<' before 'script' with the hex escape '\x3c'
    // which is semantically identical in JavaScript but invisible to the
    // HTML parser.
    code = code.replace(/<(\/?)script/gi, '\\x3c$1script');
    scripts += `<script>\n${code}\n</script>\n`;
  }

  // Dane testowe muszą być gotowe, zanim powstanie klasa — pola sięgają po nie
  // przy tworzeniu obiektu, więc kolejność nie jest tu kwestią gustu.
  const mock = await readFile(join(APP, 'mock-data.js'), 'utf8').catch(() => null);
  if (mock) scripts += `<script>\n${mock}\n</script>\n`;

  // Ustawienia edytora wracają jako atrybut, w postaci, której oczekuje runtime.
  const attr = JSON.stringify(JSON.parse(props)).replace(/"/g, '&quot;');

  const doc = shell
    // Biblioteki wchodzą do środka zamiast odwołania do pliku.
    .replace(/<script src="vendor\/dc-runtime\.js"><\/script>/, () => scripts.trim())
    .replace('<!-- TEMPLATE -->', () => template)
    .replace(
      '<!-- LOGIC -->',
      () => `<script type="text/x-dc" data-dc-script="" data-props="${attr}">\n${logic}\n</script>`,
    );

  /**
   * Arkusz wchodzi na końcu, w miejsce `<!-- STYLES -->` w `<helmet>` szablonu.
   *
   * Kolejność jest tu całym sednem. Wcześniej podstawienie stylów biegło
   * w tym samym łańcuchu **przed** wstawieniem szablonu — a znacznik siedzi
   * właśnie w szablonie, więc nie było czego zamienić. Dalej stał warunek
   * „czy dokument ma jakikolwiek <style>"; szablon ma własny, czterowierszowy
   * blok, więc warunek wychodził prawdziwy i **cały arkusz po cichu wypadał**.
   *
   * Aplikacja wyglądała przez to prawie dobrze — style leżą w atrybutach —
   * ale arkusz niesie czcionki i wszystkie `@keyframes`. Żadna animacja
   * w aplikacji nie działała, łącznie z rysowaniem logo na ekranie startowym,
   * a napisy szły krojem systemowym zamiast Archivo i Plus Jakarta Sans.
   *
   * Bez cichej ścieżki zapasowej: lepiej, żeby budowanie stanęło z komunikatem,
   * niż żeby znów „poradziło sobie" i nikt tego nie zauważył.
   */
  if (!doc.includes('<!-- STYLES -->')) {
    throw new Error('brak znacznika <!-- STYLES --> w <helmet> szablonu — nie ma gdzie wstawić arkusza.');
  }
  const withCss = doc.replace('<!-- STYLES -->', () => `<style>\n${css}\n</style>`);

  // Sprawdzenie zamiast zaufania — bez niego ta sama pomyłka wróci niezauważona.
  const brakuje = ['@font-face', '@keyframes rise', '@keyframes dashIn'].filter(
    (s) => !withCss.includes(s),
  );
  if (brakuje.length) {
    throw new Error(`arkusz trafił niekompletny — brakuje: ${brakuje.join(', ')}.`);
  }

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, withCss, 'utf8');

  const mb = (Buffer.byteLength(withCss, 'utf8') / 1024 / 1024).toFixed(2);
  console.log(`  [${new Date().toLocaleTimeString('pl-PL')}] Złożono assets/app.html (${mb} MB)`);
}

async function startWatching() {
  console.log('\n  Pilnuję src/app. Zapisz plik, a złożę go sam.');
  console.log('  Zatrzymanie: Ctrl+C\n');
  let timer = null;
  for (const file of ['template.html', 'logic.js', 'styles.css', 'index.html']) {
    watch(join(APP, file), () => {
      clearTimeout(timer);
      timer = setTimeout(() => build().catch((e) => console.error('  Błąd:', e.message)), 250);
    });
  }
}

build()
  .then(() => (process.argv.includes('--watch') ? startWatching() : undefined))
  .catch((err) => {
    console.error('\n  Nie udało się złożyć:', err.message, '\n');
    process.exit(1);
  });
