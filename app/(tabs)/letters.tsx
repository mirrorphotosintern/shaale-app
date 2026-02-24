import { useState, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native"
import { useRouter, useFocusEffect } from "expo-router"
import { LEVEL_CONFIGS } from "../../src/data/journey/journey-config"
import {
  loadProgress,
  isLevelUnlocked,
} from "../../src/services/journey-progress"
import { JourneyProgress } from "../../src/types/journey"
import GundaCompanion from "../../src/components/journey/GundaCompanion"
import AjjiLetter from "../../src/components/journey/AjjiLetter"

export default function JourneyMapScreen() {
  const router = useRouter()
  const [progress, setProgress] = useState<JourneyProgress | null>(null)
  const [showAjjiLetter, setShowAjjiLetter] = useState<5 | 10 | 15 | null>(null)

  useFocusEffect(
    useCallback(() => {
      loadProgress().then((p) => {
        setProgress(p)
        // Check if a milestone was just reached and letter not yet seen
        const milestones: (5 | 10 | 15)[] = [5, 10, 15]
        for (const m of milestones) {
          if (p.completedLevels.includes(m) && !p.ajjiLettersSeen.includes(m)) {
            setShowAjjiLetter(m)
            break
          }
        }
      })
    }, [])
  )

  const handleLevelPress = (level: number) => {
    if (!progress) return
    if (!isLevelUnlocked(level, progress.completedLevels)) return
    router.push(`/journey/${level}` as any)
  }

  const handleAjjiLetterClose = async () => {
    setShowAjjiLetter(null)
    if (showAjjiLetter && progress) {
      const { markAjjiLetterSeen } = await import("../../src/services/journey-progress")
      await markAjjiLetterSeen(showAjjiLetter)
      const updated = await loadProgress()
      setProgress(updated)
    }
  }

  if (!progress) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading journey...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header narrative */}
        <View style={styles.heroHeader}>
          <Text style={styles.heroTitle}>Gundana Yatre</Text>
          <Text style={styles.heroSub}>Journey to Ajji's Village · ಗುಂಡನ ಯಾತ್ರೆ</Text>
        </View>

        {/* Companion widget */}
        <GundaCompanion
          gundaState={progress.gundaState}
          completedLevels={progress.completedLevels}
          totalCoins={progress.totalCoins}
        />

        {/* Phase banners + level cards */}
        {LEVEL_CONFIGS.map((config, idx) => {
          const isCompleted = progress.completedLevels.includes(config.level)
          const unlocked = isLevelUnlocked(config.level, progress.completedLevels)
          const isCurrent = !isCompleted && unlocked
          const isLocked = !unlocked

          // Phase banner
          const showPhaseBanner =
            idx === 0 ||
            LEVEL_CONFIGS[idx - 1].phase !== config.phase

          return (
            <View key={config.level}>
              {showPhaseBanner && (
                <View style={styles.phaseBanner}>
                  <Text style={styles.phaseBannerText}>
                    {config.phase === 1
                      ? "Phase 1: The Egg"
                      : config.phase === 2
                      ? "Phase 2: The Bond"
                      : "Phase 3: The Journey"}
                  </Text>
                  <Text style={styles.phaseBannerSub}>
                    {config.phase === 1
                      ? "Levels 1–5 · Egg warms, Gubbi hatches"
                      : config.phase === 2
                      ? "Levels 6–10 · Raising Gubbi, blue wings"
                      : "Levels 11–15 · Gubbi takes wing, Ajji's village"}
                  </Text>
                </View>
              )}

              {/* Path connector */}
              {idx > 0 && (
                <View style={styles.connector}>
                  <View
                    style={[
                      styles.connectorLine,
                      isCompleted && styles.connectorDone,
                    ]}
                  />
                </View>
              )}

              {/* Level Card */}
              <TouchableOpacity
                style={[
                  styles.card,
                  isCompleted && styles.cardCompleted,
                  isCurrent && styles.cardCurrent,
                  isLocked && styles.cardLocked,
                  config.milestone && styles.cardMilestone,
                ]}
                onPress={() => handleLevelPress(config.level)}
                activeOpacity={isLocked ? 1 : 0.8}
                disabled={isLocked}
              >
                {/* Left: status icon */}
                <View style={styles.cardStatus}>
                  {isCompleted ? (
                    <View style={styles.statusBadgeCompleted}>
                      <Text style={styles.statusIcon}>✓</Text>
                    </View>
                  ) : isCurrent ? (
                    <View style={styles.statusBadgeCurrent}>
                      <Text style={styles.statusIcon}>▶</Text>
                    </View>
                  ) : (
                    <View style={styles.statusBadgeLocked}>
                      <Text style={styles.statusIcon}>🔒</Text>
                    </View>
                  )}
                </View>

                {/* Center: info */}
                <View style={styles.cardInfo}>
                  <View style={styles.cardTitleRow}>
                    <Text style={[styles.cardLetter, isLocked && styles.textDim]}>
                      {config.letter}
                    </Text>
                    {config.milestone && (
                      <View style={styles.milestoneBadge}>
                        <Text style={styles.milestoneBadgeText}>★ Milestone</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.cardChapter, isLocked && styles.textDim]}>
                    {isLocked ? `Complete Level ${config.level - 1} to unlock` : config.chapter}
                  </Text>
                  {!isLocked && (
                    <Text style={styles.cardTopics}>{config.topics}</Text>
                  )}
                </View>

                {/* Right: level number */}
                <View style={styles.cardLevelNum}>
                  <Text style={[styles.levelNumText, isLocked && styles.textDim]}>
                    {config.level}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )
        })}

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Ajji's letter modal */}
      {showAjjiLetter && (
        <AjjiLetter
          visible={true}
          milestone={showAjjiLetter}
          onClose={handleAjjiLetterClose}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827" },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 0, paddingBottom: 32 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#9CA3AF", fontSize: 16 },

  heroHeader: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 24,
    backgroundColor: "#1F2937",
    marginBottom: 12,
  },
  heroTitle: {
    color: "#F9FAFB",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
  },
  heroSub: {
    color: "#8B5CF6",
    fontSize: 14,
    marginTop: 4,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  phaseBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#1E1B4B",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#8B5CF6",
  },
  phaseBannerText: {
    color: "#C4B5FD",
    fontSize: 14,
    fontWeight: "700",
  },
  phaseBannerSub: {
    color: "#7C3AED",
    fontSize: 11,
    marginTop: 2,
  },

  connector: { alignItems: "center", height: 24, justifyContent: "center" },
  connectorLine: {
    width: 2,
    height: 20,
    backgroundColor: "#374151",
    borderRadius: 1,
  },
  connectorDone: { backgroundColor: "#10B981" },

  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: "#374151",
    gap: 12,
  },
  cardCompleted: {
    borderColor: "#10B981",
    backgroundColor: "#022C22",
  },
  cardCurrent: {
    borderColor: "#8B5CF6",
    backgroundColor: "#1E1B4B",
  },
  cardLocked: {
    opacity: 0.6,
  },
  cardMilestone: {
    borderColor: "#F59E0B",
  },

  cardStatus: { width: 40, alignItems: "center" },
  statusBadgeCompleted: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadgeCurrent: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadgeLocked: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
  },
  statusIcon: { fontSize: 16 },

  cardInfo: { flex: 1, gap: 2 },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardLetter: {
    color: "#F9FAFB",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 28,
  },
  milestoneBadge: {
    backgroundColor: "#78350F",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  milestoneBadgeText: {
    color: "#FCD34D",
    fontSize: 10,
    fontWeight: "700",
  },
  cardChapter: {
    color: "#F9FAFB",
    fontSize: 13,
    fontWeight: "600",
  },
  cardTopics: {
    color: "#6B7280",
    fontSize: 11,
    marginTop: 1,
  },

  cardLevelNum: {
    width: 32,
    alignItems: "center",
  },
  levelNumText: {
    color: "#4B5563",
    fontSize: 18,
    fontWeight: "bold",
  },
  textDim: { color: "#4B5563" },
  bottomPad: { height: 24 },
})
