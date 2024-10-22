import { Colors } from "@/constants/Colors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";

const customLightTheme = { colors: Colors.light };

export default function RootLayout() {
  
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
    <PaperProvider theme={{ ...customLightTheme, roundness: 27.5 }}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: customLightTheme.colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="login/[type]"
          options={{
            headerTitle: "",
            headerStyle: {
              backgroundColor: customLightTheme.colors.background,
            },
          }}
        />
        <Stack.Screen
          name="register/[type]"
          options={{
            headerTitle: "",
            headerStyle: {
              backgroundColor: customLightTheme.colors.background,
            },
          }}
        />
      </Stack>
    </PaperProvider>
    </QueryClientProvider>
  );
}
