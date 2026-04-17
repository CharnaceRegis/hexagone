import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#1D3461" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "🔢 Compteur" }} />
      <Stack.Screen name="history" options={{ title: "📋 Historique" }} />
    </Stack>
  );
}
