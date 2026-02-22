import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Pressable,
  PanResponder,
  Animated,
} from "react-native";
import { playCachedAudio, predownloadAudio } from "../../src/services/audio-cache";
import {
  QUIZ_WORDS,
  CATEGORY_EMOJIS,
  ALL_CATEGORIES,
  QuizWord,
} from "../../src/data/quiz-words";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - 32 - CARD_GAP) / 2;

type Mode = "flashcard" | "game" | "cardwall";

function playAudio(word: QuizWord) {
  playCachedAudio(word.waudio);
}

function CategoryBar({
  selected,
  onSelect,
}: {
  selected: string[];
  onSelect: (cats: string[]) => void;
}) {
  const toggle = (cat: string) => {
    if (selected.includes(cat)) {
      onSelect(selected.filter((c) => c !== cat));
    } else {
      onSelect([...selected, cat]);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryBar}
      style={styles.categoryScroll}
    >
      {ALL_CATEGORIES.map((cat) => {
        const active = selected.includes(cat);
        return (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => toggle(cat)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {CATEGORY_EMOJIS[cat] ?? ""} {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function FlashCardMode({ words }: { words: QuizWord[] }) {
  const [index, setIndex] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;
  const indexRef = useRef(index);
  const wordsLenRef = useRef(words.length);
  indexRef.current = index;
  wordsLenRef.current = words.length;

  useEffect(() => {
    setIndex(0);
  }, [words.length]);

  useEffect(() => {
    if (words.length > 0) {
      playAudio(words[index]);
      const next = words.slice(index + 1, index + 3).map((w) => w.waudio);
      if (next.length > 0) predownloadAudio(next);
    }
  }, [index, words.length]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dy) > 12 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderRelease: (_, g) => {
        if (g.dy < -40 && indexRef.current < wordsLenRef.current - 1) {
          setIndex((i) => i + 1);
        } else if (g.dy > 40 && indexRef.current > 0) {
          setIndex((i) => i - 1);
        }
      },
    })
  ).current;

  if (words.length === 0) return <EmptyState />;

  const word = words[index];

  return (
    <View style={styles.flashOuter} {...panResponder.panHandlers}>
      <Animated.View style={{ transform: [{ translateY }], alignItems: "center", width: "100%" }}>
        <View style={styles.cardWrapper}>
          <View style={styles.stackCard3} />
          <View style={styles.stackCard2} />
          <View style={styles.card}>
            <Image
              source={{ uri: word.icon }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={styles.cardBottom}>
              <Text style={styles.cardWord}>
                {word.english.charAt(0).toUpperCase() + word.english.slice(1)}
              </Text>
              <TouchableOpacity
                style={styles.audioBtn}
                onPress={() => playAudio(word)}
              >
                <Text style={{ fontSize: 20 }}>🔊</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.kannadaWord}>{word.kannada}</Text>
        <Text style={styles.kanglishWord}>{word.kanglish}</Text>
        <Text style={styles.navCounter}>{index + 1} / {words.length}</Text>
        <Text style={styles.swipeHint}>↑ swipe to go next</Text>
      </Animated.View>
    </View>
  );
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestion(
  words: QuizWord[],
  allWords: QuizWord[]
): { correct: QuizWord; options: QuizWord[] } | null {
  if (words.length < 4) return null;
  const correct = words[Math.floor(Math.random() * words.length)];
  const samePool = words.filter((w) => w.english !== correct.english);
  const fallbackPool = allWords.filter((w) => w.english !== correct.english);
  const pool = samePool.length >= 3 ? samePool : fallbackPool;
  const distractors = shuffleArray(pool).slice(0, 3);
  if (distractors.length < 3) return null;
  return { correct, options: shuffleArray([correct, ...distractors]) };
}

function GameMode({ words, allWords }: { words: QuizWord[]; allWords: QuizWord[] }) {
  const [question, setQuestion] = useState(() => buildQuestion(words, allWords));
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const nextQuestion = useCallback(() => {
    setSelected(null);
    setQuestion(buildQuestion(words, allWords));
  }, [words, allWords]);

  useEffect(() => {
    setSelected(null);
    setScore(0);
    setTotal(0);
    setQuestion(buildQuestion(words, allWords));
  }, [words.length]);

  useEffect(() => {
    if (question) {
      playAudio(question.correct);
    }
  }, [question?.correct.english]);

  if (!question || words.length < 4) {
    return (
      <View style={styles.centeredMessage}>
        <Text style={styles.emptyText}>
          Select a category with at least 4 words to play
        </Text>
      </View>
    );
  }

  const handleSelect = (word: QuizWord) => {
    if (selected) return;
    const isRight = word.english === question.correct.english;
    setSelected(word.english);
    setTotal((t) => t + 1);
    if (isRight) setScore((s) => s + 1);
    playAudio(question.correct);
    setTimeout(() => nextQuestion(), 1500);
  };

  return (
    <View style={styles.gameContainer}>
      <View style={styles.scoreRow}>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>Score: {score}/{total}</Text>
        </View>
      </View>

      <View style={styles.gameGrid}>
        {question.options.map((opt, i) => {
          const isSelected = selected === opt.english;
          const isRight = opt.english === question.correct.english;
          const showGreen = isSelected && isRight;
          const showRed = isSelected && !isRight;

          return (
            <Pressable
              key={i}
              style={styles.gameCell}
              onPress={() => handleSelect(opt)}
            >
              <Image
                source={{ uri: opt.icon }}
                style={styles.gameCellImage}
                resizeMode="cover"
              />
              {showGreen && (
                <View style={[styles.selectionCircle, styles.circleGreen]} />
              )}
              {showRed && (
                <View style={[styles.selectionCircle, styles.circleRed]} />
              )}
              {selected && !isSelected && isRight && (
                <View style={[styles.selectionCircle, styles.circleGreenOutline]} />
              )}
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.gameAnswerWord}>
        {selected
          ? question.correct.english.charAt(0).toUpperCase() +
            question.correct.english.slice(1)
          : "?"}
      </Text>
      {selected && (
        <Text style={styles.gameKannada}>{question.correct.kannada}</Text>
      )}
    </View>
  );
}

function CardWallMode({ words }: { words: QuizWord[] }) {
  if (words.length === 0) return <EmptyState />;

  return (
    <FlatList
      data={words}
      keyExtractor={(item, i) => `${item.english}-${i}`}
      numColumns={2}
      columnWrapperStyle={styles.wallRow}
      contentContainerStyle={styles.wallContent}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.wallCard}
          onPress={() => playAudio(item)}
          activeOpacity={0.85}
        >
          <Image
            source={{ uri: item.icon }}
            style={styles.wallCardImage}
            resizeMode="cover"
          />
          <Text style={styles.wallCardText}>
            {item.english.charAt(0).toUpperCase() + item.english.slice(1)}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}

function EmptyState() {
  return (
    <View style={styles.centeredMessage}>
      <Text style={styles.emptyText}>No words in this category</Text>
    </View>
  );
}

const MODES: { key: Mode; label: string; emoji: string }[] = [
  { key: "flashcard", label: "Flash Card", emoji: "🃏" },
  { key: "game", label: "Game", emoji: "🎮" },
  { key: "cardwall", label: "Card Wall", emoji: "🔲" },
];

function ModeBar({ mode, onMode }: { mode: Mode; onMode: (m: Mode) => void }) {
  return (
    <View style={styles.modeBar}>
      {MODES.map((m) => (
        <TouchableOpacity
          key={m.key}
          style={[styles.modeBtn, mode === m.key && styles.modeBtnActive]}
          onPress={() => onMode(m.key)}
        >
          <Text style={[styles.modeBtnText, mode === m.key && styles.modeBtnTextActive]}>
            {m.emoji} {m.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function QuizScreen() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Animals"]);
  const [mode, setMode] = useState<Mode>("flashcard");

  useEffect(() => {
    const animalUrls = QUIZ_WORDS
      .filter((w) => w.category === "Animals")
      .slice(0, 10)
      .map((w) => w.waudio);
    predownloadAudio(animalUrls);
  }, []);

  const filteredWords =
    selectedCategories.length > 0
      ? QUIZ_WORDS.filter((w) => selectedCategories.includes(w.category))
      : QUIZ_WORDS;

  return (
    <View style={styles.root}>
      <CategoryBar selected={selectedCategories} onSelect={setSelectedCategories} />
      <View style={styles.content}>
        {mode === "flashcard" && <FlashCardMode words={filteredWords} />}
        {mode === "game" && <GameMode words={filteredWords} allWords={QUIZ_WORDS} />}
        {mode === "cardwall" && <CardWallMode words={filteredWords} />}
      </View>
      <ModeBar mode={mode} onMode={setMode} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F2F7", flexDirection: "column" },
  categoryScroll: { flexGrow: 0, flexShrink: 0 },
  categoryBar: { paddingHorizontal: 14, paddingVertical: 10, gap: 8, flexDirection: "row", alignItems: "center" },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#E5E5EA" },
  chipActive: { backgroundColor: "#1C1C1E", borderColor: "#1C1C1E" },
  chipText: { fontSize: 13, fontWeight: "600", color: "#3C3C43" },
  chipTextActive: { color: "#fff" },
  content: { flex: 1 },
  flashOuter: { flex: 1, alignItems: "center", paddingTop: 16, paddingHorizontal: 20 },
  cardWrapper: { width: SCREEN_WIDTH - 40, marginBottom: 20 },
  card: { width: SCREEN_WIDTH - 40, backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4, zIndex: 1 },
  stackCard2: { position: "absolute", bottom: -7, left: 10, right: 10, height: "100%", borderRadius: 20, backgroundColor: "#E5E5EA", zIndex: 0 },
  stackCard3: { position: "absolute", bottom: -14, left: 20, right: 20, height: "100%", borderRadius: 20, backgroundColor: "#D1D1D6", zIndex: -1 },
  cardImage: { width: "100%", height: SCREEN_WIDTH * 0.65 },
  cardBottom: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, paddingHorizontal: 20, gap: 12 },
  cardWord: { fontSize: 26, fontWeight: "700", color: "#1C1C1E" },
  audioBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#F2F2F7", borderWidth: 1.5, borderColor: "#E5E5EA", alignItems: "center", justifyContent: "center" },
  kannadaWord: { marginTop: 4, fontSize: 26, fontWeight: "700", color: "#1C1C1E" },
  kanglishWord: { marginTop: 2, fontSize: 13, color: "#8E8E93", fontStyle: "italic" },
  navCounter: { marginTop: 12, fontSize: 15, fontWeight: "600", color: "#636366" },
  swipeHint: { marginTop: 6, fontSize: 12, color: "#AEAEB2" },
  gameContainer: { flex: 1, alignItems: "center", paddingTop: 12, paddingHorizontal: 16 },
  scoreRow: { width: "100%", alignItems: "flex-end", marginBottom: 10 },
  scoreBadge: { backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1.5, borderColor: "#E5E5EA" },
  scoreText: { fontSize: 13, fontWeight: "700", color: "#1C1C1E" },
  gameGrid: { flexDirection: "row", flexWrap: "wrap", gap: CARD_GAP, width: "100%" },
  gameCell: { width: CARD_WIDTH, height: CARD_WIDTH, borderRadius: 16, overflow: "hidden", backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  gameCellImage: { width: "100%", height: "100%" },
  selectionCircle: { position: "absolute", top: "50%", left: "50%", width: CARD_WIDTH * 0.7, height: CARD_WIDTH * 0.7, borderRadius: (CARD_WIDTH * 0.7) / 2, marginTop: -(CARD_WIDTH * 0.35), marginLeft: -(CARD_WIDTH * 0.35) },
  circleGreen: { backgroundColor: "rgba(52, 199, 89, 0.45)", borderWidth: 5, borderColor: "#34C759" },
  circleRed: { backgroundColor: "rgba(255, 59, 48, 0.35)", borderWidth: 5, borderColor: "#FF3B30" },
  circleGreenOutline: { backgroundColor: "transparent", borderWidth: 5, borderColor: "#34C759" },
  gameAnswerWord: { marginTop: 20, fontSize: 30, fontWeight: "800", color: "#1C1C1E", textAlign: "center" },
  gameKannada: { marginTop: 4, fontSize: 22, fontWeight: "600", color: "#636366", textAlign: "center" },
  wallContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  wallRow: { gap: CARD_GAP, marginBottom: CARD_GAP },
  wallCard: { width: CARD_WIDTH, backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  wallCardImage: { width: "100%", height: CARD_WIDTH },
  wallCardText: { fontSize: 13, fontWeight: "600", color: "#1C1C1E", textAlign: "center", paddingVertical: 10, paddingHorizontal: 8 },
  modeBar: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, gap: 8, backgroundColor: "#F2F2F7", borderTopWidth: 1, borderTopColor: "#E5E5EA" },
  modeBtn: { flex: 1, paddingVertical: 10, borderRadius: 20, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "#E5E5EA" },
  modeBtnActive: { backgroundColor: "#1C1C1E", borderColor: "#1C1C1E" },
  modeBtnText: { fontSize: 12, fontWeight: "700", color: "#3C3C43" },
  modeBtnTextActive: { color: "#fff" },
  centeredMessage: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyText: { fontSize: 16, color: "#8E8E93", textAlign: "center", fontWeight: "500" },
});
