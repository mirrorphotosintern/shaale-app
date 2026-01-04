import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import {
  KANNADA_CONSONANTS,
  KANNADA_INDEPENDENT_VOWELS,
  VIRAMA,
  ANUSVARA,
  VISARGA,
  TOP_SWARAS,
  RIGHT_SWARAS,
  BOTTOM_SWARAS,
  LEFT_SWARAS,
  ALL_VARNAMALE_LETTERS,
  LETTER_TIMINGS,
  VOWEL_TO_MATRA_MAP,
  buildAkshara,
  splitIntoAksharas,
} from "../../src/lib/kannada";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type GameMode = "play" | "akshara" | "ottakshara";
type LetterState = "upcoming" | "current" | "completed";

// Grid layout constants
const GRID_COLS = 5;
const GRID_ROWS = 7;

export default function TypeScreen() {
  const [gameMode, setGameMode] = useState<GameMode>("play");
  const [currentWord, setCurrentWord] = useState("");
  const [wordsFound, setWordsFound] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showModeSelector, setShowModeSelector] = useState(false);

  // Play mode state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(-1);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Ottakshara state
  const [pendingConsonants, setPendingConsonants] = useState<string[]>([]);
  const [hasRootSelection, setHasRootSelection] = useState(false);

  // Calculate sizes based on screen width
  const cardSize = Math.min(SCREEN_WIDTH - 32, 400);
  const tileSize = Math.floor((cardSize * 0.6) / GRID_COLS) - 4;
  const swaraSize = Math.floor(cardSize * 0.11);
  const tileFontSize = Math.max(14, Math.floor(tileSize * 0.5));
  const swaraFontSize = Math.max(14, Math.floor(swaraSize * 0.5));

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      timeoutsRef.current.forEach((t) => clearTimeout(t));
    };
  }, [sound]);

  // Stop audio when switching modes
  useEffect(() => {
    if (gameMode !== "play" && sound) {
      sound.stopAsync();
      setIsPlaying(false);
      setCurrentHighlightIndex(-1);
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    }
  }, [gameMode]);

  const getLetterState = (letter: string): LetterState => {
    if (currentHighlightIndex === -1) return "upcoming";

    const letterIndex = ALL_VARNAMALE_LETTERS.findIndex((l) => {
      if (letter === ANUSVARA && l === "ಅಂ") return true;
      if (letter === VISARGA && l === "ಅಃ") return true;
      return l === letter;
    });

    if (letterIndex === -1) return "upcoming";
    if (letterIndex < currentHighlightIndex) return "completed";
    if (letterIndex === currentHighlightIndex) return "current";
    return "upcoming";
  };

  const handlePlayAudio = async () => {
    try {
      if (isPlaying && sound) {
        await sound.stopAsync();
        setIsPlaying(false);
        setCurrentHighlightIndex(-1);
        timeoutsRef.current.forEach((t) => clearTimeout(t));
        timeoutsRef.current = [];
        return;
      }

      // Load and play audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: "https://ufmwnqllgqrfkdfahptv.supabase.co/storage/v1/object/public/varnamale/audios/varnamalesong.mp3" },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);
      setCurrentHighlightIndex(0);

      // Schedule letter highlights
      LETTER_TIMINGS.forEach((timing, index) => {
        const timeoutId = setTimeout(() => {
          setCurrentHighlightIndex(index);
        }, timing);
        timeoutsRef.current.push(timeoutId);
      });

      // Handle playback end
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          setCurrentHighlightIndex(-1);
          timeoutsRef.current.forEach((t) => clearTimeout(t));
          timeoutsRef.current = [];
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Error", "Could not play audio");
    }
  };

  const onTapSwara = (swara: string) => {
    if (gameMode === "play") return;

    if (pendingConsonants.length > 0) {
      // Complete the akshara with the selected vowel
      const lastConsonant = pendingConsonants[pendingConsonants.length - 1];
      const ak = buildAkshara(lastConsonant, swara);

      // Remove pending consonants from word and add complete akshara
      const wordWithoutPending = currentWord.slice(
        0,
        currentWord.length - pendingConsonants.length - (pendingConsonants.length > 0 ? pendingConsonants.length : 0)
      );

      // Actually rebuild properly - remove all pending consonant+virama sequences
      let newWord = currentWord;
      for (let i = 0; i < pendingConsonants.length; i++) {
        if (newWord.endsWith(VIRAMA)) {
          newWord = newWord.slice(0, -1);
        }
        if (newWord.endsWith(pendingConsonants[pendingConsonants.length - 1 - i])) {
          newWord = newWord.slice(0, -1);
        }
      }

      setCurrentWord(newWord + ak);
      setPendingConsonants([]);
      setHasRootSelection(false);
    } else {
      // Pure vowel insertion
      setCurrentWord((w) => w + swara);
    }
  };

  const onTapConsonant = (consonant: string) => {
    if (gameMode === "play") return;

    if (gameMode === "akshara") {
      // Simple mode - just add consonant
      setCurrentWord((w) => w + consonant);
    } else {
      // Ottakshara mode - add consonant with virama
      const consonantWithVirama = consonant + VIRAMA;
      setCurrentWord((w) => w + consonantWithVirama);
      setPendingConsonants((prev) => [...prev, consonant]);
      setHasRootSelection(true);
    }
  };

  const handleBackspace = () => {
    const aks = splitIntoAksharas(currentWord);
    if (aks.length === 0) return;
    setCurrentWord(aks.slice(0, -1).join(""));
    setPendingConsonants([]);
    setHasRootSelection(false);
  };

  const handleSpace = () => {
    setCurrentWord((w) => w + " ");
  };

  const handleSubmit = () => {
    const word = currentWord.trim();
    if (!word) return;

    const akLen = splitIntoAksharas(word).length;

    if (gameMode === "akshara" && akLen < 1) {
      Alert.alert("Invalid", "Need at least 1 akshara");
      return;
    }

    if (gameMode === "ottakshara" && akLen < 2) {
      Alert.alert("Invalid", "Need at least 2 aksharas");
      return;
    }

    // For now, accept all valid words (no dictionary check)
    setWordsFound((prev) => [...prev, word]);
    setScore((s) => s + 10);
    setCurrentWord("");
    setPendingConsonants([]);
    setHasRootSelection(false);
  };

  const handleClear = () => {
    setCurrentWord("");
    setPendingConsonants([]);
    setHasRootSelection(false);
  };

  const renderSwaraButton = (swara: string, key: string) => {
    const isAnusvara = swara === ANUSVARA;
    const isVisarga = swara === VISARGA;
    const displayLabel = isAnusvara ? "ಅಂ" : isVisarga ? "ಅಃ" : swara;
    const letterState = gameMode === "play" ? getLetterState(swara) : "upcoming";

    return (
      <TouchableOpacity
        key={key}
        style={[
          styles.swaraButton,
          { width: swaraSize, height: swaraSize },
          letterState === "current" && styles.swaraButtonCurrent,
          letterState === "completed" && styles.swaraButtonCompleted,
        ]}
        onPress={() => onTapSwara(swara)}
        disabled={gameMode === "play"}
      >
        <Text
          style={[
            styles.swaraText,
            { fontSize: swaraFontSize },
            letterState === "current" && styles.swaraTextCurrent,
            letterState === "completed" && styles.swaraTextCompleted,
          ]}
        >
          {displayLabel}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderConsonantGrid = () => {
    type GridItem = { kind: "cons"; value: string; index: number } | { kind: "blank"; value: string; index: number };
    const items: GridItem[] = KANNADA_CONSONANTS.map((c, idx) => ({ kind: "cons", value: c, index: idx }));
    // Add blank to make 35 items (5x7)
    items.push({ kind: "blank", value: "", index: -1 });

    return (
      <View style={[styles.consonantGrid, { width: tileSize * GRID_COLS + 8 }]}>
        {items.map((item, idx) => {
          if (item.kind === "blank") {
            return <View key={`blank-${idx}`} style={{ width: tileSize, height: tileSize }} />;
          }

          const letterState = gameMode === "play" ? getLetterState(item.value) : "upcoming";
          const display = gameMode === "play" ? item.value : gameMode === "akshara" ? item.value : item.value + VIRAMA;

          return (
            <TouchableOpacity
              key={`cons-${idx}`}
              style={[
                styles.consonantTile,
                { width: tileSize, height: tileSize },
                letterState === "current" && styles.consonantTileCurrent,
                letterState === "completed" && styles.consonantTileCompleted,
              ]}
              onPress={() => onTapConsonant(item.value)}
              disabled={gameMode === "play"}
            >
              <Text
                style={[
                  styles.consonantText,
                  { fontSize: tileFontSize },
                  letterState === "current" && styles.consonantTextCurrent,
                  letterState === "completed" && styles.consonantTextCompleted,
                ]}
              >
                {display}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Text style={styles.title}>KANNADA TYPEWRITER</Text>

        {/* Mode Selector */}
        <TouchableOpacity
          style={styles.modeSelector}
          onPress={() => setShowModeSelector(!showModeSelector)}
        >
          <Text style={styles.modeSelectorText}>
            {gameMode === "play" ? "Play (Learn Letters)" : gameMode === "akshara" ? "Akshara Mode" : "Ottakshara Mode"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#fff" />
        </TouchableOpacity>

        {showModeSelector && (
          <View style={styles.modeDropdown}>
            <TouchableOpacity
              style={styles.modeOption}
              onPress={() => { setGameMode("play"); setShowModeSelector(false); handleClear(); }}
            >
              <Text style={styles.modeOptionText}>Play (Learn Letters)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modeOption}
              onPress={() => { setGameMode("akshara"); setShowModeSelector(false); handleClear(); }}
            >
              <Text style={styles.modeOptionText}>Akshara Mode</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modeOption}
              onPress={() => { setGameMode("ottakshara"); setShowModeSelector(false); handleClear(); }}
            >
              <Text style={styles.modeOptionText}>Ottakshara Mode</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Play Mode Audio Button */}
        {gameMode === "play" && (
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={handlePlayAudio}
          >
            <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#fff" />
            <Ionicons name="volume-high" size={20} color="#fff" />
            <Text style={styles.playButtonText}>
              {isPlaying ? "Pause" : "Play Varnamale Song"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Word Display (Game modes only) */}
        {gameMode !== "play" && (
          <View style={styles.wordDisplay}>
            <Text style={styles.wordText}>{currentWord || "Tap letters to type..."}</Text>
          </View>
        )}

        {/* Type Grid */}
        <View style={[styles.gridContainer, { width: cardSize }]}>
          {/* Top Swaras */}
          <View style={styles.swaraRow}>
            {TOP_SWARAS.map((s, i) => renderSwaraButton(s, `top-${i}`))}
          </View>

          {/* Middle Section */}
          <View style={styles.middleSection}>
            {/* Left Swaras */}
            <View style={styles.swaraColumn}>
              {LEFT_SWARAS.map((s, i) => renderSwaraButton(s, `left-${i}`))}
            </View>

            {/* Center Consonant Grid */}
            {renderConsonantGrid()}

            {/* Right Swaras */}
            <View style={styles.swaraColumn}>
              {RIGHT_SWARAS.map((s, i) => renderSwaraButton(s, `right-${i}`))}
            </View>
          </View>

          {/* Bottom Swaras */}
          <View style={styles.swaraRow}>
            {BOTTOM_SWARAS.map((s, i) => renderSwaraButton(s, `bottom-${i}`))}
          </View>
        </View>

        {/* Action Buttons (Game modes only) */}
        {gameMode !== "play" && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleBackspace}>
              <Text style={styles.actionButtonText}>Backspace</Text>
            </TouchableOpacity>
            {gameMode === "ottakshara" && (
              <TouchableOpacity style={styles.actionButton} onPress={handleSpace}>
                <Text style={styles.actionButtonText}>Space</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.actionButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Instructions */}
        {gameMode === "play" ? (
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              Tap "Play Varnamale Song" to hear each letter pronounced.
              Letters will highlight as they are spoken.
            </Text>
          </View>
        ) : (
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              {gameMode === "akshara"
                ? "Tap consonants to add them. Tap vowels to add pure vowels."
                : "Tap consonants, then a vowel to complete the akshara. Example: ಕ + ಯ + ಓ = ಕ್ಯೋ"}
            </Text>
          </View>
        )}

        {/* Words Found (Game modes only) */}
        {gameMode !== "play" && wordsFound.length > 0 && (
          <View style={styles.wordsFound}>
            <Text style={styles.wordsFoundTitle}>Words Found: {wordsFound.length}</Text>
            <View style={styles.wordsList}>
              {wordsFound.map((word, idx) => (
                <View key={idx} style={styles.wordBadge}>
                  <Text style={styles.wordBadgeText}>{word}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.scoreText}>Score: {score}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  modeSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F46E5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  modeSelectorText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  modeDropdown: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  modeOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  modeOptionText: {
    color: "#fff",
    fontSize: 14,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  playButtonActive: {
    backgroundColor: "#DC2626",
  },
  playButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  wordDisplay: {
    width: "100%",
    backgroundColor: "rgba(0,128,128,0.3)",
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 50,
  },
  wordText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  gridContainer: {
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  swaraRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginVertical: 6,
  },
  swaraColumn: {
    justifyContent: "center",
    gap: 6,
  },
  middleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  swaraButton: {
    backgroundColor: "#FEF3C7",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#9CA3AF",
  },
  swaraButtonCurrent: {
    backgroundColor: "#EF4444",
    borderColor: "#DC2626",
  },
  swaraButtonCompleted: {
    backgroundColor: "#22C55E",
    borderColor: "#16A34A",
  },
  swaraText: {
    color: "#1F2937",
    fontWeight: "bold",
  },
  swaraTextCurrent: {
    color: "#fff",
  },
  swaraTextCompleted: {
    color: "#fff",
  },
  consonantGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    padding: 4,
    gap: 2,
  },
  consonantTile: {
    backgroundColor: "#fff",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  consonantTileCurrent: {
    backgroundColor: "#EF4444",
    borderColor: "#DC2626",
  },
  consonantTileCompleted: {
    backgroundColor: "#22C55E",
    borderColor: "#16A34A",
  },
  consonantText: {
    color: "#1F2937",
    fontWeight: "bold",
  },
  consonantTextCurrent: {
    color: "#fff",
  },
  consonantTextCompleted: {
    color: "#fff",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: "#374151",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#1F2937",
  },
  submitButton: {
    backgroundColor: "#2563EB",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  instructions: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: "100%",
  },
  instructionText: {
    color: "#9CA3AF",
    fontSize: 12,
    textAlign: "center",
  },
  wordsFound: {
    backgroundColor: "#14532D",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    borderWidth: 2,
    borderColor: "#22C55E",
  },
  wordsFoundTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  wordsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginBottom: 8,
  },
  wordBadge: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#22C55E",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  wordBadgeText: {
    color: "#166534",
    fontSize: 14,
    fontWeight: "600",
  },
  scoreText: {
    color: "#86EFAC",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});
