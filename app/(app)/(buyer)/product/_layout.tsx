import Header from "@/components/Header";
import { Stack } from "expo-router";
import { memo } from "react";
import { useTheme } from "react-native-paper";

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: 'index',
};

const Layout = () => {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        title: 'Products',
        headerRight: () => (
          <Header/>
        )
      }}
    />
  );
}

export default memo(Layout);
