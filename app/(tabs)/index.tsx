import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
  color: string;
}

function FeatureCard({
  title,
  description,
  icon,
  href,
  color,
}: FeatureCardProps) {
  return (
    <Link href={href as any} asChild>
      <TouchableOpacity style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Ionicons name={icon} size={28} color="#fff" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
      </TouchableOpacity>
    </Link>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollView}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Learn Kannada</Text>
          <Text style={styles.heroSubtitle}>
            Master the beautiful language through videos, games, and interactive
            lessons
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>49</Text>
            <Text style={styles.statLabel}>Letters</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>100+</Text>
            <Text style={styles.statLabel}>Videos</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>10+</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>
        </View>

        {/* Feature Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start Learning</Text>

          <FeatureCard
            title="Watch & Learn"
            description="Stream educational videos for letters, rhymes, and stories"
            icon="play-circle"
            href="/(tabs)/stream"
            color="#8B5CF6"
          />

          <FeatureCard
            title="Kannada Letters"
            description="Learn vowels and consonants with pronunciation"
            icon="text"
            href="/(tabs)/letters"
            color="#10B981"
          />

          <FeatureCard
            title="Learning Journey"
            description="Follow a structured path to master Kannada"
            icon="rocket"
            href="/(tabs)/stream"
            color="#F59E0B"
          />

          <FeatureCard
            title="Daily Word"
            description="Learn a new word every day"
            icon="calendar"
            href="/(tabs)/stream"
            color="#EF4444"
          />
        </View>

        {/* Coming Soon */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coming Soon</Text>
          <View style={styles.comingSoonCard}>
            <Ionicons name="game-controller" size={32} color="#6B7280" />
            <Text style={styles.comingSoonText}>
              Interactive games, quizzes, and AI pronunciation practice
            </Text>
          </View>
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
  hero: {
    padding: 24,
    backgroundColor: "#4F46E5",
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#C7D2FE",
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: "#1F2937",
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  section: {
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  cardDescription: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
  },
  comingSoonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    borderStyle: "dashed",
  },
  comingSoonText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
  },
});
