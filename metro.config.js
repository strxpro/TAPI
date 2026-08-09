// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Prototyp z Claude Design jedzie jako zasób, nie jako moduł — dzięki temu
// 768 kB HTML-a nie ląduje w paczce JavaScriptu.
config.resolver.assetExts.push('html');

// Model stojaka. `glb` nie jest domyślnym typem zasobu w Metro, więc bez tego
// `require('./assets/stojak.glb')` nie znajduje pliku.
config.resolver.assetExts.push('glb', 'gltf', 'bin');

// Krótkie dźwięki interfejsu.
config.resolver.assetExts.push('wav');

module.exports = config;
