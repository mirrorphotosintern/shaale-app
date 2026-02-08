import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useQuestStore } from "../../stores/quest-store";

export default function DialogOverlay() {
  const { activeDialog, dismissDialog } = useQuestStore();

  if (!activeDialog) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.dialogBox}
        onPress={dismissDialog}
        activeOpacity={0.9}
      >
        {/* NPC name */}
        <View style={styles.nameTag}>
          <Text style={styles.nameKannada}>{activeDialog.npcKannada}</Text>
          <Text style={styles.nameEnglish}>{activeDialog.npc}</Text>
        </View>

        {/* Dialog text */}
        <Text style={styles.kannadaText}>{activeDialog.kannada}</Text>
        <Text style={styles.englishText}>{activeDialog.english}</Text>

        {/* Words learned indicator */}
        {activeDialog.words.length > 0 && (
          <View style={styles.wordsRow}>
            {activeDialog.words.map((word, i) => (
              <View key={i} style={styles.wordBadge}>
                <Text style={styles.wordText}>✨ {word}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.tapHint}>Tap to continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    bottom: 160,
    left: 12,
    right: 12,
  },
  dialogBox: {
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#8B5CF6",
  },
  nameTag: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
    gap: 8,
  },
  nameKannada: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFD700",
  },
  nameEnglish: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  kannadaText: {
    fontSize: 22,
    color: "#ffffff",
    marginBottom: 4,
    lineHeight: 32,
  },
  englishText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginBottom: 8,
  },
  wordsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  wordBadge: {
    backgroundColor: "rgba(139, 92, 246, 0.3)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#8B5CF6",
  },
  wordText: {
    fontSize: 13,
    color: "#E9D5FF",
  },
  tapHint: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "right",
  },
});
