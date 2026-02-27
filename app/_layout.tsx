import { useEffect } from "react";
import { Stack } from "expo-router";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import { configurePurchases, identifyUser } from "../src/services/purchases";

const CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

const tokenCache = {
  getToken: (key: string) => SecureStore.getItemAsync(key),
  saveToken: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  clearToken: (key: string) => SecureStore.deleteItemAsync(key),
};

function RevenueCatInit() {
  const { userId, isSignedIn } = useAuth();

  useEffect(() => {
    configurePurchases();
  }, []);

  useEffect(() => {
    if (isSignedIn && userId) {
      identifyUser(userId);
    }
  }, [isSignedIn, userId]);

  return null;
}

function AppStack() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#4F46E5" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="player/[id]"
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen
        name="journey/[level]/index"
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="sign-in"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  // If Clerk key is not configured, render without auth
  if (!CLERK_KEY || !CLERK_KEY.startsWith("pk_")) {
    console.warn("[Auth] Clerk publishable key not configured. Running without auth.");
    return <AppStack />;
  }

  return (
    <ClerkProvider publishableKey={CLERK_KEY} tokenCache={tokenCache}>
      <ClerkLoaded>
        <RevenueCatInit />
        <AppStack />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
