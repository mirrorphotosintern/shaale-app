// Stub for react-dom and react-dom/client — not available in React Native.
// Used by @expo/log-box and @clerk/clerk-react which import web-only APIs.
module.exports = {
  createRoot: () => ({ render: () => {} }),
  createPortal: (children) => children,
  flushSync: (fn) => fn(),
};
