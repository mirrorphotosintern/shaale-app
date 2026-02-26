import { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useOAuth } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import { identifyUser } from "../src/services/purchases";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const router = useRouter();
  const { startOAuthFlow: startGoogle } = useOAuth({ strategy: "oauth_google" });

  const handleGoogle = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startGoogle();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        await identifyUser(createdSessionId);
        router.back();
      }
    } catch (err) {
      console.error("[SignIn] Google OAuth error:", err);
    }
  }, [startGoogle, router]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Sign in to Shaale</Text>
        <Text style={styles.subtitle}>
          Sign in to access premium Kannada learning content.
        </Text>

        <TouchableOpacity style={styles.googleButton} onPress={handleGoogle} activeOpacity={0.85}>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.guestButton} onPress={() => router.back()}>
          <Text style={styles.guestText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F9FAFB",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 20,
  },
  googleButton: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  googleButtonText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 15,
  },
  appleButton: {
    width: "100%",
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  appleButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  guestButton: {
    marginTop: 8,
    paddingVertical: 10,
  },
  guestText: {
    color: "#6B7280",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
