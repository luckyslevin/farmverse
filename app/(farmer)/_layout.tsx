import { Tabs } from "expo-router";
import { useTheme } from "react-native-paper";

export default function Layout() {
  const theme = useTheme()
  return (
    <Tabs screenOptions={{
      tabBarStyle: {
        backgroundColor: theme.colors.background
      },
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
      headerTintColor: theme.colors.primary,
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.onSurfaceDisabled,
    }}>
      <Tabs.Screen name="index" options={{ title: "Products"}} />
      <Tabs.Screen name="message" options={{ title: "Message" }} />
      {/* <Tabs.Screen name="order-history" options={{ title: "Order History" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} /> */}
    </Tabs>
  );
}
