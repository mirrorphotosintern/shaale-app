# Lessons Learned — Shaale Expo App

Documented crashes and build failures we've hit in production/TestFlight, and how to avoid them.

---

## 1. Missing Expo Plugins → Native Module Crash (SIGABRT)

**Build affected:** Build 20
**Symptom:** App crashes immediately on launch. Crash log shows `EXC_CRASH (SIGABRT)` on a background thread with `ObjCTurboModule::performVoidMethodInvocation` in the stack.
**Root cause:** `expo-video` (and `expo-apple-authentication`) were not listed in the `plugins` array in `app.json`. Without plugin registration, the native module isn't properly configured at build time — it throws an uncaught Objective-C exception when the JS tries to call it.

**Fix:**
```json
// app.json
"plugins": [
  "expo-router",
  "expo-secure-store",
  "expo-web-browser",
  "expo-video",           ← was missing
  "expo-apple-authentication"  ← was missing
]
```

**Rule:** Every Expo package that ships native code needs its plugin registered in `app.json`. When you `npm install` a new `expo-*` package, immediately add it to plugins. The CI check enforces this.

---

## 2. Expo Package Versions with `^` → SDK Mismatch on EAS

**Symptom:** Works locally but behaves differently or crashes on EAS builds. EAS resolves a newer minor version than what you tested locally.
**Root cause:** Using `^` (caret) allows npm to install any compatible minor version. On EAS, with a clean install, this can pull a version built for a newer Expo SDK than the one your project targets (SDK 55).

**Fix:** Use `~` (tilde) for all `expo-*` and `@expo/*` packages — allows patch updates only.
```json
"expo-video": "~55.0.8",   ✅
"expo-video": "^55.0.8",   ❌
```

**Rule:** Always use `~` for Expo packages. The CI check enforces this.

---

## 3. Missing Peer Dependency `expo-auth-session` → Bundling Failure

**Symptom:** Metro bundler fails with `Unable to resolve module expo-auth-session`. App never launches.
**Root cause:** `@clerk/clerk-expo` requires `expo-auth-session` as a peer dependency but doesn't list it as a direct dependency, so it wasn't installed automatically.

**Fix:** `npm install expo-auth-session`

**Rule:** When installing a new SDK (especially auth SDKs), check their docs for peer dependencies and install them explicitly. The CI check verifies `expo-auth-session` is present.

---

## 4. `react-dom` Not Available in React Native → Bundling Failure

**Symptom:** Metro bundler fails with `Unable to resolve module react-dom`. Specifically triggered by `@clerk/clerk-react` importing `react-dom` for its web portal utilities.
**Root cause:** `@clerk/clerk-react` contains web-only code that imports `react-dom`. React Native doesn't have `react-dom`.

**Fix:** Intercept the module in `metro.config.js` and redirect to a no-op shim:
```js
// metro.config.js
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "react-dom" || moduleName === "react-dom/client") {
    return { filePath: path.resolve(__dirname, "shims/react-dom-client.js"), type: "sourceFile" };
  }
  return context.resolveRequest(context, moduleName, platform);
};
```

The shim exports no-ops for `createRoot`, `createPortal`, and `flushSync`.

**Rule:** Any web-targeting npm package may import `react-dom`. Always shim it in metro.config.js. The CI check verifies the shim is in place.

---

## 5. RevenueCat Offerings Empty in Simulator

**Symptom:** `Error fetching offerings — None of the products registered in the RevenueCat dashboard could be fetched from App Store Connect.`
**Root cause:** Two separate issues:
1. The iOS simulator cannot connect to App Store Connect to fetch subscription products.
2. Apple requires the first subscription to be submitted alongside a binary for App Review before it becomes fetchable.

**Not a bug.** Expected behaviour.

**How to test purchases:**
- Use a **StoreKit Configuration file** in Xcode for simulator testing
- Use a **real device** with an **App Store Connect sandbox tester account** for realistic testing
- Real purchases only work after the subscription has been approved in App Review

---

## 6. Clerk Native API Disabled

**Symptom:** Runtime error: `The Native API is disabled for this instance. Go to Clerk Dashboard > Configure > Native applications to enable it.`
**Fix:** Clerk Dashboard → Configure → Native applications → Enable toggle.
**Rule:** When setting up a new Clerk instance, always enable Native applications before testing on device/simulator.

---

## 7. Wrong API Key Type (Stripe vs Clerk)

**Symptom:** Clerk throws `The publishableKey passed to Clerk is invalid`.
**Root cause:** Stripe publishable keys also start with `pk_` — easy to paste the wrong one.
**Fix:** Clerk keys look like `pk_test_AbCdEf...` (short alphanumeric). Stripe keys look like `pk_live_51MBA1eK...` (long, starts with a number after the prefix).
**Rule:** Double-check the source dashboard when copying API keys.

---

---

## 8. Running on Android Simulator / Emulator

Android has a few differences from iOS that developers need to know before running the app locally.

**Setup requirements:**
- Android Studio installed with an AVD (Android Virtual Device) configured
- An emulator image with **Google Play Store** (not just AOSP) — required for in-app purchases to work
- Run `npx expo run:android` (not `npm run android`) for the first build to generate native files

**RevenueCat on Android emulator:**
- Google Play Billing doesn't work on standard emulators — you need a physical Android device or a licensed emulator image
- RevenueCat will initialise fine but `getOfferings()` will return empty or throw — this is expected
- For real purchase testing use a physical device with a **Google Play License Tester** account (set up in Google Play Console → Setup → License testing)

**Google Sign In (Clerk) on Android:**
- Requires the SHA-1 fingerprint of your debug keystore to be added to the Google Cloud Console OAuth credentials
- Get your debug SHA-1: `cd android && ./gradlew signingReport`
- Add it in Google Cloud Console → your OAuth client → Android → SHA-1 certificate fingerprint
- Without this, Google OAuth will silently fail or show an error on Android

**Environment:**
- `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` must be set in `.env` — currently still a placeholder until Google Play Store app is set up in RevenueCat dashboard
- The app will skip RevenueCat init on Android if the key starts with `goog_replace` (safe fallback built into the code)

**Known Android-only issue:**
- `expo-apple-authentication` is iOS only — the Apple Sign In button is correctly hidden on Android (Platform.OS check in `app/sign-in.tsx`)

---

## CI Enforcement

All of lessons 1–4 are enforced by `.github/workflows/ci.yml` on every push and PR.
Run the `pre-build-check` Claude agent before every EAS build: just type `/pre-build-check` in Claude Code.
