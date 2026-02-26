import { Platform } from "react-native";
import Purchases, { CustomerInfo } from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? "";
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? "";

export function configurePurchases() {
  const apiKey = Platform.OS === "ios" ? IOS_KEY : ANDROID_KEY;
  if (!apiKey || apiKey.startsWith("appl_replace") || apiKey.startsWith("goog_replace")) {
    console.warn("[Purchases] RevenueCat API key not configured. Skipping init.");
    return;
  }
  Purchases.configure({ apiKey });
}

export async function identifyUser(clerkUserId: string) {
  try {
    await Purchases.logIn(clerkUserId);
  } catch (err) {
    console.warn("[Purchases] identifyUser failed:", err);
  }
}

export async function resetUser() {
  try {
    await Purchases.logOut();
  } catch (err) {
    console.warn("[Purchases] resetUser failed:", err);
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.getCustomerInfo();
  } catch (err) {
    console.warn("[Purchases] getCustomerInfo failed:", err);
    return null;
  }
}

export async function presentPaywall(): Promise<void> {
  try {
    await RevenueCatUI.presentPaywall();
  } catch (err) {
    console.warn("[Purchases] presentPaywall failed:", err);
  }
}

const ENTITLEMENT_ID = "Shaale Pro";

export async function isProSubscriber(): Promise<boolean> {
  const info = await getCustomerInfo();
  if (!info) return false;
  return info.entitlements.active[ENTITLEMENT_ID]?.isActive === true;
}
