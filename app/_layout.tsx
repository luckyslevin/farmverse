import { Colors } from "@/constants/Colors";
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { DefaultTheme as NavigationDefaultTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { adaptNavigationTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import Toast from 'react-native-toast-message';
import merge from "deepmerge";



const customLightTheme = { ...MD3LightTheme, colors: Colors.light };
const { LightTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
});

const CombinedLightTheme = merge(LightTheme, customLightTheme);


export default function RootLayout() {
  
  const queryClient = new QueryClient();
  const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
		console.log('onAuthStateChanged', user);
		
	};
  useEffect(() => {
		const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
		return subscriber;
	}, []);

  return (
    <QueryClientProvider client={queryClient}>
    <PaperProvider theme={{ ...CombinedLightTheme, roundness: 27.5 }}>
      <ThemeProvider value={CombinedLightTheme}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: customLightTheme.colors.background },
          headerTitle: "",
          headerStyle: {
            backgroundColor: customLightTheme.colors.background,
          }
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="login/[type]"
        />
        <Stack.Screen
          name="register/[type]"
        />
        <Stack.Screen name="(farmer)" options={{headerShown: false}}/>
      </Stack>
      <Toast />
      </ThemeProvider>
    </PaperProvider>
    </QueryClientProvider>
  );
}