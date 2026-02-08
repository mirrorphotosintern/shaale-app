const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add html and js to asset extensions so game.html and phaser.min.js
// can be loaded via require() in WebView source
config.resolver.assetExts.push("html");

module.exports = config;
