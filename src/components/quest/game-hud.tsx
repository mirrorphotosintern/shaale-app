import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useQuestStore } from "../../stores/quest-store";

const PET_EMOJI: Record<string, string> = {
  none: "",
  gubbi: "🐦",
  garuda: "🦅",
  gandaberunda: "🦅🦅",
};

const PET_NAME: Record<string, string> = {
  none: "",
  gubbi: "ಗುಬ್ಬಿ",
  garuda: "ಗರುಡ",
  gandaberunda: "ಗಂಡಭೇರುಂಡ",
};

const AREA_LABELS: Record<string, string> = {
  charselect: "",
  house: "ಮನೆ",
  courtyard: "ಅಂಗಳ",
};

export default function GameHUD() {
  const { wordsLearned, totalXp, petStage, currentArea } = useQuestStore();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Words count */}
        <View style={styles.stat}>
          <Text style={styles.statLabel}>ಪದಗಳು</Text>
          <Text style={styles.statValue}>{wordsLearned.length}</Text>
        </View>

        {/* XP */}
        <View style={styles.stat}>
          <Text style={styles.statLabel}>XP</Text>
          <Text style={styles.statValue}>{totalXp}</Text>
        </View>

        {/* Pet */}
        {petStage !== "none" && (
          <View style={styles.stat}>
            <Text style={styles.statLabel}>{PET_EMOJI[petStage]}</Text>
            <Text style={styles.petName}>{PET_NAME[petStage]}</Text>
          </View>
        )}
      </View>

      {/* Word ticker - show last learned word */}
      {wordsLearned.length > 0 && (
        <View style={styles.wordTicker}>
          <Text style={styles.tickerText}>
            ✨ {wordsLearned[wordsLearned.length - 1].kannada}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stat: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 60,
  },
  statLabel: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFD700",
  },
  petName: {
    fontSize: 10,
    color: "#FFD700",
  },
  wordTicker: {
    alignSelf: "center",
    marginTop: 4,
    backgroundColor: "rgba(139, 92, 246, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tickerText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
  },
});
