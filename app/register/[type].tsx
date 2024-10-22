import FVInput from "@/components/FVInput";
import { Account, schema, useAccount } from "@/hooks/useAccount";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams } from "expo-router";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { KeyboardAvoidingView, ScrollView, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";

const Page = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm({ resolver: zodResolver(schema), mode: "onChange" });
  const { type } = useLocalSearchParams<{ type: string }>();

  const { createAccountMutation } = useAccount();

  const handleSignup: SubmitHandler<FieldValues> = (data: FieldValues) => {
    createAccountMutation.mutate(data as Account);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

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
        onPress={handleSubmit(handleSignup)}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Sign Up
      </Button>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default Page;
