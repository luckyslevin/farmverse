import { Stack } from "expo-router";
import { memo } from "react";
import { useTheme } from "react-native-paper";

const Layout = () => {
  const theme = useTheme();
  console.log("layout")
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        title: 'Message'
      }}
    />
  );
}

export default memo(Layout);
