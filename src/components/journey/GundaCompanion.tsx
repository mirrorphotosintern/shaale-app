import { useEffect, useRef } from "react"
import { View, Text, StyleSheet, Animated } from "react-native"
import { GundaState } from "../../types/journey"

interface Props {
  gundaState: GundaState
  completedLevels: number[]
  totalCoins: number
}

const STATE_CONFIG: Record<GundaState, { emoji: string; label: string; color: string }> = {
  egg: {
    emoji: "🥚",
    label: "The egg is warming...",
    color: "#F59E0B",
  },
  hatchling: {
    emoji: "🐣",
    label: "Baby Gubbi hatched!",
    color: "#10B981",
  },
  growing: {
    emoji: "🐦",
    label: "Gubbi is growing!",
    color: "#3B82F6",
  },
  flying: {
    emoji: "🕊️",
    label: "Gubbi is flying!",
    color: "#8B5CF6",
  },
}

export default function GundaCompanion({ gundaState, completedLevels, totalCoins }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current
  const config = STATE_CONFIG[gundaState]

  // Egg pulse for warmth effect
  useEffect(() => {
    if (gundaState !== "egg") return
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [gundaState])

  const progressFraction = completedLevels.length / 15
  const phase =
    completedLevels.length < 3
      ? "Phase 1: The Egg"
      : completedLevels.length < 10
      ? "Phase 2: The Bond"
      : "Phase 3: The Journey"

  return (
    <View style={styles.container}>
      {/* Gunda + Companion area */}
      <View style={styles.companionRow}>
        <Text style={styles.gundaEmoji}>🐻</Text>
        <View style={styles.journeyInfo}>
          <Text style={styles.phaseName}>{phase}</Text>
          <Text style={styles.subtext}>{completedLevels.length}/15 letters learned</Text>
        </View>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Text style={[styles.stateEmoji]}>{config.emoji}</Text>
        </Animated.View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressFraction * 100}%`, backgroundColor: config.color }]} />
      </View>
      <Text style={[styles.stateLabel, { color: config.color }]}>{config.label}</Text>

      {/* Coins */}
      <View style={styles.coinsRow}>
        <Text style={styles.coinIcon}>🪙</Text>
        <Text style={styles.coinsText}>{totalCoins} coins</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1F2937",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#374151",
    gap: 10,
  },
  companionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  gundaEmoji: { fontSize: 36 },
  journeyInfo: { flex: 1 },
  phaseName: {
    color: "#F9FAFB",
    fontSize: 14,
    fontWeight: "700",
  },
  subtext: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 2,
  },
  stateEmoji: { fontSize: 36 },
  progressTrack: {
    height: 8,
    backgroundColor: "#374151",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  stateLabel: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  coinsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  coinIcon: { fontSize: 14 },
  coinsText: {
    color: "#FCD34D",
    fontSize: 13,
    fontWeight: "700",
  },
})
