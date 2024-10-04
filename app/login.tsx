import { Link } from "expo-router";
import * as React from "react";
import { KeyboardAvoidingView, View, StyleSheet } from "react-native";
import { Button, TextInput, useTheme, Text } from "react-native-paper";

export default function Page() {
  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center", marginBottom: 50 }}>
        <Text variant="headlineLarge">User Login </Text>
        <Text style={{ marginTop: 80 }}>Login to your account </Text>
      </View>
      <KeyboardAvoidingView behavior="padding" style={{ marginHorizontal: 20 }}>
        <TextInput
          style={styles.input}
          mode="outlined"
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
        />
        <TextInput
          style={styles.input}
          mode="outlined"
          secureTextEntry
          label="Password"
        />

        <Button style={styles.button} mode="contained" >
          Login
        </Button>
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <Text>Forgot your Password ? </Text>
          <Text>
            Don't have an account yet ?
            <Link
              href="/signup"
              style={{ fontWeight: "bold", textDecorationLine: "underline" }}
            >
              Sign Up
            </Link>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  input: {
    marginVertical: 4,
  },
  button: {
    marginTop: 40,
  },
});
