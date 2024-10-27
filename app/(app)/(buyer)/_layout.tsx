import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { IconButton, useTheme } from "react-native-paper";
import auth from "@react-native-firebase/auth";


export default function Layout() {
  const theme = useTheme()

  const onLogout = () => {
    auth().signOut();
  };
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
    }}>
      <Tabs.Screen name="home" options={{ title: "Products"}} />
      {/* <Tabs.Screen name="order-history" options={{ title: "Order History" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} /> */}
    </Tabs>
  );
}
