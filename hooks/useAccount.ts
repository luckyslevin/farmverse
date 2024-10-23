import auth from "@react-native-firebase/auth";
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { z } from "zod";

export let schema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNo: z
    .string()
    .refine((value) => /^(?:[0-9-()/.]\s?){6,15}[0-9]{1}$/.test(value)),
  password: z.string().min(1),
  type: z.enum(["User", "Farmer"]).optional(),
});
export type Account = z.infer<typeof schema>;
export function useAccount(): {
  createAccountMutation: UseMutationResult<void, Error, Account, unknown>;
  loginMutation: UseMutationResult<
    FirebaseFirestoreTypes.DocumentData,
    Error,
    { email: string; password: string; type: string },
    unknown
  >;
} {
  const createAccountMutation = useMutation({
    mutationFn: async (account: Account) => {
      const { user } = await auth().createUserWithEmailAndPassword(
        account.email,
        account.password
      );

      return firestore()
        .collection("users")
        .doc(user.uid)
        .set({
          id: user.uid,
          ...account,
        });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async ({
      email,
      password,
      type,
    }: {
      email: string;
      password: string;
      type: string;
    }) => {
      console.log(type, email)
      const user = await firestore()
        .collection("users") // Replace 'users' with your collection name
        .where("email", "==", email) // Filter documents where email matches
        .where("type", "==", type)
        .limit(1) // Fetch only one result
        .get();
      if (user.empty) throw new Error("Invalid credentials");
      return await auth()
        .signInWithEmailAndPassword(email, password)
        .then((_) => {
          return user.docs[0].data();
        });
    },
  });

  return { createAccountMutation, loginMutation };
}
