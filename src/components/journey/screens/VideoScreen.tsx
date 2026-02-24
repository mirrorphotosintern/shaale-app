import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from "react-native"
import { JourneyScreen } from "../../../types/journey"

interface VideoContent {
  title: string
  description: string
  videoUrl: string | null
  duration?: string
}

interface Props {
  screen: JourneyScreen
  onNext: () => void
}

export default function VideoScreen({ screen, onNext }: Props) {
  const content = screen.content as VideoContent

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Video placeholder */}
        <View style={styles.videoArea}>
          <Text style={styles.clapperIcon}>🎬</Text>
          <Text style={styles.videoLabel}>STORY</Text>
          {content.duration && (
            <Text style={styles.durationText}>{content.duration}</Text>
          )}
        </View>

        {/* Scene title */}
        <Text style={styles.title}>{content.title}</Text>

        {/* Scene description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.description}>{content.description}</Text>
        </View>

        {/* Continue button */}
        <TouchableOpacity style={styles.button} onPress={onNext} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Start Lesson →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  scrollContent: {
    padding: 24,
    gap: 20,
    paddingBottom: 40,
  },
  videoArea: {
    height: 200,
    backgroundColor: "#0F172A",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1E3A5F",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  clapperIcon: {
    fontSize: 48,
  },
  videoLabel: {
    color: "#3B82F6",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  durationText: {
    color: "#4B5563",
    fontSize: 11,
    marginTop: 2,
  },
  title: {
    color: "#F9FAFB",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 30,
  },
  descriptionCard: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#374151",
  },
  description: {
    color: "#D1D5DB",
    fontSize: 15,
    lineHeight: 24,
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
})
