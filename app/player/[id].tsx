import { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function PlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    hlsUrl: string;
    title: string;
  }>();

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleOpenInBrowser = useCallback(() => {
    if (params.hlsUrl) {
      Linking.openURL(params.hlsUrl).catch(() => {});
    }
  }, [params.hlsUrl]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" hidden />

      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="close" size={28} color="#fff" />
      </TouchableOpacity>

      <View style={styles.centerContainer}>
        <Ionicons name="play-circle" size={80} color="#8B5CF6" />
        <Text style={styles.title} numberOfLines={2}>
          {params.title || "Video"}
        </Text>
        <Text style={styles.subtitle}>
          Video playback will be available in a future update.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={handleClose}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    marginBottom: 32,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
