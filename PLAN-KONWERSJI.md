# Konwersja prototypu na ekrany natywne

> Stan na 9 sierpnia 2026. Czytaj razem z `design_handoff_tapi/CLAUDE.md`.

## Gdzie jesteśmy

Aplikacja pokazuje **prototyp 1:1** w widoku strony (`MODE = 'prototype'` w `App.tsx`).
Wygląda dokładnie jak projekt, bo to dosłownie ten sam plik. Działa też:

- blokada powiększania (trzy warstwy)
- haptyka natywna przez most `postMessage` → `expo-haptics`
- zdejmowanie atrapy iPhone'a
- **wszystkie 44 zepsute powiązania naprawione** (`tools/check-bindings.mjs` → 0)

Czego brakuje i **nigdy nie zadziała w widoku strony**:

- skaner menu z aparatem (OCR)
- NFC
- powiadomienia push
- gesty natywne (cofanie od krawędzi, karuzela zakładek ze sprężyną)
- publikacja w App Store (zasada Apple 4.2)

## Co już jest napisane natywnie

W `src/screens/` leżą gotowe ekrany zbudowane z **poprzedniej** wersji projektu
(`Bywalec.dc.html`). Nie pasują 1:1 do obecnego `TAPI-standalone.html`, ale
dają fundament: tokeny, typografię, motywy, i18n, nawigację.

| Plik | Stan |
|---|---|
| `Splash.tsx` | pełny, animacja rysowana kreską |
| `Auth.tsx` | pełny |
| `Discover.tsx` | **przebudowany wg `TAPI-standalone.html` — czeka na akceptację** |
| `VenueDetail.tsx` | ze starej wersji — do przebudowy |
| `Scan.tsx` | wygląd gotowy, brak aparatu |
| `Profile.tsx` | 4 zakładki, ze starej wersji |
| `MapScreen.tsx` | zastępczy, bez kafelków i mgły |
| `Trip.tsx` | skrócony |

Fundament (`src/theme/tokens.ts`, `src/ui/`, `src/nav/`, `src/i18n/`) jest
aktualny i nie wymaga zmian.

## Czego nowy projekt dołożył

`TAPI-standalone.html` ma rzeczy, których nie ma w wersji natywnej:

- planer AI („Zaplanuj swój dzień", 4 pytania → trasa)
- znajomi: ranking, w pobliżu, zaproszenia z kodem
- zapisane / obserwowane / kolekcje
- logowanie i rejestracja firmy z dwoma zakładkami
- panel firmy, Smart Stand
- filtry i sortowanie w arkuszu

## Kolejność konwersji

Zasada: **jeden ekran naraz, z przełącznikiem**. `MODE` w `App.tsx` przełącza
całość, ale docelowo warto mieć wybór per ekran — natywny, gdy gotowy
i zatwierdzony; strona, gdy jeszcze nie.

1. ~~**Odkrywaj**~~ — zrobiony 9 sierpnia 2026, razem z arkuszem filtrów
   i sortowania. Do obejrzenia: `MODE = 'native'` w `App.tsx`.
   Otwarta decyzja: język baneru planera AI (`ROZBIEZNOSCI.md` §9)
2. **Wizytówka lokalu** — druga pod względem ruchu
3. **Skaner + kupony** — tu wchodzi aparat, pierwsza rzecz niemożliwa w stronie
4. **Profil** — poziomy, nagrody, ustawienia, awatar
5. **Zapisane / obserwowane / kolekcje**
6. **Znajomi**
7. **Mapa** — wymaga decyzji o mgle (dwa podejścia w `DECYZJE.md`)
8. **Planer AI**
9. **Panel firmy** — logowanie, rejestracja, analityka, rangi
10. **Smart Stand** — konfigurator 3D. **Podgląd modelu zrobiony poza
    kolejnością** (9 sierpnia 2026), bo `stojak.glb` był gotowy: obrót palcem,
    autoobrót, kolor obudowy, naklejka generowana na żywo. Zostaje wycena,
    dwa kroki arkusza i zamówienie. Szczegóły w `DECYZJE.md`.

## Rzeczy wymagające decyzji przed startem

- **Mgła na mapie** — szare kafelki z maską SVG czy natywna mapa z nakładką
- **Model 3D Smart Standu** — `expo-gl` czy sekwencja obrazów
- **Skaner OCR** — który dostawca AI do odczytu menu ze zdjęcia
- **Teksty włoskie** — w `TAPI-standalone.html` włoski jest osobną warstwą
  (`itMap` + `itRules` przepuszczone przez `tr()`), więc prawie wszystko ma
  tłumaczenie. Wyjątki wypisane w `ROZBIEZNOSCI.md` §9 i §10 — najważniejszy
  to baner planera AI, który jest po polsku we wszystkich językach.

## Jak zacząć nową rozmowę

> Przeczytaj `tapi/PLAN-KONWERSJI.md` i `design_handoff_tapi/CLAUDE.md`.
> Prototyp jest w `TAPI-standalone.html`, serwuj go przez
> `node serve-prototype.mjs` i porównuj. Zaczynamy od punktu 1 — Odkrywaj.
> Nie ruszaj pozostałych ekranów.

## Czego nie wolno zgubić

- `tools/edit-design.mjs` — pięć zmian w projekcie, odporne na wielokrotne
  uruchomienie. Po każdym nowym eksporcie z Claude Design: uruchom ponownie.
- `tools/check-bindings.mjs` — wykrywa zepsute powiązania `{{ }}`.
- `tools/build-prototype.mjs` — składa plik dla aplikacji, `npm run design`
  pilnuje zmian w tle.
- Kopie zapasowe projektu w `../kopie/`.
