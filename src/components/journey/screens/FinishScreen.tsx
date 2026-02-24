import { useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
} from "react-native"
import { LevelConfig } from "../../../types/journey"

interface Props {
  level: number
  levelConfig: LevelConfig
  coinsEarned: number
  nextLevel: number | null
  onFinish: () => void
}

export default function FinishScreen({ level, levelConfig, coinsEarned, nextLevel, onFinish }: Props) {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const isMilestone = levelConfig.milestone

  return (
    <SafeAreaView style={[styles.container, isMilestone && styles.milestoneContainer]}>
      <Animated.View
        style={[styles.inner, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
      >
        <Text style={styles.emoji}>{isMilestone ? "🎉" : "⭐"}</Text>

        <Text style={styles.levelBadge}>Level {level} Complete!</Text>

        <Text style={styles.letter}>{levelConfig.letter}</Text>

        <Text style={styles.chapter}>{levelConfig.chapter}</Text>

        {isMilestone && levelConfig.milestoneMessage && (
          <View style={styles.milestoneBox}>
            <Text style={styles.milestoneText}>{levelConfig.milestoneMessage}</Text>
          </View>
        )}

        <View style={styles.coinsRow}>
          <Text style={styles.coinIcon}>🪙</Text>
          <Text style={styles.coinsText}>+{coinsEarned} coins earned!</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={onFinish} activeOpacity={0.85}>
          <Text style={styles.buttonText}>
            {nextLevel ? `Level ${nextLevel} →` : "Back to Journey Map 🗺️"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  milestoneContainer: {
    backgroundColor: "#1E1B4B",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  emoji: { fontSize: 72, marginBottom: 8 },
  levelBadge: {
    color: "#8B5CF6",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  letter: {
    color: "#F9FAFB",
    fontSize: 80,
    fontWeight: "bold",
    lineHeight: 88,
  },
  chapter: {
    color: "#D1D5DB",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  milestoneBox: {
    backgroundColor: "#312E81",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#8B5CF6",
    marginTop: 4,
  },
  milestoneText: {
    color: "#C4B5FD",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  coinsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  coinIcon: { fontSize: 24 },
  coinsText: {
    color: "#FCD34D",
    fontSize: 18,
    fontWeight: "700",
  },
  button: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
    minWidth: 240,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
})
