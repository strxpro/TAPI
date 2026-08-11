# Status Projektu - TAPI

## Zaimplementowane (Gotowe)
- **Architektura**: Oparta o własny Custom DOM Runtime (szablon HTML + maszyna stanów w `logic.js`).
- **Nawigacja**: Gesty swipe (TikTok style) do przechodzenia pomiędzy głównymi ekranami.
- **Interakcje z widokami**: Swipe-down zamykający dolne panele (BottomSheet).
- **Mapy (Leaflet)**: Poprawnie zintegrowane, pasek wyszukiwania po kliknięciu rozwija opcje. Panel odkrywania jest domyślnie schowany przy wejściu. Dodana płynna przezroczystość UI podczas przybliżania (pinch zoom).
- **Styling**: Usunięto przestarzałą czcionkę szeryfową na rzecz nowocześniejszej (Plus Jakarta Sans/Archivo). Interfejs minimalistyczny.
- **Skaner QR**: Działa na kamerze na żywo, przycisk symulacji wyłączony (zastąpiony automatycznym wykrywaniem). Laser uaktywnia się po pomyślnym wykryciu.
- **Wizytówka lokalu (Venue)**: Pozbawiona duplikujących się, nadmiarowych przycisków na grafice w tle.
- **AI Planner**: Rozszerzony i bardziej widoczny blok na stronie "Odkrywaj".
- **Powiadomienia (Toast)**: Pojawiają się na szczycie ekranu jako powiadomienia systemowe, nie kolidując z resztą interfejsu.
- **Bezpieczeństwo Parser'a HTML**: Kod HTML i zagnieżdżenia naprawione (zlikwidowany błąd "Białego Ekranu").

## Co brakuje (Do usunięcia "fake" danych)
Obecnie aplikacja bazuje na zmiennej `MOCK` wewnątrz `logic.js` (linie około 400+), która symuluje backend.

**Zadania na przyszłość:**
1. **Model 3D (Zgłoszony przez użytkownika):** Zbadanie, dlaczego model 3D się nie ładuje na niektórych urządzeniach lub brakuje odpowiednich zależności WebGL.
2. **Dynamiczne pobieranie danych:** Usunąć obiekt `MOCK` i zastąpić to rzeczywistymi zapytaniami `fetch` do API backendu TAPI.
3. **Prawdziwa Autoryzacja:** Proces rejestracji i logowania z przypisywaniem JWT / tokenu sesyjnego.
4. **Faktyczne skanowanie QR**: Przepięcie strumienia z biblioteki `jsQR` (lub podobnej) na rzeczywistą walidację paragonu po stronie serwera.
5. **Obsługa profili i zdjęć:** Dodanie mechanizmu uploadu awatarów, usuwając placeholder `https://i.pravatar.cc/`.

## Instrukcja do dalszych prac dla AI (Ważne)
Plik główny widoków: `src/app/template.html`
Plik logiki (kontroler): `src/app/logic.js`

1. Wszystkie eventy myszy/dotyku są obsługiwane w sposób camelCase, np. `sc-camel-on-click`, `sc-camel-on-pointer-down`.
2. Zmiany w widokach (`template.html`) muszą być precyzyjne — jakikolwiek niezamknięty tag `<div>` zepsuje renderowanie całej aplikacji!
3. Po każdej zmianie w `template.html` lub `logic.js` wymagane jest wywołanie skryptu: `node tools/build-app.mjs`. Powstanie wtedy plik `assets/app.html`, z którego korzysta np. WebView.
