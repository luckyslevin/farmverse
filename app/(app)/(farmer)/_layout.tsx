import { Tabs } from "expo-router";
import { useTheme, IconButton } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";

export default function Layout() {
  const theme = useTheme();

  const onLogout = () => {
    auth().signOut();
  };
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
          <IconButton
            icon={() => (
              <MaterialIcons
                name="logout"
                size={24}
                color={theme.colors.primary}
              />
            )}
            onPress={onLogout}
          />
        )
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="store" options={{ headerShown: false, title: "My Store" }} />
      <Tabs.Screen name="message" options={{ headerShown: false, title: "Message" }} />
    </Tabs>
  );
}
