import { Link, router } from "expo-router";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";

export default function Page() {
  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center" }}>
        <Text style={{ marginBottom: 40, paddingHorizontal: 10 }} variant="headlineLarge">
          Welcome to Farmverse
        </Text>
        <Text style={{ marginBottom: 10,}}>What type of user are you ?</Text>      
      </View>
      <View style={{  marginHorizontal: 10 }}>
        <Button style={{ marginBottom: 10 }} mode="contained" onPress={() => router.push("/login")}>
          Buyer
        </Button>
        <Button style={{ marginBottom: 50 }} mode="contained" onPress={() => router.push("/login")}>
          Farmer
        </Button>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});
