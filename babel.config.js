/**
 * three.js (od 0.18x) używa statycznych bloków w klasach: `static { ... }`.
 * Parser Babela w trybie deweloperskim nie włącza ich sam i wywala się na
 * `node_modules/three/build/three.core.js`. Eksport produkcyjny przechodził,
 * bo idzie inną ścieżką — dlatego błąd widać dopiero na serwerze dev.
 *
 * Dokładamy wtyczkę jawnie. Bez niej nie da się uruchomić aplikacji z modelem
 * stojaka przez `expo start`.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['@babel/plugin-transform-class-static-block'],
  };
};
