/**
 * Projekt nie miał tego pliku, przez co preset Expo nie był stosowany i Babel
 * przepuszczał składnię, której Hermes nie rozumie — statyczne bloki w klasach
 * z `three` wywracały serwer deweloperski.
 *
 * Uwaga na wersję presetu: musi pasować do SDK. `expo@54` wymaga
 * `babel-preset-expo@~54.0.12`. Nowszy, zainstalowany na wierzchu, przesłania
 * ten właściwy — wtedy Metro przechodzi, ale wywraca się kompilacja do bajtkodu,
 * na prywatnych polach klas w samym React Native
 * („private properties are not supported").
 *
 * Wtyczek nie dokładamy ręcznie: preset wnosi już `plugin-proposal-decorators`,
 * a ten musi iść przed transformacją pól klas. Dopisane osobno lądują przed nim
 * i Babel przerywa.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Jedyna wtyczka dokładana ręcznie: preset w wersji na SDK 54 nie włącza
    // statycznych bloków w klasach, a `three` ich używa i serwer deweloperski
    // się na nich wywraca. Reszty nie dokładamy — kolidują z decoratorami.
    plugins: ['@babel/plugin-transform-class-static-block'],
  };
};
