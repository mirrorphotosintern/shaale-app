import { Tabs } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth, useUser } from "../../src/hooks/useAuthSafe";

function HeaderRight() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  if (isSignedIn && user) {
    const nameInitials = (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "");
    const emailInitial = user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() ?? "?";
    const initials = nameInitials || emailInitial;
    return (
      <TouchableOpacity
        onPress={() => router.push("/sign-in")}
        style={{ marginRight: 12 }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "#8B5CF6",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
            {initials}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={() => router.push("/sign-in")} style={{ marginRight: 12 }}>
      <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Sign In</Text>
    </TouchableOpacity>
  );
}

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
        headerRight: () => <HeaderRight />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Stream",
          headerTitle: "Stream",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22 }}>▶</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="letters"
        options={{
          title: "Journey",
          headerTitle: "Gundana Yatre",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22 }}>🗺️</Text>
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
