/**
 * Most między prototypem a warstwą natywną.
 *
 * Po co: prototyp z Claude Design **jest** projektem — co do piksela. Gdyby
 * przepisywać go na React Native ekran po ekranie, zawsze wyjdzie „prawie to
 * samo". Dlatego zostaje jako cała warstwa wizualna, a rzeczy, których strona
 * nie potrafi (konta, baza, model AI, aparat, NFC), wykonuje część natywna.
 *
 * Jak: strona woła `TAPI.call('auth.sendCode', { email })` i dostaje obietnicę.
 * Pod spodem idzie `postMessage` z numerem zapytania, natywna część robi swoje
 * i wstrzykuje `__tapiReply(id, ok, dane)`. Numer wiąże odpowiedź z pytaniem,
 * więc kilka wywołań naraz sobie nie przeszkadza.
 *
 * Czego most **nie** zmienia: wyglądu. Nie dotyka ani jednego stylu w pliku
 * projektu — dokłada tylko obiekt `window.TAPI`.
 */

/** Zapytanie ze strony do części natywnej. */
export type BridgeRequest = {
  type: 'tapi/call';
  id: number;
  method: string;
  params?: Record<string, unknown>;
};

/** Sygnał w drugą stronę, bez pytania — np. zmiana sesji. */
export type BridgeEvent = {
  type: 'tapi/event';
  name: string;
  payload?: unknown;
};

export function isBridgeRequest(v: unknown): v is BridgeRequest {
  if (!v || typeof v !== 'object') return false;
  const m = v as Record<string, unknown>;
  return m.type === 'tapi/call' && typeof m.id === 'number' && typeof m.method === 'string';
}

/**
 * Kod dokładany do strony.
 *
 * Eksport z Claude Design przebudowuje dokument po starcie i kasuje wszystko,
 * co dopisane do pliku — dlatego wstrzykujemy to z aplikacji i powtarzamy.
 * Strażnik `__tapiBridge` pilnuje, żeby powtórka niczego nie nadpisała
 * i nie pogubiła obietnic czekających na odpowiedź.
 */
export const BRIDGE_SCRIPT = `
(function () {
  if (window.__tapiBridge) return;
  window.__tapiBridge = true;

  var next = 1;
  var waiting = {};
  var listeners = {};

  function send(payload) {
    if (!window.ReactNativeWebView) return false;
    window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    return true;
  }

  window.__tapiReply = function (id, ok, data) {
    var slot = waiting[id];
    if (!slot) return;
    delete waiting[id];
    if (ok) slot.resolve(data);
    else slot.reject(new Error((data && data.message) || 'Nie udało się'));
  };

  window.__tapiEmit = function (name, payload) {
    (listeners[name] || []).forEach(function (fn) {
      try { fn(payload); } catch (e) {}
    });
  };

  window.TAPI = {
    /** Czy strona działa w aplikacji, czy w zwykłej przeglądarce. */
    native: !!window.ReactNativeWebView,

    call: function (method, params) {
      return new Promise(function (resolve, reject) {
        var id = next++;
        if (!send({ type: 'tapi/call', id: id, method: method, params: params || {} })) {
          // W przeglądarce nie ma mostu — mówimy to wprost, zamiast wisieć.
          reject(new Error('Most niedostępny — strona działa poza aplikacją'));
          return;
        }
        waiting[id] = { resolve: resolve, reject: reject };
        // Zapytanie bez odpowiedzi nie może zostać w pamięci na zawsze.
        setTimeout(function () {
          if (!waiting[id]) return;
          delete waiting[id];
          reject(new Error('Brak odpowiedzi'));
        }, 30000);
      });
    },

    on: function (name, fn) {
      (listeners[name] = listeners[name] || []).push(fn);
      return function () {
        listeners[name] = (listeners[name] || []).filter(function (x) { return x !== fn; });
      };
    },
  };

  // Strona może czekać na most, zanim zdąży się wstrzyknąć.
  window.__tapiEmit('ready', { native: window.TAPI.native });
})();
true;
`;
