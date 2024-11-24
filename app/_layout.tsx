import { Colors } from "@/constants/Colors";
import {
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  adaptNavigationTheme,
  MD3LightTheme,
  PaperProvider,
} from "react-native-paper";
import merge from "deepmerge";
import Toast from "react-native-toast-message";
import { Slot } from "expo-router";
import { Provider as JotaiProvider } from "jotai"; // Import Jotai Provider

const customLightTheme = { ...MD3LightTheme, colors: Colors.light };
const { LightTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
});

const CombinedLightTheme = merge(LightTheme, customLightTheme);

export default function RootLayout() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <PaperProvider theme={{ ...CombinedLightTheme, roundness: 27.5 }}>
          <ThemeProvider value={CombinedLightTheme}>
            <Slot />
            <Toast
              position="bottom" // Set position to the bottom
              visibilityTime={2000} // Adjust visibility time (optional)
            />
          </ThemeProvider>
        </PaperProvider>
      </JotaiProvider>
    </QueryClientProvider>
  );
}
