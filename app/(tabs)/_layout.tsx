import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#8B5CF6",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#1F2937",
          borderTopColor: "#374151",
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerStyle: { backgroundColor: "#4F46E5" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Learn",
          headerTitle: "Learn Kannada",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22 }}>ಅ</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: "Quiz",
          headerTitle: "Quiz",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22 }}>?</Text>
          ),
        }}
      />
    </Tabs>
  );
}
