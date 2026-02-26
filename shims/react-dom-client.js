// Stub for react-dom/client — not available in React Native native builds.
// @expo/log-box imports this for its web overlay; on native it's a no-op.
module.exports = {
  createRoot: () => ({ render: () => {} }),
};
