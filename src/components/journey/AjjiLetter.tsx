import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native"

interface Props {
  visible: boolean
  milestone: 5 | 10 | 15
  onClose: () => void
}

const AJJI_LETTERS: Record<number, { kannada: string; translation: string }> = {
  5: {
    kannada: "ಗುಂಡ,\n\nಐದು ಅಕ್ಷರ ಕಲಿತೆ! ಗುಬ್ಬಿ ಚೆನ್ನಾಗಿ ಇದೆಯಾ? ಚಳಿಯಲ್ಲಿ ಅದನ್ನು ಬೆಚ್ಚಗೆ ಇಡು.\n\nನಾನು ನಿನ್ನ ದಾರಿ ಕಾಯ್ತಿದ್ದೇನೆ.\n\n— ಅಜ್ಜಿ",
    translation:
      "Gunda,\n\nFive letters learned! Is Gubbi doing well? Keep her warm in the cold.\n\nI am waiting for your path.\n\n— Ajji",
  },
  10: {
    kannada: "ಗುಂಡ,\n\nಹತ್ತು ಅಕ್ಷರ! ಗುಬ್ಬಿಯ ರೆಕ್ಕೆ ನೀಲಿ ಬಣ್ಣ ಆಯಿತು. ನೀನು ಅರ್ಧ ದಾರಿ ಕ್ರಮಿಸಿದ್ದೀಯ.\n\nನಮ್ಮ ಊರು ಕಾಣ್ತಿದೆ?\n\n— ಅಜ್ಜಿ",
    translation:
      "Gunda,\n\nTen letters! Gubbi's feathers turned blue. You have walked half the path.\n\nCan you see our village yet?\n\n— Ajji",
  },
  15: {
    kannada: "ಗುಂಡ,\n\nನೀನು ಬಂದೆ! ಹದಿನೈದು ಅಕ್ಷರ ಕಲಿತೆ. ಗುಬ್ಬಿ ಹಾರಿದ! ನಿನ್ನ ಕಣ್ಣಲ್ಲಿ ಕನ್ನಡ ಕಾಣ್ತಿದೆ.\n\nಬಾ, ಊಟ ಕಾಯ್ತಿದೆ.\n\n— ಅಜ್ಜಿ",
    translation:
      "Gunda,\n\nYou came! You learned fifteen letters. Gubbi flew! Kannada shines in your eyes.\n\nCome, the meal is waiting.\n\n— Ajji",
  },
}

export default function AjjiLetter({ visible, milestone, onClose }: Props) {
  const letter = AJJI_LETTERS[milestone]
  if (!letter) return null

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>📜</Text>
            <Text style={styles.headerTitle}>A Letter from Ajji</Text>
            <Text style={styles.headerSub}>Milestone {milestone}/15</Text>
          </View>

          <View style={styles.letterCard}>
            <Text style={styles.kannadaText}>{letter.kannada}</Text>
          </View>

          <View style={styles.translationCard}>
            <Text style={styles.translationLabel}>Translation</Text>
            <Text style={styles.translationText}>{letter.translation}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Continue the Journey →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  inner: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  header: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 4,
  },
  headerEmoji: { fontSize: 48 },
  headerTitle: {
    color: "#F9FAFB",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 8,
  },
  headerSub: {
    color: "#8B5CF6",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1,
  },
  letterCard: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#8B5CF6",
  },
  kannadaText: {
    color: "#F9FAFB",
    fontSize: 18,
    lineHeight: 30,
    fontWeight: "500",
  },
  translationCard: {
    backgroundColor: "#0F172A",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#374151",
  },
  translationLabel: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  translationText: {
    color: "#D1D5DB",
    fontSize: 14,
    lineHeight: 22,
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "#8B5CF6",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: "auto",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
})
