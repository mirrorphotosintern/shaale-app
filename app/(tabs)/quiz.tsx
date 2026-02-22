import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import {
  KANNADA_CONSONANTS,
  KANNADA_INDEPENDENT_VOWELS,
} from "../../src/lib/kannada";

const ALL_LETTERS = [...KANNADA_INDEPENDENT_VOWELS, ...KANNADA_CONSONANTS];

// Romanized names for each letter
const LETTER_NAMES: Record<string, string> = {
  "ಅ": "a", "ಆ": "aa", "ಇ": "i", "ಈ": "ee", "ಉ": "u", "ಊ": "oo", "ಋ": "ru",
  "ಎ": "e", "ಏ": "ae", "ಐ": "ai", "ಒ": "o", "ಓ": "oo", "ಔ": "au",
  "ಕ": "ka", "ಖ": "kha", "ಗ": "ga", "ಘ": "gha", "ಙ": "nga",
  "ಚ": "cha", "ಛ": "chha", "ಜ": "ja", "ಝ": "jha", "ಞ": "nya",
  "ತ": "ta", "ಥ": "tha", "ದ": "da", "ಧ": "dha", "ನ": "na",
  "ಟ": "Ta", "ಠ": "Tha", "ಡ": "Da", "ಢ": "Dha", "ಣ": "Na",
  "ಪ": "pa", "ಫ": "pha", "ಬ": "ba", "ಭ": "bha", "ಮ": "ma",
  "ಯ": "ya", "ರ": "ra", "ಲ": "la", "ವ": "va", "ಶ": "sha",
  "ಷ": "Sha", "ಸ": "sa", "ಹ": "ha", "ಳ": "La",
};

function pickRandom<T>(arr: T[], exclude?: T): T {
  let item: T;
  do {
    item = arr[Math.floor(Math.random() * arr.length)];
  } while (item === exclude);
  return item;
}

function generateQuestion() {
  const correct = pickRandom(ALL_LETTERS);
  const wrongSet = new Set<string>();
  wrongSet.add(correct);
  while (wrongSet.size < 4) {
    wrongSet.add(pickRandom(ALL_LETTERS));
  }
  const options = Array.from(wrongSet).sort(() => Math.random() - 0.5);
  return { letter: correct, options };
}

export default function QuizScreen() {
  const [question, setQuestion] = useState(generateQuestion);
  const [selected, setSelected] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);
  const [correct, setCorrect] = useState(0);

  const handleAnswer = useCallback((answer: string) => {
    setSelected(answer);
    setTotal((t) => t + 1);

    if (answer === question.letter) {
      setCorrect((c) => c + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      setQuestion(generateQuestion());
      setSelected(null);
    }, 1200);
  }, [question]);

  const isCorrect = selected === question.letter;
  const showResult = selected !== null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Score Bar */}
        <View style={styles.scoreBar}>
          <Text style={styles.scoreText}>{correct}/{total}</Text>
          <Text style={styles.streakText}>
            {streak > 0 ? `${streak} streak` : ""}
          </Text>
        </View>

        {/* Question */}
        <Text style={styles.prompt}>Which letter is this?</Text>
        <View style={styles.letterCard}>
          <Text style={styles.letterText}>{question.letter}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsGrid}>
          {question.options.map((option) => {
            const isThis = option === selected;
            const isAnswer = option === question.letter;
            let bgColor = "#1F2937";
            if (showResult && isAnswer) bgColor = "#16A34A";
            else if (showResult && isThis && !isCorrect) bgColor = "#DC2626";

            return (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, { backgroundColor: bgColor }]}
                onPress={() => !showResult && handleAnswer(option)}
                disabled={showResult}
              >
                <Text style={styles.optionLetter}>{option}</Text>
                <Text style={styles.optionName}>
                  {LETTER_NAMES[option] || ""}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback */}
        {showResult && (
          <Text style={[styles.feedback, { color: isCorrect ? "#86EFAC" : "#FCA5A5" }]}>
            {isCorrect
              ? "Correct!"
              : `It was ${LETTER_NAMES[question.letter] || question.letter}`}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827" },
  content: { flex: 1, alignItems: "center", padding: 24 },
  scoreBar: {
    flexDirection: "row", justifyContent: "space-between", width: "100%",
    marginBottom: 24,
  },
  scoreText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  streakText: { color: "#FBBF24", fontSize: 16, fontWeight: "600" },
  prompt: { color: "#9CA3AF", fontSize: 16, marginBottom: 16 },
  letterCard: {
    width: 140, height: 140, backgroundColor: "#4F46E5", borderRadius: 20,
    justifyContent: "center", alignItems: "center", marginBottom: 32,
  },
  letterText: { fontSize: 64, color: "#fff", fontWeight: "bold" },
  optionsGrid: {
    flexDirection: "row", flexWrap: "wrap", justifyContent: "center",
    gap: 12, width: "100%",
  },
  optionButton: {
    width: "45%", paddingVertical: 16, borderRadius: 12,
    alignItems: "center", borderWidth: 1, borderColor: "#374151",
  },
  optionLetter: { fontSize: 28, color: "#fff", fontWeight: "bold" },
  optionName: { fontSize: 14, color: "#9CA3AF", marginTop: 4 },
  feedback: { fontSize: 20, fontWeight: "bold", marginTop: 24 },
});
