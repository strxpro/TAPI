/**
 * Składa prototyp z Claude Design w plik gotowy do pokazania w aplikacji.
 *
 *   npm run proto      — jednorazowo
 *   npm run design     — i pilnuje zmian w tle
 *
 * Obsługuje dwa rodzaje eksportu:
 *
 *  1. „standalone" (np. TAPI-standalone.html) — wszystko już w środku,
 *     dokładamy tylko meta viewport, style i skrypt zdejmujący atrapę telefonu.
 *
 *  2. handoff (Bywalec.dc.html + support.js) — runtime leży obok, więc
 *     najpierw wklejamy go do dokumentu.
 *
 * Wynik zawsze ten sam: assets/prototype.html — jeden samowystarczalny plik.
 */

import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..', '..');
const OUT = resolve(here, '..', 'assets', 'prototype.html');

/** Kolejność ma znaczenie: nowszy eksport wygrywa ze starym handoffem. */
const SOURCES = [
  { kind: 'standalone', file: join(ROOT, 'TAPI-standalone.html') },
  { kind: 'handoff', file: join(ROOT, 'design_handoff_tapi', 'Bywalec.dc.html') },
];

const RUNTIME = join(ROOT, 'design_handoff_tapi', 'support.js');

/* ─────────────────────────────────────────────────────────── nadpisania ── */

/** Bez tego WebView renderuje stronę w szerokości pulpitu i wszystko jest mikroskopijne. */
const VIEWPORT =
  '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">';

/**
 * Uwaga na przyszłość: eksport „standalone" **przebudowuje cały dokument**
 * po starcie. Wszystko, co dopiszemy do pliku poza początkiem <head>, zostaje
 * skasowane — sprawdzone. Dlatego style i zdejmowanie atrapy telefonu robi
 * aplikacja, wstrzykując je do widoku (patrz src/screens/Prototype.tsx),
 * a nie ten skrypt. Tu zostaje tylko meta viewport, bo ten przeżywa.
 */

/* ──────────────────────────────────────────────────────────── składanie ── */

async function pickSource() {
  for (const s of SOURCES) {
    const info = await stat(s.file).catch(() => null);
    if (info?.isFile()) return { ...s, mtime: info.mtime };
  }
  throw new Error(
    'Nie znalazłem żadnego prototypu. Oczekuję TAPI-standalone.html w Downloads\\TAPI2 ' +
      'albo design_handoff_tapi\\Bywalec.dc.html',
  );
}

async function main() {
  const source = await pickSource();
  let out = await readFile(source.file, 'utf8');

  if (source.kind === 'handoff') {
    // Runtime leży obok — wklejamy go, żeby plik był samowystarczalny.
    const rTag = '<script src="./react.min.js"></script>';
    const rdTag = '<script src="./react-dom.min.js"></script>';
    const tag = '<script src="./support.js"></script>';

    const reactJs = await readFile(join(ROOT, 'design_handoff_tapi', 'react.min.js'), 'utf8');
    const domJs = await readFile(join(ROOT, 'design_handoff_tapi', 'react-dom.min.js'), 'utf8');
    const runtime = await readFile(RUNTIME, 'utf8');

    if (out.includes(rTag)) out = out.replace(rTag, `<script>\n${reactJs}\n</script>`);
    if (out.includes(rdTag)) out = out.replace(rdTag, `<script>\n${domJs}\n</script>`);
    if (out.includes(tag)) out = out.replace(tag, `<script>\n${runtime}\n</script>`);
  }

  // Meta viewport — tylko jeśli eksport jej nie ma.
  if (!/name=["']viewport["']/.test(out)) {
    out = out.replace(/<head([^>]*)>/i, `<head$1>\n  ${VIEWPORT}`);
  }

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, out, 'utf8');

  const mb = (Buffer.byteLength(out, 'utf8') / 1024 / 1024).toFixed(2);
  const time = new Date().toLocaleTimeString('pl-PL');
  const name = source.file.split(/[\\/]/).pop();
  console.log(`  [${time}] Złożono z ${name} — assets/prototype.html (${mb} MB)`);
}

/* ─────────────────────────────────────────────────────────── obserwacja ── */

async function startWatching() {
  const source = await pickSource();
  const files = source.kind === 'handoff' ? [source.file, RUNTIME] : [source.file];
  let timer = null;

  console.log('\n  Obserwuję prototyp. Podmień plik z Claude Design, a złożę go sam.');
  console.log('  Zatrzymanie: Ctrl+C\n');

  for (const file of files) {
    watch(file, () => {
      // Edytory zapisują plik kilka razy pod rząd — czekamy, aż ucichnie.
      clearTimeout(timer);
      timer = setTimeout(() => {
        main().catch((err) => console.error('  Błąd:', err.message));
      }, 300);
    });
  }
}

main()
  .then(() => {
    if (process.argv.includes('--watch')) return startWatching();
    console.log('  Atrapa telefonu zdejmowana przy starcie aplikacji.\n');
  })
  .catch((err) => {
    console.error('\n  Nie udało się złożyć prototypu:', err.message, '\n');
    process.exit(1);
  });
