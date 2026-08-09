/**
 * Bezpieczne zmiany w TAPI-standalone.html.
 *
 *   node tools/edit-design.mjs
 *
 * Plik jest eksportem spakowanym — znaczniki siedzą w ciągu znaków z zapisem
 * \" zamiast cudzysłowów. Dlatego zmiany robimy przez dokładne dopasowania,
 * a każda z nich musi trafić w oczekiwaną liczbę miejsc. Jeśli liczba się nie
 * zgadza, skrypt przerywa i nie zapisuje niczego — lepiej nic nie zmienić niż
 * uszkodzić projekt.
 *
 * Kopia zapasowa powstaje przed każdym zapisem w ..\kopie\.
 */

import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..', '..');
const FILE = join(ROOT, 'TAPI-standalone.html');
const BACKUPS = join(ROOT, 'kopie');

/** Lista zmian. Każda musi trafić dokładnie tyle razy, ile deklaruje `count`. */
const EDITS = [
  {
    name: 'Pasek dolny: ikona zakładki zamiast wyrażenia regularnego',
    why:
      'W eksporcie w miejscu ikony czwartej zakładki siedzi literał wzorca ' +
      '`<sc-if value="\\{\\{ n\\.isTrip \\}\\}">.*?</sc-if>`, czyli ślad po ' +
      'podmianie, która trafiła do pliku projektu zamiast go zmienić. ' +
      'W aplikacji renderuje się w pasku surowy tekst zamiast ikony. ' +
      'Wstawiamy ikonę rowerzysty z linii 4013 starszego prototypu.',
    // Uwaga: szablon siedzi w pliku zakodowany jako JSON, więc dopasowujemy
    // postać ze znakami ucieczki (`\u003c` zamiast `<`, podwojone `\\`).
    from:
      '\\u003csc-if value=\\"\\\\{\\\\{ n\\\\.isTrip \\\\}\\\\}\\"\\u003e.*?\\u003c\\\\/sc-if\\u003e',
    to:
      '\\u003csc-if value=\\"{{ n.isTrip }}\\"\\u003e' +
      '\\u003csvg width=\\"19\\" height=\\"19\\" sc-camel-view-box=\\"0 0 24 24\\" fill=\\"none\\" ' +
      'stroke=\\"currentColor\\" stroke-width=\\"1.8\\"\\u003e' +
      '\\u003cpath d=\\"M5 18c0-2.6 3-2.6 3-5.2S5 10.2 5 7.6\\" stroke-linecap=\\"round\\"\\u003e\\u003c/path\\u003e' +
      '\\u003ccircle cx=\\"5\\" cy=\\"19.4\\" r=\\"1.7\\"\\u003e\\u003c/circle\\u003e' +
      '\\u003cpath d=\\"M13.5 6.6h4.2a2.3 2.3 0 010 4.6H13a2.3 2.3 0 000 4.6h5\\" stroke-linecap=\\"round\\"\\u003e\\u003c/path\\u003e' +
      '\\u003ccircle cx=\\"12.6\\" cy=\\"5.4\\" r=\\"1.5\\"\\u003e\\u003c/circle\\u003e' +
      '\\u003c/svg\\u003e\\u003c/sc-if\\u003e',
    count: 1,
    // Bez `done` — sama ikona rowerzysty występuje w pliku także na ekranie
    // Wyjazdu, więc jako znacznik dawałaby fałszywe „już naniesione".
    // Wystarczy warunek domyślny: brak dopasowań i obecny pełny wynik.
  },
  {
    name: 'Planer wyjazdu: treść kroków wyśrodkowana',
    why:
      'Kroki miały padding-right: 74px, co zwężało kolumnę tekstu i dawało ' +
      'wrażenie zepchnięcia w lewo. Pasek postępu nad nimi jest pełnej ' +
      'szerokości, więc tytuł wyglądał na przesunięty.',
    from: 'padding: 22px 20px 0; padding-right: 74px;',
    to: 'padding: 22px 20px 0;',
    count: 3,
  },
  {
    name: 'Planer wyjazdu: wyraźniejszy pasek kroków',
    why: 'Pasek 5 px ginął na tle. Grubszy i z zaokrągleniem czyta się od razu.',
    from: 'height: 5px; border-radius: 99px; flex: {{ p.flex }};',
    to: 'height: 6px; border-radius: 99px; flex: {{ p.flex }};',
    count: 1,
  },
  {
    name: 'Firma: logowanie i rejestracja — brakujące wyliczenia',
    done: 'loginBizDirect:',
    why:
      'Znaczniki wołały isBizLoginActive, isBizRegisterActive, setBizLoginTab ' +
      'i siedem innych wartości, których logika nie wyliczała. Oba warunki były ' +
      'zawsze fałszywe, więc ani zakładka logowania, ani rejestracji nigdy się ' +
      'nie renderowała — stąd „nic mi się nie pokazuje". Stan sterujący ' +
      '(bizLoginTab) już istniał, brakowało tylko przełożenia go na widok.',
    from: "openHelp: () =\\u003e this.setState({ helpOpen: true }),\\n      ",
    to:
      "openHelp: () =\\u003e this.setState({ helpOpen: true }),\\n      " +
      // przełączanie zakładek
      "setBizLoginTab: () =\\u003e this.setState({ bizLoginTab: 'login' }),\\n      " +
      "setBizRegisterTab: () =\\u003e this.setState({ bizLoginTab: 'register' }),\\n      " +
      // które z dwóch ma być widoczne
      "isBizLoginActive: st.bizLoginTab !== 'register',\\n      " +
      "isBizRegisterActive: st.bizLoginTab === 'register',\\n      " +
      // wygląd pigułek: aktywna na akcencie, druga przezroczysta
      "bizLoginTabBg: st.bizLoginTab !== 'register' ? 'var(--acc, #1F5A46)' : 'transparent',\\n      " +
      "bizLoginTabFg: st.bizLoginTab !== 'register' ? '#FBFAF7' : 'var(--sub, #6C6F75)',\\n      " +
      "bizRegisterTabBg: st.bizLoginTab === 'register' ? 'var(--acc, #1F5A46)' : 'transparent',\\n      " +
      "bizRegisterTabFg: st.bizLoginTab === 'register' ? '#FBFAF7' : 'var(--sub, #6C6F75)',\\n      " +
      // podpisy — trzy języki, zgodnie z zasadą z CLAUDE.md
      "tBizLoginTab: this.l3('Zaloguj się', 'Sign in', 'Accedi'),\\n      " +
      "tBizRegisterTab: this.l3('Zarejestruj lokal', 'Register venue', 'Registra locale'),\\n      " +
      // zatwierdzenie logowania prowadzi wprost do panelu lokalu
      "loginBizDirect: () =\\u003e this.setState({ phase: 'biz', biz: 'panel', bizAccount: true }),\\n      ",
    count: 1,
  },
  {
    name: 'Znajomi: zakładki i zaproszenia — brakujące wyliczenia',
    done: 'openFriendsHub:',
    why:
      'Trzy zakładki (Ranking, W pobliżu, Zaproś) miały w znacznikach ' +
      'odwołania do wartości, których nikt nie wyliczał — nie dało się ' +
      'przełączać ani zobaczyć żadnej z nich. Podpisy są wpisane wprost ' +
      'w znacznikach, więc dokładam tylko sterowanie i kolory.',
    from: "loginBizDirect: () =\\u003e this.setState({ phase: 'biz', biz: 'panel', bizAccount: true }),\\n      ",
    to:
      "loginBizDirect: () =\\u003e this.setState({ phase: 'biz', biz: 'panel', bizAccount: true }),\\n      " +
      // wejście do sekcji znajomych
      "openFriendsHub: () =\\u003e this.setState({ friendsOpen: true }),\\n      " +
      // przełączanie zakładek
      "setFriendsTabRanking: () =\\u003e this.setState({ friendsTab: 'ranking' }),\\n      " +
      "setFriendsTabNear: () =\\u003e this.setState({ friendsTab: 'near' }),\\n      " +
      "setFriendsTabInvite: () =\\u003e this.setState({ friendsTab: 'invite' }),\\n      " +
      // która zakładka jest widoczna
      "friendsIsRanking: st.friendsTab === 'ranking',\\n      " +
      "friendsIsNear: st.friendsTab === 'near',\\n      " +
      "friendsIsInvite: st.friendsTab === 'invite',\\n      " +
      // wygląd pigułek — ten sam wzorzec co przy zakładkach firmy
      "friendsTabRankingBg: st.friendsTab === 'ranking' ? 'var(--acc, #1F5A46)' : 'transparent',\\n      " +
      "friendsTabRankingFg: st.friendsTab === 'ranking' ? '#FBFAF7' : 'var(--sub, #6C6F75)',\\n      " +
      "friendsTabNearBg: st.friendsTab === 'near' ? 'var(--acc, #1F5A46)' : 'transparent',\\n      " +
      "friendsTabNearFg: st.friendsTab === 'near' ? '#FBFAF7' : 'var(--sub, #6C6F75)',\\n      " +
      "friendsTabInviteBg: st.friendsTab === 'invite' ? 'var(--acc, #1F5A46)' : 'transparent',\\n      " +
      "friendsTabInviteFg: st.friendsTab === 'invite' ? '#FBFAF7' : 'var(--sub, #6C6F75)',\\n      " +
      // kopiowanie kodu zaproszenia — przycisk potwierdza, że zadziałało
      "copyGroupInvite: () =\\u003e this.setState({ inviteCopied: true }),\\n      " +
      "copyInviteLabel: st.inviteCopied ? this.l3('Skopiowano', 'Copied', 'Copiato') : this.l3('Kopiuj kod', 'Copy code', 'Copia codice'),\\n      " +
      // otwarcie zaproszenia dla konkretnego lokalu
      "openGroupInviteVenue: (v) =\\u003e this.setState({ groupInviteOpen: true, inviteVenue: v \\u0026\\u0026 v.name ? v.name : st.inviteVenue }),\\n      ",
    count: 1,
  },
  {
    name: 'Zapisane i obserwowane: zakładki, licznik, przycisk zapisu',
    done: 'savedListCount:',
    why:
      'Trzy zakładki (Zapisane, Obserwowane, Kolekcje) nie miały sterowania, ' +
      'licznik przy „Zapisane" był pusty, a przycisk zapisu na wizytówce nie ' +
      'wiedział, czy lokal jest już zapisany — stąd wrażenie duplikatów ' +
      'i nieodświeżających się stanów.',
    from: "openGroupInviteVenue: (v) =\\u003e this.setState({ groupInviteOpen: true, inviteVenue: v \\u0026\\u0026 v.name ? v.name : st.inviteVenue }),\\n      ",
    to:
      "openGroupInviteVenue: (v) =\\u003e this.setState({ groupInviteOpen: true, inviteVenue: v \\u0026\\u0026 v.name ? v.name : st.inviteVenue }),\\n      " +
      // przełączanie zakładek
      "setSavedTabSaved: () =\\u003e this.setState({ savedTab: 'saved' }),\\n      " +
      "setSavedTabFollowed: () =\\u003e this.setState({ savedTab: 'followed' }),\\n      " +
      "setSavedTabCols: () =\\u003e this.setState({ savedTab: 'cols' }),\\n      " +
      // która zakładka jest widoczna
      "savedIsFollowed: st.savedTab === 'followed',\\n      " +
      // licznik przy podpisie „Zapisane"
      "savedListCount: (st.savedIds || []).length,\\n      " +
      // wygląd pigułek — ten sam wzorzec co wyżej
      "tabSavedBg: st.savedTab === 'saved' ? 'var(--acc, #1F5A46)' : 'transparent',\\n      " +
      "tabSavedFg: st.savedTab === 'saved' ? '#FBFAF7' : 'var(--sub, #6C6F75)',\\n      " +
      "tabFollowedBg: st.savedTab === 'followed' ? 'var(--acc, #1F5A46)' : 'transparent',\\n      " +
      "tabFollowedFg: st.savedTab === 'followed' ? '#FBFAF7' : 'var(--sub, #6C6F75)',\\n      " +
      "tabColsBg: st.savedTab === 'cols' ? 'var(--acc, #1F5A46)' : 'transparent',\\n      " +
      "tabColsFg: st.savedTab === 'cols' ? '#FBFAF7' : 'var(--sub, #6C6F75)',\\n      " +
      // przycisk zapisu na wizytówce — zna stan otwartego lokalu
      "vSavedBg: (st.savedIds || []).indexOf(st.pin) \\u003e -1 ? 'var(--acc, #1F5A46)' : 'var(--surf, #FFF)',\\n      " +
      "vSavedFg: (st.savedIds || []).indexOf(st.pin) \\u003e -1 ? '#FBFAF7' : 'var(--ink, #16181C)',\\n      " +
      "vSavedLabel: (st.savedIds || []).indexOf(st.pin) \\u003e -1 ? this.l3('Zapisane', 'Saved', 'Salvato') : this.l3('Zapisz', 'Save', 'Salva'),\\n      " +
      "followText: this.l3('Obserwuj', 'Follow', 'Segui'),\\n      ",
    count: 1,
  },
  {
    name: 'Ostatnie dwa: pigułki filtrów i powrót z mapy',
    done: 'closeMapToDiscover:',
    why:
      'Pigułki filtrów nad listą nie reagowały na dotknięcie, a z mapy nie ' +
      'było jak wrócić do Odkrywaj. Filtry otwierają istniejący arkusz ' +
      'sortowania (sortOpen), powrót przełącza zakładkę.',
    from: "followText: this.l3('Obserwuj', 'Follow', 'Segui'),\\n      ",
    to:
      "followText: this.l3('Obserwuj', 'Follow', 'Segui'),\\n      " +
      "filterHighlights: () =\\u003e this.setState({ sortOpen: true }),\\n      " +
      "closeMapToDiscover: () =\\u003e this.setState({ tab: 'discover' }),\\n      ",
    count: 1,
  },
];

async function main() {
  const before = await readFile(FILE, 'utf8');
  let out = before;
  const applied = [];

  for (const edit of EDITS) {
    const hits = out.split(edit.from).length - 1;

    // Rozpoznanie zmiany już naniesionej.
    //
    // Sam brak dopasowań nie wystarcza: przy dopisywaniu wartości wzorzec
    // wejściowy jest początkiem własnego wyniku, więc po zapisie nadal się
    // znajduje i edycja poszłaby drugi raz. Dlatego edycje dopisujące podają
    // `done` — nazwę, która pojawia się w pliku dopiero po ich naniesieniu.
    const alreadyDone = edit.done ? out.includes(edit.done) : hits === 0 && out.includes(edit.to);

    if (alreadyDone) {
      applied.push(`  · ${edit.name} — już naniesione`);
      continue;
    }

    if (hits !== edit.count) {
      throw new Error(
        `„${edit.name}" — oczekiwałem ${edit.count} dopasowań, znalazłem ${hits}. ` +
          'Nic nie zapisuję. Prawdopodobnie zmienił się eksport.',
      );
    }

    out = out.split(edit.from).join(edit.to);
    applied.push(`  ✓ ${edit.name} (${hits}×)`);
  }

  if (out === before) {
    console.log('\n  Nic do zmiany — plik jest już aktualny.\n');
    return;
  }

  await mkdir(BACKUPS, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 16);
  await copyFile(FILE, join(BACKUPS, `TAPI-standalone.${stamp}.html`));

  await writeFile(FILE, out, 'utf8');

  console.log('\n  Zmiany naniesione:\n');
  console.log(applied.join('\n'));
  console.log(`\n  Kopia zapasowa: kopie/TAPI-standalone.${stamp}.html`);
  console.log('  Teraz: npm run proto\n');
}

main().catch((err) => {
  console.error('\n  Przerwane:', err.message, '\n');
  process.exit(1);
});
