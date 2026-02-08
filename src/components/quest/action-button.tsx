import React, { useCallback } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function ActionButton() {
  const handlePress = useCallback(() => {
    const fn = (global as any).__questSendInput;
    if (fn) fn("ACTION");
  }, []);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      activeOpacity={0.6}
    >
      <Text style={styles.label}>A</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(139, 92, 246, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  label: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
});
