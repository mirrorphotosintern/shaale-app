import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";

// Kannada vowels (Swaras)
const VOWELS = [
  { kannada: "ಅ", english: "a", kanglish: "a" },
  { kannada: "ಆ", english: "aa", kanglish: "aa" },
  { kannada: "ಇ", english: "i", kanglish: "i" },
  { kannada: "ಈ", english: "ee", kanglish: "ee" },
  { kannada: "ಉ", english: "u", kanglish: "u" },
  { kannada: "ಊ", english: "oo", kanglish: "oo" },
  { kannada: "ಋ", english: "ru", kanglish: "ru" },
  { kannada: "ಎ", english: "e", kanglish: "e" },
  { kannada: "ಏ", english: "ae", kanglish: "ae" },
  { kannada: "ಐ", english: "ai", kanglish: "ai" },
  { kannada: "ಒ", english: "o", kanglish: "o" },
  { kannada: "ಓ", english: "oa", kanglish: "oa" },
  { kannada: "ಔ", english: "au", kanglish: "au" },
  { kannada: "ಅಂ", english: "am", kanglish: "am" },
  { kannada: "ಅಃ", english: "ah", kanglish: "aha" },
];

// Kannada consonants (Vyanjanagalu) - First row
const CONSONANTS_ROW1 = [
  { kannada: "ಕ", english: "ka", kanglish: "ka" },
  { kannada: "ಖ", english: "kha", kanglish: "kha" },
  { kannada: "ಗ", english: "ga", kanglish: "ga" },
  { kannada: "ಘ", english: "gha", kanglish: "gha" },
  { kannada: "ಙ", english: "nga", kanglish: "nga" },
];

const CONSONANTS_ROW2 = [
  { kannada: "ಚ", english: "cha", kanglish: "cha" },
  { kannada: "ಛ", english: "chha", kanglish: "chha" },
  { kannada: "ಜ", english: "ja", kanglish: "ja" },
  { kannada: "ಝ", english: "jha", kanglish: "jha" },
  { kannada: "ಞ", english: "nya", kanglish: "nya" },
];

const CONSONANTS_ROW3 = [
  { kannada: "ಟ", english: "ta", kanglish: "Ta" },
  { kannada: "ಠ", english: "tha", kanglish: "Tha" },
  { kannada: "ಡ", english: "da", kanglish: "Da" },
  { kannada: "ಢ", english: "dha", kanglish: "Dha" },
  { kannada: "ಣ", english: "na", kanglish: "Na" },
];

const CONSONANTS_ROW4 = [
  { kannada: "ತ", english: "ta", kanglish: "ta" },
  { kannada: "ಥ", english: "tha", kanglish: "tha" },
  { kannada: "ದ", english: "da", kanglish: "da" },
  { kannada: "ಧ", english: "dha", kanglish: "dha" },
  { kannada: "ನ", english: "na", kanglish: "na" },
];

const CONSONANTS_ROW5 = [
  { kannada: "ಪ", english: "pa", kanglish: "pa" },
  { kannada: "ಫ", english: "pha", kanglish: "pha" },
  { kannada: "ಬ", english: "ba", kanglish: "ba" },
  { kannada: "ಭ", english: "bha", kanglish: "bha" },
  { kannada: "ಮ", english: "ma", kanglish: "ma" },
];

const CONSONANTS_ROW6 = [
  { kannada: "ಯ", english: "ya", kanglish: "ya" },
  { kannada: "ರ", english: "ra", kanglish: "ra" },
  { kannada: "ಲ", english: "la", kanglish: "la" },
  { kannada: "ವ", english: "va", kanglish: "va" },
  { kannada: "ಶ", english: "sha", kanglish: "sha" },
];

const CONSONANTS_ROW7 = [
  { kannada: "ಷ", english: "sha", kanglish: "Sha" },
  { kannada: "ಸ", english: "sa", kanglish: "sa" },
  { kannada: "ಹ", english: "ha", kanglish: "ha" },
  { kannada: "ಳ", english: "la", kanglish: "La" },
];

interface Letter {
  kannada: string;
  english: string;
  kanglish: string;
}

interface LetterCardProps {
  letter: Letter;
  onPress: () => void;
  isSelected: boolean;
}

function LetterCard({ letter, onPress, isSelected }: LetterCardProps) {
  return (
    <TouchableOpacity
      style={[styles.letterCard, isSelected && styles.letterCardSelected]}
      onPress={onPress}
    >
      <Text style={styles.kannadaLetter}>{letter.kannada}</Text>
      <Text style={styles.kanglishText}>{letter.kanglish}</Text>
    </TouchableOpacity>
  );
}

interface LetterSectionProps {
  title: string;
  letters: Letter[];
  selectedLetter: Letter | null;
  onSelectLetter: (letter: Letter) => void;
}

function LetterSection({
  title,
  letters,
  selectedLetter,
  onSelectLetter,
}: LetterSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.letterGrid}>
        {letters.map((letter) => (
          <LetterCard
            key={letter.kannada}
            letter={letter}
            onPress={() => onSelectLetter(letter)}
            isSelected={selectedLetter?.kannada === letter.kannada}
          />
        ))}
      </View>
    </View>
  );
}

export default function LettersScreen() {
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Selected letter detail */}
      {selectedLetter && (
        <View style={styles.selectedCard}>
          <View style={styles.selectedContent}>
            <Text style={styles.selectedKannada}>{selectedLetter.kannada}</Text>
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedLabel}>Pronunciation</Text>
              <Text style={styles.selectedValue}>{selectedLetter.kanglish}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.playButton}
            onPress={async () => {
              // Stop any ongoing speech first
              await Speech.stop();
              // Use text-to-speech for pronunciation
              // Try Kannada first, fallback to Hindi which is more commonly available
              const voices = await Speech.getAvailableVoicesAsync();
              const kannadaVoice = voices.find(v => v.language.startsWith("kn"));
              const hindiVoice = voices.find(v => v.language.startsWith("hi"));

              Speech.speak(selectedLetter.kannada, {
                language: kannadaVoice?.language || hindiVoice?.language || "en-IN",
                rate: 0.7,
                pitch: 1.0,
              });
            }}
          >
            <Ionicons name="volume-high" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        {/* Vowels */}
        <LetterSection
          title="Vowels (ಸ್ವರಗಳು)"
          letters={VOWELS}
          selectedLetter={selectedLetter}
          onSelectLetter={setSelectedLetter}
        />

        {/* Consonants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consonants (ವ್ಯಂಜನಗಳು)</Text>

          <Text style={styles.rowLabel}>Ka varga (ಕ ವರ್ಗ)</Text>
          <View style={styles.letterGrid}>
            {CONSONANTS_ROW1.map((letter) => (
              <LetterCard
                key={letter.kannada}
                letter={letter}
                onPress={() => setSelectedLetter(letter)}
                isSelected={selectedLetter?.kannada === letter.kannada}
              />
            ))}
          </View>

          <Text style={styles.rowLabel}>Cha varga (ಚ ವರ್ಗ)</Text>
          <View style={styles.letterGrid}>
            {CONSONANTS_ROW2.map((letter) => (
              <LetterCard
                key={letter.kannada}
                letter={letter}
                onPress={() => setSelectedLetter(letter)}
                isSelected={selectedLetter?.kannada === letter.kannada}
              />
            ))}
          </View>

          <Text style={styles.rowLabel}>Ta varga (ಟ ವರ್ಗ)</Text>
          <View style={styles.letterGrid}>
            {CONSONANTS_ROW3.map((letter) => (
              <LetterCard
                key={letter.kannada}
                letter={letter}
                onPress={() => setSelectedLetter(letter)}
                isSelected={selectedLetter?.kannada === letter.kannada}
              />
            ))}
          </View>

          <Text style={styles.rowLabel}>Ta varga (ತ ವರ್ಗ)</Text>
          <View style={styles.letterGrid}>
            {CONSONANTS_ROW4.map((letter) => (
              <LetterCard
                key={letter.kannada}
                letter={letter}
                onPress={() => setSelectedLetter(letter)}
                isSelected={selectedLetter?.kannada === letter.kannada}
              />
            ))}
          </View>

          <Text style={styles.rowLabel}>Pa varga (ಪ ವರ್ಗ)</Text>
          <View style={styles.letterGrid}>
            {CONSONANTS_ROW5.map((letter) => (
              <LetterCard
                key={letter.kannada}
                letter={letter}
                onPress={() => setSelectedLetter(letter)}
                isSelected={selectedLetter?.kannada === letter.kannada}
              />
            ))}
          </View>

          <Text style={styles.rowLabel}>Avarga (ಅವರ್ಗ)</Text>
          <View style={styles.letterGrid}>
            {CONSONANTS_ROW6.map((letter) => (
              <LetterCard
                key={letter.kannada}
                letter={letter}
                onPress={() => setSelectedLetter(letter)}
                isSelected={selectedLetter?.kannada === letter.kannada}
              />
            ))}
          </View>

          <View style={styles.letterGrid}>
            {CONSONANTS_ROW7.map((letter) => (
              <LetterCard
                key={letter.kannada}
                letter={letter}
                onPress={() => setSelectedLetter(letter)}
                isSelected={selectedLetter?.kannada === letter.kannada}
              />
            ))}
          </View>
        </View>

        {/* Tip notice */}
        <View style={styles.comingSoon}>
          <Ionicons name="information-circle" size={24} color="#6B7280" />
          <Text style={styles.comingSoonText}>
            Tap any letter to select it, then press the speaker icon to hear its pronunciation!
          </Text>
        </View>
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
  selectedCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#4F46E5",
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  selectedContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  selectedKannada: {
    fontSize: 56,
    color: "#fff",
    fontWeight: "bold",
  },
  selectedInfo: {},
  selectedLabel: {
    fontSize: 12,
    color: "#C7D2FE",
  },
  selectedValue: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "600",
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  rowLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 8,
    marginTop: 12,
  },
  letterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  letterCard: {
    width: 60,
    height: 70,
    backgroundColor: "#1F2937",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  letterCardSelected: {
    borderColor: "#4F46E5",
    backgroundColor: "#312E81",
  },
  kannadaLetter: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
  },
  kanglishText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  comingSoon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    borderStyle: "dashed",
    gap: 12,
  },
  comingSoonText: {
    flex: 1,
    fontSize: 14,
    color: "#9CA3AF",
  },
});
