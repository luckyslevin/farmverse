import { router } from "expo-router";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function Page() {
  console.log("index rerender");
  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <View style={{ alignItems: "center" }}>
        <Text
          style={{ marginBottom: 40, paddingHorizontal: 10 }}
          variant="headlineLarge"
        >
          Welcome to Farmverse
        </Text>
        <Text style={{ marginBottom: 10 }}>What type of user are you ?</Text>
      </View>
      <View style={{ marginHorizontal: 10 }}>
        <Button
          style={{ marginBottom: 10 }}
          mode="contained"
          onPress={() =>
            router.push({ pathname: "/login/[type]", params: { type: "User" } })
          }
        >
          Buyer
        </Button>
        <Button
          style={{ marginBottom: 50 }}
          mode="contained"
          onPress={() =>
            router.push({
              pathname: "/login/[type]",
              params: { type: "Farmer" },
            })
          }
        >
          Farmer
        </Button>
      </View>
    </View>
  );
}
