import MyComponent from "@/components/MyComponent";
import { Colors } from "@/constants/Colors";
import { Stack } from "expo-router";
import { MD3LightTheme, PaperProvider } from "react-native-paper";

const customLightTheme = { colors: Colors.light };

export default function RootLayout() {
  return (
    <PaperProvider theme={customLightTheme}>
      <Stack>
        <Stack.Screen name="index" options={ { }}/>
      </Stack>
    </PaperProvider>
  );
}
