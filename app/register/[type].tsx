import FVInput from "@/components/FVInput";
import { Account, schema, useAccount } from "@/hooks/useAccount";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams } from "expo-router";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { KeyboardAvoidingView, ScrollView, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import Toast from "react-native-toast-message";

const Page = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm({ resolver: zodResolver(schema), mode: "onChange" });
  const { type } = useLocalSearchParams<{ type: "User" | "Farmer" }>();

  const { createAccountMutation } = useAccount();

  const onSubmit: SubmitHandler<FieldValues> = (data: FieldValues) => {
    createAccountMutation.mutate({ ...(data as Account), type }, {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Register Successful",
          text2: "Register account successfully",
        })
      },
      onError: () => {
        Toast.show({
          type: "error",
          text1: "Register Failure",
          text2: "Register account failed",
        })
      }
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{type} Registration</Text>
      <Text style={styles.subheader}>Signup to your account</Text>

      <KeyboardAvoidingView behavior="padding">
        <FVInput
          control={control}
          name="email"
          errors={errors}
          props={{
            label: "Email",
            keyboardType: "email-address",
            autoCapitalize: "none",
            style: styles.input,
            mode: "outlined",
          }}
        />

        <FVInput
          control={control}
          name="firstName"
          errors={errors}
          props={{
            label: "First Name",
            style: styles.input,
            mode: "outlined",
          }}
        />

        <FVInput
          control={control}
          name="lastName"
          errors={errors}
          props={{
            label: "Last Name",
            style: styles.input,
            mode: "outlined",
          }}
        />

        <FVInput
          control={control}
          name="phoneNo"
          errors={errors}
          props={{
            label: "Phone Number",
            keyboardType: "phone-pad",
            style: styles.input,
            mode: "outlined",
          }}
        />

        <FVInput
          control={control}
          name="password"
          errors={errors}
          props={{
            label: "Password",
            secureTextEntry: true,
            style: styles.input,
            mode: "outlined",
          }}
        />

        <Button
          mode="contained"
          disabled={!isDirty || !isValid}
          onPress={handleSubmit(onSubmit)}
          style={styles.button}
        >
          Sign Up
        </Button>
        <Text style={styles.signinText}>
          Have an account?{" "}
          <Text
            style={styles.signinLink}
          >
            Sign in
          </Text>
        </Text>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subheader: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
  signinText: {
    marginTop: 16,
    textAlign: "center",
  },
  signinLink: {
    fontWeight: "bold",
  },
});

export default Page;
