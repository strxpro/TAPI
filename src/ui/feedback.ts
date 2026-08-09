import { useCallback, useEffect, useRef } from 'react';
import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Device from 'expo-device';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Czucie aplikacji w jednym miejscu: drgnięcie i dźwięk.
 *
 * Prototyp woła `buzz(ms)` z różnymi długościami — 7 przy wyborze, 9 przy
 * zmianie zakładki, 12 przy zapisie, 16 po zalogowaniu, 20 przy planerze.
 * `navigator.vibrate` nie ma odpowiednika 1:1 w iOS, więc zamiast przepisywać
 * milisekundy mapujemy zamiar na natywne wzorce Apple i Androida.
 *
 * Dźwięki są generowane, nie pobrane — trzy krótkie pliki w `assets/sounds`.
 */

export type Cue =
  /** wybór na liście, pigułka, przełącznik */
  | 'select'
  /** zmiana zakładki w pasku */
  | 'tab'
  /** zapisanie, dodanie do listy */
  | 'save'
  /** skan kodu, odebranie nagrody */
  | 'ping'
  /** koniec dłuższej czynności */
  | 'success'
  /** nie wyszło */
  | 'error';

const SOUNDS = {
  tap: require('../../assets/sounds/tap.wav') as number,
  ping: require('../../assets/sounds/ping.wav') as number,
  success: require('../../assets/sounds/success.wav') as number,
};

type SoundName = keyof typeof SOUNDS | null;

/**
 * Co dany zamiar robi: jakie drgnięcie, jaki dźwięk i ile milisekund wibracji
 * na wypadek, gdyby haptyka nie odpowiedziała.
 *
 * Uwaga na siłę: `selectionAsync` i `Light` to na wielu Androidach drgnięcie
 * tak delikatne, że w ruchu go nie czuć. Dlatego wybór dostaje `Light`,
 * a rzeczy, które coś zmieniają — `Medium`.
 */
const CUES: Record<
  Cue,
  { haptic: () => Promise<void>; sound: SoundName; volume: number; ms: number }
> = {
  select: {
    haptic: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    sound: null,
    volume: 0,
    ms: 10,
  },
  tab: {
    haptic: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    sound: 'tap',
    volume: 0.32,
    ms: 18,
  },
  save: {
    haptic: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    sound: 'tap',
    volume: 0.45,
    ms: 20,
  },
  ping: {
    haptic: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    sound: 'ping',
    volume: 0.7,
    ms: 34,
  },
  success: {
    haptic: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    sound: 'success',
    volume: 0.6,
    ms: 30,
  },
  error: {
    haptic: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
    sound: null,
    volume: 0,
    ms: 40,
  },
};

const KEY_SOUND = 'tapi.sound';
const KEY_HAPTIC = 'tapi.haptic';

/* ─────────────────────────────────────────────────────── ustawienia gościa ── */

let soundOn = true;
let hapticOn = true;

void AsyncStorage.multiGet([KEY_SOUND, KEY_HAPTIC])
  .then((pairs) => {
    for (const [key, value] of pairs) {
      if (value === null) continue;
      if (key === KEY_SOUND) soundOn = value === '1';
      if (key === KEY_HAPTIC) hapticOn = value === '1';
    }
  })
  .catch(() => {});

export function setSoundEnabled(on: boolean) {
  soundOn = on;
  void AsyncStorage.setItem(KEY_SOUND, on ? '1' : '0').catch(() => {});
}

export function setHapticEnabled(on: boolean) {
  hapticOn = on;
  void AsyncStorage.setItem(KEY_HAPTIC, on ? '1' : '0').catch(() => {});
}

export const isSoundEnabled = () => soundOn;
export const isHapticEnabled = () => hapticOn;

/* ────────────────────────────────────────────────────────────── odtwarzacze ── */

/**
 * Odtwarzacze trzymamy w module, nie w komponencie. Dźwięk interfejsu musi
 * ruszyć natychmiast po dotknięciu, a tworzenie odtwarzacza na żądanie
 * daje słyszalne opóźnienie przy pierwszym użyciu.
 */
const players = new Map<string, AudioPlayer>();
let audioReady = false;

function ensureAudio() {
  if (audioReady) return;
  audioReady = true;
  // Dźwięki interfejsu nie mogą uciszać muzyki gościa ani przerywać
  // nagrywania — dlatego tryb „mieszaj z innymi".
  //
  // `playsInSilentMode: true` jest tu świadome. Przy `false` iPhone
  // z przełącznikiem ciszy nie gra **nic**, a tak stoi większość telefonów
  // przez większość czasu — dźwięki byłyby wtedy funkcją, której nikt nigdy
  // nie usłyszy. Gość i tak może je wyłączyć w szybkich ustawieniach.
  void setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: 'mixWithOthers',
    shouldRouteThroughEarpiece: false,
  }).catch(() => {});
}

function play(name: keyof typeof SOUNDS, volume: number) {
  if (!soundOn) return;
  ensureAudio();
  try {
    let player = players.get(name);
    if (!player) {
      player = createAudioPlayer(SOUNDS[name]);
      player.loop = false;
      players.set(name, player);
    }
    audioWorks = true;
    player.volume = volume;

    // `seekTo` jest asynchroniczne. Wołanie `play()` od razu po nim znaczyło,
    // że po pierwszym odtworzeniu głowica stoi na końcu pliku i każde kolejne
    // stuknięcie grało ciszę. Dlatego gramy dopiero po przewinięciu, a gdy
    // przewinięcie się nie uda — i tak próbujemy zagrać.
    const start = player;
    void start
      .seekTo(0)
      .then(() => start.play())
      .catch(() => start.play());
  } catch (err) {
    // Brak dźwięku nie może wywrócić interakcji — ale zapamiętujemy powód,
    // żeby dało się go pokazać w ustawieniach zamiast zgadywać.
    audioWorks = false;
    lastAudioError = String(err);
  }
}

/**
 * Zagraj reakcję na dotknięcie. Bezpieczne do wołania zewsząd —
 * nic nie rzuca i nic nie czeka.
 */
export function cue(kind: Cue) {
  const def = CUES[kind];
  if (hapticOn) buzz(def);
  if (def.sound) play(def.sound, def.volume);
}

/**
 * Drgnięcie z zabezpieczeniem.
 *
 * `expo-haptics` na części Androidów odrzuca wywołanie (brak silnika, wyłączone
 * wibracje dotykowe w ustawieniach systemu, starsze API). Wtedy schodzimy do
 * surowej wibracji z React Native — mniej subtelna, ale zawsze wyczuwalna.
 * Na iOS zejścia nie ma: `Vibration` włącza tam pełne dzwonienie, co przy
 * stuknięciu w zakładkę byłoby karykaturą.
 */
function buzz(def: { haptic: () => Promise<void>; ms: number }) {
  def
    .haptic()
    .then(() => {
      hapticsWork = true;
    })
    .catch((err) => {
      hapticsWork = false;
      lastHapticError = String(err);
      if (Platform.OS === 'android') {
        try {
          Vibration.vibrate(def.ms);
        } catch {
          /* nie ma czym drgnąć — trudno */
        }
      }
    });
}

/** Wstępne wczytanie plików, żeby pierwsze stuknięcie nie było głuche. */
export function warmUpFeedback() {
  ensureAudio();
  for (const name of Object.keys(SOUNDS) as (keyof typeof SOUNDS)[]) {
    if (players.has(name)) continue;
    try {
      players.set(name, createAudioPlayer(SOUNDS[name]));
    } catch {
      /* nic nie szkodzi, zagra przy pierwszym użyciu */
    }
  }
}

/**
 * Wygodny skrót dla komponentów. Zwraca stabilną funkcję, więc można ją
 * podawać w zależnościach efektów bez pilnowania.
 */
export function useCue() {
  return useCallback(cue, []);
}

/**
 * Dźwięki na Androidzie budzą się szybciej, gdy odtwarzacze powstaną
 * przy starcie ekranu. Wołane raz, w powłoce aplikacji.
 */
export function useFeedbackWarmUp() {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    warmUpFeedback();
  }, []);
}

/* ────────────────────────────────────────────────────────────── diagnostyka ── */

/**
 * Stan czucia. „Nie czuję nic" może znaczyć trzy różne rzeczy: wyłączone
 * w ustawieniach aplikacji, wyłączone w systemie albo brak modułu. Bez
 * odczytu z telefonu nie da się tego rozróżnić, więc aplikacja mówi to sama.
 */
let hapticsWork: boolean | null = null;
let audioWorks: boolean | null = null;
let lastHapticError: string | null = null;
let lastAudioError: string | null = null;

export type FeedbackStatus = {
  platform: string;
  /** czy symulator — tam haptyki nie ma fizycznie */
  emulator: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  /** null = jeszcze nie próbowano */
  hapticsWork: boolean | null;
  audioWorks: boolean | null;
  soundsLoaded: number;
  hapticError: string | null;
  audioError: string | null;
};

export function feedbackStatus(): FeedbackStatus {
  return {
    platform: Platform.OS,
    emulator: !Device.isDevice,
    soundEnabled: soundOn,
    hapticEnabled: hapticOn,
    hapticsWork,
    audioWorks,
    soundsLoaded: players.size,
    hapticError: lastHapticError,
    audioError: lastAudioError,
  };
}

/** Czy w ogóle da się drgnąć — na symulatorze nie ma czym. */
export const hapticsAvailable =
  (Platform.OS === 'ios' || Platform.OS === 'android') && Device.isDevice;
