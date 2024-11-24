import { Tabs } from "expo-router";
import { useTheme, IconButton } from "react-native-paper";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
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
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="store"
        options={{
          title: "Store",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="storefront"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          headerShown: false,
          title: "Message",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="message-text"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orderHistory"
        options={{
          title: "Order History",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
            name="clipboard-list-outline" // Icon for order history

              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>    
  );
}
