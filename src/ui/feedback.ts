import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
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

/** Co dany zamiar robi: jakie drgnięcie i jaki dźwięk. */
const CUES: Record<Cue, { haptic: () => Promise<void>; sound: SoundName; volume: number }> = {
  select: { haptic: () => Haptics.selectionAsync(), sound: null, volume: 0 },
  tab: {
    haptic: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    sound: 'tap',
    volume: 0.32,
  },
  save: {
    haptic: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    sound: 'tap',
    volume: 0.45,
  },
  ping: {
    haptic: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    sound: 'ping',
    volume: 0.7,
  },
  success: {
    haptic: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    sound: 'success',
    volume: 0.6,
  },
  error: {
    haptic: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
    sound: null,
    volume: 0,
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
  void setAudioModeAsync({
    playsInSilentMode: false,
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
      players.set(name, player);
    }
    player.volume = volume;
    player.seekTo(0);
    player.play();
  } catch {
    // Brak dźwięku nie może wywrócić interakcji.
  }
}

/**
 * Zagraj reakcję na dotknięcie. Bezpieczne do wołania zewsząd —
 * nic nie rzuca i nic nie czeka.
 */
export function cue(kind: Cue) {
  const def = CUES[kind];
  if (hapticOn) {
    // Haptyka na Androidzie potrafi rzucić przy braku uprawnienia do wibracji.
    void def.haptic().catch(() => {});
  }
  if (def.sound) play(def.sound, def.volume);
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

/** Czy w ogóle da się drgnąć — na symulatorze i w sieci nie ma czym. */
export const hapticsAvailable = Platform.OS === 'ios' || Platform.OS === 'android';
