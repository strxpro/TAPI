# TAPI — aplikacja mobilna

Expo + React Native + TypeScript. Odtworzenie prototypu z `../design_handoff_tapi`.

Stan: **punkt 1 z „Kolejności wdrożenia" — fundament.**

---

## 🤖 INSTRUKCJE DLA AI (AI GUIDELINES)
**NIGDY NIE IGNORUJ TYCH ZASAD (CRITICAL):**
1. **Zasada Białego Ekranu (Tag Balance):** Aplikacja opiera się na własnym silniku `dc-runtime` renderującym z pliku `src/app/template.html`. Silnik ten jest BARDZO czuły na niezamknięte tagi HTML (szczególnie `<div>` oraz `<sc-if>`). Jeśli zapomnisz zamknąć taga po usunięciu jakiegoś elementu, parser się wywala i aplikacja pokazuje "Biały ekran" (lub zatrzymuje się na ekranie Discover). Zawsze sprawdzaj, czy po usunięciu węzła HTML nie zostawiłeś osieroconych tagów zamykających lub otwierających!
2. **Kompilacja (Build Step):** Zmiany w plikach `src/app/template.html`, `src/app/logic.js` oraz `src/app/index.html` **muszą** zostać skompilowane. Po jakiejkolwiek edycji użyj polecenia `node tools/build-app.mjs`, aby wygenerować `assets/app.html`. Bez tego WebView nie zobaczy Twoich zmian.
3. **React Native vs Node Standard Library:** Pamiętaj, że środowisko React Native nie posiada bibliotek wbudowanych Node (np. `buffer`). Próba importowania paczek zależnych od `buffer` (np. niektórych modułów `react-native-svg` bez polyfilli) wysypie bundler Expo. Zawsze weryfikuj środowisko.
4. **Mock-Data vs API:** Wszelkie mocki znajdują się w obiektach (np. `mock-data.js` czy na sztywno w `logic.js`). Zastępując mocki, buduj stabilne endpointy (np. przez Supabase).

---

## Uruchomienie na iPhonie

1. Zainstaluj **Expo Go** z App Store.
2. Na komputerze:

```bash
cd "C:\Users\user\Downloads\TAPI2\tapi" && npx expo start
```

3. Telefon musi być w **tej samej sieci Wi-Fi** co komputer.
4. Otwórz aparat w iPhonie i zeskanuj kod QR z terminala. Expo Go uruchomi aplikację.

Jeśli telefon nie widzi serwera, zapora Windows blokuje port 8081 — zezwól Node.js
na sieć prywatną. Ostateczność, gdy sieci są odseparowane:

```bash
npx expo start --tunnel
```

(za pierwszym razem doinstaluje `@expo/ngrok`, wymaga potwierdzenia w terminalu)

---

## Co działa w punkcie 1

- **Nawigacja** — pasek z czterema zakładkami i wyróżnionym skanerem pośrodku,
  kolejność jak w prototypie: Odkrywaj · Mapa · [Skanuj] · Wyjazd · Profil.
  Przesunięcie palcem w bok przełącza zakładki (skaner poza kolejką gestu).
- **Motywy** — `papier` i `noc` plus tryb `auto` idący za ustawieniem telefonu.
  Wybór zapisuje się między uruchomieniami.
- **Cztery kolory akcentu** — Las, Kobalt, Glina, Śliwka; każdy z osobnym
  wariantem tła dla jasnego i ciemnego motywu.
- **Trzy języki** — PL / EN / IT. Przy pierwszym uruchomieniu wykrywany jest
  język telefonu; własny wybór ma pierwszeństwo i jest zapamiętywany.
- **Typografia** — Archivo, Instrument Serif, Plus Jakarta Sans w skali z README
  handoffu, dostępne przez warianty komponentu `Text`.
- **Haptyka** — lekkie stuknięcie przy zmianie zakładki i ustawień.

Wszystkie ekrany treściowe są celowo zastępcze. Panel do sprawdzenia fundamentu
siedzi w zakładce **Profil**.

## Czego jeszcze nie ma

Punkty 2–7 z `CLAUDE.md`: Odkrywaj z wyszukiwarką, wizytówka lokalu, skaner
i kupony, profil gościa, mapa z mgłą, panel lokalu, Smart Stand.

**NFC** nie działa w Expo Go — wymaga budowy własnej wersji aplikacji
(`npx expo run:ios` albo EAS). Aparat, QR, haptyka i lokalizacja działają
w Expo Go bez przeszkód. Przejdziemy na własną wersję, gdy dojdziemy do NFC.

---

## Struktura

```
App.tsx                      fonty, providery, powłoka z zakładkami
src/
├─ theme/
│  ├─ tokens.ts              kolory, promienie, odstępy, cienie, ruch, skala pisma
│  └─ ThemeProvider.tsx      motyw + akcent, zapis w pamięci urządzenia
├─ i18n/
│  ├─ dict.ts                48 kluczy × PL/EN/IT, przepisane z prototypu
│  └─ I18nProvider.tsx       wykrycie języka telefonu, t() i l3()
├─ nav/
│  ├─ routes.ts              kolejność zakładek
│  ├─ TabBar.tsx             pasek dolny ze skanerem pośrodku
│  └─ ScreenHost.tsx         animacja screenIn + gest poziomy
├─ ui/
│  ├─ Text.tsx               warianty skali typograficznej
│  └─ icons.tsx              ikony inline SVG
└─ screens/
   ├─ Placeholder.tsx        ekran zastępczy
   └─ FoundationPanel.tsx    sterowanie motywem, akcentem i językiem
```

## Zasady

Obowiązuje `CLAUDE.md` z `../design_handoff_tapi`: prototyp jest referencją
wizualną, nie kodem do kopiowania; nie dodajemy kolorów ani krojów spoza README;
każdy nowy tekst powstaje od razu w trzech językach.

**Nawigacja bez routera** — stan zakładek trzymamy tak jak prototyp (`phase`, `tab`),
bo model fazowy splash → auth → app źle się składa z routerem plikowym.
Expo Router dołożymy, gdy będą potrzebne linki głębokie.
