import { View, Text, StyleSheet } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shaale</Text>
      <Text style={styles.kannada}>ಶಾಲೆ</Text>
      <Text style={styles.subtitle}>Kannada Learning App</Text>
      <Text style={styles.version}>v1.0.0 - Build 10</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4F46E5",
  },
  title: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "bold",
  },
  kannada: {
    color: "#E0E7FF",
    fontSize: 28,
    marginTop: 4,
  },
  subtitle: {
    color: "#A5B4FC",
    fontSize: 16,
    marginTop: 24,
  },
  version: {
    color: "#818CF8",
    fontSize: 12,
    marginTop: 8,
  },
});
