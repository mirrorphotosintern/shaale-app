const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// @expo/log-box imports react-dom/client for its web overlay.
// On native builds this module doesn't exist, so we intercept the resolution
// and point it at a no-op shim.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "react-dom/client") {
    return {
      filePath: path.resolve(__dirname, "shims/react-dom-client.js"),
      type: "sourceFile",
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
