# Decyzje techniczne

Rzeczy, których nie da się przenieść z CSS do React Native 1:1. Decyzje podjęte
przez Claudia 7 sierpnia 2026 — trzymamy się ich, dopóki nie powie inaczej.

---

## Mgła na mapie → szare kafelki + maska SVG

**Punkt 5.** Dwie warstwy mapy: pod spodem kolorowa, na wierzchu ta sama
w szarościach (CartoDB Positron). W szarej warstwie maska SVG wycina okręgi
wokół odwiedzonych miejsc.

Odtwarza to `grayscale(1)` z prototypu, nie tylko przyciemnienie. Promienie
wycięć animujemy przez Reanimated — 1,25 s, `easeOutCubic` na promieniu.

Koszt: podwójne pobieranie kafelków. Przy słabym łączu trzeba będzie dołożyć
buforowanie.

---

## Logo na splashu → Lottie

**Punkt 3 (splash).** `lottie-react-native` działa w Expo Go.

⚠️ **Uwaga, o której musisz wiedzieć:** nie mam narzędzia projektowego, z którego
dałoby się wyeksportować gotowy plik Lottie. Napiszę JSON bezpośrednio ze ścieżek
SVG z prototypu (linie 116–170), używając `trim path` — to jest dokładny
odpowiednik `stroke-dashoffset`, więc rysowanie liter wyjdzie jak w oryginale.

Jeśli ręcznie pisany JSON okaże się kruchy, awaryjnie wracamy do
`react-native-svg` z animowanym `strokeDashoffset` — efekt ten sam, tylko
mniej wygodny w strojeniu.

---

## Smart Stand → prawdziwe 3D przez expo-gl + three.js

**Punkt 7.** Realny model z oświetleniem i obrotem palcem o 360°, kolor
(biały / czarny) i nadruk zmieniane w locie — bez renderowania klatek.

Koszt: cięższa paczka i dłuższy start tego ekranu. Model ładujemy leniwie,
dopiero przy otwarciu arkusza Smart Standu, żeby nie spowalniał reszty aplikacji.

Kolory brył z prototypu (linia 5958–5959):
- front czarny: `linear-gradient(158deg, #2C3037 0%, #191C21 55%, #101215 100%)`
- tylna ścianka czarna: `#0E1014`
- tylna ścianka biała: `#DED9CF`

### Jak to wyszło w praktyce (9 sierpnia 2026)

Model `assets/stojak.glb` (202 kB) dostarczony, więc ekran powstał przed
kolejnością z planu. Kod leży w `src/stand/`, wejście przez
`MODE = 'stand'` w `App.tsx`.

**Nazwy w pliku nie zgadzają się z opisem.** `Stojak_Obudowa` i
`Stojak_Naklejka` to nazwy **obiektów**, a materiały nazywają się
`Mat_Stojak` i `Stojak_Etykieta`. `StandModel.tsx` szuka najpierw po
obiekcie, potem po materiale — przemianowanie w Blenderze niczego nie wysypie.

**Zamiast `OrbitControls` własny `PanResponder`.** Kontrolki z three-stdlib
wieszają się na zdarzeniach DOM, których w React Native nie ma. Potrzebny
jest tylko obrót w poziomie i ograniczony przechył, więc taniej napisać to
wprost. Przy okazji gest bierze wyłącznie ruch w bok, dzięki czemu palec
położony na modelu dalej przewija ekran.

**Naklejka: canvas w ukrytym WebView.** React Native nie ma canvasu, a
naklejka musi powstawać na żywo. Rysuje ją `react-native-webview` (już był
w projekcie), gotowy PNG z przezroczystym tłem wraca jako `data:` i idzie
prosto do `TextureLoader` — ten w wersji natywnej jest podmieniony przez
`@react-three/fiber` i przyjmuje `data:` bez pośrednictwa pliku.

Rozważane i odrzucone: `react-native-skia` (nie działa w Expo Go),
`react-native-view-shot` (to samo), rysowanie liter geometrią (nie ma jak
zmierzyć tekstu).

**Kroje firmowe wstrzykiwane do WebView.** Instrument Serif i Plus Jakarta
Sans idą z paczek `@expo-google-fonts` jako `@font-face` w base64. Bez tego
nazwa lokalu wychodziłaby krojem systemowym telefonu. Gdy wczytanie padnie,
canvas bierze zastępczy — napis jest, tylko w innych proporcjach.

**Mapa odbić z `RoomEnvironment`**, generowana lokalnie przez `PMREMGenerator`,
bez pobierania HDR z sieci. Opakowana w `try`, bo starsze GL ES nie zawsze
udźwignie render do tekstury zmiennoprzecinkowej — wtedy zostają same światła.

**Jedna rzecz do sprawdzenia na telefonie:** orientacja tekstury.
Podmieniony `TextureLoader` ustawia `flipY = true` (jak obrazek na stronie),
a siatki z glTF liczą UV od górnej krawędzi. Ustawiłem `flipY = false`
(stała `LABEL_FLIP_Y` w `useStandLabel.tsx`). Gdyby naklejka wyszła do góry
nogami, to jest ta jedna linijka.

---

## Bezpieczne obszary → prototyp + wcięcie systemowe

Odstęp dolny = 24 px z prototypu **plus** bezpieczny obszar telefonu.
Na iPhonie z paskiem gestów wychodzi 58 px, na telefonie bez niego — 24 px.

Tak samo u góry: `insets.top + 12 px`.

Już zaimplementowane w `TabBar.tsx` i `Placeholder.tsx`.

---

## Rozmycie tła (`backdrop-filter`) → `expo-blur`

**Zrobione 9 sierpnia 2026.** Pasek nawigacji ma w prototypie
`blur(20px) saturate(1.4)`, pigułka `blur(8px) saturate(1.9)`.

Oba dostały `BlurView` z `expo-blur` (`intensity` 55 i 26 — tyle mniej więcej
odpowiada 20 i 8 pikselom rozmycia w CSS), a nad nim cieńszą warstwę koloru.
Alfa spadła z 0.86 na 0.55, bo w prototypie barwa i rozmycie siedziały
w jednej deklaracji; tutaj rozmywa warstwa niżej, więc przy 0.86 nie byłoby
widać nic pod spodem.

---

## Dźwięki interfejsu → generowane, nie pobrane

Trzy krótkie pliki w `assets/sounds`, policzone skryptem (sinusy z zanikiem
wykładniczym), a nie ściągnięte z banku dźwięków — nie ma wtedy pytania
o licencję i wszystko jest w jednej tonacji:

- `tap.wav` — 55 ms, ciche stuknięcie przy zmianie zakładki
- `ping.wav` — dwa dzwonki G6 → C7, po skanie i przy nagrodzie
- `success.wav` — pasaż C6–E6–G6, po dłuższej czynności

Odtwarza `expo-audio` w trybie `mixWithOthers`, więc dźwięki nie uciszają
muzyki gościa. Wszystko wychodzi przez `cue()` w `src/ui/feedback.ts` —
tam też siedzi mapowanie zamiaru na haptykę i przełączniki w ustawieniach.

Prototypowe `buzz(7)`, `buzz(9)`, `buzz(12)`, `buzz(16)`, `buzz(20)` nie mają
odpowiednika 1:1 w iOS, więc zamiast przepisywać milisekundy mapujemy zamiar
(`select`, `tab`, `save`, `ping`, `success`, `error`) na natywne wzorce.
