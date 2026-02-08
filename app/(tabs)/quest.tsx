import React, { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GameWebView from "../../src/components/quest/game-webview";
import VirtualDPad from "../../src/components/quest/virtual-dpad";
import ActionButton from "../../src/components/quest/action-button";
import GameHUD from "../../src/components/quest/game-hud";
import DialogOverlay from "../../src/components/quest/dialog-overlay";
import { useQuestStore } from "../../src/stores/quest-store";

export default function QuestScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const { currentArea } = useQuestStore();
  const showControls = currentArea !== "charselect";

  return (
    <View style={styles.container}>
      {/* Game Canvas */}
      <GameWebView onReady={() => setIsLoading(false)} />

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>ಲೋಡ್ ಆಗುತ್ತಿದೆ...</Text>
          <Text style={styles.loadingSubtext}>Loading Quest World</Text>
        </View>
      )}

      {/* HUD overlay - only show during gameplay */}
      {showControls && (
        <SafeAreaView style={styles.hudContainer} pointerEvents="box-none">
          <GameHUD />
        </SafeAreaView>
      )}

      {/* Dialog overlay */}
      <DialogOverlay />

      {/* Controls overlay - only show during gameplay */}
      {showControls && (
        <View style={styles.controlsContainer} pointerEvents="box-none">
          <View style={styles.dpadContainer}>
            <VirtualDPad />
          </View>
          <View style={styles.actionContainer}>
            <ActionButton />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  loadingText: {
    fontSize: 18,
    color: "#8B5CF6",
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  hudContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  dpadContainer: {
    opacity: 0.8,
  },
  actionContainer: {
    opacity: 0.8,
  },
});
