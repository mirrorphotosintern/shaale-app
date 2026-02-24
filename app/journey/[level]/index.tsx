import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { JourneyLevel, JourneyScreen } from "../../../src/types/journey"
import { getLevelConfig } from "../../../src/data/journey/journey-config"
import { completeLevel } from "../../../src/services/journey-progress"
import ScreenRenderer from "../../../src/components/journey/screens/ScreenRenderer"
import FinishScreen from "../../../src/components/journey/screens/FinishScreen"

function loadLevelData(level: number): JourneyLevel | null {
  try {
    switch (level) {
      case 1: return require("../../../src/data/journey/levels/1.json")
      case 2: return require("../../../src/data/journey/levels/2.json")
      case 3: return require("../../../src/data/journey/levels/3.json")
      case 4: return require("../../../src/data/journey/levels/4.json")
      case 5: return require("../../../src/data/journey/levels/5.json")
      case 6: return require("../../../src/data/journey/levels/6.json")
      case 7: return require("../../../src/data/journey/levels/7.json")
      case 8: return require("../../../src/data/journey/levels/8.json")
      case 9: return require("../../../src/data/journey/levels/9.json")
      case 10: return require("../../../src/data/journey/levels/10.json")
      case 11: return require("../../../src/data/journey/levels/11.json")
      case 12: return require("../../../src/data/journey/levels/12.json")
      case 13: return require("../../../src/data/journey/levels/13.json")
      case 14: return require("../../../src/data/journey/levels/14.json")
      case 15: return require("../../../src/data/journey/levels/15.json")
      default: return null
    }
  } catch {
    return null
  }
}

export default function LevelPlayer() {
  const router = useRouter()
  const params = useLocalSearchParams<{ level: string }>()
  const levelNum = parseInt(params.level || "1", 10)

  const levelConfig = getLevelConfig(levelNum)
  const levelData = loadLevelData(levelNum)

  const [screenIndex, setScreenIndex] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [coinsEarned, setCoinsEarned] = useState(0)

  const screens: JourneyScreen[] = levelData?.screens ?? []
  const currentScreen = screens[screenIndex]

  const handleNext = useCallback(async () => {
    if (!currentScreen) return

    if (currentScreen.condition === "finish") {
      // Level complete — save progress
      const coin = currentScreen.coin ?? 0
      setCoinsEarned(coin)
      await completeLevel(levelNum, coin)
      setCompleted(true)
      return
    }

    if (screenIndex < screens.length - 1) {
      setScreenIndex((i) => i + 1)
    } else {
      // Last screen — auto-finish
      const lastCoin = screens.find((s) => s.condition === "finish")?.coin ?? 0
      setCoinsEarned(lastCoin)
      await completeLevel(levelNum, lastCoin)
      setCompleted(true)
    }
  }, [currentScreen, screenIndex, screens, levelNum])

  const nextLevel = levelNum < 15 ? levelNum + 1 : null

  const handleFinish = useCallback(() => {
    if (nextLevel) {
      router.replace(`/journey/${nextLevel}` as any)
    } else {
      router.replace("/(tabs)/letters" as any)
    }
  }, [router, nextLevel])

  const handleClose = useCallback(() => {
    router.back()
  }, [router])

  if (!levelConfig || !levelData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Level not found</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  if (completed) {
    return (
      <FinishScreen
        level={levelNum}
        levelConfig={levelConfig}
        coinsEarned={coinsEarned}
        nextLevel={nextLevel}
        onFinish={handleFinish}
      />
    )
  }

  if (!currentScreen) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No screens available</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const progress = screens.length > 0 ? (screenIndex + 1) / screens.length : 0

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.backBtn}>
          <Text style={styles.backBtnText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerLetter}>{levelConfig.letter}</Text>
          <Text style={styles.headerChapter}>{levelConfig.chapter}</Text>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {screenIndex + 1}/{screens.length}
          </Text>
        </View>
      </SafeAreaView>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Screen content */}
      <View style={styles.content}>
        <ScreenRenderer
          screen={currentScreen}
          onNext={handleNext}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#111827" },
  container: {
    flex: 1,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "#1F2937",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  headerLetter: {
    color: "#8B5CF6",
    fontSize: 22,
    fontWeight: "bold",
    lineHeight: 26,
  },
  headerChapter: {
    color: "#9CA3AF",
    fontSize: 11,
    textAlign: "center",
  },
  progressContainer: { width: 36, alignItems: "flex-end" },
  progressText: { color: "#6B7280", fontSize: 12 },
  progressBar: {
    height: 3,
    backgroundColor: "#374151",
  },
  progressFill: {
    height: 3,
    backgroundColor: "#8B5CF6",
    borderRadius: 2,
  },
  content: { flex: 1 },
  errorText: { color: "#9CA3AF", fontSize: 16, marginBottom: 16 },
  closeBtn: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  closeBtnText: { color: "#fff", fontWeight: "600" },
})
