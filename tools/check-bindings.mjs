/**
 * Szuka zepsutych powiązań w TAPI-standalone.html.
 *
 *   node tools/check-bindings.mjs
 *
 * Znaczniki odwołują się do wartości przez {{ nazwa }}. Jeśli logika takiej
 * wartości nie wylicza, warunek `sc-if` jest zawsze fałszywy i cała sekcja
 * po prostu nie renderuje się — bez żadnego błędu w konsoli. Tak właśnie
 * zniknął ekran logowania firmy.
 *
 * Skrypt zestawia jedno z drugim i wypisuje nazwy bez pokrycia.
 */

import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const FILE = join(resolve(here, '..', '..'), 'TAPI-standalone.html');

const src = await readFile(FILE, 'utf8');

/* Nazwy użyte w znacznikach: {{ nazwa }} lub {{ obiekt.pole }} */
const used = new Map();
for (const m of src.matchAll(/\{\{\s*([A-Za-z_$][\w$]*)(\.[\w$]+)?\s*\}\}/g)) {
  const root = m[1];
  used.set(root, (used.get(root) ?? 0) + 1);
}

/* Nazwy wyliczane w logice: `nazwa:` w obiektach oraz `as="nazwa"` z pętli */
const defined = new Set();
for (const m of src.matchAll(/([A-Za-z_$][\w$]*)\s*:/g)) defined.add(m[1]);
for (const m of src.matchAll(/as=\\?"([A-Za-z_$][\w$]*)\\?"/g)) defined.add(m[1]);
for (const m of src.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)) defined.add(m[1]);

const missing = [...used.entries()]
  .filter(([name]) => !defined.has(name))
  .sort((a, b) => b[1] - a[1]);

console.log(`\n  Powiązań w znacznikach: ${used.size}`);
console.log(`  Nazw wyliczanych:       ${defined.size}\n`);

if (missing.length === 0) {
  console.log('  Wszystkie powiązania mają pokrycie.\n');
} else {
  console.log(`  ⚠ Bez pokrycia (${missing.length}) — te sekcje się nie pokażą:\n`);
  for (const [name, count] of missing) {
    console.log(`    ${name}  ×${count}`);
  }
  console.log('');
}
