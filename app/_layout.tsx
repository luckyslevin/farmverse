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
import App from "@/components/App";
import Toast from "react-native-toast-message";

const customLightTheme = { ...MD3LightTheme, colors: Colors.light };
const { LightTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
});

const CombinedLightTheme = merge(LightTheme, customLightTheme);

export default function RootLayout() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={{ ...CombinedLightTheme, roundness: 27.5 }}>
        <ThemeProvider value={CombinedLightTheme}>
          <App />
          <Toast />
        </ThemeProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
