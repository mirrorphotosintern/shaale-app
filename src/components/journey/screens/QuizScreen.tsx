import { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native"
import { JourneyScreen, QuizContent } from "../../../types/journey"

interface Props {
  screen: JourneyScreen
  onNext: () => void
  onAnswer?: (isCorrect: boolean) => void
}

export default function QuizScreen({ screen, onNext, onAnswer }: Props) {
  const content = screen.content as QuizContent
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  const correctAnswers = Array.isArray(content.correct_answer)
    ? content.correct_answer
    : [content.correct_answer]

  const isAllCorrect = correctAnswers.length === content.options.length

  function handleSelect(option: string) {
    if (revealed) return
    setSelected(option)
    const correct = correctAnswers.includes(option) || isAllCorrect
    setRevealed(true)
    onAnswer?.(correct)
  }

  function getOptionStyle(option: string) {
    if (!revealed) return styles.option
    if (correctAnswers.includes(option) || isAllCorrect) return [styles.option, styles.optionCorrect]
    if (option === selected) return [styles.option, styles.optionWrong]
    return [styles.option, styles.optionDimmed]
  }

  function getOptionTextStyle(option: string) {
    if (!revealed) return styles.optionText
    if (correctAnswers.includes(option) || isAllCorrect) return [styles.optionText, styles.optionTextCorrect]
    if (option === selected) return [styles.optionText, styles.optionTextWrong]
    return [styles.optionText, styles.optionTextDimmed]
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>Question</Text>
          <Text style={styles.question}>{content.question}</Text>
        </View>

        <View style={styles.options}>
          {content.options.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              style={getOptionStyle(option)}
              onPress={() => handleSelect(option)}
              activeOpacity={0.8}
              disabled={revealed}
            >
              <Text style={styles.optionLetter}>
                {String.fromCharCode(65 + idx)}
              </Text>
              <Text style={getOptionTextStyle(option)}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {revealed && (
          <TouchableOpacity style={styles.nextButton} onPress={onNext} activeOpacity={0.8}>
            <Text style={styles.nextButtonText}>
              {screen.button || "Continue"} →
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827" },
  inner: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
    flexGrow: 1,
  },
  questionCard: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#374151",
    marginBottom: 8,
  },
  questionLabel: {
    color: "#8B5CF6",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  question: {
    color: "#F9FAFB",
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
  },
  options: { gap: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#374151",
    gap: 12,
  },
  optionCorrect: {
    borderColor: "#10B981",
    backgroundColor: "#064E3B",
  },
  optionWrong: {
    borderColor: "#EF4444",
    backgroundColor: "#450A0A",
  },
  optionDimmed: {
    opacity: 0.4,
  },
  optionLetter: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "700",
    width: 24,
    textAlign: "center",
  },
  optionText: {
    color: "#F9FAFB",
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  optionTextCorrect: { color: "#6EE7B7" },
  optionTextWrong: { color: "#FCA5A5" },
  optionTextDimmed: { color: "#6B7280" },
  nextButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
})
