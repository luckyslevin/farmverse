import FVInput from "@/components/FVInput";
import { Link, useLocalSearchParams } from "expo-router";
import { useRef } from "react";

import { FieldValues, useForm } from "react-hook-form";
import { KeyboardAvoidingView, View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useAccount } from "@/hooks/useAccount";
import Toast from "react-native-toast-message";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Required" }),
});

export default function Page() {
  const { type } = useLocalSearchParams<{ type: "User" | "Farmer" }>();
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm({ resolver: zodResolver(schema), mode: "onChange" });

  const { loginMutation } = useAccount();
  const onSubmit = (data: FieldValues) => {
    loginMutation.mutate(
      { ...data, type } as { email: string; password: string; type: string },
      {
        onSuccess: (user) => {
          Toast.show({
            type: "success",
            text1: "Login Successful",
            text2: "Login account successfully",
          });
        },
        onError: (err) => {
          Toast.show({
            type: "error",
            text1: "Login Failure",
            text2: "Login account failed",
          });
        },
      }
    );
  };
  const passwordRef = useRef<any>(null);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
      }}
    >
      <View style={{ alignItems: "center", marginBottom: 50 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {type} Login{" "}
        </Text>
        <Text style={{ marginTop: 50 }}>Login to your account </Text>
      </View>
      <KeyboardAvoidingView behavior="padding" style={{ marginHorizontal: 20 }}>
        <FVInput
          control={control}
          name="email"
          props={{
            style: styles.input,
            mode: "outlined",
            autoCapitalize: "none",
            keyboardType: "email-address",
            label: "Email",
            onSubmitEditing: () => passwordRef?.current?.focus(),
            returnKeyType: "next",
            blurOnSubmit: false,
          }}
          errors={errors}
        />
        <FVInput
          control={control}
          name="password"
          props={{
            ref: passwordRef,
            style: styles.input,
            mode: "outlined",
            autoCapitalize: "none",
            label: "Password",
            secureTextEntry: true,
          }}
          errors={errors}
        />
        <Button
          style={styles.button}
          mode="contained"
          disabled={!isDirty || !isValid}
          onPress={handleSubmit(onSubmit)}
        >
          Login
        </Button>
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <Text>Forgot your Password ? </Text>
          <Text>
            Don't have an account yet ?{" "}
            <Link
              href={{ pathname: "/register/[type]", params: { type } }}
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
  input: {
    marginVertical: 4,
  },
  button: {
    marginTop: 40,
  },
});
