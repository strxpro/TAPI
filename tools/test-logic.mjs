/**
 * Sprawdzenie logiki widoku bez przeglądarki.
 *
 *   node tools/test-logic.mjs
 *
 * Uruchamia prawdziwą klasę z `src/app/logic.js` na podstawkach zamiast
 * React-a i przeglądarki. Nie zastępuje sprawdzenia na telefonie — pokrywa
 * to, co da się rozstrzygnąć bez patrzenia: czy klawiatura kodu dochodzi
 * tam, gdzie ma, i czy nie wysyła go dwa razy.
 *
 * Powód powstania: kod logowania obcinał się do czterech znaków, a warunek
 * wysyłki wymagał sześciu. Nie dało się zalogować przez klawiaturę i nic
 * tego nie zgłaszało — po prostu nic się nie działo.
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const czytaj = (p) => readFileSync(resolve(here, '..', 'src', 'app', p), 'utf8');

const win = {};
new Function('window', czytaj('mock-data.js'))(win);

/** Tyle, ile logika naprawdę używa z bazowej klasy runtime'u. */
class DCLogic {
  setState(patch) {
    const next = typeof patch === 'function' ? patch(this.state) : patch;
    this.state = { ...this.state, ...next };
  }
}

const noop = () => {};
const opoznione = [];

const Component = new Function(
  'DCLogic', 'React', 'MOCK', 'window', 'navigator', 'document',
  'setTimeout', 'clearTimeout', 'setInterval',
  `${czytaj('logic.js')}\nreturn Component;`,
)(
  DCLogic,
  { createRef: () => ({ current: null }) },
  win.MOCK,
  { addEventListener: noop, TAPI: null, MOCK: win.MOCK },
  { vibrate: noop, language: 'pl', languages: ['pl'] },
  { getElementById: () => null, addEventListener: noop },
  (fn) => { opoznione.push(fn); return 0; },
  noop,
  () => 0,
);

const c = new Component();
c.buzz = noop;

let wyslano = 0;
c.verify = () => { wyslano++; };

const bledy = [];
const sprawdz = (opis, got, chce) => {
  const ok = JSON.stringify(got) === JSON.stringify(chce);
  console.log(`  ${ok ? 'ok  ' : 'BŁĄD'} ${opis.padEnd(44)} ${JSON.stringify(got)}`);
  if (!ok) bledy.push(`${opis}: było ${JSON.stringify(got)}, miało być ${JSON.stringify(chce)}`);
};

/** Wpisuje ciąg od pustego pola i przepuszcza opóźnione wywołania. */
const wpisz = (cyfry) => {
  c.state = { ...c.state, code: '' };
  wyslano = 0;
  opoznione.length = 0;
  for (const ch of cyfry) c.keyTap(ch);
  opoznione.splice(0).forEach((fn) => fn());
  return { kod: c.state.code, wyslano };
};

const zKodem = (kod, klawisz) => {
  c.state = { ...c.state, code: kod };
  wyslano = 0;
  opoznione.length = 0;
  c.keyTap(klawisz);
  opoznione.splice(0).forEach((fn) => fn());
  return { kod: c.state.code, wyslano };
};

console.log('\nKlawiatura kodu logowania (sześć cyfr, tyle wysyła Supabase):\n');

sprawdz('cztery cyfry — jeszcze nie wysyła', wpisz('1234'), { kod: '1234', wyslano: 0 });
sprawdz('sześć cyfr — wysyła', wpisz('123456'), { kod: '123456', wyslano: 1 });
sprawdz('siódma cyfra nie wysyła drugi raz', wpisz('1234567'), { kod: '123456', wyslano: 1 });
sprawdz('kasowanie skraca kod', zKodem('12345', 'del'), { kod: '1234', wyslano: 0 });
sprawdz('haczyk przy pełnym kodzie wysyła', zKodem('123456', 'ok'), { kod: '123456', wyslano: 1 });
sprawdz('haczyk przy niepełnym nic nie robi', zKodem('1234', 'ok'), { kod: '1234', wyslano: 0 });

console.log(bledy.length ? `\nNie przeszło:\n  ${bledy.join('\n  ')}\n` : '\nWszystko gra.\n');
process.exit(bledy.length ? 1 : 0);
