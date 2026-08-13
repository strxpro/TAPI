/**
 * Przenosi wizytówki z `src/app/mock-data.js` do bazy.
 *
 *   node tools/seed-from-mock.mjs > seed.sql
 *
 * Godziny, nagroda, karta i opinie były dotąd wyłącznie w pliku z danymi
 * testowymi. Dopóki tam siedzą, `db.venues` nie ma jak zwrócić pełnego lokalu
 * i `MOCK` nie da się usunąć. Skrypt czyta ten sam plik, którego używa
 * aplikacja, więc nie ma mowy o rozjechaniu się treści przy przepisywaniu.
 *
 * Krotki z prototypu zamieniamy na obiekty z nazwanymi polami — panel firmowy
 * będzie to edytował, a `['Marta K.', 5, '...']` nie jest czymś, co da się
 * sensownie pokazać w formularzu.
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(resolve(here, '..', 'src', 'app', 'mock-data.js'), 'utf8');

const window = {};
new Function('window', src)(window);
const { venues } = window.MOCK;

/** Apostrof w SQL podwajamy — inaczej „Schindler's" urwie napis. */
const q = (v) => (v == null ? 'null' : `'${String(v).split("'").join("''")}'`);
const json = (v) => (v == null ? 'null' : `${q(JSON.stringify(v))}::jsonb`);

const out = [];
out.push('-- Wygenerowane przez tools/seed-from-mock.mjs — nie edytuj ręcznie.\n');

for (const v of venues) {
  const hours = (v.hours ?? []).map(([day, open]) => ({ day, hours: open }));
  const menu = (v.menu ?? []).map(([name, note, price]) => ({ name, note, price }));
  const opinions = (v.opinions ?? []).map(([author, stars, text]) => ({ author, stars, text }));

  out.push(
    `update public.venues set`,
    `  hours = ${json(hours)},`,
    `  reward = ${q(v.reward)},`,
    `  reward_code = ${q(v.code)},`,
    `  menu = ${json(menu)},`,
    `  opinions = ${json(opinions)}`,
    `where id = ${q(v.id)};`,
    '',
  );
}

// Relacje z prototypu jako prawdziwe wiersze — inaczej odtwarzacz z punktu 2
// nie miałby czego pokazać. Druga wartość w krotce to podpis czasu ('czw
// 23:30', 'live'), a nie data, więc idzie do treści, nie do `published_at`.
out.push('delete from public.stories where created_by is null;');
for (const v of venues) {
  for (const [title, when] of v.stories ?? []) {
    out.push(
      `insert into public.stories (venue_id, kind, title, body, expires_at)`,
      `  values (${q(v.id)}, 'offer', ${q(title)}, ${q(when)}, now() + interval '30 days');`,
    );
  }
}

process.stdout.write(out.join('\n') + '\n');
