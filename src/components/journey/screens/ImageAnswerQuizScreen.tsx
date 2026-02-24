import { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
} from "react-native"
import { JourneyScreen, ImageAnswerQuizContent } from "../../../types/journey"

interface Props {
  screen: JourneyScreen
  onNext: () => void
  onAnswer?: (isCorrect: boolean) => void
}

export default function ImageAnswerQuizScreen({ screen, onNext, onAnswer }: Props) {
  const content = screen.content as ImageAnswerQuizContent
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  const correctAnswers = Array.isArray(content.correct_answer)
    ? content.correct_answer
    : [content.correct_answer]

  function handleSelect(option: string) {
    if (revealed) return
    setSelected(option)
    const correct = correctAnswers.includes(option)
    setRevealed(true)
    onAnswer?.(correct)
  }

  function getImageStyle(option: string) {
    if (!revealed) return styles.optionImage
    if (correctAnswers.includes(option))
      return [styles.optionImage, styles.imageCorrect]
    if (option === selected) return [styles.optionImage, styles.imageWrong]
    return [styles.optionImage, styles.imageDimmed]
  }

  function getWrapperStyle(option: string) {
    if (!revealed) return styles.imageWrapper
    if (correctAnswers.includes(option))
      return [styles.imageWrapper, styles.wrapperCorrect]
    if (option === selected) return [styles.imageWrapper, styles.wrapperWrong]
    return [styles.imageWrapper, styles.wrapperDimmed]
  }

  const numCols = content.options.length <= 2 ? 2 : 2

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>Pick the right image</Text>
          <Text style={styles.question}>{content.question}</Text>
        </View>

        <View style={styles.grid}>
          {content.options.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              style={getWrapperStyle(option)}
              onPress={() => handleSelect(option)}
              activeOpacity={0.85}
              disabled={revealed}
            >
              <Image
                source={{ uri: option }}
                style={getImageStyle(option)}
                resizeMode="cover"
              />
              {revealed && correctAnswers.includes(option) && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>✓</Text>
                </View>
              )}
              {revealed && option === selected && !correctAnswers.includes(option) && (
                <View style={[styles.badge, styles.badgeWrong]}>
                  <Text style={styles.badgeText}>✗</Text>
                </View>
              )}
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
  inner: { padding: 20, paddingBottom: 40, gap: 16 },
  questionCard: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#374151",
  },
  questionLabel: {
    color: "#8B5CF6",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  question: {
    color: "#F9FAFB",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  imageWrapper: {
    width: "47%",
    aspectRatio: 1,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#374151",
    position: "relative",
  },
  wrapperCorrect: { borderColor: "#10B981" },
  wrapperWrong: { borderColor: "#EF4444" },
  wrapperDimmed: { opacity: 0.4 },
  optionImage: {
    width: "100%",
    height: "100%",
  },
  imageCorrect: {},
  imageWrong: {},
  imageDimmed: {},
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeWrong: { backgroundColor: "#EF4444" },
  badgeText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  nextButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
})
