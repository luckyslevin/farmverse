import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useRouter, Stack, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { useGlobalState } from "@/hooks/useGlobalState";
import { ActivityIndicator, useTheme } from "react-native-paper";
import { View } from "react-native";

export default function App() {
  const { data: session, setData, resetData } = useGlobalState("session");
  const theme = useTheme();
  const segments = useSegments();
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();

  const onAuthStateChanged = async (user: FirebaseAuthTypes.User | null) => {
    if (!session && user) {
      const currentUser = await firestore()
        .collection("users")
        .doc(user.uid)
        .get();
      if (currentUser.exists) {
        setData(currentUser.data() as any);
      }
    } else {
      console.log("signout");
      resetData();
    }
    if (initializing) {
      setInitializing(false);
    }
    console.log("session", session);
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  useEffect(() => {
    if (initializing) return;
    const farmerGroup = segments[0] === "(farmer)";
    const buyerGroup = segments[0] === "(buyer)";
    console.log("segments", segments);
    if (session && !farmerGroup && session?.type === "Farmer") {
      router.replace("/(farmer)/home");
    } else if (!session && farmerGroup) {
      router.replace("/");
    } else if (session && !buyerGroup && session?.type === "User") {
      router.replace("/(buyer)/home");
    } else if (!session && buyerGroup) {
      router.replace("/");
    }
  }, [session, initializing, router, segments]);
  if (initializing)
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
      <Stack.Screen  name="index" options={{ headerShown: false}}/>
      <Stack.Screen name="login/[type]" />
      <Stack.Screen name="register/[type]" />
      <Stack.Screen name="(farmer)" options={{ headerShown: false }} />
      <Stack.Screen name="(buyer)" options={{ headerShown: false }} />
    </Stack>
  );
}
