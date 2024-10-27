import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useRouter, Stack, useSegments, SplashScreen } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { ActivityIndicator, useTheme } from "react-native-paper";
import { View } from "react-native";
import { useUserState } from "@/state/user";


export default function Layout() {
  const [session, setSession] = useState(null)
  const theme = useTheme();
  const segments = useSegments();
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async (user: FirebaseAuthTypes.User | null) => {
    
      if (user && !session) {
        const currentUser = await firestore()
          .collection("users")
          .doc(user.uid)
          .get();
        if (currentUser.exists) {
          setSession(currentUser.data() as any);
        }
      } else if (!user && !session) {
        console.log("signout");
        setSession(null);
      }
      if (initializing) {
        setInitializing(false);
      }
    });
    return subscriber;
  }, []);

  useLayoutEffect(() => {
    if (initializing && !session) return;
    const farmerGroup = segments[1] === "(farmer)";
    const buyerGroup = segments[1] === "(buyer)";
    console.log("segments", segments, session);
    if (session && !farmerGroup && session?.type === "Farmer") {
      console.log(111);
      router.replace("/(farmer)/home");
    } else if (!session && farmerGroup) {
      console.log(222);
      router.replace({ pathname: "/login/[type]", params: { type: "Farmer" } });
    } else if (session && !buyerGroup && session?.type === "User") {
      console.log(333);
      router.replace("/(buyer)/home");
    } else if (!session && buyerGroup) {
      console.log(444);
      router.replace({ pathname: "/login/[type]", params: { type: "User" } });
    }
  }, [session, initializing, segments, router]);
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
