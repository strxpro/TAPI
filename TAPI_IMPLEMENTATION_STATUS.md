# 🗺️ TAPI — stan wdrożenia

## 🟢 Gotowe

- [x] Projekt architektury onboardingu i rejestracji
- [x] Krok 1: wyszukiwarka Google Places + ręczny wybór pełnej listy kategorii
- [x] Krok 1b: moduł weryfikacji nowej firmy (NIP / dokumenty)
- [x] Krok 2: regulamin z wymogiem przewinięcia do końca
- [x] **Schemat bazy uzgodniony z warstwą firmową** — migracja
      `0003_firmy_rezerwacje_relacje.sql`, nałożona i sprawdzona na żywej bazie
- [x] **Blokada rezerwacji online bez danych do wypłat** — pilnuje baza, nie ekran

- [x] **Lokale i wydarzenia z bazy** zamiast `MOCK` (który został jako zapas)
- [x] **Logowanie kodem** — naprawione, patrz niżej
- [x] **Odtwarzacz relacji** i publikowanie ich z panelu firmy
- [x] **Arkusz stylów wraca do dokumentu** — animacje i czcionki znów działają

## 🟡 W trakcie

- [ ] Krok 3: integracja kalendarzy (iCal / Booking / Google Calendar)
- [ ] Krok 4: Stripe Connect — dziś w bazie jest miejsce na konto i saldo,
      ale nikt ich jeszcze nie wypełnia
- [ ] Pulpit B2B: karty rezerwacji, saldo, przejęcie czatu od AI
- [ ] Usuwanie konta — przycisk obiecuje więcej, niż robi (patrz niżej)
- [ ] Logowanie Google: most gotowy, ekran go nie woła
- [ ] Powiadomienia push i webhooki

---

## Cztery błędy, które psuły rzeczy widoczne gołym okiem

**Arkusz stylów nie trafiał do dokumentu.** Zero `@font-face`, zero
`@keyframes`. Aplikacja wyglądała prawie dobrze, bo style siedzą w atrybutach,
ale nie działała **żadna animacja** — rysowanie logo na starcie, wjazdy kart,
dolne panele, toast — a napisy szły krojem systemowym zamiast Archivo
i Plus Jakarta Sans. Przyczyna: podstawienie `<!-- STYLES -->` biegło przed
wstawieniem szablonu, a znacznik siedział w szablonie. Zabezpieczenie sprawdzało
„czy jest jakikolwiek `<style>`" — szablon ma własny, więc warunek wychodził
prawdziwy i arkusz wypadał po cichu. Znacznik jest teraz w `<head>` szkieletu,
a budowanie **staje z komunikatem**, gdy arkusz nie dojdzie.

**Nie dało się zalogować.** Klawiatura kodu obcinała wpis do czterech znaków,
a wysyłka wymagała sześciu — warunek nie mógł się spełnić nigdy. Drugie wejście,
pole z podpowiedzią z wiadomości, wysyłało po czterech. Supabase przysyła sześć.
Czterocyfrowy kod kuponu to osobna sprawa i został bez zmian.

**Miesiąc wydarzenia był wpisany na sztywno** jako `SIE`. Na danych z pliku nikt
tego nie widział, bo wszystkie były sierpniowe — wrześniowy koncert podpisałby
się sierpniem.

**Odległość „320 m" była ozdobą.** Prototyp pobierał pozycję GPS i ją wyrzucał.
Teraz liczy się naprawdę, a bez zgody na lokalizację jest myślnik zamiast
zmyślonej liczby.

## Usuwanie konta mówi więcej, niż robi

Przycisk pokazuje „konto usunięte" i obiecuje 30 dni na powrót. Na razie
tylko wylogowuje — konto zostaje w bazie. Prawdziwe usunięcie wymaga funkcji
brzegowej z kluczem serwisowym, bo telefon nie ma prawa kasować kont, oraz
znacznika na trzydzieści dni. Jest to opisane w kodzie przy samym przycisku.

---

## Co dokładnie stoi w bazie

Projekt Supabase `TAPI` (`dajjtpgniuugbsbecpfr`). RLS na każdej tabeli bez wyjątku.

### Migracja 0003 — co doszło

| Tabela | Kto czyta | Kto pisze |
|---|---|---|
| `venue_settings` | każdy — wizytówka musi wiedzieć, które moduły pokazać | właściciel lokalu |
| `venue_payout_profiles` | **wyłącznie właściciel** | właściciel, ale bez kwot |
| `bookings` | gość, który rezerwował, oraz lokal | gość zakłada, lokal prowadzi |
| `stories` | każdy, dopóki relacja trwa; właściciel także archiwum | właściciel lokalu |
| `story_views` | swoje odsłony i właściciel lokalu | przez `mark_story_seen` |

Do `venues` doszły pola firmowe (`archetype`, `verification_status`,
`tos_accepted_at`…) oraz reszta wizytówki, która dotąd żyła wyłącznie
w `src/app/mock-data.js`: `hours`, `reward`, `reward_code`, `menu`, `opinions`.

### Dlaczego `create_tapi_merchants_schema.sql` leży nietknięty

Tamten plik **nigdy nie wszedł do bazy i wejść nie mógł**. Zakładał
`venues.id UUID`, a identyfikatorem lokalu jest tekstowy skrót (`nokturn`).
`bookings.venue_id UUID REFERENCES venues(id)` wywróciłoby się na typie.
Nie miał też ani jednej polityki RLS — w Supabase tabela bez RLS jest otwarta
dla każdego, kto ma klucz z aplikacji, a ten klucz siedzi w paczce na telefonie.

Migracja 0003 robi to samo, dopasowane do istniejących tabel i z RLS.
Stary plik zostawiam jako ślad zamiaru; **nie uruchamiaj go**.

### Trzy rzeczy, których nie widać, a bez których to nie działa

**Saldo nie należy do firmy.** Polityka daje właścicielowi zapis do całego
wiersza wypłat, a w wierszu jest stan konta. Bez strażnika firma wpisałaby
sobie dowolne saldo i status „zweryfikowana". Wyzwalacz `guard_payout_money`
przy zapisie od firmy przywraca stare wartości tych kolumn — zmienia je
wyłącznie serwer.

**Kwotę rezerwacji ustala serwer.** Inaczej gość wpisałby `total_amount = 0`
przy stoliku z zadatkiem. W swojej rezerwacji gość może zmienić jedno: status
na odwołaną.

**Rezerwacje gasną same.** Gdy dane do wypłat przestają być kompletne,
wyzwalacz wyłącza rezerwacje online. Inaczej lokal zbierałby wpłaty, których
nie ma jak przekazać.

### Co zostało sprawdzone, a nie tylko napisane

Test przeszedł przez pełną ścieżkę firmy w jednej transakcji, wycofanej na końcu:

1. rezerwacje bez danych do wypłat — **zablokowane**
2. ustawienia bez rezerwacji — zapisują się normalnie
3. firma wpisuje sobie `zweryfikowana = tak` i saldo 9999 — **baza cofa oba
   pola do zera**, gotowość dalej fałszywa
4. rezerwacje nadal zablokowane
5. serwer potwierdza konto — gotowość prawdziwa
6. rezerwacje włączone
7. serwer cofa weryfikację — **rezerwacje gasną same**

Osobno, na prawdziwym numerze konta: `anon` widzi **0** wierszy z IBAN-em,
zalogowany obcy **0**, właściciel lokalu **1** i odczytuje numer.

Katalog oczami aplikacji (rola `anon`): 4 lokale, wszystkie z pełną wizytówką,
10 relacji, 0 wierszy z wypłat, 0 rezerwacji.

### Czego nie sprawdziłem

Niczego na telefonie. Nie mam urządzenia i nie zgaduję, jak to wygląda w ręce.
Funkcja brzegowa `scan-menu` jest wgrana, ale **ani razu nie wywołana**.

### Do klikniecia w panelu Supabase

Ochrona przed wyciekłymi hasłami jest wyłączona (Authentication → Password).
Supabase sprawdza hasło w bazie HaveIBeenPwned. Jedno kliknięcie.

---

## Uwaga o nazewnictwie plików

Brief opisuje TAPI jako PWA w czystym JavaScripcie i wymienia `src/app/index.css`.
W repozytorium jest inaczej: to aplikacja **Expo / React Native**, w której
warstwą widoku jest dokument w WebView, a arkusz nazywa się `src/app/styles.css`.
Funkcje z briefu — relacje, skaner, nawigacja, kreator B2B — **istnieją**.
Nazwy plików to jedyna rozbieżność.

Po każdej zmianie w `src/app/` trzeba złożyć dokument:

```bash
npm run app
```
