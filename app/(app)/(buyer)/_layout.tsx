import Header from "@/components/Header";
import { Tabs } from "expo-router";
import { useTheme } from "react-native-paper";

export default function Layout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.background,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.primary,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceDisabled,
        headerRight: () => (
          <Header/>
        )
      }}
    >
      <Tabs.Screen
        name="product"
        options={{ headerShown: false, title: "Products" }}
      />
      <Tabs.Screen
        name="message"
        options={{ headerShown: false, title: "Message" }}
      />
      <Tabs.Screen name="store" options={{ title: "Store" }} />
    </Tabs>
  );
}
