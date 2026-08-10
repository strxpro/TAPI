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

/**
 * Kod aplikacji siedzi w pliku zakodowany jako JSON, dodatkowo z `<` i `>`
 * zapisanymi jako `\u003c` i `\u003e`. Ta funkcja robi to samo, dzięki czemu
 * poniżej można pisać zwykły JavaScript zamiast ręcznie stawiać ukośniki.
 */
const js = (code) =>
  JSON.stringify(code).slice(1, -1).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

/** Lista zmian. Każda musi trafić dokładnie tyle razy, ile deklaruje `count`. */
const EDITS = [
  {
    name: 'Czucie: usunięcie drugiej definicji `buzz`, która kasowała most',
    why:
      'Klasa definiowała `buzz` dwa razy. Druga definicja — z samym ' +
      '`navigator.vibrate` — nadpisywała pierwszą, tę wysyłającą sygnał do ' +
      'warstwy natywnej, bo w klasach JavaScriptu wygrywa późniejsza metoda. ' +
      'Przez to aplikacja nigdy nie dostawała sygnału i nie było ani wibracji, ' +
      'ani dźwięku. W WebView `navigator.vibrate` i tak nie działa.',
    from: js(`  buzz(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (err) {} }\n`),
    to: '',
    count: 1,
  },
  {
    name: 'Firma: od razu rejestracja, bez przełącznika zakładek',
    why:
      'Ekran otwierał się na „Zaloguj się", a wejście dla nowego lokalu było ' +
      'schowane w drugiej zakładce. Teraz otwiera się od razu rejestracja, ' +
      'a logowanie e-mailem jest dostępne z panelu głównego.',
    from: js(`    bizLoginTab: 'login',`),
    to: js(`    bizLoginTab: 'register',`),
    count: 1,
  },
  {
    name: 'Firma: ukrycie przełącznika zakładek',
    why:
      'Sam przełącznik przestaje mieć sens, gdy jest jedna droga. Zostaje ' +
      'w kodzie, ale się nie pokazuje — gdyby wrócił, wystarczy zdjąć warunek.',
    from: js(`        <!-- Przełącznik Zakładek: Zaloguj się jako firma | Zarejestruj lokal -->
        <div style="padding: 6px 16px 14px;">`),
    to: js(`        <!-- Przełącznik Zakładek: ukryty — wejście prowadzi wprost do rejestracji -->
        <div style="display: none; padding: 6px 16px 14px;">`),
    count: 1,
  },
  {
    name: 'Firma: awatar znika przy rejestracji lokalu',
    why:
      'Pływający awatar gościa wchodził w ekran zakładania konta firmowego — ' +
      'nie ma tam czego pokazywać, bo konta jeszcze nie ma.',
    from: js(`      showAvatar: (st.phase === 'app' || st.phase === 'biz') && st.tab !== 'scan' && !anyOverlay,`),
    to: js(`      showAvatar: st.phase === 'app' && st.tab !== 'scan' && !anyOverlay && !st.isBizLogin,`),
    count: 1,
  },
  {
    name: 'Firma: nazwa lokalu pisana krojem firmowym',
    why:
      'Pole „znajdź swoją firmę" brało krój zastępczy przeglądarki, przez co ' +
      'odstawało od reszty. Dostaje Plus Jakarta Sans i wagę 500, tak jak ' +
      'pozostałe pola w projekcie.',
    from: js(
      `<input type="text" ref="{{ bizRef }}" sc-camel-on-input="{{ onBizQuery }}" placeholder="{{ regPh }}" style="flex: 1; min-width: 0; background: transparent; border: 0; outline: none; font-size: 15px; color: var(--ink, #16181C);">`,
    ),
    to: js(
      `<input type="text" ref="{{ bizRef }}" sc-camel-on-input="{{ onBizQuery }}" placeholder="{{ regPh }}" style="flex: 1; min-width: 0; background: transparent; border: 0; outline: none; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; font-size: 15px; font-weight: 500; letter-spacing: -0.01em; color: var(--ink, #16181C);">`,
    ),
    count: 1,
  },
  {
    name: 'Logowanie: sześć pól na kod zamiast czterech',
    why:
      'README opisuje „kod 6-cyfrowy (6 osobnych pól)", a logika prototypu ' +
      'przyjmowała cztery — to logika odstawała od specyfikacji. Poza tym ' +
      'Supabase wysyła kod sześciocyfrowy i krótszego nie da się ustawić.',
    from: js(`      codeCells: [0, 1, 2, 3].map((i) => ({ ch: st.code[i] || '', border: st.code.length === i ? at : th.hair })),`),
    to: js(`      codeCells: [0, 1, 2, 3, 4, 5].map((i) => ({ ch: st.code[i] || '', border: st.code.length === i ? at : th.hair })),`),
    count: 1,
  },
  {
    name: 'Logowanie: klawiatura kodu liczy do sześciu',
    why: 'Ta sama zmiana co wyżej, po stronie wpisywania.',
    from: js(`    if (ch === 'ok') { if (this.state.code.length === 4) this.verify(); return; }`),
    to: js(`    if (ch === 'ok') { if (this.state.code.length === 6) this.verify(); return; }`),
    count: 1,
  },
  {
    name: 'Logowanie: sprawdzenie kodu po szóstej cyfrze',
    why: 'Bez tego kod nigdy nie odpalałby sprawdzenia.',
    from: js(`    if (code.length === 4) setTimeout(() => this.verify(), 240);`),
    to: js(`    if (code.length === 6) setTimeout(() => this.verify(), 240);`),
    count: 1,
  },
  {
    name: 'Logowanie: kod naprawdę wychodzi na e-mail',
    why:
      'Prototyp tylko przechodził do następnego kroku. Teraz prosi most ' +
      'o wysłanie kodu przez Supabase. Poza aplikacją zachowuje się jak dawniej, ' +
      'żeby prototyp dało się dalej oglądać w przeglądarce.',
    from: js(
      `      sendCode: () => { const m = (this.emailRef.current && this.emailRef.current.value) || 'ty@tapi.app'; this.setState({ mailAddr: m, mailStep: 'code', code: '' }); },`,
    ),
    to: js(
      `      sendCode: () => { const m = (this.emailRef.current && this.emailRef.current.value) || 'ty@tapi.app';
        this.setState({ mailAddr: m, mailStep: 'code', code: '' });
        if (window.TAPI && window.TAPI.native) {
          window.TAPI.call('auth.sendCode', { email: m, business: this.state.isBizLogin === true })
            .then((r) => { if (r && r.error) this.toast(r.error); })
            .catch((e) => this.toast(String(e.message || e)));
        } },`,
    ),
    count: 1,
  },
  {
    name: 'Logowanie: kod sprawdzany naprawdę',
    why:
      'Zamiast udawanego czekania 1150 ms idzie prawdziwe sprawdzenie kodu. ' +
      'Imię bierzemy z konta, a nie z wpisanego na sztywno „Klara Ziarno".',
    from: js(`  verify() {
    this.setState({ mailStep: 'wait' });
    clearTimeout(this.authT);
    this.authT = setTimeout(() => this.finishLogin('Klara Ziarno'), 1150);
  }`),
    to: js(`  verify() {
    this.setState({ mailStep: 'wait' });
    clearTimeout(this.authT);
    if (!window.TAPI || !window.TAPI.native) {
      this.authT = setTimeout(() => this.finishLogin('Klara Ziarno'), 1150);
      return;
    }
    window.TAPI.call('auth.verifyCode', {
      email: this.state.mailAddr, code: this.state.code,
      business: this.state.isBizLogin === true
    }).then((r) => {
      if (r && r.error) { this.setState({ mailStep: 'code', code: '' }); this.toast(r.error); return; }
      const u = r && r.user;
      this.finishLogin((u && u.name) || (u && u.email) || 'Gość');
      if (u && u.isBusiness) this.setState({ bizAccount: true });
    }).catch((e) => { this.setState({ mailStep: 'code', code: '' }); this.toast(String(e.message || e)); });
  }`),
    count: 1,
  },
  {
    name: 'Rejestracja firmy: wyszukiwarka pyta Google, nie listę w pliku',
    why:
      'Prototyp filtrował ośmiopozycyjną listę wpisaną w kod (`gAll`), więc ' +
      'nie dało się znaleźć własnego lokalu. Teraz pytanie idzie mostem do ' +
      'Places API, a lista z pliku zostaje jako zapas, gdy strona działa ' +
      'poza aplikacją.',
    from: js(`  gHits(st) {
    const q = ((st.bizQuery || '') + '').trim().toLowerCase();
    if (q.length < 2) return [];
    return this.gAll.filter((g) => (g.name + ' ' + g.addr).toLowerCase().indexOf(q) > -1).slice(0, 4);
  }`),
    to: js(`  gHits(st) {
    const q = ((st.bizQuery || '') + '').trim().toLowerCase();
    if (q.length < 2) return [];
    return (st.gReal || []).slice(0, 6);
  }`),
    count: 1,
  },
  {
    name: 'Rejestracja firmy: zapytanie do Places po przerwie w pisaniu',
    why:
      'Te same 430 ms, które udawały ładowanie, są teraz prawdziwą przerwą ' +
      'przed zapytaniem — dzięki temu nie pytamy Google przy każdej literze.',
    from: js(`      onBizQuery: (e) => {
        const v = e.target.value;
        this.setState({ bizQuery: v, gBusy: v.trim().length > 1 });
        clearTimeout(this.gT);
        this.gT = setTimeout(() => this.setState({ gBusy: false }), 430);
      },`),
    to: js(`      onBizQuery: (e) => {
        const v = e.target.value;
        this.setState({ bizQuery: v, gBusy: v.trim().length > 1 });
        clearTimeout(this.gT);
        this.gT = setTimeout(() => {
          const q = v.trim();
          if (q.length < 2) { this.setState({ gBusy: false, gReal: [] }); return; }
          if (!window.TAPI || !window.TAPI.native) {
            const low = q.toLowerCase();
            this.setState({ gBusy: false,
              gReal: this.gAll.filter((g) => (g.name + ' ' + g.addr).toLowerCase().indexOf(low) > -1) });
            return;
          }
          window.TAPI.call('maps.search', { query: q }).then((r) => {
            this.setState({ gBusy: false, gReal: ((r && r.results) || []).map((x) => ({
              name: x.name, addr: x.address, placeId: x.placeId,
              rating: (x.rating ? String(x.rating).replace('.', ',') : '—') + ' · ' + (x.votes || 0)
            })) });
          }).catch(() => this.setState({ gBusy: false, gReal: [] }));
        }, 430);
      },`),
    count: 1,
  },
  {
    name: 'Rejestracja firmy: zapamiętanie identyfikatora miejsca Google',
    why:
      'Bez niego nie da się później dociągnąć godzin, telefonu i strony ' +
      'lokalu ani powiązać wizytówki z prawdziwym miejscem na mapie.',
    from: js(
      `pick: () => { this.setState({ bizPicked: g.name, bizAddr: g.addr, bizRating: g.rating, bizStep: 2, bizVerify: 'idle' }); } };`,
    ),
    to: js(
      `pick: () => { this.setState({ bizPicked: g.name, bizAddr: g.addr, bizRating: g.rating, bizPlaceId: g.placeId || null, bizStep: 2, bizVerify: 'idle' }); } };`,
    ),
    count: 1,
  },
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
