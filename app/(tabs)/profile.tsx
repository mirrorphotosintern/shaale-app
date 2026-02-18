import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
}

function SettingsItem({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
}: SettingsItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingsIcon}>
        <Ionicons name={icon} size={22} color="#9CA3AF" />
      </View>
      <View style={styles.settingsContent}>
        <Text style={styles.settingsTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && onPress && (
        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const handleOpenWebsite = () => {
    Linking.openURL("https://shaale.ai");
  };

  const handleSupport = () => {
    Linking.openURL("mailto:support@shaale.ai");
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollView}>
        {/* Guest Profile */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={80} color="#4F46E5" />
          </View>
          <Text style={styles.profileName}>Guest User</Text>
          <Text style={styles.profileSubtitle}>
            Sign in to sync your progress
          </Text>
          <TouchableOpacity style={styles.signInButton}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Videos Watched</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Letters Learned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.settingsCard}>
            <SettingsItem
              icon="notifications"
              title="Notifications"
              subtitle="Daily reminders"
            />
            <SettingsItem
              icon="moon"
              title="Dark Mode"
              subtitle="Always on"
              showArrow={false}
            />
            <SettingsItem
              icon="language"
              title="Language"
              subtitle="English"
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.settingsCard}>
            <SettingsItem
              icon="globe"
              title="Visit Website"
              subtitle="shaale.ai"
              onPress={handleOpenWebsite}
            />
            <SettingsItem
              icon="mail"
              title="Contact Support"
              subtitle="Get help with the app"
              onPress={handleSupport}
            />
            <SettingsItem
              icon="star"
              title="Rate the App"
              subtitle="Share your feedback"
            />
            <SettingsItem
              icon="document-text"
              title="Privacy Policy"
            />
            <SettingsItem
              icon="information-circle"
              title="Version"
              subtitle="1.0.0"
              showArrow={false}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for Kannada learners
          </Text>
          <Text style={styles.footerCopyright}>
            © 2024 Shaale.ai - All rights reserved
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
  profileCard: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#1F2937",
    margin: 16,
    borderRadius: 16,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  profileSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  signInButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  signInButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#374151",
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
    textAlign: "center",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingsCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
  },
  settingsContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingsTitle: {
    fontSize: 16,
    color: "#fff",
  },
  settingsSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
  },
  footer: {
    alignItems: "center",
    padding: 32,
  },
  footerText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  footerCopyright: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
  },
});
