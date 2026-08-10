# TAPI — stan projektu

Jeden plik ze wszystkim: jak to jest zbudowane, co działa, czego brakuje
i jak nad tym pracować. Przy rozbieżności z innymi notatkami wygrywa ten plik.

Stan na 10 sierpnia 2026.

---

## Najpierw najważniejsze: dlaczego nie przepisujemy widoków na React Native

Dostałem prośbę, żeby przepisać ekrany z HTML/CSS na `View`, `Text`,
`Pressable`. **Zrobiliśmy to raz i zostało cofnięte** — bo wychodziło
„prawie to samo", a nie to samo. To nie jest kwestia staranności, tylko
arytmetyki: projekt ma kilkaset wartości (odstępy, promienie, cienie z ujemnym
rozlaniem, sześć różnych krzywych czasu, kaskady wejść). Przepisanie ręczne
zawsze gubi część z nich.

Zamiast tego **projekt jest warstwą widoku**, a rzeczy, których strona nie
potrafi, robi warstwa natywna przez most. Wierność wynosi 100%, bo to
dosłownie ten sam kod, który narysował projekt.

**Sprawdzone, nie deklarowane:** po rozłożeniu projektu na pliki źródłowe
i złożeniu z powrotem wyrenderowałem obie wersje i porównałem zrzuty —
identyczne **bajt w bajt** (26 665 B = 26 665 B).

### Kiedy warto będzie przepisać

Jest jeden realny powód: **zasada 4.2 App Store** (aplikacja nie może być samą
stroną w opakowaniu). Odpowiedź na to nie jest jednak „przepisz wszystko",
tylko „dołóż prawdziwych funkcji natywnych" — aparat, NFC, powiadomienia,
model 3D. Wtedy jest to aplikacja hybrydowa, a takich w sklepie są tysiące.
Po to jest most i po to stojak 3D siedzi po stronie natywnej.

---

## Jak to jest zbudowane

```
src/app/            ← warstwa widoku, edytowalna
  template.html       znaczniki (476 kB) — tu zmieniasz wygląd
  logic.js            klasa Component (312 kB) — tu zmieniasz zachowanie
  styles.css          style
  mock-data.js        dane testowe, oddzielone od logiki
  fonts/              11 krojów
  vendor/             biblioteki, nie ruszamy

src/bridge/         ← most: strona prosi, natywne wykonuje
  protocol.ts         protokół i kod wstrzykiwany do strony
  handlers.ts         co most potrafi

src/stand/          ← model 3D stojaka (natywny)
src/lib/            ← Supabase, katalog, wywołania funkcji brzegowych
src/ui/             ← czucie: haptyka i dźwięk
supabase/           ← schemat bazy i funkcje brzegowe
```

### Praca nad projektem

| komenda | co robi |
|---|---|
| `npm run app` | składa `assets/app.html` z plików w `src/app` |
| `npm run app:watch` | to samo, ale pilnuje zmian w tle |
| `npm run unpack` | przejmuje zmiany z nowego eksportu z Claude Design |
| `npx expo start -c` | uruchamia z czystą pamięcią podręczną |

**Po zmianie w `src/app` trzeba złożyć na nowo** (`npm run app`) i **zamknąć
projekt w Expo Go, po czym wejść ponownie** — samo przeładowanie zostawia
starą kopię dokumentu.

---

## Most: co strona może poprosić

Strona woła `TAPI.call('nazwa', { … })` i dostaje obietnicę. Pod spodem idzie
wiadomość z numerem zapytania, warstwa natywna wykonuje i odsyła wynik.

| wywołanie | co robi |
|---|---|
| `auth.sendCode`, `auth.verifyCode` | kod na e-mail przez Supabase |
| `auth.google`, `auth.signOut`, `auth.session` | logowanie Google, sesja, konto firmowe |
| `db.venues`, `db.events`, `db.toggleSaved` | katalog i zapisane |
| `rooms.join`, `rooms.photos`, `rooms.messages`, `rooms.send` | pokoje wieczoru |
| `ai.planDay` | planer na Gemini |
| `maps.search`, `maps.geocode`, `maps.reverse` | Places i Geocoding |
| `feel` | drgnięcie i dźwięk |

Most **nie dotyka wyglądu** — dokłada tylko obiekt `window.TAPI`,
i to wstrzyknięciem, bo dokument przebudowuje się po starcie.

---

## Co działa, a co nie

### Sprawdzone

- **Wygląd** — identyczny z projektem, porównany zrzutami bajt w bajt
- **Baza** — 13 tabel, RLS na każdej; z roli `anon` widać katalog (4 lokale,
  8 wydarzeń), a profile, skany i plany są zamknięte
- **Zdjęcia z wieczoru** — reguła „swoje od razu, cudze dopiero po
  `reveal_at`" siedzi w RLS, nie w kliencie. Test: przed terminem widać 1
  zdjęcie, po terminie 3
- **Budowanie** — `tsc` czysto, serwer deweloperski i paczka produkcyjna iOS
- **Funkcja `plan-day`** — wdrożona na projekt, wersja 1

### Działa po ustawieniu kluczy

Klucze płatnych usług **nie mogą być w aplikacji** — da się je wyjąć z każdej
paczki mobilnej, a rachunek idzie na właściciela. Siedzą po stronie serwera.

**Supabase → projekt TAPI → Edge Functions → Secrets:**

| nazwa | do czego |
|---|---|
| `GOOGLE_MAPS_API_KEY` | wyszukiwarka firmy, geokodowanie |
| `GEMINI_API_KEY` | planer AI |

Do czasu ich ustawienia wyszukiwarka firmy zwraca pustą listę, a planer mówi
„brak klucza" — celowo, zamiast udawać, że działa.

### Czego jeszcze nie ma

- **Skanowanie aparatem** — `runScan()` w projekcie jest udawany, a strona
  w widoku przeglądarki nie ma dostępu do aparatu. Potrzebna nakładka natywna
  z `expo-camera`, którą most otworzy nad stroną i odeśle odczytany kod
- **Model 3D w widoku projektu** — stojak jest natywny; żeby pokazał się
  w miejscu, gdzie projekt rysuje Smart Stand, most musi otworzyć nad stroną
  warstwę natywną
- **Powiadomienia** — w tym to nazajutrz o gotowej kolekcji zdjęć
- **Ekran Znajomi** — baza gotowa (znajomi, pokoje, czat, zdjęcia),
  interfejsu czatu jeszcze nie ma

---

## Świadome odejścia od projektu

Wszystkie na wyraźne polecenie właściciela — spisane, żeby nikt ich później
nie „naprawił" z powrotem.

- **Filtrowanie i sortowanie zdjęte** z ekranu Odkrywaj; listę zawęża
  wyłącznie wyszukiwarka
- **Baner planera AI pod wyszukiwarką**, nie nad nią
- **Rejestracja firmy bez przełącznika zakładek** — wejście prowadzi wprost
  do zakładania konta
- **Sześć pól na kod zamiast czterech** — README opisuje „kod 6-cyfrowy
  (6 osobnych pól)", więc to logika projektu odstawała od specyfikacji;
  krótszego kodu Supabase i tak nie wyśle

Reszta rozbieżności: `ROZBIEZNOSCI.md`. Decyzje techniczne: `DECYZJE.md`.

---

## Błędy, które warto pamiętać

Trzy rzeczy kosztowały najwięcej czasu i wszystkie miały nieoczywistą przyczynę:

1. **Brak haptyki i dźwięku** — klasa definiowała `buzz` dwa razy, a druga
   definicja nadpisywała pierwszą, tę wysyłającą sygnał do warstwy natywnej.
   W klasach JavaScriptu wygrywa późniejsza metoda
2. **Aplikacja nie chciała się zbudować** — projekt nie miał `babel.config.js`,
   a gdy powstał, zainstalowana wersja presetu nie pasowała do SDK. Metro
   przechodziło, ale wywracała się kompilacja do bajtkodu
3. **„Nie widzę żadnych zmian"** — Expo Go trzyma własną kopię dokumentu.
   Samo przeładowanie nie wystarcza, trzeba zamknąć projekt i wejść ponownie
