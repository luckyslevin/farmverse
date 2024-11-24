import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useRouter, Stack, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, useTheme } from "react-native-paper";
import { View } from "react-native";
import { useAtom } from "jotai";
import { userAtom } from "@/stores/user";
import { useAccount } from "@/hooks/useAccount";

export default function Layout() {
  const [session, setSession] = useAtom(userAtom);
  const theme = useTheme();
  const segments = useSegments();
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();
  const { getUser } = useAccount();

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(
      async (user: FirebaseAuthTypes.User | null) => {
        if (user) {
          const currentUser = await getUser(user.uid)
          if (currentUser) {
            setSession(currentUser);
          }
        } else setSession(null);
        
        if (initializing) {
          setInitializing(false);
        }
      }
    );
    return subscriber;
  }, []);

  useEffect(() => {
    
    if (initializing && !session) return;
    const farmerGroup = segments[1] === "(farmer)";
    const buyerGroup = segments[1] === "(buyer)";
    console.log(segments)
    if (session && !farmerGroup && session?.type === "Farmer") {
      console.log(1111)
      router.replace("/(farmer)/home");
    } else if (!session && farmerGroup) {
      console.log(2222)
      router.replace({ pathname: "/login/[type]", params: { type: "Farmer" } });
    } else if (session && !buyerGroup && session?.type === "User") {
      console.log(3333)
      router.replace("/(buyer)/product");
    } else if (!session && buyerGroup) {
      console.log(4444)
      router.replace({ pathname: "/login/[type]", params: { type: "User" } });
    }
  }, [session, initializing]);
  if (initializing) {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTitle: "",
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login/[type]" />
      <Stack.Screen name="register/[type]" />
      <Stack.Screen name="(farmer)" options={{ headerShown: false }} />
      <Stack.Screen name="(buyer)" options={{ headerShown: false }} />
    </Stack>
  );
}