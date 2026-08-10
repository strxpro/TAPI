import { useCallback, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CameraSheet, type CameraMode, type CameraResult } from './CameraSheet';

/**
 * Aparat wystawiony na most.
 *
 * Strona woła `TAPI.call('camera.scanCode')` albo `camera.scanMenu` i czeka.
 * My otwieramy nakładkę natywną, a gdy gość zrobi swoje — rozwiązujemy
 * obietnicę. Dzięki temu logika w projekcie wygląda tak samo jak każde inne
 * wywołanie, bez wiedzy o tym, że pod spodem jest aparat.
 *
 * Zdjęcie karty menu idzie stąd prosto do funkcji `scan-menu`, żeby strona
 * nie musiała nosić kilkuset kilobajtów obrazu w pamięci.
 */

type Pending = {
  mode: CameraMode;
  resolve: (value: unknown) => void;
};

export function useCameraBridge() {
  const [mode, setMode] = useState<CameraMode | null>(null);
  const pending = useRef<Pending | null>(null);

  const open = useCallback(
    (next: CameraMode) =>
      new Promise<unknown>((resolve) => {
        // Drugie wywołanie przy otwartym aparacie zamykamy grzecznie,
        // zamiast zostawiać wiszącą obietnicę.
        pending.current?.resolve({ cancelled: true });
        pending.current = { mode: next, resolve };
        setMode(next);
      }),
    [],
  );

  const finish = useCallback(async (result: CameraResult) => {
    const slot = pending.current;
    pending.current = null;
    setMode(null);
    if (!slot) return;

    if (result.type === 'cancel') return slot.resolve({ cancelled: true });
    if (result.type === 'denied') return slot.resolve({ error: 'Brak zgody na aparat' });
    if (result.type === 'code') return slot.resolve({ code: result.value });

    // Zdjęcie menu — przepisanie robi model po stronie serwera.
    try {
      const { data, error } = await supabase.functions.invoke('scan-menu', {
        body: { image: result.base64, mime: result.mime, lang: 'pl' },
      });
      if (error) return slot.resolve({ error: 'Nie udało się odczytać karty' });
      slot.resolve(data);
    } catch {
      slot.resolve({ error: 'Nie udało się odczytać karty' });
    }
  }, []);

  const Sheet = useCallback(
    () => <CameraSheet mode={mode ?? 'code'} open={mode !== null} onDone={finish} />,
    [mode, finish],
  );

  return { open, Sheet };
}
