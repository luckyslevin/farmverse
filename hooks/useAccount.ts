import auth from "@react-native-firebase/auth";
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from "@tanstack/react-query";
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
export function useAccount(userId?: string): {
  createAccount: UseMutationResult<void, Error, Account, unknown>;
  login: UseMutationResult<
    FirebaseFirestoreTypes.DocumentData,
    Error,
    { email: string; password: string; type: string },
    unknown
  >,
  getUser(userId: string): Promise<FirebaseFirestoreTypes.DocumentData | null | undefined>
} {
  const createAccount = useMutation({
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
          createdAt: firestore.FieldValue.serverTimestamp(),
          ...account,
        });
    },
  });

  const login = useMutation({
    mutationFn: async ({
      email,
      password,
      type,
    }: {
      email: string;
      password: string;
      type: string;
    }) => {
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

  const getUser = async (userId: string) => {
     const userDoc = await firestore().collection('users').doc(userId).get();
      return userDoc.exists ? userDoc.data() : null
    }


  return { createAccount, login, getUser };
}


