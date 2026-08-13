# Uniwersalny Swipeable Bottom Sheet — Apple Style UX

## Przegląd

Wszystkie widoki wysuwane z dołu (szczegóły lokali, filtry, podglądy, opcje czatu, ustawienia) używają teraz **jednego, spójnego komponentu** `Sheet.tsx` z pełnym wsparciem dla intuicyjnego gestu zamykania w dół (swipe-to-close), dokładnie jak w natywnym iOS.

## Główne Cechy

### 1. **Swipe-to-Close**
- ✅ Pełne wsparcie dla gestu pociągnięcia w dół
- ✅ Tracking 1:1 — arkusz podąża za palcem bez opóźnienia
- ✅ Opór przy próbie pociągnięcia w górę (ruch dzielony przez 3)
- ✅ Zamykanie velocity-based — szybki ruch w dół zamyka nawet przy małej odległości
- ✅ Zamykanie distance-based — przekroczenie 25% wysokości zawsze zamyka

### 2. **Haptyka (Apple Style)**
- ✅ Delikatna wibracja `Light Impact` przy zamknięciu gestem
- ✅ Wibracja występuje tylko przy udanym zamknięciu, nie przy powrocie na miejsce
- ✅ Dźwięk `select` przy zamknięciu gestem (spójność z resztą UI)

### 3. **Animacje**
- ✅ Płynne przejście slide-in z Bezier easing `ease.standard`
- ✅ Slide-out dostosowany do velocity — szybszy przy rzucie
- ✅ Płynna animacja sprężynowa przy powrocie na miejsce
- ✅ Tło przyciemniające zanika synchronicznie z gestem zamykania

### 4. **Accessibility & UX**
- ✅ Cała górna belka (nie tylko uchwyt) łapie gest — łatwiejsze w użyciu
- ✅ Uchwyt wizualny (grip) pokazuje, że można ciągnąć
- ✅ Tło można dotknąć aby zamknąć (alternatywna metoda)
- ✅ Bezpieczne obszary (safe area insets) automatycznie uwzględnione

## Integracja z Scroll-Driven Animations (Odkrywaj)

Sekcja **Odkrywaj** wykorzystuje `Animated.ScrollView` z efektem parallax dla kafelków:

### Efekt "Gumy" przy Pull-to-Refresh
- ✅ Pociągnięcie na samej górze w dół (`scrollY < 0`) rozsuwanie kafelków
- ✅ Każdy kafelek w sekcji "Dziś w mieście" przesuwa się bardziej niż poprzedni
- ✅ Lekkie powiększenie (scale 1.05) podczas rozciągania
- ✅ Płynne interpolacje z `extrapolate: 'clamp'` dla naturalnego ruchu

### Implementacja
```typescript
const scrollY = useRef(new Animated.Value(0)).current;

const onScrollAnimated = Animated.event(
  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
  { useNativeDriver: true }
);

// Przekazywanie do kart
<TodayCardView scrollY={scrollY} ... />
```

## Struktura Plików

```
src/ui/Sheet.tsx              — Uniwersalny komponent Bottom Sheet
src/screens/Discover.tsx      — Scroll-driven animations
src/screens/discover/cards.tsx — Karty z efektem parallax
src/nav/Avatar.tsx            — Przykład użycia Sheet (szybkie ustawienia)
src/native/CameraSheet.tsx    — Aparat z własnym modal (nie używa Sheet)
```

## Użycie

### Podstawowe
```typescript
import { Sheet } from '../ui/Sheet';

<Sheet 
  open={isOpen} 
  onClose={() => setIsOpen(false)}
  maxHeight="88%"
>
  {/* Twoja zawartość */}
</Sheet>
```

### Zaawansowane (z własnym scrollem)
```typescript
<Sheet open={open} onClose={onClose}>
  <ScrollView showsVerticalScrollIndicator={false}>
    {/* Scrollowalna zawartość */}
  </ScrollView>
</Sheet>
```

## Parametry Konfiguracyjne

| Parametr | Typ | Domyślnie | Opis |
|----------|-----|-----------|------|
| `open` | `boolean` | - | Kontrola widoczności |
| `onClose` | `() => void` | - | Callback zamknięcia |
| `maxHeight` | `string` | `"88%"` | Maksymalna wysokość jako % ekranu |
| `children` | `React.ReactNode` | - | Zawartość arkusza |

## Progi Zamykania

```typescript
const CLOSE_RATIO = 0.25;      // 25% wysokości
const CLOSE_VELOCITY = 0.7;    // px/ms
```

Arkusz zamyka się gdy:
- Użytkownik przeciągnie ≥25% wysokości W DÓŁ, LUB
- Velocity ≥0.7 px/ms przy ruchu w dół (minimum 40px przesunięcia)

## Różnice od Zewnętrznych Bibliotek

### Dlaczego nie `@gorhom/bottom-sheet`?
1. **Konflikt wersji** — wymaga React Native 0.83+, mamy 0.81.5
2. **Overengineering** — potrzebujemy prostego bottom sheet, nie kompleksowego systemu snap points
3. **Kontrola** — pełna kontrola nad animacjami, haptiką i integracją z resztą aplikacji
4. **Rozmiar** — brak dodatkowych zależności (~200KB mniej)

### Korzyści Custom Solution
- ✅ Pełna kontrola nad UX i timing animacji
- ✅ Spójność z resztą aplikacji (te same tokens, ease curves, feedback)
- ✅ Brak konfliktów wersji
- ✅ Lżejsza aplikacja
- ✅ Łatwiejsze debugowanie

## Testowanie

### Scenariusze do Przetestowania
1. ✅ Otwarcie arkusza — płynna animacja slide-in
2. ✅ Pociągnięcie w dół (25%+) → zamknięcie z vibracją
3. ✅ Pociągnięcie w dół (<25%) → powrót na miejsce
4. ✅ Szybki ruch w dół → natychmiastowe zamknięcie
5. ✅ Próba pociągnięcia w górę → opór (mniejszy ruch)
6. ✅ Dotknięcie tła → zamknięcie bez vibracji
7. ✅ Pull-to-refresh w Odkrywaj → parallax kafelków

### Urządzenia
- iPhone (różne rozmiary)
- iPad
- Symulator iOS
- Sprawdzenie vibracją na prawdziwym urządzeniu (symulator nie ma)

## Status Implementacji

| Komponent | Status | Uwagi |
|-----------|--------|-------|
| Avatar (Szybkie ustawienia) | ✅ Zaimplementowany | Pełne swipe-to-close |
| VenueDetail | 🔄 Do aktualizacji | Używać Sheet.tsx |
| Filtry Odkrywaj | ⏸️ Usunięte z projektu | - |
| Opcje czatu | ⏳ Przyszły feature | Użyje Sheet.tsx |
| CameraSheet | ✅ Własny modal | Nie używa Sheet (fullscreen) |

## Następne Kroki

1. ✅ **Zaimplementowano uniwersalny Sheet.tsx**
2. ✅ **Dodano haptykę Light Impact**
3. ✅ **Zintegrowano scroll-driven animations w Discover**
4. ⏳ Migracja VenueDetail do użycia Sheet.tsx
5. ⏳ Dodanie testów jednostkowych dla Sheet
6. ⏳ Dokumentacja video dla zespołu UX

## Feedback & Iteracje

Jeśli efekt wymaga dostrojenia:
- `CLOSE_RATIO` — próg zamykania (obecnie 25%)
- `CLOSE_VELOCITY` — próg velocity (obecnie 0.7)
- `duration.sheet` w tokens — czas animacji slide-in
- Opór w górę — dzielnik `g.dy / 3` w PanResponder

---

**Autor:** TAPI Development Team  
**Data:** 2026-08-11  
**Wersja:** 1.0
