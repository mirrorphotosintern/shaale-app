import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native"
import { JourneyScreen } from "../../../types/journey"

interface Props {
  screen: JourneyScreen
  onNext: () => void
}

export default function TextScreen({ screen, onNext }: Props) {
  const content = screen.content as string
  const isFinish = screen.condition === "finish"

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.card}>
          <Text style={styles.text}>{content}</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, isFinish && styles.finishButton]}
          onPress={onNext}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {screen.button || (isFinish ? "Finish" : "Continue")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 32,
  },
  card: {
    backgroundColor: "#1F2937",
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: "#374151",
    width: "100%",
  },
  text: {
    color: "#F9FAFB",
    fontSize: 20,
    lineHeight: 30,
    textAlign: "center",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 14,
    minWidth: 200,
    alignItems: "center",
  },
  finishButton: {
    backgroundColor: "#10B981",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
})
