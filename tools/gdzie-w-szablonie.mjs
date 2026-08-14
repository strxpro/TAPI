/**
 * Pokazuje, w jakich warunkach `sc-if` / `sc-for` siedzi dana linia szablonu.
 *
 *   node tools/gdzie-w-szablonie.mjs 4717
 *   node tools/gdzie-w-szablonie.mjs storyOpen
 *
 * Po co: `template.html` ma prawie pięć tysięcy linii i zagnieżdżenia bywają
 * mylące. Pełnoekranowe okno znajomych leży wewnątrz ekranu mapy, więc miejsce,
 * które wygląda na wierzch dokumentu, wcale nim nie jest. Wstawiony tam blok
 * pokazuje się tylko na jednej zakładce i nie widać, dlaczego.
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const L = readFileSync(resolve(here, '..', 'src', 'app', 'template.html'), 'utf8').split('\n');

const arg = process.argv[2];
if (!arg) {
  console.error('Podaj numer linii albo fragment tekstu do znalezienia.');
  process.exit(1);
}

const cel = /^\d+$/.test(arg)
  ? Number(arg) - 1
  : L.findIndex((l) => l.includes(arg));

if (cel < 0) {
  console.error(`Nie znalazłem "${arg}" w szablonie.`);
  process.exit(1);
}

const stos = [];
for (let i = 0; i <= cel; i++) {
  const otw = [...L[i].matchAll(/<sc-(if|for)\b[^>]*?(?:value|list)="\{\{\s*([^}]+?)\s*\}\}"/g)];
  for (const m of otw) stos.push({ typ: m[1], warunek: m[2], linia: i + 1 });
  // Znaczniki bez wyrażenia też trzeba policzyć, żeby stos się zgadzał.
  const otwWszystkie = (L[i].match(/<sc-(if|for)\b/g) || []).length;
  for (let k = otw.length; k < otwWszystkie; k++) stos.push({ typ: '?', warunek: '(bez wyrażenia)', linia: i + 1 });
  const zam = (L[i].match(/<\/sc-(if|for)>/g) || []).length;
  for (let k = 0; k < zam; k++) stos.pop();
}

console.log(`\nLinia ${cel + 1}: ${L[cel].trim().slice(0, 76)}\n`);
if (!stos.length) {
  console.log('  Nic jej nie warunkuje — to wierzch dokumentu.\n');
} else {
  console.log('  Rysuje się tylko, gdy wszystkie poniższe są prawdziwe:\n');
  stos.forEach((s, i) => {
    console.log(`  ${'  '.repeat(i)}└─ ${s.warunek}   (${s.typ}, linia ${s.linia})`);
  });
  console.log('');
}
