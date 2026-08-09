# Rozbieżności: prototyp vs README

Źródłem prawdy jest prototyp. Poniżej wszystko, co znalazłem, wraz z miejscem
w pliku. Przy każdej pozycji podjąłem decyzję na korzyść prototypu.

Część pierwsza (§1–8) powstała przy fundamencie i dotyczy `Bywalec.dc.html`.
Część druga (§9–17) powstała przy przebudowie ekranu Odkrywaj i dotyczy
nowszego `TAPI-standalone.html`.

---

## 1. Kolor `#0E1013` — README się myli

**README** (§Splash): „Ciemne tło `#0E1013`".

**Prototyp** (linia 112): tło splashu to `background: #14161A; color: #F4F2ED`.

`#0E1013` występuje w całym pliku **raz**, w linii 164, jako wypełnienie kropki
nad „i" w logo: `<circle cx="133" cy="10" r="4.6" fill="#0E1013">`.

→ Usunięty z `app.json`. Powierzchnie zawsze ciemne dostały `#14161A` / `#F4F2ED`
(stała `ALWAYS_DARK` w tokenach).

Podobne, prawie identyczne ciemne kolory w prototypie, żeby ich nie mylić:
- `#14161A` (18×) — tło motywu nocnego i powierzchni zawsze ciemnych
- `#1D2025` (1×) — `surf` motywu nocnego
- `#0E1014` (1×) — tylna ścianka Smart Standu w wersji czarnej (linia 5959)
- `#101215` (2×) — koniec gradientu na froncie Smart Standu

---

## 2. Pasek nawigacji — nie ma wyniesionego skanera

**README** (§Interactions): „dolny pasek z czterema zakładkami + centralny
przycisk skanera".

**Prototyp** (linie 4005–4021, `navOrder` w linii 4203): **pięć równych pozycji**
w jednej pigułce — `discover · map · scan · trip · profile`. Skaner nie jest
wyniesiony ani wyróżniony kolorem; jest zwykłą zakładką. Aktywną wskazuje
jeżdżąca pigułka pod spodem.

→ Zbudowane wg prototypu. Gest poziomy przechodzi przez wszystkie pięć
(prototyp, linia 5733).

Wymiary paska z prototypu: kontener `padding: 0 12px 24px`, pasek `height: 62`,
`padding: 6`, `border-radius: 999`, tło `rgba(255,255,255,0.86)` w jasnym
i `rgba(29,32,37,0.86)` w ciemnym.

---

## 3. Czwarta zakładka to „Wyjazd", nie „Zapisane"

**README** (§Screens) opisuje `Salvati` jako zakładkę **profilu**
(Account · Salvati · Premi · Impostazioni) — i to się zgadza.

W pasku dolnym czwarta pozycja to `trip`: PL „Wyjazd", IT „Viaggio", EN „Trip"
(prototyp, linia 5711). Etykieta była wpisana inline, poza słownikiem — dodałem
klucz `navTrip` w trzech językach.

---

## 4. Ikona „Odkrywaj" to lupa, nie pinezka

Prototyp, linia 4011: `<circle cx="11" cy="11" r="7">` + `<path d="M20 20l-3.8-3.8">`.
Wszystkie pięć ikon przepisane znak w znak z linii 4011–4015. Rozmiar 19×19,
stroke 1.8 (skaner 1.9).

---

## 5. Waga 400 nie istnieje w prototypie

**README**: „Plus Jakarta Sans (400–800)".

**Prototyp**: `font-weight: 400` nie pada ani razu. Rozkład wag:
500 (79×) · 600 (180×) · 700 (79×) · 800 (7×).

→ Ładujemy 500/600/700/800. Wagi 400 nie ma po co pobierać.

---

## 6. Cienie — zapis CSS jest nieprzenośny

Prototyp używa ujemnego rozlania (`0 18px 32px -20px`), którego React Native
nie zna. Odwzorowuję wygląd, nie zapis: skracam promień i podnoszę przesunięcie.
Wartości w `tokens.ts` w sekcji `shadow`, każda z oryginałem w komentarzu.

To jedyne miejsce w tokenach, gdzie wartość nie jest przepisana dosłownie —
bo dosłownie się nie da.

---

## 7. Easingi — prototyp ma ich więcej niż README

README wymienia dwa. Prototyp używa sześciu, każdy do czegoś innego:

| Zastosowanie | Wartość | Linia |
|---|---|---|
| domyślny | `0.16, 1, 0.3, 1` | wszędzie |
| sprężysty | `0.24, 1.5, 0.4, 1` | README |
| pasek nawigacji, podniesienie zakładki | `0.28, 1.4, 0.4, 1` | 4006, 4009 |
| przesuw pigułki | `0.34, 1.42, 0.4, 1` | 4007 |
| szerokość pigułki | `0.2, 0.9, 0.35, 1` | 4007 |
| skok ikony | `0.3, 1.5, 0.45, 1` | 4010 |
| wyjście splashu | `0.7, 0, 0.3, 1` | 112 |

Wszystkie w `tokens.ts` jako `ease`, użyte przez `Easing.bezier(...)`.

---

## 8. Czego nie dało się odtworzyć 1:1

**`backdrop-filter: blur(20px) saturate(1.4)`** na pasku nawigacji i
`blur(8px) saturate(1.9)` na pigułce — React Native tego nie ma.
**Rozwiązane 9 sierpnia 2026** przez `expo-blur`; szczegóły w `DECYZJE.md`.

**`::before` z połyskiem na pigułce** — odtworzone osobnym `View`
(`left 12%`, `right 12%`, `top 2`, `height 38%`).

**Gradient pigułki** — `expo-linear-gradient`, wartości z linii 5901–5903.

---
---

# Odkrywaj — nowy prototyp (`TAPI-standalone.html`)

Znalezione przy przebudowie ekranu Odkrywaj. Numery linii odnoszą się do
szablonu i klasy logiki wypakowanych z eksportu (`<script type="__bundler/template">`).

---

## 9. Baner planera AI jest wyłącznie po polsku — **do decyzji**

To jest rzecz, którą trzeba rozstrzygnąć, zanim ekran pójdzie do ludzi.

Cały baner „Zaplanuj swój dzień w mieście" — plakietka `AI Planner`, nadtytuł
„Twój idealny dzień", tytuł, opis „Odpowiedz na 4 pytania…" i wezwanie
„Rozpocznij planowanie" — jest wpisany **wprost w szablon**, poza
`renderVals()`. Warstwa tłumaczeń (`tr()` → `itMap` / `itRules`) dotyka tylko
wartości zwracanych przez `renderVals()`, więc baneru nie rusza.

Skutek: gość z telefonem po włosku (a to język domyślny produktu) i po
angielsku widzi na środku ekranu Odkrywaj pięć polskich zdań.

→ Odtworzone 1:1, po polsku we wszystkich trzech językach, z komentarzem
w `src/screens/discover/copy.ts`. **Potrzebna zatwierdzona kopia EN i IT** —
podmiana to sześć linijek w jednym pliku.

---

## 10. Trzy teksty bez włoskiego w `itMap`

Prototyp tłumaczy ekran Odkrywaj kompletnie, poza trzema miejscami, gdzie
mapa nie ma wpisu i włoski spada do angielskiego:

- „Nothing scheduled then. Try “All” — there is more this week."
- „Nothing in {dzielnica} then. Try “All Kraków” or another day."
- „Saved. We will remind you a day before."

→ Zachowujemy się tak samo jak prototyp — angielski. Oznaczone komentarzem
w `copy.ts`. Reszta ekranu ma włoski wyjęty z `itMap` co do znaku.

---

## 11. Kategorie zeszły z ekranu do arkusza filtrów

Poprzednia wersja ekranu (z `Bywalec.dc.html`) miała pigułki kategorii pod
wyszukiwarką. Nowy prototyp ich tam nie ma — `cats` renderuje się wyłącznie
w arkuszu „Filtruj i sortuj", pod nagłówkiem „Kategoria". Doszła też pozycja
`followed` („Obserwowane").

→ Pigułki usunięte z ekranu, arkusz dobudowany. Do arkusza prowadziły trzy
wejścia, tak jak w prototypie: przycisk przy wyszukiwarce, wiersz „Filtry
i sortowanie" i pigułka sortowania w przyklejonym nagłówku.

**Nieaktualne od 9 sierpnia 2026** — całe filtrowanie zostało zdjęte
na polecenie właściciela, patrz §18.

---

## 12. Kategoria „Obserwowane" nie ma czego pokazać

Filtr `followed` czyta listę `following`, którą zapełnia przycisk obserwowania
na wizytówce lokalu — czyli punkt 2. Do tego czasu lista jest pusta i filtr
zwraca zero wyników. Prototyp zachowuje się identycznie przed pierwszym
obserwowaniem.

---

## 13. Bramka logowania przy zapisywaniu

W prototypie „Zapisz" na lokalu i na wydarzeniu przechodzi przez `needAuth`:
bez konta otwiera się arkusz logowania, a akcja odpala się dopiero po
zalogowaniu. W wersji natywnej nie ma jeszcze obiektu użytkownika (`Auth`
wpuszcza każdego), więc zapis działa od razu.

→ Bramka wchodzi razem z kontem gościa, punkt 4.

---

## 14. Miejsce na awatar w przyklejonym nagłówku

Po przewinięciu prototyp dokłada nagłówkowi `padding-right: 64px`, robiąc
miejsce pod pływający awatar z szybkimi ustawieniami. Awatar jest elementem
całej aplikacji (widać go na każdej zakładce poza skanerem), nie ekranu
Odkrywaj.

→ **Zrobione 9 sierpnia 2026.** Awatar (`src/nav/Avatar.tsx`) siedzi
w powłoce, nie w ekranie: `insets.top + 12` od góry, 20 px od prawej.
Chowa się na skanerze, pod wizytówką i pod planerem — tak jak `showAvatar`
w prototypie. Odstęp w nagłówku Odkrywaj (62 px przy powitaniu, 64 px po
zwinięciu) jest dokładnie po to, żeby awatar nie wchodził w treść.

Pod awatarem siedzą szybkie ustawienia: język, motyw, akcent oraz
przełączniki dźwięku i wibracji.

---

## 15. Pasek dolny: czwarta zakładka to teraz „Znajomi"

`navOrder` w nowym prototypie to `discover · map · scan · friends · profile`.
Wersja natywna ma wciąż `trip` ze starego prototypu (patrz §3).

→ Paska nie ruszałem — należy do punktu 6. Baner planera AI woła
`setState({ tab: 'trip' })`, więc na razie prowadzi na obecny ekran Wyjazd.

---

## 16. `transform-origin` — dwa miejsca

React Native obraca i skaluje zawsze względem środka widoku.

- **Rozwijanie wyszukiwarki w nagłówku** (`growX`, `transform-origin: left
  center`) — dołożone przesunięcie −W/2·(1−s), które przykleja lewą krawędź
  w miejscu. Efekt taki sam, patrz `useGrowX` w `src/ui/motion.tsx`.
- **Kołysanie rysunku w stanie pustym** (`doodleWob`, origin `58px 46px`,
  środek widoku to `66px 48px`) — przy wychyleniu ±1,1° różnica wychodzi
  poniżej pół piksela. Zostawione na środku.

---

## 17. Prototyp ma zepsutą ikonę w pasku dolnym

W `TAPI-standalone.html` (szablon, linia 4932) w miejscu ikony zakładki
„Znajomi" siedzi **literał wyrażenia regularnego**:

```
<sc-if value="\{\{ n\.isTrip \}\}">.*?<\/sc-if>
```

To wygląda na ślad po podmianie, która trafiła do pliku projektu zamiast go
zmienić — sąsiednie linie (`isDiscover`, `isMap`, `isFriends`, `isScan`,
`isProfile`) mają normalne SVG. W prototypie renderuje się w tym miejscu
surowy tekst.

→ Nie dotykałem: to plik z Claude Design, a nie kod aplikacji. Do naprawy
przy następnym eksporcie. Wersji natywnej to nie dotyczy.

---

## 18. Świadome odejścia od prototypu — na prośbę właściciela

Zasada mówi, że wygrywa prototyp. Poniższe trzy rzeczy są wyjątkiem: zostały
zmienione na wyraźne polecenie i dlatego są tu wypisane, żeby nikt ich później
nie „naprawił" z powrotem.

**Filtrowanie i sortowanie zdjęte.** Zniknął arkusz „Filtruj i sortuj",
przycisk przy wyszukiwarce, wiersz „Filtry i sortowanie" i pigułka sortowania
w przyklejonym nagłówku. Listę zawęża wyłącznie wyszukiwarka. Skutki uboczne:
kategoria, dzielnica, poziom cen, ocena minimalna i „tylko otwarte" nie mają
gdzie być ustawione, a podpowiedzi kategorii i dzielnicy zamiast ustawiać
filtr wpisują się w wyszukiwarkę.

**Baner planera AI pod wyszukiwarką.** W prototypie stoi nad nią, zaraz pod
powitaniem.

**Wybór terminu przy wydarzeniach został.** Pigułki „Wszystkie / Jutro /
Weekend / Za tydzień / Bezpłatne" to nie filtr listy lokali, tylko jedyny
sposób przeglądania kalendarza — bez nich sekcja przestaje działać.

---

## 19. Czwarta zakładka: „Znajomi" zamiast „Wyjazd"

Uzupełnienie §3, które opisywało stan ze starszego `Bywalec.dc.html`.

`navOrder` w `TAPI-standalone.html` to `discover · map · scan · friends ·
profile`. Plan wyjazdu nie jest zakładką — to ekran otwierany z banera planera
AI, tak samo jak wizytówka lokalu.

→ Pasek przestawiony, doszła ikona `IconFriends` (ścieżki z prototypu)
i klucz `navFriends` w trzech językach. Ekran Znajomi jest na razie zastępczy
(punkt 6). Wyjazd otwiera się z banera i przykrywa zakładki.

Przy okazji: to prawdopodobnie ta „zepsuta ikona w menu", bo w prototypie
w tym miejscu renderuje się surowy tekst wyrażenia regularnego (§17).
